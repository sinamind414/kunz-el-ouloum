// store.test.ts
// P0.0 — Tests obligatoires de migration (Spec V2 §2.4).
import { describe, it, expect, beforeEach } from 'vitest';
import {
  migrateStore,
  migrateFromRaw,
  readRaw,
  writeRaw,
  recordEvidence,
  loadStore,
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

  it('evidences est [] dans un store vierge', () => {
    const store = migrateStore(undefined, 0, STORAGE_VERSION);
    expect(store.evidences).toEqual([]);
  });

  it('un ancien store migre avec evidences: [] sans supprimer les erreurs', () => {
    const base = {
      meta: { version: 1 },
      learningErrors: [makeError('a')],
      missions: [],
      mastery: {},
    };
    const store = migrateFromRaw(base, STORAGE_VERSION);
    expect(store.evidences).toEqual([]);
    expect(store.learningErrors.find((e) => e.id === 'a')).toBeDefined();
  });

  it('recordEvidence persiste et survit à save/load', () => {
    const evidence = {
      id: 'ev_test_1',
      conceptId: 'unit:3',
      dimension: 'methodology' as const,
      reflexId: 'analyse' as const,
      source: 'lesson_transfer' as const,
      score: 80,
      createdAt: Date.now(),
    };
    const next = recordEvidence(evidence);
    expect(next.evidences.some((e) => e.id === 'ev_test_1')).toBe(true);
    const reloaded = loadStore();
    expect(reloaded.evidences.some((e) => e.id === 'ev_test_1')).toBe(true);
  });

  it('G: recordEvidence met à jour la dimension knowledge', () => {
    const evidence = {
      id: 'ev_k_1',
      conceptId: 'photosynthese',
      dimension: 'knowledge' as const,
      reflexId: 'analyse' as const,
      source: 'quiz' as const,
      score: 85,
      createdAt: Date.now(),
    };
    const next = recordEvidence(evidence);
    const cell = next.mastery['photosynthese'].knowledge;
    expect(cell.evidenceCount).toBe(1);
    expect(cell.lastScore).toBe(85);
  });

  it('G: recordEvidence met à jour la dimension document', () => {
    const evidence = {
      id: 'ev_d_1',
      conceptId: 'enzymes',
      dimension: 'document' as const,
      reflexId: 'interpret' as const,
      source: 'document_analysis' as const,
      score: 82,
      createdAt: Date.now(),
    };
    const next = recordEvidence(evidence);
    const cell = next.mastery['enzymes'].document;
    expect(cell.evidenceCount).toBe(1);
    expect(cell.level).toBe('developing');
  });

  it('G: 3 preuves dont production >=80 → mastered', () => {
    const base = {
      id: 'ev_m',
      conceptId: 'synapse',
      dimension: 'methodology' as const,
      reflexId: 'validate' as const,
      createdAt: Date.now(),
    };
    let store = recordEvidence({ ...base, id: 'ev_m_1', source: 'lesson_transfer' as const, score: 85 });
    store = recordEvidence({ ...base, id: 'ev_m_2', source: 'word_by_word' as const, score: 90 });
    store = recordEvidence({ ...base, id: 'ev_m_3', source: 'lesson_transfer' as const, score: 88 });
    const cell = store.mastery['synapse'].methodology['validate']!;
    expect(cell.evidenceCount).toBe(3);
    expect(cell.level).toBe('mastered');
  });

  it('G: dernier score seul != mastered', () => {
    const evidence = {
      id: 'ev_single',
      conceptId: 'subduction',
      dimension: 'methodology' as const,
      reflexId: 'explain' as const,
      source: 'quiz' as const,
      score: 100,
      createdAt: Date.now(),
    };
    const store = recordEvidence(evidence);
    const cell = store.mastery['subduction'].methodology['explain']!;
    expect(cell.evidenceCount).toBe(1);
    expect(cell.level).not.toBe('mastered');
  });
});
