<script setup lang="ts">
import { onMounted } from 'vue'
import SideNav from './SideNav.vue'
import { useAppStore } from '@/stores/appStore'

const appStore = useAppStore()

onMounted(() => {
  void appStore.initialize()
})
</script>

<template>
  <div class="app-shell">
    <SideNav />
    <main class="content">
      <p v-if="appStore.error" class="panel">{{ appStore.error }}</p>
      <RouterView />
    </main>
  </div>
</template>
