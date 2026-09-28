// repoIntegrity.test.ts — les fichiers critiques existent encore (sprint 40).
//
// Incident à l'origine de ce test : `src/build/bundleBudget.test.ts` et
// `src/build/offlineAssets.test.ts` ont disparu du dépôt entre les sprints 36
// et 39. Ils ne sont pas chargés par la suite unitaire (exclusion de
// `src/build/**`), donc rien n'a rougi ; `npm run test:build` s'est contenté
// d'exécuter 4 tests au lieu de 13, en vert.
//
// Autrement dit : un garde-fou peut être supprimé sans qu'aucun garde-fou ne
// s'en aperçoive. Ce test ferme la boucle — il vit DANS la suite unitaire et
// vérifie l'existence des fichiers qui, eux, ne s'y exécutent pas.

import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const RACINE = process.cwd();

/** Fichiers dont l'absence est silencieuse mais grave. */
const FICHIERS_CRITIQUES = [
  // Contrôles post-build : exclus de la suite unitaire par conception.
  'src/build/lazyRouteChunks.smoke.test.ts',
  'src/build/bundleBudget.test.ts',
  'src/build/offlineAssets.test.ts',
  // Configuration qui rend ces contrôles exécutables.
  'vite.build-test.config.ts',
  // Service worker et manifeste : jamais importés par le code applicatif.
  'public/sw.js',
  'public/manifest.json',
  // Sources de vérité du corpus BAC.
  'src/data/bacSessionIndex.ts',
  'src/data/bacArchetypes.ts',
  'src/data/verbDemands.ts',
  'data/priorites_pedagogiques.json',
];

describe('intégrité du dépôt', () => {
  it('conserve tous les fichiers critiques', () => {
    const manquants = FICHIERS_CRITIQUES.filter((f) => !existsSync(resolve(RACINE, f)));
    expect(manquants, `fichiers critiques absents : ${manquants.join(', ')}`).toEqual([]);
  });

  it('garde les contrôles post-build réellement branchés au script', () => {
    const pkg = JSON.parse(readFileSync(resolve(RACINE, 'package.json'), 'utf8')) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.['test:build']).toContain('vite.build-test.config.ts');
    expect(pkg.scripts?.['test:build']).toContain('vite build');
  });

  it('exclut src/build de la suite unitaire, comme prévu', () => {
    const config = readFileSync(resolve(RACINE, 'vite.config.ts'), 'utf8');
    expect(config).toContain("'src/build/**'");
  });

  it('compte les contrôles post-build attendus (13 aujourd’hui)', () => {
    // Le nombre exact importe moins que le fait de le voir bouger : un
    // fichier perdu ferait chuter ce total sans faire rougir quoi que ce soit.
    const fichiers = FICHIERS_CRITIQUES.filter((f) => f.startsWith('src/build/'));
    const total = fichiers.reduce((n, f) => {
      const contenu = readFileSync(resolve(RACINE, f), 'utf8');
      return n + (contenu.match(/\n\s*it\(/g)?.length ?? 0);
    }, 0);
    expect(total, `${total} contrôles post-build trouvés`).toBeGreaterThanOrEqual(13);
  });
});
