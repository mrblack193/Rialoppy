import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // 👇 rất quan trọng khi deploy GitHub Pages
  base: '/Rialoppy/',

  build: {
    outDir: 'dist', // mặc định Vite build ra dist
  },

  server: {
    port: 3000, // có thể chỉnh port khi dev local
    open: true, // tự động mở trình duyệt
  },
})
