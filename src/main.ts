import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { router } from './router'
import { initializeSeedData } from './db/repositories/knowledgeRepository'
import { applyTheme } from './services/themeService'
import 'katex/dist/katex.min.css'
import './styles.css'

applyTheme()

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
