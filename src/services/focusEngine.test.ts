import { describe, expect, it } from 'vitest';
import { getActiveUnit, getNextAction, getMissionTitleAr } from './focusEngine';
import { createEmptyMasteryState, type MasteryState } from './masteryEngine';
import { INITIAL_UNITS } from '../unitCatalog';
import type { Unit } from '../types';

function unitsWithProgress(overrides: Record<number, Partial<Unit>>): Unit[] {
  return INITIAL_UNITS.map((u) => (overrides[u.id] ? { ...u, ...overrides[u.id] } : u));
}

describe('Focus Engine (V3)', () => {
  it('choisit la première unité déverrouillée non validée comme unité active', () => {
    const mastery = createEmptyMasteryState();
    const active = getActiveUnit(INITIAL_UNITS, mastery);
    expect(active?.id).toBe(1);
  });

  it('saute une unité déjà validée par l’examen', () => {
    const units = unitsWithProgress({ 2: { isLocked: false } });
    const mastery: MasteryState = { ...createEmptyMasteryState(), validatedUnits: [1] };
    const active = getActiveUnit(units, mastery);
    expect(active?.id).toBe(2);
  });

  it('renvoie « tout terminé » quand toutes les unités débloquées sont validées', () => {
    const mastery: MasteryState = { ...createEmptyMasteryState(), validatedUnits: [1] };
    const action = getNextAction(INITIAL_UNITS, mastery);
    // Unité 2..11 encore verrouillées → seule l'unité 1 compte → all_done.
    expect(action.kind).toBe('all_done');
  });

  it('dirige vers la première leçon quand l’unité n’a jamais été travaillée', () => {
    const action = getNextAction(INITIAL_UNITS, createEmptyMasteryState());
    expect(action.kind).toBe('lesson');
    expect(action.unitId).toBe(1);
    expect(action.lessonId).toBeTruthy();
  });

  it('dirige vers le QCM quand la progression est insuffisante pour l’examen', () => {
    const units = unitsWithProgress({ 1: { progress: 40 } });
    const action = getNextAction(units, createEmptyMasteryState());
    expect(action.kind).toBe('quiz');
    expect(action.unitId).toBe(1);
  });

  it('propose l’examen de validation à partir de 60 % de progression', () => {
    const units = unitsWithProgress({ 1: { progress: 65 } });
    const action = getNextAction(units, createEmptyMasteryState());
    expect(action.kind).toBe('exam');
    expect(action.detailAr).toContain('80%');
  });

  it('priorise la remédiation ciblée après un échec d’examen', () => {
    const units = unitsWithProgress({ 1: { progress: 70 } });
    const mastery: MasteryState = {
      ...createEmptyMasteryState(),
      lastFailure: {
        unitId: 1,
        at: Date.now(),
        percent: 50,
        wrongQuestionIds: [501, 502],
        weakTopicsAr: ['مرحلة الاستنساخ'],
      },
    };
    const action = getNextAction(units, mastery);
    expect(action.kind).toBe('remediation');
    expect(action.weakTopicsAr).toContain('مرحلة الاستنساخ');
    expect(action.detailAr).toContain('مرحلة الاستنساخ');
  });

  it('un échec sur une autre unité ne bloque pas l’unité active', () => {
    const units = unitsWithProgress({ 1: { progress: 70 } });
    const mastery: MasteryState = {
      ...createEmptyMasteryState(),
      lastFailure: { unitId: 2, at: Date.now(), percent: 40, wrongQuestionIds: [], weakTopicsAr: [] },
    };
    const action = getNextAction(units, mastery);
    expect(action.kind).toBe('exam');
  });

  it('formule la mission du jour avec le titre de l’unité active', () => {
    const title = getMissionTitleAr(INITIAL_UNITS[0]);
    expect(title).toContain('الوحدة 1');
    expect(title).toContain('تركيب البروتين');
  });
});
