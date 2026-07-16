// progressionService.ts
// Source unique de calcul de progression (Speckit §10).
// Offline-first : aucune dépendance réseau.

import type { Unit, UserProgress } from '../types';

export interface WeakUnit {
  unit: Unit;
  progress: number;
}

export interface DailyTarget {
  unit: Unit;
  reason: 'weakest' | 'near_completion' | 'critical';
}

export function getWeakUnits(units: Unit[]): WeakUnit[] {
  const unlocked = units.filter((u) => !u.isLocked && u.progress < 100);
  return unlocked
    .sort((a, b) => a.progress - b.progress)
    .map((u) => ({ unit: u, progress: u.progress }));
}

export function getCriticalUnit(units: Unit[]): Unit | null {
  const unlocked = units.filter((u) => !u.isLocked);
  if (!unlocked.length) return null;
  return unlocked.sort((a, b) => a.progress - b.progress)[0] || null;
}

export function getNearCompletion(units: Unit[]): Unit | null {
  const incomplete = units.filter((u) => u.progress < 100);
  if (!incomplete.length) return null;
  return incomplete.sort((a, b) => b.progress - a.progress)[0] || null;
}

export function getDailyTarget(units: Unit[]): DailyTarget {
  const weak = getWeakUnits(units);
  const near = getNearCompletion(units);
  const critical = getCriticalUnit(units);

  if (weak.length === 0) {
    return { unit: units[0], reason: 'weakest' };
  }

  const weakest = weak[0].unit;
  if (near && near.progress >= 80) {
    return { unit: near, reason: 'near_completion' };
  }
  if (critical && critical.progress < 30) {
    return { unit: critical, reason: 'critical' };
  }
  return { unit: weakest, reason: 'weakest' };
}

export function computeDomainReadiness(units: Unit[]): Record<string, number> {
  const domains: Record<string, number[]> = {};
  for (const u of units) {
    if (!domains[u.domain]) domains[u.domain] = [];
    domains[u.domain].push(u.progress);
  }
  const out: Record<string, number> = {};
  for (const [domain, progresses] of Object.entries(domains)) {
    out[domain] = Math.round(progresses.reduce((s, p) => s + p, 0) / progresses.length);
  }
  return out;
}

export function computeStreakFromProgress(progress: UserProgress): number {
  return progress.streak || 0;
}
