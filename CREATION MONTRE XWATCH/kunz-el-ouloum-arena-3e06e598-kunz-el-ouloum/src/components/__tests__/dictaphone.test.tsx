// dictaphone.test.tsx — verrou du micro-dictée (Demande utilisateur 2026-10-16 :
// « je veux ajouter microphone pour dicter et écrire le texte quand l'élève
// clique sur microphone »).
//
// Le composant utilise la Web Speech API NATIVE du navigateur (aucun service
// payant, aucune clé). Ce verrou simule le moteur de reconnaissance et prouve :
//   1. le clic démarre l'écoute en arabe (ar-SA — فصحى, meilleure couverture),
//   2. seuls les textes FINAUX sont collés dans le champ (jamais les fragments
//      provisoires — un champ qui tremble à chaque syllabe est inutilisable),
//   3. un second clic arrête l'écoute,
//   4. sans support navigateur : bouton désactivé et honnête,
//   5. micro refusé (not-allowed) : message clair, pas de blocage muet.

import { act, cleanup, render, screen, fireEvent } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Dictaphone from '../Dictaphone';

// — Fausse Web Speech API (le contrat réel : lang/continuous/interimResults, start/stop/abort,
//   onresult({ resultIndex, results }), onerror({ error }), onend) —
class FausseReconnaissance {
  static instances: FausseReconnaissance[] = [];
  lang = '';
  continuous = false;
  interimResults = false;
  start = vi.fn();
  stop = vi.fn();
  abort = vi.fn();
  onresult: ((e: unknown) => void) | null = null;
  onerror: ((e: unknown) => void) | null = null;
  onend: (() => void) | null = null;
  constructor() {
    FausseReconnaissance.instances.push(this);
  }
}

function resultatFaux(transcript: string, finale: boolean) {
  return {
    resultIndex: 0,
    results: [{ isFinal: finale, 0: { transcript }, length: 1, length2: undefined }],
    length: 1,
  };
}

beforeEach(() => {
  FausseReconnaissance.instances = [];
  (window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition = FausseReconnaissance;
  (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition = FausseReconnaissance;
});

afterEach(() => {
  cleanup();
  delete (window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition;
  delete (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition;
});

describe('Dictaphone — la dictée écrit le texte de l’élève', () => {
  it('le clic démarre l’écoute en arabe فصحى, en continu', () => {
    render(<Dictaphone zone="test-zone" onTranscript={() => {}} />);
    fireEvent.click(screen.getByTestId('dictaphone-test-zone'));
    const rec = FausseReconnaissance.instances[0];
    expect(rec, 'aucun moteur de reconnaissance instancié').toBeTruthy();
    expect(rec.start).toHaveBeenCalled();
    expect(rec.lang).toBe('ar-SA');
    expect(rec.continuous).toBe(true);
    expect(rec.interimResults).toBe(true);
    // État visuel : l'élève SAIT que l'app écoute.
    expect(screen.getByTestId('dictaphone-test-zone-vivant')).toBeTruthy();
  });

  it('le texte FINAL rejoint le champ (onTranscript), sans les fragments', () => {
    const onTranscript = vi.fn();
    render(<Dictaphone zone="test-zone" onTranscript={onTranscript} />);
    fireEvent.click(screen.getByTestId('dictaphone-test-zone'));
    const rec = FausseReconnaissance.instances[0];

    // Les callbacks du moteur déclenchent des mises à jour d'état React :
    // ils sont déclenchés ici comme le navigateur le ferait, dans `act`.
    act(() => {
      rec.onresult?.(resultatFaux('  آلية ATP  ', false));
    });
    expect(onTranscript, 'un fragment provisoire a été collé').not.toHaveBeenCalled();

    act(() => {
      rec.onresult?.(resultatFaux('  آلية ATP  ', true));
    });
    expect(onTranscript).toHaveBeenCalledTimes(1);
    expect(onTranscript).toHaveBeenCalledWith('آلية ATP');
  });

  it('un second clic arrête l’écriture', () => {
    render(<Dictaphone zone="test-zone" onTranscript={() => {}} />);
    const bouton = screen.getByTestId('dictaphone-test-zone');
    fireEvent.click(bouton);
    fireEvent.click(bouton);
    expect(FausseReconnaissance.instances[0].stop).toHaveBeenCalled();
    expect(screen.queryByTestId('dictaphone-test-zone-vivant')).toBeNull();
  });

  it('sans support navigateur : bouton honnêtement désactivé', () => {
    delete (window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition;
    delete (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition;
    const onTranscript = vi.fn();
    render(<Dictaphone zone="test-zone" onTranscript={onTranscript} />);
    const bouton = screen.getByTestId('dictaphone-test-zone');
    expect(bouton.hasAttribute('disabled')).toBe(true);
    fireEvent.click(bouton);
    expect(onTranscript).not.toHaveBeenCalled();
    expect(screen.queryByTestId('dictaphone-test-zone-vivant')).toBeNull();
  });

  it('micro refusé (not-allowed) : message clair, plus d’écoute', () => {
    render(<Dictaphone zone="test-zone" onTranscript={() => {}} />);
    fireEvent.click(screen.getByTestId('dictaphone-test-zone'));
    const rec = FausseReconnaissance.instances[0];
    // Le navigateur signale le refus du micro (callback hors rendu → act).
    act(() => {
      rec.onerror?.({ error: 'not-allowed' });
    });
    expect(screen.getByTestId('dictaphone-test-zone')).toBeTruthy();
    expect(screen.queryByTestId('dictaphone-test-zone-vivant')).toBeNull();
    expect(screen.getByText(/الميكروفون/)).toBeTruthy();
  });
});
