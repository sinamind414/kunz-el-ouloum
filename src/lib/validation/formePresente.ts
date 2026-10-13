// formePresente.ts — reconnaissance bornée d'une forme dans un texte normalisé.
// Partagé par la note calibrée (calibrationBac2025) ET le diagnostic barème
// (baremeCorrecteur) — P2 : AUCUN matching par substring nu.
//
// Formes latines : frontière lettre (« nad » ∉ « nadh », « atp » ∉ « atpase »).
// Formes CHIFFRES pures : frontière alphanumérique complète (« 98 » ∉ « 1982 »).
// Contrat : BOOLEAN strict (true/false) — jamais un index (0 est falsy sous
// Array.some, piège qui a coûté une passe de débogage : 0 = « trouvé »).

const RE_LATIN_PUR = /^[a-z0-9-]+$/;
const RE_CHIFFRES_PUR = /^\d+$/;
const echapper = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export function formePresente(norm: string, forme: string): boolean {
  // 2026-10-12 — BUG DE CASSE corrigé. Les appelants passent un texte déjà mis en
  // minuscules (normalizeAr(reponse).toLowerCase()), mais la FORME, elle, était
  // utilisée telle quelle : une forme contenant une majuscule (« NE », « ADN »,
  // « ATP ») tombait donc dans `norm.includes(forme)` — jamais satisfait, puisque
  // `norm` est en minuscules. La forme était introuvable À VIE, silencieusement.
  // Symptôme réel mesuré : l'item S1-Ex3 « النورادرينالين / NE » échouait sur
  // 40/40 copies, les élèves écrivant le sigle « NE » absent des formes,
  // plafonnant toute copie ≥ 15/20 à 6,36/8.
  const f = forme.toLowerCase();
  if (!RE_LATIN_PUR.test(f)) return norm.includes(f);
  const gauche = RE_CHIFFRES_PUR.test(f) ? '(?<![a-z0-9])' : '(?<![a-z])';
  const droite = RE_CHIFFRES_PUR.test(f) ? '(?![a-z0-9])' : '(?![a-z])';
  return new RegExp(`${gauche}${echapper(f)}${droite}`).test(norm);
}
