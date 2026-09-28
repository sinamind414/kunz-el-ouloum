// MockExamPanel.test.tsx — sujet blanc composé (sprint 41).

import { act, cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import MockExamPanel from '../MockExamPanel';
import { composeMockExam, numeroDuJour } from '../../data/mockExam';
import { budgetParExercice } from '../../data/examTimer';

afterEach(cleanup);
// La session d'épreuve est persistée (sprint 44) : chaque test repart à neuf.
beforeEach(() => localStorage.clear());

describe('panneau du sujet blanc', () => {
  it('ouvre sur le sujet du jour, identique pour toute la classe', () => {
    render(<MockExamPanel onTrain={() => {}} />);
    const attendu = composeMockExam(numeroDuJour());
    expect(screen.getByTestId('mock-exam').textContent).toContain(String(attendu.numero));
    for (let i = 1; i <= 3; i += 1) expect(screen.getByTestId(`mock-exercice-${i}`)).toBeTruthy();
  });

  it('affiche la durée et le barème officiels', () => {
    render(<MockExamPanel onTrain={() => {}} />);
    const entete = screen.getByTestId('mock-entete').textContent ?? '';
    expect(entete).toContain('4');
    expect(entete).toContain('30');
    expect(entete).toContain('20');
  });

  it('montre pour chaque exercice ses supports et ses consignes', () => {
    render(<MockExamPanel onTrain={() => {}} />);
    const attendu = composeMockExam(numeroDuJour());
    const premier = screen.getByTestId('mock-exercice-1');
    expect(premier.textContent).toContain(attendu.exercices[0].supportsAr[0]);
    expect(premier.textContent).toContain(attendu.exercices[0].verbsAr[0]);
  });

  it('change de sujet à la demande', async () => {
    const user = userEvent.setup();
    render(<MockExamPanel onTrain={() => {}} />);
    const avant = screen.getByTestId('mock-exercice-1').textContent;
    await user.click(screen.getByTestId('mock-suivant'));
    expect(screen.getByTestId('mock-exam').textContent).toContain(String(numeroDuJour() + 1));
    expect(screen.getByTestId('mock-exercice-1').textContent).not.toBe(avant);
  });

  it('envoie l’exercice choisi vers l’atelier', async () => {
    const user = userEvent.setup();
    const onTrain = vi.fn();
    render(<MockExamPanel onTrain={onTrain} />);
    const premier = composeMockExam(numeroDuJour()).exercices[0];
    await user.click(screen.getByTestId(`mock-ouvrir-${premier.id}`));
    expect(onTrain).toHaveBeenCalledWith(expect.objectContaining({ id: premier.id }));
  });

  it('s’imprime, et précise que les énoncés sont résumés', async () => {
    const user = userEvent.setup();
    const imprimer = vi.fn();
    vi.stubGlobal('print', imprimer);
    render(<MockExamPanel onTrain={() => {}} />);
    await user.click(screen.getByTestId('mock-imprimer'));
    expect(imprimer).toHaveBeenCalled();
    expect(screen.getByTestId('mock-exam').textContent).toContain('ملخّصة');
    vi.unstubAllGlobals();
  });
});

describe('sujet blanc — chronomètre d’épreuve (sprint 43)', () => {
  it('affiche le temps, la phase et le budget de chaque exercice', () => {
    render(<MockExamPanel onTrain={() => {}} />);
    expect(screen.getByTestId('chrono-temps').textContent).toBe('00:00');
    expect(screen.getByTestId('chrono-phase').textContent).toBe('قراءة الموضوع');
    const budgets = budgetParExercice(
      composeMockExam(numeroDuJour()).exercices.map((e) => e.points),
    );
    for (let i = 1; i <= 3; i += 1) {
      expect(screen.getByTestId(`mock-budget-${i}`).textContent).toContain(
        String(budgets[i - 1].minutes),
      );
    }
  });

  it('avance minute par minute une fois lancé, et change de phase', () => {
    vi.useFakeTimers();
    render(<MockExamPanel onTrain={() => {}} />);
    act(() => {
      screen.getByTestId('chrono-basculer').click();
    });
    act(() => {
      vi.advanceTimersByTime(20 * 60_000);
    });
    expect(screen.getByTestId('chrono-temps').textContent).toBe('00:20');
    expect(screen.getByTestId('chrono-phase').textContent).toBe('التحرير');
    expect(screen.getByTestId('chrono-attendu').textContent).toContain('1');
    vi.useRealTimers();
  });

  it('signale le retard sur un exercice dépassé', () => {
    vi.useFakeTimers();
    render(<MockExamPanel onTrain={() => {}} />);
    act(() => {
      screen.getByTestId('chrono-basculer').click();
    });
    const budgets = budgetParExercice(
      composeMockExam(numeroDuJour()).exercices.map((e) => e.points),
    );
    act(() => {
      vi.advanceTimersByTime((budgets[0].finMinute + 10) * 60_000);
    });
    expect(screen.getByTestId('mock-retard-1').textContent).toContain('10');
    vi.useRealTimers();
  });

  it('se met en pause et se remet à zéro', () => {
    vi.useFakeTimers();
    render(<MockExamPanel onTrain={() => {}} />);
    act(() => {
      screen.getByTestId('chrono-basculer').click();
    });
    act(() => {
      vi.advanceTimersByTime(5 * 60_000);
    });
    act(() => {
      screen.getByTestId('chrono-basculer').click();
    });
    act(() => {
      vi.advanceTimersByTime(10 * 60_000);
    });
    expect(screen.getByTestId('chrono-temps').textContent).toBe('00:05');
    act(() => {
      screen.getByTestId('chrono-remise').click();
    });
    expect(screen.getByTestId('chrono-temps').textContent).toBe('00:00');
    vi.useRealTimers();
  });
});


describe('sujet blanc — la session survit (sprint 44)', () => {
  it('reprend le chronomètre après un rechargement, temps compris', () => {
    vi.useFakeTimers();
    const { unmount } = render(<MockExamPanel onTrain={() => {}} />);
    act(() => {
      screen.getByTestId('chrono-basculer').click();
    });
    act(() => {
      vi.advanceTimersByTime(40 * 60_000);
    });
    expect(screen.getByTestId('chrono-temps').textContent).toBe('00:40');
    unmount();

    // Rechargement : nouveau montage, même session.
    render(<MockExamPanel onTrain={() => {}} />);
    expect(screen.getByTestId('chrono-temps').textContent).toBe('00:40');
    vi.useRealTimers();
  });

  it('compte le temps passé en arrière-plan, sans aucun tick', () => {
    vi.useFakeTimers();
    render(<MockExamPanel onTrain={() => {}} />);
    act(() => {
      screen.getByTestId('chrono-basculer').click();
    });
    // On avance l'horloge SANS laisser tourner les minuteurs : c'est ce que
    // fait un navigateur mobile sur un onglet en arrière-plan.
    act(() => {
      vi.setSystemTime(Date.now() + 25 * 60_000);
      vi.advanceTimersByTime(15_000);
    });
    expect(screen.getByTestId('chrono-temps').textContent).toBe('00:25');
    vi.useRealTimers();
  });

  it('remet le chronomètre à zéro quand on change de sujet', () => {
    vi.useFakeTimers();
    render(<MockExamPanel onTrain={() => {}} />);
    act(() => {
      screen.getByTestId('chrono-basculer').click();
    });
    act(() => {
      vi.advanceTimersByTime(30 * 60_000);
    });
    act(() => {
      screen.getByTestId('mock-suivant').click();
    });
    expect(screen.getByTestId('chrono-temps').textContent).toBe('00:00');
    vi.useRealTimers();
  });
});
