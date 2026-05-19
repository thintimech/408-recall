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
