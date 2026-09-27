import { existsSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const DIST_ASSETS = resolve(process.cwd(), 'dist', 'assets');

// Ces quatre contrôles portent sur le RÉSULTAT D'UN BUILD, pas sur le code
// source : sans `dist/assets`, ils échouaient en ENOENT dans toute copie
// fraîche du dépôt — quatre lignes rouges permanentes que plus personne ne
// lisait, et qui masquaient les vraies régressions (sprint 25).
//
// Règle adoptée :
//   · pas de build présent  → contrôles ignorés, avec le message qui dit quoi
//     lancer (`npm run test:build`) ;
//   · build présent         → contrôles exécutés normalement ;
//   · REQUIRE_BUILD_SMOKE=1 → l'absence de build devient une erreur (CI, où
//     le build précède les tests et où son absence est un vrai incident).
const BUILD_PRESENT = existsSync(DIST_ASSETS);
const BUILD_EXIGE = process.env.REQUIRE_BUILD_SMOKE === '1';

describe('Build smoke — présence du build', () => {
  it('signale clairement si le build manque au lieu d’échouer en ENOENT', () => {
    if (BUILD_EXIGE) {
      expect(BUILD_PRESENT, 'REQUIRE_BUILD_SMOKE=1 mais dist/assets est absent').toBe(true);
      return;
    }
    if (!BUILD_PRESENT) {
      // Pas d'échec : l'information est donnée, le développeur choisit.
      console.info(
        '[build smoke] dist/assets absent — contrôles de chunks ignorés. Lancer `npm run test:build`.',
      );
    }
    expect(true).toBe(true);
  });
});

// Le build actuel ne lazy-load plus les vues par composant (architecture
// abandonnée) : il découpe par LEÇON (phase*_chapitres_*) + bases tutor.
// Ce smoke test verrouille la réalité du master :
//  - chaque leçon phaseN_chapitres_* est un chunk JS séparé
//  - le bundle principal (index-*.js) existe
//  - aucune leçon n'est servie en HTML depuis dist/assets
//  - les bases tutor lourdes restent isolées (perf, connexions 3G)
const LESSON_CHUNK_PREFIX = 'phase';
const TUTOR_BASES = ['tutor-knowledge-base', 'tutor-qa-base'];

describe.skipIf(!BUILD_PRESENT)('Build smoke — chunks de leçons', () => {
  it('produit un bundle principal index-*.js', () => {
    const files = readdirSync(DIST_ASSETS);
    const main = files.find((f) => /^index-.*\.js$/.test(f));
    expect(main, 'bundle principal index-*.js manquant').toBeDefined();
  });

  it('produit un chunk JS distinct pour chaque leçon phaseN_chapitres_*', () => {
    const files = readdirSync(DIST_ASSETS);
    const lessonChunks = files.filter(
      (f) => f.startsWith(LESSON_CHUNK_PREFIX) && f.endsWith('.js'),
    );

    // 22 leçons officielles (phase1..phase22) + lecon_transcription à part.
    expect(lessonChunks.length, `${lessonChunks.length} chunks de leçons trouvés`).toBeGreaterThanOrEqual(22);
  });

  it('isole les bases de connaissances tutor en chunks séparés', () => {
    const files = readdirSync(DIST_ASSETS);
    for (const base of TUTOR_BASES) {
      const chunk = files.find((f) => f.startsWith(`${base}-`) && f.endsWith('.js'));
      expect(chunk, `chunk ${base}-*.js manquant`).toBeDefined();
    }
  });

  it('ne sert aucune leçon en HTML depuis dist/assets', () => {
    const files = readdirSync(DIST_ASSETS);
    const htmlFiles = files.filter((f) => f.endsWith('.html'));

    expect(htmlFiles, `chunks HTML inattendus : ${htmlFiles.join(', ')}`).toEqual([]);
  });
});
