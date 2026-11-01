// src/data/tutorKnowledgeRuntime.ts — Phase B découpage bundle (2026-10-16).
//
// Miroir exact de lessonIndexRuntime.ts pour la base des opuscules
// (`src/tutorKnowledge.ts`, 472 Ko, 428 chunks) : le JSON est émis par le
// build (plugin Vite `kunz-tutor-bases-json`, dist/tutor/knowledge.json) puis
// récupéré par fetch au premier montage d'une vue du tuteur.
//
// Contrats identiques :
//   · le module source n'est PAS importé ici (type-only uniquement) ;
//   · dégradation HONNÊTE : tant que les données ne sont pas arrivées,
//     `tutorKnowledgeSiChargee()` retourne null → la base opuscules est
//     traitée comme vide (« لم أجد ») au lieu d'inventer ou de planter ;
//   · idempotent et mono-vol : les appels répétés partagent la même promesse.

import type { TutorKnowledgeChunk } from '../tutorKnowledge';

let donnees: TutorKnowledgeChunk[] | null = null;
let volEnCours: Promise<void> | null = null;

/** Chemin public du JSON émis par le build (précaché par le SW). */
export const CHEMIN_JSON_OPUS = `${import.meta.env.BASE_URL}tutor/knowledge.json`;

/** true dès que les données sont disponibles (les vues s'en servent pour re-rendre). */
export function tutorKnowledgeChargee(): boolean {
  return donnees !== null;
}

/** Les chunks, ou null tant que le fetch n'est pas terminé. Jamais d'exception. */
export function tutorKnowledgeSiChargee(): TutorKnowledgeChunk[] | null {
  return donnees;
}

/** Injection directe (idempotente). Utilisé par le préchargement des tests. */
export async function definirTutorKnowledge(d: TutorKnowledgeChunk[]): Promise<void> {
  if (donnees) return;
  if (!Array.isArray(d) || d.length === 0) {
    throw new Error('knowledge.json invalide : liste de chunks vide');
  }
  donnees = d;
}

/** Fetch du JSON émis par le build. Échec = avertissement + dégradation. */
export function chargerTutorKnowledge(fetchImpl: typeof fetch = fetch): Promise<void> {
  if (donnees) return Promise.resolve();
  volEnCours ??= fetchImpl(CHEMIN_JSON_OPUS)
    .then((r) => {
      if (!r.ok) throw new Error(`HTTP ${r.status} pour ${CHEMIN_JSON_OPUS}`);
      return r.json();
    })
    .then((j) => definirTutorKnowledge(j as TutorKnowledgeChunk[]))
    .catch((e: unknown) => {
      volEnCours = null; // une requête suivante pourra réessayer
      console.warn('[tuteur] base des opuscules indisponible :', e);
    });
  return volEnCours;
}
