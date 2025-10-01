import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Tự động chọn base: GitHub Pages thì "/Rialoppy/", còn Vercel thì "/"
const isGithubActions = process.env.GITHUB_ACTIONS === 'true'

export default defineConfig({
  plugins: [react()],
  base: isGithubActions ? '/Rialoppy/' : '/'
})
