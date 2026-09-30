// FocusTimer.test.tsx — verrous de la brique MOTIVATION (minuteur Pomodoro).
//
// Le minuteur alterne travail intense / pause pour tenir la durée
// (docs/INTEGRATION_FOCUS_MOTIVATION.md §5). On fige : durée du preset par
// défaut, décrément, crédit des minutes vers l'objectif quotidien, bilan du
// jour.

import { cleanup, render, screen, fireEvent, act } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import FocusTimer from '../FocusTimer';

// Le minuteur persiste son bilan du jour dans kunz_focus_v1 : sans nettoyage,
// une session terminée dans un test lèse les assertions du suivant.
afterEach(() => {
  cleanup();
  localStorage.clear();
});

describe('FocusTimer — minuteur de concentration', () => {
  it('affiche la durée du preset classique (25 minutes) au démarrage', () => {
    render(<FocusTimer onFocusComplete={() => {}} />);
    expect(screen.getByText('25:00')).toBeTruthy();
  });

  it('décrémente le compte à rebours seconde par seconde', () => {
    vi.useFakeTimers();
    try {
      render(<FocusTimer onFocusComplete={() => {}} />);
      fireEvent.click(screen.getByText('ابدأ'));
      act(() => {
        vi.advanceTimersByTime(2000);
      });
      expect(screen.getByText('24:58')).toBeTruthy();
    } finally {
      vi.useRealTimers();
    }
  });

  it('crédite preset.focusMin (25) à la fin d\'une phase de focus', () => {
    vi.useFakeTimers();
    try {
      const onDone = vi.fn();
      render(<FocusTimer onFocusComplete={onDone} />);
      fireEvent.click(screen.getByText('ابدأ'));
      // La dernière seconde planifie handlePhaseEnd en setTimeout(0) : il faut
      // une deuxième avance pour la consommer (comportement @sinonjs/fake-timers).
      act(() => {
        vi.advanceTimersByTime(25 * 60 * 1000);
      });
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      expect(onDone).toHaveBeenCalledWith(25);
    } finally {
      vi.useRealTimers();
    }
  });

  it('bascule en pause et crédite le bilan du jour après une session', () => {
    vi.useFakeTimers();
    try {
      render(<FocusTimer onFocusComplete={() => {}} />);
      fireEvent.click(screen.getByText('ابدأ'));
      act(() => {
        vi.advanceTimersByTime(25 * 60 * 1000);
      });
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      expect(screen.getByText('وقت الاستراحة')).toBeTruthy();
      expect(screen.getByText('1')).toBeTruthy(); // 1 session terminée
      expect(screen.getByText('25')).toBeTruthy(); // 25 minutes de focus
    } finally {
      vi.useRealTimers();
    }
  });

  it('« إيقاف مؤقّت » met le minuteur en pause sans perdre le temps écoulé', () => {
    vi.useFakeTimers();
    try {
      render(<FocusTimer onFocusComplete={() => {}} />);
      fireEvent.click(screen.getByText('ابدأ'));
      act(() => {
        vi.advanceTimersByTime(5000);
      });
      fireEvent.click(screen.getByText('إيقاف مؤقّت'));
      expect(screen.getByText('24:55')).toBeTruthy();
      // Relance : le compte continue depuis 24:55, pas depuis 25:00.
      fireEvent.click(screen.getByText('ابدأ'));
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      expect(screen.getByText('24:54')).toBeTruthy();
    } finally {
      vi.useRealTimers();
    }
  });
});
