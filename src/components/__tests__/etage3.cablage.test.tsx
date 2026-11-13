// Verrous de câblage de l'étage 3 (2026-11-07) : R1/R2/R4/R7 sans casser
// les étages 1 et 2 ni les silences.

import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const lire = (p: string) => readFileSync(resolve(__dirname, '../../../', p), 'utf8');
const app = lire('src/App.tsx');
const dashboard = lire('src/components/DashboardView.tsx');
const portal = lire('src/components/UnitIntroPortal.tsx');
const panel = lire('src/components/ParcoursAssimilation.tsx');

describe('le panneau de parcours est charge a la demande', () => {
  it('lazy + ouverture depuis l accueil, sans onglet invente', () => {
    expect(app).toContain("lazy(() => import('./components/ParcoursAssimilation'))");
    expect(app).toContain('onOuvrirParcours');
    expect(dashboard).toContain('onOuvrirParcours');
    expect(panel).toContain('onOuvrirRubrique');
    // Les 3 rubriques cibles existent deja dans la navigation a 4 rubriques.
    for (const r of ['cours', 'entrainement', 'revision']) {
      expect(panel).toContain(`'${r}'`);
      expect(lire('src/data/apprentissageNav.ts')).toContain(`'${r}'`);
    }
  });

  it('le panneau reste garde par le silence d epreuve', () => {
    const bloc = app.slice(app.indexOf('parcoursOuvert && ('));
    expect(bloc.slice(0, 400)).toContain('ParcoursAssimilation');
    expect(app).toContain('!epreuveEnCours && parcoursOuvert');
  });

  it('l etat est declare dans la zone sure (avant le deep link et les hooks tardifs)', () => {
    const decl = app.indexOf('const [parcoursOuvert');
    const deepLink = app.indexOf('const deepLinkInitial');
    expect(decl).toBeGreaterThan(0);
    expect(deepLink).toBeGreaterThan(0);
    expect(decl).toBeLessThan(deepLink);
  });
});

describe('R7 : la recherche existante est pre-ouverte, sans 5e porte', () => {
  const lessons = lire('src/components/LessonsView.tsx');

  it('le mode search est un etat REEL de LessonsView, pas un nouvel ecran', () => {
    expect(lessons).toContain("setMode('search')");
    expect(lessons).toContain("initialMode?: 'qcm' | 'bac' | 'search'");
    expect(lessons).toContain('<SearchView');
  });

  it('App.tsx demande ce mode puis ouvre la rubrique Cours', () => {
    expect(app).toContain('onOuvrirRecherche');
    expect(app).toContain("setParcoursMode('search')");
    expect(app).toContain("handleTabChange('lesson')");
    // Aucun onglet 'search' invente : la recommandation interdit une 5e porte.
    expect(app).not.toContain("setCurrentTab('search')");
    expect(app).not.toContain("id: 'search'");
  });

  it('le panneau expose bien le bouton', () => {
    expect(panel).toContain('data-testid="parcours-acces-rapide"');
    expect(panel).toContain('onOuvrirRecherche');
  });
});

describe('R2 : etiquette de priorite sur le portail d unite', () => {
  it('prioritePourUnite est importe et rendu pour TOUTE unite', () => {
    expect(portal).toContain('prioritePourUnite');
    expect(portal).toContain('data-testid="portal-priorite"');
    expect(portal).toContain('phrasePrioriteAr');
    // L'ancien « poids » (statique) reste intact, lui aussi verrouille.
    expect(portal).toContain('data-testid="portal-poids"');
    expect(portal).toContain('bacWeightPercent');
  });
});

describe('non-regression des etages 1 et 2', () => {
  it('le glossaire du capitaine et la bulle restent cables', () => {
    expect(app).toContain('GlossaireCapitaine');
    expect(app).toContain('setGlossaireOuvert');
    expect(app).toContain('data-testid="fab-morchid"');
    expect(app).toContain('data-testid="bulle-capitaine"');
    expect(dashboard).toContain('LIBELLE_BULLE_SILENCIEUX_AR');
  });

  it('la porte explicite vers le tuteur depuis l accueil est conservee', () => {
    expect(dashboard).toContain("onNavigateToTab?.('chat')");
    // Recalibré 2026-11-08 (tranche signée) : l'App passé `setCurrentTab`
    // DANS DashboardView via onNavigateToTab — le câblage réel de la porte
    // est vérifié ici (la modale capitaineOpen reste la voie du tuteur).
    expect(app).toContain('onNavigateToTab={setCurrentTab}');
  });

  it('le panneau ne monte aucune seconde instance du tuteur', () => {
    expect(panel).not.toContain('AITutorView');
    expect(panel).not.toContain('onNavigateToTab');
  });
});
