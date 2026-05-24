<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import { chatCompletionStream } from '@/services/llmService'
import MarkdownContent from '@/components/common/MarkdownContent.vue'

const props = defineProps<{
  cardFront: string
  cardBack: string
  knowledgeNodeTitle: string
}>()

const emit = defineEmits<{ done: [] }>()

const probeQuestion = ref('')
const generating = ref(true)
const userAnswer = ref('')
const feedback = ref('')
const feedbackLoading = ref(false)
let abortController: AbortController | null = null

const PROBE_PROMPT = `你是 408 考研深度追问助手。用户刚复习了一张卡片，请基于卡片内容生成一个变式追问，用于测试更深层理解。

要求：
- 不要重复原题，要换个角度或加个条件
- 问题简短（一两句话）
- 只输出问题本身，不要前缀或解释`

const FEEDBACK_PROMPT = `你是 408 考研答案评价助手。用户回答了一个追问，请简短评价（2-3句话）：是否正确、是否完整、有无关键遗漏。支持 Markdown。`

async function generate() {
  abortController = new AbortController()
  try {
    await chatCompletionStream(
      [
        { role: 'system', content: PROBE_PROMPT },
        { role: 'user', content: `知识点：${props.knowledgeNodeTitle}\n问题：${props.cardFront}\n答案：${props.cardBack}` }
      ],
      (chunk) => { probeQuestion.value += chunk },
      undefined,
      abortController.signal
    )
  } catch {
    if (!probeQuestion.value) probeQuestion.value = '（生成失败）'
  } finally {
    generating.value = false
  }
}

async function submitAnswer() {
  if (!userAnswer.value.trim()) return
  feedbackLoading.value = true
  feedback.value = ''
  const ctrl = new AbortController()
  abortController = ctrl
  try {
    await chatCompletionStream(
      [
        { role: 'system', content: FEEDBACK_PROMPT },
        { role: 'user', content: `追问：${probeQuestion.value}\n用户回答：${userAnswer.value}\n参考知识：${props.cardBack}` }
      ],
      (chunk) => { feedback.value += chunk },
      undefined,
      ctrl.signal
    )
  } catch {
    if (!feedback.value) feedback.value = '评价生成失败。'
  } finally {
    feedbackLoading.value = false
  }
}

onBeforeUnmount(() => {
  abortController?.abort()
})

generate()
</script>

<template>
  <div class="probe-container">
    <div class="probe-header">
      <span class="badge">深度追问</span>
      <button class="ghost" type="button" @click="emit('done')">跳过</button>
    </div>

    <div class="probe-question">
      <MarkdownContent v-if="probeQuestion" :content="probeQuestion" />
      <span v-else class="muted">生成中…</span>
    </div>

    <div v-if="!feedback" class="probe-input">
      <textarea
        v-model="userAnswer"
        rows="2"
        placeholder="输入你的回答…（可选）"
        :disabled="generating"
        @keydown.ctrl.enter="submitAnswer"
      />
      <div class="probe-actions">
        <button type="button" :disabled="!userAnswer.trim() || feedbackLoading || generating" @click="submitAnswer">
          提交回答
        </button>
        <button class="ghost" type="button" @click="emit('done')">继续下一张</button>
      </div>
    </div>

    <div v-else class="probe-feedback">
      <MarkdownContent :content="feedback" />
      <button type="button" style="margin-top: 0.75rem" @click="emit('done')">继续下一张</button>
    </div>
  </div>
</template>

<style scoped>
.probe-container {
  width: 100%;
  max-width: 720px;
  display: grid;
  gap: 1rem;
}

.probe-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.probe-question {
  font-family: var(--font-content);
  font-size: 1.1rem;
  line-height: 1.6;
  padding: 1rem;
  border: 1px solid var(--outline);
  border-radius: var(--radius-md);
  background: var(--surface-container);
}

.probe-input {
  display: grid;
  gap: 0.6rem;
}

.probe-input textarea {
  min-height: unset;
}

.probe-actions {
  display: flex;
  gap: 0.5rem;
}

.probe-feedback {
  padding: 1rem;
  border: 1px solid var(--primary-muted);
  border-radius: var(--radius-md);
  background: var(--primary-muted);
}
</style>
