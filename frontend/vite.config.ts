import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],
  server: {
    host: '0.0.0.0', // listen on all interfaces → accessible on LAN
    port: 5173,
    proxy: {
      // Proxy /api calls to the AdonisJS backend so any LAN device only
      // needs to reach port 5173 — no need to expose 3333 separately.
      '/api': {
        target: 'http://localhost:3333',
        changeOrigin: true,
      },
    },
  },
})
