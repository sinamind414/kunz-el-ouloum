// methodologyToLetter.test.ts — Pont scoreur → grille de lettres
//
// Contrats éprouvés :
//   1. Tous les critères passés → A+ (forme parfaite)
//   2. 1 critère poids faible empty → C+
//   3. 1 critère poids fort empty (liaison causale/conclusion) → C
//   4. 2 critères empty → D+
//   5. Stuffing sur texte réel → plafond C+
//   6. Science = partial par défaut (⚠️) — jamais tranché par la machine
//   7. Pas de cap darija automatique côté élève
import { describe, it, expect } from 'vitest';
import { methodologyToLetterWithText } from '../methodologyToLetter';
import type { ScoreReport } from '../methodologyScorer';

// ScoreReport minimal (seuls criteriaResults et errorTag sont lus par le pont)
const mkReport = (criteria: { id: string; passed: boolean; errorTag?: string }[]): ScoreReport => ({
  icm: 100,
  criteriaResults: criteria.map(c => ({
    criterionId: c.id,
    label: c.id,
    passed: c.passed,
    feedback: '',
    probe: '',
    errorTag: c.errorTag,
  })),
  detectedErrors: [],
  switchLine: { truth: 'open', choice: null, choiceCorrect: null, violated: false },
  stepReport: [],
  nextPedagogicalStage: 4,
  pedagogicalDecisionAr: '',
});

describe('methodologyToLetterWithText — mapping scoreur → grille', () => {
  it('tous les critères passés → A+', () => {
    const r = mkReport([
      { id: 'an_c1', passed: true, errorTag: 'missing_reference' },
      { id: 'an_c2', passed: true, errorTag: 'missing_unit' },
      { id: 'an_c3', passed: true, errorTag: 'premature_interpretation' },
      { id: 'an_c4', passed: true, errorTag: 'missing_conclusion' },
    ]);
    const out = methodologyToLetterWithText(r, 'نص طويل ومفصل عن التحليل مع الوحدات غ/ل');
    expect(out.letters.methodLetter).toBe('A+');
    expect(out.letters.overallLetter).toBe('A+'); // pas de caps actifs
    expect(out.display.lines[0]).toContain('A+');
  });

  it('1 critère poids faible empty (référence) → C+', () => {
    const r = mkReport([
      { id: 'an_c1', passed: false, errorTag: 'missing_reference' },
      { id: 'an_c2', passed: true, errorTag: 'missing_unit' },
      { id: 'an_c3', passed: true, errorTag: 'premature_interpretation' },
      { id: 'an_c4', passed: true, errorTag: 'missing_conclusion' },
    ]);
    const out = methodologyToLetterWithText(r, 'نص سليم منهجياً');
    expect(out.letters.methodLetter).toBe('C+');
  });

  it('1 critère poids fort empty (liaison causale unsupported_claim) → C', () => {
    const r = mkReport([
      { id: 'ex_c1', passed: true, errorTag: 'missing_reference' },
      { id: 'ex_c2', passed: true, errorTag: 'unsupported_claim' },
      { id: 'ex_c3', passed: false, errorTag: 'unsupported_claim' }, // poids 3
      { id: 'ex_c4', passed: true, errorTag: 'missing_conclusion' },
    ]);
    const out = methodologyToLetterWithText(r, 'نص بدون رابط سببي');
    expect(out.letters.methodLetter).toBe('C');
  });

  it('2 critères empty (dont un poids fort) → D+', () => {
    const r = mkReport([
      { id: 'ex_c1', passed: false, errorTag: 'missing_reference' },
      { id: 'ex_c2', passed: true, errorTag: 'unsupported_claim' },
      { id: 'ex_c3', passed: false, errorTag: 'unsupported_claim' },
      { id: 'ex_c4', passed: false, errorTag: 'missing_conclusion' },
    ]);
    const out = methodologyToLetterWithText(r, '');
    expect(out.letters.methodLetter).toBe('D+');
  });

  it('stuffing détecté sur texte réel → overall plafonné C+', () => {
    const r = mkReport([
      { id: 'ex_c1', passed: true, errorTag: 'missing_reference' },
      { id: 'ex_c2', passed: true, errorTag: 'unsupported_claim' },
      { id: 'ex_c3', passed: true, errorTag: 'unsupported_claim' },
      { id: 'ex_c4', passed: true, errorTag: 'missing_conclusion' },
    ]);
    // Texte de bourrage : un mot dominant (ثلاث مرات في 4 كلمات)
    const stuffingText = 'الضوء الضوء الضوء كثيرا';
    const out = methodologyToLetterWithText(r, stuffingText);
    expect(out.letters.methodLetter).toBe('A+');
    expect(out.letters.ceilings.stuffing).toBe('C+');
    expect(out.letters.overallLetter).toBe('C+');
  });

  it('science = partial par défaut → ⚠️ (jamais tranché par la machine)', () => {
    const r = mkReport([{ id: 'an_c1', passed: true }]);
    const out = methodologyToLetterWithText(r, 'نص');
    expect(out.letters.scienceLetter).toBe('⚠️');
  });

  it('science = ok (validation humaine) → ✅ sans plafond', () => {
    const r = mkReport([{ id: 'an_c1', passed: true }]);
    const out = methodologyToLetterWithText(r, 'نص', { scienceStatus: 'ok' });
    expect(out.letters.scienceLetter).toBe('✅');
    expect(out.letters.ceilings.science).toBeUndefined();
  });

  it('pas de cap darija automatique — ceilings.darija toujours absent', () => {
    const r = mkReport([{ id: 'an_c1', passed: true }]);
    const darijaText = 'الضوء يروح يجي ماشي كي كيفاش';
    const out = methodologyToLetterWithText(r, darijaText);
    expect(out.letters.ceilings.darija).toBeUndefined();
  });

  it('affichage 3 lignes conforme (المنهجية / العلم / العام)', () => {
    const r = mkReport([
      { id: 'an_c1', passed: true, errorTag: 'missing_reference' },
      { id: 'an_c2', passed: false, errorTag: 'missing_unit' },
    ]);
    const out = methodologyToLetterWithText(r, 'نص');
    expect(out.display.lines.length).toBe(3);
    expect(out.display.lines[0]).toMatch(/^المنهجية: /);
    expect(out.display.lines[1]).toMatch(/^العلم: /);
    expect(out.display.lines[2]).toMatch(/^العام: /);
  });
});
