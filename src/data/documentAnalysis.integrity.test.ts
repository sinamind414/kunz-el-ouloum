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
import { validateAnswer } from '../lib/validation/ValidationEngine';
import { DOCUMENT_PRACTICE_CONTEXTS, getDocumentPracticeContext } from './documentPracticeContexts';
import { isDocumentAssetAvailable } from './documentAssets';
import { INITIAL_UNITS } from '../unitCatalog';

const UNIT_IDS = new Set(INITIAL_UNITS.map((u) => u.id));

/** Questions réellement atteignables : la vue masque le bloc si l'asset manque. */
const reachable = DOCUMENT_ANALYSIS_EXERCISES.filter((e) => isDocumentAssetAvailable(e.doc.assetKey));

/**
 * Unités couvertes par l'AUTRE surface d'analyse documentaire : la sortie de leçon
 * (`LESSON_DOCUMENT_EXERCISE_ID` -> `LiveDocumentUracile`). Mesurée par exécution :
 * unités 1, 2, 4, 5, 6 et 9. Sans elle on conclurait à tort que ces unités sont
 * dépourvues de document — erreur effectivement commise, puis corrigée, sur la géologie.
 */
const LESSON_SURFACE_UNITS = new Set([1, 2, 4, 5, 6, 9]);

describe('exercices d analyse documentaire — intégrité', () => {
  it('rattache chaque exercice à une unité existante du catalogue', () => {
    for (const exercise of DOCUMENT_ANALYSIS_EXERCISES) {
      expect(UNIT_IDS.has(exercise.unitId), `${exercise.id} → unitId ${exercise.unitId}`).toBe(true);
    }
  });

  it('place chaque exercice dans l unité dont il traite réellement le contenu', () => {
    // Vérité établie à la main depuis INITIAL_UNITS (1 protéines, 2 structure/fonction,
    // 3 enzymes, 4 immunité, 5 nerveux, 6 photosynthèse, 7 respiration/fermentation,
    // 8 bilan énergétique, 10 structure de la Terre, 11 structures géologiques).
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
      // Lot 4 : les 4 unités qui n'avaient AUCUN document.
      respiration_bilan: 7,
      bilan_energetique_cellule: 8,
      structure_terre_ondes: 10,
      structures_geologiques_compare: 11,
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

  it('note l écart entre les exercices annoncés et les documents réellement affichables', () => {
    // 19 exercices : 15 d'origine + 4 ajoutés au lot 4 pour les unités 7, 8, 10 et 11,
    // qui ne disposaient d'AUCUN document alors qu'elles portent 196 QCM.
    expect(DOCUMENT_ANALYSIS_EXERCISES).toHaveLength(19);
    // 13 exploitables (9 après le lot 3, +4 tableaux du lot 4 issus des tableaux
    // de synthèse du livre officiel : pages 206, 228, 259-286, 287-330).
    // Les 6 restants affichent « هذه الوثيقة غير جاهزة بعد. » car ils exigent une
    // VRAIE image (schéma, immunodiffusion, électrophorèse) qu'on ne peut inventer.
    // Faire monter ces chiffres est un progrès : mettre à jour sciemment.
    expect(reachable).toHaveLength(13);
  });

  it('couvre les 11 unités du programme, aucune unité sans document', () => {
    // Régression majeure corrigée au lot 4 : U7, U8, U10 et U11 n'avaient aucun
    // document alors qu'elles totalisent 196 QCM. Ce test empêche qu'une unité
    // redevienne muette sur le format le plus proche de l'épreuve réelle.
    const covered = new Set(reachable.map((e) => e.unitId));
    const missing = INITIAL_UNITS.map((u) => u.id).filter(
      (id) => !covered.has(id) && !LESSON_SURFACE_UNITS.has(id)
    );
    expect(missing, `unités sans aucun document: ${missing.join(', ')}`).toEqual([]);
  });

  it('barème d entraînement à 20 points et étiquette anti-confusion présente', () => {
    for (const exercise of DOCUMENT_ANALYSIS_EXERCISES) {
      const total = exercise.grilleEntrainement.reduce((sum, c) => sum + c.points, 0);
      expect(total, `${exercise.id}`).toBe(20);
      // #67 — cette étiquette source reste en français : elle documente le champ
      // pour l'équipe, elle n'est PLUS ce que lit l'élève. Le message affiché est
      // rédigé en arabe et verrouillé par DocumentAnalysisResult.test.tsx, qui
      // interdit toute lettre latine. Un test de présence de chaîne ne prouve pas
      // qu'un avertissement est lu par son destinataire.
      expect(exercise.label, `${exercise.id}`).toContain("n'est pas le barème officiel");
    }
  });
});

// Invariant : l'application ne doit jamais SUGGERER a l'eleve une phrase que son
// propre correcteur sanctionnerait. Mesure a l'ajout : 6 gabarits sur 43 etaient
// rejetes (verbes de tendance au feminin absents de MONOTONE, ctx 'quantitative'
// sur des documents a echelles textuelles, et un gabarit contenant « كلما » dans
// sa mise en garde). Ce test empeche la reapparition du defaut.
describe('gabarits de reponse vs moteur de correction', () => {
  const avecGabarit = DOCUMENT_ANALYSIS_EXERCISES.flatMap((ex) =>
    (ex.questions ?? [])
      .filter((q) => q.templateHint && q.ctx)
      .map((q) => [`${ex.id}/${q.id}`, q] as const),
  );

  it('couvre tous les gabarits existants', () => {
    expect(avecGabarit.length).toBeGreaterThanOrEqual(43);
  });

  it.each(avecGabarit)('le gabarit %s est accepte par validateAnswer', (_id, q) => {
    const res = validateAnswer(q.templateHint!, q.ctx!);
    const bloquants = res.errors
      .filter((e) => e.severity === 'critical' || e.severity === 'major')
      .map((e) => e.code);
    expect(bloquants).toEqual([]);
  });
});
