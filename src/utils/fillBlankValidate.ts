// fillBlankValidate.ts — validation des micro-tests « remplir le trou » (S-C4).
// On ne demande PAS une phrase identique à l'élève : on mesure la couverture
// des mots-porteurs de la réponse officielle (normalisation arabe + stopwords).
// Seuil 60 % : passe si l'essentiel des notions-clés est présent.

import { normalizeAr } from '../lib/validation/normalizeAr';

/** Mots vides arabes + latins courants, à exclure du décompte de couverture. */
const STOPWORDS = new Set<string>([
  'من', 'الى', 'في', 'على', 'عن', 'او', 'ثم', 'قد', 'لا', 'ما', 'هي', 'هو', 'مع',
  'بين', 'هذا', 'هذه', 'ذلك', 'التي', 'الذي', 'الذين', 'عند', 'حتى', 'اذا', 'كي',
  'بما', 'كما', 'بعض', 'غير', 'كل', 'بعد', 'قبل', 'حيث', 'نحو', 'لدى', 'فيه', 'فيها',
  'منه', 'منها', 'عليه', 'عليها', 'فيما', 'و', 'ف', 'ب', 'ل', 'ك', 'به', 'له', 'ها',
  'and', 'or', 'the', 'a', 'an', 'of', 'to', 'in', 'is', 'are',
]);

/**
 * Mots-porteurs d'un texte normalisé.
 * Token latin (A, T, G, C, ADN, ATP…) toujours compté : en SVT, une lettre
 * latine seule est un contenu (complémentarité des bases), pas un mot vide.
 * Token arabe : >= 2 caractères et non vide (écarte les clitiques و/ف/ب/ل/ك).
 */
function contentWords(raw: string): string[] {
  return normalizeAr(raw)
    .split(/\s+/)
    .filter((w) => {
      if (!w) return false;
      if (/^[A-Za-z]+$/.test(w)) return true;
      return w.length >= 2 && !STOPWORDS.has(w);
    });
}

export interface FillBlankResult {
  correct: boolean;
  /** Fraction des mots-porteurs de la meilleure réponse officielle présents. */
  coverage: number;
}

/**
 * Valide la réponse de l'élève contre les réponses acceptées.
 * `correct` si >= 60 % des mots-porteurs (déduqués) de l'une d'elles sont présents.
 */
export function validateFillBlank(student: string, accepted: string[]): FillBlankResult {
  const sw = new Set(contentWords(student ?? ''));
  if (sw.size === 0) return { correct: false, coverage: 0 };
  let best = 0;
  for (const a of accepted) {
    const aw = new Set(contentWords(a));
    if (aw.size === 0) continue;
    let hit = 0;
    for (const w of aw) if (sw.has(w)) hit += 1;
    best = Math.max(best, hit / aw.size);
  }
  return { correct: best >= 0.6, coverage: best };
}
