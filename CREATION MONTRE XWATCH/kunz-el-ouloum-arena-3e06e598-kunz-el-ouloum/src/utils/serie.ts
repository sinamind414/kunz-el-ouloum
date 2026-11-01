// serie.ts — la série de jours d'étude (H3, audit 8 axes 2026-10-14).
//
// CE QUI ÉTAIT FAUX. `progress.streak` et `dailyGoals.streakDays` étaient
// affichés par quatre écrans (« 0 يوم » ici, « 1 أيام » là, « {streak || 1} »),
// dont deux badges (`BadgesView` : streak_7 et streak_30). Or AUCUN code
// n'écrivait ces champs : `progress.streak` n'était écrit qu'à l'initialisation
// (`App.tsx`), et `dailyGoals.streakDays` n'était jamais incrémenté. Les seuils
// 7 et 30 jours étaient donc mathématiquement inatteignables, et les
// célébrations (`StreakCelebrationModal`, `playStreakMilestoneSound`) mortes.
//
// CE MODULE rend la règle explicite, pure et testable :
//   · même jour que la dernière activité        → série inchangée ;
//   · activité la veille (écart = 1 jour)       → série + 1 ;
//   · un jour manqué ou plus (écart > 1)        → série remise à 1 ;
//   · horloge reculée (écart < 1)               → nouveau départ prudent à 1,
//     jamais une série gonflée par une date incohérente.
//
// Il n'invente aucune donnée : ce sont les jours où l'élève a RÉELLEMENT
// travaillé (activité enregistrée par l'app) qui construisent la série — ce qui
// inclut la mission quotidienne du tuteur, désormais comptée (voir `App.tsx`).

import { ecartEnJours } from './dayKey';

export interface EtatSerie {
  /** Nombre de jours consécutifs d'activité. */
  jours: number;
  /** Dernier jour d'activité enregistré (AAAA-MM-JJ local), null si aucun. */
  dernierJour: string | null;
  /**
   * CUMUL de tous les jours travaillés depuis le premier — JAMAIS remis à zéro.
   *
   * POURQUOI CE CHAMP EXISTE (14/10/2026, lecture de « L'effet cumulé » de
   * Darren Hardy) : `serieAffichee` renvoie 0 dès qu'un jour est manqué. Un
   * élève qui avait travaillé 42 jours et rate une journée voyait donc « 0 » :
   * l'application lui disait que son travail n'existait plus, exactement au
   * moment où il avait besoin du contraire. Hardy : les résultats s'accumulent,
   * un jour manqué n'efface rien. La SÉRIE peut casser (elle mesure la
   * régularité, c'est son rôle) ; le CUMUL ne casse pas (il mesure l'acquis).
   */
  joursTotal: number;
}

/** Paliers de série — miroir exact des badges de `BadgesView`. */
export const PALIERS_SERIE: readonly number[] = [7, 30];

export function etatSerie(
  dernierJour: string | null | undefined,
  jours: number | null | undefined,
  joursTotal?: number | null | undefined,
): EtatSerie {
  const n = typeof jours === 'number' && Number.isFinite(jours) ? Math.floor(jours) : 0;
  const total = typeof joursTotal === 'number' && Number.isFinite(joursTotal) ? Math.floor(joursTotal) : 0;
  return { jours: Math.max(0, n), dernierJour: dernierJour ?? null, joursTotal: Math.max(0, total) };
}

/** Palier (7 ou 30) atteint exactement aujourd'hui — sinon null. */
export function palierAtteint(jours: number): number | null {
  return PALIERS_SERIE.includes(jours) ? jours : null;
}

export interface ProgressionJour {
  etat: EtatSerie;
  /** Vrai si c'est la première activité de ce jour. */
  nouveauJour: boolean;
  /** Vrai si au moins un jour a été manqué (série repartie à 1). */
  serieRompue: boolean;
  /** Palier tout juste atteint (7 / 30) — à célébrer une seule fois. */
  palier: number | null;
}

/** Enregistre une activité d'étude pour `aujourdhui` et renvoie la série à jour. */
export function enregistrerJourActif(
  etat: EtatSerie,
  aujourdhui: string,
): ProgressionJour {
  if (etat.dernierJour === aujourdhui) {
    // Déjà compté aujourd'hui : rejouer un quiz ne fait pas progresser la série
    // (même logique anti-farm que le reste de l'app) — et ne compte pas non plus
    // un second jour dans le cumul.
    return { etat, nouveauJour: false, serieRompue: false, palier: null };
  }

  const ecart = etat.dernierJour ? ecartEnJours(etat.dernierJour, aujourdhui) : null;
  const serieRompue = ecart !== null && ecart > 1;
  const jours = ecart === 1 && etat.jours > 0 ? etat.jours + 1 : 1;

  return {
    // `joursTotal + 1` : le cumul ignore l'écart. Rater dix jours n'enlève rien,
    // travailler un jour ajoute toujours un jour.
    etat: { jours, dernierJour: aujourdhui, joursTotal: etat.joursTotal + 1 },
    nouveauJour: true,
    serieRompue,
    palier: palierAtteint(jours),
  };
}

/**
 * Série RÉELLE à afficher : si le dernier jour d'activité est antérieur à hier,
 * la série stockée ne représente plus des jours consécutifs — on affiche 0
 * plutôt qu'un chiffre qui ne veut plus rien dire.
 */
export function serieAffichee(etat: EtatSerie, aujourdhui: string): number {
  if (!etat.dernierJour) return 0;
  const ecart = ecartEnJours(etat.dernierJour, aujourdhui);
  return ecart === 0 || ecart === 1 ? etat.jours : 0;
}

/**
 * CUMUL à afficher : les jours d'étude acquis, quoi qu'il arrive à la série.
 *
 * À utiliser PARTOUT où l'application parlait de la seule série : sans cela,
 * une rupture affiche « 0 » et efface le travail réel de l'élève.
 */
export function cumulJours(etat: EtatSerie): number {
  return Math.max(0, etat.joursTotal);
}
