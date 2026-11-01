// corpusLoader.ts — chargement différé du corpus QCM et des flashcards
// (sprint 31).
//
// Pourquoi
// --------
// Après le sprint 30, le bundle d'entrée pesait encore 1 456 Ko, dont une
// bonne part venait d'un seul fichier : `src/quizCorpus.ts` (596 Ko de
// source — 549 QCM avec leurs explications complètes, plus les flashcards
// dérivées). `App.tsx` l'importait statiquement pour initialiser un état, si
// bien que TOUT élève téléchargeait les 549 questions avant de voir son
// tableau de bord, y compris celui qui venait lire une leçon.
//
// Ce module isole cet accès derrière un import dynamique, avec un cache de
// module : le corpus n'est téléchargé qu'une fois, à la première demande
// réelle (ouverture d'un quiz, de la révision, ou préchargement au repos).
//
// Aucune donnée n'est dupliquée ni transformée ici : `src/data/index.ts`
// reste la source, ce fichier ne fait que retarder son chargement.

import type { Flashcard, QuizQuestion } from '../types';

export interface Corpus {
  questions: QuizQuestion[];
  flashcards: Flashcard[];
}

let cache: Corpus | null = null;
let enCours: Promise<Corpus> | null = null;

/**
 * Charge le corpus (une seule fois). Les appels concurrents partagent la même
 * promesse : deux composants qui le demandent en même temps ne déclenchent pas
 * deux téléchargements.
 */
export async function loadCorpus(): Promise<Corpus> {
  if (cache) return cache;
  if (!enCours) {
    enCours = import('./index').then((m) => {
      cache = { questions: m.SVT_QUIZ_QUESTIONS, flashcards: m.SVT_FLASHCARDS };
      enCours = null;
      return cache;
    });
  }
  return enCours;
}

/** Corpus déjà chargé, ou `null` — pour un rendu synchrone sans attendre. */
export function peekCorpus(): Corpus | null {
  return cache;
}

/**
 * Précharge le corpus quand le navigateur est inoccupé : l'élève qui ouvrira
 * un quiz dans trente secondes ne doit pas attendre le téléchargement, mais
 * celui qui consulte une leçon ne doit pas le payer au démarrage.
 */
export function prefetchCorpusWhenIdle(): void {
  const lancer = () => {
    void loadCorpus().catch(() => {
      /* hors ligne : le corpus sera retenté à la première demande réelle */
    });
  };
  const ric = (globalThis as { requestIdleCallback?: (cb: () => void) => void })
    .requestIdleCallback;
  if (typeof ric === 'function') ric(lancer);
  else setTimeout(lancer, 2000);
}

/** Réservé aux tests : vide le cache de module. */
export function __resetCorpusCache(): void {
  cache = null;
  enCours = null;
}
