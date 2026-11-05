// apprentissageProgression.lock.test.ts — les pastilles viennent du RÉEL.
//
// Anti-régression : si quelqu'un remplace un compteur dérivé par une constante
// (« 12/20 », « 3 jours », « 80 % »), ce verrou échoue. On écrit ici les MÊMES
// clés localStorage que l'application, puis on vérifie la valeur lue.

import { afterEach, describe, expect, it } from 'vitest';
import {
  LECONS_TOTAL,
  lireProgressionApprentissage,
} from './apprentissageProgression';
import { PARCOURS_FLAT } from '../lib/parcours/parcoursPath';
import { markDone, resetParcours } from '../lib/parcours/parcoursProgress';
import type { UserProgress } from '../types';

const CLE_EXAMENS = 'kunz_exam_attempts_log_v1';

function progression(flashcardStats = { again: 0, hard: 0, good: 0, easy: 0 }): UserProgress {
  return { flashcardStats } as unknown as UserProgress;
}

function ecrireTentatives(n: number): void {
  const lignes = Array.from({ length: n }, (_, i) => ({
    id: `exam_test_${i}`,
    dateISO: `2026-11-0${i + 1}T10:00:00.000Z`,
    total: 12,
    exercices: [],
    sujet: 1,
  }));
  localStorage.setItem(CLE_EXAMENS, JSON.stringify(lignes));
}

afterEach(() => {
  localStorage.clear();
  resetParcours();
});

describe('compteurs dérivés — aucune constante inventée', () => {
  it('74 leçons + 11 جسر = 85 items du parcours', () => {
    expect(LECONS_TOTAL).toBe(PARCOURS_FLAT.filter((i) => i.kind === 'lesson').length);
    expect(LECONS_TOTAL).toBe(74);
    expect(PARCOURS_FLAT.length).toBe(85);
  });

  it('installation neuve : 0 réel partout, pas de faux pourcentage', () => {
    expect(lireProgressionApprentissage(null)).toEqual({
      leconsFaites: 0,
      leconsTotal: 74,
      tentatives: 0,
      evaluations: 0,
    });
  });

  it('seules les LEÇONS faites comptent (un جسر n’est pas une leçon)', () => {
    const lecons = PARCOURS_FLAT.filter((i) => i.kind === 'lesson');
    const jalon = PARCOURS_FLAT.find((i) => i.kind === 'jalon')!;
    markDone(lecons[0].id);
    markDone(lecons[1].id);
    markDone(jalon.id);
    expect(lireProgressionApprentissage(null).leconsFaites).toBe(2);
  });

  it('les tentatives viennent de l’historique d’épreuves réellement archivé', () => {
    ecrireTentatives(3);
    expect(lireProgressionApprentissage(null).tentatives).toBe(3);
  });

  it('les évaluations sont la somme des 4 notes SM-2 enregistrées', () => {
    const p = lireProgressionApprentissage(
      progression({ again: 2, hard: 3, good: 5, easy: 1 }),
    );
    expect(p.evaluations).toBe(11);
  });

  it('un stockage corrompu ne fabrique ni note ni crash', () => {
    localStorage.setItem(CLE_EXAMENS, 'pas-du-json{');
    const p = lireProgressionApprentissage(null);
    expect(p.tentatives).toBe(0);
    expect(p.leconsFaites).toBe(0);
  });

  it('les trois compteurs sont indépendants (pas de dénominateur commun)', () => {
    markDone(PARCOURS_FLAT.filter((i) => i.kind === 'lesson')[0].id);
    ecrireTentatives(2);
    const p = lireProgressionApprentissage(
      progression({ again: 1, hard: 0, good: 4, easy: 0 }),
    );
    expect(p).toEqual({
      leconsFaites: 1,
      leconsTotal: 74,
      tentatives: 2,
      evaluations: 5,
    });
  });
});
