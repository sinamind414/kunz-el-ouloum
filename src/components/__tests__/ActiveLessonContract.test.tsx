// ActiveLessonContract.test.tsx — sprint 64.
//
// Une leçon active n'est pas un cours qu'on fait défiler. Le risque pédagogique
// est connu : un contenu qu'on parcourt devient familier, et la familiarité est
// prise pour de la maîtrise. L'élève doit donc savoir AVANT de commencer que
// rien n'avancera sans réponse de sa part — c'est le contrat affiché sur l'écran
// de mission. Ce fichier verrouille cette promesse.

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import ActiveLessonView from '../ActiveLessonView';
import { ACTIVE_LESSONS } from '../../data/activeLessons';

afterEach(cleanup);
beforeEach(() => localStorage.clear());

/** Les six leçons injectées pour les 5 leçons prioritaires (sprints 1 → 62). */
const LECONS_PRIORITAIRES = [
  'amino_acid_behavior',
  'enzyme_inhibitors',
  'immunity_cooperation',
  'immunity_hiv_aids',
  'prerequis2AS_genetique',
  'photochemical_chain',
];

describe('leçon active — le contrat est annoncé avant de commencer', () => {
  it('l’écran de mission prévient qu’aucune étape ne s’ouvre sans réponse', () => {
    render(<ActiveLessonView lessonKey="amino_acid_behavior" onBack={() => {}} />);
    const contrat = screen.getByTestId('lecon-contrat');
    expect(contrat.textContent).toContain('لا يتقدّم قبل أن تجيب');
    expect(contrat.textContent).toContain('لا توجد قراءة سلبية');
  });

  it('le contrat annonce le nombre réel d’étapes de la leçon', () => {
    const attendu = ACTIVE_LESSONS.enzyme_inhibitors.blocks.length;
    render(<ActiveLessonView lessonKey="enzyme_inhibitors" onBack={() => {}} />);
    expect(screen.getByTestId('lecon-contrat').textContent).toContain(String(attendu));
  });

  it('les six leçons prioritaires portent toutes le contrat', () => {
    for (const cle of LECONS_PRIORITAIRES) {
      expect(ACTIVE_LESSONS[cle], `leçon manquante : ${cle}`).toBeTruthy();
      render(<ActiveLessonView lessonKey={cle} onBack={() => {}} />);
      expect(screen.getByTestId('lecon-contrat').textContent).toContain('لا يتقدّم');
      cleanup();
    }
  });
});
