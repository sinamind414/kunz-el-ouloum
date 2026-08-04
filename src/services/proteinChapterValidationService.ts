import { validateAnswer, type ValidationContext } from '../lib/validation/ValidationEngine';
import { normalizeAr } from '../lib/validation/normalizeAr';

export interface LocalCheckResult {
  valid: boolean;
  code?: string;
  messageAr: string;
}

function includesNormalized(text: string, keyword: string): boolean {
  return normalizeAr(text).includes(normalizeAr(keyword));
}

export function validateKeywordAnswer(
  answer: string,
  requiredKeywords: string[],
  forbiddenKeywords: string[] = [],
): LocalCheckResult {
  const raw = answer.trim();
  if (!raw) {
    return { valid: false, code: 'EMPTY_ANSWER', messageAr: 'الإجابة فارغة.' };
  }

  for (const forbidden of forbiddenKeywords) {
    if (includesNormalized(raw, forbidden)) {
      return {
        valid: false,
        code: 'FORBIDDEN_KEYWORD',
        messageAr: `تجنب استعمال: ${forbidden}`,
      };
    }
  }

  const missing = requiredKeywords.filter((keyword) => !includesNormalized(raw, keyword));
  if (missing.length > 0) {
    return {
      valid: false,
      code: 'MISSING_REQUIRED_KEYWORDS',
      messageAr: `أضف العناصر الأساسية: ${missing.slice(0, 3).join('، ')}`,
    };
  }

  return {
    valid: true,
    messageAr: 'إجابة مقبولة.',
  };
}

export function validateEngineAnswer(
  answer: string,
  ctx: ValidationContext,
): LocalCheckResult {
  const result = validateAnswer(answer, ctx);
  const blockingErrors = result.errors.filter((error) => error.severity !== 'hint');
  if (!result.passed || blockingErrors.length > 0) {
    return {
      valid: false,
      code: blockingErrors[0]?.code ?? result.errors[0]?.code ?? 'ENGINE_REJECTED',
      messageAr: blockingErrors[0]?.messageAr ?? result.errors[0]?.messageAr ?? 'الإجابة تحتاج إلى تحسين.',
    };
  }
  return {
    valid: true,
    messageAr: 'إجابة منهجية مقبولة.',
  };
}

export function validateDualEvidenceAnswer(
  extraction: string,
  justification: string,
  extractionKeywords: string[],
  justificationKeywords: string[],
): {
  extraction: LocalCheckResult;
  justification: LocalCheckResult;
  valid: boolean;
} {
  const extractionResult = validateKeywordAnswer(extraction, extractionKeywords);
  const justificationResult = validateKeywordAnswer(justification, justificationKeywords);

  return {
    extraction: extractionResult,
    justification: justificationResult,
    valid: extractionResult.valid && justificationResult.valid,
  };
}

export function validateHypothesisNaming(
  answer: string,
  accepted: string[],
): LocalCheckResult {
  const raw = answer.trim();
  if (!raw) {
    return { valid: false, code: 'EMPTY_ANSWER', messageAr: 'اكتب تسمية الجزيء.' };
  }
  const ok = accepted.some((item) => includesNormalized(raw, item));
  return ok
    ? { valid: true, messageAr: 'التسمية صحيحة.' }
    : { valid: false, code: 'WRONG_NAMING', messageAr: 'التسمية غير دقيقة بعد.' };
}

export function validateComparisonRow(
  left: string,
  right: string,
  leftExpected: string[],
  rightExpected: string[],
): LocalCheckResult {
  const leftResult = validateKeywordAnswer(left, leftExpected);
  if (!leftResult.valid) {
    return { valid: false, code: leftResult.code, messageAr: `جهة ADN: ${leftResult.messageAr}` };
  }

  const rightResult = validateKeywordAnswer(right, rightExpected);
  if (!rightResult.valid) {
    return { valid: false, code: rightResult.code, messageAr: `جهة ARN: ${rightResult.messageAr}` };
  }

  return { valid: true, messageAr: 'المعيار مكتمل في الجهتين.' };
}

export function validateSequenceOrder(
  orderedIds: string[],
  expectedIds: string[],
): LocalCheckResult {
  if (orderedIds.length !== expectedIds.length) {
    return { valid: false, code: 'WRONG_SEQUENCE_ORDER', messageAr: 'أكمل ترتيب جميع المراحل أولاً.' };
  }

  const valid = orderedIds.every((id, index) => id === expectedIds[index]);
  return valid
    ? { valid: true, messageAr: 'ترتيب المراحل صحيح.' }
    : { valid: false, code: 'WRONG_SEQUENCE_ORDER', messageAr: 'ترتيب المراحل غير صحيح بعد.' };
}

export function validateReasoningCount(
  selectedSymbolCount: 1 | 2 | 3 | undefined,
  rationale: string,
): {
  choice: LocalCheckResult;
  rationale: LocalCheckResult;
  valid: boolean;
} {
  const choice = selectedSymbolCount === 3
    ? { valid: true, messageAr: 'الاختيار الصحيح هو ثلاث قواعد.' }
    : { valid: false, code: 'WRONG_SYMBOL_COUNT', messageAr: 'قاعدة أو قاعدتان لا تكفيان لتشفير 20 حمضاً أمينياً.' };

  const rationaleResult = validateKeywordAnswer(rationale, ['4', '16', '64']);

  return {
    choice,
    rationale: rationaleResult,
    valid: choice.valid && rationaleResult.valid,
  };
}
