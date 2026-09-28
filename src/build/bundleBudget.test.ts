// bundleBudget.test.ts — budget de poids du bundle initial (sprint 30).
//
// Contexte : avant ce sprint, `index-*.js` pesait 3,97 Mo (964 Ko gzip) parce
// que toutes les vues étaient importées statiquement. Sur une connexion 3G —
// le cas courant du public visé — c'est plusieurs dizaines de secondes avant
// le premier écran. Le passage des vues secondaires en import dynamique l'a
// ramené à ~1,46 Mo (336 Ko gzip).
//
// Ce test empêche la dérive : il ne juge pas la beauté du découpage, il fixe
// un plafond. Si un `import` statique d'une grosse vue revient dans App.tsx,
// le plafond saute et le test le dit, avec le chiffre.
//
// Il s'exécute UNIQUEMENT après un build (`npm run test:build`).

import { readdirSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const DIST_ASSETS = resolve(process.cwd(), 'dist', 'assets');

/** Plafond du bundle d'entrée, en kilo-octets. Mesuré à ~1 456 Ko. */
const BUDGET_INDEX_KO = 1900;

function tailleKo(fichier: string): number {
  return Math.round(statSync(resolve(DIST_ASSETS, fichier)).size / 1024);
}

describe('Budget du bundle initial', () => {
  const fichiers = readdirSync(DIST_ASSETS);

  it('garde le bundle d’entrée sous le plafond', () => {
    const index = fichiers.find((f) => /^index-.*\.js$/.test(f));
    expect(index, 'bundle index-*.js introuvable').toBeDefined();
    const taille = tailleKo(index!);
    expect(taille, `index-*.js pèse ${taille} Ko (plafond ${BUDGET_INDEX_KO} Ko)`).toBeLessThanOrEqual(
      BUDGET_INDEX_KO,
    );
  });

  it('sort bien les vues lourdes du bundle d’entrée', () => {
    for (const vue of ['MethodologyCompilerView', 'StatsView', 'LessonsView']) {
      const chunk = fichiers.find((f) => f.startsWith(`${vue}-`) && f.endsWith('.js'));
      expect(chunk, `${vue} devrait être un chunk séparé (import dynamique)`).toBeDefined();
    }
  });

  it('ne laisse aucun chunk unique dépasser le bundle d’entrée', () => {
    const index = fichiers.find((f) => /^index-.*\.js$/.test(f))!;
    const plusGros = fichiers
      .filter((f) => f.endsWith('.js'))
      .map((f) => ({ f, ko: tailleKo(f) }))
      .sort((a, b) => b.ko - a.ko)[0];
    expect(plusGros.f, `${plusGros.f} (${plusGros.ko} Ko) dépasse le bundle d'entrée`).toBe(index);
  });
});
