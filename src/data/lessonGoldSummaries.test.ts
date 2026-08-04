// lessonGoldSummaries.test.ts
// V3 §3.1 / §10 — Résumés d'Or : mission, 4-6 mécanismes, preuve, 4-8 mots, erreur, rappel.
import { describe, it, expect } from 'vitest';
import { LESSON_GOLD_SUMMARIES, getLessonGoldSummary } from '../data/lessonGoldSummaries';

describe('Résumés dOr (§3.1)', () => {

  it('trois leçons pilotes ont un résumé', () => {
    for (const id of ['d1-u1-l2-transcription', 'd1-u1-l3-traduction', 'd1-u3-l1-enzyme']) {
      expect(getLessonGoldSummary(id)).toBeDefined();
    }
  });

  it('la leçon sismique a un résumé pédagogique', () => {
    expect(getLessonGoldSummary('seismic_waves')).toBeDefined();
  });

  it('chaque résumé a mission, 4-6 mécanismes, preuve, 4-8 mots, erreur, rappel', () => {
    for (const s of Object.values(LESSON_GOLD_SUMMARIES)) {
      expect(s.missionAr.length).toBeGreaterThan(0);
      expect(s.mechanismAr.length).toBeGreaterThanOrEqual(4);
      expect(s.mechanismAr.length).toBeLessThanOrEqual(6);
      expect(s.evidenceAr.length).toBeGreaterThan(0);
      expect(s.vocabulary.length).toBeGreaterThanOrEqual(4);
      expect(s.vocabulary.length).toBeLessThanOrEqual(8);
      expect(s.commonErrorAr.length).toBeGreaterThan(0);
      expect(s.recallQuestionAr.length).toBeGreaterThan(0);
    }
  });

  it('aucun résumé non relu ne prétend être validé par un prof', () => {
    for (const s of Object.values(LESSON_GOLD_SUMMARIES)) {
      if (!s.review?.reviewed) {
        expect(s.status).not.toBe('manuel_officiel_verifie');
      }
    }
  });
});
