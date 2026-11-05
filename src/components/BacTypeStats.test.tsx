// BacTypeStats.test.tsx — statistiques PAR TYPE : aucune donnée fictive.

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import BacTypeStats from './BacTypeStats';

const CLE = 'kunz_exam_attempts_log_v1';

afterEach(cleanup);
beforeEach(() => localStorage.clear());

describe('إحصاءاتي حسب نوع الموضوع', () => {
  it('sans tentative : message explicite, aucun zéro affiché', () => {
    render(<BacTypeStats />);
    expect(screen.getByTestId('bac-stats-vide').textContent).toContain('لا توجد محاولات');
    expect(screen.queryByTestId('bac-stats-archetypes')).toBeNull();
  });

  it('groupe réellement par archétype, année, provenance et rang', () => {
    localStorage.setItem(
      CLE,
      JSON.stringify([
        {
          id: 'exam_1',
          dateISO: '2026-11-01T10:00:00.000Z',
          sujet: 1,
          total: 14,
          exercices: [
            { sujet: 1, exercice: 1, points: 4, maxPts: 5, couverture: 0.8 },
            { sujet: 1, exercice: 2, points: 5, maxPts: 7, couverture: 0.71 },
            { sujet: 1, exercice: 3, points: 5, maxPts: 8, couverture: 0.62 },
          ],
          source: 'bac2025',
          year: 2025,
          archetypeIds: ['arch_inhibiteur_sosie', 'arch_inhibiteur_sosie'],
        },
        {
          id: 'exam_2',
          dateISO: '2026-11-02T10:00:00.000Z',
          sujet: 2,
          total: 17,
          exercices: [{ sujet: 2, exercice: 3, points: 7, maxPts: 8, couverture: 0.88 }],
          source: 'bac2025',
          year: 2025,
          archetypeIds: ['arch_inhibiteur_sosie'],
        },
      ]),
    );
    render(<BacTypeStats />);
    const panel = screen.getByTestId('bac-stats-types');
    expect(panel.textContent).toContain('2 محاولة');
    expect(screen.getByTestId('bac-stats-archetypes').textContent).toContain('الجزيئة الشبيهة بالركيزة');
    expect(screen.getByTestId('bac-stats-annees').textContent).toContain('بكالوريا 2025');
    expect(screen.getByTestId('bac-stats-sources').textContent).toContain('الإطار الرسمي 2025');
    const exercices = screen.getByTestId('bac-stats-exercices').textContent!;
    expect(exercices).toContain('التمرين 3');
    expect(exercices).toContain('2 مرة'); // deux occurrences du rang 3
  });

  it('une ancienne tentative sans métadonnées ne crée pas de faux archétype', () => {
    localStorage.setItem(
      CLE,
      JSON.stringify([
        {
          id: 'exam_vieux',
          dateISO: '2026-10-01T10:00:00.000Z',
          sujet: 1,
          total: 11,
          exercices: [],
        },
      ]),
    );
    render(<BacTypeStats />);
    expect(screen.queryByTestId('bac-stats-archetypes')).toBeNull();
    expect(screen.queryByTestId('bac-stats-annees')).toBeNull();
    expect(screen.getByTestId('bac-stats-sources').textContent).toContain('الإطار الرسمي 2025');
  });
});
