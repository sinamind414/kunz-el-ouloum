// programSequence.ts — littéral de la séquence officielle du programme
// (source de vérité, TDM livre 2025). B5 (audit « ligne par ligne », 2026-10-17).
//
// POURQUOI CE MODULE EXISTE : OFFICIAL_PROGRAM_SEQUENCE vivait dans
// unitLessonSequences.ts, qui importe LESSON_LIBRARY (lessonData) ; or
// lessonData doit AUSSI connaître la séquence (unitId de LESSON_LIBRARY —
// l'heuristique `inferGlobalUnitIdFromBreadcrumb` se trompait sur 5 leçons
// jumelles scindées : phase2_2, phase3_2, phase10_2, phase17_2, phase20_2).
// Importer unitLessonSequences depuis lessonData créait un cycle
// lessonData → unitLessonSequences → lessonData. Le littéral est donc déplacé
// dans ce module-FEUILLE (aucun import), re-exporté à l'identique par
// unitLessonSequences (API inchangée pour tous les consommateurs).
//
// Défaut corrigé au passage (B5, 5 unitId faux) : phase2_chapitres_3_4_2 → U2,
// phase3_chapitres_5_6_2 → U3, phase10_chapitres_19_20_2 → U6,
// phase17_chapitres_33_34_2 → U11, phase20_chapitres_39_40_2 → U11.
// Verrou croisé : src/data/lessonIndexParity.test.ts.

