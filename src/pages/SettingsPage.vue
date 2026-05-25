<script setup lang="ts">
import { onBeforeUnmount, onMounted, reactive, ref, toRaw } from 'vue'
import { useRouter } from 'vue-router'
import { downloadBackup } from '@/services/exportService'
import {
  clearAllData,
  getLocalDataStats,
  overwriteImport,
  readBackupFile,
  type LocalDataStats
} from '@/services/importService'
import { getStudyGoals, saveStudyGoals, type StudyGoals } from '@/services/studyGoalsService'
import { chatCompletion, getLlmConfig, saveLlmConfig, type LlmConfig, type LlmProvider } from '@/services/llmService'
import { getStoredTheme, setStoredTheme, type ThemeMode } from '@/services/themeService'
import {
  signIn, signUp, signOut, getSession, fullSync, getLastSyncTime,
  type SyncResult
} from '@/services/syncService'

const router = useRouter()
const message = ref('')
const error = ref('')
const llmMessage = ref('')
const llmError = ref('')
const goalsMessage = ref('')
const fileInput = ref<HTMLInputElement | null>(null)
const stats = ref<LocalDataStats>({
  knowledgeNodeCount: 0,
  cardCount: 0,
  reviewRecordCount: 0,
  lastExportAt: null,
  schemaVersion: 1
})

const goals = reactive<StudyGoals>({
  examDate: null,
  dailyReviewGoal: 30,
  dailyNewCardGoal: 5,
  userName: ''
})

const llm = reactive<LlmConfig>({
  providers: [
    { name: 'DeepSeek', baseUrl: 'https://api.deepseek.com', apiKey: '', models: ['deepseek-v4-flash', 'deepseek-v4-pro'] },
    { name: 'OpenAI', baseUrl: 'https://api.openai.com', apiKey: '', models: ['gpt-4o', 'gpt-4o-mini'] },
    { name: '自定义', baseUrl: '', apiKey: '', models: [] }
  ],
  activeProvider: 'DeepSeek',
  model: 'deepseek-v4-flash'
})

const activeProviderObj = ref<LlmProvider>(llm.providers[0])
const currentTheme = ref<ThemeMode>(getStoredTheme())

// ── Cloud Sync ────────────────────────────────────────────────────────────────
const syncEmail = ref('')
const syncPassword = ref('')
const syncUserEmail = ref<string | null>(null)
const syncMessage = ref('')
const syncError = ref('')
const syncing = ref(false)
const lastSync = ref<string | null>(getLastSyncTime())

onMounted(async () => {
  void loadStats()
  void loadGoals()
  void loadLlmConfig()
  const session = await getSession()
  syncUserEmail.value = session?.user.email ?? null
})

async function handleSignIn() {
  syncError.value = ''
  syncMessage.value = ''
  try {
    await signIn(syncEmail.value, syncPassword.value)
    const session = await getSession()
    syncUserEmail.value = session?.user.email ?? null
    syncEmail.value = ''
    syncPassword.value = ''
    syncMessage.value = '登录成功。'
  } catch (e) {
    syncError.value = e instanceof Error ? e.message : '登录失败。'
  }
}

async function handleSignUp() {
  syncError.value = ''
  syncMessage.value = ''
  try {
    await signUp(syncEmail.value, syncPassword.value)
    syncMessage.value = '注册成功，请检查邮箱确认链接后再登录。'
  } catch (e) {
    syncError.value = e instanceof Error ? e.message : '注册失败。'
  }
}

async function handleSignOut() {
  await signOut()
  syncUserEmail.value = null
  syncMessage.value = '已退出登录。'
}

async function handleSync() {
  syncing.value = true
  syncError.value = ''
  syncMessage.value = ''
  try {
    const result: SyncResult = await fullSync()
    lastSync.value = getLastSyncTime()
    syncMessage.value = `同步完成：上传 ${result.pushed} 条，下载 ${result.pulled} 条。`
  } catch (e) {
    syncError.value = e instanceof Error ? e.message : '同步失败。'
  } finally {
    syncing.value = false
  }
}

