// src/components/__tests__/OkachaView.test.tsx — harnais RTL du بنك الحفظ modernisé.
// Contrats de l'audit 2026-09-22 (Phase A) : plus de <pre> brut, recherche
// normalisée, mode حفظ (masquer → révéler → auto-évaluation branchée onRate),
// unité marquée lue persistée en localStorage.
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import OkachaView from '../OkachaView';

afterEach(cleanup);
beforeEach(() => window.localStorage.clear());

describe('OkachaView — بنك الحفظ modernisé', () => {
  it('rendu structuré : AUCUN <pre> brut, unités + bandeau stats', () => {
    const { container } = render(<OkachaView onBack={vi.fn()} />);
    // Le bug initial : tout le contenu dans un <pre> ~12 px.
    expect(container.querySelector('pre')).toBeNull();
    // En-tête + unités du domaine 1 (onglet par défaut).
    expect(screen.getByText(/بنك الحفظ/)).toBeTruthy();
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
    await user.click(screen.getByTestId('toggle-hafiz'));
    // Des points sont masqués (d1u1 en contient 24).
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
    await user.click(screen.getByTestId('lu-d1u1'));
    expect(JSON.parse(window.localStorage.getItem('kunz_okacha_progress_v1')!).lus).toEqual(['d1u1']);
    // Re-cliquer = annuler le marqueur (toggle).
    await user.click(screen.getByTestId('lu-d1u1'));
    expect(JSON.parse(window.localStorage.getItem('kunz_okacha_progress_v1')!).lus).toEqual([]);
  });

  it('bouton « اختبار الكتاب » appelle onOpenQcm (lien vers le QCM du livre)', async () => {
    const user = userEvent.setup();
    const onOpenQcm = vi.fn();
    render(<OkachaView onBack={vi.fn()} onOpenQcm={onOpenQcm} />);
    await user.click(screen.getByText('اختبار الكتاب'));
    expect(onOpenQcm).toHaveBeenCalledTimes(1);
  });
});
