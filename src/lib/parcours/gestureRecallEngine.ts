// src/lib/parcours/gestureRecallEngine.ts
// Audit 03102026, idée 1 — mettre les GESTES MIFTah dans la boucle de rappel.
//
// PROBLÈME VÉRIFIÉ :
//   grep -c "verb\|method\|MIFTAH" src/lib/parcours/parcoursPath.ts → 0
// PARCOURS_FLAT ne contient que des LEÇONS. Jamais un verbe, jamais un geste.
// Conséquence : l'élève valide le drill 12/12 une fois, puis la boucle de
// rappel espacée — le mécanisme même de l'assimilation durable — ne rejoue
// JAMAIS la méthode. Il réexécute « leçon 3 de l'unité 2 », pas « reconstruire
// la chaîne causale ». La méthode est apprise une fois, puis oubliée.
//
// SOLUTION :
//   Un second chemin court, calqué sur itemStatus()/markDone(), qui porte sur
//   les gestes eux-mêmes. Il s'additionne au parcours existant sans le toucher
//   (src/lib/parcours/nbaEngine.ts et parcoursPath.ts restent intacts).
//
// Choix de conception (aligné sur spacedRecallPrompts.ts) :
//   - intervalles progressifs J+1 → J+3 → J+7 → J+14 (plus J+14 entretenu),
//     NON plus le J+14 fixe du parcours : un geste s'installe en plusieurs
//     passages rapprochés, sinon c'est du bachotage.
//   - un geste se rejoue TANT QUE son stage n'a pas atteint le palier final ;
//     une fois au palier, il reste dans la rotation d'entretien.
//   - hors quota journalier du parcours (les gestes sont courts, ≤ 3 min) : on
//     ne vole pas la place de la leçon, on occupe les interstices.

import { SPACED_RECALL_INTERVALS, intervalForStage, nextStage } from '../../data/spacedRecallIntervals';

/** Clé de stockage dédiée aux gestes (nomspacing → pas de collision avec le parcours). */
export const GESTURE_RECALL_KEY = 'kunz-gesture-recall-v1';

/** Les 4 gestes canoniques + STEP0 (référentiel MIFTAH_STEP_NAMES_AR). */
export const GESTURE_IDS = ['step0_comprendre', 'verb_agir', 'verb_prouver', 'verb_relier', 'verb_conclure'] as const;
export type GestureId = (typeof GESTURE_IDS)[number];

export interface GestureRecallState {
  /** stage de rappel atteint par geste (0 = J+1 … 3 = J+14 entretenu). */
  stage: Record<string, number>;
  /** prochaine échéance au format todayKey() (YYYY-MM-DD). */
  due: Record<string, string>;
  /** dateISO du dernier rappel réussi. */
  lastOk: Record<string, string>;
}

export function etatGestesParDefaut(): GestureRecallState {
  return { stage: {}, due: {}, lastOk: {} };
}

/** --- Persistance (même patron que loadParcours/saveParcours) --- */

export function loadGestureRecall(): GestureRecallState {
  try {
    const raw = window.localStorage.getItem(GESTURE_RECALL_KEY);
    const j = raw ? JSON.parse(raw) : null;
    if (!j || typeof j !== 'object') return etatGestesParDefaut();
    return {
      stage: j.stage && typeof j.stage === 'object' ? j.stage : {},
      due: j.due && typeof j.due === 'object' ? j.due : {},
      lastOk: j.lastOk && typeof j.lastOk === 'object' ? j.lastOk : {},
    };
  } catch {
    return etatGestesParDefaut();
  }
}

export function saveGestureRecall(state: GestureRecallState): void {
  try {
    window.localStorage.setItem(GESTURE_RECALL_KEY, JSON.stringify(state));
  } catch {
    /* stockage indisponible — offline first, on garde l'état en mémoire */
  }
}

function mutate(fn: (s: GestureRecallState) => void): void {
  const s = loadGestureRecall();
  fn(s);
  saveGestureRecall(s);
}

/** --- Moteur de rappel --- */

/**
 * Le geste le plus urgent à rejouer, ou null si aucun n'est échu.
 * Priorise le stage le plus bas (un geste jeune se rejoue plus souvent),
 * puis l'échéance la plus ancienne — même logique que nbaEngine étape 2.
 */
export function nextDueGesture(state: GestureRecallState = loadGestureRecall()): GestureId | null {
  const today = todayKey();
  const due = GESTURE_IDS.filter((id) => {
    const d = state.due[id];
    return d && d <= today;
  });
  if (due.length === 0) return null;
  // stage le plus bas d'abord (le geste le moins installé est le plus urgent),
  // puis l'échéance la plus ancienne pour la fraîcheur.
  due.sort((a, b) => {
    const sa = state.stage[a] ?? 0;
    const sb = state.stage[b] ?? 0;
    if (sa !== sb) return sa - sb;
    return (state.due[a] ?? '').localeCompare(state.due[b] ?? '');
  });
  return due[0];
}

/**
 * Enregistre un rappel de geste réussi et planifie la prochaine échéance
 * au prochain intervalle de la séquence canonique.
 */
export function markGestureRecallOk(id: GestureId): void {
  mutate((s) => {
    const current = s.stage[id] ?? 0;
    const stage = nextStage(current);
    s.stage[id] = stage;
    s.lastOk[id] = todayKey();
    s.due[id] = addDays(todayKey(), intervalForStage(stage));
  });
}

/**
 * Rappelle un geste échoué : on remet le stage à 0 (retour à J+1) —
 * la pédagogie de la boucle espacée : un échec réinitialise le cycle.
 * Miroir de 'fragile' côté parcours (SEUIL_FRAGILE) mais par geste.
 */
export function markGestureRecallFailed(id: GestureId): void {
  mutate((s) => {
    s.stage[id] = 0;
    s.due[id] = addDays(todayKey(), SPACED_RECALL_INTERVALS[0]);
  });
}

/** Stage d'un geste, pour afficher la progression (ceinture) à l'élève. */
export function gestureStage(state: GestureRecallState, id: GestureId): number {
  return state.stage[id] ?? 0;
}

/** Le geste est-il arrivé au palier final (rappel entretenu) ? */
export function gestureMastered(state: GestureRecallState, id: GestureId): boolean {
  return gestureStage(state, id) >= SPACED_RECALL_INTERVALS.length - 1;
}

// --- utilitaires (doublons volontaires et minimes de parcoursProgress pour
//     garder ce module autonome — pas d'import cyclique vers le parcours) ---

function todayKey(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function addDays(key: string, days: number): string {
  const [y, m, d] = key.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  return todayKey(date);
}
