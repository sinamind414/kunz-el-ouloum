// negationAr.ts — Négation et réfutation en arabe (critère C4).
//
// Primitives partagées entre `smartTutorEngine` (points-clés, normaliseur
// `normalizeArabic`) et le scorer C2 de Tadwin (`couvCle`, normaliseur
// `normalizeAr`). Elles travaillent sur un texte DÉJÀ normalisé : l'appelant
// choisit son normaliseur — `normalizeAr` replie NFKC (²→2, ⁺→+), ce qui
// compte pour les atomes « Ca²⁺ » / « O₂ » / « NADPH,H⁺ ».
//
// B2 (audit Morchid 2026-09-25) : une clause qui s'ouvre par une forme de
// réfutation (« ليس صحيحاً أن… », « أرفض… », « مستحيل… ») nie tout point-clé
// qu'elle reprend. Une réponse niant chaque point-clé obtenait 10/10.

export const NEGATION_PARTICLES = ['لا', 'لم', 'لن', 'ليس', 'غير'];
export const DENIAL_STARTERS = ['ليس', 'ليست', 'غير صحيح', 'مستحيل', 'يستحيل', 'انفي', 'ارفض'];

/** Vrai si `token` est précédé (à un séparateur près) d'une particule de
 *  négation atomique dans `text` — ex. « لا ينتقل ». */
export function adjacentNegation(text: string, token: string): boolean {
  let from = 0;
  while (true) {
    const idx = text.indexOf(token, from);
    if (idx < 0) return false;
    const before = text.slice(Math.max(0, idx - 12), idx);
    for (const p of NEGATION_PARTICLES) {
      const at = before.lastIndexOf(p);
      if (at < 0) continue;
      const okBefore = at === 0 || /[\s،,؛;.\-]/.test(before[at - 1]);
      const okAfter = /^[\s،,؛;.\-]*$/.test(before.slice(at + p.length));
      if (okBefore && okAfter) return true;
    }
    from = idx + 1;
  }
}

/** Une clause qui s'ouvre par une forme de réfutation nie tout point-clé
 *  qu'elle reprend. */
export function clauseIsDenial(clause: string): boolean {
  const c = clause.trim();
  return DENIAL_STARTERS.some((s) => c.startsWith(s));
}

/** Un point-clé/atome est couvert s'il apparaît dans une clause NON réfutée,
 *  et sans inversion de polarité par rapport à l'attendu (si l'attendu dit
 *  « لا تنتقل », une réponse « لا تنتقل » reste juste). */
export function tokenAffirme(normAnswer: string, token: string, normKp: string): boolean {
  const clauses = normAnswer.split(/[،,؛;.]+/);
  for (const clause of clauses) {
    if (!clause.includes(token)) continue;
    const denies = clauseIsDenial(clause) && !clauseIsDenial(normKp);
    const inverted = adjacentNegation(clause, token) && !adjacentNegation(normKp, token);
    if (!denies && !inverted) return true;
  }
  return false;
}
