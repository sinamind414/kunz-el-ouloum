// D1 (2026-09-06, docs/MARQUE.md §11) — sémantique du drill : 12/12 sur 3 jours DISTINCTS.
// Un échec allonge l'intervalle sans remettre le compteur à zéro. Verso = 3 types maîtrisés.
import { describe, expect, it, beforeEach } from 'vitest';
import {
  applyDrillResult, recordDrillResult, getDrillStatus,
  recordTypeMastery, getMasteryStatus, isVersoUnlocked,
  isExtensionUnlocked, unlockExtension, resetExtension,
  dayDiffDays, todayISO, DrillState,
} from '../../data/v3Progress';

const S0: DrillState = { perfectDays: [], failDays: [] };

describe('D1 — applyDrillResult (règle pure)', () => {
  it('12/12 le premier jour : compté', () => {
    const s = applyDrillResult(S0, 12, '2026-09-01');
    expect(s.perfectDays).toEqual(['2026-09-01']);
  });

  it('12/12 deux fois le même jour : idempotent (1 seul jour)', () => {
    let s = applyDrillResult(S0, 12, '2026-09-01');
    s = applyDrillResult(s, 12, '2026-09-01');
    expect(s.perfectDays).toEqual(['2026-09-01']);
  });

  it('12/12 le jour suivant sans échec : compté (intervalle base = 1 jour)', () => {
    let s = applyDrillResult(S0, 12, '2026-09-01');
    s = applyDrillResult(s, 12, '2026-09-02');
    expect(s.perfectDays).toEqual(['2026-09-01', '2026-09-02']);
  });

  it('échec : ne remet PAS les jours parfaits à zéro', () => {
    let s = applyDrillResult(S0, 12, '2026-09-01');
    s = applyDrillResult(s, 10, '2026-09-02');
    s = applyDrillResult(s, 0, '2026-09-02'); // idempotent le même jour
    expect(s.perfectDays).toEqual(['2026-09-01']);
    expect(s.failDays).toEqual(['2026-09-02']);
  });

  it('échec entre deux jours parfaits : allonge l\'intervalle (+1 jour)', () => {
    // parfait J1, échec J2 → le J3 est à 2 jours du J1 : compté (≥ 1+1)
    let s = applyDrillResult(S0, 12, '2026-09-01');
    s = applyDrillResult(s, 8, '2026-09-02');
    s = applyDrillResult(s, 12, '2026-09-03');
    expect(s.perfectDays).toEqual(['2026-09-01', '2026-09-03']);
  });

  it('échec puis 12/12 le même jour : le jour compte (l\'échec du jour même est exclu de l\'intervalle)', () => {
    let s = applyDrillResult(S0, 12, '2026-09-01');
    s = applyDrillResult(s, 5, '2026-09-02');
    s = applyDrillResult(s, 12, '2026-09-02');
    expect(s.perfectDays).toContain('2026-09-02');
    s = applyDrillResult(s, 12, '2026-09-03');
    expect(s.perfectDays).toEqual(['2026-09-01', '2026-09-02', '2026-09-03']);
  });

  it('deux jours d\'échec strictement entre : intervalle +2', () => {
    let s = applyDrillResult(S0, 12, '2026-09-01');
    s = applyDrillResult(s, 9, '2026-09-02');
    s = applyDrillResult(s, 7, '2026-09-03');
    // J3 = 2 jours après J1, 1 jour d\'échec strictement entre (J2) → comptable
    const atJ3 = applyDrillResult(s, 12, '2026-09-03');
    expect(atJ3.perfectDays).toEqual(['2026-09-01', '2026-09-03']);
    // puis échecs J4+J5 → le jour comptable suivant est à ≥ 3 jours de J3 : J6
    let t = applyDrillResult(atJ3, 5, '2026-09-04');
    t = applyDrillResult(t, 4, '2026-09-05');
    const atJ6 = applyDrillResult(t, 12, '2026-09-06');
    expect(atJ6.perfectDays).toEqual(['2026-09-01', '2026-09-03', '2026-09-06']);
  });

  it('ordre des jours préservé et trié', () => {
    let s = applyDrillResult(S0, 12, '2026-09-01');
    s = applyDrillResult(s, 12, '2026-09-02');
    s = applyDrillResult(s, 12, '2026-09-03');
    expect(s.perfectDays).toEqual(['2026-09-01', '2026-09-02', '2026-09-03']);
  });
});

describe('D1 — persistance localStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('recordDrillResult + getDrillStatus : jauge X / 3 puis badge', () => {
    expect(recordDrillResult(12, '2026-09-01')).toEqual({ met: false, perfectDays: 1 });
    expect(recordDrillResult(12, '2026-09-02')).toEqual({ met: false, perfectDays: 2 });
    const third = recordDrillResult(12, '2026-09-03');
    expect(third.met).toBe(true);
    const st = getDrillStatus();
    expect(st).toMatchObject({ perfectDays: 3, goal: 3, met: true, badgeAr: 'حامل المفتاح' });
  });

  it('échec puis reprise : le compteur survit', () => {
    recordDrillResult(12, '2026-09-01');
    recordDrillResult(6, '2026-09-02');
    recordDrillResult(12, '2026-09-03');
    recordDrillResult(12, '2026-09-04');
    expect(getDrillStatus().met).toBe(true);
  });

  it('resetExtension efface drill + maîtrise + legacy', () => {
    recordDrillResult(12, '2026-09-01');
    recordTypeMastery('verb_analyse_v1');
    unlockExtension();
    expect(isExtensionUnlocked()).toBe(true);
    resetExtension();
    expect(getDrillStatus().perfectDays).toBe(0);
    expect(getMasteryStatus().types).toHaveLength(0);
    expect(isExtensionUnlocked()).toBe(false);
  });
});

describe('D1 — verso = noyau stable sur 3 types (badge أمين الكنز)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('2 types ≠ verso ; 3 types → verso + badge', () => {
    recordTypeMastery('verb_analyse_v1');
    expect(isVersoUnlocked()).toBe(false);
    recordTypeMastery('verb_explain_v1');
    expect(isVersoUnlocked()).toBe(false);
    const r = recordTypeMastery('verb_compare_v1');
    expect(r).toEqual({ met: true, types: 3 });
    expect(isVersoUnlocked()).toBe(true);
    expect(getMasteryStatus().badgeAr).toBe('أمين الكنز');
  });

  it('idempotent : re-passer la stage 4 du même verbe ne double pas', () => {
    recordTypeMastery('verb_analyse_v1');
    recordTypeMastery('verb_analyse_v1');
    expect(getMasteryStatus().types).toEqual(['verb_analyse_v1']);
  });

  it('flag legacy grandfatheré : reste débloqué sans les 3 types', () => {
    localStorage.setItem('kunz_v3:extension_unlocked', '1');
    expect(isExtensionUnlocked()).toBe(true);
    expect(getMasteryStatus().met).toBe(false);
  });
});

describe('D1 — utilitaires dates', () => {
  it('dayDiffDays : jours calendaires', () => {
    expect(dayDiffDays('2026-09-03', '2026-09-01')).toBe(2);
    expect(dayDiffDays('2026-09-01', '2026-09-01')).toBe(0);
  });

  it('todayISO : format local yyyy-mm-dd', () => {
    expect(todayISO(new Date(2026, 8, 6))).toBe('2026-09-06');
  });
});
