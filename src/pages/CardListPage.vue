<script setup lang="ts">
import { computed, onMounted, reactive, watch } from 'vue'
import { useRouter } from 'vue-router'
import CardList from '@/components/cards/CardList.vue'
import { useCardStore } from '@/stores/cardStore'
import { useKnowledgeStore } from '@/stores/knowledgeStore'
import type { CardType, CardWithReviewState } from '@/types/domain'

const router = useRouter()
const cardStore = useCardStore()
const knowledgeStore = useKnowledgeStore()

const cardTypes: Array<{ value: CardType; label: string }> = [
  { value: 'CONCEPT', label: '概念卡' },
  { value: 'COMPARE', label: '对比卡' },
  { value: 'CLOZE', label: '填空卡' },
  { value: 'PROCESS', label: '流程卡' },
  { value: 'FORMULA', label: '公式卡' },
  { value: 'MISTAKE', label: '易错卡' },
  { value: 'BIG_QUESTION', label: '大题模板卡' }
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

watch(filters, () => void loadCards(), { deep: true })

onMounted(async () => {
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
}

async function archive(item: CardWithReviewState) {
  await cardStore.archiveCard(item.card.id, item.card.archived !== true)
  await loadCards()
}
</script>

<template>
  <section class="page">
    <header class="page-header">
      <div>
        <h1 class="page-title">卡片列表</h1>
        <p class="page-subtitle">围绕知识点维护可主动回忆的材料。</p>
      </div>
      <RouterLink to="/cards/new">
        <button type="button">新建卡片</button>
      </RouterLink>
    </header>

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
          归档状态
          <select v-model="filters.archivedStatus">
            <option value="ACTIVE">未归档</option>
            <option value="ARCHIVED">已归档</option>
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
      :cards="cardStore.cards"
      :nodes="knowledgeStore.nodes"
      @edit="(item) => router.push(`/cards/${item.card.id}/edit`)"
      @duplicate="duplicate"
      @archive="archive"
      @delete="remove"
    />
  </section>
</template>
