<script setup lang="ts">
import { computed, inject, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import ReviewCard from '@/components/review/ReviewCard.vue'
import DeepModeProbe from '@/components/review/DeepModeProbe.vue'
import { useKnowledgeStore } from '@/stores/knowledgeStore'
import { listCramReviewItems, recordReviewResult, undoReviewResult } from '@/db/repositories/reviewRepository'
import type { DueReviewItem, ReviewRecord, ReviewResult, ReviewState } from '@/types/domain'

const route = useRoute()
const router = useRouter()
const knowledgeStore = useKnowledgeStore()
const answerVisible = ref(false)
const submitting = ref(false)
const started = ref(false)
const deepMode = ref(localStorage.getItem('408-recall-deep-mode') === 'true')
const showProbe = ref(false)
const probeCardFront = ref('')
const probeCardBack = ref('')
const probeNodeTitle = ref('')
const openChat = inject<(context: string) => void>('openChat')!

interface SessionEntry {
  item: DueReviewItem
  result: ReviewResult
  record: ReviewRecord
  previousState: ReviewState
}

const items = ref<DueReviewItem[]>([])
const sessionResults = ref<Record<ReviewResult, number>>({ FORGOT: 0, HARD: 0, GOOD: 0, EASY: 0 })
const sessionReviewed = ref<SessionEntry[]>([])
const completedCount = ref(0)
const initialCount = ref(0)

const currentItem = computed(() => items.value[0])
const progressPercent = computed(() => {
  if (initialCount.value === 0) return 0
  return Math.round((completedCount.value / initialCount.value) * 100)
})

const selectedSubject = computed(() => (route.query.subject as string) || '')
const selectedNode = computed(() => (route.query.node as string) || '')
const scopeLabel = computed(() => {
  if (selectedNode.value) {
    const node = knowledgeStore.nodes.find((n) => n.id === selectedNode.value)
    return node?.title || '未知知识点'
  }
  if (selectedSubject.value) {
    const subject = knowledgeStore.subjects.find((s) => s.id === selectedSubject.value)
    return subject?.title || '未知科目'
  }
  return '全部卡片'
})

const resultButtons: Array<{ value: ReviewResult; label: string; key: string }> = [
  { value: 'FORGOT', label: '忘了', key: '1' },
  { value: 'HARD', label: '困难', key: '2' },
  { value: 'GOOD', label: '记得', key: '3' },
  { value: 'EASY', label: '熟练', key: '4' }
]

onMounted(async () => {
  await knowledgeStore.load()
  if (selectedSubject.value || selectedNode.value) {
    await startCram()
  }
  window.addEventListener('keydown', handleKeydown)
})

async function startCram(subjectId?: string) {
  const subject = subjectId || selectedSubject.value || undefined
  const node = selectedNode.value || undefined
  const loaded = await listCramReviewItems(subject, node)
  items.value = shuffle(loaded)
  initialCount.value = items.value.length
  started.value = true
}

function startWithSubject(subjectId: string) {
  router.replace({ query: { subject: subjectId } })
  void startCram(subjectId)
}

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
})

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function revealAnswer() {
  if (currentItem.value) answerVisible.value = true
}

async function answer(result: ReviewResult) {
  if (!answerVisible.value || submitting.value) return
  const item = currentItem.value
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
    const payload = await recordReviewResult(item.card.id, result)
    items.value.shift()
    sessionResults.value[result] += 1
    completedCount.value += 1
    sessionReviewed.value.push({ item, result, record: payload.record, previousState: payload.previousState })
    answerVisible.value = false
    if (shouldProbe) showProbe.value = true
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
  const last = sessionReviewed.value.pop()
  if (!last) return
  await undoReviewResult(last.record.id, last.previousState)
  sessionResults.value[last.result] = Math.max(0, sessionResults.value[last.result] - 1)
  completedCount.value = Math.max(0, completedCount.value - 1)
  items.value.unshift(last.item)
  answerVisible.value = false
}

function skipCurrent() {
  if (items.value.length <= 1) return
  const [item] = items.value.splice(0, 1)
  items.value.push(item)
  answerVisible.value = false
}

function askAi() {
  const item = currentItem.value
  if (!item) return
  const node = knowledgeStore.nodes.find((n) => n.id === item.card.knowledgeNodeId)
  const parts = [`卡片类型：${item.card.type}`, `知识点：${node?.title || '未知'}`, `正面：${item.card.front}`]
  if (answerVisible.value) parts.push(`背面：${item.card.back}`)
  if (item.card.extra) parts.push(`补充：${item.card.extra}`)
  openChat(parts.join('\n'))
}

