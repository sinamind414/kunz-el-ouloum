// src/components/__tests__/OkachaView.test.tsx — harnais RTL de الحصيلة المعرفية modernisée.
// Contrats de l'audit 2026-09-22 (Phase A) + 2026-09-23 (contenu officiel) :
// plus de <pre> brut, recherche normalisée, mode حفظ (masquer → révéler →
// auto-évaluation branchée onRate), unité marquée lue persistée en localStorage,
// et rendu du نصّ hosila officiel (pas de l'OCR عكاشة seul).
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import OkachaView from '../OkachaView';
import { GUIDE_SECTIONS } from '../../data/guideManhajia';

afterEach(cleanup);
beforeEach(() => window.localStorage.clear());

// jsdom n'implémente ni scrollIntoView (ancrage du sommaire du guide).
Element.prototype.scrollIntoView = () => {};

describe('OkachaView — الحصيلة المعرفية modernisée', () => {
  it('rendu structuré : AUCUN <pre> brut, unités + bandeau stats', () => {
    const { container } = render(<OkachaView onBack={vi.fn()} />);
    // Le bug initial : tout le contenu dans un <pre> ~12 px.
    expect(container.querySelector('pre')).toBeNull();
    // En-tête + unités du domaine 1 (onglet par défaut).
    expect(screen.getByRole('heading', { name: /الحصيلة المعرفية/ })).toBeTruthy();
    // « تركيب البروتين » : en-tête d'unité + titre dans le corps ouvert → au moins 1.
    expect(screen.getAllByText(/تركيب البروتين/).length).toBeGreaterThan(0);
    // Bandeau statistiques (HOSILA_STATS : 71 points · 10 unités).
    expect(screen.getByText(/نقطة · 10 وحدات/)).toBeTruthy();
    // La source affichée est la حصيلة الرسمية, pas l'OCR عكاشة seul.
    expect(screen.getByText(/الحصيلة المعرفية الرسمية/)).toBeTruthy();
  });

  it('contenu officiel (hosila) : d1u1 rend les ancrages livre pages 32-34', async () => {
    const user = userEvent.setup();
    render(<OkachaView onBack={vi.fn()} />);
    await user.click(screen.getByTestId('okacha-unite-d1u1'));
    // Ancrages hosila.lock.test.ts d1u1 — absents de l'OCR عكاشة corrompu.
    expect(screen.getByText(/64 رامزة/)).toBeTruthy();
    expect(screen.getByText(/Introns/)).toBeTruthy();
    expect(screen.getByText(/النشاط ➎/)).toBeTruthy();
  });

  it('recherche arabe normalisée : filtre tout le corpus et affiche les résultats', async () => {
    const user = userEvent.setup();
    render(<OkachaView onBack={vi.fn()} />);
    const input = screen.getByTestId('okacha-search');
    await user.type(input, 'الاستنساخ');
    const panneau = screen.getByTestId('okacha-results');
    expect(panneau.textContent).toMatch(/نتيجة/);
    // Au moins un hit réel (le terme est central du corpus).
    expect(panneau.textContent).not.toMatch(/لا نتائج/);
    // La liste des unités (en-têtes) est remplacée par les résultats :
    // le testid lu-d1u1 n'existe que dans l'en-tête d'unité — les extraits
    // de résultats peuvent contenir « تركيب البروتين » en contexte, d'où le testid.
    expect(screen.queryByTestId('lu-d1u1')).toBeNull();
  });

  it('mode حفظ : masquer → révéler → auto-évaluation notifiée à onRate', async () => {
    const user = userEvent.setup();
    const onRate = vi.fn();
    render(<OkachaView onBack={vi.fn()} onRate={onRate} />);
    // Navigation par icônes : ouvrir l'unité d1u1 (تركيب البروتين).
    await user.click(screen.getByTestId('okacha-unite-d1u1'));
    await user.click(screen.getByTestId('toggle-hafiz'));
    // Des points sont masqués (d1u1 officiel en contient 12).
    const reveals = screen.getAllByTestId(/^reveal-/);
    expect(reveals.length).toBeGreaterThan(0);
    await user.click(reveals[0]!);
    // La barre d'auto-évaluation apparaît sur le point révélé.
    const evals = screen.getAllByTestId(/^eval-/);
    expect(evals.length).toBe(1);
    await user.click(screen.getByText('جيدة'));
    expect(onRate).toHaveBeenCalledTimes(1);
    const [cle, note] = onRate.mock.calls[0]!;
    expect(String(cle)).toMatch(/^d1u1#\d+$/);
    expect(note).toBe('good');
    // La note est persistée (okachaProgress).
    const brut = window.localStorage.getItem('kunz_okacha_progress_v1');
    expect(brut).toBeTruthy();
    expect(brut).toContain('"good":1');
  });

  it('unité marquée « محفوظة » persistée en localStorage (progression)', async () => {
    const user = userEvent.setup();
    render(<OkachaView onBack={vi.fn()} />);
    // Le marqueur vit dans l'en-tête de l'unité ouverte (navigation par icônes).
    await user.click(screen.getByTestId('okacha-unite-d1u1'));
    await user.click(screen.getByTestId('lu-d1u1'));
    expect(JSON.parse(window.localStorage.getItem('kunz_okacha_progress_v1')!).lus).toEqual(['d1u1']);
    // Re-cliquer = annuler le marqueur (toggle).
    await user.click(screen.getByTestId('lu-d1u1'));
    expect(JSON.parse(window.localStorage.getItem('kunz_okacha_progress_v1')!).lus).toEqual([]);
  });

  it('navigation par icônes : domaine → 5 unités, puis contenu + bande d’unités', async () => {
    const user = userEvent.setup();
    render(<OkachaView onBack={vi.fn()} />);
    // Écran d'entrée : icônes des 5 unités du domaine 1.
    expect(screen.getByTestId('okacha-unites-icones')).toBeTruthy();
    for (const id of ['d1u1', 'd1u2', 'd1u3', 'd1u4', 'd1u5']) {
      expect(screen.getByTestId(`okacha-unite-${id}`)).toBeTruthy();
    }
    expect(screen.queryByTestId('okacha-unite-d2u1')).toBeNull();
    // Un clic = l'unité s'ouvre, les autres icônes laissent place au contenu.
    await user.click(screen.getByTestId('okacha-unite-d1u3'));
    expect(screen.queryByTestId('okacha-unites-icones')).toBeNull();
    expect(screen.getByTestId('bande-unites-okacha')).toBeTruthy();
    expect(screen.getByText(/النشاط الإنزيمي للبروتينات/)).toBeTruthy();
    // Bande : passer à l'unité suivante icône après icône.
    await user.click(screen.getByTestId('bande-unite-okacha-d1u5'));
    expect(screen.getByText(/الاتصال العصبي/)).toBeTruthy();
    // Retour à la grille d'icônes.
    await user.click(screen.getByTestId('okacha-retour-unites'));
    expect(screen.getByTestId('okacha-unites-icones')).toBeTruthy();
  });

  it('changer de domaine remet l’écran d’icônes (D2 : 2 unités, D3 : 3)', async () => {
    const user = userEvent.setup();
    render(<OkachaView onBack={vi.fn()} />);
    await user.click(screen.getByTestId('okacha-unite-d1u1'));
    expect(screen.getByTestId('bande-unites-okacha')).toBeTruthy();
    await user.click(screen.getByTestId('onglet-domaine-2'));
    expect(screen.getByTestId('okacha-unites-icones')).toBeTruthy();
    expect(screen.getAllByTestId(/^okacha-unite-/)).toHaveLength(2);
    await user.click(screen.getByTestId('onglet-domaine-3'));
    expect(screen.getAllByTestId(/^okacha-unite-/)).toHaveLength(3);
  });

  it('الدليل العام للمنهجية : 11 sections, chacune avec une icône', async () => {
    const user = userEvent.setup();
    render(<OkachaView onBack={vi.fn()} />);
    await user.click(screen.getByTestId('onglet-methode'));
    // Titre du document + libellé de l'onglet renommé.
    expect(screen.getByTestId('guide-titre').textContent).toMatch(/الدليل المتكامل/);
    const sections = screen.getAllByTestId(/^methodo-section-/);
    expect(sections).toHaveLength(GUIDE_SECTIONS.length);
    expect(GUIDE_SECTIONS).toHaveLength(11);
    for (const s of sections) {
      expect(s.querySelector('svg'), 'section sans icône').toBeTruthy();
    }
    expect(screen.getByTestId('methodo-sommaire')).toBeTruthy();
    expect(screen.getAllByTestId(/^sommaire-/)).toHaveLength(GUIDE_SECTIONS.length);
    // badge « n/11 sections lues »
    expect(screen.getByText(/0\/11 أقسام مقروءة/)).toBeTruthy();
    // L'ancien corpus OCR عكاشة n'est plus rendu dans cette rubrique.
    expect(screen.getByRole('button', { name: /الدليل العام للمنهجية/ })).toBeTruthy();
  });

  it('sommaire : clique ouvre la section, incrémente le badge et expose les sous-sections', async () => {
    const user = userEvent.setup();
    render(<OkachaView onBack={vi.fn()} />);
    await user.click(screen.getByTestId('onglet-methode'));
    // s3 (verbes d'action) est fermée au départ : pas de barre de sous-sections.
    expect(screen.queryByTestId('methodo-sous-s3')).toBeNull();
    await user.click(screen.getByTestId('sommaire-s3'));
    expect(screen.getByTestId('methodo-section-s3')).toBeTruthy();
    expect(screen.getByText(/1\/11 أقسام مقروءة/)).toBeTruthy();
    // 4 sous-sections (3.1 → 3.4) : pastilles cliquables présentes.
    expect(screen.getByTestId('methodo-sous-s3')).toBeTruthy();
    expect(screen.getAllByTestId(/^sous-s3-h\d$/)).toHaveLength(4);
    expect(screen.getByTestId('sous-s3-h0')).toBeTruthy();
  });

  it('table des matières : ancres cliquables → ouvrent la section de destination', async () => {
    const user = userEvent.setup();
    render(<OkachaView onBack={vi.fn()} />);
    await user.click(screen.getByTestId('onglet-methode'));
    // Les 9 entrées numérotées du sommaire sont cliquables (aller-s1 … aller-s9).
    const ancres = screen.getAllByTestId(/^aller-s\d$/);
    expect(ancres.length).toBeGreaterThanOrEqual(9);
    expect(screen.queryByTestId('methodo-sous-s2')).toBeNull();
    // 2ᵉ entrée = « 2. Le nouveau format du BAC depuis 2017 ».
    await user.click(ancres[1]);
    expect(screen.getByTestId('methodo-sous-s2')).toBeTruthy();
    expect(screen.getByText(/1\/11 أقسام مقروءة/)).toBeTruthy();
    // Les tableaux du guide sont bien rendus en HTML.
    expect(screen.getAllByTestId(/^tableau-/).length).toBeGreaterThan(0);
  });

  it('bouton « اختبار الكتاب » appelle onOpenQcm (lien vers le QCM du livre)', async () => {
    const user = userEvent.setup();
    const onOpenQcm = vi.fn();
    render(<OkachaView onBack={vi.fn()} onOpenQcm={onOpenQcm} />);
    await user.click(screen.getByText('اختبار الكتاب'));
    expect(onOpenQcm).toHaveBeenCalledTimes(1);
  });

  // ── Lot A (2026-09-24) : filtre OCR à l'affichage ──────────────────────
  it('masque les déchets scan (traits ____, carrés ■, filigranes المتفوف)', async () => {
    const user = userEvent.setup();
    const { container } = render(<OkachaView onBack={vi.fn()} />);
    // Écran unités (aucun corps ouvert) : zéro déchet dans le DOM.
    expect(container.textContent).not.toMatch(/_{4,}/);
    expect(container.textContent).not.toMatch(/■/);
    expect(container.textContent).not.toMatch(/المتفوف/);
    // Ouvrir une unité riche en OCR (d1u1) + méthodo.
    await user.click(screen.getByTestId('okacha-unite-d1u1'));
    expect(container.textContent).not.toMatch(/_{4,}/);
    expect(container.textContent).not.toMatch(/■/);
    expect(container.textContent).not.toMatch(/المتفوف/);
    await user.click(screen.getByTestId('onglet-methode'));
    expect(container.textContent).not.toMatch(/_{4,}/);
    expect(container.textContent).not.toMatch(/■/);
    expect(container.textContent).not.toMatch(/المتفوف/);
    // La recherche n'expose pas non plus les déchets masqués
    // (le texte du champ requête reste affiché dans l'en-tête de résultats).
    const input = screen.getByTestId('okacha-search');
    await user.type(input, 'بربشفي');
    const panneau = screen.getByTestId('okacha-results');
    expect(panneau.textContent).toMatch(/لا نتائج|نتيجة/);
    expect(panneau.textContent).not.toMatch(/سأةم/); // corps du déchet masqué
  });
});
