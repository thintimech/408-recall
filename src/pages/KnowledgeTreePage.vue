<script setup lang="ts">
import { onMounted, ref } from 'vue'
import KnowledgeNodeForm from '@/components/knowledge/KnowledgeNodeForm.vue'
import KnowledgeTree from '@/components/knowledge/KnowledgeTree.vue'
import { useKnowledgeStore } from '@/stores/knowledgeStore'
import type { KnowledgeNode } from '@/types/domain'
import type { KnowledgeNodeFormModel } from '@/types/forms'

const store = useKnowledgeStore()
const editingNode = ref<KnowledgeNode | null>(null)
const formVisible = ref(false)

onMounted(() => {
  void store.load()
})

async function submit(form: KnowledgeNodeFormModel) {
  if (editingNode.value) {
    await store.updateNode(editingNode.value.id, form)
  } else {
    await store.createNode(form)
  }

  editingNode.value = null
  formVisible.value = false
}

function edit(node: KnowledgeNode) {
  editingNode.value = node
  formVisible.value = true
}

async function remove(node: KnowledgeNode) {
  if (!window.confirm(`确定删除「${node.title}」吗？`)) return
  try {
    await store.removeNode(node.id)
  } catch (error) {
    window.alert(error instanceof Error ? error.message : '删除失败。')
  }
}
</script>

<template>
  <section class="page">
    <header class="page-header">
      <div>
        <h1 class="page-title">知识点树</h1>
        <p class="page-subtitle">先以章节级框架承接卡片，不追求一次补全所有知识点。</p>
      </div>
      <button type="button" @click="formVisible = true">新增节点</button>
    </header>

    <section v-if="formVisible" class="panel" style="margin-bottom: 1rem">
      <KnowledgeNodeForm
        :nodes="store.nodes"
        :editing-node="editingNode"
        @submit="submit"
        @cancel="
          () => {
            formVisible = false
            editingNode = null
          }
        "
      />
    </section>

    <p v-if="store.error" class="panel">{{ store.error }}</p>
    <KnowledgeTree :nodes="store.nodes" :card-counts="store.cardCounts" @edit="edit" @delete="remove" />
  </section>
</template>
