// Verrou de câblage de l'étage 2 (2026-11-07) : la bulle DU CAPITAINE répond,
// sans casser les silences ni les verrous posés avant elle.

import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const lire = (p: string) => readFileSync(resolve(__dirname, '../../../', p), 'utf8');
const app = lire('src/App.tsx');
const composant = lire('src/components/GlossaireCapitaine.tsx');

describe('H1/H2 : la bulle du capitaine répond au mot tapé', () => {
  it('le glossaire est chargé en lazy, jamais dans le bundle d entrée', () => {
    expect(app).toContain("lazy(() => import('./components/GlossaireCapitaine'))");
    expect(app).toContain('<Suspense');
  });

  it('le bouton rond ouvre le panneau, il ne renvoie plus directement au tuteur', () => {
    const bloc = app.slice(app.indexOf('data-testid="fab-morchid"'), app.indexOf('data-testid="fab-morchid"') + 400);
    expect(bloc).toContain('setGlossaireOuvert');
    expect(bloc).not.toContain('setCurrentTab');
  });

  it('le pont vers le المرشد reste explicite et non supprimé', () => {
    expect(app).toContain('onOuvrirTuteur');
    // Recalibré 2026-11-08 (tranche signée) : dans CETTE branche, le tuteur
    // n'a JAMAIS d'onglet « chat » avec vue (mesuré : aucun rendu lié à
    // currentTab === 'chat') — il s'ouvre par la modale capitaineOpen, dont
    // la voie canonique est ouvrirChat() (l.~312, handlers FAB + morchidBridge).
    // Le pont du panneau utilise exactement cette voie réelle.
    expect(app).toContain('ouvrirChat();');
  });

  it('le composant porte un champ de saisie libre et une sonde', () => {
    expect(composant).toContain('data-testid="glossaire-capitaine-saisie"');
    expect(composant).toContain('data-testid="glossaire-capitaine-essai"');
    expect(composant).toContain('🧭');
    expect(composant).toContain('اشرح لي');
    expect(composant).toContain('LIBELLE_BULLE_SILENCIEUX_AR');
    expect(composant).toContain('CAPITAINE_IDENTITE_AR');
  });
});

describe('une seule voix et silences conservés', () => {
  it('quand la bulle répond, invitation et relais se taisent', () => {
    expect(app).toContain('!glossaireOuvert && invitation');
    expect(app).toContain('!glossaireOuvert && <RelaisCapitaine');
  });

  it('le panneau reste à l intérieur du bloc gardé par l épreuve', () => {
    const debut = app.indexOf('!isFocusMode && !epreuveEnCours');
    const fin = app.indexOf('glossaireOuvert && (', debut);
    expect(debut).toBeGreaterThan(0);
    expect(fin).toBeGreaterThan(debut);
    const blocGarde = app.slice(debut, fin + 200);
    expect(blocGarde).toContain('fab-morchid');
    expect(blocGarde).toContain('!epreuveEnCours');
  });

  it('les verrous antérieurs du bouton rond sont intacts', () => {
    const bloc = app.slice(app.indexOf('data-testid="fab-morchid"'));
    const bouton = bloc.slice(0, 900);
    expect(bouton).toContain('rounded-full');
    expect(bouton).toContain('CAPITAINE_VISAGE_URL');
    expect(bouton).toContain('aria-label={CAPITAINE_IDENTITE_AR}');
    expect(app).toContain('data-testid="bulle-capitaine"');
  });

  it('aucune vue ne monte sa propre instance du tuteur', () => {
    expect(composant).not.toContain('AITutorView');
  });
});
