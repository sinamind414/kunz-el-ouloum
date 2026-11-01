// src/components/__tests__/LessonsViewGoldSummary.test.tsx
// Contrat du bloc « الملخص الذهبي للدرس » greffé sur la leçon suggérée
// (bandeau-sequence de l'écran des domaines, 2026-10-04) :
//   · les 59 leçons du parcours possèdent toutes un résumé d'or (couverture
//     complète) → le bloc est toujours présent sur la leçon suggérée ;
//   · contenu affiché : mission, mécanisme, vocabulaire, erreur courante et
//     question de rappel, plus le badge de statut éditorial honnête
//     (« شرح Kunz » tant que non relu) ;
//   · le bloc suit la leçon suggérée : son contenu bascule quand on valide
//     la leçon précédente.
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
  it('état vierge : la 1re leçon (phase1) possède son résumé → bloc présent', async () => {
    await ouvrirEcranDomaines();
    expect(screen.getByTestId('bandeau-sequence')).toBeTruthy();
    // Couverture complète : les 59 leçons du parcours ont un résumé d'or, le
    // bloc s'affiche donc dès la première leçon suggérée (phase1_chapitres_1_2).
    const premiere = PARCOURS_FLAT[0];
    const or = premiere.lessonKey ? LESSON_GOLD_SUMMARIES[premiere.lessonKey] : undefined;
    expect(or).toBeTruthy();
    const resume = screen.getByTestId('resume-or');
    expect(resume).toBeTruthy();
    expect(resume.textContent).toContain(or!.missionAr);
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
    // Lecture active : la question de rappel précède la mission — elle est lue
    // avant le contenu pour orienter l'attention (système d'activation).
    expect(resume.textContent!.indexOf(or.recallQuestionAr)).toBeLessThan(
      resume.textContent!.indexOf(or.missionAr),
    );
    // Statut éditorial honnête : non relu → « شرح Kunz ».
    expect(resume.textContent).toContain('شرح Kunz');
  });

  it('le résumé suit la leçon suggérée quand on valide la leçon précédente', async () => {
    // Toutes les leçons ont un résumé : le bloc reste présent mais son
    // contenu bascule sur la nouvelle leçon suggérée dès qu'on valide la
    // précédente.
    const cible = PARCOURS_FLAT.findIndex(
      (i) => i.lessonKey !== undefined && LESSON_GOLD_SUMMARIES[i.lessonKey] !== undefined,
    );
    const suivante = PARCOURS_FLAT.slice(cible + 1).find(
      (i) => i.lessonKey !== undefined && LESSON_GOLD_SUMMARIES[i.lessonKey] !== undefined,
    );
    expect(suivante).toBeTruthy();
    const idxSuivante = PARCOURS_FLAT.indexOf(suivante!);

    validerPremiers(idxSuivante);
    await ouvrirEcranDomaines();
    const resume = screen.getByTestId('resume-or');
    expect(resume).toBeTruthy();

    const orSuivant = suivante!.lessonKey ? LESSON_GOLD_SUMMARIES[suivante!.lessonKey] : undefined;
    expect(orSuivant).toBeTruthy();
    expect(resume.textContent).toContain(orSuivant!.missionAr);

    // Le résumé de la leçon précédente n'est plus affiché.
    const orCible = LESSON_GOLD_SUMMARIES[PARCOURS_FLAT[cible].lessonKey!];
    expect(orCible).toBeTruthy();
    expect(resume.textContent).not.toContain(orCible!.missionAr);
  });
});
