// src/data/lessonIndexRuntime.ts — Phase A découpage bundle (2026-10-16).
//
// Remplace l'import statique de `lessonIndex.ts` (786 Ko sur disque) dans le
// graphe de production : le JSON est émis par le build (plugin Vite
// `kunz-tutor-lesson-json`, dist/tutor/lesson-index.json) puis récupéré par
// fetch au premier montage d'une vue du tuteur (AITutorView, SearchView).
//
// Contrats :
//   · le fichier protégé `src/data/lessonIndex.ts` n'est PAS importé ici
//     (type-only uniquement, effacé à la compilation → zéro octet dans le
//     bundle) ;
//   · dégradation HONNÊTE : tant que les données ne sont pas arrivées,
//     `lessonIndexSiChargee()` retourne null → le moteur traite la leçon
//     comme introuvable (« لم أجد ») au lieu d'inventer ou de planter ;
//   · idempotent et mono-vol : les appels répétés de `chargerLessonIndex`
//     partagent la même promesse.

import type { LessonIndexChunk } from './lessonIndex';

let donnees: LessonIndexChunk[] | null = null;
let volEnCours: Promise<void> | null = null;

/** Chemin public du JSON émis par le build (todo précaché par le SW). */
export const CHEMIN_JSON_LECONS = `${import.meta.env.BASE_URL}tutor/lesson-index.json`;

/** true dès que les données sont disponibles (les vues s'en servent pour re-rendre). */
export function lessonIndexChargee(): boolean {
  return donnees !== null;
}

/** Les chunks, ou null tant que le fetch n'est pas terminé. Jamais d'exception. */
export function lessonIndexSiChargee(): LessonIndexChunk[] | null {
  return donnees;
}

/** Injection directe (idempotente). Utilisé par le préchargement des tests. */
export async function definirLessonIndex(d: LessonIndexChunk[]): Promise<void> {
  if (donnees) return;
  if (!Array.isArray(d) || d.length === 0) {
    throw new Error('lesson-index.json invalide : liste de chunks vide');
  }
  donnees = d;
}

/** Fetch du JSON émis par le build. Échec = avertissement + dégradation. */
export function chargerLessonIndex(fetchImpl: typeof fetch = fetch): Promise<void> {
  if (donnees) return Promise.resolve();
  volEnCours ??= fetchImpl(CHEMIN_JSON_LECONS)
    .then((r) => {
      if (!r.ok) throw new Error(`HTTP ${r.status} pour ${CHEMIN_JSON_LECONS}`);
      return r.json();
    })
    .then((j) => definirLessonIndex(j as LessonIndexChunk[]))
    .catch((e: unknown) => {
      volEnCours = null; // une requête suivante pourra réessayer
      console.warn('[tuteur] index des leçons indisponible :', e);
    });
  return volEnCours;
}
