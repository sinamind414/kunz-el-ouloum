// src/components/__tests__/LessonsViewActiveNav.test.tsx
// Contrat de la navigation « icône après icône » des leçons ACTIVES
// (décision propriétaire 2026-09-22 — même principe que les leçons passives) :
//   الدرس النشيط → unités (icônes) → leçons (icônes) → leçon interactive.
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import LessonsView from '../LessonsView';

// La leçon interactive n'est pas le sujet : on capture la clé reçue.
vi.mock('../ActiveLessonView', () => ({
  default: ({ lessonKey }: { lessonKey: string }) => (
    <div data-testid="active-viewer">{lessonKey}</div>
  ),
}));

afterEach(cleanup);

// 2026-11-10 (navigation par chapitres) : la grille des unités actives ne
// montre que les unités du chapitre actif. Chaque test POSE donc le chapitre
// avant le rendu (même contrat icône après icône, périmètre du chapitre).
function poserChapitre(id: number) {
  localStorage.setItem('kunz-chapitre-actif', String(id));
}

async function ouvrirEspaceActif(chapitre = 1) {
  poserChapitre(chapitre);
  const user = userEvent.setup();
  render(<LessonsView />);
  await user.click(screen.getByText('الدرس النشيط'));
  return user;
}

describe('LessonsView — leçons actives par icônes', () => {
  it('écran d’entrée : les unités actives du chapitre posé, jamais celles des autres (TC6)', async () => {
    // Chapitre 1 : U1-U5 (TC6 : elles gagnent toutes leurs actives)…
    await ouvrirEspaceActif(1);
    expect(screen.getByTestId('unites-actives-icones')).toBeTruthy();
    for (const uid of [1, 2, 3, 4, 5]) {
      expect(screen.getByTestId(`unite-active-${uid}`)).toBeTruthy();
    }
    // …et AUCUNE unité des chapitres 2 et 3.
    for (const uid of [6, 7, 9, 10, 11]) {
      expect(screen.queryByTestId(`unite-active-${uid}`)).toBeNull();
    }
    expect(screen.queryByTestId('unite-active-8')).toBeNull();
    expect(screen.queryByTestId('lecons-actives-icones')).toBeNull();
    cleanup();
    // Chapitre 2 puis 3 : leurs unités actives sont listées quand on les pose.
    await ouvrirEspaceActif(2);
    expect(screen.getByTestId('unite-active-6')).toBeTruthy();
    expect(screen.getByTestId('unite-active-7')).toBeTruthy();
    expect(screen.queryByTestId('unite-active-1')).toBeNull();
    cleanup();
    await ouvrirEspaceActif(3);
    for (const uid of [9, 10, 11]) {
      expect(screen.getByTestId(`unite-active-${uid}`)).toBeTruthy();
    }
  });

  it('icône d’unité → icônes des leçons (U6 التركيب الضوئي = 4 leçons)', async () => {
    const user = await ouvrirEspaceActif(2);
    await user.click(screen.getByTestId('unite-active-6'));
    expect(screen.getByTestId('lecons-actives-icones')).toBeTruthy();
    expect(screen.getAllByTestId(/^lecon-active-/)).toHaveLength(4);
    expect(screen.getByText(/تجربة كالفن/)).toBeTruthy();
  });

  it('bande d’unités : passer d’une unité à l’autre icône après icône', async () => {
    const user = await ouvrirEspaceActif(3);
    await user.click(screen.getByTestId('unite-active-9'));
    expect(screen.getAllByTestId(/^lecon-active-/)).toBeTruthy();
    // La bande ne propose QUE les unités du chapitre actif :
    expect(screen.queryByTestId('bande-unite-active-6')).toBeNull();
    await user.click(screen.getByTestId('bande-unite-active-11'));
    // TC6 : subduction rejoint migmatite (2). H2 (2026-10-21) : wilson et
    // ophiolites s'ajoutent → 4 leçons actives en U11.
    expect(screen.getAllByTestId(/^lecon-active-/)).toHaveLength(4);
    expect(screen.getByText(/شواهد التقلص/)).toBeTruthy();
    expect(screen.getByText(/دورة ويلسون/)).toBeTruthy();
    expect(screen.getByText(/الأوفيوليت/)).toBeTruthy();
    // Retour aux unités actives.
    await user.click(screen.getByText('عودة إلى وحدات الدروس النشيطة'));
    expect(screen.getByTestId('unites-actives-icones')).toBeTruthy();
  });

  it('icône de leçon → ouvre la leçon interactive correspondante', async () => {
    const user = await ouvrirEspaceActif(3);
    await user.click(screen.getByTestId('unite-active-9'));
    await user.click(screen.getByTestId('lecon-active-d3-u9-l2-benioff'));
    expect(screen.getByTestId('active-viewer').textContent).toBe('d3-u9-l2-benioff');
  });
});
