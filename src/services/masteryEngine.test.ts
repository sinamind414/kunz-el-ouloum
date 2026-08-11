import { beforeEach, describe, expect, it } from 'vitest';
import {
  createEmptyMasteryState,
  diagnoseWeakTopics,
  examPercent,
  hasPassedExam,
  loadMasteryState,
  pickDrillQuestions,
  pickExamQuestions,
  recordExamAttempt,
  saveMasteryState,
  EXAM_PASS_THRESHOLD,
} from './masteryEngine';
import type { QuizQuestion } from '../types';

function q(id: number, unitId: number, text = `سؤال ${id}`): QuizQuestion {
  return { id, unitId, questionText: text, options: ['أ', 'ب', 'ج', 'د'], correctAnswerIndex: 0, explanation: 'شرح' };
}

describe('Mastery Engine (V3)', () => {
  beforeEach(() => localStorage.clear());

  it('la réussite exige au moins 80 %', () => {
    expect(EXAM_PASS_THRESHOLD).toBe(80);
    expect(examPercent(8, 10)).toBe(80);
    expect(hasPassedExam(8, 10)).toBe(true);
    expect(hasPassedExam(7, 10)).toBe(false);
  });

  it('une réussite valide l’unité et efface son dernier échec', () => {
    let state = createEmptyMasteryState();
    state = recordExamAttempt(state, {
      unitId: 1, mode: 'validation', score: 4, total: 10, questionIds: [1], wrongQuestionIds: [1],
    });
    expect(state.validatedUnits).not.toContain(1);
    expect(state.lastFailure?.unitId).toBe(1);

    state = recordExamAttempt(state, {
      unitId: 1, mode: 'validation', score: 9, total: 10, questionIds: [2], wrongQuestionIds: [2],
    });
    expect(state.validatedUnits).toContain(1);
    expect(state.lastFailure).toBeNull();
  });

  it('un échec enregistre les questions ratées pour la remédiation', () => {
    const state = recordExamAttempt(createEmptyMasteryState(), {
      unitId: 2, mode: 'validation', score: 5, total: 10, questionIds: [10, 11], wrongQuestionIds: [10, 11],
    });
    expect(state.lastFailure?.percent).toBe(50);
    expect(state.lastFailure?.wrongQuestionIds).toEqual([10, 11]);
  });

  it('le drill ne crée jamais de nouvel échec bloquant', () => {
    const state = recordExamAttempt(createEmptyMasteryState(), {
      unitId: 3, mode: 'drill', score: 1, total: 5, questionIds: [], wrongQuestionIds: [],
    });
    expect(state.lastFailure).toBeNull();
    expect(state.validatedUnits).not.toContain(3);
  });

  it('persiste et recharge l’état depuis localStorage (offline-first)', () => {
    const state = recordExamAttempt(createEmptyMasteryState(), {
      unitId: 1, mode: 'validation', score: 10, total: 10, questionIds: [], wrongQuestionIds: [],
    });
    saveMasteryState(state);
    const reloaded = loadMasteryState();
    expect(reloaded.validatedUnits).toContain(1);
    expect(reloaded.attempts).toHaveLength(1);
  });

  it('survit à un localStorage corrompu', () => {
    localStorage.setItem('kunz_v3_mastery_v1', '{pas-du-json');
    expect(loadMasteryState()).toEqual(createEmptyMasteryState());
  });

  it('varie les questions d’une tentative à l’autre tant qu’il reste du stock', () => {
    const pool = Array.from({ length: 20 }, (_, i) => q(100 + i, 1));
    const first = pickExamQuestions(pool, [], 10, () => 0.5);
    expect(first).toHaveLength(10);
    const second = pickExamQuestions(pool, first.map((x) => x.id), 10, () => 0.5);
    const overlap = second.filter((s) => first.some((f) => f.id === s.id));
    expect(overlap).toHaveLength(0);
  });

  it('reprend toutes les questions si le pool est plus petit que la demande', () => {
    const pool = [q(1, 1), q(2, 1), q(3, 1)];
    const picked = pickExamQuestions(pool, [1, 2, 3], 10);
    expect(picked).toHaveLength(3);
  });

  it('le drill replace les questions ratées en premier', () => {
    const pool = Array.from({ length: 10 }, (_, i) => q(200 + i, 1));
    const drill = pickDrillQuestions(pool, [203, 205]);
    expect(drill).toHaveLength(5);
    expect(drill[0].id).toBe(203);
    expect(drill[1].id).toBe(205);
  });

  it('diagnostique les notions faibles depuis les questions ratées', () => {
    const wrong = [
      { ...q(501, 1, 'ما هو دور إنزيم ARN بوليميراز في الاستنساخ؟'), explanation: 'الاستنساخ داخل النواة' },
      { ...q(502, 1, 'أين تتم عملية الترجمة؟'), explanation: 'الترجمة في الريبوزوم' },
    ];
    const topics = diagnoseWeakTopics(1, wrong);
    expect(topics).toContain('مرحلة الاستنساخ');
    expect(topics).toContain('مرحلة الترجمة');
    expect(topics.length).toBeLessThanOrEqual(3);
  });

  it('diagnostic tolérant : pas de thème trouvé → liste vide (jamais de blocage)', () => {
    const topics = diagnoseWeakTopics(99, [q(1, 99)]);
    expect(topics).toEqual([]);
  });
});
