// SelecteurChapitre.test.tsx — verrou du sélecteur des 3 chapitres (2026-11-10).
//
// Promesse testée : l'élève entre par le chapitre — 3 cartes, un clic change
// le chapitre actif PARTAGÉ (localStorage + notification), l'état pressé suit.

import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import SelecteurChapitre from '../SelecteurChapitre';
import { lireChapitreActif } from '../../lib/chapitreActif';

afterEach(() => {
  cleanup();
  localStorage.clear();
});

describe('SelecteurChapitre — les 3 chapitres', () => {
  it('affiche exactement 3 cartes, la première pressée par défaut', () => {
    render(<SelecteurChapitre />);
    expect(screen.getByTestId('selecteur-chapitre')).toBeTruthy();
    for (const id of [1, 2, 3]) {
      expect(screen.getByTestId(`chapitre-${id}`)).toBeTruthy();
    }
    expect(screen.getByTestId('chapitre-1').getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByTestId('chapitre-2').getAttribute('aria-pressed')).toBe('false');
  });

  it('un clic change le chapitre actif partagé et l’état pressé', async () => {
    const user = userEvent.setup();
    render(<SelecteurChapitre />);
    await user.click(screen.getByTestId('chapitre-2'));
    expect(lireChapitreActif()).toBe(2);
    expect(screen.getByTestId('chapitre-2').getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByTestId('chapitre-1').getAttribute('aria-pressed')).toBe('false');
  });
});
