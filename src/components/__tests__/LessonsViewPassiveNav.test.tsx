// src/components/__tests__/LessonsViewPassiveNav.test.tsx
// Contrat de la navigation « icône après icône » des leçons passives
// (décision propriétaire 2026-09-22) :
//   domaine (icône) → unités (icônes) → chapitres (icônes) → leçon.
// Vérifie aussi que TOUTES les unités des 3 domaines sont atteignables.
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import LessonsView from '../LessonsView';

// La leçon ouverte n'est pas le sujet : on capture la clé reçue par le lecteur HTML.
vi.mock('../HtmlLessonViewer', () => ({
  default: ({ lessonKey }: { lessonKey: string }) => (
    <div data-testid="viewer">{lessonKey}</div>
  ),
}));

afterEach(cleanup);

/** Ouvre l'écran « درس سلبي » puis le domaine demandé. */
async function ouvrirDomaine(domaine: 1 | 2 | 3) {
  const user = userEvent.setup();
  render(<LessonsView />);
  await user.click(screen.getByText('الدرس السلبي'));
  await user.click(screen.getByTestId(`domaine-${domaine}`));
  return user;
}

describe('LessonsView — leçons passives par icônes', () => {
  it('domaine البروتينات والمناعة → 5 icônes d’unités, aucun chapitre affiché', async () => {
    await ouvrirDomaine(1);
    expect(screen.getByTestId('unites-icones')).toBeTruthy();
    for (const uid of [1, 2, 3, 4, 5]) {
      expect(screen.getByTestId(`unite-${uid}`)).toBeTruthy();
    }
    expect(screen.queryByTestId('unite-6')).toBeNull();
    expect(screen.queryByTestId('chapitres-icones')).toBeNull();
  });

  it('icône d’unité → icônes des chapitres (U4 المناعة = 6 icônes)', async () => {
    const user = await ouvrirDomaine(1);
    await user.click(screen.getByTestId('unite-4'));
    expect(screen.getByTestId('chapitres-icones')).toBeTruthy();
    expect(screen.getAllByTestId(/^chapitre-/)).toHaveLength(6);
    expect(screen.getByText(/الذات واللاذات/)).toBeTruthy();
  });

  it('bande d’unités : passer d’une unité à l’autre icône après icône', async () => {
    const user = await ouvrirDomaine(1);
    await user.click(screen.getByTestId('unite-1'));
    expect(screen.getAllByTestId(/^chapitre-/)).toHaveLength(4);
    await user.click(screen.getByTestId('bande-unite-5'));
    expect(screen.getAllByTestId(/^chapitre-/)).toHaveLength(5);
    expect(screen.getByText(/الاتصال العصبي/)).toBeTruthy();
    // Retour aux unités du domaine.
    await user.click(screen.getByText('عودة إلى وحدات المجال'));
    expect(screen.getByTestId('unites-icones')).toBeTruthy();
  });

  it('icône de chapitre → ouvre la leçon correspondante', async () => {
    const user = await ouvrirDomaine(1);
    await user.click(screen.getByTestId('unite-5'));
    await user.click(screen.getByTestId('chapitre-phase8_chapitres_15_16'));
    expect(screen.getByTestId('viewer').textContent).toBe('phase8_chapitres_15_16');
  });

  it('toutes les unités des 3 domaines sont atteignables par les icônes', async () => {
    const user = await ouvrirDomaine(1);
    // Domaines 2 et 3 depuis la liste des domaines.
    await user.click(screen.getByText('عودة إلى المجالات'));
    await user.click(screen.getByTestId('domaine-2'));
    for (const uid of [6, 7, 8]) expect(screen.getByTestId(`unite-${uid}`)).toBeTruthy();
    await user.click(screen.getByText('عودة إلى المجالات'));
    await user.click(screen.getByTestId('domaine-3'));
    for (const uid of [9, 10, 11]) expect(screen.getByTestId(`unite-${uid}`)).toBeTruthy();
    // Toutes les unités portent une icône rendue (svg lucide).
    expect(screen.getByTestId('unite-11').querySelector('svg')).toBeTruthy();
  });
});
