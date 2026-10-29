// positionnement.test.ts — store du test de positionnement + objectif de note
// (TRANCHE P0-3). Lecture défensive, roundtrip localStorage, garde-fous.

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  chargerPositionnement,
  enregistrerObjectifNote,
  enregistrerResultat,
  libellePalier,
  noteSur20,
} from './positionnement';

beforeEach(() => {
  window.localStorage.clear();
  window.sessionStorage.clear();
});

afterEach(() => {
  window.localStorage.clear();
});

describe(`état positionnement — vide et défensif`, () => {
  it(`sans rien enregistrer → resultat null, objectif null`, () => {
    expect(chargerPositionnement()).toEqual({ resultat: null, objectifNote: null });
  });

  it(`données corrompues → défaut sain, jamais une exception`, () => {
    window.localStorage.setItem(`kunz_positionnement_v1`, `{not json`);
    expect(chargerPositionnement()).toEqual({ resultat: null, objectifNote: null });
    window.localStorage.setItem(`kunz_positionnement_v1`, JSON.stringify({ objectifNote: `douze` }));
    const etat = chargerPositionnement();
    expect(etat.resultat).toBeNull();
    expect(etat.objectifNote).toBeNull();
  });
});

describe(`résultat — roundtrip et note estimée`, () => {
  it(`enregistrerResultat persiste et dérive la note /20`, () => {
    const r = enregistrerResultat(12, 18); // 66,67% → 67% → 13/20
    expect(r.percent).toBe(67);
    expect(r.noteEstimee).toBe(13);
    expect(r.total).toBe(18);
    const etat = chargerPositionnement();
    expect(etat.resultat?.correct).toBe(12);
    expect(etat.resultat?.noteEstimee).toBe(13);
  });

  it(`noteSur20 : bornes et arrondi`, () => {
    expect(noteSur20(0)).toBe(0);
    expect(noteSur20(100)).toBe(20);
    expect(noteSur20(50)).toBe(10);
    expect(noteSur20(61)).toBe(12);
    expect(noteSur20(200)).toBe(20); // borné, jamais hors échelle
    expect(noteSur20(-5)).toBe(0);
  });
});

describe(`objectif de note — garde-fous`, () => {
  it(`5..20 entier accepté, persisté`, () => {
    expect(enregistrerObjectifNote(16)).toBe(true);
    expect(chargerPositionnement().objectifNote).toBe(16);
  });

  it(`hors bornes, négatif, non entier → refusé sans écraser l'existant`, () => {
    enregistrerObjectifNote(14);
    expect(enregistrerObjectifNote(4)).toBe(false);
    expect(enregistrerObjectifNote(21)).toBe(false);
    expect(enregistrerObjectifNote(13.5)).toBe(false);
    expect(chargerPositionnement().objectifNote).toBe(14);
  });
});

describe(`libellé de palier`, () => {
  it(`seuils assumés 85/60/40`, () => {
    expect(libellePalier(100)).toBe(`قوي`);
    expect(libellePalier(85)).toBe(`قوي`);
    expect(libellePalier(84)).toBe(`متوسط`);
    expect(libellePalier(60)).toBe(`متوسط`);
    expect(libellePalier(59)).toBe(`يحتاج تثبيتاً`);
    expect(libellePalier(40)).toBe(`يحتاج تثبيتاً`);
    expect(libellePalier(39)).toBe(`ضعيف`);
    expect(libellePalier(0)).toBe(`ضعيف`);
  });
});
