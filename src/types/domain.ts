export type ID = string

export type ISODateString = string
export type ISODateTimeString = string

export type CardType =
  | 'CONCEPT'
  | 'COMPARE'
  | 'CLOZE'
  | 'PROCESS'
  | 'FORMULA'
  | 'MISTAKE'
  | 'BIG_QUESTION'
  | 'METHOD'
  | 'THEOREM'

export type VerifiedStatus = 'UNVERIFIED' | 'VERIFIED' | 'DOUBTFUL'

export type ReviewResult = 'FORGOT' | 'HARD' | 'GOOD' | 'EASY'

export interface KnowledgeNode {
  id: ID
  subjectId: ID
  parentId: ID | null
  title: string
  level: number
  sortOrder: number
  description?: string
  createdAt: ISODateTimeString
  updatedAt: ISODateTimeString
}

export interface MemoryCard {
  id: ID
  knowledgeNodeId: ID
  subjectId: ID
  type: CardType
  front: string
  back: string
  extra?: string
  tags: string[]
  verifiedStatus: VerifiedStatus
  archived?: boolean
  createdAt: ISODateTimeString
  updatedAt: ISODateTimeString
}

export interface ReviewState {
  cardId: ID
  lastReviewDate: ISODateString | null
  nextReviewDate: ISODateString
  intervalDays: number
  easeFactor: number
  reviewCount: number
  lapseCount: number
  updatedAt: ISODateTimeString
}

export interface ReviewRecord {
  id: ID
  cardId: ID
  reviewedAt: ISODateTimeString
  reviewDate: ISODateString
  result: ReviewResult
  previousIntervalDays: number
  nextIntervalDays: number
  previousNextReviewDate: ISODateString
  nextReviewDate: ISODateString
}

export interface AppMeta {
  key: string
  value: unknown
  updatedAt: ISODateTimeString
}

export interface DueReviewItem {
  card: MemoryCard
  state: ReviewState
}

export interface CardWithReviewState {
  card: MemoryCard
  state?: ReviewState
}

export interface RecentReviewCard {
  card: MemoryCard
  record: ReviewRecord
}

export interface DueCountByDate {
  date: ISODateString
  count: number
}

export interface MistakeNote {
  id: ID
  knowledgeNodeId: ID
  source: string
  summary: string
  reason?: string
  relatedCardIds: ID[]
  createdAt: ISODateTimeString
  updatedAt: ISODateTimeString
}

export interface Insight {
  id: ID
  knowledgeNodeId: ID | null
  title: string
  content: string
  relatedCardIds: ID[]
  createdAt: ISODateTimeString
  updatedAt: ISODateTimeString
}
