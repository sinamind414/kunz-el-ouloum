// src/lib/parcours/gestureRecallEngine.ts
// Audit 03102026, idée 1 — mettre les GESTES MIFTah dans la boucle de rappel.
//
// PROBLÈME VÉRIFIÉ :
//   grep -c "verb\|method\|MIFTAH" src/lib/parcours/parcoursPath.ts → 0
// PARCOURS_FLAT ne contient que des LEÇONS. Jamais un verbe, jamais un geste.
// Conséquence : l'élève valide le drill 12/12 une fois, puis la boucle de
// rappel espacée — le mécanisme même de l'assimilation durable — ne rejoue
// JAMAIS la méthode. Il réexécute « leçon 3 de l'unité 2 », pas « reconstruire
// la chaîne causale ». La méthode est apprise une fois, puis oubliée.
//
// SOLUTION :
//   Un second chemin court, calqué sur itemStatus()/markDone(), qui porte sur
//   les gestes eux-mêmes. Il s'additionne au parcours existant sans le toucher
//   (src/lib/parcours/nbaEngine.ts et parcoursPath.ts restent intacts).
//
// Choix de conception (RÉVISÉ le 15/10/2026) :
//   - l'espacement n'est PLUS une échelle fixe J+1 → J+3 → J+7 → J+14. Il est
//     calculé par l'algorithme SM-2 canonique (`src/lib/sm2.ts`), à partir du
//     signal de réussite ET de l'historique d'échecs du geste. Un geste qui a
//     raté trois fois ne revient pas au même rythme qu'un geste réussi du premier
//     coup : c'est le facteur de facilité qui porte cette différence.
//     Un geste s'installe toujours par passages rapprochés — la différence est
//     que l'algorithme décide À QUEL POINT ils se rapprochent.
//
//     LIMITE DITE FRANCHEMENT : le signal ici est BINAIRE (réussi / échoué), donc
//     la qualité vaut 4 ou 2, jamais 3 ou 5. L'adaptation passe par l'accumulation
//     des échecs (ease, lapses), pas par une notation fine. Les concepts, eux,
//     sont notés sur les preuves du texte (`spacedRecallPrompts`).
//   - un geste se rejoue TANT QUE son stage n'a pas atteint le palier final ;
//     une fois au palier, il reste dans la rotation d'entretien.
//   - hors quota journalier du parcours (les gestes sont courts, ≤ 3 min) : on
//     ne vole pas la place de la leçon, on occupe les interstices.

import { prochainEtatSm2, type EtatSm2 } from '../sm2';

/** Clé de stockage dédiée aux gestes (nomspacing → pas de collision avec le parcours). */
export const GESTURE_RECALL_KEY = 'kunz-gesture-recall-v1';

/** Les 4 gestes canoniques + STEP0 (référentiel MIFTAH_STEP_NAMES_AR). */
export const GESTURE_IDS = ['step0_comprendre', 'verb_agir', 'verb_prouver', 'verb_relier', 'verb_conclure'] as const;
export type GestureId = (typeof GESTURE_IDS)[number];

export interface GestureRecallState {
  /** SOURCE DE VÉRITÉ : l'état SM-2 de chaque geste (facilité, intervalle, échéance). */
  etat: Record<string, EtatSm2>;
  /** Nombre de rappels réussis consécutifs — DÉRIVÉ de `etat`, gardé pour l'affichage. */
  stage: Record<string, number>;
  /** Prochaine échéance au format todayKey() (YYYY-MM-DD) — DÉRIVÉE de `etat`. */
  due: Record<string, string>;
  /** dateISO du dernier rappel réussi. */
  lastOk: Record<string, string>;
}

/**
 * Palier au-delà duquel un geste est tenu pour installé (entretien).
 * AVANT : c'était le fait d'avoir atteint le stage 3 de l'échelle fixe.
 * Désormais c'est l'INTERVALLE RÉEL qui le dit : un geste espacé de deux
 * semaines est installé, quelle que soit la façon dont il y est parvenu.
 */
export const SEUIL_ENTRETIEN_JOURS = 14;

