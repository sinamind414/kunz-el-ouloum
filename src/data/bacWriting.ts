// bacWriting.ts — quelles consignes un exercice donné demande-t-il ?
//
// Extrait du composant `BacIdeaTrainer` au sprint 25 : le plan de révision a
// besoin de la même information pour annoncer « écris la réponse de la
// consigne X », et un module de données ne doit pas importer un composant.

import type { BacExerciseIdea } from './bacSessionIndex';
import { classifyVerb } from './verbDemands';

/** Familles de consignes réellement demandées par cet exercice, sans doublon. */
export function famillesDemandeesParIdee(idea: BacExerciseIdea): string[] {
  const vues: string[] = [];
  for (const v of idea.verbsAr) {
    const f = classifyVerb(v);
    if (f && !vues.includes(f.id)) vues.push(f.id);
  }
  return vues;
}
