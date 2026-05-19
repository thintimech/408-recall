import { defineStore } from 'pinia'
import {
  addKnowledgeNode,
  countCardsByKnowledgeNode,
  deleteKnowledgeNode,
  getKnowledgeNode,
  listKnowledgeNodes,
  updateKnowledgeNode
} from '@/db/repositories/knowledgeRepository'
import type { ID, KnowledgeNode } from '@/types/domain'
import type { KnowledgeNodeFormModel } from '@/types/forms'
import { nowIso } from '@/services/dateService'
import { createId } from '@/utils/id'

export const useKnowledgeStore = defineStore('knowledge', {
  state: () => ({
    nodes: [] as KnowledgeNode[],
    cardCounts: {} as Record<ID, number>,
    loading: false,
    error: ''
  }),
  getters: {
    subjects: (state) => state.nodes.filter((node) => node.level === 0),
    selectableNodes: (state) => state.nodes.filter((node) => node.level > 0)
  },
  actions: {
    async load() {
      this.loading = true
      this.error = ''

      try {
        const [nodes, counts] = await Promise.all([
          listKnowledgeNodes(),
          countCardsByKnowledgeNode()
        ])
        this.nodes = nodes
        this.cardCounts = counts
      } catch (error) {
        this.error = error instanceof Error ? error.message : '知识点加载失败。'
      } finally {
        this.loading = false
      }
    },
    async createNode(form: KnowledgeNodeFormModel) {
      const parent = form.parentId ? await getKnowledgeNode(form.parentId) : undefined
      const id = createId('node')
      const siblings = this.nodes.filter((node) => node.parentId === form.parentId)
      const now = nowIso()
      const node: KnowledgeNode = {
        id,
        subjectId: parent ? parent.subjectId : id,
        parentId: form.parentId,
        title: form.title.trim(),
        level: parent ? parent.level + 1 : 0,
        sortOrder: siblings.length + 1,
        description: form.description.trim(),
        createdAt: now,
        updatedAt: now
      }

      await addKnowledgeNode(node)
      await this.load()
    },
    async updateNode(id: ID, patch: Pick<KnowledgeNodeFormModel, 'title' | 'description'>) {
      const node = this.nodes.find((item) => item.id === id)
      if (!node) throw new Error('未找到要编辑的知识点。')

      await updateKnowledgeNode({
        ...node,
        title: patch.title.trim(),
        description: patch.description.trim()
      })
      await this.load()
    },
    async removeNode(id: ID) {
      await deleteKnowledgeNode(id)
      await this.load()
    }
  }
})
