<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CardList from '@/components/cards/CardList.vue'
import { useCardStore } from '@/stores/cardStore'
import { useKnowledgeStore } from '@/stores/knowledgeStore'
import { deleteCardCascade, updateCard } from '@/db/repositories/cardRepository'
import { db } from '@/db'
import type { CardType, CardWithReviewState, ID, VerifiedStatus } from '@/types/domain'
import { nowIso } from '@/services/dateService'

type ViewMode = 'grid' | 'grouped'

const router = useRouter()
const route = useRoute()
const cardStore = useCardStore()
const knowledgeStore = useKnowledgeStore()

const batchMode = ref(false)
const selectedIds = ref<Set<ID>>(new Set())
const batchMessage = ref('')
const viewMode = ref<ViewMode>((localStorage.getItem('408-recall-card-view') as ViewMode) || 'grid')

const cardTypes: Array<{ value: CardType; label: string }> = [
  { value: 'CONCEPT', label: '概念卡' },
  { value: 'COMPARE', label: '对比卡' },
  { value: 'CLOZE', label: '填空卡' },
  { value: 'PROCESS', label: '流程卡' },
  { value: 'FORMULA', label: '公式卡' },
  { value: 'MISTAKE', label: '易错卡' },
  { value: 'BIG_QUESTION', label: '大题模板卡' },
  { value: 'METHOD', label: '题型套路卡' },
  { value: 'THEOREM', label: '定理条件卡' }
]

const filters = reactive({
  subjectId: '',
  knowledgeNodeId: '',
  type: '' as '' | CardType,
  query: '',
  dueStatus: 'ALL' as 'ALL' | 'DUE_TODAY' | 'OVERDUE' | 'UNREVIEWED',
  archivedStatus: 'ACTIVE' as 'ALL' | 'ACTIVE' | 'ARCHIVED',
  sortBy: 'UPDATED_DESC' as 'UPDATED_DESC' | 'DUE_ASC' | 'DUE_DESC'
})

const filteredNodes = computed(() =>
  knowledgeStore.nodes.filter(
    (node) => node.level > 0 && (!filters.subjectId || node.subjectId === filters.subjectId)
  )
)

const groupedCards = computed(() => {
  const groups: Array<{ nodeId: ID; title: string; cards: CardWithReviewState[] }> = []
  const map = new Map<ID, CardWithReviewState[]>()
  for (const item of cardStore.cards) {
    const nodeId = item.card.knowledgeNodeId
    if (!map.has(nodeId)) map.set(nodeId, [])
    map.get(nodeId)!.push(item)
  }
  for (const [nodeId, cards] of map) {
    const node = knowledgeStore.nodes.find((n) => n.id === nodeId)
    groups.push({ nodeId, title: node?.title || '未知知识点', cards })
  }
  return groups
})

function setViewMode(mode: ViewMode) {
  viewMode.value = mode
  localStorage.setItem('408-recall-card-view', mode)
}

async function loadCards() {
  await cardStore.load({
    subjectId: filters.subjectId || undefined,
    knowledgeNodeId: filters.knowledgeNodeId || undefined,
    type: filters.type || undefined,
    query: filters.query || undefined,
    dueStatus: filters.dueStatus,
    archivedStatus: filters.archivedStatus,
    sortBy: filters.sortBy
  })
}

let debounceTimer: ReturnType<typeof setTimeout> | null = null

watch(filters, () => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => void loadCards(), 300)
}, { deep: true })

onMounted(async () => {
  const q = route.query.q
  if (q && typeof q === 'string') {
    filters.query = q
  }
  await knowledgeStore.load()
  await loadCards()
})

async function remove(item: CardWithReviewState) {
  const firstConfirm = window.confirm(
    `确定删除卡片「${item.card.front}」吗？复习状态和复习记录也会一起删除。`
  )
  if (!firstConfirm) return

  const secondConfirm = window.confirm('请再次确认：此删除操作不可撤销。')
  if (!secondConfirm) return

  await cardStore.removeCard(item.card.id)
  await loadCards()
}

async function duplicate(item: CardWithReviewState) {
  await cardStore.duplicateExistingCard(item.card.id)
  await loadCards()
  batchMessage.value = '卡片已复制。'
}

async function archive(item: CardWithReviewState) {
  await cardStore.archiveCard(item.card.id, item.card.archived !== true)
  await loadCards()
  batchMessage.value = item.card.archived ? '已恢复学习。' : '已标记为掌握。'
}

