<script setup lang="ts">
import type { DueReviewItem } from '@/types/domain'

defineProps<{
  item: DueReviewItem
  answerVisible: boolean
}>()

const emit = defineEmits<{
  reveal: []
}>()
</script>

<template>
  <section class="panel review-card">
    <span class="badge">{{ item.card.type }}</span>
    <div class="review-front">{{ item.card.front }}</div>

    <button v-if="!answerVisible" type="button" @click="emit('reveal')">显示答案</button>

    <div v-else class="review-back">
      <strong>答案</strong>
      <p>{{ item.card.back }}</p>
      <template v-if="item.card.extra">
        <strong>补充</strong>
        <p>{{ item.card.extra }}</p>
      </template>
    </div>
  </section>
</template>
