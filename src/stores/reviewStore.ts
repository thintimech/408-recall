import { defineStore } from 'pinia'
import {
  listDueReviewItems,
  listReviewRecords,
  recordReviewResult,
  type ReviewRecordFilters
} from '@/db/repositories/reviewRepository'
import type { DueReviewItem, ReviewRecord, ReviewResult } from '@/types/domain'

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
    completedThisSession: 0,
    loading: false,
    error: ''
  }),
  getters: {
    currentItem: (state) => state.dueItems[0],
    remainingCount: (state) => state.dueItems.length
  },
  actions: {
    async loadDue() {
      this.loading = true
      this.error = ''

      try {
        this.dueItems = await listDueReviewItems()
        this.sessionResults = emptyResultCounts()
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
        await recordReviewResult(item.card.id, result)
        this.dueItems.shift()
        this.sessionResults[result] += 1
        this.completedThisSession += 1
      } catch (error) {
        this.error = error instanceof Error ? error.message : '复习结果保存失败。'
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
