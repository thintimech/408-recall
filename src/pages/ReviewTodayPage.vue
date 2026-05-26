<script setup lang="ts">
import { computed, inject, onBeforeUnmount, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import ReviewCard from '@/components/review/ReviewCard.vue'
import DeepModeProbe from '@/components/review/DeepModeProbe.vue'
import { useAppStore } from '@/stores/appStore'
import { useKnowledgeStore } from '@/stores/knowledgeStore'
import { useReviewStore } from '@/stores/reviewStore'
import type { ReviewResult } from '@/types/domain'

const reviewStore = useReviewStore()
const appStore = useAppStore()
const knowledgeStore = useKnowledgeStore()
const answerVisible = ref(false)
const selectedSubject = ref('')
const submitting = ref(false)
const deepMode = ref(localStorage.getItem('408-recall-deep-mode') === 'true')
const showProbe = ref(false)
const probeCardFront = ref('')
const probeCardBack = ref('')
const probeNodeTitle = ref('')
const openChat = inject<(context: string) => void>('openChat')!

const resultLabels: Record<ReviewResult, string> = {
  FORGOT: '忘了',
  HARD: '困难',
  GOOD: '记得',
  EASY: '熟练'
}

const resultButtons: Array<{ value: ReviewResult; label: string; interval: string; color: string }> = [
  { value: 'FORGOT', label: '忘了', interval: '< 10m', color: 'var(--error)' },
  { value: 'HARD', label: '困难', interval: '2d', color: 'var(--warning)' },
  { value: 'GOOD', label: '记得', interval: '4d', color: 'var(--primary)' },
  { value: 'EASY', label: '熟练', interval: '7d', color: 'var(--on-surface-variant)' }
]

const subjectTitles = computed(() =>
  Object.fromEntries(knowledgeStore.subjects.map((subject) => [subject.id, subject.title]))
)

const hasSummary = computed(() => reviewStore.completedThisSession > 0)

const progressPercent = computed(() => {
  if (reviewStore.totalForProgress === 0) return 0
  return Math.round((reviewStore.currentPosition / reviewStore.totalForProgress) * 100)
})

onMounted(async () => {
  await Promise.all([reviewStore.loadDue(), knowledgeStore.load()])
  window.addEventListener('keydown', handleKeydown)
})

async function switchSubject(subjectId: string) {
  selectedSubject.value = subjectId
  answerVisible.value = false
  await reviewStore.loadDue(subjectId || undefined)
}

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
})

function shouldIgnoreShortcut(event: KeyboardEvent): boolean {
  const target = event.target as HTMLElement | null
  if (!target) return false
  return ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable
}

async function answer(result: ReviewResult) {
  if (!answerVisible.value || submitting.value) return
  const item = reviewStore.currentItem
  if (!item) return

  const shouldProbe = deepMode.value && (result === 'GOOD' || result === 'EASY')

  submitting.value = true
  try {
    if (shouldProbe) {
      probeCardFront.value = item.card.front
      probeCardBack.value = item.card.back
      const node = knowledgeStore.nodes.find((n) => n.id === item.card.knowledgeNodeId)
      probeNodeTitle.value = node?.title || ''
    }
    await reviewStore.answerCurrent(result)
    answerVisible.value = false
    await appStore.refreshDashboard()
    void appStore.markStudyDay()
    if (shouldProbe) {
      showProbe.value = true
    }
  } finally {
    submitting.value = false
  }
}

function toggleDeepMode() {
  deepMode.value = !deepMode.value
  localStorage.setItem('408-recall-deep-mode', String(deepMode.value))
}

function dismissProbe() {
  showProbe.value = false
}

async function undoLast() {
  await reviewStore.undoLastReview()
  answerVisible.value = false
  await appStore.refreshDashboard()
}

function skipCurrent() {
  reviewStore.skipCurrent()
  answerVisible.value = false
}

function revealAnswer() {
  if (reviewStore.currentItem) {
    answerVisible.value = true
  }
}

function askAi() {
  const item = reviewStore.currentItem
  if (!item) return
  const node = knowledgeStore.nodes.find((n) => n.id === item.card.knowledgeNodeId)
  const parts = [
    `卡片类型：${item.card.type}`,
    `知识点：${node?.title || '未知'}`,
    `正面：${item.card.front}`
  ]
  if (answerVisible.value) {
    parts.push(`背面：${item.card.back}`)
  }
  if (item.card.extra) {
    parts.push(`补充：${item.card.extra}`)
  }
  openChat(parts.join('\n'))
}

