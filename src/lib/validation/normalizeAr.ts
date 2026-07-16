// normalizeAr.ts
// Normaliseur arabe unique, partagé par ValidationEngine + fuzzyMatch (fillBlank).
// Aucune dépendance externe. Règle (Speckit §5.3) :
//   tatweel off · أإآ→ا · ى→ي · ة→ه (tolérance) · diacritiques off · espaces repliés.
// Les chiffres arabes/latins et lettres latines (PPM, PPSE, ACh, H2…) sont conservés.

export function normalizeAr(input: string): string {
  if (!input) return '';
  return input
    .replace(/[\u064B-\u065F\u0670]/g, '') // harakat + alef suscrite + hamza souscrite
    .replace(/ـ/g, '') // tatweel (allongement)
    .replace(/[إأآٱا]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/ة/g, 'ه') // tolérance ة→ه
    .replace(/[^\u0600-\u06FF\u0750-\u077F0-9a-zA-Z\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Recherche insensible à la casse pour un token latin (PPM, PPSE, ACh, H2…). */
export function containsLatin(raw: string, token: string): boolean {
  const norm = normalizeAr(raw).toLowerCase();
  return norm.includes(token.toLowerCase());
}

/** Recherche d'un mot arabe normalisé. */
export function containsAr(raw: string, arWord: string): boolean {
  const norm = normalizeAr(raw);
  return norm.includes(normalizeAr(arWord));
}

/** Recherche l'un des tokens (arabe ou latin) parmi une liste. */
export function containsAny(raw: string, tokens: string[]): boolean {
  return tokens.some((t) =>
    /[a-zA-Z]/.test(t) ? containsLatin(raw, t) : containsAr(raw, t)
  );
}
