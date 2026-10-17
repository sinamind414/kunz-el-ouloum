// spacedRecall.test.ts — sprint 65.
//
// Ce que ces tests protègent : le rappel espacé ne doit jamais devenir une
// liste de corvées. Trois propriétés comptent plus que les autres — on ne
// propose que des paliers exacts, on saute ce qui était déjà maîtrisé, et on
// plafonne la liste.

import { beforeEach, describe, expect, it } from 'vitest';
import { clearLearningLog, type LearningEntry } from './learningLog';
import {
  PALIERS,
  RAPPELS_MAX,
  RAPPELS_SCHEMAS_MAX,
  rappelsSchemas,
  SEUIL_MAITRISE,
  messageAucunRappel,
  rappelsDuJour,
} from './spacedRecall';
import { IDEA_BY_ID } from './bacSessionIndex';
import { SCHEMA_DRILLS } from './schemaDrills';
import type { DrillEntry } from './drillLog';

const AUJOURD_HUI = '2026-05-20';

function entree(p: Partial<LearningEntry> & { date: string; ideaId: string }): LearningEntry {
  return {
    familyId: 'verb_analyser',
    satisfaits: 1,
    total: 4,
    mots: 60,
    ...p,
  };
}

beforeEach(() => clearLearningLog());

describe('rappel espacé — choix des paliers', () => {
  it('ne remonte que les rédactions tombant exactement sur un palier', () => {
    const journal = [
      entree({ date: '2026-05-19', ideaId: 'a' }), // 1 jour  → palier
      entree({ date: '2026-05-18', ideaId: 'b' }), // 2 jours → non
      entree({ date: '2026-05-17', ideaId: 'c' }), // 3 jours → palier
      entree({ date: '2026-05-15', ideaId: 'd' }), // 5 jours → non
    ];
    const ids = rappelsDuJour(AUJOURD_HUI, journal).map((r) => r.ideaId);
    expect(ids.sort()).toEqual(['a', 'c']);
  });

  it('couvre les quatre paliers annoncés, jusqu’à seize jours', () => {
    for (const p of PALIERS) {
      const d = new Date(Date.parse(`${AUJOURD_HUI}T00:00:00Z`) - p * 86_400_000);
      const journal = [entree({ date: d.toISOString().slice(0, 10), ideaId: `x${p}` })];
      expect(rappelsDuJour(AUJOURD_HUI, journal)).toHaveLength(1);
    }
  });

  it('ignore une date illisible au lieu de planter', () => {
    const journal = [{ ...entree({ date: '2026-05-19', ideaId: 'a' }), date: 'hier' } as LearningEntry];
    expect(rappelsDuJour(AUJOURD_HUI, journal)).toEqual([]);
  });
});

describe('rappel espacé — ce qu’on refuse de proposer', () => {
  it('saute le lendemain quand la forme était déjà maîtrisée', () => {
    const journal = [entree({ date: '2026-05-19', ideaId: 'a', satisfaits: 4, total: 4 })];
    expect(rappelsDuJour(AUJOURD_HUI, journal)).toEqual([]);
  });

  it('mais le propose quand même au palier suivant', () => {
    const journal = [entree({ date: '2026-05-17', ideaId: 'a', satisfaits: 4, total: 4 })];
    const r = rappelsDuJour(AUJOURD_HUI, journal);
    expect(r).toHaveLength(1);
    expect(r[0].taux).toBeGreaterThanOrEqual(SEUIL_MAITRISE);
    expect(r[0].raisonAr).toContain('من الذاكرة');
  });

  it('ne dépasse jamais le plafond quotidien', () => {
    const journal = Array.from({ length: 10 }, (_, i) =>
      entree({ date: '2026-05-19', ideaId: `idee${i}` }),
    );
    expect(rappelsDuJour(AUJOURD_HUI, journal)).toHaveLength(RAPPELS_MAX);
  });

  it('ne compte qu’une fois un exercice rédigé plusieurs fois', () => {
    const journal = [
      entree({ date: '2026-05-13', ideaId: 'a' }),
      entree({ date: '2026-05-19', ideaId: 'a', satisfaits: 2 }),
    ];
    const r = rappelsDuJour(AUJOURD_HUI, journal);
    expect(r).toHaveLength(1);
    expect(r[0].jours).toBe(1);
  });
});

