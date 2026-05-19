<script setup lang="ts">
import { reactive, watch } from 'vue'
import type { CardType, KnowledgeNode, VerifiedStatus } from '@/types/domain'
import type { CardFormModel } from '@/types/forms'

const props = defineProps<{
  nodes: KnowledgeNode[]
  initialForm?: CardFormModel
  submitLabel: string
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
  { value: 'BIG_QUESTION', label: '大题模板卡' }
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

    <label>
      正面问题
      <textarea v-model="form.front" required placeholder="例如：进程和线程的区别是什么？" />
    </label>

    <label>
      背面答案
      <textarea v-model="form.back" required placeholder="写下自己要主动回忆出的答案" />
    </label>

    <label>
      补充说明
      <textarea v-model="form.extra" placeholder="可选：补充例子、易混点、来源提示" />
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
