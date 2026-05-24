<script setup lang="ts">
import { computed } from 'vue'
import type { CardWithReviewState, ID, KnowledgeNode } from '@/types/domain'
import MarkdownContent from '@/components/common/MarkdownContent.vue'

const props = defineProps<{
  cards: CardWithReviewState[]
  nodes: KnowledgeNode[]
  batchMode?: boolean
  selectedIds?: Set<ID>
}>()

const emit = defineEmits<{
  edit: [item: CardWithReviewState]
  duplicate: [item: CardWithReviewState]
  archive: [item: CardWithReviewState]
  delete: [item: CardWithReviewState]
  toggleSelect: [id: ID]
}>()

const nodeTitles = computed<Record<ID, string>>(() =>
  Object.fromEntries(props.nodes.map((node) => [node.id, node.title]))
)
</script>

<template>
  <div v-if="cards.length === 0" class="empty">还没有符合条件的卡片。</div>
  <div v-else class="card-grid">
    <article
      v-for="item in cards"
      :key="item.card.id"
      class="card-item"
      :class="{ selected: batchMode && selectedIds?.has(item.card.id) }"
      @click="batchMode ? emit('toggleSelect', item.card.id) : emit('edit', item)"
    >
      <div class="card-item-header">
        <span class="badge">{{ item.card.type }}</span>
        <span class="card-item-node">{{ nodeTitles[item.card.knowledgeNodeId] || '' }}</span>
      </div>
      <div class="card-item-front">
        <MarkdownContent :content="item.card.front" />
      </div>
      <div class="card-item-back">
        <MarkdownContent :content="item.card.back" />
      </div>
      <div class="card-item-footer">
        <span v-if="item.state" class="muted">{{ item.state.nextReviewDate }}</span>
        <span v-if="item.card.archived" class="badge error">已掌握</span>
        <div v-if="!batchMode" class="card-item-actions" @click.stop>
          <button class="ghost" type="button" @click="emit('duplicate', item)">复制</button>
          <button class="ghost" type="button" @click="emit('archive', item)">
            {{ item.card.archived ? '继续学习' : '标记已掌握' }}
          </button>
          <button class="ghost" type="button" style="color: var(--error)" @click="emit('delete', item)">删除</button>
        </div>
      </div>
      <input
        v-if="batchMode"
        type="checkbox"
        class="card-item-checkbox"
        :checked="selectedIds?.has(item.card.id)"
        @click.stop
        @change="emit('toggleSelect', item.card.id)"
      />
    </article>
  </div>
</template>

<style scoped>
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 0.75rem;
}

.card-item {
  position: relative;
  border: 1px solid var(--outline);
  border-radius: var(--radius-lg);
  padding: 1rem;
  background: var(--surface-container-low);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  transition: border-color var(--transition-fast), background var(--transition-fast);
}

.card-item:hover {
  border-color: var(--outline-hover);
  background: var(--surface-container);
}

.card-item.selected {
  border-color: var(--primary);
  background: var(--primary-muted);
}

.card-item-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.card-item-node {
  font-size: 0.75rem;
  color: var(--on-surface-dim);
  margin-left: auto;
}

.card-item-front {
  font-size: 0.9rem;
  font-weight: 500;
  line-height: 1.5;
  max-height: 3.5rem;
  overflow: hidden;
}

.card-item-back {
  font-size: 0.8rem;
  color: var(--on-surface-variant);
  line-height: 1.5;
  max-height: 2.5rem;
  overflow: hidden;
}

.card-item-footer {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: auto;
  padding-top: 0.5rem;
  border-top: 1px solid var(--outline);
  font-size: 0.75rem;
}

.card-item-actions {
  display: flex;
  gap: 0.25rem;
  margin-left: auto;
}

.card-item-actions button {
  font-size: 0.72rem;
  padding: 0.25rem 0.5rem;
}

.card-item-checkbox {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  width: auto;
}
</style>
