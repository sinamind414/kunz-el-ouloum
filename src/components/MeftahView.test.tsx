// MeftahView — parcours progressif, rappel actif et accès secondaire aux références.
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import MeftahView from './MeftahView';

afterEach(cleanup);

async function openLibrary(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByTestId('meftah-library-summary'));
}

async function openBac(user: ReturnType<typeof userEvent.setup>) {
  await openLibrary(user);
  await user.click(screen.getByTestId('meftah-level-bac'));
}

async function revealFeedback(user: ReturnType<typeof userEvent.setup>, questionId: string) {
  await user.click(screen.getByTestId(`${questionId}-attempted`));
  await user.click(screen.getByTestId(`${questionId}-show-feedback`));
}

describe('MeftahView — entrée progressive', () => {
  it('met la base au premier plan et replie les niveaux avancés et le BAC', () => {
    render(<MeftahView />);
    expect(screen.getByTestId('meftah-home')).toBeTruthy();
    expect(screen.getByTestId('meftah-level-base')).toBeTruthy();
    const library = screen.getByTestId('meftah-library') as HTMLDetailsElement;
    expect(library.open).toBe(false);
    expect(screen.getByTestId('meftah-level-plus').closest('details')).toBe(library);
    expect(screen.getByTestId('meftah-level-plusplus').closest('details')).toBe(library);
    expect(screen.getByTestId('meftah-level-bac').closest('details')).toBe(library);
  });

  it('ouvre le niveau de base depuis l’entrée principale', async () => {
    const user = userEvent.setup();
    render(<MeftahView />);
    await user.click(screen.getByTestId('meftah-level-base'));
    expect(screen.getByTestId('meftah-level-view-base')).toBeTruthy();
    expect(screen.getByText('الحركات الأربع')).toBeTruthy();
  });

  it('les niveaux avancés et le BAC restent accessibles dans la bibliothèque', async () => {
    const user = userEvent.setup();
    render(<MeftahView />);
    await openLibrary(user);
    expect((screen.getByTestId('meftah-library') as HTMLDetailsElement).open).toBe(true);
    expect(screen.getByTestId('meftah-level-plus')).toBeTruthy();
    expect(screen.getByTestId('meftah-level-plusplus')).toBeTruthy();
    expect(screen.getByTestId('meftah-level-bac')).toBeTruthy();
  });

  it('affiche le tableau des أفعال الناقصة dans المفتاح+', async () => {
    const user = userEvent.setup();
    render(<MeftahView />);
    await openLibrary(user);
    await user.click(screen.getByTestId('meftah-level-plus'));
    await user.click(screen.getByText('دليل الأفعال الناقصة'));
    expect(screen.getByText('سمّ / تعرّف')).toBeTruthy();
  });

  it('relie la base au simulateur existant', async () => {
    const user = userEvent.setup();
    const onOpenSimulator = vi.fn();
    render(<MeftahView onOpenSimulator={onOpenSimulator} />);
    await user.click(screen.getByTestId('meftah-open-simulator'));
    expect(onOpenSimulator).toHaveBeenCalledTimes(1);
    await user.click(screen.getByTestId('meftah-level-base'));
    await user.click(screen.getByTestId('meftah-level-open-simulator'));
    expect(onOpenSimulator).toHaveBeenCalledTimes(2);
  });
});

describe('MeftahView — application BAC 2025', () => {
  it('liste les 3 exercices et affiche la réserve sur le barème', async () => {
    const user = userEvent.setup();
    render(<MeftahView />);
    await openBac(user);
    expect(screen.getByTestId('meftah-bac-exercise-bac2025-ex1')).toBeTruthy();
    expect(screen.getByTestId('meftah-bac-exercise-bac2025-ex2')).toBeTruthy();
    expect(screen.getByTestId('meftah-bac-exercise-bac2025-ex3')).toBeTruthy();
    await user.click(screen.getByTestId('meftah-bac-exercise-bac2025-ex1'));
    expect(screen.getByTestId('meftah-bac-rubric-note')).toBeTruthy();
  });

  it('demande une tentative avant d’afficher le modèle et le piège RIP', async () => {
    const user = userEvent.setup();
    render(<MeftahView />);
    await openBac(user);
    await user.click(screen.getByTestId('meftah-bac-exercise-bac2025-ex1'));
    await user.click(screen.getByTestId('bac2025-ex1-q2-header'));

    expect(screen.queryByTestId('bac2025-ex1-q2-feedback')).toBeNull();
    expect(screen.queryByTestId('bac2025-ex1-q2-modele')).toBeNull();
    const reveal = screen.getByTestId('bac2025-ex1-q2-show-feedback') as HTMLButtonElement;
    expect(reveal.disabled).toBe(true);
    await revealFeedback(user, 'bac2025-ex1-q2');
    await waitFor(() => {
      expect(screen.getByTestId('bac2025-ex1-q2-feedback')).toBeTruthy();
      expect(screen.getByTestId('bac2025-ex1-q2-modele')).toBeTruthy();
      expect(screen.getByText(/توضيح دور RIP/)).toBeTruthy();
    });
  });

  it('montre le raisonnement d’analyse seulement après l’essai', async () => {
    const user = userEvent.setup();
    render(<MeftahView />);
    await openBac(user);
    await user.click(screen.getByTestId('meftah-bac-exercise-bac2025-ex2'));
    await user.click(screen.getByTestId('bac2025-ex2-q1-header'));
    expect(screen.queryByText(/أبدأ بوصف العلاقة/)).toBeNull();
    await revealFeedback(user, 'bac2025-ex2-q1');
    expect(screen.getByText(/أبدأ بوصف العلاقة/)).toBeTruthy();
  });

});

describe('MeftahView — liens vers les autres modes', () => {
  it('propage onOpenVerb quand l élève clique le bouton lié', async () => {
    const user = userEvent.setup();
    const onOpenVerb = vi.fn();
    render(<MeftahView onOpenVerb={onOpenVerb} />);
    await user.click(screen.getByTestId('meftah-level-base'));
    await user.click(screen.getByText('علاقة — وصفة حلّل'));
    const btn = screen.getAllByRole('button').find((b) => b.textContent?.includes('جرّب هذا الفعل'));
    expect(btn).toBeDefined();
    await user.click(btn!);
    expect(onOpenVerb).toHaveBeenCalledWith('analyse');
  });
});
