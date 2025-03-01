import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import '@/assets/styles/responsive.scss'  // 导入全局响应式样式
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

// 全局设置Vue选项
window.__VUE_OPTIONS_API__ = true
window.__VUE_PROD_DEVTOOLS__ = false
window.__VUE_PROD_HYDRATION_MISMATCH_DETAILS__ = false

// 创建应用实例
const app = createApp(App)
const pinia = createPinia()

// 注册所有图标组件
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 如果需要单独注册特定图标，可以这样做
// import { QuestionFilled, Star, StarFilled } from '@element-plus/icons-vue'
// app.component('QuestionFilled', QuestionFilled)
// app.component('Star', Star)
// app.component('StarFilled', StarFilled)

// 使用插件
app.use(router)
app.use(pinia)
app.use(ElementPlus)

// 增加错误处理
app.config.errorHandler = (err, vm, info) => {
  console.error('Vue错误:', err)
  console.log('组件:', vm)
  console.log('信息:', info)
}

// 挂载应用
app.mount('#app')
