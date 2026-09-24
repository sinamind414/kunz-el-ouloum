// okachaQuality.ts — filtre OCR d'affichage du بنك الحفظ (lots A+D, 2026-09-24).
//
// Contexte (audit qualité arabe 2026-09-23) : le corpus de LIVRE
// (okacha.ts → okachaEnriched.ts, rendu par OkachaView) contenait ~1–2 % de
// déchets scan purs (traits `____`, carrés `■`, filigranes « المتفوف »,
// soupe de lettres).
//
// RÔLES :
//   • A — OkachaView masque les blocs score ≥ SEUIL_OCR (défense en profondeur) ;
//   • B — scripts/enrich_okacha.ts applique le même score À LA GÉNÉRATION
//         (le brut régénéré ne doit plus contenir de déchet) ;
//   • D — okachaQuality.lock.test.ts fige zéro déchet dans l'affiché.
//
// INTERDITS :
//   • ne PAS éditer okacha.ts / okachaEnriched.ts à la main (générés) ;
//   • ne PAS toucher au moteur (MethodologyCompilerView, meftahManhajia…) ;
//   • ne PAS réintroduire les 17 signatures OCR purgées.
//
// Verrou : src/data/okachaQuality.lock.test.ts (+ OkachaView.test.tsx).

/** Seuil au-delà duquel un bloc n'est plus affiché (audit : ≥ 0.35). */
export const SEUIL_OCR = 0.35;

/** Trait horizontal OCR (4+ tirets bas soulignés consécutifs). */
const RE_TRAIT_OCR = /_{4,}/;

/** Carrés noirs / puces scan résiduelles. */
const RE_CARRE_OCR = /[■□]/;

/** Filigrane commercial tronqué par l'OCR (famille « المتفوق » du scan). */
const RE_FILIGRANE =
  /المتفوف|المثفوك|منفون|منفوش|عكاس[ةأ]\s+للطالب|مشروع\s+عكاس|مدروع\s+عكاس|مشروع\s+ءكاشة|كاشة\s+للطالب\s+المنفوف|لاطاس\s+المثفوك|امنفوش|امنفوشى/;

const RE_AR = /[؀-ۿ]/g;
const RE_LAT = /[A-Za-z]/g;
const RE_SYM = /[0-9٠-٩■□_.,;:!?"«»\-\*•·^~|\\/<>[\]{}=+&%$#@♦♠▲▼◄►★☆]/g;
const RE_LIGNE_PURE = /^[\s\-–—_.■□٠]+$/;
const RE_JETON_AR = /[؀-ۿ]+/g;

/** Occurrences totales d'un pattern (matchAll — fiable avec /g). */
function compter(s: string, re: RegExp): number {
  return [...s.matchAll(re)].length;
}

/**
 * Score 0–1 de « déchet OCR » (soupe de lettres, traits, symboles).
 * Calibré 2026-09-24 sur okachaEnriched (~1 178 blocs) :
 *   • 0 faux positif sur titres/points propres et sur erreurs de lettres
 *     lisibles (« الأحماض الأمنية » → corrigé en lot C, pas masqué) ;
 *   • ~20 blocs ≥ 0.35 (~1,7 %), tous scan purs.
 *
 * Règle courte : signaux durs (trait / filigrane / ligne de symboles) → ≥ 0.8 ;
 * sinon densité symboles + soupe de jetons + ratio arabe faible.
 */
export function scoreDechetOCR(texte: string): number {
  const s = texte.trim();
  const n = s.length;
  if (n === 0) return 1;
  if (RE_TRAIT_OCR.test(s)) return 0.95;
  if (RE_FILIGRANE.test(s)) return 0.9;
  if (RE_LIGNE_PURE.test(s)) return 0.95;

  const ar = compter(s, RE_AR);
  const lat = compter(s, RE_LAT);
  const letters = ar + lat;
  const arRatio = ar / n;
  const sym = compter(s, RE_SYM);
  const symRatio = sym / n;
  const jetons: string[] = [...s.matchAll(RE_JETON_AR)].map((m) => m[0]);
  let courts = 0;
  for (const j of jetons) {
    if (j.length >= 1 && j.length <= 2) courts++;
  }
  const tokN = Math.max(1, jetons.length);
  const courtRatio = courts / tokN;

  // ── Chaînes courtes : signaux stricts uniquement (pas de FP sur « 159-دور CMH: ») ──
  if (n < 18) {
    if (s.includes('^')) return 0.8;
    if (letters < n * 0.35) return 0.8;
    if (courts >= 3 && courtRatio >= 0.6 && tokN >= 4) return 0.75;
    return 0;
  }

  let sc = 0;
  if (n >= 20) sc += Math.max(0, 0.55 - arRatio) * 1.2;
  else if (letters < n * 0.4) sc += 0.5;

  sc += Math.max(0, symRatio - 0.18) * 1.5;
  // Soupe de lettres OCR (jetons arabes de 1–2 caractères majoritaires).
  if (courts >= 4 && courtRatio > 0.45 && tokN >= 6) sc += 0.4;
  if (RE_CARRE_OCR.test(s)) sc += n > 30 && arRatio > 0.5 ? 0.15 : 0.4;
  if (s.includes('^') && arRatio < 0.75) sc += 0.3;
  if (n >= 15 && letters / n < 0.35) sc += 0.35;
  return Math.min(1, sc);
}

/** Vrai si le bloc ne doit PAS être affiché (score ≥ seuil ou signal dur). */
export function estDechetOCR(texte: string): boolean {
  return scoreDechetOCR(texte) >= SEUIL_OCR;
}

/**
 * Nettoie un bloc conservé : retire les carrés OCR résiduels et compacte les
 * espaces. Ne réécrit jamais le sens (retrait de marqueur uniquement).
 */
export function assainirTexte(texte: string): string {
  return texte
    .replace(RE_CARRE_OCR, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Filtre + assainissement en une passe (index de recherche, stats). */
export function blocsAffichables<T extends { texte: string }>(blocs: readonly T[]): T[] {
  const out: T[] = [];
  for (const b of blocs) {
    if (estDechetOCR(b.texte)) continue;
    out.push({ ...b, texte: assainirTexte(b.texte) });
  }
  return out;
}
