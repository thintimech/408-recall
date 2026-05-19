import { db } from '@/db'
import { nowIso, todayLocalDate } from '@/services/dateService'
import { createInitialReviewState } from '@/services/reviewScheduler'
import type {
  CardType,
  CardWithReviewState,
  ID,
  MemoryCard,
  ReviewState
} from '@/types/domain'
import { createId } from '@/utils/id'

export interface CardFilters {
  subjectId?: ID
  knowledgeNodeId?: ID
  type?: CardType
  query?: string
  dueStatus?: 'ALL' | 'DUE_TODAY' | 'OVERDUE' | 'UNREVIEWED'
  archivedStatus?: 'ALL' | 'ACTIVE' | 'ARCHIVED'
  sortBy?: 'UPDATED_DESC' | 'DUE_ASC' | 'DUE_DESC'
}

function matchesQuery(card: MemoryCard, query?: string): boolean {
  if (!query?.trim()) return true
  const normalized = query.trim().toLowerCase()
  return [card.front, card.back, card.extra || '', card.tags.join(' ')]
    .join(' ')
    .toLowerCase()
    .includes(normalized)
}

function isArchived(card: MemoryCard): boolean {
  return card.archived === true
}

function matchesDueStatus(
  item: CardWithReviewState,
  dueStatus: CardFilters['dueStatus'],
  today: string
): boolean {
  if (!dueStatus || dueStatus === 'ALL') return true
  if (dueStatus === 'UNREVIEWED') return item.state?.lastReviewDate === null
  if (!item.state) return false
  if (dueStatus === 'DUE_TODAY') return item.state.nextReviewDate === today
  return item.state.nextReviewDate < today
}

function sortCardItems(
  items: CardWithReviewState[],
  sortBy: CardFilters['sortBy']
): CardWithReviewState[] {
  const sorted = [...items]

  if (sortBy === 'DUE_ASC') {
    return sorted.sort((a, b) =>
      (a.state?.nextReviewDate || '9999-12-31').localeCompare(
        b.state?.nextReviewDate || '9999-12-31'
      )
    )
  }

  if (sortBy === 'DUE_DESC') {
    return sorted.sort((a, b) =>
      (b.state?.nextReviewDate || '').localeCompare(a.state?.nextReviewDate || '')
    )
  }

  return sorted.sort((a, b) => b.card.updatedAt.localeCompare(a.card.updatedAt))
}

export async function listCards(filters: CardFilters = {}): Promise<CardWithReviewState[]> {
  const cards = await db.memoryCards.toArray()
  const states = await db.reviewStates.bulkGet(cards.map((card) => card.id))
  const today = todayLocalDate()
  const items = cards.map<CardWithReviewState>((card, index) => ({
    card,
    state: states[index]
  }))

  return sortCardItems(
    items
      .filter((item) => !filters.subjectId || item.card.subjectId === filters.subjectId)
      .filter(
        (item) =>
          !filters.knowledgeNodeId || item.card.knowledgeNodeId === filters.knowledgeNodeId
      )
      .filter((item) => !filters.type || item.card.type === filters.type)
      .filter((item) => matchesQuery(item.card, filters.query))
      .filter((item) => {
        if (!filters.archivedStatus || filters.archivedStatus === 'ACTIVE') {
          return !isArchived(item.card)
        }
        if (filters.archivedStatus === 'ARCHIVED') {
          return isArchived(item.card)
        }
        return true
      })
      .filter((item) => matchesDueStatus(item, filters.dueStatus, today)),
    filters.sortBy
  )
}

export async function getCard(id: ID): Promise<MemoryCard | undefined> {
  return db.memoryCards.get(id)
}

export async function getCardsByIds(ids: ID[]): Promise<MemoryCard[]> {
  const cards = await db.memoryCards.bulkGet(ids)
  return cards.filter((card): card is MemoryCard => Boolean(card))
}

export async function createCardWithInitialState(
  card: MemoryCard,
  reviewState: ReviewState
): Promise<void> {
  await db.transaction('rw', db.memoryCards, db.reviewStates, async () => {
    await db.memoryCards.add(card)
    await db.reviewStates.add(reviewState)
  })
}

export async function updateCard(card: MemoryCard): Promise<void> {
  await db.memoryCards.put(card)
}

export async function duplicateCard(cardId: ID): Promise<MemoryCard> {
  const card = await db.memoryCards.get(cardId)
  if (!card) throw new Error('未找到要复制的卡片。')

  const now = nowIso()
  const copy: MemoryCard = {
    ...card,
    id: createId('card'),
    front: `${card.front}（副本）`,
    archived: false,
    createdAt: now,
    updatedAt: now
  }

  await createCardWithInitialState(copy, createInitialReviewState(copy.id, todayLocalDate(), now))
  return copy
}

export async function setCardArchived(cardId: ID, archived: boolean): Promise<void> {
  const card = await db.memoryCards.get(cardId)
  if (!card) throw new Error('未找到要更新的卡片。')

  await db.memoryCards.put({
    ...card,
    archived,
    updatedAt: nowIso()
  })
}

export async function deleteCardCascade(cardId: ID): Promise<void> {
  await db.transaction(
    'rw',
    db.memoryCards,
    db.reviewStates,
    db.reviewRecords,
    async () => {
      await db.memoryCards.delete(cardId)
      await db.reviewStates.delete(cardId)
      await db.reviewRecords.where('cardId').equals(cardId).delete()
    }
  )
}

export async function countCardsBySubject(): Promise<Record<ID, number>> {
  const cards = await db.memoryCards.toArray()
  return cards.filter((card) => !isArchived(card)).reduce<Record<ID, number>>((acc, card) => {
    acc[card.subjectId] = (acc[card.subjectId] || 0) + 1
    return acc
  }, {})
}

export async function listRecentCards(limit = 5): Promise<MemoryCard[]> {
  const cards = await db.memoryCards.toArray()
  return cards
    .filter((card) => !isArchived(card))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit)
}
