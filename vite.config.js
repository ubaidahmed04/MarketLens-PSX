import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Dev proxy: browser calls /sarmaaya/... and /lineup/... on localhost,
// Vite forwards them to the real servers. This avoids CORS errors in development.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/sarmaaya': {
        target: 'https://beta-restapi.sarmaaya.pk',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/sarmaaya/, ''),
      },
      '/lineup': {
        target: 'https://nfapi037.lineup.pk',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/lineup/, ''),
      },
    },
  },
})
