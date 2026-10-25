// ============================================================
// facturation.ts — chapelle du modèle « freemium + saison ».
//
// MODÈLE DÉCIDÉ PAR LE PROPRIÉTAIRE (23-24/10/2026) :
//   · Unité 1 (آليات تركيب البروتين) gratuite À VIE — même en
//     invité, même hors ligne ; ses exercices restent ouverts ;
//   · essai COMPLET de 30 jours dès l'ouverture du paywall
//     (comptes anciens compris : le début d'essai effectif ne
//     peut pas précéder la date de mise en service) ;
//   · après essai : abonnement 1200 DA valable JUSQU'AU 30 JUIN
//     de l'année scolaire en cours (achat en juillet-août = saison
//     suivante : l'élève précoce gagne, jamais l'inverse) ;
//   · activation par code vendu après paiement BaridiMob — le RIB
//     ne vit PAS dans l'application (il circule hors app, il n'est
//     jamais inventé ici).
//
// CE QUI EST PROUVÉ ICI, SANS EXPRESS NI BASE RÉELLE : le calcul
// de fin de saison (frontière 30 juin), le début d'essai effectif,
// l'état d'accès (abonnement > essai > gratuit), le format et la
// normalisation des codes, et l'activation (code inconnu, déjà
// pris, réactivation par son propriétaire = idempotente). Les
// dépendances (store, horloge) sont INJECTÉES.
//
// LIMITE ÉCRITE NOIR SUR BLANC : le contenu pédagogique voyage
// dans le bundle client — ce module protège la FACTURATION (codes,
// statuts, échéances), il ne peut pas transformer une page web en
// coffre-fort. La version 1 assume ce choix (verrou interface +
// serveur de facturation), la version 2 verrouillera les fichiers
// HTML côté serveur.
// ============================================================

/** Prix de la saison en dinars (décision propriétaire : 1200 DA). */
export const PRIX_SAISON_DA = 1200;

/** L'unité-échantillon de la promesse gratuite (unitId entier, catalogue 1..11).
 *  Depuis le 2026-10-25, la promesse s'élargit : tout le المجال 1 (unités 1→5)
 *  est gratuit côté client (UNITES_GRATUITES dans src/utils/acces.ts). Ce
 *  constant serveur reste l'unité d'ancrage renvoyée dans l'entitlement. */
export const UNITE_GRATUITE = 1;

/** Durée de l'essai complet, en jours. */
export const DUREE_ESSAI_JOURS = 30;

const JOUR_MS = 24 * 60 * 60 * 1000;

/**
 * Fin de la saison scolaire au sens du contrat : le 30 JUIN.
 *
 * Convention : l'année scolaire va de septembre Y à juin Y+1.
 * Un achat de janvier à juin → 30 juin de l'année en cours ;
 * un achat de juillet à décembre (y compris la trêve d'été, où la
 * saison de juin vient de se fermer) → 30 juin de l'année suivante.
 * Dans les deux cas l'élève précoce est avantagé, jamais l'inverse.
 * Retour au format date seule UTC « YYYY-MM-DD ».
 */
export function finDeSaison(reference: Date): string {
  const annee = reference.getUTCFullYear();
  // getUTCMonth : 0 = janvier … 6 = juillet … 11 = décembre.
  const anneeFin = reference.getUTCMonth() >= 6 ? annee + 1 : annee;
  return `${anneeFin}-06-30`;
}

/** L'essai ne peut pas commencer avant la mise en service du paywall. */
export function essaiDebutEffectif(createdAt: string, lancement: string): string {
  const creation = Date.parse(createdAt);
  const ouverture = Date.parse(lancement);
  if (Number.isNaN(creation)) return lancement;
  const debut = Math.max(creation, ouverture);
  return new Date(debut).toISOString();
}

/** Statut d'accès établi par le serveur — source de vérité. */
export type StatutFacturation = "abonnement" | "essai" | "gratuit";

export interface EtatAcces {
  statut: StatutFacturation;
  /** Fin d'essai ou d'abonnement, « YYYY-MM-DD » ; null si gratuit pur. */
  expireLe: string | null;
  /** Jours restants arrondis au plafond (0 si terminé). */
  joursRestants: number;
}

function joursRestantsVers(expireLe: string, maintenant: Date): number {
  const fin = Date.parse(`${expireLe}T23:59:59.999Z`);
  if (Number.isNaN(fin)) return 0;
  const reste = Math.ceil((fin - maintenant.getTime()) / JOUR_MS);
  return Math.max(0, reste);
}

/**
 * Analyse l'accès d'un compte — purement dérivable : la colonne
 * `created_at` (déjà présente) + la date de mise en service suffisent
 * à encoder l'essai, donc AUCUNE migration n'est nécessaire pour lui.
 * Hiérarchie : un abonnement actif l'emporte toujours sur l'essai.
 */
