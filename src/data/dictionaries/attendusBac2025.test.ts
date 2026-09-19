// attendusBac2025.test.ts — Verrous du REGISTRE des attendus obligatoires (Pierre 2).
//
// Le registre est la source unique du dénominateur de la note (R6). Ces tests
// garantissent : les sommes = les barèmes officiels (5/7/8), la parité avec le
// build prouvé fidèle (Ex1), la complétude des formes de reconnaissance, et la
// traçabilité des sources.

import { describe, expect, it } from 'vitest';
import {
  ATTENDUS_BAC2025,
  attendusDeGroupe,
  plafondAutoDe,
  type AttendusExercice,
} from './attendusBac2025';
import { ATTENDUS_BAREME } from './dictionnaireCorrecteur';
import { normalizeAr } from '../../lib/validation/normalizeAr';

const GROUPES: AttendusExercice[] = (
  [1, 2] as const
).flatMap((s) => ([1, 2, 3] as const).map((e) => attendusDeGroupe(s, e)));

describe('registre — sommes = barèmes officiels', () => {
  it('chaque groupe somme exactement à son barème (5/7/8)', () => {
    for (const g of GROUPES) {
      const somme = Math.round(g.items.reduce((a, i) => a + i.points, 0) * 100) / 100;
      expect(somme, `S${g.sujet}-Ex${g.exercice}`).toBe(g.maxPts);
    }
    expect(GROUPES.map((g) => g.maxPts)).toEqual([5, 7, 8, 5, 7, 8]);
  });

  it('aucun item à points sans forme NI composantes (sinon manuel — build only)', () => {
    for (const g of GROUPES) {
      for (const it of g.items) {
        const aComposantes = (it.composantes?.length ?? 0) > 0;
        if (it.points > 0 && it.formes.length === 0 && !aComposantes) {
          // Toléré UNIQUEMENT pour les items build (remontés au prof) —
          // tout item encodé à la main doit avoir ses formes.
          expect(it.source, `${g.sujet}/${it.id}`).toBe('build');
        }
        for (const f of it.formes) {
          expect(normalizeAr(f).length, `forme vide: ${it.id}`).toBeGreaterThan(0);
        }
        for (const comp of it.composantes ?? []) {
          expect(comp.length, `composante vide: ${it.id}`).toBeGreaterThan(0);
          for (const f of comp) expect(normalizeAr(f).length, `forme de composante vide: ${it.id}`).toBeGreaterThan(0);
        }
      }
    }
  });

  it('P5 — les items à rôles du S1-Ex1 portent leurs composantes (contexte + ARN)', () => {
    const g = attendusDeGroupe(1, 1);
    for (const it of g.items.filter((x) => x.id.includes('/Q1/'))) {
      expect(it.composantes?.length, `${it.id} : 2 composantes (contexte, ARN)`).toBe(2);
    }
    // Fin du « un mot = un item entier » : l'item RIP exige le mécanisme (adénine/ribose).
    const rip = g.items.find((x) => x.id.endsWith('/RIP'))!;
    expect(rip.composantes?.length).toBe(2);
    expect(rip.composantes![1].some((f) => ['ادنين', 'adenine'].includes(f))).toBe(true);
    // Pi (S2-Ex1) : la forme ajoutée à la main (équation officielle « +2Pi+ »).
    const pi = attendusDeGroupe(2, 1).items.find((x) => x.id.endsWith('Q1/item3'))!;
    expect(pi.formes).toContain('pi');
  });

  it('la Σ auto (plafond) est ≥ 70 % du barème sur les 6 groupes', () => {
    // Sinon la pré-note ne peut plus atteindre le max — trop d'items manuels.
    for (const g of GROUPES) {
      expect(plafondAutoDe(g), `S${g.sujet}-Ex${g.exercice}`).toBeGreaterThanOrEqual(0.7 * g.maxPts);
    }
  });

  it('chaque groupe porte son énoncé (détection de perroquet active par défaut)', () => {
    for (const g of GROUPES) expect(g.questionAr.length).toBeGreaterThan(20);
  });
});

describe('registre ↔ build (parité sur les Ex1 — sources verrouillées)', () => {
  it('S1-Ex1 : les items du pont = les items du build, points identiques (1.25 + 3.75)', () => {
    const g = attendusDeGroupe(1, 1);
    const buildKeys = Object.keys(ATTENDUS_BAREME).filter((k) => k.startsWith('bac2025_S1/S1-Ex1/'));
    expect(g.items.map((i) => i.id)).toEqual(buildKeys);
    const q1 = g.items.filter((i) => i.id.includes('/Q1/')).reduce((s, i) => s + i.points, 0);
    const q2 = g.items.filter((i) => i.id.includes('/Q2/')).reduce((s, i) => s + i.points, 0);
    expect(Math.round(q1 * 100) / 100).toBe(1.25); // 0.25 × 5 — corrigé officiel p.1
    expect(Math.round(q2 * 100) / 100).toBe(3.75); // RIP 1.25 — corrigé officiel
  });

  it('S2-Ex1 : pont complet sur le build (glycolyse)', () => {
    const g = attendusDeGroupe(2, 1);
    const buildKeys = Object.keys(ATTENDUS_BAREME).filter((k) => k.startsWith('bac2025_S2/S2-Ex1/'));
    expect(g.items.map((i) => i.id)).toEqual(buildKeys);
  });

  it('les items encodés à la main portent la source corrigé-officiel-2025', () => {
    for (const [s, e] of [[1, 2], [1, 3], [2, 2], [2, 3]] as const) {
      const g = ATTENDUS_BAC2025[s][e];
      expect(g.items.every((i) => i.source === 'corrige-officiel-2025'), `S${s}-Ex${e}`).toBe(true);
    }
  });
});
