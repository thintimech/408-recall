<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { listKnowledgeNodes } from '@/db/repositories/knowledgeRepository'
import { createCardWithInitialState } from '@/db/repositories/cardRepository'
import { createInitialReviewState } from '@/services/reviewScheduler'
import {
  exportAnkiTsv,
  exportMarkdownDoc,
  parseAnkiTsv,
  type AnkiFormat,
  type AnkiImportCard
} from '@/services/ankiExportService'
import { createId } from '@/utils/id'
import { nowIso, todayLocalDate } from '@/services/dateService'
import type { CardType, KnowledgeNode } from '@/types/domain'
import { db } from '@/db'

const nodes = ref<KnowledgeNode[]>([])
const message = ref('')
const error = ref('')

const exportSubjectId = ref('')
const exportNodeId = ref('')
const exportFormat = ref<AnkiFormat>('html')

const importNodeId = ref('')
const importType = ref<CardType>('CONCEPT')
const importPreview = ref<AnkiImportCard[]>([])

onMounted(async () => {
  nodes.value = await listKnowledgeNodes()
})

const subjects = () => nodes.value.filter((n) => n.level === 0)
const childNodes = () =>
  nodes.value.filter((n) => n.level > 0 && (!exportSubjectId.value || n.subjectId === exportSubjectId.value))

function download(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

async function doAnkiExport() {
  error.value = ''
  try {
    const tsv = await exportAnkiTsv(
      { subjectId: exportSubjectId.value || undefined, knowledgeNodeId: exportNodeId.value || undefined },
      exportFormat.value
    )
    if (!tsv.trim()) {
      error.value = '没有符合条件的卡片可导出。'
      return
    }
    download(tsv, `408-recall-anki-${Date.now()}.txt`, 'text/tab-separated-values')
    message.value = 'Anki TSV 文件已下载。'
  } catch (e) {
    error.value = e instanceof Error ? e.message : '导出失败。'
  }
}

async function doMarkdownExport() {
  error.value = ''
  try {
    const md = await exportMarkdownDoc(
      { subjectId: exportSubjectId.value || undefined, knowledgeNodeId: exportNodeId.value || undefined }
    )
    if (!md.trim()) {
      error.value = '没有符合条件的卡片可导出。'
      return
    }
    download(md, `408-recall-export-${Date.now()}.md`, 'text/markdown')
    message.value = 'Markdown 文件已下载。'
  } catch (e) {
    error.value = e instanceof Error ? e.message : '导出失败。'
  }
}

function handleImportFile(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    const text = reader.result as string
    const cards = parseAnkiTsv(text)
    if (cards.length === 0) {
      error.value = '未解析到卡片，请确认文件为 TSV 格式。'
      return
    }
    importPreview.value = cards
    message.value = ''
    error.value = ''
  }
  reader.readAsText(file)
  input.value = ''
}

async function doImport() {
  if (!importNodeId.value) {
    error.value = '请选择目标知识点。'
    return
  }

  const node = nodes.value.find((n) => n.id === importNodeId.value)
  if (!node) return

  const existingCards = await db.memoryCards.toArray()
  const existingFronts = new Set(existingCards.map((c) => c.front.trim()))

  const now = nowIso()
  const today = todayLocalDate()
  let imported = 0

  for (const item of importPreview.value) {
    if (existingFronts.has(item.front.trim())) continue

    const id = createId('card')
    await createCardWithInitialState(
      {
        id,
        knowledgeNodeId: node.id,
        subjectId: node.subjectId,
        type: importType.value,
        front: item.front,
        back: item.back,
        tags: item.tags,
        verifiedStatus: 'UNVERIFIED',
        createdAt: now,
        updatedAt: now
      },
      createInitialReviewState(id, today, now)
    )
    imported++
  }

  const skipped = importPreview.value.length - imported
  message.value = `已导入 ${imported} 张卡片${skipped ? `，跳过 ${skipped} 张重复卡片` : ''}。`
  importPreview.value = []
}
</script>

<template>
  <section class="page">
    <header class="page-header">
      <div>
        <h1 class="page-title">导出 / 导入</h1>
        <p class="page-subtitle">Anki TSV 和 Markdown 格式导出，支持 Anki 增量导入。</p>
      </div>
    </header>

    <p v-if="message" class="panel" style="margin-bottom: 1rem; color: var(--accent)">{{ message }}</p>
    <p v-if="error" class="panel" style="margin-bottom: 1rem; color: var(--danger)">{{ error }}</p>

    <section class="panel form">
      <h2>导出卡片</h2>
      <div class="grid three">
        <label>
          科目
          <select v-model="exportSubjectId">
            <option value="">全部科目</option>
            <option v-for="s in subjects()" :key="s.id" :value="s.id">{{ s.title }}</option>
          </select>
        </label>
        <label>
          知识点
          <select v-model="exportNodeId">
            <option value="">全部知识点</option>
            <option v-for="n in childNodes()" :key="n.id" :value="n.id">{{ n.title }}</option>
          </select>
        </label>
        <label>
          Anki 格式
          <select v-model="exportFormat">
            <option value="html">HTML（推荐，公式可见）</option>
            <option value="markdown">Markdown 原文</option>
          </select>
        </label>
      </div>
      <div class="actions" style="margin-top: 0.8rem">
        <button type="button" @click="doAnkiExport">导出 Anki TSV</button>
        <button class="secondary" type="button" @click="doMarkdownExport">导出 Markdown</button>
      </div>
    </section>

    <section class="panel form" style="margin-top: 1.5rem">
      <h2>从 Anki TSV 导入</h2>
      <p class="muted">支持 Anki 导出的 TSV 文件（正面 TAB 背面 TAB 标签）。已有相同正面内容的卡片会自动跳过。</p>
      <div class="grid three">
        <label>
          目标知识点
          <select v-model="importNodeId">
            <option value="" disabled>选择知识点…</option>
            <option v-for="n in nodes.filter((n) => n.level > 0)" :key="n.id" :value="n.id">
              {{ '—'.repeat(n.level) }} {{ n.title }}
            </option>
          </select>
        </label>
        <label>
          卡片类型
          <select v-model="importType">
            <option value="CONCEPT">概念卡</option>
            <option value="COMPARE">对比卡</option>
            <option value="CLOZE">填空卡</option>
            <option value="PROCESS">流程卡</option>
            <option value="FORMULA">公式卡</option>
            <option value="MISTAKE">易错卡</option>
            <option value="BIG_QUESTION">大题模板卡</option>
          </select>
        </label>
        <label>
          TSV 文件
          <input type="file" accept=".txt,.tsv" @change="handleImportFile" />
        </label>
      </div>

      <div v-if="importPreview.length" style="margin-top: 0.8rem">
        <p class="muted">解析到 {{ importPreview.length }} 张卡片，点击导入。</p>
        <div class="actions" style="margin-top: 0.5rem">
          <button type="button" @click="doImport">导入</button>
          <button class="secondary" type="button" @click="importPreview = []">取消</button>
        </div>
      </div>
    </section>
  </section>
</template>
