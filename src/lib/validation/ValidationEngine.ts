// ValidationEngine.ts
// Cœur Smartbot — moteur de validation OFFLINE-FIRST, pur TypeScript, 0 LLM, 0 modèle externe.
// Contrat d'API (Speckit §5.2) + ordre des checks obligatoire (§5.3/§5.4).

import { normalizeAr, containsLatin, containsAr, containsAny } from './normalizeAr';
import { detectLevels, matchesSynonym } from './synonyms';
import { getMessageAr } from './messages.ar';
import { mapVerb } from './verbMapping';
import { computePositiveScore, computeXp, DEFAULT_THRESHOLD, LABEL_TRAINING } from './scoring';
import { chercherErratum } from '../../data/manuelErrata';
import { estNonExigible } from '../../data/curriculumOfficial';

export type LoiId = `loi_${0 | 1 | 2 | 3 | 4 | 5}`;

export type DocType = 'quantitative' | 'qualitative' | 'mixed';

export type ActionVerb =
  | 'identify' | 'describe' | 'analyse' | 'interpret' | 'explain'
  | 'compare' | 'hypothesize' | 'validate' | 'synthesize'
  | 'schematize' | 'justify' | 'critique';

export interface ValidationContext {
  docType: DocType;
  actionVerb: ActionVerb;
  isNeuromuscular: boolean;
  qualitativeTrend?: boolean;
  domain?: 'nerveux' | 'hormonal' | 'immuno' | 'genetique' | 'metabo' | 'tectonique' | 'enzyme' | 'autre';
  expectedTargets?: string[];
  /** Énoncé de la question (détection de la copie d'énoncé, audit #01). */
  promptAr?: string;
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
// Les verbes arabes s'accordent en genre avec le sujet : « يزداد التركيز » mais
// « تزداد السرعة ». La liste ne contenait que les formes MASCULINES (préfixe ي),
// si bien qu'une reponse correcte portant sur un sujet feminin (السرعة, الكمية,
// النسبة, درجة الحرارة...) etait faussement sanctionnee MISSING_KULLAMA.
// On couvre donc les deux genres.
const MONOTONE = [
  // masculin
  'يزداد', 'يرتفع', 'يتزايد', 'يزيد', 'تزايد',
  'ينقص', 'ينخفض', 'يقل', 'تناقص',
  'يرتبط', 'ثابت', 'يستقر', 'استقرار',
  // feminin
  'تزداد', 'ترتفع', 'تتزايد', 'تزيد',
  'تنقص', 'تنخفض', 'تقل',
  'ترتبط', 'تستقر',
  // formes nominales (un élève écrit aussi « انخفاض / ارتفاع / زيادة »)
  'انخفاض', 'ارتفاع', 'زيادة', 'نقص', 'ثبات',
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

// ── Cohérence anti-abus (audit #01 : faux positifs du correcteur) ────────────
// Mots-liens de raisonnement : une réponse rédigée en contient au moins un.
// Une « soupe de mots-clés » sans aucun connecteur est sanctionnée.
const CONNECTORS = [
  'لأن', 'حيث', 'إذن', 'إذ', 'بالتالي', 'عندئذ', 'لذلك', 'فإن', 'ثم',
  'بينما', 'في حين', 'كلما', 'بسبب', 'نتيجة', 'بما أن', 'أي أن', 'رغم',
  'على الرغم', 'من أجل', 'عندما', 'عند', 'إلا أن', 'لذا', 'ومن ثم', 'لذلك فإن',
  'يرجع', 'يدل', 'يعني', 'بالتالي فإن', 'يؤدي إلى', 'مما', 'بفعل', 'إذ',
  'كلاهما', 'أما', 'يربط', 'أن',
];

// Marqueurs de relation reconnus comme CONTENU démontré (crédit positif) et
// comme relation satisfaite pour la loi 2 (au-delà des seuls بينما/في حين).
const RELATION_MARKERS = [
  'بينما', 'في حين', 'كلما', 'حيث', 'عندما', 'عند', 'لذلك', 'نتيجة', 'بالتالي',
  'مما', 'إذن', 'لأن', 'بما أن', 'إذ', 'يرجع', 'يعود', 'يؤدي إلى', 'بفعل',
  'فإن', 'نتيجة لذلك', 'كلاهما', 'أما', 'يربط', 'بربطهما', 'أن',
];

/** Séquence absurde : « بلا بلا » (ou variantes), répétition de la même lettre. */
function isGibberishToken(token: string): boolean {
  const t = normalizeAr(token);
  if (/^(بلا)+$/.test(t)) return true;
  if (/^[بل]{3,}$/.test(t) && t.length >= 4) return true;
  if (/^(.)\1{4,}$/i.test(t)) return true; // aaaaa, zzzzz…
  return false;
}

function tokenizeWords(norm: string): string[] {
  return norm.split(/\s+/).map((t) => t.trim()).filter((t) => t.length >= 2 || /^[0-9]+$/.test(t));
}

/**
 * Détection des mots-liens arabes. La sous-chaîne est acceptée pour les
 * marqueurs de ≥ 3 lettres : elle couvre naturellement les préfixes accolés
 * (« وكلاهما », « لأنها »). Les marqueurs de 2 lettres (« أن », « إذ »)
 * exigent la forme exacte (éventuellement préfixée d'une conjonction simple)
 * pour ne pas matcher « الأنسولين » par accident.
 */
function matchMarker(norm: string, tokens: string[], marker: string): boolean {
  const nm = normalizeAr(marker);
  if (nm.length >= 3) return norm.includes(nm);
  const joined = ` ${tokens.map((t) => normalizeAr(t)).join(' ')} `;
  return joined.includes(` ${nm} `) || joined.includes(` و${nm} `) || joined.includes(` ف${nm} `);
}

function hasConnector(norm: string, tokens: string[]): boolean {
  return CONNECTORS.some((c) => matchMarker(norm, tokens, c));
}

function hasRelationMarker(norm: string, tokens: string[]): boolean {
  return RELATION_MARKERS.some((m) => matchMarker(norm, tokens, m));
}

/** Nombre de cibles/vocabulaire attendus distincts présents dans la réponse. */
function countExpectedMatches(raw: string, targets: readonly string[] | undefined): number {
  if (!targets || targets.length === 0) return 0;
  let count = 0;
  for (const t of targets) {
    const found = /[a-zA-Z]/.test(t) ? containsLatin(raw, t) : containsAr(raw, t);
    if (found) count += 1;
  }
  return count;
}

/** Part de mots de la réponse repris tels quels de l'énoncé (copie d'énoncé). */
function promptCopyRatio(rawAnswer: string, promptAr?: string): number {
  if (!promptAr) return 0;
  const aTokens = tokenizeWords(normalizeAr(rawAnswer)).filter((t) => t.length >= 3);
  if (aTokens.length < 4) return 0;
  const pTokens = new Set(tokenizeWords(normalizeAr(promptAr)).filter((t) => t.length >= 3));
  if (pTokens.size === 0) return 0;
  const copied = aTokens.filter((t) => pTokens.has(t)).length;
  return copied / aTokens.length;
}

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

  // Tokens utiles + détection de séquences absurdes (« بلابلا »…).
  const tokens = tokenizeWords(norm);
  const wordCount = tokens.length;
  const gibberish = tokens.some(isGibberishToken);

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

  // 0b) GIBBERISH — une réponse absurde est privée de tout crédit de contenu.
  checksRun.push('GIBBERISH');
  if (gibberish) {
    pushError(errors, broken, 'GIBBERISH', 'critical', null);
  }

  // 1) TOO_SHORT
  checksRun.push('TOO_SHORT');
  if (raw.length < 8) {
    pushError(errors, broken, 'TOO_SHORT', 'major', null);
  }

  // 2) MISSING_VALUE_UNIT (describe/analyse + non qualitative pure)
  const needsValueUnit = (verb === 'describe' || verb === 'analyse') && docType !== 'qualitative';
  checksRun.push('MISSING_VALUE_UNIT');
  let valueUnitCredit = 0;
  if (needsValueUnit) {
    if (!hasDigit(raw) && !hasUnit(raw)) {
      pushError(errors, broken, 'MISSING_VALUE_UNIT', 'major', verb === 'describe' ? 1 : 2);
    } else {
      // Barème positif : la valeur + unité attendue est un contenu GAGNÉ.
      valueUnitCredit = 1;
    }
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

  // 4) Qualitative trend: allow monotone language without requiring a value.
  // Pure qualitative comparison: forbid كلما and require بينما/في حين.
  checksRun.push('KULLAMA_FORBID');
  if (docType === 'qualitative') {
    if (ctx.qualitativeTrend) {
      if ((verb === 'analyse' || verb === 'compare') && !containsAny(raw, KULLAMA) && !hasMonotone(raw)) {
        pushError(errors, broken, 'MISSING_KULLAMA', 'major', 2);
      } else {
        matched.add(2);
      }
    } else if (containsAny(raw, KULLAMA)) {
      pushError(errors, broken, 'FORBIDDEN_KULLAMA', 'major', 2);
    } else {
      matched.add(2);
      // Identifier / décrire / schématiser nomment des éléments : la clause de
      // relation (loi 2) n'est pas exigée pour ces verbes de restitution.
      const relationRequired = !['identify', 'describe', 'schematize'].includes(verb);
      if (relationRequired && !hasRelationMarker(norm, tokens)) {
        pushError(errors, broken, 'MISSING_RELATION_MARKER', 'minor', 2);
      }
    }
  }

  // 5) Mixed soft
  checksRun.push('MIXED_SOFT');
  if (docType === 'mixed') {
    if (hasRelationMarker(norm, tokens)) {
      // Document double : une relation réelle entre les deux volets est un
      // contenu démontré (crédit positif), pas une simple absence d'erreur.
      matched.add(2);
    } else {
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

  // 13) Cohérence anti-abus — soupe de mots-clés sans connecteur logique.
  checksRun.push('MISSING_CONNECTORS');
  if (wordCount >= 6 && !hasConnector(norm, tokens)) {
    pushError(errors, broken, 'MISSING_CONNECTORS', 'minor', null);
  }

  // 14) Copie de l'énoncé : la réponse ne fait que répéter la question.
  checksRun.push('COPY_PROMPT');
  if (promptCopyRatio(raw, ctx.promptAr) >= 0.7) {
    pushError(errors, broken, 'COPY_PROMPT', 'major', null);
  }

  // 15) Errata officiel (دليل الأستاذ) — HINT non pénalisant : une forme
  // imprimée à tort dans le manuel n'est JAMAIS sanctionnée chez l'élève ;
  // on signale simplement la forme correcte officielle (severity hint = 0 pt).
  checksRun.push('ERRATA_OFFICIEL');
  const erratum = chercherErratum(raw);
  if (erratum) {
    errors.push({
      code: 'ERRATA_MANUEL',
      severity: 'hint',
      loi: null,
      messageAr: getMessageAr('ERRATA_MANUEL'),
      found: erratum.faux,
      expected: erratum.formeCorrecte,
    });
  }

  // 16) Non-exigibles BAC (التدرج السنوي p.6 : « يمتحن التلميذ على ما جاء في
  // المنهاج وليس على المحتوى المعرفي الموجود في الكتاب المدرسي ») — HINT :
  // un terme du manuel officiellement écarté du BAC est crédité à sa juste
  // valeur (jamais exigé), sans pénalité pour l'élève qui l'emploie.
  checksRun.push('NON_EXIGIBLES');
  for (const t of ctx.expectedTargets ?? []) {
    const nonExigible = /[a-zA-Z]/.test(t) ? containsLatin(raw, t) && estNonExigible(t) : containsAr(raw, t) ? estNonExigible(t) : null;
    if (nonExigible) {
      errors.push({
        code: 'NON_EXIGIBLE_BAC',
        severity: 'hint',
        loi: null,
        messageAr: getMessageAr('NON_EXIGIBLE_BAC'),
        found: t,
        expected: nonExigible.raison,
      });
      break; // un seul HINT suffit, pas de spam
    }
  }

  // Crédits positifs de contenu (barème positif, audit #01) :
  // - vocabulaire attendu du domaine (au moins 1 terme présent) ;
  // - marqueur de relation réel (حيث، لأن، مما يدل…).
  const vocabCredit = countExpectedMatches(raw, ctx.expectedTargets) >= 1 ? 1 : 0;
  const relationCredit = hasRelationMarker(norm, tokens) ? 1 : 0;

  // Suggestions (max 3) pointant vers القانون رقم X
  const suggestions = Array.from(new Set(errors.filter((e) => e.loi !== null).map((e) => `راجع القانون رقم ${e.loi}`))).slice(0, 3);

  return finalize(errors, broken, matched, checksRun, raw, norm, ctx, maxScore, threshold, suggestions, valueUnitCredit, vocabCredit, relationCredit, gibberish, wordCount);
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
  suggestions: string[],
  valueUnitCredit: number,
  vocabCredit: number,
  relationCredit: number,
  gibberish: boolean,
  wordCount: number,
): ValidationResult {
  // Barème POSITIF (audit #01) : le score est gagné par les dimensions de
  // contenu démontrées (lois structurelles, valeur+unité, vocabulaire du
  // domaine, marqueurs de relation), jamais accordé par défaut.
  const credits = matched.size + valueUnitCredit + vocabCredit + relationCredit;
  const score = computePositiveScore({ errors, credits, gibberish, wordCount, maxScore });
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
