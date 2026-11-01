// examTimer.ts — gérer les 4 h 30 de l'épreuve (sprint 43).
//
// Pourquoi ce module
// ------------------
// Le dépouillement des chaînes (sprints 1-8) et les conseils des professeurs
// convergent sur une cause de perte de points qui n'a rien à voir avec les
// connaissances : **le temps**. L'élève traite longuement l'exercice 1 (05
// points, de la restitution) et arrive épuisé sur l'exercice 3 (08 points,
// celui qui départage).
//
// Ce module calcule un budget par exercice, proportionnel au barème, avec deux
// réserves explicites : lecture initiale du sujet et relecture finale. Il ne
// contient aucune interface : uniquement des fonctions pures, testables au
// dixième de minute près.

import { DUREE_EPREUVE_MINUTES } from './mockExam';

/** Temps de lecture du sujet avant d'écrire la première ligne. */
export const RESERVE_LECTURE_MIN = 15;
/** Temps de relecture finale — la faute la plus chère est celle qu'on ne relit pas. */
export const RESERVE_RELECTURE_MIN = 15;

export interface BudgetExercice {
  /** Rang dans le sujet (1, 2, 3). */
  rang: number;
  points: number;
  /** Minutes allouées à cet exercice. */
  minutes: number;
  /** Minute de l'épreuve à laquelle il devrait commencer. */
  debutMinute: number;
  /** Minute de l'épreuve à laquelle il devrait être terminé. */
  finMinute: number;
}

/**
 * Répartit la durée de l'épreuve entre les exercices, au prorata des points,
 * après avoir mis de côté lecture et relecture.
 *
 * Arrondi : les minutes sont entières, et le reliquat va au dernier exercice
 * — celui qui pèse le plus, donc celui qui doit absorber l'imprécision.
 */
export function budgetParExercice(
  points: number[],
  dureeTotale = DUREE_EPREUVE_MINUTES,
): BudgetExercice[] {
  const utile = Math.max(0, dureeTotale - RESERVE_LECTURE_MIN - RESERVE_RELECTURE_MIN);
  const totalPoints = points.reduce((s, p) => s + p, 0);
  if (totalPoints <= 0 || points.length === 0) return [];

  const bruts = points.map((p) => Math.floor((utile * p) / totalPoints));
  const reliquat = utile - bruts.reduce((s, m) => s + m, 0);
  bruts[bruts.length - 1] += reliquat;

  let curseur = RESERVE_LECTURE_MIN;
  return points.map((p, i) => {
    const debut = curseur;
    curseur += bruts[i];
    return {
      rang: i + 1,
      points: p,
      minutes: bruts[i],
      debutMinute: debut,
      finMinute: curseur,
    };
  });
}

/** Exercice sur lequel l'élève devrait travailler à la minute `ecoulee`. */
export function exerciceAttendu(budgets: BudgetExercice[], ecoulee: number): number | null {
  if (budgets.length === 0) return null;
  if (ecoulee < RESERVE_LECTURE_MIN) return null; // encore en lecture
  const trouve = budgets.find((b) => ecoulee >= b.debutMinute && ecoulee < b.finMinute);
  return trouve ? trouve.rang : null; // null = phase de relecture ou temps écoulé
}

export type PhaseEpreuve = 'lecture' | 'redaction' | 'relecture' | 'termine';

/** Phase de l'épreuve à la minute `ecoulee`. */
export function phaseEpreuve(
  ecoulee: number,
  dureeTotale = DUREE_EPREUVE_MINUTES,
): PhaseEpreuve {
  if (ecoulee >= dureeTotale) return 'termine';
  if (ecoulee < RESERVE_LECTURE_MIN) return 'lecture';
  if (ecoulee >= dureeTotale - RESERVE_RELECTURE_MIN) return 'relecture';
  return 'redaction';
}

/** Retard (minutes) sur le budget si l'élève en est encore à l'exercice `rang`. */
export function retardSurBudget(
  budgets: BudgetExercice[],
  rangEnCours: number,
  ecoulee: number,
): number {
  const budget = budgets.find((b) => b.rang === rangEnCours);
  if (!budget) return 0;
  return Math.max(0, Math.round(ecoulee - budget.finMinute));
}

/** « 03:45 » à partir d'un nombre de minutes. */
export function formatDuree(minutes: number): string {
  const m = Math.max(0, Math.round(minutes));
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
}
