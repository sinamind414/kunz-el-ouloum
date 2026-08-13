// src/services/documentEvidenceService.ts
// P1.4 — Validation de la trace documentaire (Speckit DOCUMENTS_VIVANTS §5-§6).
// Règle minimale : ValidationEngine réussi + score >=70 + au moins une preuve
// attendue retrouvée + au moins un terme de vocabulaire retrouvé.

import {
  LearningError,
  MasteryEvidence,
  recordEvidence,
  loadStore,
  writeRaw,
  STORAGE_KEYS,
  computeNextReviewAt,
} from '../data/store';
import type { ValidationResult } from '../lib/validation/ValidationEngine';
import type { DocumentPracticeContext } from '../data/documentPracticeContexts';
import { normalizeArabic } from '../utils/arabicNormalize';
import { scheduleSpacedRecall } from './spacedRecallService';

const PASS_THRESHOLD = 70;

export interface DocumentTraceInput {
  context: DocumentPracticeContext;
  answer: string;
  validationResult: ValidationResult;
}

export interface DocumentTraceResult {
  valid: boolean;
  percentage: number;
  foundEvidence: string[];
  missingEvidence: string[];
  vocabularyFound: string[];
  structuredCriteria: {
    observation: boolean;
    mechanism: boolean;
    conclusion: boolean;
  };
}

function normalizeList(items: string[]): string[] {
  return items.map((i) => normalizeArabic(i));
}

// #39 — Les `expectedEvidence` sont des PHRASES de correction (68 % font 4 mots
// ou plus), pas des mots-clés. Les chercher en sous-chaîne littérale exigeait de
// l'élève qu'il reproduise le corrigé mot pour mot : 10 des 11 corrections
// OFFICIELLES du corpus étaient refusées par l'app elle-même, avec création
// d'une LearningError et d'un rappel correctif à tort.
// On exige donc une COUVERTURE des mots porteurs de sens de la phrase attendue.
const EVIDENCE_STOPWORDS = new Set([
  'في', 'من', 'الى', 'على', 'عن', 'مع', 'هذا', 'هذه', 'ثم', 'لان', 'التي',
  'الذي', 'هو', 'هي', 'عند', 'بين', 'كل', 'قد', 'ان', 'او', 'يتم', 'يدل', 'حيث',
]);

// Seuil calibré dans les DEUX sens sur le corpus réel : à 0,6 les 11/11
// corrections officielles sont reconnues et 0/11 réponse hors-sujet ne l'est.
const EVIDENCE_COVERAGE_RATIO = 0.6;

function contentTokens(phrase: string): string[] {
  return normalizeArabic(phrase)
    .split(' ')
    .filter((t) => t.length >= 3 && !EVIDENCE_STOPWORDS.has(t));
}

// Vrai si la réponse normalisée couvre assez de mots porteurs de la phrase attendue.
function coversPhrase(normAnswer: string, phrase: string): boolean {
  // Un critere redige comme une DISJONCTION ("الوظيفة أو المرض") enumere des
  // alternatives acceptables : exiger la couverture des deux branches revenait a
  // exiger "la fonction ET la maladie". On evalue chaque branche separement.
  const branches = phrase.split(/\s+أو\s+/).filter((b) => b.trim().length > 0);
  if (branches.length > 1) return branches.some((b) => coversPhrase(normAnswer, b));

  const tokens = contentTokens(phrase);
  // Terme court/technique (ARNm, Vmax…) : on garde la correspondance littérale.
  if (tokens.length === 0) return normAnswer.includes(normalizeArabic(phrase));
  const hits = tokens.filter((t) => normAnswer.includes(t)).length;
  return hits / tokens.length >= EVIDENCE_COVERAGE_RATIO;
}

function containsAnyNormalized(answer: string, terms: string[]): boolean {
  return terms.some((term) => coversPhrase(answer, term));
}

function validateStructuredCriteria(context: DocumentPracticeContext, normAnswer: string) {
  if (!context.criteria) {
    return { observation: true, mechanism: true, conclusion: true };
  }

  const observation = containsAnyNormalized(normAnswer, context.criteria.evidence);
  const mechanism = containsAnyNormalized(normAnswer, context.criteria.mechanism ?? []);
  const conclusion = containsAnyNormalized(normAnswer, context.criteria.conclusion ?? []);
  return { observation, mechanism, conclusion };
}

// #41 — Garde-fou du VERDICT AFFICHÉ à l'élève.
//
// Mesuré sur les données réelles : ValidationEngine note la FORME
// méthodologique et non le fond ; une réponse hors-sujet ou « لا اعرف الجواب »
// obtenait 80-95 % et l'étiquette « مقبول » sur les 31 questions atteignables.
//
// On ne peut pas réutiliser validateDocumentTrace() pour cet affichage : sa
// règle stricte (destinée à la trace de maîtrise) refuse 8 corrections
// OFFICIELLES sur 31. On mesure donc un simple recouvrement lexical avec les
// notions attendues, calibré dans les deux sens sur les données réelles :
//   - pire correction officielle ....... 0,538
//   - meilleur négatif (155 mesures) ... 0,042
// Le seuil est placé dans cet intervalle, près du bruit, pour rester
// accueillant envers une réponse d'élève reformulée.
const DISPLAY_COVERAGE_RATIO = 0.15;

/**
 * Vrai si la réponse mobilise réellement les notions du document.
 * Sert à conditionner le verdict montré à l'élève, jamais le score du moteur.
 */
