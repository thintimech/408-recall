<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useAppStore } from '@/stores/appStore'

const appStore = useAppStore()

onMounted(() => {
  void appStore.refreshDashboard()
})

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good Morning'
  if (hour < 18) return 'Good Afternoon'
  return 'Good Evening'
})

const displayName = computed(() => appStore.studyGoals.userName || '')

const subjectMeta = [
  { icon: 'hub', color: 'var(--tertiary)', bg: 'var(--tertiary-muted)' },
  { icon: 'terminal', color: 'var(--secondary)', bg: 'var(--secondary-muted)' },
  { icon: 'lan', color: 'var(--on-surface-variant)', bg: 'rgba(148, 163, 184, 0.1)' },
  { icon: 'memory', color: 'var(--primary)', bg: 'var(--primary-muted)' },
  { icon: 'calculate', color: 'var(--warning)', bg: 'rgba(251, 191, 36, 0.1)' },
  { icon: 'functions', color: 'var(--secondary)', bg: 'var(--secondary-muted)' },
  { icon: 'database', color: 'var(--error)', bg: 'var(--error-muted)' },
]

function getSubjectMeta(index: number) {
  return subjectMeta[index % subjectMeta.length]
}

const masteryTier = computed(() => {
  const r = appStore.completionRate
  if (r >= 90) return 'Diamond'
  if (r >= 75) return 'Gold'
  if (r >= 50) return 'Silver'
  return 'Bronze'
})
</script>

