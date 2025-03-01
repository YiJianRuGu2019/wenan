const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  // 确保输出目录为dist
  outputDir: 'dist',
  
  // 开发服务器代理配置
  devServer: {
    proxy: {
      '/api': {
        target: 'https://api.deepseek.com/v1',
        changeOrigin: true,
        pathRewrite: {
          '^/api': ''
        }
      }
    }
  },

  configureWebpack: {
    plugins: [
      // 添加特性标志定义
      new (require('webpack').DefinePlugin)({
        __VUE_OPTIONS_API__: JSON.stringify(true),
        __VUE_PROD_DEVTOOLS__: JSON.stringify(false),
        __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: JSON.stringify(false)
      })
    ]
  }
})
