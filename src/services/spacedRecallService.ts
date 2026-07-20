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
    sourceEvidenceId: input.sourceEvidenceId,
    relatedErrorId: input.relatedErrorId,
    createdAt: now,
  };
  const recalls = [...store.recalls, recall];
  const next = { ...store, recalls };
  writeRaw(STORAGE_KEYS.recalls, recalls);
  return { recall, store: next };
}
