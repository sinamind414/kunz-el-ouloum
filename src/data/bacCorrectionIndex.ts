// bacCorrectionIndex.ts — COUVERTURE RÉELLE DES CORRIGÉS BAC (source unique).
//
// Pourquoi ce fichier existe
// --------------------------
// L'application indexe 65 idées d'exercices sur 11 sessions (2016→2026) et
// possède un dictionnaire de 80 attendus officiels (bac2023→2025), mais aucun
// écran ne disait à l'élève CE QUI EST RÉELLEMENT CORRIGÉ dans l'app et ce qui
// ne l'est pas. Résultat : « ثلاثة اختبارات كاملة » et « sujets Bac corrigés »
// laissaient croire à 11 corrigés intégrés alors qu'un seul sujet intégral
// (2025) est servi et que 12 questions de barème seulement sont exploitables.
//
// RÈGLE D'OR (AGENTS.md §1.5) : AUCUN contenu inventé. Ce module ne crée aucun
// énoncé, aucun attendu, aucun point. Il CROISE trois sources déjà présentes :
//   · bacSessionIndex.ts        → idées, sources officielles, lacunes, barème ;
//   · baremeCorrecteur.ts       → 12 questions / 80 items officiels (2023-2025) ;
//   · Bac2025ExamView.tsx       → l'unique sujet intégral servi (2025).
// Tout ce qui n'est pas prouvé ici est déclaré « non intégré », jamais simulé.
//
// Verrou : src/data/bacCorrectionIndex.lock.test.ts.

import {
  BAC_IDEAS,
  BAC_SESSION_SOURCES,
  INCOMPLETE_SUJETS,
  YEARS_COVERED,
  pointsOfSujet,
  sourcesForYear,
  type BacSujet,
} from './bacSessionIndex';
import {
  listBaremeQuestions,
  type BaremeQuestion,
} from './dictionaries/baremeCorrecteur';

/** Ce que l'application sait réellement corriger pour une session. */
export type NiveauCorrectionBac = 'bareme-officiel' | 'idees-seules';

export interface LacuneBac {
  sujet: BacSujet;
  raison: string;
}

export interface CouvertureBacSession {
  year: number;
  /** Idées d'exercices réellement dépouillées (jamais un énoncé). */
  nbIdees: number;
  pointsSujet1: number;
  pointsSujet2: number;
  /** Liens vers la source officielle (sujet + corrigé), jamais vers un miroir inventé. */
  sujetUrl: string;
  correctionUrl: string;
  /** Questions du barème officiel intégrées et évaluables dans le code. */
  nbQuestionsBareme: number;
  nbItemsBareme: number;
  niveau: NiveauCorrectionBac;
  /** Unique sujet intégral servi par l'application (Bac2025ExamView). */
  sujetIntegral: boolean;
  lacunes: LacuneBac[];
}

/** Libellés فصحى partagés par l'UI (une seule source de vérité). */
export const LIBELLE_NIVEAU_BAC: Record<NiveauCorrectionBac, { ar: string; fr: string }> = {
  'bareme-officiel': {
    ar: 'مقياس رسمي مُدمج — تصحيح تشخيصي بنداً ببند',
    fr: 'Barème officiel intégré — correction diagnostique item par item',
  },
  'idees-seules': {
    ar: 'أفكار التمارين فقط — التصحيح الرسمي عبر الرابط الخارجي',
    fr: 'Idées d’exercices seulement — corrigé officiel via le lien externe',
  },
};

/**
 * Avertissement affiché partout où l'on parle de « sujet Bac » : l'application
 * ne reproduit PAS les textes/documents ONEC. Le dire évite qu'un élève croie
 * passer l'épreuve sur un énoncé complet alors qu'il tient un résumé d'idée.
 */
export const AVERTISSEMENT_ENONCES_BAC = {
  ar: 'تنبيه: نصوص المواضيع ووثائقها الرسمية (ONEC) غير مضمّنة داخل التطبيق. تُعرض فكرة كل تمرين وسنداته وتعليماته، مع رابط الموضوع الأصلي والإجابة النموذجية لكل دورة.',
  fr: 'Avertissement : les textes et documents officiels (ONEC) ne sont pas reproduits dans l’application. Seuls l’idée de chaque exercice, ses supports et ses consignes sont affichés, avec le lien vers le sujet original et le corrigé officiel.',
} as const;

