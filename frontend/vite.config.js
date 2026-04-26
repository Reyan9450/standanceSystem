import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  
  server: {
    host: '0.0.0.0', // allow external access
    port: 5173,      // local dev port
  },

  preview: {
    host: '0.0.0.0', // required for Render
    port: process.env.PORT || 4173, // Render gives PORT
  }
})