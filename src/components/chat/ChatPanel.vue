<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { chatCompletionStream, type ChatMessage } from '@/services/llmService'
import MarkdownContent from '@/components/common/MarkdownContent.vue'

const props = defineProps<{
  context: string
  open: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

interface DisplayMessage {
  role: 'user' | 'assistant'
  content: string
}

const messages = ref<DisplayMessage[]>([])
const input = ref('')
const streaming = ref(false)
const error = ref('')
const messagesEl = ref<HTMLElement | null>(null)
let abortController: AbortController | null = null

onBeforeUnmount(() => {
  abortController?.abort()
})

watch(() => props.open, (isOpen) => {
  if (!isOpen) {
    messages.value = []
    input.value = ''
    error.value = ''
  }
})

function scrollToBottom() {
  nextTick(() => {
    if (messagesEl.value) {
      messagesEl.value.scrollTop = messagesEl.value.scrollHeight
    }
  })
}

async function send() {
  const text = input.value.trim()
  if (!text || streaming.value) return

  messages.value.push({ role: 'user', content: text })
  input.value = ''
  streaming.value = true
  error.value = ''

  messages.value.push({ role: 'assistant', content: '' })
  const assistantIdx = messages.value.length - 1
  scrollToBottom()

  const systemMessage: ChatMessage = {
    role: 'system',
    content: `你是 408 考研知识点助手。用户正在复习以下内容，请基于此上下文回答问题。\n---\n${props.context}\n---\n请用简洁准确的中文回答，支持 Markdown 格式。`
  }

  const history: ChatMessage[] = [
    systemMessage,
    ...messages.value.slice(0, -1).map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content
    }))
  ]

  try {
    abortController = new AbortController()
    await chatCompletionStream(
      history,
      (chunk) => {
        messages.value[assistantIdx].content += chunk
        scrollToBottom()
      },
      undefined,
      abortController.signal
    )
  } catch (e) {
    error.value = e instanceof Error ? e.message : '请求失败。'
    messages.value.pop()
  } finally {
    streaming.value = false
    scrollToBottom()
  }
}

function clear() {
  messages.value = []
  error.value = ''
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    send()
  }
}
</script>

<template>
  <aside class="chat-panel">
    <header class="chat-header">
      <strong>AI 助手</strong>
      <div class="actions">
        <button class="toolbar-btn" type="button" @click="clear">清空</button>
        <button class="toolbar-btn" type="button" @click="emit('close')">关闭</button>
      </div>
    </header>

    <div class="chat-context">
      <span class="muted">当前上下文：</span>
      <p class="chat-context-text">{{ context.slice(0, 120) }}{{ context.length > 120 ? '…' : '' }}</p>
    </div>

    <div ref="messagesEl" class="chat-messages">
      <div v-if="messages.length === 0" class="chat-empty muted">
        输入问题开始对话，AI 已了解当前卡片内容。
      </div>
      <div
        v-for="(msg, idx) in messages"
        :key="idx"
        class="chat-bubble"
        :class="msg.role"
      >
        <MarkdownContent v-if="msg.role === 'assistant' && msg.content" :content="msg.content" />
        <span v-else-if="msg.role === 'assistant'" class="muted">思考中…</span>
        <span v-else>{{ msg.content }}</span>
      </div>
    </div>

    <p v-if="error" class="chat-error">{{ error }}</p>

    <footer class="chat-input-area">
      <textarea
        v-model="input"
        placeholder="问点什么…（Enter 发送，Shift+Enter 换行）"
        rows="2"
        :disabled="streaming"
        @keydown="handleKeydown"
      />
      <button type="button" :disabled="!input.trim() || streaming" @click="send">发送</button>
    </footer>
  </aside>
</template>
