import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Necesario para exponer el dev server a traves de ngrok: escucha en todas
    // las interfaces y permite el host publico del tunel (por defecto Vite lo bloquea).
    host: true,
    allowedHosts: true,
  },
})
