<template>
  <div>
    <slot v-if="!error"></slot>
    <div v-else class="error-container">
      <h3>出错了</h3>
      <p>{{ error }}</p>
      <button @click="resetError">重试</button>
      <button @click="clearHistory">清空历史记录并重试</button>
    </div>
  </div>
</template>

<script setup>
import { ref, provide } from 'vue'
import { useHistoryStore } from '@/stores/historyStore'

const historyStore = useHistoryStore()
const error = ref(null)

provide('errorHandler', (e) => {
  console.error('ErrorBoundary捕获错误:', e)
  error.value = e.message
})

const resetError = () => {
  error.value = null
}

const clearHistory = () => {
  try {
    localStorage.removeItem('video-script-history')
    historyStore.loadFromLocalStorage()
    error.value = null
  } catch (e) {
    error.value = `清空失败: ${e.message}`
  }
}
</script>

<style scoped>
.error-container {
  width: 100%;
  max-width: 800px;
  margin: 20px auto;
  padding: 20px;
  background: #fff1f0;
  border: 1px solid #ffa39e;
  border-radius: 4px;
}

h3 {
  color: #f56c6c;
  margin-top: 0;
}

button {
  background: #409eff;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 10px;
}

button:last-child {
  background: #f56c6c;
}

/* 响应式样式 */
@media (max-width: 768px) {
  .error-container {
    padding: 15px;
    margin: 10px auto;
  }
  
  button {
    padding: 6px 12px;
    font-size: 14px;
  }
}
</style>