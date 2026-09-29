import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, type Plugin} from 'vite';

/**
 * Émet `dist/assets-manifest.json` : la liste de TOUS les fichiers produits par
 * le build (entrée + chunks à la demande + CSS).
 *
 * Nécessaire depuis le découpage des sprints 30-32 : le service worker
 * découvrait les ressources à précacher en lisant `index.html`, qui ne
 * référence plus que l'entrée. Les chunks chargés dynamiquement (leçons,
 * annales, statistiques…) n'étaient donc plus disponibles hors ligne — une
 * régression invisible tant qu'on teste avec le réseau.
 */
function assetsManifestPlugin(): Plugin {
  return {
    name: 'kunz-assets-manifest',
    apply: 'build',
    generateBundle(_options, bundle) {
      const fichiers = Object.keys(bundle)
        .filter((f) => f.endsWith('.js') || f.endsWith('.css'))
        .map((f) => `/${f}`)
        .sort();
      this.emitFile({
        type: 'asset',
        fileName: 'assets-manifest.json',
        source: JSON.stringify({ generatedAt: new Date().toISOString(), assets: fichiers }, null, 2),
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), assetsManifestPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    test: {
      environment: 'jsdom',
      // Sprint 58 : le dossier `server/` entre dans la suite. Il en était
      // absent, si bien qu'aucun test ne couvrait le démarrage du serveur —
      // c'est précisément là qu'un échec bloque TOUT le monde.
      include: ['src/**/*.test.{ts,tsx}', 'server/**/*.test.ts'],
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
            // Sprint 40 — socle tiers isolé du code applicatif.
            // Motif : à chaque mise à jour de l'app, un élève en 3G
            // re-téléchargeait React, React-DOM et la bibliothèque
            // d'animation avec le reste, alors que ces paquets ne changent
            // pratiquement jamais. Séparés, ils restent dans le cache du
            // navigateur (et du service worker) d'une version à l'autre.
            if (id.includes('node_modules')) {
              if (id.includes('react-dom') || id.includes('/react/') || id.includes('scheduler')) {
                return 'vendor-react';
              }
              if (id.includes('motion') || id.includes('framer')) return 'vendor-motion';
              if (id.includes('lucide-react')) return 'vendor-icons';
            }
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
