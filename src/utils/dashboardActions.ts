// src/utils/dashboardActions.ts
// Cibles réelles des tuiles du dashboard (owner 2026-09-15).
// Contexte : les 7 tuiles de DashboardView (grande carte « مهمة 3 دقائق » + les 6
// tuiles de la grille) étaient purement décoratives — aucun onClick, donc un clic
// restait sans effet. Ce module calcule les cibles À PARTIR DES DONNÉES RÉELLES
// (progress + units) : aucune statistique fictive (règle m1 — cf. StatsView.tsx:72
// et DashboardView.tsx:157 « aucune statistique fictive »).
import { Unit, UserProgress } from '../types';

/**
 * Date officielle de la session du BAC, en ISO 'YYYY-MM-DD'.
 *
 * ⚠️ Aucune source dans le dépôt : la tuile affichait « 325 يوم الباقي » en dur
 * (valeur figée à la maquette, incohérente dès que la date change). Cette constante
 * est LA source unique : le jour où l'owner fournit la date officielle, il suffit de
 * la remplir — aucun autre fichier à toucher.
 *
 * Laissée vide = date non tranchée : la tuile affiche alors l'attente explicite
 * (« التاريخ الرسمي قيد التأكيد ») plutôt qu'un chiffre inventé.
 */
export const BAC_EXAM_DATE = '';

const MS_PER_DAY = 86_400_000;

/** Millisecondes UTC d'un jour local (évite les décalages de fuseau/HE). */
const utcDay = (year: number, month1to12: number, day: number): number =>
  Date.UTC(year, month1to12 - 1, day);

/**
 * Nombre de jours restants avant la session du BAC.
 * @returns nombre entier de jours (négatif si la date est passée), ou `null`
 *          quand la date officielle n'est pas encore connue/invalide.
 */
export function bacDaysLeft(today: Date, examDateISO: string = BAC_EXAM_DATE): number | null {
  const parsed = /^(\d{4})-(\d{2})-(\d{2})$/.exec((examDateISO || '').trim());
  if (!parsed) return null;
  const exam = utcDay(Number(parsed[1]), Number(parsed[2]), Number(parsed[3]));
  const now = utcDay(today.getFullYear(), today.getMonth() + 1, today.getDate());
  return Math.round((exam - now) / MS_PER_DAY);
}

/** Unités déverrouillées (celles qui portent une action réelle). */
const unlockedUnits = (units: Unit[]): Unit[] => units.filter(u => !u.isLocked);

/**
 * « ثغرة خطيرة » — l'unité déverrouillée non terminée dont la progression est la
 * plus faible (le trou le plus large). Égalité → la plus ancienne à avoir été étudiée.
 */
export function biggestGapUnit(units: Unit[]): Unit | null {
  const candidates = unlockedUnits(units).filter(u => (u.progress ?? 0) < 100);
  if (candidates.length === 0) return null;
  return [...candidates].sort(
    (a, b) =>
      (a.progress ?? 0) - (b.progress ?? 0) ||
      (a.lastStudiedTimestamp || 0) - (b.lastStudiedTimestamp || 0),
  )[0];
}

/**
 * « إنجاز قريب » — l'unité déverrouillée entamée (progress > 0) la plus proche des
 * 100 %. `null` si aucune unité n'est entamée (rien à célébrer pour l'instant).
 */
export function closestAchievementUnit(units: Unit[]): Unit | null {
  const candidates = unlockedUnits(units).filter(u => (u.progress ?? 0) > 0 && (u.progress ?? 0) < 100);
  if (candidates.length === 0) return null;
  return [...candidates].sort((a, b) => (b.progress ?? 0) - (a.progress ?? 0))[0];
}

/**
 * « مهمة 3 دقائق » — l'unité à reprendre maintenant : celle travaillée le plus
 * récemment et non terminée ; sinon la plus grande lacune ; sinon la première unité.
 */
export function continueUnit(units: Unit[], progress?: UserProgress): Unit | null {
  const started = unlockedUnits(units)
    .filter(u => (u.progress ?? 0) < 100 && !!u.lastStudiedTimestamp)
    .sort((a, b) => (b.lastStudiedTimestamp || 0) - (a.lastStudiedTimestamp || 0));
  if (started.length > 0) return started[0];

  const gap = biggestGapUnit(units);
  if (gap) return gap;

  // Dernier recours : une unité déjà validée porte encore une révision utile.
  const done = progress?.completedUnits?.length
    ? units.find(u => progress.completedUnits.includes(u.id))
    : undefined;
  return done ?? unlockedUnits(units)[0] ?? units[0] ?? null;
}

/**
 * « سؤال مفاجئ » — tirage d'une unité au hasard parmi celles déjà rencontrées par
 * l'élève (entamées ou validées) ; à défaut parmi les unités déverrouillées, puis
 * toutes. `rng` injectable → tirage déterministe en test.
 */
export function surpriseUnitId(
  units: Unit[],
  progress?: UserProgress,
  rng: () => number = Math.random,
): number | null {
  const started = (u: Unit) => (u.progress ?? 0) > 0 || !!progress?.completedUnits?.includes(u.id);
  const byStart = unlockedUnits(units).filter(started);
  const pool = byStart.length > 0 ? byStart : unlockedUnits(units);
  const finalPool = pool.length > 0 ? pool : units;
  if (finalPool.length === 0) return null;
  const index = Math.min(finalPool.length - 1, Math.floor(rng() * finalPool.length));
  return finalPool[index].id;
}