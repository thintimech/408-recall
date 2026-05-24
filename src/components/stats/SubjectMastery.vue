<script setup lang="ts">
import type { SubjectMasteryData } from '@/services/statsService'

defineProps<{
  data: SubjectMasteryData[]
}>()

function barColor(rate: number): string {
  if (rate >= 80) return 'var(--accent)'
  if (rate >= 60) return 'var(--warning)'
  return 'var(--danger)'
}
</script>

<template>
  <div class="mastery-list">
    <div v-for="item in data" :key="item.subjectId" class="mastery-item">
      <div class="mastery-header">
        <span>{{ item.title }}</span>
        <span :style="{ color: barColor(item.rate) }">
          <strong>{{ item.rate }}%</strong>
          <span class="muted"> ({{ item.mastered }}/{{ item.total }})</span>
        </span>
      </div>
      <div class="mastery-bar-bg">
        <div
          class="mastery-bar-fill"
          :style="{ width: item.rate + '%', background: barColor(item.rate) }"
        />
      </div>
      <span v-if="item.rate < 60 && item.total > 0" class="mastery-weak">薄弱科目</span>
    </div>
    <div v-if="data.every((d) => d.total === 0)" class="empty">
      还没有复习记录，完成复习后这里会显示掌握率。
    </div>
  </div>
</template>
