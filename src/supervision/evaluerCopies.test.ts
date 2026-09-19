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
    expect(resultats[0].ecart).toBeLessThanOrEqual(0.5);
    expect(resultats[1].note).toBe(0);
    expect(stats.pearson ?? 0).toBeGreaterThan(0.9);
  });
});
