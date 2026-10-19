/**
 * H5 « effort mesuré » — audit architecture d'apprentissage (2026-10-19,
 * dossier de preuves, sonde p5_flash contre le commit 0639e08).
 *
 * Avant : chaque notation de carte créditait `Math.floor(Math.random()*3)+2`
 * minutes (2–4 min ALÉATOIRES, aucun lien avec le temps réel) et 2 XP sur
 * « again ». La sonde de l'auditeur — 75 notations à ~0,5 s l'une — a mesuré
 * 236 min d'étude créditées, 750 XP et « objectif atteint » : l'inflation
 * estimée était ×6 à ×12 pour un rythme humain honnête (15–30 s/carte).
 *
 * Maintenant : le temps mesuré est le temps RÉELlement écoulé entre
 * l'affichage de la carte (noterAffichageEffort) et la notation
 * (minutesReelMesurees), plafonné par carte, avec reliquat frac-séconde
 * reporté d'une carte à la suivante. Aucune mesure → aucun crédit.
 *
 * Périmètre verrouillé par src/__tests__/h5EffortMesure.lock.test.ts
 * (rejeu exact de la sonde p5 : 75 notations rapides ⇒ 0 minute créditée).
 */

/** Plafond de temps crédité par carte : relire/réfléchir une carte dépasse
 * rarement 2 min ; au-delà, le crédit s'arrête (anti-gonflage). */
export const PLAFOND_DUREE_EFFORT_MS = 120_000;

/** XP par notation — H5 : « again » (échec de rappel) ne crédite RIEN.
 * « hard/good/easy » conservent 5/10/15 (barème déjà en vigueur). */
export const POINTS_PAR_NOTATION: Record<'again' | 'hard' | 'good' | 'easy', number> = {
  again: 0,
  hard: 5,
  good: 10,
  easy: 15,
};

/** Carte actuellement affichée (clé + horodatage d'affichage). */
let carteAffichee: { cle: string; dateAffichage: number } | null = null;

/** Reliquat de la fraction de minute accumulée sur la séance en cours. */
let reliquatMs = 0;

/** Réservé au verrou H5 (src/__tests__/h5EffortMesure.lock.test.ts) : l'état
 * interne étant module-level, chaque test repart de zéro via cette porte. */
export function remiseAZeroPourTests(): void {
  carteAffichee = null;
  reliquatMs = 0;
}

/**
 * Enregistre l'instant d'affichage d'une carte (ou d'un bloc révélé dans le
 * mode حفظ de la حصيلة). Appelée par les vues d'affichage — RevisionView
 * (carte en main) et OkachaView (révélation d'un point).
 */
export function noterAffichageEffort(cle: string, maintenant: number = Date.now()): void {
  carteAffichee = { cle, dateAffichage: maintenant };
}

/**
 * Consomme la durée réellement mesurée depuis l'affichage de la carte et
 * retourne les MINUTES à créditer (entier ≥ 0, reliquat préservé).
 * Retourne 0 si aucune carte n'a été affichée : pas de mesure = pas de crédit.
 */
export function minutesReelMesurees(maintenant: number = Date.now()): number {
  if (!carteAffichee) return 0;
  const brut = Math.min(
    Math.max(0, maintenant - carteAffichee.dateAffichage),
    PLAFOND_DUREE_EFFORT_MS,
  );
  carteAffichee = null;
  reliquatMs += brut;
  const minutes = Math.floor(reliquatMs / 60_000);
  reliquatMs -= minutes * 60_000;
  return minutes;
}
