import { db } from '@/db'
import { addDays, todayLocalDate } from './dateService'
import type { ID, ISODateString, ReviewResult } from '@/types/domain'

export interface HeatmapDay {
  date: ISODateString
  count: number
}

export interface SubjectMasteryData {
  subjectId: ID
  title: string
  total: number
  mastered: number
  rate: number
}

export interface DailyReviewCount {
  date: ISODateString
  count: number
}

export interface WeakCard {
  cardId: ID
  front: string
  subjectId: ID
  lapseCount: number
  lastReviewDate: ISODateString | null
}

export async function computeHeatmap(days = 90): Promise<HeatmapDay[]> {
  const today = todayLocalDate()
  const startDate = addDays(today, -(days - 1))
  const records = await db.reviewRecords
    .where('reviewDate')
    .between(startDate, today, true, true)
    .toArray()

  const countMap = new Map<string, number>()
  for (const record of records) {
    countMap.set(record.reviewDate, (countMap.get(record.reviewDate) || 0) + 1)
  }

  const result: HeatmapDay[] = []
  for (let i = 0; i < days; i++) {
    const date = addDays(startDate, i)
    result.push({ date, count: countMap.get(date) || 0 })
  }
  return result
}

export async function computeSubjectMastery(): Promise<SubjectMasteryData[]> {
  const records = await db.reviewRecords.toArray()
  const cards = await db.memoryCards.toArray()
  const nodes = await db.knowledgeNodes.where('level').equals(0).toArray()

  const cardSubjectMap = new Map<ID, ID>()
  for (const card of cards) {
    cardSubjectMap.set(card.id, card.subjectId)
  }

  const subjectStats = new Map<ID, { total: number; mastered: number }>()
  for (const node of nodes) {
    subjectStats.set(node.id, { total: 0, mastered: 0 })
  }

  for (const record of records) {
    const subjectId = cardSubjectMap.get(record.cardId)
    if (!subjectId) continue
    const stats = subjectStats.get(subjectId)
    if (!stats) continue
    stats.total += 1
    if (record.result === 'GOOD' || record.result === 'EASY') {
      stats.mastered += 1
    }
  }

  return nodes.map((node) => {
    const stats = subjectStats.get(node.id) || { total: 0, mastered: 0 }
    return {
      subjectId: node.id,
      title: node.title,
      total: stats.total,
      mastered: stats.mastered,
      rate: stats.total > 0 ? Math.round((stats.mastered / stats.total) * 100) : 0
    }
  })
}

export async function computeDailyReviewCounts(days = 30): Promise<DailyReviewCount[]> {
  const today = todayLocalDate()
  const startDate = addDays(today, -(days - 1))
  const records = await db.reviewRecords
    .where('reviewDate')
    .between(startDate, today, true, true)
    .toArray()

  const countMap = new Map<string, number>()
  for (const record of records) {
    countMap.set(record.reviewDate, (countMap.get(record.reviewDate) || 0) + 1)
  }

  const result: DailyReviewCount[] = []
  for (let i = 0; i < days; i++) {
    const date = addDays(startDate, i)
    result.push({ date, count: countMap.get(date) || 0 })
  }
  return result
}

export async function computeWeakCards(limit = 10): Promise<WeakCard[]> {
  const states = await db.reviewStates.toArray()
  const weakStates = states
    .filter((s) => s.lapseCount >= 3)
    .sort((a, b) => b.lapseCount - a.lapseCount)
    .slice(0, limit)

  const cards = await db.memoryCards.bulkGet(weakStates.map((s) => s.cardId))

  return weakStates.flatMap((state, i) => {
    const card = cards[i]
    if (!card) return []
    return [{
      cardId: card.id,
      front: card.front,
      subjectId: card.subjectId,
      lapseCount: state.lapseCount,
      lastReviewDate: state.lastReviewDate
    }]
  })
}

export async function computeStaleCards(staleDays = 30, limit = 10): Promise<WeakCard[]> {
  const today = todayLocalDate()
  const cutoff = addDays(today, -staleDays)
  const states = await db.reviewStates.toArray()

  const staleStates = states
    .filter((s) => s.lastReviewDate && s.lastReviewDate < cutoff)
    .sort((a, b) => (a.lastReviewDate || '').localeCompare(b.lastReviewDate || ''))
    .slice(0, limit)

  const cards = await db.memoryCards.bulkGet(staleStates.map((s) => s.cardId))

  return staleStates.flatMap((state, i) => {
    const card = cards[i]
    if (!card) return []
    return [{
      cardId: card.id,
      front: card.front,
      subjectId: card.subjectId,
      lapseCount: state.lapseCount,
      lastReviewDate: state.lastReviewDate
    }]
  })
}

