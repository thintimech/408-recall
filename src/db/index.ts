import Dexie, { type Table } from 'dexie'
import type {
  AppMeta,
  ID,
  KnowledgeNode,
  MemoryCard,
  MistakeNote,
  ReviewRecord,
  ReviewState
} from '@/types/domain'

export class RecallDatabase extends Dexie {
  knowledgeNodes!: Table<KnowledgeNode, ID>
  memoryCards!: Table<MemoryCard, ID>
  reviewStates!: Table<ReviewState, ID>
  reviewRecords!: Table<ReviewRecord, ID>
  mistakeNotes!: Table<MistakeNote, ID>
  appMeta!: Table<AppMeta, string>

  constructor() {
    super('408-recall-db')

    this.version(1).stores({
      knowledge_nodes: 'id, subjectId, parentId, level, sortOrder, title',
      memory_cards:
        'id, knowledgeNodeId, subjectId, type, verifiedStatus, createdAt, updatedAt, *tags',
      review_states: 'cardId, nextReviewDate, lastReviewDate, reviewCount, lapseCount',
      review_records: 'id, cardId, reviewDate, result, reviewedAt',
      app_meta: 'key, updatedAt'
    })

    this.version(2).stores({
      mistake_notes: 'id, knowledgeNodeId, createdAt'
    })

    // v3: add syncedAt index for incremental sync
    this.version(3).stores({
      knowledge_nodes: 'id, subjectId, parentId, level, sortOrder, title, syncedAt',
      memory_cards: 'id, knowledgeNodeId, subjectId, type, verifiedStatus, createdAt, updatedAt, syncedAt, *tags',
      review_states: 'cardId, nextReviewDate, lastReviewDate, reviewCount, lapseCount, syncedAt',
      review_records: 'id, cardId, reviewDate, result, reviewedAt, syncedAt',
      mistake_notes: 'id, knowledgeNodeId, createdAt, syncedAt'
    })

    this.knowledgeNodes = this.table('knowledge_nodes')
    this.memoryCards = this.table('memory_cards')
    this.reviewStates = this.table('review_states')
    this.reviewRecords = this.table('review_records')
    this.mistakeNotes = this.table('mistake_notes')
    this.appMeta = this.table('app_meta')
  }
}

export const db = new RecallDatabase()
