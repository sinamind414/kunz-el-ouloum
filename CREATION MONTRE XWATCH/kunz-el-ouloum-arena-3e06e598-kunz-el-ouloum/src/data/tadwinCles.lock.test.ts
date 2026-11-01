// tadwinCles.lock.test.ts
// Locks du contrat Tadwin (docs/tadwin_decisions.md §6), sur la donnée réelle.
// Ce sont des TESTS, pas un document : une modification du contrat doit casser
// ici, pas être acceptée silencieusement.
//
// Locks §6 Relevant pour la donnée :
//   4. `atoms[]` auteur-déclaré pour les 33 clés ; `atoms(clé) ≠ ∅`.
// Les locks 1 (clésChoisies ⊆ prescrites) et 2 (≥ 2 clés) sont testés côté
// scorer (lib/validation/couvCle.test.ts).

import { describe, expect, it } from 'vitest';
import { normalizeAr } from '../lib/validation/normalizeAr';
import {
  TADWIN_UNITES,
  TADWIN_CLES_PAR_UNITE,
  clesDeUnite,
  clesPrescrites,
} from './tadwinCles';

describe('tadwinCles — contrat docs/tadwin_decisions.md §6', () => {
  it('couvre exactement les 11 unités 1..11', () => {
    expect(TADWIN_UNITES).toHaveLength(11);
    const ids = TADWIN_UNITES.map((u) => u.uniteId);
    expect([...ids].sort((a, b) => a - b)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11,
    ]);
  });

  it('prescrit exactement 3 clés par unité, soit 33 clés au total', () => {
    for (const u of TADWIN_UNITES) {
      expect(
        u.cles,
        `unité ${u.uniteId} — ${TADWIN_CLES_PAR_UNITE} clés prescrites`,
      ).toHaveLength(TADWIN_CLES_PAR_UNITE);
    }
    const total = TADWIN_UNITES.reduce((s, u) => s + u.cles.length, 0);
    expect(total).toBe(33);
  });

  it('donne à chaque unité un titre non vide', () => {
    for (const u of TADWIN_UNITES) {
      expect(u.titre.trim(), `unité ${u.uniteId}`).not.toBe('');
    }
  });

  it('chaque clé porte un intitulé unique au sein de son unité', () => {
    for (const u of TADWIN_UNITES) {
      const intitules = u.cles.map((c) => c.cle);
      expect(new Set(intitules).size, `unité ${u.uniteId}`).toBe(intitules.length);
    }
  });

  it('chaque clé déclare ≥ 1 atome non vide après normalisation (§6.4)', () => {
    // La normalisation attrape les résidus de séparateurs (espace seule, slash)
    // qu'un parser aurait pu laisser — règle §3 : atomes déclarés à la main.
    for (const u of TADWIN_UNITES) {
      for (const c of u.cles) {
        expect(c.atoms.length, `unité ${u.uniteId} clé « ${c.cle} » ≥ 1 atome`).toBeGreaterThan(0);
        for (const a of c.atoms) {
          expect(normalizeAr(a), `unité ${u.uniteId} clé « ${c.cle} » atome « ${a} »`).not.toBe('');
        }
      }
    }
  });

  it('aucun atome dupliqué (normalisé) au sein d\'une clé', () => {
    for (const u of TADWIN_UNITES) {
      for (const c of u.cles) {
        const norm = c.atoms.map((a) => normalizeAr(a).toLowerCase());
        expect(new Set(norm).size, `unité ${u.uniteId} clé « ${c.cle} »`).toBe(norm.length);
      }
    }
  });

  it('les atomes ne contiennent aucun séparateur structurel (preuve de déclaration manuelle)', () => {
    // §3 : les atomes sont déclarés À LA MAIN — aucun atome ne doit être une
    // clé brute non atomisée. Sans ce lock, rien n'empêcherait de réintroduire
    // motsClesAttendus brut (16/33 portent un séparateur — non matchables).
    const sep = /←|→|↔|⇄|:|\/|\+|·/;
    for (const u of TADWIN_UNITES) {
      for (const c of u.cles) {
        for (const a of c.atoms) {
          expect(sep.test(a), `unité ${u.uniteId} atome non atomisé: « ${a} »`).toBe(false);
        }
      }
    }
  });

  it('expose les 3 intitulés prescrits par unité (palier 3)', () => {
    for (const u of TADWIN_UNITES) {
      const prescrites = clesPrescrites(u.uniteId);
      expect(prescrites).toEqual(u.cles.map((c) => c.cle));
    }
  });

  it('clesDeUnite / clesPrescrites renvoient undefined pour une unité inconnue', () => {
    expect(clesDeUnite(0)).toBeUndefined();
    expect(clesDeUnite(12)).toBeUndefined();
    expect(clesPrescrites(99)).toBeUndefined();
  });
});
