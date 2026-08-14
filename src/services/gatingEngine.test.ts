import { beforeEach, describe, expect, it } from 'vitest';
import {
  getLockedUnitHintAr,
  getLockedUnitMessageAr,
  isTeacherOverrideEnabled,
  isUnitAccessible,
  setTeacherOverrideEnabled,
  unlockNextUnit,
  unlockUnit,
} from './gatingEngine';
import { INITIAL_UNITS } from '../unitCatalog';

describe('Gating Engine (V3)', () => {
  beforeEach(() => localStorage.clear());

  it('laisse passer une unité déverrouillée et bloque une unité future', () => {
    const unit1 = INITIAL_UNITS.find((u) => u.id === 1)!;
    const unit2 = INITIAL_UNITS.find((u) => u.id === 2)!;
    expect(isUnitAccessible(unit1, false)).toBe(true);
    expect(isUnitAccessible(unit2, false)).toBe(false);
  });

  it('le mode professeur force l’accès à toutes les unités', () => {
    const unit5 = INITIAL_UNITS.find((u) => u.id === 5)!;
    expect(isUnitAccessible(unit5, true)).toBe(true);
  });

  it('le message du Coach explique la règle des 80 % et cite l’unité précédente', () => {
    const unit2 = INITIAL_UNITS.find((u) => u.id === 2)!;
    const message = getLockedUnitMessageAr(INITIAL_UNITS, unit2);
    expect(message).toContain('80%');
    expect(message).toContain('تركيب البروتين'); // unité précédente
    expect(message).toContain('الوحدة 2');
  });

  it('l’indice de carte verrouillée annonce la condition d’ouverture', () => {
    const unit3 = INITIAL_UNITS.find((u) => u.id === 3)!;
    const hint = getLockedUnitHintAr(INITIAL_UNITS, unit3);
    expect(hint).toContain('🔒');
    expect(hint).toContain('80%');
  });

  it('déverrouille uniquement la porte suivante (sans muter l’entrée)', () => {
    const next = unlockNextUnit(INITIAL_UNITS, 1);
    expect(next.find((u) => u.id === 2)?.isLocked).toBe(false);
    expect(next.find((u) => u.id === 3)?.isLocked).toBe(true);
    expect(INITIAL_UNITS.find((u) => u.id === 2)?.isLocked).toBe(true); // immuable
  });

  it('déverrouille l’unité elle-même après un test diagnostique réussi', () => {
    const next = unlockUnit(INITIAL_UNITS, 4);
    expect(next.find((u) => u.id === 4)?.isLocked).toBe(false);
    expect(INITIAL_UNITS.find((u) => u.id === 4)?.isLocked).toBe(true);
  });

  it('persiste le mode professeur dans localStorage', () => {
    expect(isTeacherOverrideEnabled()).toBe(false);
    setTeacherOverrideEnabled(true);
    expect(isTeacherOverrideEnabled()).toBe(true);
    setTeacherOverrideEnabled(false);
    expect(isTeacherOverrideEnabled()).toBe(false);
  });
});
