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
      '/bikes': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        bypass(req) {
          if (req.headers.accept?.includes('text/html')) {
            return '/index.html';
          }
        },
      },
      '/reservations': {
        target: 'http://localhost:8001',
        changeOrigin: true,
      },
      '/events': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
