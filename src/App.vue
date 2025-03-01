<template>
  <div class="app-container">
    <error-boundary>
      <el-config-provider :locale="zhCn">
        <el-container>
          <el-header height="60px">
            <div class="header-content">
              <div class="logo">
                <router-link to="/">短视频文案生成</router-link>
              </div>

              <el-menu :default-active="activeIndex" mode="horizontal" router class="nav-menu" :ellipsis="false">
                <el-menu-item index="/">首页</el-menu-item>
                <el-menu-item index="/history">历史记录</el-menu-item>
                <el-menu-item index="/about">关于系统</el-menu-item>
              </el-menu>

              <!-- 移动端菜单按钮 -->
              <div class="mobile-menu-btn" @click="mobileMenuVisible = true">
                <el-icon>
                  <Menu />
                </el-icon>
              </div>
            </div>
          </el-header>

          <el-main>
            <router-view v-slot="{ Component }">
              <transition name="fade" mode="out-in">
                <component :is="Component" />
              </transition>
            </router-view>
          </el-main>

          <el-footer height="60px">
            <p>© 2023 短视频文案生成系统 - 数字创意助手</p>
          </el-footer>
        </el-container>

        <!-- 移动端侧边菜单 -->
        <el-drawer v-model="mobileMenuVisible" title="菜单" direction="rtl" size="70%">
          <el-menu :default-active="activeIndex" @select="handleMobileMenuSelect">
            <el-menu-item index="/">
              <el-icon>
                <HomeFilled />
              </el-icon>
              <span>首页</span>
            </el-menu-item>
            <el-menu-item index="/history">
              <el-icon>
                <List />
              </el-icon>
              <span>历史记录</span>
            </el-menu-item>
            <el-menu-item index="/about">
              <el-icon>
                <InfoFilled />
              </el-icon>
              <span>关于系统</span>
            </el-menu-item>
          </el-menu>
        </el-drawer>
      </el-config-provider>
    </error-boundary>
  </div>
</template>

<script setup>
import { ref, computed, watch, defineComponent, markRaw, defineAsyncComponent } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Menu, HomeFilled, List, InfoFilled } from '@element-plus/icons-vue'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import ErrorBoundary from '@/components/common/ErrorBoundary.vue'
import ScriptForm from '@/components/videoScript/ScriptForm.vue'
import ScriptDisplay from '@/components/videoScript/ScriptDisplay.vue'
// 使用异步加载解决水合问题
const HistoryList = defineAsyncComponent(() => import('@/components/videoScript/HistoryList.vue'))
import { useHistoryStore } from '@/stores/historyStore'

const route = useRoute()
const router = useRouter()
const mobileMenuVisible = ref(false)
const currentView = ref('form')
const historyStore = useHistoryStore()

// 根据当前路由设置激活菜单项
const activeIndex = computed(() => route.path)

// 移动端菜单选择
const handleMobileMenuSelect = (index) => {
  router.push(index)
  mobileMenuVisible.value = false
}

// 添加调试代码来检测错误
try {
  // 确保历史记录已正确加载
  historyStore.loadFromLocalStorage()
  console.log('历史记录加载成功:', historyStore.histories)
} catch (error) {
  console.error('加载历史记录时出错:', error)
}

// 当前显示的组件
const currentComponent = computed(() => {
  switch (currentView.value) {
    case 'history':
      return markRaw(HistoryList)
    case 'form':
    default:
      return defineComponent({
        components: { ScriptForm, ScriptDisplay },
        template: `
          <div>
            <ScriptForm />
            <ScriptDisplay />
          </div>
        `
      })
  }
})

// 添加安全切换到历史记录的方法
const switchToHistory = () => {
  try {
    // 确保历史记录已正确加载
    historyStore.loadFromLocalStorage()
    currentView.value = 'history'
  } catch (error) {
    console.error('切换到历史记录视图时出错:', error)
    alert('加载历史记录时出错，正在尝试修复...')
    localStorage.removeItem('video-script-history')
    historyStore.loadFromLocalStorage()
    currentView.value = 'history'
  }
}
</script>

