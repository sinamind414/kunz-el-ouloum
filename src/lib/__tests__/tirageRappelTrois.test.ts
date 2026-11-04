// tirageRappelTrois.test.ts — LE CAPITAINE TIRE 3 QUESTIONS, et pas une de plus.
//
// Lot 2 (2026-11-04). Tests COMPORTEMENTAUX de la règle pure : aucun
// `readFileSync`, aucun import du corpus lourd. On verrouille l'ordre
// (dues → unité faible → rotation stable), l'honnêteté (jamais de question
// inventée) et l'absence d'écriture de stockage.

import { describe, expect, it } from 'vitest';
import {
  NOMBRE_QUESTIONS_RAPPEL,
  tirageRappelTrois,
  uniteIdDepuisTitre,
  type QuestionRappel,
  type SignalRappel,
} from '../../lib/invitationCapitaine';

function q(id: number, uniteId: number, correctIndex = 0): QuestionRappel {
  return {
    id,
    uniteId,
    questionAr: `سؤال ${id}`,
    optionsAr: ['الخيار الأول', 'الخيار الثاني'],
    correctIndex,
    explicationAr: `تفسير ${id}`,
  };
}

const CATALOGUE: QuestionRappel[] = [q(1, 1), q(2, 1), q(3, 2), q(4, 2), q(5, 3), q(6, 3)];
const JOUR = '2026-11-04';

function signal(partiel: Partial<SignalRappel> = {}): SignalRappel {
  return { idsDues: [], unitePrioritaire: null, jour: JOUR, ...partiel };
}

describe('tirage du rappel — forme et honnêteté', () => {
  it('trois questions, pas quatre', () => {
    expect(NOMBRE_QUESTIONS_RAPPEL).toBe(3);
    expect(tirageRappelTrois(CATALOGUE, signal())).toHaveLength(3);
  });

  it('catalogue vide ⇒ [] : aucune question fabriquée', () => {
    expect(tirageRappelTrois([], signal({ idsDues: [1, 2, 3] }))).toEqual([]);
  });

  it('catalogue plus petit que 3 ⇒ on rend ce qu on a, sans inventer', () => {
    const tirees = tirageRappelTrois([q(9, 1), q(10, 1)], signal());
    expect(tirees.map((x) => x.id)).toEqual([9, 10]);
  });

  it('aucun doublon, et chaque question vient du VRAI catalogue', () => {
    const tirees = tirageRappelTrois(CATALOGUE, signal({ idsDues: [3, 3, 3] }));
    expect(new Set(tirees.map((x) => x.id)).size).toBe(tirees.length);
    for (const x of tirees) expect(CATALOGUE.some((c) => c.id === x.id)).toBeTruthy();
  });

  it('questions invalides écartées (index hors bornes, options < 2, texte vide)', () => {
    const inhabiles: QuestionRappel[] = [
      { ...q(1, 1), correctIndex: 9 },
      { ...q(2, 1), optionsAr: [' seul '] },
      { ...q(3, 1), questionAr: '   ' },
      q(4, 1),
      q(5, 1),
      q(6, 1),
    ];
    const tirees = tirageRappelTrois(inhabiles, signal());
    expect(tirees).toHaveLength(3);
    expect(tirees.every((x) => x.id >= 4)).toBeTruthy();
  });

  it('pureté : AUCUNE écriture de stockage', () => {
    const avant = localStorage.length;
    tirageRappelTrois(CATALOGUE, signal({ idsDues: [2, 4] }));
    expect(localStorage.length).toBe(avant);
  });
});

describe('tirage du rappel — ordre pédagogique', () => {
  it('les cartes DUES passent d abord, dans leur ordre SRS', () => {
    const tirees = tirageRappelTrois(CATALOGUE, signal({ idsDues: [5, 2] }));
    expect(tirees[0].id).toBe(5);
    expect(tirees[1].id).toBe(2);
    expect(tirees).toHaveLength(3);
  });

  it('unité faible désignée par le coach ⇒ ses questions avant la rotation', () => {
    const tirees = tirageRappelTrois(CATALOGUE, signal({ unitePrioritaire: '2. الوحدة الثانية' }));
    expect(tirees.slice(0, 2).map((x) => x.id).sort()).toEqual([3, 4]);
  });

  it('priorité complète : dues > unité faible > rotation', () => {
    const tirees = tirageRappelTrois(
      CATALOGUE,
      signal({ idsDues: [6], unitePrioritaire: '1. تركيب البروتين' }),
    );
    expect(tirees[0].id).toBe(6);
    expect(tirees.slice(1).every((x) => x.uniteId === 1)).toBeTruthy();
  });

  it('titre sans préfixe numérique ⇒ aucun filtre deviné', () => {
    expect(uniteIdDepuisTitre('المناعة')).toBeNull();
    expect(uniteIdDepuisTitre(null)).toBeNull();
    expect(uniteIdDepuisTitre('1. تركيب البروتين')).toBe(1);
    expect(uniteIdDepuisTitre('12) وحدة')).toBe(12);
    expect(uniteIdDepuisTitre('0. rien')).toBeNull();
    const a = tirageRappelTrois(CATALOGUE, signal({ unitePrioritaire: null }));
    const b = tirageRappelTrois(CATALOGUE, signal({ unitePrioritaire: 'المناعة' }));
    expect(a.map((x) => x.id)).toEqual(b.map((x) => x.id));
  });

  it('rotation STABLE : même jour ⇒ même tirage (pas de hasard au rendu)', () => {
    const a = tirageRappelTrois(CATALOGUE, signal());
    const b = tirageRappelTrois(CATALOGUE, signal());
    expect(a.map((x) => x.id)).toEqual(b.map((x) => x.id));
  });

  it('un jour différent peut décaler le tirage, sans jamais sortir du catalogue', () => {
    const a = tirageRappelTrois(CATALOGUE, signal({ jour: '2026-11-04' }));
    const b = tirageRappelTrois(CATALOGUE, signal({ jour: '2026-11-05' }));
    expect(b).toHaveLength(3);
    expect(new Set(b.map((x) => x.id)).size).toBe(3);
    expect(b.every((x) => CATALOGUE.some((c) => c.id === x.id))).toBeTruthy();
  });

  it('ids DUES inconnus ou dupliqués ⇒ ignorés sans casser le tirage', () => {
    const tirees = tirageRappelTrois(CATALOGUE, signal({ idsDues: [999, -1, Number.NaN, 2, 2] }));
    expect(tirees).toHaveLength(3);
    expect(new Set(tirees.map((x) => x.id)).size).toBe(3);
    expect(tirees[0].id).toBe(2);
  });
});
