// masariBranche.test.tsx — Verrou Commit A, Phase 2 (GO utilisateur 2026-10-16).
//
// Plainte expert pédagogue : « je dois verrouiller des rubriques pour
// déverrouiller d'autres, aussi pour les leçons chapitre par chapitre ».
// Le moteur de progression VERROUILLÉE existe déjà (parcoursProgress :
// 'locked' | 'available' | 'current' | 'done', jalons, rappels J+14) et son
// écran ParcoursView est CONSTRUIT — mais jamais branché : le zombie documenté
// du verrou anti-zombie (integriteVues.lock.test.ts, exception ParcoursView).
//
// Ce verrou prouve le BRANCHEMENT dans l'App réelle (patron serieIntegration) :
//  1. Le tableau de bord offre une porte « مساري » bien visible.
//  2. Elle ouvre l'écran du parcours verrouillé (« مسار تعلمك »).
//
// Exception anti-zombie : une fois ce test vert, `integriteVues.lock.test.ts`
// n'a plus besoin d'exception pour ParcoursView (livré avec le Commit C).

import { cleanup, render, screen, fireEvent } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import App from '../../App';

// jsdom ne fournit pas ResizeObserver (framer-motion/recharts dans NbaCard).
class RO {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver = globalThis.ResizeObserver ?? RO;

afterEach(() => {
  cleanup();
  localStorage.clear();
});

async function demarrerEtFermerDeclic() {
  render(<App />);
  fireEvent.click(screen.getByText('افْتَحْ كَنْزَ العُلُومِ (دخول)'));
  fireEvent.click(await screen.findByText('ابدأ رحلة التعلم', {}, { timeout: 4000 }));
  await screen.findByTestId('declic-overlay', {}, { timeout: 4000 });
  fireEvent.click(screen.getByText('ليس الآن'));
}

describe('Commit A — la porte « مساري » ouvre le parcours verrouillé', () => {
  it('le tableau de bord offre une porte « مساري » bien visible', async () => {
    await demarrerEtFermerDeclic();
    expect(screen.getByTestId('btn-masari')).toBeTruthy();
    // Compte tenu de la plainte « trop de rubriques », la porte est UNE :
    expect(screen.getAllByTestId('btn-masari')).toHaveLength(1);
  });

  it('cette porte ouvre l’écran du parcours verrouillé (« مسار تعلمك »)', async () => {
    await demarrerEtFermerDeclic();
    fireEvent.click(screen.getByTestId('btn-masari'));
    const titre = await screen.findByText('مسار تعلمك', {}, { timeout: 4000 });
    expect(titre).toBeTruthy();
  });
});
