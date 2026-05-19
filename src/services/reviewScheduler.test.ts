import { describe, expect, it } from 'vitest'
import type { ReviewState } from '@/types/domain'
import { createInitialReviewState, scheduleNextReview } from './reviewScheduler'

function baseState(overrides: Partial<ReviewState> = {}): ReviewState {
  return {
    cardId: 'card-1',
    lastReviewDate: null,
    nextReviewDate: '2026-05-19',
    intervalDays: 0,
    easeFactor: 2.5,
    reviewCount: 0,
    lapseCount: 0,
    updatedAt: '2026-05-19T00:00:00.000Z',
    ...overrides
  }
}

describe('reviewScheduler', () => {
  it('creates initial review state due today', () => {
    expect(
      createInitialReviewState(
        'card-1',
        '2026-05-19',
        '2026-05-19T12:00:00.000Z'
      )
    ).toEqual({
      cardId: 'card-1',
      lastReviewDate: null,
      nextReviewDate: '2026-05-19',
      intervalDays: 0,
      easeFactor: 2.5,
      reviewCount: 0,
      lapseCount: 0,
      updatedAt: '2026-05-19T12:00:00.000Z'
    })
  })

  it('schedules forgotten cards for tomorrow and increments lapse count', () => {
    const result = scheduleNextReview(
      baseState({ intervalDays: 10, reviewCount: 2 }),
      'FORGOT',
      '2026-05-19',
      '2026-05-19T12:00:00.000Z'
    )

    expect(result.nextReviewDate).toBe('2026-05-20')
    expect(result.intervalDays).toBe(1)
    expect(result.easeFactor).toBe(2.3)
    expect(result.lapseCount).toBe(1)
    expect(result.reviewCount).toBe(3)
  })

  it('schedules hard cards with a short interval', () => {
    const result = scheduleNextReview(
      baseState({ intervalDays: 5 }),
      'HARD',
      '2026-05-19',
      '2026-05-19T12:00:00.000Z'
    )

    expect(result.nextReviewDate).toBe('2026-05-25')
    expect(result.intervalDays).toBe(6)
    expect(result.easeFactor).toBe(2.4)
  })

  it('schedules good new cards four days later', () => {
    const result = scheduleNextReview(baseState(), 'GOOD', '2026-05-19')

    expect(result.nextReviewDate).toBe('2026-05-23')
    expect(result.intervalDays).toBe(4)
  })

  it('schedules easy new cards seven days later and increases ease factor', () => {
    const result = scheduleNextReview(baseState(), 'EASY', '2026-05-19')

    expect(result.nextReviewDate).toBe('2026-05-26')
    expect(result.intervalDays).toBe(7)
    expect(result.easeFactor).toBe(2.65)
  })
})
