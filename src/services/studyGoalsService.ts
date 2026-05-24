import { getMetaValue, setMetaValue } from '@/db/repositories/metaRepository'
import { todayLocalDate } from './dateService'

export interface StudyGoals {
  examDate: string | null
  dailyReviewGoal: number
  dailyNewCardGoal: number
  userName: string
}

export interface StreakData {
  currentStreak: number
  lastStudyDate: string | null
}

const GOALS_KEY = 'study_goals'
const STREAK_KEY = 'streak_data'

const DEFAULT_GOALS: StudyGoals = {
  examDate: null,
  dailyReviewGoal: 30,
  dailyNewCardGoal: 5,
  userName: ''
}

export async function getStudyGoals(): Promise<StudyGoals> {
  const stored = await getMetaValue<StudyGoals>(GOALS_KEY)
  return stored ? { ...DEFAULT_GOALS, ...stored } : DEFAULT_GOALS
}

export async function saveStudyGoals(goals: StudyGoals): Promise<void> {
  await setMetaValue(GOALS_KEY, goals)
}

export async function getStreakData(): Promise<StreakData> {
  const stored = await getMetaValue<StreakData>(STREAK_KEY)
  return stored || { currentStreak: 0, lastStudyDate: null }
}

export async function recordStudyDay(): Promise<StreakData> {
  const today = todayLocalDate()
  const streak = await getStreakData()

  if (streak.lastStudyDate === today) {
    return streak
  }

  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().slice(0, 10)

  let newStreak: number
  if (streak.lastStudyDate === yesterdayStr) {
    newStreak = streak.currentStreak + 1
  } else if (streak.lastStudyDate === null) {
    newStreak = 1
  } else {
    newStreak = 1
  }

  const updated: StreakData = { currentStreak: newStreak, lastStudyDate: today }
  await setMetaValue(STREAK_KEY, updated)
  return updated
}

export function daysUntilExam(examDate: string | null): number | null {
  if (!examDate) return null
  const today = new Date(todayLocalDate())
  const exam = new Date(examDate)
  const diff = Math.ceil((exam.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  return diff >= 0 ? diff : null
}
