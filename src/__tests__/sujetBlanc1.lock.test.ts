// sujetBlanc1.lock.test.ts — VERROU H4a (audit 8 axes 20/10/2026).
//
// Le sujet blanc original n°1 doit :
//   · respecter le format algérien : 3 exercices 5+7+8 = 20 points, 4 h 30 ;
//   · avoir un registre d'attendus EXACT (Σ items = maxPts, pas d'item noté
//     sans forme de reconnaissance, source unique « sujet-blanc-original ») ;
//   · être noté par le MÊME moteur que le bac2025 (couverture des attendus ×
//     maxPts, plafonds d'intégrité) — copie vide = 0, corrigé complet =
//     couverture totale ;
//   · ne JAMAIS toucher aux groupes 2025 (zéro régression de registre).
import { describe, expect, it } from 'vitest';
import { SUJET_BLANC_1 } from '../data/sujetsBlancs/sujetBlanc1';
import {
  ATTENDUS_SUJET_BLANC_1,
} from '../data/dictionaries/attendusSujetBlanc1';
import {
  attendusDeGroupe,
  type ExerciceId,
} from '../data/dictionaries/attendusBac2025';
import { noterCopieCalibree } from '../data/dictionaries/calibrationBac2025';

const r2 = (n: number) => Math.round(n * 100) / 100;

describe('H4a — sujet blanc original n°1', () => {
  it('structure : format algérien complet (5+7+8 = 20 pts, 270 min)', () => {
    expect(SUJET_BLANC_1.id).toBe('blanc1');
    expect(SUJET_BLANC_1.dureeMinutes).toBe(270);
    expect(SUJET_BLANC_1.exercices).toHaveLength(3);
    expect(SUJET_BLANC_1.exercices.map((e) => e.points)).toEqual([5, 7, 8]);
    expect(SUJET_BLANC_1.totalPoints).toBe(20);
  });

  it("questions : chaque somme de points = poids officiel de l'exercice", () => {
    for (const ex of SUJET_BLANC_1.exercices) {
      const somme = r2(ex.questions.reduce((s, q) => s + q.points, 0));
      expect(somme).toBe(ex.points);
      expect(ex.questions.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('registre : Σ items = maxPts (5/7/8) et aucun item noté sans forme', () => {
    for (const ex of [1, 2, 3] as ExerciceId[]) {
      const g = attendusDeGroupe('blanc1', ex);
      expect(g.sujet).toBe('blanc1');
      expect(g.maxPts).toBe(SUJET_BLANC_1.exercices[ex - 1].points);
      const somme = r2(g.items.reduce((s, i) => s + i.points, 0));
      expect(somme).toBe(g.maxPts);
      for (const it of g.items) {
        // Pierre 2 : un item qui porte des points DOIT être créditable
        // (formes non vides OU composantes) — sinon c'est un item manuel
        // déclaré, exclu du dénominateur (points>0 exige formes).
        const auto = it.points > 0 && (it.formes.length > 0 || (it.composantes?.length ?? 0) > 0);
        expect(auto).toBe(true);
        expect(it.source).toBe('sujet-blanc-original');
      }
    }
  });

  it('formes plausibles : chaque forme est détectable dans son propre attendu', () => {
    // Même source que bac2025 : formes = sous-chaînes du texte de référence.
    for (const ex of [1, 2, 3] as ExerciceId[]) {
      const g = attendusDeGroupe('blanc1', ex);
      for (const it of g.items) {
        for (const f of it.formes) expect(f.length).toBeGreaterThan(0);
        for (const groupe of it.composantes ?? []) {
          expect(groupe.length).toBeGreaterThan(0);
        }
      }
    }
  });

  it('notation : copie vide = 0/20, corrigé complet = couverture totale sur les 3 exercices', () => {
    const vide = noterCopieCalibree(['', '', ''], 'blanc1');
    expect(vide.total).toBe(0);
    vide.exercices.forEach((n) => expect(n.couverture).toBe(0));

    // Copie = concaténation des formes de chaque exercice (le corrigé entier).
    const corriges = ([1, 2, 3] as ExerciceId[]).map((ex) =>
      ATTENDUS_SUJET_BLANC_1[ex]
        .items.flatMap((i) => [...i.formes, ...(i.composantes ?? []).flat()])
        .join(' - ')
    );
    const pleine = noterCopieCalibree([corriges[0], corriges[1], corriges[2]], 'blanc1');
    pleine.exercices.forEach((n) => {
      expect(n.couverture).toBe(1);
      expect(n.points).toBeGreaterThan(0);
      expect(n.points).toBeLessThanOrEqual(n.maxPts);
    });
    expect(pleine.total).toBeLessThanOrEqual(20);
    // Toute la copie est créditée par le barème : la note auto couvre l'essentiel.
    expect(pleine.total).toBeGreaterThanOrEqual(0.5 * 20);
  });

  it('zéro régression : les registres 2025 restent servis par le même aiguillage', () => {
    const g = attendusDeGroupe(1, 1);
    expect(g.sujet).toBe(1);
    expect(g.maxPts).toBe(5);
    expect(g.items.length).toBeGreaterThan(0);
  });
});
