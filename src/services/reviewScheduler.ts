import type { ID, ReviewResult, ReviewState } from '@/types/domain'
import { addDays, nowIso, todayLocalDate } from './dateService'

export function createInitialReviewState(
  cardId: ID,
  today = todayLocalDate(),
  now = nowIso()
): ReviewState {
  return {
    cardId,
    lastReviewDate: null,
    nextReviewDate: today,
    intervalDays: 0,
    easeFactor: 2.5,
    reviewCount: 0,
    lapseCount: 0,
    updatedAt: now
  }
}

export function scheduleNextReview(
  state: ReviewState,
  result: ReviewResult,
  today = todayLocalDate(),
  now = nowIso()
): ReviewState {
  const currentInterval = state.intervalDays
  let nextInterval: number
  let nextEaseFactor = state.easeFactor || 2.5
  let nextLapseCount = state.lapseCount

  switch (result) {
    case 'FORGOT':
      nextInterval = 1
      nextEaseFactor = Math.max(1.3, nextEaseFactor - 0.2)
      nextLapseCount += 1
      break
    case 'HARD':
      nextInterval = Math.max(2, Math.round(currentInterval * 1.2) || 2)
      nextEaseFactor = Math.max(1.3, nextEaseFactor - 0.1)
      break
    case 'GOOD':
      nextInterval =
        currentInterval <= 0
          ? 4
          : Math.max(4, Math.round(currentInterval * nextEaseFactor))
      break
    case 'EASY':
      nextEaseFactor += 0.15
      nextInterval =
        currentInterval <= 0
          ? 7
          : Math.max(7, Math.round(currentInterval * nextEaseFactor * 1.3))
      break
  }

  return {
    ...state,
    lastReviewDate: today,
    nextReviewDate: addDays(today, nextInterval),
    intervalDays: nextInterval,
    easeFactor: nextEaseFactor,
    reviewCount: state.reviewCount + 1,
    lapseCount: nextLapseCount,
    updatedAt: now
  }
}
