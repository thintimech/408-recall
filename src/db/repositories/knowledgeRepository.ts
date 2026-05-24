import { db } from '@/db'
import { seedKnowledgeNodes } from '@/data/seedKnowledgeNodes'
import { seedCards } from '@/data/seedCards'
import type { ID, KnowledgeNode } from '@/types/domain'
import { nowIso, todayLocalDate } from '@/services/dateService'
import { createInitialReviewState } from '@/services/reviewScheduler'

const seedMetaKey = 'seed_initialized_v2'
const seedMathMetaKey = 'seed_math_v2'
const seedCardsMetaKey = 'seed_cards_v4'

function sortNodes(nodes: KnowledgeNode[]): KnowledgeNode[] {
  return [...nodes].sort((a, b) => {
    if (a.level !== b.level) return a.level - b.level
    if ((a.parentId || '') !== (b.parentId || '')) {
      return (a.parentId || '').localeCompare(b.parentId || '')
    }
    return a.sortOrder - b.sortOrder
  })
}

export async function initializeSeedData(): Promise<void> {
  await db.transaction('rw', db.knowledgeNodes, db.appMeta, async () => {
    const initialized = await db.appMeta.get(seedMetaKey)
    if (initialized?.value !== true) {
      let inserted = 0
      for (const node of seedKnowledgeNodes) {
        const existing = await db.knowledgeNodes.get(node.id)
        if (!existing) {
          await db.knowledgeNodes.put(node)
          inserted++
        }
      }
      console.log(`[408 Recall] Seeded ${inserted} knowledge nodes (total available: ${seedKnowledgeNodes.length})`)
      await db.appMeta.put({ key: seedMetaKey, value: true, updatedAt: nowIso() })
    }

    const mathInitialized = await db.appMeta.get(seedMathMetaKey)
    if (mathInitialized?.value !== true) {
      const mathNodes = seedKnowledgeNodes.filter(
        (n) => n.subjectId === 'subject-calculus' || n.subjectId === 'subject-linalg' || n.subjectId === 'subject-prob'
      )
      for (const node of mathNodes) {
        const existing = await db.knowledgeNodes.get(node.id)
        if (!existing) await db.knowledgeNodes.put(node)
      }
      await db.appMeta.put({ key: seedMathMetaKey, value: true, updatedAt: nowIso() })
    }
  })

  await db.transaction('rw', db.memoryCards, db.reviewStates, db.appMeta, async () => {
    const cardsInitialized = await db.appMeta.get(seedCardsMetaKey)
    if (cardsInitialized?.value !== true) {
      const today = todayLocalDate()
      const now = nowIso()
      let inserted = 0
      for (const card of seedCards) {
        const existing = await db.memoryCards.get(card.id)
        if (!existing) {
          await db.memoryCards.put(card)
          await db.reviewStates.put(createInitialReviewState(card.id, today, now))
          inserted++
        }
      }
      console.log(`[408 Recall] Seeded ${inserted} cards (total available: ${seedCards.length})`)
      await db.appMeta.put({ key: seedCardsMetaKey, value: true, updatedAt: nowIso() })
    }
  })
}

export async function listKnowledgeNodes(): Promise<KnowledgeNode[]> {
  return sortNodes(await db.knowledgeNodes.toArray())
}

export async function getKnowledgeNode(id: ID): Promise<KnowledgeNode | undefined> {
  return db.knowledgeNodes.get(id)
}

export async function addKnowledgeNode(node: KnowledgeNode): Promise<void> {
  await db.knowledgeNodes.add(node)
}

export async function updateKnowledgeNode(node: KnowledgeNode): Promise<void> {
  await db.knowledgeNodes.put({
    ...node,
    updatedAt: nowIso()
  })
}

export async function deleteKnowledgeNode(id: ID): Promise<void> {
  const childCount = await db.knowledgeNodes.where('parentId').equals(id).count()
  if (childCount > 0) {
    throw new Error('该知识点下存在子节点，不能直接删除。')
  }

  const cardCount = await db.memoryCards.where('knowledgeNodeId').equals(id).count()
  if (cardCount > 0) {
    throw new Error('该知识点下存在卡片，不能直接删除。')
  }

  await db.knowledgeNodes.delete(id)
}

export async function countCardsByKnowledgeNode(): Promise<Record<ID, number>> {
  const cards = await db.memoryCards.toArray()
  return cards.reduce<Record<ID, number>>((acc, card) => {
    acc[card.knowledgeNodeId] = (acc[card.knowledgeNodeId] || 0) + 1
    return acc
  }, {})
}
