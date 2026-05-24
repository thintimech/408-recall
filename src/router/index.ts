import { createRouter, createWebHistory } from 'vue-router'

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Dashboard',
      component: () => import('@/pages/DashboardPage.vue'),
      meta: { title: '首页' }
    },
    {
      path: '/knowledge',
      name: 'KnowledgeTree',
      component: () => import('@/pages/KnowledgeTreePage.vue'),
      meta: { title: '知识点树' }
    },
    {
      path: '/cards',
      name: 'CardList',
      component: () => import('@/pages/CardListPage.vue'),
      meta: { title: '卡片列表' }
    },
    {
      path: '/cards/new',
      name: 'CardCreate',
      component: () => import('@/pages/CardEditPage.vue'),
      meta: { title: '新建卡片' }
    },
    {
      path: '/cards/:id/edit',
      name: 'CardEdit',
      component: () => import('@/pages/CardEditPage.vue'),
      meta: { title: '编辑卡片' }
    },
    {
      path: '/review',
      name: 'ReviewToday',
      component: () => import('@/pages/ReviewTodayPage.vue'),
      meta: { title: '今日复习' }
    },
    {
      path: '/review/cram',
      name: 'CramReview',
      component: () => import('@/pages/CramReviewPage.vue'),
      meta: { title: '突击复习' }
    },
    {
      path: '/records',
      name: 'ReviewRecords',
      component: () => import('@/pages/ReviewRecordsPage.vue'),
      meta: { title: '复习记录' }
    },
    {
      path: '/stats',
      name: 'Stats',
      component: () => import('@/pages/StatsPage.vue'),
      meta: { title: '学习统计' }
    },
    {
      path: '/import',
      name: 'Import',
      component: () => import('@/pages/ImportPage.vue'),
      meta: { title: '批量导入' }
    },
    {
      path: '/mistakes',
      name: 'Mistakes',
      component: () => import('@/pages/MistakesPage.vue'),
      meta: { title: '错点记录' }
    },
    {
      path: '/ai',
      name: 'AiCard',
      component: () => import('@/pages/AiCardPage.vue'),
      meta: { title: 'AI 制卡' }
    },
    {
      path: '/export',
      name: 'Export',
      component: () => import('@/pages/ExportPage.vue'),
      meta: { title: '导出 / 导入' }
    },
    {
      path: '/settings',
      name: 'Settings',
      component: () => import('@/pages/SettingsPage.vue'),
      meta: { title: '设置' }
    }
  ]
})

router.afterEach((to) => {
  document.title = `${String(to.meta.title || '408 Recall')} · 408 Recall`
})
