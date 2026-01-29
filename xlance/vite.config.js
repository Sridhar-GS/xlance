import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
  
    react(),
  ],
  server: {
    allowedHosts: ['forced-ludie-bailable.ngrok-free.dev', 'localhost'],
  },
})
