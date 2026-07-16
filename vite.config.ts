import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('MethodologyView')) return 'methodology';
          if (id.includes('MyPathView')) return 'mypath';
          if (id.includes('TrainingView') || id.includes('Training')) return 'training';
          if (id.includes('ProgressView')) return 'progress';
          if (id.includes('ValidationEngine') || id.includes('/validation/')) return 'validation';
          if (id.includes('node_modules')) return 'vendor';
        },
      },
    },
  },
})
