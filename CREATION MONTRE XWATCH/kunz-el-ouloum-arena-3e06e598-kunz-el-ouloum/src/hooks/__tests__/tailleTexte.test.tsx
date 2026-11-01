// tailleTexte.test.tsx — M5 (audit 8 axes 2026-10-14) : « 3 crans de taille
// de texte ». L'app est entière en rem Tailwind (text-sm, text-4xl…) mais
// AUCUN réglage n'existait : un élève malvoyant sur un projecteur de classe
// n'avait rien à actionner. Le hook tient le cran : cycle 1→2→3 sur
// html[data-taille-texte], persistance locale (même clé-préfixe discipline
// que le reste de l'app), retour obligatoire au cran 1.
import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { useTailleTexte } from '../useTailleTexte';

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute('data-taille-texte');
});

afterEach(() => {
  cleanup();
  localStorage.clear();
  document.documentElement.removeAttribute('data-taille-texte');
});

describe('useTailleTexte — 3 crans réels', () => {
  it('cran initial = 1 (default rem), attribut posé sur <html>', () => {
    const { result } = renderHook(() => useTailleTexte());
    expect(result.current.cran).toBe(1);
    expect(document.documentElement.dataset.tailleTexte).toBe('1');
  });

  it('le cycle 1→2→3→1 agrandit puis revient, et persiste', () => {
    const { result } = renderHook(() => useTailleTexte());
    act(() => result.current.agrandir());
    expect(result.current.cran).toBe(2);
    expect(document.documentElement.dataset.tailleTexte).toBe('2');

    act(() => result.current.agrandir());
    expect(result.current.cran).toBe(3);
    expect(document.documentElement.dataset.tailleTexte).toBe('3');

    act(() => result.current.agrandir());
    expect(result.current.cran).toBe(1);
    expect(document.documentElement.dataset.tailleTexte).toBe('1');

    // Persistance : un second montage relit le choix, pas un cran par défaut.
    act(() => result.current.agrandir());
    const remonte = renderHook(() => useTailleTexte());
    expect(remonte.result.current.cran).toBe(2);
  });
});
