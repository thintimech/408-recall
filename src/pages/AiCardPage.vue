<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { listKnowledgeNodes } from '@/db/repositories/knowledgeRepository'
import { createCardWithInitialState } from '@/db/repositories/cardRepository'
import { createInitialReviewState } from '@/services/reviewScheduler'
import { chatCompletionStream, getActiveProvider, getLlmConfig } from '@/services/llmService'
import { getPromptTemplate, PROMPT_TEMPLATES } from '@/data/prompts'
import { createId } from '@/utils/id'
import { nowIso, todayLocalDate } from '@/services/dateService'
import { db } from '@/db'
import type { CardType, KnowledgeNode, MemoryCard } from '@/types/domain'
import MarkdownContent from '@/components/common/MarkdownContent.vue'

interface GeneratedCard {
  front: string
  back: string
  accepted: boolean
}

const nodes = ref<KnowledgeNode[]>([])
const selectedNodeId = ref('')
const selectedType = ref<CardType>('CONCEPT')
const userContent = ref('')
const generating = ref(false)
const streamText = ref('')
const generatedCards = ref<GeneratedCard[]>([])
const error = ref('')
const savedCount = ref(0)
const granularity = ref(3)
let abortController: AbortController | null = null

onBeforeUnmount(() => {
  abortController?.abort()
})

const selectedNode = computed(() => nodes.value.find((n) => n.id === selectedNodeId.value))

onMounted(async () => {
  nodes.value = await listKnowledgeNodes()
})

async function generate() {
  if (!selectedNodeId.value) {
    error.value = '请选择一个知识点。'
    return
  }
  if (!userContent.value.trim()) {
    error.value = '请输入内容。'
    return
  }

  const config = await getLlmConfig()
  const provider = getActiveProvider(config)
  if (!provider?.apiKey) {
    error.value = '请先在设置页配置 API Key。'
    return
  }

  error.value = ''
  generating.value = true
  streamText.value = ''
  generatedCards.value = []
  savedCount.value = 0
  abortController = new AbortController()

  const template = getPromptTemplate(selectedType.value)

  try {
    const existingCards = await db.memoryCards
      .where('knowledgeNodeId').equals(selectedNodeId.value)
      .toArray()

    let contextHint = ''
    if (existingCards.length > 0) {
      const existingFronts = existingCards.slice(0, 15).map((c) => `- ${c.front}`).join('\n')
      contextHint = `\n\n【注意】该知识点下已有以下卡片，请避免重复，并尽量生成能与已有卡片衔接、互补的新卡片：\n${existingFronts}`
    }

    const fullText = await chatCompletionStream(
      [
        { role: 'system', content: template.systemPrompt },
        { role: 'user', content: template.userPromptPrefix + userContent.value + contextHint }
      ],
      (chunk) => {
        streamText.value += chunk
      },
      config,
      abortController!.signal
    )

    const parsed = parseCards(fullText)
    if (parsed.length === 0) {
      error.value = 'AI 返回内容无法解析为卡片，请重试或调整输入。'
    } else {
      generatedCards.value = parsed.map((c) => ({ ...c, accepted: true }))
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : '生成失败。'
  } finally {
    generating.value = false
  }
}

function parseCards(text: string): { front: string; back: string }[] {
  const jsonMatch = text.match(/\[[\s\S]*\]/)
  if (!jsonMatch) return []
  try {
    const arr = JSON.parse(jsonMatch[0])
    if (!Array.isArray(arr)) return []
    return arr.filter((item) => item.front && item.back)
  } catch {
    return []
  }
}

const saving = ref(false)

async function saveAccepted() {
  const node = selectedNode.value
  if (!node) return

  const toSave = generatedCards.value.filter((c) => c.accepted)
  if (toSave.length === 0) {
    error.value = '没有选中的卡片。'
    return
  }

  saving.value = true
  const now = nowIso()
  const today = todayLocalDate()

  for (const item of toSave) {
    const id = createId('card')
    const card: MemoryCard = {
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
    }
    await createCardWithInitialState(card, createInitialReviewState(id, today, now))
  }

  savedCount.value = toSave.length
  generatedCards.value = []
  streamText.value = ''
  saving.value = false
}
</script>

<template>
  <section class="ai-workbench">
    <!-- Left: Config Panel -->
    <aside class="ai-config">
      <h2 class="ai-section-title">Extraction Rules</h2>
      <p class="ai-section-sub">生成规则</p>

      <label>
        知识点
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
          <option v-for="t in PROMPT_TEMPLATES" :key="t.type" :value="t.type">
            {{ t.label }}
          </option>
        </select>
      </label>

      <label>
        <span>颗粒度 <span class="muted">{{ granularity <= 2 ? '简要' : granularity >= 4 ? '深入' : '适中' }}</span></span>
        <input v-model.number="granularity" type="range" min="1" max="5" step="1" />
      </label>

      <button
        type="button"
        style="margin-top: auto; width: 100%"
        :disabled="generating"
        @click="generate"
      >
        {{ generating ? '生成中…' : '生成卡片' }}
      </button>
    </aside>

    <!-- Center: Source Reader -->
    <main class="ai-source">
      <h2 class="ai-section-title">Source Reader</h2>
      <p class="ai-section-sub">内容输入</p>
      <textarea
        v-model="userContent"
        class="ai-source-textarea"
        placeholder="粘贴教材内容、笔记或知识点描述…&#10;&#10;支持 Markdown 格式，AI 将从中提取关键信息生成卡片。"
      />
      <div v-if="generating && streamText" class="ai-stream">
        <div class="ai-stream-header">
          <span class="generating-dots" />
          <span class="muted">正在生成…</span>
        </div>
        <pre class="ai-stream-output">{{ streamText }}</pre>
      </div>
      <div v-if="error" class="toast-inline toast-error" style="margin-top: 0.75rem">
        {{ error }}
      </div>
      <div v-if="savedCount" class="toast-inline" style="margin-top: 0.75rem">
        已保存 {{ savedCount }} 张卡片。
      </div>
    </main>

    <!-- Right: Draft Cards -->
    <aside class="ai-drafts">
      <h2 class="ai-section-title">
        Draft Cards
        <span v-if="generatedCards.length" class="muted" style="font-weight: 400">
          ({{ generatedCards.filter(c => c.accepted).length }}/{{ generatedCards.length }})
        </span>
      </h2>
      <p class="ai-section-sub">卡片草稿</p>

      <div v-if="!generatedCards.length && !generating" class="ai-drafts-empty">
        <p class="muted">生成的卡片将显示在这里</p>
      </div>

      <div v-if="generating && !generatedCards.length" class="ai-drafts-loading">
        <span class="generating-dots" />
        <span class="muted">等待生成结果…</span>
      </div>

      <ul v-if="generatedCards.length" class="ai-draft-list">
        <li v-for="(card, idx) in generatedCards" :key="idx" class="ai-draft-card" :class="{ rejected: !card.accepted }">
          <label class="ai-draft-check">
            <input v-model="card.accepted" type="checkbox" />
            <span>卡片 {{ idx + 1 }}</span>
          </label>
          <div class="ai-draft-content">
            <div class="ai-draft-front">
              <MarkdownContent :content="card.front" />
            </div>
            <div class="ai-draft-back">
              <MarkdownContent :content="card.back" />
            </div>
          </div>
        </li>
      </ul>

      <button
        v-if="generatedCards.length"
        type="button"
        class="ai-save-btn"
        :disabled="saving"
        @click="saveAccepted"
      >
        {{ saving ? '保存中…' : `保存选中卡片（${generatedCards.filter(c => c.accepted).length}）` }}
      </button>
    </aside>
  </section>
</template>

<style scoped>
.ai-workbench {
  display: grid;
  grid-template-columns: 240px 1fr 320px;
  gap: 1px;
  margin: calc(-1 * 1.5rem) -2rem -2rem;
  height: calc(100vh - var(--topbar-height));
  background: var(--outline);
}

.ai-config,
.ai-source,
.ai-drafts {
  background: var(--surface);
  padding: 1.25rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.ai-config {
  background: var(--surface-container-low);
}

.ai-drafts {
  background: var(--surface-container-low);
}

.ai-section-title {
  margin: 0;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--on-surface-variant);
}

.ai-section-sub {
  margin: 0;
  font-size: 0.72rem;
  color: var(--on-surface-dim);
}

.ai-source-textarea {
  flex: 1;
  min-height: 200px;
  resize: none;
  font-family: var(--font-content);
  font-size: 0.95rem;
  line-height: 1.7;
  border-radius: var(--radius-md);
}

.ai-stream {
  border: 1px solid var(--outline);
  border-radius: var(--radius-md);
  padding: 0.75rem;
  background: var(--surface-container-low);
}

.ai-stream-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.ai-stream-output {
  white-space: pre-wrap;
  word-break: break-all;
  font-size: 0.8rem;
  max-height: 160px;
  overflow-y: auto;
  margin: 0;
  color: var(--on-surface-variant);
}

.ai-drafts-empty,
.ai-drafts-loading {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.ai-draft-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  flex: 1;
  overflow-y: auto;
}

.ai-draft-card {
  border: 1px solid var(--outline);
  border-radius: var(--radius-md);
  padding: 0.75rem;
  background: var(--surface-container);
  transition: opacity var(--transition-fast);
}

.ai-draft-card.rejected {
  opacity: 0.4;
}

.ai-draft-check {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--on-surface-variant);
  margin-bottom: 0.5rem;
}

