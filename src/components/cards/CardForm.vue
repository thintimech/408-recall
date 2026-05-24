<script setup lang="ts">
import { onBeforeUnmount, reactive, ref, watch } from 'vue'
import type { CardType, KnowledgeNode, MemoryCard, VerifiedStatus } from '@/types/domain'
import type { CardFormModel } from '@/types/forms'
import { chatCompletionStream } from '@/services/llmService'
import { db } from '@/db'
import MarkdownContent from '@/components/common/MarkdownContent.vue'

const props = defineProps<{
  nodes: KnowledgeNode[]
  initialForm?: CardFormModel
  submitLabel: string
  excludeId?: string
}>()

const emit = defineEmits<{
  submit: [form: CardFormModel]
  cancel: []
}>()

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

const statuses: Array<{ value: VerifiedStatus; label: string }> = [
  { value: 'UNVERIFIED', label: '未校对' },
  { value: 'VERIFIED', label: '已校对' },
  { value: 'DOUBTFUL', label: '存疑' }
]

const form = reactive<CardFormModel>({
  knowledgeNodeId: null,
  type: 'CONCEPT',
  front: '',
  back: '',
  extra: '',
  tagsText: '',
  verifiedStatus: 'UNVERIFIED'
})

const previewField = ref<'front' | 'back' | 'extra' | null>(null)
const siblingCards = ref<MemoryCard[]>([])
const similarCards = ref<MemoryCard[]>([])
let searchTimer: ReturnType<typeof setTimeout> | null = null

watch(() => form.knowledgeNodeId, async (nodeId) => {
  if (!nodeId) {
    siblingCards.value = []
    return
  }
  siblingCards.value = await db.memoryCards
    .where('knowledgeNodeId').equals(nodeId)
    .toArray()
})

watch(() => form.front, (front) => {
  if (searchTimer) clearTimeout(searchTimer)
  if (!front || front.length < 4) {
    similarCards.value = []
    return
  }
  searchTimer = setTimeout(async () => {
    const query = front.toLowerCase().slice(0, 50)
    const all = await db.memoryCards.toArray()
    similarCards.value = all
      .filter((c) => {
        if (props.excludeId && c.id === props.excludeId) return false
        return c.front.toLowerCase().includes(query) || query.includes(c.front.toLowerCase().slice(0, 20))
      })
      .slice(0, 5)
  }, 500)
})

function togglePreview(field: 'front' | 'back' | 'extra') {
  previewField.value = previewField.value === field ? null : field
}

function insertSnippet(field: 'front' | 'back' | 'extra', snippet: string) {
  form[field] = (form[field] || '') + snippet
}

const aiLoading = ref(false)
const aiResult = ref('')
const aiMode = ref<'generate' | 'review' | null>(null)
const aiMissing = ref('')
let aiAbortController: AbortController | null = null

onBeforeUnmount(() => {
  aiAbortController?.abort()
})

async function aiGenerateAnswer() {
  if (!form.front.trim()) return
  aiLoading.value = true
  aiMode.value = 'generate'
  aiResult.value = ''
  aiMissing.value = ''

  try {
    aiAbortController = new AbortController()
    await chatCompletionStream(
      [
        { role: 'system', content: '你是 408 考研知识点助手。请根据用户给出的问题，生成简洁准确的答案，只保留关键点。支持 Markdown 格式，包括公式（$...$）和代码块。只输出答案内容，不要重复问题。' },
        { role: 'user', content: form.front }
      ],
      (chunk) => { aiResult.value += chunk },
      undefined,
      aiAbortController.signal
    )
  } catch (e) {
    aiResult.value = `错误：${e instanceof Error ? e.message : '生成失败'}`
  } finally {
    aiLoading.value = false
  }
}

const REVIEW_PROMPT = `你是 408 考研知识点审查助手。用户会给出一个问题和他写的答案。
请用以下固定格式输出审查结果：

## 正确
（列出答案中正确的关键点，每点一行，用 - 开头）

## 错误
（列出不准确或错误的地方，每点一行，用 - 开头，并给出正确内容）
（如果没有错误，写"无"）

## 遗漏
（列出答案中缺少的重要关键点，每点一行，用 - 开头）
（如果没有遗漏，写"无"）

注意：只关注关键点是否正确和完整，不评价表述质量。支持 Markdown。`