<template>
  <section class="page">
    <!-- Greeting -->
    <section class="greeting">
      <div class="greeting-text">
        <h1 class="greeting-title">{{ greeting }}{{ displayName ? ', ' + displayName : '' }}</h1>
        <p class="greeting-sub">
          连续学习 <strong class="text-primary">{{ appStore.streak.currentStreak }} 天</strong>。
          今日还有 {{ appStore.dueCount }} 张卡片待复习。
        </p>
      </div>
      <div class="streak-badge emerald-glow">
        <div class="streak-info">
          <span class="streak-label">Current Streak</span>
          <span class="streak-value">{{ String(appStore.streak.currentStreak).padStart(2, '0') }} Days</span>
        </div>
        <div class="streak-icon">
          <span class="material-symbols-outlined">local_fire_department</span>
        </div>
      </div>
    </section>

    <!-- Stat Cards -->
    <div class="stat-row">
      <article class="stat-card card-interactive">
        <div class="stat-card-top">
          <span class="stat-icon" style="color: var(--primary); background: var(--primary-muted)">
            <span class="material-symbols-outlined">pending_actions</span>
          </span>
        </div>
        <span class="stat-label">Due Today</span>
        <strong class="stat-value">{{ appStore.dueCount }}</strong>
      </article>
      <article class="stat-card card-interactive">
        <div class="stat-card-top">
          <span class="stat-icon" style="color: var(--secondary); background: var(--secondary-muted)">
            <span class="material-symbols-outlined">layers</span>
          </span>
        </div>
        <span class="stat-label">Total Cards</span>
        <strong class="stat-value">{{ Object.values(appStore.subjectCardCounts).reduce((a, b) => a + b, 0) }}</strong>
      </article>
      <article class="stat-card card-interactive">
        <div class="stat-card-top">
          <span class="stat-icon" style="color: var(--tertiary); background: var(--tertiary-muted)">
            <span class="material-symbols-outlined">check_circle</span>
          </span>
        </div>
        <span class="stat-label">Completed</span>
        <strong class="stat-value">{{ appStore.completedToday }}</strong>
      </article>
      <article class="stat-card card-interactive">
        <div class="stat-card-top">
          <span class="stat-icon" style="color: var(--warning); background: rgba(251, 191, 36, 0.1)">
            <span class="material-symbols-outlined">timer</span>
          </span>
        </div>
        <span class="stat-label">Countdown</span>
        <strong class="stat-value">{{ appStore.daysToExam ?? '—' }}<small v-if="appStore.daysToExam !== null">d</small></strong>
      </article>
    </div>

    <!-- Main Grid: 8 + 4 columns -->
    <div class="main-grid">
      <!-- Left: Subject Progress -->
      <div class="main-left">
        <div class="section-header">
          <h2 class="section-title">Subject Progress</h2>
        </div>
        <div class="subject-grid">
          <article
            v-for="(title, subjectId, idx) in appStore.subjectTitles"
            :key="subjectId"
            class="subject-card card-interactive"
          >
            <div class="subject-card-top">
              <span class="subject-icon" :style="{ color: getSubjectMeta(idx).color, background: getSubjectMeta(idx).bg }">
                <span class="material-symbols-outlined">{{ getSubjectMeta(idx).icon }}</span>
              </span>
              <div class="subject-info">
                <strong>{{ title }}</strong>
                <span class="muted">{{ appStore.subjectCardCounts[subjectId] || 0 }} Cards</span>
              </div>
            </div>
            <div class="subject-progress">
              <div class="subject-progress-header">
                <span>Progress</span>
                <span :style="{ color: getSubjectMeta(idx).color }">{{ appStore.subjectCardCounts[subjectId] ? '—' : '0' }}%</span>
              </div>
              <div class="mastery-bar-bg">
                <div class="mastery-bar-fill" :style="{ width: '45%', background: getSubjectMeta(idx).color }" />
              </div>
            </div>
          </article>
        </div>
      </div>

      <!-- Right: Mistakes + Mastery -->
      <div class="main-right">
        <!-- Recent Mistakes -->
        <div class="mistakes-panel">
          <h2 class="section-title">薄弱点</h2>
          <div class="mistakes-list">
            <template v-if="appStore.recentForgottenCards.length === 0 && appStore.recentMistakeNotes.length === 0">
              <div class="mistakes-empty">
                <span class="material-symbols-outlined" style="font-size: 32px; color: var(--on-surface-dim)">check_circle</span>
                <p class="muted">暂无薄弱记录，继续保持。</p>
              </div>
            </template>
            <RouterLink
              v-for="item in appStore.recentForgottenCards.slice(0, 3)"
              :key="item.record.id"
              :to="`/cards/${item.card.id}/edit`"
              class="mistake-item"
            >
              <div class="mistake-item-top">
                <span class="mistake-tag">复习遗忘</span>
                <span class="material-symbols-outlined mistake-arrow">arrow_forward</span>
              </div>
              <p class="mistake-quote">"{{ item.card.front }}"</p>
            </RouterLink>
            <RouterLink
              v-for="note in appStore.recentMistakeNotes.slice(0, 2)"
              :key="note.id"
              to="/mistakes"
              class="mistake-item"
            >
              <div class="mistake-item-top">
                <span class="mistake-tag" style="color: var(--warning)">错点记录</span>
                <span class="material-symbols-outlined mistake-arrow">arrow_forward</span>
              </div>
              <p class="mistake-quote">"{{ note.summary }}"</p>
            </RouterLink>
          </div>
          <RouterLink to="/mistakes" class="mistakes-footer">
            查看全部薄弱点
          </RouterLink>
        </div>

        <!-- Mastery Ring -->
        <div class="mastery-ring-panel">
          <span class="muted" style="font-size: 0.75rem">Overall Mastery Rate</span>
          <div class="mastery-ring">
            <svg viewBox="0 0 128 128" class="mastery-ring-svg">
              <circle cx="64" cy="64" r="54" fill="none" stroke="var(--surface-container-high)" stroke-width="8" />
              <circle
                cx="64" cy="64" r="54" fill="none"
                stroke="var(--primary)" stroke-width="8"
                stroke-linecap="round"
                :stroke-dasharray="`${appStore.completionRate * 3.39} 339.3`"
                transform="rotate(-90 64 64)"
              />
            </svg>
            <div class="mastery-ring-center">
              <strong>{{ appStore.completionRate }}%</strong>
              <span>{{ masteryTier }}</span>
            </div>
          </div>
          <p class="muted" style="font-size: 0.75rem; text-align: center; margin-top: 0.75rem">
            Keep reviewing to reach the next tier.
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.text-primary { color: var(--primary); }

.greeting {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 2rem;
}

.greeting-title {
  margin: 0;
  font-size: 2rem;
  font-weight: 600;
  letter-spacing: -0.02em;
}

