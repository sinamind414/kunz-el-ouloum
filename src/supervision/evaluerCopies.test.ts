// evaluerCopies.test.ts — banc de supervision R4 : parsing tolérant, split de
// sujet, Pearson, et cohérence des notes sur copies synthétiques construites
// DEPUIS les attendus (jamais de chiffre copié d'un ancien test).

import { describe, expect, it } from 'vitest';
import {
  splitSections,
  parserRecap,
  pearson,
  evaluerCopie,
  evaluerBatch,
  parserScoreAttendu,
  couperBlocScore,
} from './evaluerCopies';
import { attendusDeGroupe } from '../data/dictionaries/attendusBac2025';

describe('splitSections — repères التمرين', () => {
  it('3 repères ordinaux arabes → 3 sections non vides', () => {
    const t = ['intro', 'التمرين الأول blabla', 'التمرين الثاني blabla', 'التمرين الثالث blabla'].join('\n');
    const s = splitSections(t);
    expect(s).not.toBeNull();
    expect(s![0]).toContain('الأول');
    expect(s![1]).toContain('الثاني');
    expect(s![2]).toContain('الثالث');
  });

  it('repères numériques « تمرين 1 » acceptés', () => {
    const s = splitSections('x\nالتمرين 1 aaa\nالتمرين 2 bbb\nالتمرين 3 ccc');
    expect(s).not.toBeNull();
    expect(s![2]).toContain('ccc');
  });

  it('1 seul repère → null (copie non splittable)', () => {
    expect(splitSections('التمرين الأول seul')).toBeNull();
    expect(splitSections('pas de repères du tout')).toBeNull();
  });
});

describe('parserRecap — formats multiples', () => {
  it('eleve_XX : note · virgule · /20 · 3 notes par exercice sommées · chiffres arabes', () => {
    const r = parserRecap(
      [
        'RECAPITULATIF bac 2025',
        'eleve_01 : 12.5',
        'eleve_02 13,5/20',
        'eleve_03\t4.5\t6\t7.5',
        'eleve_04 : ١٤',
        'ligne bizarre sans eleve 99',
        'eleve_07 : (absent)',
      ].join('\n')
    );
    expect(r.notes.get(1)).toBe(12.5);
    expect(r.notes.get(2)).toBe(13.5);
    expect(r.notes.get(3)).toBe(18);
    expect(r.notes.get(4)).toBe(14);
    expect(r.notes.has(7)).toBe(false);
    expect(r.lignesNonParsees.some((l) => l.includes('99'))).toBe(true);
  });
});

describe('pearson', () => {
  it('corrélation parfaite → 1 ; inverse → -1 ; variance nulle → null', () => {
    expect(pearson([1, 2, 3, 4], [2, 4, 6, 8])).toBeCloseTo(1, 6);
    expect(pearson([1, 2, 3], [3, 2, 1])).toBeCloseTo(-1, 6);
    expect(pearson([5, 5, 5], [1, 2, 3])).toBeNull();
    expect(pearson([1], [1])).toBeNull();
  });
});

// Copie synthétique PAR SECTION : la concaténation de toutes les formes du
// groupe (formes + composantes) couvre 100 % des attendus auto de CE groupe.
// NB : c'est une salade de mots-clés — le plafond non_prose (30 %) DOIT la
// plafonner : on teste ici la couverture ET le blindage, pas la prose.
function sectionExhaustive(sujet: 1 | 2, exercice: 1 | 2 | 3): string {
  const g = attendusDeGroupe(sujet, exercice);
  const tokens = new Set<string>();
  for (const it of g.items) {
    for (const f of it.formes) tokens.add(f);
    for (const comp of it.composantes ?? []) for (const f of comp) tokens.add(f);
  }
  return [...tokens].join(' ');
}
const sujetExhaustif = (sujet: 1 | 2): string =>
  `التمرين الأول ${sectionExhaustive(sujet, 1)}\nالتمرين الثاني ${sectionExhaustive(sujet, 2)}\nالتمرين الثالث ${sectionExhaustive(sujet, 3)}`;

