// src/lib/lesson/sessionSnapshotService.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import {
  saveSessionSnapshot,
  loadSessionSnapshot,
  clearSessionSnapshot,
  clearAllSnapshots,
  type LessonSessionSnapshot,
} from './sessionSnapshotService';

class MockStorage implements Storage {
  private map = new Map<string, string>();
  get length() { return this.map.size; }
  clear() { this.map.clear(); }
  getItem(k: string) { return this.map.has(k) ? this.map.get(k)! : null; }
  key(i: number) { return Array.from(this.map.keys())[i] ?? null; }
  removeItem(k: string) { this.map.delete(k); }
  setItem(k: string, v: string) { this.map.set(k, String(v)); }
}

beforeEach(() => {
  global.localStorage = new MockStorage() as unknown as Storage;
});

function makeSnapshot(lessonId: string, overrides?: Partial<LessonSessionSnapshot>): LessonSessionSnapshot {
  return {
    lessonId,
    state: 'BLOCKS_IN_PROGRESS',
    currentBlockIndex: 2,
    validatedBlocks: [true, true, false],
    outcome: null,
    feedbackViewed: false,
    suspendedAt: Date.now(),
    ...overrides,
  };
}

describe('sessionSnapshotService', () => {
  it('S1 : session suspendue sauvegardée → recharge au bloc exact', () => {
    const snap = makeSnapshot('lecon_subduction', {
      currentBlockIndex: 2,
      validatedBlocks: [true, true, false],
    });
    const saved = saveSessionSnapshot('lecon_subduction', snap);
    expect(saved).toBe(true);

    const loaded = loadSessionSnapshot('lecon_subduction');
    expect(loaded).not.toBeNull();
    expect(loaded!.lessonId).toBe('lecon_subduction');
    expect(loaded!.currentBlockIndex).toBe(2);
    expect(loaded!.validatedBlocks).toEqual([true, true, false]);
  });

  it('S2 : snapshot leçon A ne charge pas pour leçon B', () => {
    saveSessionSnapshot('lecon_a', makeSnapshot('lecon_a'));
    saveSessionSnapshot('lecon_b', makeSnapshot('lecon_b'));

    const loadedA = loadSessionSnapshot('lecon_a');
    expect(loadedA).not.toBeNull();
    expect(loadedA!.lessonId).toBe('lecon_a');

    const loadedB = loadSessionSnapshot('lecon_b');
    expect(loadedB).not.toBeNull();
    expect(loadedB!.lessonId).toBe('lecon_b');

    // S'assurer qu'il n'y a pas de contamination croisée
    expect(loadedA!.lessonId).not.toBe(loadedB!.lessonId);
  });

  it('S3 : clear leçon A ne supprime pas snapshot leçon B', () => {
    saveSessionSnapshot('lecon_a', makeSnapshot('lecon_a'));
    saveSessionSnapshot('lecon_b', makeSnapshot('lecon_b'));

    clearSessionSnapshot('lecon_a');

    const loadedA = loadSessionSnapshot('lecon_a');
    expect(loadedA).toBeNull();

    const loadedB = loadSessionSnapshot('lecon_b');
    expect(loadedB).not.toBeNull();
    expect(loadedB!.lessonId).toBe('lecon_b');
  });

  it('S4 : JSON localStorage invalide → retourne null sans crash', () => {
    // Écrire directement du JSON invalide dans localStorage
    localStorage.setItem('kunz_lesson_session_v1:corrupted', '{broken json');
    const loaded = loadSessionSnapshot('corrupted');
    expect(loaded).toBeNull();
  });

  it('clearAllSnapshots supprime tous les snapshots', () => {
    saveSessionSnapshot('lecon_a', makeSnapshot('lecon_a'));
    saveSessionSnapshot('lecon_b', makeSnapshot('lecon_b'));
    // Sauvegarder aussi une clé non-snapshot pour vérifier qu'elle survit
    localStorage.setItem('kunz_other_key', 'should survive');

    clearAllSnapshots();

    expect(loadSessionSnapshot('lecon_a')).toBeNull();
    expect(loadSessionSnapshot('lecon_b')).toBeNull();
    expect(localStorage.getItem('kunz_other_key')).toBe('should survive');
  });

  it('snapshot absent → retourne null', () => {
    const loaded = loadSessionSnapshot('inexistante');
    expect(loaded).toBeNull();
  });

  it('sauvegarde et recharge avec outcome présent', () => {
    const snap = makeSnapshot('lecon_test', {
      state: 'COMPLETION_VISIBLE',
      outcome: 'passed',
      feedbackViewed: true,
      validatedBlocks: [true, true, true],
    });
    saveSessionSnapshot('lecon_test', snap);

    const loaded = loadSessionSnapshot('lecon_test');
    expect(loaded).not.toBeNull();
    expect(loaded!.state).toBe('COMPLETION_VISIBLE');
    expect(loaded!.outcome).toBe('passed');
    expect(loaded!.feedbackViewed).toBe(true);
    expect(loaded!.validatedBlocks).toEqual([true, true, true]);
  });
});