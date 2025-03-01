/**
 * 根据用户输入构建AI提示词
 */
export const buildPrompt = (formData) => {
  // 长度映射
  const lengthMap = {
    1: '短（30秒以内）',
    2: '中（30-60秒）',
    3: '长（60-90秒）'
  }
  
  // 基础提示词模板
  let prompt = `请为我生成一个关于【${formData.content}】的短视频脚本，要求：\n`
  
  // 添加类型要求
  prompt += `1. 内容类型：${formData.type}\n`
  
  // 添加风格要求
  prompt += `2. 文案风格：${formData.style}\n`
  
  // 添加长度要求
  prompt += `3. 视频长度：${lengthMap[formData.length]}\n`
  
  // 添加目标人群
  prompt += `4. 目标人群：${formData.ageRange}岁${formData.gender !== '不限' ? formData.gender : ''}\n`
  
  // 添加结构要求
  prompt += `5. 输出格式为分镜脚本，包含每个片段的时长、画面描述和旁白文案，例如：
  [开场5s]: {场景描述} "{旁白台词}"
  [产品展示15s]: {场景描述} "{旁白台词}"
  [结尾5s]: {场景描述} "{旁白台词}"\n`
  
  // 添加生成数量要求
  prompt += `6. 请提供3个不同方案的脚本，每个方案作为独立的完整脚本。在方案之间使用 "===方案分隔线===" 进行分隔。`
  
  return prompt
}

/**
 * 解析AI返回的文本，转为结构化的脚本数据
 */
export const parseAIResponse = (response) => {
  // 按分隔线分割多个方案
  const plans = response.split('===方案分隔线===').map(plan => plan.trim())
  
  // 处理每个方案
  const parsedPlans = plans.map((plan, index) => {
    // 提取分镜段落
    const scenes = []
    const regex = /\[(.*?)(\d+)s\]:(.*?)(?=\[|$)/gs
    let match
    let totalDuration = 0
    
    while ((match = regex.exec(plan)) !== null) {
      const sceneTitle = match[1].trim()
      const duration = parseInt(match[2])
      const content = match[3].trim()
      
      scenes.push({
        id: Date.now() + Math.random(),
        title: sceneTitle,
        duration,
        content
      })
      
      totalDuration += duration
    }
    
    return {
      id: `plan-${index + 1}`,
      title: `方案${index + 1}`,
      scenes,
      totalDuration
    }
  })
  
  return parsedPlans.filter(plan => plan.scenes.length > 0)
} 