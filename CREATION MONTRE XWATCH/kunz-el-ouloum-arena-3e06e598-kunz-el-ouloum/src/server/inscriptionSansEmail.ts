// ============================================================
// inscriptionSansEmail.ts — chapelle du parcours « je n'ai pas
// d'adresse e-mail », testable de bout en bout.
//
// POURQUOI ce module existe :
// l'inscription exigeait `email + password + name`, avec un
// formulaire qui affichait un exemple « eleve@ecole.dz » — une
// adresse SCOLAIRE que la quasi-totalité des élèves algériens
// n'ont pas. Résultat : abandon à l'inscription, alors que le
// mode invité fonctionne (le produit n'était donc pas bloqué,
// mais l'élève ne pouvait pas être suivi par son professeur).
//
// CE QUI EST PROUVÉ ICI (et pas ailleurs) : la génération du
// code, la collision, la validation du nom et du code secret,
// la connexion par code (majuscules/minuscules/espaces/tirets/
// chiffres arabo-indiens) ET par adresse e-mail — le tout sans
// express, sans SQLite, sans bcrypt réels : les dépendances sont
// INJECTÉES. C'est la seule façon, dans un dépôt sans binaire
// natif compilable, de tester autre chose que la lecture du code
// source.
//
// LIMITE DE SÉCURITÉ ASSUMÉE, ÉCRITE NOIR SUR BLANC :
// un code de connexion affiché, dicté ou photographié n'est PAS
// un secret. Ce dispositif protège contre la devinette en ligne
// (limiteurs de débit), pas contre un camarade qui a lu le code.
// Il ne doit jamais être présenté comme une garantie bancaire.
// ============================================================

import {
  codeDepuisIdentifiant,
  codeVersIdentifiant,
  estCodeSecretValide,
  estNomValide,
  formaterCode,
  genererCode,
  normaliserNom,
  resoudreIdentifiant,
} from "./codeEleve";

/** Chemin de stockage minimal dont ce module a besoin (3 méthodes). */
export interface EleveStocke {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
}

export interface StoreComptes {
  /** `undefined` inclus : c'est ce que renvoie le store SQLite réel. */
  findStudentByEmail(email: string): EleveStocke | null | undefined | Promise<EleveStocke | null | undefined>;
  createStudent(
    id: string,
    email: string,
    passwordHash: string,
    name: string,
  ): EleveStocke | Promise<EleveStocke>;
}

/** Dépendances techniques (bcrypt et JWT en production, doublures en test). */
export interface OutilsAuth {
  hacher(motDePasse: string): Promise<string>;
  verifier(motDePasse: string, hash: string): Promise<boolean>;
  signer(eleve: { studentId: string; email: string }): string;
  /** Fourni pour rendre la collision reproductible en test. */
  genererCode?: () => string;
  /** Fourni pour rendre les identifiants reproductibles en test. */
  idEleve?: () => string;
}

/**
 * Réponse d'API prête à être sérialisée. Invariant : un compte sans adresse
 * e-mail ne laisse JAMAIS filtrer `<code>@eleve.local` — `email` vaut `null`
 * et le code affichable prend sa place (`code`).
 */
export interface ElevePublic {
  id: string;
  name: string;
  email: string | null;
  code: string | null;
}

export type Resultat =
  | { ok: true; statut: number; token: string; eleve: ElevePublic }
  | { ok: false; statut: number; erreur: string };

const NB_ESSAIS_CODE = 5;

/**
 * Crée un compte SANS adresse e-mail.
 *
 * Identifiant rangé dans la colonne `email` existante : `<code>@eleve.local`
 * (`.local` est réservé par la RFC 6762 → aucun domaine public ne peut
 * l'écraser, et l'index `UNIQUE` garantit l'unicité du code sans migration
 * de base sur SQLite, PostgreSQL ni store dégradé).
 */
