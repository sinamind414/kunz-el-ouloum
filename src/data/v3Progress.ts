// src/data/v3Progress.ts — déverrouillage progressif V3.1 + décision D1 (2026-09-06, docs/MARQUE.md §11)
//
// D1 — Sémantique du drill :
//   12/12 sur 3 JOURS DISTINCTS (pas « consécutifs »). Un échec ALONGE l'intervalle
//   (le jour parfait suivant doit être à ≥ 1 + n_fails_jours du dernier jour parfait)
//   SANS remettre le compteur à zéro.
//   → Débloque : la Phase 2 (écriture guidée — build PENDING) + la badge « حامل المفتاح ».
//
// D1 — Cible du verso (المفتاح+ / حفظ) :
//   Le verso n'est publié qu'après NOYAU STABLE SUR 3 TYPES DE QUESTIONS DIFFÉRENTS
//   (badge « أمين الكنز »). Dans l'app actuelle, un type de question est « maîtrisé »
//   quand l'élève passe la stage 4 du verbe correspondant (ICM ≥ seuil passIcmThreshold).
//
// 100% localStorage, best-effort, jamais bloquant.
const LEGACY_KEY  = 'kunz_v3:extension_unlocked'; // flag legacy (streak 3 consécutifs) — grandfatheré, reste valide
const DRILL_KEY   = 'kunz_v3:drill_days';         // { perfectDays: string[], failDays: string[] } (ISO yyyy-mm-dd)
const MASTERY_KEY = 'kunz_v3:mastery_types';      // string[] (verbId maîtrisés en stage 4)

export const DRILL_GOAL_DAYS  = 3;
export const VERSO_GOAL_TYPES = 3;

