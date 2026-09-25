// normalizeAr.ts
// Normaliseur arabe unique, partagé par ValidationEngine + fuzzyMatch (fillBlank).
// Aucune dépendance externe. Règle (Speckit §5.3) :
//   NFKC d'abord · tatweel off · أإآ→ا · ى→ي · ة→ه (tolérance) · diacritiques off · espaces repliés.
// Les chiffres arabes/latins, lettres latines (PPM, PPSE, ACh, H2…) et les
// marqueurs unitaires % / ٪ / ° sont conservés.
// NFKC (audit 2026-09-16) : déplie les « presentation forms » U+FBxx/U+FExx que
// les PDF/OCR arabes emploient (ﻣﻬﺎم → مهم, ﻻ → لا) — sinon ces mots, hors
// \u0600-\u06FF, devenaient des espaces (54,7 % des caractères de L6 = perdus).
// % / ° conservés (évaluation 80 copies bac2025) : « المصاب 30% » (données SOD)
// ne doit PAS devenir le nombre isolé 30 — faux déclencheur du conflit ATP.

export function normalizeAr(input: string): string {
  if (!input) return '';
  return input
    .normalize('NFKC') // déplie presentation forms (ﻣﻬﺎم→مهم) + indices (₂→2)
    .replace(/[\u064B-\u065F\u0670]/g, '') // harakat + alef suscrite + hamza souscrite
    .replace(/ـ/g, '') // tatweel (allongement)
    .replace(/[إأآٱا]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/ة/g, 'ه') // tolérance ة→ه
    .replace(/[^\u0600-\u06FF\u0750-\u077F0-9a-zA-Z\s%٪°]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Recherche insensible à la casse pour un token latin (PPM, PPSE, ACh, H2…). */
export function containsLatin(raw: string, token: string): boolean {
  const norm = normalizeAr(raw).toLowerCase();
  // Le token doit subir la MÊME normalisation que le texte (tatweel, ة→ه,
  // hamzas, harakat…) : un terme mixte arabe+latin comme « نضج الـ ARNm »
  // contient un tatweel qui sinon ne se retrouve jamais dans le texte
  // normalisé. Garde-fou : un token qui disparaît à la normalisation
  // ne doit jamais matcher toute la chaîne (includes('')).
  const needle = normalizeAr(token).toLowerCase();
  return needle.length > 0 && norm.includes(needle);
}

/** Recherche d'un mot arabe normalisé. */
export function containsAr(raw: string, arWord: string): boolean {
  const norm = normalizeAr(raw);
  return norm.includes(normalizeAr(arWord));
}

/**
 * Recherche d'un mot-clé À FRONTIÈRES DE MOT (audit Fable-5, 2026-09-25).
 * `includes` pur laissait un mot-clé matcher à l'intérieur d'un mot plus long
 * (« دنا » dans « مادنا », « ATP » dans « ATPase ») et gonflait la couverture
 * de mots-clés. On borne le needle par des caractères qui ne sont NI lettres
 * latines NI lettres arabes —\b \p{Script=Arabic}, et NON le bloc \u0600-\u06FF
 * entier, car ce dernier contient la ponctuation arabe (، U+060C, ؛, ؟) qui doit
 * compter comme une frontière. Les clitiques arabes (ال، و، ف، ب، ل، ك) sont
 * acceptés devant le needle (« بالمادة », « والتنفس ») car ils sont eux-mêmes
 * à une frontière de mot — c'est la morphologie agglutinante de l'arabe.
 * Les deux arguments doivent être DÉJÀ normalisés (normalizeAr).
 */
export function motPresentDans(normText: string, normNeedle: string): boolean {
  if (!normNeedle) return false;
  const escaped = normNeedle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(
    '(?<![A-Za-z\\p{Script=Arabic}])(?:ال|[وفبلك])?' + escaped + '(?![A-Za-z\\p{Script=Arabic}])',
    'u'
  );
  return re.test(normText);
}

/** Recherche l'un des tokens (arabe ou latin) parmi une liste. */
export function containsAny(raw: string, tokens: string[]): boolean {
  return tokens.some((t) =>
    /[a-zA-Z]/.test(t) ? containsLatin(raw, t) : containsAr(raw, t)
  );
}
