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

async function ouvrirEspaceActif() {
  const user = userEvent.setup();
  render(<LessonsView />);
  await user.click(screen.getByText('الدرس النشيط'));
  return user;
}

describe('LessonsView — leçons actives par icônes', () => {
  it('écran d’entrée : les 10 unités actives en icônes (TC6 : U1-U5 et U10 gagnent leurs actives)', async () => {
    await ouvrirEspaceActif();
    expect(screen.getByTestId('unites-actives-icones')).toBeTruthy();
    // TC6 (audit architecture §6/W7) : U1, U2, U3, U4, U5 et U10 ont désormais
    // chacune au moins une leçon active câblée — l'écran icônes les liste toutes.
    for (const uid of [1, 2, 3, 4, 5, 6, 7, 9, 10, 11]) {
      expect(screen.getByTestId(`unite-active-${uid}`)).toBeTruthy();
    }
    // U8 reste la seule unité sans leçon active (leçons passives uniquement).
    expect(screen.queryByTestId('unite-active-8')).toBeNull();
    expect(screen.queryByTestId('lecons-actives-icones')).toBeNull();
  });

  it('icône d’unité → icônes des leçons (U6 التركيب الضوئي = 4 leçons)', async () => {
    const user = await ouvrirEspaceActif();
    await user.click(screen.getByTestId('unite-active-6'));
    expect(screen.getByTestId('lecons-actives-icones')).toBeTruthy();
    expect(screen.getAllByTestId(/^lecon-active-/)).toHaveLength(4);
    expect(screen.getByText(/تجربة كالفن/)).toBeTruthy();
  });

  it('bande d’unités : passer d’une unité à l’autre icône après icône', async () => {
    const user = await ouvrirEspaceActif();
    await user.click(screen.getByTestId('unite-active-6'));
    expect(screen.getAllByTestId(/^lecon-active-/)).toHaveLength(4);
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
    const user = await ouvrirEspaceActif();
    await user.click(screen.getByTestId('unite-active-9'));
    await user.click(screen.getByTestId('lecon-active-d3-u9-l2-benioff'));
    expect(screen.getByTestId('active-viewer').textContent).toBe('d3-u9-l2-benioff');
  });
});
