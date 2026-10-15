// phaseEleve.ts — LES PHASES, DÉDUITES ET JAMAIS DÉCLARÉES.
//
// Étape 3 du §9 de `docs/VISION_COACH_MORCHID_2026-10-15.md`. Le document est
// catégorique sur un point : « Aucune case à cocher, aucun questionnaire. La
// phase se CALCULE des entrées ci-dessus, et change toute seule. » Un élève ne
// déclare pas qu'il est en « consolidation » — il n'en sait rien, et s'il devait
// le choisir il se tromperait. On le lit dans ce qu'il fait.
//
// CE MODULE EST PUR : il reçoit un état, il rend une phase. Aucune horloge, aucun
// stockage, aucune écriture. C'est ce qui permet de vérifier chaque règle par un
// test au lieu de l'affirmer.
//
// ─────────────────────────────────────────────────────────────────────────────
// LES CINQ PHASES DU §5.B, ET COMMENT CHACUNE SE RECONNAÎT.
//
//   1. Jamais commencé   → rien produit                 → la porte des 2 minutes
//   2. Démarrage         → moins de 7 jours d'activité  → des victoires courtes
//   3. Installation      → une série existe             → protéger l'acquis
//   4. Consolidation     → verdicts moyen/fort          → espacement, erreurs
//   5. Sprint épreuve    → moins de 30 jours du BAC     → production chronométrée
//   ✦ Creux (transversal) → ≥ 3 jours sans rien          → reprise minimale
//
// L'ORDRE DE TEST EST DÉLIBÉRÉ, et deux choix méritent d'être justifiés :
//
//  · LA PHASE 1 PRIME SUR LE SPRINT. À vingt jours du BAC, un élève qui n'a
//    jamais rien produit n'est pas en « sprint » : lui proposer une épreuve
//    chronométrée serait absurde et humiliant. La porte des deux minutes reste la
//    seule entrée honnête, quelle que soit la date. C'est la règle du §5.B
//    (« la porte des 2 minutes, RIEN D'AUTRE ») appliquée sans exception.
//
//  · SANS VERDICTS, ON NE DÉCLARE PAS LA CONSOLIDATION. La phase 4 se reconnaît à
//    des verdicts moyen/fort. Tant que la famille « compétence » n'est pas
//    chargée — c'est le cas de la bulle, qui ne peut pas payer 286 Ko de
//    séquences de leçons — on ne peut pas la constater. On retombe alors sur la
//    phase 3, dont le besoin (« protéger ce qui est construit ») est le plus
//    prudent et n'est jamais faux. Inventer une consolidation qu'on n'a pas
//    mesurée serait exactement le mensonge que ce projet refuse partout ailleurs.
//
//  · LE CREUX NE FAIT JAMAIS DESCENDRE DE PHASE (§5.B, règle de fond) : « Un
//    creux n'est pas une régression, c'est une parenthèse. L'état reprend où il
//    était. » C'est vrai par construction ici — la déduction ne regarde que le
//    cumul et l'horizon, jamais la fraîcheur de la dernière activité — et c'est
//    vérifié par un test, pour que personne ne « répare » cette apparente
//    incohérence en ajoutant un retour en arrière.

import type { EtatEleve } from './etatEleve';

export type NiveauPhase = 1 | 2 | 3 | 4 | 5;

/**
 * Ce dont l'élève a besoin — un CODE, pas une phrase.
 *
 * Un code et non un texte : les messages du guide vivent dans leur propre
 * fichier (`data/capitaine.ts`, `data/conseilsRubrique.ts`) et sont soumis à la
 * contrainte « aucune invention de contenu ». Dupliquer ici une phrase arabe
 * créerait un second endroit à corriger le jour où le ton change.
 */
export type BesoinPhase =
  /** 1 — la porte des 2 minutes, rien d'autre. */
  | 'porte_2_minutes'
  /** 2 — des victoires courtes et visibles. */
  | 'victoires_courtes'
  /** 3 — protéger ce qui est construit, sans intensifier. */
  | 'proteger_acquis'
  /** 4 — espacement, fermeture d'erreurs, transfert. */
  | 'espacement_fermeture'
  /** 5 — production chronométrée, plus aucune découverte. */
  | 'production_chronometree';

export interface PhaseEleve {
  niveau: NiveauPhase;
  besoin: BesoinPhase;
  /**
   * Creux transversal : au moins 3 jours sans rien produit.
   *
   * Ce n'est PAS un niveau et ce n'est pas une régression : c'est une parenthèse.
   * Le seul besoin qu'il ajoute est celui d'une reprise MINIMALE — « jamais de
   * rattrapage », dit le §5.B. Un élève qui revient après huit jours n'a pas
   * besoin d'un plan de rattrapage : il a besoin de recommencer petit.
   */
  creux: boolean;
}

/** À moins de 30 jours du BAC, on est en sprint (§5.B, phase 5). */
export const JOURS_SPRINT_EPREUVE = 30;

/** Le seuil de sortie du démarrage : une semaine d'activité accumulée (§5.B). */
export const JOURS_DEMARRAGE = 7;

/** À partir de trois jours sans rien, on est en creux (§5.B, transversal). */
export const JOURS_CREUX = 3;

const BESOIN_PAR_NIVEAU: Record<NiveauPhase, BesoinPhase> = {
  1: 'porte_2_minutes',
  2: 'victoires_courtes',
  3: 'proteger_acquis',
  4: 'espacement_fermeture',
  5: 'production_chronometree',
};

/** Une majorité de verdicts moyen ou fort — le critère de la phase 4. */
function verdictsConsolides(etat: EtatEleve): boolean {
  if (!etat.competence.chargee) return false;
  const verdicts = Object.values(etat.competence.verdicts);
  if (verdicts.length === 0) return false;
  const solides = verdicts.filter((v) => v === 'moyen' || v === 'fort').length;
  return solides * 2 >= verdicts.length;
}

/**
 * La phase de l'élève, déduite de son état. Première règle vérifiée = phase.
 *
 * Le creux est calculé séparément : il se superpose à n'importe quelle phase.
 */
export function deduirePhase(etat: EtatEleve): PhaseEleve {
  const creux =
    etat.temps.joursSansTravail !== null && etat.temps.joursSansTravail >= JOURS_CREUX;

  const niveau = deduireNiveau(etat);
  return { niveau, besoin: BESOIN_PAR_NIVEAU[niveau], creux };
}

function deduireNiveau(etat: EtatEleve): NiveauPhase {
  // 1 — RIEN PRODUIT. `joursSansTravail === null` veut dire « jamais rien
  // produit » : c'est un fait, pas une inconnue (une inconnue vaudrait `null`
  // aussi, mais l'état la traite déjà comme un silence — voir etatEleve).
  if (etat.temps.joursSansTravail === null && etat.assiduite.cumulJours === 0) return 1;

  // 5 — SPRINT : la date du BAC devient une entrée de décision.
  const jours = etat.horizon.joursAvantBac;
  if (typeof jours === 'number' && Number.isFinite(jours) && jours <= JOURS_SPRINT_EPREUVE) {
    return 5;
  }

  // 2 — DÉMARRAGE : moins d'une semaine d'activité accumulée.
  if (etat.assiduite.cumulJours < JOURS_DEMARRAGE) return 2;

  // 4 — CONSOLIDATION : seulement si on peut la constater.
  if (verdictsConsolides(etat)) return 4;

  // 3 — INSTALLATION : ce qui reste, c'est-à-dire un élève qui a déjà construit
  // quelque chose et qu'il faut protéger plutôt qu'intensifier.
  return 3;
}
