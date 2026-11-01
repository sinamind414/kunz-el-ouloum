// activiteQuotidienne.ts — une seule porte d'entrée pour créditer l'activité du
// jour (H3, audit 8 axes 2026-10-14).
//
// POURQUOI CE MODULE. Quatre fonctions d'`App.tsx` touchaient l'objectif
// quotidien (`addStudyMinutes`, `handleRateCard`, `handleQuizComplete`,
// `handleTutorXPGained`), chacune avec sa propre recopie de la même logique :
// remise à zéro si la date a changé, cumul minutes/questions, calcul de
// `completedToday`, et — pour toutes — l'absence d'écriture de la série.
// Résultat : quatre chemins à corriger pour un seul bug, et quatre occasions
// d'en réintroduire un.
//
// Ici, la logique vit UNE fois, en fonctions PURES (aucun accès à React ni au
// stockage), donc testable : voir `src/utils/__tests__/activiteQuotidienne.test.ts`.
//
// Ce module ne fabrique aucune donnée : il agrège les minutes et les questions
// réellement rapportées par l'interface, et n'attribue la série qu'aux jours où
// une activité a effectivement eu lieu.

import type { DailyGoalConfig, UserProgress } from '../types';
import { jourLocal } from './dayKey';
import { cumulJours, enregistrerJourActif, etatSerie, serieAffichee, type ProgressionJour } from './serie';
import { marquerSuivie } from '../lib/prescriptions';

export const OBJECTIF_QUOTIDIEN_DEFAUT: DailyGoalConfig = {
  type: 'minutes',
  targetMinutes: 25,
  targetQuestions: 20,
  // '' = aucun compteur en cours. La première activité du jour fixe la date ;
  // surtout, ce champ ne sert JAMAIS de référence de série (voir `serieDernierJour`).
  lastActiveDate: '',
  todayMinutes: 0,
  todayQuestions: 0,
  streakDays: 0,
  completedToday: false,
};

export interface DeltaActivite {
  /** Minutes d'étude à créditer (0 si l'interface ne les mesure pas). */
  minutes?: number;
  /** Questions / exercices terminés à créditer. */
  questions?: number;
}

export interface ResultatActiviteQuotidienne {
  progress: UserProgress;
  /** Vrai si les COMPTEURS du jour ont été remis à zéro (le jour a changé). */
  compteursReinitialises: boolean;
  /** Vrai si c'est la PREMIÈRE activité de ce jour (périmètre de la série). */
  premiereActiviteDuJour: boolean;
  /** Vrai si au moins un jour a été manqué : la série est repartie à 1. */
  serieRompue: boolean;
  /** Palier de série atteint (7 / 30) — l'appelant décide de la célébration. */
  palier: number | null;
}

/**
 * Estimation de durée déjà utilisée par le quiz (1,5 min par question, plancher
 * 3 min). Extraite ici pour que le tuteur applique EXACTEMENT la même
 * convention au lieu d'en inventer une seconde.
 */
export function estimationMinutesQuiz(total: number): number {
  return Math.max(3, Math.round(total * 1.5));
}

/** Le jour enregistré diffère-t-il de celui de `now` ? (pur, sans effet) */
export function jourChange(daily: DailyGoalConfig | undefined, now: Date = new Date()): boolean {
  return (daily?.lastActiveDate ?? '') !== jourLocal(now);
}

/**
 * Applique une activité à la progression : objectif du jour, historique borné à
 * 30 jours, et série de jours d'étude (`dailyGoals.streakDays` ET
 * `progress.streak`, qui doivent rester le même chiffre — ils sont affichés par
 * des écrans différents).
 */
