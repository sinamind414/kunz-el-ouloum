// ============================================================
// profilErreurs.ts — LA MÉMOIRE DU GUIDE, ET ELLE RESTE DANS LE TÉLÉPHONE.
//
// CE QUI EXISTE DÉJÀ, ET CE QUI MANQUAIT (audit du 14/10/2026).
//
// L'application SAIT produire des erreurs typées : `methodologyScorer` renvoie
// `detectedErrors`, dont les `tag` sont les clés de `ERROR_TAXONOMY` — neuf
// types réels, chacun avec son nom arabe, son exemple et sa contre-mesure
// (« أعِد كتابة كل قيمة متبوعة بوحدتها » pour `missing_unit`, etc.).
//
// Mais elle n'en gardait AUCUNE trace par élève. Ce qu'elle gardait,
// `smart_tutor_session.mistakes`, est une liste d'IDENTIFIANTS DE CARTES
// (« l'élève a raté la carte 12 ») : cela dit quoi réviser, jamais POURQUOI il
// se trompe. Un guide qui sait seulement « carte 12 ratée » ne peut pas dire
// « tu confonds l'observation et l'interprétation » — et c'est exactement ce
// que la demande du 14/10/2026 attend de lui.
//
// ─────────────────────────────────────────────────────────────────────────────
// OÙ VIT CETTE MÉMOIRE : dans le téléphone, et nulle part ailleurs.
//
// La promesse publiée est « en mode invité, rien ne quitte ton téléphone »
// (politique §3) et « pas d'outil de suivi externe » (§4). Un profil d'erreurs
// envoyé au serveur sans le dire romprait cette promesse — et c'est précisément
// le débat des niveaux 1 à 3 de `docs/MESURE_ET_ANONYMAT.md`.
// Donc : `localStorage`, aucune requête réseau, aucun identifiant.
//
// À NOTER, ET C'EST DÉJÀ LE CAS AILLEURS : quand un élève CONNECTÉ enregistre
// une production, ses `errorTags` partent vers le serveur — c'est la colonne
// `top_errors` de l'export du professeur, et c'est voulu, l'élève le sait. Ce
// module ne fait qu'ajouter la version LOCALE, plus fine (compteurs, récurrence,
// thèmes), disponible même sans compte et sans réseau.
//
// DEUX FAMILLES D'ERREURS, UNE SEULE EST ALIMENTÉE AUJOURD'HUI — dit franchement:
//   · erreurs de MÉTHODE (les 9 de `ERROR_TAXONOMY`) : alimentées par les
//     productions corrigées, dès maintenant ;
//   · confusions de NOTIONS (« ADN / ARNm », « codon / anticodon ») : AUCUN
//     producteur aujourd'hui. Les QCM ne portent pas d'étiquette de notion, donc
//     le code les accepte (la structure est prête) mais rien ne les remplit.
//     Inventer ces confusions serait pire que de ne pas les avoir : le guide
//     affirmerait des choses fausses sur l'élève.
// ============================================================

// Import LÉGER délibéré : `methodologyEngine` (105 Ko) ne doit pas entrer
// dans le bundle d'entrée par ce fichier (voir data/errorTaxonomy.ts).
import { ERROR_TAXONOMY } from '../data/errorTaxonomy';
import type { ProfilPourLeGuide } from '../data/capitaine';

const CLE = 'boussole_profil_erreurs';

/** Nombre de types d'erreur suivis — on ne garde pas un historique sans fin. */
const MAX_TYPES = 24;
/** Nombre de thèmes mémorisés par type d'erreur. */
const MAX_THEMES = 6;

export interface CompteurErreur {
  /** Nombre de fois où ce type d'erreur a été repris. */
  n: number;
  /** Dernière fois (ISO). */
  dernier: string;
  /** Thèmes où il est apparu, du plus récent au plus ancien. */
  themes: string[];
}

export type ProfilErreurs = Record<string, CompteurErreur>;

function lire(): ProfilErreurs {
  try {
    const brut = localStorage.getItem(CLE);
    if (!brut) return {};
    const o = JSON.parse(brut) as unknown;
    if (typeof o !== 'object' || o === null || Array.isArray(o)) return {};
    const propre: ProfilErreurs = {};
    for (const [code, v] of Object.entries(o as Record<string, unknown>)) {
      if (typeof code !== 'string' || code.length === 0 || code.length > 64) continue;
      const c = v as Partial<CompteurErreur>;
      if (typeof c?.n !== 'number' || !Number.isFinite(c.n) || c.n <= 0) continue;
      propre[code] = {
        n: Math.floor(c.n),
        dernier: typeof c.dernier === 'string' ? c.dernier : '',
        themes: Array.isArray(c.themes)
          ? c.themes.filter((t): t is string => typeof t === 'string').slice(0, MAX_THEMES)
          : [],
      };
    }
    return propre;
  } catch {
    return {};
  }
}

