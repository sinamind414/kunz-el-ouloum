import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { createHash } from 'crypto';
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'fs';
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

/**
 * R2 audit externe 2026-10-15 — injecte un identifiant de build dans
 * `dist/sw.js` (remplace `__BUILD_ID__`).
 *
 * L'identifiant est le hash du contenu de TOUS les fichiers émis (sw.js
 *excepté, qui porte le placeholder) : déterministe, il ne change que si la
 * production du build change réellement — leçons et schémas compris. Entre
 * deux visites sans déploiement, les octets de sw.js sont identiques, donc le
 * navigateur ne réinstalle PAS le worker et les caches (shell, runtime,
 * schémas) sont conservés. À chaque déploiement, l'identifiant neuf renomme
 * les caches et `cleanupOldCaches()` (public/sw.js) purge les périmés.
 *
 * Jusqu'ici, l'enregistrement `/sw.js?v=${Date.now()}` forçait les deux à
 * chaque visite : re-téléchargement complet de ~15 Mo par ouverture.
 */
function swBuildIdPlugin(): Plugin {
  return {
    name: 'kunz-sw-build-id',
    apply: 'build',
    closeBundle() {
      const distDir = path.resolve(__dirname, 'dist');
      const swPath = path.resolve(distDir, 'sw.js');
      if (!existsSync(swPath)) {
        this.warn('dist/sw.js introuvable : identifiant de build non injecté');
        return;
      }
      if (!existsSync(path.resolve(distDir, 'index.html'))) {
        this.warn('dist/ incomplet : identifiant de build non injecté');
        return;
      }
      // Hash du contenu de tous les fichiers de dist/ (chemins triés pour la
      // stabilité de l'ordre), sw.js exclu : il porte le placeholder.
      const hash = createHash('sha256');
      const parcourir = (dir: string, prefixe = ''): void => {
        for (const entree of readdirSync(dir).sort()) {
          const absolu = path.resolve(dir, entree);
          const relatif = prefixe + entree;
          if (relatif === 'sw.js') continue;
          if (statSync(absolu).isDirectory()) {
            parcourir(absolu, relatif + '/');
          } else {
            hash.update(relatif);
            hash.update(readFileSync(absolu));
          }
        }
      };
      parcourir(distDir);
      const buildId = hash.digest('hex').slice(0, 12);
      const sw = readFileSync(swPath, 'utf8');
      if (!sw.includes('__BUILD_ID__')) {
        this.warn('placeholder __BUILD_ID__ absent de public/sw.js : rien à injecter');
        return;
      }
      writeFileSync(swPath, sw.replaceAll('__BUILD_ID__', buildId), 'utf8');
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), assetsManifestPlugin(), swBuildIdPlugin()],
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
