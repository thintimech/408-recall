import type { CardType, ID, VerifiedStatus } from './domain'

export interface CardFormModel {
  knowledgeNodeId: ID | null
  type: CardType
  front: string
  back: string
  extra: string
  tagsText: string
  verifiedStatus: VerifiedStatus
}

export interface KnowledgeNodeFormModel {
  parentId: ID | null
  subjectId: ID
  title: string
  description: string
}
