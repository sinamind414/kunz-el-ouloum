export function normalizeArabic(input: string): string {
  if (!input) return '';

  return input
    .toLowerCase()
    .replace(/[\u064B-\u065F\u0670ـ]/g, '')
    .replace(/[إأآا]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/[^\u0600-\u06ffA-Za-z0-9+\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function calculateKeywordScore(normalizedInput: string, keywords: string[]): number {
  let score = 0;
  const normalizedKeywords = keywords.map((keyword) => normalizeArabic(keyword)).filter(Boolean);

  for (const keyword of normalizedKeywords) {
    if (normalizedInput.includes(keyword)) score += 1;
  }

  return score;
}

export function tokenizeArabic(input: string): string[] {
  const normalized = normalizeArabic(input);
  return Array.from(new Set(normalized.match(/[\u0600-\u06ffA-Za-z0-9+]{3,}/g) || []));
}

/* -------------------------------------------------------------------------- *
 * Tolérance aux fautes de frappe + recouvrement de tokens (R1 audit Morchid  *
 * 2026-09-29). Objectif : lever le plafond de RAPPEL de la recherche         *
 * lexicale sans jamais introduire de LLM ni sacrifier la précision.          *
 *   - `boundedLevenshtein` : distance d'édition bornée (early-exit).         *
 *   - `fuzzyTokenEquals`   : égalité de tokens à quelques fautes près.       *
 *   - `tokenOverlapRatio`  : part des mots d'une cible retrouvés en entrée.  *
 * La tolérance est ADAPTATIVE (mots courts = 0 faute) pour éviter les faux   *
 * positifs sur les mots arabes courts, très proches les uns des autres.      *
 * -------------------------------------------------------------------------- */

/** Distance de Levenshtein bornée : renvoie `maxDist + 1` dès que le seuil est
 *  dépassé (sortie anticipée, O(la·lb) au pire mais coupé tôt en pratique). */
export function boundedLevenshtein(a: string, b: string, maxDist: number): number {
  if (a === b) return 0;
  const la = a.length;
  const lb = b.length;
  if (Math.abs(la - lb) > maxDist) return maxDist + 1;
  if (la === 0) return lb;
  if (lb === 0) return la;

  let prev = new Array<number>(lb + 1);
  let curr = new Array<number>(lb + 1);
  for (let j = 0; j <= lb; j += 1) prev[j] = j;

  for (let i = 1; i <= la; i += 1) {
    curr[0] = i;
    let rowMin = curr[0];
    const ca = a.charCodeAt(i - 1);
    for (let j = 1; j <= lb; j += 1) {
      const cost = ca === b.charCodeAt(j - 1) ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
      if (curr[j] < rowMin) rowMin = curr[j];
    }
    if (rowMin > maxDist) return maxDist + 1;
    const tmp = prev;
    prev = curr;
    curr = tmp;
  }
  return prev[lb];
}

/** Budget de fautes toléré selon la longueur : court = strict, long = souple. */
export function typoBudget(len: number): number {
  if (len <= 3) return 0;
  if (len <= 6) return 1;
  return 2;
}

/** Vrai si deux tokens (déjà normalisés) sont identiques à quelques fautes de
 *  frappe près. On ignore l'article « ال » de tête (≥ 4 lettres) des deux côtés
 *  pour que « المعده » ≈ « معدة ». Retourne toujours `false` pour les tokens
 *  courts (< 4 lettres) où la moindre faute change de mot. */
export function fuzzyTokenEquals(token: string, target: string): boolean {
  if (!token || !target) return false;
  const strip = (w: string) => (w.length > 4 && w.startsWith('ال') ? w.slice(2) : w);
  const t = strip(token);
  const g = strip(target);
  if (t === g) return true;
  const budget = typoBudget(Math.min(t.length, g.length));
  if (budget === 0) return false;
  return boundedLevenshtein(t, g, budget) <= budget;
}

/** Recouvrement de tokens (0..1) : proportion des mots (≥ 3 lettres) de `target`
 *  retrouvés dans `inputTokens`, exactement OU à une faute de frappe près.
 *  Permet à un alias/titre multi-mots d'être reconnu même reformulé ou mal tapé. */
export function tokenOverlapRatio(inputTokens: string[], target: string): number {
  const targetTokens = tokenizeArabic(target).filter((t) => t.length >= 3);
  if (targetTokens.length === 0) return 0;
  let hits = 0;
  for (const gt of targetTokens) {
    if (inputTokens.some((it) => fuzzyTokenEquals(it, gt))) hits += 1;
  }
  return hits / targetTokens.length;
}
