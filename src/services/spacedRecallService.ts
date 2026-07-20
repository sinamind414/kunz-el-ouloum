<<<<<<< HEAD
import {
  DAY_MS,
  loadStore,
  recordEvidence,
  REVIEW_INTERVALS_DAYS,
  STORAGE_KEYS,
  writeRaw,
  type KunzStore,
  type MasteryEvidence,
  type RecallItem,
} from '../data/store';
import { getSpacedRecallPrompt, type SpacedRecallPrompt } from '../data/spacedRecallPrompts';
import { validateAnswer, type ValidationResult } from '../lib/validation/ValidationEngine';
import { normalizeArabic } from '../utils/arabicNormalize';

export interface SpacedRecallOutcome {
  passed: boolean;
  score: number;
  matchedEvidence: string[];
  validationResult: ValidationResult;
  evidence: MasteryEvidence | null;
  store: KunzStore;
  recall: RecallItem;
}

function matchedEvidence(answer: string, prompt: SpacedRecallPrompt): string[] {
  const normalized = normalizeArabic(answer);
  return prompt.acceptedEvidence.filter((term) => normalized.includes(normalizeArabic(term)));
}

export function recordSpacedRecallAttempt(input: {
  recall: RecallItem;
  prompt: SpacedRecallPrompt;
  answer: string;
  now?: number;
}): SpacedRecallOutcome {
  const now = input.now ?? Date.now();
  const validationResult = validateAnswer(input.answer, {
    docType: 'mixed',
    actionVerb: input.prompt.reflexId,
    isNeuromuscular: false,
  });
  const score = Math.round((validationResult.score / validationResult.maxScore) * 100);
  const matched = matchedEvidence(input.answer, input.prompt);
  const passed = validationResult.passed && score >= 70 && matched.length >= input.prompt.minEvidence;

  const candidate: MasteryEvidence = {
    id: `evidence_recall_${input.recall.id}_${input.prompt.stage}_${now}`,
    conceptId: input.prompt.conceptId,
    dimension: 'methodology',
    reflexId: input.prompt.reflexId,
    source: 'word_by_word',
    score,
    createdAt: now,
    relatedErrorIds: input.recall.relatedErrorId ? [input.recall.relatedErrorId] : undefined,
  };

  if (passed) {
    const evidenceStore = recordEvidence(candidate);
    const finalStage = input.recall.stage >= 3;
    const stage = Math.min(input.recall.stage + 1, 3) as RecallItem['stage'];
    const recall: RecallItem = {
      ...input.recall,
      stage,
      nextReviewAt: finalStage ? input.recall.nextReviewAt : now + REVIEW_INTERVALS_DAYS[stage] * DAY_MS,
      completedAt: finalStage ? now : undefined,
    };
    const recalls = evidenceStore.recalls.map((item) => item.id === recall.id ? recall : item);
    const store = { ...evidenceStore, recalls };
    writeRaw(STORAGE_KEYS.recalls, recalls);
    return { passed, score, matchedEvidence: matched, validationResult, evidence: candidate, store, recall };
  }

  const store = loadStore();
  const recall: RecallItem = {
    ...input.recall,
    stage: 0,
    nextReviewAt: now + REVIEW_INTERVALS_DAYS[0] * DAY_MS,
    completedAt: undefined,
  };
  const recalls = store.recalls.map((item) => item.id === recall.id ? recall : item);
  const next = { ...store, recalls };
  writeRaw(STORAGE_KEYS.recalls, recalls);
  return { passed, score, matchedEvidence: matched, validationResult, evidence: null, store: next, recall };
}

