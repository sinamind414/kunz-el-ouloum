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

// T3a (audit v2 18/10/2026, H2d) — QCM servis HORS périmètre déclaré par l'app
// elle-même. Les textes restent dans les segments (aucune destruction de donnée,
// décision réversible) ; ils ne sont plus servis ni dérivés en flashcards.
//
//   · ids 12, 14, 18, 30, 31, 32 — U1 : maturation de l'ARNm (introns/exons),
//     exclue par NON_EXIGIBLES du programme de l'app ; le verrou
//     quizCorpusRedaction.lock continue de vérifier les segments complets.
//   · ids 320, 323, 324, 337–346 — U8 : concepts de niveau ÉCOLOGIQUE
//     (producteurs, consommateurs, décomposeurs, chaîne alimentaire, pyramide
//     d'énergie, rendement écologique, biomasse, cycle de la matière, O2
//     atmosphérique, intégration biosphérique), contraire à la règle
//     CULTURE_GENERALE de l'app (U8 = niveau cellulaire uniquement).
//     Critère appliqué : le CONCEPT testé par le terme interrogé, pas la
//     présence de mots-clés écologiques dans de simples distracteurs — d'où 13
//     items et non les 17 comptés par l'audit (méthode conservatrice, liste
//     close et commentée id par id).
export const QCM_HORS_PERIMETRE: ReadonlySet<number> = new Set([
  // ARNm mature (U1) — hors périmètre NON_EXIGIBLES
  12, 14, 18, 30, 31, 32,
  // U8 écologique : 320 intégration biosphérique · 323 matière organique/trophique ·
  // 324 O2 atmosphérique · 337 flux d'énergie trophique · 338 producteurs ·
  // 339 consommateurs · 340 décomposeurs · 341 perte thermique inter-niveaux ·
  // 342 rendement écologique · 343 pyramide d'énergie · 344 cycle de la matière ·
  // 345 chaîne alimentaire · 346 biomasse
  320, 323, 324, 337, 338, 339, 340, 341, 342, 343, 344, 345, 346,
]);

export const SVT_QUIZ_QUESTIONS: QuizQuestion[] = [
  ...QUESTIONS_D1A,
  ...QUESTIONS_D2A,
  ...QUESTIONS_D3,
  ...QUESTIONS_D1B,
  ...QUESTIONS_D2B,
  ...QUESTIONS_D1C,
].filter((q) => !QCM_HORS_PERIMETRE.has(q.id));


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
