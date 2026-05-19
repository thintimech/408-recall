import { afterEach, describe, expect, it } from 'vitest'
import { db } from '@/db'
import type { MemoryCard, ReviewState } from '@/types/domain'
import { recordReviewResult, undoReviewResult } from './reviewRepository'

const now = '2026-05-19T12:00:00.000Z'

async function clearDatabase() {
  await db.transaction(
    'rw',
    [db.knowledgeNodes, db.memoryCards, db.reviewStates, db.reviewRecords, db.appMeta],
    async () => {
      await Promise.all([
        db.knowledgeNodes.clear(),
        db.memoryCards.clear(),
        db.reviewStates.clear(),
        db.reviewRecords.clear(),
        db.appMeta.clear()
      ])
    }
  )
}

describe('reviewRepository', () => {
  afterEach(async () => {
    await clearDatabase()
  })

  it('can undo a recorded review by deleting the record and restoring previous state', async () => {
    const card: MemoryCard = {
      id: 'card-1',
      knowledgeNodeId: 'node-1',
      subjectId: 'subject-os',
      type: 'CONCEPT',
      front: '什么是死锁？',
      back: '多个进程因竞争资源而永久等待。',
      extra: '',
      tags: [],
      verifiedStatus: 'VERIFIED',
      createdAt: now,
      updatedAt: now
    }
    const state: ReviewState = {
      cardId: card.id,
      lastReviewDate: null,
      nextReviewDate: '2026-05-19',
      intervalDays: 0,
      easeFactor: 2.5,
      reviewCount: 0,
      lapseCount: 0,
      updatedAt: now
    }

    await db.memoryCards.add(card)
    await db.reviewStates.add(state)

    const payload = await recordReviewResult(card.id, 'GOOD')
    expect(await db.reviewRecords.count()).toBe(1)
    expect((await db.reviewStates.get(card.id))?.reviewCount).toBe(1)

    await undoReviewResult(payload.record.id, payload.previousState)

    expect(await db.reviewRecords.count()).toBe(0)
    expect(await db.reviewStates.get(card.id)).toEqual(state)
  })
})