function ecrire(profil: ProfilErreurs): void {
  try {
    // Si le profil dépasse la limite, on garde les types les plus RÉCENTS :
    // un profil de travail parle du trimestre, pas de l'année dernière.
    const entrees = Object.entries(profil);
    const retenues =
      entrees.length <= MAX_TYPES
        ? entrees
        : entrees.sort((a, b) => (b[1].dernier || '').localeCompare(a[1].dernier || '')).slice(0, MAX_TYPES);
    localStorage.setItem(CLE, JSON.stringify(Object.fromEntries(retenues)));
  } catch {
    /* stockage plein ou indisponible : on perd le profil, jamais le travail */
  }
}

/**
 * Enregistre les erreurs détectées sur une production.
 *
 * Les codes INCONNUS de la taxonomie sont ignorés : le profil ne doit contenir
 * que des erreurs que l'application sait expliquer. Un code orphelin
 * produirait un message de guide vide — ou pire, un message inventé.
 */
export function enregistrerErreurs(
  codes: unknown,
  contexte: { theme?: string; quand?: Date } = {},
): number {
  if (!Array.isArray(codes)) return 0;
  const quand = (contexte.quand ?? new Date()).toISOString();
  const theme = typeof contexte.theme === 'string' ? contexte.theme.slice(0, 120) : '';
  const profil = lire();
  let enregistrees = 0;
  for (const code of codes) {
    if (typeof code !== 'string' || !(code in ERROR_TAXONOMY)) continue;
    const courant = profil[code] ?? { n: 0, dernier: '', themes: [] };
    const themes = theme
      ? [theme, ...courant.themes.filter((t) => t !== theme)].slice(0, MAX_THEMES)
      : courant.themes;
    profil[code] = { n: courant.n + 1, dernier: quand, themes };
    enregistrees += 1;
  }
  if (enregistrees > 0) ecrire(profil);
  return enregistrees;
}

/** Profil brut — pour l'affichage détaillé et les tests. */
export function profilErreurs(): ProfilErreurs {
  return lire();
}

/**
 * L'erreur dominante : celle qu'il faut travailler maintenant.
 *
 * Classement : le NOMBRE d'abord (ce qui revient est ce qui coûte), puis la
 * RÉCENCE. Égalité parfaite → ordre alphabétique du code, pour que le résultat
 * soit stable et testable (un classement instable ferait clignoter le message).
 */
export function erreurDominante(): {
  code: string;
  nomAr: string;
  contreMesureAr: string;
  occurrences: number;
  themes: string[];
} | null {
  const profil = lire();
  const entrees = Object.entries(profil);
  if (entrees.length === 0) return null;
  const triees = entrees.sort((a, b) => {
    if (b[1].n !== a[1].n) return b[1].n - a[1].n;
    const r = (b[1].dernier || '').localeCompare(a[1].dernier || '');
    if (r !== 0) return r;
    return a[0].localeCompare(b[0]);
  });
  const [code, compteur] = triees[0];
  const item = ERROR_TAXONOMY[code];
  if (!item) return null;
  return {
    code,
    nomAr: item.nameAr,
    contreMesureAr: item.counterActionAr,
    occurrences: compteur.n,
    themes: compteur.themes,
  };
}

/** Forme attendue par `messagePersonnalise()` du guide. */
export function profilPourLeGuide(): ProfilPourLeGuide | null {
  const d = erreurDominante();
  if (!d) return null;
  return {
    codeDominant: d.code,
    nomAr: d.nomAr,
    occurrences: d.occurrences,
    contreMesureAr: d.contreMesureAr,
  };
}

/** Nombre total d'erreurs mémorisées (0 = profil vide, cas normal au début). */
export function totalErreurs(): number {
  return Object.values(lire()).reduce((s, c) => s + c.n, 0);
}

/** L'élève a travaillé ses erreurs : on repart proprement pour ce type. */
export function oublierErreur(code: string): void {
  const profil = lire();
  if (!(code in profil)) return;
  delete profil[code];
  ecrire(profil);
}

/** Remise à zéro complète (bouton « repartir de zéro » côté élève). */
export function effacerProfilErreurs(): void {
  try {
    localStorage.removeItem(CLE);
  } catch {
    /* ignore */
  }
}

/**
 * Phrase courte pour l'élève : nomme l'erreur dominante et sa contre-mesure.
 * Renvoie `null` s'il n'y a rien d'utile à dire — le silence vaut mieux qu'un
 * message qui répète « continue ainsi ».
 */
export function resumeProfilAr(): string | null {
  const d = erreurDominante();
  if (!d || d.occurrences < 2) return null;
  return `${d.nomAr} — ${d.occurrences} مرات. ${d.contreMesureAr}`;
}
