// src/lib/parcours/nbaEngine.ts
// NEXT BEST ACTION — la tâche unique de la journée.
//
// Priorité (portage de la couche "rituel" OPUS 5.5) :
//   1. REPRISE  : item commencé non terminé (state.current).
//   2. RAPPEL   : item terminé dont l'échéance J+14 est atteinte (la plus ancienne).
//   3. QUOTA    : si les validations du jour atteignent l'allowance → REPOS.
//   4. NOUVEAU  : le premier item disponible non terminé.
//   5. REPOS    : tout le chemin est terminé.

import { PARCOURS_FLAT, type ParcoursItem } from './parcoursPath';
import {
  allowance,
  loadParcours,
  todaysCompletions,
  todayKey,
  type ParcoursState,
} from './parcoursProgress';

export type NbaAction =
  | { type: 'resume'; item: ParcoursItem }
  | { type: 'review'; item: ParcoursItem; due: string }
  | { type: 'new'; item: ParcoursItem }
  | { type: 'rest'; reason: 'quota' | 'all-done' };

export function nextBestAction(state: ParcoursState = loadParcours()): NbaAction {
  // 1. Reprise de l'item commencé.
  if (state.current && !state.done[state.current]) {
    const item = PARCOURS_FLAT.find((i) => i.id === state.current);
    if (item) return { type: 'resume', item };
  }

  // 2. Rappels échus (J+14), du plus ancien au plus récent.
  const today = todayKey();
  const dueIds = Object.keys(state.reviews)
    .filter((id) => state.done[id] && state.reviews[id]! <= today)
    .sort((a, b) => (state.reviews[a]! < state.reviews[b]! ? -1 : 1));
  for (const id of dueIds) {
    const item = PARCOURS_FLAT.find((i) => i.id === id);
    if (item) return { type: 'review', item, due: state.reviews[id]! };
  }

  // 3. Quota journalier atteint (allowance = 1 + extra).
  if (todaysCompletions(state) >= allowance(state)) {
    const reste = PARCOURS_FLAT.some((i) => !state.done[i.id]);
    return { type: 'rest', reason: reste ? 'quota' : 'all-done' };
  }

  // 4. Nouvel item disponible.
  const next = PARCOURS_FLAT.find((i) => !state.done[i.id]);
  if (next) return { type: 'new', item: next };

  // 5. Chemin terminé.
  return { type: 'rest', reason: 'all-done' };
}

/** Libellé arabe du type d'action, pour l'eyebrow de la carte NBA. */
export function nbaEyebrow(action: NbaAction): string {
  switch (action.type) {
    case 'resume':
      return 'استئناف التعلّم';
    case 'review':
      return 'مراجعة موعدة';
    case 'new':
      return 'مهمة اليوم';
    case 'rest':
      return 'وقت الراحة';
  }
}
