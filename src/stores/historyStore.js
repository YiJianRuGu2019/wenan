import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useHistoryStore = defineStore('history', () => {
  // 历史记录数组
  const histories = ref([])
  
  // 确保histories永远是数组
  const ensureArray = () => {
    if (!Array.isArray(histories.value)) {
      console.warn('历史记录不是数组，重置为空数组')
      histories.value = []
      saveToLocalStorage()
    }
  }
  
  // 添加历史记录
  const addHistory = (history) => {
    ensureArray()
    console.log('添加历史记录:', history)
    
    // 检查是否已存在
    const existingIndex = histories.value.findIndex(h => 
      h.script.content === history.script.content && 
      h.script.title === history.script.title
    )
    
    if (existingIndex !== -1) {
      console.log('更新已存在的历史记录')
      // 如果已存在，更新时间戳
      histories.value[existingIndex].timestamp = new Date().toISOString()
    } else {
      console.log('添加新历史记录')
      // 添加新记录
      histories.value.unshift(history)
    }
    
    // 持久化到本地存储
    saveToLocalStorage()
  }
  
  // 从历史记录中删除
  const removeHistory = (historyId) => {
    histories.value = histories.value.filter(h => h.id !== historyId)
    saveToLocalStorage()
  }
  
  // 标星/取消标星
  const toggleStar = (historyId) => {
    const history = histories.value.find(h => h.id === historyId)
    if (history) {
      history.isStarred = !history.isStarred
      saveToLocalStorage()
    }
  }
  
  // 清空所有历史
  const clearHistory = () => {
    histories.value = []
    saveToLocalStorage()
  }
  
  // 保存到本地存储
  const saveToLocalStorage = () => {
    try {
      const data = JSON.stringify(histories.value)
      console.log('保存历史记录到localStorage, 大小:', data.length, '字节')
      localStorage.setItem('video-script-history', data)
      
      // 验证保存是否成功
      const saved = localStorage.getItem('video-script-history')
      if (saved) {
        console.log('验证保存成功, 数据长度:', saved.length)
      } else {
        console.error('验证失败：保存后无法读取数据')
      }
    } catch (error) {
      console.error('Failed to save history to localStorage:', error)
      // 尝试确定问题原因
      if (error.name === 'QuotaExceededError') {
        console.error('localStorage配额已满')
      }
    }
  }
  
  // 从本地存储加载
  const loadFromLocalStorage = () => {
    try {
      const savedHistory = localStorage.getItem('video-script-history')
      console.log('从localStorage加载历史记录, 原始数据:', savedHistory)
      if (savedHistory) {
        histories.value = JSON.parse(savedHistory)
        console.log('成功解析历史记录，条数:', histories.value.length)
        // 确保值是数组
        ensureArray()
      } else {
        console.log('localStorage中没有找到历史记录')
      }
    } catch (error) {
      console.error('Failed to load history from localStorage:', error)
      // 出错时重置为空数组
      histories.value = []
    }
  }
  
  // 计算属性
  const starredHistories = computed(() => {
    ensureArray()
    return histories.value.filter(h => h.isStarred)
  })
  
  // 初始加载
  loadFromLocalStorage()
  
  return {
    histories,
    starredHistories,
    addHistory,
    removeHistory,
    toggleStar,
    clearHistory,
    loadFromLocalStorage
  }
}) 