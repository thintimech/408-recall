import { db } from '@/db'
import { seedKnowledgeNodes } from '@/data/seedKnowledgeNodes'
import type { ID, KnowledgeNode } from '@/types/domain'
import { nowIso } from '@/services/dateService'

const seedMetaKey = 'seed_initialized_v1'

function sortNodes(nodes: KnowledgeNode[]): KnowledgeNode[] {
  return [...nodes].sort((a, b) => {
    if (a.level !== b.level) return a.level - b.level
    if ((a.parentId || '') !== (b.parentId || '')) {
      return (a.parentId || '').localeCompare(b.parentId || '')
    }
    return a.sortOrder - b.sortOrder
  })
}

export async function initializeSeedData(): Promise<void> {
  await db.transaction('rw', db.knowledgeNodes, db.appMeta, async () => {
    const initialized = await db.appMeta.get(seedMetaKey)
    if (initialized?.value === true) return

    const existingNodeCount = await db.knowledgeNodes.count()
    if (existingNodeCount === 0) {
      await db.knowledgeNodes.bulkPut(seedKnowledgeNodes)
    }

    await db.appMeta.put({
      key: seedMetaKey,
      value: true,
      updatedAt: nowIso()
    })
  })
}

export async function listKnowledgeNodes(): Promise<KnowledgeNode[]> {
  return sortNodes(await db.knowledgeNodes.toArray())
}

export async function getKnowledgeNode(id: ID): Promise<KnowledgeNode | undefined> {
  return db.knowledgeNodes.get(id)
}

export async function addKnowledgeNode(node: KnowledgeNode): Promise<void> {
  await db.knowledgeNodes.add(node)
}

export async function updateKnowledgeNode(node: KnowledgeNode): Promise<void> {
  await db.knowledgeNodes.put({
    ...node,
    updatedAt: nowIso()
  })
}

export async function deleteKnowledgeNode(id: ID): Promise<void> {
  const childCount = await db.knowledgeNodes.where('parentId').equals(id).count()
  if (childCount > 0) {
    throw new Error('该知识点下存在子节点，不能直接删除。')
  }

  const cardCount = await db.memoryCards.where('knowledgeNodeId').equals(id).count()
  if (cardCount > 0) {
    throw new Error('该知识点下存在卡片，不能直接删除。')
  }

  await db.knowledgeNodes.delete(id)
}

export async function countCardsByKnowledgeNode(): Promise<Record<ID, number>> {
  const cards = await db.memoryCards.toArray()
  return cards.reduce<Record<ID, number>>((acc, card) => {
    acc[card.knowledgeNodeId] = (acc[card.knowledgeNodeId] || 0) + 1
    return acc
  }, {})
}
