// consigneEntreeHub.test.tsx — LE HUB PROJETTE, IL NE DÉCIDE PAS.
//
// Patch « consigne d'entrée » (2026-11-04). Ces tests montent le VRAI hub,
// déposent un VRAI état assemblé par le Capitaine, cliquent sur la carte et
// vérifient ce qui s'affiche. Aucun `readFileSync`, aucun verrou de chaîne
// source : un test qui passe prouve un comportement élève.

import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import TrainingHubView from '../TrainingHubView';
import { TRAINING_ENTRIES } from '../../data/trainingHub';
import { CAPITAINE_IDENTITE_AR } from '../../data/capitaineIdentite';
import { assemblerEtatEleve, type EtatEleve } from '../../lib/etatEleve';
import { fournirEtatEleve, reinitialiserEtatEleve } from '../../lib/etatEleveRuntime';
import { markDone, resetParcours } from '../../lib/parcours/parcoursProgress';
import { PARCOURS_FLAT } from '../../lib/parcours/parcoursPath';

const MAINTENANT = new Date(2026, 10, 4, 10, 0, 0);

interface Options {
  chargee?: boolean;
  epreuve?: boolean;
  bandeauPremiereVisite?: boolean;
  unitePrioritaire?: string | null;
}

function etatDeTest(o: Options = {}): EtatEleve {
  return assemblerEtatEleve({
    daily: undefined,
    maintenant: MAINTENANT,
    rubrique: 'training',
    rubriqueAUnConseil: true,
    rubriquesDejaVues: o.bandeauPremiereVisite ? [] : ['training'],
    epreuveEnCours: o.epreuve === true,
    competence: o.chargee === false
      ? null
      : { verdicts: {}, faibles: [], unitePrioritaire: o.unitePrioritaire ?? null },
    erreurs: { total: 0, dominante: null, capital: { fermees: 0, rouvertes: 0, total: 0 } },
  });
}

/** Progression RÉELLE : n unités complètes (leçons + جسر), pas une estimation. */
function ouvrirUnites(n: number): void {
  resetParcours();
  const ids = [...new Set(PARCOURS_FLAT.map((i) => i.unitId))].sort((a, b) => a - b);
  for (const uid of ids.slice(0, n)) {
    for (const item of PARCOURS_FLAT.filter((i) => i.unitId === uid)) markDone(item.id);
  }
}

afterEach(() => {
  cleanup();
  reinitialiserEtatEleve();
  localStorage.clear();
});

describe('hub — la consigne du Capitaine est visible', () => {
  it('état chargé ⇒ UNE consigne signée, UN geste, UN « لماذا », UNE carte mise en avant', () => {
    ouvrirUnites(2);
    fournirEtatEleve(etatDeTest());
    render(<TrainingHubView onOpen={() => {}} />);

    const bloc = screen.getByTestId('consigne-entree-capitaine');
    expect(bloc.textContent).toContain(CAPITAINE_IDENTITE_AR);
    expect(bloc.textContent).toContain('ابدأ من هنا');
    expect(screen.getByTestId('consigne-entree-geste').textContent!.trim().length).toBeGreaterThan(5);
    expect(screen.getByTestId('consigne-entree-pourquoi').textContent).toContain('لماذا');

    // Exactement UN badge, sur la SEULE carte décidée par le Capitaine.
    const badges = screen.getAllByTestId('recommande-aujourdhui');
    expect(badges).toHaveLength(1);
    expect(badges[0].closest('[data-testid^="hub-"]')!.getAttribute('data-testid')).toBe('hub-situations');
  });

  it('le clic sur la carte recommandée ouvre le module désigné (comportement réel)', async () => {
    ouvrirUnites(2);
    fournirEtatEleve(etatDeTest());
    const onOpen = vi.fn();
    const user = userEvent.setup();
    render(<TrainingHubView onOpen={onOpen} />);

    await user.click(screen.getByTestId('recommande-aujourdhui').closest('button')!);
    expect(onOpen).toHaveBeenCalledTimes(1);
    expect(onOpen).toHaveBeenCalledWith('situations');
  });

  it('unité faible ⇒ la recommandation suit l état, pas un ordre fixe', () => {
    ouvrirUnites(2);
    fournirEtatEleve(etatDeTest({ unitePrioritaire: 'المناعة' }));
    render(<TrainingHubView onOpen={() => {}} />);

    expect(screen.getByTestId('consigne-entree-pourquoi').textContent).toContain('المناعة');
    expect(screen.getByTestId('recommande-aujourdhui').closest('[data-testid^="hub-"]')!.getAttribute('data-testid')).toBe('hub-situations');
  });

  it('zéro unité ⇒ workshop recommandé, jamais une carte cadenassée', () => {
    ouvrirUnites(0);
    fournirEtatEleve(etatDeTest());
    render(<TrainingHubView onOpen={() => {}} />);

    expect(screen.getByTestId('recommande-aujourdhui').closest('[data-testid^="hub-"]')!.getAttribute('data-testid')).toBe('hub-workshop');
    expect(screen.getByTestId('verrou-bootcamp')).toBeTruthy();
    expect(screen.getByTestId('hub-bootcamp').textContent).not.toContain('موصى به اليوم');
  });
});

