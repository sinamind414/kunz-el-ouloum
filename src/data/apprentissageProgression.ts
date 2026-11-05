// apprentissageProgression.ts — indicateurs par onglet, 100 % DÉRIVÉS.
//
// La spec demandait « Cours : 12/20 terminés ». Ce chiffre n'existe nulle part :
// AGENTS.md §5 interdit tout contenu inventé. Ce module lit TROIS compteurs
// réels déjà écrits par l'application, chacun avec sa propre unité :
//
//   1. Cours        → `kunz_parcours_v1` via loadParcours() : leçons faites sur
//                     les 72 leçons réelles de PARCOURS_FLAT (11 جسر exclus).
//   2. Entraînement → `kunz_exam_attempts_log_v1` via getExamAttempts() :
//                     nombre de tentatives d'épreuve ARCHIVÉES (pas de /20).
//   3. Révision     → `svt_progress.flashcardStats` (App) : somme des
//                     évaluations de cartes enregistrées (again/hard/good/easy).
//
// Aucun dénominateur commun, aucune moyenne, aucun zéro « décoratif » : quand
// rien n'a été fait, on affiche réellement 0. L'absence de donnée n'est jamais
// remplacée par une estimation. Verrou : apprentissageProgression.lock.test.ts.

import { PARCOURS_FLAT } from '../lib/parcours/parcoursPath';
import { loadParcours } from '../lib/parcours/parcoursProgress';
import { getExamAttempts } from '../utils/examLog';
import type { UserProgress } from '../types';

export interface ProgressionApprentissage {
  leconsFaites: number;
  leconsTotal: number;
  tentatives: number;
  evaluations: number;
}

/** 72 leçons : dérivé de la séquence officielle, pas d'une constante recopiée. */
export const LECONS_TOTAL: number = PARCOURS_FLAT.filter((i) => i.kind === 'lesson').length;

export function lireProgressionApprentissage(
  userProgress: UserProgress | null,
): ProgressionApprentissage {
  let leconsFaites = 0;
  try {
    const etat = loadParcours();
    leconsFaites = PARCOURS_FLAT.filter(
      (i) => i.kind === 'lesson' && Boolean(etat.done[i.id]),
    ).length;
  } catch {
    /* stockage indisponible → 0 réel, pas une estimation */
  }

  let tentatives = 0;
  try {
    tentatives = getExamAttempts().length;
  } catch {
    /* historique corrompu → 0 réel */
  }

  const s = userProgress?.flashcardStats;
  const evaluations = s ? s.again + s.hard + s.good + s.easy : 0;

  return { leconsFaites, leconsTotal: LECONS_TOTAL, tentatives, evaluations };
}
