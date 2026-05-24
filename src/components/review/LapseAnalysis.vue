<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import { chatCompletionStream } from '@/services/llmService'
import { db } from '@/db'
import MarkdownContent from '@/components/common/MarkdownContent.vue'
import type { ID } from '@/types/domain'

const props = defineProps<{
  cardId: ID
  cardFront: string
  lapseCount: number
}>()

const analysis = ref('')
const loading = ref(false)
const expanded = ref(false)
let abortController: AbortController | null = null

async function analyze() {
  if (loading.value) return
  expanded.value = true
  loading.value = true
  analysis.value = ''
  abortController = new AbortController()

  const card = await db.memoryCards.get(props.cardId)
  const node = card ? await db.knowledgeNodes.get(card.knowledgeNodeId) : undefined

  const prompt = `你是 408 考研遗忘分析助手。用户有一张卡片反复遗忘（已忘记 ${props.lapseCount} 次）。请分析可能的原因并给出具体建议。

分析方向：
- 卡片内容是否太抽象/太长，需要拆分？
- 是否缺少前置知识，需要先掌握其他概念？
- 是否容易和其他概念混淆，需要加对比卡？
- 记忆锚点是否不够，需要加助记或例子？

要求：2-4 条具体建议，每条一句话，用 - 开头。不要泛泛而谈。`

  try {
    await chatCompletionStream(
      [
        { role: 'system', content: prompt },
        { role: 'user', content: `知识点：${node?.title || '未知'}\n问题：${props.cardFront}\n答案：${card?.back || ''}` }
      ],
      (chunk) => { analysis.value += chunk },
      undefined,
      abortController.signal
    )
  } catch {
    if (!analysis.value) analysis.value = '分析失败，请重试。'
  } finally {
    loading.value = false
  }
}

onBeforeUnmount(() => {
  abortController?.abort()
})
</script>

<template>
  <div class="lapse-analysis">
    <button v-if="!expanded" class="ghost" type="button" @click="analyze">
      分析遗忘原因
    </button>
    <div v-else class="lapse-result">
      <MarkdownContent v-if="analysis" :content="analysis" />
      <span v-else class="muted">分析中…</span>
    </div>
  </div>
</template>

<style scoped>
.lapse-analysis {
  margin-top: 0.5rem;
}

.lapse-result {
  padding: 0.75rem;
  border-radius: var(--radius-md);
  background: var(--surface-container);
  border: 1px solid var(--outline);
  font-size: 0.85rem;
  line-height: 1.6;
}
</style>
