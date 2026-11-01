// favorites.test.ts — R5-G2/G5 : favoris + recherches récentes (localStorage).
import { beforeEach, describe, expect, it } from 'vitest';
import {
  addFavorite,
  clearRecentSearches,
  getFavorites,
  getRecentSearches,
  isFavorite,
  pushRecentSearch,
  removeFavorite,
  toggleFavorite,
} from '../favorites';

beforeEach(() => {
  window.localStorage.clear();
});

describe('R5-G2 : favoris', () => {
  it('part vide', () => {
    expect(getFavorites()).toEqual([]);
    expect(isFavorite('phase1_chapitres_1_2')).toBe(false);
  });

  it('ajout / lecture / idempotence', () => {
    addFavorite({ lessonKey: 'phase1_chapitres_1_2', lessonKind: 'html', title: 'تركيب البروتين', unitId: 1 });
    addFavorite({ lessonKey: 'phase1_chapitres_1_2', lessonKind: 'html', title: 'تركيب البروتين', unitId: 1 });
    expect(getFavorites()).toHaveLength(1);
    expect(isFavorite('phase1_chapitres_1_2')).toBe(true);
  });

  it('toggle ajoute puis retire', () => {
    const entry = { lessonKey: 'd1-u1-l1-expression-genique', lessonKind: 'active' as const, title: 'التعبير المورثي', unitId: 1 };
    expect(toggleFavorite(entry)).toBe(true);
    expect(getFavorites()).toHaveLength(1);
    expect(toggleFavorite(entry)).toBe(false);
    expect(getFavorites()).toEqual([]);
  });

  it('retrait par clé', () => {
    addFavorite({ lessonKey: 'a', lessonKind: 'html', title: 'A', unitId: 2 });
    addFavorite({ lessonKey: 'b', lessonKind: 'html', title: 'B', unitId: 3 });
    removeFavorite('a');
    expect(getFavorites().map((f) => f.lessonKey)).toEqual(['b']);
  });

  it('surcharge JSON corrompue → fallback sûr', () => {
    window.localStorage.setItem('boussole_favorites', '{not json');
    expect(getFavorites()).toEqual([]);
  });
});

describe('R5-G5 : recherches récentes', () => {
  it('empile, déduplique et plafonne à 6', () => {
    pushRecentSearch('الفسفرة التأكسدية');
    pushRecentSearch('التركيب الضوئي');
    pushRecentSearch('الفسفرة التأكسدية'); // remonte en tête, pas de doublon
    const list = getRecentSearches();
    expect(list).toHaveLength(2);
    expect(list[0]).toBe('الفسفرة التأكسدية');

    for (let i = 0; i < 10; i += 1) pushRecentSearch(`q${i}`);
    expect(getRecentSearches()).toHaveLength(6);
  });

  it('ignore les requêtes trop courtes', () => {
    pushRecentSearch('a');
    expect(getRecentSearches()).toEqual([]);
  });

  it('effacement', () => {
    pushRecentSearch('الغوص');
    clearRecentSearches();
    expect(getRecentSearches()).toEqual([]);
  });
});
