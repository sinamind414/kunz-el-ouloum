import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import DashboardView from '../DashboardView';
import { INITIAL_UNITS } from '../../unitCatalog';
import type { UserProgress } from '../../types';

const PROGRESS: UserProgress = {
  xp: 0,
  streak: 0,
  completedUnits: [],
  completedQuestionsCount: 0,
  studyMinutes: 0,
  dailyGoals: {
    type: 'minutes',
    targetMinutes: 25,
    targetQuestions: 20,
    lastActiveDate: '2026-10-11',
    todayMinutes: 0,
    todayQuestions: 0,
    streakDays: 0,
    completedToday: false,
  },
  flashcardStats: { again: 0, hard: 0, good: 0, easy: 0 },
  quizScoreHistory: [],
};

afterEach(() => {
  cleanup();
  localStorage.clear();
});

describe('DashboardView — hiérarchie progressive', () => {
  it('affiche une priorité et trois parcours avant les outils secondaires', () => {
    render(
      <DashboardView
        units={INITIAL_UNITS}
        progress={PROGRESS}
        onLaunchQuiz={() => {}}
        onLaunchRevision={() => {}}
        onNavigateToTab={() => {}}
      />,
    );

    expect(screen.getByText('خطوتك التالية')).toBeTruthy();
    expect(screen.getByText('أتعلّم')).toBeTruthy();
    expect(screen.getByText('أتدرّب')).toBeTruthy();
    expect(screen.getByText('أراجع')).toBeTruthy();
    // 2026-10-12 : les DOUBLONS de portes ont quitté l'accueil. Chacun a un
    // emplacement principal unique ailleurs (hub التدريب, « أنا », « الدروس »),
    // donc il ne doit apparaître NULLE PART ici, ni replié ni déplié.
    for (const doublon of [
      'الخرائط الذهنية',   // → الدروس
      'المنهجية',          // → hub التدريب
      'الأنميشن',          // → hub التدريب
      'تحدي 3 دقائق',      // → hub التدريب
    ]) {
      expect(screen.queryByText(doublon), `${doublon} encore sur l accueil`).toBeNull();
    }

    fireEvent.click(screen.getByText('المزيد من الأدوات'));

    // Après dépliage : toujours aucun doublon, mais les vraies portes restent.
    for (const doublon of ['الخرائط الذهنية', 'المنهجية', 'الأنميشن', 'تحدي 3 دقائق']) {
      expect(screen.queryByText(doublon), `${doublon} encore sur l accueil`).toBeNull();
    }
    // Le tuteur a une porte EXPLICITE ici (question libre depuis l'accueil).
    // 14/10/2026 — il s'appelle القبطان ; l'intention du test (une porte
    // explicite vers le tuteur depuis l'accueil) est inchangée.
    expect(screen.getByText('اسأل القبطان')).toBeTruthy();
    // Et le rapport hebdo, qui est une action (modal), pas une rubrique.
    expect(screen.getByText('تقرير الأسبوع')).toBeTruthy();
  });
});
