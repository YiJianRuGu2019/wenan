import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { generateVideoScript } from '@/services/api'
import { buildPrompt, parseAIResponse } from '@/services/promptBuilder'

export const useScriptStore = defineStore('script', () => {
  // 生成的脚本列表
  const scripts = ref([])
  const isLoading = ref(false)
  const error = ref(null)
  const generationProgress = ref(0) // 添加进度追踪
  
  // 生成脚本
  const generateScripts = async (formData) => {
    isLoading.value = true
    error.value = null
    generationProgress.value = 0 // 重置进度

    try {
      // 开始生成进度动画
      startProgressAnimation()
      
      // 调用API生成文案
      const response = await generateVideoScript(formData)
      
      // 解析返回的文本内容
      const scriptsText = response.text
      
      // 设置进度为80%
      generationProgress.value = 80
      
      // 使用分隔线分割不同方案
      const scriptParts = scriptsText.split('===方案分隔线===')
      
      // 处理每个方案
      const parsedScripts = scriptParts.map((part, index) => {
        // 更新解析进度
        generationProgress.value = 80 + (index / scriptParts.length) * 20
        
        // 解析文案内容
        const { title, content } = parseFullContent(part.trim())
        
        return {
          id: `script-${Date.now()}-${index}`,
          title: title || `方案 ${index + 1}`,
          content: content,
          wordCount: content.length
        }
      })
      
      // 进度完成
      generationProgress.value = 100
      
      // 更新状态
      scripts.value = parsedScripts
      
      // 滚动到结果区域
      scrollToResults()
    } catch (err) {
      console.error('生成文案失败:', err)
      error.value = err.message || '生成文案时发生错误'
    } finally {
      isLoading.value = false
    }
  }
  
  // 进度动画
  const startProgressAnimation = () => {
    // 模拟进度增长到70%
    let progress = 0
    const interval = setInterval(() => {
      if (progress < 70) {
        progress += Math.random() * 5
        generationProgress.value = Math.min(progress, 70)
      } else if (!isLoading.value) {
        clearInterval(interval)
      }
    }, 200)
    
    // 确保不管什么情况都会清除interval
    setTimeout(() => clearInterval(interval), 30000)
  }
  
  // 滚动到结果区域
  const scrollToResults = () => {
    setTimeout(() => {
      const scriptDisplay = document.querySelector('.scriptDisplay')
      if (scriptDisplay) {
        scriptDisplay.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start'
        })
      }
    }, 100)
  }
  
  // 解析完整内容
  const parseFullContent = (scriptText) => {
    // 检测是否为分镜头格式的文案
    const isSceneFormat = scriptText.includes('[') && scriptText.includes(']') && scriptText.includes('秒');
    
    // 尝试提取标题
    let title = '';
    let content = scriptText;
    
    // 针对不同格式提取标题和内容
    if (isSceneFormat) {
      // 针对分镜格式的处理
      const titleMatch = scriptText.match(/===?(方案\s*\d+\s*：\s*.+?)===?/);
      if (titleMatch) {
        title = titleMatch[1].trim();
        
        // 删除标题部分，保留后面的分镜内容
        content = scriptText.replace(/===?(方案\s*\d+\s*：\s*.+?)===?\s*/i, '');
      }
    } else {
      // 针对连续文本格式的处理
      const titleMatch = scriptText.match(/^方案\s*\d+\s*：\s*(.+?)[\n\r]/);
      if (titleMatch) {
        title = titleMatch[1].trim();
        content = scriptText.substring(titleMatch[0].length).trim();
      }
    }
    
    return { title, content };
  }
  
  // 设置脚本(用于从历史记录加载)
  const setScripts = (newScripts) => {
    scripts.value = newScripts
  }
  
  // 更新脚本
  const updateScript = (updatedScript) => {
    const index = scripts.value.findIndex(s => s.id === updatedScript.id)
    if (index !== -1) {
      scripts.value[index] = updatedScript
    }
  }
  
  const clearScripts = () => {
    scripts.value = []
  }
  
  return {
    scripts,
    isLoading,
    error,
    generationProgress,
    generateScripts,
    clearScripts,
    setScripts,
    updateScript
  }
}) 