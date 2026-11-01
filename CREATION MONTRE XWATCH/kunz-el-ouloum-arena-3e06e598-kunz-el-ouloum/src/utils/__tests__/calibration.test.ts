// Phase 4 (audit §3.4, ordre §6 ligne 6) — l'écart auto-évaluation / note réelle
// est LA métrique d'interiorisation du regard du correcteur.
import { describe, expect, it, beforeEach } from 'vitest';
import { gapOf, calibrationStats, calibrationMessageAr } from '../calibration';
import { addCorrectionItem, getCorrectionQueue, setRealScore, resetCorrectionQueue } from '../correctionQueue';

const mkItem = (selfScore: number | undefined, realScore: number | undefined) =>
  addCorrectionItem({
    verbId: 'verb_analyse_v1', verbAr: 'حَلِّلْ', theme: 't', stage: 4,
    dateISO: '2026-09-06T10:00:00Z', text: 'x', icm: 90, errorTags: [],
    selfScore, realScore,
  });

describe('Phase 4 — gapOf', () => {
  it('auto − réel (signé) ; null quand une note manque', () => {
    expect(gapOf({ selfScore: 12, realScore: 9 })).toBe(3);
    expect(gapOf({ selfScore: 8, realScore: 10 })).toBe(-2);
    expect(gapOf({ selfScore: 10, realScore: null })).toBeNull();
    expect(gapOf({ selfScore: null, realScore: 10 })).toBeNull();
  });
});

describe('Phase 4 — calibrationStats', () => {
  it('aucune paire notée → n=0, null', () => {
    const s = calibrationStats([
      { selfScore: 10, realScore: undefined },
      { selfScore: undefined, realScore: 8 },
    ] as any);
    expect(s).toMatchObject({ n: 0, meanGap: null, meanAbsGap: null, spark: [] });
  });

  it('moyenne signée + |moyenne| + compteurs', () => {
    const s = calibrationStats([
      { selfScore: 12, realScore: 9 },   // +3
      { selfScore: 14, realScore: 12 },  // +2
      { selfScore: 9, realScore: 10 },   // -1
      { selfScore: 10, realScore: 9.5 }, // +0.5 (calibré ≤1)
    ] as any);
    expect(s.n).toBe(4);
    expect(s.meanGap).toBeCloseTo(1.125); // (3 + 2 − 1 + 0.5) / 4
    expect(s.meanAbsGap).toBeCloseTo(1.625);
    expect(s.overconfident).toBe(3);
    expect(s.underconfident).toBe(1);
    expect(s.calibrated).toBe(2); // -1 et +0.5
  });

  it('spark = les 5 derniers |écart| (chronologique)', () => {
    const s = calibrationStats([
      ...Array.from({ length: 7 }, (_, i) => ({ selfScore: 10 + i, realScore: 10 })),
    ] as any);
    expect(s.spark).toEqual([2, 3, 4, 5, 6]);
  });
});

describe('Phase 4 — message pédagogique', () => {
  const stats = (gaps: number[]) =>
    calibrationStats(gaps.map(g => ({ selfScore: 10 + g, realScore: 10 })) as any);

  it('n < 3 → pas de conclusion', () => {
    expect(calibrationMessageAr(stats([3, 3]))).toBeNull();
    expect(calibrationMessageAr(stats([]))).toBeNull();
  });

  it('surestimation persistante → revoir les critères du mصحح', () => {
    expect(calibrationMessageAr(stats([3, 4, 3]))).toContain('أرحم من المصحح');
  });

  it('sous-estimation persistante → se rassurer', () => {
    expect(calibrationMessageAr(stats([-3, -4, -3]))).toContain('أقسى من المصحح');
  });

  it('calibré (|écart| ≤ 1) → la mirror est réglée', () => {
    expect(calibrationMessageAr(stats([0.5, -0.5, 1]))).toContain('مضبوطة');
  });
});

describe('Phase 4 — note réelle via la file', () => {
  beforeEach(() => {
    localStorage.clear();
    resetCorrectionQueue();
  });

  it('setRealScore persiste et clamped 0-20', () => {
    const a = mkItem(12, undefined);
    setRealScore(a.id, 9);
    expect(getCorrectionQueue()[0].realScore).toBe(9);
    setRealScore(a.id, 25);
    expect(getCorrectionQueue()[0].realScore).toBeUndefined(); // hors borne → retiré
    setRealScore(a.id, -1);
    expect(getCorrectionQueue()[0].realScore).toBeUndefined();
  });

  it('la note réelle pose l\'écart dans la file', () => {
    const a = mkItem(12, undefined);
    setRealScore(a.id, 9);
    expect(gapOf(getCorrectionQueue()[0])).toBe(3);
    expect(calibrationStats(getCorrectionQueue()).n).toBe(1);
  });
});
