// parcoursProgress.test.ts — verrouillage linéaire, quota, rappels J+14.
// Convention repo : pas de @testing-library/jest-dom. localStorage nettoyé.

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  PARCOURS_FLAT,
} from './parcoursPath';
import {
  REVIEW_DELAY_DAYS,
  SEUIL_FRAGILE,
  allowance,
  domainProgress,
  etatParDefaut,
  itemStatus,
  loadParcours,
  markDone,
  markStarted,
  parcoursProgress,
  resetParcours,
  saveParcours,
  todayKey,
  todaysCompletions,
  unitProgress,
} from './parcoursProgress';

const STORAGE_KEY = 'kunz_parcours_v1';

function ajouterJours(iso: string, jours: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(y, m - 1, d + jours);
  return todayKey(dt);
}

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  localStorage.clear();
});

describe('parcoursProgress — stockage', () => {
  it('retourne un état vide par défaut', () => {
    const s = loadParcours();
    expect(s.done).toEqual({});
    expect(s.reviews).toEqual({});
    expect(s.current).toBeUndefined();
    expect(s.extraAllowance).toBe(0);
  });

  it('résiste à un JSON corrompu (best-effort)', () => {
    localStorage.setItem(STORAGE_KEY, '{pas du json');
    expect(loadParcours()).toEqual(etatParDefaut());
  });

  it('persiste et relit l\'état', () => {
    saveParcours({ ...etatParDefaut(), extraAllowance: 2 });
    expect(loadParcours().extraAllowance).toBe(2);
  });

  it('ignore un état partiellement invalide', () => {
    saveParcours({
      done: 'casse' as unknown as Record<string, never>,
      current: 42 as unknown as string,
      reviews: null as unknown as Record<string, never>,
      extraAllowance: 'x' as unknown as number,
    });
    const s = loadParcours();
    expect(s.done).toEqual({});
    expect(s.current).toBeUndefined();
    expect(s.reviews).toEqual({});
    expect(s.extraAllowance).toBe(0);
  });
});

describe('parcoursProgress — verrouillage linéaire', () => {
  it('seul le premier item est disponible au départ', () => {
    const s = loadParcours();
    expect(itemStatus(s, PARCOURS_FLAT[0].id)).toBe('available');
    expect(itemStatus(s, PARCOURS_FLAT[1].id)).toBe('locked');
    expect(itemStatus(s, PARCOURS_FLAT[PARCOURS_FLAT.length - 1].id)).toBe('locked');
  });

  it('marque l\'item commencé comme courant', () => {
    markStarted(PARCOURS_FLAT[0].id);
    const s = loadParcours();
    expect(s.current).toBe(PARCOURS_FLAT[0].id);
    expect(itemStatus(s, PARCOURS_FLAT[0].id)).toBe('current');
  });

  it(' valide un item et déverrouille le suivant', () => {
    markDone(PARCOURS_FLAT[0].id);
    const s = loadParcours();
    expect(s.done[PARCOURS_FLAT[0].id]).toBeTruthy();
    expect(itemStatus(s, PARCOURS_FLAT[0].id)).toBe('done');
    expect(itemStatus(s, PARCOURS_FLAT[1].id)).toBe('available');
    expect(itemStatus(s, PARCOURS_FLAT[2].id)).toBe('locked');
  });

  it('libère le drapeau courant après validation', () => {
    markStarted(PARCOURS_FLAT[0].id);
    expect(loadParcours().current).toBe(PARCOURS_FLAT[0].id);
    markDone(PARCOURS_FLAT[0].id);
    expect(loadParcours().current).toBeUndefined();
  });

  it('renvoie locked pour un id inconnu', () => {
    expect(itemStatus(loadParcours(), 'parcours:u999:jalon')).toBe('locked');
  });
});

describe('parcoursProgress — quota du jour', () => {
  it('vaut 1 + extraAllowance', () => {
    expect(allowance(etatParDefaut())).toBe(1);
    expect(allowance({ ...etatParDefaut(), extraAllowance: 3 })).toBe(4);
    expect(allowance({ ...etatParDefaut(), extraAllowance: -5 })).toBe(1);
  });

  it('compte les validations du jour', () => {
    markDone(PARCOURS_FLAT[0].id);
    markDone(PARCOURS_FLAT[1].id);
    expect(todaysCompletions(loadParcours())).toBe(2);
  });

  it('ne compte pas une validation antérieure', () => {
    const hier = ajouterJours(todayKey(), -1);
    saveParcours({
      ...etatParDefaut(),
      done: { [PARCOURS_FLAT[0].id]: { at: hier, fragile: false } },
    });
    expect(todaysCompletions(loadParcours())).toBe(0);
  });
});

describe('parcoursProgress — rappels J+14 et fragilité', () => {
  it('planifie la révision à J+14 après validation', () => {
    markDone(PARCOURS_FLAT[0].id);
    const attendu = ajouterJours(todayKey(), REVIEW_DELAY_DAYS);
    expect(loadParcours().reviews[PARCOURS_FLAT[0].id]).toBe(attendu);
  });

  it('marque fragile un جسر noté sous le seuil', () => {
    markDone(PARCOURS_FLAT[0].id, 0.2);
    expect(loadParcours().done[PARCOURS_FLAT[0].id]!.fragile).toBe(true);
    expect(loadParcours().done[PARCOURS_FLAT[0].id]!.score).toBe(0.2);
  });

  it('laisse solide une note au-dessus du seuil', () => {
    markDone(PARCOURS_FLAT[0].id, SEUIL_FRAGILE);
    expect(loadParcours().done[PARCOURS_FLAT[0].id]!.fragile).toBe(false);
  });

  it('garde la première date de validation en cas de re-validation', () => {
    const hier = ajouterJours(todayKey(), -3);
    saveParcours({
      ...etatParDefaut(),
      done: { [PARCOURS_FLAT[0].id]: { at: hier, fragile: false } },
    });
    markDone(PARCOURS_FLAT[0].id, 0.9);
    expect(loadParcours().done[PARCOURS_FLAT[0].id]!.at).toBe(hier);
  });
});

describe('parcoursProgress — compteurs', () => {
  it('calcule l\'avancement par unité, domaine et global', () => {
    markDone(PARCOURS_FLAT[0].id);
    const s = loadParcours();

    const u1 = unitProgress(s, 1);
    expect(u1.done).toBe(1);
    expect(u1.total).toBeGreaterThan(1);

    const d1 = domainProgress(s, 1);
    expect(d1.done).toBe(1);
    expect(d1.total).toBeGreaterThan(1);

    const g = parcoursProgress(s);
    expect(g.done).toBe(1);
    expect(g.total).toBe(PARCOURS_FLAT.length);
  });

  it('renvoie 0 pour une unité/domaine inconnu', () => {
    expect(unitProgress(loadParcours(), 999)).toEqual({ done: 0, total: 0 });
    expect(domainProgress(loadParcours(), 999)).toEqual({ done: 0, total: 0 });
  });

  it('réinitialise tout', () => {
    markDone(PARCOURS_FLAT[0].id);
    resetParcours();
    expect(loadParcours()).toEqual(etatParDefaut());
  });
});
