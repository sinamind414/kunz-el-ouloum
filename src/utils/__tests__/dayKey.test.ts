// dayKey.test.ts — verrou de la définition du jour (H3).
//
// Le test qui compte ici est celui du BORD DE JOURNÉE : il ne peut pas être
// exprimé en comparant à une chaîne figée (sinon il dépendrait du fuseau de la
// machine de CI). Il vérifie donc l'INVARIANT : `jourLocal` doit refléter les
// composantes locales de l'instant, et diverger de l'UTC dès que le décalage
// horaire franchit minuit — c'est précisément le bug corrigé.

import { describe, expect, it } from 'vitest';
import { ajouterJours, ecartEnJours, jourLocal } from '../dayKey';

/** Formate une date avec ses composantes locales, sans passer par le module. */
function attenduLocal(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

describe('jourLocal — le jour de l’élève, pas celui de Greenwich', () => {
  it('reflète les composantes locales de l’instant', () => {
    const d = new Date('2026-10-14T09:15:00Z');
    expect(jourLocal(d)).toBe(attenduLocal(d));
  });

  it('suit le bord de journée locale, et non le bord UTC', () => {
    // 23 h 30 UTC : à Alger (UTC+1) il est déjà 00 h 30 le lendemain.
    //   · en UTC        → l’app doit répondre 2026-10-14 (comme l’UTC) ;
    //   · en UTC+1      → l’app doit répondre 2026-10-15 (le LENDEMAIN local).
    // Le test ne fige pas la réponse : il exige que la réponse soit LOCALE.
    const tard = new Date('2026-10-14T23:30:00Z');
    expect(jourLocal(tard)).toBe(attenduLocal(tard));
    const decalage = tard.getTimezoneOffset();
    if (decalage < 0) {
      // fuseau à l’est de Greenwich (cas de l’Algérie) : le jour local est en avance
      expect(jourLocal(tard)).not.toBe(tard.toISOString().slice(0, 10));
    }
  });

  it('un mois et un jour à un chiffre restent sur deux chiffres', () => {
    expect(jourLocal(new Date(2026, 0, 5))).toBe('2026-01-05');
  });
});

describe('ajouterJours / ecartEnJours', () => {
  it('avance et recule d’un jour', () => {
    expect(ajouterJours('2026-10-14', 1)).toBe('2026-10-15');
    expect(ajouterJours('2026-10-14', -1)).toBe('2026-10-13');
  });

  it('franchit les fins de mois et d’année', () => {
    expect(ajouterJours('2026-10-31', 1)).toBe('2026-11-01');
    expect(ajouterJours('2026-12-31', 1)).toBe('2027-01-01');
    expect(ajouterJours('2026-03-01', -1)).toBe('2026-02-28');
  });

  it('gère l’année bissextile', () => {
    expect(ajouterJours('2028-02-28', 1)).toBe('2028-02-29');
  });

  it('mesure l’écart dans les deux sens', () => {
    expect(ecartEnJours('2026-10-13', '2026-10-14')).toBe(1);
    expect(ecartEnJours('2026-10-14', '2026-10-14')).toBe(0);
    expect(ecartEnJours('2026-10-18', '2026-10-14')).toBe(-4);
    expect(ecartEnJours('2026-10-01', '2026-11-01')).toBe(31);
  });

  it('ajouter puis mesurer est cohérent (aller-retour)', () => {
    const depart = '2026-09-30';
    for (const n of [1, 2, 6, 29, 30, 90]) {
      expect(ecartEnJours(depart, ajouterJours(depart, n))).toBe(n);
    }
  });
});
