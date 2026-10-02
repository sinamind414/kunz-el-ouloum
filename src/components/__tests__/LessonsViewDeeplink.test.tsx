// LessonsViewDeeplink.test.tsx — deep-links المسار : ouverture d'une leçon précise
// et du QCM d'une unité précise au montage, à UNE reprise seulement.
//
// Convention repo : pas de jest-dom ; cleanup() explicite.

import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import LessonsView from '../LessonsView';

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  cleanup();
  localStorage.clear();
});

describe('LessonsView — deep-link المسار', () => {
  it('ouvre directement le QCM de l\'unité demandée', async () => {
    const consomme = vi.fn();
    render(<LessonsView initialQcm={3} onDeepLinkConsumed={consomme} />);
    await waitFor(() => {
      expect(screen.getByTestId('qcm-unite-3')).toBeTruthy();
    });
    // Seule l'unité 3 est affichée (filtre جسر).
    expect(screen.queryByTestId('qcm-unite-1')).toBeNull();
    expect(consomme).toHaveBeenCalledTimes(1);
  });

  it('ouvre directement une leçon HTML précise', async () => {
    const consomme = vi.fn();
    render(
      <LessonsView
        initialLesson={{ key: 'phase1_chapitres_1_2', kind: 'html', unitId: 1 }}
        onDeepLinkConsumed={consomme}
      />,
    );
    // HtmlLessonViewer est lazy : on attend que la leçon s'affiche.
    await waitFor(() => {
      expect(consomme).toHaveBeenCalledTimes(1);
    });
  });

  it('ouvre directement une leçon active précise', async () => {
    const consomme = vi.fn();
    render(
      <LessonsView
        initialLesson={{ key: 'amino_acid_behavior', kind: 'active', unitId: 2 }}
        onDeepLinkConsumed={consomme}
      />,
    );
    await waitFor(() => {
      expect(consomme).toHaveBeenCalledTimes(1);
    });
  });

  it('consomme le deep-link QCM à UNE reprise malgré le vidage du parent', async () => {
    let qcm: number | undefined = 3;
    const consomme = () => {
      qcm = undefined;
    };
    const { rerender } = render(<LessonsView initialQcm={qcm} onDeepLinkConsumed={consomme} />);
    await waitFor(() => {
      expect(screen.getByTestId('qcm-unite-3')).toBeTruthy();
    });
    // Le parent vide son état → LessonsView re-render sans deep-link,
    // mais l'unité demandée doit rester affichée (capture locale).
    rerender(<LessonsView initialQcm={undefined} onDeepLinkConsumed={consomme} />);
    expect(screen.getByTestId('qcm-unite-3')).toBeTruthy();
  });
});
