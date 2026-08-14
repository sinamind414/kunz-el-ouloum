// src/types/survivalCard.ts
// P1.2 — Contrat canonique des cartes de survie (SpecKit ALL_CORRECTIONS_V2 §3.8).
// Carte très courte, actionnable, à rappel actif réel. Jamais publiée sans revue.

import type { ReviewMetadata } from '../data/store';

export type SurvivalCardEvidenceType =
  | 'curve'
  | 'table'
  | 'experiment'
  | 'schema'
  | 'comparison';

export interface SurvivalCard {
  id: string;
  conceptId: string;
  unitId?: number;
  coreIdeaAr: string;
  causalChainAr: string[];
  scoringTerms: string[];
  evidenceType: SurvivalCardEvidenceType;
  trapAr: string;
  // Texte compact hors mots-clés (<=60 mots).
  summaryAr?: string;
  review: ReviewMetadata;
}

// #59 — La publication ne verifiait que la PRESENCE des quatre champs : une
// chaine d'espaces passait pour un nom de relecteur et une date de l'an 3000
// pour une date de revue. On exige desormais des valeurs plausibles. Cela ne
// transforme pas une saisie locale en preuve d'autorite (voir
// `isLocallyDeclaredReview`), mais cela ferme le cas du champ vide.
export function isCardPublishable(card: SurvivalCard): boolean {
  return isReviewMetadataUsable(card.review);
}

export function isReviewMetadataUsable(review: {
  reviewed: boolean;
  reviewedAt?: string;
  reviewedBy?: string;
  sourceProgram?: string;
}): boolean {
  if (!review.reviewed) return false;
  if (!review.reviewedBy || review.reviewedBy.trim().length < 2) return false;
  if (!review.sourceProgram || review.sourceProgram.trim().length === 0) return false;
  if (!review.reviewedAt) return false;
  const at = new Date(review.reviewedAt).getTime();
  if (Number.isNaN(at)) return false;
  // Une revue datee dans le futur n'est pas une revue.
  if (at > Date.now()) return false;
  return true;
}