export async function computeOverallStats() {
  const today = todayLocalDate()
  const records = await db.reviewRecords.toArray()
  const totalReviews = records.length
  const todayReviews = records.filter((r) => r.reviewDate === today).length

  const resultCounts: Record<ReviewResult, number> = { FORGOT: 0, HARD: 0, GOOD: 0, EASY: 0 }
  for (const record of records) {
    resultCounts[record.result] += 1
  }

  const totalCards = await db.memoryCards.count()
  const dueStates = await db.reviewStates.where('nextReviewDate').belowOrEqual(today).toArray()
  const dueCardIds = dueStates.map((s) => s.cardId)
  const dueCards = dueCardIds.length > 0 ? await db.memoryCards.bulkGet(dueCardIds) : []
  const dueToday = dueCards.filter((c) => c && c.archived !== true).length

  return { totalReviews, todayReviews, resultCounts, totalCards, dueToday }
}

export interface DiagnosisData {
  summary: string
}

export async function computeDiagnosisData(): Promise<DiagnosisData> {
  const today = todayLocalDate()
  const sevenDaysAgo = addDays(today, -7)
  const fourteenDaysAgo = addDays(today, -14)

  const records = await db.reviewRecords.toArray()
  const cards = await db.memoryCards.toArray()
  const states = await db.reviewStates.toArray()
  const nodes = await db.knowledgeNodes.toArray()

  const subjectNodes = nodes.filter((n) => n.level === 0)
  const nodeMap = Object.fromEntries(nodes.map((n) => [n.id, n]))

  const recentRecords = records.filter((r) => r.reviewDate >= sevenDaysAgo)
  const prevRecords = records.filter((r) => r.reviewDate >= fourteenDaysAgo && r.reviewDate < sevenDaysAgo)

  const forgotRate = (recs: typeof records) => {
    if (recs.length === 0) return 0
    return Math.round((recs.filter((r) => r.result === 'FORGOT').length / recs.length) * 100)
  }

  const lines: string[] = []

  lines.push(`总卡片数：${cards.length}，总复习次数：${records.length}`)
  lines.push(`近 7 天复习：${recentRecords.length} 次，遗忘率 ${forgotRate(recentRecords)}%`)
  lines.push(`前 7 天复习：${prevRecords.length} 次，遗忘率 ${forgotRate(prevRecords)}%`)
  lines.push('')

  lines.push('各科目情况：')
  for (const subject of subjectNodes) {
    const subjectCards = cards.filter((c) => c.subjectId === subject.id)
    const subjectStates = states.filter((s) => subjectCards.some((c) => c.id === s.cardId))
    const avgLapse = subjectStates.length
      ? (subjectStates.reduce((sum, s) => sum + s.lapseCount, 0) / subjectStates.length).toFixed(1)
      : '0'
    const subjectRecords = recentRecords.filter((r) => subjectCards.some((c) => c.id === r.cardId))
    lines.push(`- ${subject.title}：${subjectCards.length} 张卡片，近 7 天复习 ${subjectRecords.length} 次，遗忘率 ${forgotRate(subjectRecords)}%，平均遗忘次数 ${avgLapse}`)
  }
  lines.push('')

  const weakStates = states
    .filter((s) => s.lapseCount >= 2)
    .sort((a, b) => b.lapseCount - a.lapseCount)
    .slice(0, 8)

  if (weakStates.length) {
    lines.push('高遗忘卡片（遗忘≥2次）：')
    for (const state of weakStates) {
      const card = cards.find((c) => c.id === state.cardId)
      if (!card) continue
      const nodeName = nodeMap[card.knowledgeNodeId]?.title || ''
      lines.push(`- [${nodeName}] ${card.front.slice(0, 40)}（遗忘 ${state.lapseCount} 次，间隔 ${state.intervalDays} 天）`)
    }
  }

  return { summary: lines.join('\n') }
}
