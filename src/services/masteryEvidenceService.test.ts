// src/services/masteryEvidenceService.test.ts
// P1.3 — Speckit EVIDENCE §8 : evidence service.
import { describe, it, expect, beforeEach } from 'vitest';
import {
  recordLessonTransferEvidence,
  recomputeMethodologyMastery,
} from './masteryEvidenceService';
import type { MasteryEvidence } from '../data/store';

class MockStorage implements Storage {
  private map = new Map<string, string>();
  get length() { return this.map.size; }
  clear() { this.map.clear(); }
  getItem(k: string) { return this.map.has(k) ? this.map.get(k)! : null; }
  key(i: number) { return Array.from(this.map.keys())[i] ?? null; }
  removeItem(k: string) { this.map.delete(k); }
  setItem(k: string, v: string) { this.map.set(k, String(v)); }
}
beforeEach(() => {
  global.localStorage = new MockStorage() as unknown as Storage;
});

describe('recordLessonTransferEvidence', () => {
  it('score 60 : aucune preuve, erreur active/incrémentée', () => {
    const { evidence, store } = recordLessonTransferEvidence({
      lessonId: 'd1-u3-l1-enzyme',
      conceptId: 'unit:3',
      reflexId: 'analyse',
      score: 60,
    });
    expect(evidence).toBeNull();
    expect(store.evidences).toHaveLength(0);
    expect(store.learningErrors.some((e) => e.kind === 'methodology' && e.reflexId === 'analyse')).toBe(true);
  });

  it('score 80 : une preuve lesson_transfer créée', () => {
    const { evidence, store } = recordLessonTransferEvidence({
      lessonId: 'd1-u3-l1-enzyme',
      conceptId: 'unit:3',
      reflexId: 'analyse',
      score: 80,
    });
    expect(evidence).not.toBeNull();
    expect(evidence!.source).toBe('lesson_transfer');
    expect(evidence!.conceptId).toBe('unit:3');
    expect(evidence!.reflexId).toBe('analyse');
    expect(store.evidences).toHaveLength(1);
  });

  it('même réussite : pas de doublon involontaire (ids distincts)', () => {
    const a = recordLessonTransferEvidence({ lessonId: 'd1-u3-l1-enzyme', conceptId: 'unit:3', reflexId: 'analyse', score: 85 });
    const b = recordLessonTransferEvidence({ lessonId: 'd1-u3-l1-enzyme', conceptId: 'unit:3', reflexId: 'analyse', score: 85 });
    expect(a.evidence!.id).not.toBe(b.evidence!.id);
  });

  it('preuve associée à conceptId unit:3 et reflex analyse', () => {
    const { evidence } = recordLessonTransferEvidence({ lessonId: 'd1-u3-l1-enzyme', conceptId: 'unit:3', reflexId: 'analyse', score: 75 });
    expect(evidence!.conceptId).toBe('unit:3');
    expect(evidence!.reflexId).toBe('analyse');
  });
});

describe('recomputeMethodologyMastery', () => {
  const ev = (score: number, source: MasteryEvidence['source'] = 'lesson_transfer'): MasteryEvidence => ({
    id: `e${Math.random()}`,
    conceptId: 'unit:3',
    dimension: 'methodology',
    reflexId: 'analyse',
    source,
    score,
    createdAt: Date.now(),
  });

  it('0 preuve → unknown', () => {
    expect(recomputeMethodologyMastery([], [], 'unit:3', 'analyse').level).toBe('unknown');
  });

  it('1 preuve → developing (pas mastered)', () => {
    const cell = recomputeMethodologyMastery([ev(85)], [], 'unit:3', 'analyse');
    expect(cell.level).toBe('developing');
  });

  it('erreur active → needs_work même avec preuves', () => {
    const err = {
      id: 'x', kind: 'methodology' as const, reflexId: 'analyse' as const, conceptId: 'unit:3',
      ruleIds: [], labelAr: '', count: 1, createdAt: 0, lastSeenAt: 0,
      reviewStartedAt: 0, reviewStage: 0, nextReviewAt: 0, resolvedAt: undefined,
    };
    const cell = recomputeMethodologyMastery([ev(85)], [err], 'unit:3', 'analyse');
    expect(cell.level).toBe('needs_work');
  });

  it('>=3 preuves dont une production >=80 → mastered', () => {
    const cell = recomputeMethodologyMastery([ev(82), ev(70), ev(90)], [], 'unit:3', 'analyse');
    expect(cell.level).toBe('mastered');
  });

  it('3 preuves mais aucune >=80 → developing (pas mastered)', () => {
    const cell = recomputeMethodologyMastery([ev(71), ev(72), ev(73)], [], 'unit:3', 'analyse');
    expect(cell.level).toBe('developing');
  });
});
