// stuffingDetector.ts — Détection de bourrage lexical (port TS)
//
// Deux théorèmes :
//   1. Théorème du mot unique (D1) : si un texte de n mots distincts (n≥2) a >= 2/3 des
//      occurrences concentrées sur un seul mot, c'est du bourrage. Formule :
//        stuffing_ratio = occurrences_du_mot_le_plus_fréquent / total_mots
//        si stuffing_ratio >= 0.6 et n >= 2 → détecté
//   2. Marqueurs de structure (S32) : les répétitions parasitent moins quand le texte est
//      formaté (numérotation, titres, listes). Si le texte contient des marqueurs de structure
//      et que stuffing_ratio < 0.75 → pas de bourrage.

import { normalizeAr } from './normalizeAr';

export interface StuffingResult {
  stuffing_detected: boolean;
  ratio: number;              // occurrences_du_plus_fréquent / total_mots (0..1)
  most_frequent_word: string;
  most_frequent_count: number;
  distinct_words: number;     // nombre de mots distincts (n≥2)
  structured: boolean;        // marqueurs de structure détectés
  explanation_ar: string;
}

/**
 * Tokeniser : mots de ≥ 2 caractères, ignorés les chiffres et ponctuation.
 */
function tokenize(norm: string): string[] {
  return norm
    .split(/\s+/)
    .map(t => t.trim())
    .filter(t => t.length >= 2 && !/^\d+$/.test(t));
}

/**
 * Marqueurs de structure (D2 / S32) : détectés si ≥ 2 présents.
 * Purge v2.1 : les classes CJC (가-힣) et hébreu (א-ת) héritées de la liste
 * corrompue ne peuvent jamais matcher une copie SVT — remplacées par des
 * marqueurs réels (numérotation latine, puces, titres latins, séparateurs).
 */
const STRUCTURE_MARKERS = [
  /^\s*\d+[\.\)]\s/m,          // "1. " ou "1) "
  /^\s*[•●\-*]\s/m,            // puces
  /^[a-zA-Z0-9]+[\.\)]\s/m,    // numérotation titres latins
  /[:\.─═]{2,}/,               // séparateurs visuels
];

function detectStructure(norm: string): boolean {
  let count = 0;
  for (const marker of STRUCTURE_MARKERS) {
    if (marker.test(norm)) count++;
  }
  return count >= 2;
}

/**
 * Détecter le bourrage lexical.
 *
 * Algorithme :
 *   1. Tokenizer + compter les occurrences par mot.
 *   2. n = nb mots distincts (longueur du dictionnaire des fréquences).
 *   3. max_count = fréquence du mot le plus fréquent.
 *   4. ratio = max_count / total_mots.
 *   5. Détection :
 *      - si total_mots < 3 → pas de bourrage (trop court pour juger)
 *      - si n < 2 → bourrage par défaut (un seul mot répété)
 *      - si ratio >= 0.6 et n >= 2 → bourrage (théorème D1)
 *      - si structure détectée et ratio < 0.75 → pas de bourrage (S32)
 */
export function detecterStuffing(copieNormalisee: string): StuffingResult {
  const norm = normalizeAr(copieNormalisee);
  const tokens = tokenize(norm);
  const totalMots = tokens.length;

  // Cas trop court
  if (totalMots < 3) {
    return {
      stuffing_detected: false,
      ratio: 0,
      most_frequent_word: '',
      most_frequent_count: 0,
      distinct_words: tokens.length,
      structured: false,
      explanation_ar: 'النص قصير جداً للكشف عن التكرار اللفظي (< 3 كلمات مختلفة).',
    };
  }

  // Fréquences
  const freq: Record<string, number> = {};
  for (const t of tokens) {
    freq[t] = (freq[t] ?? 0) + 1;
  }

  const distinct = Object.keys(freq).length;
  const maxCount = Math.max(...Object.values(freq));
  const mostFrequent = Object.keys(freq).find(k => freq[k] === maxCount) ?? '';
  const ratio = maxCount / totalMots;

  const structured = detectStructure(norm);

  // Décision
  let detected = false;
  let explanation = '';

  if (distinct < 2) {
    // Un seul mot distinct → bourrage systématique
    detected = true;
    explanation = `نصٌ يتكون من كلمة واحدة متكررة (${mostFrequent}: ${maxCount} مرات) — لا معنى علمي.`;
  } else if (ratio >= 0.6) {
    // Théorème D1 : ratio ≥ 0.6 et n ≥ 2 → bourrage
    detected = true;
    explanation = `نسبة التكرار اللفظي مرتفعة (${Math.round(ratio * 100)}% للكلمة "${mostFrequent}") — وسّع المحتوى العلمي`;
    if (structured) {
      explanation += ' (مع الإشارة إلى وجود تنسيق، تبقى النسبة أعلى من 60% المسموح)';
    }
  } else if (structured && ratio >= 0.75) {
    // S32 marqueur présent mais ratio très élevé → bourrage quand même
    detected = true;
    explanation = `رغم وجود تنسيق (قائمة/ترقيم)، نسبة التكرار ${Math.round(ratio * 100)}% تفوق العتبة 75%.`;
  } else {
    explanation = `لا تكرار لفظي مفرط (النسبة ${Math.round(ratio * 100)}% تحت العتبة).`;
  }

  return {
    stuffing_detected: detected,
    ratio,
    most_frequent_word: mostFrequent,
    most_frequent_count: maxCount,
    distinct_words: distinct,
    structured,
    explanation_ar: explanation,
  };
}
