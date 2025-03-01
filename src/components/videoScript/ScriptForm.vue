<template>
  <div class="scriptForm">
    <h2>创建短视频文案</h2>

    <!-- 核心输入区 -->
    <el-form :model="formData" :rules="rules" ref="formRef">
      <!-- 文本输入框 -->
      <el-form-item prop="content">
        <el-input v-model="formData.content" type="textarea" :autosize="{ minRows: 4, maxRows: 8 }"
          placeholder="请输入短视频文案内容（500字以内）" maxlength="500" show-word-limit />
      </el-form-item>

      <!-- 快捷标签选择 -->
      <el-form-item label="文案类型" prop="type">
        <el-radio-group v-model="formData.type">
          <el-radio label="带货">带货</el-radio>
          <el-radio label="科普">科普</el-radio>
          <el-radio label="生活vlog">生活vlog</el-radio>
        </el-radio-group>
      </el-form-item>

      <!-- 文案风格 -->
      <el-form-item label="文案风格" prop="style">
        <el-select v-model="formData.style" placeholder="请选择文案风格">
          <el-option label="简洁" value="简洁"></el-option>
          <el-option label="活泼" value="活泼"></el-option>
          <el-option label="专业" value="专业"></el-option>
        </el-select>
      </el-form-item>

      <!-- 生成长度控制 -->
      <el-form-item label="生成长度" style="margin-left: 10px;">
        <el-slider v-model="formData.length" :marks="{ 1: '短', 2: '中', 3: '长' }" :min="1" :max="3" :step="1" />
      </el-form-item>

      <!-- 目标人群设置 -->
      <el-form-item label="目标人群" style="margin-top: 50px;margin-left: 10px;">
        <div class="audience-wrapper">
          <el-select v-model="formData.ageRange" placeholder="年龄段">
            <el-option label="18-24岁" value="18-24"></el-option>
            <el-option label="25-35岁" value="25-35"></el-option>
            <el-option label="36-45岁" value="36-45"></el-option>
            <el-option label="45岁以上" value="45+"></el-option>
          </el-select>

          <el-select v-model="formData.gender" placeholder="性别" style="margin-left: 20px;">
            <el-option label="不限" value="不限"></el-option>
            <el-option label="男性" value="男性"></el-option>
            <el-option label="女性" value="女性"></el-option>
          </el-select>
        </div>
      </el-form-item>

      <!-- 生成按钮 -->
      <el-form-item>
        <div style="margin-left: 10px;">
          <el-button type="primary" @click="generateScript" :loading="scriptStore.isLoading">
            {{ scriptStore.isLoading ? '生成中...' : '生成文案' }}
          </el-button>
          <el-button @click="resetForm">重置</el-button>
        </div>

      </el-form-item>

    </el-form>

    <!-- 进度条 -->
    <el-progress v-if="scriptStore.isLoading || showProgress" :percentage="scriptStore.generationProgress"
      :format="format" status="success" class="generation-progress" />

    <!-- 示例问题提示 -->
    <el-popover placement="right" title="示例问题" :width="300" trigger="click">
      <template #reference>
        <el-button circle type="info" class="help-btn">
          <el-icon>
            <QuestionFilled />
          </el-icon>
        </el-button>
      </template>
      <div class="example-questions">
        <p @click="fillExample('如何制作一个清新自然的化妆品使用教程？')">
          如何制作一个清新自然的化妆品使用教程？
        </p>
        <p @click="fillExample('智能手表功能详解及购买理由')">
          智能手表功能详解及购买理由
        </p>
        <p @click="fillExample('分享一日轻松减脂的饮食与运动安排')">
          分享一日轻松减脂的饮食与运动安排
        </p>
      </div>
    </el-popover>

    <!-- 添加错误提示 -->
    <el-alert v-if="scriptStore.error" title="生成失败" type="error" :description="scriptStore.error" show-icon closable />
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { useScriptStore } from '@/stores/scriptStore'
import { ElMessage } from 'element-plus'
import { debounce } from '@/utils/helpers'

const scriptStore = useScriptStore()
const formRef = ref(null)

const formData = reactive({
  content: '',
  type: '带货',
  style: '简洁',
  length: 2,
  ageRange: '25-35',
  gender: '不限'
})

