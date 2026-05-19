import { afterEach, describe, expect, it } from 'vitest'
import { db } from '@/db'
import type { MemoryCard, ReviewRecord, ReviewState } from '@/types/domain'
import { deleteCardCascade } from './cardRepository'

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

describe('cardRepository', () => {
  afterEach(async () => {
    await clearDatabase()
  })

  it('deletes card, review state, and review records together', async () => {
    const card: MemoryCard = {
      id: 'card-1',
      knowledgeNodeId: 'node-1',
      subjectId: 'subject-os',
      type: 'CONCEPT',
      front: '什么是线程？',
      back: '线程是处理机调度的基本单位。',
      extra: '',
      tags: ['操作系统'],
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
    const record: ReviewRecord = {
      id: 'record-1',
      cardId: card.id,
      reviewedAt: now,
      reviewDate: '2026-05-19',
      result: 'GOOD',
      previousIntervalDays: 0,
      nextIntervalDays: 4,
      previousNextReviewDate: '2026-05-19',
      nextReviewDate: '2026-05-23'
    }

    await db.memoryCards.add(card)
    await db.reviewStates.add(state)
    await db.reviewRecords.add(record)

    await deleteCardCascade(card.id)

    await expect(db.memoryCards.get(card.id)).resolves.toBeUndefined()
    await expect(db.reviewStates.get(card.id)).resolves.toBeUndefined()
    await expect(db.reviewRecords.where('cardId').equals(card.id).count()).resolves.toBe(0)
  })
})
