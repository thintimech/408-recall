<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { downloadBackup } from '@/services/exportService'
import { clearAllData, overwriteImport, readBackupFile } from '@/services/importService'

const router = useRouter()
const message = ref('')
const error = ref('')
const fileInput = ref<HTMLInputElement | null>(null)

async function exportJson() {
  error.value = ''
  await downloadBackup()
  message.value = '备份文件已生成。'
}

async function importJson(event: Event) {
  error.value = ''
  message.value = ''
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  try {
    const data = await readBackupFile(file)
    if (!window.confirm('导入会清空并覆盖当前本地数据，确定继续吗？')) return
    await overwriteImport(data)
    message.value = '导入完成，页面将刷新。'
    window.setTimeout(() => window.location.reload(), 500)
  } catch (err) {
    error.value = err instanceof Error ? err.message : '导入失败。'
  } finally {
    if (fileInput.value) fileInput.value.value = ''
  }
}

async function clearData() {
  if (!window.confirm('确定清空所有本地数据吗？此操作不可撤销。')) return
  await clearAllData()
  await router.push('/')
  window.location.reload()
}
</script>

<template>
  <section class="page">
    <header class="page-header">
      <div>
        <h1 class="page-title">设置</h1>
        <p class="page-subtitle">本地数据只保存在当前浏览器，请定期导出 JSON。</p>
      </div>
    </header>

    <section class="panel form">
      <div>
        <h2>数据备份</h2>
        <p class="muted">导出的 JSON 包含知识点、卡片、复习状态和复习记录。</p>
      </div>

      <div class="actions">
        <button type="button" @click="exportJson">导出 JSON</button>
        <button class="secondary" type="button" @click="fileInput?.click()">导入 JSON</button>
        <button class="danger" type="button" @click="clearData">清空本地数据</button>
      </div>

      <input
        ref="fileInput"
        type="file"
        accept="application/json,.json"
        style="display: none"
        @change="importJson"
      />

      <p v-if="message" class="panel">{{ message }}</p>
      <p v-if="error" class="panel">{{ error }}</p>
    </section>

    <section class="panel" style="margin-top: 1rem">
      <h2>项目边界</h2>
      <p class="muted">
        408 Recall 是本地优先的主动回忆工具，不是题库，也不内置商业 PDF、真题解析或课程资料。
      </p>
    </section>
  </section>
</template>
