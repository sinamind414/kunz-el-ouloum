// fillBlanksLoader.ts — charger les questions « à trous » SANS les embarquer (M7).
//
// Pourquoi ce module existe
// ------------------------
// `src/data/fillBlanks.ts` pèse ~50 Ko dans le bundle d'entrée (mesuré sur la
// sourcemap : 50 Ko sur 938, cf. docs/AUDIT_EXTERNE_8_AXES_2026-10-14.md §10.3.1)
// et ne sert qu'à UN endroit : l'ouverture d'un quiz (`App.tsx`). Un élève qui
// ouvre l'application pour lire une leçon téléchargeait donc, avant même de voir
// l'écran d'accueil, la totalité des 161 questions à trous.
//
// Ce module applique le motif déjà en place pour le corpus QCM
// (`src/data/corpusLoader.ts`) : un import DYNAMIQUE, un cache de module, et un
// préchargement pendant un temps mort du navigateur — pour que le clic sur
// « quiz » ne paie pas le téléchargement, sans que le démarrage le paie non plus.
//
// Règle de sûreté : le quiz s'ouvre TOUJOURS. Si le morceau n'est pas joignable
// (hors ligne, cache vidé), on ouvre le quiz avec le seul corpus QCM plutôt que
// de laisser l'élève devant un bouton sans effet.

import type { QuizQuestion } from '../types';

/** Forme des questions à trous, SANS importer le module (type seulement). */
export type QuestionATrous = (typeof import('./fillBlanks'))['FILL_BLANK_QUESTIONS'][number];

let cache: QuestionATrous[] | null = null;
let enCours: Promise<QuestionATrous[]> | null = null;

/** Charge les questions à trous (une seule fois : le résultat est mémorisé). */
export function chargerFillBlanks(): Promise<QuestionATrous[]> {
  if (cache) return Promise.resolve(cache);
  if (!enCours) {
    enCours = import('./fillBlanks')
      .then((m) => {
        cache = m.FILL_BLANK_QUESTIONS;
        return cache;
      })
      .catch((e) => {
        // On ne mémorise pas l'échec : hors ligne, une nouvelle tentative est
        // légitime dès que le réseau revient.
        enCours = null;
        throw e;
      });
  }
  return enCours;
}

/** Déjà chargées ? (permet un chemin synchrone au clic quand c'est prêt.) */
export function peekFillBlanks(): QuestionATrous[] | null {
  return cache;
}

/**
 * Précharge pendant un temps mort — même stratégie que `prefetchCorpusWhenIdle`.
 * L'élève qui ouvrira un quiz dans trente secondes ne doit pas attendre ; celui
 * qui lit une leçon ne doit pas payer le téléchargement au démarrage.
 */
export function prefetchFillBlanksWhenIdle(): void {
  const lancer = () => {
    void chargerFillBlanks().catch(() => {
      /* hors ligne : le chargement sera retenté à la première demande réelle */
    });
  };
  const ric = (globalThis as { requestIdleCallback?: (cb: () => void) => void }).requestIdleCallback;
  if (typeof ric === 'function') ric(lancer);
  else setTimeout(lancer, 2000);
}

/**
 * Convertit les questions à trous d'une unité en questions de quiz.
 * Les identifiants sont décalés (9 000 000 + rang) pour ne jamais entrer en
 * collision avec les identifiants du corpus QCM — convention conservée telle
 * quelle depuis `App.tsx`.
 */
export function versQuizQuestions(questions: QuestionATrous[], unitId: number): QuizQuestion[] {
  return questions
    .filter((q) => q.unitId === unitId)
    .map((q, i) => ({
      id: 9_000_000 + i,
      unitId: q.unitId,
      questionText: q.microTest.prompt,
      options: [],
      correctAnswerIndex: -1,
      explanation: q.microTest.errorHint,
      kind: 'fillBlank' as const,
      acceptedAnswers: q.microTest.acceptedAnswers,
    }));
}

/** Réservé aux tests : vide le cache de module. */
export function __resetFillBlanksCache(): void {
  cache = null;
  enCours = null;
}
