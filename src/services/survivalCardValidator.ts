// src/services/survivalCardValidator.ts
// P1.2 — Validation stricte d'une carte de survie (SpecKit V2 §3.8 / §4 P1.2-B).
// Aucune carte ne doit être publiée à l'élève avant de passer ce validateur
// (en particulier : revue humaine renseignée).

import type { SurvivalCard } from '../types/survivalCard';
import { isCardPublishable } from '../types/survivalCard';

export interface SurvivalCardIssue {
  field: string;
  rule: string;
  message: string;
}

const MAX_CORE_IDEA_WORDS = 22;
const MIN_CHAIN_NODES = 3;
const MAX_CHAIN_NODES = 6;
const MIN_TERMS = 3;
const MAX_TERMS = 6;
const MAX_SUMMARY_WORDS = 60;

function countWords(ar: string): number {
  const trimmed = ar.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

// Retourne la liste des problèmes (vide = carte valide).
export function validateSurvivalCard(card: SurvivalCard): SurvivalCardIssue[] {
  const issues: SurvivalCardIssue[] = [];

  if (!card.id) issues.push({ field: 'id', rule: 'required', message: 'id manquant' });
  if (!card.conceptId)
    issues.push({ field: 'conceptId', rule: 'required', message: 'conceptId manquant' });

  if (!card.coreIdeaAr || card.coreIdeaAr.trim().length === 0) {
    issues.push({ field: 'coreIdeaAr', rule: 'required', message: 'idée centrale vide' });
  } else if (countWords(card.coreIdeaAr) > MAX_CORE_IDEA_WORDS) {
    issues.push({
      field: 'coreIdeaAr',
      rule: 'max_words',
      message: `idée centrale > ${MAX_CORE_IDEA_WORDS} mots (${countWords(card.coreIdeaAr)})`,
    });
  }

  if (!Array.isArray(card.causalChainAr) || card.causalChainAr.length < MIN_CHAIN_NODES) {
    issues.push({
      field: 'causalChainAr',
      rule: 'min_nodes',
      message: `chaîne causale < ${MIN_CHAIN_NODES} nœuds`,
    });
  } else if (card.causalChainAr.length > MAX_CHAIN_NODES) {
    issues.push({
      field: 'causalChainAr',
      rule: 'max_nodes',
      message: `chaîne causale > ${MAX_CHAIN_NODES} nœuds`,
    });
  }

  if (!Array.isArray(card.scoringTerms) || card.scoringTerms.length < MIN_TERMS) {
    issues.push({
      field: 'scoringTerms',
      rule: 'min_terms',
      message: `mots-clés < ${MIN_TERMS}`,
    });
  } else if (card.scoringTerms.length > MAX_TERMS) {
    issues.push({
      field: 'scoringTerms',
      rule: 'max_terms',
      message: `mots-clés > ${MAX_TERMS}`,
    });
  }

  if (card.summaryAr && countWords(card.summaryAr) > MAX_SUMMARY_WORDS) {
    issues.push({
      field: 'summaryAr',
      rule: 'max_words',
      message: `résumé > ${MAX_SUMMARY_WORDS} mots (${countWords(card.summaryAr)})`,
    });
  }

  if (!card.evidenceType) {
    issues.push({ field: 'evidenceType', rule: 'required', message: 'evidenceType manquant' });
  }

  if (!card.trapAr) {
    issues.push({ field: 'trapAr', rule: 'required', message: 'trapAr manquant' });
  }

  // Publication : revue humaine obligatoire.
  if (!isCardPublishable(card)) {
    issues.push({
      field: 'review',
      rule: 'review_required',
      message: 'carte non revue par un enseignant (reviewed/reviewedAt/reviewedBy/sourceProgram requis)',
    });
  }

  return issues;
}

export function isSurvivalCardValid(card: SurvivalCard): boolean {
  return validateSurvivalCard(card).length === 0;
}
