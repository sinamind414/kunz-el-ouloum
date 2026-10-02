// src/lib/parcours/parcoursProgress.ts
// État d'avancement du chemin (PARCOURS) — 100% localStorage, best-effort.
//
// Sémantique des statuts (chemin linéaire strict) :
//   - 'done'      : item terminé (avec score optionnel + drapeau fragile).
//   - 'current'   : item commencé mais non terminé → reprise prioritaire (NBA).
//   - 'available' : tous les items PRÉCÉDENTS du chemin sont terminés.
//   - 'locked'    : il reste des items précédents non terminés.
//
// Quota journalier : allowance = 1 + extraAllowance (décision NBA "une tâche/jour",
// portage OPUS 5.5). Tout item validé incrémente le compteur du jour.
// Rappel : tout item validé planifie une révision à J+14 (cf. docs/tadwin_decisions.md).

import { PARCOURS_DOMAINS, PARCOURS_FLAT } from './parcoursPath';

const STORAGE_KEY = 'kunz_parcours_v1';
export const REVIEW_DELAY_DAYS = 14;
export const SEUIL_FRAGILE = 0.6;

export type ParcoursItemStatus = 'locked' | 'available' | 'current' | 'done';

export interface ParcoursRecord {
  /** ISO yyyy-mm-dd de la première validation. */
  at: string;
  /** Score 0..1 si l'item est noté (جسر), sinon undefined. */
  score?: number;
  /** Échec ou fragilité enregistrée → l'item redevient prioritaire au rappel. */
  fragile: boolean;
}

export interface ParcoursState {
  done: Record<string, ParcoursRecord>;
  current?: string;
  /** itemId -> date d'échéance du rappel (J+14). */
  reviews: Record<string, string>;
  extraAllowance: number;
}

export function todayKey(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function addDays(iso: string, days: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  return todayKey(new Date(y, m - 1, d + days));
}

export function etatParDefaut(): ParcoursState {
  return { done: {}, reviews: {}, extraAllowance: 0 };
}

export function loadParcours(): ParcoursState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return etatParDefaut();
    const j = JSON.parse(raw) as Partial<ParcoursState>;
    return {
      done: j.done && typeof j.done === 'object' ? j.done : {},
      current: typeof j.current === 'string' ? j.current : undefined,
      reviews: j.reviews && typeof j.reviews === 'object' ? j.reviews : {},
      extraAllowance: typeof j.extraAllowance === 'number' ? j.extraAllowance : 0,
    };
  } catch {
    return etatParDefaut();
  }
}

export function saveParcours(state: ParcoursState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // best-effort : échec silencieux (stockage plein / mode privé).
  }
}

function mutate(fn: (s: ParcoursState) => void): ParcoursState {
  const state = loadParcours();
  fn(state);
  saveParcours(state);
  return state;
}

/** Marque un item comme commencé (sans le valider) → la NBA le proposera en reprise. */
export function markStarted(itemId: string): void {
  mutate((s) => {
    if (!s.done[itemId]) s.current = itemId;
  });
}

/** Valide un item. `score` en 0..1 pour le جسر (rendu noté), undefined sinon. */
export function markDone(itemId: string, score?: number): void {
  mutate((s) => {
    const today = todayKey();
    const previous = s.done[itemId];
    s.done[itemId] = {
      at: previous?.at ?? today,
      score,
      fragile: typeof score === 'number' && score < SEUIL_FRAGILE,
    };
    if (s.current === itemId) s.current = undefined;
    s.reviews[itemId] = addDays(today, REVIEW_DELAY_DAYS);
  });
}

export function resetParcours(): void {
  saveParcours(etatParDefaut());
}

/** Statut d'un item dans le chemin linéaire (verrou = prédécesseurs incomplets). */
export function itemStatus(state: ParcoursState, itemId: string): ParcoursItemStatus {
  if (state.done[itemId]) return 'done';
  const index = PARCOURS_FLAT.findIndex((i) => i.id === itemId);
  if (index < 0) return 'locked';
  for (let k = 0; k < index; k++) {
    if (!state.done[PARCOURS_FLAT[k].id]) return 'locked';
  }
  return state.current === itemId ? 'current' : 'available';
}

/** L'item actuellement jouable : le premier non terminé dont les prédécesseurs le sont. */
export function currentItem(state: ParcoursState) {
  return PARCOURS_FLAT.find((i) => itemStatus(state, i.id) === 'available') ?? null;
}

export function todaysCompletions(state: ParcoursState): number {
  const today = todayKey();
  return Object.values(state.done).filter((r) => r.at === today).length;
}

export function allowance(state: ParcoursState): number {
  return 1 + Math.max(0, state.extraAllowance || 0);
}

export interface ProgressCompteur {
  done: number;
  total: number;
}

export function unitProgress(state: ParcoursState, unitId: number): ProgressCompteur {
  const unit = PARCOURS_DOMAINS.flatMap((d) => d.units).find((u) => u.unitId === unitId);
  if (!unit) return { done: 0, total: 0 };
  return {
    done: unit.items.filter((i) => state.done[i.id]).length,
    total: unit.items.length,
  };
}

export function domainProgress(state: ParcoursState, domainId: number): ProgressCompteur {
  const domain = PARCOURS_DOMAINS.find((d) => d.domainId === domainId);
  if (!domain) return { done: 0, total: 0 };
  const items = domain.units.flatMap((u) => u.items);
  return {
    done: items.filter((i) => state.done[i.id]).length,
    total: items.length,
  };
}

export function parcoursProgress(state: ParcoursState): ProgressCompteur {
  return {
    done: PARCOURS_FLAT.filter((i) => state.done[i.id]).length,
    total: PARCOURS_FLAT.length,
  };
}