export const OFFICIAL_PROGRAM_SEQUENCE: Record<number, string[]> = {
  // U1 — تركيب البروتين (TDM p.10 : 5 chapitres) : phase1(§1-2), transcription(§3),
  // phase1_2(§4 الترجمة), phase2(§5 مراحل الترجمة). phase1_2 est listée explicitement
  // APRÈS la transcription pour suivre l'ordre officiel du TDM.
  // NOTE : phase2_2 (niveaux) appartient à U2 — listée en U2, dédupliquée ici.
  1: [
    'phase1_chapitres_1_2',
    'lecon_transcription',
    'phase1_chapitres_1_2_2',
    'phase2_chapitres_3_4',
    // TC6 (T3c — audit architecture 19/10, §6/W7) : les 3 leçons actives de
    // l'unité étaient ORPHELINES (construites, présentes dans ACTIVE_LESSONS
    // et dans l'index du tuteur, jamais câblées — inatteignables). Rattachées
    // en CLÔTURE d'unité, append-pur : les ids positionnels des leçons déjà
    // faites ne bougent pas (sinistre de progression évité) ; l'interleave
    // chapitre-par-chapitre exigera une migration d'ids — tranche séparée.
    // Ordre entre elles : identifiants de registre L1→L2→L3, cohérent avec
    // les chaînes LESSON_PROGRESSION (l2 → l3).
    'd1-u1-l1-expression-genique',
    'd1-u1-l2-transcription',
    'd1-u1-l3-traduction',
  ],
  // U2 — بنية/وظيفة (TDM p.39 : 3 chapitres) : représentation + 2e moitié de phase2 + 1re de phase3
  // NOTE : phase3_2 (enzyme) appartient à U3 — listée en U3.
  // Ajout 2026-09 (audit, item 5) : leçon active du comportement des acides aminés
  // (شحنة / pHi / هجرة كهربائية) en TÊTE d'unité — trou n°1 de l'audit, notion
  // la plus difficile de l'unité et prérequis de toute lecture d'électrophorèse.
  // TC6 (§6/W7) : protein_structure_function (الفصل 8) était orpheline —
  // rattachée en clôture : elle chapeaute amino_acid_behavior (chaîne
  // LESSON_PROGRESSION : amino → protein_structure_function).
  2: ['amino_acid_behavior', 'lecon_representation', 'phase2_chapitres_3_4_2', 'phase3_chapitres_5_6', 'protein_structure_function'],
  // U3 — إنزيمي (TDM p.57 : 4 chapitres) : 2e moitié de phase3 + activité/structure + phase4 complète
  // Ajout 2026-09 (audit, items 7 et 8) : leçon active des MTHBBITAT (inhibiteurs)
  // + atelier des 6 courbes, en clôture d'unité — priorité n°1 du plan de renforcement.
  // TC6 (§6/W7) : d1-u3-l1-enzyme (الإنزيمات والحفز) était orpheline —
  // rattachée AVANT enzyme_inhibitors : le verrou enzymeInhibitors.lock
  // exige que les inhibiteurs CLOSENT l'unité, et LESSON_PROGRESSION chaîne
  // d1-u3-l1 → enzyme_inhibitors. La position l3→l4 d'enzyme_inhibitors est
  // MIGRÉE côté store (lib/parcours/parcoursIdMigration.ts, migration TC6).
  3: ['phase3_chapitres_5_6_2', 'lecon_activite_structure', 'phase4_chapitres_7_8', 'd1-u3-l1-enzyme', 'enzyme_inhibitors'],
  // U4 — مناعة (TDM p.73 : 11 chapitres, 6 couverts) : phases 5,6,7 complètes
  // Ajout 2026-09 : leçon active de RAPPEL des acquis 2AS (مورثة/أليل/نمط وراثي)
  // placée en tête d'unité — prérequis de CMH/HLA et ABO (≈ 15 min).
  // Ajout 2026-09 : حوصلة التعاون الخلوي en clôture d'unité (schéma-bilan + 3 exercices BAC).
  // Ajout 2026-09 (audit, item 3 bis) : le dossier VIH/SIDA s'intercale avant la
  // synthèse d'unité — c'est le plus gros écart offre/demande du corpus.
  // TC6 (§6/W7) : les 4 leçons actives d'immunité (الفصل 14→16→18→20) étaient
  // orphelines — rattachées APRÈS phase7 (fin des chapitres passifs) et AVANT
  // le dossier VIH + la حوصلة : l'ordre TDM (chapitres puis dossier puis
  // synthèse) reste le même, LESSON_PROGRESSION (mémoire → coopération) aussi.
  // Les ids décalés de hiv/cooperation sont MIGRÉS (parcoursIdMigration.ts).
  4: ['prerequis2AS_genetique', 'phase5_chapitres_9_10', 'phase6_chapitres_11_12', 'phase7_chapitres_13_14', 'immunity_self_nonself', 'immunity_humoral_response', 'immunity_cellular_response', 'immunity_memory_response', 'immunity_hiv_aids', 'immunity_cooperation'],
  // U5 — عصبي (TDM p.127 : 7 chapitres, 5 couverts) : phases 8,9 + 1re de phase10
  // NOTE : phase10_2 (chloroplaste) appartient à D2-U1 — listée en U6.
  // TC6 (§6/W7) : synapse (الفصل 26, آلية النقل المشبكي) était orpheline —
  // rattachée en clôture : c'est la leçon-pivot de l'unité (transmission synaptique).
  5: ['phase8_chapitres_15_16', 'phase9_chapitres_17_18', 'phase10_chapitres_19_20', 'synapse'],
  // U6 — photosynthèse (TDM p.174) : 2e moitié de phase10 + phases 11,12
  // + leçons expérimentales historiques (Hill/Ruben, Jagendorf, Calvin) en fin d'unité.
  // Ajout 2026-09 (audit, items 9-11) : la CHAINE photochimique elle-meme, apres
  // les preuves experimentales (Hill/Ruben, Jagendorf) et avant Calvin qui en
  // consomme les produits.
  6: ['phase10_chapitres_19_20_2', 'phase11_chapitres_21_22', 'phase12_chapitres_23_24', 'd2-u6-l1-hill-ruben', 'd2-u6-l2-jagendorf', 'photochemical_chain', 'd2-u6-l3-calvin'],
  // U7 — respiration (TDM p.205) : phases 13,14 + leçon expérimentale (Mitchell/Racker)
  7: ['phase13_chapitres_25_26', 'phase14_chapitres_27_28', 'd2-u7-l2-demarche-respiration', 'd2-u7-l1-mitchell-racker'],
  // U8 — bilan énergie (TDM p.227) : phase15
  8: ['phase15_chapitres_29_30'],
  // U9 — plaques (TDM p.237) : phases 16,17(base),18 + leçon expérimentale (Benioff)
  // NOTE : phase17_2 (magmatisme subduction) appartient à U11 — listée en U11.
  9: ['phase16_chapitres_31_32', 'd3-u9-l2-benioff', 'phase17_chapitres_33_34', 'phase18_chapitres_35_36'],
  // U10 — structure Terre (TDM p.259) : phase19 + 1re de phase20
  // NOTE : phase20_2 (déformations) appartient à U11 — listée en U11.
  // TC6 (§6/W7) : seismic_waves (الفصل 39-40) était orpheline — rattachée
  // après le passif des mêmes chapitres (phase20), append sans décalage d'ids.
  10: ['phase19_chapitres_37_38', 'phase20_chapitres_39_40', 'seismic_waves'],
  // U11 — structures géo (TDM p.287) : phase17_2 + phase20_2 + phases 21,22
  // (phase26 placeholder exclue — hors-programme ; ch collision/tقلص/ophiolites à reconstruire)
  // + leçon active U11 §7 (migmatite / تضاعف قشري : contenu 0 dans HTML, 5× dans MAN).
  // TC6 (§6/W7) : subduction (الفصل 43-44) était orpheline — rattachée après
  // le passif des mêmes chapitres (phase22), append sans décalage d'ids.
  11: ['d3-u11-l1-migmatite', 'phase17_chapitres_33_34_2', 'phase20_chapitres_39_40_2', 'phase21_chapitres_41_42', 'phase22_chapitres_43_44', 'subduction'],
};
