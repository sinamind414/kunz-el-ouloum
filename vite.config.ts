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
      // Les contrôles de `src/build/` portent sur le RÉSULTAT d'un build
      // (dist/assets) et non sur le code source : ils n'ont rien à faire dans
      // la suite unitaire, où ils produisaient des échecs permanents dans
      // toute copie sans build. Ils se lancent par `npm run test:build`
      // (vite.build-test.config.ts), après le build.
      exclude: ['node_modules/**', 'dist/**', 'src/build/**'],
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
            if (id.includes('lessonIndex')) {
              return 'tutor-lesson-index';
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
