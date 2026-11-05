// navigationHash.ts — deep links des 4 rubriques, SANS routeur ni dépendance.
//
// Pourquoi des routes HASH (`#/apprentissage/cours`) et pas des chemins propres :
//   · `package.json` est un fichier protégé (AGENTS.md) → pas de react-router ;
//   · l'app est une PWA/TWA 100 % hors ligne : un hash ne déclenche AUCUNE
//     requête réseau, donc ni `server.ts`, ni `public/sw.js`, ni le périmètre
//     `scope: "/"` de `public/manifest.json` n'ont à être modifiés ;
//   · `server.ts` possède déjà `app.get("*") → index.html` et `sw.js` gère déjà
//     `request.mode === 'navigate'` : les CHEMINS propres sont tout de même
//     ACCEPTÉS EN ENTRÉE (notifications, liens externes), puis ramenés au hash
//     canonique par `history.replaceState`.
//
// Compatibilité : les anciens intitulés (`/apprendre`, `/reviser`, `/moi`…)
// sont des ALIAS. Constat honnête : aucune de ces URL n'existait dans le dépôt
// avant ce changement — il s'agit d'une compatibilité PRÉVUE, pas d'une
// migration de liens en production (Non vérifiable).
//
// Aucune route n'est inventée pour les sous-écrans : `bacideas`, `examens`,
// `review`… pointent vers la route de leur onglet parent (table de mapping de
// src/data/apprentissageNav.ts). Le bouton Retour Android fonctionne via
// `popstate` ; `pushState` ne déclenche pas `hashchange`, donc pas de boucle.

import {
  TABS_PAR_ONGLET,
  ongletPourTab,
  type OngletApp,
  type OngletApprentissageId,
} from '../data/apprentissageNav';

/** Les 6 routes canoniques : 4 rubriques + les 3 onglets (Accueil = 1 rubrique). */
export const ROUTES_OFFICIELLES: Readonly<Record<string, OngletApp>> = {
  '#/accueil': 'home',
  '#/apprentissage/cours': 'lesson',
  '#/apprentissage/entrainement': 'training',
  '#/apprentissage/revision': 'reviser',
  '#/methode': 'methodology',
  '#/mon-espace': 'moi',
};

export const HASH_PAR_ONGLET: Readonly<Record<OngletApprentissageId, string>> = {
  cours: '#/apprentissage/cours',
  entrainement: '#/apprentissage/entrainement',
  revision: '#/apprentissage/revision',
};

/** Anciens intitulés / raccourcis → route canonique (hash ET chemin). */
const ALIAS: Readonly<Record<string, string>> = {
  '#/': '#/accueil',
  '#/apprendre': '#/apprentissage/cours',
  '#/cours': '#/apprentissage/cours',
  '#/learn': '#/apprentissage/cours',
  '#/entrainer': '#/apprentissage/entrainement',
  '#/entrainement': '#/apprentissage/entrainement',
  '#/s-entrainer': '#/apprentissage/entrainement',
  '#/exercices': '#/apprentissage/entrainement',
  '#/reviser': '#/apprentissage/revision',
  '#/revision': '#/apprentissage/revision',
  '#/methodologie': '#/methode',
  '#/moi': '#/mon-espace',
  '#/espace': '#/mon-espace',
  '/apprendre': '#/apprentissage/cours',
  '/cours': '#/apprentissage/cours',
  '/apprentissage/cours': '#/apprentissage/cours',
  '/apprentissage/entrainement': '#/apprentissage/entrainement',
  '/entrainer': '#/apprentissage/entrainement',
  '/s-entrainer': '#/apprentissage/entrainement',
  '/reviser': '#/apprentissage/revision',
  '/apprentissage/revision': '#/apprentissage/revision',
  '/methode': '#/methode',
  '/methodologie': '#/methode',
  '/moi': '#/mon-espace',
  '/mon-espace': '#/mon-espace',
};

/** Sépare la route de ses paramètres (`?lecon=…`) AVANT normalisation :
    les clés de leçon sont sensibles à la casse, la route ne l'est pas. */
function separer(url: string): { base: string; query: string } {
  const i = url.indexOf('?');
  return i < 0 ? { base: url, query: '' } : { base: url.slice(0, i), query: url.slice(i) };
}