function toggleBatch() {
  batchMode.value = !batchMode.value
  selectedIds.value = new Set()
  batchMessage.value = ''
}

function toggleSelect(id: ID) {
  const s = new Set(selectedIds.value)
  if (s.has(id)) s.delete(id)
  else s.add(id)
  selectedIds.value = s
}

function selectAll() {
  selectedIds.value = new Set(cardStore.cards.map((c) => c.card.id))
}

function deselectAll() {
  selectedIds.value = new Set()
}

async function batchDelete() {
  const count = selectedIds.value.size
  if (!count) return
  if (!window.confirm(`确定批量删除 ${count} 张卡片？此操作不可撤销。`)) return

  await db.transaction('rw', db.memoryCards, db.reviewStates, db.reviewRecords, async () => {
    for (const id of selectedIds.value) {
      await deleteCardCascade(id)
    }
  })
  selectedIds.value = new Set()
  await loadCards()
  batchMessage.value = `已删除 ${count} 张卡片。`
}

async function batchSetVerified(status: VerifiedStatus) {
  const count = selectedIds.value.size
  if (!count) return

  await db.transaction('rw', db.memoryCards, async () => {
    for (const id of selectedIds.value) {
      const item = cardStore.cards.find((c) => c.card.id === id)
      if (item) {
        await updateCard({ ...item.card, verifiedStatus: status, updatedAt: nowIso() })
      }
    }
  })
  await loadCards()
  batchMessage.value = `已将 ${count} 张卡片标记为${status === 'VERIFIED' ? '已校对' : status === 'DOUBTFUL' ? '存疑' : '未校对'}。`
}

async function batchMoveNode(nodeId: ID) {
  const count = selectedIds.value.size
  if (!count) return
  const node = knowledgeStore.nodes.find((n) => n.id === nodeId)
  if (!node) return

  await db.transaction('rw', db.memoryCards, async () => {
    for (const id of selectedIds.value) {
      const item = cardStore.cards.find((c) => c.card.id === id)
      if (item) {
        await updateCard({
          ...item.card,
          knowledgeNodeId: nodeId,
          subjectId: node.subjectId,
          updatedAt: nowIso()
        })
      }
    }
  })
  await loadCards()
  batchMessage.value = `已将 ${count} 张卡片移动到「${node.title}」。`
}
</script>

