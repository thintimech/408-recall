<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { getAllInsights, createInsight, updateInsight, deleteInsight } from '@/db/insightRepository'
import { listKnowledgeNodes } from '@/db/repositories/knowledgeRepository'
import type { Insight, KnowledgeNode } from '@/types/domain'
import MarkdownContent from '@/components/common/MarkdownContent.vue'

const nodes = ref<KnowledgeNode[]>([])
const insights = ref<Insight[]>([])
const showForm = ref(false)
const editingId = ref<string | null>(null)
const searchQuery = ref('')

const form = ref({
  knowledgeNodeId: '',
  title: '',
  content: '',
})

onMounted(async () => {
  nodes.value = await listKnowledgeNodes()
  insights.value = await getAllInsights()
})

const filtered = computed(() => {
  if (!searchQuery.value.trim()) return insights.value
  const q = searchQuery.value.toLowerCase()
  return insights.value.filter(
    (i) => i.title.toLowerCase().includes(q) || i.content.toLowerCase().includes(q)
  )
})

function getNodeTitle(nodeId: string | null): string {
  if (!nodeId) return ''
  return nodes.value.find((n) => n.id === nodeId)?.title || ''
}

function startEdit(insight: Insight) {
  editingId.value = insight.id
  form.value = {
    knowledgeNodeId: insight.knowledgeNodeId ?? '',
    title: insight.title,
    content: insight.content,
  }
  showForm.value = true
}

function resetForm() {
  form.value = { knowledgeNodeId: '', title: '', content: '' }
  editingId.value = null
  showForm.value = false
}

async function submit() {
  if (!form.value.title.trim()) return

  if (editingId.value) {
    await updateInsight(editingId.value, {
      knowledgeNodeId: form.value.knowledgeNodeId || null,
      title: form.value.title.trim(),
      content: form.value.content.trim(),
    })
  } else {
    await createInsight({
      knowledgeNodeId: form.value.knowledgeNodeId || null,
      title: form.value.title.trim(),
      content: form.value.content.trim(),
    })
  }

  resetForm()
  insights.value = await getAllInsights()
}

async function remove(id: string) {
  if (!window.confirm('确定删除该理解笔记？')) return
  await deleteInsight(id)
  insights.value = await getAllInsights()
}
</script>

<template>
  <section class="page">
    <header class="page-header">
      <div>
        <p class="page-eyebrow">Personal Insights</p>
        <h1 class="page-title">我的理解</h1>
        <p class="page-subtitle">记录你的顿悟时刻，忘记时一看就能想起来。</p>
      </div>
      <button type="button" @click="showForm ? resetForm() : (showForm = true)">
        {{ showForm ? '收起' : '记录新理解' }}
      </button>
    </header>

    <!-- Form -->
    <section v-if="showForm" class="panel form" style="margin-bottom: 1.5rem">
      <label>
        关联知识点（可选）
        <select v-model="form.knowledgeNodeId">
          <option value="">不关联</option>
          <option v-for="node in nodes" :key="node.id" :value="node.id">
            {{ '—'.repeat(node.level) }} {{ node.title }}
          </option>
        </select>
      </label>
      <label>
        一句话概括
        <input v-model="form.title" type="text" placeholder="例如：LRU 其实就是最近没用的先扔掉" />
      </label>
      <label>
        详细理解（支持 Markdown）
        <textarea v-model="form.content" placeholder="写下你的理解、类比、联想…" rows="6" />
      </label>
      <div class="actions">
        <button type="button" :disabled="!form.title.trim()" @click="submit">
          {{ editingId ? '保存修改' : '保存' }}
        </button>
        <button v-if="editingId" type="button" class="ghost" @click="resetForm">取消</button>
      </div>
    </section>

    <!-- Search -->
    <div v-if="insights.length > 0 && !showForm" class="search-row">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="搜索理解…"
        class="search-input"
      />
      <span class="count">{{ filtered.length }} 条</span>
    </div>

    <!-- Empty -->
    <section v-if="filtered.length === 0 && !showForm" class="empty">
      <p>💡</p>
      <p>还没有理解笔记。</p>
      <p class="muted">复习时产生了自己的理解？记录下来，下次忘记时一看就能想起来。</p>
    </section>

    <!-- List -->
    <div v-else-if="!showForm" class="insight-grid">
      <article v-for="item in filtered" :key="item.id" class="insight-card">
        <div class="insight-card-header">
          <span class="insight-icon">💡</span>
          <h3 class="insight-title">{{ item.title }}</h3>
        </div>
        <span v-if="item.knowledgeNodeId" class="badge">{{ getNodeTitle(item.knowledgeNodeId) }}</span>
        <div v-if="item.content" class="insight-card-body">
          <MarkdownContent :content="item.content" />
        </div>
        <div class="insight-card-footer">
          <span class="muted">{{ new Date(item.createdAt).toLocaleDateString('zh-CN') }}</span>
          <button class="ghost" type="button" @click="startEdit(item)">编辑</button>
          <button class="ghost" type="button" style="color: var(--error)" @click="remove(item.id)">删除</button>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.search-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.search-input {
  flex: 1;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--outline);
  border-radius: var(--radius-sm);
  background: var(--surface-container-low);
  color: var(--on-surface);
  font-size: 0.85rem;
}

.count {
  font-size: 0.78rem;
  color: var(--on-surface-dim);
}

.insight-grid {
  display: grid;
  gap: 0.75rem;
}

.insight-card {
  border: 1px solid var(--outline);
  border-radius: var(--radius-lg);
  padding: 1.25rem;
  background: var(--surface-container-low);
  display: grid;
  gap: 0.6rem;
}

.insight-card-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.insight-icon {
  font-size: 1.1rem;
}

.insight-title {
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
}

.insight-card-body {
  font-size: 0.9rem;
  line-height: 1.6;
  padding: 0.75rem;
  border-radius: var(--radius-sm);
  background: var(--primary-muted);
  border-left: 3px solid var(--primary);
}

.insight-card-footer {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding-top: 0.5rem;
  border-top: 1px solid var(--outline);
}
</style>