.greeting-sub {
  margin: 0.5rem 0 0;
  color: var(--on-surface-variant);
  font-size: 0.88rem;
  max-width: 400px;
}

.streak-badge {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background: var(--surface-container-high);
  border: 1px solid var(--outline);
  border-radius: var(--radius-xl);
}

.streak-info {
  text-align: right;
}

.streak-label {
  display: block;
  font-size: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--on-surface-variant);
}

.streak-value {
  display: block;
  font-size: 1.35rem;
  font-weight: 600;
  color: var(--primary);
  letter-spacing: -0.02em;
}

.streak-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary-muted);
  border-radius: var(--radius-md);
  color: var(--primary);
}

.streak-icon .material-symbols-outlined {
  font-size: 28px;
}

/* Stat Row */
.stat-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
  margin-bottom: 2rem;
}

.stat-card {
  border: 1px solid var(--outline);
  border-radius: var(--radius-xl);
  padding: 1.25rem;
  background: var(--surface-container-low);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.stat-card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
}

.stat-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
}

.stat-label {
  font-size: 0.72rem;
  color: var(--on-surface-variant);
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--on-surface);
}

.stat-value small {
  font-size: 0.7em;
  font-weight: 500;
  color: var(--on-surface-variant);
}

/* Main Grid */
.main-grid {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 1.5rem;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.section-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  letter-spacing: -0.01em;
}

/* Subject Grid */
.subject-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

.subject-card {
  border: 1px solid var(--outline);
  border-radius: var(--radius-xl);
  padding: 1.25rem;
  background: var(--surface-container-low);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.subject-card-top {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.subject-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  flex-shrink: 0;
}

.subject-info {
  display: flex;
  flex-direction: column;
}

.subject-info strong {
  font-size: 0.88rem;
}

.subject-info .muted {
  font-size: 0.7rem;
}

.subject-progress {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.subject-progress-header {
  display: flex;
  justify-content: space-between;
  font-size: 0.68rem;
  font-weight: 600;
}

/* Right Column */
.main-right {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.mistakes-panel {
  border: 1px solid var(--outline);
  border-radius: var(--radius-xl);
  background: var(--surface-container-low);
  overflow: hidden;
}

.mistakes-panel .section-title {
  padding: 1.25rem 1.25rem 0;
  font-size: 1rem;
}

.mistakes-list {
  padding: 0.75rem 0;
}

.mistakes-empty {
  padding: 2rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.mistake-item {
  display: block;
  padding: 0.75rem 1.25rem;
  transition: background var(--transition-fast);
}

.mistake-item:hover {
  background: rgba(255, 255, 255, 0.03);
}

.mistake-item-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.mistake-tag {
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--error);
}

.mistake-arrow {
  font-size: 16px;
  color: var(--on-surface-dim);
  transition: color var(--transition-fast);
}

.mistake-item:hover .mistake-arrow {
  color: var(--primary);
}

.mistake-quote {
  margin: 0.4rem 0 0;
  font-family: var(--font-content);
  font-style: italic;
  font-size: 0.82rem;
  color: var(--on-surface);
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mistakes-footer {
  display: block;
  padding: 0.75rem;
  text-align: center;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--error);
  background: var(--error-muted);
  transition: background var(--transition-fast);
}

.mistakes-footer:hover {
  background: rgba(248, 113, 113, 0.15);
}

/* Mastery Ring */
.mastery-ring-panel {
  border: 1px solid var(--outline);
  border-radius: var(--radius-xl);
  padding: 1.5rem;
  background: var(--surface-container-low);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.mastery-ring {
  position: relative;
  width: 128px;
  height: 128px;
  margin: 1rem 0;
}

.mastery-ring-svg {
  width: 100%;
  height: 100%;
}

.mastery-ring-center {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.mastery-ring-center strong {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--on-surface);
}

.mastery-ring-center span {
  font-size: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--on-surface-dim);
}

@media (max-width: 1024px) {
  .main-grid {
    grid-template-columns: 1fr;
  }
  .subject-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 860px) {
  .greeting {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  .stat-row {
    grid-template-columns: repeat(2, 1fr);
  }
  .streak-badge {
    display: none;
  }
}
</style>
