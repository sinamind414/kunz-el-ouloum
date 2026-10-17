// drillLog.test.ts — sprint 66.
//
// Trois propriétés protégées ici : une entrée par (jour, schéma), un verdict
// qui exige l'absence d'oubli essentiel, et le refus de conclure sous trois
// schémas — la même retenue que pour la rédaction.

import { beforeEach, describe, expect, it } from 'vitest';
import {
  DRILL_LOG_KEY,
  DRILL_LOG_MAX,
  SEUIL_SCHEMA_SU,
  bilanSchemas,
  clearDrillLog,
  etatDesSchemas,
  readDrillLog,
  recordDrill,
  type DrillEntry,
} from './drillLog';

function entree(p: Partial<DrillEntry> & { date: string; drillId: string }): DrillEntry {
  return { unitId: 4, score: 8, total: 16, oublisEssentiels: 1, ...p };
}

beforeEach(() => {
  localStorage.clear();
  clearDrillLog();
});

describe('journal des schémas — écriture', () => {
  it('enregistre une tentative et la relit', () => {
    recordDrill(entree({ date: '2026-05-10', drillId: 'd1' }));
    expect(readDrillLog()).toHaveLength(1);
  });

  it('garde une seule entrée par jour et par schéma : la dernière', () => {
    recordDrill(entree({ date: '2026-05-10', drillId: 'd1', score: 4 }));
    recordDrill(entree({ date: '2026-05-10', drillId: 'd1', score: 12 }));
    const journal = readDrillLog();
    expect(journal).toHaveLength(1);
    expect(journal[0].score).toBe(12);
  });

  it('distingue deux schémas du même jour', () => {
    recordDrill(entree({ date: '2026-05-10', drillId: 'd1' }));
    recordDrill(entree({ date: '2026-05-10', drillId: 'd2' }));
    expect(readDrillLog()).toHaveLength(2);
  });

  it('refuse une entrée incohérente plutôt que de la stocker', () => {
    recordDrill(entree({ date: '2026-05-10', drillId: 'd1', score: 20, total: 16 }));
    recordDrill({ ...entree({ date: 'hier', drillId: 'd2' }) });
    expect(readDrillLog()).toEqual([]);
  });

  it('survit à un contenu corrompu dans le stockage', () => {
    localStorage.setItem(DRILL_LOG_KEY, '{pas du json');
    expect(readDrillLog()).toEqual([]);
  });

  it('plafonne la taille du journal', () => {
    for (let i = 0; i < DRILL_LOG_MAX + 25; i += 1) {
      recordDrill(entree({ date: '2026-05-10', drillId: `d${i}` }));
    }
    expect(readDrillLog().length).toBeLessThanOrEqual(DRILL_LOG_MAX);
  });
});

describe('état par schéma', () => {
  it('retient le dernier passage, pas le meilleur', () => {
    recordDrill(entree({ date: '2026-05-10', drillId: 'd1', score: 16, oublisEssentiels: 0 }));
    recordDrill(entree({ date: '2026-05-12', drillId: 'd1', score: 6 }));
    const [etat] = etatDesSchemas();
    expect(etat.passages).toBe(2);
    expect(etat.dernierTaux).toBeCloseTo(6 / 16);
    expect(etat.su).toBe(false);
  });

  it('un schéma n’est « su » qu’avec un bon taux ET zéro oubli essentiel', () => {
    recordDrill(entree({ date: '2026-05-10', drillId: 'bon', score: 14, oublisEssentiels: 0 }));
    recordDrill(entree({ date: '2026-05-10', drillId: 'troue', score: 14, oublisEssentiels: 1 }));
    const etats = Object.fromEntries(etatDesSchemas().map((e) => [e.drillId, e.su]));
    expect(14 / 16).toBeGreaterThanOrEqual(SEUIL_SCHEMA_SU);
    expect(etats.bon).toBe(true);
    expect(etats.troue).toBe(false);
  });

  it('place le plus fragile en tête', () => {
    recordDrill(entree({ date: '2026-05-10', drillId: 'solide', score: 15 }));
    recordDrill(entree({ date: '2026-05-10', drillId: 'faible', score: 2 }));
    expect(etatDesSchemas()[0].drillId).toBe('faible');
  });
});

describe('bilan de restitution — retenue du verdict', () => {
  it('dit l’absence de trace sans la maquiller', () => {
    expect(bilanSchemas().messageAr).toContain('لم ترسم');
  });

  it('refuse de conclure sous trois schémas', () => {
    recordDrill(entree({ date: '2026-05-10', drillId: 'd1' }));
    recordDrill(entree({ date: '2026-05-10', drillId: 'd2' }));
    expect(bilanSchemas().messageAr).toContain('ثلاثة على الأقل');
  });

  it('compte les schémas sus à partir de trois', () => {
    recordDrill(entree({ date: '2026-05-10', drillId: 'd1', score: 16, oublisEssentiels: 0 }));
    recordDrill(entree({ date: '2026-05-10', drillId: 'd2', score: 16, oublisEssentiels: 0 }));
    recordDrill(entree({ date: '2026-05-10', drillId: 'd3', score: 3 }));
    const bilan = bilanSchemas();
    expect(bilan.tentes).toBe(3);
    expect(bilan.sus).toBe(2);
    expect(bilan.fragiles.map((f) => f.drillId)).toEqual(['d3']);
    expect(bilan.messageAr).toContain('2');
  });
});
