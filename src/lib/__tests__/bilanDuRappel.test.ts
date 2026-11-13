// bilanDuRappel.test.ts — LE CAPITAINE COMPTE LES ERREURS SANS EN INVENTER.
//
// Lot 3 (2026-11-04). Tests comportementaux de la règle pure : aucun
// `readFileSync`, aucun stockage. On verrouille surtout les SILENCES — une
// réponse absente n'est pas une faute, et un échauffement sans faute ne doit
// déclencher AUCUNE déclaration de cause.

import { describe, expect, it } from 'vitest';
import {
  ERREURS_MIN_POUR_DECLARER,
  bilanDuRappel,
  themeUniteAr,
  type QuestionRappel,
} from '../../lib/invitationCapitaine';

function q(id: number, uniteId: number, themeAr?: string): QuestionRappel {
  return {
    id,
    uniteId,
    questionAr: `سؤال ${id}`,
    optionsAr: ['خطأ', 'صواب'],
    correctIndex: 1,
    explicationAr: `تفسير ${id}`,
    ...(themeAr ? { themeAr } : {}),
  };
}

const TROIS = [q(1, 1, '1. تركيب البروتين'), q(2, 2, '2. العلاقة بين بنية ووظيفة البروتين'), q(3, 3)];

describe('bilan du rappel — compter juste', () => {
  it('une erreur suffit à demander la cause, mais le seuil est explicite', () => {
    expect(ERREURS_MIN_POUR_DECLARER).toBe(1);
    expect(bilanDuRappel(TROIS, [0, 1, 1]).aDeclarer).toBeTruthy();
  });

  it('sans erreur ⇒ aucun bilan à déclarer, aucun thème', () => {
    const b = bilanDuRappel(TROIS, [1, 1, 1]);
    expect(b.erreurs).toBe(0);
    expect(b.aDeclarer).toBeFalsy();
    expect(b.themes).toEqual([]);
  });

  it('compte les mauvaises réponses et seulement elles', () => {
    expect(bilanDuRappel(TROIS, [0, 0, 1]).erreurs).toBe(2);
    expect(bilanDuRappel(TROIS, [0, 0, 0]).erreurs).toBe(3);
  });

  it('une réponse ABSENTE n est PAS une erreur inventée', () => {
    const b = bilanDuRappel(TROIS, [null, undefined]);
    expect(b.erreurs).toBe(0);
    expect(b.aDeclarer).toBeFalsy();
  });

  it('réponses surnuméraires ou non entières ignorées', () => {
    expect(bilanDuRappel(TROIS, [1, 1, 1, 0, 0]).erreurs).toBe(0);
    expect(bilanDuRappel(TROIS, [Number.NaN, 1, 99, 0]).erreurs).toBe(1);
  });

  it('catalogue vide ⇒ bilan vide, aucune déclaration', () => {
    expect(bilanDuRappel([], [0, 0, 0])).toEqual({ erreurs: 0, themes: [], aDeclarer: false });
  });

  it('les thèmes sont FACTUELS, dédupliqués, dans l ordre du tirage', () => {
    const b = bilanDuRappel(TROIS, [0, 0, 0]);
    expect(b.themes).toEqual([
      '1. تركيب البروتين',
      '2. العلاقة بين بنية ووظيفة البروتين',
      themeUniteAr(3),
    ]);
  });

  it('sans titre d unité ⇒ repli « الوحدة N », jamais un thème deviné', () => {
    expect(themeUniteAr(3)).toBe('الوحدة 3');
    expect(themeUniteAr(0)).toBe('');
    expect(themeUniteAr(Number.NaN)).toBe('');
    expect(bilanDuRappel([q(9, 3)], [0]).themes).toEqual(['الوحدة 3']);
  });

  it('deux questions de la même unité ⇒ UN seul thème', () => {
    const b = bilanDuRappel([q(1, 1, '1. تركيب البروتين'), q(2, 1, '1. تركيب البروتين')], [0, 0]);
    expect(b.erreurs).toBe(2);
    expect(b.themes).toEqual(['1. تركيب البروتين']);
  });

  it('pureté : aucune lecture ni écriture de stockage', () => {
    const avant = localStorage.length;
    const a = bilanDuRappel(TROIS, [0, 1, 0]);
    const b = bilanDuRappel(TROIS, [0, 1, 0]);
    expect(a).toEqual(b);
    expect(localStorage.length).toBe(avant);
  });
});
