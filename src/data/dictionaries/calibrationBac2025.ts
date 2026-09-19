// calibrationBac2025.ts — NOTATION PAR ATTENDUS OBLIGATOIRES (Pierre 2, R6).
//
// HISTORIQUE : v1 notait couverture-banque-d'unité → fit linéaire (a·cov+b)
// ajusté sur 80 copies (r=0.86 global, mais S2-Ex3 r=0.45, interceptes
// généreux, saturation 3-14 mots-clés — audit C1/C4). Ce chemin
// (`noterDepuisCouverture`) reste exporté en LEGACY ; ses constantes étaient
// ajustées sur l'ANCIEN dénominateur et ne peuvent plus gouverner la note.
//
// RÈGLE MOTEUR ACTUELLE (Pierre 2 — audit §5.1) :
//   · la note se calcule EXCLUSIVEMENT contre les attendus officiels de la
//     question (attendusBac2025.ts — sources : build prouvé fidèle + corrigé
//     ministériel 2025) : plus JAMAIS la banque d'unité en dénominateur ;
//   · item auto = une forme reconnue dans la réponse → ses points ;
//   · couverture = Σ auto crédité / Σ auto (les items manuels sont exclus du
//     dénominateur et remontés au correcteur humain) ;
//   · note = couverture × maxPts, PUIS plafonds d'intégrité
//     (integriteCopie.ts : salade 30 % · négations 50 % · perroquet 25 %) ;
//   · couverture 0 (aucun attendu touché) → 0 pt ;
//   · le diagnostic (entités, seuils mots-clés) reste pédagogique, hors note.

import { evaluerBareme } from './baremeCorrecteur';
import { evaluerEntites, type EntiteDetectee } from './dictionnaireCorrecteur';
import { evaluerReponseKeywords } from '../../correcteurV1';
import {
  attendusDeGroupe,
  plafondAutoDe,
  type AttendusExercice,
  type AttenduItem,
} from './attendusBac2025';
import {
  analyserSignaux,
  calculerPlafonds,
  appliquerPlafonds,
  type PlafondApplique,
  type SignauxCopie,
} from './integriteCopie';
import { normalizeAr } from '../../lib/validation/normalizeAr';
import { CORRECTEUR_V1_UNITES as CORRECTEUR_UNITES } from '../../correcteurV1';

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
  mode: 'attendus' | 'calibre';
  /** Couverture mots-clés de la réponse (0..1). */
  couverture: number;
  /** Note calibrée, clampée [0, maxPts]. */
  points: number;
  maxPts: number;
}

/**
 * LEGACY (R2 historique, déprécié par Pierre 2/R6) : note depuis la couverture
 * sur banque d'unité via le fit linéaire. Conservé pour recherche/repasse du
 * harnais 80 copies — INTERDIT dans le chemin de notation produit : le
 * dénominateur de production est le registre des attendus.
 * @deprecated utiliser noterExerciceCalibre (attendus obligatoires).
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

export interface OptionsNotation {
  /** Override de l'énoncé (détection de perroquet) — sinon le registre. */
  question?: string;
}

export interface VerdictAttendu {
  id: string;
  texteAr: string;
  points: number;
  /** Crédité (au moins en partie) automatiquement. */
  credite: boolean;
  /** false = item manuel (aucune forme) → correcteur humain. */
  auto: boolean;
  source: AttenduItem['source'];
  /** Crédit fractionnaire réel (composantes) = points × ratio. */
  pointsCredites: number;
  /** P5 : composants co-requis détectés / exigés (absent = item OU simple). */
  composantesDetectees?: number;
  composantesTotal?: number;
}

export interface NoteCalibree extends ResultatNotation {
  sujet: 1 | 2;
  exercice: 1 | 2 | 3;
  /** Couverture des attendus AUTO crédités (0..1). */
  couverture: number;
  /** Σ points attendus auto crédités / Σ points auto. */
  pointsAttendusCredites: number;
  pointsAttendusAuto: number;
  /** Détail par attendu (le prof voit tout, y compris les items manuels). */
  verdicts: VerdictAttendu[];
  /** Couche DICTIONNAIRE : entités officiel+verifie reconnues (pédagogique). */
  entitesReconnues: EntiteDetectee[];
  /** Diagnostic mots-clés de l'unité (pédagogique — JAMAIS la note). */
  diagnosticMotsCles: { trouves: string[]; manquants: string[]; passe: boolean };
  diagnosticBareme: {
    creditAuto: number;
    plafondAuto: number;
  };
  /** Blindage anti-jeu (Pierre 1) : plafonds appliqués à la note. */
  plafonds: PlafondApplique[];
  /** Signaux de surface ayant alimenté les plafonds (transparence). */
  signaux: SignauxCopie;
  /** Le registre d'attendus utilisé (traçabilité). */
  registre: AttendusExercice;
}