/**
 * Paliers de l'ANCIENNE échelle, conservés UNIQUEMENT pour relire les mémoires
 * écrites avant le 15/10/2026. Ils ne servent plus à ordonnancer quoi que ce soit :
 * un `stage` relu est converti en état SM-2 au premier chargement, puis oublié.
 */
const PALIERS_LEGACY: readonly number[] = [1, 3, 7, 14];

export function etatGestesParDefaut(): GestureRecallState {
  return { etat: {}, stage: {}, due: {}, lastOk: {} };
}

/** --- Persistance (même patron que loadParcours/saveParcours) --- */

export function loadGestureRecall(): GestureRecallState {
  try {
    const raw = window.localStorage.getItem(GESTURE_RECALL_KEY);
    const j = raw ? JSON.parse(raw) : null;
    if (!j || typeof j !== 'object') return etatGestesParDefaut();
    const etat: Record<string, EtatSm2> = {};
    if (j.etat && typeof j.etat === 'object') {
      for (const [id, v] of Object.entries(j.etat as Record<string, Partial<EtatSm2>>)) {
        if (v && typeof v.ease === 'number' && typeof v.dueAt === 'number') {
          etat[id] = {
            ease: v.ease,
            intervalDays: typeof v.intervalDays === 'number' ? v.intervalDays : 1,
            dueAt: v.dueAt,
            reps: typeof v.reps === 'number' ? v.reps : 0,
            lapses: typeof v.lapses === 'number' ? v.lapses : 0,
          };
        }
      }
    }
    const stage: Record<string, number> = j.stage && typeof j.stage === 'object' ? j.stage : {};
    const due: Record<string, string> = j.due && typeof j.due === 'object' ? j.due : {};

    // MIGRATION des mémoires antérieures au 15/10/2026 : elles ne portaient
    // qu'un stage et une date. On reconstruit l'état SM-2 correspondant pour
    // que ces gestes continuent d'être proposés au bon moment, sans repartir
    // de zéro (ce qui aurait fait tout réviser d'un coup).
    for (const [id, stade] of Object.entries(stage)) {
      if (etat[id]) continue;
      const jours = PALIERS_LEGACY[Math.max(0, Math.min(stade, PALIERS_LEGACY.length - 1))] ?? 1;
      const dateDue = due[id] ? new Date(`${due[id]}T00:00:00`) : new Date();
      const dueAt = Number.isNaN(dateDue.getTime()) ? Date.now() : dateDue.getTime();
      etat[id] = { ease: 2.5, intervalDays: jours, dueAt, reps: stade, lapses: 0 };
    }

    return { etat, stage, due, lastOk: j.lastOk && typeof j.lastOk === 'object' ? j.lastOk : {} };
  } catch {
    return etatGestesParDefaut();
  }
}

export function saveGestureRecall(state: GestureRecallState): void {
  try {
    window.localStorage.setItem(GESTURE_RECALL_KEY, JSON.stringify(state));
  } catch {
    /* stockage indisponible — offline first, on garde l'état en mémoire */
  }
}

function mutate(fn: (s: GestureRecallState) => void): void {
  const s = loadGestureRecall();
  fn(s);
  saveGestureRecall(s);
}

/** --- Moteur de rappel --- */

/**
 * Le geste le plus urgent à rejouer, ou null si aucun n'est échu.
 * Priorise le stage le plus bas (un geste jeune se rejoue plus souvent),
 * puis l'échéance la plus ancienne — même logique que nbaEngine étape 2.
 */
export function nextDueGesture(state: GestureRecallState = loadGestureRecall()): GestureId | null {
  const today = todayKey();
  const due = GESTURE_IDS.filter((id) => {
    const d = state.due[id];
    return d && d <= today;
  });
  if (due.length === 0) return null;
  // stage le plus bas d'abord (le geste le moins installé est le plus urgent),
  // puis l'échéance la plus ancienne pour la fraîcheur.
  due.sort((a, b) => {
    const sa = state.stage[a] ?? 0;
    const sb = state.stage[b] ?? 0;
    if (sa !== sb) return sa - sb;
    return (state.due[a] ?? '').localeCompare(state.due[b] ?? '');
  });
  return due[0];
}

