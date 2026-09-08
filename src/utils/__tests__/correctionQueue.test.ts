// Phase 3 (audit §3.5) — la boucle « forme → fond » : la machine valide la forme,
// l'enseignant du produit garantit le fond. File locale, rotation, verdicts.
import { describe, expect, it, beforeEach } from 'vitest';
import {
  addCorrectionItem, getCorrectionQueue, getPendingCorrections,
  markCorrection, correctionStats, resetCorrectionQueue,
} from '../correctionQueue';

const mk = (i: number, over: Partial<Parameters<typeof addCorrectionItem>[0]> = {}) =>
  addCorrectionItem({
    verbId: 'verb_explain_v1', verbAr: 'فَسِّرْ', theme: 'enzymology', stage: 3,
    dateISO: `2026-09-0${(i % 9) + 1}T10:00:00Z`, text: `production ${i}`, icm: 90,
    errorTags: [], ...over,
  });

describe('Phase 3 — file de correction', () => {
  beforeEach(() => {
    localStorage.clear();
    resetCorrectionQueue();
  });

  it('une production « forme validée » entre en file, statut pending', () => {
    const item = mk(1);
    expect(item.status).toBe('pending');
    expect(getPendingCorrections()).toHaveLength(1);
    expect(correctionStats()).toEqual({ pending: 1, approved: 0, corrections: 0, examCount: 0 });
  });

  it('plus récente d\'abord', () => {
    mk(1);
    const b = mk(2, { text: 'plus récent' });
    expect(getCorrectionQueue()[0].id).toBe(b.id);
  });

  it('le correcteur approuve le fond (+ note)', () => {
    const a = mk(1);
    markCorrection(a.id, 'approved', 'ممتاز');
    const q = getCorrectionQueue();
    expect(q[0].status).toBe('approved');
    expect(q[0].noteAr).toBe('ممتاز');
    expect(correctionStats()).toEqual({ pending: 0, approved: 1, corrections: 0, examCount: 0 });
  });

  it('le correcteur renvoie à corriger (+ note)', () => {
    const a = mk(1);
    markCorrection(a.id, 'corrections', 'الآلية ناقصة');
    expect(getCorrectionQueue()[0].status).toBe('corrections');
    expect(getPendingCorrections()).toHaveLength(0);
    expect(correctionStats().corrections).toBe(1);
  });

  it('persistence : items écrits directement dans localStorage (nouvelle session)', () => {
    const a = mk(1);
    const raw = localStorage.getItem('kunz_correction_queue_v1');
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw!);
    expect(parsed.map((e: any) => e.id)).toEqual([a.id]);
    expect(parsed[0].status).toBe('pending');
  });

  it('resetCorrectionQueue vide la file', () => {
    mk(1);
    resetCorrectionQueue();
    expect(getCorrectionQueue()).toHaveLength(0);
    expect(correctionStats().pending).toBe(0);
  });

  it('rotation : jamais plus de 200 items', () => {
    for (let i = 1; i <= 205; i++) mk(i, { text: `t${i}` });
    expect(getCorrectionQueue()).toHaveLength(200);
    // le plus ancien est sorti, le plus récent est en tête
    expect(getCorrectionQueue()[0].text).toBe('t205');
  });
});