describe('evaluerCopie / evaluerBatch — copies synthétiques', () => {
  it('copie exhaustive S2 → couverture ~1 mais salade plafonnée à 30 % (blindage actif)', () => {
    const r = evaluerCopie('eleve_42.txt', sujetExhaustif(2));
    expect(r.mode).toBe('sujet-complet');
    expect(r.couverture).toBeGreaterThan(0.9);
    // non_prose 0.3 par exercice : 0.3 × (5+7+8) = 6 au maximum.
    expect(r.note).toBeGreaterThan(0);
    expect(r.note).toBeLessThanOrEqual(6);
    expect(r.plafondsActifs).toContain('non_prose');
  });

  it('copie vide → 0 ; charabia → 0', () => {
    expect(evaluerCopie('eleve_00.txt', '').note).toBe(0);
    expect(evaluerCopie('eleve_01.txt', 'qwerty lorem ipsum zz zz zz').note).toBeLessThan(2);
  });

  it('mode exercice forcé : couverture 1, note plafonnée à 30 % de maxPts (salade)', () => {
    const r = evaluerCopie('eleve_05.txt', sectionExhaustive(2, 3), {
      groupe: { sujet: 2, exercice: 3 },
    });
    expect(r.mode).toBe('exercice');
    expect(r.exercice).toBe(3);
    expect(r.note).toBeGreaterThan(0);
    expect(r.note).toBeLessThanOrEqual(0.3 * 8);
  });

  it('evaluerBatch : rapprochement RECAP → stats cohérentes (r = 1)', () => {
    const vide = 'التمرين الأول\nالتمرين الثاني\nالتمرين الثالث';
    const copies = [
      { fichier: 'eleve_01.txt', texte: sujetExhaustif(1) },
      { fichier: 'eleve_02.txt', texte: vide },
    ];
    const recap = parserRecap('eleve_01 : 6\neleve_02 : 0');
    const { resultats, stats } = evaluerBatch(copies, recap);
    expect(stats.n).toBe(2);
    expect(stats.nAvecProf).toBe(2);
    // La salade frappe les nouvelles formes/composantes : borne large, l'essentiel
    // est l'ordre (salade > vide) et la corrélation.
    expect(resultats[0].note).toBeGreaterThan(resultats[1].note);
    expect(resultats[1].note).toBe(0);
    expect(stats.pearson ?? 0).toBeGreaterThan(0.9);
  });
});

describe('SCORE ATTENDU — formats réels des copies bac2025-S1 (master)', () => {
  it('eleve_01 (copie faible) : 0.5 / 0.5 / 1.5, total 2.5', () => {
    const brut = [
      'التمرين الأول: bla ARNm',
      'التمرين الثاني: bla',
      'التمرين الثالث: bla',
      '----------------------------------------------------------------',
      'SCORE ATTENDU:',
      '- Exercice 1 : 0.5/5   (Q1 : 0.5 — Q2 texte scientifique : 0)',
      '- Exercice 2 : 0.5/7   (Partie 1 : 0.25/4.5 | Partie 2 : 0.25/2.5)',
      '- Exercice 3 : 1.5/8   (Partie 1 : 0.75/1.5 | Partie 2 : 0.75/4.5 | Partie 3 : 0/2)',
      '- TOTAL : 2.5/20',
      'Notes de correction:',
      '• Ex1: énumère les 3 types d ARN sans les décrire ; ARN pyrénoïde RIP.',
    ].join('\n');
    const a = parserScoreAttendu(brut);
    expect(a).not.toBeNull();
    expect(a!.exercices).toEqual([0.5, 0.5, 1.5]);
    expect(a!.total).toBe(2.5);
    const nettoye = couperBlocScore(brut);
    expect(nettoye).not.toContain('SCORE ATTENDU');
    expect(nettoye).not.toContain('pyrénoïde'); // le corrigé ne pollue plus la copie
    expect(nettoye).toContain('التمرين الأول');
  });

  it('eleve_40 (copie forte) : 5 / 6.5 / 8, total 19.5', () => {
    const brut = [
      'SCORE ATTENDU:',
      '- Exercice 1 : 5/5    (Q1 : 0.5 — Q2 : 4.5)',
      '- Exercice 2 : 6.5/7  (Partie 1 : 4.5/4.5 | Partie 2 : 2/2.5)',
      '- Exercice 3 : 8/8    (Partie 1 : 1.5/1.5 | Partie 2 : 4.5/4.5 | Partie 3 : 2/2)',
      '- TOTAL : 19.5/20',
    ].join('\n');
    const a = parserScoreAttendu(brut);
    expect(a!.exercices).toEqual([5, 6.5, 8]);
    expect(a!.total).toBe(19.5);
  });

  it('absence de bloc → null ; copie sans bloc → texte intact', () => {
    expect(parserScoreAttendu('copie sans bloc FINAL : 12/20')).toBeNull();
    expect(couperBlocScore('texte brut')).toBe('texte brut');
  });

  it('RECAP table à barres « N° | NOM | Ex1 | Ex2 | Ex3 | TOTAL »', () => {
    const r = parserRecap(
      [
        'N°  | NOM        | Ex1/5  | Ex2/7 | Ex3/8 | TOTAL  | NIVEAU',
        '----+------------+--------+-------+-------+--------+--------',
        '  1 | Amine B.   |  0.5   |  0.5  |  1.5  |  2.5   | Très faible',
        ' 40 | Sara M.    |  5     |  6.5  |  8    |  19.5  | Excellent',
        'Moyenne : 11,7/20 — Écart-type : 4,5',
      ].join('\n')
    );
    expect(r.notes.get(1)).toBe(2.5);
    expect(r.notes.get(40)).toBe(19.5);
    expect(r.notes.size).toBe(2);
  });
});
