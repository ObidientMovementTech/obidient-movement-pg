import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react(),
      {
        name: 'html-transform',
        transformIndexHtml: {
          order: 'pre',
          handler(html) {
            return html.replace(
              /%VITE_SMARTSUPP_KEY%/g,
              env.VITE_SMARTSUPP_KEY || ''
            )
          }
        }
      }
    ],
    resolve: {
      alias: {
        src: "/src",
      },
    },
  }
})