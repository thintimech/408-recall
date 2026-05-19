<script setup lang="ts">
import { computed } from 'vue'
import type { CardWithReviewState, ID, KnowledgeNode } from '@/types/domain'
import CardPreview from './CardPreview.vue'

const props = defineProps<{
  cards: CardWithReviewState[]
  nodes: KnowledgeNode[]
}>()

const emit = defineEmits<{
  edit: [item: CardWithReviewState]
  duplicate: [item: CardWithReviewState]
  archive: [item: CardWithReviewState]
  delete: [item: CardWithReviewState]
}>()

const nodeTitles = computed<Record<ID, string>>(() =>
  Object.fromEntries(props.nodes.map((node) => [node.id, node.title]))
)
</script>

<template>
  <div v-if="cards.length === 0" class="empty">还没有符合条件的卡片。</div>
  <ul v-else class="list">
    <li v-for="item in cards" :key="item.card.id">
      <CardPreview
        :card="item.card"
        :state="item.state"
        :knowledge-title="nodeTitles[item.card.knowledgeNodeId]"
      />
      <div class="actions" style="margin-top: 0.6rem">
        <button class="secondary" type="button" @click="emit('edit', item)">编辑</button>
        <button class="secondary" type="button" @click="emit('duplicate', item)">复制</button>
        <button class="secondary" type="button" @click="emit('archive', item)">
          {{ item.card.archived ? '取消归档' : '归档' }}
        </button>
        <button class="danger" type="button" @click="emit('delete', item)">删除</button>
      </div>
    </li>
  </ul>
</template>
