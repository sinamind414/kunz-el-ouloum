// src/data/expressJ7.ts — RÉVISION EXPRESS J-7 (étage 3 / R4).
//
// Recommandation de l'audit : « 7 séances de 25 min (2 leçons 🔴 + 1 quiz),
// et figer la date du Bac avec une source officielle OU un bandeau visible ».
//
// RÈGLE D'OR : 0 leçon et 0 énoncé inventés. Les leçons viennent de
// `PARCOURS_FLAT` (83 items réels), les unités de `PRIORITES_BAC` (poids mesurés
// sur 65 idées BAC). La date du Bac reste PROVISOIRE et doit être affichée.

import { PARCOURS_FLAT, type ParcoursItem } from '../lib/parcours/parcoursPath';
import {
  BAC_EXAM_DATE,
  BAC_EXAM_DATE_IS_PROVISIONAL,
  bacDaysLeft,
} from '../utils/dashboardActions';
import { PRIORITES_BAC, type PrioriteUnite } from './prioritesBac';

export const NB_JOURS_EXPRESS = 7;
export const LECONS_PAR_JOUR = 2;
/** [INTERPRÉTATION] durée proposée, pas une norme officielle. */
export const MINUTES_PROPOSEES = 25;

export const UNITES_REELLES_EXPRESS: readonly number[] = [
  ...new Set(PARCOURS_FLAT.map((i) => i.unitId)),
].sort((a, b) => a - b);

export interface LeconExpress {
  id: string;
  lessonKey: string;
  title: string;
  unitId: number;
}

export interface JourExpress {
  jour: number;
  libelleAr: string;
  priorite: PrioriteUnite;
  lecons: readonly LeconExpress[];
  quizUnitId: number;
  minutesProposees: number;
}

function premiereLeconDe(unitId: number): LeconExpress | null {
  const item: ParcoursItem | undefined = PARCOURS_FLAT.find(
    (i) => i.unitId === unitId && i.kind === 'lesson' && Boolean(i.lessonKey),
  );
  if (!item?.lessonKey) return null;
  return { id: item.id, lessonKey: item.lessonKey, title: item.title, unitId: item.unitId };
}

/**
 * 7 jours sur les 7 unités les plus mesurées, dans l'ordre du classement.
 * Chaque jour : 2 leçons réelles + 1 quiz de la 1re unité. Aucune unité
 * officielle n'est supprimée du programme : elles restent toutes dans le
 * parcours normal, simplement l'express PRIORISE (ce n'est pas une exclusion).
 */
export const PLAN_EXPRESS_J7: readonly JourExpress[] = Array.from(
  { length: NB_JOURS_EXPRESS },
  (_, j) => {
    const priorite = PRIORITES_BAC[j % PRIORITES_BAC.length];
    const voisine = PRIORITES_BAC[(j + 1) % PRIORITES_BAC.length];
    const lecons = [premiereLeconDe(priorite.unitId), premiereLeconDe(voisine.unitId)].filter(
      (l): l is LeconExpress => l !== null,
    );
    return {
      jour: j + 1,
      libelleAr: `اليوم ${j + 1} : ${priorite.emoji} ${priorite.titreAr}`,
      priorite,
      lecons,
      quizUnitId: priorite.unitId,
      minutesProposees: MINUTES_PROPOSEES,
    };
  },
);

/**
 * ⚠️ La date est PROVISOIRE : l'avertissement doit être affiché à l'élève
 * tant qu'aucune source officielle n'est vérifiée (« Non vérifiable »).
 */
export const AVERTISSEMENT_DATE_AR = BAC_EXAM_DATE_IS_PROVISIONAL
  ? `تاريخ البكالوريا المعتمد هنا (${BAC_EXAM_DATE}) مؤقت وغير مؤكد رسمياً — تحقّق منه لدى مؤسستك.`
  : `تاريخ البكالوريا : ${BAC_EXAM_DATE}`;

export function joursRestants(maintenant: Date = new Date()): number | null {
  return bacDaysLeft(maintenant, BAC_EXAM_DATE);
}

/** Vrai uniquement si la fenêtre J-7 est réellement ouverte. */
export function estFenetreExpress(maintenant: Date = new Date()): boolean {
  const j = joursRestants(maintenant);
  return j !== null && j >= 0 && j <= NB_JOURS_EXPRESS;
}
