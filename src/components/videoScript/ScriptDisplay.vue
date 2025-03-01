<template>
  <div class="scriptDisplay" v-if="hasScripts" ref="scriptDisplayRef">
    <h2>文案生成结果</h2>

    <!-- 方案切换标签 -->
    <el-tabs v-model="activeTab" type="card">
      <el-tab-pane v-for="script in scripts" :key="script.id" :label="script.title" :name="script.id">
        <div class="script-header">
          <span class="word-count">字数: {{ script.wordCount }}</span>

          <div class="action-buttons">
            <el-button type="primary" size="small" @click="copyScript(script)">
              复制全部
            </el-button>
            <el-button type="success" size="small" @click="saveToHistory(script)">
              保存至历史
            </el-button>
          </div>
        </div>

        <!-- 整段文案显示 -->
        <div class="content-container">
          <el-card>
            <div class="script-content" v-if="isSceneFormat(script.content)">
              <!-- 分镜格式文案展示 -->
              <div v-for="(scene, index) in parseScenes(script.content)" :key="index" class="scene-item">
                <div class="scene-header">{{ scene.description }}</div>
                <div class="scene-content">{{ scene.content }}</div>
              </div>
            </div>
            <div class="script-content" v-else>
              <!-- 连续文本格式展示 -->
              {{ script.content }}
            </div>
            <div class="edit-button">
              <el-button type="primary" plain size="small" @click="editContent(script)">
                编辑文案
              </el-button>
            </div>
          </el-card>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 编辑文案对话框 -->
    <el-dialog title="编辑文案" v-model="editDialogVisible" width="70%" :before-close="handleDialogClose">
      <div v-if="currentEditScript">
        <el-form :model="editForm">
          <el-form-item label="标题">
            <el-input v-model="editForm.title" />
          </el-form-item>
          <el-form-item label="文案内容">
            <el-input type="textarea" v-model="editForm.content" :autosize="{ minRows: 8, maxRows: 15 }" />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="handleDialogClose">取消</el-button>
        <el-button type="primary" @click="saveContentEdit">保存</el-button>
      </template>
    </el-dialog>
  </div>
  <div v-else class="empty-state">
    <el-empty description="暂无生成的文案，请在上方输入内容并点击生成" />
  </div>
  <div v-if="error" class="script-error">
    <el-alert title="加载脚本时出错" type="error" description="无法加载脚本内容，请重试" show-icon />
    <el-button class="retry-btn" @click="handleRetry">重试</el-button>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useScriptStore } from '@/stores/scriptStore'
import { useHistoryStore } from '@/stores/historyStore'
import { ElMessage } from 'element-plus'
import { useClipboard } from '@vueuse/core'
import { markRaw } from 'vue'

const scriptStore = useScriptStore()
const historyStore = useHistoryStore()
const { copy, copied } = useClipboard()

const scripts = computed(() => scriptStore.scripts)
const hasScripts = computed(() => scripts.value.length > 0)
const activeTab = ref('')
const error = ref(false)

// 当脚本变化时，自动选择第一个标签
watch(scripts, async (newScripts) => {
  if (newScripts.length > 0) {
    await nextTick()
    activeTab.value = newScripts[0].id
  }
}, { immediate: true })

// 确保在加载完成后选择第一个标签
watch(() => scriptStore.isLoading, async (isLoading) => {
  if (!isLoading && scripts.value.length > 0) {
    await nextTick()
    activeTab.value = scripts.value[0].id
  }
})

// 复制脚本
const copyScript = (script) => {
  copy(script.content)
  ElMessage.success('已复制到剪贴板')
}

// 保存到历史记录
const saveToHistory = (script) => {
  // 确保script有完整的结构
  if (!script.scenes) {
    script.scenes = []; // 如果没有场景，添加一个空数组
  }

  if (!script.totalDuration) {
    script.totalDuration = 0; // 如果没有总时长，设置为0
  }

  // 确保有ID和字数信息
  if (!script.id) {
    script.id = `script-${Date.now()}`;
  }

  if (!script.wordCount) {
    script.wordCount = script.content?.length || 0;
  }

  const history = {
    id: Date.now().toString(),
    title: script.title || '未命名文案',
    timestamp: new Date().toISOString(),
    isStarred: false,
    script: JSON.parse(JSON.stringify(script)) // 确保深拷贝，避免引用问题
  }

  // 在添加前进行检查
  console.log('即将保存的历史记录:', history);
  console.log('历史记录验证:', {
    hasId: Boolean(history.id),
    hasTitle: Boolean(history.title),
    hasTimestamp: Boolean(history.timestamp),
    hasScript: Boolean(history.script),
    scriptContent: Boolean(history.script.content),
  });

  historyStore.addHistory(history)
  console.log('已保存到历史记录:', history) // 添加调试信息
  ElMessage.success('已保存至历史记录')
}

