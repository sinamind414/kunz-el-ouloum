// ReviewHubView.test.tsx — verrous du hub « المراجعة » (2026-10-11).
//
// Ce hub est la 5e rubrique principale. Il a UN objectif : consolider. Les
// tests figent donc : (1) chaque espace de consolidation reste atteignable en
// un clic, (2) le hub reste lisible, et (3) AUCUN espace n'existe dans les
// deux hubs à la fois — c'est la règle « un emplacement principal unique ».

import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ReviewHubView from '../ReviewHubView';
import { REVISION_ENTRIES, REVISION_ENTRY_COUNT } from '../../data/revisionHub';
import { TRAINING_ENTRIES } from '../../data/trainingHub';

afterEach(cleanup);

describe('hub de révision — contenu', () => {
  it('affiche une carte par espace de consolidation', () => {
    render(<ReviewHubView onOpen={() => {}} />);
    for (const e of REVISION_ENTRIES) {
      expect(screen.getByTestId(`revhub-${e.tab}`), e.tab).toBeTruthy();
    }
  });

  it('reste lisible : au plus 5 cartes, au moins 3', () => {
    expect(REVISION_ENTRY_COUNT).toBeLessThanOrEqual(5);
    expect(REVISION_ENTRY_COUNT).toBeGreaterThanOrEqual(3);
  });

  it('chaque carte annonce un geste et une description utile', () => {
    render(<ReviewHubView onOpen={() => {}} />);
    for (const e of REVISION_ENTRIES) {
      const carte = screen.getByTestId(`revhub-${e.tab}`);
      expect(carte.textContent, e.tab).toContain(e.titleAr);
      expect(carte.textContent, e.tab).toContain(e.gestureAr);
      expect(e.descriptionAr.length, e.tab).toBeGreaterThanOrEqual(40);
    }
  });

  it('les onglets cibles sont uniques', () => {
    const tabs = REVISION_ENTRIES.map((e) => e.tab);
    expect(new Set(tabs).size).toBe(tabs.length);
  });

  it('réunit les trois gestes de consolidation', () => {
    const tabs = REVISION_ENTRIES.map((e) => e.tab);
    expect(tabs).toContain('review');
    expect(tabs).toContain('plan');
    expect(tabs).toContain('schemas');
  });
});

describe('hub de révision — navigation', () => {
  it('un clic ouvre l onglet correspondant', async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    render(<ReviewHubView onOpen={onOpen} />);

    await user.click(screen.getByTestId('revhub-plan'));
    expect(onOpen).toHaveBeenCalledWith('plan');

    await user.click(screen.getByTestId('revhub-review'));
    expect(onOpen).toHaveBeenLastCalledWith('review');
    expect(onOpen).toHaveBeenCalledTimes(2);
  });

  it('chaque carte transmet exactement son propre onglet', async () => {
    const user = userEvent.setup();
    for (const e of REVISION_ENTRIES) {
      const onOpen = vi.fn();
      render(<ReviewHubView onOpen={onOpen} />);
      await user.click(screen.getByTestId(`revhub-${e.tab}`));
      expect(onOpen, e.tab).toHaveBeenCalledWith(e.tab);
      cleanup();
    }
  });

  it('le retour à l accueil n est rendu que s il est fourni', () => {
    const { rerender } = render(<ReviewHubView onOpen={() => {}} />);
    expect(screen.queryByTestId('revhub-retour')).toBeNull();
    rerender(<ReviewHubView onOpen={() => {}} onBackToHome={() => {}} />);
    expect(screen.getByTestId('revhub-retour')).toBeTruthy();
  });
});

describe('hub de révision — pas de doublon avec le hub d entraînement', () => {
  // Règle de structuration : un espace = un objectif = une seule porte. Si un
  // onglet apparaissait dans les deux hubs, l'élève aurait deux entrées pour
  // la même action — exactement ce que la restructuration retire.
  it('aucun espace n est partagé entre les deux hubs', () => {
    const revision = REVISION_ENTRIES.map((e) => e.tab);
    const training = TRAINING_ENTRIES.map((e) => e.tab);
    for (const tab of revision) {
      expect(training, `${tab} est dans les DEUX hubs`).not.toContain(tab);
    }
  });

  it('chaque entrée pointe vers un onglet réel de l application', async () => {
    const { readFileSync } = await import('node:fs');
    const { resolve } = await import('node:path');
    const src = readFileSync(resolve(__dirname, '../../App.tsx'), 'utf8');
    for (const e of REVISION_ENTRIES) {
      expect(src, `${e.tab} n est monté nulle part`).toContain(`currentTab === '${e.tab}'`);
    }
  });
});
