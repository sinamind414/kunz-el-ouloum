// sujetBlanc2.lock.test.ts — VERROU H4b (audit 8 axes 20/10/2026).
// Mêmes exigences que sujetBlanc1.lock.test.ts, appliquées au sujet n°2, plus
// un garde : les registres des sujets blancs sont DISTINCTS (aucun partage
// d'item, aucune fuite de barème entre sujets).
import { describe, expect, it } from 'vitest';
import { SUJET_BLANC_2 } from '../data/sujetsBlancs/sujetBlanc2';
import { ATTENDUS_SUJET_BLANC_2 } from '../data/dictionaries/attendusSujetBlanc2';
import {
  attendusDeGroupe,
  type ExerciceId,
} from '../data/dictionaries/attendusBac2025';
import { noterCopieCalibree } from '../data/dictionaries/calibrationBac2025';

const r2 = (n: number) => Math.round(n * 100) / 100;

describe('H4b — sujet blanc original n°2', () => {
  it('structure : format algérien complet (5+7+8 = 20 pts, 270 min)', () => {
    expect(SUJET_BLANC_2.id).toBe('blanc2');
    expect(SUJET_BLANC_2.dureeMinutes).toBe(270);
    expect(SUJET_BLANC_2.exercices).toHaveLength(3);
    expect(SUJET_BLANC_2.exercices.map((e) => e.points)).toEqual([5, 7, 8]);
    expect(SUJET_BLANC_2.totalPoints).toBe(20);
    expect(SUJET_BLANC_2.exercices[1].documents.length).toBeGreaterThanOrEqual(2);
    expect(SUJET_BLANC_2.exercices[2].documents.length).toBe(3);
  });

  it("questions : chaque somme de points = poids officiel de l'exercice", () => {
    for (const ex of SUJET_BLANC_2.exercices) {
      const somme = r2(ex.questions.reduce((s, q) => s + q.points, 0));
      expect(somme).toBe(ex.points);
      expect(ex.questions.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('registre : Σ items = maxPts (5/7/8), source unique, aucun item noté sans forme', () => {
    for (const ex of [1, 2, 3] as ExerciceId[]) {
      const g = attendusDeGroupe('blanc2', ex);
      expect(g.sujet).toBe('blanc2');
      expect(g.maxPts).toBe(SUJET_BLANC_2.exercices[ex - 1].points);
      const somme = r2(g.items.reduce((s, i) => s + i.points, 0));
      expect(somme).toBe(g.maxPts);
      for (const it of g.items) {
        const auto = it.points > 0 && (it.formes.length > 0 || (it.composantes?.length ?? 0) > 0);
        expect(auto).toBe(true);
        expect(it.source).toBe('sujet-blanc-original');
      }
    }
  });

  it('notation : copie vide = 0/20, corrigé complet = couverture totale', () => {
    const vide = noterCopieCalibree(['', '', ''], 'blanc2');
    expect(vide.total).toBe(0);

    const corriges = ([1, 2, 3] as ExerciceId[]).map((ex) =>
      ATTENDUS_SUJET_BLANC_2[ex]
        .items.flatMap((i) => [...i.formes, ...(i.composantes ?? []).flat()])
        .join(' - ')
    );
    const pleine = noterCopieCalibree([corriges[0], corriges[1], corriges[2]], 'blanc2');
    pleine.exercices.forEach((n) => {
      expect(n.couverture).toBe(1);
      expect(n.points).toBeGreaterThan(0);
      expect(n.points).toBeLessThanOrEqual(n.maxPts);
    });
    expect(pleine.total).toBeLessThanOrEqual(20);
    // La copie « corrigé brut » est une décharge de mots-clés : les plafonds
    // d'intégrité (salade 30 %) la bornent — comportement ATTENDU du moteur.
    // Ce qui doit être total, c'est la COUVERTURE (= 1 ci-dessus), pas la note.
    expect(pleine.total).toBeGreaterThan(0);
  });

  it('registres blancs distincts : aucun id partagé entre blanc1 et blanc2', () => {
    const g1 = attendusDeGroupe('blanc1', 1);
    const g2 = attendusDeGroupe('blanc2', 1);
    const ids1 = new Set(g1.items.map((i) => i.id));
    for (const i of g2.items) expect(ids1.has(i.id)).toBe(false);
    expect(g1.sujet).not.toBe(g2.sujet);
  });

  it('zéro régression : les registres 2025 restent servis par le même aiguillage', () => {
    const g = attendusDeGroupe(2, 3);
    expect(g.sujet).toBe(2);
    expect(g.maxPts).toBe(8);
    expect(g.items.length).toBeGreaterThan(0);
  });
});