// 编辑文案相关
const editDialogVisible = ref(false)
const currentEditScript = ref(null)
const editForm = ref({
  title: '',
  content: ''
})

const editContent = (script) => {
  currentEditScript.value = script
  editForm.value = {
    title: script.title,
    content: script.content
  }
  editDialogVisible.value = true
}

const handleDialogClose = () => {
  editDialogVisible.value = false
  currentEditScript.value = null
}

const saveContentEdit = () => {
  if (!currentEditScript.value) return

  const script = currentEditScript.value
  script.title = editForm.value.title
  script.content = editForm.value.content
  script.wordCount = editForm.value.content.length

  scriptStore.updateScript(script)
  handleDialogClose()
  ElMessage.success('修改已保存')
}

const handleRetry = () => {
  error.value = false
  // 重新加载逻辑...
}

// 淡入效果
const scriptDisplayRef = ref(null)

// 判断文案格式是否为分镜格式
const isSceneFormat = (content) => {
  return content.includes('[') && content.includes(']') && content.includes('秒');
}

// 解析分镜文案
const parseScenes = (content) => {
  const scenes = [];
  const lines = content.split('\n').filter(line => line.trim());

  lines.forEach(line => {
    const match = line.match(/\[(.*?)(\d+秒)\]:\s*(.*)/);
    if (match) {
      scenes.push({
        description: `[${match[1]} ${match[2]}]`,
        content: match[3]
      });
    }
  });

  return scenes;
}

onMounted(() => {
  // DOM变化观察
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList' && mutation.addedNodes.length) {
        // 新内容被添加，应用淡入效果
        setTimeout(() => {
          const cards = scriptDisplayRef.value?.querySelectorAll('.el-card')
          cards?.forEach((card) => {
            card.classList.add('fade-in-card')
          })
        }, 100)
      }
    })
  })

  // 开始观察DOM变化
  if (scriptDisplayRef.value) {
    observer.observe(scriptDisplayRef.value, {
      childList: true,
      subtree: true
    })
  }

  // 组件卸载时停止观察
  return () => observer.disconnect()
})
</script>

<style scoped lang="scss">
.scriptDisplay {
  margin: 30px auto;
  width: 100%;
  max-width: 1000px;

  h2 {
    color: #1890FF;
    margin-bottom: 24px;
  }

  /* 添加蓝色标签样式 */
  :deep(.el-tabs__item.is-active) {
    color: #1890FF;
  }

  :deep(.el-tabs__active-bar) {
    background-color: #1890FF;
  }

  .script-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding: 10px;
    background-color: #E1F5FE;
    border-radius: 8px;

    .word-count {
      font-size: 16px;
      font-weight: bold;
      color: #0277BD;
    }

    .action-buttons {
      display: flex;
      gap: 10px;
    }
  }

  .content-container {
    margin-top: 20px;

    .script-content {
      line-height: 1.8;
      font-size: 16px;
      text-align: justify;
      white-space: pre-wrap;
      padding: 10px 0;
    }

    .edit-button {
      margin-top: 20px;
      text-align: right;
    }

    :deep(.el-card) {
      background-color: #F5FCFF;
      border: 1px solid #D1E9FF;
    }
  }

  // 添加淡入动画
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }

    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .fade-in-card {
    animation: fadeIn 0.5s ease-out forwards;
  }
}

.empty-state {
  margin: 60px auto;
  text-align: center;
}

.script-error {
  margin-top: 20px;
  text-align: center;
}

.retry-btn {
  margin-top: 10px;
}

.scene-item {
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px dashed #e0e0e0;

  &:last-child {
    border-bottom: none;
  }

  .scene-header {
    font-weight: bold;
    color: #1890FF;
    margin-bottom: 8px;
  }

  .scene-content {
    line-height: 1.6;
  }
}

/* 响应式布局 */
@media (max-width: 768px) {
  .scriptDisplay {
    margin: 20px auto;
    
    h2 {
      font-size: 20px;
      margin-bottom: 15px;
    }
    
    .script-header {
      flex-direction: column;
      align-items: flex-start;
      
      .action-buttons {
        margin-top: 10px;
        width: 100%;
        justify-content: space-between;
      }
    }
    
    :deep(.el-dialog) {
      width: 90% !important;
    }
    
    .script-content {
      font-size: 14px;
    }
  }
}
</style>