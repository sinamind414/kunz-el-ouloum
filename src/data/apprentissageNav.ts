// apprentissageNav.ts — NOUVELLE NAVIGATION (6 → 4 rubriques), source unique.
//
// Décision produit (2026-11-05, GO utilisateur) : trois anciennes rubriques
// (« APPRENDRE » / « S'ENTRAÎNER » / « RÉVISER ») deviennent TROIS ONGLETS
// d'une rubrique « التعلّم / Apprentissage ». Accueil et المنهجية restent,
// « أنا » devient « حسابي / Mon espace ».
//
// CE QUE CE FICHIER NE FAIT PAS (AGENTS.md §5 — aucun contenu inventé) :
//   · il ne crée aucun énoncé, aucune leçon, aucun compteur de progression ;
//   · il ne renomme AUCUN onglet réel d'App.tsx. Les 24 identifiants
//     (`lesson`, `training`, `reviser`, `bacideas`…) restent INTACTS : les hubs,
//     les conseils d'entrée de rubrique, le capitaine, l'épreuve en cours et le
//     mode focus sont tous indexés sur eux. La rubrique à 4 portes est une
//     COUCHE DE PRÉSENTATION au-dessus de ces identifiants, pas un remplacement.
//   · chaque sous-écran est rattaché à l'onglet qui le porte RÉELLEMENT dans
//     src/data/{trainingHub,revisionHub,moiRaccourcis}.ts (verrou :
//     src/data/apprentissageNav.lock.test.ts).
//
// RTL : `index.html` est déjà `<html lang="ar" dir="rtl">`. Le tableau
// ONGLETS_APPRENTISSAGE reste dans l'ordre PÉDAGOGIQUE (Cours → Entraînement →
// Révision) ; le sens visuel RTL place الدروس à droite tout seul. NE PAS
// appliquer `flex-row-reverse` ni réordonner : ce serait une double inversion.
//
// Bilinguisme : l'app n'a pas de sélecteur de langue. Comme la barre principale
// actuelle, chaque libellé porte AR (فصحى) + FR affiché en dessous, `dir="ltr"`.

/** Les 24 identifiants d'onglet réellement gérés par App.tsx (aucun ajout). */
export type OngletApp =
  | 'splash' | 'home' | 'review' | 'stats' | 'chat' | 'methodology'
  | 'bootcamp' | 'badges' | 'lesson' | 'workshop' | 'mindmap' | 'teacher'
  | 'animations' | 'situations' | 'schemas' | 'training' | 'plan' | 'bacideas'
  | 'focus' | 'tadwin' | 'moi' | 'reviser' | 'examens' | 'parcours';

export type OngletApprentissageId = 'cours' | 'entrainement' | 'revision';
export type RubriqueNavId = 'accueil' | 'apprentissage' | 'methode' | 'mon-espace';

export interface OngletApprentissage {
  id: OngletApprentissageId;
  ar: string;
  fr: string;
  /** Onglet réel d'App.tsx ouvert par défaut quand on clique cet onglet. */
  tab: OngletApp;
}

/** Ordre = ordre pédagogique du parcours. L'ordre VISUEL est géré par dir="rtl". */
export const ONGLETS_APPRENTISSAGE: readonly OngletApprentissage[] = [
  { id: 'cours', ar: 'الدروس', fr: 'Cours', tab: 'lesson' },
  { id: 'entrainement', ar: 'التمارين', fr: 'Entraînement', tab: 'training' },
  { id: 'revision', ar: 'المراجعة', fr: 'Révision', tab: 'reviser' },
] as const;

export const TAB_PAR_ONGLET: Record<OngletApprentissageId, OngletApp> = {
  cours: 'lesson',
  entrainement: 'training',
  revision: 'reviser',
};

/**
 * Table de mapping EXHAUSTIVE : les 24 onglets réels, moins les 9 qui vivent
 * hors d'Apprentissage. Un sous-écran ouvert depuis un hub garde son onglet
 * parent actif (ex. `bacideas` → « التمارين »), sans créer de fausse route.
 */
