import { describe, expect, it } from 'vitest'
import type { ExportDataV1 } from '@/types/export'
import { validateExportData } from './importService'

function validBackup(): ExportDataV1 {
  return {
    app: {
      name: '408 Recall',
      exportVersion: 1,
      exportedAt: '2026-05-19T12:00:00.000Z'
    },
    data: {
      knowledgeNodes: [
        {
          id: 'subject-os',
          subjectId: 'subject-os',
          parentId: null,
          title: '操作系统',
          level: 0,
          sortOrder: 1,
          description: '',
          createdAt: '2026-05-19T12:00:00.000Z',
          updatedAt: '2026-05-19T12:00:00.000Z'
        }
      ],
      memoryCards: [
        {
          id: 'card-1',
          knowledgeNodeId: 'subject-os',
          subjectId: 'subject-os',
          type: 'CONCEPT',
          front: '什么是进程？',
          back: '进程是资源分配的基本单位。',
          extra: '',
          tags: ['操作系统'],
          verifiedStatus: 'VERIFIED',
          createdAt: '2026-05-19T12:00:00.000Z',
          updatedAt: '2026-05-19T12:00:00.000Z'
        }
      ],
      reviewStates: [
        {
          cardId: 'card-1',
          lastReviewDate: null,
          nextReviewDate: '2026-05-19',
          intervalDays: 0,
          easeFactor: 2.5,
          reviewCount: 0,
          lapseCount: 0,
          updatedAt: '2026-05-19T12:00:00.000Z'
        }
      ],
      reviewRecords: [],
      appMeta: []
    }
  }
}

describe('importService validation', () => {
  it('accepts valid v1 backup data', () => {
    const data = validBackup()

    expect(validateExportData(data)).toBe(data)
  })

  it('rejects backups from another app or version', () => {
    const data = validBackup()
    data.app.exportVersion = 2 as 1

    expect(() => validateExportData(data)).toThrow('不是 408 Recall v1 备份')
  })

  it('rejects cards whose knowledge node does not exist', () => {
    const data = validBackup()
    data.data.memoryCards[0].knowledgeNodeId = 'missing-node'

    expect(() => validateExportData(data)).toThrow('绑定的知识点不存在')
  })

  it('rejects cards without review state', () => {
    const data = validBackup()
    data.data.reviewStates = []

    expect(() => validateExportData(data)).toThrow('缺少复习状态')
  })
})
