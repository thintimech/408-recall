<script setup lang="ts">
import { reactive, watch } from 'vue'
import type { KnowledgeNode } from '@/types/domain'
import type { KnowledgeNodeFormModel } from '@/types/forms'

const props = defineProps<{
  nodes: KnowledgeNode[]
  editingNode?: KnowledgeNode | null
}>()

const emit = defineEmits<{
  submit: [form: KnowledgeNodeFormModel]
  cancel: []
}>()

const form = reactive<KnowledgeNodeFormModel>({
  parentId: null,
  subjectId: '',
  title: '',
  description: ''
})

watch(
  () => props.editingNode,
  (node) => {
    form.parentId = node?.parentId || null
    form.subjectId = node?.subjectId || ''
    form.title = node?.title || ''
    form.description = node?.description || ''
  },
  { immediate: true }
)

function submit() {
  emit('submit', { ...form })
  if (!props.editingNode) {
    form.title = ''
    form.description = ''
  }
}
</script>

<template>
  <form class="form" @submit.prevent="submit">
    <label v-if="!editingNode">
      父节点
      <select v-model="form.parentId">
        <option :value="null">作为新科目</option>
        <option v-for="node in nodes" :key="node.id" :value="node.id">
          {{ '　'.repeat(node.level) }}{{ node.title }}
        </option>
      </select>
    </label>

    <label>
      名称
      <input v-model.trim="form.title" required placeholder="例如：最短路径" />
    </label>

    <label>
      说明
      <textarea v-model="form.description" placeholder="可选，记录这个知识点的范围或提示" />
    </label>

    <div class="actions">
      <button type="submit">{{ editingNode ? '保存修改' : '新增节点' }}</button>
      <button class="secondary" type="button" @click="emit('cancel')">取消</button>
    </div>
  </form>
</template>
