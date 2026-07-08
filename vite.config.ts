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
    // Con un solo tunel de ngrok apuntando a este dev server (5173), reenviamos
    // /api al backend (8080). Asi el webhook, los back_urls y las llamadas del
    // front comparten el mismo dominio publico. El backend usa context-path /api,
    // por eso no reescribimos la ruta.
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