export async function inscrireSansEmail(
  store: StoreComptes,
  entree: { name?: unknown; pin?: unknown },
  outils: OutilsAuth,
): Promise<Resultat> {
  if (!estNomValide(entree?.name)) return { ok: false, statut: 400, erreur: "missing_name" };
  if (!estCodeSecretValide(entree?.pin)) return { ok: false, statut: 400, erreur: "weak_pin" };

  const nom = normaliserNom(String(entree.name));
  const passwordHash = await outils.hacher(String(entree.pin).trim());

  // Collision improbable (31^8 ≈ 8,5 × 10¹¹) mais pas impossible : on
  // vérifie avant d'écrire, et si la base refuse quand même (course entre
  // deux inscriptions simultanées), l'appelant renvoie 409.
  const tireCode = outils.genererCode ?? genererCode;
  let identifiant = "";
  let code = "";
  for (let essai = 0; essai < NB_ESSAIS_CODE && !identifiant; essai += 1) {
    const candidat = tireCode();
    const interne = codeVersIdentifiant(candidat);
    const dejaPris = await Promise.resolve(store.findStudentByEmail(interne));
    if (!dejaPris) {
      identifiant = interne;
      code = formaterCode(candidat);
    }
  }
  if (!identifiant) return { ok: false, statut: 503, erreur: "code_generation_failed" };

  const identifiantEleve = (outils.idEleve ?? (() => `stu_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`))();
  const eleve = await Promise.resolve(store.createStudent(identifiantEleve, identifiant, passwordHash, nom));

  // Le code n'est renvoyé QUE ici : c'est la seule occasion de le montrer à
  // l'élève. Il reste consultable par le professeur (tableau de bord).
  const public_ = donneesPubliques(eleve);
  return {
    ok: true,
    statut: 201,
    token: outils.signer({ studentId: eleve.id, email: eleve.email }),
    // Le code est garanti présent ici : on vient de le tirer.
    eleve: { ...public_, code: public_.code ?? code },
  };
}

/**
 * Connexion unique pour les deux populations : l'élève qui a un CODE et
 * celui qui a une adresse e-mail. Une saisie qui n'est ni l'un ni l'autre
 * ne déclenche aucune recherche en base et donne le même 401 que des
 * identifiants erronés — aucune indication sur l'existence du compte.
 */
export async function connecterParIdentifiant(
  store: StoreComptes,
  entree: { identifiant?: unknown; email?: unknown; password?: unknown },
  outils: OutilsAuth,
): Promise<Resultat> {
  const brut = entree?.identifiant ?? entree?.email;
  const identifiant = resoudreIdentifiant(brut);
  if (!identifiant) return { ok: false, statut: 401, erreur: "invalid_credentials" };

  const motDePasse = entree?.password;
  const eleve = await Promise.resolve(store.findStudentByEmail(identifiant));
  if (!eleve) return { ok: false, statut: 401, erreur: "invalid_credentials" };

  const bon = await outils.verifier(String(motDePasse ?? ""), eleve.passwordHash);
  if (!bon) return { ok: false, statut: 401, erreur: "invalid_credentials" };

  return {
    ok: true,
    statut: 200,
    token: outils.signer({ studentId: eleve.id, email: eleve.email }),
    eleve: donneesPubliques(eleve),
  };
}

/**
 * Valide un NOUVEAU code secret (réinitialisation par code du professeur).
 *
 * Règle de cohérence, et non de simple confort : un compte sans adresse e-mail
 * se connecte depuis l'écran « بالرمز », dont le champ secret est piloté par un
 * clavier à 6 chiffres. Si la réinitialisation acceptait un mot de passe
 * alphabétique, l'élève se retrouverait DÉFINITIVEMENT dehors — il n'a pas
 * d'adresse e-mail de secours pour passer par l'autre voie (défaut trouvé le
 * 14/10/2026 en rédigeant le bilan des accès élève).
 *
 * Les comptes à adresse e-mail gardent la politique historique : 6 caractères.
 */
export function validerNouveauSecret(
  eleve: { email: string },
  motDePasse: unknown,
): { ok: true } | { ok: false; statut: number; erreur: "weak_password" | "weak_pin" } {
  const sansEmail = codeDepuisIdentifiant(eleve.email) !== null;
  if (sansEmail) {
    return estCodeSecretValide(motDePasse)
      ? { ok: true }
      : { ok: false, statut: 400, erreur: "weak_pin" };
  }
  const assezLong = typeof motDePasse === "string" && motDePasse.length >= 6;
  return assezLong ? { ok: true } : { ok: false, statut: 400, erreur: "weak_password" };
}

/**
 * Ce qu'on a le droit de renvoyer au client. Pour un compte sans adresse
 * e-mail, `email` est l'adresse technique interne : elle est remplacée par
 * le code affichable, jamais exposée.
 */
export function donneesPubliques(eleve: {
  id: string;
  email: string;
  name: string;
}): ElevePublic {
  const code = codeDepuisIdentifiant(eleve.email);
  // Compte sans e-mail → `email: null` (jamais l'adresse technique) et le
  // code sert d'identifiant affichable. Compte classique → e-mail, pas de code.
  return { id: eleve.id, name: eleve.name, email: code ? null : eleve.email, code };
}
