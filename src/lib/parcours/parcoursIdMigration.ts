// src/lib/parcours/parcoursIdMigration.ts
// MIGRATION DES IDS POSITIONNELS DU PARCOURS (TC6, 19/10/2026).
//
// Les ids du parcours sont POSITIONNELS : `parcours:u{unitId}:l{index}`
// (parcoursPath.ts). Le TC6 a câblé les 12 leçons actives orphelines :
//   · U3 : d1-u3-l1-enzyme arrive entre phase4 et enzyme_inhibitors (le verrou
//     enzymeInhibitors.lock exige que les inhibiteurs closent l'unité, et
//     LESSON_PROGRESSION chaîne d1-u3-l1 → enzyme_inhibitors)
//     → enzyme_inhibitors passe de l3 à l4 ;
//   · U4 : les 4 leçons d'immunité arrivent APRÈS phase7 et AVANT le dossier
//     VIH + la حوصلة (ordre TDM : chapitres puis dossier puis synthèse ;
//     LESSON_PROGRESSION mémoire → coopération inchangée)
//     → immunity_hiv_aids passe de l4 à l8, immunity_cooperation de l5 à l9.
//
// SANS migration, le store d'un élève qui avait FINI ces leçons verrait ses
// validations attribuées SILENCIEUSEMENT aux nouvelles leçons occupant les
// anciens indices : une corruption de progression. Cette table remappe
// l'ancien id vers le nouveau, UNE FOIS, marquée par un compteur de migration
// dans le store (`mig`) — un progress écrit APRÈS le câblage n'est jamais
// remappé.

const VERSION_MIGRATION_TC6 = 6;

/** Ancien id positionnel → nouveau id (les seuls décalages introduits par TC6). */
const REMAPPAGE_TC6: Record<string, string> = {
  'parcours:u3:l3': 'parcours:u3:l4', // enzyme_inhibitors
  'parcours:u4:l4': 'parcours:u4:l8', // immunity_hiv_aids
  'parcours:u4:l5': 'parcours:u4:l9', // immunity_cooperation
};

/** Ids valides après remappage — garde-fou de test (aucune perte, aucun double). */
export const REMAPPAGE_TC6_TAILLE = Object.keys(REMAPPAGE_TC6).length;

export function versionMigrationTC6(): number {
  return VERSION_MIGRATION_TC6;
}

/**
 * Applique le remappage aux structures clées par id (done, reviews, current),
 * une seule fois : si le store porte déjà la marque `mig` >= 6, il est rendu
 * tel quel (un `parcours:u3:l3` post-câblage désigne d1-u3-l1, PAS les
 * inhibiteurs — le remapper serait la corruption inverse).
 */
export function migrerIdsParcours<
  T extends { done?: Record<string, unknown>; reviews?: Record<string, unknown>; current?: string; mig?: number },
>(etat: T): T & { mig: number } {
  const dejaAppliquee = typeof etat.mig === 'number' && etat.mig >= VERSION_MIGRATION_TC6;
  const done = { ...(etat.done ?? {}) };
  const reviews = { ...(etat.reviews ?? {}) };
  let current = etat.current;

  if (!dejaAppliquee) {
    for (const [avant, apres] of Object.entries(REMAPPAGE_TC6)) {
      if (done[avant] !== undefined) {
        done[apres] = done[avant];
        delete done[avant];
      }
      if (reviews[avant] !== undefined) {
        reviews[apres] = reviews[avant];
        delete reviews[avant];
      }
      if (current === avant) current = apres;
    }
  }

  return { ...etat, done, reviews, current, mig: VERSION_MIGRATION_TC6 };
}
