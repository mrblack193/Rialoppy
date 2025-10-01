import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Nếu deploy trên Vercel thì biến môi trường VERCEL=1
// GitHub Actions thì không có biến này => mặc định là GitHub Pages
const isVercel = process.env.VERCEL === '1'

export default defineConfig({
  plugins: [react()],
  base: isVercel ? '/' : '/Rialoppy/',  // 👈 chỉnh base theo môi trường
  build: {
    outDir: 'dist'
  },
  server: {
    port: 3000,
    open: true
  }
})
