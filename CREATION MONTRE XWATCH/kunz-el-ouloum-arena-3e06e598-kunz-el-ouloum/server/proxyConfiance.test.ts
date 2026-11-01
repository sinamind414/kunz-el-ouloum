// proxyConfiance.test.ts — l'avertissement TRUST_PROXY (audit externe, 15/10/2026).
//
// docker-compose.yml embarquait `TRUST_PROXY: '1'` ET `ports: '3000:3000'`
// exposé directement : sans nginx devant, req.ip venait d'un en-tête
// X-Forwarded-For forgeable à volonté — contournement complet des limiteurs
// d'IP (login, réinitialisation). Le correctif structurel est le bind
// 127.0.0.1 du compose ; ce module porte l'avertissement de démarrage pour
// tout opérateur qui réactive TRUST_PROXY sans proxy réel.

import { describe, expect, it } from 'vitest';
import { avertissementProxy } from './proxyConfiance';

describe('avertissementProxy', () => {
  it('prévient quand TRUST_PROXY=1 : les limiteurs deviennent forgeables sans proxy réel', () => {
    const m = avertissementProxy({ TRUST_PROXY: '1' });
    expect(m).not.toBeNull();
    expect(m).toContain('X-Forwarded-For');
    expect(m).toContain('contourn');
  });

  it('se tait sans TRUST_PROXY', () => {
    expect(avertissementProxy({})).toBeNull();
  });

  it('se tait pour toute autre valeur que 1', () => {
    expect(avertissementProxy({ TRUST_PROXY: '0' })).toBeNull();
    expect(avertissementProxy({ TRUST_PROXY: 'true' })).toBeNull();
    expect(avertissementProxy({ TRUST_PROXY: ' 1 ' })).not.toBeNull();
  });
});
