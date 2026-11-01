// SearchView.test.tsx — R5-G3 : recherche globale (UI).
// Vérifie le rendu des résultats classés, le deep-link vers la leçon et le
// bouton favori, sans dépendre du réseau (moteur local).
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import SearchView from '../SearchView';
import { getFavorites, getRecentSearches } from '../../utils/favorites';

beforeEach(() => {
  window.localStorage.clear();
});
afterEach(cleanup);

function renderSearch() {
  const onBack = vi.fn();
  const onOpenLesson = vi.fn();
  const utils = render(<SearchView onBack={onBack} onOpenLesson={onOpenLesson} />);
  const input = screen.getByLabelText('البحث في الدروس') as HTMLInputElement;
  return { ...utils, input, onBack, onOpenLesson };
}

describe('R5-G3 : SearchView', () => {
  it('aucun résultat tant que la requête est vide', () => {
    const { input } = renderSearch();
    expect(input).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'فتح الدرس' })).toBeNull();
  });

  it('remonte des leçons et ouvre la bonne leçon au clic (deep-link)', async () => {
    const user = userEvent.setup();
    const { input, onOpenLesson } = renderSearch();

    await user.type(input, 'تركيب البروتين');
    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: 'فتح الدرس' }).length).toBeGreaterThan(0);
    });

    const openButtons = screen.getAllByRole('button', { name: 'فتح الدرس' });
    await user.click(openButtons[0]);

    expect(onOpenLesson).toHaveBeenCalledTimes(1);
    const [lessonKey, kind, unitId] = onOpenLesson.mock.calls[0];
    expect(typeof lessonKey).toBe('string');
    expect(lessonKey.length).toBeGreaterThan(0);
    expect(['html', 'active']).toContain(kind);
    expect(typeof unitId).toBe('number');
  });

  it("l'étoile ajoute la leçon aux favoris (localStorage)", async () => {
    const user = userEvent.setup();
    const { input } = renderSearch();

    await user.type(input, 'تركيب البروتين');
    await waitFor(() => {
      expect(screen.getAllByLabelText('إضافة إلى المفضلة').length).toBeGreaterThan(0);
    });

    const star = screen.getAllByLabelText('إضافة إلى المفضلة')[0];
    await user.click(star);

    expect(getFavorites().length).toBeGreaterThan(0);
    // L'étoile bascule en mode "pleine".
    expect(screen.getAllByLabelText('إزالة من المفضلة').length).toBeGreaterThan(0);
  });

  it('la requête validée est mémorisée dans les recherches récentes', async () => {
    const user = userEvent.setup();
    const { input } = renderSearch();
    await user.type(input, 'الفسفرة التأكسدية{Enter}');
    await waitFor(() => expect(getRecentSearches()[0]).toBe('الفسفرة التأكسدية'));
  });

  it('une requête non validée n\'est PAS mémorisée (pas de pollution par frappes partielles)', async () => {
    const user = userEvent.setup();
    const { input } = renderSearch();
    await user.type(input, 'الفسفرة التأكسدية');
    await waitFor(() => expect(screen.getAllByRole('button', { name: 'فتح الدرس' }).length).toBeGreaterThan(0));
    expect(getRecentSearches()).toEqual([]);
  });

  it('message explicite quand aucune recherche ne matche', async () => {
    const user = userEvent.setup();
    const { input } = renderSearch();
    await user.type(input, 'zzzzzzzzz');
    await waitFor(() => {
      expect(screen.getByText(/لا توجد نتائج/)).toBeTruthy();
    });
  });

  it('le bouton retour appelle onBack', async () => {
    const user = userEvent.setup();
    const { onBack } = renderSearch();
    await user.click(screen.getByText('عودة'));
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
