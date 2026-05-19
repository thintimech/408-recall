import type {
  AppMeta,
  KnowledgeNode,
  MemoryCard,
  ReviewRecord,
  ReviewState
} from './domain'

export interface ExportDataV1 {
  app: {
    name: '408 Recall'
    exportVersion: 1
    exportedAt: string
  }
  data: {
    knowledgeNodes: KnowledgeNode[]
    memoryCards: MemoryCard[]
    reviewStates: ReviewState[]
    reviewRecords: ReviewRecord[]
    appMeta: AppMeta[]
  }
}