function handleKeydown(event: KeyboardEvent) {
  if (shouldIgnoreShortcut(event)) return
  if (showProbe.value) return

  const key = event.key.toLowerCase()
  if (event.code === 'Space') {
    event.preventDefault()
    revealAnswer()
    return
  }

  const resultByKey: Record<string, ReviewResult> = {
    '1': 'FORGOT',
    '2': 'HARD',
    '3': 'GOOD',
    '4': 'EASY'
  }

  if (resultByKey[key]) {
    event.preventDefault()
    void answer(resultByKey[key])
    return
  }

  if (key === 'z') {
    event.preventDefault()
    void undoLast()
    return
  }

  if (key === 's') {
    event.preventDefault()
    skipCurrent()
  }
}
</script>

<template>
  <!-- Immersive Review Mode -->
  <section v-if="reviewStore.currentItem" class="review-immersive">
    <!-- Top Progress Bar -->
    <div class="review-topbar">
      <div class="review-topbar-row">
        <div class="review-subject-filter">
          <button
            class="subject-chip"
            :class="{ active: !selectedSubject }"
            type="button"
            @click="switchSubject('')"
          >全部</button>
          <button
            v-for="subject in knowledgeStore.subjects"
            :key="subject.id"
            class="subject-chip"
            :class="{ active: selectedSubject === subject.id }"
            type="button"
            @click="switchSubject(subject.id)"
          >{{ subject.title }}</button>
        </div>
        <span class="muted">{{ reviewStore.currentPosition }} / {{ reviewStore.totalForProgress }}</span>
      </div>
      <div class="review-progress-track">
        <div class="review-progress-fill" :style="{ width: progressPercent + '%' }" />
      </div>
    </div>

    <!-- Center Card -->
    <div class="review-stage">
      <DeepModeProbe
        v-if="showProbe"
        :card-front="probeCardFront"
        :card-back="probeCardBack"
        :knowledge-node-title="probeNodeTitle"
        @done="dismissProbe"
      />
      <ReviewCard
        v-else
        :item="reviewStore.currentItem"
        :answer-visible="answerVisible"
        @reveal="revealAnswer"
      />
    </div>

    <!-- Bottom Action Bar -->
    <div class="review-action-bar">
      <div class="review-actions-secondary">
        <button class="ghost" type="button" :disabled="!reviewStore.canUndo" @click="undoLast">撤销</button>
        <button class="ghost" type="button" @click="skipCurrent">跳过</button>
        <button class="ghost" type="button" @click="askAi">问 AI</button>
        <button
          class="ghost"
          type="button"
          :style="deepMode ? 'color: var(--primary)' : ''"
          @click="toggleDeepMode"
        >{{ deepMode ? '深度 ✓' : '深度' }}</button>
      </div>
      <div class="review-rating-buttons">
        <button
          v-for="btn in resultButtons"
          :key="btn.value"
          class="rating-btn"
          type="button"
          :disabled="!answerVisible || submitting"
          @click="answer(btn.value)"
        >
          <span class="rating-label">{{ btn.label }}</span>
          <span class="rating-interval">{{ btn.interval }}</span>
        </button>
      </div>
    </div>
  </section>

  <!-- Completion / Empty State -->
  <section v-else class="page">
    <header class="page-header">
      <div>
        <p class="page-eyebrow">{{ hasSummary ? 'Session Complete' : 'Daily Review' }}</p>
        <h1 class="page-title">{{ hasSummary ? '复习完成' : '今日复习' }}</h1>
        <p class="page-subtitle">
          {{ hasSummary ? '本轮复习结果已保存。' : '今天没有到期卡片，新建卡片后会自动进入复习。' }}
        </p>
      </div>
    </header>

    <template v-if="hasSummary">
      <div class="grid three">
        <article class="panel stat">
          <span class="muted">本次复习</span>
          <strong>{{ reviewStore.completedThisSession }}</strong>
        </article>
        <article class="panel stat">
          <span class="muted">弱项数量</span>
          <strong>{{ reviewStore.sessionResults.FORGOT + reviewStore.sessionResults.HARD }}</strong>
        </article>
        <article class="panel stat">
          <span class="muted">剩余卡片</span>
          <strong>{{ reviewStore.remainingCount }}</strong>
        </article>
      </div>

      <div class="grid two" style="margin-top: 1rem">
        <section class="panel">
          <h2>结果分布</h2>
          <div class="grid two">
            <article v-for="(label, result) in resultLabels" :key="result" class="list-item">
              <span class="muted">{{ label }}</span>
              <strong style="display: block; font-size: 1.5rem">
                {{ reviewStore.sessionResults[result] }}
              </strong>
            </article>
          </div>
        </section>

        <section class="panel">
          <h2>科目分布</h2>
          <ul class="list">
            <li
              v-for="[subjectId, count] in Object.entries(reviewStore.subjectDistribution)"
              :key="subjectId"
              class="list-item"
              style="display: flex; justify-content: space-between; align-items: center"
            >
              <span>{{ subjectTitles[subjectId] || subjectId }}</span>
              <span class="badge">{{ count }} 张</span>
            </li>
          </ul>
        </section>
      </div>

      <section class="panel" style="margin-top: 1rem">
        <h2>弱项卡片</h2>
        <div v-if="reviewStore.weakCards.length === 0" class="empty">本轮没有弱项卡片。</div>
        <ul v-else class="list">
          <li v-for="card in reviewStore.weakCards" :key="card.id" class="list-item">
            <RouterLink :to="`/cards/${card.id}/edit`">
              <strong>{{ card.front }}</strong>
            </RouterLink>
            <p class="muted" style="margin: 0.3rem 0 0">{{ card.back }}</p>
          </li>
        </ul>
      </section>

      <div class="actions" style="margin-top: 1.5rem">
        <RouterLink to="/">
          <button type="button">返回首页</button>
        </RouterLink>
        <RouterLink to="/cards">
          <button class="secondary" type="button">查看卡片</button>
        </RouterLink>
      </div>
    </template>
  </section>
