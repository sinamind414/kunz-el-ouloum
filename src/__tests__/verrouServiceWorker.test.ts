// verrouServiceWorker.test.ts — R2 de l'audit externe (15/10/2026).
//
// Défaut prouvé : `main.tsx` enregistrait le service worker avec
// `?v=${Date.now()}`. Deux effets enchaînés à CHAQUE visite :
//   1. le navigateur traite sw.js comme un fichier neuf (contournement de la
//      comparaison d'octets) → réinstallation du worker ;
//   2. `public/sw.js` dérivait VERSION du paramètre `v` → nouveaux noms de
//      caches → `cleanupOldCaches()` supprimait les précédents.
// Bilan : shell + leçons + assets du build re-téléchargés à chaque ouverture
// (jusqu'à ~15 Mo), aux dépens des données mobiles — le public visé.
//
// Le correctif attendu : le versionnage vit DANS sw.js (identifiant de build
// injecté par Vite), et l'enregistrement est stable d'une visite à l'autre.

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const RACINE = process.cwd();
const MAIN = readFileSync(resolve(RACINE, 'src/main.tsx'), 'utf-8');
const SW = readFileSync(resolve(RACINE, 'public/sw.js'), 'utf-8');
const CONFIG = readFileSync(resolve(RACINE, 'vite.config.ts'), 'utf-8');

describe('service worker — versionnage par build, pas par visite', () => {
  it('enregistre /sw.js sans cache-buster Date.now()', () => {
    expect(MAIN.includes(".register('/sw.js')"), 'registration stable attendue').toBe(true);
    expect(MAIN.includes('sw.js?v='), 'le cache-buster par visite est interdit').toBe(false);
  });

  it('le SW dérive VERSION du BUILD_ID injecté au build', () => {
    expect(SW.includes('__BUILD_ID__'), 'placeholder __BUILD_ID__ attendu dans public/sw.js').toBe(
      true,
    );
    expect(SW, 'VERSION doit dépendre de BUILD_ID (plus de version par paramètre d’URL)').toMatch(
      /VERSION[^;]*BUILD_ID/,
    );
  });

  it('vite.config.ts injecte l’identifiant de build dans dist/sw.js', () => {
    expect(CONFIG.includes('kunz-sw-build-id'), 'plugin d’injection attendu').toBe(true);
    expect(CONFIG.includes('__BUILD_ID__'), 'le plugin doit remplacer __BUILD_ID__').toBe(true);
  });
});
