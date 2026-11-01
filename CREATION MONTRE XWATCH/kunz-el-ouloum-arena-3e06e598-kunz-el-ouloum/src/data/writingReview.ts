// writingReview.ts — que révèlent les réponses que l'élève a réellement
// écrites ? (sprint 27)
//
// Les brouillons de l'atelier sont, à ce stade, la seule production PERSONNELLE
// de l'élève dans l'app : tout le reste (capsules lues, schémas refaits, QCM)
// mesure de la reconnaissance, pas de la rédaction. Ce module les relit et en
// tire deux choses que personne ne lui dit autrement :
//
//   1. l'état de chaque réponse écrite (quelles exigences de forme sont
//      satisfaites, lesquelles manquent) ;
//   2. son PROFIL D'ERREURS : parmi toutes ses réponses, quelles exigences
//      échouent le plus souvent. « Tu oublies la conclusion dans 4 réponses
//      sur 5 » est une information qu'aucun corrigé ne donne.
//
// Comme `writingProgress.ts`, ce module ne fait que LIRE. Et comme
// `answerStructureCheck.ts`, il ne juge que la forme : aucun score de fond.

import { IDEA_BY_ID, type BacExerciseIdea } from './bacSessionIndex';
import { VERB_FAMILY_BY_ID } from './verbDemands';
import { structureVerdict, type StructureCheck } from './answerStructureCheck';
import { TRAINER_PREFIX, parseDraftKey } from './writingProgress';

export interface DraftReview {
  ideaId: string;
  familyId: string;
  /** Exercice concerné, absent si l'identifiant n'existe plus. */
  idea?: BacExerciseIdea;
  /** Nom de la consigne rédigée. */
  familleAr: string;
  /** Début du texte, pour reconnaître son brouillon sans le déplier. */
  extrait: string;
  motsEcrits: number;
  satisfaits: number;
  total: number;
  /** Exigences non satisfaites (hors vigilances). */
  manquants: StructureCheck[];
  /** Alertes de vigilance déclenchées. */
  alertes: StructureCheck[];
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

function extraitDe(texte: string, max = 90): string {
  const propre = texte.trim().replace(/\s+/g, ' ');
  return propre.length > max ? `${propre.slice(0, max - 1)}…` : propre;
}

/**
 * Relit tous les brouillons non vides.
 * Ordre : les réponses les plus incomplètes d'abord — c'est là qu'il reste du
 * travail —, puis par exercice pour rester déterministe.
 */
export function reviewDrafts(): DraftReview[] {
  const revues: DraftReview[] = [];
  for (const cle of lireCles()) {
    const parsed = parseDraftKey(cle);
    if (!parsed) continue;
    const texte = contenu(cle);
    if (texte.trim() === '') continue;

    const verdict = structureVerdict(parsed.familyId, texte);
    if (!verdict) continue;

    revues.push({
      ideaId: parsed.ideaId,
      familyId: parsed.familyId,
      idea: IDEA_BY_ID[parsed.ideaId],
      familleAr: VERB_FAMILY_BY_ID[parsed.familyId]?.titleAr ?? parsed.familyId,
      extrait: extraitDe(texte),
      motsEcrits: texte.trim().split(/\s+/).filter(Boolean).length,
      satisfaits: verdict.satisfaits,
      total: verdict.total,
      manquants: verdict.checks.filter((c) => c.nature === 'attendu' && !c.ok),
      alertes: verdict.alertes,
    });
  }
  return revues.sort(
    (a, b) =>
      b.manquants.length - a.manquants.length ||
      a.ideaId.localeCompare(b.ideaId) ||
      a.familyId.localeCompare(b.familyId),
  );
}

export interface WeakPoint {
  /** Identifiant du contrôle (ex. « conclusion »). */
  checkId: string;
  labelAr: string;
  hintAr: string;
  /** Nombre de réponses où l'exigence manque. */
  echecs: number;
  /** Nombre de réponses où l'exigence s'appliquait. */
  occasions: number;
  nature: StructureCheck['nature'];
}

/**
 * Profil d'erreurs : les exigences les plus souvent ratées, toutes réponses
 * confondues. Un contrôle qui ne s'est présenté qu'une fois n'est pas un
 * profil — d'où `occasions`, affiché à côté, pour que l'élève juge lui-même.
 */
export function weakestChecks(): WeakPoint[] {
  const acc = new Map<string, WeakPoint>();
  for (const cle of lireCles()) {
    const parsed = parseDraftKey(cle);
    if (!parsed) continue;
    const texte = contenu(cle);
    if (texte.trim() === '') continue;
    const verdict = structureVerdict(parsed.familyId, texte);
    if (!verdict) continue;

    for (const c of verdict.checks) {
      const ligne =
        acc.get(c.id) ??
        { checkId: c.id, labelAr: c.labelAr, hintAr: c.hintAr, echecs: 0, occasions: 0, nature: c.nature };
      ligne.occasions += 1;
      if (!c.ok) ligne.echecs += 1;
      acc.set(c.id, ligne);
    }
  }
  return Array.from(acc.values())
    .filter((w) => w.echecs > 0)
    .sort((a, b) => b.echecs - a.echecs || a.checkId.localeCompare(b.checkId));
}

export interface WritingReport {
  reponses: number;
  exercices: number;
  motsEcrits: number;
  /** Exigences satisfaites / exigences rencontrées, toutes réponses confondues. */
  satisfaits: number;
  total: number;
  points: WeakPoint[];
}

/** Bilan global de la production écrite. */
export function writingReport(): WritingReport {
  const revues = reviewDrafts();
  return {
    reponses: revues.length,
    exercices: new Set(revues.map((r) => r.ideaId)).size,
    motsEcrits: revues.reduce((s, r) => s + r.motsEcrits, 0),
    satisfaits: revues.reduce((s, r) => s + r.satisfaits, 0),
    total: revues.reduce((s, r) => s + r.total, 0),
    points: weakestChecks(),
  };
}

export { TRAINER_PREFIX };
