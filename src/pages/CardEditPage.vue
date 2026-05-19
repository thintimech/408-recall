<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CardForm from '@/components/cards/CardForm.vue'
import { useCardStore } from '@/stores/cardStore'
import { useKnowledgeStore } from '@/stores/knowledgeStore'
import type { CardFormModel } from '@/types/forms'

const route = useRoute()
const router = useRouter()
const cardStore = useCardStore()
const knowledgeStore = useKnowledgeStore()
const initialForm = ref<CardFormModel>()
const loading = ref(true)
const error = ref('')

const cardId = computed(() => String(route.params.id || ''))
const isEdit = computed(() => Boolean(cardId.value))

onMounted(async () => {
  await knowledgeStore.load()

  if (isEdit.value) {
    const card = await cardStore.getById(cardId.value)
    if (!card) {
      error.value = '未找到要编辑的卡片。'
    } else {
      initialForm.value = {
        knowledgeNodeId: card.knowledgeNodeId,
        type: card.type,
        front: card.front,
        back: card.back,
        extra: card.extra || '',
        tagsText: card.tags.join(' '),
        verifiedStatus: card.verifiedStatus
      }
    }
  }

  loading.value = false
})

async function submit(form: CardFormModel) {
  try {
    if (isEdit.value) {
      await cardStore.updateExistingCard(cardId.value, form)
    } else {
      await cardStore.createCard(form)
    }
    await router.push('/cards')
  } catch (err) {
    error.value = err instanceof Error ? err.message : '保存失败。'
  }
}
</script>

<template>
  <section class="page">
    <header class="page-header">
      <div>
        <h1 class="page-title">{{ isEdit ? '编辑卡片' : '新建卡片' }}</h1>
        <p class="page-subtitle">新卡片会自动进入今日复习队列。</p>
      </div>
    </header>

    <p v-if="error" class="panel">{{ error }}</p>
    <p v-if="loading" class="panel">加载中...</p>
    <section v-else class="panel">
      <CardForm
        :nodes="knowledgeStore.selectableNodes"
        :initial-form="initialForm"
        :submit-label="isEdit ? '保存卡片' : '创建卡片'"
        @submit="submit"
        @cancel="router.push('/cards')"
      />
    </section>
  </section>
</template>
