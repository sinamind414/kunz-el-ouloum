// apprentissageNav.lock.test.ts — VERROU de la navigation 6 → 4 (2026-11-05).
//
// Ce que ce verrou empêche :
//   1. qu'un des 24 écrans réels devienne ORPHELIN quand on regroupe 3
//      rubriques en une seule (chaque identifiant doit être monté par App.tsx
//      ET rattaché à exactement une porte) ;
//   2. qu'on invente un onglet, une route ou un indicateur de progression ;
//   3. qu'on « inverse » une deuxième fois l'ordre des onglets en RTL ;
//   4. que le mapping s'écarte des hubs réels (trainingHub / revisionHub /
//      moiRaccourcis), seule source de vérité du contenu.
//
// Constat vs interprétation : les compteurs ci-dessous sont MESURÉS sur le code,
// pas estimés. Aucune donnée pédagogique n'est créée ici.

import { afterEach, describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import {
  ONGLETS_APPRENTISSAGE,
  RUBRIQUES_NAV,
  TABS_PAR_ONGLET,
  TABS_HORS_APPRENTISSAGE,
  TAB_PAR_ONGLET,
  CLE_DERNIER_ONGLET,
  lireDernierOnglet,
  ecrireDernierOnglet,
  ongletPourTab,
  rubriquePourTab,
  type OngletApp,
} from './apprentissageNav';
import { TRAINING_ENTRIES } from './trainingHub';
import { REVISION_ENTRIES } from './revisionHub';
import { MOI_RACCOURCIS } from './moiRaccourcis';
import {
  ROUTES_OFFICIELLES,
  HASH_PAR_ONGLET,
  resoudreRoute,
  hashPourTab,
  ongletsAyantUneRoute,
} from '../utils/navigationHash';

const APP = readFileSync(resolve(process.cwd(), 'src/App.tsx'), 'utf8');
const TABS = readFileSync(resolve(process.cwd(), 'src/components/ApprentissageTabs.tsx'), 'utf8');
const INDEX_HTML = readFileSync(resolve(process.cwd(), 'index.html'), 'utf8');

const TOUS_LES_ECRANS: OngletApp[] = [
  'splash', 'home', 'review', 'stats', 'chat', 'methodology', 'bootcamp',
  'badges', 'lesson', 'workshop', 'mindmap', 'teacher', 'animations',
  'situations', 'schemas', 'training', 'plan', 'bacideas', 'focus', 'tadwin',
  'moi', 'reviser', 'examens', 'parcours',
];

afterEach(() => {
  localStorage.removeItem(CLE_DERNIER_ONGLET);
  window.history.replaceState(null, '', '/');
});

describe('4 rubriques et 3 onglets — structure figée', () => {
  it('exactement 4 portes, dans l’ordre de la spec', () => {
    expect(RUBRIQUES_NAV.map((r) => r.id)).toEqual([
      'accueil', 'apprentissage', 'methode', 'mon-espace',
    ]);
    expect(ONGLETS_APPRENTISSAGE.map((o) => o.id)).toEqual([
      'cours', 'entrainement', 'revision',
    ]);
    for (const r of RUBRIQUES_NAV) {
      expect(r.ar.length).toBeGreaterThan(0);
      expect(r.fr.length).toBeGreaterThan(0);
    }
    for (const o of ONGLETS_APPRENTISSAGE) {
      expect(o.ar.length).toBeGreaterThan(0);
      expect(o.fr.length).toBeGreaterThan(0);
    }
  });

  it('App.tsx rend les 4 portes et les 3 onglets (pas 6)', () => {
    const i = APP.indexOf('const PRIMARY_NAV');
    expect(i).toBeGreaterThan(0);
    const bloc = APP.slice(i, APP.indexOf('];', i));
    const portes = [...bloc.matchAll(/\{ tab: '([a-z]+)'/g)].map((m) => m[1]);
    expect(portes).toEqual(['home', 'apprentissage', 'methodology', 'moi']);
    // Libellés bilingues réellement rendus.
    for (const libelle of ['التعلّم', 'حسابي']) {
      expect(APP).toContain(`label: '${libelle}'`);
    }
    expect(APP).toContain("fr: 'Apprentissage'");
    expect(APP).toContain("fr: 'Mon espace'");
    expect(APP).toContain('<ApprentissageTabs');
    expect(APP).toContain('ongletApprentissageActif !== null');
  });

  it('chaque onglet ouvre un écran RÉEL d’App.tsx', () => {
    for (const o of ONGLETS_APPRENTISSAGE) {
      expect(TAB_PAR_ONGLET[o.id]).toBe(o.tab);
      expect(APP).toContain(`currentTab === '${o.tab}'`);
    }
  });
});

describe('mapping exhaustif : aucun écran orphelin ni dupliqué', () => {
  it('les 24 identifiants sont couverts UNE seule fois', () => {
    const tous = [
      ...TABS_PAR_ONGLET.cours,
      ...TABS_PAR_ONGLET.entrainement,
      ...TABS_PAR_ONGLET.revision,
      ...TABS_HORS_APPRENTISSAGE,
    ];
    expect(tous).toHaveLength(24);
    expect(new Set(tous).size).toBe(24);
    expect(new Set(tous)).toEqual(new Set(TOUS_LES_ECRANS));
    for (const id of TOUS_LES_ECRANS) {
      // Monté par App.tsx : le regroupement ne doit tuer aucun écran.
      expect(APP, `${id} n’est plus monté`).toContain(`currentTab === '${id}'`);
    }
  });

  it('le mapping suit les hubs RÉELS, pas une liste inventée', () => {
    expect(TABS_PAR_ONGLET.entrainement.filter((t) => t !== 'training'))
      .toEqual(TRAINING_ENTRIES.map((e) => e.tab));
    expect(TABS_PAR_ONGLET.revision.filter((t) => t !== 'reviser'))
      .toEqual(REVISION_ENTRIES.map((e) => e.tab));
    for (const r of MOI_RACCOURCIS) {
      expect(TABS_HORS_APPRENTISSAGE).toContain(r.tab);
    }
  });

  it('la rubrique et l’onglet actifs se déduisent de n’importe quel écran', () => {
    expect(rubriquePourTab('home')).toBe('accueil');
    expect(rubriquePourTab('methodology')).toBe('methode');
    expect(rubriquePourTab('moi')).toBe('mon-espace');
    expect(rubriquePourTab('stats')).toBe('mon-espace');
    expect(rubriquePourTab('splash')).toBeNull();
    expect(rubriquePourTab('chat')).toBeNull();
    expect(rubriquePourTab('lesson')).toBe('apprentissage');
    expect(rubriquePourTab('bacideas')).toBe('apprentissage');
    expect(rubriquePourTab('review')).toBe('apprentissage');
    expect(ongletPourTab('lesson')).toBe('cours');
    expect(ongletPourTab('mindmap')).toBe('cours');
    expect(ongletPourTab('parcours')).toBe('cours');
    expect(ongletPourTab('examens')).toBe('entrainement');
    expect(ongletPourTab('plan')).toBe('revision');
    expect(ongletPourTab('schemas')).toBe('revision');
    expect(ongletPourTab('focus')).toBeNull();
  });
});

describe('RTL et bilinguisme : pas de double inversion', () => {
  it('l’application est déjà RTL au niveau du document', () => {
    expect(INDEX_HTML).toContain('lang="ar"');
    expect(INDEX_HTML).toContain('dir="rtl"');
  });

  it('la bande d’onglets reste dans l’ordre pédagogique du DOM', () => {
    expect(TABS).toContain('dir="rtl"');
    expect(TABS).toContain('ONGLETS_APPRENTISSAGE.map');
    expect(TABS).not.toContain('flex-row-reverse');
    expect(TABS).not.toContain('reverse()');
    expect(TABS).toContain('touchAction: \'pan-y\'');
    expect(TABS).toContain('role="tablist"');
    expect(TABS).toContain('aria-selected');
  });

  it('les pastilles sont dérivées, jamais codées en dur (AGENTS.md §5)', () => {
    expect(TABS).not.toContain('12/20');
    expect(TABS).not.toContain('terminés');
    expect(TABS).toContain('progression?: ProgressionApprentissage');
    expect(TABS).toContain('PROGRESSION[o.id].valeur(progression)');
    // Chaque compteur a SON unité : pas de dénominateur commun inventé.
    expect(TABS).toContain('leconsTotal');
    expect(TABS).toContain('tentatives');
    expect(TABS).toContain('evaluations');
    expect(APP).toContain('progression={progressionApprentissage}');
  });

  it('« المنهجية » a une mise en avant distincte de l’état actif', () => {
    expect(APP).toContain("data-testid={tab === 'methodology' ? 'nav-methode' : undefined}");
    expect(APP).toContain('bg-[#f1faf4] ring-1 ring-[#006d37]/25');
    // Le vert saturé reste réservé à la rubrique ACTIVE.
    expect(APP).toContain("rubriqueActive(tab)\n                  ? 'bg-[#e5f6ed]");
  });

  it('les 4 raccourcis internes écrivent leur cible dans l’URL', () => {
    expect(APP).toContain("ecrireParametresPourTab('lesson', queryPourLecon(key))");
    expect(APP).toContain("ecrireParametresPourTab('lesson', queryPourQcm(unitId))");
    expect(APP).toContain("ecrireParametresPourTab('lesson', queryPourExamen(mode))");
    expect(APP).toContain("ecrireParametresPourTab('bacideas', queryPourIdee(ideaId))");
  });

  it('App.tsx câble les paramètres de lien profond', () => {
    expect(APP).toContain('lireDeepLinkInterne(queryDeUrl(');
    expect(APP).toContain('deepLinkInitial?.idee ?? null');
    expect(APP).toContain('deepLinkInitial?.lecon ?? null');
    expect(APP).toContain('deepLinkInitial?.qcm ?? null');
    expect(APP).toContain('deepLinkInitial?.examen ?? null');
    expect(APP).toContain("if (route && deepLinkInitial?.idee && route.tab === 'training') return 'bacideas'");
  });
});

describe('mémorisation du dernier onglet', () => {
  it('défaut « Cours » quand rien n’est stocké', () => {
    expect(lireDernierOnglet()).toBe('cours');
  });

  it('valeur valide persistée, valeur corrompue ignorée', () => {
    ecrireDernierOnglet('revision');
    expect(localStorage.getItem(CLE_DERNIER_ONGLET)).toBe('revision');
    expect(lireDernierOnglet()).toBe('revision');
    localStorage.setItem(CLE_DERNIER_ONGLET, 'inconnu');
    expect(lireDernierOnglet()).toBe('cours');
  });
});

describe('deep links : routes canoniques, alias et bouton Retour', () => {
  it('6 routes officielles, 3 onglets tous routés', () => {
    expect(Object.keys(ROUTES_OFFICIELLES)).toHaveLength(6);
    expect(ongletsAyantUneRoute()).toHaveLength(3);
    expect(HASH_PAR_ONGLET.cours).toBe('#/apprentissage/cours');
    expect(HASH_PAR_ONGLET.entrainement).toBe('#/apprentissage/entrainement');
    expect(HASH_PAR_ONGLET.revision).toBe('#/apprentissage/revision');
  });

  it('chaque route ouvre un onglet réellement monté', () => {
    for (const [h, tab] of Object.entries(ROUTES_OFFICIELLES)) {
      expect(resoudreRoute('/', h)).toEqual({ tab, canonique: h });
      expect(APP).toContain(`currentTab === '${tab}'`);
    }
  });

  it('les anciens intitulés sont redirigés, pas cassés', () => {
    expect(resoudreRoute('/', '#/apprendre')?.canonique).toBe('#/apprentissage/cours');
    expect(resoudreRoute('/', '#/reviser')?.canonique).toBe('#/apprentissage/revision');
    expect(resoudreRoute('/', '#/moi')?.canonique).toBe('#/mon-espace');
    expect(resoudreRoute('/apprendre', '')?.tab).toBe('lesson');
    expect(resoudreRoute('/reviser', '')?.tab).toBe('reviser');
    expect(resoudreRoute('/apprentissage/entrainement', '')?.tab).toBe('training');
  });

  it('un accueil nu ne fabrique PAS de route (le splash reste)', () => {
    expect(resoudreRoute('/', '')).toBeNull();
    expect(resoudreRoute('/', '#')).toBeNull();
    expect(hashPourTab('splash')).toBeNull();
    expect(hashPourTab('chat')).toBeNull();
    expect(hashPourTab('focus')).toBeNull();
  });

  it('un sous-écran pointe vers la route de son onglet parent', () => {
    expect(hashPourTab('bacideas')).toBe('#/apprentissage/entrainement');
    expect(hashPourTab('examens')).toBe('#/apprentissage/entrainement');
    expect(hashPourTab('review')).toBe('#/apprentissage/revision');
    expect(hashPourTab('parcours')).toBe('#/apprentissage/cours');
  });

  it('App.tsx branche popstate, replaceState et la mémoire', () => {
    expect(APP).toContain("addEventListener('popstate'");
    expect(APP).toContain("addEventListener('hashchange'");
    expect(APP).toContain('remplacerRoutePourTab(currentTab)');
    expect(APP).toContain('pousserRoutePourTab(cible)');
    expect(APP).toContain('ecrireDernierOnglet(onglet)');
  });
});
