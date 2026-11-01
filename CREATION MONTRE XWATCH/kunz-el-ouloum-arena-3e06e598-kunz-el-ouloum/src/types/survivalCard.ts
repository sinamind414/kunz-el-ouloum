// src/types/survivalCard.ts
// P1.2 — Contrat des cartes de survie (Speckit V2 §5 P1.2).
// Règle d'affichage (P1.2-B) : une carte n'est montrée à l'élève qu'après
// revue éditoriale humaine (review.reviewed === true) — aucune exception.

import type { ReviewMetadata } from '../data/store';

export type SurvivalCardEvidenceType = 'curve' | 'table' | 'experiment' | 'schema' | 'mixed';

export interface SurvivalCard {
  id: string;
  conceptId: string;
  unitId: number;
  /** Idée centrale en arabe (ce que l'élève doit retenir). */
  coreIdeaAr: string;
  /** Chaîne causale — l'ordre des maillons est pédagogiquement signifiant. */
  causalChainAr: string[];
  /** Termes à mobiliser dans une réponse notée (scoring). */
  scoringTerms: string[];
  /** Type de document qui porte l'idée (courbe, tableau, expérience, schéma). */
  evidenceType: SurvivalCardEvidenceType;
  /** Piège classique à éviter (formulation « لا تقل … »). */
  trapAr: string;
  /** Revue éditoriale : publiable uniquement si reviewed = true. */
  review: ReviewMetadata;
}

/** Publiable uniquement si la revue éditoriale a validé la carte (P1.2-B). */
export function isCardPublishable(card: SurvivalCard): boolean {
  return card.review?.reviewed === true;
}
