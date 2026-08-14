// src/components/LessonReviewDisplay.test.tsx
// Constat #63 — L'arbitrage editorial ne franchissait pas la frontiere du panneau.
//
// Le « وضع الأستاذ » propose 60 items a l'arbitrage : 5 cartes de survie,
// 13 resumes de lecon, 42 contextes de document. Seules les 5 cartes rendaient
// la revue visible a l'eleve (`SurvivalCardView`). Pour les 13 lecons, le
// libelle affiche par `MissionBanner` etait calcule sur le `status` fige dans
// la donnee : un enseignant pouvait relire, signer et publier, l'eleve
// continuait de lire « شرح Kunz ».
//
// Ces tests verrouillent les deux moities du correctif :
//   1. une revue locale plausible DOIT devenir visible dans la lecon ;
//   2. elle ne doit PAS emprunter le vocabulaire de l'autorite (#59) —
//      « مصدر موثّق » reste reserve a la donnee livree.
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import MissionBanner from './MissionBanner';
import { LESSON_GOLD_SUMMARIES, getLessonGoldSummary } from '../data/lessonGoldSummaries';
import { setReviewOverride } from '../services/editorialReviewService';

beforeEach(() => localStorage.clear());
afterEach(cleanup);

const LESSON_ID = Object.keys(LESSON_GOLD_SUMMARIES)[0];

/** Le bandeau est replie par defaut : le libelle de statut n'existe pas dans le
 *  DOM tant qu'on ne l'a pas ouvert. Toute assertion d'absence menee sur le
 *  bandeau ferme passerait donc a vide. */
function openBanner(lessonId: string = LESSON_ID) {
  const summary = getLessonGoldSummary(lessonId)!;
  render(<MissionBanner summary={summary} estimatedMinutes={10} />);
  fireEvent.click(document.querySelector('button')!);
  // Ancrage positif : on prouve que le bandeau est bien deplie avant d'asserter.
  return screen.getByTestId('mission-status-label');
}

const publishAs = (by: string, at = '2020-01-01', program = 'BAC DZ') =>
  setReviewOverride('lesson_summary', LESSON_ID, {
    reviewed: true, reviewedBy: by, reviewedAt: at, sourceProgram: program,
  });

describe('#63 — la revue enseignant atteint la lecon', () => {
  it('sans revue locale, le libelle reste celui de la donnee livree', () => {
    const label = openBanner();
    expect(label.textContent).toBe('شرح Kunz');
  });

  it('une revue locale plausible devient visible dans la lecon', () => {
    publishAs('أ. بن يوسف');
    const label = openBanner();
    // Le verdict de l'enseignant franchit desormais la frontiere du panneau.
    expect(label.textContent).toContain('أ. بن يوسف');
    expect(label.textContent).not.toBe('شرح Kunz');
  });

  it('une revue locale est annoncee comme locale et non documentee', () => {
    publishAs('أ. بن يوسف');
    const label = openBanner();
    expect(label.textContent).toContain('مراجعة محلية على هذا الجهاز');
    expect(label.textContent).toContain('غير موثقة');
  });

  it("une revue locale n'emprunte jamais le libelle d'autorite", () => {
    publishAs('أ. بن يوسف');
    const label = openBanner();
    // « مصدر موثّق » atteste une source verifiee : une saisie faite sur
    // l'appareil de l'eleve ne peut pas y donner droit (cf. #59).
    expect(label.textContent).not.toContain('مصدر موثّق');
  });

  it('un nom blanc ne publie rien : le libelle d origine est conserve', () => {
    publishAs('   ');
    const label = openBanner();
    expect(label.textContent).toBe('شرح Kunz');
  });

  it('une revue datee dans le futur ne publie rien', () => {
    publishAs('أ. بن يوسف', '3000-01-01');
    const label = openBanner();
    expect(label.textContent).toBe('شرح Kunz');
  });

  it('la revue d une lecon ne deteint pas sur une autre lecon', () => {
    publishAs('أ. بن يوسف');
    const otherId = Object.keys(LESSON_GOLD_SUMMARIES)[1];
    const label = openBanner(otherId);
    expect(label.textContent).not.toContain('أ. بن يوسف');
  });
});
