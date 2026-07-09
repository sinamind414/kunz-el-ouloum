import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // 1. Séparer les grosses librairies externes
          // (react / motion / misc regroupés pour éviter les chunks circulaires)
          if (id.includes('node_modules')) {
            if (id.includes('recharts')) {
              return 'vendor-charts'
            }
            if (id.includes('lucide-react')) {
              return 'vendor-icons'
            }
            return 'vendor-react'
          }

          // 2. Séparer les données massives OPUS par domaine
          if (id.includes('knowledge/domain1.ts')) return 'opus-d1'
          if (id.includes('knowledge/domain2.ts')) return 'opus-d2'
          if (id.includes('knowledge/domain3.ts')) return 'opus-d3'
          
          // 3. Séparer les données BAC
          if (id.includes('bacRealSubjects.ts')) return 'bac-data'
        }
      }
    }
  }
})
