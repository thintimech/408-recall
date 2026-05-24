<script setup lang="ts">
import { onBeforeUnmount, onMounted, provide, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import SideNav from './SideNav.vue'
import ChatPanel from '@/components/chat/ChatPanel.vue'
import QuickAddCard from '@/components/cards/QuickAddCard.vue'
import { useAppStore } from '@/stores/appStore'

const appStore = useAppStore()
const navOpen = ref(false)
const chatOpen = ref(false)
const chatContext = ref('')
const searchQuery = ref('')
const quickAddOpen = ref(false)
const router = useRouter()

router.afterEach(() => {
  navOpen.value = false
})

function handleSearch() {
  if (searchQuery.value.trim()) {
    void router.push({ path: '/cards', query: { q: searchQuery.value.trim() } })
    searchQuery.value = ''
  }
}

function openChat(context: string) {
  chatContext.value = context
  chatOpen.value = true
}

function closeChat() {
  chatOpen.value = false
}

function handleGlobalKeydown(e: KeyboardEvent) {
  const target = e.target as HTMLElement | null
  if (target && (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable)) return
  if (e.key.toLowerCase() === 'n' && !e.ctrlKey && !e.metaKey) {
    e.preventDefault()
    quickAddOpen.value = true
  }
}

provide('openChat', openChat)

onMounted(() => {
  void appStore.initialize()
  window.addEventListener('keydown', handleGlobalKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleGlobalKeydown)
})
</script>

<template>
  <div class="app-shell" :class="{ 'nav-open': navOpen, 'chat-open': chatOpen }">
    <button class="nav-toggle" type="button" aria-label="菜单" @click="navOpen = !navOpen">
      ☰
    </button>
    <SideNav />
    <div v-if="navOpen" class="nav-overlay" @click="navOpen = false" />

    <!-- Top Bar -->
    <header class="topbar">
      <div class="topbar-search">
        <span class="material-symbols-outlined">search</span>
        <input
          type="text"
          class="topbar-search-input"
          placeholder="搜索卡片内容..."
          aria-label="搜索卡片"
          @keydown.enter="handleSearch"
          v-model="searchQuery"
        />
      </div>
      <div class="topbar-actions">
        <button class="ghost topbar-icon-btn" type="button" aria-label="快速添加卡片" @click="quickAddOpen = true">
          <span class="material-symbols-outlined">add_circle</span>
        </button>
        <RouterLink to="/settings" class="ghost topbar-icon-btn" aria-label="设置">
          <span class="material-symbols-outlined">tune</span>
        </RouterLink>
        <span class="topbar-divider"></span>
        <RouterLink to="/settings" class="ghost topbar-user-btn">
          <span>{{ appStore.studyGoals.userName || '设置名字' }}</span>
          <span class="material-symbols-outlined">account_circle</span>
        </RouterLink>
      </div>
    </header>

    <main class="content">
      <p v-if="appStore.error" class="panel">{{ appStore.error }}</p>
      <RouterView />
    </main>

    <!-- FAB -->
    <RouterLink to="/review" class="fab" aria-label="快速开始复习">
      <span class="material-symbols-outlined">bolt</span>
      <span class="fab-tooltip">快速复习</span>
    </RouterLink>

    <div v-if="chatOpen" class="chat-overlay" @click="closeChat" />
    <ChatPanel :context="chatContext" :open="chatOpen" @close="closeChat" />
    <QuickAddCard :open="quickAddOpen" @close="quickAddOpen = false" @saved="appStore.refreshDashboard()" />
  </div>
</template>