/**
 * Évalue UNE réponse d'exercice bac2025 : note calibrée + couches de diagnostic.
 * RÈGLE MOTEUR : `points` ne dépend QUE de la couverture via la calibration,
 * PUIS est plafonné par les signaux d'intégrité (salade / perroquet /
 * négations — integriteCopie.ts) ; le crédit du barème officiel reste
 * affiché en diagnostic (jamais additionné).
 */
export function noterExerciceCalibre(
  reponse: string,
  sujet: 1 | 2,
  exercice: 1 | 2 | 3,
  options?: OptionsNotation
): NoteCalibree {
  const registre = attendusDeGroupe(sujet, exercice); // OBLIGATOIRE — throw si absent
  const g = uniteDeGroupe(sujet, exercice);

  // R6 : la couverture vient des ATTENDUS (jamais de la banque d'unité).
  const norm = normalizeAr(reponse || '').toLowerCase();
  const verdicts: VerdictAttendu[] = [];
  let credite = 0;
  let totalAuto = 0;
  for (const it of registre.items) {
    const auto = it.points > 0 && (it.formes.length > 0 || (it.composantes?.length ?? 0) > 0);
    if (!auto) {
      // Item manuel : aucune forme → correcteur humain, exclu du dénominateur.
      verdicts.push({ id: it.id, texteAr: it.texteAr, points: it.points, credite: false, auto: false, source: it.source, pointsCredites: 0 });
      continue;
    }
    totalAuto = Math.round((totalAuto + it.points) * 100) / 100;
    let pointsItem = 0;
    let det = 0;
    let tot = 0;
    if (it.composantes?.length) {
      // P5 : composants co-requis → crédit proportionnel. OU dans un groupe,
      // ET entre groupes : écrire « ARNm ARNr ARNt » sans les rôles ne prend
      // plus la moitié des points réservée aux rôles.
      tot = it.composantes.length;
      det = it.composantes.filter((g) => g.some((f) => norm.includes(f))).length;
      pointsItem = Math.round(it.points * (det / tot) * 100) / 100;
    } else {
      const hit = it.formes.some((f) => norm.includes(f));
      if (hit) pointsItem = it.points;
    }
    credite = Math.round((credite + pointsItem) * 100) / 100;
    verdicts.push({
      id: it.id,
      texteAr: it.texteAr,
      points: it.points,
      credite: pointsItem > 0,
      auto: true,
      source: it.source,
      pointsCredites: pointsItem,
      ...(tot > 0 ? { composantesDetectees: det, composantesTotal: tot } : {}),
    });
  }

  const couverture = totalAuto > 0 ? Math.min(1, credite / totalAuto) : 0;

  // Pierre 1 : plafonds d'intégrité (salade / négations / perroquet).
  const question = options?.question ?? registre.questionAr;
  const signaux = analyserSignaux(reponse, question);
  const plafonds = calculerPlafonds(signaux);
  const brut = couverture * registre.maxPts;
  const points = couverture === 0 ? 0 : appliquerPlafonds(brut, registre.maxPts, plafonds);

  // Diagnostic (pédagogique, jamais converti en points).
  const unite = g ? CORRECTEUR_UNITES.find((u) => u.uniteId === g.uniteId) : undefined;
  const ent = evaluerEntites(reponse, g?.uniteId ?? 0);
  const diag = unite
    ? evaluerReponseKeywords(reponse, g!.uniteId)
    : { trouves: [] as string[], manquants: [] as string[], passe: false };

  return {
    sujet,
    exercice,
    uniteId: g?.uniteId ?? 0,
    mode: 'attendus',
    couverture,
    points: Math.round(points * 100) / 100,
    maxPts: registre.maxPts,
    pointsAttendusCredites: credite,
    pointsAttendusAuto: totalAuto,
    verdicts,
    entitesReconnues: g ? ent.trouvees : [],
    diagnosticMotsCles: { trouves: diag.trouves, manquants: diag.manquants, passe: diag.passe },
    diagnosticBareme: { creditAuto: credite, plafondAuto: plafondAutoDe(registre) },
    plafonds,
    signaux,
    registre,
  };
}

/** Note une copie complète (3 exercices) → total /20 + détail par exercice. */
export function noterCopieCalibree(
  sections: readonly [string, string, string],
  sujet: 1 | 2,
  options?: readonly (OptionsNotation | undefined)[]
): { total: number; exercices: NoteCalibree[] } {
  const exercices = ([1, 2, 3] as const).map((ex, i) =>
    noterExerciceCalibre(sections[ex - 1] ?? '', sujet, ex, options?.[i])
  );
  const total = exercices.reduce((s, e) => s + e.points, 0);
  return { total: Math.round(total * 100) / 100, exercices };
}