</template>

<style scoped>
.review-immersive {
  display: flex;
  flex-direction: column;
  height: calc(100vh - var(--topbar-height));
  margin: calc(-1 * 1.5rem) -2rem -2rem;
  padding: 0;
}

.review-topbar {
  padding: 0.75rem 2rem;
  border-bottom: 1px solid var(--outline);
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.review-topbar-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.review-subject-filter {
  display: flex;
  gap: 0.35rem;
  flex-wrap: wrap;
}

.subject-chip {
  padding: 0.3rem 0.65rem;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 500;
  background: var(--surface-container);
  color: var(--on-surface-variant);
  border: 1px solid var(--outline);
}

.subject-chip:hover:not(:disabled) {
  background: var(--surface-container-high);
  box-shadow: none;
}

.subject-chip.active {
  background: var(--primary-muted);
  color: var(--primary);
  border-color: var(--primary);
}

.review-progress-track {
  height: 4px;
  border-radius: var(--radius-full);
  background: var(--surface-container-high);
  overflow: hidden;
}

.review-progress-fill {
  height: 100%;
  border-radius: var(--radius-full);
  background: var(--primary);
  transition: width 0.3s ease;
}


.review-stage {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  overflow-y: auto;
}

.review-stage .panel {
  width: 100%;
  max-width: 720px;
  box-shadow: var(--shadow-card);
}

.review-action-bar {
  padding: 1rem 2rem 1.5rem;
  border-top: 1px solid var(--outline);
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  align-items: center;
}

.review-actions-secondary {
  display: flex;
  gap: 0.5rem;
}

.review-rating-buttons {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.6rem;
  width: 100%;
  max-width: 480px;
}

.rating-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
  padding: 0.75rem 0.5rem;
  border-radius: var(--radius-sm);
  background: var(--surface-container);
  border: 1px solid var(--outline);
  color: var(--on-surface);
}

.rating-btn:hover:not(:disabled) {
  background: var(--surface-container-high);
  border-color: var(--outline-hover);
  box-shadow: none;
}

.rating-label {
  font-weight: 600;
  font-size: 0.9rem;
}

.rating-interval {
  font-size: 0.72rem;
  color: var(--on-surface-variant);
}
</style>
