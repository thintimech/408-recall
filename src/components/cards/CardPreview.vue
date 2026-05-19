<script setup lang="ts">
import type { MemoryCard } from '@/types/domain'

defineProps<{
  card: MemoryCard
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
    </div>
  </article>
</template>
