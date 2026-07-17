// store.test.ts
// P0.0 — Tests obligatoires de migration (Spec V2 §2.4).
import { describe, it, expect, beforeEach } from 'vitest';
import {
  migrateStore,
  migrateFromRaw,
  readRaw,
  writeRaw,
  STORAGE_KEYS,
  STORAGE_VERSION,
  LearningError,
} from './store';

// Mock localStorage minimal conforme à l'interface Storage (avec length + key).
class MockStorage implements Storage {
  private map = new Map<string, string>();
  get length() {
    return this.map.size;
  }
  clear() {
    this.map.clear();
  }
  getItem(k: string) {
    return this.map.has(k) ? this.map.get(k)! : null;
  }
  key(i: number) {
    return Array.from(this.map.keys())[i] ?? null;
  }
  removeItem(k: string) {
    this.map.delete(k);
  }
  setItem(k: string, v: string) {
    this.map.set(k, String(v));
  }
}

beforeEach(() => {
  global.localStorage = new MockStorage() as unknown as Storage;
});

function makeError(id: string, resolved = false): LearningError {
  const now = Date.now();
  return {
    id,
    kind: 'methodology',
    reflexId: 'analyse',
    ruleIds: ['FORBIDDEN_KULLAMA'],
    labelAr: 'خطأ منهجي',
    count: 2,
    createdAt: now,
    lastSeenAt: now,
    reviewStartedAt: now,
    reviewStage: 0,
    nextReviewAt: now,
    resolvedAt: resolved ? now : undefined,
  };
}

describe('Store — migration (V2 §2.4)', () => {
  it('migre un store absent → état vide sûr', () => {
    const store = migrateStore(undefined, 0, STORAGE_VERSION);
    expect(store.meta.version).toBe(STORAGE_VERSION);
    expect(store.learningErrors).toEqual([]);
    expect(store.missions).toEqual([]);
    expect(store.mastery).toEqual({});
  });

  it('migre un store v0 avec erreurs actives préservées', () => {
    const v0 = {
      meta: { version: 0 },
      errors: [makeError('e1')],
      missions: [],
      mastery: {},
    };
    const store = migrateStore(v0, 0, STORAGE_VERSION);
    expect(store.meta.version).toBe(STORAGE_VERSION);
    // L'erreur active doit survivre à la migration.
    expect(store.learningErrors.find((e) => e.id === 'e1')).toBeDefined();
  });

  it('survit à un JSON corrompu (readRaw renvoie undefined)', () => {
    global.localStorage.setItem(STORAGE_KEYS.storageMeta, '{not json');
    const raw = readRaw(STORAGE_KEYS.storageMeta);
    expect(raw).toBeUndefined();
    const store = migrateFromRaw(raw);
    expect(store.meta.version).toBe(STORAGE_VERSION);
    expect(store.learningErrors).toEqual([]);
  });

  it('ne perd aucune erreur active pendant une migration valide', () => {
    const base = {
      meta: { version: 1 },
      learningErrors: [makeError('a'), makeError('b'), makeError('c')],
      missions: [],
      mastery: {},
    };
    const store = migrateFromRaw(base, STORAGE_VERSION);
    const active = store.learningErrors.filter((e) => !e.resolvedAt);
    expect(active.length).toBe(3);
  });

  it('simule un quota dépassé → writeRaw échoue sans crash', () => {
    // On force setItem à jeter pour mimer QuotaExceededError.
    const throwing = new MockStorage();
    throwing.setItem = () => {
      throw new Error('QuotaExceededError');
    };
    global.localStorage = throwing as unknown as Storage;
    const ok = writeRaw(STORAGE_KEYS.userProgress, { xp: 10 });
    expect(ok).toBe(false);
  });

  it('borne le nombre d\'erreurs actives à MAX_ACTIVE_ERRORS', () => {
    const errors: LearningError[] = [];
    for (let i = 0; i < 150; i++) errors.push(makeError('e' + i));
    const base = { meta: { version: 1 }, learningErrors: errors, missions: [], mastery: {} };
    const store = migrateFromRaw(base, STORAGE_VERSION);
    const active = store.learningErrors.filter((e) => !e.resolvedAt);
    expect(active.length).toBeLessThanOrEqual(100);
  });
});
