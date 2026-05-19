<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import ReviewCard from '@/components/review/ReviewCard.vue'
import ReviewResultButtons from '@/components/review/ReviewResultButtons.vue'
import { useAppStore } from '@/stores/appStore'
import { useKnowledgeStore } from '@/stores/knowledgeStore'
import { useReviewStore } from '@/stores/reviewStore'
import type { ReviewResult } from '@/types/domain'

const reviewStore = useReviewStore()
const appStore = useAppStore()
const knowledgeStore = useKnowledgeStore()
const answerVisible = ref(false)

const resultLabels: Record<ReviewResult, string> = {
  FORGOT: '忘了',
  HARD: '困难',
  GOOD: '记得',
  EASY: '熟练'
}

const shortcutHints = [
  'Space 显示答案',
  '1 忘了',
  '2 困难',
  '3 记得',
  '4 熟练',
  'Z 撤销',
  'S 跳过'
]

const subjectTitles = computed(() =>
  Object.fromEntries(knowledgeStore.subjects.map((subject) => [subject.id, subject.title]))
)

const hasSummary = computed(() => reviewStore.completedThisSession > 0)

onMounted(async () => {
  await Promise.all([reviewStore.loadDue(), knowledgeStore.load()])
  window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
})

function shouldIgnoreShortcut(event: KeyboardEvent): boolean {
  const target = event.target as HTMLElement | null
  if (!target) return false
  return ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable
}

async function answer(result: ReviewResult) {
  if (!answerVisible.value) return
  await reviewStore.answerCurrent(result)
  answerVisible.value = false
  await appStore.refreshDashboard()
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

function handleKeydown(event: KeyboardEvent) {
  if (shouldIgnoreShortcut(event)) return

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
  <section class="page">
    <header class="page-header">
      <div>
        <h1 class="page-title">今日复习</h1>
        <p class="page-subtitle">先回忆，再看答案，再选择掌握程度。</p>
      </div>
      <div class="actions">
        <span v-if="reviewStore.currentItem" class="badge">
          第 {{ reviewStore.currentPosition }} / {{ reviewStore.totalForProgress }} 张
        </span>
        <span class="badge">剩余 {{ reviewStore.remainingCount }} 张</span>
      </div>
    </header>

    <p v-if="reviewStore.error" class="panel">{{ reviewStore.error }}</p>

    <template v-if="reviewStore.currentItem">
      <ReviewCard
        :item="reviewStore.currentItem"
        :answer-visible="answerVisible"
        @reveal="revealAnswer"
      />

      <section class="panel" style="margin-top: 1rem">
        <ReviewResultButtons :disabled="!answerVisible" @answer="answer" />
        <div class="actions" style="margin-top: 1rem">
          <button class="secondary" type="button" :disabled="!reviewStore.canUndo" @click="undoLast">
            撤销上一次
          </button>
          <button class="secondary" type="button" @click="skipCurrent">跳过当前</button>
        </div>
        <p class="muted" style="margin-bottom: 0">
          快捷键：{{ shortcutHints.join(' · ') }}
        </p>
      </section>
    </template>

    <section v-else class="panel">
      <h2>{{ hasSummary ? '本轮复习完成' : '今天没有到期卡片' }}</h2>
      <p class="muted">
        {{
          hasSummary
            ? '复习结果已保存，下次复习日期已更新。'
            : '新建卡片后会默认进入今日复习。'
        }}
      </p>

      <template v-if="hasSummary">
        <div class="grid three">
          <article class="list-item">
            <span class="muted">本次复习总数</span>
            <strong style="display: block; font-size: 2rem">
              {{ reviewStore.completedThisSession }}
            </strong>
          </article>
          <article class="list-item">
            <span class="muted">弱项数量</span>
            <strong style="display: block; font-size: 2rem">
              {{ reviewStore.sessionResults.FORGOT + reviewStore.sessionResults.HARD }}
            </strong>
          </article>
          <article class="list-item">
            <span class="muted">剩余卡片</span>
            <strong style="display: block; font-size: 2rem">
              {{ reviewStore.remainingCount }}
            </strong>
          </article>
        </div>

        <div class="grid two" style="margin-top: 1rem">
          <section class="list-item">
            <h3>结果分布</h3>
            <div class="grid two">
              <article v-for="(label, result) in resultLabels" :key="result" class="list-item">
                <span class="muted">{{ label }}</span>
                <strong style="display: block; font-size: 1.7rem">
                  {{ reviewStore.sessionResults[result] }}
                </strong>
              </article>
            </div>
          </section>

          <section class="list-item">
            <h3>科目分布</h3>
            <ul class="list">
              <li
                v-for="[subjectId, count] in Object.entries(reviewStore.subjectDistribution)"
                :key="subjectId"
                class="actions"
                style="justify-content: space-between"
              >
                <span>{{ subjectTitles[subjectId] || subjectId }}</span>
                <span class="badge">{{ count }} 张</span>
              </li>
            </ul>
          </section>
        </div>

        <section class="list-item" style="margin-top: 1rem">
          <h3>忘了 / 困难卡片</h3>
          <div v-if="reviewStore.weakCards.length === 0" class="empty">本轮没有弱项卡片。</div>
          <ul v-else class="list">
            <li v-for="card in reviewStore.weakCards" :key="card.id" class="list-item">
              <RouterLink :to="`/cards/${card.id}/edit`">
                <strong>{{ card.front }}</strong>
              </RouterLink>
              <p class="muted">{{ card.back }}</p>
            </li>
          </ul>
        </section>

        <div class="actions" style="margin-top: 1rem">
          <RouterLink to="/">
            <button type="button">返回首页</button>
          </RouterLink>
          <RouterLink to="/cards">
            <button class="secondary" type="button">继续查看卡片</button>
          </RouterLink>
        </div>
      </template>
    </section>
  </section>
</template>
