// writingProgress.ts — quels exercices l'élève a-t-il RÉDIGÉS ? (sprint 26)
//
// L'atelier (sprint 24) enregistre chaque brouillon sous la clé
// `kunz.bacTrainer.{ideaId}.{familyId}`. Cette information dormait dans le
// localStorage : rien, dans l'app, ne montrait à l'élève ce qu'il avait déjà
// traité. Or c'est la seule trace de PRODUCTION qu'il laisse — les capsules
// lues et les schémas refaits ne prouvent rien de comparable.
//
// Ce module lit ces clés, sans jamais en écrire : l'atelier reste seul
// responsable de la sauvegarde.

export const TRAINER_PREFIX = 'kunz.bacTrainer.';

/** Clé de brouillon → { ideaId, familyId }, ou null si la clé est étrangère. */
export function parseDraftKey(cle: string): { ideaId: string; familyId: string } | null {
  if (!cle.startsWith(TRAINER_PREFIX)) return null;
  const reste = cle.slice(TRAINER_PREFIX.length);
  const coupe = reste.indexOf('.');
  if (coupe <= 0 || coupe === reste.length - 1) return null;
  return { ideaId: reste.slice(0, coupe), familyId: reste.slice(coupe + 1) };
}

function lireCles(): string[] {
  try {
    return Object.keys(localStorage);
  } catch {
    return [];
  }
}

function contenu(cle: string): string {
  try {
    return localStorage.getItem(cle) ?? '';
  } catch {
    return '';
  }
}

/** Brouillons non vides, par exercice. */
export function draftsByIdea(): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const cle of lireCles()) {
    const parsed = parseDraftKey(cle);
    if (!parsed) continue;
    if (contenu(cle).trim() === '') continue;
    (out[parsed.ideaId] ??= []).push(parsed.familyId);
  }
  for (const k of Object.keys(out)) out[k].sort();
  return out;
}

/** L'élève a-t-il écrit au moins une réponse sur cet exercice ? */
export function hasDraft(ideaId: string): boolean {
  return (draftsByIdea()[ideaId] ?? []).length > 0;
}

/** Consignes rédigées pour un exercice. */
export function draftedFamilies(ideaId: string): string[] {
  return draftsByIdea()[ideaId] ?? [];
}

/** Exercices rédigés, ordre stable. */
export function writtenIdeaIds(): string[] {
  return Object.keys(draftsByIdea()).sort();
}

/** Nombre d'exercices rédigés et nombre total de réponses écrites. */
export function writingStats(): { exercices: number; reponses: number } {
  const par = draftsByIdea();
  return {
    exercices: Object.keys(par).length,
    reponses: Object.values(par).reduce((s, v) => s + v.length, 0),
  };
}
