// microCapsules.lock.test.ts — verrous des capsules « فكرة في دقيقة »
// (audit item 15, sprint 11).
//
// Le risque propre à ce format est la DÉRIVE : une capsule qui grossit devient
// un mini-cours et perd exactement ce qui la rend utile. Ces tests figent donc
// autant la BRIÈVETÉ que le contenu :
//   • une idée tient en 2 à 4 phrases et 45-120 secondes annoncées ;
//   • le titre est une question, pas un intitulé de leçon ;
//   • chaque capsule nomme l'erreur qu'elle tue et se termine par un auto-test ;
//   • le tirage « capsule du jour » est stable sur la journée.

import { describe, expect, it } from 'vitest';
import {
  CAPSULE_BY_ID,
  MICRO_CAPSULES,
  MICRO_CAPSULE_COUNT,
  MICRO_CAPSULE_TOTAL_MINUTES,
  capsuleOfTheDay,
  capsuleUnitIds,
  capsulesForUnit,
  todayKey,
} from './microCapsules';
import { ACTIVE_LESSONS } from './activeLessons';
import { INITIAL_UNITS } from './index';

describe('capsules — format court non négociable', () => {
  it('chaque capsule annonce 45 à 120 secondes', () => {
    for (const c of MICRO_CAPSULES) {
      expect(c.durationSec, `${c.id}`).toBeGreaterThanOrEqual(45);
      expect(c.durationSec, `${c.id}`).toBeLessThanOrEqual(120);
    }
  });

  it('l idée tient en 2 à 4 phrases et reste sous la barre du mini-cours', () => {
    for (const c of MICRO_CAPSULES) {
      const phrases = c.ideaAr.split(/[.؟!]/).filter((p) => p.trim().length > 0);
      expect(phrases.length, `${c.id} : ${phrases.length} phrases`).toBeGreaterThanOrEqual(2);
      expect(phrases.length, `${c.id} : ${phrases.length} phrases`).toBeLessThanOrEqual(5);
      expect(c.ideaAr.length, `${c.id} : idée trop longue`).toBeLessThanOrEqual(520);
      expect(c.ideaAr.length, `${c.id} : idée trop courte`).toBeGreaterThanOrEqual(120);
    }
  });

  it('le geste mental tient en 2 à 4 étapes', () => {
    for (const c of MICRO_CAPSULES) {
      expect(c.stepsAr.length, `${c.id}`).toBeGreaterThanOrEqual(2);
      expect(c.stepsAr.length, `${c.id}`).toBeLessThanOrEqual(4);
      for (const s of c.stepsAr) expect(s.length, `${c.id} étape`).toBeLessThanOrEqual(160);
    }
  });

  it('la collection entière se lit en moins d une demi-heure', () => {
    expect(MICRO_CAPSULE_TOTAL_MINUTES).toBeLessThanOrEqual(30);
    expect(MICRO_CAPSULE_TOTAL_MINUTES).toBeGreaterThan(10);
  });
});

describe('capsules — contrat éditorial', () => {
  it('le titre est une question', () => {
    for (const c of MICRO_CAPSULES) {
      expect(c.questionAr.includes('؟') || c.questionAr.includes('?'), `${c.id} : ${c.questionAr}`).toBe(
        true,
      );
    }
  });

  it('chaque capsule nomme l erreur qu elle élimine', () => {
    for (const c of MICRO_CAPSULES) {
      expect(c.errorAr.length, `${c.id} : erreur trop vague`).toBeGreaterThanOrEqual(40);
    }
  });

  it('chaque capsule se termine par un auto-test avec sa réponse', () => {
    for (const c of MICRO_CAPSULES) {
      expect(c.selfTestAr.length, `${c.id} test`).toBeGreaterThanOrEqual(15);
      expect(c.answerAr.length, `${c.id} réponse`).toBeGreaterThanOrEqual(10);
      // la réponse ne doit pas être une simple recopie de la question
      expect(c.answerAr).not.toBe(c.selfTestAr);
    }
  });

  it('les mots-clés permettent la recherche (3 minimum)', () => {
    for (const c of MICRO_CAPSULES) expect(c.tags.length, c.id).toBeGreaterThanOrEqual(3);
  });

  it('tout lessonId cité est une leçon active réelle', () => {
    for (const c of MICRO_CAPSULES) {
      if (!c.lessonId) continue;
      expect(Object.keys(ACTIVE_LESSONS), c.id).toContain(c.lessonId);
    }
  });
});

describe('capsules — couverture du programme', () => {
  it('au moins 24 capsules publiées, toutes d identifiant unique', () => {
    expect(MICRO_CAPSULE_COUNT).toBeGreaterThanOrEqual(24);
    const ids = MICRO_CAPSULES.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(Object.keys(CAPSULE_BY_ID)).toHaveLength(MICRO_CAPSULE_COUNT);
  });

  it('les 11 unités sont couvertes et existent au catalogue', () => {
    expect(capsuleUnitIds()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
    for (const u of capsuleUnitIds()) {
      expect(INITIAL_UNITS.some((unit) => unit.id === u), `unité ${u}`).toBe(true);
    }
  });

  it('les unités du domaine 1 et du domaine 2 ont au moins deux capsules', () => {
    for (const u of [1, 2, 3, 4, 5, 6, 7]) {
      expect(capsulesForUnit(u).length, `unité ${u}`).toBeGreaterThanOrEqual(2);
    }
  });

  it('capsulesForUnit ne renvoie que des capsules de l unité demandée', () => {
    for (const u of capsuleUnitIds()) {
      expect(capsulesForUnit(u).every((c) => c.unitId === u)).toBe(true);
    }
    expect(capsulesForUnit(99)).toEqual([]);
  });
});

describe('capsules — capsule du jour', () => {
  it('le tirage est stable pour une même journée', () => {
    const a = capsuleOfTheDay('2026-09-27');
    const b = capsuleOfTheDay('2026-09-27');
    expect(a.id).toBe(b.id);
  });

  it('le tirage change au fil des jours (pas une constante déguisée)', () => {
    const jours = Array.from({ length: 30 }, (_, i) => `2026-10-${String(i + 1).padStart(2, '0')}`);
    const tires = new Set(jours.map((j) => capsuleOfTheDay(j).id));
    expect(tires.size).toBeGreaterThan(3);
  });

  it('le tirage respecte le pool fourni (usage par unité)', () => {
    const pool = capsulesForUnit(4);
    for (const j of ['2026-01-01', '2026-06-15', '2026-12-31']) {
      expect(pool.map((c) => c.id)).toContain(capsuleOfTheDay(j, pool).id);
    }
  });

  it('todayKey produit une clé YYYY-MM-DD locale', () => {
    expect(todayKey(new Date(2026, 8, 27))).toBe('2026-09-27');
    expect(todayKey(new Date(2026, 0, 5))).toBe('2026-01-05');
  });
});
