import { defineStore } from 'pinia'
import { countCardsBySubject, listRecentCards } from '@/db/repositories/cardRepository'
import { initializeSeedData, listKnowledgeNodes } from '@/db/repositories/knowledgeRepository'
import {
  countReviewedOn,
  listDueCountsByDate,
  listDueReviewItems,
  listRecentForgottenCards,
  listRecentReviewRecords
} from '@/db/repositories/reviewRepository'
import { listMistakeNotes } from '@/db/repositories/mistakeRepository'
import type { DueCountByDate, MemoryCard, MistakeNote, RecentReviewCard, ReviewRecord } from '@/types/domain'
import { todayLocalDate } from '@/services/dateService'
import {
  daysUntilExam,
  getStreakData,
  getStudyGoals,
  recordStudyDay,
  type StreakData,
  type StudyGoals
} from '@/services/studyGoalsService'

export const useAppStore = defineStore('app', {
  state: () => ({
    initialized: false,
    loading: false,
    error: '',
    dueCount: 0,
    completedToday: 0,
    completionRate: 0,
    subjectCardCounts: {} as Record<string, number>,
    subjectTitles: {} as Record<string, string>,
    dueCountsNextSevenDays: [] as DueCountByDate[],
    recentCards: [] as MemoryCard[],
    recentRecords: [] as ReviewRecord[],
    recentForgottenCards: [] as RecentReviewCard[],
    recentMistakeNotes: [] as MistakeNote[],
    studyGoals: { examDate: null, dailyReviewGoal: 30, dailyNewCardGoal: 5, userName: '' } as StudyGoals,
    streak: { currentStreak: 0, lastStudyDate: null } as StreakData,
    daysToExam: null as number | null
  }),
  actions: {
    async initialize() {
      if (this.initialized) return
      this.loading = true
      this.error = ''

      try {
        await initializeSeedData()
        if (navigator.storage?.persist) {
          await navigator.storage.persist()
        }
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
      const [
        dueItems,
        completed,
        counts,
        dueCountsNextSevenDays,
        recentCards,
        recentRecords,
        recentForgottenCards,
        mistakeNotes,
        nodes,
        goals,
        streak
      ] = await Promise.all([
        listDueReviewItems(today),
        countReviewedOn(today),
        countCardsBySubject(),
        listDueCountsByDate(7),
        listRecentCards(),
        listRecentReviewRecords(),
        listRecentForgottenCards(),
        listMistakeNotes(),
        listKnowledgeNodes(),
        getStudyGoals(),
        getStreakData()
      ])

      this.dueCount = dueItems.length
      this.completedToday = completed
      this.completionRate =
        completed + dueItems.length === 0
          ? 0
          : Math.round((completed / (completed + dueItems.length)) * 100)
      this.subjectCardCounts = counts
      this.dueCountsNextSevenDays = dueCountsNextSevenDays
      this.recentCards = recentCards
      this.recentRecords = recentRecords
      this.recentForgottenCards = recentForgottenCards
      this.recentMistakeNotes = mistakeNotes.slice(0, 5)
      this.subjectTitles = Object.fromEntries(
        nodes.filter((node) => node.level === 0).map((node) => [node.id, node.title])
      )
      this.studyGoals = goals
      this.streak = streak
      this.daysToExam = daysUntilExam(goals.examDate)
    },
    async markStudyDay() {
      this.streak = await recordStudyDay()
    }
  }
})
