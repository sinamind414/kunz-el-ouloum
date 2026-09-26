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
  it('domaine التخصص الوظيفي للبروتينات → 5 icônes d’unités, aucun chapitre affiché', async () => {
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

  // ── الحصيلة المعرفية déplacée dans les leçons passives ─────────────────
  it('l’écran principal n’a plus de carte « الحصيلة المعرفية » autonome', () => {
    render(<LessonsView />);
    expect(screen.queryByText('الحصيلة المعرفية')).toBeNull();
    expect(screen.queryByTestId('okacha-entree-domaine')).toBeNull();
    // Les 4 autres rubriques sont toujours là.
    expect(screen.getByText('الدرس السلبي')).toBeTruthy();
    expect(screen.getByText('اختبار الكتاب')).toBeTruthy();
    expect(screen.getByText('اختبار بكالوريا')).toBeTruthy();
  });

  it('chaque domaine a SA الحصيلة : entrée en fin d’écran, ouverte sur ce domaine', async () => {
    const user = await ouvrirDomaine(3);
    const entree = screen.getByTestId('okacha-entree-domaine');
    // La carte porte bien le nom du domaine courant.
    expect(entree.textContent).toMatch(/الحصيلة المعرفية/);
    expect(entree.textContent).toMatch(/التكتونية العامة/);
    await user.click(entree);
    // La حصيلة s'ouvre sur le domaine courant (D3), pas en domaine 1 par défaut.
    expect(screen.getAllByTestId(/^okacha-unite-/)).toHaveLength(3);
    // Et avec les numéros des LEÇONS (الصفائح = وحدة 9, بنية الكرة = وحدة 10).
    expect(screen.getByTestId('unite-numero-d3u2').textContent).toMatch(/وحدة 9/);
    expect(screen.getByTestId('unite-numero-d3u1').textContent).toMatch(/وحدة 10/);
    // Retour → on revient à l'écran des unités du domaine (pas au menu principal).
    await user.click(screen.getByText('عودة'));
    expect(screen.getByTestId('unites-icones')).toBeTruthy();
  });

  it('الدليل العام للمنهجية : carte sur l’écran des domaines, hors des حصائل', async () => {
    const user = userEvent.setup();
    render(<LessonsView />);
    await user.click(screen.getByText('الدرس السلبي'));
    // Écran des domaines : les 3 domaines + le guide (qui n'appartient à aucun).
    const guide = screen.getByTestId('guide-entree');
    expect(guide.textContent).toMatch(/الدليل العام للمنهجية/);
    expect(screen.getByTestId('domaine-1')).toBeTruthy();
    expect(screen.queryByTestId('okacha-entree-domaine')).toBeNull();
    // Ouverture : on arrive sur le guide, pas sur une حصيلة de domaine.
    await user.click(guide);
    expect(screen.getByTestId('guide-titre')).toBeTruthy();
    expect(screen.getByTestId('okacha-contexte').textContent).toMatch(/الدليل العام للمنهجية/);
    expect(screen.queryByTestId('okacha-unites-icones')).toBeNull();
    // Retour → écran des domaines (selectedDomain est toujours null).
    await user.click(screen.getByText('عودة'));
    expect(screen.getByTestId('domaine-1')).toBeTruthy();
    expect(screen.queryByTestId('okacha-contexte')).toBeNull();
  });
});
