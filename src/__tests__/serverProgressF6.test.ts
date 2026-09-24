// F6 — intégration SQLite (skipIf si bindings natifs absents, cf. serverDashboard).
// L'import du module réussit même sans bindings : on doit PROBER la construction.
import { describe, expect, it } from 'vitest';

let creerStore: (() => import('../../server/store').SqliteStore) | null = null;
try {
  const { SqliteStore } = await import('../../server/store');
  const probe = new SqliteStore(':memory:'); // throw si bindings absents
  probe.close();
  creerStore = (): import('../../server/store').SqliteStore => new SqliteStore(':memory:');
} catch {
  creerStore = null;
}
const sqliteDispo = creerStore !== null;

describe.skipIf(!sqliteDispo)('F6 — progress_state LWW (SQLite en mémoire)', () => {
  it('mergeProgressState n’accepte qu’un updatedAt strictement plus grand', () => {
    const store = creerStore!();
    store.createStudent('stu_f6', 'f6@ecole.dz', 'hash', 'F6');
    const n1 = store.mergeProgressState('stu_f6', [
      { key: 'progress', updatedAt: 1000, value: { xp: 10 } },
    ]);
    expect(n1).toBe(1);
    // plus ancien → rejeté
    const n2 = store.mergeProgressState('stu_f6', [
      { key: 'progress', updatedAt: 500, value: { xp: 1 } },
    ]);
    expect(n2).toBe(0);
    // plus récent → accepté
    const n3 = store.mergeProgressState('stu_f6', [
      { key: 'progress', updatedAt: 2000, value: { xp: 99 } },
      { key: 'units', updatedAt: 2000, value: [] },
    ]);
    expect(n3).toBe(2);
    const rows = store.getProgressState('stu_f6');
    expect(rows.find((r) => r.key === 'progress')?.value).toEqual({ xp: 99 });
    expect(rows).toHaveLength(2);
    store.close();
  });

  it('restauration appareil neuf : getProgressState renvoie l’état complet', () => {
    const store = creerStore!();
    store.createStudent('stu_new', 'new@ecole.dz', 'hash', 'Neuf');
    store.mergeProgressState('stu_new', [
      { key: 'units', updatedAt: 10, value: [{ id: 1 }] },
      { key: 'okacha', updatedAt: 11, value: { page: 2 } },
    ]);
    // « nouvel appareil » = lecture seule du pull
    const state = store.getProgressState('stu_new');
    expect(state.map((s) => s.key).sort()).toEqual(['okacha', 'units']);
    store.close();
  });
});

describe('F6 — fallback statique sans SQLite', () => {
  it('SQL LWW présent dans store.ts même si bindings absents', async () => {
    const fs = await import('node:fs');
    const src = fs.readFileSync('server/store.ts', 'utf-8');
    expect(src).toContain('WHERE excluded.updated_at > progress_state.updated_at');
    expect(src).toContain('CREATE TABLE IF NOT EXISTS progress_state');
  });
});
