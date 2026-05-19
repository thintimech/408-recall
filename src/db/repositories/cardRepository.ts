import { db } from '@/db'
import type { CardType, ID, MemoryCard, ReviewState } from '@/types/domain'

export interface CardFilters {
  subjectId?: ID
  knowledgeNodeId?: ID
  type?: CardType
  query?: string
}

function matchesQuery(card: MemoryCard, query?: string): boolean {
  if (!query?.trim()) return true
  const normalized = query.trim().toLowerCase()
  return [card.front, card.back, card.extra || '', card.tags.join(' ')]
    .join(' ')
    .toLowerCase()
    .includes(normalized)
}

export async function listCards(filters: CardFilters = {}): Promise<MemoryCard[]> {
  const cards = await db.memoryCards.toArray()
  return cards
    .filter((card) => !filters.subjectId || card.subjectId === filters.subjectId)
    .filter(
      (card) => !filters.knowledgeNodeId || card.knowledgeNodeId === filters.knowledgeNodeId
    )
    .filter((card) => !filters.type || card.type === filters.type)
    .filter((card) => matchesQuery(card, filters.query))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
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
  return cards.reduce<Record<ID, number>>((acc, card) => {
    acc[card.subjectId] = (acc[card.subjectId] || 0) + 1
    return acc
  }, {})
}

export async function listRecentCards(limit = 5): Promise<MemoryCard[]> {
  const cards = await db.memoryCards.toArray()
  return cards.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, limit)
}
