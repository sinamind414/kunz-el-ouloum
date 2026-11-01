// documentTypology.ts — INDEX SECONDAIRE sur la banque documentaire existante.
//
// Ce fichier ne crée AUCUN exercice : il regroupe l'existant selon deux axes
// que le BILAN du 2026-10-01 (`docs/BILAN_AUDIT_MODULES_VS_MASTER_2026-10-01.md`
// §5) identifie comme les trous les plus rentables :
//
//   TROU 3 — « Typologie des documents BAC » (~2 pts + gain de temps).
//   L'app possédait 19 exercices documentaires mais seulement un accès par
//   SITUATION. L'élève qui veut « s'entraîner aux tableaux » n'avait aucune
//   porte. `groupesParForme()` l'ouvre, sans écrire une ligne de contenu.
//
//   TROU 1 — « Exploitation chiffrée des résultats » (~2,5 pts/sujet).
//   Aucun exercice de la banque n'emploie le verbe « احسب » ; en revanche
//   43 questions portent un `ctx.docType`, dont 6 déclarées `quantitative`
//   par le ValidationEngine — tableaux ATP, courbe de saturation, vitesses
//   sismiques. `exercicesQuantitatifs()` les rassemble.
//
// Les libellés arabes sont repris VERBATIM du corpus (source citée en
// commentaire) : AGENTS.md §5 interdit tout contenu inventé.

import { DOCUMENT_ANALYSIS_EXERCISES } from './documentAnalysisExercises';
import { getDocumentAsset } from './documentAssets';
import { SITUATION_INDEX } from './situationIndex';

/** Formes de document portées par `DocAnalysisExercise.doc.type`. */
export type DocumentForme =
  | 'courbe'
  | 'tableau'
  | 'schema'
  | 'mixed'
  | 'ouchterlony'
  | 'electrophorese';

export interface FormeGroupe {
  forme: DocumentForme;
  /** Libellé arabe — extrait du corpus, jamais rédigé ici. */
  labelAr: string;
  exerciceIds: string[];
  /** Exercices dont le document s'affiche réellement (image/tableau dispo). */
  affichables: number;
  total: number;
}

// Libellés — d'où vient chaque mot :
//   courbe        : « منحنى » — terme employé partout dans
//                   documentPracticeContexts.ts (altAr) et situtationIndex.ts
//   tableau       : « جدول » — idem
//   schema        : « تخطيط » — doc.descriptionAr de ach_jnm_schema
//   mixed         : « وثيقتان » — doc.descriptionAr de sarin_gb_double
//   ouchterlony   : « أقواس الترسيب » — amorce de documentTypeAr
//                   « تحليل أقواس الترسيب (Ouchterlony) »
//   electrophorese: « تَرَحُّل كهربائي » — amorce de doc.descriptionAr
//                   « تَرَحُّل كهربائي للهيموغلوبين HbA/HbS. »
const FORME_LABEL: Record<DocumentForme, string> = {
  courbe: 'منحنى',
  tableau: 'جدول',
  schema: 'تخطيط',
  mixed: 'وثيقتان',
  ouchterlony: 'أقواس الترسيب',
  electrophorese: 'تَرَحُّل كهربائي',
};

/** Ordre d'affichage : des plus courantes aux plus rares. */
const FORME_ORDRE: DocumentForme[] = [
  'tableau',
  'courbe',
  'schema',
  'mixed',
  'ouchterlony',
  'electrophorese',
];

/**
 * Les exercices regroupés par forme, avec le compteur d'affichabilité.
 * `affichables < total` signale un exercice posé sans figure exploitable —
 * l'état est rendu explicitement par `DocumentFigure`, jamais masqué.
 */
export function groupesParForme(): FormeGroupe[] {
  return FORME_ORDRE.map((forme) => {
    const membres = DOCUMENT_ANALYSIS_EXERCISES.filter((e) => e.doc.type === forme);
    return {
      forme,
      labelAr: FORME_LABEL[forme],
      exerciceIds: membres.map((e) => e.id),
      affichables: membres.filter((e) => isAffichable(e.id)).length,
      total: membres.length,
    };
  }).filter((g) => g.total > 0);
}

function isAffichable(exerciseId: string): boolean {
  const ex = DOCUMENT_ANALYSIS_EXERCISES.find((e) => e.id === exerciseId);
  return Boolean(ex && getDocumentAsset(ex.doc.assetKey));
}

export interface ExerciceQuantitatif {
  exerciseId: string;
  /** Questions dont le ValidationEngine déclare la nature `quantitative`. */
  questionIds: string[];
}

/**
 * Exercices contenant au moins une question à nature quantitative.
 * C'est le seul signal « exploitation chiffrée » existant dans la banque :
 * le corpus ne contient aucun verbe de calcul (`احسب`) dans ses 43 questions.
 */
export function exercicesQuantitatifs(): ExerciceQuantitatif[] {
  const parExercice = new Map<string, string[]>();
  for (const ex of DOCUMENT_ANALYSIS_EXERCISES) {
    const qids = ex.questions
      .filter((q) => (q.ctx as { docType?: string }).docType === 'quantitative')
      .map((q) => q.id);
    if (qids.length > 0) parExercice.set(ex.id, qids);
  }
  return [...parExercice.entries()].map(([exerciseId, questionIds]) => ({ exerciseId, questionIds }));
}

/** Formes couvertes par un ensemble d'exercices. */
export function formesDe(exerciceIds: string[]): Set<DocumentForme> {
  const out = new Set<DocumentForme>();
  for (const id of exerciceIds) {
    const ex = DOCUMENT_ANALYSIS_EXERCISES.find((e) => e.id === id);
    if (ex) out.add(ex.doc.type);
  }
  return out;
}

/** Ids des situations qui exposent au moins un exercice d'une forme donnée. */
export function situationIdsParForme(forme: DocumentForme): Set<string> {
  const cibles = new Set(DOCUMENT_ANALYSIS_EXERCISES.filter((e) => e.doc.type === forme).map((e) => e.id));
  const out = new Set<string>();
  for (const s of SITUATION_INDEX) {
    if (s.exerciseIds.some((id) => cibles.has(id))) out.add(s.id);
  }
  return out;
}

/** Ids des situations qui exposent au moins un exercice à nature quantitative. */
export function situationIdsQuantitatives(): Set<string> {
  const cibles = new Set(exercicesQuantitatifs().map((x) => x.exerciseId));
  const out = new Set<string>();
  for (const s of SITUATION_INDEX) {
    if (s.exerciseIds.some((id) => cibles.has(id))) out.add(s.id);
  }
  return out;
}

/** Toutes les formes présentes, avec leur libellé (pour les pastilles d'UI). */
export function pastillesForme(): Array<{ forme: DocumentForme; labelAr: string; total: number }> {
  return groupesParForme().map((g) => ({ forme: g.forme, labelAr: g.labelAr, total: g.total }));
}
