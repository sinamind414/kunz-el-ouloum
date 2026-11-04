// rappelHubIntegration.test.tsx — RAPPEL → UN GESTE BAC, dans le VRAI hub.
//
// Lot 2 (2026-11-04), ENCHAÎNÉ sur le lot 1 (`consigneEntreeTraining`). On
// monte `TrainingHubView` avec un corpus injecté (aucun import dynamique), un
// état réel déposé par le Capitaine, puis on parcourt les 3 questions jusqu'au
// CTA. Objectif : prouver que l'échauffement n'est PAS une porte obligatoire et
// qu'il n'ajoute AUCUNEporte, AUCUNE écriture, AUCUNE voix.

import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import TrainingHubView from '../TrainingHubView';
import { TRAINING_ENTRIES } from '../../data/trainingHub';
import type { Corpus } from '../../data/corpusLoader';
import { assemblerEtatEleve, type EtatEleve } from '../../lib/etatEleve';
import { fournirEtatEleve, reinitialiserEtatEleve } from '../../lib/etatEleveRuntime';
import { markDone, resetParcours } from '../../lib/parcours/parcoursProgress';
import { PARCOURS_FLAT } from '../../lib/parcours/parcoursPath';
import type { Flashcard, QuizQuestion } from '../../types';

const MAINTENANT = new Date(2026, 10, 4, 10, 0, 0);

/** 6 QCM + 6 cartes dérivées : assez pour un tirage de 3, sans corpus lourd. */
function corpusDeTest(): Corpus {
  const questions: QuizQuestion[] = [1, 2, 3, 4, 5, 6].map((id) => ({
    id,
    unitId: id <= 2 ? 1 : id <= 4 ? 2 : 3,
    questionText: `سؤال الاستذكار ${id}`,
    options: ['الخيار الخاطئ', 'الخيار الصحيح'],
    correctAnswerIndex: 1,
    explanation: `التفسير ${id}`,
  }));
  const flashcards: Flashcard[] = questions.map((q) => ({
    id: `fc_q_${q.id}`,
    unitId: q.unitId,
    question: q.questionText,
    answerBullets: [q.explanation],
  }));
  return { questions, flashcards };
}

const CORPUS = corpusDeTest();

function etatDeTest(): EtatEleve {
  return assemblerEtatEleve({
    daily: undefined,
    maintenant: MAINTENANT,
    rubrique: 'training',
    rubriqueAUnConseil: true,
    rubriquesDejaVues: ['training'],
    competence: { verdicts: {}, faibles: [], unitePrioritaire: null },
    erreurs: { total: 0, dominante: null, capital: { fermees: 0, rouvertes: 0, total: 0 } },
  });
}

function ouvrirUnites(n: number): void {
  resetParcours();
  const ids = [...new Set(PARCOURS_FLAT.map((i) => i.unitId))].sort((a, b) => a - b);
  for (const uid of ids.slice(0, n)) {
    for (const item of PARCOURS_FLAT.filter((i) => i.unitId === uid)) markDone(item.id);
  }
}

async function repondreAuxQuestions(user: ReturnType<typeof userEvent.setup>, nombre: number): Promise<void> {
  for (let i = 0; i < nombre; i++) {
    await user.click(screen.getByTestId('rappel-option-1'));
    await user.click(screen.getByTestId('rappel-suivant'));
  }
}

afterEach(() => {
  cleanup();
  reinitialiserEtatEleve();
  localStorage.clear();
});