describe('hub — les silences, sans recommandation inventée', () => {
  it('aucun état déposé ⇒ ni consigne ni badge, et les 7 cartes restent là', () => {
    ouvrirUnites(0);
    reinitialiserEtatEleve();
    render(<TrainingHubView onOpen={() => {}} />);

    expect(screen.queryByTestId('consigne-entree-capitaine')).toBeNull();
    expect(screen.queryByTestId('recommande-aujourdhui')).toBeNull();
    for (const e of TRAINING_ENTRIES) {
      expect(screen.getByTestId(`hub-${e.tab}`), e.tab).toBeTruthy();
    }
  });

  it('compétence non chargée ⇒ silence', () => {
    ouvrirUnites(2);
    fournirEtatEleve(etatDeTest({ chargee: false }));
    render(<TrainingHubView onOpen={() => {}} />);
    expect(screen.queryByTestId('consigne-entree-capitaine')).toBeNull();
  });

  it('épreuve en cours ⇒ silence absolu', () => {
    ouvrirUnites(2);
    fournirEtatEleve(etatDeTest({ epreuve: true }));
    render(<TrainingHubView onOpen={() => {}} />);
    expect(screen.queryByTestId('consigne-entree-capitaine')).toBeNull();
  });

  it('1ʳᵉ visite ⇒ la consigne nomme le module, SANS second personnage en grand', () => {
    ouvrirUnites(2);
    fournirEtatEleve(etatDeTest({ bandeauPremiereVisite: true }));
    render(<TrainingHubView onOpen={() => {}} />);

    const bloc = screen.getByTestId('consigne-entree-capitaine');
    expect(bloc.textContent).toContain('ابدأ من هنا');
    // « une seule voix » : le visage du Capitaine n'existe QUE dans
    // BandeauConseilRubrique. Ici le guide SIGNE sa prescription, sans image.
    expect(bloc.textContent).toContain(CAPITAINE_IDENTITE_AR);
    expect(bloc.querySelector('img')).toBeNull();
    expect(screen.getAllByTestId('recommande-aujourdhui')).toHaveLength(1);
  });
});

describe('hub — aucune porte ajoutée', () => {
  it('le nombre de cartes reste strictement celui de TRAINING_ENTRIES', () => {
    ouvrirUnites(2);
    fournirEtatEleve(etatDeTest());
    const { container } = render(<TrainingHubView onOpen={() => {}} />);
    const cartes = container.querySelectorAll('[data-testid^="hub-"]');
    // `onBackToHome` absent ⇒ pas de `hub-retour` ; le badge n'a PAS de
    // préfixe `hub-` : il ne peut donc pas se faire passer pour une 8ᵉ porte.
    expect(cartes).toHaveLength(TRAINING_ENTRIES.length);
    expect(TRAINING_ENTRIES.length).toBeLessThanOrEqual(8);
  });
});
