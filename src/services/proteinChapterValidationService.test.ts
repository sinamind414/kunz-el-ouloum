import { describe, expect, it } from 'vitest';
import {
  validateComparisonRow,
  validateDualEvidenceAnswer,
  validateHypothesisNaming,
  validateKeywordAnswer,
  validateReasoningCount,
  validateSequenceOrder,
} from './proteinChapterValidationService';

describe('proteinChapterValidationService', () => {
  it('valide une réponse à mots-clés', () => {
    const result = validateKeywordAnswer(
      'نلاحظ مورثات مختلفة وبروتينات مختلفة',
      ['مورثات مختلفة', 'بروتينات مختلفة'],
    );
    expect(result.valid).toBe(true);
  });

  it('rejette une réponse avec mots-clés manquants', () => {
    const result = validateKeywordAnswer(
      'نلاحظ مورثات فقط',
      ['مورثات مختلفة', 'بروتينات مختلفة'],
    );
    expect(result.valid).toBe(false);
    expect(result.code).toBe('MISSING_REQUIRED_KEYWORDS');
  });

  it('rejette ربما dans une hypothèse keyword-based', () => {
    const result = validateKeywordAnswer(
      'ربما يوجد جزيء وسيط',
      ['جزيء', 'وسيط'],
      ['ربما'],
    );
    expect(result.valid).toBe(false);
    expect(result.code).toBe('FORBIDDEN_KEYWORD');
  });

  it('valide extraction + justification ensemble', () => {
    const result = validateDualEvidenceAnswer(
      'يتم تركيب البروتين على مستوى الريبوزومات',
      'لأن الإشعاع ظهر في هذه المناطق في الوثيقتين',
      ['الريبوزومات'],
      ['الإشعاع', 'الوثيقتين'],
    );
    expect(result.valid).toBe(true);
  });

  it('valide la nomination ARNm', () => {
    const result = validateHypothesisNaming('ARN رسول', ['ARNm', 'ARN رسول']);
    expect(result.valid).toBe(true);
  });

  it('valide une ligne de comparaison ADN/ARN', () => {
    const result = validateComparisonRow(
      'سكر منقوص الأكسجين',
      'سكر ريبوز',
      ['منقوص الأكسجين'],
      ['ريبوز'],
    );
    expect(result.valid).toBe(true);
  });

  it('valide un ordre exact de séquence', () => {
    const result = validateSequenceOrder(
      ['binding', 'opening', 'templating'],
      ['binding', 'opening', 'templating'],
    );
    expect(result.valid).toBe(true);
  });

  it('rejette un ordre faux de séquence', () => {
    const result = validateSequenceOrder(
      ['opening', 'binding', 'templating'],
      ['binding', 'opening', 'templating'],
    );
    expect(result.valid).toBe(false);
    expect(result.code).toBe('WRONG_SEQUENCE_ORDER');
  });

  it('valide le raisonnement codon à 3 bases', () => {
    const result = validateReasoningCount(3, '4 ثم 16 ثم 64، لذلك نحتاج ثلاث قواعد');
    expect(result.valid).toBe(true);
  });

  it('rejette un mauvais choix de nombre de bases', () => {
    const result = validateReasoningCount(2, '4 ثم 16 فقط');
    expect(result.valid).toBe(false);
    expect(result.choice.code).toBe('WRONG_SYMBOL_COUNT');
  });
});
