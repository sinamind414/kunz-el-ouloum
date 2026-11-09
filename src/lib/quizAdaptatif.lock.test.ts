// Verrous R9 (2026-11-07) : difficulté ajustée en temps réel, ZÉRO question
// inventée, 3 paliers déjà présents dans le corpus.

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { SVT_QUIZ_QUESTIONS, LIBELLES_DIFFICULTE } from '../quizCorpus';
import {
  NB_QUESTIONS_SEANCE,
  PALIERS,
  PALIER_MAX,
  PALIER_MIN,
  REGLE_ADAPTATIVE_AR,
  REUSSITES_POUR_MONTER,
  choisirQuestion,
  palierInitial,
  prochainPalier,
  type PalierAdaptatif,
} from './quizAdaptatif';

const PAR_ID = new Map(SVT_QUIZ_QUESTIONS.map((q) => [q.id, q]));

describe('R9 : constat — le palier est corrélé à l unité', () => {
  it('531 questions servies, 3 paliers, UNE SEULE valeur par unité', () => {
    expect(SVT_QUIZ_QUESTIONS).toHaveLength(531);
    expect(Object.keys(LIBELLES_DIFFICULTE)).toHaveLength(3);
    const parUnite = new Map<number, Set<number>>();
    for (const q of SVT_QUIZ_QUESTIONS) {
      const ensemble = parUnite.get(q.unitId) ?? new Set<number>();
      ensemble.add(q.difficulte!);
      parUnite.set(q.unitId, ensemble);
    }
    expect(parUnite.size).toBe(11);
    for (const [unite, niveaux] of parUnite) {
      expect(niveaux.size, `unité ${unite} devrait avoir un seul palier`).toBe(1);
    }
    // D'où la nécessité d'un pool INTER-UNITÉS pour piloter les 3 niveaux.
    expect([...parUnite.get(1)!][0]).toBe(1);
    expect([...parUnite.get(6)!][0]).toBe(2);
    expect([...parUnite.get(9)!][0]).toBe(3);
  });
});

describe('R9 : règle de présentation, bornée et honnête', () => {
  it('2 réussites consécutives font monter, 1 échec fait descendre', () => {
    expect(REUSSITES_POUR_MONTER).toBe(2);
    expect(prochainPalier(1, [true, true])).toBe(2);
    expect(prochainPalier(2, [true, true])).toBe(3);
    expect(prochainPalier(1, [true, false])).toBe(1);
    expect(prochainPalier(3, [false])).toBe(2);
    expect(prochainPalier(1, [true])).toBe(1); // 1 seule réussite ne suffit pas
  });

  it('jamais hors des bornes 1..3', () => {
    for (const p of PALIERS) {
      for (const h of [[], [true], [false], [true, true], [false, false], [true, true, true]]) {
        const r = prochainPalier(p, h);
        expect(r).toBeGreaterThanOrEqual(PALIER_MIN);
        expect(r).toBeLessThanOrEqual(PALIER_MAX);
      }
    }
  });

  it('la règle affichée distingue interprétation et « Non vérifiable »', () => {
    expect(REGLE_ADAPTATIVE_AR).toContain('INTERPRÉTATION');
    expect(REGLE_ADAPTATIVE_AR).toContain('Non vérifiable');
    expect(REGLE_ADAPTATIVE_AR).toContain('دون أي إضافة');
    expect(NB_QUESTIONS_SEANCE).toBe(10);
  });

  it('palierInitial suit la 1re question étiquetée, sinon 1', () => {
    expect(palierInitial([])).toBe(1);
    expect(palierInitial([{ id: 0, unitId: 1 } as never])).toBe(1);
    expect(palierInitial(SVT_QUIZ_QUESTIONS.filter((q) => q.unitId === 6))).toBe(2);
    expect(palierInitial(SVT_QUIZ_QUESTIONS.filter((q) => q.unitId === 9))).toBe(3);
  });
});

describe('R9 : aucune question inventée, aucun doublon', () => {
  const utilises = new Set<number>();

  it('choisirQuestion ne renvoie que des questions du corpus servi', () => {
    for (const cible of PALIERS) {
      const choix = choisirQuestion(SVT_QUIZ_QUESTIONS, cible, new Set());
      expect(choix).not.toBeNull();
      expect(PAR_ID.get(choix!.question.id)).toBe(choix!.question);
      expect(choix!.question.difficulte).toBe(cible);
    }
  });

  it('une séance de 10 questions : 0 doublon, toutes du corpus', () => {
    const vus = new Set<number>();
    let palier: PalierAdaptatif = 1;
    let historique: boolean[] = [];
    for (let i = 0; i < NB_QUESTIONS_SEANCE; i += 1) {
      const choix = choisirQuestion(SVT_QUIZ_QUESTIONS, palier, vus);
      expect(choix).not.toBeNull();
      expect(vus.has(choix!.question.id)).toBe(false);
      expect(PAR_ID.has(choix!.question.id)).toBe(true);
      vus.add(choix!.question.id);
      historique = [...historique, true];
      palier = prochainPalier(choix!.palier, historique);
    }
    expect(vus.size).toBe(NB_QUESTIONS_SEANCE);
    expect(palier).toBe(3); // 10 réussites → palier max
  });

  it('repli honnête : si le palier cible est épuisé, on prend le plus proche', () => {
    const palier3 = SVT_QUIZ_QUESTIONS.filter((q) => q.difficulte === 3);
    const almostAll = new Set(palier3.map((q) => q.id)); // tout le palier 3 indisponible
    const choix = choisirQuestion(SVT_QUIZ_QUESTIONS, 3, almostAll);
    expect(choix).not.toBeNull();
    expect(choix!.palier).toBe(2); // voisin le plus proche, pas une question fabriquée
  });

  it('corpus épuisé → null, jamais de question fabriquée', () => {
    const tout = new Set(SVT_QUIZ_QUESTIONS.map((q) => q.id));
    expect(choisirQuestion(SVT_QUIZ_QUESTIONS, 1, tout)).toBeNull();
    expect(utilises.size).toBe(0);
  });
});

describe('R9 : architecture — pas de contenu ni de classement fabriqué', () => {
  const source = readFileSync(resolve(__dirname, 'quizAdaptatif.ts'), 'utf8');

  it('moteur pur : import TYPE uniquement, aucune donnée de question', () => {
    expect(source).toContain("import type { QuizQuestion }");
    expect(source).not.toMatch(/^import\s*\{[^}]*SVT_QUIZ_QUESTIONS/m);
    expect(source).not.toContain('classement');
    expect(source).not.toContain('Notification');
  });
});
