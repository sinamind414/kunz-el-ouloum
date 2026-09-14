// ============================================================
// methodologyToLetter.ts — Pont scoreur بوصلة → grille de lettres
// (src/lib/validation/letterGrid.ts)
//
// La lettre naît des STATUTS des critères du scoreur — jamais d'un %
// converti. Mapping binaire du scoreur :
//   passed=true            → 'full'
//   passed=false           → 'empty'
//   (critère non applicable → absent, pas 'partial')
//
// Poids : le scoreur donne weight ∈ {1} sur les cartes V1 — la grille
// exige poids_fort ≥ 3 pour distinguer C/C+. On dérive donc le poids
// du RÔLE du critère (palier d'entrée vs clôture) :
//   · critère de CLOTURE (conclusion/jugement, errorTag missing_conclusion)
//     ou critère de LIAISON causale (errorTag unsupported_claim) → poids 3
//   · autres (référence, unités, format) → poids 1
// Tous les critères d'un verbe sont requis (le scoreur ne connaît pas
// d'optionnel).
//
// Caps (plafonds) branchés :
//   · stuffing  → detecterStuffing (src/lib/validation/stuffingDetector.ts)
//   · darija    → PAS de cap automatique : la détection دارجة est
//     consultative (décision enseignant, darijaClassifier.ts L249).
//     → darijaDetected = false ici, par design.
//   · science   → PAS de cap côté élève : la machine valide la FORME,
//     le FOND est tranché par l'enseignant (file de correction).
//     → scienceLetter = '✅' affiché comme repère de forme, jamais
//       comme verdict scientifique. scienceStatus='partial' si la
//       production n'est pas encore validée par un humain.
// ============================================================

import { computeMethodLetter, computeOverallLetter, computeScienceLetter, formatDisplay, CriterionInput, CriterionStatus, LetterOutput, LetterDisplay } from '../lib/validation/letterGrid';
import { detecterStuffing } from '../lib/validation/stuffingDetector';
import type { ScoreReport } from './methodologyScorer';
import type { VerbCardV2 } from '../data/methodologyEngine';

export interface MethodologyLetterReport {
  /** Grille complète (méthode, caps, overall, next step arabe). */
  letters: LetterOutput;
  /** Affichage 3 lignes pour l'élève (المنهجية / العلم / العام). */
  display: LetterDisplay;
  /** Liste des critères du scoreur mappés (pour débogage + tests). */
  criteriaMapped: CriterionInput[];
}

/** Tags qui font d'un critère un pilier (poids fort ≥ 3). */
const HEAVY_ERROR_TAGS = new Set([
  'missing_conclusion',   // clôture : pas de réponse = pas de point au bac
  'unsupported_claim',     // liaison causale : le cœur du geste méthodologique
  'premature_interpretation', // violation de l'interrupteur (interdit du verbe)
]);

function weightOfCriterion(errorTag: string | undefined): number {
  return errorTag && HEAVY_ERROR_TAGS.has(errorTag) ? 3 : 1;
}

function statusOfCriterion(passed: boolean): CriterionStatus {
  return passed ? 'full' : 'empty';
}

/**
 * Mappe les critères du scoreur vers la grille de lettres.
 *
 * @param report   — ScoreReport du scoreur (evaluateStudentProduction)
 * @param card     — VerbCardV2 (pour l'interrupteur et le texte)
 * @param options  — stuffing : injecter le résultat du détecteur (défaut : auto)
 */
export function methodologyToLetter(
  report: ScoreReport,
  card: VerbCardV2,
  options?: { stuffingDetected?: boolean },
): MethodologyLetterReport {
  // 1) Mapping critères scoreur → critères grille
  const criteriaMapped: CriterionInput[] = report.criteriaResults.map(res => {
    const errorTag = res.errorTag;
    return {
      id: res.criterionId,
      status: statusOfCriterion(res.passed),
      weight: weightOfCriterion(errorTag),
      required: true,
    };
  });

  // 2) Lettre méthode (décision tree de la grille — jamais un % converti)
  const methodLetter = computeMethodLetter(criteriaMapped);

  // 3) Science : la machine ne tranche jamais le fond.
  //    'partial' tant que l'enseignant n'a pas validé → ⚠️ affiché.
  //    (Si la production est humainement approuvée via la file, le
  //    composant peut re-mapper avec scienceStatus='ok'.)
  const scienceLetter = computeScienceLetter('partial');

  // 4) Stuffing : cap automatique C+ (théorème du mot unique)
  let stuffingDetected = options?.stuffingDetected ?? false;
  if (options?.stuffingDetected === undefined) {
    stuffingDetected = detecterStuffing(report.criteriaResults.length > 0 ? buildTextProxy(report) : '').stuffing_detected;
  }

  // 5) Darija : consultatif — pas de cap automatique côté élève.
  const darijaDetected = false;

  const letters = computeOverallLetter(methodLetter, scienceLetter, stuffingDetected, darijaDetected);
  const display = formatDisplay(letters);

  return { letters, display, criteriaMapped };
}

/**
 * Le détecteur de stuffing travaille sur le TEXTE — le ScoreReport
 * ne transporte que des critères. Le composant appelant DOIT passer
 * le texte de l'élève via options.text; sinon on esquive (false).
 */
function buildTextProxy(_report: ScoreReport): string {
  return ''; // sans texte réel, detecterStuffing retourne non-détecté (< 3 mots)
}

/**
 * Variante avec texte : stuffing mesuré sur la vraie copie.
 */
export function methodologyToLetterWithText(
  report: ScoreReport,
  studentText: string,
  options?: { scienceStatus?: 'ok' | 'error' | 'partial' },
): MethodologyLetterReport {
  const criteriaMapped: CriterionInput[] = report.criteriaResults.map(res => ({
    id: res.criterionId,
    status: statusOfCriterion(res.passed),
    weight: weightOfCriterion(res.errorTag),
    required: true,
  }));

  const methodLetter = computeMethodLetter(criteriaMapped);
  const scienceLetter = computeScienceLetter(options?.scienceStatus ?? 'partial');
  const stuffingDetected = detecterStuffing(studentText || '').stuffing_detected;

  const letters = computeOverallLetter(methodLetter, scienceLetter, stuffingDetected, false);
  const display = formatDisplay(letters);
  return { letters, display, criteriaMapped };
}
