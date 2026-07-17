// missionEngine.test.ts
// P1.1-B — Boucle de mission (SpecKit CORRECTION_CURRENT §5 / §6 / §8).
import { describe, it, expect, vi } from 'vitest';
import {
  LearningError,
  MasteryEvidence,
  ConceptRoute,
  REVIEW_INTERVALS_DAYS,
  applyEvidenceToError,
  DAY_MS,
} from '../data/store';
import { selectMission, closeMissionLoop } from '../services/missionEngine';

function makeError(id: string, over: Partial<LearningError> = {}): LearningError {
  const now = Date.now();
  return {
    id,
    kind: 'methodology',
    conceptId: id,
    reflexId: 'analyse',
    ruleIds: ['FORBIDDEN_KULLAMA'],
    labelAr: 'خطأ',
    count: 1,
    createdAt: now,
    lastSeenAt: now,
    reviewStartedAt: 0,
    reviewStage: 0,
    nextReviewAt: 0,
    resolvedAt: undefined,
    ...over,
  };
}

function makeEvidence(conceptId: string, score: number, over: Partial<MasteryEvidence> = {}): MasteryEvidence {
  return {
    id: `ev_${conceptId}_${Date.now()}`,
    conceptId,
    dimension: 'methodology',
    reflexId: 'analyse',
    source: 'word_by_word',
    score,
    createdAt: Date.now(),
    ...over,
  };
}

const route: ConceptRoute = { conceptId: 'e1', lessonId: 'd1-u3-l1-enzyme', unitId: 3 };

describe('Mission Engine — sélection par priorité (§6 P1.1)', () => {
  it('méthode répétée (count>=2) prioritaire sur méthode isolée', () => {
    const repeated = makeError('e1', { count: 2 });
    const isolated = makeError('e2', { count: 1 });
    const m = selectMission([isolated, repeated], { e1: route, e2: route })!;
    expect(m.relatedErrorIds).toContain('e1');
  });

  it('sans erreur → mission onboarding (jamais faiblesse)', () => {
    const m = selectMission([], {});
    expect(m).not.toBeNull();
    expect(m!.source).toBe('onboarding');
    expect(m!.relatedErrorIds).toEqual([]);
  });

  it('rappel échu prioritaire sur méthode isolée', () => {
    const due = makeError('e1', { nextReviewAt: Date.now() - DAY_MS });
    const isolated = makeError('e2', { count: 1 });
    const m = selectMission([isolated, due], { e1: route, e2: route })!;
    expect(m.relatedErrorIds).toContain('e1');
  });

  it('mission valide : 3 étapes, 5-15 min, une action primaire', () => {
    const m = selectMission([makeError('e1', { count: 2 })], { e1: route })!;
    expect(m.steps.length).toBe(3);
    expect(m.expectedMinutes).toBeGreaterThanOrEqual(5);
    expect(m.expectedMinutes).toBeLessThanOrEqual(15);
    expect(typeof m.primaryActionLabelAr).toBe('string');
  });
});

describe('Mission Engine — boucle de complétion (P1.1-B)', () => {
  it('mission NON terminée sans preuve (jamais par simple clic)', () => {
    const mission = selectMission([makeError('e1', { count: 2 })], { e1: route })!;
    const { mission: after, errors } = closeMissionLoop(mission, null, [makeError('e1', { count: 2 })]);
    expect(after.completedAt).toBeUndefined();
    expect(errors.length).toBe(1);
    expect(errors[0].id).toBe('e1');
    expect(errors[0].count).toBe(2);
  });

  it('preuve réelle → mission terminée + erreur liée mise à jour', () => {
    const base = makeError('e1', { count: 2 });
    const mission = selectMission([base], { e1: route })!;
    const evidence = makeEvidence('e1', 85);
    const { mission: after, errors } = closeMissionLoop(mission, evidence, [base]);
    expect(after.completedAt).toBeDefined();
    expect(errors[0].id).toBe('e1');
  });

  it('preuve < 70 → erreur NON résolue et count incrémenté', () => {
    const base = makeError('e1', { count: 2, reviewStartedAt: Date.now() - 3 * DAY_MS, nextReviewAt: Date.now() });
    const mission = selectMission([base], { e1: route })!;
    const evidence = makeEvidence('e1', 40);
    const { errors } = closeMissionLoop(mission, evidence, [base]);
    expect(errors[0].resolvedAt).toBeUndefined();
    expect(errors[0].count).toBe(3);
  });

  it('même jour : relance retrouve la mission non terminée (reprise)', () => {
    const base = makeError('e1', { count: 2 });
    const m1 = selectMission([base], { e1: route })!;
    // Pas de preuve -> reste ouverte, on la "relance" le même jour : même structure.
    const { mission: reopened } = closeMissionLoop(m1, null, [base]);
    expect(reopened.completedAt).toBeUndefined();
    expect(reopened.id).toBe(m1.id);
  });
});

describe('Rappels espacés — cadence J+1/3/7/14 (§6 P2.3)', () => {
  it('intervalles dans l\'ordre croissant', () => {
    expect(REVIEW_INTERVALS_DAYS).toEqual([1, 3, 7, 14]);
  });

  it('échec redémarre à J+1 (ancré reviewStartedAt)', () => {
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));
    const err = makeError('e1', { reviewStartedAt: Date.now(), reviewStage: 2, nextReviewAt: Date.now() + 7 * DAY_MS });
    const evidence = makeEvidence('e1', 30);
    const updated = applyEvidenceToError(err, evidence, { passed: false });
    expect(updated.reviewStage).toBe(0);
    // J+1 depuis reviewStartedAt
    expect(updated.nextReviewAt).toBe(Date.now() + 1 * DAY_MS);
    vi.useRealTimers();
  });

  it('réussite à revue due avance d\'un stage (J+3 -> J+7)', () => {
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));
    const start = Date.now();
    const err = makeError('e1', { reviewStartedAt: start, reviewStage: 1, nextReviewAt: start });
    const evidence = makeEvidence('e1', 90);
    const updated = applyEvidenceToError(err, evidence, { passed: true });
    expect(updated.reviewStage).toBe(2);
    expect(updated.nextReviewAt).toBe(start + 7 * DAY_MS);
    expect(updated.resolvedAt).toBeUndefined();
    vi.useRealTimers();
  });

  it('réussite J+14 → consolidation (résolue)', () => {
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));
    const start = Date.now();
    const err = makeError('e1', { reviewStartedAt: start, reviewStage: 3, nextReviewAt: start });
    const evidence = makeEvidence('e1', 90);
    const updated = applyEvidenceToError(err, evidence, { passed: true });
    expect(updated.reviewStage).toBe(3);
    expect(updated.resolvedAt).toBeDefined();
    vi.useRealTimers();
  });
});
