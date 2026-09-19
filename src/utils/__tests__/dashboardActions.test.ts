// src/utils/dashboardActions.ts — cibles réelles des tuiles du dashboard (owner 2026-09-15).
// Objet du test : aucun clic ne doit viser une cible fantôme, et aucune tuile ne doit
// afficher une valeur inventée (le compteur BAC reste `null` tant que la date n'est pas tranchée).
import { describe, expect, it } from 'vitest';
import {
  BAC_EXAM_DATE,
  bacDaysLeft,
  biggestGapUnit,
  closestAchievementUnit,
  continueUnit,
  surpriseUnitId,
} from '../dashboardActions';
import { Unit, UserProgress } from '../../types';

const unit = (id: number, progress: number, extra: Partial<Unit> = {}): Unit => ({
  id,
  title: `وحدة ${id}`,
  lessonsCount: 4,
  description: '',
  progress,
  isLocked: false,
  domain: 'domaine1',
  ...extra,
});

const progressOf = (completedUnits: number[] = []): UserProgress =>
  ({
    xp: 0,
    streak: 0,
    completedUnits,
    completedQuestionsCount: 0,
    studyMinutes: 0,
    flashcardStats: { again: 0, hard: 0, good: 0, easy: 0 },
    quizScoreHistory: [],
  }) as UserProgress;

describe('biggestGapUnit — ثغرة خطيرة', () => {
  it('retient l’unité non terminée la plus faible', () => {
    const units = [unit(1, 80), unit(2, 10), unit(3, 45)];
    expect(biggestGapUnit(units)?.id).toBe(2);
  });

  it('ignore les unités verrouillées et les unités terminées', () => {
    const units = [unit(1, 5, { isLocked: true }), unit(2, 100), unit(3, 60)];
    expect(biggestGapUnit(units)?.id).toBe(3);
  });

  it('à égalité, prend la plus anciennement étudiée', () => {
    const units = [unit(1, 20, { lastStudiedTimestamp: 2_000 }), unit(2, 20, { lastStudiedTimestamp: 1_000 })];
    expect(biggestGapUnit(units)?.id).toBe(2);
  });

  it('renvoie null si tout est terminé', () => {
    expect(biggestGapUnit([unit(1, 100), unit(2, 100)])).toBeNull();
  });
});

describe('closestAchievementUnit — إنجاز قريب', () => {
  it('retient l’unité entamée la plus avancée (et jamais un 0 % inventé)', () => {
    const units = [unit(1, 0), unit(2, 95), unit(3, 40)];
    expect(closestAchievementUnit(units)?.id).toBe(2);
    expect(closestAchievementUnit(units)?.progress).toBe(95);
  });

  it('renvoie null quand aucune unité n’est entamée', () => {
    expect(closestAchievementUnit([unit(1, 0), unit(2, 0)])).toBeNull();
  });
});

describe('continueUnit — مهمة 3 دقائق', () => {
  it('reprend l’unité travaillée le plus récemment et non terminée', () => {
    const units = [
      unit(1, 40, { lastStudiedTimestamp: 1_000 }),
      unit(2, 70, { lastStudiedTimestamp: 9_000 }),
      unit(3, 100, { lastStudiedTimestamp: 9_999_999 }),
    ];
    expect(continueUnit(units)?.id).toBe(2);
  });

  it('sans historique, retombe sur la plus grande lacune', () => {
    expect(continueUnit([unit(1, 90), unit(2, 15)])?.id).toBe(2);
  });

  it('tout terminé → propose une unité validée (révision utile)', () => {
    const units = [unit(1, 100), unit(2, 100, { isLocked: true })];
    expect(continueUnit(units, progressOf([1]))?.id).toBe(1);
  });

  it('renvoie null sur une liste vide', () => {
    expect(continueUnit([])).toBeNull();
  });
});

describe('surpriseUnitId — سؤال مفاجئ', () => {
  it('tire uniquement dans les unités déjà rencontrées (entamées ou validées)', () => {
    const units = [unit(1, 0), unit(2, 30), unit(3, 0)];
    const progress = progressOf([3]);
    // pool = unités 2 et 3 (entamée ou validée) ; 0 → première du pool
    expect(surpriseUnitId(units, progress, () => 0)).toBe(2);
    expect(surpriseUnitId(units, progress, () => 0.999)).toBe(3);
  });

  it('renvoie null si l\'élève n’a révisé aucune unité (repli supprimé)', () => {
    const units = [unit(1, 0), unit(2, 0), unit(3, 0)];
    expect(surpriseUnitId(units, progressOf(), () => 0)).toBeNull();
    // égal avec quelques unités déverrouillées mais non révisées
    const units2 = [unit(1, 0, { isLocked: false }), unit(2, 0, { isLocked: false })];
    expect(surpriseUnitId(units2, progressOf(), () => 0)).toBeNull();
  });

  it('ne propose jamais une unité verrouillée (même si révisée ailleurs)', () => {
    // une unité révisée mais verrouillée n'est pas dans unlockedUnits → exclue
    const units = [unit(1, 50, { isLocked: true }), unit(2, 0, { isLocked: false })];
    expect(surpriseUnitId(units, progressOf(), () => 0)).toBeNull();
  });

  it('valide par le repli sur toute la liste complète est supprimé', () => {
    // ancien comportement : si aucun pool, repli sur toutes les unités.
    // nouveau comportement : null dès qu'aucune unité révisée = déverrouillée rencontrée.
    const units = [unit(1, 0, { isLocked: false }), unit(2, 0, { isLocked: false })];
    expect(surpriseUnitId(units, progressOf(), () => 0)).toBeNull();
  });

  it('renvoie null sur une liste vide', () => {
    expect(surpriseUnitId([])).toBeNull();
  });

  it('avec 1 seule unité révisée, ne peut retourner que celle-ci', () => {
    const units = [unit(1, 0), unit(2, 30), unit(3, 0)];
    // unité 2 seule rencontrée
    expect(surpriseUnitId(units, progressOf([2]), () => 0.42)).toBe(2);
    expect(surpriseUnitId(units, progressOf([2]), () => 0.99)).toBe(2);
  });
});

describe('bacDaysLeft — عدّاد BAC', () => {
  it('date non tranchée → null (jamais de chiffre inventé)', () => {
    expect(BAC_EXAM_DATE).toBe('');
    expect(bacDaysLeft(new Date(2026, 8, 15))).toBeNull();
    expect(bacDaysLeft(new Date(2026, 8, 15), '   ')).toBeNull();
    expect(bacDaysLeft(new Date(2026, 8, 15), 'juin 2027')).toBeNull();
  });

  it('compte les jours jusqu’à la date officielle', () => {
    expect(bacDaysLeft(new Date(2026, 8, 15), '2026-09-20')).toBe(5);
    expect(bacDaysLeft(new Date(2026, 8, 15), '2026-09-15')).toBe(0);
  });

  it('passé la date → valeur négative (le message reste honnête)', () => {
    expect(bacDaysLeft(new Date(2026, 8, 15), '2026-09-01')).toBe(-14);
  });

  it('franchit correctement les fins de mois', () => {
    expect(bacDaysLeft(new Date(2026, 8, 30), '2026-10-03')).toBe(3);
  });
});