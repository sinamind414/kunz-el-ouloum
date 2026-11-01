// codeEleve.ts — l'élève s'inscrit SANS adresse e-mail : nom + code secret (H2 bis).
//
// LE PROBLÈME RÉEL (posé le 14/10/2026 par le mainteneur : « la majorité des
// élèves ne savent pas s'inscrire avec un e-mail »).
//
// Diagnostic, après lecture du code plutôt que du ressenti :
//   · l'inscription exige `email + mot de passe ≥ 6 caractères + nom` ;
//   · le placeholder du champ était `eleve@ecole.dz` — une adresse SCOLAIRE, que
//     pratiquement aucun élève algérien ne possède. Un élève qui lit ça croit
//     qu'il lui faut une adresse d'établissement, et abandonne ;
//   · il doit ensuite INVENTER un mot de passe et le retenir — alors que la
//     récupération passe par un code que seul l'enseignant peut générer ;
//   · et l'inscription ne lui apporte rien d'immédiat (elle sert au tableau de
//     bord du professeur) : aucune raison de franchir cette friction.
//
// LA SOLUTION RETENUE : un CODE DE CONNEXION court, lisible, dictable au
// téléphone, et un code secret à 6 chiffres. Deux champs, aucune adresse.
//
// COMMENT CELA TIENT SANS MIGRATION DE BASE
// Le schéma stocke `email TEXT NOT NULL UNIQUE` (SQLite, PostgreSQL, mode
// dégradé). Plutôt que d'ajouter une colonne — trois backends, une migration,
// des tests, pour un gain nul —, le code est mappé sur un identifiant interne
// `<code>@eleve.local`, rangé dans le champ existant :
//   · `UNIQUE` garantit l'unicité du code ;
//   · la connexion et la synchronisation fonctionnent sans modification ;
//   · le domaine `.local` est réservé (RFC 6762) : aucune adresse réelle ne peut
//     entrer en collision avec un identifiant interne ;
//   · le tableau de bord du professeur réaffiche le code, jamais l'identifiant.
//
// HONNÊTETÉ SUR LA SÉCURITÉ
// · Alphabet SANS caractères ambigus : ni I, ni L, ni O, ni 0, ni 1 — un code
//   dicté au téléphone ou recopié d'un tableau ne doit pas devenir un autre code.
// · 31⁸ ≈ 8,5 × 10¹¹ combinaisons de code, et 6 chiffres de code secret : la
//   seule attaque réaliste est EN LIGNE, et elle est déjà freinée par les deux
//   limiteurs existants (`ipLimiter` par adresse, `loginAccountLimiter` par
//   compte). Un code à 4 chiffres aurait été plus simple à retenir mais tombait
//   sous 10⁴ essais : refusé.
// · Ce n'est PAS un niveau de sécurité bancaire, et ce module ne le prétend pas.
//   Les données concernées sont des réponses d'exercices scolaires. Le jour où
//   une donnée sensible entrera dans l'application, ce choix devra être revu.

import { toLatinDigits } from '../utils/latinDigits';

/** Alphabet sans I, L, O, 0, 1 (confusions de lecture et de dictée). */
export const ALPHABET_CODE = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
/** Longueur du code (hors tiret d'affichage). */
export const LONGUEUR_CODE = 8;
/** Domaine interne : réservé par la RFC 6762, jamais routable. */
export const DOMAINE_INTERNE = 'eleve.local';

/** Codes secrets refusés : trop devinables pour un élève de 17 ans. */
const PINS_INTERDITS = new Set(['000000', '111111', '222222', '333333', '444444', '555555', '666666', '777777', '888888', '999999', '123456', '654321', '121212', '112233']);

/**
 * Génère un code de connexion (format interne, sans tiret).
 * @param aleatoire source d'aléa — injectable pour rendre les tests déterministes.
 */
export function genererCode(aleatoire: () => number = Math.random): string {
  let code = '';
  for (let i = 0; i < LONGUEUR_CODE; i += 1) {
    const indice = Math.floor(aleatoire() * ALPHABET_CODE.length) % ALPHABET_CODE.length;
    code += ALPHABET_CODE[Math.max(0, indice)];
  }
  return code;
}

/** Code affiché à l'élève : `XXXX-XXXX` (le tiret aide la lecture et la dictée). */
export function formaterCode(code: string): string {
  const propre = code.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  if (propre.length !== LONGUEUR_CODE) return propre;
  return `${propre.slice(0, 4)}-${propre.slice(4)}`;
}