<template>
  <section class="page">
    <header class="page-header">
      <div>
        <p class="page-eyebrow">Card Library</p>
        <h1 class="page-title">卡片管理</h1>
        <p class="page-subtitle">围绕知识点维护可主动回忆的材料。</p>
      </div>
      <div class="actions">
        <div class="view-toggle">
          <button class="ghost" :class="{ active: viewMode === 'grid' }" type="button" @click="setViewMode('grid')">网格</button>
          <button class="ghost" :class="{ active: viewMode === 'grouped' }" type="button" @click="setViewMode('grouped')">分组</button>
        </div>
        <button class="secondary" type="button" @click="toggleBatch">
          {{ batchMode ? '退出批量' : '批量操作' }}
        </button>
        <RouterLink to="/cards/new">
          <button type="button">新建卡片</button>
        </RouterLink>
      </div>
    </header>

    <p v-if="batchMessage" class="panel" style="margin-bottom: 1rem; color: var(--accent)">
      {{ batchMessage }}
    </p>

    <section v-if="batchMode && cardStore.cards.length" class="panel" style="margin-bottom: 1rem">
      <div class="actions" style="flex-wrap: wrap">
        <button class="toolbar-btn" type="button" @click="selectAll">全选</button>
        <button class="toolbar-btn" type="button" @click="deselectAll">取消全选</button>
        <span class="muted">已选 {{ selectedIds.size }} 张</span>
        <button class="toolbar-btn" type="button" :disabled="!selectedIds.size" @click="batchSetVerified('VERIFIED')">标记已校对</button>
        <button class="toolbar-btn" type="button" :disabled="!selectedIds.size" @click="batchSetVerified('UNVERIFIED')">标记未校对</button>
        <button class="toolbar-btn" type="button" :disabled="!selectedIds.size" @click="batchSetVerified('DOUBTFUL')">标记存疑</button>
        <select :disabled="!selectedIds.size" style="width: auto; padding: 0.3rem 0.6rem; font-size: 0.82rem; border-radius: 8px" @change="(e) => { batchMoveNode((e.target as HTMLSelectElement).value); (e.target as HTMLSelectElement).value = '' }">
          <option value="">移动到…</option>
          <option v-for="node in filteredNodes" :key="node.id" :value="node.id">{{ node.title }}</option>
        </select>
        <button class="toolbar-btn" type="button" style="color: var(--danger)" :disabled="!selectedIds.size" @click="batchDelete">批量删除</button>
      </div>
    </section>

    <section class="panel" style="margin-bottom: 1rem">
      <div class="filters">
        <label>
          科目
          <select v-model="filters.subjectId">
            <option value="">全部科目</option>
            <option v-for="subject in knowledgeStore.subjects" :key="subject.id" :value="subject.id">
              {{ subject.title }}
            </option>
          </select>
        </label>
        <label>
          知识点
          <select v-model="filters.knowledgeNodeId">
            <option value="">全部知识点</option>
            <option v-for="node in filteredNodes" :key="node.id" :value="node.id">
              {{ node.title }}
            </option>
          </select>
        </label>
        <label>
          类型
          <select v-model="filters.type">
            <option value="">全部类型</option>
            <option v-for="type in cardTypes" :key="type.value" :value="type.value">
              {{ type.label }}
            </option>
          </select>
        </label>
        <label>
          搜索
          <input v-model="filters.query" placeholder="正面、背面或标签" />
        </label>
        <label>
          复习状态
          <select v-model="filters.dueStatus">
            <option value="ALL">全部</option>
            <option value="DUE_TODAY">今日待复习</option>
            <option value="OVERDUE">逾期待复习</option>
            <option value="UNREVIEWED">未复习过</option>
          </select>
        </label>
        <label>
          掌握状态
          <select v-model="filters.archivedStatus">
            <option value="ACTIVE">学习中</option>
            <option value="ARCHIVED">已掌握</option>
            <option value="ALL">全部</option>
          </select>
        </label>
        <label>
          排序
          <select v-model="filters.sortBy">
            <option value="UPDATED_DESC">最近更新</option>
            <option value="DUE_ASC">下次复习从早到晚</option>
            <option value="DUE_DESC">下次复习从晚到早</option>
          </select>
        </label>
      </div>
    </section>

    <CardList
      v-if="viewMode === 'grid'"
      :cards="cardStore.cards"
      :nodes="knowledgeStore.nodes"
      :batch-mode="batchMode"
      :selected-ids="selectedIds"
      @edit="(item) => router.push(`/cards/${item.card.id}/edit`)"
      @duplicate="duplicate"
      @archive="archive"
      @delete="remove"
      @toggle-select="toggleSelect"
    />

    <div v-else class="grouped-view">
      <details v-for="group in groupedCards" :key="group.nodeId" class="group-section" open>
        <summary class="group-header">
          <strong>{{ group.title }}</strong>
          <span class="badge">{{ group.cards.length }}</span>
        </summary>
        <CardList
          :cards="group.cards"
          :nodes="knowledgeStore.nodes"
          :batch-mode="batchMode"
          :selected-ids="selectedIds"
          @edit="(item) => router.push(`/cards/${item.card.id}/edit`)"
          @duplicate="duplicate"
          @archive="archive"
          @delete="remove"
          @toggle-select="toggleSelect"
        />
      </details>
    </div>
  </section>
</template>

<style scoped>
.view-toggle {
  display: flex;
  gap: 0.25rem;
  border: 1px solid var(--outline);
  border-radius: var(--radius-sm);
  padding: 0.15rem;
}

.view-toggle button {
  font-size: 0.78rem;
  padding: 0.3rem 0.6rem;
  border-radius: 6px;
}

.view-toggle button.active {
  background: var(--primary-muted);
  color: var(--primary);
}

.grouped-view {
  display: grid;
  gap: 1rem;
}

.group-section {
  border: 1px solid var(--outline);
  border-radius: var(--radius-lg);
  padding: 1rem;
  background: var(--surface-container-low);
}

.group-header {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0;
  margin-bottom: 0.75rem;
  font-size: 0.9rem;
}

.group-section[open] > .group-header {
  margin-bottom: 0.75rem;
}

.group-section:not([open]) > .group-header {
  margin-bottom: 0;
}
</style>