/** Nature de la note : le correcteur aide, il ne remplace pas le jury. */
export const AVERTISSEMENT_NOTE_BAC = {
  ar: 'التنقيط المعروض تشخيصي وتقديري، وليس درجة بكالوريا رسمية. البنود اليدوية تُترك للمصحح، والقرار النهائي للمصحح.',
  fr: 'La note affichée est diagnostique et indicative, pas une note officielle du Bac. Les items manuels restent à l’appréciation du correcteur ; la décision finale appartient au correcteur.',
} as const;

/**
 * Rattrapage : POSITION EXPLICITE, pas un silence.
 * Les 11 sources indexées sont des sessions principales. Aucune session
 * « استدراك / rattrapage » n'est référencée dans le dépôt ; l'existence
 * d'annales de rattrapage officielles n'a pas pu être vérifiée ici.
 */
export const RATTRAPAGE_BAC = {
  statut: 'non-indexe' as const,
  ar: 'دورات الاستدراك: غير مُفهرسة في المصادر المتاحة — Non vérifiable. لم نضف أي موضوع من عندنا.',
  fr: 'Sessions de rattrapage : non indexées dans les sources disponibles — Non vérifiable. Aucun sujet n’a été inventé.',
} as const;

const QUESTIONS_BAREME = listBaremeQuestions();

/** Questions officielles évaluables pour une année ([] = aucun barème intégré). */
export function questionsBaremePourAnnee(year: number): BaremeQuestion[] {
  return QUESTIONS_BAREME.filter((q) => q.annee === year);
}

/** Couverture d'une session, ou null si l'année n'est pas indexée. */
export function couvertureBacSession(year: number): CouvertureBacSession | null {
  if (!YEARS_COVERED.includes(year)) return null;
  const source = sourcesForYear(year);
  if (!source) return null;
  const questions = questionsBaremePourAnnee(year);
  const nbItemsBareme = questions.reduce((s, q) => s + q.items.length, 0);
  return {
    year,
    nbIdees: BAC_IDEAS.filter((i) => i.year === year).length,
    pointsSujet1: pointsOfSujet(year, 1),
    pointsSujet2: pointsOfSujet(year, 2),
    sujetUrl: source.url,
    correctionUrl: source.correctionUrl,
    nbQuestionsBareme: questions.length,
    nbItemsBareme,
    niveau: questions.length > 0 ? 'bareme-officiel' : 'idees-seules',
    // Fait vérifiable : le seul écran d'épreuve intégrale est Bac2025ExamView.
    sujetIntegral: year === 2025,
    lacunes: INCOMPLETE_SUJETS.filter((l) => l.year === year).map((l) => ({
      sujet: l.sujet,
      raison: l.raison,
    })),
  };
}

/** Toutes les sessions, dans l'ordre d'affichage de la banque (récent → ancien). */
export const COUVERTURE_BAC: CouvertureBacSession[] = YEARS_COVERED.map(
  (year) => couvertureBacSession(year),
).filter((c): c is CouvertureBacSession => c !== null);

/** Chiffres de synthèse, dérivés des exports (aucune constante recopiée à la main). */
export const STATS_COUVERTURE_BAC = {
  annees: COUVERTURE_BAC.length,
  premiereAnnee: Math.min(...YEARS_COVERED),
  derniereAnnee: Math.max(...YEARS_COVERED),
  anneesAvecBareme: COUVERTURE_BAC.filter((c) => c.nbQuestionsBareme > 0).map((c) => c.year),
  anneesSansBareme: COUVERTURE_BAC.filter((c) => c.nbQuestionsBareme === 0).map((c) => c.year),
  nbQuestionsBareme: QUESTIONS_BAREME.length,
  nbItemsBareme: QUESTIONS_BAREME.reduce((s, q) => s + q.items.length, 0),
  nbIdees: BAC_IDEAS.length,
  nbSujetsIntegraux: COUVERTURE_BAC.filter((c) => c.sujetIntegral).length,
  nbLacunes: INCOMPLETE_SUJETS.length,
  nbSources: BAC_SESSION_SOURCES.length,
} as const;