export function appliquerActiviteQuotidienne(
  progress: UserProgress,
  delta: DeltaActivite,
  now: Date = new Date(),
): ResultatActiviteQuotidienne {
  const aujourdhui = jourLocal(now);
  const minute = { ...OBJECTIF_QUOTIDIEN_DEFAUT, ...(progress.dailyGoals ?? {}) };

  // 1. Changement de jour : on remet à zéro AVANT de cumuler.
  const nouveauJour = minute.lastActiveDate !== aujourdhui;
  const base: DailyGoalConfig = nouveauJour
    ? { ...minute, lastActiveDate: aujourdhui, todayMinutes: 0, todayQuestions: 0, completedToday: false }
    : minute;

  // 2. Cumul des données réellement rapportées.
  const todayMinutes = (base.todayMinutes || 0) + Math.max(0, delta.minutes ?? 0);
  const todayQuestions = (base.todayQuestions || 0) + Math.max(0, delta.questions ?? 0);
  const completedToday =
    base.type === 'minutes'
      ? todayMinutes >= base.targetMinutes
      : todayQuestions >= base.targetQuestions;

  // 3. Série : comptée une seule fois par jour, à partir du DERNIER JOUR
  //    D'ACTIVITÉ — jamais de `lastActiveDate` (remis à aujourd'hui dès
  //    l'ouverture de l'app, sans travail : l'utiliser gèlerait la série d'un
  //    élève qui ouvre l'application sans étudier).
  const progression: ProgressionJour = enregistrerJourActif(
    etatSerie(minute.serieDernierJour, minute.streakDays, minute.joursActifsTotal),
    aujourdhui,
  );

  // 4. Historique : une seule entrée par jour (on remplace celle du jour), bornée
  //    à 30 jours — sans quoi un historique rejoué à chaque quiz gonflerait le
  //    stockage local d'un téléphone d'entrée de gamme.
  const historique = (minute.history ?? []).filter((h) => h.date !== aujourdhui);
  const history = [
    ...historique.slice(-29),
    {
      date: aujourdhui,
      target: base.type === 'minutes' ? base.targetMinutes : base.targetQuestions,
      achieved: base.type === 'minutes' ? todayMinutes : todayQuestions,
      type: base.type,
      completed: completedToday,
    },
  ];

  // 5. LA BOUCLE DU COACH — et c'est ICI, pas dans un écran.
  //
  // `appliquerActiviteQuotidienne` est le SEUL endroit de l'application qui
  // atteste d'un travail réel : le compteur de minutes ou de questions monte,
  // c'est-à-dire que l'élève a produit quelque chose de mesurable. Un clic sur
  // « agir » ou un changement d'onglet ne prouvent rien ; ceci, si.
  //
  // On a donc la seule définition honnête de « prescription suivie » : le
  // capitaine a demandé quelque chose, et du travail a effectivement eu lieu
  // avant l'expiration. À défaut de savoir si l'élève a fait *exactement* ce qui
  // était demandé, on sait qu'il a fait quelque chose — et c'est la différence
  // entre un coach qui parle et un coach qui suit.
  //
  // Placé APRÈS le cumul (donc jamais sur un delta nul) : appeler la fonction
  // sans travail réel ne doit pas créditer une prescription.
  if ((delta.minutes ?? 0) > 0 || (delta.questions ?? 0) > 0) {
    marquerSuivie(now.getTime());
  }

  return {
    progress: {
      ...progress,
      streak: progression.etat.jours,
      dailyGoals: {
        ...base,
        todayMinutes,
        todayQuestions,
        completedToday,
        history,
        streakDays: progression.etat.jours,
        serieDernierJour: progression.etat.dernierJour ?? aujourdhui,
        // Le cumul suit la même règle que la série (une seule fois par jour),
        // mais il ne redescend jamais.
        joursActifsTotal: progression.etat.joursTotal,
      },
    },
    compteursReinitialises: nouveauJour,
    premiereActiviteDuJour: progression.nouveauJour,
    serieRompue: progression.serieRompue,
    palier: progression.palier,
  };
}

/**
 * Série à AFFICHER pour une progression donnée : 0 si le dernier jour travaillé
 * est antérieur à hier. Les écrans ne doivent pas afficher `progress.streak`
 * brut, qui reste le compteur stocké (voir H3 : quatre écrans affichaient un
 * chiffre qui ne voulait plus rien dire).
 */
export function streakAAfficher(progress: UserProgress, now: Date = new Date()): number {
  return serieAfficheeDepuisDaily(progress.dailyGoals, now);
}

/** Même calcul, à partir du seul bloc d'objectifs (utilisé par les widgets). */
export function serieAfficheeDepuisDaily(daily: DailyGoalConfig | undefined, now: Date = new Date()): number {
  return serieAffichee(etatSerie(daily?.serieDernierJour, daily?.streakDays), jourLocal(now));
}

/**
 * CUMUL de jours travaillés à AFFICHER — jamais 0 à cause d'une rupture.
 *
 * Les six écrans qui affichaient `serieAfficheeDepuisDaily` disaient « 0 » à un
 * élève qui venait de manquer un jour, effaçant à ses yeux des semaines de
 * travail. C'est ce cumul qu'il faut leur donner dès que la série est retombée.
 */
export function cumulJoursDepuisDaily(daily: DailyGoalConfig | undefined): number {
  return cumulJours(etatSerie(daily?.serieDernierJour, daily?.streakDays, daily?.joursActifsTotal));
}
