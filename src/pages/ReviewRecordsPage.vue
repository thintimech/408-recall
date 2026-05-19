<script setup lang="ts">
import { onMounted, reactive } from 'vue'
import { RouterLink } from 'vue-router'
import { useReviewStore } from '@/stores/reviewStore'
import type { ReviewResult } from '@/types/domain'

const store = useReviewStore()
const filters = reactive<{
  reviewDate: string
  result: '' | ReviewResult
}>({
  reviewDate: '',
  result: ''
})

const resultLabels: Record<ReviewResult, string> = {
  FORGOT: '忘了',
  HARD: '困难',
  GOOD: '记得',
  EASY: '熟练'
}

async function load() {
  await store.loadRecords({
    reviewDate: filters.reviewDate || undefined,
    result: filters.result || undefined
  })
}

onMounted(() => {
  void load()
})
</script>

<template>
  <section class="page">
    <header class="page-header">
      <div>
        <h1 class="page-title">复习记录</h1>
        <p class="page-subtitle">用于回看最近的遗忘和困难内容。</p>
      </div>
    </header>

    <section class="panel" style="margin-bottom: 1rem">
      <div class="filters">
        <label>
          日期
          <input v-model="filters.reviewDate" type="date" />
        </label>
        <label>
          结果
          <select v-model="filters.result">
            <option value="">全部结果</option>
            <option v-for="(label, result) in resultLabels" :key="result" :value="result">
              {{ label }}
            </option>
          </select>
        </label>
        <div class="actions" style="align-self: end">
          <button type="button" @click="load">筛选</button>
        </div>
      </div>
    </section>

    <div v-if="store.records.length === 0" class="empty">暂无复习记录。</div>
    <ul v-else class="list">
      <li v-for="record in store.records" :key="record.id" class="list-item">
        <div class="actions" style="justify-content: space-between">
          <strong>{{ resultLabels[record.result] }}</strong>
          <span class="muted">{{ record.reviewedAt }}</span>
        </div>
        <p class="muted">
          间隔：{{ record.previousIntervalDays }} 天 → {{ record.nextIntervalDays }} 天，
          下次复习：{{ record.nextReviewDate }}
        </p>
        <RouterLink :to="`/cards/${record.cardId}/edit`">
          <button class="secondary" type="button">查看卡片</button>
        </RouterLink>
      </li>
    </ul>
  </section>
</template>
