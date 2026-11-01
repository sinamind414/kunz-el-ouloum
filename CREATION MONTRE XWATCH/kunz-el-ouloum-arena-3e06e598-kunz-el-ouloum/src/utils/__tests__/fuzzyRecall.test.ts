// src/utils/__tests__/fuzzyRecall.test.ts — Verrou de la R1 de l'audit qualité
// Morchid (2026-09-29) : tolérance aux fautes de frappe + recouvrement de
// tokens. But : LEVER LE RAPPEL de la recherche lexicale (questions tapées au
// téléphone, avec fautes) SANS dégrader la précision sur les mots arabes courts.
import { describe, expect, it } from 'vitest';
import {
  normalizeArabic,
  tokenizeArabic,
  boundedLevenshtein,
  typoBudget,
  fuzzyTokenEquals,
  tokenOverlapRatio,
} from '../arabicNormalize';

const n = normalizeArabic;

describe('boundedLevenshtein', () => {
  it('renvoie 0 pour deux chaînes identiques', () => {
    expect(boundedLevenshtein('خلية', 'خلية', 2)).toBe(0);
  });
  it('compte une substitution', () => {
    expect(boundedLevenshtein('abc', 'abd', 2)).toBe(1);
  });
  it('coupe tôt au-delà du budget (early-exit)', () => {
    // 5 différences, budget 1 → doit renvoyer > 1 sans calculer la distance exacte
    expect(boundedLevenshtein('aaaaa', 'bbbbb', 1)).toBeGreaterThan(1);
  });
});

describe('typoBudget — tolérance adaptative', () => {
  it('mot court = aucune faute tolérée', () => {
    expect(typoBudget(2)).toBe(0);
    expect(typoBudget(3)).toBe(0);
  });
  it('mot moyen = 1 faute', () => {
    expect(typoBudget(4)).toBe(1);
    expect(typoBudget(6)).toBe(1);
  });
  it('mot long = 2 fautes', () => {
    expect(typoBudget(7)).toBe(2);
    expect(typoBudget(12)).toBe(2);
  });
});

describe('fuzzyTokenEquals — RAPPEL (fautes de frappe fréquentes)', () => {
  it('tolère une lettre manquante sur un mot long', () => {
    expect(fuzzyTokenEquals(n('ميتوكندري'), n('ميتوكوندري'))).toBe(true);
  });
  it('tolère la confusion س/ز (كروموسوم/كروموزوم)', () => {
    expect(fuzzyTokenEquals(n('كروموسوم'), n('كروموزوم'))).toBe(true);
  });
  it('reconnaît le mot précédé de l’article ال', () => {
    expect(fuzzyTokenEquals(n('المعده'), n('معدة'))).toBe(true);
  });
});

describe('fuzzyTokenEquals — PRÉCISION (pas de confusion abusive)', () => {
  it('ne confond pas deux mots courts distincts', () => {
    expect(fuzzyTokenEquals(n('دم'), n('دمع'))).toBe(false);
    expect(fuzzyTokenEquals(n('نواة'), n('قناة'))).toBe(false);
  });
  it('rejette quand l’écart dépasse le budget', () => {
    expect(fuzzyTokenEquals(n('انقسام'), n('اندماج'))).toBe(false);
  });
});

describe('tokenOverlapRatio — alias/titres multi-mots', () => {
  it('retrouve un alias multi-mots présent dans la question', () => {
    const it_ = tokenizeArabic(n('ما هي وظيفة الغشاء البلازمي في الخلية'));
    expect(tokenOverlapRatio(it_, n('الغشاء البلازمي'))).toBeGreaterThanOrEqual(0.75);
  });
  it('ne déclenche pas sur un sujet absent', () => {
    const it_ = tokenizeArabic(n('ما هي وظيفة الغشاء البلازمي في الخلية'));
    expect(tokenOverlapRatio(it_, n('الجهاز العصبي'))).toBe(0);
  });
  it('renvoie 0 pour une cible vide', () => {
    expect(tokenOverlapRatio([], n(''))).toBe(0);
  });
});
