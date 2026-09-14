// dictionnaireCorrecteur.ts
// Pont typé entre le DICTIONNAIRE FINAL du correcteur
// (src/data/dictionaries/dictionnaire_final.json — build généré, NE PAS éditer,
// sources = fichiers data/) et le moteur de correction (correcteurV1).
//
// RÈGLE MOTEUR du build (meta.regle_moteur) — appliquée à la lettre :
//   · notation sur fiabilité « officiel » + « verifie »  → pool scoré ;
//   · « a_valider » = piste + flag AMBIGUITE_LEXICALE → tolérée, JAMAIS notée
//     (remontée en feedback prudent via evaluerPistes / pistesAmbigues).
//
// Rattachement aux unités : une entité est rattachée aux unités du programme
// citées dans ses sources (refs « D1U4 », « D3U3-act5 L5616 », « D2U2-حصيلة »…).
// Constat build : AUCUNE entité a_valider n'est rattachée à une unité → les
// pistes ambiguës sont TRANSVERSALES (scan de la réponse, hors notation).
// Les entités sans unité (surtout « paires (FR) » OCR) restent hors index unité :
// elles ne doivent pas polluer la couverture d'une unité par faux positifs.
//
// Anti-artefacts OCR (constatés dans le build) :
//   · forme sans AUCUNE lettre (ex. E0570 canonique_ar « 66115 ») → exclue ;
//     l'entité survit si une variante est valide (E0570 → « CCR5 ») ;
//   · forme normalisée < 3 caractères → exclue (includes() pas fiable).

import dictionnaireJson from './dictionnaire_final.json';
import { normalizeAr } from '../../lib/validation/normalizeAr';

// ────────────────────────────────────────────────────────────────────────────
// Types publics
// ────────────────────────────────────────────────────────────────────────────

export type Fiabilite = 'officiel' | 'verifie' | 'a_valider';

export interface EntiteCorrecteur {
  /** Id de build (E0036…), traçabilité vers le dictionnaire. */
  id: string;
  canoniqueAr: string;
  canoniqueFr: string;
  /** Formes arabes reconnues (canonique + variantes, valides, dédupliquées). */
  formes: string[];
  /** Formes normalisées, même ordre que `formes` (recherche includes). */
  formesNorm: string[];
  fiabilite: Fiabilite;
  /** Unités du programme (1..11) rattachées via les refs sources. */
  unites: number[];
  /** Traçabilité build : nombre de sources de l'entité (contrat ≥ 1). */
  nbSources: number;
}

export interface EntiteDetectee {
  id: string;
  /** Forme arabe effectivement reconnue dans la réponse ('' si absente). */
  terme: string;
  canoniqueFr: string;
  fiabilite: Fiabilite;
}

export interface ResultatEntites {
  uniteId: number;
  /** Entités officiel+verifie reconnues — notables (règle moteur). */
  trouvees: EntiteDetectee[];
  /** Entités officiel+verifie attendues pour l'unité mais absentes. */
  manquantes: EntiteDetectee[];
  /** Pistes ambiguës (a_valider) détectées — AMBIGUITE_LEXICALE, jamais notées. */
  pistesAmbigues: EntiteDetectee[];
  /** Entités scorées attendues pour l'unité (trouvees + manquantes). */
  total: number;
  /** Couverture 0..1 des entités scorées (1 si pool vide, comme les mots-clés). */
  couvertureEntites: number;
}

export interface FauxAmi {
  statut?: string;
  erreur?: string;
  correct?: string;
  regle_moteur?: string;
}

export interface ConflitRef {
  statut?: string;
  regle_moteur?: string;
  contexte_bac?: string;
}

export interface AttenduBareme {
  statut?: string;
  fr?: string;
  ar?: string;
  points?: number;
}

export interface UniteBuild {
  titreAr: string;
  titreFr: string;
  domaine: string;
}