/**
 * Normalise une saisie d'élève en code, ou `null` si ce n'en est pas un.
 * Tolère : minuscules, espaces, tirets, points, chiffres arabo-indiens (٠-٩)
 * et persans (۰-۹) — un élève qui recopie « k7f2 9qx3 » ou « k٧f٢-٩qx٣ » doit
 * pouvoir se connecter. Refuse tout ce qui contient un caractère hors alphabet
 * après normalisation, notamment les adresses e-mail (qui suivent l'autre voie).
 */
export function normaliserCode(saisie: unknown): string | null {
  if (typeof saisie !== 'string') return null;
  const nettoye = toLatinDigits(saisie)
    .toUpperCase()
    .replace(/[\s\-_.]/g, '');
  if (nettoye.length !== LONGUEUR_CODE) return null;
  for (const c of nettoye) {
    if (!ALPHABET_CODE.includes(c)) return null;
  }
  return nettoye;
}

/** La saisie ressemble-t-elle à un code de connexion (et non à un e-mail) ? */
export function estCode(valeur: unknown): boolean {
  return normaliserCode(valeur) !== null;
}

/** Identifiant interne d'un code (`k7f29qx3@eleve.local`) — ce qui est stocké. */
export function codeVersIdentifiant(code: string): string {
  const normalise = normaliserCode(code);
  if (!normalise) throw new Error(`code invalide : ${String(code)}`);
  return `${normalise.toLowerCase()}@${DOMAINE_INTERNE}`;
}

/** L'identifiant est-il interne (compte sans e-mail) ? */
export function estIdentifiantInterne(identifiant: unknown): boolean {
  return typeof identifiant === 'string' && identifiant.toLowerCase().endsWith(`@${DOMAINE_INTERNE}`);
}

/** Code affichable depuis un identifiant interne, ou `null` si compte à e-mail. */
export function codeDepuisIdentifiant(identifiant: unknown): string | null {
  if (!estIdentifiantInterne(identifiant)) return null;
  const local = String(identifiant).toLowerCase().split('@')[0];
  return formaterCode(local);
}

/** L'identifiant public à MONTRER (jamais l'adresse interne technique). */
export function identifiantAffichable(identifiant: unknown): string {
  return codeDepuisIdentifiant(identifiant) ?? String(identifiant ?? '');
}

/**
 * Valide un code secret à 6 chiffres (chiffres latins OU arabo-indiens).
 * Refuse les suites manifestement devinables : dans une classe, ce sont celles
 * qu'un camarade essaiera en premier.
 */
export function estCodeSecretValide(saisie: unknown): boolean {
  if (typeof saisie !== 'string') return false;
  const pin = toLatinDigits(saisie).trim();
  if (!/^\d{6}$/.test(pin)) return false;
  return !PINS_INTERDITS.has(pin);
}

/** Valide un nom d'affichage (2 caractères au moins, après nettoyage). */
export function estNomValide(saisie: unknown): boolean {
  return typeof saisie === 'string' && saisie.trim().replace(/\s+/g, ' ').length >= 2;
}

/**
 * Résout une saisie de connexion : code de connexion OU adresse e-mail.
 * Renvoie l'identifiant à chercher en base, ou `''` si la saisie n'est ni l'un
 * ni l'autre — la route répond alors 401 exactement comme avant, sans révéler
 * laquelle des deux voies a échoué.
 *
 * Une seule porte d'entrée pour les deux populations : les élèves inscrits
 * sans e-mail (codes) et les comptes existants à adresse e-mail continuent de
 * fonctionner, sans branche spéciale dans la route.
 */
export function resoudreIdentifiant(saisie: unknown): string {
  const code = normaliserCode(saisie);
  if (code) return codeVersIdentifiant(code);
  if (typeof saisie !== 'string') return '';
  const brut = saisie.trim().toLowerCase();
  // Un e-mail doit contenir « @ » et un point dans le domaine : une saisie
  // quelconque ne doit pas déclencher de recherche en base.
  return /^[^\s@]+@[^\s@.]+\.[^\s@]+$/.test(brut) ? brut : '';
}

/** Nom canonique : espaces normalisés, borné (une liste de classe reste lisible). */
export function normaliserNom(saisie: string): string {
  return saisie.trim().replace(/\s+/g, ' ').slice(0, 60);
}
