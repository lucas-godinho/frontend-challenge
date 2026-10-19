import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  server: { host: '0.0.0.0' },
  preview: { host: '0.0.0.0' },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // three.js is ~600 KB minified — always async, never in initial bundle
          if (id.includes('node_modules/three')) return 'three'
          // MSW is only active in demo/dev builds; split to avoid polluting critical path
          if (id.includes('node_modules/msw')) return 'msw'
          // socket.io-client is async (loaded after MSW init)
          if (id.includes('node_modules/socket.io-client') || id.includes('node_modules/engine.io-client')) return 'socketio'
          // Radix/shadcn UI primitives — large but shared across pages
          if (id.includes('node_modules/@radix-ui') || id.includes('node_modules/radix-ui')) return 'radix'
        },
      },
    },
  },
})
