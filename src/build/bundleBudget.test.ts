// bundleBudget.test.ts — budget de poids du bundle initial (sprints 30-31).
//
// Historique chiffré :
//   · avant le sprint 30 : entrée = 3 968 Ko (964 Ko gzip), toutes les vues
//     importées statiquement ;
//   · sprint 30 (React.lazy sur 21 vues)        → 1 456 Ko ;
//   · sprint 31 (corpus QCM en import différé)  →   908 Ko (247 Ko gzip).
//
// Ce test ne juge pas l'élégance du découpage : il fixe un plafond et nomme le
// coupable quand il saute. L'entrée est lue dans `dist/index.html` et non
// devinée par un motif de nom — depuis le sprint 31, plusieurs chunks
// s'appellent `index-*.js` (celui de l'app et celui de `src/data/index.ts`),
// et confondre les deux rendrait le test faux sans le rendre rouge.

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const DIST = resolve(process.cwd(), 'dist');
const DIST_ASSETS = resolve(DIST, 'assets');

/** Plafond du bundle d'entrée, en kilo-octets (mesuré à ~908 Ko). */
const BUDGET_ENTREE_KO = 1100;
/** Plafond d'un chunk à la demande (mesuré : LessonsView ~996 Ko). */
const BUDGET_CHUNK_KO = 1100;

function tailleKo(chemin: string): number {
  return Math.round(statSync(chemin).size / 1024);
}

/** Fichier d'entrée réellement chargé par la page. */
function fichierEntree(): string {
  const html = readFileSync(resolve(DIST, 'index.html'), 'utf8');
  const m = html.match(/src="[^"]*assets\/([^"]+\.js)"/);
  expect(m, 'aucun script d’entrée trouvé dans dist/index.html').toBeTruthy();
  return m![1];
}

describe('Budget du bundle initial', () => {
  it('garde l’entrée sous le plafond', () => {
    const entree = fichierEntree();
    const ko = tailleKo(resolve(DIST_ASSETS, entree));
    expect(ko, `${entree} pèse ${ko} Ko (plafond ${BUDGET_ENTREE_KO} Ko)`).toBeLessThanOrEqual(
      BUDGET_ENTREE_KO,
    );
  });

  it('sort les vues lourdes de l’entrée', () => {
    const fichiers = readdirSync(DIST_ASSETS);
    for (const vue of ['MethodologyCompilerView', 'StatsView', 'LessonsView']) {
      const chunk = fichiers.find((f) => f.startsWith(`${vue}-`) && f.endsWith('.js'));
      expect(chunk, `${vue} devrait être un chunk séparé (import dynamique)`).toBeDefined();
    }
  });

  it('ne charge pas le corpus QCM avec l’entrée', () => {
    const entree = readFileSync(resolve(DIST_ASSETS, fichierEntree()), 'utf8');
    // Marqueur présent dans les explications du corpus (quizCorpus.ts) et nulle
    // part ailleurs dans le code d'amorçage.
    expect(
      entree.includes('ARN بوليميراز يفك التفاف'),
      'le corpus QCM est reparti dans le bundle d’entrée',
    ).toBe(false);
  });

  it('garde chaque chunk à la demande sous son plafond', () => {
    const trop = readdirSync(DIST_ASSETS)
      .filter((f) => f.endsWith('.js'))
      .map((f) => ({ f, ko: tailleKo(resolve(DIST_ASSETS, f)) }))
      .filter((x) => x.ko > BUDGET_CHUNK_KO);
    expect(trop.map((x) => `${x.f} (${x.ko} Ko)`)).toEqual([]);
  });
});
