import { db } from '@/db'
import { nowIso, todayLocalDate } from '@/services/dateService'
import { scheduleNextReview } from '@/services/reviewScheduler'
import type {
  DueReviewItem,
  ID,
  ReviewRecord,
  ReviewResult,
  ReviewState
} from '@/types/domain'
import { createId } from '@/utils/id'

export interface ReviewRecordFilters {
  reviewDate?: string
  result?: ReviewResult
}

export async function getReviewState(cardId: ID): Promise<ReviewState | undefined> {
  return db.reviewStates.get(cardId)
}

export async function listDueReviewItems(today = todayLocalDate()): Promise<DueReviewItem[]> {
  const states = await db.reviewStates.where('nextReviewDate').belowOrEqual(today).toArray()
  const sortedStates = states.sort((a, b) => a.nextReviewDate.localeCompare(b.nextReviewDate))
  const cards = await db.memoryCards.bulkGet(sortedStates.map((state) => state.cardId))

  return sortedStates.flatMap((state, index) => {
    const card = cards[index]
    return card ? [{ card, state }] : []
  })
}

export async function recordReviewResult(
  cardId: ID,
  result: ReviewResult
): Promise<{ record: ReviewRecord; state: ReviewState }> {
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

    return { record, state: nextState }
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
