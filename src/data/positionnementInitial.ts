// src/data/positionnementInitial.ts — CONVERGENCE (2026-11-13, GO propriétaire
// en session) : le test du panneau « خطة تناسب مستواك » est DÉSORMAIS la banque
// P0-3 du coach (src/data/positionnementBanque.ts : 18 items piochés dans les
// 531 QCM du corpus, pondération par poids BAC mesuré). UNE SEULE mesure, UN
// SEUL store (kunz_positionnement_v1), DEUX portes (panneau + coach).
//
// Ce module ne fait plus que l'ORIENTATION : score → 3 profils → rubrique
// existante (cours / entrainement / revision). Aucun contenu scientifique ici.
//
// RÈGLE D'OR : 0 question inventée — toute la banque vient du corpus via
// positionnementBanque (verrou positionnementBanque.lock.test.ts).
//
// [CONSTAT] L'ancien test maison (15 items : 12 QCM + 3 verbes) est retiré ;
// les contrats de verbes restent servis par le glossaire du capitaine
// (glossaireCapitaine.ts), inchangés.
// [INTERPRÉTATION] Seuils recalés de 15 → 18 items (6/15 = 40 % → 7/18 ≈ 39 % ;
// 12/15 = 80 % → 14/18 ≈ 78 %) : proposition pédagogique, PAS une norme
// officielle — « Non vérifiable ».

import { POSITIONNEMENT_QUESTIONS, UNITE_PAR_ID } from './positionnementBanque';
import { noteSur20 } from '../utils/positionnement';

export type ProfilEleve = 'bases' | 'consolidation' | 'approfondissement';
export type ObjectifNote = 10 | 14 | 18;

export const OBJECTIFS_NOTE: readonly ObjectifNote[] = [10, 14, 18];

/** [INTERPRÉTATION] seuils recalés sur 18 réponses, non officiels. */
export const SEUILS_PROFIL = { consolidation: 7, approfondissement: 14 } as const;

export interface ResultatPositionnement {
  score: number;
  total: number;
  /** Pourcentage arrondi 0-100 — même mesure que le store du coach. */
  percent: number;
  /** Note estimée /20 (« تقدير أولي ») — même fonction que le moteur P0-3. */
  noteEstimee: number;
  profil: ProfilEleve;
  objectif: ObjectifNote;
  /** Unités du programme où au moins une réponse est fausse (tri croissant). */
  unitesRatees: readonly number[];
  rubrique: 'cours' | 'entrainement' | 'revision';
  outilAr: string;
  raisonAr: string;
}

export const LIBELLES_PROFIL: Record<ProfilEleve, string> = {
  bases: 'إعادة بناء الأسس',
  consolidation: 'تثبيت وبناء التدريب',
  approfondissement: 'تعميم ومواضيع معقدة',
};

function profilDepuisScore(score: number): ProfilEleve {
  return score >= SEUILS_PROFIL.approfondissement
    ? 'approfondissement'
    : score >= SEUILS_PROFIL.consolidation
      ? 'consolidation'
      : 'bases';
}

/** Recalage exact inverse percent → profil (pour la reprise d'une sauvegarde). */
export function profilDepuisPercent(percent: number): ProfilEleve {
  const total = POSITIONNEMENT_QUESTIONS.length;
  const score = Math.round((Math.max(0, Math.min(100, percent)) * total) / 100);
  return profilDepuisScore(score);
}

/**
 * L'orientation vers une RUBRIQUE EXISTANTE (4 rubriques) : aucun nombre de
 * leçons/jour ni aucune durée n'est inventé ici.
 */
export const ORIENTATION: Record<
  ProfilEleve,
  Pick<ResultatPositionnement, 'rubrique' | 'outilAr' | 'raisonAr'>
> = {
  bases: {
    rubrique: 'cours',
    outilAr: 'الدروس والاختبارات القصيرة',
    raisonAr: 'ابدأ بالأسس من الدروس قبل التدريب المكثف.',
  },
  consolidation: {
    rubrique: 'entrainement',
    outilAr: 'بنك الأسئلة والتصحيح',
    raisonAr: 'أسسك موجودة : ثبّتها بالتدريب وتصحيح الأخطاء.',
  },
  approfondissement: {
    rubrique: 'revision',
    outilAr: 'أفكار البكالوريا والمراجعة',
    raisonAr: 'انتقل إلى مواضيع البكالوريا والتركيب.',
  },
};

/**
 * `reponses[i]` = index choisi, ou `null` si l'élève a passé. Le test est celui
 * du coach (18 items) : la note estimée est « تقدير أولي », jamais une note
 * réelle, et elle ne touche PAS au دفتر الأخطاء (c'est une MESURE).
 */
export function evaluerPositionnement(
  reponses: ReadonlyArray<number | null>,
  objectif: ObjectifNote = 14,
): ResultatPositionnement {
  const total = POSITIONNEMENT_QUESTIONS.length;
  const score = POSITIONNEMENT_QUESTIONS.reduce(
    (s, q, i) => s + (reponses[i] === q.correctIndex ? 1 : 0),
    0,
  );
  const percent = total > 0 ? Math.round((score * 100) / total) : 0;
  const profil = profilDepuisScore(score);

  const unitesRatees = [...new Set(
    POSITIONNEMENT_QUESTIONS.map((q, i) =>
      (reponses[i] === q.correctIndex ? null : UNITE_PAR_ID[q.id])),
  )]
    .filter((u): u is number => u !== null)
    .sort((a, b) => a - b);

  return {
    score,
    total,
    percent,
    noteEstimee: noteSur20(percent),
    profil,
    objectif,
    unitesRatees,
    ...ORIENTATION[profil],
  };
}
