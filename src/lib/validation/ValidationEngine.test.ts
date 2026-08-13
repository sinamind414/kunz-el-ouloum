// ValidationEngine.test.ts
// Spec vitest (Speckit §9 / §12). Exécutée par `npm run test:vitest`.
import { describe, it, expect } from 'vitest';
import { runValidationTests } from './validationTests';
import { validateAnswer } from './ValidationEngine';

describe('ValidationEngine T1–T12', () => {
  const results = runValidationTests();
  for (const r of results) {
    it(`${r.id} · ${r.desc} — ${r.detail}`, () => {
      expect(r.pass, `${r.id} a échoué: ${r.info}`).toBe(true);
    });
  }
});

describe('ValidationEngine qualitative trends', () => {
  it('accepts a trend relation without inventing a numeric value or unit', () => {
    const result = validateAnswer(
      'كلما زاد تركيز الكورار كلما انخفض الانقباض العضلي',
      {
        docType: 'qualitative',
        qualitativeTrend: true,
        actionVerb: 'analyse',
        isNeuromuscular: false,
      },
    );

    expect(result.errors.some((error) => error.code === 'MISSING_VALUE_UNIT')).toBe(false);
    expect(result.errors.some((error) => error.code === 'FORBIDDEN_KULLAMA')).toBe(false);
    expect(result.matchedLois).toContain(2);
  });
});

// Regression : les verbes de tendance au FEMININ etaient absents de MONOTONE, si
// bien qu'une reponse correcte sur un sujet feminin (السرعة, النسبة...) recevait
// a tort MISSING_KULLAMA. Mesure : 4 des 6 formes testees etaient rejetees.
describe('ValidationEngine — accord en genre des verbes de tendance', () => {
  const ctx = {
    docType: 'quantitative',
    actionVerb: 'analyse',
    isNeuromuscular: false,
  } as const;

  const feminins = ['تزداد', 'ترتفع', 'تنخفض', 'تقل', 'تستقر'];
  const masculins = ['يزداد', 'يرتفع', 'ينخفض', 'يقل', 'يستقر'];

  it.each([...feminins, ...masculins])(
    'accepte « %s » comme marqueur de tendance quantitative',
    (verbe) => {
      const res = validateAnswer(`${verbe} السرعة لتبلغ 13 كم/ث`, ctx);
      expect(res.errors.map((e) => e.code)).not.toContain('MISSING_KULLAMA');
    },
  );

  it('sanctionne toujours une analyse quantitative sans marqueur de tendance', () => {
    const res = validateAnswer('السرعة تساوي 13 كم/ث في هذه الطبقة', ctx);
    expect(res.errors.map((e) => e.code)).toContain('MISSING_KULLAMA');
  });
});
