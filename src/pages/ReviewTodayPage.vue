<script setup lang="ts">
import { onMounted, ref } from 'vue'
import ReviewCard from '@/components/review/ReviewCard.vue'
import ReviewResultButtons from '@/components/review/ReviewResultButtons.vue'
import { useAppStore } from '@/stores/appStore'
import { useReviewStore } from '@/stores/reviewStore'
import type { ReviewResult } from '@/types/domain'

const reviewStore = useReviewStore()
const appStore = useAppStore()
const answerVisible = ref(false)

const resultLabels: Record<ReviewResult, string> = {
  FORGOT: '忘了',
  HARD: '困难',
  GOOD: '记得',
  EASY: '熟练'
}

onMounted(() => {
  void reviewStore.loadDue()
})

async function answer(result: ReviewResult) {
  await reviewStore.answerCurrent(result)
  answerVisible.value = false
  await appStore.refreshDashboard()
}
</script>

<template>
  <section class="page">
    <header class="page-header">
      <div>
        <h1 class="page-title">今日复习</h1>
        <p class="page-subtitle">先回忆，再看答案，再选择掌握程度。</p>
      </div>
      <span class="badge">剩余 {{ reviewStore.remainingCount }} 张</span>
    </header>

    <p v-if="reviewStore.error" class="panel">{{ reviewStore.error }}</p>

    <template v-if="reviewStore.currentItem">
      <ReviewCard
        :item="reviewStore.currentItem"
        :answer-visible="answerVisible"
        @reveal="answerVisible = true"
      />
      <section class="panel" style="margin-top: 1rem">
        <ReviewResultButtons :disabled="!answerVisible" @answer="answer" />
      </section>
    </template>

    <section v-else class="panel">
      <h2>{{ reviewStore.completedThisSession > 0 ? '本轮复习完成' : '今天没有到期卡片' }}</h2>
      <p class="muted">
        {{
          reviewStore.completedThisSession > 0
            ? '复习结果已保存，下次复习日期已更新。'
            : '新建卡片后会默认进入今日复习。'
        }}
      </p>
      <div v-if="reviewStore.completedThisSession > 0" class="grid four" style="grid-template-columns: repeat(4, minmax(0, 1fr))">
        <article v-for="(label, result) in resultLabels" :key="result" class="list-item">
          <span class="muted">{{ label }}</span>
          <strong style="display: block; font-size: 2rem">
            {{ reviewStore.sessionResults[result] }}
          </strong>
        </article>
      </div>
    </section>
  </section>
</template>
