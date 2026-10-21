// sujetBlanc4.lock.test.ts — VERROU du sujet blanc original n°4 (avec la
// grille méthodologique MIFTAH). Mêmes exigences que les verrous blancs 1-3 :
// structure 5+7+8, registre auto conforme, zéro CJK/cyrillique, notation
// vide/plaine — PLUS : la grille اقرأ/اجمع/اربط/اختُم presente sur les TROIS
// exercices (demande propriétaire « sujets bac → approche meftah manhaj »).
import { describe, expect, it } from 'vitest';
import { SUJET_BLANC_1 } from '../data/sujetsBlancs/sujetBlanc1';
import { SUJET_BLANC_2 } from '../data/sujetsBlancs/sujetBlanc2';
import { SUJET_BLANC_3 } from '../data/sujetsBlancs/sujetBlanc3';
import { SUJET_BLANC_4 } from '../data/sujetsBlancs/sujetBlanc4';
import { ATTENDUS_SUJET_BLANC_4 } from '../data/dictionaries/attendusSujetBlanc4';
import {
  attendusDeGroupe,
  type ExerciceId,
} from '../data/dictionaries/attendusBac2025';
import { noterCopieCalibree } from '../data/dictionaries/calibrationBac2025';

const r2 = (n: number) => Math.round(n * 100) / 100;

describe('sujet blanc original n°4 (grille MIFTAH)', () => {
  it('structure : format algérien complet (5+7+8 = 20 pts, 270 min)', () => {
    expect(SUJET_BLANC_4.id).toBe('blanc4');
    expect(SUJET_BLANC_4.dureeMinutes).toBe(270);
    expect(SUJET_BLANC_4.exercices).toHaveLength(3);
    expect(SUJET_BLANC_4.exercices.map((e) => e.points)).toEqual([5, 7, 8]);
    expect(SUJET_BLANC_4.totalPoints).toBe(20);
    expect(SUJET_BLANC_4.exercices[0].documents.length).toBe(1);
    expect(SUJET_BLANC_4.exercices[1].documents.length).toBe(2);
    expect(SUJET_BLANC_4.exercices[2].documents.length).toBe(3);
  });

  it('grille MIFTAH : اقرأ/اجمع/اربط/اختُم présentes et non vides sur les 3 exercices', () => {
    for (const ex of SUJET_BLANC_4.exercices) {
      const m = ex.methodeMiftahAr;
      expect(m, `grille absente de l'exercice ${ex.numero}`).toBeTruthy();
      expect(m!.oqraAr.length).toBeGreaterThan(30);
      expect(m!.jameAr.length).toBeGreaterThan(30);
      expect(m!.rabtAr.length).toBeGreaterThan(30);
      expect(m!.khatmAr.length).toBeGreaterThan(30);
      expect(m!.oqraAr).toContain('اقرأ');
      expect(m!.jameAr).toContain('اجمع');
      expect(m!.rabtAr).toContain('اربط');
      expect(m!.khatmAr).toContain('اختُم');
    }
  });

  it('questions : chaque somme de points = poids officiel de l exercice', () => {
    for (const ex of SUJET_BLANC_4.exercices) {
      const somme = r2(ex.questions.reduce((s, q) => s + q.points, 0));
      expect(somme).toBe(ex.points);
      expect(ex.questions.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('registre : Σ items = maxPts (5/7/8), source unique, aucun item noté sans forme', () => {
    for (const ex of [1, 2, 3] as ExerciceId[]) {
      const g = attendusDeGroupe('blanc4', ex);
      expect(g.sujet).toBe('blanc4');
      expect(g.maxPts).toBe(SUJET_BLANC_4.exercices[ex - 1].points);
      const somme = r2(g.items.reduce((s, i) => s + i.points, 0));
      expect(somme).toBe(g.maxPts);
      for (const it of g.items) {
        const auto = it.points > 0 && (it.formes.length > 0 || (it.composantes?.length ?? 0) > 0);
        expect(auto).toBe(true);
        expect(it.source).toBe('sujet-blanc-original');
      }
    }
  });

  it('aucun caractère parasite (CJK/cyrillique) dans contenu, registre et grille', () => {
    for (const src of [
      JSON.stringify(SUJET_BLANC_4),
      JSON.stringify(ATTENDUS_SUJET_BLANC_4),
    ]) {
      const cjk = [...src].filter((c) => c.codePointAt(0)! >= 0x4e00 && c.codePointAt(0)! <= 0x9fff).length;
      const cyr = [...src].filter((c) => c.codePointAt(0)! >= 0x400 && c.codePointAt(0)! <= 0x4ff).length;
      expect(cjk).toBe(0);
      expect(cyr).toBe(0);
    }
  });

  it('notation : copie vide = 0/20, corrigé complet = couverture totale', () => {
    const vide = noterCopieCalibree(['', '', ''], 'blanc4');
    expect(vide.total).toBe(0);

    const corriges = ([1, 2, 3] as ExerciceId[]).map((ex) =>
      ATTENDUS_SUJET_BLANC_4[ex]
        .items.flatMap((i) => [...i.formes, ...(i.composantes ?? []).flat()])
        .join(' - ')
    );
    const pleine = noterCopieCalibree([corriges[0], corriges[1], corriges[2]], 'blanc4');
    pleine.exercices.forEach((n) => {
      expect(n.couverture).toBe(1);
      expect(n.points).toBeGreaterThan(0);
      expect(n.points).toBeLessThanOrEqual(n.maxPts);
    });
    // Plafond d'intégrité (salade de mots-clés) : couverture forte, note ≤ 20.
    expect(pleine.total).toBeGreaterThan(0);
    expect(pleine.total).toBeLessThanOrEqual(20);
  });

  it('registres blancs distincts : aucun id partagé entre les 4 sujets blancs', () => {
    const ids: string[] = [];
    for (const sujet of ['blanc1', 'blanc2', 'blanc3', 'blanc4'] as const) {
      for (const ex of [1, 2, 3] as ExerciceId[]) {
        for (const i of attendusDeGroupe(sujet, ex).items) ids.push(i.id);
      }
    }
    expect(new Set(ids).size).toBe(ids.length);
    // 61 (blancs 1-3) + 15 (blanc4) : le plancher protège d'une perte d'items.
    expect(ids.length).toBeGreaterThanOrEqual(75);
  });

  it('zéro régression : les registres 2025 restent servis par le même aiguillage', () => {
    const g = attendusDeGroupe(1, 3);
    expect(g.sujet).toBe(1);
    expect(g.maxPts).toBe(8);
    expect(g.items.length).toBeGreaterThan(0);
  });
});

// Garde-fou anti-copie : le blanc 4 ne doit PAS réutiliser les libellés des
// exercices des blancs 1-3 (titres distincts, contenus distincts).

describe('sujet blanc n°4 — non-duplication des thèmes', () => {
  it('les thèmes (après le tiret cadratin) sont absents des blancs 1-3', () => {
    const autres = [
      JSON.stringify(SUJET_BLANC_1),
      JSON.stringify(SUJET_BLANC_2),
      JSON.stringify(SUJET_BLANC_3),
    ];
    for (const ex of SUJET_BLANC_4.exercices) {
      const theme = ex.titreAr.split('—')[1]?.trim() ?? '';
      expect(theme.length, `thème non extrait : ${ex.titreAr}`).toBeGreaterThan(8);
      for (const autre of autres) {
        expect(autre.includes(theme), `thème déjà utilisé : ${theme}`).toBe(false);
      }
    }
  });
});
