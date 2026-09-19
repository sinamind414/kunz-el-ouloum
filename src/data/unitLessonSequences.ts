// V3 — Source de vérité : séquence officielle des leçons par unité.
// Déplacée depuis LessonsView afin que le Focus Engine puisse téléporter
// l'élève directement dans la bonne leçon (« أكمل من حيث توقفت ») sans
// importer le composant LessonsView (chargé paresseusement).

import { LESSON_LIBRARY } from '../lessonData';

export const OFFICIAL_PROGRAM_SEQUENCE: Record<number, string[]> = {
  // U1 — تركيب البروتين (TDM p.10 : 5 chapitres) : phases 1,2 + transcription
  // lecon_transcription (U1-3, format mono-leçon rétrofité chapter-view ch3).
  // NOTE : phase2_2 (niveaux) appartient à U2 — listée en U2, dédupliquée ici.
  1: ['phase1_chapitres_1_2', 'lecon_transcription', 'phase2_chapitres_3_4'],
  // U2 — بنية/وظيفة (TDM p.39 : 3 chapitres) : représentation + 2e moitié de phase2 + 1re de phase3
  // NOTE : phase3_2 (enzyme) appartient à U3 — listée en U3.
  2: ['lecon_representation', 'phase2_chapitres_3_4_2', 'phase3_chapitres_5_6'],
  // U3 — إنزيمي (TDM p.57 : 4 chapitres) : 2e moitié de phase3 + activité/structure + phase4 complète
  3: ['phase3_chapitres_5_6_2', 'lecon_activite_structure', 'phase4_chapitres_7_8'],
  // U4 — مناعة (TDM p.73 : 11 chapitres, 6 couverts) : phases 5,6,7 complètes
  4: ['phase5_chapitres_9_10', 'phase6_chapitres_11_12', 'phase7_chapitres_13_14'],
  // U5 — عصبي (TDM p.127 : 7 chapitres, 5 couverts) : phases 8,9 + 1re de phase10
  // NOTE : phase10_2 (chloroplaste) appartient à D2-U1 — listée en U6.
  5: ['phase8_chapitres_15_16', 'phase9_chapitres_17_18', 'phase10_chapitres_19_20'],
  // U6 — photosynthèse (TDM p.174) : 2e moitié de phase10 + phases 11,12
  // + leçons expérimentales historiques (Hill/Ruben, Jagendorf, Calvin) en fin d'unité.
  6: ['phase10_chapitres_19_20_2', 'phase11_chapitres_21_22', 'phase12_chapitres_23_24', 'd2-u6-l1-hill-ruben', 'd2-u6-l2-jagendorf', 'd2-u6-l3-calvin'],
  // U7 — respiration (TDM p.205) : phases 13,14 + leçon expérimentale (Mitchell/Racker)
  7: ['phase13_chapitres_25_26', 'phase14_chapitres_27_28', 'd2-u7-l1-mitchell-racker'],
  // U8 — bilan énergie (TDM p.227) : phase15
  8: ['phase15_chapitres_29_30'],
  // U9 — plaques (TDM p.237) : phases 16,17(base),18 + leçon expérimentale (Benioff)
  // NOTE : phase17_2 (magmatisme subduction) appartient à U11 — listée en U11.
  9: ['phase16_chapitres_31_32', 'd3-u9-l2-benioff', 'phase17_chapitres_33_34', 'phase18_chapitres_35_36'],
  // U10 — structure Terre (TDM p.259) : phase19 + 1re de phase20
  // NOTE : phase20_2 (déformations) appartient à U11 — listée en U11.
  10: ['phase19_chapitres_37_38', 'phase20_chapitres_39_40'],
  // U11 — structures géo (TDM p.287) : phase17_2 + phase20_2 + phases 21,22
  // (phase26 placeholder exclue — hors-programme ; ch collision/tقلص/ophiolites à reconstruire)
  // + leçon active U11 §7 (migmatite / تضاعف قشري : contenu 0 dans HTML, 5× dans MAN).
  11: ['d3-u11-l1-migmatite', 'phase17_chapitres_33_34_2', 'phase20_chapitres_39_40_2', 'phase21_chapitres_41_42', 'phase22_chapitres_43_44'],
};

/** Clé d'un fichier HTML de phase contenant exactement 2 leçons. */
const TWO_CHAPTER_KEY_RE = /^phase\d+_chapitres_\d+_\d+$/;

/**
 * Développe les clés de phase en leurs 2 leçons : chaque fichier
 * `phaseN_chapitres_X_Y.html` porte deux leçons isolées à l'affichage
 * (clé de base = 1re leçon, clé `_2` = 2e leçon).
 * Si la 2e moitié est explicitement affectée à une AUTRE unité
 * (fichier à cheval U1/U2, U2/U3, D1/D2...), on ne la duplique pas ici.
 */
function withSplitChapters(keys: string[], unitId?: number): string[] {
  const allExplicit = new Set<string>(Object.values(OFFICIAL_PROGRAM_SEQUENCE).flat());
  const ownerOf = new Map<string, number>();
  for (const [uidStr, list] of Object.entries(OFFICIAL_PROGRAM_SEQUENCE)) {
    for (const k of list as string[]) {
      if (!ownerOf.has(k)) ownerOf.set(k, Number(uidStr));
    }
  }
  const out: string[] = [];
  for (const key of keys) {
    if (!out.includes(key)) out.push(key);
    if (TWO_CHAPTER_KEY_RE.test(key)) {
      const splitKey = `${key}_2`;
      if (out.includes(splitKey)) continue;
      const owner = ownerOf.get(splitKey);
      // Ajout auto sauf si la 2e moitié vit explicitement dans une autre unité
      if (owner !== undefined && unitId !== undefined && owner !== unitId) continue;
      if (!allExplicit.has(splitKey) || owner === unitId) {
        if (!out.includes(splitKey)) out.push(splitKey);
      } else if (!owner) {
        if (!out.includes(splitKey)) out.push(splitKey);
      }
    }
  }
  return out;
}

/** Retourne la séquence des leçons d'une unité (séquence officielle, sinon leçons du catalogue). */
export function getUnitLessonSequence(unitId: number): string[] {
  const official = OFFICIAL_PROGRAM_SEQUENCE[unitId];
  const base =
    official && official.length > 0
      ? official
      : LESSON_LIBRARY.filter((lesson) => lesson.unitId === unitId).map((lesson) => lesson.key);
  return withSplitChapters(base, unitId);
}

/** Première leçon d'une unité (cible par défaut du Focus Engine pour la découverte). */
export function getFirstLessonId(unitId: number): string | undefined {
  return getUnitLessonSequence(unitId)[0];
}
