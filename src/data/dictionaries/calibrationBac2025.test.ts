// calibrationBac2025.test.ts — Verrous de la notation calibrée (évaluation 80
// copies bac2025, métriques P3 : MAE 2.04/20, biais 0, F1 0.91).
// RÈGLE MOTEUR verrouillée : la note vient EXCLUSIVEMENT de la calibration
// couverture→points ; le barème officiel et les seuils restent diagnostiques.

import { describe, expect, it } from 'vitest';
import {
  CALIBRATION_BAC2025,
  noterDepuisCouverture,
  noterCopieCalibree,
  noterExerciceCalibre,
  uniteDeGroupe,
} from './calibrationBac2025';
import { CORRECTEUR_V1_UNITES, evaluerReponseKeywords } from '../../correcteurV1';

describe('calage des groupes bac2025', () => {
  it('6 groupes : mapping sujet→unités verrouillé (S1 [1,6,5], S2 [7,3,4])', () => {
    expect(CALIBRATION_BAC2025).toHaveLength(6);
    expect(([1, 2, 3] as const).map((ex) => uniteDeGroupe(1, ex)!.uniteId)).toEqual([1, 6, 5]);
    expect(([1, 2, 3] as const).map((ex) => uniteDeGroupe(2, ex)!.uniteId)).toEqual([7, 3, 4]);
  });

  it('barèmes verrouillés : Ex1=5, Ex2=7, Ex3=8 (total 20) — unités connues du correcteur', () => {
    for (const g of CALIBRATION_BAC2025) {
      expect(g.maxPts, `groupe ${g.sujet}-${g.exercice}`).toBe([5, 7, 8][g.exercice - 1]);
      expect(
        CORRECTEUR_V1_UNITES.some((u) => u.uniteId === g.uniteId),
        `unité ${g.uniteId} inconnue`,
      ).toBe(true);
    }
    expect(CALIBRATION_BAC2025.reduce((s, g) => s + g.maxPts, 0)).toBe(40); // 2 sujets × 20
  });
});

describe('noteDepuisCouverture — calibration pure (R1)', () => {
  it('monotone non décroissante sur [0,1] pour les 6 groupes', () => {
    for (const sujet of [1, 2] as const) {
      for (const exercice of [1, 2, 3] as const) {
        let precedent = -1;
        for (let cov = 0; cov <= 1.0001; cov += 0.05) {
          const { points } = noterDepuisCouverture(Math.min(cov, 1), sujet, exercice);
          expect(points, `S${sujet}-Ex${exercice} cov=${cov}`).toBeGreaterThanOrEqual(precedent);
          precedent = points;
        }
      }
    }
  });

  it('clamp [0, maxPts] : cov=0 → ≥0 (S2-Ex1 b<0 → 0) ; cov=1 → maxPts (a+b > maxPts)', () => {
    expect(noterDepuisCouverture(0, 2, 1).points).toBe(0);
    for (const g of CALIBRATION_BAC2025) {
      expect(g.a + g.b, `S${g.sujet}-Ex${g.exercice} doit saturer à cov=1`).toBeGreaterThan(g.maxPts);
      expect(noterDepuisCouverture(1, g.sujet, g.exercice).points).toBe(g.maxPts);
    }
  });

  it('ancres de régression (fit 80 copies, pleine précision)', () => {
    expect(noterDepuisCouverture(0.1, 1, 1).points).toBeCloseTo(0.58, 2);
    expect(noterDepuisCouverture(0.2, 1, 1).points).toBeCloseTo(3.22, 2);
    expect(noterDepuisCouverture(0.06, 2, 2).points).toBeCloseTo(4.11, 2);
    expect(noterDepuisCouverture(0.05, 2, 3).points).toBe(8); // 10.36 → clamp
  });

  it('groupe inconnu → note nulle (jamais de crash)', () => {
    expect(noterDepuisCouverture(0.5, 3 as 1, 9 as 2)).toEqual({
      uniteId: 0,
      mode: 'calibre',
      couverture: 0.5,
      points: 0,
      maxPts: 0,
    });
  });
});

