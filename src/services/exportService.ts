import { db } from '@/db'
import { setMetaValue } from '@/db/repositories/metaRepository'
import { nowIso, todayLocalDate } from '@/services/dateService'
import type { ExportDataV1 } from '@/types/export'

export async function buildExportData(exportedAt = nowIso()): Promise<ExportDataV1> {
  return {
    app: {
      name: '408 Recall',
      exportVersion: 1,
      exportedAt
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

export async function downloadBackup(prefix = '408-recall-backup'): Promise<void> {
  const exportedAt = nowIso()
  await setMetaValue('last_export_at', exportedAt)
  await setMetaValue('data_schema_version', 1)

  const data = await buildExportData(exportedAt)
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json;charset=utf-8'
  })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `${prefix}-${todayLocalDate()}.json`
  anchor.click()
  URL.revokeObjectURL(url)
}
