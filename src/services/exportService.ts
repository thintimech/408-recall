import { db } from '@/db'
import { nowIso, todayLocalDate } from '@/services/dateService'
import type { ExportDataV1 } from '@/types/export'

export async function buildExportData(): Promise<ExportDataV1> {
  return {
    app: {
      name: '408 Recall',
      exportVersion: 1,
      exportedAt: nowIso()
    },
    data: {
      knowledgeNodes: await db.knowledgeNodes.toArray(),
      memoryCards: await db.memoryCards.toArray(),
      reviewStates: await db.reviewStates.toArray(),
      reviewRecords: await db.reviewRecords.toArray(),
      appMeta: await db.appMeta.toArray()
    }
  }
}

export async function downloadBackup(): Promise<void> {
  const data = await buildExportData()
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json;charset=utf-8'
  })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `408-recall-backup-${todayLocalDate()}.json`
  anchor.click()
  URL.revokeObjectURL(url)
}
