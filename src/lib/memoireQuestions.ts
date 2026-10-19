// memoireQuestions.ts — LA MÉMOIRE PAR QUESTION (TC3/H1, audit
// « architecture d'apprentissage » 19/10/2026).
//
// Le constat mesuré (sonde 06 de l'audit) : après une séance complète de QCM,
// le stockage ne contenait que {date, score, total, unitTitle}. Quelles
// questions ont été ratées ? L'application l'ignorait — « إعادة المحاولة »
// rejouait les 50 questions dans le même ordre, et une question ratée à 10 h
// était perdue à vie. La boucle « erreur → reprise » n'existait pas.
//
// LA RÈGLE (dérivée SM-2, bornée comme le demande l'audit H3) :
//   · un ÉCHEC ouvre la boucle : la question est due demain (intervalDays = 1).
//     Test d'acceptation de l'audit : « après une séance à 10 erreurs, ≥ 80 %
//     reviennent sous 3 jours » — ici : 100 % reviennent sous 24 h ;
//   · une RÉUSSITE À L'ÉCHEANCE allonge l'intervalle (×3, plafonné à 21 j) —
//     1 j → 3 j → 9 j → 21 j, l'ordre de grandeur de SM-2 qualité 4 ;
//   · une RÉUSSITE HORS ÉCHEANCE n'allonge RIEN (ni ouverture ni recul) :
//     réussir tout de suite n'est pas une preuve de consolidation — la question
//     ratée reste due à sa date ;
//   · un SUCCÈS FRAIS sans jamais avoir échoué n'ouvre AUCUNE ordonnance : on
//     ne transforme pas 550 QCM en 550 rappels — seules les erreurs entrent
//     dans le calendrier (c'est exactement ce que l'audit reprochait à
//     l'ancienne boucle d'en manquer la moitié).
//
// PERSISTANCE : clé `kunz_qcm_memoire_v1` — préfixe `kunz_`, donc couverte par
// la sauvegarde (data/backup.ts) sans travail supplémentaire.
//
// Un seul assemblage, un seul écrit : ni `QuizView` ni un futur écran de
// révision ne réinventent la formule — ils lisent ici.

import { jourLocal } from '../utils/dayKey';

export const CLE_MEMOIRE_QUESTIONS = 'kunz_qcm_memoire_v1';

/** Plafond d'intervalle : au-delà, la question sort de la boucle active. */
export const INTERVALLE_MAX_JOURS = 21;

export interface MemoireQuestion {
  questionId: number;
  unitId: number;
  /** Échecs cumulés (toutes séances). */
  echecs: number;
  /** Réussites cumulées, échéances comprises. */
  reussites: number;
  /** Intervalle courant en jours (0 = jamais ordonnancée : succès frais). */
  intervalDays: number;
  /** Échéance (epoch ms). 0 = pas d'échéance (jamais échoué / sortie). */
  dueAt: number;
}

const JOUR_MS = 24 * 60 * 60 * 1000;

function charger(): Map<number, MemoireQuestion> {
  try {
    const raw = localStorage.getItem(CLE_MEMOIRE_QUESTIONS);
    if (!raw) return new Map();
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Map();
    const map = new Map<number, MemoireQuestion>();
    for (const entree of parsed as MemoireQuestion[]) {
      if (
        entree &&
        typeof entree.questionId === 'number' &&
        typeof entree.unitId === 'number'
      ) {
        map.set(entree.questionId, entree);
      }
    }
    return map;
  } catch {
    return new Map();
  }
}

function sauvegarder(memoire: Map<number, MemoireQuestion>): void {
  try {
    const tableau = [...memoire.values()].sort((a, b) => a.questionId - b.questionId);
    localStorage.setItem(CLE_MEMOIRE_QUESTIONS, JSON.stringify(tableau));
  } catch {
    /* quota dépassé — la mémoire du jour reste en mémoire de session */
  }
}

function jourEpoque(now: number): number {
  // Jour local standard du dépôt (utils/dayKey) — on ne compte pas les jours
  // en UTC quand l'élève vit à Alger.
  const cle = jourLocal(new Date(now));
  return Date.parse(`${cle}T00:00:00`);
}

