import { defineStore } from 'pinia'
import {
  listDueReviewItems,
  listReviewRecords,
  recordReviewResult,
  undoReviewResult,
  type ReviewRecordFilters
} from '@/db/repositories/reviewRepository'
import type {
  DueReviewItem,
  ReviewRecord,
  ReviewResult,
  ReviewState
} from '@/types/domain'

interface SessionReviewEntry {
  item: DueReviewItem
  result: ReviewResult
  record: ReviewRecord
  previousState: ReviewState
}

function emptyResultCounts(): Record<ReviewResult, number> {
  return {
    FORGOT: 0,
    HARD: 0,
    GOOD: 0,
    EASY: 0
  }
}

export const useReviewStore = defineStore('reviews', {
  state: () => ({
    dueItems: [] as DueReviewItem[],
    records: [] as ReviewRecord[],
    sessionResults: emptyResultCounts(),
    sessionReviewed: [] as SessionReviewEntry[],
    initialQueueCount: 0,
    completedThisSession: 0,
    loading: false,
    error: ''
  }),
  getters: {
    currentItem: (state) => state.dueItems[0],
    remainingCount: (state) => state.dueItems.length,
    currentPosition: (state) =>
      state.dueItems.length === 0 ? state.completedThisSession : state.completedThisSession + 1,
    totalForProgress: (state) =>
      Math.max(state.initialQueueCount, state.completedThisSession + state.dueItems.length),
    canUndo: (state) => state.sessionReviewed.length > 0,
    subjectDistribution: (state) =>
      state.sessionReviewed.reduce<Record<string, number>>((acc, entry) => {
        acc[entry.item.card.subjectId] = (acc[entry.item.card.subjectId] || 0) + 1
        return acc
      }, {}),
    weakCards: (state) =>
      state.sessionReviewed
        .filter((entry) => entry.result === 'FORGOT' || entry.result === 'HARD')
        .map((entry) => entry.item.card)
  },
  actions: {
    async loadDue(subjectId?: string) {
      this.loading = true
      this.error = ''

      try {
        this.dueItems = await listDueReviewItems(undefined, subjectId)
        this.sessionResults = emptyResultCounts()
        this.sessionReviewed = []
        this.initialQueueCount = this.dueItems.length
        this.completedThisSession = 0
      } catch (error) {
        this.error = error instanceof Error ? error.message : '今日复习加载失败。'
      } finally {
        this.loading = false
      }
    },
    async answerCurrent(result: ReviewResult) {
      const item = this.currentItem
      if (!item) return

      try {
        const payload = await recordReviewResult(item.card.id, result)
        this.dueItems.shift()
        this.sessionResults[result] += 1
        this.completedThisSession += 1
        this.sessionReviewed.push({
          item,
          result,
          record: payload.record,
          previousState: payload.previousState
        })
      } catch (error) {
        this.error = error instanceof Error ? error.message : '复习结果保存失败。'
        throw error
      }
    },
    skipCurrent() {
      if (this.dueItems.length <= 1) return
      const [item] = this.dueItems.splice(0, 1)
      this.dueItems.push(item)
    },
    async undoLastReview() {
      const last = this.sessionReviewed.pop()
      if (!last) return

      try {
        await undoReviewResult(last.record.id, last.previousState)
        this.sessionResults[last.result] = Math.max(0, this.sessionResults[last.result] - 1)
        this.completedThisSession = Math.max(0, this.completedThisSession - 1)
        this.dueItems.unshift({
          card: last.item.card,
          state: last.previousState
        })
      } catch (error) {
        this.sessionReviewed.push(last)
        this.error = error instanceof Error ? error.message : '撤销复习结果失败。'
        throw error
      }
    },
    async loadRecords(filters: ReviewRecordFilters = {}) {
      this.loading = true
      this.error = ''

      try {
        this.records = await listReviewRecords(filters)
      } catch (error) {
        this.error = error instanceof Error ? error.message : '复习记录加载失败。'
      } finally {
        this.loading = false
      }
    }
  }
})
