// scoring.ts
// Pénalités par sévérité + calcul du score /20 et de l'XP (Speckit §5.4).

import type { ErrorSeverity, ValidationError } from './ValidationEngine';

export const SEVERITY_PENALTY: Record<ErrorSeverity, number> = {
  critical: 6,
  major: 3,
  minor: 1,
  hint: 0,
};

export const DEFAULT_THRESHOLD = 10;
export const LABEL_TRAINING =
  "Grille d'entraînement Kunz — n'est pas le barème officiel du sujet BAC";

/** Calcule le score plafonné à maxScore, plancher 0. */
export function computeScore(errors: ValidationError[], maxScore: number): number {
  const penalty = errors.reduce((sum, e) => sum + SEVERITY_PENALTY[e.severity], 0);
  return Math.max(0, Math.min(maxScore, maxScore - penalty));
}

/** XP selon le score final (Speckit §5.4). */
export function computeXp(score: number): number {
  if (score >= 16) return 15;
  if (score >= 10) return 10;
  if (score >= 5) return 5;
  return 0;
}
