// examTimer.test.ts — budget de temps de l'épreuve (sprint 43).

import { describe, expect, it } from 'vitest';
import {
  RESERVE_LECTURE_MIN,
  RESERVE_RELECTURE_MIN,
  budgetParExercice,
  exerciceAttendu,
  formatDuree,
  phaseEpreuve,
  retardSurBudget,
} from './examTimer';
import { DUREE_EPREUVE_MINUTES } from './mockExam';

const BAREME = [5, 7, 8];

describe('budget de temps', () => {
  it('réserve la lecture et la relecture avant de répartir', () => {
    const budgets = budgetParExercice(BAREME);
    const totalRedaction = budgets.reduce((s, b) => s + b.minutes, 0);
    expect(totalRedaction).toBe(
      DUREE_EPREUVE_MINUTES - RESERVE_LECTURE_MIN - RESERVE_RELECTURE_MIN,
    );
    expect(budgets[0].debutMinute).toBe(RESERVE_LECTURE_MIN);
  });

  it('donne plus de temps à l’exercice qui vaut plus de points', () => {
    const [e1, e2, e3] = budgetParExercice(BAREME);
    expect(e1.minutes).toBeLessThan(e2.minutes);
    expect(e2.minutes).toBeLessThan(e3.minutes);
    // ~60 min pour 05 points sur une épreuve de 4 h 30.
    expect(e1.minutes).toBeGreaterThan(50);
    expect(e1.minutes).toBeLessThan(70);
  });

  it('enchaîne les créneaux sans trou ni chevauchement', () => {
    const budgets = budgetParExercice(BAREME);
    for (let i = 1; i < budgets.length; i += 1) {
      expect(budgets[i].debutMinute).toBe(budgets[i - 1].finMinute);
    }
    expect(budgets[budgets.length - 1].finMinute).toBe(
      DUREE_EPREUVE_MINUTES - RESERVE_RELECTURE_MIN,
    );
  });

  it('ne rend rien pour un barème vide ou nul', () => {
    expect(budgetParExercice([])).toEqual([]);
    expect(budgetParExercice([0, 0])).toEqual([]);
  });

  it('s’adapte à une durée réduite (devoir surveillé de 2 h)', () => {
    const budgets = budgetParExercice(BAREME, 120);
    expect(budgets.reduce((s, b) => s + b.minutes, 0)).toBe(
      120 - RESERVE_LECTURE_MIN - RESERVE_RELECTURE_MIN,
    );
  });
});

describe('suivi pendant l’épreuve', () => {
  const budgets = budgetParExercice(BAREME);

  it('laisse lire avant de réclamer le premier exercice', () => {
    expect(exerciceAttendu(budgets, 5)).toBeNull();
    expect(phaseEpreuve(5)).toBe('lecture');
  });

  it('indique l’exercice attendu au fil du temps', () => {
    expect(exerciceAttendu(budgets, RESERVE_LECTURE_MIN + 1)).toBe(1);
    expect(exerciceAttendu(budgets, budgets[1].debutMinute + 1)).toBe(2);
    expect(exerciceAttendu(budgets, budgets[2].debutMinute + 1)).toBe(3);
  });

  it('bascule en relecture puis en fin d’épreuve', () => {
    expect(phaseEpreuve(DUREE_EPREUVE_MINUTES - 5)).toBe('relecture');
    expect(phaseEpreuve(DUREE_EPREUVE_MINUTES)).toBe('termine');
    expect(exerciceAttendu(budgets, DUREE_EPREUVE_MINUTES - 5)).toBeNull();
  });

  it('chiffre le retard quand on s’attarde sur un exercice', () => {
    const e1 = budgets[0];
    expect(retardSurBudget(budgets, 1, e1.finMinute)).toBe(0);
    expect(retardSurBudget(budgets, 1, e1.finMinute + 12)).toBe(12);
    expect(retardSurBudget(budgets, 1, e1.finMinute - 20)).toBe(0);
    expect(retardSurBudget(budgets, 9, 100)).toBe(0);
  });
});

describe('affichage', () => {
  it('formate en heures:minutes sur deux chiffres', () => {
    expect(formatDuree(0)).toBe('00:00');
    expect(formatDuree(9)).toBe('00:09');
    expect(formatDuree(75)).toBe('01:15');
    expect(formatDuree(270)).toBe('04:30');
  });

  it('ne produit jamais de durée négative', () => {
    expect(formatDuree(-30)).toBe('00:00');
  });
});
