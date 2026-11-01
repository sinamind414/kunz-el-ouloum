// unitOpenings.lock.test.ts — verrous des cartes d'ouverture (item 19, sprint 13).
//
// Deux exigences qui ne doivent jamais se relâcher :
//   1. la carte promet un savoir-FAIRE et pointe vers des ressources qui
//      existent vraiment (capsule, schéma) — une promesse sans porte est un slogan ;
//   2. les poids d'examen ne sont affichés QUE là où ils ont été mesurés
//      (U1-U7). Inventer un pourcentage pour les unités 8-11 serait une
//      fabrication présentée à l'élève comme une donnée.

import { describe, expect, it } from 'vitest';
import {
  OPENING_BY_UNIT,
  UNIT_OPENINGS,
  UNIT_OPENING_COUNT,
  openingForUnit,
} from './unitOpenings';
import { CAPSULE_BY_ID } from './microCapsules';
import { SCHEMA_DRILL_BY_ID } from './schemaDrills';
import { INITIAL_UNITS } from './index';

describe('cartes d ouverture — couverture', () => {
  it('les 11 unités du catalogue ont leur carte, sans doublon', () => {
    expect(UNIT_OPENING_COUNT).toBe(11);
    const ids = UNIT_OPENINGS.map((o) => o.unitId).sort((a, b) => a - b);
    expect(ids).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
    for (const u of INITIAL_UNITS) expect(openingForUnit(u.id), `unité ${u.id}`).toBeDefined();
  });

  it('l accès direct par unité renvoie la bonne carte', () => {
    for (const o of UNIT_OPENINGS) expect(OPENING_BY_UNIT[o.unitId].unitId).toBe(o.unitId);
    expect(openingForUnit(42)).toBeUndefined();
  });
});

describe('cartes d ouverture — contrat éditorial', () => {
  it('la question centrale est bien une question', () => {
    for (const o of UNIT_OPENINGS) {
      expect(o.questionAr.includes('؟'), `unité ${o.unitId} : ${o.questionAr}`).toBe(true);
      expect(o.questionAr.length).toBeGreaterThanOrEqual(30);
    }
  });

  it('la promesse annonce un savoir-faire, pas une liste de notions', () => {
    for (const o of UNIT_OPENINGS) {
      expect(o.promiseAr, `unité ${o.unitId}`).toContain('قادراً على');
      expect(o.promiseAr.length).toBeGreaterThanOrEqual(60);
    }
  });

  it('l itinéraire compte 3 à 5 étapes et les prérequis 3 entrées', () => {
    for (const o of UNIT_OPENINGS) {
      expect(o.roadmapAr.length, `unité ${o.unitId}`).toBeGreaterThanOrEqual(3);
      expect(o.roadmapAr.length, `unité ${o.unitId}`).toBeLessThanOrEqual(5);
      expect(o.prerequisAr.length, `unité ${o.unitId}`).toBeGreaterThanOrEqual(3);
    }
  });

  it('chaque carte nomme au moins deux pièges et une première action concrète', () => {
    for (const o of UNIT_OPENINGS) {
      expect(o.trapsAr.length, `unité ${o.unitId}`).toBeGreaterThanOrEqual(2);
      for (const t of o.trapsAr) expect(t.length, `unité ${o.unitId}`).toBeGreaterThanOrEqual(30);
      expect(o.firstActionAr.length, `unité ${o.unitId}`).toBeGreaterThanOrEqual(40);
    }
  });
});

describe('cartes d ouverture — références et honnêteté des chiffres', () => {
  it('toute capsule citée existe', () => {
    for (const o of UNIT_OPENINGS) {
      if (!o.capsuleId) continue;
      expect(CAPSULE_BY_ID[o.capsuleId], `unité ${o.unitId} → ${o.capsuleId}`).toBeDefined();
      expect(CAPSULE_BY_ID[o.capsuleId].unitId).toBe(o.unitId);
    }
  });

  it('tout schéma cité existe et appartient à la même unité', () => {
    for (const o of UNIT_OPENINGS) {
      if (!o.drillId) continue;
      expect(SCHEMA_DRILL_BY_ID[o.drillId], `unité ${o.unitId} → ${o.drillId}`).toBeDefined();
      expect(SCHEMA_DRILL_BY_ID[o.drillId].unitId).toBe(o.unitId);
    }
  });

  it('les poids d examen ne sont renseignés que pour les unités mesurées (1-7)', () => {
    for (const o of UNIT_OPENINGS) {
      if (o.unitId <= 7) {
        expect(o.bacWeightPercent, `unité ${o.unitId}`).toBeDefined();
        expect(o.bacWeightPercent!).toBeGreaterThan(0);
        expect(o.bacWeightPercent!).toBeLessThanOrEqual(25);
      } else {
        expect(o.bacWeightPercent, `unité ${o.unitId} : chiffre non mesuré`).toBeUndefined();
      }
    }
  });

  it('la somme des poids mesurés reste cohérente avec le dépouillement (≈ 100 %)', () => {
    const somme = UNIT_OPENINGS.reduce((s, o) => s + (o.bacWeightPercent ?? 0), 0);
    expect(somme).toBeGreaterThanOrEqual(95);
    expect(somme).toBeLessThanOrEqual(105);
  });
});
