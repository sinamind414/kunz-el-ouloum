// etatEleveRuntime.ts — L'ÉTAT ÉLÈVE PASSÉ AU MOTEUR (TC2/H4, audit coach
// 18/10/2026).
//
// Le constat mesuré : le chat (`smartTutorEngine`) et la bulle du capitaine
// vivaient avec DEUX mémoires — « راجع أخطائي » ne voyait que les erreurs de
// la session courante, pendant que le دفتر الأخطاء (QCM, `profilErreurs`) et
// l'assemblage du capitaine (`lib/etatEleve.ts`) restaient invisibles au chat.
//
// Pourquoi un POINTEUR et pas un import statique dans le moteur :
//   1. `processStudentInput` est SYNCHRONE, alors que la mémoire des erreurs
//      arrive en dynamique (import différé dans le hook — 166 Ko → 177 Ko de
//      bundle d'entrée si statique, mesuré le 14/10/2026, `poidsEntree.verrou`) ;
//   2. App importe le moteur de façon statique : tout ce que le moteur consomme
//      statiquement finit dans les premiers octets téléchargés par l'élève.
//
// La source de vérité reste `lib/etatEleve.ts` (un seul assemblage) : ce module
// ne porte QU'UN poignet — le capitaine dépose l'état qu'il a déjà assemblé, le
// moteur le lit s'il est là. `null` = « je n'ai pas encore de lecture » : la
// réponse du moteur reste honnête, jamais un chiffre inventé.

import type { EtatEleve } from './etatEleve';

let etatDepose: EtatEleve | null = null;

/** Le capitaine (qui assemble l'état une fois) le dépose ici. */
export function fournirEtatEleve(etat: EtatEleve): void {
  etatDepose = etat;
}

/** Le moteur lit ici — `null` tant que le capitaine n'a pas parlé. */
export function etatEleveSiChargee(): EtatEleve | null {
  return etatDepose;
}

/** Isolement des suites de tests. */
export function reinitialiserEtatEleve(): void {
  etatDepose = null;
}
