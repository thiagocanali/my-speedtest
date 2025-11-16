import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// Importante: base deve ser o nome do seu repositório para GitHub Pages
export default defineConfig({
  base: '/my-speedtest/',
  plugins: [vue()]
})