export function analyserAcces(params: {
  createdAt: string;
  /** Date de mise en service du paywall (env KUNZ_PAYWALL_LANCEMENT). */
  lancement: string;
  abonnementExpireLe?: string | null;
  maintenant?: Date;
}): EtatAcces {
  const maintenant = params.maintenant ?? new Date();

  // 1) Abonnement : actif tant que sa date de péremption n'est pas passée.
  if (params.abonnementExpireLe) {
    const reste = joursRestantsVers(params.abonnementExpireLe, maintenant);
    if (reste > 0) {
      return { statut: "abonnement", expireLe: params.abonnementExpireLe, joursRestants: reste };
    }
  }

  // 2) Essai : 30 jours à compter du début effectif (voir essaiDebutEffectif).
  const debut = essaiDebutEffectif(params.createdAt, params.lancement);
  const finEssai = new Date(Date.parse(debut) + DUREE_ESSAI_JOURS * JOUR_MS);
  const finEssaiJour = finEssai.toISOString().slice(0, 10);
  const resteEssai = joursRestantsVers(finEssaiJour, maintenant);
  if (resteEssai > 0) {
    return { statut: "essai", expireLe: finEssaiJour, joursRestants: resteEssai };
  }

  // 3) Rien : l'unité gratuite reste ouverte, le reste est verrouillé.
  return { statut: "gratuit", expireLe: null, joursRestants: 0 };
}

// ── Codes d'activation ──────────────────────────────────────────

/**
 * Alphabet DES AMBIGUÏTÉS : sans I/L (confondus en majuscules
 * bâton), sans O/0 ni 1 (confondus selon les polices). Un élève qui
 * recopie un code dicté ne doit jamais tributer une lettre indécise.
 */
export const ALPHABET_CODES = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

/** Le code brut est 8 caractères ; présentation : KUNZ-XXXX-XXXX. */
export function genererCodeLicence(decimal8: string): string {
  if (!new RegExp(`^[${ALPHABET_CODES}]{8}$`).test(decimal8)) {
    throw new Error(`code_hors_alphabet: ${decimal8}`);
  }
  return `KUNZ-${decimal8.slice(0, 4)}-${decimal8.slice(4)}`;
}

