// ============================================================
// gesteDialogue.ts — reconnaître un GESTE HUMAIN dans la saisie de l'élève.
//
// Module PUR (aucune dépendance au moteur) : la reconnaissance d'un geste de
// dialogue se teste seule, et une régression se voit sans lancer l'application.
//
// Deux garde-fous, appris des défauts mesurés le 14/10/2026 :
//   1. Exception faite de la salutation et de l'adieu, un geste n'est reconnu
//      que si la saisie est COURTE : « شكرا » est un remerciement, mais
//      « شكرا، لكن ما هي العلاقة بين النسخ والترجمة؟ » est une question, et
//      cette couche ne doit jamais voler une question de cours.
//   2. Une saisie qui contient du vocabulaire disciplinaire n'est JAMAIS un
//      geste, quelle que soit sa longueur : le contenu passe avant la forme.
// ============================================================

import { includesAsWord, normalizeArabic } from '../utils/arabicNormalize';
import { GESTES_DIALOGUE, type GesteDialogue } from '../data/gestesDialogue';

/** Nombre de mots au-delà duquel on cesse d'y voir un geste social. */
const MOTS_MAX_GESTE = 6;

function compteMots(norm: string): number {
  return norm.replace(/[؟?،؛.!:,]/g, ' ').trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Le geste reconnu, ou `null`.
 *
 * `nommeUnSujet` : prédicat injecté par le moteur — vrai si la saisie désigne un
 * sujet du programme (son domaine a pu être identifié). Inutile d'importer le
 * moteur : le module reste pur et testable seul.
 *
 * POURQUOI CE PRÉDICAT EST LE BON (`vocabulaireDiscipline` ne marchait pas).
 * Le premier essai testait « la saisie partage-t-elle du vocabulaire avec les
 * cours ? » : « اشرح لي ببساطة » contenait `اشرح`, présent dans un titre de
 * leçon, donc le geste était ignoré et l'élève recevait une leçon sur la
 * chromatographie de la phase photochimique — réponse à côté, tirée d'un mot de
 * consigne. Ce qui distingue vraiment une question d'un geste, c'est **nommer un
 * sujet** : « النسخ والترجمة » en nomme un, « ببساطة » non.
 */
export function gesteDuMessage(
  norm: string,
  nommeUnSujet: (norm: string) => boolean,
): GesteDialogue | null {
  if (!norm || norm.trim().length < 3) return null;

  const courts = compteMots(norm) <= MOTS_MAX_GESTE;

  for (const geste of GESTES_DIALOGUE) {
    const social = geste.id === 'salutation' || geste.id === 'adieu';
    // Un geste long n'est un geste que s'il est social : saluer prend deux mots,
    // demander une simplification dans une phrase entière, c'est déjà discuter.
    if (!courts && !social) continue;
    // Le contenu de cours passe avant la forme du message : une saisie qui
    // nomme un sujet du programme n'est jamais un geste.
    if (!social && nommeUnSujet(norm)) continue;

    for (const d of geste.declencheurs) {
      const nd = normalizeArabic(d);
      if (!nd) continue;
      if (includesAsWord(norm, nd)) return geste;
    }
  }
  return null;
}