// ────────────────────────────────────────────────────────────────────────────
// Mapping unités du build → ids du correcteur V1
// D1U1..D1U5 → 1..5 (protéines) · D2U1..D2U3 → 6..8 (énergie) · D3U1..D3U3 → 9..11
// ────────────────────────────────────────────────────────────────────────────

export const CODE_UNITE_VERS_ID: Readonly<Record<string, number>> = {
  D1U1: 1, D1U2: 2, D1U3: 3, D1U4: 4, D1U5: 5,
  D2U1: 6, D2U2: 7, D2U3: 8,
  D3U1: 9, D3U2: 10, D3U3: 11,
};

// ────────────────────────────────────────────────────────────────────────────
// Chargement du build + helpers
// ────────────────────────────────────────────────────────────────────────────

interface EntiteBrute {
  canonique_ar?: string;
  canonique_fr?: string;
  variantes_ar?: string[];
  fiabilite?: string;
  sources?: { livre?: number | string; ref?: string }[];
}

interface DictionnaireFinal {
  meta?: { regle_moteur?: string };
  entites?: Record<string, EntiteBrute>;
  unites?: Record<string, { titre_ar?: string; titre_fr?: string; domaine?: string }>;
  faux_amis?: Record<string, FauxAmi>;
  conflits?: Record<string, ConflitRef>;
  attendus?: Record<string, AttenduBareme>;
  flags?: Record<string, string>;
}

const dictionnaire = dictionnaireJson as unknown as DictionnaireFinal;

/** Règle moteur déclarée par le build (contrat lu depuis meta). */
export const REGLE_MOTEUR: string =
  dictionnaire.meta?.regle_moteur ??
  'notation sur fiabilite officiel+verifie ; a_valider = piste + flag AMBIGUITE_LEXICALE';

const RE_UNITE = /(D[123]U\d)/g;
const RE_LETTER = /[\u0600-\u06FFa-zA-Z]/;

/** Forme exploitable : contient au moins une lettre et ≥ 3 caractères normalisés. */
function formeValide(brute: unknown): brute is string {
  if (typeof brute !== 'string' || !brute) return false;
  if (!RE_LETTER.test(brute)) return false;
  return normalizeAr(brute).length >= 3;
}

function estFiabilite(f: unknown): f is Fiabilite {
  return f === 'officiel' || f === 'verifie' || f === 'a_valider';
}

function construireEntite(id: string, e: EntiteBrute): EntiteCorrecteur | null {
  const candidats = [e.canonique_ar, ...(e.variantes_ar ?? [])].filter(formeValide);
  if (candidats.length === 0) return null;
  // Déduplication par forme normalisée (ex. E0036 « الإدماج » = « الادماج » après
  // normalizeAr : une seule forme conservée).
  const formes: string[] = [];
  const formesNorm: string[] = [];
  const vus = new Set<string>();
  for (const f of candidats) {
    const nf = normalizeAr(f);
    if (!nf || vus.has(nf)) continue;
    vus.add(nf);
    formes.push(f);
    formesNorm.push(nf);
  }
  const unites = new Set<number>();
  for (const s of e.sources ?? []) {
    const ms = String(s?.ref ?? '').match(RE_UNITE);
    if (!ms) continue;
    for (const code of ms) {
      const uid = CODE_UNITE_VERS_ID[code];
      if (uid !== undefined) unites.add(uid);
    }
  }
  return {
    id,
    canoniqueAr: formeValide(e.canonique_ar) ? e.canonique_ar : formes[0]!,
    canoniqueFr: typeof e.canonique_fr === 'string' ? e.canonique_fr : '',
    formes,
    formesNorm,
    fiabilite: estFiabilite(e.fiabilite) ? e.fiabilite : 'a_valider',
    unites: [...unites].sort((a, b) => a - b),
    nbSources: (e.sources ?? []).length,
  };
}

// ────────────────────────────────────────────────────────────────────────────
// Index construits une fois au chargement du module (617 entités — négligeable)
// ────────────────────────────────────────────────────────────────────────────

const TOUTES: EntiteCorrecteur[] = Object.entries(dictionnaire.entites ?? {})
  .map(([id, e]) => construireEntite(id, e ?? {}))
  .filter((x): x is EntiteCorrecteur => x !== null);

