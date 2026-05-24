<script setup lang="ts">
import type { DueReviewItem } from '@/types/domain'
import MarkdownContent from '@/components/common/MarkdownContent.vue'

defineProps<{
  item: DueReviewItem
  answerVisible: boolean
}>()

const emit = defineEmits<{
  reveal: []
}>()
</script>

<template>
  <section class="panel review-card" @click="!answerVisible && emit('reveal')">
    <span class="badge" style="justify-self: start">{{ item.card.type }}</span>

    <div class="review-front">
      <MarkdownContent :content="item.card.front" />
    </div>

    <p v-if="!answerVisible" class="reveal-hint">点击或按空格显示答案</p>

    <div v-else class="review-answer">
      <div class="review-back">
        <MarkdownContent :content="item.card.back" />
      </div>
      <div v-if="item.card.extra" class="review-extra">
        <MarkdownContent :content="item.card.extra" />
      </div>
    </div>
  </section>
</template>

<style scoped>
.review-card {
  cursor: pointer;
}

.reveal-hint {
  margin: 0;
  font-size: 0.82rem;
  color: var(--on-surface-dim);
  transition: color var(--transition-fast);
}

.review-card:hover .reveal-hint {
  color: var(--on-surface-variant);
}

.review-answer {
  border-top: 1px solid var(--outline);
  padding-top: 1.25rem;
  animation: fade-in 0.25s ease;
}

.review-extra {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--outline);
}

@keyframes fade-in {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
