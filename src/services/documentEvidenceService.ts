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

function containsAnyNormalized(answer: string, terms: string[]): boolean {
  return terms.some((term) => answer.includes(normalizeArabic(term)));
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

export function validateDocumentTrace(input: DocumentTraceInput): DocumentTraceResult {
  const { context, answer, validationResult } = input;
  const normAnswer = normalizeArabic(answer);

  const expectedNorm = normalizeList(context.expectedEvidence);
  const foundEvidence = context.expectedEvidence.filter((_, i) => normAnswer.includes(expectedNorm[i]));
  const missingEvidence = context.expectedEvidence.filter((_, i) => !normAnswer.includes(expectedNorm[i]));

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
