import { db } from '@/db'
import { addDays, nowIso, todayLocalDate } from '@/services/dateService'
import { scheduleNextReview } from '@/services/reviewScheduler'
import type {
  DueCountByDate,
  DueReviewItem,
  ID,
  RecentReviewCard,
  ReviewRecord,
  ReviewResult,
  ReviewState
} from '@/types/domain'
import { createId } from '@/utils/id'

export interface ReviewRecordFilters {
  reviewDate?: string
  result?: ReviewResult
}

export interface RecordReviewResultPayload {
  record: ReviewRecord
  previousState: ReviewState
  state: ReviewState
}

export async function getReviewState(cardId: ID): Promise<ReviewState | undefined> {
  return db.reviewStates.get(cardId)
}

export async function listDueReviewItems(today = todayLocalDate(), subjectId?: string): Promise<DueReviewItem[]> {
  const states = await db.reviewStates.where('nextReviewDate').belowOrEqual(today).toArray()
  const sortedStates = states.sort((a, b) => a.nextReviewDate.localeCompare(b.nextReviewDate))
  const cards = await db.memoryCards.bulkGet(sortedStates.map((state) => state.cardId))

  return sortedStates.flatMap((state, index) => {
    const card = cards[index]
    if (!card || card.archived === true) return []
    if (subjectId && card.subjectId !== subjectId) return []
    return [{ card, state }]
  })
}

export async function recordReviewResult(
  cardId: ID,
  result: ReviewResult
): Promise<RecordReviewResultPayload> {
  const today = todayLocalDate()
  const now = nowIso()

  return db.transaction('rw', db.reviewStates, db.reviewRecords, async () => {
    const currentState = await db.reviewStates.get(cardId)
    if (!currentState) {
      throw new Error('未找到该卡片的复习状态。')
    }

    const nextState = scheduleNextReview(currentState, result, today, now)
    const record: ReviewRecord = {
      id: createId('record'),
      cardId,
      reviewedAt: now,
      reviewDate: today,
      result,
      previousIntervalDays: currentState.intervalDays,
      nextIntervalDays: nextState.intervalDays,
      previousNextReviewDate: currentState.nextReviewDate,
      nextReviewDate: nextState.nextReviewDate
    }

    await db.reviewRecords.add(record)
    await db.reviewStates.put(nextState)

    return { record, previousState: currentState, state: nextState }
  })
}

export async function undoReviewResult(
  recordId: ID,
  previousState: ReviewState
): Promise<void> {
  await db.transaction('rw', db.reviewStates, db.reviewRecords, async () => {
    await db.reviewRecords.delete(recordId)
    await db.reviewStates.put(previousState)
  })
}

export async function listReviewRecords(
  filters: ReviewRecordFilters = {}
): Promise<ReviewRecord[]> {
  const records = await db.reviewRecords.toArray()
  return records
    .filter((record) => !filters.reviewDate || record.reviewDate === filters.reviewDate)
    .filter((record) => !filters.result || record.result === filters.result)
    .sort((a, b) => b.reviewedAt.localeCompare(a.reviewedAt))
}

export async function countReviewedOn(date = todayLocalDate()): Promise<number> {
  return db.reviewRecords.where('reviewDate').equals(date).count()
}

export async function listRecentReviewRecords(limit = 5): Promise<ReviewRecord[]> {
  const records = await db.reviewRecords.toArray()
  return records.sort((a, b) => b.reviewedAt.localeCompare(a.reviewedAt)).slice(0, limit)
}

export async function listDueCountsByDate(days: number): Promise<DueCountByDate[]> {
  const today = todayLocalDate()
  const dates = Array.from({ length: days }, (_, index) => addDays(today, index))
  const states = await db.reviewStates.toArray()
  const cards = await db.memoryCards.bulkGet(states.map((state) => state.cardId))
  const activeStates = states.filter((_, index) => cards[index]?.archived !== true)

  return dates.map((date) => ({
    date,
    count: activeStates.filter((state) => state.nextReviewDate === date).length
  }))
}

export async function listRecentForgottenCards(limit = 5): Promise<RecentReviewCard[]> {
  const records = (await db.reviewRecords.where('result').equals('FORGOT').toArray()).sort(
    (a, b) => b.reviewedAt.localeCompare(a.reviewedAt)
  )
  const result: RecentReviewCard[] = []
  const seenCardIds = new Set<ID>()

  for (const record of records) {
    if (seenCardIds.has(record.cardId)) continue
    const card = await db.memoryCards.get(record.cardId)
    if (!card || card.archived === true) continue

    result.push({ card, record })
    seenCardIds.add(record.cardId)
    if (result.length >= limit) break
  }

  return result
}

export async function listCramReviewItems(
  subjectId?: string,
  knowledgeNodeId?: string
): Promise<DueReviewItem[]> {
  let cards = await db.memoryCards.toArray()
  cards = cards.filter((c) => c.archived !== true)
  if (subjectId) cards = cards.filter((c) => c.subjectId === subjectId)
  if (knowledgeNodeId) cards = cards.filter((c) => c.knowledgeNodeId === knowledgeNodeId)

  const states = await db.reviewStates.bulkGet(cards.map((c) => c.id))
  return cards.flatMap((card, i) => {
    const state = states[i]
    if (!state) return []
    return [{ card, state }]
  })
}