function changeTheme(mode: ThemeMode) {
  currentTheme.value = mode
  setStoredTheme(mode)
}

async function loadStats() {
  stats.value = await getLocalDataStats()
}

async function loadGoals() {
  const stored = await getStudyGoals()
  Object.assign(goals, stored)
}

async function loadLlmConfig() {
  const stored = await getLlmConfig()
  Object.assign(llm, stored)
  syncActiveProvider()
}

function syncActiveProvider() {
  const found = llm.providers.find((p) => p.name === llm.activeProvider)
  activeProviderObj.value = found || llm.providers[0]
}

function switchProvider(name: string) {
  const prevIdx = llm.providers.findIndex((p) => p.name === llm.activeProvider)
  if (prevIdx >= 0) {
    llm.providers[prevIdx] = { ...activeProviderObj.value }
  }
  llm.activeProvider = name
  syncActiveProvider()
  if (activeProviderObj.value.models?.length) {
    llm.model = activeProviderObj.value.models[0]
  }
}

onBeforeUnmount(() => {
  const idx = llm.providers.findIndex((p) => p.name === llm.activeProvider)
  if (idx >= 0) {
    llm.providers[idx] = { ...activeProviderObj.value }
  }
  void saveLlmConfig(JSON.parse(JSON.stringify(toRaw(llm))))
})

async function saveGoals() {
  await saveStudyGoals({ ...goals })
  goalsMessage.value = '学习目标已保存。'
}

async function saveLlmSettings() {
  const idx = llm.providers.findIndex((p) => p.name === llm.activeProvider)
  if (idx >= 0) {
    llm.providers[idx] = { ...activeProviderObj.value }
  }
  await saveLlmConfig(JSON.parse(JSON.stringify(toRaw(llm))))
  llmError.value = ''
  llmMessage.value = 'AI 配置已保存。'
}

const testing = ref(false)

