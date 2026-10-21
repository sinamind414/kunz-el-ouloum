// sujetsBlancsHub.lock.test.tsx — VERROU H4d (audit 8 axes 20/10/2026).
// L'écran des sujets blancs est DÉDIÉ (plus noyé parmi les officiels) et les
// deux bugs H4 résiduels restent interdits :
//   1. blanc3 doit afficher SON titre d'en-tête (pas « الإطار الرسمي ») ;
//   2. toute tentative — officielle OU blanche — doit être historisée sous
//      son VRAI libellé (le correcteur ne réétiquette jamais une copie).
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import Bac2025ExamView from '../components/Bac2025ExamView';
import { getExamAttempts } from '../utils/examLog';

beforeEach(() => localStorage.clear());
afterEach(cleanup);

describe('H4d — écran dédié des sujets blancs', () => {
  it('deux sections dédiées : officiels (2) + blancs originaux (4)', () => {
    render(<Bac2025ExamView onClose={() => {}} />);
    expect(screen.getByTestId('sujets-officiels-hub')).toBeTruthy();
    const hub = screen.getByTestId('sujets-blancs-hub');
    expect(hub).toBeTruthy();
    // les 4 cartes blanches vivent DANS la section dédiée
    for (const id of ['sujet-blanc-1', 'sujet-blanc-2', 'sujet-blanc-3', 'sujet-blanc-4']) {
      expect(hub.querySelector(`[data-testid="${id}"]`)).toBeTruthy();
    }
    const officiel = screen.getByTestId('sujets-officiels-hub');
    expect(officiel.querySelector('[data-testid="sujet-blanc-1"]')).toBeNull();
  });

  it('bug corrigé : blanc3 affiche SON titre (pas « الإطار الرسمي — بكالوريا 2025 »)', () => {
    render(<Bac2025ExamView onClose={() => {}} />);
    fireEvent.click(screen.getByTestId('sujet-blanc-3'));
    expect(screen.getByText(/الموضوع الأصلي الثالث/)).toBeTruthy();
    expect(screen.queryByText(/الإطار الرسمي — بكالوريا 2025/)).toBeNull();
  });

  it('bug corrigé : une tentative blanche est historisée sous son libellé (المقترح الثالث)', () => {
    render(<Bac2025ExamView onClose={() => {}} />);
    fireEvent.click(screen.getByTestId('sujet-blanc-3'));
    fireEvent.click(screen.getByText(/تسليم التصحيح/));
    expect(getExamAttempts()).toHaveLength(1);
    expect(getExamAttempts()[0]!.sujet).toBe('blanc3');
    fireEvent.click(screen.getByText(/سجل النقاط/));
    // l'entrée d'historique ET la carte du hub portent ce libellé
    expect(screen.getAllByText(/الموضوع المقترح الثالث/).length).toBeGreaterThanOrEqual(2);
    // entrée d'historique = libellé complet (l'ancien étiquetage fautif disparaît)
    expect(screen.getAllByText(/المقترح الثالث — إطار كامل/).length).toBe(1);
  });

  it('tentative officielle : libellé complet « الإطار الرسمي 2025 — الموضوع الأول »', () => {
    render(<Bac2025ExamView onClose={() => {}} />);
    fireEvent.click(screen.getByText(/تسليم التصحيح/));
    fireEvent.click(screen.getByText(/سجل النقاط/));
    expect(screen.getByText(/الإطار الرسمي 2025 — الموضوع الأول/)).toBeTruthy();
  });
});