export const TABS_PAR_ONGLET: Record<OngletApprentissageId, readonly OngletApp[]> = {
  // Leçons, cartes mentales (LessonsView) et parcours verrouillé (مساري).
  cours: ['lesson', 'mindmap', 'parcours'],
  // Les 7 espaces de src/data/trainingHub.ts + le hub lui-même.
  entrainement: [
    'training', 'bacideas', 'situations', 'bootcamp', 'workshop',
    'animations', 'tadwin', 'examens',
  ],
  // Les 3 espaces de src/data/revisionHub.ts + le hub lui-même.
  revision: ['reviser', 'review', 'plan', 'schemas'],
} as const;

/** Onglets qui appartiennent aux AUTRES rubriques (ou à aucune). */
export const TABS_HORS_APPRENTISSAGE: readonly OngletApp[] = [
  'splash', 'home', 'chat', 'methodology', 'focus',
  'moi', 'stats', 'badges', 'teacher',
] as const;

/** 4 portes : l'id `apprentissage` est un pseudo-onglet résolu à l'ouverture. */
export type CibleNav = OngletApp | 'apprentissage';

export interface RubriqueNav {
  id: RubriqueNavId;
  tab: CibleNav;
  ar: string;
  fr: string;
}

export const RUBRIQUES_NAV: readonly RubriqueNav[] = [
  { id: 'accueil', tab: 'home', ar: 'الرئيسية', fr: 'Accueil' },
  { id: 'apprentissage', tab: 'apprentissage', ar: 'التعلّم', fr: 'Apprentissage' },
  { id: 'methode', tab: 'methodology', ar: 'المنهجية', fr: 'Méthode' },
  { id: 'mon-espace', tab: 'moi', ar: 'حسابي', fr: 'Mon espace' },
] as const;

/** Pour l'état actif des 4 boutons de la barre / du menu latéral. */
export const RUBRIQUE_PAR_TAB_NAV: Partial<Record<CibleNav, RubriqueNavId>> = {
  home: 'accueil',
  apprentissage: 'apprentissage',
  methodology: 'methode',
  moi: 'mon-espace',
} as const;

/** Onglet d'Apprentissage portant un écran, ou null s'il est hors rubrique. */
export function ongletPourTab(tab: string): OngletApprentissageId | null {
  for (const o of ONGLETS_APPRENTISSAGE) {
    if (TABS_PAR_ONGLET[o.id].includes(tab as OngletApp)) return o.id;
  }
  return null;
}

/** Rubrique active pour un écran (null = splash, المرشد, minuteur…). */
export function rubriquePourTab(tab: string): RubriqueNavId | null {
  const o = ongletPourTab(tab);
  if (o) return 'apprentissage';
  if (tab === 'home') return 'accueil';
  if (tab === 'methodology') return 'methode';
  if (tab === 'moi' || tab === 'stats' || tab === 'badges' || tab === 'teacher') {
    return 'mon-espace';
  }
  return null;
}

// ───────────────── Mémorisation du dernier onglet visité ─────────────────
/** Clé dédiée : ne touche ni `svt_progress` ni les autres compteurs réels. */
export const CLE_DERNIER_ONGLET = 'kunz_apprentissage_onglet_v1';

/** Valeur non reconnue / stockage indisponible → défaut pédagogique « Cours ». */
export function lireDernierOnglet(): OngletApprentissageId {
  try {
    const brut = localStorage.getItem(CLE_DERNIER_ONGLET);
    if (ONGLETS_APPRENTISSAGE.some((o) => o.id === brut)) {
      return brut as OngletApprentissageId;
    }
  } catch {
    /* stockage indisponible (privé / quota) → défaut */
  }
  return 'cours';
}

export function ecrireDernierOnglet(id: OngletApprentissageId): void {
  try {
    localStorage.setItem(CLE_DERNIER_ONGLET, id);
  } catch {
    /* stockage indisponible : la navigation reste fonctionnelle */
  }
}
