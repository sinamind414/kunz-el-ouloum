// src/services/masteryEvidenceService.ts
// P1.3 / Speckit EVIDENCE §3-§4 — persistance d'une MasteryEvidence réelle
// issue d'un défi BAC de leçon, avec mise à jour maîtrise + erreur liée.
// RÈGLE DURE : preuve créée SEULEMENT si ValidationEngine.passed && score >= 70.

import {
  CoreReflexId,
  LearningError,
  KunzStore,
  MasteryCell,
  MasteryEvidence,
  computeNextReviewAt,
  recordEvidence,
  loadStore,
  writeRaw,
  STORAGE_KEYS,
} from '../data/store';

const PASS_THRESHOLD = 70;

// Compteur monotone pour garantir des ids uniques même au même ms (évite doublons).
let evidenceSeq = 0;

// Crée/met à jour une erreur méthodologique liée à un échec de défi.
function upsertMethodologyError(
  errors: LearningError[],
  conceptId: string,
  reflexId: CoreReflexId,
  ruleIds: string[],
  now: number
): LearningError[] {
  const existing = errors.find(
    (e) => e.kind === 'methodology' && e.conceptId === conceptId && e.reflexId === reflexId
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
    id: `err_${conceptId}_${reflexId}_${now}`,
    kind: 'methodology',
    conceptId,
    reflexId,
    ruleIds,
    labelAr: 'صعوبة في تحليل منحنى النشاط الإنزيمي',
    count: 1,
    createdAt: now,
    lastSeenAt: now,
    reviewStartedAt: now,
    reviewStage: 0,
    nextReviewAt: computeNextReviewAt(now, 0, now),
  };
  return [...errors, err];
}

// Échec : pas de preuve, mais on enrichit le carnet d'erreurs (cadence J+1).
function recordFailure(input: {
  lessonId: string;
  conceptId: string;
  reflexId: CoreReflexId;
  ruleIds: string[];
  now: number;
}): { evidence: null; store: KunzStore } {
  const store = loadStore();
  const errors = upsertMethodologyError(
    store.learningErrors,
    input.conceptId,
    input.reflexId,
    input.ruleIds,
    input.now
  );
  const next: KunzStore = { ...store, learningErrors: errors };
  writeRaw(STORAGE_KEYS.learningErrors, next.learningErrors);
  return { evidence: null, store: next };
}

export interface LessonTransferInput {
  lessonId: string;
  conceptId: string;
  reflexId: CoreReflexId;
  score: number;
  ruleIds?: string[];
  now?: number;
}

export function recordLessonTransferEvidence(input: LessonTransferInput): { evidence: MasteryEvidence | null; store: KunzStore } {
  const now = input.now ?? Date.now();
  const score = input.score;

  // Règle dure : aucune preuve sous le seuil.
  if (score < PASS_THRESHOLD) {
    return recordFailure({
      lessonId: input.lessonId,
      conceptId: input.conceptId,
      reflexId: input.reflexId,
      ruleIds: input.ruleIds ?? [],
      now,
    });
  }

  const evidence: MasteryEvidence = {
    id: `evidence_${input.lessonId}_${input.reflexId}_${now}_${++evidenceSeq}`,
    conceptId: input.conceptId,
    dimension: 'methodology',
    reflexId: input.reflexId,
    source: 'lesson_transfer',
    score,
    createdAt: now,
  };

  // recordEvidence : persiste evidences + cellule maîtrise + erreur liée.
  const store = recordEvidence(evidence);
  return { evidence, store };
}

// §4 — niveau de maîtrise méthodologique calculé depuis les preuves réelles.
// Interdit : dernier score seul, 3 QCM, couleur sans preuve.
export function recomputeMethodologyMastery(
  evidences: MasteryEvidence[],
  errors: LearningError[],
  conceptId: string,
  reflexId: CoreReflexId
): MasteryCell {
  const relevant = evidences.filter(
    (e) => e.dimension === 'methodology' && e.conceptId === conceptId && e.reflexId === reflexId
  );
  const count = relevant.length;

  const hasActiveError = errors.some(
    (e) =>
      e.kind === 'methodology' &&
      e.conceptId === conceptId &&
      e.reflexId === reflexId &&
      e.resolvedAt == null
  );

  if (count === 0) return { level: 'unknown', evidenceCount: 0 };
  if (hasActiveError) return { level: 'needs_work', evidenceCount: count };

  // production/document >= 80 % requise pour mastered.
  const hasStrongProduction = relevant.some(
    (e) =>
      (e.source === 'document_analysis' || e.source === 'word_by_word' || e.source === 'lesson_transfer') &&
      e.score >= 80
  );

  if (count >= 3 && hasStrongProduction) {
    return { level: 'mastered', evidenceCount: count };
  }
  return { level: 'developing', evidenceCount: count };
}
