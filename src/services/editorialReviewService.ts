import type { ReviewMetadata } from '../data/store';
import type { SurvivalCard } from '../types/survivalCard';
import { SURVIVAL_CARDS } from '../data/survivalCards';
import { LESSON_GOLD_SUMMARIES, type LessonGoldSummary } from '../data/lessonGoldSummaries';
import { DOCUMENT_PRACTICE_CONTEXTS, type DocumentPracticeContext } from '../data/documentPracticeContexts';

export type EditorialItemType = 'survival_card' | 'lesson_summary' | 'document_context';

export interface EditorialItem {
  id: string;
  type: EditorialItemType;
  label: string;
  reviewed: boolean;
  reviewedBy?: string;
  reviewedAt?: string;
  sourceProgram?: string;
  editorialStatus?: string;
}

export const EDITORIAL_OVERRIDE_PREFIX = 'kunz_review_v2:';

function storageKey(type: EditorialItemType, id: string): string {
  return `${EDITORIAL_OVERRIDE_PREFIX}${type}:${id}`;
}

export function loadReviewOverride(type: EditorialItemType, id: string): ReviewMetadata | null {
  try {
    const raw = localStorage.getItem(storageKey(type, id));
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed === 'object' && parsed !== null && 'reviewed' in parsed) {
      return parsed as ReviewMetadata;
    }
    return null;
  } catch {
    return null;
  }
}

export function setReviewOverride(type: EditorialItemType, id: string, meta: ReviewMetadata): boolean {
  try {
    localStorage.setItem(storageKey(type, id), JSON.stringify(meta));
    return true;
  } catch {
    return false;
  }
}

export function clearReviewOverride(type: EditorialItemType, id: string): void {
  try {
    localStorage.removeItem(storageKey(type, id));
  } catch {
    // silencieux
  }
}

export function clearAllReviewOverrides(): void {
  try {
    const toRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(EDITORIAL_OVERRIDE_PREFIX)) toRemove.push(key);
    }
    for (const key of toRemove) localStorage.removeItem(key);
  } catch {
    // silencieux
  }
}

function getMergedReview(type: EditorialItemType, id: string, fallback: ReviewMetadata): ReviewMetadata {
  const override = loadReviewOverride(type, id);
  return override ?? fallback;
}

function survivalCardToItem(card: SurvivalCard): EditorialItem {
  const effective = getMergedReview('survival_card', card.id, card.review);
  return {
    id: card.id,
    type: 'survival_card',
    label: card.coreIdeaAr.slice(0, 80),
    reviewed: effective.reviewed,
    reviewedBy: effective.reviewedBy,
    reviewedAt: effective.reviewedAt,
    sourceProgram: effective.sourceProgram,
  };
}

function summaryToItem(summary: LessonGoldSummary): EditorialItem {
  const effective = getMergedReview('lesson_summary', summary.lessonId, summary.review ?? { reviewed: false });
  return {
    id: summary.lessonId,
    type: 'lesson_summary',
    label: summary.missionAr.slice(0, 80),
    reviewed: effective.reviewed,
    reviewedBy: effective.reviewedBy,
    reviewedAt: effective.reviewedAt,
    sourceProgram: effective.sourceProgram,
    editorialStatus: summary.status,
  };
}

function documentToItem(doc: DocumentPracticeContext): EditorialItem {
  const effective = getMergedReview('document_context', doc.exerciseId, { reviewed: false });
  return {
    id: doc.exerciseId,
    type: 'document_context',
    label: doc.goalAr.slice(0, 80),
    reviewed: effective.reviewed,
    reviewedBy: effective.reviewedBy,
    reviewedAt: effective.reviewedAt,
    sourceProgram: effective.sourceProgram,
    editorialStatus: doc.sourceStatus,
  };
}

export function getAllEditorialItems(): EditorialItem[] {
  const items: EditorialItem[] = [];
  for (const card of SURVIVAL_CARDS) items.push(survivalCardToItem(card));
  for (const summary of Object.values(LESSON_GOLD_SUMMARIES)) items.push(summaryToItem(summary));
  for (const doc of DOCUMENT_PRACTICE_CONTEXTS) items.push(documentToItem(doc));
  return items;
}

export function applyOverrideToSurvivalCard(card: SurvivalCard): SurvivalCard {
  const override = loadReviewOverride('survival_card', card.id);
  if (!override) return card;
  return { ...card, review: { ...card.review, ...override } };
}