.ai-draft-check input[type='checkbox'] {
  width: auto;
}

.ai-draft-front {
  font-size: 0.85rem;
  font-weight: 500;
  margin-bottom: 0.4rem;
}

.ai-draft-back {
  font-size: 0.8rem;
  color: var(--on-surface-variant);
  border-top: 1px solid var(--outline);
  padding-top: 0.4rem;
}

.ai-save-btn {
  width: 100%;
  margin-top: auto;
}

.generating-dots {
  display: inline-flex;
  gap: 3px;
}

.generating-dots::before,
.generating-dots::after,
.generating-dots {
  content: '';
}

.generating-dots::before,
.generating-dots::after {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--primary);
  animation: pulse-dot 1.2s infinite;
}

.generating-dots::after {
  animation-delay: 0.4s;
}

@keyframes pulse-dot {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
}

.toast-inline {
  padding: 0.6rem 1rem;
  border-radius: var(--radius-sm);
  font-size: 0.85rem;
  font-weight: 500;
  background: var(--primary-muted);
  color: var(--primary);
  border: 1px solid rgba(16, 185, 129, 0.25);
}

.toast-inline.toast-error {
  background: var(--error-muted);
  color: var(--error);
  border-color: rgba(248, 113, 113, 0.25);
}

@media (max-width: 860px) {
  .ai-workbench {
    grid-template-columns: 1fr;
    height: auto;
    margin: 0;
  }

  .ai-config,
  .ai-source,
  .ai-drafts {
    min-height: auto;
  }

  .ai-source-textarea {
    min-height: 150px;
  }
}
</style>