describe('rappel espacé — ordre et libellés', () => {
  it('place le plus fragile en tête', () => {
    const journal = [
      entree({ date: '2026-05-19', ideaId: 'solide', satisfaits: 3, total: 4 }),
      entree({ date: '2026-05-19', ideaId: 'fragile', satisfaits: 0, total: 4 }),
    ];
    expect(rappelsDuJour(AUJOURD_HUI, journal)[0].ideaId).toBe('fragile');
  });

  it('résout le titre de l’exercice quand il est dans la banque BAC', () => {
    const vrai = Object.keys(IDEA_BY_ID)[0];
    const journal = [entree({ date: '2026-05-19', ideaId: vrai })];
    const r = rappelsDuJour(AUJOURD_HUI, journal)[0];
    expect(r.titleAr).toBe(IDEA_BY_ID[vrai].titleAr);
    expect(r.familleAr.length).toBeGreaterThan(0);
  });

  it('reste muet plutôt que faux quand l’exercice a disparu de la banque', () => {
    const journal = [entree({ date: '2026-05-19', ideaId: 'exercice_supprime' })];
    expect(rappelsDuJour(AUJOURD_HUI, journal)[0].titleAr).toBe('');
  });

  it('chaque rappel dit pourquoi il remonte, avec le nombre de jours', () => {
    const journal = [entree({ date: '2026-05-13', ideaId: 'a' })];
    expect(rappelsDuJour(AUJOURD_HUI, journal)[0].raisonAr).toContain('7');
  });
});

describe('rappel espacé — absence de rappel', () => {
  it('distingue « tu n’as rien écrit » de « rien n’est dû »', () => {
    expect(messageAucunRappel([])).toContain('لم تكتب');
    expect(messageAucunRappel([entree({ date: '2026-05-18', ideaId: 'a' })])).toContain('لا شيء');
  });
});

// ---------------------------------------------------------------------------
// Sprint 67 — les schémas entrent dans le rappel espacé.
// ---------------------------------------------------------------------------

describe('rappel espacé — schémas refaits de mémoire', () => {
  const schema = (p: Partial<DrillEntry> & { date: string; drillId: string }): DrillEntry => ({
    unitId: 5,
    score: 4,
    total: 16,
    oublisEssentiels: 2,
    ...p,
  });

  it('remonte un schéma fragile dès le lendemain', () => {
    const r = rappelsSchemas(AUJOURD_HUI, [schema({ date: '2026-05-19', drillId: 'd1' })]);
    expect(r).toHaveLength(1);
    expect(r[0].raisonAr).toContain('عنصراً أساسياً');
  });

  it('laisse respirer une semaine un schéma déjà su', () => {
    const su = { score: 16, total: 16, oublisEssentiels: 0 };
    expect(rappelsSchemas(AUJOURD_HUI, [schema({ date: '2026-05-19', drillId: 'd1', ...su })])).toEqual([]);
    expect(rappelsSchemas(AUJOURD_HUI, [schema({ date: '2026-05-17', drillId: 'd1', ...su })])).toEqual([]);
    expect(rappelsSchemas(AUJOURD_HUI, [schema({ date: '2026-05-13', drillId: 'd1', ...su })])).toHaveLength(1);
  });

  it('ne propose jamais plus de deux schémas par jour', () => {
    const journal = Array.from({ length: 6 }, (_, i) =>
      schema({ date: '2026-05-19', drillId: `d${i}` }),
    );
    expect(rappelsSchemas(AUJOURD_HUI, journal)).toHaveLength(RAPPELS_SCHEMAS_MAX);
  });

  it('résout le titre du schéma depuis la banque', () => {
    const vrai = SCHEMA_DRILLS[0].id;
    const r = rappelsSchemas(AUJOURD_HUI, [schema({ date: '2026-05-19', drillId: vrai })]);
    expect(r[0].titleAr).toBe(SCHEMA_DRILLS[0].titleAr);
  });

  it('ne compte que le dernier passage d’un même schéma', () => {
    const journal = [
      schema({ date: '2026-05-13', drillId: 'd1' }),
      schema({ date: '2026-05-19', drillId: 'd1' }),
    ];
    const r = rappelsSchemas(AUJOURD_HUI, journal);
    expect(r).toHaveLength(1);
    expect(r[0].jours).toBe(1);
  });
});
