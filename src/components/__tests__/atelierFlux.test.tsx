// atelierFlux.test.tsx — H3 : LE FLUX, PAS LE TEXTE.
//
// L'audit externe du 16/10 l'a prouvé par mutation : les tests qui lisent les
// sources (`toContain`) laissent mourir un appel — remplacer
// `bouclerApresCorrection(...)` par « abandon avant l'appel » laisse la suite
// entière verte, parce que le texte du fichier, lui, n'a pas changé.
//
// Ce fichier fait la seule chose qui détecte ça : il REND la vue, il CORRIGE
// une production (stage 2, complétion — le seul chemin sans portes cascades)
// et il exige que le pont avec la boucle du coach (`cloreErreursAbsentes`) ait
// réellement reçu l'appel — ainsi que le pont H1 de la remédiation
// (`planifierRappelsPourErreurs`), qui vit au même endroit.
//
// Preuve par mutation du 16/10/2026 : neutraliser l'appel de boucle dans
// `handleCheckStage2` rend ces tests ROUGES ; la restauration les rend verts.

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../utils/profilErreurs', async (importOriginal) => {
  const reel = await importOriginal<typeof import('../../utils/profilErreurs')>();
  return { ...reel, cloreErreursAbsentes: vi.fn(reel.cloreErreursAbsentes) };
});

vi.mock('../../lib/planificationRappels', async (importOriginal) => {
  const reel = await importOriginal<typeof import('../../lib/planificationRappels')>();
  return {
    ...reel,
    planifierRappelsPourErreurs: vi.fn(reel.planifierRappelsPourErreurs),
    remediationPour: vi.fn(reel.remediationPour),
  };
});

import { cloreErreursAbsentes } from '../../utils/profilErreurs';
import { planifierRappelsPourErreurs } from '../../lib/planificationRappels';
import MethodologyCompilerView from '../MethodologyCompilerView';

beforeEach(() => {
  window.localStorage.clear();
  window.sessionStorage.clear();
  vi.mocked(cloreErreursAbsentes).mockClear();
  vi.mocked(planifierRappelsPourErreurs).mockClear();
});
afterEach(cleanup); cleanup();

/** Monte l'atelier, passe en complétion (stage 2), corrige — le chemin réel. */
function corrigerUneCompletion(): void {
  render(<MethodologyCompilerView />);
  // La pastille de stage (grille des 4 étapes) — texte publié de l'atelier.
  const pastilles = screen.getAllByRole('button');
  const stage2 = pastilles.find((b) => b.textContent?.includes('Complétion'));
  expect(stage2, 'la pastille « complétion » est introuvable').toBeTruthy();
  fireEvent.click(stage2!);
  // Le bouton de correction du stage 2 — texte publié (l.1360) : « فحص الإجابة
  // وحساب ICM ». Les blancs restent vides : le correcteur voit des manques, ce
  // qui est exactement un flux de correction avec erreurs détectées.
  const boutons = screen.getAllByRole('button');
  const corriger = boutons.find((b) => b.textContent?.includes('فحص الإجابة'));
  expect(corriger, 'le bouton de correction stage 2 est introuvable').toBeTruthy();
  fireEvent.click(corriger!);
}

describe('le flux réel de correction câble la boucle ET la remédiation', () => {
  it('corriger appelle cloreErreursAbsentes — mutation « abandon avant l’appel » détectée', async () => {
    corrigerUneCompletion();
    await waitFor(() => expect(cloreErreursAbsentes).toHaveBeenCalled());
  });

  it('la même correction a appelé le pont H1 planifierRappelsPourErreurs avec les codes détectés', async () => {
    corrigerUneCompletion();
    await waitFor(() => expect(planifierRappelsPourErreurs).toHaveBeenCalled());
    const codes = vi.mocked(planifierRappelsPourErreurs).mock.calls[0]?.[0];
    expect(Array.isArray(codes)).toBeTruthy();
  });
});
