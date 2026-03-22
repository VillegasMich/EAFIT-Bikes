import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: ['manuel-lenovo-ideapad-s540-14api'],
    proxy: {
      '/locations': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