/** Le hash est canonique, alias, ou inconnu. */
function normaliserHash(base: string): string | null {
  if (!base || base === '#') return null;
  const h = base.toLowerCase();
  if (ROUTES_OFFICIELLES[h]) return h;
  return ALIAS[h] ?? null;
}

/** Un chemin propre est accepté en entrée, puis ramené au hash. */
function normaliserChemin(base: string): string | null {
  if (!base || base === '/') return null; // accueil nu → splash conservé
  const p = base.replace(/\/+$/, '').toLowerCase();
  const canonique = `#${p}`;
  if (ROUTES_OFFICIELLES[canonique]) return canonique;
  return ALIAS[canonique] ?? ALIAS[p] ?? null;
}

export interface RouteResolue {
  tab: OngletApp;
  canonique: string;
}

/**
 * Résout une URL de notification / un lien externe vers un onglet réel.
 * `pathname` peut contenir `?…` (on y passe `location.pathname + location.search`).
 * Les paramètres sont conservés dans `canonique` : l'état initial de l'app peut
 * ainsi ouvrir une leçon précise (src/utils/deepLinkInterne.ts).
 */
export function resoudreRoute(pathname: string, hash: string): RouteResolue | null {
  const h = separer(hash);
  const p = separer(pathname);
  const base = normaliserHash(h.base) ?? normaliserChemin(p.base);
  if (!base) return null;
  const tab = ROUTES_OFFICIELLES[base];
  if (!tab) return null;
  const query = h.query || p.query;
  return { tab, canonique: base + query };
}

/** Route à écrire pour un écran ; null = écran transversal (المرشد, focus…). */
export function hashPourTab(tab: string): string | null {
  const o = ongletPourTab(tab);
  if (o) return HASH_PAR_ONGLET[o];
  if (tab === 'home') return '#/accueil';
  if (tab === 'methodology') return '#/methode';
  if (tab === 'moi' || tab === 'stats' || tab === 'badges' || tab === 'teacher') {
    return '#/mon-espace';
  }
  return null;
}

/** Crée une entrée d'historique pour un clic explicite (bouton Retour = popstate).
    Un clic consomme les paramètres : on repart de la route nue. */
export function pousserRoutePourTab(tab: OngletApp): void {
  if (typeof window === 'undefined') return;
  const cible = hashPourTab(tab);
  if (cible && window.location.hash !== cible) {
    window.history.pushState(null, '', cible);
  }
}

/** Synchronise l'URL sans empiler d'entrée (navigation interne depuis un hub).
    Si la rubrique ne change pas, on GARDE `?lecon=…` : c'est le même écran,
    les paramètres n'ont pas été consommés par un changement d'onglet. */
export function remplacerRoutePourTab(tab: OngletApp): void {
  if (typeof window === 'undefined' || !window.location.hash) return;
  const cible = hashPourTab(tab);
  if (!cible) return;
  const { base } = separer(window.location.hash);
  if (base === cible) return;
  window.history.replaceState(null, '', cible);
}

/**
 * Écrit les paramètres d'un raccourci INTERNE (?lecon=, ?qcm=, ?idee=…) sur
 * la route de l'onglet, SANS empiler d'entrée d'historique (c'est un état de
 * l'écran, pas une navigation). `remplacerRoutePourTab` les laisse ensuite
 * intactes tant que la rubrique ne change pas ; un clic explicite sur un onglet
 * les consomme via `pousserRoutePourTab`.
 */
export function ecrireParametresPourTab(tab: OngletApp, query: string): void {
  if (typeof window === 'undefined') return;
  const base = hashPourTab(tab);
  if (!base) return;
  const cible = query ? `${base}?${query.replace(/^\?/, '')}` : base;
  if (window.location.hash !== cible) {
    window.history.replaceState(null, '', cible);
  }
}

/** Vérifiable : chaque onglet d'un sous-écran a bien une route parente. */
export function ongletsAyantUneRoute(): OngletApprentissageId[] {
  return (Object.keys(HASH_PAR_ONGLET) as OngletApprentissageId[]).filter(
    (o) => TABS_PAR_ONGLET[o].length > 0 && Boolean(ROUTES_OFFICIELLES[HASH_PAR_ONGLET[o]]),
  );
}
