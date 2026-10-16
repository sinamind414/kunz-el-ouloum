// cadenasHubs.test.tsx — Verrou Commit B, Phase 2 (GO utilisateur 2026-10-16).
//
// GO des 3 recommandations : « les QCM/leçons de chaque unité s'ouvrent avec
// l'unité ; مفتاح المنهجية et المرشد toujours accessibles (outils
// transversaux) ; تحدي البكالوريا et tests bac se débloquent domaine par
// domaine ».
//
// Règle implémentée ici (seuil éditorial 2026-10-16, ajustable) :
//   تحدي البكالوريا = simulation d'examen → débloquée quand AU MOINS
//   2 UNITÉS COMPLÈTES (leçons + جسر) sont validées dans le parcours.
//   Les outils transversaux (مفتاح, ورشة, أنميشن, تدوين, وضعيات, أفكار,
//   examens hub) restent libres dès le premier jour.
//
// Ce verrou lit l'état RÉEL du parcours (localStorage via markDone), pas un
// mock : c'est le même chemin que l'application.

import { cleanup, render, screen, fireEvent } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import TrainingHubView from '../TrainingHubView';
import { resetParcours, markDone } from '../../lib/parcours/parcoursProgress';
import { PARCOURS_FLAT } from '../../lib/parcours/parcoursPath';

afterEach(cleanup);

/** Valide TOUT le contenu (leçons + جسر) des n premières unités. */
function completerUnites(n: number): void {
  const unitIds = [...new Set(PARCOURS_FLAT.map((i) => i.unitId))].sort((a, b) => a - b);
  for (const uid of unitIds.slice(0, n)) {
    for (const item of PARCOURS_FLAT.filter((i) => i.unitId === uid)) markDone(item.id);
  }
}

describe('Commit B — « تحدي البكالوريا » se débloque par la progression réelle', () => {
  beforeEach(() => {
    localStorage.clear();
    resetParcours();
  });

  it('le défi est cadenassé tant qu’aucune unité n’est complète', () => {
    const onOpen = vi.fn();
    render(<TrainingHubView onOpen={onOpen} />);
    expect(screen.getByTestId('verrou-bootcamp')).toBeTruthy();
    fireEvent.click(screen.getByTestId('hub-bootcamp'));
    expect(onOpen, 'un cadenas qui ouvre la rubrique n est pas un cadenas').not.toHaveBeenCalled();
  });

  it('l’élève comprend la CONDITION d’ouverture (pas un cadenas muet)', () => {
    render(<TrainingHubView onOpen={() => {}} />);
    const verrou = screen.getByTestId('verrou-bootcamp');
    // La formule d'ouverture = « تُفْتَح بعد إتمام … » + une durée en unités
    // (وحدتين au duel arabe correct pour le seuil 2).
    expect(verrou.textContent).toContain('تُفْتَح بعد إتمام');
    expect(verrou.textContent).toContain('وحدتين');
  });

  it('deux unités complètes ouvrent le défi (clic → navigation)', () => {
    completerUnites(2);
    const onOpen = vi.fn();
    render(<TrainingHubView onOpen={onOpen} />);
    expect(screen.queryByTestId('verrou-bootcamp')).toBeNull();
    fireEvent.click(screen.getByTestId('hub-bootcamp'));
    expect(onOpen).toHaveBeenCalledWith('bootcamp');
  });

  it('les outils transversaux restent LIBRES dès le premier jour', () => {
    const onOpen = vi.fn();
    render(<TrainingHubView onOpen={onOpen} />);
    // NB : « مفتاح المنهجية » a quitté le hub le 2026-10-16 (Commit C) —
    // 6ᵉ portail visible de la barre, toujours libre d'accès (outils
    // transversaux OUVERTS tôt, GO des recommandations).
    for (const tab of ['examens', 'bacideas', 'workshop', 'situations', 'animations', 'tadwin']) {
      fireEvent.click(screen.getByTestId(`hub-${tab}`));
      expect(onOpen).toHaveBeenCalledWith(tab);
    }
  });
});
