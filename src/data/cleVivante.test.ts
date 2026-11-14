import { describe, expect, it } from 'vitest';
import {
  DENTS,
  TEETH_COUNT,
  VERBES_CLE,
  isValidDentId,
  hasVerbeDents,
  mapCategoryToDents,
} from './cleVivante';
import { ASNAN } from './miftahSpec';

describe('cleVivante — contrat de données', () => {
  it('les 4 dents proviennent d\'ASNAN (pas de littéraux dupliqués)', () => {
    expect(DENTS).toHaveLength(4);
    expect(DENTS.map((d) => d.nameAr)).toEqual(ASNAN.map((a) => a.nameAr));
    expect(DENTS.map((d) => d.iconAr)).toEqual(ASNAN.map((a) => a.iconAr));
    expect(DENTS.map((d) => d.actionAr)).toEqual(ASNAN.map((a) => a.actionAr));
    expect(DENTS.map((d) => d.correctorAr)).toEqual(ASNAN.map((a) => a.correctorAr));
  });

  it('les noms de dents sont فعل · دليل · علاقة · جواب', () => {
    expect(DENTS.map((d) => d.nameAr)).toEqual(['فعل', 'دليل', 'علاقة', 'جواب']);
  });

  it('TEETH_COUNT == 4', () => {
    expect(TEETH_COUNT).toBe(4);
  });

  it('les 12 verbes de VERB_CARDS ont un mapping de dents', () => {
    expect(VERBES_CLE).toHaveLength(12);
    // Un verbe par id unique.
    const ids = VERBES_CLE.map((v) => v.id);
    const uniq = new Set(ids);
    expect(uniq.size).toBe(ids.length);
    // Couverture : aucun id de VERB_CLE dupliqué ni manquant (test cross au lock).
  });

  it('mapping catégoriel correct : reasoned = 1/2/3/4, descriptive = 1/2/4, عَرِّف = 1/4', () => {
    expect(mapCategoryToDents('reasoned', 'x')).toEqual([1, 2, 3, 4]);
    expect(mapCategoryToDents('descriptive', 'verb_analyse_v1')).toEqual([1, 2, 4]);
    expect(mapCategoryToDents('descriptive', 'verb_define_v1')).toEqual([1, 4]);
  });

  it('vérification croisée : les dents déclarées existent dans DENTS', () => {
    for (const v of VERBES_CLE) {
      for (const d of v.dents) {
        expect(isValidDentId(d)).toBeTruthy();
      }
      expect(v.dents.every((d) => d >= 1 && d <= 4)).toBeTruthy();
    }
  });

  it('hasVerbeDents / isValidDentId fonctionnels', () => {
    expect(hasVerbeDents('verb_analyse_v1')).toBeTruthy();
    expect(hasVerbeDents('inconnu')).toBeFalsy();
    expect(isValidDentId(2)).toBeTruthy();
    expect(isValidDentId(9)).toBeFalsy();
  });

  it('توزيع الأفعال على الأسنان (recouvrement)', () => {
    // فعل (1) : 12/12 ; دليل (2) : 11/12 (عَرِّف s'en passe) ; جواب (4) : 12/12
    // علاقة (3) : 7/12 (mis de côté sur les descriptifs + عَرِّف)
    const byTooth = VERBES_CLE.reduce(
      (acc, v) => {
        for (const t of v.dents) acc[t] = (acc[t] ?? 0) + 1;
        return acc;
      },
      { 1: 0, 2: 0, 3: 0, 4: 0 } as Record<number, number>
    );
    expect(byTooth[1]).toBe(12);
    expect(byTooth[2]).toBe(11);
    expect(byTooth[3]).toBe(7);
    expect(byTooth[4]).toBe(12);
  });
});
