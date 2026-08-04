import { beforeEach, describe, expect, it } from 'vitest';
import { STORAGE_KEYS } from '../data/store';
import {
  getAllEditorialItems,
  loadReviewOverride,
  setReviewOverride,
  clearReviewOverride,
  clearAllReviewOverrides,
} from './editorialReviewService';

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

describe('editorialReviewService', () => {
  it('retourne tous les éléments éditoriaux avec reviewed: false par défaut', () => {
    const items = getAllEditorialItems();
    expect(items.length).toBeGreaterThan(0);
    const survivalCards = items.filter((i) => i.type === 'survival_card');
    const summaries = items.filter((i) => i.type === 'lesson_summary');
    const documents = items.filter((i) => i.type === 'document_context');
    expect(survivalCards.length).toBe(5);
    expect(summaries.length).toBeGreaterThan(0);
    expect(documents.length).toBeGreaterThan(0);
    expect(items.every((i) => i.reviewed === false)).toBe(true);
  });

  it('setReviewOverride persiste et loadReviewOverride le retrouve', () => {
    const ok = setReviewOverride('survival_card', 'sc_enzymes', {
      reviewed: true,
      reviewedBy: 'Prof. Test',
      reviewedAt: '2026-07-27T10:00:00.000Z',
      sourceProgram: 'BAC DZ',
    });
    expect(ok).toBe(true);

    const loaded = loadReviewOverride('survival_card', 'sc_enzymes');
    expect(loaded).not.toBeNull();
    expect(loaded!.reviewed).toBe(true);
    expect(loaded!.reviewedBy).toBe('Prof. Test');
    expect(loaded!.sourceProgram).toBe('BAC DZ');
  });

  it('clearReviewOverride supprime la clé localStorage', () => {
    setReviewOverride('lesson_summary', 'l1', { reviewed: true });
    expect(loadReviewOverride('lesson_summary', 'l1')).not.toBeNull();
    clearReviewOverride('lesson_summary', 'l1');
    expect(loadReviewOverride('lesson_summary', 'l1')).toBeNull();
  });

  it('clearAllReviewOverrides supprime toutes les clés éditoriales', () => {
    setReviewOverride('survival_card', 'c1', { reviewed: true });
    setReviewOverride('lesson_summary', 'l1', { reviewed: true });
    setReviewOverride('document_context', 'd1', { reviewed: true });
    expect(localStorage.length).toBeGreaterThan(0);
    clearAllReviewOverrides();
    expect(localStorage.length).toBe(0);
  });

  it('getAllEditorialItems reflète les overrides appliqués', () => {
    setReviewOverride('survival_card', 'sc_enzymes', {
      reviewed: true,
      reviewedBy: 'Prof. X',
      sourceProgram: 'BAC DZ',
      reviewedAt: '2026-07-27T10:00:00.000Z',
    });
    const items = getAllEditorialItems();
    const enzyme = items.find((i) => i.id === 'sc_enzymes');
    expect(enzyme).toBeDefined();
    expect(enzyme!.reviewed).toBe(true);
    expect(enzyme!.reviewedBy).toBe('Prof. X');
  });

  it('ne modifie pas les autres clés localStorage', () => {
    localStorage.setItem('kunz_user', 'profil');
    localStorage.setItem(STORAGE_KEYS.evidences, JSON.stringify([{ id: 'ev1' }]));
    setReviewOverride('survival_card', 'sc_enzymes', { reviewed: true });
    expect(localStorage.getItem('kunz_user')).toBe('profil');
    expect(JSON.parse(localStorage.getItem(STORAGE_KEYS.evidences) ?? '[]')).toHaveLength(1);
  });
});
