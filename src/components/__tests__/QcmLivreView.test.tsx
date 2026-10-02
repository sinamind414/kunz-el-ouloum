// QcmLivreView.test.tsx — deep-link جسر : la ligne جسر d'une unité ouvre
// UNIQUEMENT les chapitres de cette unité, et l'élève peut revenir à la vue
// complète. Convention repo : pas de jest-dom ; cleanup() explicite.

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import QcmLivreView from '../QcmLivreView';
import { QCM_CHAPITRES } from '../../data/qcmLivre';
import { CHAPITRES } from '../../data/bookIndex';

const onBack = vi.fn();

function uniteOf(chapitre: number): number | undefined {
  const c = CHAPITRES[chapitre - 1];
  if (!c) return undefined;
  return c.unit + (c.domain === 1 ? 0 : c.domain === 2 ? 5 : 8);
}

beforeEach(() => {
  onBack.mockClear();
});

afterEach(() => {
  cleanup();
});

describe('QcmLivreView — deep-link جسر', () => {
  it('affiche TOUTES les unités sans deep-link', () => {
    render(<QcmLivreView onBack={onBack} />);
    const sections = screen.getAllByTestId(/^qcm-unite-\d+$/);
    expect(sections.length).toBeGreaterThan(1);
  });

  it('ne montre que les chapitres de l\'unité demandée', () => {
    // Unité 1 = domaine 1, unité locale 1.
    render(<QcmLivreView onBack={onBack} uniteInitiale={1} />);
    const sections = screen.getAllByTestId(/^qcm-unite-\d+$/);
    expect(sections).toHaveLength(1);
    expect(sections[0].getAttribute('data-testid')).toBe('qcm-unite-1');

    // Tous les chapitres affichés appartiennent bien à l'unité 1.
    for (const q of QCM_CHAPITRES) {
      if (uniteOf(q.chapitre) !== 1) continue;
      expect(sections[0].textContent).toContain(String(q.chapitre));
    }
  });

  it('porte le chip « جسر الوحدة N » et revient à la vue complète', () => {
    render(<QcmLivreView onBack={onBack} uniteInitiale={3} />);
    expect(screen.getByTestId('qcm-unite-3')).toBeTruthy();

    const toutVoir = Array.from(screen.getAllByRole('button')).find((b) =>
      b.textContent?.includes('عرض كل الوحدات'),
    );
    expect(toutVoir).toBeTruthy();
    fireEvent.click(toutVoir!);

    const sections = screen.getAllByTestId(/^qcm-unite-\d+$/);
    expect(sections.length).toBeGreaterThan(1);
  });

  it('signale l\'absence de questions pour une unité sans QCM', () => {
    render(<QcmLivreView onBack={onBack} uniteInitiale={999} />);
    expect(screen.getByTestId('qcm-unite-999')).toBeTruthy();
    expect(screen.getByTestId('qcm-unite-999').textContent).toContain('لا توجد أسئلة');
  });
});
