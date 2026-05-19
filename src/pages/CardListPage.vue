<script setup lang="ts">
import { computed, onMounted, reactive, watch } from 'vue'
import { useRouter } from 'vue-router'
import CardList from '@/components/cards/CardList.vue'
import { useCardStore } from '@/stores/cardStore'
import { useKnowledgeStore } from '@/stores/knowledgeStore'
import type { CardType, MemoryCard } from '@/types/domain'

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

const filters = reactive<{
  subjectId: string
  knowledgeNodeId: string
  type: '' | CardType
  query: string
}>({
  subjectId: '',
  knowledgeNodeId: '',
  type: '',
  query: ''
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
    query: filters.query || undefined
  })
}

watch(filters, () => void loadCards(), { deep: true })

onMounted(async () => {
  await knowledgeStore.load()
  await loadCards()
})

async function remove(card: MemoryCard) {
  if (!window.confirm(`确定删除卡片「${card.front}」吗？复习记录也会一起删除。`)) return
  await cardStore.removeCard(card.id)
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
      </div>
    </section>

    <CardList
      :cards="cardStore.cards"
      :nodes="knowledgeStore.nodes"
      @edit="(card) => router.push(`/cards/${card.id}/edit`)"
      @delete="remove"
    />
  </section>
</template>
