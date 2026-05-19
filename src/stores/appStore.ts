import { defineStore } from 'pinia'
import { countCardsBySubject, listRecentCards } from '@/db/repositories/cardRepository'
import { initializeSeedData, listKnowledgeNodes } from '@/db/repositories/knowledgeRepository'
import {
  countReviewedOn,
  listDueReviewItems,
  listRecentReviewRecords
} from '@/db/repositories/reviewRepository'
import type { MemoryCard, ReviewRecord } from '@/types/domain'
import { todayLocalDate } from '@/services/dateService'

export const useAppStore = defineStore('app', {
  state: () => ({
    initialized: false,
    loading: false,
    error: '',
    dueCount: 0,
    completedToday: 0,
    subjectCardCounts: {} as Record<string, number>,
    subjectTitles: {} as Record<string, string>,
    recentCards: [] as MemoryCard[],
    recentRecords: [] as ReviewRecord[]
  }),
  actions: {
    async initialize() {
      if (this.initialized) return
      this.loading = true
      this.error = ''

      try {
        await initializeSeedData()
        this.initialized = true
        await this.refreshDashboard()
      } catch (error) {
        this.error = error instanceof Error ? error.message : '应用初始化失败。'
      } finally {
        this.loading = false
      }
    },
    async refreshDashboard() {
      const today = todayLocalDate()
      const [dueItems, completed, counts, recentCards, recentRecords, nodes] =
        await Promise.all([
          listDueReviewItems(today),
          countReviewedOn(today),
          countCardsBySubject(),
          listRecentCards(),
          listRecentReviewRecords(),
          listKnowledgeNodes()
        ])

      this.dueCount = dueItems.length
      this.completedToday = completed
      this.subjectCardCounts = counts
      this.recentCards = recentCards
      this.recentRecords = recentRecords
      this.subjectTitles = Object.fromEntries(
        nodes.filter((node) => node.level === 0).map((node) => [node.id, node.title])
      )
    }
  }
})
