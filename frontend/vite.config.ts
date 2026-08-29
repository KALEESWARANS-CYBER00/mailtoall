import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Forward all /api/* and /assets/* requests to the Flask backend
      '/api': {
        target: 'http://127.0.0.1:5005',
        changeOrigin: true,
      },
    },
  },
})

