import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { router } from './router'
import { initializeSeedData } from './db/repositories/knowledgeRepository'
import './styles.css'

async function bootstrap() {
  try {
    await initializeSeedData()
  } catch (error) {
    console.error('Failed to initialize seed data.', error)
  }

  createApp(App)
    .use(createPinia())
    .use(router)
    .mount('#app')
}

void bootstrap()
