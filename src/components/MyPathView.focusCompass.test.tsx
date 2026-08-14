import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import MyPathView from './MyPathView';
import { INITIAL_UNITS } from '../unitCatalog';
import type { UserProgress } from '../types';
import type { MasteryState } from '../services/masteryEngine';

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ user: { name: 'طالب زائر' } }),
}));

const progress: UserProgress = {
  xp: 300,
  streak: 2,
  completedUnits: [],
  completedQuestionsCount: 40,
  studyMinutes: 0,
  flashcardStats: { again: 0, hard: 0, good: 0, easy: 0 },
  quizScoreHistory: [],
};

const emptyMastery: MasteryState = { validatedUnits: [], attempts: [], lastFailure: null };

describe('MyPathView — La Boussole (V3)', () => {
  beforeEach(() => localStorage.clear());
  afterEach(cleanup);

  it('affiche l’objectif unique et « أكمل من حيث توقفت » comme action principale', async () => {
    const user = userEvent.setup();
    const onResumeMission = vi.fn();
    const units = INITIAL_UNITS.map((u) => (u.id === 1 ? { ...u, progress: 30 } : u));

    render(
      <MyPathView
        units={units}
        progress={progress}
        mastery={emptyMastery}
        onLaunchQuiz={vi.fn()}
        onLaunchRevision={vi.fn()}
        onNavigateToTab={vi.fn()}
        onResumeMission={onResumeMission}
      />,
    );

    const card = screen.getByTestId('mypath-focus-card');
    expect(card).toBeTruthy();
    expect(screen.getByText('هدفك الحالي — البوصلة')).toBeTruthy();
    expect(screen.getByText(/الوحدة 1 — تركيب البروتين/)).toBeTruthy();

    await user.click(screen.getByTestId('mypath-resume-btn'));
    expect(onResumeMission).toHaveBeenCalledTimes(1);
    // progress 30 % (< 60) → prochaine action = QCM d'entraînement.
    expect(onResumeMission).toHaveBeenCalledWith(expect.objectContaining({ kind: 'quiz', unitId: 1 }));
  });

  it('propose directement l’examen de validation quand l’unité est prête (≥ 60 %)', async () => {
    const user = userEvent.setup();
    const onResumeMission = vi.fn();
    const onLaunchExam = vi.fn();
    const units = INITIAL_UNITS.map((u) => (u.id === 1 ? { ...u, progress: 70 } : u));

    render(
      <MyPathView
        units={units}
        progress={progress}
        mastery={emptyMastery}
        onLaunchQuiz={vi.fn()}
        onLaunchRevision={vi.fn()}
        onNavigateToTab={vi.fn()}
        onResumeMission={onResumeMission}
        onLaunchExam={onLaunchExam}
      />,
    );

    expect(screen.getByText('اجتاز امتحان الوحدة')).toBeTruthy();
    await user.click(screen.getByTestId('mypath-exam-btn'));
    expect(onLaunchExam).toHaveBeenCalledWith(1);

    await user.click(screen.getByTestId('mypath-resume-btn'));
    expect(onResumeMission).toHaveBeenCalledWith(expect.objectContaining({ kind: 'exam', unitId: 1 }));
  });

  it('affiche la remédiation ciblée après un échec (jamais « échec, recommence » seul)', () => {
    const mastery: MasteryState = {
      validatedUnits: [],
      attempts: [],
      lastFailure: {
        unitId: 1,
        at: Date.now(),
        percent: 50,
        wrongQuestionIds: [501],
        weakTopicsAr: ['مرحلة الاستنساخ'],
      },
    };
    const units = INITIAL_UNITS.map((u) => (u.id === 1 ? { ...u, progress: 70 } : u));

    render(
      <MyPathView
        units={units}
        progress={progress}
        mastery={mastery}
        onLaunchQuiz={vi.fn()}
        onLaunchRevision={vi.fn()}
        onNavigateToTab={vi.fn()}
        onResumeMission={vi.fn()}
      />,
    );

    expect(screen.getByText('ابدأ المعالجة المستهدفة')).toBeTruthy();
    expect(screen.getByText(/تحتاج إلى مراجعة: مرحلة الاستنساخ/)).toBeTruthy();
    expect(screen.getByText('مرحلة الاستنساخ')).toBeTruthy(); // puce visible
  });

  it('félicite quand toutes les unités débloquées sont validées', () => {
    const units = INITIAL_UNITS.map((u) => (u.id === 1 ? { ...u, progress: 100 } : u));
    const mastery: MasteryState = { validatedUnits: [1], attempts: [], lastFailure: null };

    render(
      <MyPathView
        units={units}
        progress={progress}
        mastery={mastery}
        onLaunchQuiz={vi.fn()}
        onLaunchRevision={vi.fn()}
        onNavigateToTab={vi.fn()}
        onResumeMission={vi.fn()}
      />,
    );

    expect(screen.getByText('مبروك! أتقنت كل الوحدات')).toBeTruthy();
  });
});
