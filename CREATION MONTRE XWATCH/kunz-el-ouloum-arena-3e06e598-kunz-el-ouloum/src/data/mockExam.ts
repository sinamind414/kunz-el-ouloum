// mockExam.ts — composer un sujet blanc à partir d'exercices RÉELLEMENT tombés
// (sprint 41).
//
// L'app possède trois BAC blancs écrits à la main (`bacExam.ts`). Le corpus en
// contient désormais 59 vrais exercices, répartis sur dix sessions : de quoi
// composer des sujets d'entraînement qui respectent la structure officielle
// sans inventer une ligne d'énoncé.
//
// Ce module ne fabrique PAS de contenu : il SÉLECTIONNE trois idées existantes
// et les présente dans l'ordre du sujet officiel. L'élève travaille ensuite
// chaque exercice dans l'atelier (supports réels, consignes réelles).
//
// Règles de composition, toutes testées :
//   1. barème officiel : exercice 1 = 5 pts, exercice 2 = 7 pts, exercice 3 = 8 pts ;
//   2. trois unités PORTEUSES distinctes — un sujet ne teste jamais trois fois
//      la même unité ;
//   3. trois sessions distinctes, pour éviter de rejouer un sujet entier ;
//   4. tirage DÉTERMINISTE à partir d'un numéro : le même numéro donne le même
//      sujet sur tous les appareils (un professeur peut dire « faites le
//      sujet 7 ») ;
//   5. priorité aux unités qui pèsent le plus à l'examen, sans exclure les
//      autres — un sujet blanc qui ne ferait jamais tomber la géologie
//      mentirait sur l'épreuve.

import { BAC_IDEAS, unitPressure, type BacExerciseIdea } from './bacSessionIndex';

export interface MockExam {
  /** Numéro du sujet : même numéro ⇒ même sujet. */
  numero: number;
  exercices: BacExerciseIdea[];
  /** 20 par construction. */
  totalPoints: number;
  /** Durée officielle de l'épreuve, en minutes. */
  dureeMinutes: number;
  unitesPortees: number[];
  sessions: number[];
}

/** Durée officielle : 4 h 30. */
export const DUREE_EPREUVE_MINUTES = 270;

/** Générateur pseudo-aléatoire déterministe (xorshift 32 bits). */
function suiteDeterministe(graine: number): () => number {
  let etat = (graine * 2654435761) >>> 0 || 1;
  return () => {
    etat ^= etat << 13;
    etat >>>= 0;
    etat ^= etat >> 17;
    etat ^= etat << 5;
    etat >>>= 0;
    return etat / 0xffffffff;
  };
}

/** Poids de tirage d'une unité : sa pression mesurée, plancher à 1. */
function poidsUnites(): Map<number, number> {
  const out = new Map<number, number>();
  for (const p of unitPressure()) out.set(p.unitId, Math.max(1, p.pointsPrincipaux));
  return out;
}

/** Tirage pondéré sans remise dans une liste d'idées. */
function tirer(
  candidats: BacExerciseIdea[],
  poids: Map<number, number>,
  alea: () => number,
): BacExerciseIdea | null {
  if (candidats.length === 0) return null;
  const total = candidats.reduce((s, i) => s + (poids.get(i.unitIds[0]) ?? 1), 0);
  let seuil = alea() * total;
  for (const idee of candidats) {
    seuil -= poids.get(idee.unitIds[0]) ?? 1;
    if (seuil <= 0) return idee;
  }
  return candidats[candidats.length - 1];
}

/**
 * Compose le sujet blanc numéro `numero`.
 * Déterministe : deux appels avec le même numéro renvoient le même sujet.
 */
export function composeMockExam(numero: number): MockExam {
  const n = Math.max(1, Math.round(numero));
  const alea = suiteDeterministe(n);
  const poids = poidsUnites();

  const exercices: BacExerciseIdea[] = [];
  const unitesPrises = new Set<number>();
  const sessionsPrises = new Set<number>();

  for (const points of [5, 7, 8] as const) {
    // Ordre stable avant tirage : le hasard vient de la graine, pas de l'ordre
    // de déclaration des idées.
    const candidats = BAC_IDEAS.filter(
      (i) =>
        i.points === points &&
        !unitesPrises.has(i.unitIds[0]) &&
        !sessionsPrises.has(i.year),
    ).sort((a, b) => a.id.localeCompare(b.id));

    // Repli si les contraintes ne laissent rien : on relâche la session, puis
    // l'unité — plutôt qu'un sujet incomplet.
    const secours = BAC_IDEAS.filter(
      (i) => i.points === points && !unitesPrises.has(i.unitIds[0]),
    ).sort((a, b) => a.id.localeCompare(b.id));
    const dernierRecours = BAC_IDEAS.filter((i) => i.points === points).sort((a, b) =>
      a.id.localeCompare(b.id),
    );

    const choisi =
      tirer(candidats, poids, alea) ??
      tirer(secours, poids, alea) ??
      tirer(dernierRecours, poids, alea);
    if (!choisi) continue;

    exercices.push(choisi);
    unitesPrises.add(choisi.unitIds[0]);
    sessionsPrises.add(choisi.year);
  }

  return {
    numero: n,
    exercices,
    totalPoints: exercices.reduce((s, i) => s + i.points, 0),
    dureeMinutes: DUREE_EPREUVE_MINUTES,
    unitesPortees: exercices.map((i) => i.unitIds[0]),
    sessions: exercices.map((i) => i.year),
  };
}

/** Numéro du jour : un sujet par journée, identique pour toute une classe. */
export function numeroDuJour(date = new Date()): number {
  const jours = Math.floor(date.getTime() / 86_400_000);
  return (jours % 200) + 1;
}
