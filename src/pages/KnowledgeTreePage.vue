<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import KnowledgeNodeForm from '@/components/knowledge/KnowledgeNodeForm.vue'
import { useKnowledgeStore } from '@/stores/knowledgeStore'
import type { KnowledgeNode, ID } from '@/types/domain'
import type { KnowledgeNodeFormModel } from '@/types/forms'

const store = useKnowledgeStore()
const editingNode = ref<KnowledgeNode | null>(null)
const formVisible = ref(false)
const expandedSubjects = ref<Set<ID>>(new Set())
const message = ref('')

onMounted(async () => {
  await store.load()
  store.subjects.forEach((s) => expandedSubjects.value.add(s.id))
})

interface TreeGroup {
  subject: KnowledgeNode
  chapters: Array<{ node: KnowledgeNode; cardCount: number }>
  totalCards: number
}

const treeGroups = computed<TreeGroup[]>(() => {
  return store.subjects.map((subject) => {
    const chapters = store.nodes
      .filter((n) => n.parentId === subject.id)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((node) => ({
        node,
        cardCount: store.cardCounts[node.id] || 0
      }))
    const totalCards = chapters.reduce((sum, ch) => sum + ch.cardCount, 0)
    return { subject, chapters, totalCards }
  })
})

function toggleSubject(id: ID) {
  const s = new Set(expandedSubjects.value)
  if (s.has(id)) s.delete(id)
  else s.add(id)
  expandedSubjects.value = s
}

async function submit(form: KnowledgeNodeFormModel) {
  if (editingNode.value) {
    await store.updateNode(editingNode.value.id, form)
    message.value = '知识点已更新。'
  } else {
    await store.createNode(form)
    message.value = '知识点已创建。'
  }
  editingNode.value = null
  formVisible.value = false
}

function edit(node: KnowledgeNode) {
  editingNode.value = node
  formVisible.value = true
}

async function remove(node: KnowledgeNode) {
  if (!window.confirm(`确定删除「${node.title}」吗？`)) return
  try {
    await store.removeNode(node.id)
  } catch (error) {
    window.alert(error instanceof Error ? error.message : '删除失败。')
  }
}
</script>

<template>
  <section class="page">
    <header class="page-header">
      <div>
        <p class="page-eyebrow">Knowledge Map</p>
        <h1 class="page-title">知识图谱</h1>
        <p class="page-subtitle">408 四门课知识结构，点击展开查看章节。</p>
      </div>
      <button type="button" @click="formVisible = true">新增节点</button>
    </header>

    <section v-if="formVisible" class="panel" style="margin-bottom: 1.25rem">
      <KnowledgeNodeForm
        :nodes="store.nodes"
        :editing-node="editingNode"
        @submit="submit"
        @cancel="() => { formVisible = false; editingNode = null }"
      />
    </section>

    <p v-if="store.error" class="panel" style="color: var(--error)">{{ store.error }}</p>
    <p v-if="message" class="panel" style="color: var(--primary); margin-bottom: 1rem">{{ message }}</p>

    <div class="knowledge-tree">
      <div v-for="group in treeGroups" :key="group.subject.id" class="kt-subject">
        <div class="kt-subject-header" @click="toggleSubject(group.subject.id)">
          <div class="kt-subject-info">
            <span
              class="material-symbols-outlined kt-chevron"
              :class="{ expanded: expandedSubjects.has(group.subject.id) }"
            >chevron_right</span>
            <strong>{{ group.subject.title }}</strong>
          </div>
          <div class="kt-subject-meta">
            <span class="badge">{{ group.totalCards }} 张卡片</span>
            <span class="muted">{{ group.chapters.length }} 章</span>
          </div>
        </div>

        <div v-if="expandedSubjects.has(group.subject.id)" class="kt-chapters">
          <div
            v-for="ch in group.chapters"
            :key="ch.node.id"
            class="kt-chapter"
            @click="edit(ch.node)"
          >
            <div class="kt-chapter-info">
              <span class="material-symbols-outlined kt-chapter-icon">article</span>
              <div>
                <span class="kt-chapter-title">{{ ch.node.title }}</span>
                <span v-if="ch.node.description" class="kt-chapter-desc">{{ ch.node.description }}</span>
              </div>
            </div>
            <div class="kt-chapter-right">
              <span class="badge">{{ ch.cardCount }}</span>
              <span class="material-symbols-outlined kt-edit-icon">edit</span>
              <span
                class="material-symbols-outlined kt-delete-icon"
                @click.stop="remove(ch.node)"
              >delete</span>
            </div>
          </div>
          <div v-if="group.chapters.length === 0" class="kt-empty">
            暂无章节
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.knowledge-tree {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.kt-subject {
  border: 1px solid var(--outline);
  border-radius: var(--radius-lg);
  background: var(--surface-container-low);
  overflow: hidden;
}

.kt-subject-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  cursor: pointer;
  transition: background var(--transition-fast);
}

.kt-subject-header:hover {
  background: var(--surface-container);
}

.kt-subject-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.kt-subject-info strong {
  font-size: 1rem;
}

.kt-chevron {
  font-size: 20px;
  transition: transform var(--transition-fast);
  color: var(--on-surface-variant);
}

.kt-chevron.expanded {
  transform: rotate(90deg);
}

.kt-subject-meta {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.8rem;
}

.kt-chapters {
  border-top: 1px solid var(--outline);
  padding: 0.5rem;
}

.kt-chapter {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.6rem 0.75rem;
  border-radius: var(--radius-sm);
  transition: background var(--transition-fast);
}

.kt-chapter:hover {
  background: var(--surface-container);
}

.kt-chapter-info {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.kt-chapter-icon {
  font-size: 18px;
  color: var(--on-surface-dim);
}

.kt-chapter-title {
  font-size: 0.88rem;
  font-weight: 450;
  display: block;
}

.kt-chapter-desc {
  font-size: 0.75rem;
  color: var(--on-surface-variant);
  display: block;
}

.kt-chapter-right {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.kt-edit-icon {
  font-size: 16px;
  color: var(--on-surface-dim);
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.kt-chapter:hover .kt-edit-icon {
  opacity: 1;
}

.kt-delete-icon {
  font-size: 16px;
  color: var(--on-surface-dim);
  opacity: 0;
  cursor: pointer;
  transition: opacity var(--transition-fast), color var(--transition-fast);
}

.kt-chapter:hover .kt-delete-icon {
  opacity: 0.4;
}

.kt-delete-icon:hover {
  opacity: 1 !important;
  color: var(--error);
}

.kt-empty {
  padding: 1rem;
  text-align: center;
  color: var(--on-surface-variant);
  font-size: 0.85rem;
}
</style>
