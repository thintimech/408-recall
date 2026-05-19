import { db } from '@/db'
import type { ExportDataV1 } from '@/types/export'

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function ensureArray(value: unknown, name: string): void {
  if (!Array.isArray(value)) {
    throw new Error(`导入文件缺少 ${name} 数组。`)
  }
}

export function validateExportData(value: unknown): ExportDataV1 {
  if (!isObject(value) || !isObject(value.app) || !isObject(value.data)) {
    throw new Error('导入文件结构不正确。')
  }

  if (value.app.name !== '408 Recall' || value.app.exportVersion !== 1) {
    throw new Error('导入文件不是 408 Recall v1 备份。')
  }

  ensureArray(value.data.knowledgeNodes, 'knowledgeNodes')
  ensureArray(value.data.memoryCards, 'memoryCards')
  ensureArray(value.data.reviewStates, 'reviewStates')
  ensureArray(value.data.reviewRecords, 'reviewRecords')
  ensureArray(value.data.appMeta, 'appMeta')

  const data = value as unknown as ExportDataV1
  const nodeIds = new Set(data.data.knowledgeNodes.map((node) => node.id))
  const stateCardIds = new Set(data.data.reviewStates.map((state) => state.cardId))

  for (const card of data.data.memoryCards) {
    if (!nodeIds.has(card.knowledgeNodeId)) {
      throw new Error(`卡片 ${card.id} 绑定的知识点不存在。`)
    }

    if (!stateCardIds.has(card.id)) {
      throw new Error(`卡片 ${card.id} 缺少复习状态。`)
    }
  }

  return data
}

export async function readBackupFile(file: File): Promise<ExportDataV1> {
  const text = await file.text()
  return validateExportData(JSON.parse(text))
}

export async function overwriteImport(data: ExportDataV1): Promise<void> {
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

      await Promise.all([
        db.knowledgeNodes.bulkPut(data.data.knowledgeNodes),
        db.memoryCards.bulkPut(data.data.memoryCards),
        db.reviewStates.bulkPut(data.data.reviewStates),
        db.reviewRecords.bulkPut(data.data.reviewRecords),
        db.appMeta.bulkPut(data.data.appMeta)
      ])
    }
  )
}

export async function clearAllData(): Promise<void> {
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
