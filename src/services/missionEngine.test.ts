// missionEngine.test.ts
// SpecKit correctif — Mission Engine (§3 / §4 / §5 / §7 / §8).
import { describe, it, expect, vi } from 'vitest';
import {
  LearningError,
  MasteryEvidence,
  ConceptRoute,
  REVIEW_INTERVALS_DAYS,
  applyEvidenceToError,
  DAY_MS,
} from '../data/store';
import {
  selectMission,
  selectMissionSelection,
  closeMissionLoop,
} from '../services/missionEngine';

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

describe('Mission Engine — priorité (§3 / §7)', () => {
  it('méthode répétée (count>=2) prioritaire sur méthode isolée', () => {
    const repeated = makeError('e1', { count: 2 });
    const isolated = makeError('e2', { count: 1 });
    const m = selectMission([isolated, repeated], { e1: route, e2: route })!;
    expect(m.relatedErrorIds).toContain('e1');
  });

  it('méthode répétée > contenu récent', () => {
    const repeated = makeError('e1', { count: 2 });
    const content = makeError('e2', { kind: 'knowledge', count: 1 });
    const sel = selectMissionSelection([content, repeated], { e1: route, e2: route });
    expect(sel.kind).toBe('mission');
    if (sel.kind === 'mission') {
      expect(sel.priority).toBe('method_repeated');
      expect(sel.mission.relatedErrorIds).toContain('e1');
    }
  });

  it('contenu récent > rappel échu', () => {
    const content = makeError('e1', { kind: 'knowledge', count: 1 });
    const due = makeError('e2', { nextReviewAt: Date.now() - DAY_MS });
    const sel = selectMissionSelection([due, content], { e1: route, e2: route });
    expect(sel.kind).toBe('mission');
    if (sel.kind === 'mission') {
      expect(sel.priority).toBe('content_recent');
      expect(sel.mission.relatedErrorIds).toContain('e1');
    }
  });

  it('rappel échu > méthode isolée', () => {
    const due = makeError('e1', { nextReviewAt: Date.now() - DAY_MS });
    const isolated = makeError('e2', { count: 1 });
    const m = selectMission([isolated, due], { e1: route, e2: route })!;
    expect(m.relatedErrorIds).toContain('e1');
  });
});

describe('Mission Engine — résolution / rappel espacé (§5 / §7)', () => {
  it('erreur résolue + rappel NON échu → NON sélectionnée', () => {
    const resolved = makeError('e1', {
      resolvedAt: Date.now() - DAY_MS,
      reviewStartedAt: Date.now() - DAY_MS,
      nextReviewAt: Date.now() + 3 * DAY_MS,
    });
    const sel = selectMissionSelection([resolved], { e1: route });
    expect(sel.kind).toBe('idle');
  });

  it('erreur résolue + rappel ÉCHU → spaced_due sélectionnée', () => {
    const resolved = makeError('e1', {
      resolvedAt: Date.now() - 14 * DAY_MS,
      reviewStartedAt: Date.now() - 14 * DAY_MS,
      nextReviewAt: Date.now() - DAY_MS,
    });
    const sel = selectMissionSelection([resolved], { e1: route });
    expect(sel.kind).toBe('mission');
    if (sel.kind === 'mission') {
      expect(sel.priority).toBe('spaced_due');
      expect(sel.mission.relatedErrorIds).toContain('e1');
    }
  });

  it('erreur active insuffisante → redémarre à J+1 (ancré reviewStartedAt)', () => {
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));
    const start = Date.now();
    const err = makeError('e1', { reviewStartedAt: start, reviewStage: 2, nextReviewAt: start + 7 * DAY_MS });
    const evidence = makeEvidence('e1', 40);
    const updated = applyEvidenceToError(err, evidence, { passed: false });
    expect(updated.reviewStage).toBe(0);
    expect(updated.nextReviewAt).toBe(start + 1 * DAY_MS);
    vi.useRealTimers();
  });
});

describe('Mission Engine — durée calculée (§4 / §7)', () => {
  it('mission sans carte = 9 min (rappel 2 + pratique 4 + quiz 3)', () => {
    const m = selectMission([makeError('e1', { count: 2 })], { e1: route })!;
    expect(m.steps.length).toBe(3);
    expect(m.expectedMinutes).toBe(9);
  });

  it('mission avec carte = 11 min (carte 2 + rappel 2 + pratique 4 + quiz 3)', () => {
    const cardRoute: ConceptRoute = { ...route, survivalCardId: 'sc_enzymes' };
    const m = selectMission([makeError('e1', { count: 2 })], { e1: cardRoute })!;
    expect(m.steps.length).toBe(4);
    expect(m.expectedMinutes).toBe(11);
  });

  it('onboarding = 9 min (découverte 3 + pratique 3 + quiz 3)', () => {
    const sel = selectMissionSelection([], {}, { forceOnboarding: true });
    expect(sel.kind).toBe('mission');
    if (sel.kind === 'mission') {
      expect(sel.mission.steps.length).toBe(3);
      expect(sel.mission.expectedMinutes).toBe(9);
    }
  });
});

describe('Mission Engine — idle / onboarding (§2 / §7)', () => {
  it('utilisateur vierge → onboarding', () => {
    const sel = selectMissionSelection([], {});
    expect(sel.kind).toBe('mission');
    if (sel.kind === 'mission') expect(sel.priority).toBe('onboarding');
  });

  it('utilisateur actif à jour → idle (aucun faux motif de faiblesse)', () => {
    const sel = selectMissionSelection([], {}, { completedMissions: 1 });
    expect(sel.kind).toBe('idle');
    if (sel.kind === 'idle') {
      expect(sel.messageAr).toContain('أنت على المسار الصحيح');
      expect(sel.messageAr).toContain('لا توجد مراجعة مستحقة اليوم');
    }
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
});

describe('Rappels espacés — cadence J+1/3/7/14 (§5)', () => {
  it('intervalles dans l\'ordre croissant', () => {
    expect(REVIEW_INTERVALS_DAYS).toEqual([1, 3, 7, 14]);
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
