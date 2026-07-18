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

export function isCardPublishable(card: SurvivalCard): boolean {
  return (
    card.review.reviewed &&
    !!card.review.reviewedAt &&
    !!card.review.reviewedBy &&
    !!card.review.sourceProgram
  );
}
