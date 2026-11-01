// useWallClock.test.tsx — minuteurs adossés à l'horloge (sprint 45).

import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useChronometre, useCompteARebours } from './useWallClock';

afterEach(cleanup);

function Rebours({ dureeSec, actif, onFin }: { dureeSec: number; actif: boolean; onFin?: () => void }) {
  const restant = useCompteARebours({ dureeSec, actif, onFin, rafraichissementMs: 500 });
  return <span data-testid="restant">{restant}</span>;
}

function Chrono({ actif }: { actif: boolean }) {
  const ecoule = useChronometre(actif, 500);
  return <span data-testid="ecoule">{ecoule}</span>;
}

describe('compte à rebours', () => {
  it('affiche la durée complète tant qu’il est à l’arrêt', () => {
    render(<Rebours dureeSec={60} actif={false} />);
    expect(screen.getByTestId('restant').textContent).toBe('60');
  });

  it('décompte normalement quand les ticks passent', () => {
    vi.useFakeTimers();
    render(<Rebours dureeSec={60} actif />);
    act(() => {
      vi.advanceTimersByTime(10_000);
    });
    expect(screen.getByTestId('restant').textContent).toBe('50');
    vi.useRealTimers();
  });

  it('rattrape le temps passé en arrière-plan dès le premier tick', () => {
    vi.useFakeTimers();
    render(<Rebours dureeSec={60} actif />);
    // L'onglet dort : l'horloge avance de 45 s, un seul tick arrive.
    act(() => {
      vi.setSystemTime(Date.now() + 45_000);
      vi.advanceTimersByTime(500);
    });
    expect(screen.getByTestId('restant').textContent).toBe('15');
    vi.useRealTimers();
  });

  it('ne descend jamais sous zéro et ne prolonge pas un exercice noté', () => {
    vi.useFakeTimers();
    render(<Rebours dureeSec={60} actif />);
    act(() => {
      vi.setSystemTime(Date.now() + 300_000);
      vi.advanceTimersByTime(500);
    });
    expect(screen.getByTestId('restant').textContent).toBe('0');
    vi.useRealTimers();
  });

  it('appelle onFin une seule fois', () => {
    vi.useFakeTimers();
    const onFin = vi.fn();
    render(<Rebours dureeSec={5} actif onFin={onFin} />);
    act(() => {
      vi.advanceTimersByTime(10_000);
    });
    expect(onFin).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it('repart proprement quand la durée change', () => {
    vi.useFakeTimers();
    const { rerender } = render(<Rebours dureeSec={30} actif />);
    act(() => {
      vi.advanceTimersByTime(10_000);
    });
    expect(screen.getByTestId('restant').textContent).toBe('20');
    rerender(<Rebours dureeSec={90} actif />);
    expect(screen.getByTestId('restant').textContent).toBe('90');
    vi.useRealTimers();
  });
});

describe('chronomètre croissant', () => {
  it('reste à zéro à l’arrêt et compte une fois lancé', () => {
    vi.useFakeTimers();
    const { rerender } = render(<Chrono actif={false} />);
    expect(screen.getByTestId('ecoule').textContent).toBe('0');
    rerender(<Chrono actif />);
    act(() => {
      vi.advanceTimersByTime(7_000);
    });
    expect(screen.getByTestId('ecoule').textContent).toBe('7');
    vi.useRealTimers();
  });

  it('inclut le temps passé en arrière-plan', () => {
    vi.useFakeTimers();
    render(<Chrono actif />);
    act(() => {
      vi.setSystemTime(Date.now() + 120_000);
      vi.advanceTimersByTime(500);
    });
    expect(screen.getByTestId('ecoule').textContent).toBe('120');
    vi.useRealTimers();
  });
});
