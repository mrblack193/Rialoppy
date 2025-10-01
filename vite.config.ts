import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Nếu deploy trên Vercel -> base: '/' 
// Nếu deploy GitHub Pages -> base: '/Rialoppy/'
const isVercel = process.env.VERCEL === '1'

export default defineConfig({
  plugins: [react()],
  base: isVercel ? '/' : '/Rialoppy/',
  build: {
    outDir: 'dist',
  },
})
