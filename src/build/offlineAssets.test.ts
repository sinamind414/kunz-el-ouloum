// offlineAssets.test.ts — l'application reste utilisable hors ligne APRÈS le
// découpage en chunks (sprint 33). Exécuté par `npm run test:build`.
//
// Le service worker précachait ce qu'il trouvait dans `index.html`. Depuis les
// sprints 30-32, `index.html` ne référence plus que l'entrée : sans le
// manifeste d'assets, toutes les vues à la demande devenaient inaccessibles
// hors ligne. Ce test verrouille la chaîne complète.

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const DIST = resolve(process.cwd(), 'dist');
const MANIFESTE = resolve(DIST, 'assets-manifest.json');

function assetsDuManifeste(): string[] {
  const payload = JSON.parse(readFileSync(MANIFESTE, 'utf8')) as { assets?: string[] };
  return payload.assets ?? [];
}

describe('Disponibilité hors ligne des chunks', () => {
  it('produit un manifeste d’assets', () => {
    expect(existsSync(MANIFESTE), 'dist/assets-manifest.json manquant').toBe(true);
    expect(assetsDuManifeste().length).toBeGreaterThan(20);
  });

  it('liste tous les JS et CSS réellement émis, sans en oublier', () => {
    const emis = readdirSync(resolve(DIST, 'assets'))
      .filter((f) => f.endsWith('.js') || f.endsWith('.css'))
      .map((f) => `/assets/${f}`)
      .sort();
    expect(assetsDuManifeste().sort()).toEqual(emis);
  });

  it('inclut les vues chargées à la demande, absentes de index.html', () => {
    const html = readFileSync(resolve(DIST, 'index.html'), 'utf8');
    const manifeste = assetsDuManifeste();
    for (const vue of ['LessonsView', 'StatsView', 'BacIdeasView', 'OkachaView']) {
      const chunk = manifeste.find((a) => a.includes(`/${vue}-`));
      expect(chunk, `${vue} absent du manifeste`).toBeDefined();
      expect(html.includes(chunk!), `${vue} ne devrait pas être dans index.html`).toBe(false);
    }
  });

  it('est réellement consommé par le service worker', () => {
    const sw = readFileSync(resolve(DIST, 'sw.js'), 'utf8');
    expect(sw).toContain('/assets-manifest.json');
    expect(sw).toContain('collectChunkAssets');
  });

  it('précache les chunks même sur réseau contraint (les schémas, non)', () => {
    const sw = readFileSync(resolve(DIST, 'sw.js'), 'utf8');
    const activation = sw.slice(sw.indexOf("addEventListener('activate'"));
    expect(activation).toContain('collectChunkAssets');
  });
});
