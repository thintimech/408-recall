<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useAppStore } from '@/stores/appStore'

const appStore = useAppStore()

onMounted(() => {
  void appStore.refreshDashboard()
})
</script>

<template>
  <section class="page">
    <header class="page-header">
      <div>
        <h1 class="page-title">今日复习</h1>
        <p class="page-subtitle">打开后先处理到期卡片，再新增材料。</p>
      </div>
      <RouterLink to="/review">
        <button type="button" style="font-size: 1.05rem; padding: 0.95rem 1.25rem">
          开始今日复习
        </button>
      </RouterLink>
    </header>

    <div class="grid three">
      <article class="panel stat">
        <span class="muted">今日待复习</span>
        <strong>{{ appStore.dueCount }}</strong>
      </article>
      <article class="panel stat">
        <span class="muted">今日已完成</span>
        <strong>{{ appStore.completedToday }}</strong>
      </article>
      <article class="panel stat">
        <span class="muted">今日完成率</span>
        <strong>{{ appStore.completionRate }}%</strong>
      </article>
    </div>

    <div class="grid two" style="margin-top: 1rem">
      <section class="panel">
        <h2>四门课卡片</h2>
        <ul class="list">
          <li
            v-for="(title, subjectId) in appStore.subjectTitles"
            :key="subjectId"
            class="list-item"
          >
            <strong>{{ title }}</strong>
            <span class="badge" style="float: right">
              {{ appStore.subjectCardCounts[subjectId] || 0 }} 张
            </span>
          </li>
        </ul>
      </section>

      <section class="panel">
        <h2>未来 7 天待复习</h2>
        <ul class="list">
          <li
            v-for="item in appStore.dueCountsNextSevenDays"
            :key="item.date"
            class="list-item actions"
            style="justify-content: space-between"
          >
            <span>{{ item.date }}</span>
            <span class="badge">{{ item.count }} 张</span>
          </li>
        </ul>
      </section>
    </div>

    <div class="grid two" style="margin-top: 1rem">
      <section class="panel">
        <h2>最近新增卡片</h2>
        <div v-if="appStore.recentCards.length === 0" class="empty">还没有卡片。</div>
        <ul v-else class="list">
          <li v-for="card in appStore.recentCards" :key="card.id" class="list-item">
            <RouterLink :to="`/cards/${card.id}/edit`">
              <strong>{{ card.front }}</strong>
            </RouterLink>
            <p class="muted">{{ card.createdAt }}</p>
          </li>
        </ul>
      </section>

      <section class="panel">
        <h2>最近遗忘卡片</h2>
        <div v-if="appStore.recentForgottenCards.length === 0" class="empty">
          暂无遗忘记录。
        </div>
        <ul v-else class="list">
          <li v-for="item in appStore.recentForgottenCards" :key="item.record.id" class="list-item">
            <RouterLink :to="`/cards/${item.card.id}/edit`">
              <strong>{{ item.card.front }}</strong>
            </RouterLink>
            <p class="muted">遗忘时间：{{ item.record.reviewedAt }}</p>
          </li>
        </ul>
      </section>
    </div>
  </section>
</template>
