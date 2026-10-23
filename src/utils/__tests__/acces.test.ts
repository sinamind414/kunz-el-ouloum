// acces.test.ts — verrous de la passe-garde client (localStorage jsdom,
// fetch imité). Le contrat : unité 1 ouverte à vie pour TOUS, le reste
// exigera essai ou abonnement ; une échéance passée verrouille localement.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  UNITE_GRATUITE,
  PRIX_SAISON_DA,
  activerCode,
  accesActuel,
  identiteAppareil,
  joursRestantsDe,
  rafraichirAcces,
  rubriquePayanteOuverte,
  uniteOuverte,
} from '../acces';
import { setApiToken } from '../api';

const CLE_ACCES = 'kunz_acces';

function cacheAvec(statut: string, expireLe: string | null): void {
  localStorage.setItem(CLE_ACCES, JSON.stringify({ statut, expireLe }));
}

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('identité d’appareil', () => {
  it('génère une empreinte stable de 32 hexadécimaux', () => {
    const a = identiteAppareil();
    const b = identiteAppareil();
    expect(a).toBe(b);
    expect(a).toMatch(/^[0-9a-f]{32}$/);
    expect(localStorage.getItem('kunz_appareil')).toBe(a);
  });
});

describe('invité (sans compte)', () => {
  it('unité 1 ouverte à vie, le reste et les rubriques sont fermés', () => {
    const etat = accesActuel();
    expect(etat.statut).toBe('invite');
    expect(UNITE_GRATUITE).toBe(1);
    expect(uniteOuverte(1)).toBe(true);
    expect(uniteOuverte(2)).toBe(false);
    expect(uniteOuverte(11)).toBe(false);
    expect(rubriquePayanteOuverte()).toBe(false);
  });
});

describe('essai et abonnement (cache)', () => {
  it('un essai actif ouvre les unités payantes et les rubriques', () => {
    setApiToken('jwt.de.test');
    cacheAvec('essai', '2099-01-01');
    expect(uniteOuverte(5)).toBe(true);
    expect(rubriquePayanteOuverte()).toBe(true);
  });

  it('une échéance PASSÉE verrouille localement (même si le cache dit « essai »)', () => {
    setApiToken('jwt.de.test');
    cacheAvec('essai', '2001-01-01');
    expect(uniteOuverte(1)).toBe(true); // la promesse gratuite survit
    expect(uniteOuverte(3)).toBe(false);
    expect(rubriquePayanteOuverte()).toBe(false);
  });

  it('un abonnement actif ouvre tout, échéance passée non', () => {
    setApiToken('jwt.de.test');
    cacheAvec('abonnement', '2099-06-30');
    expect(uniteOuverte(11)).toBe(true);
    cacheAvec('abonnement', '2020-06-30');
    expect(uniteOuverte(11)).toBe(false);
  });
});

describe('joursRestantsDe', () => {
  it('compte au plafond et refuse le vide', () => {
    expect(joursRestantsDe(null)).toBe(0);
    const futur = new Date(Date.now() + 10 * 24 * 3600 * 1000).toISOString().slice(0, 10);
    expect(joursRestantsDe(futur)).toBeGreaterThanOrEqual(9);
    expect(joursRestantsDe(futur)).toBeLessThanOrEqual(11);
  });
});

describe('rafraichirAcces + activerCode (fetch imité)', () => {
  it('invité : jamais de fetch, état invité re-persisté', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const etat = await rafraichirAcces();
    expect(etat.statut).toBe('invite');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('compte connecté : l’état serveur est rejoué dans le cache', async () => {
    setApiToken('jwt.de.test');
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        statut: 'essai',
        expireLe: '2099-12-01',
        joursRestants: 30,
        prixSaisonDA: PRIX_SAISON_DA,
        uniteGratuite: 1,
      }),
    });
    vi.stubGlobal('fetch', fetchMock);
    const etat = await rafraichirAcces();
    expect(etat.statut).toBe('essai');
    const args = fetchMock.mock.calls[0] as [string, RequestInit];
    expect((args[1].headers as Record<string, string>)['x-appareil-id']).toBe(identiteAppareil());
  });

  it('réseau tombe : on garde le dernier état connu (grace locale)', async () => {
    setApiToken('jwt.de.test');
    cacheAvec('abonnement', '2099-06-30');
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    const etat = await rafraichirAcces();
    expect(etat.statut).toBe('abonnement');
  });

  it('activation : succès recharge le cache ; erreur serveur traduite en code', async () => {
    setApiToken('jwt.de.test');
    const ok = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ ok: true, statut: 'abonnement', expireLe: '2027-06-30' }),
    });
    vi.stubGlobal('fetch', ok);
    const r = await activerCode('KUNZ-AB2C-9XYZ');
    expect(r).toEqual({ ok: true, expireLe: '2027-06-30' });
    expect(accesActuel().statut).toBe('abonnement');

    const ko = vi.fn().mockResolvedValue({
      ok: false,
      status: 409,
      json: async () => ({ error: 'code_deja_utilise' }),
    });
    vi.stubGlobal('fetch', ko);
    const r2 = await activerCode('KUNZ-AB2C-9XYZ');
    expect(r2).toEqual({ ok: false, erreur: 'code_deja_utilise' });
  });

  it('activation sans compte → not_connected, jamais de fetch', async () => {
    setApiToken(null);
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const r = await activerCode('KUNZ-AB2C-9XYZ');
    expect(r).toEqual({ ok: false, erreur: 'not_connected' });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
