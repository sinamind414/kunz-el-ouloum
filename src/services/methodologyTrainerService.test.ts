import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../data/store', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../data/store')>();
  return {
    ...actual,
    recordEvidence: vi.fn(() => ({})),
  };
});

import { recordEvidence } from '../data/store';
import { METHODOLOGY_QA } from '../methodologyKnowledge';
import {
  evaluateMethodologyAnswer,
  submitMethodologyAttempt,
  METHODOLOGY_TRAINER_VERBS,
} from './methodologyTrainerService';

describe('methodologyTrainerService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('interdit "ربما" dans la production d’hypothèse et plafonne le score', () => {
    const qa = METHODOLOGY_QA.find((item) => item.id === 'meth_12');
    expect(qa).toBeTruthy();

    const result = evaluateMethodologyAnswer(
      'ربما سبب الظاهرة هو تثبيط الإنزيم وقد يكون هذا مرتبطا بالمشكل العلمي.',
      qa!,
      'hypothesize'
    );

    expect(result.forbiddenFound).toContain('ربما');
    expect(result.score).toBeLessThanOrEqual(30);
  });

  it('accepte une hypothèse formulée avec "نفترض أن" sans mot interdit', () => {
    const qa = METHODOLOGY_QA.find((item) => item.id === 'meth_12');
    expect(qa).toBeTruthy();

    const result = evaluateMethodologyAnswer(
      'نفترض أن سبب الظاهرة هو تثبيط ARN بوليميراز مما يؤدي إلى توقف الاستنساخ، ويمكن التحقق من ذلك لأن الفرضية قابلة للاختبار انطلاقا من معطيات الوثيقة والمشكل العلمي.',
      qa!,
      'hypothesize'
    );

    expect(result.forbiddenFound).toEqual([]);
    expect(result.score).toBeGreaterThan(45);
    expect(result.score).toBe(result.rawScore);
  });

  it('enregistre une preuve sur reflexId explain sans passer par deduce', () => {
    const qa = METHODOLOGY_QA.find((item) => item.id === 'meth_13');
    expect(qa).toBeTruthy();

    const submission = submitMethodologyAttempt({
      text: 'تبيّن الوثائق أن النص العلمي الجيد يبدأ بمقدمة، ثم عرض مرتب، ثم خاتمة. من هنا يتضح أن روابط منطقية وآلية واضحة تحقق هدف السؤال. بذلك نشرح الفكرة المركزية، ونبيّن الجواب في نص علمي متماسك يربط الوثائق والمعطيات والمكتسبات.',
      qa: qa!,
      reflexId: 'explain',
      missionReflexId: 'explain',
      missionMeta: { missionId: 'M_EXPLAIN', conceptId: 'transcription' },
    });

    expect(submission.evaluation.score).toBeGreaterThanOrEqual(70);
    expect(vi.mocked(recordEvidence)).toHaveBeenCalledWith(
      expect.objectContaining({ reflexId: 'explain', dimension: 'methodology' })
    );
    expect(submission.missionCompleted).toBe(true);
  });

  it('enregistre une preuve sur reflexId validate sans passer par justify', () => {
    const qa = METHODOLOGY_QA.find((item) => item.id === 'meth_11');
    expect(qa).toBeTruthy();

    const submission = submitMethodologyAttempt({
      text: 'بالاستناد إلى أدلة الوثيقة والمكتسبات، نعرض الفرضية ثم نقارنها بالمعطيات. يتطابق الدليل مع الفرضية ويؤكدها لأن الحجج والتبرير العلمي المستخرَجين من الوثيقة يثبتان صحة النتيجة ويبرزان التطابق بين الفرضية والدليل.',
      qa: qa!,
      reflexId: 'validate',
      missionReflexId: 'validate',
      missionMeta: { missionId: 'M_VALIDATE', conceptId: 'enzymes' },
    });

    expect(submission.evaluation.score).toBeGreaterThanOrEqual(70);
    expect(vi.mocked(recordEvidence)).toHaveBeenCalledWith(
      expect.objectContaining({ reflexId: 'validate', dimension: 'methodology' })
    );
    expect(submission.missionCompleted).toBe(true);
  });

  it('expose exactement les six réflexes canoniques dans le trainer', () => {
    expect(Object.keys(METHODOLOGY_TRAINER_VERBS)).toEqual([
      'analyse',
      'interpret',
      'compare',
      'hypothesize',
      'explain',
      'validate',
    ]);
  });
});
