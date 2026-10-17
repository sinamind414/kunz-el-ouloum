// flashcardsSanitize.ts — garde-fou de restauration localStorage (bug « flashcard
// qui tourne sur un verso vide », rapport du 2026-09-20). Audit mécanique effectué :
// les 511 cartes du dépôt sont saines dans TOUT l'historique git — le verso vide ne
// peut venir que d'un blob localStorage périmé/corrompu sur l'appareil de l'élève
// (ancienne build pré-dépôt, écriture partielle…). La migration D3 existante ne
// vérifiait que le préfixe d'id — un blob fc_q_* troué était chargé tel quel, pour
// toujours. Ce module rejette STRICTEMENT tout blob non entièrement sain.

import type { Flashcard } from '../types';

/** Une carte est affichable : question et au moins un verso réel (≥ 5 caractères). */
export function carteSaine(c: unknown): c is Flashcard {
  if (!c || typeof c !== 'object') return false;
  const k = c as Partial<Flashcard>;
  if (typeof k.id !== 'string' || k.id.trim().length < 1) return false;
  if (typeof k.unitId !== 'number' || !Number.isInteger(k.unitId) || k.unitId < 1) return false;
  if (typeof k.question !== 'string' || k.question.trim().length < 8) return false;
  if (!Array.isArray(k.answerBullets) || k.answerBullets.length === 0) return false;
  const total = k.answerBullets.reduce(
    (a, b) => a + (typeof b === 'string' ? b.trim().length : 0),
    0,
  );
  if (total < 5) return false;
  return true;
}

/**
 * Valide un blob `svt_flashcards`. Strict : UNE SEULE carte corrompue (verso vide,
 * champ manquant, doublon d'id) ⇒ tout le blob est rejeté (null) — l'appelant
 * réinitialise alors sur SVT_FLASHCARDS et réécrit le stock local. Soigne
 * automatiquement n'importe quel appareil au prochain chargement.
 */
export function healSavedFlashcards(raw: unknown): Flashcard[] | null {
  if (!Array.isArray(raw) || raw.length === 0) return null;
  const ok = raw.filter(carteSaine) as Flashcard[];
  if (ok.length !== raw.length) return null;
  const ids = new Set(ok.map((c) => c.id));
  if (ids.size !== ok.length) return null;
  return ok;
}

/**
 * Synchronise le deck stocké avec celui du dépôt (Vague 2 — action 9).
 *
 * LE DÉFAUT CORRIGÉ : le blob `svt_flashcards` n'était JAMAIS mis à jour une
 * fois sain — tout appareil ayant déjà ouvert la révision restait figé sur le
 * deck d'alors, pour toujours (les M cartes ajoutées par le dépôt — ex. les
 * cartes hosila, et tout correctif de contenu — n'apparaissaient jamais).
 *
 * Le dépôt fait AUTORITÉ sur le CONTENU : la progression SM-2 vit à part
 * (`kunz_flashcard_srs_v1`, indexée par id de carte) — réadopter la référence
 * ne perd donc AUCUN état d'apprentissage.
 *
 * Retourne le deck de référence s'il apporte quelque chose de nouveau
 * (cartes ajoutées OU contenu corrigé sur un id existant), sinon `null`
 * (rien à faire — pas de réécriture inutile du stock local).
 */
export function synchroniseDeck(stocke: Flashcard[], reference: Flashcard[]): Flashcard[] | null {
  if (stocke.length === reference.length && stocke.every((c, i) => {
    const ref = reference[i];
    return ref.id === c.id && ref.question === c.question && ref.answerBullets.length === c.answerBullets.length;
  })) return null;
  return reference;
}
