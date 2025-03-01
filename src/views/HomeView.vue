<template>
  <div class="homeView">
    <el-card class="main-card">
      <template #header>
        <div class="page-header">
          <h1>短视频文案生成系统</h1>
          <p class="subtitle">快速生成吸引人的短视频脚本，让创作更简单</p>
        </div>
      </template>

      <div class="main-content" :class="{ 'has-result': hasScripts }">
        <!-- 输入表单 -->
        <script-form />

        <!-- 生成结果 -->
        <script-display v-if="hasScripts" />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import ScriptForm from '@/components/videoScript/ScriptForm.vue'
import ScriptDisplay from '@/components/videoScript/ScriptDisplay.vue'
import { useScriptStore } from '@/stores/scriptStore'
import { computed } from 'vue'

const scriptStore = useScriptStore()
const hasScripts = computed(() => scriptStore.scripts.length > 0)
</script>

<style scoped lang="scss">
.homeView {
  max-width: 1200px;
  margin: 20px auto;
  padding: 0 20px;

  .main-card {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    border-radius: 12px;
    background-color: #F0F9FF;
    /* 改为浅天蓝色背景，与其他组件统一 */

    .page-header {
      text-align: center;
      margin-bottom: 20px;

      h1 {
        font-size: 28px;
        margin-bottom: 10px;
        color: #1890FF;
        /* 蓝色标题 */
      }

      .subtitle {
        color: #0277BD;
        /* 深蓝色副标题 */
        font-size: 16px;
      }
    }

    .main-content {
      transition: all 0.3s ease;

      &.has-result {
        display: flex;
        flex-direction: column;
        gap: 30px;
      }
    }
  }
}

@media (max-width: 768px) {
  .homeView {
    padding: 10px;

    .main-card {
      .page-header {
        h1 {
          font-size: 22px;
        }

        .subtitle {
          font-size: 14px;
        }
      }
    }
  }
}
</style>