describe('noterExerciceCalibre — R2 : le barème auto JAMAIS dans la note', () => {
  it('réponse vide → 0 pt malgré un plafond barème > 0', () => {
    const n = noterExerciceCalibre('', 1, 1);
    expect(n.points).toBe(0);
    expect(n.couverture).toBe(0);
    expect(n.diagnosticBareme!.creditAuto).toBe(0);
    expect(n.diagnosticBareme!.plafondAuto).toBeGreaterThan(0); // affiché, pas noté
  });

  it('Ex2/Ex3 : pas de barème build → diagnosticBareme null', () => {
    expect(noterExerciceCalibre('réponse', 1, 2).diagnosticBareme).toBeNull();
    expect(noterExerciceCalibre('réponse', 2, 3).diagnosticBareme).toBeNull();
  });

  it('invariant R2 : points = calibration(couverture) seule, pour tout texte', () => {
    const echantillons = [
      'المستضد أجسام مضادة خلايا بلازمية معقد مناعي',
      'الحصيلة الطاقوية 38 ATP لكل غلوكوز', // contexte barème Ex1 S2
      'نشاط انزيم sod السليم 100 والمصاب 30%',
      'التركيب الضوئي يحدث في الصانعة الخضراء',
    ];
    for (const sujet of [1, 2] as const) {
      for (const exercice of [1, 2, 3] as const) {
        const g = uniteDeGroupe(sujet, exercice)!;
        for (const texte of echantillons) {
          const n = noterExerciceCalibre(texte, sujet, exercice);
          const cov = evaluerReponseKeywords(texte, g.uniteId).couverture;
          // Règle moteur : couverture 0 → 0 pt (jamais de points pour une copie vide).
          const attendu = cov === 0 ? 0 : Math.min(g.maxPts, Math.max(0, g.a * cov + g.b));
          expect(n.points, `S${sujet}-Ex${exercice} «${texte.slice(0, 20)}»`).toBeCloseTo(
            Math.round(attendu * 100) / 100,
            2,
          );
        }
      }
    }
  });
});

describe('noterCopieCalibree — copie complète /20', () => {
  it('3 exercices dans l’ordre des unités ; note sensible à l’unité mappée ; total = somme ≤ 20', () => {
    const vide = noterCopieCalibree(['', '', ''], 1);
    expect(vide.exercices.map((e) => e.uniteId)).toEqual([1, 6, 5]);
    expect(vide.total).toBe(0); // copie vide = 0, même avec un plafond barème

    const immunité =
      'المستضد أجسام مضادة خلايا بلازمية معقد مناعي بلعمة المتمم الانتقاء النسيلي خلايا ذاكرة ' +
      'الاستجابة الأولية الاستجابة الثانوية اللقاح LTc البرفورين الغرانزيمات TCR LT4 الإنترلوكين';
    const copie = noterCopieCalibree([immunité, immunité, immunité], 2);
    expect(copie.exercices.map((e) => e.uniteId)).toEqual([7, 3, 4]);
    // Le texte immunité sature l’exercice mappé sur U4 (transfusion) et ne paie
    // PAS l’exercice mappé sur U7 (respiration) ; sur U3, la fuite par
    // sous-chaîne connue du moteur (الغرانزيمات ⊃ انزيم) reste bornée et
    // très inférieure à la note de l’unité réellement couverte.
    expect(copie.exercices[0]!.points).toBe(0);
    expect(copie.exercices[1]!.points).toBeLessThan(copie.exercices[2]!.points);
    expect(copie.exercices[2]!.points).toBe(8);
    expect(copie.total).toBeCloseTo(copie.exercices.reduce((s, e) => s + e.points, 0), 2);
    expect(copie.total).toBeLessThanOrEqual(20);
  });
});
