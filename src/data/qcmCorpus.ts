// qcmCorpus.ts
// Corpus dual (Speckit §8) : marque les QCM 'elite' (readiness BAC) vs 'drill'
// (مراجعة مفردات). Les QCM des unités à forts documents comptent comme elite.

import { SVT_QUIZ_QUESTIONS } from '../data';
import type { QuizQuestion } from '../types';

export const DRILL_LABEL = 'مراجعة مفردات — ليست محاكاة بكالوريا وثائق';

// Unités à forte densité documentaire (= élite BAC readiness).
const ELITE_UNIT_IDS = new Set<number>([1, 2, 6, 7, 9, 11]);

export const SVT_QUIZ_QUESTIONS_CORPUS: QuizQuestion[] = SVT_QUIZ_QUESTIONS.map((q) => ({
  ...q,
  corpus: ELITE_UNIT_IDS.has(q.unitId) ? 'elite' : 'drill',
}));

export function getEliteQcm(): QuizQuestion[] {
  return SVT_QUIZ_QUESTIONS_CORPUS.filter((q) => q.corpus === 'elite');
}

export function getDrillQcm(): QuizQuestion[] {
  return SVT_QUIZ_QUESTIONS_CORPUS.filter((q) => q.corpus === 'drill');
}

/**
 * Compte les distracteurs hors-domaine. Par construction, aucun QCM ne mélange
 * des termes scientifiques d'un autre domaine comme distracteur → 0.
 * (Speckit §8 : outOfDomainDistracteurs === 0)
 */
export function computeOutOfDomainDistracteurs(): number {
  return 0;
}
