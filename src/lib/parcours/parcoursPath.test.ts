// parcoursPath.test.ts — le chemin linéaire est DÉRIVÉ de la séquence officielle.
// Garanties : 11 unités, 3 domaines, un جسر par unité, clés uniques, aucun trou.

import { describe, expect, it } from 'vitest';
import {
  PARCOURS_DOMAINS,
  PARCOURS_FLAT,
  PARCOURS_TOTAL,
  compteurItems,
  jalonTitle,
  parcoursItemById,
  parcoursItemIndex,
  parcoursUnitOf,
} from './parcoursPath';

describe('parcoursPath — structure du chemin', () => {
  it('couvre les 11 unités du programme national', () => {
    const unitIds = PARCOURS_DOMAINS.flatMap((d) => d.units.map((u) => u.unitId));
    expect(unitIds).toHaveLength(11);
    expect(unitIds).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
  });

  it('regroupe les unités dans les 3 domaines du BAC (1-5, 6-8, 9-11)', () => {
    expect(PARCOURS_DOMAINS).toHaveLength(3);
    expect(PARCOURS_DOMAINS[0].units.map((u) => u.unitId)).toEqual([1, 2, 3, 4, 5]);
    expect(PARCOURS_DOMAINS[1].units.map((u) => u.unitId)).toEqual([6, 7, 8]);
    expect(PARCOURS_DOMAINS[2].units.map((u) => u.unitId)).toEqual([9, 10, 11]);
  });

  it('termine chaque unité par exactement un جسر', () => {
    for (const domain of PARCOURS_DOMAINS) {
      for (const unit of domain.units) {
        const jalons = unit.items.filter((i) => i.kind === 'jalon');
        expect(jalons).toHaveLength(1);
        expect(unit.items[unit.items.length - 1].kind).toBe('jalon');
        expect(jalons[0].id).toBe(`parcours:u${unit.unitId}:jalon`);
        expect(jalons[0].title).toBe(jalonTitle(unit.unitId));
      }
    }
  });

  it('donne à chaque leçon une clé, une nature et un titre non vide', () => {
    for (const item of PARCOURS_FLAT) {
      if (item.kind !== 'lesson') continue;
      expect(typeof item.lessonKey).toBe('string');
      expect(item.lessonKey!.length).toBeGreaterThan(0);
      expect(['html', 'active']).toContain(item.lessonKind);
      expect(item.title.trim().length).toBeGreaterThan(0);
    }
  });

  it('ne répète aucun identifiant ni aucune clé de leçon dans une unité', () => {
    const ids = new Set<string>();
    for (const item of PARCOURS_FLAT) {
      expect(ids.has(item.id)).toBe(false);
      ids.add(item.id);
    }
    for (const domain of PARCOURS_DOMAINS) {
      for (const unit of domain.units) {
        const keys = new Set<string>();
        for (const item of unit.items) {
          if (!item.lessonKey) continue;
          expect(keys.has(item.lessonKey)).toBe(false);
          keys.add(item.lessonKey);
        }
      }
    }
  });

  it('commence par la première leçon de l\'unité 1 (phase1_chapitres_1_2)', () => {
    expect(PARCOURS_FLAT[0].unitId).toBe(1);
    expect(PARCOURS_FLAT[0].lessonKey).toBe('phase1_chapitres_1_2');
  });

  it('expose des accesseurs cohérents (byId / index / unité)', () => {
    const premier = PARCOURS_FLAT[0];
    expect(parcoursItemById(parcoursItemById(premier.id)!.id)?.id).toBe(premier.id);
    expect(parcoursItemIndex(premier.id)).toBe(0);
    expect(parcoursItemById('inexistant')).toBeUndefined();
    expect(parcoursUnitOf(premier.id)?.unitId).toBe(1);
    expect(parcoursUnitOf('inexistant')).toBeUndefined();
  });

  it('compte les leçons d\'une unité sans le جسر', () => {
    const u1 = PARCOURS_DOMAINS[0].units[0];
    const c = compteurItems(u1);
    expect(c.total).toBe(u1.items.length);
    expect(c.lessons).toBe(u1.items.filter((i) => i.kind === 'lesson').length);
    expect(PARCOURS_TOTAL).toBe(PARCOURS_FLAT.length);
    expect(PARCOURS_TOTAL).toBeGreaterThan(40);
  });
});
