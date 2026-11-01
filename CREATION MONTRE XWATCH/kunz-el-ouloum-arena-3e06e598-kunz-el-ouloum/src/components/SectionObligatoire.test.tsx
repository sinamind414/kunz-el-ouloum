// SectionObligatoire.test.tsx — F1 : la note machine reste honnête.
//
// Sans réserve manuelle : note + étiquette « تقديري » (estimation) — H4 :
// même toute automatique, la machine n'est pas un correcteur officiel.
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
  it('sans réserve manuelle : note affichée comme ESTIMATION (تقديري), pas de bandeau humain', () => {
    render(<SectionObligatoire note={BASE} />);
    expect(screen.getByText(/0 \/ 5 ن/)).toBeTruthy();
    expect(screen.queryByText(/يتطلب تدخلاً/)).toBeNull();
    expect(screen.queryByText(/مبدئي/)).toBeNull();
    // H4 (repli 2026-10-17) : même sans réserve manuelle, la note machine
    // reste une ESTIMATION de ce qu'un correcteur donnerait — calibrée sur
    // le corpus (calibration, pas validation), jamais une note définitive.
    // (badge « تقديري » + ligne « نقطة تقديرية آلية » — au moins 2 occurrences)
    expect(screen.getAllByText(/تقديري/).length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText(/التصحيح البشري هو المرجع النهائي/)).toBeTruthy();
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
