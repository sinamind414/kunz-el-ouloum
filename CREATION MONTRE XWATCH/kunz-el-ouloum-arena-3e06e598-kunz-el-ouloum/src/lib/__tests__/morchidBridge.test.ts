// morchidBridge.test.ts — verrous du pont contexte → المرشد الذكي.
//
// Le pont remplace un callback qui traverserait toute l'arborescence : une vue
// appelle `demanderAuMorchid`, App.tsx écoute l'événement. Les tests figent le
// CONTRAT : la question voyage intacte, elle est nettoyée, et un appel vide ou
// sans `window` ne casse rien.

import { describe, expect, it, vi } from 'vitest';
import { demanderAuMorchid, MORCHID_ASK_EVENT, type MorchidAskDetail } from '../morchidBridge';

describe('morchidBridge — emission', () => {
  it('émet un evenement porteur de la question et de son origine', () => {
    const recu = vi.fn();
    window.addEventListener(MORCHID_ASK_EVENT, recu);

    demanderAuMorchid('اشرح تركيب البروتين', 'lecon-active');

    expect(recu).toHaveBeenCalledTimes(1);
    const detail = (recu.mock.calls[0][0] as CustomEvent<MorchidAskDetail>).detail;
    expect(detail.question).toBe('اشرح تركيب البروتين');
    expect(detail.origine).toBe('lecon-active');

    window.removeEventListener(MORCHID_ASK_EVENT, recu);
  });

  it('nettoie la question (espaces) avant de l emettre', () => {
    const recu = vi.fn();
    window.addEventListener(MORCHID_ASK_EVENT, recu);

    demanderAuMorchid('   اشرح الغوص   ');

    const detail = (recu.mock.calls[0][0] as CustomEvent<MorchidAskDetail>).detail;
    expect(detail.question).toBe('اشرح الغوص');

    window.removeEventListener(MORCHID_ASK_EVENT, recu);
  });

  it('origine est absente (undefined) quand elle n est pas fournie', () => {
    const recu = vi.fn();
    window.addEventListener(MORCHID_ASK_EVENT, recu);

    demanderAuMorchid('اشرح التنفس الخلوي');

    const detail = (recu.mock.calls[0][0] as CustomEvent<MorchidAskDetail>).detail;
    expect(detail.origine).toBeUndefined();

    window.removeEventListener(MORCHID_ASK_EVENT, recu);
  });
});

describe('morchidBridge — garde-fous', () => {
  it('une question vide ou blanche n emet AUCUN evenement', () => {
    const recu = vi.fn();
    window.addEventListener(MORCHID_ASK_EVENT, recu);

    demanderAuMorchid('');
    demanderAuMorchid('     ');

    expect(recu).not.toHaveBeenCalled();

    window.removeEventListener(MORCHID_ASK_EVENT, recu);
  });
});
