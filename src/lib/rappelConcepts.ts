// src/lib/rappelConcepts.ts — LE PONT ENTRE LE CORPUS DE QUESTIONS ET L'ORDONNANCEUR.
//
// Séparé de `rappelAdaptatif.ts` pour une raison de poids : le moteur du tuteur a
// besoin de programmer des rappels (donc d'`rappelAdaptatif`), mais il n'a pas à
// embarquer les questions du corpus. Ce module-ci est le seul à lire
// `spacedRecallPrompts.ts` + `spacedRecallPromptsAuto.ts`, et seuls les écrans qui
// POSENT ces questions l'importent.
//
// CE QU'IL RÉPARE. `spacedRecallPrompts.ts` contient 16 concepts × 4 questions,
// chacune avec les preuves attendues dans la réponse de l'élève. Vérifié le
// 15/10/2026 : ses cinq seuls importateurs étaient des fichiers de test, et
// `getSpacedRecallPrompt` n'était appelé nulle part. Ce corpus n'avait jamais
// été montré à un élève. Ici, il devient sélectionnable et notable.
//
// P1-2 (28/10/2026 — branchement (c) « agenda d'ouverture ») : le corpus AUTO
// (63 concepts générés depuis les leçons gold, clavés par lessonId) est fusionné
// ICI, sans modifier le record manuel — les verrous `volumeCorpus.lock.test.ts`
// (16 clés) et `CONCEPT_ROUTES` ne portent que sur SPACED_RECALL_PROMPTS et
// restent inchangés.

import { SPACED_RECALL_PROMPTS, type SpacedRecallPrompt } from '../data/spacedRecallPrompts';
import { SPACED_RECALL_PROMPTS_AUTO } from '../data/spacedRecallPromptsAuto';
import { chargeBanque, elementsDus, type BanqueRappels } from './rappelAdaptatif';
import type { EtatSm2 } from './sm2';

/**
 * Les prompts d'un concept, corpus manuel d'abord puis corpus auto.
 * Un identifiant ne peut appartenir qu'à l'un des deux (exclusion dynamique
 * garantie par le générateur) — l'union est une précaution de lecture, pas un
 * double comptage.
 */
export function promptsDeConcept(conceptId: string): SpacedRecallPrompt[] {
  return SPACED_RECALL_PROMPTS[conceptId] ?? SPACED_RECALL_PROMPTS_AUTO[conceptId] ?? [];
}

/** Le concept appartient-il au corpus de rappels (manuel ou auto) ? */
export function estConceptRappel(conceptId: string): boolean {
  return promptsDeConcept(conceptId).length > 0;
}

/** Nombre de questions disponibles par concept dans le corpus. */
export const PROMPTS_PAR_CONCEPT = 4;

/**
 * La question à poser pour un concept, selon ce qu'il a déjà enduré.
 *
 * Le corpus va de la question de cours à la production type BAC. En SM-2, un
 * élément bien su dépasse vite 4 révisions : on plafonne alors sur la DERNIÈRE
 * question — la plus intégrative — pour l'entretien. Faire tourner les quatre
 * indéfiniment servirait à un élève qui maîtrise la notion la question la plus
 * facile du corpus, soit l'inverse de ce qu'il faut à ce moment-là.
 *
 * Après un échec, `reps` repart à 0 : l'élève retrouve la première question.
 * C'est voulu — on ne redemande pas une synthèse à qui vient d'échouer sur la
 * définition.
 */
export function promptPour(conceptId: string, etat: EtatSm2 | null): SpacedRecallPrompt | null {
  const prompts = promptsDeConcept(conceptId);
  if (!prompts || prompts.length === 0) return null;
  const rang = etat?.reps ?? 0;
  const index = Math.min(rang, Math.min(PROMPTS_PAR_CONCEPT, prompts.length) - 1);
  return prompts[index] ?? prompts[0]!;
}

/** Concepts du corpus dont le rappel est échu. */
export function conceptsDus(now: number = Date.now(), banque: BanqueRappels = chargeBanque()): string[] {
  return elementsDus(now, banque).filter((id) => estConceptRappel(id));
}

export interface RappelDu {
  itemId: string;
  /** La question à poser (null si l'identifiant n'appartient pas au corpus). */
  prompt: SpacedRecallPrompt | null;
  /** Jours de retard (0 = dû aujourd'hui). */
  retardJours: number;
}

/**
 * Le rappel le plus urgent parmi les concepts échus — ou null si rien n'est dû.
 * Le plus en retard passe d'abord : un élève qui a manqué trois jours ne doit pas
 * recevoir la notion due du jour avant celle qu'il a laissée filer.
 */
export function prochainRappelDu(
  now: number = Date.now(),
  banque: BanqueRappels = chargeBanque(),
): RappelDu | null {
  const dus = conceptsDus(now, banque);
  const premier = dus[0];
  if (!premier) return null;
  const etat = banque[premier]!;
  return {
    itemId: premier,
    prompt: promptPour(premier, etat),
    retardJours: Math.max(0, Math.floor((now - etat.dueAt) / 86_400_000)),
  };
}

/** Nombre de concepts du corpus qui portent une mémoire de rappel. */
export function conceptsSuivis(banque: BanqueRappels = chargeBanque()): number {
  return Object.keys(banque).filter((id) => estConceptRappel(id)).length;
}
