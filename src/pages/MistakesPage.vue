<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { listKnowledgeNodes } from '@/db/repositories/knowledgeRepository'
import {
  createMistakeNote,
  deleteMistakeNote,
  linkCardToMistake,
  listMistakeNotes
} from '@/db/repositories/mistakeRepository'
import { createCardWithInitialState } from '@/db/repositories/cardRepository'
import { createInitialReviewState } from '@/services/reviewScheduler'
import { createId } from '@/utils/id'
import { nowIso, todayLocalDate } from '@/services/dateService'
import type { KnowledgeNode, MistakeNote } from '@/types/domain'
import MarkdownContent from '@/components/common/MarkdownContent.vue'

const nodes = ref<KnowledgeNode[]>([])
const notes = ref<MistakeNote[]>([])
const showForm = ref(false)
const message = ref('')

const form = ref({
  knowledgeNodeId: '',
  source: '',
  summary: '',
  reason: ''
})

onMounted(async () => {
  nodes.value = await listKnowledgeNodes()
  notes.value = await listMistakeNotes()
})

async function submit() {
  if (!form.value.knowledgeNodeId || !form.value.summary.trim()) return

  await createMistakeNote({
    knowledgeNodeId: form.value.knowledgeNodeId,
    source: form.value.source.trim(),
    summary: form.value.summary.trim(),
    reason: form.value.reason.trim() || undefined,
    relatedCardIds: []
  })

  form.value = { knowledgeNodeId: '', source: '', summary: '', reason: '' }
  showForm.value = false
  notes.value = await listMistakeNotes()
  message.value = '错点已记录。'
}

async function remove(id: string) {
  if (!window.confirm('确定删除该错点记录？')) return
  await deleteMistakeNote(id)
  notes.value = await listMistakeNotes()
}

async function generateCard(note: MistakeNote) {
  const node = nodes.value.find((n) => n.id === note.knowledgeNodeId)
  if (!node) return

  const now = nowIso()
  const today = todayLocalDate()
  const id = createId('card')

  const front = note.source
    ? `【易错】${note.source}：${note.summary}`
    : `【易错】${note.summary}`
  const back = note.reason || '（请补充正确理解）'

  await createCardWithInitialState(
    {
      id,
      knowledgeNodeId: node.id,
      subjectId: node.subjectId,
      type: 'MISTAKE',
      front,
      back,
      tags: ['易错'],
      verifiedStatus: 'UNVERIFIED',
      createdAt: now,
      updatedAt: now
    },
    createInitialReviewState(id, today, now)
  )

  await linkCardToMistake(note.id, id)
  notes.value = await listMistakeNotes()
  message.value = '已生成易错卡并关联到该错点。'
}

function getNodeTitle(nodeId: string): string {
  return nodes.value.find((n) => n.id === nodeId)?.title || '未知'
}
</script>

<template>
  <section class="page">
    <header class="page-header">
      <div>
        <p class="page-eyebrow">Diagnosis Center</p>
        <h1 class="page-title">错题诊断</h1>
        <p class="page-subtitle">记录薄弱点，定位根因，生成针对性复习卡。</p>
      </div>
      <button type="button" @click="showForm = !showForm">
        {{ showForm ? '收起' : '新增错点' }}
      </button>
    </header>

    <div v-if="message" class="toast-inline" style="margin-bottom: 1rem">
      {{ message }}
    </div>

    <!-- New Mistake Form -->
    <section v-if="showForm" class="panel form" style="margin-bottom: 1.5rem">
      <label>
        关联知识点
        <select v-model="form.knowledgeNodeId">
          <option value="" disabled>选择知识点…</option>
          <option v-for="node in nodes" :key="node.id" :value="node.id">
            {{ '—'.repeat(node.level) }} {{ node.title }}
          </option>
        </select>
      </label>
      <label>
        来源
        <input v-model="form.source" type="text" placeholder="如：2021 年真题第 37 题" />
      </label>
      <label>
        暴露问题
        <textarea v-model="form.summary" placeholder="描述错误原因或暴露的知识盲区…" rows="3" />
      </label>
      <label>
        正确理解（可选）
        <textarea v-model="form.reason" placeholder="正确的理解方式或记忆要点…" rows="3" />
      </label>
      <div class="actions">
        <button type="button" :disabled="!form.knowledgeNodeId || !form.summary.trim()" @click="submit">保存错点</button>
      </div>
    </section>

    <!-- Mistake List -->
    <section v-if="notes.length === 0 && !showForm" class="empty">
      暂无错点记录，点击"新增错点"开始记录。
    </section>

    <div v-else class="mistake-grid">
      <article v-for="note in notes" :key="note.id" class="mistake-card">
        <div class="mistake-card-header">
          <span class="badge">{{ getNodeTitle(note.knowledgeNodeId) }}</span>
          <span v-if="note.source" class="mistake-source">{{ note.source }}</span>
        </div>

        <div class="mistake-card-body">
          <div class="mistake-label">问题描述</div>
          <MarkdownContent :content="note.summary" />
        </div>

        <div v-if="note.reason" class="mistake-card-correction">
          <div class="mistake-label">正确理解</div>
          <MarkdownContent :content="note.reason" />
        </div>

        <div class="mistake-card-footer">
          <button class="ghost" type="button" @click="generateCard(note)">
            生成易错卡
          </button>
          <button class="ghost" type="button" style="color: var(--error)" @click="remove(note.id)">
            删除
          </button>
          <span v-if="note.relatedCardIds.length" class="muted" style="margin-left: auto; font-size: 0.75rem">
            已关联 {{ note.relatedCardIds.length }} 张卡
          </span>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.toast-inline {
  padding: 0.6rem 1rem;
  border-radius: var(--radius-sm);
  font-size: 0.85rem;
  font-weight: 500;
  background: var(--primary-muted);
  color: var(--primary);
  border: 1px solid rgba(16, 185, 129, 0.25);
}

.mistake-grid {
  display: grid;
  gap: 0.75rem;
}

.mistake-card {
  border: 1px solid var(--outline);
  border-radius: var(--radius-lg);
  padding: 1.25rem;
  background: var(--surface-container-low);
  display: grid;
  gap: 0.85rem;
}

.mistake-card-header {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.mistake-source {
  font-size: 0.78rem;
  color: var(--on-surface-variant);
}

.mistake-label {
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--on-surface-dim);
  margin-bottom: 0.3rem;
}

.mistake-card-body {
  font-size: 0.9rem;
  line-height: 1.6;
}

.mistake-card-correction {
  padding: 0.75rem;
  border-radius: var(--radius-sm);
  background: var(--primary-muted);
  border-left: 3px solid var(--primary);
  font-size: 0.88rem;
}

.mistake-card-footer {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding-top: 0.5rem;
  border-top: 1px solid var(--outline);
}
</style>
