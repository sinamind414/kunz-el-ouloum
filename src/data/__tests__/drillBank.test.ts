// Phase 1 (update 2026-09-06, MARQUE §12) — auto-audit de la banque de drill :
// l'intention éditoriale doit coïncider avec le dérivé du moteur sur les 3 portes,
// et la famille 🔨 حدّاد doit être représentée (l'angle mort corrigé).
import { describe, expect, it } from 'vitest';
import {
  DRILL_BANK, deriveExistence, deriveSource, deriveMovement,
  drawDailyConsignes, gradeDrill, PHASE0_DEMOS, DRILL_LABELS,
} from '../drillBank';

describe('Phase 1 — banque du drill (3 portes)', () => {
  it('pool ≥ 50 consignes', () => {
    expect(DRILL_BANK.length).toBeGreaterThanOrEqual(50);
  });

  it('ids uniques et seq contigus', () => {
    const ids = new Set(DRILL_BANK.map(c => c.id));
    expect(ids.size).toBe(DRILL_BANK.length);
    expect(DRILL_BANK.map(c => c.seq)).toEqual(DRILL_BANK.map((_, i) => i + 1));
  });

  it('🚪 existence éditoriale = dérivée du moteur (règle produit)', () => {
    for (const c of DRILL_BANK) {
      expect(deriveExistence(c.consigne), `${c.id} « ${c.consigne} »`).toBe(c.existence);
    }
  });

  it('📥 source éditoriale = dérivée (null ⇔ pas de قفل)', () => {
    for (const c of DRILL_BANK) {
      expect(deriveSource(c.consigne), `${c.id} « ${c.consigne} »`).toBe(c.source);
      if (c.existence === 'no_lock') expect(c.source).toBeNull();
    }
  });

  it('⚙️ movement dérivé de la carte (no_lock ⇒ دُرج ; list+قفل ⇒ 📷)', () => {
    for (const c of DRILL_BANK) {
      expect(deriveMovement(c.consigne, c.verbCardId), c.id).toBe(c.movement);
    }
    const drawer = DRILL_BANK.filter(c => c.movement === 'drawer');
    expect(drawer.length).toBeGreaterThan(0);
    for (const c of drawer) expect(c.existence).toBe('no_lock');
  });

  it('🔨 الحدّاد représenté (angle mort corrigé : ≥ 15% des قفل, cible ≈ 25-30%)', () => {
    const smiths = DRILL_BANK.filter(c => c.movement === 'smith');
    const locked = DRILL_BANK.filter(c => c.existence === 'lock');
    expect(smiths.length).toBeGreaterThanOrEqual(10);
    expect(smiths.length / locked.length).toBeGreaterThanOrEqual(0.15);
    // toutes les hypothèses sont classées smith — jamais film ni photo
    for (const c of DRILL_BANK.filter(c => c.verbCardId === 'verb_hypothesis_v1')) {
      expect(c.movement).toBe('smith');
    }
  });

  it('le cas mixte existe et est fréquent (ومعلوماتك/ومكتسباتك = la norme BAC)', () => {
    const mixed = DRILL_BANK.filter(c => c.source === 'mixed');
    expect(mixed.length / DRILL_BANK.length).toBeGreaterThan(0.1);
  });
});

describe('Phase 1 — tirage quotidien', () => {
  it('déterministe par jour, 12 consignes, renouvelé le lendemain', () => {
    const a = drawDailyConsignes('2026-09-06');
    const b = drawDailyConsignes('2026-09-06');
    const c = drawDailyConsignes('2026-09-07');
    expect(a).toEqual(b);
    expect(a.map(x => x.id)).not.toEqual(c.map(x => x.id));
    expect(a).toHaveLength(12);
  });
});

describe('Phase 1 — gradeDrill (3 portes)', () => {
  const item = (over: Partial<typeof DRILL_BANK[number]> = {}) =>
    ({ ...DRILL_BANK[0], ...over });

  it('les trois portes justes ⇒ réussie', () => {
    const c = item({ id: 't1', existence: 'lock', source: 'mixed', movement: 'smith' });
    const g = gradeDrill([c], { t1: { g1: 'lock', g2: 'mixed', g3: 'smith' } });
    expect(g.score).toBe(1);
    expect(g.results[0]).toMatchObject({ ok1: true, ok2: true, ok3: true, correct: true, answered: true });
  });

  it('pas de قفل ⇒ portes 2-3 non posées (true), une réponse 1 suffit', () => {
    const c = item({ id: 't2', existence: 'no_lock', source: null, movement: 'drawer' });
    const g = gradeDrill([c], { t2: { g1: 'no_lock' } });
    expect(g.score).toBe(1);
    expect(g.results[0].answered).toBe(true);
  });

  it('chaque porte fausse ⇒ échec, et « answered » est honnête', () => {
    const c = item({ id: 't3', existence: 'lock', source: 'document', movement: 'film' });
    const g1 = gradeDrill([c], { t3: { g1: 'no_lock', g2: 'document', g3: 'film' } });
    expect(g1.results[0].ok1).toBe(false);
    expect(g1.results[0].correct).toBe(false);
    const g2 = gradeDrill([c], { t3: { g1: 'lock', g2: 'mixed', g3: 'film' } });
    expect(g2.results[0]).toMatchObject({ ok1: true, ok2: false, ok3: true, correct: false });
    const g3 = gradeDrill([c], { t3: { g1: 'lock', g2: 'document', g3: 'smith' } });
    expect(g3.results[0]).toMatchObject({ ok1: true, ok2: true, ok3: false, correct: false });
    const gPart = gradeDrill([c], { t3: { g1: 'lock' } });
    expect(gPart.results[0].answered).toBe(false);
  });
});

describe('Phase 1 — Phase 0 (ouverture des 3 portes)', () => {
  it('6 démos, bankIds valides, une demo 🔨 حدّاد (la 3e issue)', () => {
    expect(PHASE0_DEMOS).toHaveLength(6);
    for (const d of PHASE0_DEMOS) {
      const c = DRILL_BANK.find(x => x.id === d.bankId);
      expect(c, d.bankId).toBeDefined();
    }
    const smith = PHASE0_DEMOS.find(d => {
      const c = DRILL_BANK.find(x => x.id === d.bankId)!;
      return c.movement === 'smith';
    });
    expect(smith).toBeDefined();
  });
});

describe('Phase 1 — labels UI (3 issues sur la porte 3)', () => {
  it('g3 a exactement 3 issues + le دُرج', () => {
    expect(Object.keys(DRILL_LABELS.g3).sort()).toEqual(['drawer', 'film', 'photo', 'smith']);
    expect(Object.keys(DRILL_LABELS.g1).sort()).toEqual(['lock', 'no_lock']);
    expect(Object.keys(DRILL_LABELS.g2).sort()).toEqual(['document', 'mixed']);
  });
});
