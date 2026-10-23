// serieIntegration.test.tsx — la série de jours, prouvée dans <App /> réelle (H3).
//
// Les tests unitaires (`src/utils/__tests__/serie.test.ts`,
// `activiteQuotidienne.test.ts`) prouvent la RÈGLE. Ce fichier prouve le
// BRANCHEMENT : le défaut d'origine n'était pas un mauvais calcul, c'était un
// calcul jamais appelé — `progress.streak` et `dailyGoals.streakDays` restaient
// figés pour toujours, donc les badges 7 / 30 jours et les célébrations étaient
// morts, alors que quatre écrans les affichaient.
//
// On pilote donc l'application comme un élève : coffre → déclic → session de
// focus créditée, puis on relit ce que l'application a RÉELLEMENT écrit dans le
// stockage local.

import { cleanup, render, screen, fireEvent, act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../../App';
import { ajouterJours, jourLocal } from '../../utils/dayKey';
import type { UserProgress } from '../../types';

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.useRealTimers();
});

// Freemium (24/10/2026) : ce test pilote l'app comme un INVITÉ (flux intro →
// tableau de bord → session de focus), avant toute connexion. Le hook global
// du setup sème un état « essai » avant chaque test ; on l'annule ici pour
// retrouver l'état invité que ce contrat prouve.
beforeEach(() => {
  localStorage.clear();
});

/** Ouvre le coffre et démarre : le déclic du jour est affiché. */
async function demarrer() {
  fireEvent.click(screen.getByText('افْتَحْ كَنْزَ العُلُومِ (دخول)'));
  fireEvent.click(await screen.findByText('ابدأ رحلة التعلم', {}, { timeout: 4000 }));
  await screen.findByTestId('declic-overlay', {}, { timeout: 4000 });
}

/** Démarre puis ferme le déclic : on arrive sur le tableau de bord. */
async function demarrerEtFermerDeclic() {
  await demarrer();
  fireEvent.click(screen.getByText('ليس الآن'));
}

/**
 * Termine une session de focus de 25 minutes depuis le déclic DÉJÀ ouvert
 * (« جلسة تركيز » n'existe que dans cet écran — c'est le seul chemin par lequel
 * l'élève y accède), puis rend la progression réellement écrite.
 */
async function terminerSessionFocus(): Promise<UserProgress> {
  fireEvent.click(screen.getByText('جلسة تركيز'));
  await screen.findByText('ابدأ', {}, { timeout: 4000 });
  // Ancre à midi du jour local : l'avance simulée de 25 min reste dans le même
  // jour, quoi qu'il soit. Sans ancre, tout lancement entre 23 h 35 et 00 h 00
  // (heure locale, UTC+1) faisait traverser minuit à l'horloge simulée —
  // l'app écrivait le lendemain pendant que les assertions comparaient au jour
  // présent (rouge transient observé le 15/10 à 23 h 35+, sans aucun changement
  // de production ; reproduit sur HEAD nu par remise/stash).
  vi.useFakeTimers({ now: new Date(`${jourLocal()}T12:00:00`) });
  fireEvent.click(screen.getByText('ابدأ'));
  act(() => { vi.advanceTimersByTime(25 * 60 * 1000); });
  act(() => { vi.advanceTimersByTime(1000); });
  vi.useRealTimers();
  return JSON.parse(localStorage.getItem('svt_progress') ?? '{}') as UserProgress;
}

function progressionSemee(over: Partial<UserProgress> = {}): UserProgress {
  return {
    xp: 120,
    streak: 0,
    completedUnits: [],
    completedQuestionsCount: 0,
    studyMinutes: 0,
    flashcardStats: { again: 0, hard: 0, good: 0, easy: 0 },
    quizScoreHistory: [],
    dailyGoals: {
      type: 'minutes',
      targetMinutes: 25,
      targetQuestions: 20,
      lastActiveDate: '',
      todayMinutes: 0,
      todayQuestions: 0,
      streakDays: 0,
      completedToday: false,
    },
    ...over,
  } as UserProgress;
}

