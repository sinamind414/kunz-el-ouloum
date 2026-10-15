// conseilRubrique.ts — QUAND LE GUIDE A LE DROIT DE PARLER EN ENTRANT.
//
// La règle tient en une phrase : le guide accueille à la PREMIÈRE visite, et
// ensuite il se tait jusqu'à ce qu'on lui redemande. Un professeur ne répète pas
// la consigne de la salle chaque fois que tu franchis la porte.
//
// Ce module est PUR (aucune dépendance à React) : la décision « faut-il parler ? »
// se teste donc sans monter d'interface, comme celle de la bulle du capitaine.

/** Rubriques dont le conseil a déjà été montré. */
export const CLE_CONSEILS_VUS = 'boussole_conseils_rubriques_vus';

/**
 * Nombre de rubriques mémorisées.
 *
 * Plafonné pour la même raison que partout ailleurs dans cette application :
 * le stockage local d'un téléphone d'entrée de gamme n'est pas infini. Au-delà,
 * les plus anciennes sont oubliées — et le pire qui puisse arriver est que le
 * guide réexplique une rubrique. C'est bénin, contrairement à un stockage qui
 * grossit sans fin.
 */
const MAX_RUBRIQUES_MEMORISEES = 40;

/**
 * Faut-il montrer le conseil de cette rubrique ?
 *
 * Fonction PURE : elle reçoit la liste des rubriques déjà vues. Trois refus :
 *  · pas de conseil pour cette rubrique → silence (voir `conseilsRubrique.ts`) ;
 *  · rubrique déjà vue → silence ;
 *  · identifiant vide ou douteux → silence (on ne parle pas d'un écran inconnu).
 */
export function doitParlerRubrique(
  rubrique: string | null | undefined,
  dejaVues: readonly string[],
  aUnConseil: boolean,
): boolean {
  if (!aUnConseil) return false;
  if (typeof rubrique !== 'string' || rubrique.length === 0) return false;
  if (rubrique === 'splash') return false;
  return !dejaVues.includes(rubrique);
}

/** Liste des rubriques déjà vues (lecture tolérante : jamais d'exception). */
export function rubriquesVues(): string[] {
  try {
    const brut = localStorage.getItem(CLE_CONSEILS_VUS);
    if (!brut) return [];
    const liste = JSON.parse(brut);
    if (!Array.isArray(liste)) return [];
    return liste.filter((x): x is string => typeof x === 'string').slice(0, MAX_RUBRIQUES_MEMORISEES);
  } catch {
    // Stockage abîmé ou indisponible : on repart de zéro. Le pire effet est une
    // explication redonnée — jamais une donnée fausse affichée.
    return [];
  }
}

/** Mémorise qu'une rubrique a été expliquée. */
export function marquerRubriqueVue(rubrique: string): void {
  if (typeof rubrique !== 'string' || rubrique.length === 0) return;
  try {
    const vues = rubriquesVues().filter((r) => r !== rubrique);
    localStorage.setItem(CLE_CONSEILS_VUS, JSON.stringify([rubrique, ...vues].slice(0, MAX_RUBRIQUES_MEMORISEES)));
  } catch {
    /* stockage indisponible : au pire, le conseil sera remontré */
  }
}

/**
 * Oublie les conseils déjà vus — l'élève redemandera donc les explications.
 * Utilisé par les tests et disponible pour un futur « راهنِ التلميذ » ;
 * inutile de le brancher à une interface tant que personne ne le réclame.
 */
export function oublierConseilsVus(): void {
  try {
    localStorage.removeItem(CLE_CONSEILS_VUS);
  } catch {
    /* rien à faire */
  }
}
