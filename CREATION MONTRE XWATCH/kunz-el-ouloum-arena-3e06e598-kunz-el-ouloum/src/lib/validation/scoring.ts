// scoring.ts
// Barème POSITIF /20 + XP (Speckit §5.4, audit #01 des 15 dimensions).
//
// L'ancien barème partait du maximum et ne faisait que soustraire : une réponse
// vide de contenu mais sans faute détectée obtenait 20/20 (mesuré : du charabia
// bourré de mots-clés = 19-20/20 ; le seul mot « نعم » = 11-17/20).
// Le score part désormais de ZÉRO : il est GAGNÉ par les éléments attendus
// démontrés (valeur+unité, relation كلما/بينما, niveaux d'organisation, cible
// moléculaire, blocs de synthèse…), puis les pénalités sont soustraites par-
// dessus. Une réponse sans aucun contenu attendu ne peut plus dépasser 2/20,
// et une réponse absurde (séquence « بلابلا ») est privée de tout crédit.

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

// Calibration du barème positif (documentée dans docs/BAREME_POSITIF_2026-08-20.md).
const EARNED_BASE = 12; // première dimension de contenu démontrée
const EARNED_PER_CREDIT = 5; // par dimension supplémentaire
const EFFORT_WITHOUT_EVIDENCE = 2; // aucune dimension démontrée
const TINY_ANSWER_CAP = 4; // plafond pour les réponses de moins de 3 mots

export interface PositiveScoreInput {
  errors: ValidationError[];
  /** Nombre de dimensions de contenu démontrées (lois matchées + valeur/unité). */
  credits: number;
  /** Séquence absurde détectée (« بلابلا »…) : tout crédit est annulé. */
  gibberish: boolean;
  /** Nombre de mots utiles (normalisés, longueur ≥ 2). */
  wordCount: number;
  maxScore: number;
}

/** Calcule le score POSITIF plafonné à maxScore, plancher 0. */
export function computePositiveScore(input: PositiveScoreInput): number {
  const { errors, credits, gibberish, wordCount, maxScore } = input;
  const penalty = errors.reduce((sum, e) => sum + SEVERITY_PENALTY[e.severity], 0);
  const effectiveCredits = gibberish ? 0 : credits;
  const earned = effectiveCredits === 0
    ? EFFORT_WITHOUT_EVIDENCE
    : Math.min(maxScore, EARNED_BASE + EARNED_PER_CREDIT * (effectiveCredits - 1));
  let score = Math.max(0, Math.min(maxScore, earned - penalty));
  if (wordCount < 3) score = Math.min(score, TINY_ANSWER_CAP);
  return score;
}

/** XP selon le score final (Speckit §5.4). */
export function computeXp(score: number): number {
  if (score >= 16) return 15;
  if (score >= 10) return 10;
  if (score >= 5) return 5;
  return 0;
}
