// secret.test.ts — le secret des jetons (sprint 59).

import { describe, expect, it } from 'vitest';
import { SecretManquantError, resoudreSecret } from './secret';

describe('secret fourni', () => {
  it('est utilisé tel quel', () => {
    const r = resoudreSecret({ JWT_SECRET: 'a'.repeat(64), NODE_ENV: 'production' });
    expect(r.secret).toBe('a'.repeat(64));
    expect(r.ephemere).toBe(false);
    expect(r.avertissement).toBeNull();
  });

  it('avertit quand il est trop court, sans bloquer', () => {
    const r = resoudreSecret({ JWT_SECRET: 'court', NODE_ENV: 'production' });
    expect(r.secret).toBe('court');
    expect(r.avertissement).toContain('32');
  });

  it('ignore les espaces autour', () => {
    expect(resoudreSecret({ JWT_SECRET: '   ', NODE_ENV: 'development' }).ephemere).toBe(true);
  });
});

describe('secret absent', () => {
  it('refuse de démarrer en production — la règle ne bouge pas', () => {
    expect(() => resoudreSecret({ NODE_ENV: 'production' })).toThrow(SecretManquantError);
    expect(() => resoudreSecret({ NODE_ENV: 'production' })).toThrow(/REFUS DE DÉMARRAGE/);
  });

  it('génère un secret éphémère en développement, avec avertissement', () => {
    const r = resoudreSecret({ NODE_ENV: 'development' });
    expect(r.ephemere).toBe(true);
    expect(r.secret).toHaveLength(64);
    expect(r.avertissement).toContain('ÉPHÉMÈRE');
    expect(r.avertissement).toContain('production');
  });

  it('tire un secret DIFFÉRENT à chaque démarrage', () => {
    // Essentiel : un secret éphémère stable finirait par être considéré comme
    // acceptable et migrerait en production.
    const a = resoudreSecret({ NODE_ENV: 'development' }).secret;
    const b = resoudreSecret({ NODE_ENV: 'development' }).secret;
    expect(a).not.toBe(b);
  });

  it('traite l’absence de NODE_ENV comme du développement', () => {
    expect(resoudreSecret({}).ephemere).toBe(true);
  });
});
