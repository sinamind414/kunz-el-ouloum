/*
 * positionnementBanque.ts — TRANCHE P0-3 (audit 8 axes 20/10, demandé par 8/9
 * audits élèves) : banque du TEST DE POSITIONNEMENT « اختبار تحديد المستوى ».
 *
 * SOURCE UNIQUE — ZÉRO CONTENU INVENTÉ (règle AGENTS.md) : les questions sont
 * PIOCHÉES dans le corpus existant (src/quizCorpus, 531
 * QCM vérifiés par les verrous de rédaction). Aucun énoncé, aucune option,
 * aucune explication n'est écrite ici — ce module ne fait que SÉLECTIONNER.
 *
 * SÉLECTION DÉTERMINISTE ET AUDITABLE :
 *   · 2 questions par unité à poids BAC mesuré (U1-U7, champ
 *     bacWeightPercent de src/data/unitOpenings.ts) ;
 *   · 1 question par unité sans mesure assumée (U8-U11, même politique que
 *     UNIT_BAC_WEIGHT du moteur — ne pas inventer un poids) ;
 *   · au total 18 questions — dans la cible 15-22 du plan P0-3 ;
 *   · dans chaque unité, les indices sont ESPACÉS RÉGULIÈREMENT sur la liste
 *     triée par id (répartition équilibrée : deux unités voisines ne testent
 *     pas à deux reprises le même segment) ;
 *   · l'ordre final suit l'ordre du programme (U1 → U11).
 *
 * ADAPTATION DE FORME : le corpus (ids numériques, correctAnswerIndex) est
 * projeté dans la forme consommée par le moteur (smartBotData.QuizQuestion :
 * id string, correctIndex) — conversion bijective, aucun texte modifié.
 */
import { SVT_QUIZ_QUESTIONS, QCM_HORS_PERIMETRE } from '../quizCorpus';
import type { QuizQuestion as QuizQuestionCorpus } from '../types';
import type { QuizQuestion as QuizQuestionMoteur } from './smartBotData';

/** Quota d'items par unité — politique documentée ci-dessus (capture figée). */
export const QUOTAS_UNITE: Readonly<Record<number, number>> = {
  1: 2, 2: 2, 3: 2, 4: 2, 5: 2, 6: 2, 7: 2, // poids BAC mesuré (unitOpenings)
  8: 1, 9: 1, 10: 1, 11: 1, // sans mesure — part égale, pas d'invention
};

export const TAILLE_TEST_POSITIONNEMENT = 18;

const domaineDeUnite = (unitId: number): number => (unitId <= 5 ? 1 : unitId <= 8 ? 2 : 3);

/** Projection bijective corpus → forme moteur (aucun texte transformé). */
function versQuestionMoteur(q: QuizQuestionCorpus): QuizQuestionMoteur {
  return {
    id: `pos_${q.id}`,
    domainId: domaineDeUnite(q.unitId),
    topicId: `unit_${q.unitId}`,
    question: q.questionText,
    options: q.options,
    correctIndex: q.correctAnswerIndex,
    explanation: q.explanation,
  };
}

/** Indices régulièrement espacés sur la liste triée par id (pure, stable). */
function piocheRepartie(liste: QuizQuestionCorpus[], quota: number): QuizQuestionCorpus[] {
  const triee = [...liste].sort((a, b) => a.id - b.id);
  if (triee.length === 0) return [];
  const sortie: QuizQuestionCorpus[] = [];
  for (let k = 0; k < quota; k++) {
    const idx = Math.round((k * (triee.length - 1)) / Math.max(1, quota - 1));
    const item = triee[idx];
    if (!sortie.some((s) => s.id === item.id)) sortie.push(item);
  }
  return sortie;
}

export function construireBanquePositionnement(): QuizQuestionMoteur[] {
  const unites = [...new Set(SVT_QUIZ_QUESTIONS.map((q) => q.unitId))].sort((a, b) => a - b);
  const banque: QuizQuestionMoteur[] = [];
  for (const unite of unites) {
    const quota = QUOTAS_UNITE[unite] ?? 1;
    const pool = SVT_QUIZ_QUESTIONS.filter((q) => q.unitId === unite && !QCM_HORS_PERIMETRE.has(q.id));
    for (const q of piocheRepartie(pool, quota)) banque.push(versQuestionMoteur(q));
  }
  return banque;
}

/** La banque servie par le test — déterministe, verrouillée par test. */
export const POSITIONNEMENT_QUESTIONS: QuizQuestionMoteur[] = construireBanquePositionnement();

/** id (forme moteur) → unité du programme — pour la synthèse par unité. */
export const UNITE_PAR_ID: Readonly<Record<string, number>> = Object.fromEntries(
  POSITIONNEMENT_QUESTIONS.map((q) => [q.id, Number(q.topicId.replace('unit_', ''))]),
);
