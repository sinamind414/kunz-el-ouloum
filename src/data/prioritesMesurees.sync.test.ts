// prioritesMesurees.sync.test.ts — le document de priorités ne doit pas mentir
// (sprint 37).
//
// `data/priorites_pedagogiques.json` publie un classement chiffré des unités,
// repris dans les documents d'analyse et lu par des humains. Une documentation
// chiffrée pourrit en silence : une session ajoutée, et les nombres publiés
// deviennent faux sans que rien ne casse.
//
// Ce test compare chaque nombre publié à la valeur recalculée depuis le
// corpus. Il échoue le jour où l'un des deux bouge sans l'autre.

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { observedUnitSharePercent, unitPressure, YEARS_COVERED, BAC_IDEAS } from './bacSessionIndex';
import { declaredWeight } from './revisionPlan';
import { INITIAL_UNITS } from '../unitCatalog';

interface LignePubliee {
  unitId: number;
  titre: string;
  pointsPrincipaux: number;
  partPourcent: number;
  poidsAnnonce: number;
  apparitions: number;
  sessions: number;
}

const publie = JSON.parse(
  readFileSync(resolve(process.cwd(), 'data/priorites_pedagogiques.json'), 'utf8'),
) as { prioritesMesurees_2017_2026?: { unites: LignePubliee[]; _meta: Record<string, string> } };

describe('priorités mesurées — le document reste synchronisé avec le corpus', () => {
  const bloc = publie.prioritesMesurees_2017_2026;

  it('publie un classement pour chaque unité du programme', () => {
    expect(bloc, 'bloc prioritesMesurees_2017_2026 absent').toBeDefined();
    expect(bloc!.unites.map((u) => u.unitId).sort((a, b) => a - b)).toEqual(
      INITIAL_UNITS.map((u) => u.id).sort((a, b) => a - b),
    );
  });

  it('annonce exactement les points, parts et apparitions calculés', () => {
    const pression = new Map(unitPressure().map((p) => [p.unitId, p]));
    const parts = observedUnitSharePercent();
    for (const ligne of bloc!.unites) {
      const mesure = pression.get(ligne.unitId);
      expect(mesure, `unité ${ligne.unitId} absente du corpus`).toBeDefined();
      expect(ligne.pointsPrincipaux, `points U${ligne.unitId}`).toBe(mesure!.pointsPrincipaux);
      expect(ligne.apparitions, `apparitions U${ligne.unitId}`).toBe(mesure!.count);
      expect(ligne.sessions, `sessions U${ligne.unitId}`).toBe(mesure!.years.length);
      expect(ligne.partPourcent, `part U${ligne.unitId}`).toBeCloseTo(parts[ligne.unitId], 1);
      expect(ligne.poidsAnnonce, `poids annoncé U${ligne.unitId}`).toBe(declaredWeight(ligne.unitId));
    }
  });

  it('reste trié du plus lourd au plus léger', () => {
    const points = bloc!.unites.map((u) => u.pointsPrincipaux);
    expect(points).toEqual([...points].sort((a, b) => b - a));
  });

  it('décrit la bonne assiette : 10 sessions, 59 exercices', () => {
    expect(YEARS_COVERED.length).toBe(10);
    expect(BAC_IDEAS.length).toBe(59);
    expect(bloc!._meta.source).toContain(String(BAC_IDEAS.length));
    expect(bloc!._meta.source).toContain('2017');
    expect(bloc!._meta.source).toContain('2026');
  });
});
