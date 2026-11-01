// src/data/spacedRecallIntervals.ts — ÉCHELLE NOMINALE DE SM-2 (affichage).
//
// ══════════════════════════════════════════════════════════════════════════
// CE FICHIER N'ORDONNANCE PLUS RIEN (15/10/2026)
// ══════════════════════════════════════════════════════════════════════════
// Il contenait l'échelle FIXE `[1, 3, 7, 14]`, appliquée par stage : l'intervalle
// ne dépendait que du NOMBRE de passages réussis, jamais de la qualité de la
// réponse. C'était le défaut nommé par l'utilisateur le 15/10/2026 :
//
//   « ce n'est pas du SM-2 adaptatif, c'est une séquence fixe ; un vrai SM-2
//     ajusterait l'intervalle selon la réponse de l'élève »
//
// L'ordonnancement est désormais assuré par `src/lib/sm2.ts`, avec une mémoire
// par élément (facilité, intervalle, échéance, répétitions, échecs).
//
// Ce qui reste ici : l'ÉCHELLE NOMINALE, c'est-à-dire ce que produirait une suite
// de réponses parfaites. Elle sert à MONTRER un ordre de grandeur à l'élève, et
// seulement à cela. La garder évite qu'un écran réinvente un calendrier parallèle
// — c'était le défaut corrigé le 14/10, quand deux écrans promettaient deux
// échéances différentes pour le même paramètre.

import { echelleNominaleSm2 } from '../lib/sm2';

/**
 * Ce que l'algorithme espacerait si l'élève répondait parfaitement à chaque fois.
 * ORDRE DE GRANDEUR — jamais un calendrier promis à l'élève.
 */
export const SPACED_RECALL_INTERVALS = echelleNominaleSm2(4);

/** Nombre de paliers nominaux (= 4). */
export const MAX_RECALL_STAGE = SPACED_RECALL_INTERVALS.length - 1;

/**
 * Délai nominal pour un rang donné, borné au dernier palier.
 * N'est PLUS utilisé pour planifier : voir `prochainEtatSm2` dans `src/lib/sm2.ts`.
 */
export function intervalForStage(stage: number): number {
  const borne = Math.max(0, Math.min(stage, MAX_RECALL_STAGE));
  return SPACED_RECALL_INTERVALS[borne] ?? 1;
}

/** Rang suivant, borné. Conservé pour les affichages qui comptent les paliers. */
export function nextStage(stage: number): number {
  return Math.min(stage + 1, MAX_RECALL_STAGE);
}

/** Délai nominal du rang suivant. */
export function nextGapForStage(stage: number): number {
  return intervalForStage(nextStage(stage));
}
