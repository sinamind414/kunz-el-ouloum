// V3 — Source de vérité : séquence officielle des leçons par unité.
// Déplacée depuis LessonsView afin que le Focus Engine puisse téléporter
// l'élève directement dans la bonne leçon (« أكمل من حيث توقفت ») sans
// importer le composant LessonsView (chargé paresseusement).

import { LESSON_LIBRARY } from '../lessonData';

export const OFFICIAL_PROGRAM_SEQUENCE: Record<number, string[]> = {
  1: ['phase1_chapitres_1_2', 'd1-u1-l1-expression-genique', 'd1-u1-l2-transcription', 'phase2_chapitres_3_4', 'd1-u1-l3-traduction'],
  2: ['phase3_chapitres_5_6', 'protein_structure_function'],
  3: ['d1-u3-l1-enzyme', 'phase4_chapitres_7_8'],
  4: ['phase5_chapitres_9_10', 'immunity_self_nonself', 'phase6_chapitres_11_12', 'immunity_humoral_response', 'phase7_chapitres_13_14', 'immunity_cellular_response', 'immunity_memory_response'],
  5: ['phase8_chapitres_15_16', 'phase9_chapitres_17_18', 'synapse', 'phase10_chapitres_19_20'],
  6: ['phase11_chapitres_21_22', 'phase12_chapitres_23_24'],
  7: ['phase13_chapitres_25_26', 'phase14_chapitres_27_28', 'phase15_chapitres_29_30'],
  9: ['phase16_chapitres_31_32', 'subduction', 'phase17_chapitres_33_34'],
  10: ['phase18_chapitres_35_36', 'seismic_waves', 'phase19_chapitres_37_38'],
  11: ['phase20_chapitres_39_40', 'phase21_chapitres_41_42', 'phase22_chapitres_43_44'],
};

/** Retourne la séquence des leçons d'une unité (séquence officielle, sinon leçons du catalogue). */
export function getUnitLessonSequence(unitId: number): string[] {
  const official = OFFICIAL_PROGRAM_SEQUENCE[unitId];
  if (official && official.length > 0) return official;
  return LESSON_LIBRARY.filter((lesson) => lesson.unitId === unitId).map((lesson) => lesson.key);
}

/** Première leçon d'une unité (cible par défaut du Focus Engine pour la découverte). */
export function getFirstLessonId(unitId: number): string | undefined {
  return getUnitLessonSequence(unitId)[0];
}