async function testConnection() {
  testing.value = true
  llmError.value = ''
  llmMessage.value = ''
  try {
    const cfg: LlmConfig = JSON.parse(JSON.stringify(toRaw(llm)))
    const idx = cfg.providers.findIndex((p) => p.name === cfg.activeProvider)
    if (idx >= 0) cfg.providers[idx] = { ...toRaw(activeProviderObj.value) }

    const reply = await chatCompletion(
      [{ role: 'user', content: '请回复"连接成功"四个字。' }],
      cfg
    )
    llmMessage.value = `连通测试通过：${reply.slice(0, 50)}`
  } catch (e) {
    llmError.value = e instanceof Error ? e.message : '连通测试失败。'
  } finally {
    testing.value = false
  }
}

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
  const typed = window.prompt('请输入”清空本地数据”以确认。')
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
        <p class="page-eyebrow">Settings</p>
        <h1 class="page-title">设置</h1>
        <p class="page-subtitle">本地数据只保存在当前浏览器，请定期导出 JSON。</p>
      </div>
    </header>

    <section class="panel form" style="margin-bottom: 1rem">
      <h2>外观</h2>
      <label>
        主题模式
        <select :value="currentTheme" @change="changeTheme(($event.target as HTMLSelectElement).value as ThemeMode)">
          <option value="dark">深色</option>
          <option value="light">浅色</option>
          <option value="system">跟随系统</option>
        </select>
      </label>
    </section>

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
      <h2>学习目标</h2>
      <label>
        用户名
        <input v-model="goals.userName" type="text" placeholder="你的名字（显示在首页问候语中）" />
      </label>
      <div class="grid three">
        <label>
          考试日期
          <input v-model="goals.examDate" type="date" />
        </label>
        <label>
          每日复习目标
          <input v-model.number="goals.dailyReviewGoal" type="number" min="1" max="200" />
        </label>
        <label>
          每日新增卡片目标
          <input v-model.number="goals.dailyNewCardGoal" type="number" min="1" max="50" />
        </label>
      </div>
      <div class="actions" style="margin-top: 0.8rem">
        <button type="button" @click="saveGoals">保存目标</button>
      </div>
      <div v-if="goalsMessage" class="toast-inline" style="margin-top: 0.75rem">
        {{ goalsMessage }}
      </div>
    </section>

    <section class="panel form" style="margin-top: 1rem">
      <h2>AI 配置</h2>
      <p class="muted">配置 OpenAI 兼容 API 提供商和模型，用于 AI 制卡和对话功能。</p>

      <label>
        提供商
        <select :value="llm.activeProvider" @change="switchProvider(($event.target as HTMLSelectElement).value)">
          <option v-for="p in llm.providers" :key="p.name" :value="p.name">{{ p.name }}</option>
        </select>
      </label>

      <div class="grid three">
        <label>
          API Key
          <input v-model="activeProviderObj.apiKey" type="password" placeholder="sk-..." />
        </label>
        <label>
          Base URL
          <input v-model="activeProviderObj.baseUrl" type="url" placeholder="https://api.deepseek.com" />
        </label>
        <label>
          模型
          <select v-if="activeProviderObj.models?.length" v-model="llm.model">
            <option v-for="m in activeProviderObj.models" :key="m" :value="m">{{ m }}</option>
          </select>
          <input v-else v-model="llm.model" type="text" placeholder="模型名称" />
        </label>
      </div>
      <div class="actions" style="margin-top: 0.8rem">
        <button type="button" @click="saveLlmSettings">保存 AI 配置</button>
        <button class="secondary" type="button" :disabled="testing" @click="testConnection">
          {{ testing ? '测试中…' : '测试连通' }}
        </button>
      </div>
      <div v-if="llmMessage || llmError" class="toast-inline" :class="{ 'toast-error': !!llmError }">
        {{ llmError || llmMessage }}
      </div>
    </section>

    <section class="panel form" style="margin-top: 1rem">
      <h2>云同步</h2>
      <p class="muted">登录后可将数据同步到云端，实现多设备共享。</p>

      <div v-if="syncUserEmail">
        <p>已登录：<strong>{{ syncUserEmail }}</strong></p>
        <p v-if="lastSync" class="muted">上次同步：{{ lastSync }}</p>
        <div class="actions" style="margin-top: 0.8rem">
          <button type="button" :disabled="syncing" @click="handleSync">
            {{ syncing ? '同步中…' : '立即同步' }}
          </button>
          <button class="secondary" type="button" @click="handleSignOut">退出登录</button>
        </div>
      </div>

      <div v-else class="grid three">
        <label>
          邮箱
          <input v-model="syncEmail" type="email" placeholder="your@email.com" autocomplete="email" />
        </label>
        <label>
          密码
          <input v-model="syncPassword" type="password" placeholder="密码" autocomplete="current-password" />
        </label>
        <div style="display: flex; align-items: flex-end; gap: 0.5rem; padding-bottom: 0.1rem">
          <button type="button" @click="handleSignIn">登录</button>
          <button class="secondary" type="button" @click="handleSignUp">注册</button>
        </div>
      </div>

      <div v-if="syncMessage || syncError" class="toast-inline" :class="{ 'toast-error': !!syncError }" style="margin-top: 0.75rem">
        {{ syncError || syncMessage }}
      </div>
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

<style scoped>
.toast-inline {
  margin-top: 0.75rem;
  padding: 0.6rem 1rem;
  border-radius: var(--radius-sm);
  font-size: 0.85rem;
  font-weight: 500;
  background: var(--primary-muted);
  color: var(--primary);
  border: 1px solid rgba(16, 185, 129, 0.25);
}

.toast-inline.toast-error {
  background: var(--error-muted);
  color: var(--error);
  border-color: rgba(248, 113, 113, 0.25);
}
</style>
