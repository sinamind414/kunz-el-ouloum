// TrainingHubView.test.tsx — verrous du hub « التمارين والتدريب » (sprint 13).
//
// Ce hub existe pour REMPLACER des entrées de menu, pas pour s'y ajouter.
// Les tests figent donc deux choses : (1) chaque espace regroupé reste
// atteignable en un clic, et (2) le regroupement reste réellement lisible —
// au plus 7 cartes (limite de Miller, relevée de 6 à 7 au sprint 16 pour
// accueillir « أفكار التمارين حسب الدورة » — au-delà, il faudra regrouper au
// lieu d'ajouter), chacune annonçant le geste travaillé.

import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import TrainingHubView from '../TrainingHubView';
import { TRAINING_ENTRIES, TRAINING_ENTRY_COUNT } from '../../data/trainingHub';

afterEach(cleanup);

describe('hub d entraînement — contenu', () => {
  it('affiche une carte par espace regroupé', () => {
    render(<TrainingHubView onOpen={() => {}} />);
    for (const e of TRAINING_ENTRIES) {
      expect(screen.getByTestId(`hub-${e.tab}`), e.tab).toBeTruthy();
    }
  });

  it('reste lisible : au plus 8 cartes (grille, pas menu linéaire)', () => {
    // SECONDARY_NAV est un menu LINÉAIRE (plafond 6 par test dédié) ; le hub
    // est une GRILLE de cartes où 2 colonnes × 4 lignes restent scannables.
    // tadwin (sprint 42) y rejoint les autres espaces d'entraînement.
    expect(TRAINING_ENTRY_COUNT).toBeLessThanOrEqual(8);
    expect(TRAINING_ENTRY_COUNT).toBeGreaterThanOrEqual(4);
  });

  it('chaque carte annonce un geste et une description utile', () => {
    render(<TrainingHubView onOpen={() => {}} />);
    for (const e of TRAINING_ENTRIES) {
      const carte = screen.getByTestId(`hub-${e.tab}`);
      expect(carte.textContent, e.tab).toContain(e.titleAr);
      expect(carte.textContent, e.tab).toContain(e.gestureAr);
      expect(e.descriptionAr.length, e.tab).toBeGreaterThanOrEqual(40);
    }
  });

  it('les onglets cibles sont uniques', () => {
    const tabs = TRAINING_ENTRIES.map((e) => e.tab);
    expect(new Set(tabs).size).toBe(tabs.length);
  });

  it('les espaces livrés aux sprints 10 et 12 sont bien dans le hub', () => {
    const tabs = TRAINING_ENTRIES.map((e) => e.tab);
    expect(tabs).toContain('situations');
    expect(tabs).toContain('schemas');
  });
});

describe('hub d entraînement — navigation', () => {
  it('un clic ouvre l onglet correspondant', async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    render(<TrainingHubView onOpen={onOpen} />);

    await user.click(screen.getByTestId('hub-schemas'));
    expect(onOpen).toHaveBeenCalledWith('schemas');

    await user.click(screen.getByTestId('hub-situations'));
    expect(onOpen).toHaveBeenLastCalledWith('situations');
    expect(onOpen).toHaveBeenCalledTimes(2);
  });

  it('chaque carte transmet exactement son propre onglet', async () => {
    const user = userEvent.setup();
    for (const e of TRAINING_ENTRIES) {
      const onOpen = vi.fn();
      render(<TrainingHubView onOpen={onOpen} />);
      await user.click(screen.getByTestId(`hub-${e.tab}`));
      expect(onOpen, e.tab).toHaveBeenCalledWith(e.tab);
      cleanup();
    }
  });

  it('le retour à l accueil n est rendu que s il est fourni', () => {
    const { rerender } = render(<TrainingHubView onOpen={() => {}} />);
    expect(screen.queryByTestId('hub-retour')).toBeNull();
    rerender(<TrainingHubView onOpen={() => {}} onBackToHome={() => {}} />);
    expect(screen.getByTestId('hub-retour')).toBeTruthy();
  });
});

describe('hub d entraînement — le menu a bien été allégé', () => {
  // Garde-fou anti-régression : App.tsx ne doit plus câbler les espaces
  // regroupés dans SECONDARY_NAV, sinon le hub n'a rien allégé du tout.
  it('la navigation secondaire d App.tsx compte au plus 6 entrées', async () => {
    const { readFileSync } = await import('node:fs');
    const { resolve } = await import('node:path');
    const src = readFileSync(resolve(__dirname, '../../App.tsx'), 'utf8');
    const bloc = src.slice(src.indexOf('const SECONDARY_NAV'), src.indexOf('const SECONDARY_NAV') + 1200);
    const entrees = (bloc.slice(0, bloc.indexOf('];')).match(/\{ tab: '/g) ?? []).length;
    expect(entrees).toBeGreaterThan(0);
    expect(entrees).toBeLessThanOrEqual(6);
    for (const tab of TRAINING_ENTRIES.map((e) => e.tab)) {
      expect(bloc.slice(0, bloc.indexOf('];')), `${tab} encore dans le menu`).not.toContain(`tab: '${tab}'`);
    }
  });
});
