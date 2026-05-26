import { db } from '@/db'
import type { ID, Insight } from '@/types/domain'
import { nowIso } from '@/services/dateService'

export function generateId(): string {
  return `ins-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`
}

export async function getAllInsights(): Promise<Insight[]> {
  return db.insights.orderBy('updatedAt').reverse().toArray()
}

export async function getInsightsByNode(nodeId: ID): Promise<Insight[]> {
  return db.insights.where('knowledgeNodeId').equals(nodeId).reverse().sortBy('updatedAt')
}

export async function getInsightById(id: ID): Promise<Insight | undefined> {
  return db.insights.get(id)
}

export async function getInsightCount(): Promise<number> {
  return db.insights.count()
}

export async function createInsight(data: {
  title: string
  content: string
  knowledgeNodeId: ID | null
  relatedCardIds?: ID[]
}): Promise<Insight> {
  const now = nowIso()
  const insight: Insight = {
    id: generateId(),
    knowledgeNodeId: data.knowledgeNodeId,
    title: data.title,
    content: data.content,
    relatedCardIds: data.relatedCardIds ?? [],
    createdAt: now,
    updatedAt: now,
  }
  await db.insights.put(insight)
  return insight
}

export async function updateInsight(id: ID, data: Partial<Pick<Insight, 'title' | 'content' | 'knowledgeNodeId' | 'relatedCardIds'>>): Promise<void> {
  await db.insights.update(id, { ...data, updatedAt: nowIso() })
}

export async function deleteInsight(id: ID): Promise<void> {
  await db.insights.delete(id)
}
