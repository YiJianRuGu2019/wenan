<template>
  <div class="debug-history">
    <h2>历史记录调试</h2>
    <pre>{{ debugInfo }}</pre>
    <div class="buttons">
      <button @click="fixHistory">修复历史记录</button>
      <button @click="addTestHistory">添加测试记录</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useHistoryStore } from '@/stores/historyStore'
import { ElMessage } from 'element-plus'

const historyStore = useHistoryStore()
const debugInfo = ref('')

onMounted(() => {
  // 检查历史记录数据
  try {
    debugInfo.value = JSON.stringify({
      historiesType: typeof historyStore.histories,
      isArray: Array.isArray(historyStore.histories),
      hasHistoryList: 'historyList' in historyStore,
      storeKeys: Object.keys(historyStore),
      historiesLength: historyStore.histories?.length || 0,
      localStorage: localStorage.getItem('video-script-history')
    }, null, 2)
  } catch (error) {
    debugInfo.value = `错误: ${error.message}`
  }
})

const fixHistory = () => {
  // 重置本地存储和内存中的历史记录
  localStorage.removeItem('video-script-history')
  historyStore.loadFromLocalStorage()
  location.reload()
}

const addTestHistory = () => {
  const testHistory = {
    id: Date.now().toString(),
    title: '测试历史记录 ' + new Date().toLocaleTimeString(),
    timestamp: new Date().toISOString(),
    isStarred: false,
    script: {
      title: '测试脚本',
      content: '这是一个测试脚本内容',
      scenes: [
        { title: '场景1', content: '这是第一个场景', duration: 10 },
        { title: '场景2', content: '这是第二个场景', duration: 15 }
      ],
      totalDuration: 25
    }
  }
  
  historyStore.addHistory(testHistory)
  ElMessage.success('已添加测试历史记录')
  setTimeout(() => location.reload(), 1000)
}
</script>

<style scoped>
.debug-history {
  width: 100%;
  max-width: 800px;
  margin: 20px auto;
  padding: 20px;
  background: #f5f5f5;
  border-radius: 8px;
}

pre {
  background: #333;
  color: #fff;
  padding: 15px;
  border-radius: 4px;
  overflow-x: auto;
}

.buttons {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

button {
  background: #f56c6c;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 4px;
  cursor: pointer;
}

button:last-child {
  background: #67c23a;
}

/* 响应式样式 */
@media (max-width: 768px) {
  .debug-history {
    padding: 15px;
    margin: 10px auto;
  }
  
  pre {
    font-size: 12px;
  }
  
  .buttons {
    flex-direction: column;
    gap: 10px;
  }
  
  button {
    width: 100%;
  }
}
</style> 