<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  content: string
}>()

type RenderFn = (content: string) => string
let cachedRender: RenderFn | null = null

const html = ref('')

async function getRender(): Promise<RenderFn> {
  if (cachedRender) return cachedRender
  const mod = await import('@/services/markdownRenderer')
  cachedRender = mod.renderMarkdown
  return cachedRender
}

async function update() {
  if (!props.content) {
    html.value = ''
    return
  }
  const render = await getRender()
  html.value = render(props.content)
}

watch(() => props.content, update, { immediate: true })
</script>

<template>
  <div class="markdown-content" v-html="html" />
</template>
