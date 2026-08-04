// validationTests.ts
// Définition des tests T1–T12 (Speckit §5.5) — partagée par le runner tsx
// (test:smartbot) et la spec vitest (test:vitest). Aucune dépendance de test externe.

import { validateAnswer, ValidationResult, ValidationContext } from './ValidationEngine';

export interface TestCase {
  id: string;
  desc: string;
  input: string;
  ctx: ValidationContext;
  expect: (r: ValidationResult) => boolean;
  detail: string;
}

export const T1_T12: TestCase[] = [
  {
    id: 'T1',
    desc: 'réponse vide',
    input: '',
    ctx: { docType: 'quantitative', actionVerb: 'analyse', isNeuromuscular: false },
    expect: (r) => r.errors.some((e) => e.code === 'EMPTY_ANSWER') && r.score === 0,
    detail: 'EMPTY_ANSWER + score 0',
  },
  {
    id: 'T2',
    desc: 'كلما sur document qualitatif (Ouchterlony)',
    input: 'كلما زاد تركيز المصل ظهرت هالة أكبر',
    ctx: { docType: 'qualitative', actionVerb: 'analyse', isNeuromuscular: false },
    expect: (r) => r.errors.some((e) => e.code === 'FORBIDDEN_KULLAMA'),
    detail: 'FORBIDDEN_KULLAMA',
  },
  {
    id: 'T3',
    desc: 'quantitatif sans كلما / monotone',
    input: 'لون المحلول يتغير عند إضافة المصل',
    ctx: { docType: 'quantitative', actionVerb: 'analyse', isNeuromuscular: false },
    expect: (r) => r.errors.some((e) => e.code === 'MISSING_KULLAMA'),
    detail: 'MISSING_KULLAMA',
  },
  {
    id: 'T4',
    desc: 'PPSE sur jonction neuromusculaire',
    input: 'نلاحظ كمون ما بعد التشابك PPSE يساوي 70 ملي ثانية',
    ctx: { docType: 'quantitative', actionVerb: 'describe', isNeuromuscular: true },
    expect: (r) => r.errors.some((e) => e.code === 'WRONG_PPM_PPSE' && e.severity === 'critical'),
    detail: 'WRONG_PPM_PPSE critical',
  },
  {
    id: 'T5',
    desc: 'ربما en hypothèse',
    input: 'ربما يرجع السبب إلى نقص الأكسجين',
    ctx: { docType: 'mixed', actionVerb: 'hypothesize', isNeuromuscular: false },
    expect: (r) => r.errors.some((e) => e.code === 'FORBIDDEN_RUBBAMA'),
    detail: 'FORBIDDEN_RUBBAMA',
  },
  {
    id: 'T6',
    desc: 'نفترض + cible moléculaire',
    input: 'نفترض أن نشاط الإنزيم يتناقص بسبب المادة المثبطة',
    ctx: { docType: 'mixed', actionVerb: 'hypothesize', isNeuromuscular: false, expectedTargets: ['إنزيم', 'أستيل كولين'] },
    expect: (r) => r.matchedLois.includes(4) && r.score >= 10,
    detail: 'Loi 4 matched + score↑',
  },
  {
    id: 'T7',
    desc: 'H2 خاطئة / تلغي',
    input: 'نفترض أن الفرضية الثانية H2 خاطئة لأنها تلغي النتيجة',
    ctx: { docType: 'mixed', actionVerb: 'hypothesize', isNeuromuscular: false, expectedTargets: ['h2'] },
    expect: (r) => r.errors.some((e) => e.code === 'FORBIDDEN_H2_REFUTE'),
    detail: 'FORBIDDEN_H2_REFUTE',
  },
  {
    id: 'T8',
    desc: 'H2 غير ضرورية / غير مدعومة',
    input: 'نفترض أن الفرضية الثانية H2 غير ضرورية وغير مدعومة بالمعطيات',
    ctx: { docType: 'mixed', actionVerb: 'hypothesize', isNeuromuscular: false, expectedTargets: ['h2'] },
    expect: (r) => !r.errors.some((e) => e.code === 'FORBIDDEN_H2_REFUTE'),
    detail: 'pas d’erreur H2',
  },
  {
    id: 'T9',
    desc: 'ACh + قنوات فولطية',
    input: 'يؤدي الأستيل كولين إلى فتح قنوات فولطية أيونية',
    ctx: { docType: 'quantitative', actionVerb: 'describe', isNeuromuscular: true },
    expect: (r) => r.errors.some((e) => e.code === 'FORBIDDEN_VOLTAGE_GATED_ACH'),
    detail: 'FORBIDDEN_VOLTAGE_GATED_ACH',
  },
  {
    id: 'T10',
    desc: 'mixed OK',
    input: 'نلاحظ في الوثيقة الأولى زيادة القيمة بينما في الوثيقة الثانية ثباتها، ويرجع ذلك إلى تنشيط الإنزيم',
    ctx: { docType: 'mixed', actionVerb: 'analyse', isNeuromuscular: false },
    expect: (r) => !r.errors.some((e) => e.severity === 'critical'),
    detail: '0 critical absurde',
  },
  {
    id: 'T11',
    desc: 'fib + tétanie sans dose',
    input: 'نلاحظ ظهور التليف العضلي والتشنج الرمعي معاً',
    ctx: { docType: 'qualitative', actionVerb: 'describe', isNeuromuscular: false },
    expect: (r) => r.errors.some((e) => e.code === 'FIBRILLATION_TETANIE_MIX'),
    detail: 'FIBRILLATION_TETANIE_MIX',
  },
  {
    id: 'T12',
    desc: 'bonne réponse quanti NM',
    input:
      'كلما زاد تركيز الناقل العصبي كلما قصر زمن كمون اللوحة المحركة PPM، إذ تنخفض قيمته من 10 ملي ثانية إلى 5 ملي ثانية، مما يدل على تحرر أكبر للأستيل كولين عبر قنوات مرتبطة بالربيطة',
    ctx: { docType: 'quantitative', actionVerb: 'analyse', isNeuromuscular: true },
    expect: (r) => r.score >= 16 && r.xp === 15 && r.brokenLois.length === 0,
    detail: 'score>=16, xp 15, broken=[]',
  },
];

export interface TestOutcome {
  id: string;
  desc: string;
  detail: string;
  pass: boolean;
  info: string;
}

export function runValidationTests(): TestOutcome[] {
  return T1_T12.map((t) => {
    let r: ValidationResult;
    try {
      r = validateAnswer(t.input, t.ctx);
    } catch (e) {
      return { id: t.id, desc: t.desc, detail: t.detail, pass: false, info: 'EXCEPTION ' + String(e) };
    }
    const pass = t.expect(r);
    const info = `score=${r.score} xp=${r.xp} broken=[${r.brokenLois.join(',')}] codes=[${r.errors.map((e) => e.code).join(',')}]`;
    return { id: t.id, desc: t.desc, detail: t.detail, pass, info };
  });
}