describe('App — la série de jours est écrite pour de vrai', () => {
  it('installation neuve : aucune série inventée (ni 1, ni 3 jours)', async () => {
    render(<App />);
    await demarrerEtFermerDeclic();

    // Avant toute activité, l'app ne doit rien afficher de faux. Le widget
    // d'objectif retombait autrefois sur 12 minutes / 14 questions / 3 jours.
    const stockage = localStorage.getItem('svt_progress');
    if (stockage) {
      const p = JSON.parse(stockage) as UserProgress;
      expect(p.streak ?? 0).toBe(0);
      expect(p.dailyGoals?.streakDays ?? 0).toBe(0);
    }
    expect(screen.queryByText('3 أيام 🔥')).toBeNull();
  });

  it('une session de focus terminée compte la journée : série = 1, jour local enregistré', async () => {
    render(<App />);
    await demarrer();
    const p = await terminerSessionFocus();

    expect(p.dailyGoals?.streakDays).toBe(1);
    expect(p.streak).toBe(1);
    expect(p.dailyGoals?.serieDernierJour).toBe(jourLocal());
  });

  it('lendemain d’une série de 6 : travailler donne 7 (le badge devient atteignable)', async () => {
    // Veille travaillée, série à 6 : le seuil du badge « أسبوع من الاستمرارية ».
    const veille = ajouterJours(jourLocal(), -1);
    localStorage.setItem('svt_progress', JSON.stringify(progressionSemee({
      streak: 6,
      dailyGoals: {
        type: 'minutes',
        targetMinutes: 25,
        targetQuestions: 20,
        lastActiveDate: veille,
        todayMinutes: 25,
        todayQuestions: 20,
        streakDays: 6,
        serieDernierJour: veille,
        completedToday: true,
      },
    })));

    render(<App />);
    await demarrer();
    const p = await terminerSessionFocus();

    expect(p.dailyGoals?.streakDays).toBe(7);
    expect(p.streak).toBe(7);
  });

  it('un jour manqué casse la série (elle repart à 1, elle ne stagne pas)', async () => {
    const ilYA3Jours = ajouterJours(jourLocal(), -3);
    localStorage.setItem('svt_progress', JSON.stringify(progressionSemee({
      streak: 9,
      dailyGoals: {
        type: 'minutes',
        targetMinutes: 25,
        targetQuestions: 20,
        lastActiveDate: ilYA3Jours,
        todayMinutes: 25,
        todayQuestions: 20,
        streakDays: 9,
        serieDernierJour: ilYA3Jours,
        completedToday: true,
      },
    })));

    render(<App />);
    await demarrer();
    const p = await terminerSessionFocus();

    expect(p.dailyGoals?.streakDays).toBe(1);
    expect(p.dailyGoals?.serieDernierJour).toBe(jourLocal());
  });

  it('ouvrir l’app ne fabrique PAS une journée : la série de la veille survit', async () => {
    const veille = ajouterJours(jourLocal(), -1);
    localStorage.setItem('svt_progress', JSON.stringify(progressionSemee({
      streak: 5,
      dailyGoals: {
        type: 'minutes',
        targetMinutes: 25,
        targetQuestions: 20,
        lastActiveDate: veille,
        todayMinutes: 25,
        todayQuestions: 20,
        streakDays: 5,
        serieDernierJour: veille,
        completedToday: true,
      },
    })));

    render(<App />);
    await demarrerEtFermerDeclic();

    // Aucune activité n'a eu lieu : la série doit rester celle de la veille —
    // l'effet de chargement ne doit ni la remettre à zéro ni la faire avancer.
    // On lit l'écran : c'est l'affichage qui mentait, pas seulement le stockage.
    const chip = screen.getByLabelText('عرض تقدمي اليوم');
    expect(chip.textContent).toContain('5');
    const p = JSON.parse(localStorage.getItem('svt_progress') ?? '{}') as UserProgress;
    expect(p.dailyGoals?.serieDernierJour ?? veille).toBe(veille);
  });

  it('un jour manqué : la série affichée retombe à 0, sans attendre une activité', async () => {
    const ilYA3Jours = ajouterJours(jourLocal(), -3);
    localStorage.setItem('svt_progress', JSON.stringify(progressionSemee({
      streak: 9,
      dailyGoals: {
        type: 'minutes',
        targetMinutes: 25,
        targetQuestions: 20,
        lastActiveDate: ilYA3Jours,
        todayMinutes: 25,
        todayQuestions: 20,
        streakDays: 9,
        serieDernierJour: ilYA3Jours,
        completedToday: true,
      },
    })));

    render(<App />);
    await demarrerEtFermerDeclic();

    // 9 jours stockés, mais 3 jours sans rien : on n'affiche plus « 9 ».
    const chip = screen.getByLabelText('عرض تقدمي اليوم');
    expect(chip.textContent).not.toContain('9');
    expect(chip.textContent).toContain('0');
  });
});
