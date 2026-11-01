// flashcardsSrs.test.ts — verrouille le SM-2 réel (transition, persistance,
// ordre du deck). Né de l'audit 2026-10 : le claim « خوارزمية تكرار متباعد »
// était mensonger tant que handleRateCard ne notait que l'XP.

import { afterEach, describe, expect, it } from 'vitest';
import {
  getSrsState,
  nextSrsState,
  previewIntervalDays,
  rateCard,
  resetAllSrs,
  sortByDue,
  formatIntervalLabel,
} from '../flashcardsSrs';

afterEach(() => {
  localStorage.clear();
});

describe('nextSrsState — transitions SM-2', () => {
  it('première note « good » → intervalle 1 jour, due dans 24 h', () => {
    const now = Date.now();
    const s = nextSrsState(null, 'good', now);
    expect(s.intervalDays).toBe(1);
    expect(s.dueAt).toBe(now + 86_400_000);
    expect(s.reps).toBe(1);
  });

  it('« easy » dépasse « good » et « hard » sur la même carte', () => {
    const now = Date.now();
    const base = nextSrsState(null, 'good', now);
    const again = nextSrsState(base, 'good', now);
    const hard = nextSrsState(again, 'hard', now);
    const good = nextSrsState(again, 'good', now);
    const easy = nextSrsState(again, 'easy', now);
    expect(hard.intervalDays).toBeLessThan(good.intervalDays);
    expect(easy.intervalDays).toBeGreaterThan(good.intervalDays);
  });

  it('« encore » remet le cycle à zéro et re-programme dans la séance', () => {
    const now = Date.now();
    const s = nextSrsState(nextSrsState(null, 'good', now), 'again', now);
    expect(s.reps).toBe(0);
    expect(s.intervalDays).toBe(0);
    expect(s.dueAt).toBe(now);
    expect(s.lapses).toBe(1);
  });

  it('le facteur de facilité ne descend jamais sous 1,3', () => {
    const now = Date.now();
    let s = nextSrsState(null, 'good', now);
    for (let i = 0; i < 30; i++) s = nextSrsState(s, 'again', now);
    expect(s.ease).toBeGreaterThanOrEqual(1.3);
  });

  it('intervalles successifs 1 → 6 → multipliés par l\'ease', () => {
    const now = Date.now();
    const i1 = nextSrsState(null, 'good', now);
    const i2 = nextSrsState(i1, 'good', now);
    const i3 = nextSrsState(i2, 'good', now);
    expect(i1.intervalDays).toBe(1);
    expect(i2.intervalDays).toBe(6);
    expect(i3.intervalDays).toBe(Math.round(6 * i3.ease));
  });
});

describe('rateCard — persistance localStorage', () => {
  it('écrit puis relit l\'état par carte ; JSON corrompu = état neutre', () => {
    expect(getSrsState('c1')).toBeNull();
    const s = rateCard('c1', 'good');
    expect(getSrsState('c1')?.intervalDays).toBe(1);
    localStorage.setItem('kunz_flashcard_srs_v1', '{corrompu');
    expect(getSrsState('c1')).toBeNull();
    expect(() => rateCard('c2', 'easy')).not.toThrow();
  });

  it('resetAllSrs efface toute la banque', () => {
    rateCard('c1', 'good');
    resetAllSrs();
    expect(getSrsState('c1')).toBeNull();
  });
});

describe('sortByDue — ordre du deck', () => {
  const cards = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];

  it('nouvelles cartes : ordre d\'origine conservé (stable)', () => {
    expect(sortByDue(cards).map((c) => c.id)).toEqual(['a', 'b', 'c']);
  });

  it('carte notée « good » passe après les dues, triée par dueAt', () => {
    const now = Date.now();
    rateCard('a', 'good', now);
    rateCard('b', 'easy', now);
    // a (1 j) et b (≥ 4 j) programmées, c nouvelle → c d'abord, puis a, puis b.
    expect(sortByDue(cards, now).map((c) => c.id)).toEqual(['c', 'a', 'b']);
  });

  it('note « encore » : la carte repart en fin de deck, pas en tête', () => {
    rateCard('a', 'again');
    expect(sortByDue(cards, Date.now(), 'a').map((c) => c.id)).toEqual(['b', 'c', 'a']);
  });

  it('storage corrompu = deck non trié mais jamais d\'exception', () => {
    localStorage.setItem('kunz_flashcard_srs_v1', '[');
    expect(sortByDue(cards).map((c) => c.id)).toEqual(['a', 'b', 'c']);
  });
});

describe('libellés (chiffres latins, convention latinDigits.ts)', () => {
  it('0 jour = intra-séance ; 1 et 2 jours = formes arabes ; bornes mois', () => {
    expect(formatIntervalLabel(0)).toBe('داخل الجلسة');
    expect(formatIntervalLabel(1)).toBe('يوم واحد');
    expect(formatIntervalLabel(2)).toBe('يومان');
    expect(formatIntervalLabel(7)).toBe('7 أيام');
    expect(formatIntervalLabel(35)).toBe('شهر واحد');
    expect(formatIntervalLabel(90)).toBe('3 أشهر');
  });

  it('previewIntervalDays « encore » = 0 (re-présentation immédiate)', () => {
    expect(previewIntervalDays(null, 'again')).toBe(0);
  });
});
