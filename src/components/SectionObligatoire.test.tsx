// SectionObligatoire.test.tsx — F1 : la note machine reste honnête.
//
// Sans réserve manuelle : note finale A/maxPts affichée.
// Avec réserve manuelle : la machine affiche une FOURCHETTE [A, A+U] et le
// bandeau « humain requis » — jamais une note Bac présentée comme définitive.

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import SectionObligatoire from './SectionObligatoire';
import { noterExerciceCalibre, type NoteCalibree } from '../data/dictionaries/calibrationBac2025';

afterEach(cleanup);

// Base réelle (copie vide sur S1-Ex1 → 0/5, aucune réserve manuelle).
const BASE = noterExerciceCalibre('', 1, 1);

describe('SectionObligatoire — F1 (échelle officielle)', () => {
  it('sans réserve manuelle : note finale plate, pas de bandeau humain', () => {
    render(<SectionObligatoire note={BASE} />);
    expect(screen.getByText(/0 \/ 5 ن/)).toBeTruthy();
    expect(screen.queryByText(/يتطلب تدخلاً/)).toBeNull();
    expect(screen.queryByText(/مبدئي/)).toBeNull();
  });

  it('avec réserve manuelle : fourchette [A, A+U] + bandeau + étiquette « مبدئي »', () => {
    const note: NoteCalibree = {
      ...BASE,
      points: 3,
      maxPts: 5,
      pointsAutoAcquis: 3,
      pointsManuelsAArbitrer: 1,
      noteFinale: null,
    };
    render(<SectionObligatoire note={note} />);
    expect(screen.getByText(/يتطلب تدخلاً بشرياً/)).toBeTruthy();
    expect(screen.getByText(/نطاق التقدير/)).toBeTruthy();
    expect(screen.getByText(/مبدئي/)).toBeTruthy();
    // La note n'est plus présentée comme un total définitif.
    expect(screen.queryByText(/^3 \/ 5 ن$/)).toBeNull();
  });

  it('S1-Ex3 : l’étiquette annonce la ventilation par partie (pas « التغطية × maxPts »)', () => {
    render(<SectionObligatoire note={noterExerciceCalibre('', 1, 3)} />);
    expect(screen.getByText(/تهوية الأجزاء/)).toBeTruthy();
    expect(screen.queryByText(/التغطية × 8/)).toBeNull();
  });
});
