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

const PASS_THRESHOLD = 70;

export interface DocumentTraceInput {
  context: DocumentPracticeContext;
  answer: string;
  validationResult: ValidationResult;
}

export interface DocumentTraceResult {
  valid: boolean;
  foundEvidence: string[];
  missingEvidence: string[];
  vocabularyFound: string[];
}

function normalizeList(items: string[]): string[] {
  return items.map((i) => normalizeArabic(i));
}

export function validateDocumentTrace(input: DocumentTraceInput): DocumentTraceResult {
  const { context, answer, validationResult } = input;
  const normAnswer = normalizeArabic(answer);

  const expectedNorm = normalizeList(context.expectedEvidence);
  const foundEvidence = context.expectedEvidence.filter((_, i) => normAnswer.includes(expectedNorm[i]));
  const missingEvidence = context.expectedEvidence.filter((_, i) => !normAnswer.includes(expectedNorm[i]));

  const vocabNorm = normalizeList(context.vocabulary);
  const vocabularyFound = context.vocabulary.filter((_, i) => normAnswer.includes(vocabNorm[i]));

  const passed = validationResult.passed && validationResult.score >= PASS_THRESHOLD;
  const valid =
    passed && foundEvidence.length >= 1 && vocabularyFound.length >= 1;

  return { valid, foundEvidence, missingEvidence, vocabularyFound };
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
}

// Enregistre la preuve documentaire réelle OU l'erreur liée.
export function recordDocumentTrace(input: DocumentTraceInput): DocumentEvidenceOutcome {
  const { context, validationResult } = input;
  const trace = validateDocumentTrace(input);
  const now = Date.now();
  const score = Math.round((validationResult.score / validationResult.maxScore) * 100);

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
    return { evidence: null, errorCreated: true, store: next };
  }

  const evidence: MasteryEvidence = {
    id: `evidence_doc_${context.exerciseId}_${context.questionId}_${now}`,
    conceptId: context.conceptId,
    dimension: 'document',
    reflexId: context.reflexId,
    source: 'document_analysis',
    score,
    createdAt: now,
  };
  const store = recordEvidence(evidence);
  return { evidence, errorCreated: false, store };
}
