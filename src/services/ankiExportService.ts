import { db } from '@/db'
import { listKnowledgeNodes } from '@/db/repositories/knowledgeRepository'
import type { CardType, ID, MemoryCard } from '@/types/domain'

export interface ExportFilter {
  subjectId?: ID
  knowledgeNodeId?: ID
  type?: CardType
}

export type AnkiFormat = 'markdown' | 'html'

export async function exportAnkiTsv(
  filter: ExportFilter,
  format: AnkiFormat = 'html'
): Promise<string> {
  const cards = await getFilteredCards(filter)
  const nodes = await listKnowledgeNodes()
  const nodeMap = Object.fromEntries(nodes.map((n) => [n.id, n]))

  let render: ((s: string) => string) | null = null
  if (format === 'html') {
    const mod = await import('@/services/markdownRenderer')
    render = mod.renderMarkdown
  }

  const lines: string[] = []

  for (const card of cards) {
    const node = nodeMap[card.knowledgeNodeId]
    const subject = node ? nodeMap[node.subjectId]?.title || '' : ''
    const nodeName = node?.title || ''

    const front = render ? render(card.front) : card.front
    const back = render ? render(card.back) : card.back

    const tags = [subject, nodeName, card.type, ...card.tags]
      .filter(Boolean)
      .map((t) => t.replace(/\s+/g, '_'))
      .join(' ')

    const escapedFront = escapeTsv(front)
    const escapedBack = escapeTsv(back)

    lines.push(`${escapedFront}\t${escapedBack}\t${tags}`)
  }

  return lines.join('\n')
}

export async function exportMarkdownDoc(filter: ExportFilter): Promise<string> {
  const cards = await getFilteredCards(filter)
  const nodes = await listKnowledgeNodes()
  const nodeMap = Object.fromEntries(nodes.map((n) => [n.id, n]))

  const grouped = new Map<string, { title: string; cards: MemoryCard[] }>()

  for (const card of cards) {
    const nodeId = card.knowledgeNodeId
    if (!grouped.has(nodeId)) {
      grouped.set(nodeId, { title: nodeMap[nodeId]?.title || '未分类', cards: [] })
    }
    grouped.get(nodeId)!.cards.push(card)
  }

  const lines: string[] = []
  const subject = filter.subjectId ? nodeMap[filter.subjectId]?.title : '408 Recall'
  lines.push(`# ${subject || '408 Recall'} 卡片导出`)
  lines.push('')

  for (const [, group] of grouped) {
    lines.push(`## ${group.title}`)
    lines.push('')
    for (const card of group.cards) {
      lines.push(`### Q: ${card.front.split('\n')[0]}`)
      lines.push('')
      lines.push(card.front)
      lines.push('')
      lines.push(`### A:`)
      lines.push('')
      lines.push(card.back)
      lines.push('')
    }
  }

  return lines.join('\n')
}

export interface AnkiImportCard {
  front: string
  back: string
  tags: string[]
}

export function parseAnkiTsv(text: string): AnkiImportCard[] {
  const lines = text.split('\n').filter((l) => l.trim() && !l.startsWith('#'))
  const cards: AnkiImportCard[] = []

  for (const line of lines) {
    const parts = line.split('\t')
    if (parts.length < 2) continue

    const front = unescapeTsv(parts[0])
    const back = unescapeTsv(parts[1])
    const tags = parts[2] ? parts[2].split(' ').filter(Boolean) : []

    if (front && back) {
      cards.push({ front, back, tags })
    }
  }

  return cards
}

function unescapeTsv(text: string): string {
  return text.replace(/<br>/g, '\n')
}

async function getFilteredCards(filter: ExportFilter): Promise<MemoryCard[]> {
  let cards = await db.memoryCards.toArray()
  cards = cards.filter((c) => !c.archived)

  if (filter.subjectId) {
    cards = cards.filter((c) => c.subjectId === filter.subjectId)
  }
  if (filter.knowledgeNodeId) {
    cards = cards.filter((c) => c.knowledgeNodeId === filter.knowledgeNodeId)
  }
  if (filter.type) {
    cards = cards.filter((c) => c.type === filter.type)
  }

  return cards.sort((a, b) => a.createdAt.localeCompare(b.createdAt))
}

function escapeTsv(text: string): string {
  return text.replace(/\t/g, ' ').replace(/\n/g, '<br>')
}
