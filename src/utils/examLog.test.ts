// examLog.test.ts — HISTORIQUE DES NOTES (décision propriétaire 2026-09-19).
//
// Contrats : tentative archivée = la note exacte affichée par le correcteur ;
// rotation ; JSON corrompu → historique vide (jamais un crash) ; stats null
// tant qu'il n'y a aucune tentative ; clear.

import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  logExamAttempt,
  getExamAttempts,
  getExamStats,
  getExamStatsByType,
  clearExamLog,
} from './examLog';
import { logActivityLocally } from './activityLog';

vi.mock('./activityLog', () => ({ logActivityLocally: vi.fn() }));

// Mock localStorage minimal (env node — jsdom absent pour les utils).
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

describe('examLog — historique des notes obligatoires', () => {
  it('round-trip : la tentative archivée porte la note exacte et le détail', () => {
    logExamAttempt({
      sujet: 1,
      total: 19,
      exercices: [
        { sujet: 1, exercice: 1, points: 5, maxPts: 5, couverture: 1 },
        { sujet: 1, exercice: 2, points: 7, maxPts: 7, couverture: 1 },
        { sujet: 1, exercice: 3, points: 7, maxPts: 8, couverture: 0.94 },
      ],
    });
    const all = getExamAttempts();
    expect(all).toHaveLength(1);
    expect(all[0]!.total).toBe(19);
    expect(all[0]!.sujet).toBe(1);
    expect(all[0]!.exercices).toHaveLength(3);
    expect(all[0]!.exercices[2]!.couverture).toBeCloseTo(0.94, 2);
    expect(all[0]!.id).toMatch(/^exam_/);
  });

  it('ordre chronologique + stats (last/previous/best/average/spark)', () => {
    logExamAttempt({ sujet: 1, total: 12, exercices: [] });
    logExamAttempt({ sujet: 2, total: 15.5, exercices: [] });
    logExamAttempt({ sujet: 1, total: 19, exercices: [] });

    const s = getExamStats()!;
    expect(s.attempts).toBe(3);
    expect(s.last).toBe(19);
    expect(s.previous).toBe(15.5);
    expect(s.best).toBe(19);
    expect(s.average).toBeCloseTo((12 + 15.5 + 19) / 3, 1);
    expect(s.spark).toEqual([12, 15.5, 19]);
  });

  it('aucune tentative → stats null (l absence n est pas 0)', () => {
    expect(getExamAttempts()).toEqual([]);
    expect(getExamStats()).toBeNull();
  });

  it('rotation : au-delà de MAX_ENTRIES les plus anciennes partent', () => {
    for (let i = 0; i < 205; i++) {
      logExamAttempt({ sujet: 1, total: i, exercices: [] });
    }
    const all = getExamAttempts();
    expect(all.length).toBeLessThanOrEqual(200);
    // les plus RÉCENTES sont conservées
    expect(all[all.length - 1]!.total).toBe(204);
  });

  it('JSON corrompu → historique vide, la nouvelle tentative repart propre', () => {
    localStorage.setItem('kunz_exam_attempts_log_v1', '{pas du json');
    expect(getExamAttempts()).toEqual([]);
    logExamAttempt({ sujet: 2, total: 14, exercices: [] });
    expect(getExamAttempts()).toHaveLength(1);
  });

  it('clearExamLog vide tout', () => {
    logExamAttempt({ sujet: 1, total: 10, exercices: [] });
    clearExamLog();
    expect(getExamAttempts()).toEqual([]);
    expect(getExamStats()).toBeNull();
  });

  it('l événement dashboard est poussé via logActivityLocally (type quiz, titre sujet)', () => {
    logExamAttempt({ sujet: 2, total: 16, exercices: [] });
    expect(vi.mocked(logActivityLocally)).toHaveBeenCalledTimes(1);
    expect(vi.mocked(logActivityLocally)).toHaveBeenCalledWith(
      expect.objectContaining({
        studentId: 'local',
        type: 'quiz',
        payload: expect.objectContaining({ domain: 'bac2025', score: 16, total: 20, percent: 80 }),
      })
    );
  });
});

describe('examLog — statistiques PAR TYPE (correction 2026-11-05)', () => {
  it('aucune tentative → tous les groupes vides, pas de zéro inventé', () => {
    const s = getExamStatsByType();
    expect(s.attempts).toBe(0);
    expect(s.parArchetype).toEqual([]);
    expect(s.parAnnee).toEqual([]);
    expect(s.parSource).toEqual([]);
    expect(s.parExercice).toEqual([]);
  });

  it('groupe par archétype dédupliqué, année, source et rang d’exercice', () => {
    logExamAttempt({
      sujet: 1,
      total: 14,
      exercices: [
        { sujet: 1, exercice: 1, points: 4, maxPts: 5, couverture: 0.8 },
        { sujet: 1, exercice: 3, points: 5, maxPts: 8, couverture: 0.62 },
      ],
      source: 'bac2025',
      year: 2025,
      archetypeIds: ['arch_a', 'arch_a', 'arch_b'],
    });
    logExamAttempt({
      sujet: 2,
      total: 18,
      exercices: [{ sujet: 2, exercice: 3, points: 8, maxPts: 8, couverture: 1 }],
      source: 'bareme',
      year: 2024,
      archetypeIds: ['arch_a'],
    });
    const s = getExamStatsByType();
    expect(s.attempts).toBe(2);
    expect(s.parArchetype.find((x) => x.key === 'arch_a')!.attempts).toBe(2);
    expect(s.parArchetype.find((x) => x.key === 'arch_b')!.attempts).toBe(1);
    expect(s.parAnnee.map((x) => x.key)).toEqual(['2025', '2024']);
    expect(s.parSource.map((x) => x.key).sort()).toEqual(['bac2025', 'bareme']);
    const rang3 = s.parExercice.find((x) => x.exercice === 3)!;
    expect(rang3.occurrences).toBe(2);
    expect(rang3.taux).toBeCloseTo(13 / 16, 2);
  });

  it('le domaine envoyé au dashboard suit la provenance réelle', () => {
    logExamAttempt({
      sujet: 1,
      total: 12,
      exercices: [],
      source: 'bareme',
      year: 2023,
    });
    expect(vi.mocked(logActivityLocally)).toHaveBeenLastCalledWith(
      expect.objectContaining({
        payload: expect.objectContaining({ domain: 'bareme' }),
      }),
    );
  });
});
