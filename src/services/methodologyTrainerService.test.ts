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
  getMethodologyQuestionPool,
  METHODOLOGY_TRAINER_VERBS,
} from './methodologyTrainerService';
import type { MethodologyVerbKey } from './methodologyTrainerService';

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

  // Regression #38 : le bareme etait inatteignable. Il exigeait, en plus des
  // notions de la question, TOUTES les tournures-types du verbe ; 10 des 12
  // corriges officiels restaient sous le seuil de 70, si bien qu'aucune preuve
  // de methodologie ne pouvait etre enregistree sur 4 des 6 reflexes.
  describe('bareme atteignable et resistant au remplissage (#38)', () => {
    const PASS = 70;

    it('accepte les 12 corrections officielles du corpus', () => {
      const echecs: string[] = [];
      (Object.keys(METHODOLOGY_TRAINER_VERBS) as MethodologyVerbKey[]).forEach((verbKey) => {
        getMethodologyQuestionPool(verbKey).forEach((qa) => {
          const { score } = evaluateMethodologyAnswer(qa.answer, qa, verbKey);
          if (score < PASS) echecs.push(`${verbKey}/${qa.id}=${score}`);
        });
      });
      expect(echecs).toEqual([]);
    });

    it('ne signale jamais de remplissage sur une correction officielle', () => {
      (Object.keys(METHODOLOGY_TRAINER_VERBS) as MethodologyVerbKey[]).forEach((verbKey) => {
        getMethodologyQuestionPool(verbKey).forEach((qa) => {
          expect(evaluateMethodologyAnswer(qa.answer, qa, verbKey).isKeywordStuffing).toBe(false);
        });
      });
    });

    it("sanctionne l'empilement de mots-cles sous la note du corrige officiel", () => {
      const verbKey: MethodologyVerbKey = 'analyse';
      const qa = getMethodologyQuestionPool(verbKey)[0];
      const meta = METHODOLOGY_TRAINER_VERBS[verbKey];
      const salade = [...new Set([...qa.keywords, ...meta.keywords, ...meta.connectors])].join(' ');

      const bourrage = evaluateMethodologyAnswer(salade, qa, verbKey);
      const officielle = evaluateMethodologyAnswer(qa.answer, qa, verbKey);

      expect(bourrage.isKeywordStuffing).toBe(true);
      expect(bourrage.score).toBeLessThan(PASS);
      // Le point cardinal : rediger doit rapporter davantage qu'empiler.
      expect(officielle.score).toBeGreaterThan(bourrage.score);
    });

    it('separe le corrige officiel des reponses creuses ou hors sujet', () => {
      const verbKey: MethodologyVerbKey = 'analyse';
      const qa = getMethodologyQuestionPool(verbKey)[0];
      const creuse = evaluateMethodologyAnswer('لا اعرف', qa, verbKey).score;
      const horsSujet = evaluateMethodologyAnswer('احب كرة القدم كثيرا. '.repeat(6), qa, verbKey).score;

      expect(creuse).toBeLessThan(PASS);
      expect(horsSujet).toBeLessThan(PASS);
      expect(evaluateMethodologyAnswer(qa.answer, qa, verbKey).score).toBeGreaterThan(horsSujet);
    });

    it("compte 'ثم' comme connecteur de redaction", () => {
      const verbKey: MethodologyVerbKey = 'validate';
      const qa = getMethodologyQuestionPool(verbKey).find((item) => item.id === 'meth_14')!;
      expect(evaluateMethodologyAnswer(qa.answer, qa, verbKey).connPct).toBeGreaterThan(0);
    });
  });

});
