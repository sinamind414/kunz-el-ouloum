// nbaEngine.test.ts — priorité REPRISE > RAPPEL > QUOTA > NOUVEAU > REPOS.

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { PARCOURS_FLAT } from './parcoursPath';
import {
  allowance,
  etatParDefaut,
  loadParcours,
  markDone,
  markStarted,
  saveParcours,
  todayKey,
  todaysCompletions,
} from './parcoursProgress';
import { nbaEyebrow, nextBestAction } from './nbaEngine';

function ajouterJours(iso: string, jours: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  return todayKey(new Date(y, m - 1, d + jours));
}

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  localStorage.clear();
});

describe('nbaEngine — NOUVEAU', () => {
  it('propose le premier item non terminé', () => {
    const action = nextBestAction();
    expect(action.type).toBe('new');
    if (action.type !== 'new') return;
    expect(action.item.id).toBe(PARCOURS_FLAT[0].id);
  });

  it('avance au prochain item après validation, dans la limite du quota', () => {
    markDone(PARCOURS_FLAT[0].id);
    // allowance = 1 : la tâche du jour est consommée → repos.
    expect(nextBestAction().type).toBe('rest');
    // allowance = 2 : un nouvel item redevient disponible.
    saveParcours({ ...loadParcours(), extraAllowance: 1 });
    const action = nextBestAction();
    expect(action.type).toBe('new');
    if (action.type !== 'new') return;
    expect(action.item.id).toBe(PARCOURS_FLAT[1].id);
  });
});

describe('nbaEngine — REPRISE prioritaire', () => {
  it('propose la reprise avant un nouvel item', () => {
    markStarted(PARCOURS_FLAT[1].id); // commencé mais pas validé
    markDone(PARCOURS_FLAT[0].id); // déverrouille l'item 1 ET valide le 0
    const action = nextBestAction();
    expect(action.type).toBe('resume');
    if (action.type !== 'resume') return;
    expect(action.item.id).toBe(PARCOURS_FLAT[1].id);
  });

  it('ignore un current déjà validé (cohérence)', () => {
    markStarted(PARCOURS_FLAT[0].id);
    markDone(PARCOURS_FLAT[0].id);
    expect(loadParcours().current).toBeUndefined();
    // Plus rien à reprendre : la NBA ne propose jamais 'resume'.
    expect(nextBestAction().type).not.toBe('resume');
  });
});

describe('nbaEngine — QUOTA journalier', () => {
  it('prescrit le repos quand l\'allowance du jour est atteinte', () => {
    markDone(PARCOURS_FLAT[0].id);
    // 1 validation, allowance = 1 → quota atteint avant le prochain nouvel item.
    expect(todaysCompletions(loadParcours())).toBe(allowance(loadParcours()));
    const action = nextBestAction();
    expect(action.type).toBe('rest');
    if (action.type !== 'rest') return;
    expect(action.reason).toBe('quota');
  });

  it('laisse place à un nouvel item si extraAllowance augmente', () => {
    markDone(PARCOURS_FLAT[0].id);
    saveParcours({ ...loadParcours(), extraAllowance: 1 });
    const action = nextBestAction();
    expect(action.type).toBe('new');
  });

  it('ne prescrit jamais le repos quota si rien n\'est validé', () => {
    const action = nextBestAction();
    expect(action.type).not.toBe('rest');
  });
});

describe('nbaEngine — RAPPEL J+14', () => {
  it('propose la révision d\'un item dont l\'échéance est atteinte', () => {
    const hier = ajouterJours(todayKey(), -15);
    saveParcours({
      ...etatParDefaut(),
      done: { [PARCOURS_FLAT[0].id]: { at: hier, fragile: false } },
      reviews: { [PARCOURS_FLAT[0].id]: ajouterJours(hier, 14) }, // échu
    });
    const action = nextBestAction();
    expect(action.type).toBe('review');
    if (action.type !== 'review') return;
    expect(action.item.id).toBe(PARCOURS_FLAT[0].id);
    expect(action.due).toBe(ajouterJours(hier, 14));
  });

  it('ignore une révision non échue', () => {
    const demain = ajouterJours(todayKey(), 1);
    saveParcours({
      ...etatParDefaut(),
      done: { [PARCOURS_FLAT[0].id]: { at: todayKey(), fragile: false } },
      reviews: { [PARCOURS_FLAT[0].id]: demain },
    });
    expect(nextBestAction().type).toBe('rest');
  });

  it('classe les rappels du plus ancien au plus récent', () => {
    const base = ajouterJours(todayKey(), -20);
    saveParcours({
      ...etatParDefaut(),
      done: {
        [PARCOURS_FLAT[0].id]: { at: base, fragile: false },
        [PARCOURS_FLAT[1].id]: { at: base, fragile: false },
      },
      reviews: {
        [PARCOURS_FLAT[0].id]: ajouterJours(base, 14), // -6 : ancien
        [PARCOURS_FLAT[1].id]: ajouterJours(base, 18), // -2 : récent
      },
    });
    const action = nextBestAction();
    expect(action.type).toBe('review');
    if (action.type !== 'review') return;
    expect(action.item.id).toBe(PARCOURS_FLAT[0].id);
  });

  it('priorise la reprise sur le rappel', () => {
    const base = ajouterJours(todayKey(), -20);
    saveParcours({
      ...etatParDefaut(),
      current: PARCOURS_FLAT[5].id,
      done: { [PARCOURS_FLAT[0].id]: { at: base, fragile: false } },
      reviews: { [PARCOURS_FLAT[0].id]: ajouterJours(base, 14) },
    });
    expect(nextBestAction().type).toBe('resume');
  });
});

describe('nbaEngine — REPOS final', () => {
  it('prescrit le repos quand tout le chemin est terminé', () => {
    const done: Record<string, { at: string; fragile: boolean }> = {};
    for (const item of PARCOURS_FLAT) {
      done[item.id] = { at: todayKey(), fragile: false };
    }
    saveParcours({ ...etatParDefaut(), done });
    const action = nextBestAction();
    expect(action.type).toBe('rest');
    if (action.type !== 'rest') return;
    expect(action.reason).toBe('all-done');
  });
});

describe('nbaEngine — libellés', () => {
  it('fournit un eyebrow arabe pour chaque type d\'action', () => {
    expect(nbaEyebrow({ type: 'new', item: PARCOURS_FLAT[0] }).length).toBeGreaterThan(0);
    expect(nbaEyebrow({ type: 'resume', item: PARCOURS_FLAT[0] }).length).toBeGreaterThan(0);
    expect(nbaEyebrow({ type: 'review', item: PARCOURS_FLAT[0], due: todayKey() }).length).toBeGreaterThan(0);
    expect(nbaEyebrow({ type: 'rest', reason: 'quota' }).length).toBeGreaterThan(0);
    expect(nbaEyebrow({ type: 'rest', reason: 'all-done' }).length).toBeGreaterThan(0);
  });
});
