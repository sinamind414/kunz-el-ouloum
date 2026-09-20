// verifAr.parExercice.test.ts — VERIFAR PAR-EXERCICE (verrou ouvert 2026-09-19,
// fermé 2026-09-20). Le C7 (methodologyScorer) valide chaque critère `verifAr`
// par ET-logique de regex sur la production de l'élève. Jusqu'ici, le test
// c7.hardening vérifiait DEUX productions échantillons à la main. Ici, la
// garantie est systématique et PAR EXERCICE :
//   1. chaque exercice d'entraînement pointe vers une carte qui existe ;
//   2. toute source verifAr compile (new RegExp ne lève jamais) ;
//   3. pour CHAQUE exercice dont la carte porte du verifAr :
//      · la réponse EXPERTE de l'exercice passe TOUTES les sources (sinon la
//        porte C7 sanctionnerait le canon — bug pédagogique invalide) ;
//      · chaque critère verifAr est ATTEIGNABLE depuis l'énoncé (contexte +
//        données de l'exercice) : au moins une source y répond ;
//   4. l'exemple FAUTIF de la carte échoue sur les critères verifAr
//      (la porte discrimine, elle ne décore pas).

import { describe, expect, it } from 'vitest';
import { TRAINING_EXERCISES, VERB_CARDS } from '../../data/methodologyEngine';
import type { VerbCriteriaItem } from '../../data/methodologyEngine';
import { evaluateStudentProduction } from '../../utils/methodologyScorer';

const cardDe = (verbId: string) => VERB_CARDS.find((c) => c.id === verbId);

const criteresVerifAr = (verbId: string): { cardId: string; criteres: VerbCriteriaItem[] } => {
  const card = cardDe(verbId);
  return { cardId: card?.id ?? 'INCONNU', criteres: (card?.criteria ?? []).filter((c) => c.verifAr?.length) };
};

const compile = (source: string): RegExp | null => {
  try {
    return new RegExp(source, 'i');
  } catch {
    return null;
  }
};

describe('verifAr par-exercice — intégrité structurelle', () => {
  it('les 11 exercices d entraînement pointent vers des cartes existantes', () => {
    expect(TRAINING_EXERCISES).toHaveLength(11);
    for (const ex of TRAINING_EXERCISES) {
      expect(cardDe(ex.verbId), `${ex.id} → ${ex.verbId}`).toBeDefined();
    }
  });

  it('toute source verifAr du catalogue compile et est non vide', () => {
    let totalSources = 0;
    for (const card of VERB_CARDS) {
      for (const crit of card.criteria) {
        if (!crit.verifAr?.length) continue;
        for (const source of crit.verifAr) {
          totalSources++;
          expect(source.trim().length, `${card.id}.${crit.id}`).toBeGreaterThan(0);
          expect(compile(source), `${card.id}.${crit.id} : « ${source} »`).not.toBeNull();
        }
      }
    }
    // Mesure figée du 2026-09-20 : calc_c1 (1) + ped_c1 (1) + ped_c2 (1) +
    // ped_c3 (2 alternances distinctes) = 5 sources.
    expect(totalSources).toBe(5);
  });
});

const exercicesAvecVerifAr = TRAINING_EXERCISES.filter((ex) => criteresVerifAr(ex.verbId).criteres.length > 0);

describe('verifAr par-exercice — le canon passe et la porte est atteignable', () => {
  it('exactement 2 exercices à contenu spécifique portent du verifAr (mesure figée)', () => {
    expect(exercicesAvecVerifAr.map((e) => e.id)).toEqual(['ex_calcul_chargaff_10', 'ex_pedigree_mendelian_11']);
  });

  for (const ex of exercicesAvecVerifAr) {
    it(`${ex.id} : la réponse experte passe 100 % des critères verifAr (via le scorer réel)`, () => {
      const { criteres } = criteresVerifAr(ex.verbId);
      const canon = ex.stage1.expertAnswer;
      const resultat = evaluateStudentProduction(ex.verbId, canon);
      for (const crit of criteres) {
        const r = resultat.criteriaResults.find((x) => x.criterionId === crit.id);
        expect(r, `${ex.id} : critère ${crit.id} absent du rapport`).toBeDefined();
        expect(r!.passed, `${ex.id}.${crit.id} : le CANON échoue sa propre porte — verifAr à réparer`).toBe(true);
      }
    });

    it(`${ex.id} : chaque critère verifAr est atteignable depuis l énoncé (contexte + données)`, () => {
      const { criteres } = criteresVerifAr(ex.verbId);
      // L énoncé vu par l élève = question + contexte + données (le critère
      // « مرتبط بـ X » de ped_c2 écho la question elle-même — légitime).
      const corpus = `${ex.question} ${ex.context} ${ex.dataSnippet}`;
      for (const crit of criteres) {
        const atteignable = (crit.verifAr ?? []).some((source) => compile(source)?.test(corpus) ?? false);
        expect(atteignable, `${ex.id}.${crit.id} : aucune source ne répond dans l énoncé — critère impossible`).toBe(true);
      }
    });
  }
});

describe('verifAr par-exercice — la porte discrimine (l exemple fautif échoue)', () => {
  it('ex_calcul_chargaff_10 : la copie sans loi échoue calc_c1', () => {
    const ex = TRAINING_EXERCISES.find((e) => e.id === 'ex_calcul_chargaff_10')!;
    const fautive = evaluateStudentProduction(ex.verbId, '%G = 20%.');
    expect(fautive.criteriaResults.find((c) => c.criterionId === 'calc_c1')!.passed).toBe(false);
  });

  it('ex_pedigree_mendelian_11 : la copie à un seul événement échoue ped_c1 et ped_c3', () => {
    const ex = TRAINING_EXERCISES.find((e) => e.id === 'ex_pedigree_mendelian_11')!;
    const fautive = evaluateStudentProduction(
      ex.verbId,
      'المرض متنحٍّ لأنه يوجد طفل مصاب بين الأبواب السليمة في العائلة.',
    );
    expect(fautive.criteriaResults.find((c) => c.criterionId === 'ped_c1')!.passed).toBe(false);
    expect(fautive.criteriaResults.find((c) => c.criterionId === 'ped_c3')!.passed).toBe(false);
  });
});
