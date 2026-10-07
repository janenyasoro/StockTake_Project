import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',  // Make sure this is '/'
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'https://stocktake-api.onrender.com',  // Your Render backend URL
        changeOrigin: true,
      }
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'esbuild',
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
})