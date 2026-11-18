import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// /api 요청은 백엔드로 프록시한다. compose 안에서는 http://backend:8000.
const apiTarget = process.env.VITE_API_PROXY_TARGET ?? 'http://localhost:8000'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': { target: apiTarget, changeOrigin: true },
    },
  },
})
