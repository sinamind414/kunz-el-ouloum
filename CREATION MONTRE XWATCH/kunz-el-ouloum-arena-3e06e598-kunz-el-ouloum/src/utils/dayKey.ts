// dayKey.ts — LA définition unique de « aujourd'hui » (H3, audit 8 axes 2026-10-14).
//
// DÉFAUT CORRIGÉ ICI. Sept endroits d'`App.tsx`, le moteur du tuteur
// (`getDailyMission`) et le gestionnaire de session calculaient le jour avec
// `new Date().toISOString().split('T')[0]` — c'est-à-dire le jour **UTC**.
// En Algérie (UTC+1), entre 00 h 00 et 01 h 00 du matin, l'application croyait
// encore être la VEILLE :
//   · la remise à zéro de l'objectif quotidien se déclenchait une heure trop tard ;
//   · une session de travail nocturne était comptée sur le jour précédent ;
//   · « مهمة اليوم » (mission du jour) pouvait être rejouée une fois de plus.
// Un élève qui travaille à 00 h 30 est un élève normal en année de BAC : le
// défaut était donc visible en pratique, pas théorique.
//
// Trois implémentations locales concurrentes existaient déjà
// (`DailyGoalWidget.getTodayDateKey`, `FocusTimer.todayKey`,
// `microCapsules.todayKey`) : elles délèguent désormais à celle-ci, pour qu'une
// seule définition du jour existe dans tout le dépôt (source unique, testée).

/** Jour local au format AAAA-MM-JJ — l'heure de l'élève, jamais UTC. */
export function jourLocal(now: Date = new Date()): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}`;
}

/**
 * Ajoute (ou retire) des jours à une clé AAAA-MM-JJ.
 * L'arithmétique passe par minuit LOCAL : un passage d'heure d'été ne peut donc
 * pas décaler la réponse (le dépôt vise l'Algérie, sans heure d'été, mais la
 * fonction reste correcte ailleurs).
 */
export function ajouterJours(jour: string, jours: number): string {
  const [a, m, j] = jour.split('-').map(Number);
  const d = new Date(a, m - 1, j);
  d.setDate(d.getDate() + jours);
  return jourLocal(d);
}

/** Nombre de jours entre deux clés (positif si `jusqua` est après `depuis`). */
export function ecartEnJours(depuis: string, jusqua: string): number {
  const minuitLocal = (jour: string): number => {
    const [a, m, j] = jour.split('-').map(Number);
    return new Date(a, m - 1, j).getTime();
  };
  // Arrondi : une journée peut durer 23 h ou 25 h selon le fuseau horaire.
  return Math.round((minuitLocal(jusqua) - minuitLocal(depuis)) / 86_400_000);
}
