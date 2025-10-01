import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  const config = {
    plugins: [react()],
    base: '/',
  }

  // Use the repository name as the base path only when building for production (GitHub Pages)
  if (command === 'build') {
    // QUAN TRỌNG: Thay 'rialo' bằng tên repository GitHub của bạn.
    // Ví dụ: nếu URL repo là https://github.com/user/my-game, bạn sẽ đặt là '/my-game/'
    config.base = '/rialo/'
  }

  return config
})