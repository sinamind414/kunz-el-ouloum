// poidsEntree.verrou.test.ts — empêcher la RÉINTRODUCTION silencieuse des 586 Ko.
//
// Le 14/10/2026, le bundle d'entrée pesait 938 Ko : 93 % n'était pas de
// l'interface, mais des DONNÉES tirées par trois imports statiques (mesure sur
// sourcemap, audit §10.3.1). Deux d'entre eux partaient de l'ACCUEIL :
//
//   · `DashboardView → TodayCard → revisionPlan` → plan, cartes mentales, index
//     des sessions BAC, banque de situations, contenus de leçons (≈250 Ko) ;
//   · `DashboardView → NbaCard → parcoursPath/nbaEngine → lessonModes +
//     unitLessonSequences → lessonData + activeLessons` (≈286 Ko) ;
//   · `App → data/fillBlanks` (50 Ko).
//
// Ils ont été remplacés par des imports dynamiques (`lazy()` + chargeur dédié),
// et l'entrée est tombée à 156 Ko. Le ratchet de `src/build/bundleBudget.test.ts`
// surveille le RÉSULTAT, mais il vit dans `src/build/**` — exclu de la suite
// unitaire, donc jamais exécuté par la CI. Ce fichier-ci surveille la SOURCE, là
// où tout le monde regarde : réintroduire l'un de ces imports statiques ferait
// bondir l'entrée de plusieurs centaines de kilo-octets, et le faire ne coûte
// qu'une ligne à quelqu'un qui ne connaît pas l'historique.
//
// Ce n'est pas un interdit de principe : c'est un rappel que ces modules doivent
// rester derrière un import dynamique, avec la raison écrite à côté.

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const lire = (chemin: string) => readFileSync(resolve(__dirname, '..', chemin), 'utf-8');

const APP = lire('App.tsx');
const DASHBOARD = lire('components/DashboardView.tsx');

describe('poids du bundle d’entrée — les données lourdes restent différées (M7)', () => {
  it('l’accueil charge TodayCard et NbaCard en dynamique, pas en statique', () => {
    // Les 536 Ko qui partaient de ces deux cartes.
    expect(
      /^import\s+TodayCard\s+from\s+'\.\/TodayCard'/m.test(DASHBOARD),
      'TodayCard est redevenue un import statique de l’accueil',
    ).toBe(false);
    expect(
      /^import\s+NbaCard\s+from\s+'\.\/NbaCard'/m.test(DASHBOARD),
      'NbaCard est redevenue un import statique de l’accueil',
    ).toBe(false);
    expect(DASHBOARD).toContain("lazy(() => import('./TodayCard'))");
    expect(DASHBOARD).toContain("lazy(() => import('./NbaCard'))");
  });

  it('le plan de révision et le chemin pédagogique ne sont plus dans l’entrée par un autre chemin', () => {
    // Si un autre module de l'entrée venait à importer directement ces données,
    // le découpage serait annulé sans que le `lazy()` n'y paraisse.
    for (const [fichier, source] of [
      ['App.tsx', APP],
      ['components/DashboardView.tsx', DASHBOARD],
    ] as const) {
      for (const donnee of [
        'data/revisionPlan',
        'lib/parcours/nbaEngine',
        'data/unitLessonSequences',
        'lessonData',
        // 14/10/2026 — 104 Ko réintroduits en une ligne, puis mesurés :
        // l'entrée est passée de 166 Ko à 270 Ko (+59 % sur la cible de 170)
        // parce que la bulle du capitaine importait `data/capitaine` (nom du
        // guide) et `utils/profilErreurs` → `data/methodologyEngine` (105 Ko).
        // Corrigé par des modules légers (`data/capitaineIdentite`,
        // `data/errorTaxonomy`) et un import différé. Ce verrou empêche le
        // retour du défaut : ces données n'ont rien à faire dans le 1ᵉʳ écran.
        'data/methodologyEngine',
        'data/capitaine',
        'data/boussoleData',
      ]) {
        expect(
          new RegExp(`from '(?:.*/)?${donnee.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}'`).test(source),
          `${fichier} importe statiquement ${donnee} (données lourdes)`,
        ).toBe(false);
      }
    }
  });

  it('les questions à trous passent par le chargeur différé', () => {
    expect(APP.includes("from './data/fillBlanks'"), 'App.tsx a repris l’import statique des questions à trous').toBe(
      false,
    );
    expect(APP).toContain('chargerFillBlanks');
    expect(APP).toContain('prefetchFillBlanksWhenIdle');
  });
});

describe('chargeur différé — le quiz s’ouvre TOUJOURS', () => {
  it('le chemin « hors ligne » ouvre le quiz avec le corpus seul', () => {
    // Règle posée dans App.tsx : `.catch(...).finally(() => setActiveQuizUnitId)`
    // — un morceau injoignable ne doit jamais laisser un bouton sans effet.
    expect(APP).toMatch(/\.catch\(\(\) => \{[\s\S]{0,200}?\}\)\s*\.finally\(\(\) => setActiveQuizUnitId/);
  });
});

describe('la bulle du capitaine ne tire pas les données lourdes (14/10/2026)', () => {
  const HOOK = lire('hooks/useInvitationCapitaine.ts');

  it('le compteur d’erreurs est chargé en DIFFÉRÉ, pas en statique', () => {
    // Un import statique ici remettrait `profilErreurs` ET la taxonomie des
    // erreurs dans le bundle d'entrée — mesuré : +6 Ko sur le premier écran,
    // pour un message qui n'apparaît pas toujours.
    expect(
      /^import\s+\{[^}]*totalErreurs[^}]*\}\s+from/m.test(HOOK),
      'totalErreurs est redevenu un import statique du hook de la bulle',
    ).toBe(false);
    expect(HOOK).toContain("import('../utils/profilErreurs')");
  });

  it('l’identité du capitaine vient du module léger', () => {
    // Le nom seul ne doit pas entraîner le contenu du guide.
    expect(APP).toContain("from './data/capitaineIdentite'");
    expect(
      /^import\s+\{[^}]*CAPITAINE_IDENTITE_AR[^}]*\}\s+from\s+'\.\/data\/capitaine'/m.test(APP),
      'le nom du guide est réimporté depuis data/capitaine (contenu lourd)',
    ).toBe(false);
  });

  it('la taxonomie des erreurs est un module léger, ré-exporté', () => {
    // Source unique : la définition est DÉPLACÉE dans `errorTaxonomy.ts`, jamais
    // recopiée ; `methodologyEngine` la ré-exporte pour ses consommateurs.
    expect(lire('data/methodologyEngine.ts')).toContain("export { ERROR_TAXONOMY } from './errorTaxonomy'");
    expect(lire('utils/profilErreurs.ts')).toContain("from '../data/errorTaxonomy'");
  });
});
