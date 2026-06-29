import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { geminiDevApiPlugin } from './vite.geminiDevPlugin'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react(),
      geminiDevApiPlugin(env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY),
    ],
    server: {
      proxy: {
        '/api/football': {
          target: 'https://api.football-data.org',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/football/, '/v4'),
        },
      },
    },
  }
})
