// bilanSrs.ts — LE BILAN DU DECK SM-2, CALCULÉ PUR.
//
// POURQUOI CE MODULE EXISTE (audit coach 2026-11-06, reco 3 — lot 🔴).
// Le SM-2 réel vivait dans `flashcardsSrs.ts` et l'ordre du deck dans
// `sortByDue`, mais l'élève ne voyait de tout cela QUE la position
// « 3 / 12 » de la carte en main. La répétition espacée — l'engagement le plus
// ancien du produit leçon 12 — restait invisible : aucune carte due n'est
// annoncée, aucun chemin parcouru n'est montré. Ce module expose le CONTRAT
// honnête du deck, en quatre états mutuellement exclusifs qui couvrent TOUT
// (chaque carte tombe dans exactement un état — aucun chiffre inventé) :
//
//   · JAMAIS ÉVALUÉE  — aucune trace dans le stockage ; l'élève ne l'a
//                       jamais notée. Il ne faut pas la confondre avec
//                       « due » : `sortByDue` la joue en tête de deck, mais
//                       la dire « due » serait prêter une échéance à une
//                       carte qu'on n'a jamais mesurée ;
//   · ÉCHUE           — dueAt > 0 et dueAt ≤ maintenant : le rappel attend ;
//   · PROGRAMMÉE      — dueAt > maintenant : le SM-2 l'a remise à plus tard,
//                       c'est le signe que la mémoire tient ;
//   · CONSOLIDÉE      — dueAt = 0 (borne H3/TC5) : sortie de la boucle, la
//                       carte n'est reformulée que si un échec la rouvre.
//
// RÈGLE D'HONNÊTETÉ : ce module ne calcule AUCUN pourcentage de rétention.
// SM-2 ne mesurait jamais un « % de mémoire » — inventer une courbe de
// rétention à partir d'ease/dueAt serait une statistique fictive, ce que le
// dépôt interdit (règle m1 : « aucune statistique fictive »). Ce qui est
// compté ici sont des états RÉELS, dérivés du seul stockage persisté.
//
// PURE : les états arrivent en paramètre (`lireTousLesEtatsSrs()` côté vue).
// Aucun accès au stockage, aucune horloge — `maintenant` est reçu. C'est ce
// qui rend le bilan vérifiable sans monter d'interface.

import type { Flashcard } from '../types';
import type { SrsCardState } from './flashcardsSrs';

/** Les quatre états, exclusifs et exhaustifs — voir l'en-tête. */
export interface BilanSrs {
  /** Carte sans aucune trace SM-2 dans le stockage. */
  jamaisEvaluees: number;
  /** dueAt dans le passé : le rappel attend, aujourd'hui. */
  echeues: number;
  /** dueAt dans le futur : programmée par le SM-2. */
  programmees: number;
  /** dueAt = 0 : sortie de la boucle (borne H3). */
  consolidees: number;
}

/** Le bilan neutre : aucune carte traitée encore. */
export const BILAN_SRS_VIDE: BilanSrs = {
  jamaisEvaluees: 0,
  echeues: 0,
  programmees: 0,
  consolidees: 0,
};

/**
 * Le bilan d'une LISTE de cartes, contre un état SM-2 fourni.
 * L'ordre des tests est celui de l'exclusivité : une carte sans état ne
 * va JAMAIS dans « échues », même si son absence la joue en tête de deck.
 */
export function bilanSrsDesCartes(
  cartes: readonly Pick<Flashcard, 'id'>[],
  etats: Readonly<Record<string, SrsCardState>>,
  maintenant: number,
): BilanSrs {
  const bilan: BilanSrs = { ...BILAN_SRS_VIDE };
  for (const carte of cartes) {
    const etat = etats[carte.id];
    if (!etat) {
      bilan.jamaisEvaluees += 1;
    } else if (etat.dueAt === 0) {
      bilan.consolidees += 1;
    } else if (etat.dueAt <= maintenant) {
      bilan.echeues += 1;
    } else {
      bilan.programmees += 1;
    }
  }
  return bilan;
}

/**
 * Le même bilan, PAR UNITÉ — utile quand la vue est filtrée sur une unité
 * choisie. Les unités absentes de la liste ne créent pas de clé.
 */
export function bilanSrsParUnite(
  cartes: readonly Pick<Flashcard, 'id' | 'unitId'>[],
  etats: Readonly<Record<string, SrsCardState>>,
  maintenant: number,
): Readonly<Record<number, BilanSrs>> {
  const parUnite: Record<number, BilanSrs> = {};
  for (const carte of cartes) {
    const bilan = parUnite[carte.unitId] ?? { ...BILAN_SRS_VIDE };
    const etat = etats[carte.id];
    if (!etat) {
      bilan.jamaisEvaluees += 1;
    } else if (etat.dueAt === 0) {
      bilan.consolidees += 1;
    } else if (etat.dueAt <= maintenant) {
      bilan.echeues += 1;
    } else {
      bilan.programmees += 1;
    }
    parUnite[carte.unitId] = bilan;
  }
  return parUnite;
}

/**
 * cartesParProchaineEcheance : les cartes PROGRAMMÉES, triées par dueAt
 * croissant, plafonnées à `max`. Sert à MONTRER le chemin (quand la carte
 * revient-elle ?) sans prétendre à une courbe. Les échues et les
 * consolidées ne sont pas listées : les échues sont déjà dans le deck du
 * jour, les consolidées n'en ont plus d'espace visible.
 */
export function cartesParProchaineEcheance(
  cartes: readonly Pick<Flashcard, 'id' | 'question'>[],
  etats: Readonly<Record<string, SrsCardState>>,
  maintenant: number,
  max: number,
): Array<{ id: string; question: string; dueAt: number }> {
  const programmees: Array<{ id: string; question: string; dueAt: number }> = [];
  for (const carte of cartes) {
    const etat = etats[carte.id];
    if (!etat || etat.dueAt <= maintenant) continue;
    programmees.push({ id: carte.id, question: carte.question, dueAt: etat.dueAt });
  }
  programmees.sort((a, b) => a.dueAt - b.dueAt || a.id.localeCompare(b.id));
  return programmees.slice(0, Math.max(0, max));
}
