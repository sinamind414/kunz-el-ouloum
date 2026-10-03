// src/data/spacedRecallIntervals.ts
// Vérité unique des intervalles de répétition espacée (audit 03102026, idée 2).
//
// AVANT : deux systèmes contradictoires coexistaient.
//  - src/lib/parcours/nbaEngine.ts      : rappel J+14 UNIQUE pour tout item fini.
//  - src/components/MethodologyCompilerView.tsx : REVIEW_GAPS = [1, 3, 7, 16, 30]
//    (donc J+16 et J+30, jamais J+14) — affiché à l'élève sans être branché au moteur.
// Conséquence : deux écrans promettaient des échéances différentes pour le même
// paramètre. Aucun des deux ne mentait par omission, mais l'élève voyait deux
// calendriers disjoints.
//
// APRÈS : un seul référentiel, importé par les deux consommateurs. On aligne
// MethodologyCompilerView sur la source canonique du dépôt (spacedRecallPrompts.ts
// et son invariant curriculumIntegrity : « exactement 4 prompts, stages 0-3 »),
// dont la séquence historique est J+1 → J+3 → J+7 → J+14.

/**
 * Intervalles canoniques en jours, indexés par stage.
 * Stage 0 = 1er rappel (J+1) … Stage 3 = dernier rappel (J+14).
 * Ne pas étendre cette liste sans mettre à jour curriculumIntegrity.test.ts
 * qui vérifie que chaque concept possède exactement 4 prompts (stages 0-3).
 */
export const SPACED_RECALL_INTERVALS = [1, 3, 7, 14] as const;

/** Stage maximum atteignable dans la boucle de rappel. */
export const MAX_RECALL_STAGE = SPACED_RECALL_INTERVALS.length - 1;

/** Délai en jours pour un stage donné ; le dernier stage se fige (rappel entretenu). */
export function intervalForStage(stage: number): number {
  const clamped = Math.max(0, Math.min(stage, MAX_RECALL_STAGE));
  return SPACED_RECALL_INTERVALS[clamped];
}

/** Stage suivant ; stagne au maximum (on entretient plutôt qu'on n'allonge). */
export function nextStage(stage: number): number {
  return Math.min(stage + 1, MAX_RECALL_STAGE);
}

/**
 * Calcule la prochaine échéance (en nombre de jours depuis aujourd'hui)
 * à partir du stage de rappel courant d'un concept.
 */
export function nextGapForStage(stage: number): number {
  return intervalForStage(nextStage(stage));
}
