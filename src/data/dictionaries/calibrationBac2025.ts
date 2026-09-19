// calibrationBac2025.ts
// NOTATION CALIBRÉE du correcteur (évaluation 80 copies bac2025 SVT, vérité terrain).
//
// RÈGLE MOTEUR (évaluation du 2026-09-16) :
//   · La NOTE = calibration linéaire de la couverture mots-clés PAR EXERCICE
//     (pts ≈ a·cov + b, ajustée sur les 80 copies, clampée [0, maxPts]) —
//     P3-full : r=0.86 · ρ=0.87 · MAE=2.03/20 · biais=0 ; validation croisée
//     4-fold honnête : MAE=2.04 · F1=0.91 · rappel 1.0 (aucun élève méritant raté) ;
//   · le BARÈME AUTOMATIQUE (bac2025 Ex1) = crédit automatique affiché en
//     DIAGNOSTIC — JAMAIS sommé ni substitué à la note (r=0 contre la vérité
//     terrain : prédicteur nul, plafond trop bas 1.75/3 pts) ;
//   · les SEUILS de couverture (SEUIL_KEYWORDS/DEFAUT) et les ENTITÉS =
//     diagnostic pédagogique — jamais convertis en points.
//
// R4 — recalibrage : exécuter `npx tsx scripts/recalibrer-copiees.ts` sur un
// échantillon de vraies copies corrigées par un humain (CSV), puis remplacer
// les constantes ci-dessous par le fit obtenu (le fit actuel dépend du
// générateur du corpus — voir analyse 80 copies, 11 faux positifs N°5–13).

import { evaluerBareme } from './baremeCorrecteur';
import { evaluerEntites, type EntiteDetectee } from './dictionnaireCorrecteur';
import { evaluerReponseKeywords } from '../../correcteurV1';

export interface GroupeCalibre {
  sujet: 1 | 2;
  exercice: 1 | 2 | 3;
  uniteId: number;
  maxPts: number;
  /** Pente du fit couverture→note (moindres carrés, 80 copies). */
  a: number;
  /** Ordonnée à l'origine. */
  b: number;
}

// Coefficients du fit couverture→note (voir en-tête : métriques P3).
export const CALIBRATION_BAC2025: GroupeCalibre[] = [
  { sujet: 1, exercice: 1, uniteId: 1, maxPts: 5, a: 26.458178, b: -2.070632 },
  { sujet: 1, exercice: 2, uniteId: 6, maxPts: 7, a: 76.03413, b: 1.482935 },
  { sujet: 1, exercice: 3, uniteId: 5, maxPts: 8, a: 100.974026, b: 3.162338 },
  { sujet: 2, exercice: 1, uniteId: 7, maxPts: 5, a: 31.2375, b: -1.1875 },
  { sujet: 2, exercice: 2, uniteId: 3, maxPts: 7, a: 95.717277, b: -1.633508 },
  { sujet: 2, exercice: 3, uniteId: 4, maxPts: 8, a: 197.342342, b: -1.369369 }, // refit post-R3 (banque U4 restructurée, r_kw 0.35→0.45)
];

/** Unité du correcteur correspondant à (sujet, exercice) ; null hors périmètre. */
export function uniteDeGroupe(sujet: 1 | 2, exercice: 1 | 2 | 3): GroupeCalibre | null {
  return CALIBRATION_BAC2025.find((g) => g.sujet === sujet && g.exercice === exercice) ?? null;
}

export interface ResultatNotation {
  uniteId: number;
  mode: 'calibre';
  /** Couverture mots-clés de la réponse (0..1). */
  couverture: number;
  /** Note calibrée, clampée [0, maxPts]. */
  points: number;
  maxPts: number;
}

/**
 * Note pure depuis la couverture seule (R2) : N'utilise NI le barème automatique,
 * NI les seuils bruts — la note vient exclusivement de la calibration.
 */
