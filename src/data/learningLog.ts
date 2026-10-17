// learningLog.ts — la trace qui permet de dire « je progresse », et pas
// seulement « j'ai travaillé » (sprint 62).
//
// Ce que l'application mesurait jusqu'ici
// ---------------------------------------
// XP, série de jours, minutes d'étude, nombre de questions faites, tâches
// cochées. Ce sont des mesures d'ACTIVITÉ. Elles disent qu'un élève a passé du
// temps ; elles ne disent pas qu'il écrit mieux qu'il y a trois semaines. Un
// élève peut cocher un plan entier et rédiger exactement les mêmes réponses
// incomplètes du premier au dernier jour.
//
// Ce que ce journal enregistre
// ----------------------------
// À chaque fois qu'une réponse est rédigée dans l'atelier, on garde une ligne :
// quand, sur quel exercice, quelle consigne, combien d'exigences de forme
// satisfaites sur combien, et la longueur écrite. Rien d'autre — pas le texte
// (il reste dans son brouillon), aucune donnée personnelle, rien qui sorte de
// l'appareil.
//
// De cette trace on peut enfin déduire une DÉRIVÉE : la même famille de
// consigne, rédigée deux semaines plus tard, est-elle mieux structurée ?
// C'est la seule question qui distingue l'apprentissage de l'occupation.

export const LEARNING_LOG_KEY = 'kunz.learningLog.v1';

/** Nombre maximal d'entrées conservées (les plus anciennes sont écartées). */
export const LOG_MAX = 400;

export interface LearningEntry {
  /** Date ISO courte (YYYY-MM-DD) — la granularité utile est le jour. */
  date: string;
  ideaId: string;
  familyId: string;
  /** Exigences de forme satisfaites. */
  satisfaits: number;
  /** Exigences applicables. */
  total: number;
  /** Mots écrits, indicateur d'effort (pas de qualité). */
  mots: number;
}

function lire(): LearningEntry[] {
  try {
    const brut = localStorage.getItem(LEARNING_LOG_KEY);
    if (!brut) return [];
    const parsed = JSON.parse(brut);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(estEntreeValide);
  } catch {
    return [];
  }
}

function estEntreeValide(e: unknown): e is LearningEntry {
  const x = e as Partial<LearningEntry>;
  return (
    typeof x?.date === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(x.date) &&
    typeof x.ideaId === 'string' &&
    x.ideaId.length > 0 &&
    typeof x.familyId === 'string' &&
    x.familyId.length > 0 &&
    typeof x.satisfaits === 'number' &&
    typeof x.total === 'number' &&
    x.total >= 0 &&
    x.satisfaits >= 0 &&
    x.satisfaits <= x.total &&
    typeof x.mots === 'number' &&
    x.mots >= 0
  );
}

/** Journal complet, du plus ancien au plus récent. */
export function readLearningLog(): LearningEntry[] {
  return lire();
}

/**
 * Enregistre une rédaction.
 *
 * Règle anti-gonflage : **une entrée par (jour, exercice, consigne)**. Un élève
 * qui ouvre dix fois le même brouillon dans la journée ne crée pas dix
 * preuves de progrès — la dernière version du jour remplace la précédente.
 */
export function recordWriting(entree: LearningEntry): void {
  if (!estEntreeValide(entree) || entree.total === 0) return;
  const journal = lire().filter(
    (e) =>
      !(e.date === entree.date && e.ideaId === entree.ideaId && e.familyId === entree.familyId),
  );
  journal.push(entree);
  const coupe = journal.slice(-LOG_MAX);
  try {
    localStorage.setItem(LEARNING_LOG_KEY, JSON.stringify(coupe));
  } catch {
    /* stockage plein : le journal est un confort, jamais un bloquant */
  }
}

export function clearLearningLog(): void {
  try {
    localStorage.removeItem(LEARNING_LOG_KEY);
  } catch {
    /* rien à faire */
  }
}

/** Date du jour au format du journal. */
export function aujourdHui(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}
