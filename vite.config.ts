/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import obfuscatorPlugin from 'vite-plugin-javascript-obfuscator'

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    tailwindcss(),
    // On active l'obfuscation uniquement en production pour ne pas ralentir ton développement local
    mode === 'production' ? obfuscatorPlugin({
      include: ['src/**/*.ts', 'src/**/*.tsx'],
      exclude: [/node_modules/],
      apply: 'build',
      debugger: true,
      options: {
        // Niveau moyen/élevé d'obfuscation (équilibre entre sécurité et performance)
        compact: true,
        controlFlowFlattening: true,
        controlFlowFlatteningThreshold: 0.5, // 50% du code sera restructuré
        deadCodeInjection: true,
        deadCodeInjectionThreshold: 0.2, // Injecte du code mort pour tromper le hacker
        debugProtection: true, // Fait crasher la console DevTools (Anti-Debug)
        debugProtectionInterval: 2000,
        disableConsoleOutput: true, // Coupe les console.log
        identifierNamesGenerator: 'hexadecimal', // Les variables deviennent des _0x3b1c
        log: false,
        numbersToExpressions: true, // Transforme les nombres en calculs aléatoires
        renameGlobals: false,
        selfDefending: true, // Le code se bloque s'il est formaté (beautifié)
        simplify: true,
        splitStrings: true,
        splitStringsChunkLength: 5,
        stringArray: true,
        stringArrayCallsTransform: true,
        stringArrayCallsTransformThreshold: 0.5,
        stringArrayEncoding: ['base64'], // Crypte les chaînes de caractères
        stringArrayIndexShift: true,
        stringArrayRotate: true,
        stringArrayShuffle: true,
        stringArrayWrappersCount: 1,
        stringArrayWrappersChainedCalls: true,
        stringArrayWrappersParametersMaxCount: 2,
        stringArrayWrappersType: 'variable',
        stringArrayThreshold: 0.75,
        unicodeEscapeSequence: false
      }
    }) : undefined
  ].filter(Boolean),
  test: {
    environment: 'jsdom',
    globals: true,
  },
  build: {
    sourcemap: false, // CRITIQUE : on ne génère JAMAIS les sourcemaps en production
    chunkSizeWarningLimit: 1500, // On augmente la limite car l'obfuscator alourdit le code
    modulePreload: {
      resolveDependencies: (_filename, deps, context) => {
        if (context.hostType !== 'html') return deps
        return deps.filter((dep) => !(
          dep.includes('training-')
          || dep.includes('progress-')
          || dep.includes('methodology-')
          || dep.includes('mypath-')
          || dep.includes('validation-')
          || dep.includes('vendor-supabase-')
          || dep.includes('vendor-charts-')
        ))
      },
    },
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
}))
