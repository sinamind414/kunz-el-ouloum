// src/lib/__tests__/microphoneNatif.test.ts
// VERROU DU MOTEUR NATIF DE DICTÉE (APK Android, hors ligne)
//
// Ce que ce verrou protège :
//   1. le plugin natif est UTILISÉ quand il existe (la WebView Android n'a
//      pas de Web Speech API : sans lui, le bouton micro de l'APK reste
//      mort) ;
//   2. on ne bascule JAMAIS sur un moteur réseau : la promesse « rien ne
//      quitte le téléphone » tient ;
//   3. l'absence de moteur est signalée HONNÊTEMENT (message arabe), jamais
//      un silence muet ;
//   4. les fragments provisoires (partial) sont relayés, le texte final est
//      rendu.

import { describe, expect, it, vi, beforeEach } from 'vitest';

interface FauxPlugin {
  available: boolean;
  surAppareil: boolean;
  texteFinal: string;
  start: ReturnType<typeof vi.fn>;
  stop: ReturnType<typeof vi.fn>;
  cancel: ReturnType<typeof vi.fn>;
  isAvailable: ReturnType<typeof vi.fn>;
  addListener: ReturnType<typeof vi.fn>;
  removeAllListeners: ReturnType<typeof vi.fn>;
  listeners: Record<string, (e: { texte: string }) => void>;
}

let plugin: FauxPlugin | null = null;

vi.mock('@capacitor/core', () => ({
  Capacitor: { isNativePlatform: () => true },
  Plugins: {
    get SpeechToText() {
      return plugin;
    },
  },
  registerPlugin: () => {
    throw new Error('plugin absent');
  },
}));

function creerPlugin(overrides: Partial<FauxPlugin> = {}): FauxPlugin {
  const p: FauxPlugin = {
    available: true,
    surAppareil: true,
    texteFinal: 'آلية ATP',
    start: vi.fn(async () => undefined),
    stop: vi.fn(async () => ({ texte: 'آلية ATP' })),
    cancel: vi.fn(async () => undefined),
    isAvailable: vi.fn(async () => ({ available: true, surAppareil: true, langue: 'ar' })),
    addListener: vi.fn((evenement: string, cb: (e: { texte: string }) => void) => {
      p.listeners[evenement] = cb;
    }),
    removeAllListeners: vi.fn(async () => undefined),
    listeners: {},
    ...overrides,
  };
  return p;
}

beforeEach(() => {
  plugin = null;
});

describe('moteur natif de dictée (APK)', () => {
  it('le plugin disponible est détecté, avec la reconnaissance sur l’appareil', async () => {
    plugin = creerPlugin();
    const { moteurNatifDisponible } = await import('../microphone');
    const info = await moteurNatifDisponible();
    expect(info).not.toBeNull();
    expect(info?.available).toBe(true);
    expect(info?.surAppareil).toBe(true);
  });

  it('la dictée native rend le texte final et relaie les fragments', async () => {
    plugin = creerPlugin();
    const { dicterNatif } = await import('../microphone');
    const partiels: string[] = [];
    const resultat = await dicterNatif('ar', (t) => partiels.push(t));
    // Le fragment provisoire est émis par le plugin → relayé au composant.
    plugin.listeners.partiel?.({ texte: 'آلية' });
    expect(resultat.texte).toBe('آلية ATP');
    expect(partiels).toContain('آلية');
    expect(plugin.start).toHaveBeenCalledWith({ langue: 'ar' });
    expect(plugin.stop).toHaveBeenCalled();
  });

  it('moteur absent (web) : null, et la dictée le dit honnêtement', async () => {
    plugin = null;
    const { moteurNatifDisponible, dicterNatif } = await import('../microphone');
    expect(await moteurNatifDisponible()).toBeNull();
    const resultat = await dicterNatif('ar');
    expect(resultat.texte).toBe('');
    expect(resultat.message).toBeTruthy();
  });

  it('moteur présent mais reconnaissance sur l’appareil impossible : message explicite', async () => {
    plugin = creerPlugin({
      available: false,
      isAvailable: vi.fn(async () => ({ available: false, surAppareil: false, langue: 'ar' })),
    });
    const { moteurNatifDisponible, dicterNatif } = await import('../microphone');
    expect(await moteurNatifDisponible()).toBeNull();
    const resultat = await dicterNatif('ar');
    expect(resultat.texte).toBe('');
    expect(resultat.message).toContain('دون اتصال');
  });

  it('erreur du plugin : le message d’erreur natif est remonté à l’élève', async () => {
    plugin = creerPlugin({
      start: vi.fn(async () => {
        throw new Error('لم يُسمح باستخدام الميكروفون');
      }),
    });
    const { dicterNatif } = await import('../microphone');
    const resultat = await dicterNatif('ar');
    expect(resultat.texte).toBe('');
    expect(resultat.message).toContain('الميكروفون');
  });
});