const rules = {
  content: [
    { required: true, message: '请输入文案内容', trigger: 'blur' },
    { max: 500, message: '输入内容不能超过500字', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择文案类型', trigger: 'change' }
  ],
  style: [
    { required: true, message: '请选择文案风格', trigger: 'change' }
  ]
}

const showProgress = ref(false)

const generateScript = debounce(async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()

    // 清除之前的错误
    if (scriptStore.error) {
      scriptStore.error = null
    }

    // 调用store中的生成方法
    await scriptStore.generateScripts(formData)

    // 检查是否有错误
    if (scriptStore.error) {
      ElMessage.error('生成失败: ' + scriptStore.error)
      return
    }

    // 成功提示
    ElMessage.success('文案生成成功！')

    // 使用平滑滚动到结果区域
    setTimeout(() => {
      const scriptDisplay = document.querySelector('.scriptDisplay')
      if (scriptDisplay) {
        scriptDisplay.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        })
      }
    }, 300)
  } catch (error) {
    console.error('表单验证失败或API请求出错:', error)
    ElMessage.error('生成失败，请检查输入内容或稍后再试')
  }
}, 500)

const resetForm = () => {
  formRef.value?.resetFields()
}

const fillExample = (example) => {
  formData.content = example
}

// 格式化进度条文本
const format = (percentage) => {
  if (percentage < 40) return '分析内容中...'
  if (percentage < 70) return '生成创意中...'
  if (percentage < 90) return '构建场景中...'
  if (percentage < 100) return '完善细节中...'
  return '完成！'
}

// 监听进度变化，保持进度条显示一段时间
watch(() => scriptStore.generationProgress, (newVal) => {
  if (newVal === 100) {
    showProgress.value = true
    setTimeout(() => {
      showProgress.value = false
    }, 2000)
  }
})
</script>

<style scoped lang="scss">
.scriptForm {
  width: 100%;
  max-width: 1000px;
  font-size: 20px;
  margin: 0 auto;
  padding: 20px;
  background-color: #F0F9FF;
  /* 浅天蓝色背景，提供清新的视觉效果 */
  border-radius: 10px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);


  h2 {
    color: #1890FF;
    /* 品牌蓝色，用于标题强调 */
    margin-bottom: 24px;
  }

  .audience-wrapper {
    width: 240px;
    display: flex;
    // gap: 16px;
  }

  .help-btn {
    position: absolute;
    right: 20px;
    top: 20px;
  }

  .example-questions {
    p {
      cursor: pointer;
      padding: 8px 0;

      &:hover {
        color: #409EFF;
        /* 浅蓝色高亮，用于交互反馈 */
      }
    }
  }

  /* 覆盖 Element Plus 默认样式 */
  /* 设置主按钮背景色为品牌蓝色 */
  :deep(.el-button--primary) {
    background-color: #1890FF;
    /* 主按钮蓝色，与品牌色一致 */
  }

  /* 设置滑块激活区域为品牌色 */
  :deep(.el-slider__bar) {
    background-color: #1890FF;
    /* 滑块激活区域蓝色，与品牌色一致 */
  }

  .generation-progress {
    width: 100%;
    max-width: 500px;
    margin-top: 20px;
    margin-bottom: 20px;
    margin-left: auto;
    margin-right: auto;
  }

  /* 设置表单内文字大小 */
  /* 增大表单标签文字尺寸和粗细，提高可读性 */
  :deep(.el-form-item__label) {
    font-size: 17px;
    font-weight: 500;
  }

  /* 自定义输入框占位符样式，提高用户提示的可见度 */
  :deep(.el-input__inner)::placeholder,
  :deep(.el-textarea__inner)::placeholder {
    font-size: 17px;
    color: #888;
    /* 移除padding，避免垂直不对齐 */
    line-height: 1.6;
  }

  /* 确保输入文字与占位符同样的样式和定位 */
  :deep(.el-textarea__inner) {
    font-size: 17px;
    line-height: 1.5;
    padding: 13px 20px;
  }

  /* 统一表单中所有交互元素的字体大小 */
  :deep(.el-input__inner),
  :deep(.el-textarea__inner),
  :deep(.el-radio__label),
  :deep(.el-select-dropdown__item) {
    font-size: 16px;
    padding-top: 20px;
  }

  .scriptForm .generation-progress[data-v-6c2ff2e8] {
    width: 100%;
    max-width: 400px;
  }
}

/* 响应式布局适配 */
@media (max-width: 768px) {
  .scriptForm {
    padding: 15px;
    font-size: 16px;
    
    h2 {
      font-size: 20px;
      margin-bottom: 15px;
    }
    
    .audience-wrapper {
      width: 100%;
      flex-direction: column;
      gap: 10px;
      
      .el-select {
        width: 100% !important;
        margin-left: 0 !important;
      }
    }
    
    :deep(.el-form-item__label) {
      font-size: 15px;
    }
    
    :deep(.el-textarea__inner) {
      padding: 10px;
    }
    
    .el-form-item {
      margin-bottom: 15px;
    }
  }
}
</style>