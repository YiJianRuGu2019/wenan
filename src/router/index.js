import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import DebugHistory from '@/components/debug/DebugHistory.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: {
      title: '短视频文案生成'
    }
  },
  {
    path: '/history',
    name: 'history',
    component: () => import('../views/HistoryView.vue'),
    meta: {
      title: '历史记录'
    }
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('../views/AboutView.vue'),
    meta: {
      title: '关于系统'
    }
  },
  {
    path: '/debug',
    name: 'debug',
    component: DebugHistory
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

// 路由守卫，用于设置页面标题
router.beforeEach((to, from, next) => {
  document.title = to.meta.title || '短视频文案生成系统'
  next()
})

export default router
