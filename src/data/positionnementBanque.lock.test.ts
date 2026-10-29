// positionnementBanque.lock.test.ts — VERROU DE LA TRANCHE P0-3 (banque du
// test de positionnement).
//
// Trois niveaux, méthode H1 :
//   1. DONNÉES : 18 items (cible plan 15-22), ids uniques, les 11 unités
//      couvertes, quotas conformes à la politique (2/unité à poids BAC mesuré
//      U1-U7, 1/unité U8-U11).
//   2. INTÉGRITÉ DE SOURCE (zéro contenu inventé — règle AGENTS.md) : chaque
//      item projeté est la copie EXACTE (énoncé/options/bonne réponse/
//      explication) d'un QCM du corpus existant SVT_QUIZ_QUESTIONS.
//   3. DÉTERMINISME : deux constructions donnent la même banque (ordre
//      compris) — sans cela, une reprise de test noterait d'autres items.

import { describe, expect, it } from 'vitest';
import {
  construireBanquePositionnement,
  POSITIONNEMENT_QUESTIONS,
  QUOTAS_UNITE,
  TAILLE_TEST_POSITIONNEMENT,
  UNITE_PAR_ID,
} from './positionnementBanque';
import { SVT_QUIZ_QUESTIONS, QCM_HORS_PERIMETRE } from '../quizCorpus';

describe('banque positionnement — données', () => {
  it(`18 items, ids uniques, cible 15-22 du plan P0-3 respectée`, () => {
    expect(POSITIONNEMENT_QUESTIONS.length).toBe(TAILLE_TEST_POSITIONNEMENT);
    expect(TAILLE_TEST_POSITIONNEMENT).toBe(18);
    expect(new Set(POSITIONNEMENT_QUESTIONS.map((q) => q.id)).size).toBe(TAILLE_TEST_POSITIONNEMENT);
  });

  it(`les 11 unités du programme représentées, quotas U1-7=2 / U8-11=1`, () => {
    const compteParUnite = new Map<number, number>();
    for (const q of POSITIONNEMENT_QUESTIONS) {
      const unite = UNITE_PAR_ID[q.id];
      compteParUnite.set(unite, (compteParUnite.get(unite) ?? 0) + 1);
    }
    expect([...compteParUnite.keys()].sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
    for (const [unite, compte] of compteParUnite) {
      expect(compte).toBe(QUOTAS_UNITE[unite]);
    }
  });

  it(`chaque unité disposait d assez d items (aucun doublon forcé)`, () => {
    for (const unite of Object.keys(QUOTAS_UNITE).map(Number)) {
      const disponibles = SVT_QUIZ_QUESTIONS.filter(
        (q) => q.unitId === unite && !QCM_HORS_PERIMETRE.has(q.id),
      ).length;
      expect(disponibles).toBeGreaterThanOrEqual(QUOTAS_UNITE[unite]);
    }
  });
});

describe(`banque positionnement — intégrité de source (zéro contenu inventé)`, () => {
  it(`chaque item est la copie exacte d un QCM du corpus existant`, () => {
    const parIdCorpus = new Map(SVT_QUIZ_QUESTIONS.map((q) => [`pos_${q.id}`, q]));
    for (const q of POSITIONNEMENT_QUESTIONS) {
      const source = parIdCorpus.get(q.id);
      expect(source, `id ${q.id} doit venir du corpus`).toBeTruthy();
      expect(q.question).toBe(source!.questionText);
      expect(q.options).toEqual(source!.options);
      expect(q.correctIndex).toBe(source!.correctAnswerIndex);
      expect(q.explanation).toBe(source!.explanation);
    }
  });

  it(`aucun item hors périmètre déclaré (QCM_HORS_PERIMETRE)`, () => {
    const idsCorpusBruts = POSITIONNEMENT_QUESTIONS.map((q) => Number(q.id.replace(`pos_`, ``)));
    for (const id of idsCorpusBruts) {
      expect(QCM_HORS_PERIMETRE.has(id)).toBe(false);
    }
  });

  it(`trois domaines représentés (cross-domaine, distinct du diagnostic mono-domaine)`, () => {
    const domaines = new Set(POSITIONNEMENT_QUESTIONS.map((q) => q.domainId));
    expect([...domaines].sort()).toEqual([1, 2, 3]);
  });
});

describe(`banque positionnement — déterminisme`, () => {
  it(`deux constructions successives donnent la même banque (ordre compris)`, () => {
    const a = construireBanquePositionnement();
    const b = construireBanquePositionnement();
    expect(b.map((q) => q.id)).toEqual(a.map((q) => q.id));
  });

  it(`l ordre suit l ordre du programme (unités 1 → 11)`, () => {
    const unites = POSITIONNEMENT_QUESTIONS.map((q) => UNITE_PAR_ID[q.id]);
    const triees = [...unites].sort((a, b) => a - b);
    expect(unites).toEqual(triees);
  });
});