export function scheduleSpacedRecall(input: {
  conceptId: string;
  reflexId: RecallItem['reflexId'];
  lessonId?: string;
  sourceEvidenceId?: string;
  relatedErrorId?: string;
  now?: number;
}): { recall: RecallItem | null; store: KunzStore } {
  const store = loadStore();
  if (!getSpacedRecallPrompt(input.conceptId, 0)) return { recall: null, store };

  const now = input.now ?? Date.now();
  const existing = store.recalls.find(
    (item) => item.conceptId === input.conceptId && item.completedAt == null
  );
  if (existing) {
    const recall: RecallItem = {
      ...existing,
      relatedErrorId: input.relatedErrorId ?? existing.relatedErrorId,
      sourceEvidenceId: input.sourceEvidenceId ?? existing.sourceEvidenceId,
      lessonId: input.lessonId ?? existing.lessonId,
    };
    const recalls = store.recalls.map((item) => item.id === recall.id ? recall : item);
    const next = { ...store, recalls };
    writeRaw(STORAGE_KEYS.recalls, recalls);
    return { recall, store: next };
  }

  const recall: RecallItem = {
    id: `recall_${input.conceptId}_${now}`,
    lessonId: input.lessonId,
    conceptId: input.conceptId,
    reflexId: input.reflexId,
    stage: 0,
    nextReviewAt: now + REVIEW_INTERVALS_DAYS[0] * DAY_MS,
    questionAr: promptForStage(input.conceptId, 0),
    sourceEvidenceId: input.sourceEvidenceId,
    relatedErrorId: input.relatedErrorId,
    createdAt: now,
  };
  const recalls = [...store.recalls, recall];
  const next = { ...store, recalls };
  writeRaw(STORAGE_KEYS.recalls, recalls);
  return { recall, store: next };
}

// Crée un rappel J+1 après une preuve réelle (évite les doublons actifs).
export function scheduleRecallFromEvidence(
  conceptId: string,
  lessonId: string,
  reflexId: CoreReflexId,
  now: number = Date.now()
): RecallItem {
  const store = loadStore();
  // Dédupe : pas de rappel en cours pour ce concept/leçon/reflex.
  const existing = store.recalls.find(
    (r) => r.conceptId === conceptId && r.lessonId === lessonId && r.reflexId === reflexId && r.completedAt == null
  );
  if (existing) return existing;

  const item: RecallItem = {
    id: `recall_${conceptId}_${reflexId}_${now}`,
    conceptId,
    lessonId,
    reflexId,
    stage: 0,
    nextReviewAt: now + REVIEW_INTERVALS_DAYS[0] * DAY_MS,
    questionAr: promptForStage(conceptId, 0),
    createdAt: now,
  };
  const next = { ...store, recalls: [...store.recalls, item] };
  writeRaw(STORAGE_KEYS.recalls, next.recalls);
  return item;
}

// Avance le rappel après réponse élève.
export function completeRecall(recallId: string, passed: boolean, now: number = Date.now()): RecallItem | null {
  const store = loadStore();
  const recall = store.recalls.find((r) => r.id === recallId);
  if (!recall || recall.completedAt !== undefined) return null;

  const isFinalSuccess = passed && recall.stage === 3;
  const nextStage: RecallItem['stage'] = passed
    ? (Math.min(recall.stage + 1, 3) as RecallItem['stage'])
    : 0;

  const updated: RecallItem = {
    ...recall,
    stage: nextStage,
    nextReviewAt: isFinalSuccess ? 0 : now + REVIEW_INTERVALS_DAYS[nextStage] * DAY_MS,
    questionAr: promptForStage(recall.conceptId, nextStage),
    completedAt: isFinalSuccess ? now : undefined,
  };

  const next = {
    ...store,
    recalls: store.recalls.map((item) => (item.id === recallId ? updated : item)),
  };
  writeRaw(STORAGE_KEYS.recalls, next.recalls);
  return updated;
}

// Rappels dus aujourd'hui (non complétés, nextReviewAt <= now).
export function getDueRecalls(now: number = Date.now()): RecallItem[] {
  const store = loadStore();
  return store.recalls.filter(
    (r) => r.completedAt === undefined && r.nextReviewAt > 0 && now >= r.nextReviewAt
  );
}

// Exporte les intervals pour référence UI.
export const RECALL_INTERVALS = REVIEW_INTERVALS_DAYS;
