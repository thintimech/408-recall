<script setup lang="ts">
import type { MemoryCard, ReviewState } from '@/types/domain'

defineProps<{
  card: MemoryCard
  state?: ReviewState
  knowledgeTitle?: string
}>()
</script>

<template>
  <article class="list-item">
    <div class="actions" style="justify-content: space-between">
      <span class="badge">{{ card.type }}</span>
      <span class="muted">{{ knowledgeTitle || '未命名知识点' }}</span>
    </div>
    <h3 style="margin: 0.8rem 0 0.5rem">{{ card.front }}</h3>
    <p class="muted" style="white-space: pre-wrap">{{ card.back }}</p>
    <div class="actions">
      <span v-for="tag in card.tags" :key="tag" class="badge">{{ tag }}</span>
      <span class="badge">{{ card.verifiedStatus }}</span>
      <span class="badge">{{ card.archived ? '已归档' : '未归档' }}</span>
      <span class="badge">下次复习：{{ state?.nextReviewDate || '无状态' }}</span>
    </div>
  </article>
</template>
