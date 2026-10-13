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

/** Ouvre l'écran « الدرس الرسمي » (ancien libellé « درس سلبي ») puis le domaine demandé. */
async function ouvrirDomaine(domaine: 1 | 2 | 3) {
  const user = userEvent.setup();
  render(<LessonsView />);
  await user.click(screen.getByText('الدرس الرسمي'));
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

  it('bannière du principe : leçon suggérée + compteur X / Y sur الدرس الرسمي', async () => {
    const user = userEvent.setup();
    render(<LessonsView />);
    // La rubrique « مسار تعلمك » a quitté le menu (2026-10-03) : son principe
    // « séquence ordonnée » vit désormais en tête de l'écran des domaines.
    await user.click(screen.getByText('الدرس الرسمي'));
    const bandeau = screen.getByTestId('bandeau-sequence');
    expect(bandeau).toBeTruthy();
    expect(screen.getByText('الدرس المقترح التالي')).toBeTruthy();
    // Compteur « X / Y » (état vierge → 0 sur le total du chemin).
    expect(bandeau.textContent).toMatch(/\d+\s*\/\s*\d+/);
    // La leçon suggérée est ouvrable en un geste.
    expect(screen.getByTestId('bandeau-sequence-ouvrir')).toBeTruthy();
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
  // ── Examens déplacés dans le hub « التمارين والتدريب » (2026-10-12) ────
  // Produire une réponse = s'entraîner, pas apprendre. Les deux examens ont
  // donc quitté cet écran pour le hub (entrée `examens`, sous-écran dédié).
  it('l’écran principal n’a plus ni carte « الحصيلة المعرفية » ni examens', () => {
    render(<LessonsView />);
    expect(screen.queryByText('الحصيلة المعرفية')).toBeNull();
    expect(screen.queryByTestId('okacha-entree-domaine')).toBeNull();
    // Les examens ont quitté « الدروس » — déplacement, pas perte : la porte est
    // l'entrée `examens` du hub S'entraîner (verrouillé par son propre test).
    expect(screen.queryByText('اختبار الفصول')).toBeNull();
    expect(screen.queryByText('اختبار بكالوريا')).toBeNull();
    // Ce qui reste : ce qui sert à COMPRENDRE.
    expect(screen.getByText('الدرس الرسمي')).toBeTruthy();
    expect(screen.getByText('الدرس النشيط')).toBeTruthy();
  });

  // Le lien de remplacement existe vraiment : les examens restent ouvrables en
  // un clic depuis le hub, par deep-link dans LessonsView. QcmLivreView et
  // BacExamView sont `lazy` : on attend la résolution du chunk, jamais le
  // fallback de chargement. Les deep-links étant consommés au MONTAGE, chaque
  // cas est un rendu neuf (un rerender ne rejouerait pas l'effet).
  it('les examens restent atteignables en un clic depuis le hub via initialMode', async () => {
    const premier = render(<LessonsView />);
    expect(screen.queryByTestId('qcm-livre')).toBeNull();
    premier.unmount();

    render(<LessonsView initialMode="qcm" />);
    expect(await screen.findByTestId('qcm-livre')).toBeTruthy();
    cleanup();

    render(<LessonsView initialMode="bac" />);
    expect(await screen.findByTestId('bac-exam')).toBeTruthy();
  });

  it('chaque domaine a SA الحصيلة : entrée en fin d’écran, ouverte sur ce domaine', async () => {
    const user = await ouvrirDomaine(3);
    const entree = screen.getByTestId('okacha-entree-domaine');
    // La carte porte bien le nom du domaine courant.
    expect(entree.textContent).toMatch(/الحصيلة المعرفية/);
    expect(entree.textContent).toMatch(/التكتونية العامة/);
    await user.click(entree);
    // OkachaView est devenue lazy : la résolution du chunk passe par le Suspense
    // (fallback « lessons-chargement ») — on attend la vue, jamais le fallback.
    expect(await screen.findAllByTestId(/^okacha-unite-/)).toHaveLength(3);
    // Et avec les numéros des LEÇONS (الصفائح = وحدة 9, بنية الكرة = وحدة 10).
    expect((await screen.findByTestId('unite-numero-d3u2')).textContent).toMatch(/وحدة 9/);
    expect((await screen.findByTestId('unite-numero-d3u1')).textContent).toMatch(/وحدة 10/);
    // Retour → on revient à l'écran des unités du domaine (pas au menu principal).
    await user.click(screen.getByText('عودة'));
    expect(screen.getByTestId('unites-icones')).toBeTruthy();
  });

  it('الدليل العام للمنهجية : carte sur l’écran des domaines, hors des حصائل', async () => {
    const user = userEvent.setup();
    render(<LessonsView />);
    await user.click(screen.getByText('الدرس الرسمي'));
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