/** Toutes les entités exploitables du dictionnaire (les 3 fiabilités). */
export const ENTITES_DICTIONNAIRE: readonly EntiteCorrecteur[] = TOUTES;

// Index scoré par unité (officiel + verifie uniquement — règle moteur).
const INDEX_SCOREES = new Map<number, EntiteCorrecteur[]>();
for (const e of TOUTES) {
  if (e.fiabilite === 'a_valider') continue; // pistes transversales, jamais par unité
  for (const uid of e.unites) {
    const liste = INDEX_SCOREES.get(uid);
    if (liste) liste.push(e);
    else INDEX_SCOREES.set(uid, [e]);
  }
}

// Entités ambiguës (transversales — aucune rattachée à une unité dans le build).
const AMBIGUES: EntiteCorrecteur[] = TOUTES.filter((e) => e.fiabilite === 'a_valider');

/** Entités scorées (officiel + verifie) rattachées à l'unité — règle moteur du build. */
export function entitesUnite(uniteId: number): EntiteCorrecteur[] {
  return INDEX_SCOREES.get(uniteId) ?? [];
}

/** Entités « a_valider » (transversales) — pistes AMBIGUITE_LEXICALE, jamais notées. */
export function entitesAmbigues(): EntiteCorrecteur[] {
  return AMBIGUES;
}

/**
 * Formes arabes du pool scoré de l'unité (canonique + variantes, dédupliquées).
 * Sert à enrichir la banque de mots-clés du correcteur V1 (chemin par défaut).
 */
export function formesArUnite(uniteId: number): string[] {
  const vus = new Set<string>();
  const out: string[] = [];
  for (const e of entitesUnite(uniteId)) {
    for (let i = 0; i < e.formes.length; i++) {
      const nf = e.formesNorm[i]!;
      if (vus.has(nf)) continue;
      vus.add(nf);
      out.push(e.formes[i]!);
    }
  }
  return out;
}

/** 1re forme de l'entité présente dans la réponse (casse latine libre). */
function detecter(normLower: string, e: EntiteCorrecteur): string | null {
  for (let i = 0; i < e.formesNorm.length; i++) {
    if (normLower.includes(e.formesNorm[i]!.toLowerCase())) return e.formes[i]!;
  }
  return null;
}

/**
 * Pistes ambiguës (a_valider) détectées dans la réponse — TRANSVERSAL, advisory :
 * flag AMBIGUITE_LEXICALE, « tolérée, non pénalisante » (flags du build).
 * Jamais mélangées au pool scoré : une a_valider ne peut pas être notée.
 */
export function evaluerPistes(reponse: string): EntiteDetectee[] {
  const normLower = normalizeAr(reponse || '').toLowerCase();
  if (!normLower) return [];
  const pistes: EntiteDetectee[] = [];
  for (const e of AMBIGUES) {
    const terme = detecter(normLower, e);
    if (terme) {
      pistes.push({ id: e.id, terme, canoniqueFr: e.canoniqueFr, fiabilite: e.fiabilite });
    }
  }
  return pistes;
}

/**
 * Évaluation au niveau ENTITÉS du dictionnaire pour une unité — complément
 * sémantique des mots-clés L1..L6 du correcteur V1 :
 *   · trouvees/manquantes = entités officiel+verifie (notables, règle moteur) ;
 *   · pistesAmbigues = a_valider détectées (transversal, jamais notées).
 */
export function evaluerEntites(reponse: string, uniteId: number): ResultatEntites {
  const normLower = normalizeAr(reponse || '').toLowerCase();
  const scorees = entitesUnite(uniteId);
  const trouvees: EntiteDetectee[] = [];
  const manquantes: EntiteDetectee[] = [];
  for (const e of scorees) {
    const terme = normLower ? detecter(normLower, e) : null;
    const d: EntiteDetectee = {
      id: e.id,
      terme: terme ?? '',
      canoniqueFr: e.canoniqueFr,
      fiabilite: e.fiabilite,
    };
    if (terme) trouvees.push(d);
    else manquantes.push(d);
  }
  return {
    uniteId,
    trouvees,
    manquantes,
    pistesAmbigues: evaluerPistes(reponse),
    total: scorees.length,
    couvertureEntites: scorees.length === 0 ? 1 : trouvees.length / scorees.length,
  };
}