/** Date locale ISO (yyyy-mm-dd) — la granularité du drill est le JOUR local. */
export function todayISO(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Écart en jours calendaires entre deux dates ISO (a - b). */
export function dayDiffDays(aIso: string, bIso: string): number {
  return Math.round((Date.parse(aIso) - Date.parse(bIso)) / 86_400_000);
}

export interface DrillState {
  /** Jours (ISO) où le drill a compté 12/12 — uniques par construction. */
  perfectDays: string[];
  /** Jours (ISO) où au moins un échec a été enregistré. */
  failDays: string[];
}

function loadDrill(): DrillState {
  try {
    const raw = localStorage.getItem(DRILL_KEY);
    if (!raw) return { perfectDays: [], failDays: [] };
    const p = JSON.parse(raw) as Partial<DrillState>;
    return {
      perfectDays: Array.isArray(p.perfectDays) ? p.perfectDays : [],
      failDays: Array.isArray(p.failDays) ? p.failDays : [],
    };
  } catch { return { perfectDays: [], failDays: [] }; }
}

function saveDrill(s: DrillState): void {
  try { localStorage.setItem(DRILL_KEY, JSON.stringify(s)); } catch {}
}

/**
 * D1 — RÈGLE PURE (unit-testable) : état du drill après un résultat `score` (0-12) le jour `day`.
 * - 12/12 : compte le jour si (a) il n'est pas déjà compté et (b) l'intervalle est respecté :
 *   ≥ 1 jour après le dernier jour parfait, +1 jour par jour d'échec strictement entre les deux.
 * - < 12  : marque le jour comme échec (idempotent le même jour) — ne touche JAMAIS aux jours parfaits.
 */
export function applyDrillResult(state: DrillState, score: number, day: string): DrillState {
  if (score === 12) {
    if (state.perfectDays.includes(day)) return state;
    const prev = state.perfectDays.filter(d => d < day).pop();
    if (prev) {
      const failsBetween = state.failDays.filter(d => d > prev && d < day).length;
      const requiredGapDays = 1 + failsBetween;
      if (dayDiffDays(day, prev) < requiredGapDays) return state; // intervalle allongé — pas encore compté
    }
    return { ...state, perfectDays: [...state.perfectDays, day].sort() };
  }
  if (state.failDays.includes(day)) return state;
  return { ...state, failDays: [...state.failDays, day].sort() };
}

export interface DrillOutcome {
  /** Objectif atteint (3 jours distincts à 12/12). */
  met: boolean;
  /** Nombre de jours distincts comptés (jauge X / 3). */
  perfectDays: number;
}

/** Appelé après chaque drill 60 s. `day` injectable (tests, replays). */
export function recordDrillResult(score: number, day: string = todayISO()): DrillOutcome {
  try {
    const next = applyDrillResult(loadDrill(), score, day);
    saveDrill(next);
    return { met: next.perfectDays.length >= DRILL_GOAL_DAYS, perfectDays: next.perfectDays.length };
  } catch {
    return { met: false, perfectDays: 0 };
  }
}

export interface DrillStatus extends DrillOutcome {
  goal: number;
  badgeAr: string | null;
}

export function getDrillStatus(): DrillStatus {
  try {
    const s = loadDrill();
    const met = s.perfectDays.length >= DRILL_GOAL_DAYS;
    return { perfectDays: s.perfectDays.length, goal: DRILL_GOAL_DAYS, met, badgeAr: met ? 'حامل المفتاح' : null };
  } catch {
    return { perfectDays: 0, goal: DRILL_GOAL_DAYS, met: false, badgeAr: null };
  }
}

/**
 * D1 — Maîtrise des types de questions → verso.
 * Un type est maîtrisé quand l'élève passe la stage 4 du verbe (appel par la vue au seuil).
 */
export function recordTypeMastery(verbId: string): { met: boolean; types: number } {
  try {
    const raw = localStorage.getItem(MASTERY_KEY);
    const types: string[] = raw ? (JSON.parse(raw) as string[]) : [];
    if (!Array.isArray(types) || !types.includes(verbId)) {
      types.push(verbId);
      localStorage.setItem(MASTERY_KEY, JSON.stringify(types));
    }
    return { met: types.length >= VERSO_GOAL_TYPES, types: types.length };
  } catch {
    return { met: false, types: 0 };
  }
}

export interface MasteryStatus {
  types: string[];
  goal: number;
  met: boolean;
  badgeAr: string | null;
}

export function getMasteryStatus(): MasteryStatus {
  try {
    const raw = localStorage.getItem(MASTERY_KEY);
    const types: string[] = raw ? (JSON.parse(raw) as string[]) : [];
    const list = Array.isArray(types) ? types : [];
    const met = list.length >= VERSO_GOAL_TYPES;
    return { types: list, goal: VERSO_GOAL_TYPES, met, badgeAr: met ? 'أمين الكنز' : null };
  } catch {
    return { types: [], goal: VERSO_GOAL_TYPES, met: false, badgeAr: null };
  }
}

/** D1 — Verso (المفتاح+) = flag legacy grandfatheré OU noyau stable sur 3 types. */
export function isVersoUnlocked(): boolean {
  try {
    if (localStorage.getItem(LEGACY_KEY) === '1') return true;
    return getMasteryStatus().met;
  } catch { return false; }
}

/** Alias historique (la vue appelle ce nom). */
export function isExtensionUnlocked(): boolean {
  return isVersoUnlocked();
}

/** Déverrouillage manuel (owner / debug) — conserve la sémantique legacy. */
export function unlockExtension(): void {
  try { localStorage.setItem(LEGACY_KEY, '1'); } catch {}
}

export function resetExtension(): void {
  try {
    localStorage.removeItem(LEGACY_KEY);
    localStorage.removeItem(DRILL_KEY);
    localStorage.removeItem(MASTERY_KEY);
  } catch {}
}

/** Compat historique — retourne désormais les jours distincts comptés (jauge / 3). */
export function getDrillStreak(): number {
  return getDrillStatus().perfectDays;
}
