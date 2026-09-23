// okachaProgress.test.ts — contrats de la progression « بنك الحفظ ».
// JSON corrompu → état vide (jamais un crash) ; round-trip lecture/notation ;
// XP miroir exact de handleRateCard (App.tsx : easy 15 / good 10 / hard 5 / again 2).

import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  loadOkachaProgress,
  toggleUniteLue,
  noterPoint,
  totalNotations,
  notationsUnite,
  XP_PAR_NOTE,
} from './okachaProgress';

// Mock localStorage minimal (même patron que examLog.test.ts).
class MockStorage {
  private map = new Map<string, string>();
  get length() { return this.map.size; }
  key(i: number) { return [...this.map.keys()][i] ?? null; }
  getItem(k: string) { return this.map.get(k) ?? null; }
  setItem(k: string, v: string) { this.map.set(k, String(v)); }
  removeItem(k: string) { this.map.delete(k); }
  clear() { this.map.clear(); }
}

beforeEach(() => {
  vi.stubGlobal('localStorage', new MockStorage());
  return () => vi.unstubAllGlobals();
});

describe('okachaProgress — progression du بنك الحفظ', () => {
  it('clé absente → état vide, jamais de crash', () => {
    expect(loadOkachaProgress()).toEqual({ lus: [], evals: {} });
  });

  it('JSON corrompu → état vide', () => {
    localStorage.setItem('kunz_okacha_progress_v1', '{pas du json');
    expect(loadOkachaProgress()).toEqual({ lus: [], evals: {} });
  });

  it('forme invalide (lus pas un tableau) → état vide', () => {
    localStorage.setItem('kunz_okacha_progress_v1', JSON.stringify({ lus: 'nan', evals: {} }));
    expect(loadOkachaProgress()).toEqual({ lus: [], evals: {} });
  });

  it('round-trip : marquer une unité lue puis la démarquer', () => {
    let p = loadOkachaProgress();
    p = toggleUniteLue(p, 'd1u1');
    expect(loadOkachaProgress().lus).toEqual(['d1u1']);
    p = toggleUniteLue(p, 'd1u1');
    expect(loadOkachaProgress().lus).toEqual([]);
    expect(p.lus).toEqual([]); // l'état retourné est déjà le nouvel état
  });

  it('round-trip : noter un point incrémente son compteur', () => {
    let p = loadOkachaProgress();
    p = noterPoint(p, 'd1u4', 12, 'good');
    p = noterPoint(p, 'd1u4', 12, 'good');
    p = noterPoint(p, 'd1u4', 12, 'again');
    const reloaded = loadOkachaProgress();
    expect(reloaded.evals['d1u4#12']).toEqual({ again: 1, hard: 0, good: 2, easy: 0 });
    expect(totalNotations(reloaded)).toBe(3);
    expect(notationsUnite(reloaded, 'd1u4')).toBe(3);
    expect(notationsUnite(reloaded, 'd2u1')).toBe(0);
  });

  it('XP miroir de handleRateCard : easy 15 / good 10 / hard 5 / again 2', () => {
    expect(XP_PAR_NOTE.easy).toBe(15);
    expect(XP_PAR_NOTE.good).toBe(10);
    expect(XP_PAR_NOTE.hard).toBe(5);
    expect(XP_PAR_NOTE.again).toBe(2);
  });

  it('compteurs corrompus ignorés, compteurs valides conservés', () => {
    localStorage.setItem(
      'kunz_okacha_progress_v1',
      JSON.stringify({
        lus: ['d1u1', 42, null],
        evals: {
          'd1u1#0': { again: 1, hard: 0, good: 0, easy: 0 },
          'd1u1#1': { bogus: true },
        },
      }),
    );
    const p = loadOkachaProgress();
    expect(p.lus).toEqual(['d1u1']);
    expect(p.evals['d1u1#0']).toEqual({ again: 1, hard: 0, good: 0, easy: 0 });
    expect(p.evals['d1u1#1']).toBeUndefined();
  });
});