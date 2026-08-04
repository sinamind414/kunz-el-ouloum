import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import TrainingView from './TrainingView';
import { INITIAL_UNITS } from '../unitCatalog';
import type { Flashcard, UserProgress } from '../types';

const progress: UserProgress = {
  xp: 0,
  streak: 0,
  completedUnits: [],
  completedQuestionsCount: 0,
  studyMinutes: 0,
  flashcardStats: { again: 0, hard: 0, good: 0, easy: 0 },
  quizScoreHistory: [],
};

const flashcards: Flashcard[] = [];

describe('TrainingView beginner mode', () => {
  afterEach(cleanup);

  it('met en avant كيف أجيب؟ pour le débutant', async () => {
    const user = userEvent.setup();

    render(
      <TrainingView
        units={INITIAL_UNITS}
        flashcards={flashcards}
        progress={progress}
        onLaunchQuiz={vi.fn()}
        onLaunchRevision={vi.fn()}
        onStartLesson={vi.fn()}
        onRateCard={vi.fn()}
        isFocusMode={false}
        setIsFocusMode={vi.fn()}
        onNavigateToTab={vi.fn()}
      />
    );

    expect(screen.getByTestId('training-beginner-launchpad')).toBeTruthy();
    expect(screen.getByText('إذا كنت ضعيفاً: ابدأ بـ «كيف أجيب؟»')).toBeTruthy();

    await user.click(screen.getByRole('button', { name: 'افتح «كيف أجيب؟» الآن' }));
    expect(screen.getByText('المنهجية والمسعى العلمي')).toBeTruthy();
  });
});