// ────────────────────────────────────────────────────────────────────────────
// Sections annexes du build exposées pour les couches supérieures
// ────────────────────────────────────────────────────────────────────────────

/** Confusions sanctionnables (ex. courbe de Michaelis dite « en cloche »). */
export const FAUX_AMIS: Readonly<Record<string, FauxAmi>> = dictionnaire.faux_amis ?? {};

/** Conflits de sources actifs (ex. ATP 38 vs 30-32) — accepter les deux + tagger. */
export const CONFLITS: Readonly<Record<string, ConflitRef>> = dictionnaire.conflits ?? {};

/** Attendus officiels des barèmes BAC (80 items, statut/fr/ar/points). */
export const ATTENDUS_BAREME: Readonly<Record<string, AttenduBareme>> =
  dictionnaire.attendus ?? {};

/** Description des flags du moteur (AMBIGUITE_LEXICALE, CONFLIT_REF…). */
export const FLAGS_DICTIONNAIRE: Readonly<Record<string, string>> = dictionnaire.flags ?? {};

/** Unités du build (titres AR/FR + domaine), clé = code D1U1..D3U3. */
export const UNITES_BUILD: Readonly<Record<string, UniteBuild>> = Object.fromEntries(
  Object.entries(dictionnaire.unites ?? {}).map(([code, u]) => [
    code,
    {
      titreAr: u.titre_ar ?? '',
      titreFr: u.titre_fr ?? '',
      domaine: u.domaine ?? '',
    },
  ]),
);

// ────────────────────────────────────────────────────────────────────────────
// Détection transversale + inférence d'unité (couches supérieures : UI, barème)
// ────────────────────────────────────────────────────────────────────────────

/**
 * Détection SANS unité imposée : scan de toutes les entités scorées (toutes
 * unités confondues) + pistes ambiguës. Sert au panneau de correction quand
 * l'unité n'est pas déclarée, et aux signatures du barème.
 */
export function entitesDansTexte(texte: string): {
  trouvees: EntiteDetectee[];
  pistes: EntiteDetectee[];
} {
  const normLower = normalizeAr(texte || '').toLowerCase();
  const trouvees: EntiteDetectee[] = [];
  if (!normLower) return { trouvees, pistes: [] };
  for (const e of TOUTES) {
    if (e.fiabilite === 'a_valider') continue;
    const terme = detecter(normLower, e);
    if (terme) {
      trouvees.push({ id: e.id, terme, canoniqueFr: e.canoniqueFr, fiabilite: e.fiabilite });
    }
  }
  return { trouvees, pistes: evaluerPistes(texte) };
}

/**
 * Unité la plus probable pour un texte libre : unité maximisant le nombre
 * d'entités scorées reconnues. null si aucune entité scorée détectée.
 */
export function inferreUnite(texte: string): { uniteId: number; score: number } | null {
  const normLower = normalizeAr(texte || '').toLowerCase();
  if (!normLower) return null;
  let best: { uniteId: number; score: number } | null = null;
  for (let uid = 1; uid <= 11; uid++) {
    let score = 0;
    for (const e of entitesUnite(uid)) {
      if (detecter(normLower, e)) score++;
    }
    if (score > 0 && (!best || score > best.score)) best = { uniteId: uid, score };
  }
  return best;
}

/** Titre arabe de l'unité (depuis le build D1U1..D3U3), '' si id inconnu. */
export function titreUnite(uniteId: number): string {
  const code = Object.entries(CODE_UNITE_VERS_ID).find(([, id]) => id === uniteId)?.[0];
  return (code && UNITES_BUILD[code]?.titreAr) || '';
}