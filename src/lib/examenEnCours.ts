// ============================================================
// examenEnCours.ts — L'ÉPREUVE COUPE LA PAROLE AU GUIDE.
//
// LE DÉFAUT (trouvé le 14/10/2026, vérifié dans App.tsx).
//
// Le bouton flottant du المرشد est rendu par :
//
//     {!isFocusMode && currentTab !== 'chat' && (<button data-testid="fab-morchid" …>)}
//
// Or `isFocusMode` n'est réglé par PERSONNE pendant l'examen : seul QuizView le
// pilote (mode focus), et App le remet à `false` à chaque changement d'onglet.
// Conséquence : pendant « موضوع تجريبي » — une épreuve CHRONOMÉTRÉE de 4 h 30,
// avec ses phases قراءة/تحرير/مراجعة — l'élève pouvait ouvrir le tuteur et lui
// demander la réponse. Une épreuve pendant laquelle on peut interroger
// l'assistant n'est pas une épreuve : c'est la fin de la simulation.
//
// Ce module est le signal minimal qui manquait : « une épreuve est en cours ».
// Il est volontairement minuscule — pas de contexte React, pas de store, pas de
// dépendance : une valeur et des abonnés, comme `morchidBridge` le fait déjà
// pour porter une question d'une vue à l'autre.
//
// PORTÉE : le silence. Ce module ne dit PAS au guide quoi dire ; il dit
// seulement qu'il doit se taire. Le retour du guide APRÈS l'épreuve est un
// autre sujet (voir `capitaine.ts`, situation `examenTermine`).
//
// POURQUOI PAS `setIsFocusMode` : le mode focus change la MISE EN PAGE (barre
// masquée, largeur réduite, contenu centré). L'examen, lui, a besoin de la mise
// en page normale pour rester lisible sur un petit écran. Réutiliser le mode
// focus aurait mélangé deux intentions différentes.
// ============================================================

let actif = false;
const abonnes = new Set<(actif: boolean) => void>();

/** L'épreuve est-elle en cours ? */
export function examenActif(): boolean {
  return actif;
}

/**
 * Déclare (ou termine) l'épreuve.
 *
 * Idempotent : appeler deux fois `true` ne notifie qu'une fois. C'est ce qui
 * permet à un composant de déclarer l'épreuve dans un `useEffect` sans se
 * soucier des rendus multiples de React.
 */
export function declarerExamen(actifDesormais: boolean): void {
  if (actif === actifDesormais) return;
  actif = actifDesormais;
  for (const rappel of [...abonnes]) {
    try {
      rappel(actif);
    } catch {
      // Un abonné fautif ne doit pas empêcher les autres d'être prévenus, et ne
      // doit surtout pas casser l'épreuve en cours.
    }
  }
}

/**
 * S'abonner aux changements. Rend une fonction de désabonnement — à appeler
 * dans le nettoyage du `useEffect`, sinon le rappel survit au démontage.
 */
export function abonnerExamen(rappel: (actif: boolean) => void): () => void {
  abonnes.add(rappel);
  return () => {
    abonnes.delete(rappel);
  };
}

/** Remise à zéro — réservée aux tests, pour ne pas laisser d'état global. */
export function reinitialiserExamen(): void {
  actif = false;
  abonnes.clear();
}