/** Tire un code complet dans l'alphabet sûr (8 caractères). */
export function tirerCodeAleatoire(alphabet: string, nb: number): string {
  let candidat = "";
  for (let i = 0; i < nb; i += 1) {
    candidat += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return candidat;
}

/**
 * Normalisation d'une saisie élève : majuscules, espaces et tirets
 * arabes ou latins, préfixe KUNZ facultatif (mais le corps doit être
 * EXACTEMENT 8 caractères dans l'alphabet sûr). Retourne le code
 * canonique « KUNZ-XXXX-XXXX » ou null si la saisie n'est pas
 * réparable par normalisation.
 */
export function normaliserCodeSaisi(saisie: unknown): string | null {
  if (typeof saisie !== "string") return null;
  // tirets arabes (U+0627?? non — tiret = U+002D, tiret insécable, U+2010-2015)
  const brut = saisie.toUpperCase().replace(/[\s\u2010-\u2015\u00A0]/g, "");
  const corps = brut.startsWith("KUNZ") ? brut.slice(4) : brut;
  const degage = corps.replace(/^-+/g, "").replace(/-+$/g, "").replace(/-/g, "");
  if (!/^[A-Z0-9]{8}$/.test(degage)) return null;
  // Tout caractère hors alphabet sûr ruine la normalisation silencieuse.
  for (const c of degage) {
    if (!ALPHABET_CODES.includes(c)) return null;
  }
  return `KUNZ-${degage.slice(0, 4)}-${degage.slice(4)}`;
}

/** Ce dont le module a besoin du store — et rien de plus. */
export interface LicenceLue {
  code: string;
  utilisePar: string | null;
  expireLe: string | null;
  /** Empreintes d'appareils déjà attachées à cette licence. */
  appareils: string[];
}

export interface StoreFacturation {
  trouverLicence(code: string): LicenceLue | null | undefined | Promise<LicenceLue | null | undefined>;
  marquerLicenceUtilisee(code: string, studentId: string, expireLe: string): boolean | Promise<boolean>;
  definirAbonnement(studentId: string, expireLe: string): void | Promise<void>;
  /**
   * Enregistre l'empreinte d'appareil sur la licence DE CET élève.
   * Retourne true si l'appareil est (déjà) attaché, false si les places
   * sont prises par d'autres appareils — la garde SQL/PG tranche au
   * vol (une seule instruction, pas de course lisible).
   */
  ajouterAppareilSiPlace(code: string, eleveId: string, appareilId: string): boolean | Promise<boolean>;
  /** La licence portée par cet élève (pour la vérification d'appareil). */
  licenceDe(studentId: string): { code: string; appareils: string[] } | null | undefined | Promise<{ code: string; appareils: string[] } | null | undefined>;
}

export type ResultatActivation =
  | { ok: true; statut: "abonnement"; expireLe: string }
  | {
      ok: false;
      statut: number;
      erreur:
        | "invalid_code_format"
        | "code_inconnu"
        | "code_deja_utilise"
        | "code_appareils_pleins";
    };

/** Combien d'appareils différents peuvent porter le MÊME code. Politique du
 * propriétaire (24/10/2026) : UN SEUL. En cas de souci (téléphone changé,
 * données effacées), l'élève écrit par WhatsApp et reçoit un nouveau code. */
export const MAX_APPAREILS_PAR_CODE = 1;

/**
 * Active un abonnement par code.
 *
 * Règles prouvées ici :
 *   · un code INCONNU → 404 `code_inconnu` (même réponse qu'un code
 *     déjà consommé par QUELQU'UN D'AUTRE → 409 `code_deja_utilise` —
 *     les deux messages ne sont PAS fusionnés : l'élève qui retape
 *     son propre code doit être traité en douceur (idempotent) ;
 *   · réactivation par le MÊME élève → succès idempotent, l'échéance
 *     du jour s'applique au pire cas (jamais un raccourcissement :
 *     on garde la plus généreuse des deux dans le store via faire-max
 *     côté base ? Non — ici, l'échéance du jour EST la plus généreuse,
 *     car un code réactivé le même jour donne la même saison) ;
 *     simplification assumée : réactiver son propre code renvoie la
 *     saison courante, ce qui est toujours ≥ ce qu'il avait.
 */
export async function activerAbonnement(
  store: StoreFacturation,
  entree: {
    eleveId: string;
    code: unknown;
    /** Empreinte d'appareil — absente d'un vieux client (liaison ignorée). */
    appareilId?: unknown;
    maintenant?: Date;
  },
): Promise<ResultatActivation> {
  const code = normaliserCodeSaisi(entree.code);
  if (!code) return { ok: false, statut: 400, erreur: "invalid_code_format" };

  // L'empreinte doit être une chaîne raisonnable (jamais un objet, jamais
  // une longueur démente) : c'est elle qui verrouille le code au téléphone.
  const appareilId =
    typeof entree.appareilId === "string" && entree.appareilId.length >= 8 && entree.appareilId.length <= 128
      ? entree.appareilId
      : null;

  const licence = await Promise.resolve(store.trouverLicence(code));
  if (!licence) return { ok: false, statut: 404, erreur: "code_inconnu" };
  if (licence.utilisePar && licence.utilisePar !== entree.eleveId) {
    return { ok: false, statut: 409, erreur: "code_deja_utilise" };
  }
  if (appareilId && !licence.appareils.includes(appareilId) && licence.appareils.length >= MAX_APPAREILS_PAR_CODE) {
    return { ok: false, statut: 409, erreur: "code_appareils_pleins" };
  }

  const expireLe = finDeSaison(entree.maintenant ?? new Date());
  // Garde de course : entre la lecture et l'écriture, un autre élève peut
  // avoir consommé la licence — la garde SQL/PG du store tranche en dernier.
  if (!licence.utilisePar) {
    const pris = await Promise.resolve(store.marquerLicenceUtilisee(code, entree.eleveId, expireLe));
    if (!pris) return { ok: false, statut: 409, erreur: "code_deja_utilise" };
  }
  if (appareilId) {
    const place = await Promise.resolve(store.ajouterAppareilSiPlace(code, entree.eleveId, appareilId));
    if (!place) return { ok: false, statut: 409, erreur: "code_appareils_pleins" };
  }
  await Promise.resolve(store.definirAbonnement(entree.eleveId, expireLe));
  return { ok: true, statut: "abonnement", expireLe };
}

/**
 * Vérification à CHAQUE ouverture : l'abonnement vaut-il encore sur CET
 * appareil ? Règle : une licence SANS empreinte (vieux code, ou élève
 * activé avant la liaison) laisse passer — on ne punît pas un achat ancien ;
 * un appareil DÉJÀ ATTACHÉ passe ; un appareil inconnu est refusé.
 */
export function appareilAutorise(licence: { appareils: string[] } | null | undefined, appareilId: string | null): boolean {
  if (!licence || licence.appareils.length === 0) return true; // pas de liaison connue
  if (!appareilId) return false; // une licence liée exigée : un client sans empreinte ne passe pas
  return licence.appareils.includes(appareilId);
}
