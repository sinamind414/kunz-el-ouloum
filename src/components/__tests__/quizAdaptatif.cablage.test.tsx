// Verrous de câblage R9 (2026-11-07) : le mode adaptatif doit être ATTEIGNABLE
// depuis le quiz d'unité, OPT-IN, et ne doit rien inventer.
// Convention repo : pas de jest-dom ; cleanup() explicite.

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import QuizView from '../QuizView';
import { SVT_QUIZ_QUESTIONS, LIBELLES_DIFFICULTE } from '../../quizCorpus';

const lire = (p: string) => readFileSync(resolve(__dirname, '../../../', p), 'utf8');
const vue = lire('src/components/QuizView.tsx');
const panneau = lire('src/components/QuizAdaptatif.tsx');
const app = lire('src/App.tsx');

afterEach(() => {
  cleanup();
  localStorage.clear();
});

const uneQuestion = SVT_QUIZ_QUESTIONS.find((q) => q.unitId === 1)!;

function monter() {
  return render(
    <QuizView
      unitId={1}
      unitTitle="الوحدة 1"
      questions={[uneQuestion]}
      onClose={vi.fn()}
      onQuizComplete={vi.fn()}
    />,
  );
}

/**
 * Retrouve la POSITION AFFICHÉE de la bonne réponse. Le panneau mélange les
 * propositions (anti-triche) : on ne peut PAS réutiliser `correctAnswerIndex`
 * du corpus. On cherche donc par TEXTE, comme le fait réellement l'élève.
 */
function bonneOptionDuPanneau(): number {
  const texte = screen.getByTestId('quiz-adaptatif-question').textContent ?? '';
  const q = SVT_QUIZ_QUESTIONS.find((x) => texte.includes(x.questionText));
  expect(q, 'question affichée absente du corpus servi').toBeTruthy();
  const bonne = q!.options[q!.correctAnswerIndex].trim();
  const bouton = screen
    .getAllByRole('button')
    .find((b) => (b.textContent ?? '').trim() === bonne);
  expect(bouton, `option correcte « ${bonne} » introuvable à l'écran`).toBeTruthy();
  const m = /quiz-adaptatif-option-(\d+)/.exec(bouton!.getAttribute('data-testid') ?? '');
  expect(m, 'bouton d’option sans testid').toBeTruthy();
  return Number(m![1]);
}

describe('R9 : câblage (lecture des sources)', () => {
  it('OPT-IN : état par défaut false, panneau lazy, aucun changement de App.tsx', () => {
    expect(vue).toContain("useState(false)");
    expect(vue).toContain("lazy(() => import('./QuizAdaptatif'))");
    expect(vue).toContain('data-testid="quiz-ouvrir-adaptatif"');
    expect(vue).toContain('actif: !quizFinished && !adaptatif');
    expect(app).not.toContain('QuizAdaptatif');
  });

  it('le panneau puise dans le corpus servi et affiche les 3 libellés officiels', () => {
    expect(panneau).toContain('loadCorpus');
    expect(panneau).toContain('LIBELLES_DIFFICULTE');
    expect(panneau).toContain('choisirQuestion');
    expect(panneau).toContain('prochainPalier');
    expect(Object.keys(LIBELLES_DIFFICULTE)).toHaveLength(3);
  });

  it('anti-triche : MÊME graine et MÊME permutation que QuizView', () => {
    expect(panneau).toContain('graineSession');
    expect(panneau).toContain("melangerQuestion(choix.question, 'correctAnswerIndex'");
    expect(vue).toContain("melangerQuestions(actives, 'correctAnswerIndex', graine)");
  });

  it('aucune notification, aucune seconde voix, aucun classement fabriqué', () => {
    for (const interdit of ['Notification', 'requestPermission', 'pushManager', 'classement', 'CAPITAINE_IDENTITE_AR']) {
      expect(panneau).not.toContain(interdit);
    }
    expect(panneau).toContain('Non vérifiable');
  });

  it('le hub reste à 8 cartes maximum (verrou existant)', () => {
    expect(lire('src/components/TrainingHubView.tsx')).toContain('TRAINING_ENTRIES');
  });
});

describe('R9 : parcours réel — 2 réussites font monter le palier', () => {
  it('clic sur la porte → panneau → palier 1 puis 2 après 2 bonnes réponses', async () => {
    monter();
    fireEvent.click(screen.getByTestId('quiz-ouvrir-adaptatif'));

    await waitFor(() => {
      expect(screen.getByTestId('quiz-adaptatif')).toBeTruthy();
      expect(screen.getByTestId('quiz-adaptatif-question')).toBeTruthy();
    });
    expect(screen.getByTestId('quiz-adaptatif-palier').textContent).toContain(LIBELLES_DIFFICULTE[1]);

    // 1re réussite : le palier reste à 1 (il en faut 2 consécutives).
    fireEvent.click(screen.getByTestId(`quiz-adaptatif-option-${bonneOptionDuPanneau()}`));
    fireEvent.click(screen.getByTestId('quiz-adaptatif-valider'));
    // La correction est JUSTE malgré le mélange des propositions.
    expect(screen.getByTestId('quiz-adaptatif-verdict').textContent).toContain('إجابة صحيحة');
    fireEvent.click(screen.getByTestId('quiz-adaptatif-suivant'));
    await waitFor(() => expect(screen.getByTestId('quiz-adaptatif-question')).toBeTruthy());
    expect(screen.getByTestId('quiz-adaptatif-palier').textContent).toContain(LIBELLES_DIFFICULTE[1]);

    // 2e réussite : passage au palier 2, question RÉELLE du corpus.
    fireEvent.click(screen.getByTestId(`quiz-adaptatif-option-${bonneOptionDuPanneau()}`));
    fireEvent.click(screen.getByTestId('quiz-adaptatif-valider'));
    expect(screen.getByTestId('quiz-adaptatif-verdict').textContent).toContain('إجابة صحيحة');
    fireEvent.click(screen.getByTestId('quiz-adaptatif-suivant'));
    await waitFor(() => {
      expect(screen.getByTestId('quiz-adaptatif-palier').textContent).toContain(LIBELLES_DIFFICULTE[2]);
    });

    // Retour : le quiz d'unité est intact.
    fireEvent.click(screen.getByTestId('quiz-adaptatif-retour'));
    await waitFor(() => expect(screen.getByTestId('quiz-ouvrir-adaptatif')).toBeTruthy());
    expect(screen.queryByTestId('quiz-adaptatif')).toBeNull();
  });
});
