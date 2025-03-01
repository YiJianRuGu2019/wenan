<template>
  <div class="historyList">
    <h2>历史记录</h2>
    
    <div class="history-controls">
      <el-select v-model="filterOption" placeholder="筛选" style="width: 120px;">
        <el-option label="全部" value="all"></el-option>
        <el-option label="已收藏" value="starred"></el-option>
      </el-select>
      
      <el-button type="danger" plain @click="confirmClear" :disabled="!hasHistories">
        清空历史
      </el-button>
    </div>
    
    <div v-if="mounted && !hasHistories" class="empty-history">
      <el-empty description="暂无历史记录" />
    </div>
    
    <client-only>
    <el-timeline v-if="mounted && hasHistories">
      <el-timeline-item
        v-for="history in filteredHistories"
        :key="history.id"
        :timestamp="formatDate(history.timestamp)"
        placement="top"
      >
        <el-card>
          <div class="history-card-header">
            <h3>{{ history.title }}</h3>
            <div class="header-actions">
              <el-button 
                type="text" 
                :icon="history.isStarred ? 'StarFilled' : 'Star'"
                @click="toggleStar(history.id)"
              />
              <el-button type="text" icon="Delete" @click="removeHistory(history.id)" />
            </div>
          </div>
          
          <div class="history-content-preview">
            {{ getContentPreview(history.script.content) }}
          </div>
          
          <div class="card-actions">
            <el-button type="primary" size="small" @click="loadHistory(history)">
              加载此文案
            </el-button>
            <el-button size="small" @click="copyContent(history.script.content)">
              复制内容
            </el-button>
          </div>
        </el-card>
      </el-timeline-item>
    </el-timeline>
    </client-only>
    <div v-if="!mounted" class="loading-state">
      <el-skeleton :rows="3" animated />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, defineComponent } from 'vue'
import { useHistoryStore } from '@/stores/historyStore'
import { useScriptStore } from '@/stores/scriptStore'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useClipboard } from '@vueuse/core'
import dayjs from 'dayjs'

// 定义ClientOnly组件用于仅客户端渲染
const ClientOnly = defineComponent({
  setup(_, { slots }) {
    const show = ref(false)
    onMounted(() => {
      show.value = true
    })
    return () => (show.value && slots.default ? slots.default() : null)
  }
})

const historyStore = useHistoryStore()
const scriptStore = useScriptStore()
const { copy } = useClipboard()

const filterOption = ref('all')
const mounted = ref(false)

onMounted(() => {
  // 延迟设置mounted，确保DOM完全渲染
  setTimeout(() => {
    mounted.value = true
  }, 50)
  
  // 确保历史记录已加载
  historyStore.loadFromLocalStorage()
})

// Check if we have any histories
const hasHistories = computed(() => {
  if (filterOption.value === 'starred') {
    return historyStore.starredHistories?.length > 0
  }
  return historyStore.histories?.length > 0
})

// 根据筛选获取历史记录
const filteredHistories = computed(() => {
  if (filterOption.value === 'starred') {
    return historyStore.starredHistories || []
  }
  return historyStore.histories || []
})

// 格式化日期
const formatDate = (timestamp) => {
  return dayjs(timestamp).format('YYYY-MM-DD HH:mm')
}

// 获取内容预览
const getContentPreview = (content) => {
  const maxLength = 80
  if (content.length <= maxLength) return content
  return content.substring(0, maxLength) + '...'
}

// 加载历史记录中的文案
const loadHistory = (history) => {
  scriptStore.setScripts([history.script])
  ElMessage.success('已加载文案')
}

// 复制内容
const copyContent = (content) => {
  copy(content)
  ElMessage.success('已复制到剪贴板')
}

// 收藏/取消收藏
const toggleStar = (historyId) => {
  historyStore.toggleStar(historyId)
}

// 删除单条历史记录
const removeHistory = (historyId) => {
  ElMessageBox.confirm(
    '确定要删除这条历史记录吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    historyStore.removeHistory(historyId)
    ElMessage.success('已删除历史记录')
  }).catch(() => {})
}

// 清空历史记录
const confirmClear = () => {
  ElMessageBox.confirm(
    '确定要清空所有历史记录吗？此操作不可恢复',
    '警告',
    {
      confirmButtonText: '确定清空',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    historyStore.clearHistory()
    ElMessage.success('已清空历史记录')
  }).catch(() => {})
}
</script>

<style scoped lang="scss">
.historyList {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  
  h2 {
    color: #1890FF;
    margin-bottom: 24px;
  }
  
  .history-controls {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
  }
  
  .empty-history {
    margin: 40px 0;
    text-align: center;
  }
  
  .history-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    
    h3 {
      margin: 0;
      color: #1890FF;
    }
    
    .header-actions {
      display: flex;
      gap: 8px;
    }
  }
  
  .history-content-preview {
    color: #606266;
    margin-bottom: 16px;
    line-height: 1.5;
    font-size: 14px;
  }
  
  .card-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 16px;
  }
  
  .loading-state {
    margin: 40px 0;
    padding: 20px;
  }
}
</style> 