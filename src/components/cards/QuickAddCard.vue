<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { listKnowledgeNodes } from '@/db/repositories/knowledgeRepository'
import { createCardWithInitialState } from '@/db/repositories/cardRepository'
import { createInitialReviewState } from '@/services/reviewScheduler'
import { nowIso, todayLocalDate } from '@/services/dateService'
import { createId } from '@/utils/id'
import type { KnowledgeNode } from '@/types/domain'

defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: []; saved: [] }>()

const nodes = ref<KnowledgeNode[]>([])
const saving = ref(false)
const message = ref('')

const form = reactive({
  knowledgeNodeId: '',
  front: '',
  back: ''
})

onMounted(async () => {
  nodes.value = await listKnowledgeNodes()
})

async function save() {
  if (!form.knowledgeNodeId || !form.front.trim()) return
  saving.value = true
  message.value = ''

  try {
    const node = nodes.value.find((n) => n.id === form.knowledgeNodeId)
    const now = nowIso()
    const id = createId('card')
    await createCardWithInitialState(
      {
        id,
        knowledgeNodeId: form.knowledgeNodeId,
        subjectId: node?.subjectId || '',
        type: 'CONCEPT',
        front: form.front.trim(),
        back: form.back.trim(),
        extra: '',
        tags: [],
        verifiedStatus: 'UNVERIFIED',
        createdAt: now,
        updatedAt: now
      },
      createInitialReviewState(id, todayLocalDate())
    )
    message.value = '已保存'
    form.front = ''
    form.back = ''
    emit('saved')
    setTimeout(() => { message.value = '' }, 1500)
  } finally {
    saving.value = false
  }
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close')
}
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="quick-add-overlay" @click.self="emit('close')" @keydown="handleKeydown">
      <div class="quick-add-modal">
        <header class="quick-add-header">
          <strong>快速添加卡片</strong>
          <button class="ghost" type="button" @click="emit('close')">✕</button>
        </header>
        <div class="quick-add-body">
          <label>
            知识点
            <select v-model="form.knowledgeNodeId">
              <option value="" disabled>选择知识点</option>
              <option v-for="n in nodes" :key="n.id" :value="n.id">{{ n.title }}</option>
            </select>
          </label>
          <label>
            正面（问题）
            <textarea v-model="form.front" rows="3" placeholder="输入问题..." @keydown.ctrl.enter="save" />
          </label>
          <label>
            背面（答案）
            <textarea v-model="form.back" rows="3" placeholder="输入答案（可选，稍后补充）" @keydown.ctrl.enter="save" />
          </label>
        </div>
        <footer class="quick-add-footer">
          <span v-if="message" class="badge">{{ message }}</span>
          <button type="button" :disabled="saving || !form.front.trim() || !form.knowledgeNodeId" @click="save">
            保存 (Ctrl+Enter)
          </button>
        </footer>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.quick-add-overlay {
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.4);
  animation: fade-in 0.15s ease;
}

.quick-add-modal {
  width: 90%;
  max-width: 520px;
  background: var(--surface-container-low);
  border: 1px solid var(--outline);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-ambient);
  display: flex;
  flex-direction: column;
  animation: slide-up 0.2s ease;
}

.quick-add-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--outline);
}

.quick-add-body {
  padding: 1.25rem;
  display: grid;
  gap: 0.85rem;
}

.quick-add-body textarea {
  min-height: unset;
}

.quick-add-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 0.85rem 1.25rem;
  border-top: 1px solid var(--outline);
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slide-up {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
