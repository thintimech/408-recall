<script setup lang="ts">
import { computed } from 'vue'
import type { ID, KnowledgeNode, MemoryCard } from '@/types/domain'
import CardPreview from './CardPreview.vue'

const props = defineProps<{
  cards: MemoryCard[]
  nodes: KnowledgeNode[]
}>()

const emit = defineEmits<{
  edit: [card: MemoryCard]
  delete: [card: MemoryCard]
}>()

const nodeTitles = computed<Record<ID, string>>(() =>
  Object.fromEntries(props.nodes.map((node) => [node.id, node.title]))
)
</script>

<template>
  <div v-if="cards.length === 0" class="empty">还没有符合条件的卡片。</div>
  <ul v-else class="list">
    <li v-for="card in cards" :key="card.id">
      <CardPreview :card="card" :knowledge-title="nodeTitles[card.knowledgeNodeId]" />
      <div class="actions" style="margin-top: 0.6rem">
        <button class="secondary" type="button" @click="emit('edit', card)">编辑</button>
        <button class="danger" type="button" @click="emit('delete', card)">删除</button>
      </div>
    </li>
  </ul>
</template>
