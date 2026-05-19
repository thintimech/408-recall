import { defineStore } from 'pinia'
import {
  createCardWithInitialState,
  deleteCardCascade,
  duplicateCard,
  getCard,
  listCards,
  setCardArchived,
  type CardFilters,
  updateCard
} from '@/db/repositories/cardRepository'
import { getKnowledgeNode } from '@/db/repositories/knowledgeRepository'
import { createInitialReviewState } from '@/services/reviewScheduler'
import { nowIso, todayLocalDate } from '@/services/dateService'
import type { CardWithReviewState, ID, MemoryCard } from '@/types/domain'
import type { CardFormModel } from '@/types/forms'
import { createId } from '@/utils/id'

function parseTags(tagsText: string): string[] {
  return tagsText
    .split(/[,，\s]+/)
    .map((tag) => tag.trim())
    .filter(Boolean)
}

export const useCardStore = defineStore('cards', {
  state: () => ({
    cards: [] as CardWithReviewState[],
    lastFilters: {} as CardFilters,
    loading: false,
    error: ''
  }),
  actions: {
    async load(filters?: CardFilters) {
      this.loading = true
      this.error = ''
      const activeFilters = filters ?? this.lastFilters
      this.lastFilters = activeFilters

      try {
        this.cards = await listCards(activeFilters)
      } catch (error) {
        this.error = error instanceof Error ? error.message : '卡片加载失败。'
      } finally {
        this.loading = false
      }
    },
    async getById(id: ID) {
      return getCard(id)
    },
    async createCard(form: CardFormModel) {
      if (!form.knowledgeNodeId) {
        throw new Error('卡片必须绑定知识点。')
      }

      const node = await getKnowledgeNode(form.knowledgeNodeId)
      if (!node) {
        throw new Error('绑定的知识点不存在。')
      }

      const now = nowIso()
      const today = todayLocalDate()
      const card: MemoryCard = {
        id: createId('card'),
        knowledgeNodeId: node.id,
        subjectId: node.subjectId,
        type: form.type,
        front: form.front.trim(),
        back: form.back.trim(),
        extra: form.extra.trim(),
        tags: parseTags(form.tagsText),
        verifiedStatus: form.verifiedStatus,
        archived: false,
        createdAt: now,
        updatedAt: now
      }

      await createCardWithInitialState(card, createInitialReviewState(card.id, today, now))
      await this.load()
      return card.id
    },
    async updateExistingCard(id: ID, form: CardFormModel) {
      if (!form.knowledgeNodeId) {
        throw new Error('卡片必须绑定知识点。')
      }

      const [existing, node] = await Promise.all([
        getCard(id),
        getKnowledgeNode(form.knowledgeNodeId)
      ])

      if (!existing) throw new Error('未找到要编辑的卡片。')
      if (!node) throw new Error('绑定的知识点不存在。')

      await updateCard({
        ...existing,
        knowledgeNodeId: node.id,
        subjectId: node.subjectId,
        type: form.type,
        front: form.front.trim(),
        back: form.back.trim(),
        extra: form.extra.trim(),
        tags: parseTags(form.tagsText),
        verifiedStatus: form.verifiedStatus,
        updatedAt: nowIso()
      })
      await this.load()
    },
    async duplicateExistingCard(id: ID) {
      await duplicateCard(id)
      await this.load()
    },
    async archiveCard(id: ID, archived: boolean) {
      await setCardArchived(id, archived)
      await this.load()
    },
    async removeCard(id: ID) {
      await deleteCardCascade(id)
      await this.load()
    }
  }
})