<style lang="scss">
body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #E6F7FF;
}

.app-container {
  min-height: 100vh;

  .el-container {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .el-header {
    background-color: #B3E5FC;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    position: relative;
    z-index: 100;

    .header-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 20px;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;

      .logo {
        font-size: 18px;
        font-weight: bold;

        a {
          color: #1890FF;
          text-decoration: none;
        }
      }

      .nav-menu {
        border-bottom: none;
        background-color: transparent;

        :deep(.el-menu-item) {
          color: #1890FF;

          &.is-active {
            color: #096DD9;
            font-weight: bold;
            background-color: rgba(24, 144, 255, 0.1);
          }

          &:hover {
            background-color: rgba(24, 144, 255, 0.1);
          }
        }
      }

      .mobile-menu-btn {
        display: none;
        font-size: 24px;
        cursor: pointer;
        color: #1890FF;
      }
    }
  }

  .el-main {
    flex: 1;
    padding: 20px;
    background-color: #E6F7FF;
  }

  .el-footer {
    background-color: #B3E5FC;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #333;
    font-size: 14px;
    border-top: 1px solid #81D4FA;
  }

  // 页面切换动画
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.3s ease;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
}

@media (max-width: 768px) {
  .app-container {
    .el-header {
      .header-content {
        .nav-menu {
          display: none;
        }

        .mobile-menu-btn {
          display: block;
        }
      }
    }
  }
}

/* 全局主题颜色覆盖 */
:root {
  --el-color-primary: #1890FF !important;
}

/* 按钮悬停效果 */
.el-button--primary:hover {
  background-color: #40A9FF !important;
  border-color: #40A9FF !important;
}

/* 表单元素聚焦效果 */
.el-input__inner:focus {
  border-color: #1890FF !important;
}

/* 选择器和下拉菜单 */
.el-select .el-input.is-focus .el-input__inner {
  border-color: #1890FF !important;
}

/* 卡片统一样式 */
.el-card {
  border-color: #D1E9FF !important;
}

/* 覆盖Element Plus菜单相关样式 */
.el-menu--horizontal>.el-menu-item:not(.is-disabled):focus,
.el-menu--horizontal>.el-menu-item:not(.is-disabled):hover {
  background-color: rgba(24, 144, 255, 0.1) !important;
  color: #096DD9 !important;
}

.el-menu--horizontal>.el-menu-item.is-active {
  border-bottom: 2px solid #1890FF !important;
  color: #096DD9 !important;
}

/* 移动端菜单样式调整 */
.el-drawer__header {
  color: #1890FF !important;
  font-weight: bold;
}

/* 更新全局按钮样式 - 主要是处理点击状态 */
.el-button--primary:active {
  background-color: #096DD9 !important;
  /* 点击时的深蓝色 */
  border-color: #096DD9 !important;
}

/* 如果需要修改按钮点击时的波纹效果 */
.el-button--primary:focus {
  background-color: #40A9FF !important;
  border-color: #40A9FF !important;
}

/* 更新其他按钮类型的点击效果 */
.el-button--success:active {
  background-color: #389E0D !important;
  border-color: #389E0D !important;
}

.el-button--info:active {
  background-color: #5A6A85 !important;
  border-color: #5A6A85 !important;
}

/* 如果需要更新文本按钮的点击效果 */
.el-button--text:active {
  color: #096DD9 !important;
}

/* 确保所有按钮的过渡效果平滑 */
.el-button {
  transition: background-color 0.3s, border-color 0.3s, color 0.3s !important;
}

#app {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

/* 全局响应式样式 */
@media (max-width: 768px) {
  .el-header {
    padding: 0 10px !important;
  }
  
  .el-main {
    padding: 10px !important;
  }
  
  .el-menu--horizontal {
    display: none !important;
  }
  
  .mobile-menu-btn {
    display: block !important;
  }
}
</style>
