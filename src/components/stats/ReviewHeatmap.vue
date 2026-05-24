<script setup lang="ts">
import { computed } from 'vue'
import type { HeatmapDay } from '@/services/statsService'

const props = defineProps<{
  data: HeatmapDay[]
}>()

const weeks = computed(() => {
  const result: HeatmapDay[][] = []
  let week: HeatmapDay[] = []

  if (props.data.length === 0) return result

  const firstDate = new Date(props.data[0].date + 'T00:00:00')
  const startPadding = firstDate.getDay()
  for (let i = 0; i < startPadding; i++) {
    week.push({ date: '', count: -1 })
  }

  for (const day of props.data) {
    week.push(day)
    if (week.length === 7) {
      result.push(week)
      week = []
    }
  }
  if (week.length > 0) result.push(week)
  return result
})

const maxCount = computed(() => Math.max(1, ...props.data.map((d) => d.count)))

function colorLevel(count: number): string {
  if (count <= 0) return 'var(--heatmap-0)'
  const ratio = count / maxCount.value
  if (ratio <= 0.25) return 'var(--heatmap-1)'
  if (ratio <= 0.5) return 'var(--heatmap-2)'
  if (ratio <= 0.75) return 'var(--heatmap-3)'
  return 'var(--heatmap-4)'
}

const totalReviews = computed(() => props.data.reduce((sum, d) => sum + Math.max(0, d.count), 0))
const activeDays = computed(() => props.data.filter((d) => d.count > 0).length)
</script>

<template>
  <div class="heatmap-container">
    <div class="heatmap-summary">
      <span>过去 {{ data.length }} 天：共复习 <strong>{{ totalReviews }}</strong> 次，活跃 <strong>{{ activeDays }}</strong> 天</span>
    </div>
    <div class="heatmap-grid">
      <div v-for="(week, wi) in weeks" :key="wi" class="heatmap-week">
        <div
          v-for="(day, di) in week"
          :key="di"
          class="heatmap-cell"
          :style="{ background: day.count < 0 ? 'transparent' : colorLevel(day.count) }"
          :title="day.date ? `${day.date}: ${day.count} 次` : ''"
        />
      </div>
    </div>
    <div class="heatmap-legend">
      <span class="muted">少</span>
      <div class="heatmap-cell" style="background: var(--heatmap-0)" />
      <div class="heatmap-cell" style="background: var(--heatmap-1)" />
      <div class="heatmap-cell" style="background: var(--heatmap-2)" />
      <div class="heatmap-cell" style="background: var(--heatmap-3)" />
      <div class="heatmap-cell" style="background: var(--heatmap-4)" />
      <span class="muted">多</span>
    </div>
  </div>
</template>
