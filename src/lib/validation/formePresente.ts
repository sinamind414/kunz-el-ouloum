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
  if (!RE_LATIN_PUR.test(forme)) return norm.includes(forme);
  const gauche = RE_CHIFFRES_PUR.test(forme) ? '(?<![a-z0-9])' : '(?<![a-z])';
  const droite = RE_CHIFFRES_PUR.test(forme) ? '(?![a-z0-9])' : '(?![a-z])';
  return new RegExp(`${gauche}${echapper(forme)}${droite}`).test(norm);
}
