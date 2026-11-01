// LessonsMindmapMove.test.tsx — verrous du déplacement du 2026-10-12.
//
// Deux demandes :
//   1. « وقت التركيز » n'est plus une rubrique (outil transversal ouvert par le
//      Déclic, pas en errant dans un menu).
//   2. « الخرائط الذهنية » rejoint la rubrique « الدروس » — une carte mentale est
//      une synthèse de ce qu'on vient de comprendre, donc de l'apprentissage.
//
// Les tests figent les DEUX côtés de chaque déplacement : la chose n'est plus à
// l'ancienne place, ET elle reste joignable à la nouvelle.

import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import LessonsView from '../LessonsView';

afterEach(cleanup);

const APP = readFileSync(resolve(__dirname, '../../App.tsx'), 'utf8');

/** Extrait le tableau nommé de App.tsx (source de vérité de la navigation). */
function bloc(nom: string): string {
  const i = APP.indexOf(`const ${nom}`);
  expect(i, `${nom} introuvable dans App.tsx`).toBeGreaterThan(0);
  const suite = APP.slice(i, i + 2400);
  return suite.slice(0, suite.indexOf('];'));
}

describe('« الخرائط الذهنية » rejoint la rubrique « الدروس »', () => {
  it('la carte existe sur l écran principal de الدروس', () => {
    render(<LessonsView />);
    expect(screen.getByTestId('lecons-mindmap')).toBeTruthy();
    expect(screen.getByText('الخرائط الذهنية التفاعلية')).toBeTruthy();
  });

  it('un clic ouvre l onglet mindmap existant (porte, pas copie)', async () => {
    const user = userEvent.setup();
    const onOpenTab = vi.fn();
    render(<LessonsView onOpenTab={onOpenTab} />);

    await user.click(screen.getByTestId('lecons-mindmap'));
    expect(onOpenTab).toHaveBeenCalledTimes(1);
    expect(onOpenTab).toHaveBeenCalledWith('mindmap');
  });

  it('sans callback de navigation, la vue reste stable', () => {
    // Sans `onOpenTab`, la carte reste affichée mais ne fait rien : on vérifie
    // au moins que son absence ne casse pas le rendu de la vue.
    render(<LessonsView />);
    expect(screen.getByTestId('lecons-mindmap')).toBeTruthy();
  });
});

describe('les deux rubriques ont quitté le menu « المزيد »', () => {
  it('ni « وقت التركيز » ni « الخرائط الذهنية » n y sont', () => {
    const menu = bloc('SECONDARY_NAV');
    expect(menu, 'focus est encore une entrée du menu').not.toContain("tab: 'focus'");
    expect(menu, 'mindmap est encore une entrée du menu').not.toContain("tab: 'mindmap'");
  });

  it('le menu المزيد vide n est plus rendu du tout', () => {
    // Un groupe « المزيد » sans entrée serait un titre au-dessus de rien.
    expect(APP).toContain('SECONDARY_NAV.length > 0');
  });
});

describe('rien n est perdu : les deux outils restent joignables', () => {
  it('le minuteur reste monté et ouvert par le Déclic', () => {
    expect(APP).toContain('<FocusTimer');
    expect(APP).toMatch(/setCurrentTab\('focus'\)/);
  });

  it('la vue الخرائط الذهنية reste montée sur son onglet', () => {
    expect(APP).toContain('<MindMapView');
    expect(APP).toContain("currentTab === 'mindmap'");
  });
});
