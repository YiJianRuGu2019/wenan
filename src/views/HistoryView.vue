<template>
  <div class="historyView">
    <div class="header">
      <h1>历史记录</h1>
      <div class="actions">
        <el-button type="danger" @click="handleClearAll" :disabled="!hasHistories">
          清空所有记录
        </el-button>
      </div>
    </div>
    
    <el-empty v-if="!hasHistories" description="暂无历史记录" />
    
    <div v-else class="history-list">
      <el-timeline>
        <el-timeline-item
          v-for="item in historyList"
          :key="item.id"
          :timestamp="formatTime(item.timestamp)"
          placement="top"
        >
          <el-card>
            <template #header>
              <div class="card-header">
                <span>{{ item.title }}</span>
                <div class="card-actions">
                  <el-button
                    type="text"
                    :icon="item.isStarred ? 'Star' : 'StarFilled'"
                    @click="toggleStar(item.id)"
                  >
                    {{ item.isStarred ? '取消星标' : '星标' }}
                  </el-button>
                  <el-button type="text" @click="loadHistory(item)">
                    重新加载
                  </el-button>
                  <el-button type="text" @click="removeHistory(item.id)">
                    删除
                  </el-button>
                </div>
              </div>
            </template>
            
            <div class="history-summary">
              <p>总分镜数: {{ item.script.scenes.length }}</p>
              <p>总时长: {{ item.script.totalDuration }}秒</p>
              
              <!-- 显示前两个分镜的摘要 -->
              <div class="scenes-preview" v-if="item.script.scenes.length > 0">
                <p>
                  <strong>{{ item.script.scenes[0].title }}:</strong>
                  {{ truncateText(item.script.scenes[0].content, 50) }}
                </p>
                <p v-if="item.script.scenes.length > 1">
                  <strong>{{ item.script.scenes[1].title }}:</strong>
                  {{ truncateText(item.script.scenes[1].content, 50) }}
                </p>
                <p v-if="item.script.scenes.length > 2">...</p>
              </div>
            </div>
          </el-card>
        </el-timeline-item>
      </el-timeline>
    </div>
    
    <!-- 调试区域 - 仅在开发环境显示 -->
    <div v-if="isDev" class="debug-section">
      <el-divider>调试工具</el-divider>
      <el-button type="warning" @click="addForcedTestItem">强制添加测试记录</el-button>
      <el-button type="info" @click="checkLocalStorage">检查LocalStorage</el-button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useHistoryStore } from '@/stores/historyStore'
import { useScriptStore } from '@/stores/scriptStore'
import { useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'

const historyStore = useHistoryStore()
const scriptStore = useScriptStore()
const router = useRouter()

const historyList = computed(() => {
  // 以时间倒序排列，星标记录置顶
  return [...historyStore.histories].sort((a, b) => {
    if (a.isStarred && !b.isStarred) return -1
    if (!a.isStarred && b.isStarred) return 1
    return new Date(b.timestamp) - new Date(a.timestamp)
  })
})

const hasHistories = computed(() => historyList.value.length > 0)

// 格式化时间显示
const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 截断文本
const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

// 切换星标状态
const toggleStar = (id) => {
  historyStore.toggleStar(id)
}

// 重新加载历史记录中的脚本
const loadHistory = (item) => {
  scriptStore.setScripts([item.script])
  router.push('/')
}

// 删除历史记录
const removeHistory = (id) => {
  ElMessageBox.confirm('确定要删除这条历史记录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    historyStore.removeHistory(id)
  }).catch(() => {})
}

// 清空所有历史记录
const handleClearAll = () => {
  ElMessageBox.confirm('确定要清空所有历史记录吗？此操作不可恢复！', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    historyStore.clearHistory()
  }).catch(() => {})
}

// 检查是否是开发环境
const isDev = process.env.NODE_ENV === 'development'

// 强制添加一条测试记录
const addForcedTestItem = () => {
  const testItem = {
    id: 'test-' + Date.now(),
    title: '测试记录 ' + new Date().toLocaleTimeString(),
    timestamp: new Date().toISOString(),
    isStarred: false,
    script: {
      id: 'script-test-' + Date.now(),
      title: '测试脚本',
      content: '这是一个测试脚本内容。这里应该有足够的文字让您看到它在历史记录中的显示效果。',
      scenes: [
        { title: '开场', content: '这是开场白', duration: 10 },
        { title: '中间部分', content: '这是内容介绍', duration: 15 }
      ],
      totalDuration: 25,
      wordCount: 50
    }
  }

  console.log('强制添加测试记录:', testItem)
  historyStore.addHistory(testItem)
  ElMessage.success('已添加测试记录，请刷新页面查看')
  setTimeout(() => location.reload(), 1000)
}

// 检查LocalStorage
const checkLocalStorage = () => {
  try {
    const data = localStorage.getItem('video-script-history')
    console.log('LocalStorage数据:', data)
    if (data) {
      const parsed = JSON.parse(data)
      console.log('解析后的数据:', parsed)
      ElMessage.info(`找到${parsed.length}条历史记录`)
    } else {
      ElMessage.warning('未找到历史记录数据')
    }
  } catch (error) {
    console.error('读取LocalStorage出错:', error)
    ElMessage.error('读取历史记录失败: ' + error.message)
  }
}

// 在组件挂载时强制加载历史记录
onMounted(() => {
  historyStore.loadFromLocalStorage()
  console.log('HistoryView挂载时加载历史记录，当前条数:', historyStore.histories.length)
})
</script>

<style scoped lang="scss">
.historyView {
  width: 100%;
  max-width: 1200px;
  margin: 20px auto;
  padding: 0 20px;
  
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    
    h1 {
      color: #1890FF; /* 蓝色标题 */
    }
  }
  
  .history-list {
    display: flex;
    flex-direction: column;
    gap: 15px;
    margin: 10px 0 20px;
  }
}

// 调试区域样式
.debug-section {
  margin-top: 50px;
  padding: 20px;
  background-color: #FEF0F0;
  border-radius: 8px;
  border: 1px dashed #F56C6C;
  
  .el-divider {
    margin: 10px 0 20px;
  }
}

/* 响应式样式 */
@media (min-width: 768px) {
  .history-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
  }
}

@media (max-width: 768px) {
  .historyView {
    padding: 0 10px;
    
    .header {
      flex-direction: column;
      align-items: flex-start;
      gap: 10px;
      
      h1 {
        font-size: 22px;
        margin-bottom: 10px;
      }
    }
    
    .card-header {
      flex-direction: column;
      align-items: flex-start;
      
      .card-actions {
        margin-top: 10px;
        width: 100%;
        display: flex;
        justify-content: space-between;
      }
    }
  }
}
</style> 