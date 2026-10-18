/*
 * M16 volet 2 (audit externe v2, 2026-10-18) — éclat du corpus par domaine.
 * Les 550 QCM vivent désormais dans 6 segments de domaines purs,
 * déplacés LITTÉRALEMENT depuis l)ancien quizCorpus.ts (octet pour octet,
 * ordre global = concaténation des segments, vérifié par le script de split).
 * Ce module reste la source unique : consommateurs (src/data/index.ts,
 * tests) voient exactement la même API.
 *
 * Gain : le chunk monolithique « svt-corpus » (702,5 Ko au build précédent)
 * devient un noyau (dérivation + hosila) + segments de QCM cache-stables :
 * corriger une leçon d)un domaine n)invalide plus les octets des autres.
 */
import type { QuizQuestion, Flashcard } from '../types';
import { QUESTIONS_D1A } from './qcm0-d1a';
import { QUESTIONS_D2A } from './qcm1-d2a';
import { QUESTIONS_D3 } from './qcm2-d3';
import { QUESTIONS_D1B } from './qcm3-d1b';
import { QUESTIONS_D2B } from './qcm4-d2b';
import { QUESTIONS_D1C } from './qcm5-d1c';

export const SVT_QUIZ_QUESTIONS: QuizQuestion[] = [
  ...QUESTIONS_D1A,
  ...QUESTIONS_D2A,
  ...QUESTIONS_D3,
  ...QUESTIONS_D1B,
  ...QUESTIONS_D2B,
  ...QUESTIONS_D1C,
];


export const SVT_FLASHCARDS: Flashcard[] = SVT_QUIZ_QUESTIONS.map((question) => ({
  id: `fc_q_${question.id}`,
  unitId: question.unitId,
  question: question.questionText,
  // B6 (2026-10-17) : les champs `options`/`correctOptionIndex` du QCM source
  // ne sont PLUS recopiés — une carte est un couple question → réponse.
  // (Avant : donnée morte transportée sur les 550 cartes, et sémantiquement
  // trompeuse — des QCM habillés plutôt que des cartes de rappel actif.)
  answerBullets: [
    `**الإجابة الصحيحة:** ${question.options[question.correctAnswerIndex]}`,
    question.explanation
  ].filter(Boolean),
  ...(question.diagramUrl ? { diagramUrl: question.diagramUrl } : {})
}));
