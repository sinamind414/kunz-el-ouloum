import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // 1. Vendors lourds
          if (id.includes('node_modules')) {
            if (id.includes('@supabase')) return 'vendor-supabase'
            if (id.includes('recharts')) return 'vendor-charts'
            if (id.includes('lucide-react')) return 'vendor-icons'
            if (id.includes('motion')) return 'vendor-motion'
            return 'vendor-react'
          }
          // 2. Données lourdes (500 QCM + OPUS + cartes + connaissances)
          if (
            id.includes('src/data') ||
            id.includes('src/knowledgeCards') ||
            id.includes('src/bookTutorQA') ||
            id.includes('src/methodologyKnowledge') ||
            id.includes('src/lessonData') ||
            id.includes('src/knowledge/') ||
            id.includes('src/tutorKnowledge') ||
            id.includes('src/studyGuide') ||
            id.includes('src/smartTutorEngine')
          ) {
            return 'kunz-data'
          }
          // 3. Moteurs + contextes (utils, engines, auth)
          if (
            id.includes('src/utils') ||
            id.includes('src/context')
          ) {
            return 'kunz-engines'
          }
        }
      }
    }
  }
})
