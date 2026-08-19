/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// NOTE (audit ARCH-001) : l'obfuscateur javascript-obfuscator a été retiré.
// Il transformait les imports dynamiques de React.lazy en concaténations
// calculées à l'exécution, ce qui empêchait Vite d'émettre les chunks de vue :
// le build de production ne produisait que 3 chunks (au lieu de ~59) et toutes
// les vues lazy échouaient au chargement (chunk manquant servi en text/html).
// L'obfuscation d'un client web n'apporte par ailleurs aucune protection réelle.

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    // Autorise les hôtes de prévisualisation distants (sandbox/tunnels) en développement.
    allowedHosts: true,
  },
  test: {
    environment: 'jsdom',
    globals: true,
  },
  build: {
    sourcemap: false, // pas de sourcemap publique en production
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('/node_modules/react/') || id.includes('/node_modules/react-dom/') || id.includes('/node_modules/scheduler/')) {
            return 'vendor-react';
          }
          if (
            id.includes('/node_modules/recharts/')
            || id.includes('/node_modules/victory-vendor/')
            || id.includes('/node_modules/d3-')
            || id.includes('/node_modules/react-redux/')
            || id.includes('/node_modules/@reduxjs/')
            || id.includes('/node_modules/redux/')
            || id.includes('/node_modules/reselect/')
            || id.includes('/node_modules/immer/')
            || id.includes('/node_modules/use-sync-external-store/')
          ) {
            return 'vendor-charts';
          }
          if (id.includes('/node_modules/@supabase/')) return 'vendor-supabase';
          if (
            id.includes('/node_modules/motion/')
            || id.includes('/node_modules/motion-dom/')
            || id.includes('/node_modules/motion-utils/')
            || id.includes('/node_modules/framer-motion/')
          ) {
            return 'vendor-motion';
          }
          if (id.includes('/node_modules/lucide-react/')) return 'vendor-icons';
          if (id.includes('node_modules')) return 'vendor';
        },
      },
    },
  },
})