/**
 * Enregistre UNE réponse et fait tourner la boucle. Pur côté logique : la
 * persistance est encapsulée ici, les consommateurs (QuizView, révision)
 * n'écrivent jamais la clé eux-mêmes.
 */
export function enregistrerReponseQcm(
  questionId: number,
  unitId: number,
  correct: boolean,
  now: number = Date.now(),
): MemoireQuestion {
  const memoire = charger();
  const existante = memoire.get(questionId) ?? {
    questionId,
    unitId,
    echecs: 0,
    reussites: 0,
    intervalDays: 0,
    dueAt: 0,
  };

  let etat: MemoireQuestion;
  if (!correct) {
    // Un échec rouvre TOUT (même une question qu'on croyait acquise) :
    // retour à 1 jour, sans punition supplémentaire.
    etat = {
      ...existante,
      echecs: existante.echecs + 1,
      intervalDays: 1,
      dueAt: jourEpoque(now) + 1 * JOUR_MS,
    };
  } else if (existante.dueAt > 0 && now >= existante.dueAt) {
    // Réussite À L'ÉCHEANCE — la seule qui prouve quelque chose : l'intervalle
    // grandit jusqu'au plafond. Au plafond, la question sort de la boucle
    // (dueAt = 0) : elle a été consolidée, on cesse de la compter.
    const prochainIntervalle = Math.min(existante.intervalDays * 3, INTERVALLE_MAX_JOURS);
    etat = {
      ...existante,
      reussites: existante.reussites + 1,
      intervalDays: prochainIntervalle,
      dueAt:
        prochainIntervalle >= INTERVALLE_MAX_JOURS
          ? 0
          : jourEpoque(now) + prochainIntervalle * JOUR_MS,
    };
  } else {
    // Réussite hors échéance (reprise immédiate « أعد أخطائي فقط », ou succès
    // frais) : on note le fait, on ne bouge AUCUNE échéance.
    etat = { ...existante, reussites: existante.reussites + 1 };
  }

  memoire.set(questionId, etat);
  sauvegarder(memoire);
  return etat;
}

/**
 * Les questions DUES (échéance atteinte), triées par échéance croissante.
 * Sans `unitId`, renvoie toutes les dues — avec, celles de l'unité.
 * C'est la porte d'entrée de la reprise : QuizView préfixe sa séance avec
 * cette liste, la révision pourra en faire autant.
 */
export function questionsDues(now: number = Date.now()): MemoireQuestion[] {
  return [...charger().values()]
    .filter((q) => q.dueAt > 0 && now >= q.dueAt)
    .sort((a, b) => a.dueAt - b.dueAt);
}

/** Bilan honnête pour un écran : combien de boucles ouvertes, dont combien dues. */
export function bilanMemoire(now: number = Date.now()): {
  ouvertes: number;
  dues: number;
} {
  const toutes = [...charger().values()].filter((q) => q.dueAt > 0);
  return { ouvertes: toutes.length, dues: toutes.filter((q) => now >= q.dueAt).length };
}

/**
 * Ordre d'ouverture d'une séance de QCM : les questions DUES de la mémoire
 * passent EN PREMIER (reprise immédiate — l'échéance est atteinte), le reste
 * suit dans son ordre d'origine. Sans dues, la liste est rendue TELLE QUELLE :
 * aucun réordonnement cosmétique — et `melangerQuestions` (appellé ensuite)
 * ne touche jamais à l'ordre des questions, seulement aux propositions.
 *
 * Générique pour être testée sans renderer (l'audit 19/10 exigeait que les
 * ratées « reviennent » — voici comment, sans dupliquer la formule ailleurs).
 */
export function ordonnerParDues<T extends { id: number }>(
  liste: readonly T[],
  maintenant: number = Date.now(),
): T[] {
  const duesIds = new Set(questionsDues(maintenant).map((q) => q.questionId));
  const enTete = liste.filter((q) => duesIds.has(q.id));
  if (enTete.length === 0) return [...liste];
  return [...enTete, ...liste.filter((q) => !duesIds.has(q.id))];
}

/** Isolement des suites de tests (et seul effacement légitime en production : aucune). */
export function reinitialiserMemoireQuestions(): void {
  try {
    localStorage.removeItem(CLE_MEMOIRE_QUESTIONS);
  } catch {
    /* ignore */
  }
}
