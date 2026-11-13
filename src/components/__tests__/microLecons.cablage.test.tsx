// Verrous de câblage R5 (2026-11-07) : la porte des micro-leçons doit être
// ATTEIGNABLE depuis l'écran d'accueil de الدروس, sans 5ᵉ rubrique et sans
// charger l'index des 562 chunks dans le bundle d'entrée.
//
// Convention repo : pas de jest-dom ; cleanup() explicite.

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import LessonsView from '../LessonsView';

const lire = (p: string) => readFileSync(resolve(__dirname, '../../../', p), 'utf8');
const vue = lire('src/components/LessonsView.tsx');
const panneau = lire('src/components/MicroLeconsPanel.tsx');
const donnees = lire('src/data/microLecons.ts');

afterEach(() => {
  cleanup();
  localStorage.clear();
});

describe('R5 : câblage (lecture des sources)', () => {
  it('le panneau est lazy et son import reste dans LessonsView', () => {
    expect(vue).toContain("lazy(() => import('./MicroLeconsPanel'))");
    expect(vue).toContain("mode === 'micro'");
    expect(vue).not.toContain("import MicroLeconsPanel from './MicroLeconsPanel'");
  });

  it('une SEULE porte visible, qui pose le mode micro', () => {
    expect(vue).toContain('data-testid="lecons-ouvrir-micro"');
    expect(vue).toContain("onClick={() => setMode('micro')}");
    expect((vue.match(/lecons-ouvrir-micro/g) ?? []).length).toBe(1);
    expect(vue).toContain('BookMarked');
  });

  it('aucune 5ᵉ rubrique : navigation à 4 portes intacte', () => {
    const nav = lire('src/data/apprentissageNav.ts');
    const bloc = nav.slice(nav.indexOf('export const RUBRIQUES_NAV'));
    const rubriques = bloc.slice(0, bloc.indexOf('];'));
    expect((rubriques.match(/\{ id: '/g) ?? []).length).toBe(4);
    expect(vue).not.toContain("setCurrentTab('micro')");
  });

  it('le panneau affiche l avertissement, la liste et la synthese en FIN de lecon', () => {
    expect(panneau).toContain('AVERTISSEMENT_MICRO_AR');
    expect(panneau).toContain('data-testid="micro-liste"');
    expect(panneau).toContain('data-testid="micro-synthese"');
    expect(panneau.indexOf('micro-liste')).toBeLessThan(panneau.indexOf('micro-synthese'));
    expect(panneau).toContain('construireLeconsDecoupees');
  });

  it('l index arrive par FETCH (JSON précaché), jamais par import statique', () => {
    expect(panneau).toContain('chargerLessonIndex');
    expect(panneau).toContain('lessonIndexSiChargee');
    expect(donnees).toContain("import type { LessonIndexChunk } from './lessonIndex'");
    expect(donnees).not.toContain('lhx_');
    expect(donnees).toContain("from './resumesLecons'");
    expect(donnees).toContain('VERBATIM');
    expect(donnees).toContain('Non vérifiable');
    // Dégradation honnête si le JSON manque : aucune synthèse fabriquée.
    expect(panneau).toContain('micro-indisponible');
  });
});

describe('R5 : parcours réel depuis l accueil des leçons', () => {
  it('clic sur la porte → panneau monté, 3 phrases de synthèse, texte verbatim ouvrable', async () => {
    render(<LessonsView />);
    fireEvent.click(screen.getByTestId('lecons-ouvrir-micro'));

    await waitFor(() => {
      expect(screen.getByTestId('micro-lecons-panel')).toBeTruthy();
    });

    const synthese = screen.getByTestId('micro-synthese');
    expect(synthese.querySelectorAll('li')).toHaveLength(3);
    expect(screen.getAllByText(/INTERPRÉTATION/).length).toBeGreaterThan(0);

    fireEvent.click(screen.getByTestId('micro-carte-1'));
    await waitFor(() => {
      expect(screen.getByTestId('micro-texte-1')).toBeTruthy();
    });
    expect(screen.getByTestId('micro-texte-1').textContent).toContain('نص الدرس كما هو');

    fireEvent.click(screen.getByTestId('micro-retour'));
    await waitFor(() => {
      expect(screen.queryByTestId('micro-lecons-panel')).toBeNull();
    });
    expect(screen.getByTestId('lecons-ouvrir-micro')).toBeTruthy();
  });
});
