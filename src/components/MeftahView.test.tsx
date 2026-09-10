import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import MeftahView from './MeftahView';

afterEach(cleanup);

describe('MeftahView — accueil en escalier', () => {
  it('affiche les 3 visages méthode + la carte application BAC 2025', () => {
    render(<MeftahView />);
    expect(screen.getByTestId('meftah-home')).toBeTruthy();
    expect(screen.getByTestId('meftah-level-base')).toBeTruthy();
    expect(screen.getByTestId('meftah-level-plus')).toBeTruthy();
    expect(screen.getByTestId('meftah-level-plusplus')).toBeTruthy();
    expect(screen.getByTestId('meftah-level-bac')).toBeTruthy();
  });

  it('affiche le résumé « 10 secondes » du visage de base', async () => {
    const user = userEvent.setup();
    render(<MeftahView />);
    await user.click(screen.getByTestId('meftah-level-base'));
    expect(screen.getByTestId('meftah-level-view-base')).toBeTruthy();
    expect(screen.getByText(/ما الهدف\؟ → ماذا يريد الفعل\؟/)).toBeTruthy();
  });

  it('affiche le tableau des أفعال الناقصة dans المفتاح+', async () => {
    const user = userEvent.setup();
    render(<MeftahView />);
    await user.click(screen.getByTestId('meftah-level-plus'));
    await user.click(screen.getByText('دليل الأفعال الناقصة'));
    expect(screen.getByText('سمّ / تعرّف')).toBeTruthy();
  });
});

describe('MeftahView — application BAC 2025', () => {
  it('liste les 3 exercices', async () => {
    const user = userEvent.setup();
    render(<MeftahView />);
    await user.click(screen.getByTestId('meftah-level-bac'));
    expect(screen.getByTestId('meftah-bac-exercise-bac2025-ex1')).toBeTruthy();
    expect(screen.getByTestId('meftah-bac-exercise-bac2025-ex2')).toBeTruthy();
    expect(screen.getByTestId('meftah-bac-exercise-bac2025-ex3')).toBeTruthy();
  });

  it('ouvre l exercice 1 et affiche le piège RIP', async () => {
    const user = userEvent.setup();
    render(<MeftahView />);
    await user.click(screen.getByTestId('meftah-level-bac'));
    await user.click(screen.getByTestId('meftah-bac-exercise-bac2025-ex1'));
    expect(screen.getByText(/كيف تستهدف مادة RIP جزيئات ARN/)).toBeTruthy();
    const header = screen.getByTestId('bac2025-ex1-q2-header');
    await user.click(header);
    await waitFor(() => {
      expect(screen.getByText(/ضياع 1.25 نقطة/)).toBeTruthy();
    });
  });

  it('ouvre l exercice 2 et affiche le piège فرضية', async () => {
    const user = userEvent.setup();
    render(<MeftahView />);
    await user.click(screen.getByTestId('meftah-level-bac'));
    await user.click(screen.getByTestId('meftah-bac-exercise-bac2025-ex2'));
    await user.click(screen.getByTestId('bac2025-ex2-q1-header'));
    await waitFor(() => {
      expect(screen.getByText(/ممنوع هذا يدل \/ لأن/)).toBeTruthy();
    });
  });
});

describe('MeftahView — liens croisés vers les réflexes', () => {
  it('propage onOpenVerb quand l élève clique le bouton lié', async () => {
    const user = userEvent.setup();
    const onOpenVerb = vi.fn();
    render(<MeftahView onOpenVerb={onOpenVerb} />);
    await user.click(screen.getByTestId('meftah-level-base'));
    await user.click(screen.getByText('أدر — وصفة حلّل كما في الكتاب'));
    const btn = screen.getAllByRole('button').find((b) => b.textContent?.includes('جرّب هذا الفعل'));
    expect(btn).toBeDefined();
    await user.click(btn!);
    expect(onOpenVerb).toHaveBeenCalledWith('analyse');
  });
});
