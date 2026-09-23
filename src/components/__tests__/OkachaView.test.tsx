// src/components/__tests__/OkachaView.test.tsx — harnais RTL de الحصيلة المعرفية modernisée.
// Contrats de l'audit 2026-09-22 (Phase A) : plus de <pre> brut, recherche
// normalisée, mode حفظ (masquer → révéler → auto-évaluation branchée onRate),
// unité marquée lue persistée en localStorage.
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import OkachaView from '../OkachaView';

afterEach(cleanup);
beforeEach(() => window.localStorage.clear());

describe('OkachaView — الحصيلة المعرفية modernisée', () => {
  it('rendu structuré : AUCUN <pre> brut, unités + bandeau stats', () => {
    const { container } = render(<OkachaView onBack={vi.fn()} />);
    // Le bug initial : tout le contenu dans un <pre> ~12 px.
    expect(container.querySelector('pre')).toBeNull();
    // En-tête + unités du domaine 1 (onglet par défaut).
    expect(screen.getByText(/الحصيلة المعرفية/)).toBeTruthy();
    // « تركيب البروتين » : en-tête d'unité + titre dans le corps ouvert → au moins 1.
    expect(screen.getAllByText(/تركيب البروتين/).length).toBeGreaterThan(0);
    // Bandeau statistiques (points totaux du corpus enrichi).
    expect(screen.getByText(/نقطة · 10 وحدات/)).toBeTruthy();
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
    // Des points sont masqués (d1u1 officiel en contient 13).
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

  it('méthodologie : 8 sections, chacune avec une icône (aucun repère manquant)', async () => {
    const user = userEvent.setup();
    render(<OkachaView onBack={vi.fn()} />);
    await user.click(screen.getByTestId('onglet-methode'));
    const sections = screen.getAllByTestId(/^methodo-section-/);
    expect(sections).toHaveLength(8);
    for (const s of sections) {
      expect(s.querySelector('svg'), 'section sans icône').toBeTruthy();
    }
  });

  it('bouton « اختبار الكتاب » appelle onOpenQcm (lien vers le QCM du livre)', async () => {
    const user = userEvent.setup();
    const onOpenQcm = vi.fn();
    render(<OkachaView onBack={vi.fn()} onOpenQcm={onOpenQcm} />);
    await user.click(screen.getByText('اختبار الكتاب'));
    expect(onOpenQcm).toHaveBeenCalledTimes(1);
  });
});
