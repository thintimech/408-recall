<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import ReviewHeatmap from '@/components/stats/ReviewHeatmap.vue'
import SubjectMastery from '@/components/stats/SubjectMastery.vue'
import LapseAnalysis from '@/components/review/LapseAnalysis.vue'
import MarkdownContent from '@/components/common/MarkdownContent.vue'
import {
  computeHeatmap,
  computeSubjectMastery,
  computeDailyReviewCounts,
  computeWeakCards,
  computeStaleCards,
  computeOverallStats,
  computeDiagnosisData,
  type HeatmapDay,
  type SubjectMasteryData,
  type DailyReviewCount,
  type WeakCard
} from '@/services/statsService'
import { chatCompletionStream } from '@/services/llmService'

const heatmapData = ref<HeatmapDay[]>([])
const masteryData = ref<SubjectMasteryData[]>([])
const dailyCounts = ref<DailyReviewCount[]>([])
const weakCards = ref<WeakCard[]>([])
const staleCards = ref<WeakCard[]>([])
const overall = ref({ totalReviews: 0, todayReviews: 0, resultCounts: { FORGOT: 0, HARD: 0, GOOD: 0, EASY: 0 }, totalCards: 0, dueToday: 0 })

onMounted(async () => {
  const [h, m, d, w, s, o] = await Promise.all([
    computeHeatmap(90),
    computeSubjectMastery(),
    computeDailyReviewCounts(30),
    computeWeakCards(10),
    computeStaleCards(30, 10),
    computeOverallStats()
  ])
  heatmapData.value = h
  masteryData.value = m
  dailyCounts.value = d
  weakCards.value = w
  staleCards.value = s
  overall.value = o
})

const maxDaily = () => Math.max(1, ...dailyCounts.value.map((d) => d.count))

const diagnosing = ref(false)
const diagnosisResult = ref('')
const diagnosisError = ref('')
let abortController: AbortController | null = null

onBeforeUnmount(() => {
  abortController?.abort()
})

const DIAGNOSIS_PROMPT = `你是 408 考研学习诊断助手。根据用户的复习数据，给出以下分析：

## 薄弱点分析
指出哪些知识点/科目是薄弱环节，分析可能的原因（如概念混淆、缺少练习、间隔太长等），给出针对性建议。

## 趋势判断
对比近 7 天和前 7 天的数据，判断学习状态是上升还是下滑，复习节奏是否合理，是否需要调整。

要求：简洁直接，每个部分 3-5 句话。用 Markdown 格式。`

async function runDiagnosis() {
  diagnosing.value = true
  diagnosisResult.value = ''
  diagnosisError.value = ''

  try {
    const data = await computeDiagnosisData()
    abortController = new AbortController()
    await chatCompletionStream(
      [
        { role: 'system', content: DIAGNOSIS_PROMPT },
        { role: 'user', content: data.summary }
      ],
      (chunk) => { diagnosisResult.value += chunk },
      undefined,
      abortController.signal
    )
  } catch (e) {
    diagnosisError.value = e instanceof Error ? e.message : '诊断失败。'
  } finally {
    diagnosing.value = false
  }
}
</script>

<template>
  <section class="page">
    <header class="page-header">
      <div>
        <p class="page-eyebrow">Analytics</p>
        <h1 class="page-title">学习统计</h1>
        <p class="page-subtitle">数据驱动复习，识别薄弱环节。</p>
      </div>
      <button class="secondary" type="button" :disabled="diagnosing" @click="runDiagnosis">
        {{ diagnosing ? '分析中…' : 'AI 诊断' }}
      </button>
    </header>

    <!-- Overview Stats -->
    <div class="grid four">
      <article class="panel stat">
        <span class="muted">总复习次数</span>
        <strong>{{ overall.totalReviews }}</strong>
      </article>
      <article class="panel stat">
        <span class="muted">今日复习</span>
        <strong>{{ overall.todayReviews }}</strong>
      </article>
      <article class="panel stat">
        <span class="muted">卡片总数</span>
        <strong>{{ overall.totalCards }}</strong>
      </article>
      <article class="panel stat">
        <span class="muted">今日待复习</span>
        <strong>{{ overall.dueToday }}</strong>
      </article>
    </div>

    <!-- Heatmap -->
    <section class="panel" style="margin-top: 1rem">
      <h2>复习热力图</h2>
      <ReviewHeatmap :data="heatmapData" />
    </section>

    <!-- Mastery + Daily Chart -->
    <div class="grid two" style="margin-top: 1rem">
      <section class="panel">
        <h2>科目掌握率</h2>
        <SubjectMastery :data="masteryData" />
      </section>

      <section class="panel">
        <h2>过去 30 天复习量</h2>
        <div class="daily-chart">
          <div
            v-for="day in dailyCounts"
            :key="day.date"
            class="daily-bar"
            :style="{ height: (day.count / maxDaily()) * 100 + '%' }"
            :title="`${day.date}: ${day.count} 次`"
          />
        </div>
      </section>
    </div>

    <!-- Weak + Stale Cards -->
    <div class="grid two" style="margin-top: 1rem">
      <section class="panel">
        <h2>高遗忘卡片</h2>
        <div v-if="weakCards.length === 0" class="empty">暂无高遗忘卡片。</div>
        <ul v-else class="list">
          <li v-for="card in weakCards" :key="card.cardId" class="list-item">
            <div style="display: flex; justify-content: space-between; align-items: center">
              <RouterLink :to="`/cards/${card.cardId}/edit`" style="flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap">
                {{ card.front }}
              </RouterLink>
              <span class="badge error">{{ card.lapseCount }} 次</span>
            </div>
            <LapseAnalysis :card-id="card.cardId" :card-front="card.front" :lapse-count="card.lapseCount" />
          </li>
        </ul>
      </section>

      <section class="panel">
        <h2>长期未复习</h2>
        <div v-if="staleCards.length === 0" class="empty">暂无长期未复习卡片。</div>
        <ul v-else class="list">
          <li v-for="card in staleCards" :key="card.cardId" class="list-item" style="display: flex; justify-content: space-between; align-items: center">
            <RouterLink :to="`/cards/${card.cardId}/edit`" style="flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap">
              {{ card.front }}
            </RouterLink>
            <span class="muted" style="font-size: 0.75rem; white-space: nowrap">{{ card.lastReviewDate || '从未' }}</span>
          </li>
        </ul>
      </section>
    </div>

    <!-- AI Diagnosis Result -->
    <section v-if="diagnosisResult || diagnosisError" class="panel" style="margin-top: 1rem">
      <h2>AI 学习诊断</h2>
      <p v-if="diagnosisError" style="color: var(--error)">{{ diagnosisError }}</p>
      <div v-if="diagnosisResult">
        <MarkdownContent :content="diagnosisResult" />
      </div>
    </section>
  </section>
</template>
