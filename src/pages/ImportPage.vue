<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { listKnowledgeNodes } from '@/db/repositories/knowledgeRepository'
import { createCardWithInitialState } from '@/db/repositories/cardRepository'
import { createInitialReviewState } from '@/services/reviewScheduler'
import { parseMarkdownCards } from '@/services/markdownImportParser'
import { createId } from '@/utils/id'
import { nowIso, todayLocalDate } from '@/services/dateService'
import type { CardType, KnowledgeNode } from '@/types/domain'
import MarkdownContent from '@/components/common/MarkdownContent.vue'

interface PreviewCard {
  front: string
  back: string
  selected: boolean
}

const nodes = ref<KnowledgeNode[]>([])
const selectedNodeId = ref('')
const selectedType = ref<CardType>('CONCEPT')
const rawText = ref('')
const preview = ref<PreviewCard[]>([])
const message = ref('')
const error = ref('')

onMounted(async () => {
  nodes.value = await listKnowledgeNodes()
})

function parse() {
  error.value = ''
  message.value = ''
  const cards = parseMarkdownCards(rawText.value)
  if (cards.length === 0) {
    error.value = '未解析到卡片。请确保格式为 ## Q: 和 ## A: 交替。'
    return
  }
  preview.value = cards.map((c) => ({ ...c, selected: true }))
}

async function importCards() {
  if (!selectedNodeId.value) {
    error.value = '请选择目标知识点。'
    return
  }

  const node = nodes.value.find((n) => n.id === selectedNodeId.value)
  if (!node) return

  const toImport = preview.value.filter((c) => c.selected)
  if (toImport.length === 0) {
    error.value = '没有选中的卡片。'
    return
  }

  const now = nowIso()
  const today = todayLocalDate()

  for (const item of toImport) {
    const id = createId('card')
    await createCardWithInitialState(
      {
        id,
        knowledgeNodeId: node.id,
        subjectId: node.subjectId,
        type: selectedType.value,
        front: item.front,
        back: item.back,
        tags: [],
        verifiedStatus: 'UNVERIFIED',
        createdAt: now,
        updatedAt: now
      },
      createInitialReviewState(id, today, now)
    )
  }

  message.value = `已导入 ${toImport.length} 张卡片。`
  preview.value = []
  rawText.value = ''
}

function handleFile(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    rawText.value = reader.result as string
    parse()
  }
  reader.readAsText(file)
  input.value = ''
}
</script>

<template>
  <section class="page">
    <header class="page-header">
      <div>
        <h1 class="page-title">批量导入</h1>
        <p class="page-subtitle">从 Markdown 文本批量导入卡片。格式：## Q: 正面 ## A: 背面</p>
      </div>
    </header>

    <section class="panel form">
      <label>
        目标知识点
        <select v-model="selectedNodeId">
          <option value="" disabled>选择知识点…</option>
          <option v-for="node in nodes" :key="node.id" :value="node.id">
            {{ '—'.repeat(node.level) }} {{ node.title }}
          </option>
        </select>
      </label>

      <label>
        卡片类型
        <select v-model="selectedType">
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
        Markdown 内容
        <textarea v-model="rawText" rows="10" placeholder="## Q:&#10;什么是进程？&#10;## A:&#10;进程是程序的一次执行过程…&#10;&#10;## Q:&#10;进程和线程的区别？&#10;## A:&#10;进程是资源分配的基本单位…" />
      </label>

      <div class="actions">
        <button type="button" @click="parse">解析预览</button>
        <label class="file-upload-btn">
          <button class="secondary" type="button" @click="($refs.fileInput as HTMLInputElement)?.click()">上传 .md 文件</button>
        </label>
        <input ref="fileInput" type="file" accept=".md,.markdown,.txt" style="display: none" @change="handleFile" />
      </div>
    </section>

    <p v-if="error" class="panel" style="margin-top: 1rem; color: var(--danger)">{{ error }}</p>
    <p v-if="message" class="panel" style="margin-top: 1rem; color: var(--accent)">{{ message }}</p>

    <section v-if="preview.length" class="panel" style="margin-top: 1rem">
      <h2>预览（{{ preview.filter((c) => c.selected).length }} / {{ preview.length }}）</h2>

      <ul class="list" style="margin-top: 0.8rem">
        <li v-for="(card, idx) in preview" :key="idx" class="list-item">
          <label style="display: flex; align-items: center; gap: 0.5rem; font-weight: 600; color: var(--ink)">
            <input v-model="card.selected" type="checkbox" style="width: auto" />
            卡片 {{ idx + 1 }}
          </label>
          <div style="padding-left: 1.5rem; margin-top: 0.4rem">
            <div><span class="muted">Q：</span><MarkdownContent :content="card.front" /></div>
            <div style="margin-top: 0.3rem"><span class="muted">A：</span><MarkdownContent :content="card.back" /></div>
          </div>
        </li>
      </ul>

      <div class="actions" style="margin-top: 1rem">
        <button type="button" @click="importCards">导入选中卡片</button>
        <button class="secondary" type="button" @click="preview = []">清除预览</button>
      </div>
    </section>
  </section>
</template>
