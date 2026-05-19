<script setup lang="ts">
import { computed } from 'vue'
import type { ID, KnowledgeNode } from '@/types/domain'

const props = defineProps<{
  nodes: KnowledgeNode[]
  cardCounts: Record<ID, number>
}>()

const emit = defineEmits<{
  edit: [node: KnowledgeNode]
  delete: [node: KnowledgeNode]
}>()

interface TreeRow {
  node: KnowledgeNode
  depth: number
}

const rows = computed(() => {
  const result: TreeRow[] = []

  function visit(parentId: ID | null, depth: number) {
    props.nodes
      .filter((node) => node.parentId === parentId)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .forEach((node) => {
        result.push({ node, depth })
        visit(node.id, depth + 1)
      })
  }

  visit(null, 0)
  return result
})
</script>

<template>
  <div class="tree">
    <div v-for="row in rows" :key="row.node.id" class="tree-row">
      <div :style="{ paddingLeft: `${row.depth * 1.25}rem` }">
        <strong>{{ row.node.title }}</strong>
        <span class="badge" style="margin-left: 0.5rem">
          {{ cardCounts[row.node.id] || 0 }} 张卡片
        </span>
        <p v-if="row.node.description" class="muted" style="margin: 0.35rem 0 0">
          {{ row.node.description }}
        </p>
      </div>
      <div class="actions">
        <button class="secondary" type="button" @click="emit('edit', row.node)">编辑</button>
        <button class="danger" type="button" @click="emit('delete', row.node)">删除</button>
      </div>
    </div>
  </div>
</template>