export function answerHasDocumentContent(
  answer: string,
  context: DocumentPracticeContext,
  extraReference = ''
): boolean {
  const reference = [...(context.expectedEvidence ?? []), extraReference].join(' ');
  const expected = Array.from(new Set(contentTokens(reference))).filter((t) => t.length >= 4);
  if (expected.length === 0) return true;
  const normAnswer = normalizeArabic(answer);
  const hits = expected.filter((t) => normAnswer.includes(t)).length;
  return hits / expected.length >= DISPLAY_COVERAGE_RATIO;
}

export function validateDocumentTrace(input: DocumentTraceInput): DocumentTraceResult {
  const { context, answer, validationResult } = input;
  const normAnswer = normalizeArabic(answer);

  const foundEvidence = context.expectedEvidence.filter((e) => coversPhrase(normAnswer, e));
  const missingEvidence = context.expectedEvidence.filter((e) => !coversPhrase(normAnswer, e));

  const vocabNorm = normalizeList(context.vocabulary);
  const vocabularyFound = context.vocabulary.filter((_, i) => normAnswer.includes(vocabNorm[i]));
  const structuredCriteria = validateStructuredCriteria(context, normAnswer);

  // Convertir le score du moteur (/maxScore) en pourcentage pour le seuil 70.
  const percentage = Math.round((validationResult.score / validationResult.maxScore) * 100);
  const passed = validationResult.passed && percentage >= PASS_THRESHOLD;
  const valid =
    passed &&
    foundEvidence.length >= 1 &&
    vocabularyFound.length >= 1 &&
    structuredCriteria.observation &&
    structuredCriteria.mechanism &&
    structuredCriteria.conclusion;

  return { valid, percentage, foundEvidence, missingEvidence, vocabularyFound, structuredCriteria };
}

// Échec : LearningError document/methodology (cadence J+1, rappel correctif).
function upsertDocumentError(
  errors: LearningError[],
  context: DocumentPracticeContext,
  ruleIds: string[],
  now: number
): LearningError[] {
  const kind: LearningError['kind'] = context.reflexId ? 'methodology' : 'document';
  const existing = errors.find(
    (e) => e.kind === kind && e.conceptId === context.conceptId && e.reflexId === context.reflexId
  );
  if (existing) {
    return errors.map((e) =>
      e === existing
        ? {
            ...e,
            count: e.count + 1,
            lastSeenAt: now,
            ruleIds: Array.from(new Set([...e.ruleIds, ...ruleIds])),
            resolvedAt: undefined,
            reviewStartedAt: now,
            reviewStage: 0,
            nextReviewAt: computeNextReviewAt(now, 0, now),
          }
        : e
    );
  }
  const err: LearningError = {
    id: `err_${context.conceptId}_${context.reflexId ?? 'doc'}_${now}`,
    kind,
    conceptId: context.conceptId,
    unitId: context.unitId,
    reflexId: context.reflexId,
    ruleIds,
    labelAr: context.reflexId ? `صعوبة في ${context.goalAr}` : `وثيقة: ${context.goalAr}`,
    count: 1,
    createdAt: now,
    lastSeenAt: now,
    reviewStartedAt: now,
    reviewStage: 0,
    nextReviewAt: computeNextReviewAt(now, 0, now),
  };
  return [...errors, err];
}

export interface DocumentEvidenceOutcome {
  evidence: MasteryEvidence | null;
  errorCreated: boolean;
  store: ReturnType<typeof loadStore>;
  trace: DocumentTraceResult;
}

// Enregistre la preuve documentaire réelle OU l'erreur liée.
// Si une erreur existe pour ce concept+reflex, lie la preuve via relatedErrorIds
export function recordDocumentTrace(input: DocumentTraceInput): DocumentEvidenceOutcome {
  const { context, validationResult } = input;
  const trace = validateDocumentTrace(input);
  const now = Date.now();
  const percentage = trace.percentage ?? Math.round((validationResult.score / validationResult.maxScore) * 100);

  // Pas de preuve si trace invalide (règle minimale non respectée).
  if (!trace.valid) {
    const ruleIds = [
      ...validationResult.errors.map((e) => e.code),
      ...trace.missingEvidence.map((m) => `MISSING_EVIDENCE:${m}`),
    ];
    const store = loadStore();
    const errors = upsertDocumentError(store.learningErrors, context, ruleIds, now);
    const next = { ...store, learningErrors: errors };
    writeRaw(STORAGE_KEYS.learningErrors, next.learningErrors);
    return { evidence: null, errorCreated: true, store: next, trace };
  }

  // Chercher une erreur existante pour ce concept+reflex afin de la lier
  const store = loadStore();
  const existingError = store.learningErrors.find(
    (e) => e.kind === (context.reflexId ? 'methodology' : 'document') &&
          e.conceptId === context.conceptId &&
          e.reflexId === context.reflexId &&
          e.resolvedAt == null
  );

  const evidence: MasteryEvidence = {
    id: `evidence_doc_${context.exerciseId}_${context.questionId}_${now}`,
    conceptId: context.conceptId,
    dimension: 'document',
    reflexId: context.reflexId,
    source: 'document_analysis',
    score: percentage,
    createdAt: now,
    relatedErrorIds: existingError ? [existingError.id] : undefined,
  };
  recordEvidence(evidence);
  const scheduled = scheduleSpacedRecall({
    conceptId: context.conceptId,
    reflexId: context.reflexId ?? 'analyse',
    sourceEvidenceId: evidence.id,
    relatedErrorId: existingError?.id,
    now,
  });
  return { evidence, errorCreated: false, store: scheduled.store, trace };
}
