// ValidationEngine.ts
// Cœur Smartbot — moteur de validation OFFLINE-FIRST, pur TypeScript, 0 LLM, 0 modèle externe.
// Contrat d'API (Speckit §5.2) + ordre des checks obligatoire (§5.3/§5.4).

import { normalizeAr, containsLatin, containsAr, containsAny } from './normalizeAr';
import { detectLevels, matchesSynonym } from './synonyms';
import { getMessageAr } from './messages.ar';
import { mapVerb } from './verbMapping';
import { computeScore, computeXp, DEFAULT_THRESHOLD, LABEL_TRAINING } from './scoring';

export type LoiId = `loi_${0 | 1 | 2 | 3 | 4 | 5}`;

export type DocType = 'quantitative' | 'qualitative' | 'mixed';

export type ActionVerb =
  | 'identify' | 'describe' | 'analyse' | 'interpret'
  | 'compare' | 'hypothesize' | 'validate' | 'synthesize'
  | 'schematize' | 'justify' | 'critique';

export interface ValidationContext {
  docType: DocType;
  actionVerb: ActionVerb;
  isNeuromuscular: boolean;
  domain?: 'nerveux' | 'hormonal' | 'immuno' | 'genetique' | 'metabo' | 'tectonique' | 'enzyme' | 'autre';
  expectedTargets?: string[];
  locale?: 'ar';
  maxScore?: number;
}

export type ErrorSeverity = 'critical' | 'major' | 'minor' | 'hint';

export interface ValidationError {
  code: string;
  severity: ErrorSeverity;
  loi: 0 | 1 | 2 | 3 | 4 | 5 | null;
  messageAr: string;
  messageFr?: string;
  found?: string;
  expected?: string;
}

export interface ValidationResult {
  score: number;
  maxScore: number;
  passed: boolean;
  threshold: number;
  errors: ValidationError[];
  matchedLois: number[];
  brokenLois: number[];
  suggestions: string[];
  templateHint?: string;
  guessVerb?: string;
  xp: number;
  label: string;
  meta: {
    normalizedLength: number;
    docType: DocType;
    actionVerb: ActionVerb;
    checksRun: string[];
  };
}

// ── Tokens de détection ────────────────────────────────────────────────────────
const KULLAMA = ['كلما'];
const QUALI_MARKERS = ['بينما', 'في حين', 'في حين'];
const MONOTONE = [
  'يزداد', 'يرتفع', 'يتزايد', 'يزيد', 'تزايد',
  'ينقص', 'ينخفض', 'يقل', 'تناقص',
  'يرتبط', 'ثابت', 'يستقر', 'استقرار',
];
const VALUE_UNIT = [
  'ثا', 'ثانية', 'دقيقه', 'دقيقة', 'ساعه', 'ساعة',
  'مل', 'لتر', 'غ', 'ملغ', 'مول', 'جول', 'فولط', 'ميلي',
  'mg', 'ml', 'mol', 'mv', 'ms', 's', 'min', 'g', 'l', 'kj', 'j',
  'درجه', 'درجة', '%', '٪', 'ملي ثانيه',
];
const H2_REFUTE = ['خاطئ', 'تلغي', 'ننفي', 'باطل', 'غير صحيح'];
const H2_SOFT_OK = ['غير ضرورية', 'غير ضروريه', 'غير مدعومة', 'غير مدعومه', 'غير مؤكدة', 'غير ممكنة'];
const FIBRILLATION = ['تليف', 'تليفات', 'التليف العضلي'];
const TETANIE = ['تشنج', 'التشنج الرمعي', 'تشنج رمعي'];
const DOSE = ['جرعة', 'تركيز عال', 'تركيز عالٍ', 'dose'];
const SYNTH_BLOCKS = ['وثيقة 1', 'الوثيقة الأولى', 'الوثيقة 1', 'الوثيقة الثانية', 'وثيقة 2', 'يربط', 'تركيب', 'بين الوثيقتين'];
const TEXT_STRUCTURE = ['المقدمة', 'التمهيد', 'الجسم', 'الخاتمة', 'نستنتج'];

function hasDigit(raw: string): boolean {
  return /[0-9\u0660-\u0669]/.test(raw);
}

function hasUnit(raw: string): boolean {
  const norm = normalizeAr(raw);
  return VALUE_UNIT.some((u) => {
    if (/[a-zA-Z%]/.test(u)) return containsLatin(raw, u) || norm.includes(u);
    return norm.includes(normalizeAr(u));
  });
}

function hasMonotone(raw: string): boolean {
  return MONOTONE.some((m) => containsAr(raw, m));
}

