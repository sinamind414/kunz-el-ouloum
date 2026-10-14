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
}

/** Paliers de série — miroir exact des badges de `BadgesView`. */
export const PALIERS_SERIE: readonly number[] = [7, 30];

export function etatSerie(
  dernierJour: string | null | undefined,
  jours: number | null | undefined,
): EtatSerie {
  const n = typeof jours === 'number' && Number.isFinite(jours) ? Math.floor(jours) : 0;
  return { jours: Math.max(0, n), dernierJour: dernierJour ?? null };
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
    // (même logique anti-farm que le reste de l'app).
    return { etat, nouveauJour: false, serieRompue: false, palier: null };
  }

  const ecart = etat.dernierJour ? ecartEnJours(etat.dernierJour, aujourdhui) : null;
  const serieRompue = ecart !== null && ecart > 1;
  const jours = ecart === 1 && etat.jours > 0 ? etat.jours + 1 : 1;

  return {
    etat: { jours, dernierJour: aujourdhui },
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
