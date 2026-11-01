// ============================================================
// melangeOptions.ts — LES PROPOSITIONS DE QCM CHANGENT DE PLACE À CHAQUE SESSION.
//
// POURQUOI. Les clés de correction sont dans le bundle livré à l'élève (552
// occurrences de `correctAnswerIndex` dans un seul chunk — mesuré le
// 14/10/2026). `grep -o 'correctAnswerIndex:[0-9]*'` les extrait en une seconde,
// et une clé « la réponse est la 2ᵉ » est directement exploitable.
//
// On ne peut pas retirer la clé du paquet : le quiz est hors ligne, il doit
// pouvoir se corriger sans réseau. En revanche, on peut rendre une clé extraite
// INUTILISABLE : si les propositions changent de place à chaque session,
// « la réponse est la 2ᵉ » n'est vrai que pour la session où elle a été volée.
//
// CE QUI EXISTAIT DÉJÀ, ET POURQUOI ÇA NE SUFFISAIT PAS : `shuffledView()`
// (smartTutorEngine.ts) mélangeait déjà les propositions, mais avec une graine
// dérivée du SEUL identifiant de la question — donc le MÊME ordre à chaque
// session, pour toujours. Ici, la graine est propre à la session.
//
// RÈGLE DE VÉRITÉ : la position de la bonne réponse à l'écran n'est PAS celle
// des données. Chaque question mélangée porte `optionOrigins`, qui dit d'où
// vient chaque proposition. Sans cette table, tout ce qui est indexé par
// position — les aides « pourquoi mon choix est faux » (`getHintForIncorrectOption`)
// — deviendrait FAUX. C'est le piège de cette transformation, et il est testé.
//
// PORTÉE : uniquement les QCM à choix multiples ≥ 2 propositions avec une
// réponse valide. Les questions à trou (`kind: 'fillBlank'`, options = []) et
// toute question à réponse négative (pas de bonne réponse à cacher) sont
// rendues INCHANGÉES, sans `optionOrigins`.
// ============================================================

/** Clé de stockage de la graine de session (sessionStorage). */
const CLE_GRAINE = 'kunz_graine_session';

/**
 * Graine de la session courante.
 *
 * `sessionStorage` est le bon support : l'ordre reste STABLE pendant la session
 * (un élève qui navigue ne voit pas ses propositions se réordonner sous ses
 * yeux), et il est NEUF à chaque nouvelle session. En navigation privée, où le
 * stockage peut lever, on retombe sur une graine tirée au chargement du module :
 * l'ordre change alors à chaque rechargement, ce qui reste protégé (un peu plus
 * agressif, jamais dangereux).
 */
export function graineSession(): number {
  try {
    const stockee = sessionStorage.getItem(CLE_GRAINE);
    if (stockee) {
      const n = Number.parseInt(stockee, 10);
      if (Number.isFinite(n) && n > 0) return n;
    }
    const n = tirerGraine();
    sessionStorage.setItem(CLE_GRAINE, String(n));
    return n;
  } catch {
    return GRAINE_SECOURS;
  }
}

let GRAINE_SECOURS = 0;
function tirerGraine(): number {
  try {
    const octets = new Uint32Array(1);
    crypto.getRandomValues(octets);
    // Ramené dans un entier 32 bits non signé et non nul.
    return (octets[0] % 2147483646) + 1;
  } catch {
    return (Math.floor(Math.random() * 2147483646) + 1) >>> 0;
  }
}
GRAINE_SECOURS = tirerGraine();

/**
 * Hachage FNV-1a : transforme (identifiant de question, graine de session) en
 * un entier. Même technique que `hashSeed()` de smartTutorEngine.ts, mais la
 * graine de session entre dans le calcul.
 */
function melangeIdentifiants(parts: Array<string | number>): number {
  let h = 2166136261;
  const texte = parts.join('|');
  for (let i = 0; i < texte.length; i += 1) {
    h ^= texte.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * Permutation de `[0..n-1]`, déterministe pour une graine donnée
 * (Fisher-Yates avec un générateur congruentiel linéaire).
 */
export function permutation(n: number, graine: number): number[] {
  const ordre = Array.from({ length: n }, (_, i) => i);
  let s = graine >>> 0;
  const suivant = () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
  for (let i = n - 1; i > 0; i -= 1) {
    const j = Math.floor(suivant() * (i + 1));
    [ordre[i], ordre[j]] = [ordre[j], ordre[i]];
  }
  return ordre;
}

/** Une question mélangeable : au moins deux propositions et une bonne réponse. */
export interface QuestionAvecOptions {
  options: string[];
}

/**
 * Mélange les propositions d'UNE question et corrige la clé.
 *
 * @param q      question d'origine (jamais modifiée : un nouvel objet est rendu)
 * @param champ  nom du champ contenant l'index de la bonne réponse
 * @param graine graine de session
 * @param cle    identifiant stable de la question (pour que deux questions
 *               différentes ne reçoivent pas la même permutation)
 *
 * Renvoie l'objet d'origine si le mélange n'a pas de sens (une seule
 * proposition, pas de bonne réponse, option manquante).
 */
export function melangerQuestion<T extends QuestionAvecOptions>(
  q: T,
  champ: keyof T,
  graine: number,
  cle: string | number,
): T & { optionOrigins?: number[] } {
  const index = q[champ];
  const n = Array.isArray(q.options) ? q.options.length : 0;
  // Rien à cacher : une seule proposition, ou aucune bonne réponse désignée
  // (questions à trou : options vides, index -1).
  if (n < 2 || typeof index !== 'number' || index < 0 || index >= n) return q;

  const ordre = permutation(n, melangeIdentifiants([cle, graine]));
  const options = ordre.map((i) => q.options[i]);
  // La bonne réponse occupe désormais la position de son ancienne place dans la
  // permutation : on la retrouve par `ordre.indexOf(index)`.
  const nouvelle = ordre.indexOf(index);
  return {
    ...q,
    options,
    [champ]: nouvelle,
    // Table de correspondance position affichée → position d'origine. C'est
    // elle qui garde justes les aides et les corrigés indexés par position.
    optionOrigins: ordre,
  } as T & { optionOrigins: number[] };
}

/** Même chose sur une liste — une question inchangée n'a pas d'`optionOrigins`. */
export function melangerQuestions<T extends QuestionAvecOptions>(
  liste: T[],
  champ: keyof T,
  graine: number,
  cleDe: (q: T, i: number) => string | number = (q, i) => {
    const avecId = q as unknown as { id?: number | string };
    return avecId.id ?? i;
  },
): Array<T & { optionOrigins?: number[] }> {
  return liste.map((q, i) => melangerQuestion(q, champ, graine, cleDe(q, i)));
}

/**
 * Traduit une position AFFICHÉE en position d'origine — indispensable pour tout
 * ce qui est indexé par position (aides, corrigés par option).
 * Rend l'index tel quel si la question n'a pas été mélangée.
 */
export function origineDe(
  optionOrigins: number[] | undefined,
  indexAffiche: number,
): number {
  if (!optionOrigins || indexAffiche < 0 || indexAffiche >= optionOrigins.length) return indexAffiche;
  return optionOrigins[indexAffiche];
}
