// src/lib/quizAdaptatif.ts — R9 de l'audit du 7/11/2026 : difficulté ajustée
// EN TEMPS RÉEL à partir des 3 paliers déjà présents (`LIBELLES_DIFFICULTE`).
//
// ⚠️ ZÉRO CONTENU INVENTÉ : ce module ne crée AUCUNE question. Il ne fait que
// choisir, dans le corpus servi (`SVT_QUIZ_QUESTIONS`, 531 QCM), une question
// déjà écrite et déjà étiquetée par son segment d'origine (d1*=1, d2*=2, d3=3).
//
// [CONSTAT] Mesuré : le palier est ENTIÈREMENT corrélé à l'unité
// (U1–5 → 1, U6–8 → 2, U9–11 → 3). Un quiz d'unité ne contient donc jamais
// 3 niveaux : piloter les 3 paliers exige un pool INTER-UNITÉS.
//
// [INTERPRÉTATION] La règle ci-dessous est une RÈGLE DE PRÉSENTATION
// pédagogique, pas un barème officiel ni une mesure psychométrique :
// « Non vérifiable ». Aucun score normé, aucune durée, aucune mise en
// comparaison entre élèves n'est fabriquée ici.

import type { QuizQuestion } from '../types';

export type PalierAdaptatif = 1 | 2 | 3;

export const PALIER_MIN: PalierAdaptatif = 1;
export const PALIER_MAX: PalierAdaptatif = 3;
export const PALIERS: readonly PalierAdaptatif[] = [1, 2, 3];

/** [INTERPRÉTATION] 2 réussites consécutives font monter d'un palier. */
export const REUSSITES_POUR_MONTER = 2;
/** [INTERPRÉTATION] Longueur d'une séance adaptative, choix de présentation. */
export const NB_QUESTIONS_SEANCE = 10;

export const REGLE_ADAPTATIVE_AR =
  '[INTERPRÉTATION] ترتفع الصعوبة بعد إجابتين صحيحتين متتاليتين وتنخفض بعد إجابة خاطئة. ' +
  'هذه قاعدة عرض اجتهادية، ليست معياراً رسمياً ولا تقديراً لمستواك — « Non vérifiable ». ' +
  'الأسئلة مأخوذة كما هي من بنك الأسئلة، دون أي إضافة.';

/**
 * Ajuste le palier à partir de l'historique des réponses (la plus ancienne en
 * premier). Borné à [1, 3] : aucun palier 0 ou 4 ne peut apparaître.
 */
export function prochainPalier(
  palier: PalierAdaptatif,
  historique: readonly boolean[],
): PalierAdaptatif {
  const dernier = historique[historique.length - 1];
  if (dernier === false) return Math.max(PALIER_MIN, palier - 1) as PalierAdaptatif;
  if (dernier !== true) return palier;
  const fenetre = historique.slice(-REUSSITES_POUR_MONTER);
  if (fenetre.length === REUSSITES_POUR_MONTER && fenetre.every(Boolean)) {
    return Math.min(PALIER_MAX, palier + 1) as PalierAdaptatif;
  }
  return palier;
}

export interface ChoixAdaptatif {
  question: QuizQuestion;
  /** Palier RÉELLEMENT servi (peut différer de la cible en cas de repli). */
  palier: PalierAdaptatif;
}

/**
 * Choisit la 1ʳᵉ question NON ENCORE SERVIE du palier cible, dans l'ordre du
 * corpus (déterministe). Repli HONNÊTE : paliers voisins les plus proches,
 * puis n'importe quel palier. `null` si le corpus est épuisé — jamais de
 * question fabriquée ni de doublon.
 */
export function choisirQuestion(
  pool: readonly QuizQuestion[],
  palierCible: PalierAdaptatif,
  utilises: ReadonlySet<number>,
): ChoixAdaptatif | null {
  const ordre = [...PALIERS].sort(
    (a, b) => Math.abs(a - palierCible) - Math.abs(b - palierCible) || a - b,
  );
  for (const palier of ordre) {
    const question = pool.find(
      (q) => q.difficulte === palier && !utilises.has(q.id),
    );
    if (question) return { question, palier };
  }
  return null;
}

/** Palier de départ : celui de la 1ʳᵉ question du quiz d'unité, sinon 1. */
export function palierInitial(questions: readonly QuizQuestion[]): PalierAdaptatif {
  const d = questions.find((q) => q.difficulte !== undefined)?.difficulte;
  return d === 2 || d === 3 ? d : PALIER_MIN;
}
