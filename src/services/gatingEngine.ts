// ═══════════════════════════════════════════════════════════════════════
// V3 — GATING ENGINE : le verrouillage progressif par « portes ».
// Couche 3 de l'architecture « La Boussole ».
//
// Règles validées :
//   - Les unités FUTURES sont verrouillées ; les unités déjà déverrouillées
//     restent TOUJOURS accessibles (verrouillage progressif, pas punitif).
//   - Le déverrouillage officiel passe par l'examen de validation (≥ 80 %)
//     ou par un test diagnostique réussi (élève avancé).
//   - Un professeur peut forcer le déverrouillage (mode classe).
//   - Cliquer sur une unité verrouillée déclenche le Coach, jamais un mur
//     silencieux.
// ═══════════════════════════════════════════════════════════════════════

import type { Unit } from '../types';

const TEACHER_OVERRIDE_KEY = 'kunz_v3_teacher_unlock';

/** Mode professeur : force l'accès à toutes les unités (usage en classe). */
export function isTeacherOverrideEnabled(): boolean {
  try {
    return localStorage.getItem(TEACHER_OVERRIDE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setTeacherOverrideEnabled(enabled: boolean): void {
  try {
    if (enabled) localStorage.setItem(TEACHER_OVERRIDE_KEY, 'true');
    else localStorage.removeItem(TEACHER_OVERRIDE_KEY);
  } catch {
    /* offline-first : silencieux */
  }
}

/** Une unité est accessible si elle est déverrouillée ou en mode professeur. */
export function isUnitAccessible(unit: Unit, teacherOverride: boolean = isTeacherOverrideEnabled()): boolean {
  return !unit.isLocked || teacherOverride;
}

/** Unité précédente dans l'ordre officiel (pour le message du Coach). */
export function getPreviousUnit(units: Unit[], unitId: number): Unit | undefined {
  const sorted = [...units].sort((a, b) => a.id - b.id);
  return sorted.find((u) => u.id === unitId - 1);
}

/**
 * Message du Coach quand l'élève clique sur une unité verrouillée.
 * (Reprend la formulation validée de la V3 : pas de saut d'unité sans
 * maîtrise de la précédente.)
 */
export function getLockedUnitMessageAr(units: Unit[], lockedUnit: Unit): string {
  const previous = getPreviousUnit(units, lockedUnit.id);
  const prevLabel = previous ? `« ${previous.title} »` : 'الوحدة السابقة';
  return (
    `عذراً! لا يمكنك القفز إلى الوحدة ${lockedUnit.id} « ${lockedUnit.title} » قبل إتقان ${prevLabel}. ` +
    `أكمل الوحدة الحالية وتجاوز نسبة 80% في امتحانها الشامل لتفتح هذا الباب.`
  );
}

/** Message affiché sur la carte d'une unité verrouillée. */
export function getLockedUnitHintAr(units: Unit[], lockedUnit: Unit): string {
  const previous = getPreviousUnit(units, lockedUnit.id);
  return previous
    ? `🔒 تفتح بعد إتقان « ${previous.title} » (80% في الامتحان)`
    : '🔒 تفتح بعد إتقان الوحدة السابقة (80% في الامتحان)';
}

/**
 * Déverrouille la porte suivante (fonction pure sur la liste d'unités).
 * Retourne une nouvelle liste — ne mute jamais l'entrée.
 */
export function unlockNextUnit(units: Unit[], validatedUnitId: number): Unit[] {
  const nextId = validatedUnitId + 1;
  return units.map((u) => (u.id === nextId ? { ...u, isLocked: false } : u));
}

/** Déverrouille l'unité donnée elle-même (test diagnostique réussi). */
export function unlockUnit(units: Unit[], unitId: number): Unit[] {
  return units.map((u) => (u.id === unitId ? { ...u, isLocked: false } : u));
}
