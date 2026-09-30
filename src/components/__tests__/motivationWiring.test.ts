// motivationWiring.test.ts — verrou du câblage de la brique MOTIVATION dans App.tsx.
//
// Les composants FocusTimer et MotivationDeclic existaient depuis le
// 29/09/2026 mais n'étaient jamais importés : l'app ne pouvait pas les
// afficher (docs/INTEGRATION_FOCUS_MOTIVATION.md décrivait le câblage comme
// une TODO). Ce test fige les points d'attache pour qu'un refactor ne les
// débranche pas silencieusement.

import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const APP = readFileSync(resolve(__dirname, '../../App.tsx'), 'utf8');

describe('App.tsx — câblage de la brique motivation', () => {
  it('charge FocusTimer en lazy (sans alourdir le bundle principal)', () => {
    expect(APP).toContain("import('./components/FocusTimer')");
  });

  it('charge MotivationDeclic en lazy', () => {
    expect(APP).toContain("import('./components/MotivationDeclic')");
  });

  it('expose l\'onglet focus dans la navigation secondaire', () => {
    expect(APP).toContain("tab: 'focus'");
  });

  it('crédite les minutes de focus dans l\'objectif quotidien', () => {
    expect(APP).toContain('addStudyMinutes');
    expect(APP).toMatch(/onFocusComplete=\{addStudyMinutes\}/);
  });

  it('affiche le Déclic une fois par jour avant la première session', () => {
    expect(APP).toContain('kunz_declic_shown_v1');
    expect(APP).toContain('isDeclicOverlayOpen');
  });

  it('l\'enchaînement Déclic → Focus → Révision est bien branché', () => {
    // Le bouton « جلسة تركيز » du Déclic ouvre le minuteur.
    expect(APP).toMatch(/onStartFocus=\{\(\) => \{\s*closeDeclicOverlay\(\);\s*setCurrentTab\('focus'\);/);
    // « ابدأ الآن » enchaîne sur la révision.
    expect(APP).toMatch(/setCurrentTab\('review'\)/);
  });
});