function shouldIgnoreShortcut(event: KeyboardEvent): boolean {
  const target = event.target as HTMLElement | null
  if (!target) return false
  return ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable
}

function handleKeydown(event: KeyboardEvent) {
  if (shouldIgnoreShortcut(event)) return
  if (event.code === 'Space') { event.preventDefault(); revealAnswer(); return }
  const map: Record<string, ReviewResult> = { '1': 'FORGOT', '2': 'HARD', '3': 'GOOD', '4': 'EASY' }
  if (map[event.key]) { event.preventDefault(); void answer(map[event.key]); return }
  if (event.key.toLowerCase() === 'z') { event.preventDefault(); void undoLast(); return }
  if (event.key.toLowerCase() === 's') { event.preventDefault(); skipCurrent() }
}
</script>

<template>
  <!-- Setup: pick scope -->
  <section v-if="!started" class="page">
    <header class="page-header">
      <div>
        <p class="page-eyebrow">Cram Mode</p>
        <h1 class="page-title">突击复习</h1>
        <p class="page-subtitle">选择一个科目，打乱顺序复习所有卡片（不受间隔调度限制）。</p>
      </div>
    </header>

    <div class="grid two">
      <button
        v-for="subject in knowledgeStore.subjects"
        :key="subject.id"
        class="panel card-interactive"
        type="button"
        style="text-align: left; cursor: pointer"
        @click="startWithSubject(subject.id)"
      >
        <strong>{{ subject.title }}</strong>
        <p class="muted" style="margin: 0.3rem 0 0">点击开始突击</p>
      </button>
    </div>

    <div class="actions" style="margin-top: 1.5rem">
      <button type="button" @click="startCram()">全部科目突击</button>
    </div>
  </section>

  <!-- Active review -->
  <section v-else-if="currentItem" class="review-immersive">
    <div class="review-topbar">
      <div class="review-topbar-row">
        <span class="badge">突击模式 · {{ scopeLabel }}</span>
        <span class="muted">{{ completedCount }} / {{ initialCount }}</span>
      </div>
      <div class="review-progress-track">
        <div class="review-progress-fill" :style="{ width: progressPercent + '%' }" />
      </div>
    </div>

    <div class="review-stage">
      <DeepModeProbe
        v-if="showProbe"
        :card-front="probeCardFront"
        :card-back="probeCardBack"
        :knowledge-node-title="probeNodeTitle"
        @done="dismissProbe"
      />
      <ReviewCard v-else :item="currentItem" :answer-visible="answerVisible" @reveal="revealAnswer" />
    </div>

    <div class="review-action-bar">
      <div class="review-actions-secondary">
        <button class="ghost" type="button" :disabled="sessionReviewed.length === 0" @click="undoLast">撤销</button>
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
          <span class="rating-interval">{{ btn.key }}</span>
        </button>
      </div>
    </div>
  </section>

  <section v-else-if="started" class="page">
    <header class="page-header">
      <div>
        <p class="page-eyebrow">Cram Mode</p>
        <h1 class="page-title">{{ completedCount > 0 ? '突击完成' : '突击复习' }}</h1>
        <p class="page-subtitle">
          {{ completedCount > 0 ? `已复习 ${completedCount} 张卡片。` : `「${scopeLabel}」下没有可复习的卡片。` }}
        </p>
      </div>
    </header>

    <template v-if="completedCount > 0">
      <div class="grid four">
        <article class="panel stat">
          <span class="muted">忘了</span>
          <strong>{{ sessionResults.FORGOT }}</strong>
        </article>
        <article class="panel stat">
          <span class="muted">困难</span>
          <strong>{{ sessionResults.HARD }}</strong>
        </article>
        <article class="panel stat">
          <span class="muted">记得</span>
          <strong>{{ sessionResults.GOOD }}</strong>
        </article>
        <article class="panel stat">
          <span class="muted">熟练</span>
          <strong>{{ sessionResults.EASY }}</strong>
        </article>
      </div>
    </template>

    <div class="actions" style="margin-top: 1.5rem">
      <RouterLink to="/review">
        <button type="button">返回今日复习</button>
      </RouterLink>
      <RouterLink to="/cards">
        <button class="secondary" type="button">查看卡片</button>
      </RouterLink>
    </div>
  </section>
</template>
