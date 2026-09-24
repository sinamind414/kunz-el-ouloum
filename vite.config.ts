import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import {createHash} from 'node:crypto';
import {readFileSync, readdirSync, writeFileSync, existsSync} from 'node:fs';
import path from 'path';
import {defineConfig, type Plugin} from 'vite';

/**
 * F3 — injecte un hash de build dans les OCTETS de dist/sw.js.
 * Le navigateur compare les octets du script ; sans cela, `?v=Date.now()`
 * côté register ne déclenchait jamais de réinstallation (audit F3).
 * Hash = sha256(public/sw.js + dist/index.html + noms d'assets) sur 16 hex.
 */
function swBuildHashPlugin(): Plugin {
  return {
    name: 'kunz-sw-build-hash',
    apply: 'build',
    closeBundle() {
      const distSw = path.resolve(__dirname, 'dist', 'sw.js');
      if (!existsSync(distSw)) return;
      const h = createHash('sha256');
      h.update(readFileSync(path.resolve(__dirname, 'public', 'sw.js')));
      const indexHtml = path.resolve(__dirname, 'dist', 'index.html');
      if (existsSync(indexHtml)) h.update(readFileSync(indexHtml));
      const assetsDir = path.resolve(__dirname, 'dist', 'assets');
      if (existsSync(assetsDir)) {
        h.update(readdirSync(assetsDir).sort().join('\n'));
      }
      const hash = h.digest('hex').slice(0, 16);
      let sw = readFileSync(distSw, 'utf-8');
      if (!sw.includes('__SW_BUILD_HASH__') && !/const VERSION = '[0-9a-f]{8,}'/.test(sw)) {
        // placeholder absent et pas déjà injecté → on force la ligne VERSION
        sw = sw.replace(/^const VERSION = .*$/m, `const VERSION = '${hash}';`);
      } else {
        sw = sw.split('__SW_BUILD_HASH__').join(hash);
      }
      writeFileSync(distSw, sw);
      // eslint-disable-next-line no-console
      console.log(`sw.js build hash: ${hash}`);
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), swBuildHashPlugin()],
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
      // Disable file watching when DISABLE_HMR is true to save CPU for agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      // Preview/AI Studio host (sandbox) — sinon Vite répond 403.
      allowedHosts: true,
    },
  };
});
