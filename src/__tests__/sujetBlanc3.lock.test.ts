// sujetBlanc3.lock.test.ts — VERROU H4c (audit 8 axes 20/10/2026).
// Mêmes exigences que les verrous blancs 1 et 2, appliquées au sujet n°3, plus
// le garde « registres blancs distincts » élargi aux trois sujets.
import { describe, expect, it } from 'vitest';
import { SUJET_BLANC_3 } from '../data/sujetsBlancs/sujetBlanc3';
import { ATTENDUS_SUJET_BLANC_3 } from '../data/dictionaries/attendusSujetBlanc3';
import {
  attendusDeGroupe,
  type ExerciceId,
} from '../data/dictionaries/attendusBac2025';
import { noterCopieCalibree } from '../data/dictionaries/calibrationBac2025';

const r2 = (n: number) => Math.round(n * 100) / 100;

describe('H4c — sujet blanc original n°3', () => {
  it('structure : format algérien complet (5+7+8 = 20 pts, 270 min)', () => {
    expect(SUJET_BLANC_3.id).toBe('blanc3');
    expect(SUJET_BLANC_3.dureeMinutes).toBe(270);
    expect(SUJET_BLANC_3.exercices).toHaveLength(3);
    expect(SUJET_BLANC_3.exercices.map((e) => e.points)).toEqual([5, 7, 8]);
    expect(SUJET_BLANC_3.totalPoints).toBe(20);
    expect(SUJET_BLANC_3.exercices[1].documents.length).toBe(2);
    expect(SUJET_BLANC_3.exercices[2].documents.length).toBe(2);
  });

  it("questions : chaque somme de points = poids officiel de l'exercice", () => {
    for (const ex of SUJET_BLANC_3.exercices) {
      const somme = r2(ex.questions.reduce((s, q) => s + q.points, 0));
      expect(somme).toBe(ex.points);
      expect(ex.questions.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('registre : Σ items = maxPts (5/7/8), source unique, aucun item noté sans forme', () => {
    for (const ex of [1, 2, 3] as ExerciceId[]) {
      const g = attendusDeGroupe('blanc3', ex);
      expect(g.sujet).toBe('blanc3');
      expect(g.maxPts).toBe(SUJET_BLANC_3.exercices[ex - 1].points);
      const somme = r2(g.items.reduce((s, i) => s + i.points, 0));
      expect(somme).toBe(g.maxPts);
      for (const it of g.items) {
        const auto = it.points > 0 && (it.formes.length > 0 || (it.composantes?.length ?? 0) > 0);
        expect(auto).toBe(true);
        expect(it.source).toBe('sujet-blanc-original');
      }
    }
  });

  it('aucun caractère parasite (CJK/cyrillique) dans contenu et registre', () => {
    for (const src of [JSON.stringify(SUJET_BLANC_3), JSON.stringify(ATTENDUS_SUJET_BLANC_3)]) {
      const cjk = [...src].filter((c) => c.codePointAt(0)! >= 0x4e00 && c.codePointAt(0)! <= 0x9fff).length;
      const cyr = [...src].filter((c) => c.codePointAt(0)! >= 0x400 && c.codePointAt(0)! <= 0x4ff).length;
      expect(cjk).toBe(0);
      expect(cyr).toBe(0);
    }
  });

  it('notation : copie vide = 0/20, corrigé complet = couverture totale', () => {
    const vide = noterCopieCalibree(['', '', ''], 'blanc3');
    expect(vide.total).toBe(0);

    const corriges = ([1, 2, 3] as ExerciceId[]).map((ex) =>
      ATTENDUS_SUJET_BLANC_3[ex]
        .items.flatMap((i) => [...i.formes, ...(i.composantes ?? []).flat()])
        .join(' - ')
    );
    const pleine = noterCopieCalibree([corriges[0], corriges[1], corriges[2]], 'blanc3');
    pleine.exercices.forEach((n) => {
      expect(n.couverture).toBe(1);
      expect(n.points).toBeGreaterThan(0);
      expect(n.points).toBeLessThanOrEqual(n.maxPts);
    });
    // Décharge de mots-clés (salade) : plafond d'intégrité applicable — la
    // couverture est l'assertion forte, la note brute reste plafonnée ≤ 20.
    expect(pleine.total).toBeGreaterThan(0);
    expect(pleine.total).toBeLessThanOrEqual(20);
  });

  it('registres blancs distincts : aucun id partagé entre les 3 sujets blancs', () => {
    const ids: string[] = [];
    for (const sujet of ['blanc1', 'blanc2', 'blanc3'] as const) {
      for (const ex of [1, 2, 3] as ExerciceId[]) {
        for (const i of attendusDeGroupe(sujet, ex).items) ids.push(i.id);
      }
    }
    // Σ items = Σ ids uniques ⇒ aucun doublon entre les 3 registres blancs.
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.length).toBeGreaterThanOrEqual(60);
  });

  it('zéro régression : les registres 2025 restent servis par le même aiguillage', () => {
    const g = attendusDeGroupe(1, 3);
    expect(g.sujet).toBe(1);
    expect(g.maxPts).toBe(8);
    expect(g.items.length).toBeGreaterThan(0);
  });
});