describe('hub — rappel ET consigne coexistent, sans obligation', () => {
  it('le rappel, la consigne du Capitaine et le badge sont visibles EN MÊME TEMPS', () => {
    ouvrirUnites(2);
    fournirEtatEleve(etatDeTest());
    render(<TrainingHubView onOpen={() => {}} corpusRappel={CORPUS} />);

    expect(screen.getByTestId('rappel-demarrer')).toBeTruthy();
    expect(screen.getByTestId('consigne-entree-capitaine')).toBeTruthy();
    expect(screen.getAllByTestId('recommande-aujourdhui')).toHaveLength(1);
    expect(screen.queryByTestId('rappel-question')).toBeNull(); // pas imposé
  });

  it('démarrer le rappel ne cache JAMAIS la consigne ni les 7 cartes', async () => {
    ouvrirUnites(2);
    fournirEtatEleve(etatDeTest());
    const user = userEvent.setup();
    render(<TrainingHubView onOpen={() => {}} corpusRappel={CORPUS} />);

    await user.click(screen.getByTestId('rappel-demarrer'));
    expect(screen.getByTestId('rappel-question')).toBeTruthy();
    expect(screen.getByTestId('consigne-entree-capitaine')).toBeTruthy();
    for (const e of TRAINING_ENTRIES) {
      expect(screen.getByTestId(`hub-${e.tab}`), e.tab).toBeTruthy();
    }
  });

  it('le CTA final ouvre le module désigné par le Capitaine (même onOpen)', async () => {
    ouvrirUnites(2);
    fournirEtatEleve(etatDeTest());
    const onOpen = vi.fn();
    const user = userEvent.setup();
    render(<TrainingHubView onOpen={onOpen} corpusRappel={CORPUS} />);

    await user.click(screen.getByTestId('rappel-demarrer'));
    await repondreAuxQuestions(user, 3);
    expect(screen.getByTestId('rappel-bilan')).toBeTruthy();
    await user.click(screen.getByTestId('rappel-cta-geste'));
    expect(onOpen).toHaveBeenCalledTimes(1);
    expect(onOpen).toHaveBeenCalledWith('situations');
  });

  it('« تخطّي » laisse la consigne et le badge intacts : aucune porte bloquante', async () => {
    ouvrirUnites(2);
    fournirEtatEleve(etatDeTest());
    const user = userEvent.setup();
    render(<TrainingHubView onOpen={() => {}} corpusRappel={CORPUS} />);

    await user.click(screen.getByTestId('rappel-demarrer'));
    await user.click(screen.getByTestId('rappel-fermer'));
    expect(screen.queryByTestId('rappel-panel')).toBeNull();
    expect(screen.getByTestId('consigne-entree-capitaine')).toBeTruthy();
    expect(screen.getAllByTestId('recommande-aujourdhui')).toHaveLength(1);
  });

  it('sans état ⇒ pas de consigne, donc AUCUN CTA inventé après le rappel', async () => {
    ouvrirUnites(0);
    reinitialiserEtatEleve();
    const user = userEvent.setup();
    render(<TrainingHubView onOpen={() => {}} corpusRappel={CORPUS} />);

    await user.click(screen.getByTestId('rappel-demarrer'));
    await repondreAuxQuestions(user, 3);
    expect(screen.getByTestId('rappel-bilan')).toBeTruthy();
    expect(screen.queryByTestId('consigne-entree-capitaine')).toBeNull();
    expect(screen.queryByTestId('rappel-cta-geste')).toBeNull();
  });
});

describe('hub — le lot 2 ne casse rien', () => {
  it('ZÉRO écriture de stockage sur le parcours complet', async () => {
    ouvrirUnites(2);
    fournirEtatEleve(etatDeTest());
    const avant = localStorage.length;
    const user = userEvent.setup();
    render(<TrainingHubView onOpen={() => {}} corpusRappel={CORPUS} />);
    await user.click(screen.getByTestId('rappel-demarrer'));
    await repondreAuxQuestions(user, 3);
    expect(localStorage.length).toBe(avant);
  });

  it('toujours 7 cartes : le rappel n est pas une 8ᵉ porte', () => {
    ouvrirUnites(2);
    fournirEtatEleve(etatDeTest());
    const { container } = render(<TrainingHubView onOpen={() => {}} corpusRappel={CORPUS} />);
    expect(container.querySelectorAll('[data-testid^="hub-"]')).toHaveLength(TRAINING_ENTRIES.length);
    expect(TRAINING_ENTRIES.length).toBeLessThanOrEqual(8);
  });

  it('corpus explicitement absent ⇒ message honnête, aucun import dynamique', async () => {
    ouvrirUnites(0);
    const user = userEvent.setup();
    render(<TrainingHubView onOpen={() => {}} corpusRappel={null} />);
    await user.click(screen.getByTestId('rappel-demarrer'));
    expect(screen.getByTestId('rappel-indisponible')).toBeTruthy();
    expect(screen.queryByTestId('rappel-question')).toBeNull();
  });
});
