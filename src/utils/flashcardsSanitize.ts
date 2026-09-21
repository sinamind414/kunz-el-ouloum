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
