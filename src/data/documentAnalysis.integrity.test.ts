// Garde-fou du dispositif d'analyse documentaire.
//
// Trois défauts réels, constatés puis corrigés, sont verrouillés ici :
//   1. `handleValidate` faisait `context: practice!` alors que 9 questions sur les
//      14 réellement atteignables n'avaient AUCUN contexte de pratique
//      => TypeError dans un gestionnaire d'événement, non rattrapé par
//      l'ErrorBoundary (React ne les intercepte pas) : bouton « صحّح إجابتي » mort.
//   2. 14 `unitId` sur 15 étaient faux (le nerveux annoncé en unité 1, l'immunologie
//      en unité 9 « النشاط التكتوني للصفائح »...). Champ jamais lu par la vue,
//      donc l'erreur ne se voyait pas — mais toute future navigation par unité,
//      statistique ou déverrouillage l'aurait propagée.
//   3. L'en-tête annonce « 15 وثيقة نخبة » alors que 9 documents sur 15 sont
//      `unavailable`. On n'échoue pas là-dessus (l'écart est assumé et signalé
//      dans l'audit), mais on fige le compte pour qu'il ne dérive pas en silence.

import { describe, expect, it } from 'vitest';
import { DOCUMENT_ANALYSIS_EXERCISES } from './documentAnalysisExercises';
import { DOCUMENT_PRACTICE_CONTEXTS, getDocumentPracticeContext } from './documentPracticeContexts';
import { isDocumentAssetAvailable } from './documentAssets';
import { INITIAL_UNITS } from '../unitCatalog';

const UNIT_IDS = new Set(INITIAL_UNITS.map((u) => u.id));

/** Questions réellement atteignables : la vue masque le bloc si l'asset manque. */
const reachable = DOCUMENT_ANALYSIS_EXERCISES.filter((e) => isDocumentAssetAvailable(e.doc.assetKey));

describe('exercices d analyse documentaire — intégrité', () => {
  it('rattache chaque exercice à une unité existante du catalogue', () => {
    for (const exercise of DOCUMENT_ANALYSIS_EXERCISES) {
      expect(UNIT_IDS.has(exercise.unitId), `${exercise.id} → unitId ${exercise.unitId}`).toBe(true);
    }
  });

  it('place chaque exercice dans l unité dont il traite réellement le contenu', () => {
    // Vérité établie à la main depuis INITIAL_UNITS (1 protéines, 2 structure/fonction,
    // 3 enzymes, 4 immunité, 5 nerveux, 6 photosynthèse).
    const expected: Record<string, number> = {
      nmj_ppm_courbe: 5,
      ach_jnm_schema: 5,
      ppse_ppsi_compare: 5,
      curare_table: 5,
      sarin_gb_double: 5,
      michaelis_courbe: 3,
      enzyme_ph_temp: 3,
      glycemie_januvia: 3,
      rifamycine_h1h2: 1,
      translation_schema: 1,
      h1_h2_generic_double_doc: 1,
      electro_hb: 2,
      ouchterlony_arcs: 4,
      membrane_hla_schema: 4,
      photosynth_courbe: 6,
    };

    for (const exercise of DOCUMENT_ANALYSIS_EXERCISES) {
      expect(expected[exercise.id], `exercice non répertorié: ${exercise.id}`).toBeDefined();
      expect(exercise.unitId, `${exercise.id}`).toBe(expected[exercise.id]);
    }
  });

  it('fournit un contexte de pratique à CHAQUE question atteignable', () => {
    const orphans: string[] = [];
    for (const exercise of reachable) {
      for (const question of exercise.questions) {
        if (!getDocumentPracticeContext(exercise.id, question.id)) {
          orphans.push(`${exercise.id}/${question.id}`);
        }
      }
    }
    // Sans contexte, la correction ne peut produire ni preuve ni trace.
    expect(orphans, `questions sans contexte: ${orphans.join(', ')}`).toEqual([]);
  });

  it('donne à chaque contexte des preuves attendues et un vocabulaire non vides', () => {
    for (const context of DOCUMENT_PRACTICE_CONTEXTS) {
      const ref = `${context.exerciseId}/${context.questionId}`;
      expect(context.expectedEvidence.length, ref).toBeGreaterThan(0);
      expect(context.vocabulary.length, ref).toBeGreaterThan(0);
      expect(context.goalAr.trim().length, ref).toBeGreaterThan(0);
      expect(context.observationAr.trim().length, ref).toBeGreaterThan(0);
    }
  });

  it('aligne l unité déclarée par le contexte sur celle de son exercice', () => {
    for (const context of DOCUMENT_PRACTICE_CONTEXTS) {
      const exercise = DOCUMENT_ANALYSIS_EXERCISES.find((e) => e.id === context.exerciseId);
      if (!exercise) continue; // contextes hors exercices « elite » (autres dispositifs)
      expect(context.unitId, `${context.exerciseId}/${context.questionId}`).toBe(exercise.unitId);
    }
  });

  it('note l écart entre les 15 exercices annoncés et les documents réellement affichables', () => {
    expect(DOCUMENT_ANALYSIS_EXERCISES).toHaveLength(15);
    // 6 exercices exploitables aujourd'hui ; les 9 autres affichent
    // « هذه الوثيقة غير جاهزة بعد. ». Faire monter ce chiffre est un progrès :
    // le test devra alors être mis à jour sciemment.
    expect(reachable).toHaveLength(6);
  });

  it('barème d entraînement à 20 points et étiquette anti-confusion présente', () => {
    for (const exercise of DOCUMENT_ANALYSIS_EXERCISES) {
      const total = exercise.grilleEntrainement.reduce((sum, c) => sum + c.points, 0);
      expect(total, `${exercise.id}`).toBe(20);
      // Étiquette rédigée en français dans la source : elle empêche de confondre
      // cette grille d'entraînement avec le barème officiel du sujet BAC.
      expect(exercise.label, `${exercise.id}`).toContain("n'est pas le barème officiel");
    }
  });
});
