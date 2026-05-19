<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { downloadBackup } from '@/services/exportService'
import {
  clearAllData,
  getLocalDataStats,
  overwriteImport,
  readBackupFile,
  type LocalDataStats
} from '@/services/importService'

const router = useRouter()
const message = ref('')
const error = ref('')
const fileInput = ref<HTMLInputElement | null>(null)
const stats = ref<LocalDataStats>({
  knowledgeNodeCount: 0,
  cardCount: 0,
  reviewRecordCount: 0,
  lastExportAt: null,
  schemaVersion: 1
})

async function loadStats() {
  stats.value = await getLocalDataStats()
}

onMounted(() => {
  void loadStats()
})

async function exportJson() {
  error.value = ''
  await downloadBackup()
  await loadStats()
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
    await downloadBackup('408-recall-before-import')
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
  if (!window.confirm('清空会删除所有本地数据，且不可撤销。是否继续？')) return
  const typed = window.prompt('请输入“清空本地数据”以确认。')
  if (typed !== '清空本地数据') {
    error.value = '确认文本不匹配，已取消清空。'
    return
  }

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

    <section class="panel">
      <h2>本地数据统计</h2>
      <div class="grid three">
        <article class="list-item">
          <span class="muted">知识点数量</span>
          <strong style="display: block; font-size: 2rem">{{ stats.knowledgeNodeCount }}</strong>
        </article>
        <article class="list-item">
          <span class="muted">卡片数量</span>
          <strong style="display: block; font-size: 2rem">{{ stats.cardCount }}</strong>
        </article>
        <article class="list-item">
          <span class="muted">复习记录数量</span>
          <strong style="display: block; font-size: 2rem">{{ stats.reviewRecordCount }}</strong>
        </article>
      </div>
      <p class="muted">最近一次导出：{{ stats.lastExportAt || '尚未导出' }}</p>
      <p class="muted">当前数据 schema 版本：{{ stats.schemaVersion }}</p>
    </section>

    <section class="panel form" style="margin-top: 1rem">
      <div>
        <h2>数据备份</h2>
        <p class="muted">
          导出的 JSON 包含知识点、卡片、复习状态和复习记录。导入前会自动导出当前数据作为备份。
        </p>
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
