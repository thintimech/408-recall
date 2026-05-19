<script setup lang="ts">
import type { ReviewResult } from '@/types/domain'

defineProps<{
  disabled?: boolean
}>()

const emit = defineEmits<{
  answer: [result: ReviewResult]
}>()

const results: Array<{ value: ReviewResult; label: string; hint: string }> = [
  { value: 'FORGOT', label: '忘了', hint: '明天复习' },
  { value: 'HARD', label: '困难', hint: '短间隔复习' },
  { value: 'GOOD', label: '记得', hint: '正常延长' },
  { value: 'EASY', label: '熟练', hint: '更晚复习' }
]
</script>

<template>
  <div class="grid four" style="grid-template-columns: repeat(4, minmax(0, 1fr))">
    <button
      v-for="result in results"
      :key="result.value"
      class="secondary"
      type="button"
      :disabled="disabled"
      @click="emit('answer', result.value)"
    >
      <strong>{{ result.label }}</strong>
      <br />
      <small>{{ result.hint }}</small>
    </button>
  </div>
</template>
