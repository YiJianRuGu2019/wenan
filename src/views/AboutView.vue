<template>
  <div class="aboutView">
    <el-card class="about-card">
      <template #header>
        <div class="page-header">
          <h1>关于系统</h1>
        </div>
      </template>
      
      <div class="about-content">
        <h2>短视频文案生成系统</h2>
        <p class="version">版本: 1.0.0</p>
        
        <el-divider></el-divider>
        
        <h3>系统简介</h3>
        <p>
          短视频文案生成系统是一款专为内容创作者设计的AI辅助工具，通过简单的输入即可快速生成专业、吸引人的短视频脚本。
          系统基于大型语言模型，能够根据用户需求生成多种风格的文案，帮助创作者提高效率、突破创作瓶颈。
        </p>
        
        <h3>主要功能</h3>
        <ul>
          <li>支持带货、科普、生活vlog等多种类型文案生成</li>
          <li>可选择简洁、活泼、专业等不同风格</li>
          <li>自定义目标人群和视频长度</li>
          <li>每次提供多个备选方案供对比选择</li>
          <li>支持文案历史记录保存与再编辑</li>
          <li>分镜脚本格式，直接可用于短视频拍摄</li>
        </ul>
        
        <h3>使用建议</h3>
        <p>
          1. 输入内容越具体，生成的文案质量越高<br>
          2. 可多尝试不同风格组合，找到最适合自己的风格<br>
          3. 生成后可手动编辑各分镜内容，进一步完善<br>
          4. 重要文案请及时保存至历史记录
        </p>
        
        <el-divider></el-divider>
        
        <p class="copyright">© 2023 短视频文案生成系统 - 保留所有权利</p>
      </div>
    </el-card>
  </div>
</template>

<style scoped lang="scss">
.aboutView {
  max-width: 800px;
  margin: 20px auto;
  padding: 0 20px;
  
  .about-card {
    border-radius: 12px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    background-color: #F0F9FF; /* 浅天蓝色背景 */
    
    .page-header {
      text-align: center;
      
      h1 {
        font-size: 24px;
        color: #1890FF; /* 蓝色标题 */
      }
    }
    
    .about-content {
      padding: 10px;
      
      h2 {
        font-size: 22px;
        margin-bottom: 5px;
        color: #1890FF; /* 蓝色标题 */
      }
      
      .version {
        color: #0277BD; /* 深蓝色文字 */
        margin-bottom: 20px;
      }
      
      h3 {
        font-size: 18px;
        margin: 20px 0 10px;
        color: #0277BD; /* 深蓝色文字 */
      }
      
      p {
        line-height: 1.6;
        color: #333;
        margin-bottom: 15px;
      }
      
      /* 修改分割线颜色 */
      :deep(.el-divider) {
        background-color: #B3E5FC;
      }
    }
  }
}
</style> 