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
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import TrainingHubView from '../TrainingHubView';
import { TRAINING_ENTRIES, TRAINING_ENTRY_COUNT } from '../../data/trainingHub';
import { resetParcours, markDone } from '../../lib/parcours/parcoursProgress';
import { PARCOURS_FLAT } from '../../lib/parcours/parcoursPath';

afterEach(cleanup);

/** Phase 2 (GO 2026-10-16) : تحدي البكالوريا est cadenassée tant que 2 unités
 *  complètes n'existent pas. Les verrous « gesture/onglet » parcourent TOUTES
 *  les cartes : ils valident donc d'abord 2 unités RÉELLES (leçons + جسر)
 *  pour que chaque carte soit ouverte — le cadenas en rituel, lui, est
 *  prouvé par cadenasHubs.test.tsx. */
function ouvrirToutesLesCartes(): void {
  localStorage.clear();
  resetParcours();
  const unitIds = [...new Set(PARCOURS_FLAT.map((i) => i.unitId))].sort((a, b) => a - b);
  for (const uid of unitIds.slice(0, 2)) {
    for (const item of PARCOURS_FLAT.filter((i) => i.unitId === uid)) markDone(item.id);
  }
}

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
    ouvrirToutesLesCartes();
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

  it('reflète la restructuration du 2026-10-12 : examens entrés, apprentissage sorti', () => {
    const tabs = TRAINING_ENTRIES.map((e) => e.tab);
    // Les examens ont quitté l'écran 1 de « الدروس » (QCM du livre + tests bac) :
    // produire une réponse = s'entraîner. Porte UNIQUE, les modes restent dans
    // LessonsView (sous-écran examens).
    expect(tabs).toContain('examens');
    expect(tabs).not.toContain('qcm');
    expect(tabs).not.toContain('bac');
  });

  it('reflète le 2026-10-16 : « مفتاح المنهجية » PROMU 6ᵉ portail visible', () => {
    const tabs = TRAINING_ENTRIES.map((e) => e.tab);
    // Ce qui PRODUIT une réponse reste ici.
    expect(tabs).toContain('situations');
    expect(tabs).toContain('bootcamp');
    // Phase 2, Commit C (GO utilisateur) : la méthode N'EST PLUS une carte du
    // hub — elle a sa PROPRE porte visible dans la barre principale (plainte
    // expert : l'élève ne retrouvait pas مفتاح المنهجية). La règle « une seule
    // porte par fonctionnalité » (PortesUniques) l'exige : hub + barre = 2
    // portes interdites.
    expect(tabs).not.toContain('methodology');
    expect(tabs).not.toContain('schemas');
    expect(tabs).not.toContain('plan');
    // La porte barre existe, entre التمارين et المراجعة, et « أنا » ferme la barre.
    const src = readFileSync(resolve(__dirname, '../../App.tsx'), 'utf8');
    const i = src.indexOf('const PRIMARY_NAV');
    const bloc = src.slice(i, src.indexOf('];', i));
    const onglets = [...bloc.matchAll(/\{ tab: '([a-z]+)'/g)].map((m) => m[1]);
    expect(onglets).toEqual(['home', 'lesson', 'training', 'methodology', 'reviser', 'moi']);
    // Et la vue reste bien montée pour son onglet (inchangé).
    expect(src).toContain("currentTab === 'methodology'");
  });
});

describe('hub d entraînement — navigation', () => {
  it('un clic ouvre l onglet correspondant', async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    render(<TrainingHubView onOpen={onOpen} />);

    await user.click(screen.getByTestId('hub-bacideas'));
    expect(onOpen).toHaveBeenCalledWith('bacideas');

    await user.click(screen.getByTestId('hub-situations'));
    expect(onOpen).toHaveBeenLastCalledWith('situations');
    expect(onOpen).toHaveBeenCalledTimes(2);
  });

  it('chaque carte transmet exactement son propre onglet', async () => {
    const user = userEvent.setup();
    ouvrirToutesLesCartes();
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
  it('la navigation secondaire d App.tsx ne recense AUCUNE entrée du hub', async () => {
    const { readFileSync } = await import('node:fs');
    const { resolve } = await import('node:path');
    const src = readFileSync(resolve(__dirname, '../../App.tsx'), 'utf8');
    const bloc = src.slice(src.indexOf('const SECONDARY_NAV'), src.indexOf('const SECONDARY_NAV') + 1200);
    const entrees = (bloc.slice(0, bloc.indexOf('];')).match(/\{ tab: '/g) ?? []).length;
    // 2026-10-12 : le menu « المزيد » est VIDE (focus → Déclic, mindmap →
    // الدرس). Zéro entrée est donc une valeur normale, plus un échec — le
    // garde-fou qui compte vraiment est la boucle ci-dessous.
    expect(entrees).toBeGreaterThanOrEqual(0);
    expect(entrees).toBeLessThanOrEqual(6);
    for (const tab of TRAINING_ENTRIES.map((e) => e.tab)) {
      expect(bloc.slice(0, bloc.indexOf('];')), `${tab} encore dans le menu`).not.toContain(`tab: '${tab}'`);
    }
  });
});
