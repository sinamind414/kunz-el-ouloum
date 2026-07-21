// src/data/conceptRoutes.ts
// Correction D — ConceptRoute et routage réel (Speckit FINAL §6).
// Chaque erreur pointe vers une route ; le routage suit la priorité :
//   1. carte de survie publiable
//   2. leçon active
//   3. document ciblé
//   4. quiz de l'unité
//   5. entraînement général (fallback uniquement)

import { ConceptRoute } from '../data/store';
import { getPublishableSurvivalCardById } from './survivalCards';

// Routes réelles par concept (programme BAC SVT Algérie).
export const CONCEPT_ROUTES: Record<string, ConceptRoute> = {
  enzymes: {
    conceptId: 'enzymes',
    unitId: 3,
    lessonId: 'd1-u3-l1-enzyme',
    documentExerciseId: 'michaelis_courbe',
    survivalCardId: 'sc_enzymes',
  },
  adn_proteine: {
    conceptId: 'adn_proteine',
    unitId: 1,
    lessonId: 'd1-u1-l2-transcription',
    documentExerciseId: 'rifamycine_h1h2',
    survivalCardId: 'sc_adn_proteine',
  },
  transcription: {
    conceptId: 'transcription',
    unitId: 1,
    lessonId: 'd1-u1-l2-transcription',
    documentExerciseId: 'rifamycine_h1h2',
    survivalCardId: 'sc_adn_proteine',
  },
  photosynthese: {
    conceptId: 'photosynthese',
    unitId: 6,
    lessonId: 'phase11_chapitres_21_22',
    documentExerciseId: 'photosynthese_cycle',
    survivalCardId: 'sc_photosynthese',
  },
  synapse: {
    conceptId: 'synapse',
    unitId: 5,
    lessonId: 'synapse',
    documentExerciseId: 'synapse_experiment',
    survivalCardId: 'sc_synapse',
  },
  subduction: {
    conceptId: 'subduction',
    unitId: 9,
    lessonId: undefined,
    documentExerciseId: 'subduction_schema',
    survivalCardId: 'sc_subduction',
  },
};

export function getConceptRoute(conceptId: string): ConceptRoute | undefined {
  return CONCEPT_ROUTES[conceptId];
}

// Routage réel depuis une erreur : renvoie la cible la plus pertinente
// selon la priorité (carte publiable > leçon > document > quiz unité).
export type RouteTarget =
  | { kind: 'survival_card'; cardId: string }
  | { kind: 'lesson'; lessonId: string }
  | { kind: 'document'; exerciseId: string }
  | { kind: 'quiz'; unitId: number }
  | { kind: 'fallback' };

export function routeErrorToTarget(
  conceptId: string,
  opts: { quizUnitId?: number } = {}
): RouteTarget {
  const route = CONCEPT_ROUTES[conceptId];
  if (!route) {
    return opts.quizUnitId != null
      ? { kind: 'quiz', unitId: opts.quizUnitId }
      : { kind: 'fallback' };
  }

  // 1. Carte de survie publiable (jamais un brouillon).
  if (route.survivalCardId) {
    const card = getPublishableSurvivalCardById(route.survivalCardId);
    if (card) return { kind: 'survival_card', cardId: card.id };
  }

  // 2. Leçon active.
  if (route.lessonId) return { kind: 'lesson', lessonId: route.lessonId };

  // 3. Document ciblé.
  if (route.documentExerciseId) return { kind: 'document', exerciseId: route.documentExerciseId };

  // 4. Quiz de l'unité.
  if (route.unitId != null) return { kind: 'quiz', unitId: route.unitId };

  // 5. Fallback.
  return opts.quizUnitId != null
    ? { kind: 'quiz', unitId: opts.quizUnitId }
    : { kind: 'fallback' };
}
