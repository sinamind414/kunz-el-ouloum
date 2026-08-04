import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import MyPathView from './MyPathView';
import { INITIAL_UNITS } from '../unitCatalog';
import type { UserProgress } from '../types';

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ user: { name: 'طالب زائر' } }),
}));

const progress: UserProgress = {
  xp: 0,
  streak: 0,
  completedUnits: [],
  completedQuestionsCount: 0,
  studyMinutes: 0,
  flashcardStats: { again: 0, hard: 0, good: 0, easy: 0 },
  quizScoreHistory: [],
};

describe('MyPathView beginner launchpad', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(cleanup);

  it('affiche un vrai point de départ débutant et ouvre l’onglet training', async () => {
    const user = userEvent.setup();
    const onNavigateToTab = vi.fn();

    render(
      <MyPathView
        units={INITIAL_UNITS}
        progress={progress}
        onLaunchQuiz={vi.fn()}
        onLaunchRevision={vi.fn()}
        onNavigateToTab={onNavigateToTab}
      />
    );

    expect(screen.getByTestId('mypath-beginner-launchpad')).toBeTruthy();
    expect(screen.getByText('ابدأ من هنا')).toBeTruthy();
    expect(screen.getByText(/شاهد/)).toBeTruthy();
    expect(screen.getByText(/افهم/)).toBeTruthy();
    expect(screen.getByText(/أجب/)).toBeTruthy();
    expect(screen.getByText(/صحّح/)).toBeTruthy();
    expect(screen.getByText(/ثبّت/)).toBeTruthy();

    await user.click(screen.getByRole('button', { name: 'ابدأ الآن من «أتدرب» ثم افتح «كيف أجيب؟»' }));
    expect(onNavigateToTab).toHaveBeenCalledWith('training');
  });
});
