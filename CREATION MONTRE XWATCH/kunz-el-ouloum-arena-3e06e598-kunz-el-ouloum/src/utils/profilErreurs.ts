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

/**
 * REGISTRE DES ERREURS FERMÉES — le capital, en dur dans le téléphone.
 *
 * Séparé du profil (qui contient les erreurs OUVERTES) parce qu'il ne joue pas
 * le même rôle : le profil dit « voilà ce qui ne va pas », le registre dit
 * « voilà ce qui est réglé ». Ouvrir le second pour lire le premier effacerait
 * la seule trace qui ne se remet jamais à zéro.
 *
 * POURQUOI IL EXISTE (15/10/2026). `oublierErreur()` existait déjà — et n'était
 * appelée nulle part sauf dans son propre test. Or c'est l'événement le plus
 * précieux du produit : le seul capital qui monte même quand la série casse,
 * celui qui se comporte vraiment comme des intérêts composés. Sans registre, on
 * ne peut ni le compter, ni le montrer à l'élève, ni féliciter honnêtement.
 */
const CLE_FERMEES = 'boussole_erreurs_fermees';

/** Borne du registre : un téléphone d'entrée de gamme, pas un entrepôt. */
const MAX_FERMEES = 40;

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

/** Comment une erreur a été fermée. */
export type OrigineFermeture = 'production_propre' | 'reprise_manuelle';

export interface ErreurFermee {
  code: string;
  /** Thème (ou unité) où l'erreur a été fermée — pour la nommer, pas seulement la compter. */
  theme?: string;
  /** Horodatage de la fermeture. */
  fermeMs: number;
  par: OrigineFermeture;
  /**
   * Horodatage de la RÉOUVERTURE éventuelle. Une erreur « fermée » qui revient
   * est le révélateur le plus honnête de ce produit : elle dit que le diagnostic
   * était faux. On la garde au lieu de l'effacer — c'est une information, pas une
   * honte, et c'est le seul moyen de mesurer si la fermeture valait quelque chose.
   */
  reouverteMs?: number;
}

function lireFermees(): ErreurFermee[] {
  try {
    const brut = localStorage.getItem(CLE_FERMEES);
    if (!brut) return [];
    const j = JSON.parse(brut) as unknown;
    if (!Array.isArray(j)) return [];
    return j
      .filter((e): e is ErreurFermee => {
        const x = e as Partial<ErreurFermee> | null;
        return Boolean(
          x &&
            typeof x.code === 'string' &&
            x.code.length > 0 &&
            x.code.length <= 64 &&
            typeof x.fermeMs === 'number' &&
            Number.isFinite(x.fermeMs),
        );
      })
      .slice(0, MAX_FERMEES);
  } catch {
    return [];
  }
}

function ecrireFermees(entrees: ErreurFermee[]): void {
  try {
    localStorage.setItem(CLE_FERMEES, JSON.stringify(entrees.slice(0, MAX_FERMEES)));
  } catch {
    /* stockage plein : on perd le registre, jamais le travail de l'élève */
  }
}

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
  if (enregistrees > 0) {
    ecrire(profil);
    // RÉOUVERTURE : une erreur qu'on croyait fermée vient de réapparaître.
    // C'est l'information la plus honnête du produit — elle dit que la fermeture
    // précédente ne valait rien. On la marque, on ne l'efface pas.
    marquerReouvertes(Object.keys(profil).filter((c) => codes.includes(c)), quand);
  }
  return enregistrees;
}

