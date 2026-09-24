import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    test: {
      environment: 'jsdom',
      include: ['src/**/*.test.{ts,tsx}'],
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('tutorKnowledge') || id.includes('smartBotData')) {
              return 'tutor-knowledge-base';
            }
            if (id.includes('bookTutorQA') || id.includes('methodologyKnowledge')) {
              return 'tutor-qa-base';
            }
            // F2 — corpus QCM ne doit jamais retomber dans index-*.js
            if (id.includes('quizCorpus') || id.includes('quizBank')) {
              return 'quiz-corpus';
            }
            // F2 — recharts / d3 hors d'entrée (vues lazy Stats / MindMap)
            if (id.includes('recharts')) {
              return 'charts';
            }
            if (id.includes('/d3/') || id.includes('d3-') || /node_modules\/d3/.test(id)) {
              return 'viz-d3';
            }
          },
        },
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâ€”file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      // Preview/AI Studio host (sandbox) â€” sinon Vite rÃ©pond 403.
      allowedHosts: true,
    },
  };
});
