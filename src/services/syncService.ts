import { supabase } from '@/lib/supabase'
import { db } from '@/db'
import { nowIso } from './dateService'
import type { KnowledgeNode, MemoryCard, ReviewState, ReviewRecord, MistakeNote, Insight } from '@/types/domain'

export interface SyncResult {
  pushed: number
  pulled: number
  conflicts: number
}

// ── camelCase ↔ snake_case helpers ──────────────────────────────────────────

function toSnake(obj: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(obj)) {
    const snake = k.replace(/([A-Z])/g, '_$1').toLowerCase()
    out[snake] = v
  }
  return out
}

function toCamel(obj: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(obj)) {
    const camel = k.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase())
    out[camel] = v
  }
  return out
}

// ── Auth ─────────────────────────────────────────────────────────────────────

export async function signUp(email: string, password: string) {
  const { error } = await supabase.auth.signUp({ email, password })
  if (error) throw new Error(error.message)
}

export async function signIn(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw new Error(error.message)
}

export async function signOut() {
  await supabase.auth.signOut()
}

export async function getSession() {
  const { data } = await supabase.auth.getSession()
  return data.session
}

export function isLoggedIn(): Promise<boolean> {
  return getSession().then((s) => s !== null)
}

// ── Sync helpers ─────────────────────────────────────────────────────────────

function getLastSyncKey() {
  return '408-recall-last-sync'
}

export function getLastSyncTime(): string | null {
  return localStorage.getItem(getLastSyncKey())
}

function setLastSyncTime(t: string) {
  localStorage.setItem(getLastSyncKey(), t)
}

async function getUserId(): Promise<string> {
  const session = await getSession()
  if (!session) throw new Error('未登录')
  return session.user.id
}

// ── Push (local → cloud) ─────────────────────────────────────────────────────

interface PushTableOptions {
  conflictColumn?: string
  // for append-only tables (no updatedAt), only push records never synced before
  appendOnly?: boolean
}

async function pushTable<T extends Record<string, unknown>>(
  tableName: string,
  localTable: { filter: (fn: (item: T) => boolean) => { toArray: () => Promise<T[]> } },
  userId: string,
  lastSync: string | null,
  options: PushTableOptions = {}
): Promise<number> {
  const { conflictColumn = 'id', appendOnly = false } = options

  const dirty = await localTable.filter((item) => {
    if (appendOnly) return !item.syncedAt
    return !lastSync || !item.syncedAt || (item.updatedAt as string) > (item.syncedAt as string)
  }).toArray()
  if (!dirty.length) return 0

  const rows = dirty.map((item) => {
    const snake = toSnake(item as unknown as Record<string, unknown>)
    delete snake.synced_at
    snake.user_id = userId
    // replace undefined values with null for nullable columns
    for (const k of Object.keys(snake)) {
      if (snake[k] === undefined) snake[k] = null
    }
    // archived may be absent entirely on old records — default to false (memory_cards only)
    if (tableName === 'memory_cards' && (!('archived' in snake) || snake.archived == null)) snake.archived = false
    return snake
  })

  const { error } = await supabase.from(tableName).upsert(rows as never[], { onConflict: conflictColumn })
  if (error) throw new Error(`push ${tableName}: ${error.message}`)

  const now = nowIso()
  await Promise.all(
    dirty.map((item) =>
      (localTable as unknown as { update: (id: unknown, changes: object) => Promise<void> }).update(
        (item as { id?: string; cardId?: string }).id ?? (item as { cardId?: string }).cardId,
        { syncedAt: now }
      )
    )
  )
  return dirty.length
}

// ── Pull (cloud → local) ─────────────────────────────────────────────────────

async function pullTable<T>(
  tableName: string,
  localTable: { put: (item: T) => Promise<unknown>; get: (key: unknown) => Promise<T | undefined> },
  userId: string,
  lastSync: string | null,
  pkField: string = 'id',
  timestampColumn: string = 'updated_at'
): Promise<number> {
  let query = supabase
    .from(tableName)
    .select('*')
    .eq('user_id', userId)

  if (lastSync) {
    query = query.gte(timestampColumn, lastSync)
  }

  const { data, error } = await query
  if (error) throw new Error(`pull ${tableName}: ${error.message}`)
  if (!data?.length) return 0

  let count = 0
  for (const row of data) {
    const camel = toCamel(row as Record<string, unknown>)
    delete camel.userId
    camel.syncedAt = nowIso()
    if (pkField === 'cardId') {
      camel.cardId = camel.cardId ?? (row as Record<string, unknown>).card_id
    }
    const pk = pkField === 'cardId' ? camel.cardId : camel.id
    const local = await localTable.get(pk as unknown)
    if (local && (local as Record<string, unknown>).updatedAt && camel.updatedAt) {
      if ((local as Record<string, unknown>).updatedAt as string > (camel.updatedAt as string)) {
        continue
      }
    }
    await localTable.put(camel as T)
    count++
  }
  return count
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function pushChanges(): Promise<SyncResult> {
  const userId = await getUserId()
  const lastSync = getLastSyncTime()
  let pushed = 0

  pushed += await pushTable('knowledge_nodes', db.knowledgeNodes as never, userId, lastSync)
  pushed += await pushTable('memory_cards', db.memoryCards as never, userId, lastSync)
  pushed += await pushTable('review_states', db.reviewStates as never, userId, lastSync, { conflictColumn: 'card_id' })
  pushed += await pushTable('review_records', db.reviewRecords as never, userId, lastSync, { appendOnly: true })
  pushed += await pushTable('mistake_notes', db.mistakeNotes as never, userId, lastSync)
  pushed += await pushTable('insights', db.insights as never, userId, lastSync)

  return { pushed, pulled: 0, conflicts: 0 }
}

export async function pullChanges(): Promise<SyncResult> {
  const userId = await getUserId()
  const lastSync = getLastSyncTime()
  let pulled = 0

  pulled += await pullTable<KnowledgeNode>('knowledge_nodes', db.knowledgeNodes, userId, lastSync)
  pulled += await pullTable<MemoryCard>('memory_cards', db.memoryCards, userId, lastSync)
  pulled += await pullTable<ReviewState>('review_states', db.reviewStates, userId, lastSync, 'cardId')
  pulled += await pullTable<ReviewRecord>('review_records', db.reviewRecords, userId, lastSync, 'id', 'reviewed_at')
  pulled += await pullTable<MistakeNote>('mistake_notes', db.mistakeNotes, userId, lastSync)
  pulled += await pullTable<Insight>('insights', db.insights, userId, lastSync)

  return { pushed: 0, pulled, conflicts: 0 }
}

export async function fullSync(): Promise<SyncResult> {
  const pushResult = await pushChanges()
  const pullResult = await pullChanges()
  const now = nowIso()
  setLastSyncTime(now)
  return {
    pushed: pushResult.pushed,
    pulled: pullResult.pulled,
    conflicts: 0
  }
}
