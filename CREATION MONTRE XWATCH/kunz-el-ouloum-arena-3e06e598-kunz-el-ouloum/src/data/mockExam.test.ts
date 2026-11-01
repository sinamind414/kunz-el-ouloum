// mockExam.test.ts — composition des sujets blancs (sprint 41).

import { describe, expect, it } from 'vitest';
import { DUREE_EPREUVE_MINUTES, composeMockExam, numeroDuJour } from './mockExam';
import { BAC_IDEAS, IDEA_BY_ID } from './bacSessionIndex';

const NUMEROS = Array.from({ length: 40 }, (_, i) => i + 1);

describe('sujet blanc — structure officielle', () => {
  it('donne toujours trois exercices de 5, 7 et 8 points', () => {
    for (const n of NUMEROS) {
      const sujet = composeMockExam(n);
      expect(sujet.exercices.map((e) => e.points), `sujet ${n}`).toEqual([5, 7, 8]);
      expect(sujet.totalPoints, `sujet ${n}`).toBe(20);
    }
  });

  it('annonce la durée officielle de l’épreuve', () => {
    expect(composeMockExam(1).dureeMinutes).toBe(DUREE_EPREUVE_MINUTES);
    expect(DUREE_EPREUVE_MINUTES).toBe(270);
  });

  it('ne compose qu’avec des exercices réellement tombés', () => {
    for (const n of NUMEROS) {
      for (const e of composeMockExam(n).exercices) {
        expect(IDEA_BY_ID[e.id], e.id).toBeDefined();
      }
    }
  });
});

describe('sujet blanc — règles de variété', () => {
  it('ne répète jamais une unité porteuse dans le même sujet', () => {
    for (const n of NUMEROS) {
      const unites = composeMockExam(n).unitesPortees;
      expect(new Set(unites).size, `sujet ${n}`).toBe(unites.length);
    }
  });

  it('puise dans trois sessions différentes', () => {
    for (const n of NUMEROS) {
      const sessions = composeMockExam(n).sessions;
      expect(new Set(sessions).size, `sujet ${n}`).toBe(sessions.length);
    }
  });

  it('fait tourner le corpus : plus de 20 exercices distincts sur 40 sujets', () => {
    const vus = new Set(NUMEROS.flatMap((n) => composeMockExam(n).exercices.map((e) => e.id)));
    expect(vus.size).toBeGreaterThan(20);
  });

  it('privilégie les unités lourdes sans exclure les autres', () => {
    const unites = NUMEROS.flatMap((n) => composeMockExam(n).unitesPortees);
    const compte = (u: number) => unites.filter((x) => x === u).length;
    // U4 et U1 mènent le plus de points du corpus.
    expect(compte(4) + compte(1)).toBeGreaterThan(compte(9) + compte(10) + compte(11));
    // …mais la géologie tombe quand même : un sujet blanc ne doit pas mentir.
    expect(new Set(unites).size).toBeGreaterThanOrEqual(6);
  });
});

describe('sujet blanc — reproductibilité', () => {
  it('rend le même sujet pour le même numéro', () => {
    for (const n of [1, 7, 23, 99]) {
      expect(composeMockExam(n)).toEqual(composeMockExam(n));
    }
  });

  it('rend des sujets différents pour des numéros différents', () => {
    const a = composeMockExam(3).exercices.map((e) => e.id).join();
    const b = composeMockExam(4).exercices.map((e) => e.id).join();
    expect(a).not.toBe(b);
  });

  it('borne les numéros aberrants au lieu de planter', () => {
    expect(composeMockExam(0).numero).toBe(1);
    expect(composeMockExam(-5).exercices).toHaveLength(3);
    expect(composeMockExam(1.4).numero).toBe(1);
  });

  it('donne un numéro du jour stable dans la journée et différent le lendemain', () => {
    const jour = new Date('2026-04-10T08:00:00Z');
    const memeJour = new Date('2026-04-10T22:00:00Z');
    const lendemain = new Date('2026-04-11T08:00:00Z');
    expect(numeroDuJour(jour)).toBe(numeroDuJour(memeJour));
    expect(numeroDuJour(jour)).not.toBe(numeroDuJour(lendemain));
  });
});

describe('sujet blanc — assiette', () => {
  it('reste possible tant que le corpus fournit les trois barèmes', () => {
    for (const points of [5, 7, 8]) {
      expect(BAC_IDEAS.filter((i) => i.points === points).length).toBeGreaterThan(5);
    }
  });
});