/**
 * Enregistre un rappel de geste RÉUSSI et planifie la prochaine échéance par
 * SM-2. La qualité vaut 4 : le geste a été rejoué correctement, sans que
 * l'interface permette de dire « facile » ou « difficile » (voir la limite
 * annoncée dans l'en-tête — le signal des gestes est binaire).
 */
export function markGestureRecallOk(id: GestureId, now: number = Date.now()): void {
  mutate((s) => {
    const suivant = prochainEtatSm2(s.etat[id] ?? null, 4, now, { apresEchec: 'lendemain' });
    s.etat[id] = suivant;
    s.stage[id] = suivant.reps;
    s.due[id] = todayKey(new Date(suivant.dueAt));
    s.lastOk[id] = todayKey(new Date(now));
  });
}

/**
 * Rappelle un geste échoué : on remet le stage à 0 (retour à J+1) —
 * la pédagogie de la boucle espacée : un échec réinitialise le cycle.
 * Miroir de 'fragile' côté parcours (SEUIL_FRAGILE) mais par geste.
 */
export function markGestureRecallFailed(id: GestureId, now: number = Date.now()): void {
  mutate((s) => {
    const suivant = prochainEtatSm2(s.etat[id] ?? null, 2, now, { apresEchec: 'lendemain' });
    s.etat[id] = suivant;
    s.stage[id] = suivant.reps; // 0
    s.due[id] = todayKey(new Date(suivant.dueAt));
  });
}

/** Stage d'un geste, pour afficher la progression (ceinture) à l'élève. */
export function gestureStage(state: GestureRecallState, id: GestureId): number {
  return state.etat?.[id]?.reps ?? state.stage[id] ?? 0;
}

/** Le geste est-il installé (rappel entretenu) ? C'est l'INTERVALLE qui répond. */
export function gestureMastered(state: GestureRecallState, id: GestureId): boolean {
  const intervalle = state.etat?.[id]?.intervalDays ?? 0;
  return intervalle >= SEUIL_ENTRETIEN_JOURS;
}

/** Intervalle courant d'un geste, en jours (0 s'il n'a jamais été révisé). */
export function gestureIntervalleJours(state: GestureRecallState, id: GestureId): number {
  return state.etat?.[id]?.intervalDays ?? 0;
}

// --- jonction idée 4 (matrice Geste × Chapitre) ---
// Quand un geste est dû, on le rejoue dans un AUTRE chapitre que celui de la
// première acquisition : c'est le transfert. Sans matrice, le rappel rejouait
// l'exercice d'origine — de la répétition, pas du transfert.
import { GESTURE_CHAPTER_MATRIX, nextTransferForGesture } from '../../data/gestureChapterMatrix';

export interface DueGestureWithTransfer {
  id: GestureId;
  /** Unité du chapitre dans lequel rejouer le geste (transfert). */
  transferUnitId: number | null;
  /** Ancrage concret dans ce chapitre. */
  bacPromptAr: string | null;
  supportAr: string | null;
}

/**
 * Le geste dû, enrichi de son ancrage de transfert dans un autre chapitre.
 * Renvoie null si aucun geste n'est échu.
 */
export function nextDueGestureWithTransfer(
  state: GestureRecallState = loadGestureRecall(),
): DueGestureWithTransfer | null {
  const id = nextDueGesture(state);
  if (id === null) return null;
  const cell = nextTransferForGesture(id, 1);
  return {
    id,
    transferUnitId: cell ? cell.unitId : null,
    bacPromptAr: cell ? cell.anchor.bacPromptAr : null,
    supportAr: cell ? cell.anchor.supportAr : null,
  };
}

/**
 * Le geste couvre-t-il au moins deux chapitres (transfert possible) ?
 * Sert à signaler à l'élève que le geste est transversal, pas propriété d'un cours.
 */
export function gestureIsTransversal(state: GestureRecallState, id: GestureId): boolean {
  return GESTURE_CHAPTER_MATRIX.filter((c) => c.gestureId === id).length >= 2;
}

// --- utilitaires (doublons volontaires et minimes de parcoursProgress pour
//     garder ce module autonome — pas d'import cyclique vers le parcours) ---

function todayKey(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// `addDays` a disparu le 15/10/2026 : c'est SM-2 qui calcule les échéances, en
// millisecondes (`dueAt`), et plus une échelle de jours ajoutée à une date.
