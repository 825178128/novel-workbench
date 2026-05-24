import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // 注意: 开发环境下浏览器直接请求API会有跨域问题
  // 解决方案1: 安装浏览器CORS插件(推荐)
  // 解决方案2: 使用Electron后无跨域限制
  // 解决方案3: 添加后端代理(正式上线时用)
})
