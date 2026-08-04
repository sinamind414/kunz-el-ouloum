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
