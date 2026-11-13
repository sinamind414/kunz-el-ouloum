// src/components/__tests__/dictaphoneNatif.test.tsx
// VERROU DU CHEMIN NATIF DU DICTAPHONE (APK)
//
// Le Dictaphone a deux moteurs : le plugin NATIF (APK, hors ligne) et la Web
// Speech API (navigateur). Ce verrou couvre le chemin natif :
//   1. sans Web Speech API mais AVEC plugin natif → le bouton est ACTIF
//      (c'est exactement le cas de l'APK : la WebView n'a pas de Web Speech
//      API, c'est le plugin qui débloque le micro) ;
//   2. le texte dicté FINAL est poussé dans le champ (jamais les fragments) ;
//   3. l'échec natif affiche un message honnête, sans laisser le micro ouvert.

import { act, cleanup, render, screen, fireEvent } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const natif = {
  disponible: true,
  texte: 'آلية ATP',
  erreur: null as string | null,
  dicter: vi.fn(async (_langue: string, _surPartiel?: (t: string) => void) => ({
    texte: 'آلية ATP',
    message: null as string | null,
  })),
  moteurNatifDisponible: vi.fn(
    async (): Promise<{ available: boolean; surAppareil: boolean; langue: string } | null> => ({
      available: true,
      surAppareil: true,
      langue: 'ar',
    }),
  ),
};

vi.mock('../../lib/microphone', () => ({
  moteurNatifDisponible: () => natif.moteurNatifDisponible(),
  dicterNatif: (langue: string, surPartiel?: (t: string) => void) => natif.dicter(langue, surPartiel),
}));

import Dictaphone from '../Dictaphone';

beforeEach(() => {
  natif.disponible = true;
  natif.texte = 'آلية ATP';
  natif.erreur = null;
  natif.dicter.mockClear();
  natif.moteurNatifDisponible.mockClear();
  // AUCUN moteur web : on force le cas de l'APK.
  delete (window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition;
  delete (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition;
});

afterEach(() => {
  cleanup();
});

describe('Dictaphone — chemin natif (APK)', () => {
  it('sans Web Speech API, le plugin natif garde le bouton ACTIF', async () => {
    render(<Dictaphone zone="apk" onTranscript={() => {}} />);
    await act(async () => {
      await Promise.resolve();
    });
    const bouton = screen.getByTestId('dictaphone-apk');
    expect(bouton.hasAttribute('disabled'), 'le micro doit être actif sur l’APK').toBe(false);
  });

  it('la dictée native pousse le texte final dans le champ', async () => {
    const onTranscript = vi.fn();
    render(<Dictaphone zone="apk" onTranscript={onTranscript} />);
    await act(async () => {
      await Promise.resolve();
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId('dictaphone-apk'));
      await Promise.resolve();
    });
    expect(natif.dicter).toHaveBeenCalled();
    expect(onTranscript).toHaveBeenCalledWith('آلية ATP');
  });

  it('échec natif : message honnête, et l’écoute est refermée', async () => {
    natif.dicter.mockResolvedValueOnce({ texte: '', message: 'تعذّر الاستماع' });
    const onTranscript = vi.fn();
    render(<Dictaphone zone="apk" onTranscript={onTranscript} />);
    await act(async () => {
      await Promise.resolve();
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId('dictaphone-apk'));
      await Promise.resolve();
    });
    expect(onTranscript).not.toHaveBeenCalled();
    expect(screen.getByText('تعذّر الاستماع')).toBeTruthy();
    expect(screen.queryByTestId('dictaphone-apk-vivant')).toBeNull();
  });

  it('ni plugin ni moteur web : bouton désactivé (honnêteté)', async () => {
    natif.moteurNatifDisponible.mockResolvedValueOnce(null);
    render(<Dictaphone zone="apk" onTranscript={() => {}} />);
    await act(async () => {
      await Promise.resolve();
    });
    const bouton = screen.getByTestId('dictaphone-apk');
    expect(bouton.hasAttribute('disabled')).toBe(true);
    expect(natif.dicter).not.toHaveBeenCalled();
  });
});
