// src/components/__tests__/LessonsViewGoldSummary.test.tsx
// Contrat du bloc « الملخص الذهبي للدرس » greffé sur la leçon suggérée
// (bandeau-sequence de l'écran des domaines, 2026-10-04) :
//   · leçon suggérée SANS résumé d'or → bloc absent (jamais de synthèse);
//   · leçon suggérée AVEC résumé d'or  → mission, mécanisme, vocabulaire,
//     erreur courante et question de rappel affichés, plus le badge de
//     statut éditorial honnête (« شرح Kunz » tant que non relu).
//
// Convention repo : pas de @testing-library/jest-dom -> .toBeTruthy() /
// .toBeNull(). cleanup() + resetParcours() explicites (l'état persiste en
// localStorage sinon). Les assertions se font contre LESSON_GOLD_SUMMARIES
// pour ne dépendre ni de l'encodage ni d'un libellé figé.
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import LessonsView from '../LessonsView';
import { LESSON_GOLD_SUMMARIES } from '../../data/lessonGoldSummaries';
import { PARCOURS_FLAT } from '../../lib/parcours/parcoursPath';
import {
  loadParcours,
  resetParcours,
  saveParcours,
} from '../../lib/parcours/parcoursProgress';

afterEach(() => {
  cleanup();
  resetParcours();
});
beforeEach(() => {
  resetParcours();
});

/** Ouvre l'écran « الدرس الرسمي » (les 3 domaines + le bandeau séquence). */
async function ouvrirEcranDomaines() {
  const user = userEvent.setup();
  render(<LessonsView />);
  await user.click(screen.getByText('الدرس الرسمي'));
  return user;
}

/** Valide directement les `n` premiers items du chemin (date passée pour ne
 *  pas perturber les quotas du jour). */
function validerPremiers(n: number): void {
  const state = loadParcours();
  for (let k = 0; k < n; k++) {
    state.done[PARCOURS_FLAT[k].id] = { at: '2026-09-20', fragile: false };
  }
  saveParcours(state);
}

describe('LessonsView — résumé d’or de la leçon suggérée', () => {
  it('état vierge : la 1re leçon (phase1) n’a pas de résumé → bloc absent', async () => {
    await ouvrirEcranDomaines();
    expect(screen.getByTestId('bandeau-sequence')).toBeTruthy();
    // phase1_chapitres_1_2 n'a pas de résumé d'or : on n'affiche rien plutôt
    // que du contenu synthétique. C'est la discipline qui manquait au prototype e2.
    expect(screen.queryByTestId('resume-or')).toBeNull();
  });

  it('leçon suggérée avec résumé : le bloc affiche la substance réelle', async () => {
    // 1re leçon du chemin possédant un résumé d'or = amino_acid_behavior (U2),
    // après les 4 leçons + le jalon de l'unité 1.
    const cible = PARCOURS_FLAT.findIndex(
      (i) => i.lessonKey !== undefined && LESSON_GOLD_SUMMARIES[i.lessonKey] !== undefined,
    );
    expect(cible).toBeGreaterThan(-1);
    validerPremiers(cible);

    await ouvrirEcranDomaines();
    const resume = screen.getByTestId('resume-or');
    expect(resume).toBeTruthy();

    const cle = PARCOURS_FLAT[cible].lessonKey;
    const or = cle ? LESSON_GOLD_SUMMARIES[cle] : undefined;
    expect(or).toBeTruthy();
    if (!or) return;

    // La mission ouvre le bloc.
    expect(resume.textContent).toContain(or.missionAr);
    // La chaîne causale (au moins la 1re étape) est rendue.
    expect(resume.textContent).toContain(or.mechanismAr[0]);
    // Le vocabulaire (au moins le 1er terme).
    expect(resume.textContent).toContain(or.vocabulary[0]);
    // L'erreur courante et la question de rappel.
    expect(resume.textContent).toContain(or.commonErrorAr);
    expect(resume.textContent).toContain(or.recallQuestionAr);
    // Statut éditorial honnête : non relu → « شرح Kunz ».
    expect(resume.textContent).toContain('شرح Kunz');
  });

  it('le résumé disparaît dès que la leçon suggérée change vers une leçon sans résumé', async () => {
    // U1 validée -> amino_acid_behavior (avec résumé), puis on la valide à son
    // tour : la suivante (lecon_representation) n'en a pas.
    const cible = PARCOURS_FLAT.findIndex(
      (i) => i.lessonKey !== undefined && LESSON_GOLD_SUMMARIES[i.lessonKey] !== undefined,
    );
    validerPremiers(cible + 1);
    await ouvrirEcranDomaines();
    expect(screen.queryByTestId('resume-or')).toBeNull();
    expect(screen.getByTestId('bandeau-sequence')).toBeTruthy();
  });
});