export function noterDepuisCouverture(
  couverture: number,
  sujet: 1 | 2,
  exercice: 1 | 2 | 3
): ResultatNotation {
  const g = uniteDeGroupe(sujet, exercice);
  if (!g) return { uniteId: 0, mode: 'calibre', couverture, points: 0, maxPts: 0 };
  // RÈGLE MOTEUR : une réponse sans AUCUN mot-clé de l'unité = 0 point.
  // (les interceptes b>0 du fit encodent la générosité du correcteur humain du
  // corpus sur les copies à faible substance — ils ne doivent jamais payer une
  // copie vide ; le saut à la première occurrence de mot-clé reproduit le
  // « crédit d'effort » constaté chez le correcteur humain : décile 2 ≈ 3,3 pts).
  if (couverture === 0) {
    return { uniteId: g.uniteId, mode: 'calibre', couverture, points: 0, maxPts: g.maxPts };
  }
  const brut = g.a * couverture + g.b;
  return {
    uniteId: g.uniteId,
    mode: 'calibre',
    couverture,
    points: Math.min(g.maxPts, Math.max(0, brut)),
    maxPts: g.maxPts,
  };
}



/** Questions du barème officiel bac2025 (Ex1 uniquement — build). */
const QUESTIONS_EX1_BAC2025: Record<1 | 2, string[]> = {
  1: ['bac2025_S1/S1-Ex1/Q1', 'bac2025_S1/S1-Ex1/Q2'],
  2: ['bac2025_S2/S2-Ex1/Q1', 'bac2025_S2/S2-Ex1/Q2'],
};

export interface NoteCalibree extends ResultatNotation {
  sujet: 1 | 2;
  exercice: 1 | 2 | 3;
  /** Couche DICTIONNAIRE : entités officiel+verifie reconnues (pédagogique). */
  entitesReconnues: EntiteDetectee[];
  /** Mots-clés trouvés / manquants (pédagogique). */
  trouves: string[];
  manquants: string[];
  /** La couverture franchit le seuil diagnostic ? (jamais converti en points). */
  passeDiagnostic: boolean;
  diagnosticBareme: {
    /** Crédit automatique du barème officiel (Ex1) — JAMAIS une note. */
    creditAuto: number | null;
    /** Plafond automatiquement créditable par signature (items auto). */
    plafondAuto: number | null;
  } | null;
}

/**
 * Évalue UNE réponse d'exercice bac2025 : note calibrée + couches de diagnostic.
 * RÈGLE MOTEUR : `points` ne dépend QUE de la couverture via la calibration ;
 * le crédit du barème officiel reste affiché en diagnostic (jamais additionné).
 */
export function noterExerciceCalibre(
  reponse: string,
  sujet: 1 | 2,
  exercice: 1 | 2 | 3
): NoteCalibree {
  const g = uniteDeGroupe(sujet, exercice);
  if (!g) throw new Error(`groupe bac2025 inconnu : sujet ${sujet} exercice ${exercice}`);
  const kw = evaluerReponseKeywords(reponse, g.uniteId);
  const base = noterDepuisCouverture(kw.couverture, sujet, exercice);
  const ent = evaluerEntites(reponse, g.uniteId);

  let diagnosticBareme: NoteCalibree['diagnosticBareme'] = null;
  if (exercice === 1) {
    let credit = 0;
    let plafond = 0;
    for (const qid of QUESTIONS_EX1_BAC2025[sujet]) {
      const res = evaluerBareme(reponse, qid);
      if (!res) continue;
      credit += res.pointsObtenus;
      plafond += res.verdicts
        .filter((v) => v.mode === 'auto')
        .reduce((s, v) => s + v.item.points, 0);
    }
    diagnosticBareme = {
      creditAuto: Math.round(credit * 100) / 100,
      plafondAuto: Math.round(plafond * 100) / 100,
    };
  }

  return {
    sujet,
    exercice,
    uniteId: g.uniteId,
    mode: 'calibre',
    couverture: kw.couverture,
    points: Math.round(base.points * 100) / 100,
    maxPts: g.maxPts,
    entitesReconnues: ent.trouvees,
    trouves: kw.trouves,
    manquants: kw.manquants,
    passeDiagnostic: kw.passe,
    diagnosticBareme,
  };
}

/** Note une copie complète (3 exercices) → total /20 + détail par exercice. */
export function noterCopieCalibree(
  sections: readonly [string, string, string],
  sujet: 1 | 2
): { total: number; exercices: NoteCalibree[] } {
  const exercices = ([1, 2, 3] as const).map((ex) =>
    noterExerciceCalibre(sections[ex - 1] ?? '', sujet, ex)
  );
  const total = exercices.reduce((s, e) => s + e.points, 0);
  return { total: Math.round(total * 100) / 100, exercices };
}