/** Marque comme RÉOUVERTE toute erreur fermée qui réapparaît dans une production. */
function marquerReouvertes(codes: string[], quand: string): void {
  if (codes.length === 0) return;
  const fermees = lireFermees();
  let change = false;
  const maj = fermees.map((e) => {
    if (e.reouverteMs || !codes.includes(e.code)) return e;
    change = true;
    return { ...e, reouverteMs: Date.parse(quand) || Date.now() };
  });
  if (change) ecrireFermees(maj);
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

/**
 * FERME UNE ERREUR — et l'inscrit au registre, ce qu'`oublierErreur` ne fait pas.
 *
 * La différence entre les deux est volontaire et vaut d'être dite :
 *   · `oublierErreur` EFFACE. C'est une remise à zéro, on ne saura pas qu'elle a
 *     eu lieu. Utile pour un bouton « repartir de zéro ».
 *   · `fermerErreur` EFFACE **et CONSIGNE**. C'est un ÉVÉNEMENT : quelque chose
 *     qui ne va plus mal. C'est cette trace-là qui permet de dire à l'élève
 *     « une erreur est sortie de ton carnet », et de compter un capital qui ne
 *     se remet jamais à zéro.
 *
 * Renvoie `false` si le code n'était pas dans le profil (rien à fermer) — on
 * n'inscrit pas au registre une erreur qui n'a jamais été ouverte, sinon le
 * capital serait gonflé par des évènements qui n'ont pas eu lieu.
 */
export function fermerErreur(
  code: string,
  contexte: { theme?: string; quand?: Date; par?: OrigineFermeture } = {},
): boolean {
  const profil = lire();
  if (!(code in profil)) return false;
  delete profil[code];
  ecrire(profil);

  const fermees = lireFermees();
  // Une seule entrée par code : si l'erreur avait déjà été fermée puis rouverte,
  // la nouvelle fermeture remplace l'ancienne (c'est la plus récente qui compte)
  // et la réouverture est abandonnée — elle est de nouveau fermée.
  const sansCeCode = fermees.filter((e) => e.code !== code);
  const entree: ErreurFermee = {
    code,
    theme: typeof contexte.theme === 'string' ? contexte.theme.slice(0, 120) : undefined,
    fermeMs: (contexte.quand ?? new Date()).getTime(),
    par: contexte.par ?? 'production_propre',
  };
  ecrireFermees([entree, ...sansCeCode]);
  return true;
}

/** Le registre, du plus récent au plus ancien. `includeReouvertes` les inclut. */
export function erreursFermees(includeReouvertes = true): ErreurFermee[] {
  const toutes = lireFermees();
  return includeReouvertes ? toutes : toutes.filter((e) => !e.reouverteMs);
}

/**
 * LE CAPITAL : deux chiffres, et le second juge le premier.
 *   `fermees`    — erreurs réellement réglées (jamais revenues).
 *   `rouvertes`  — erreurs « réglées » qui sont revenues : le diagnostic était faux.
 *
 * C'est le seul couple d'indicateurs de ce produit qui NE SE REMET PAS À ZÉRO,
 * et c'est pour cela qu'il doit être montré à l'élève quand sa série casse.
 */
export function capitalErreurs(): { fermees: number; rouvertes: number; total: number } {
  const toutes = lireFermees();
  const rouvertes = toutes.filter((e) => Boolean(e.reouverteMs)).length;
  return { fermees: toutes.length - rouvertes, rouvertes, total: toutes.length };
}

/**
 * LE PONT AVEC LA BOUCLE DU COACH — ferme les erreurs prescrites qui ont disparu.
 *
 * RÈGLE, ET SA LIMITE, dites franchement :
 *   · on ferme une erreur prescrite quand une production CORRIGÉE ne la contient
 *     plus. C'est la seule preuve dont dispose l'application, et c'est une vraie
 *     preuve : l'élève a été relancé sur cette erreur précise, il a produit, elle
 *     n'y est pas.
 *   · LIMITE : si la production portait sur un thème sans rapport, l'absence ne
 *     démontre rien. Quand le thème de la prescription est connu ET que la
 *     production porte sur un thème différent, on ne ferme donc pas. Quand aucun
 *     thème n'est connu d'un côté ou de l'autre, on ferme — sinon le registre ne
 *     se remplirait jamais, et une boucle qui ne ferme rien ne sert à rien.
 *
 * Renvoie ce qui a été fermé, pour que l'appelant puisse le DIRE à l'élève.
 */
export function cloreErreursAbsentes(
  codesDetectes: readonly string[],
  contexte: {
    theme?: string;
    prescrites: ReadonlyArray<{ code: string; theme?: string }>;
    quand?: Date;
  },
): ErreurFermee[] {
  const detectes = new Set(codesDetectes);
  const fermees: ErreurFermee[] = [];
  for (const prescrite of contexte.prescrites) {
    if (detectes.has(prescrite.code)) continue;
    // Thèmes connus des deux côtés et différents → aucune conclusion possible.
    if (prescrite.theme && contexte.theme && prescrite.theme !== contexte.theme) continue;
    const theme = contexte.theme ?? prescrite.theme;
    const ok = fermerErreur(prescrite.code, { theme, quand: contexte.quand, par: 'production_propre' });
    if (ok) {
      fermees.push({
        code: prescrite.code,
        theme,
        fermeMs: (contexte.quand ?? new Date()).getTime(),
        par: 'production_propre',
      });
    }
  }
  return fermees;
}

/**
 * La phrase que l'élève lit quand une erreur SORT de son carnet.
 *
 * C'est la seule félicitation du produit qui vaut quelque chose : elle est
 * MESURÉE, elle nomme un fait, et elle ne récompense pas l'assiduité mais le
 * progrès. Le livre dit de coller une récompense immédiate sur une récompense
 * différée (le Bac est loin) : celle-ci est immédiate ET vraie.
 *
 * N'est jamais produite quand on ne sait rien : `nomAr` vient de la taxonomie,
 * jamais d'une invention.
 */
export function phraseErreurFermeeAr(code: string, theme?: string): string {
  const item = ERROR_TAXONOMY[code];
  const nom = item ? item.nameAr : null;
  const tete = nom
    ? `✅ **${nom}** — خرج من دفترك اليوم.`
    : '✅ خطأ واحد خرج من دفترك اليوم.';
  const ou = theme ? ` (${theme})` : '';
  return `${tete}${ou}\n\nهذا لا يُلغيه أيّ يوم تفوتك: الخطأ المُغلق يبقى مُغلقًا.`;
}

/** Remise à zéro complète (bouton « repartir de zéro » côté élève). */
export function effacerProfilErreurs(): void {
  try {
    localStorage.removeItem(CLE);
    localStorage.removeItem(CLE_FERMEES);
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