async function aiReviewAnswer() {
  if (!form.front.trim() || !form.back.trim()) return
  aiLoading.value = true
  aiMode.value = 'review'
  aiResult.value = ''
  aiMissing.value = ''

  try {
    aiAbortController = new AbortController()
    const fullText = await chatCompletionStream(
      [
        { role: 'system', content: REVIEW_PROMPT },
        { role: 'user', content: `问题：${form.front}\n\n我的答案：${form.back}` }
      ],
      (chunk) => { aiResult.value += chunk },
      undefined,
      aiAbortController.signal
    )
    extractMissing(fullText)
  } catch (e) {
    aiResult.value = `错误：${e instanceof Error ? e.message : '审查失败'}`
  } finally {
    aiLoading.value = false
  }
}

function extractMissing(text: string) {
  const match = text.match(/## 遗漏\s*\n([\s\S]*?)(?=\n##|$)/)
  if (!match) return
  const content = match[1].trim()
  if (content === '无' || !content) return
  aiMissing.value = content
}

function applyAiAnswer() {
  if (aiResult.value && aiMode.value === 'generate') {
    form.back = aiResult.value
  }
  aiResult.value = ''
  aiMode.value = null
  aiMissing.value = ''
}

function appendMissing() {
  if (aiMissing.value) {
    form.back = form.back.trimEnd() + '\n\n**补充：**\n' + aiMissing.value
    aiMissing.value = ''
  }
}

function dismissAiResult() {
  aiResult.value = ''
  aiMode.value = null
  aiMissing.value = ''
}

watch(
  () => props.initialForm,
  (value) => {
    if (value) Object.assign(form, value)
  },
  { immediate: true }
)

function submit() {
  emit('submit', { ...form })
}
</script>

<template>
  <form class="form" @submit.prevent="submit">
    <div class="grid two">
      <label>
        所属知识点
        <select v-model="form.knowledgeNodeId" required>
          <option :value="null" disabled>请选择知识点</option>
          <option v-for="node in nodes" :key="node.id" :value="node.id">
            {{ '　'.repeat(Math.max(0, node.level - 1)) }}{{ node.title }}
          </option>
        </select>
      </label>

      <label>
        卡片类型
        <select v-model="form.type">
          <option v-for="type in cardTypes" :key="type.value" :value="type.value">
            {{ type.label }}
          </option>
        </select>
      </label>
    </div>

    <!-- Sibling cards under same knowledge node -->
    <div v-if="siblingCards.length > 0" class="related-cards-hint">
      <div class="related-cards-header">
        <span>该知识点下已有 {{ siblingCards.length }} 张卡片</span>
      </div>
      <ul class="related-cards-list">
        <li v-for="c in siblingCards.slice(0, 6)" :key="c.id">{{ c.front }}</li>
      </ul>
      <span v-if="siblingCards.length > 6" class="muted">还有 {{ siblingCards.length - 6 }} 张…</span>
    </div>

    <label>
      正面问题
      <textarea v-model="form.front" required placeholder="支持 Markdown 和 LaTeX 公式（$...$）" />
      <div class="editor-toolbar">
        <button type="button" class="toolbar-btn" @click="insertSnippet('front', '`代码`')">代码</button>
        <button type="button" class="toolbar-btn" @click="insertSnippet('front', '\n```\n\n```\n')">代码块</button>
        <button type="button" class="toolbar-btn" @click="insertSnippet('front', '$公式$')">公式</button>
        <button type="button" class="toolbar-btn" @click="insertSnippet('front', '**加粗**')">加粗</button>
        <button type="button" class="toolbar-btn" @click="togglePreview('front')">
          {{ previewField === 'front' ? '关闭预览' : '预览' }}
        </button>
      </div>
      <div v-if="previewField === 'front'" class="editor-preview">
        <MarkdownContent :content="form.front" />
      </div>
      <!-- Similar cards warning -->
      <div v-if="similarCards.length > 0" class="similar-warning">
        <span class="similar-warning-title">可能重复或相关的卡片：</span>
        <ul class="related-cards-list">
          <li v-for="c in similarCards" :key="c.id">{{ c.front }}</li>
        </ul>
      </div>
    </label>

    <label>
      背面答案
      <textarea v-model="form.back" required placeholder="支持 Markdown 和 LaTeX 公式（$...$）" />
      <div class="editor-toolbar">
        <button type="button" class="toolbar-btn" @click="insertSnippet('back', '`代码`')">代码</button>
        <button type="button" class="toolbar-btn" @click="insertSnippet('back', '\n```\n\n```\n')">代码块</button>
        <button type="button" class="toolbar-btn" @click="insertSnippet('back', '$公式$')">公式</button>
        <button type="button" class="toolbar-btn" @click="insertSnippet('back', '| 列1 | 列2 |\n|---|---|\n| | |\n')">表格</button>
        <button type="button" class="toolbar-btn" @click="togglePreview('back')">
          {{ previewField === 'back' ? '关闭预览' : '预览' }}
        </button>
        <button type="button" class="toolbar-btn" :disabled="aiLoading || !form.front.trim()" @click="aiGenerateAnswer">
          {{ aiLoading && aiMode === 'generate' ? '生成中…' : 'AI 补全' }}
        </button>
        <button type="button" class="toolbar-btn" :disabled="aiLoading || !form.front.trim() || !form.back.trim()" @click="aiReviewAnswer">
          {{ aiLoading && aiMode === 'review' ? '审查中…' : 'AI 审查' }}
        </button>
      </div>
      <div v-if="previewField === 'back'" class="editor-preview">
        <MarkdownContent :content="form.back" />
      </div>
      <div v-if="aiResult" class="editor-preview" style="margin-top: 0.5rem; border-color: var(--accent)">
        <p style="margin: 0 0 0.4rem; font-size: 0.82rem; color: var(--accent); font-weight: 600">
          {{ aiMode === 'generate' ? 'AI 补全结果' : 'AI 审查结果' }}
        </p>
        <MarkdownContent :content="aiResult" />
        <div class="actions" style="margin-top: 0.6rem">
          <button v-if="aiMode === 'generate'" type="button" class="toolbar-btn" @click="applyAiAnswer">采用此答案</button>
          <button v-if="aiMode === 'review' && aiMissing" type="button" class="toolbar-btn" style="color: var(--accent)" @click="appendMissing">追加遗漏到答案</button>
          <button type="button" class="toolbar-btn" @click="dismissAiResult">关闭</button>
        </div>
      </div>
    </label>

    <label>
      补充说明
      <textarea v-model="form.extra" placeholder="可选：补充例子、易混点、来源提示（支持 Markdown）" />
      <div class="editor-toolbar">
        <button type="button" class="toolbar-btn" @click="togglePreview('extra')">
          {{ previewField === 'extra' ? '关闭预览' : '预览' }}
        </button>
      </div>
      <div v-if="previewField === 'extra' && form.extra" class="editor-preview">
        <MarkdownContent :content="form.extra" />
      </div>
    </label>

    <div class="grid two">
      <label>
        标签
        <input v-model="form.tagsText" placeholder="用空格或逗号分隔，例如 操作系统 易混淆" />
      </label>

      <label>
        校对状态
        <select v-model="form.verifiedStatus">
          <option v-for="status in statuses" :key="status.value" :value="status.value">
            {{ status.label }}
          </option>
        </select>
      </label>
    </div>

    <div class="actions">
      <button type="submit">{{ submitLabel }}</button>
      <button class="secondary" type="button" @click="emit('cancel')">取消</button>
    </div>
  </form>
</template>

<style scoped>
.related-cards-hint {
  padding: 0.75rem;
  border-radius: var(--radius-sm);
  background: var(--surface-container);
  border: 1px solid var(--outline);
  font-size: 0.8rem;
}

.related-cards-header {
  font-weight: 500;
  color: var(--on-surface-variant);
  margin-bottom: 0.4rem;
}

.related-cards-list {
  margin: 0;
  padding: 0 0 0 1.2rem;
  color: var(--on-surface-variant);
  line-height: 1.6;
}

.related-cards-list li {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.similar-warning {
  margin-top: 0.5rem;
  padding: 0.6rem 0.75rem;
  border-radius: var(--radius-sm);
  background: var(--error-muted);
  border: 1px solid rgba(248, 113, 113, 0.2);
  font-size: 0.8rem;
}

.similar-warning-title {
  font-weight: 500;
  color: var(--error);
  display: block;
  margin-bottom: 0.3rem;
}

.similar-warning .related-cards-list {
  color: var(--on-surface);
}
</style>