function pushError(
  errors: ValidationError[],
  broken: Set<number>,
  code: string,
  severity: ErrorSeverity,
  loi: 0 | 1 | 2 | 3 | 4 | 5 | null,
  found?: string
): void {
  errors.push({ code, severity, loi, messageAr: getMessageAr(code), found });
  if (loi !== null) broken.add(loi);
}

/**
 * Valide une réponse ouverte selon le contexte (doc + verbe). Ordre des checks
 * strict (Speckit §5.3). Aucune dépendance réseau/LLM.
 */
export function validateAnswer(rawAnswer: string, ctx: ValidationContext): ValidationResult {
  const maxScore = ctx.maxScore ?? 20;
  const threshold = DEFAULT_THRESHOLD;
  const errors: ValidationError[] = [];
  const checksRun: string[] = [];
  const broken = new Set<number>();
  const matched = new Set<number>();

  const raw = (rawAnswer || '').trim();
  const norm = normalizeAr(raw);
  const verb = ctx.actionVerb;
  const docType = ctx.docType;

  // 0) EMPTY
  checksRun.push('EMPTY_ANSWER');
  if (norm.length === 0) {
    return {
      score: 0,
      maxScore,
      passed: false,
      threshold,
      errors: [{ code: 'EMPTY_ANSWER', severity: 'critical', loi: null, messageAr: getMessageAr('EMPTY_ANSWER') }],
      matchedLois: [],
      brokenLois: [],
      suggestions: [],
      xp: 0,
      label: LABEL_TRAINING,
      meta: { normalizedLength: 0, docType: ctx.docType, actionVerb: ctx.actionVerb, checksRun },
    };
  }

  // 1) TOO_SHORT
  checksRun.push('TOO_SHORT');
  if (raw.length < 8) {
    pushError(errors, broken, 'TOO_SHORT', 'major', null);
  }

  // 2) MISSING_VALUE_UNIT (describe/analyse + non qualitative pure)
  const needsValueUnit = (verb === 'describe' || verb === 'analyse') && docType !== 'qualitative';
  checksRun.push('MISSING_VALUE_UNIT');
  if (needsValueUnit && !hasDigit(raw) && !hasUnit(raw)) {
    pushError(errors, broken, 'MISSING_VALUE_UNIT', 'major', verb === 'describe' ? 1 : 2);
  }

  // 3) Kullama require (quantitative + analyse/compare)
  checksRun.push('KULLAMA_REQUIRE');
  if (docType === 'quantitative' && (verb === 'analyse' || verb === 'compare')) {
    const hasKullama = containsAny(raw, KULLAMA);
    if (!hasKullama && !hasMonotone(raw)) {
      pushError(errors, broken, 'MISSING_KULLAMA', 'major', 2);
    } else {
      matched.add(2);
    }
  }

  // 4) Kullama forbid + require بينما/في حين (qualitative)
  checksRun.push('KULLAMA_FORBID');
  if (docType === 'qualitative') {
    if (containsAny(raw, KULLAMA)) {
      pushError(errors, broken, 'FORBIDDEN_KULLAMA', 'major', 2);
    } else {
      matched.add(2);
      if (!containsAny(raw, QUALI_MARKERS)) {
        pushError(errors, broken, 'MISSING_RELATION_MARKER', 'minor', 2);
      }
    }
  }

  // 5) Mixed soft
  checksRun.push('MIXED_SOFT');
  if (docType === 'mixed') {
    if (!containsAny(raw, [...QUALI_MARKERS, ...KULLAMA])) {
      errors.push({ code: 'MIXED_HINT', severity: 'hint', loi: 2, messageAr: getMessageAr('MIXED_HINT') });
    }
  }

  // 6) PPM / PPSE (isNeuromuscular)
  checksRun.push('PPM_PPSE');
  if (ctx.isNeuromuscular) {
    if (containsAny(raw, ['ppse']) || containsAr(raw, 'كمون ما بعد التشابك')) {
      pushError(errors, broken, 'WRONG_PPM_PPSE', 'critical', 3);
    } else if (containsLatin(raw, 'ppm') || containsAr(raw, 'كمون اللوحة المحركة')) {
      matched.add(3);
    } else {
      pushError(errors, broken, 'MISSING_PPM', 'minor', 3);
    }
  }

  // 7) ACh voltage forbid
  checksRun.push('ACH_VOLTAGE');
  if (matchesSynonym(raw, 'ach') && (containsAr(raw, 'قنوات فولطية') || containsLatin(raw, 'voltage'))) {
    pushError(errors, broken, 'FORBIDDEN_VOLTAGE_GATED_ACH', 'critical', 3);
  } else if (matchesSynonym(raw, 'ach')) {
    matched.add(3);
  }

  // 8) Loi #4 : no ربما · require نفترض · molecular target
  checksRun.push('LOI4_HYPOTHESE');
  if (verb === 'hypothesize') {
    if (containsAr(raw, 'ربما')) {
      pushError(errors, broken, 'FORBIDDEN_RUBBAMA', 'critical', 4);
    }
    if (!containsAr(raw, 'نفترض')) {
      pushError(errors, broken, 'MISSING_NAFTARID', 'major', 4);
    } else {
      // cible moléculaire
      const targets = ctx.expectedTargets && ctx.expectedTargets.length
        ? ctx.expectedTargets
        : ['إنزيم', 'مستقبل', 'قناة', 'أستيل كولين', 'حمض', 'بروتين', 'h2', 'adn', 'arn'];
      const hasTarget = targets.some((t) =>
        /[a-zA-Z]/.test(t) ? containsLatin(raw, t) : containsAr(raw, t)
      ) || matchesSynonym(raw, 'enzyme') || matchesSynonym(raw, 'recepteur') || matchesSynonym(raw, 'canal');
      if (hasTarget) {
        matched.add(4);
      } else {
        pushError(errors, broken, 'MISSING_TARGET', 'minor', 4);
      }
    }
  }

  // 9) H2 soft refute
  checksRun.push('H2_SOFT');
  if (containsLatin(raw, 'h2') || containsAr(raw, 'الفرضية الثانية') || containsAr(raw, 'الفرضية 2')) {
    if (containsAny(raw, H2_REFUTE)) {
      pushError(errors, broken, 'FORBIDDEN_H2_REFUTE', 'major', 5);
    } else if (containsAny(raw, H2_SOFT_OK)) {
      errors.push({ code: 'H2_SOFT_OK', severity: 'hint', loi: 5, messageAr: getMessageAr('H2_SOFT_OK') });
      matched.add(5);
    }
  }

  // 10) Fibrillation / tétanie mix
  checksRun.push('FIB_TETANIE');
  if (containsAny(raw, FIBRILLATION) && containsAny(raw, TETANIE) && !containsAny(raw, DOSE)) {
    pushError(errors, broken, 'FIBRILLATION_TETANIE_MIX', 'major', 3);
  }

  // 11) 3 niveaux (interpret)
  checksRun.push('LEVELS');
  if (verb === 'interpret' || verb === 'justify') {
    const levels = detectLevels(raw);
    if (levels.length < 2) {
      pushError(errors, broken, 'MISSING_LEVELS', 'minor', 3);
    } else {
      matched.add(3);
    }
  }

  // 12) Synthesis 3 blocs (validate / synthesize)
  checksRun.push('SYNTH_BLOCKS');
  if (verb === 'validate' || verb === 'synthesize') {
    if (!containsAny(raw, SYNTH_BLOCKS) && !containsAny(raw, TEXT_STRUCTURE)) {
      pushError(errors, broken, 'MISSING_BLOCKS', 'minor', 5);
    } else {
      matched.add(5);
    }
  }

  // Suggestions (max 3) pointant vers القانون رقم X
  const suggestions = Array.from(new Set(errors.filter((e) => e.loi !== null).map((e) => `راجع القانون رقم ${e.loi}`))).slice(0, 3);

  return finalize(errors, broken, matched, checksRun, raw, norm, ctx, maxScore, threshold, suggestions);
}

function finalize(
  errors: ValidationError[],
  broken: Set<number>,
  matched: Set<number>,
  checksRun: string[],
  raw: string,
  norm: string,
  ctx: ValidationContext,
  maxScore: number,
  threshold: number,
  suggestions: string[]
): ValidationResult {
  const score = computeScore(errors, maxScore);
  const xp = computeXp(score);
  const guess = mapVerb(raw);
  return {
    score,
    maxScore,
    passed: score >= threshold,
    threshold,
    errors,
    matchedLois: Array.from(matched).sort((a, b) => a - b),
    brokenLois: Array.from(broken).sort((a, b) => a - b),
    suggestions,
    templateHint: undefined,
    guessVerb: guess?.actionVerb,
    xp,
    label: LABEL_TRAINING,
    meta: {
      normalizedLength: norm.length,
      docType: ctx.docType,
      actionVerb: ctx.actionVerb,
      checksRun,
    },
  };
}

export { LABEL_TRAINING };
