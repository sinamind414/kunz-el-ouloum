// mockExam.test.ts — composition des sujets blancs (sprint 41)
// + mode « دورة حقيقية » (rubrique sujet BAC, R2).

import { describe, expect, it } from 'vitest';
import {
  DUREE_EPREUVE_MINUTES,
  SESSION_EXAM_OFFSET,
  composeMockExam,
  composeSessionExam,
  decodageSessionExam,
  numeroDuJour,
  numeroSessionExam,
} from './mockExam';
import { BAC_IDEAS, IDEA_BY_ID, ideasForYear, pointsOfSujet } from './bacSessionIndex';

const NUMEROS = Array.from({ length: 40 }, (_, i) => i + 1);

describe('sujet blanc — structure officielle', () => {
  it('donne toujours trois exercices de 5, 7 et 8 points', () => {
    for (const n of NUMEROS) {
      const sujet = composeMockExam(n);
      expect(sujet.exercices.map((e) => e.points), `sujet ${n}`).toEqual([5, 7, 8]);
      expect(sujet.totalPoints, `sujet ${n}`).toBe(20);
    }
  });

  it('annonce la durée officielle de l’épreuve (4 h 30 — preuve : sujets ONEC « المدة: 04 سا ونصف »)', () => {
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

describe('mode session reelle - rubrique sujet BAC (R2)', () => {
  it('2019-S2 : les trois exercices reellement tombes, dans l ordre du sujet', () => {
    const sujet = composeSessionExam(2019, 2);
    const attendus = ideasForYear(2019)
      .filter((i) => i.sujet === 2)
      .sort((a, b) => a.exercice - b.exercice);
    expect(sujet.exercices.map((e) => e.id)).toEqual(attendus.map((e) => e.id));
    expect(sujet.sessions).toEqual([2019]);
    expect(sujet.totalPoints).toBe(pointsOfSujet(2019, 2));
    expect(sujet.dureeMinutes).toBe(DUREE_EPREUVE_MINUTES);
  });

  it('2016-S1 : bareme reel 6/5/9 affiche tel quel (jamais arrondi a 5/7/8)', () => {
    const sujet = composeSessionExam(2016, 1);
    expect(sujet.exercices.map((e) => e.points)).toEqual([6, 5, 9]);
    expect(sujet.totalPoints).toBe(20);
  });

  it('2021-S2 : incomplet dans la source, le total reste celui lu (< 20)', () => {
    const sujet = composeSessionExam(2021, 2);
    const somme = sujet.exercices.reduce((s, e) => s + e.points, 0);
    expect(sujet.totalPoints).toBe(somme);
    expect(sujet.totalPoints).toBeLessThan(20);
  });

  it('encodage : aller-retour numero <-> (annee, sujet) sans collision avec le tirage', () => {
    expect(numeroSessionExam(2019, 2)).toBe(SESSION_EXAM_OFFSET + 2019 * 2 + 1);
    expect(decodageSessionExam(numeroSessionExam(2019, 1))).toEqual({ year: 2019, sujet: 1 });
    expect(decodageSessionExam(numeroSessionExam(2016, 2))).toEqual({ year: 2016, sujet: 2 });
    const limite = SESSION_EXAM_OFFSET + 2050 * 2;
    for (let n = 1; n <= limite; n += 1) {
      const d = decodageSessionExam(n);
      if (d !== null) {
        expect(d.year).toBeGreaterThanOrEqual(2013);
        expect(d.sujet === 1 || d.sujet === 2).toBe(true);
      }
    }
    // numeroDuJour (1..200) ne retombe jamais dans une session reelle
    expect(decodageSessionExam(numeroDuJour())).toBeNull();
  });

  it('aucune idee inventee : tout exercice de session existe dans le corpus lu', () => {
    for (const s of [1, 2] as const) {
      for (const y of [2016, 2019, 2022, 2025]) {
        for (const e of composeSessionExam(y, s).exercices) {
          expect(IDEA_BY_ID[e.id], e.id).toBeDefined();
          expect(BAC_IDEAS.some((i) => i.id === e.id)).toBe(true);
        }
      }
    }
  });
});