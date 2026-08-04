import { beforeEach, describe, expect, it } from 'vitest';
import { STORAGE_KEYS, type MasteryEvidence, type MasteryRecord } from '../data/store';
import type { Unit, UserProgress } from '../types';
import {
  PROGRESSION_TRANSFER_FORMAT,
  PROGRESSION_TRANSFER_VERSION,
  SNAPSHOT_KEY_PREFIX,
  applyProgressionImport,
  createProgressionExport,
  type ProgressionTransferFile,
  rebuildMastery,
  validateProgressionImport,
} from './progressionTransferService';

class MockStorage implements Storage {
  private map = new Map<string, string>();
  maxCharacters = Number.POSITIVE_INFINITY;

  get length() { return this.map.size; }
  clear() { this.map.clear(); }
  getItem(key: string) { return this.map.get(key) ?? null; }
  key(index: number) { return Array.from(this.map.keys())[index] ?? null; }
  removeItem(key: string) { this.map.delete(key); }
  setItem(key: string, value: string) {
    const next = new Map(this.map);
    next.set(key, String(value));
    const size = Array.from(next, ([storedKey, storedValue]) => storedKey.length + storedValue.length)
      .reduce((total, itemSize) => total + itemSize, 0);
    if (size > this.maxCharacters) throw new DOMException('Quota exceeded', 'QuotaExceededError');
    this.map = next;
  }
}

const progress: UserProgress = {
  xp: 240,
  streak: 4,
  completedUnits: [1],
  completedQuestionsCount: 12,
  studyMinutes: 45,
  flashcardStats: { again: 1, hard: 2, good: 3, easy: 4 },
  quizScoreHistory: [{ date: '27/07/2026', score: 8, total: 10, unitTitle: 'Unité 1' }],
};

const units: Unit[] = [
  { id: 1, title: 'Unité 1', lessonsCount: 2, description: 'Test', progress: 80, isLocked: false, domain: 'D1' },
  { id: 2, title: 'Unité 2', lessonsCount: 2, description: 'Test', progress: 0, isLocked: false, domain: 'D1' },
];

function makeFile(data: Partial<ProgressionTransferFile['data']> = {}): ProgressionTransferFile {
  return {
    format: PROGRESSION_TRANSFER_FORMAT,
    version: PROGRESSION_TRANSFER_VERSION,
    exportedAt: '2026-07-27T10:00:00.000Z',
    data: {
      progress,
      units: [{ id: 1, progress: 80, isLocked: false }],
      learningErrors: [],
      evidences: [],
      mastery: {},
      recalls: [],
      snapshots: [],
      ...data,
    },
  };
}

function storageState(): Record<string, string> {
  const state: Record<string, string> = {};
  for (let index = 0; index < localStorage.length; index++) {
    const key = localStorage.key(index);
    if (key) state[key] = localStorage.getItem(key) ?? '';
  }
  return state;
}

beforeEach(() => {
  global.localStorage = new MockStorage();
});

describe('progressionTransferService', () => {
  it('exporte uniquement la progression autorisée, sans profil ni secrets', () => {
    localStorage.setItem('kunz_user', JSON.stringify({ email: 'eleve@example.com' }));
    localStorage.setItem('sb-project-auth-token', 'super-secret-token');
    localStorage.setItem('telemetry_queue', JSON.stringify([{ private: true }]));
    localStorage.setItem(STORAGE_KEYS.evidences, JSON.stringify([{
      id: 'evidence-1',
      conceptId: 'enzyme',
      dimension: 'knowledge',
      source: 'quiz',
      score: 80,
      createdAt: 1,
      apiKey: 'nested-secret',
    }]));
    localStorage.setItem(`${SNAPSHOT_KEY_PREFIX}lesson-1`, JSON.stringify({
      lessonId: 'lesson-1',
      state: 'SESSION_SUSPENDED',
      currentBlockIndex: 1,
      validatedBlocks: [true, false],
      outcome: null,
      feedbackViewed: false,
      suspendedAt: 1,
    }));

    const contaminatedProgress = { ...progress, authToken: 'progress-secret' } as UserProgress;
    const exported = createProgressionExport(contaminatedProgress, units);
    const serialized = JSON.stringify(exported);

    expect(exported.data.snapshots).toHaveLength(1);
    expect(serialized).not.toContain('eleve@example.com');
    expect(serialized).not.toContain('super-secret-token');
    expect(serialized).not.toContain('telemetry_queue');
    expect(serialized).not.toContain('nested-secret');
    expect(serialized).not.toContain('progress-secret');
    expect(Object.keys(exported.data).sort()).toEqual([
      'editorialOverrides', 'evidences', 'learningErrors', 'mastery', 'progress', 'recalls', 'snapshots', 'units',
    ]);
  });

  it('rejette un JSON invalide, une version inconnue et un contenu hors contrat', () => {
    expect(validateProgressionImport('{broken').ok).toBe(false);
    expect(validateProgressionImport(JSON.stringify({ ...makeFile(), version: 99 })).ok).toBe(false);
    expect(validateProgressionImport(JSON.stringify(makeFile({
      progress: { ...progress, xp: -1 },
    })))).toMatchObject({ ok: false });
  });

  it('rejette les preuves dupliquées pour empêcher une maîtrise artificielle', () => {
    const evidence: MasteryEvidence = {
      id: 'same-evidence',
      conceptId: 'enzyme',
      dimension: 'document',
      source: 'document_analysis',
      score: 90,
      createdAt: 100,
    };
    const result = validateProgressionImport(JSON.stringify(makeFile({
      evidences: [evidence, evidence, evidence],
    })));
    expect(result.ok).toBe(false);
  });

  it('ignore une maîtrise déclarée sans preuves et ne crée aucune fausse réussite', () => {
    const forgedMastery: Record<string, MasteryRecord> = {
      enzyme: {
        conceptId: 'enzyme',
        knowledge: { level: 'mastered', evidenceCount: 99, lastScore: 100 },
        document: { level: 'mastered', evidenceCount: 99, lastScore: 100 },
        methodology: {},
      },
    };
    const result = validateProgressionImport(JSON.stringify(makeFile({ mastery: forgedMastery })));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.preview.masteredCells).toBe(0);
    expect(applyProgressionImport(result.file, units)).toBe(true);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEYS.mastery) ?? '{}')).toEqual({});
  });

  it('reconstruit la maîtrise uniquement après trois preuves réelles dont une production forte', () => {
    const evidences: MasteryEvidence[] = [
      { id: 'e1', conceptId: 'enzyme', dimension: 'document', source: 'quiz', score: 80, createdAt: 1 },
      { id: 'e2', conceptId: 'enzyme', dimension: 'document', source: 'quiz', score: 85, createdAt: 2 },
      { id: 'e3', conceptId: 'enzyme', dimension: 'document', source: 'document_analysis', score: 90, createdAt: 3 },
    ];
    expect(rebuildMastery(evidences).enzyme.document).toMatchObject({ level: 'mastered', evidenceCount: 3 });
  });

  it('remplace les seules données de progression et supprime les anciens snapshots', () => {
    localStorage.setItem('kunz_user', 'profil-conserve');
    localStorage.setItem(STORAGE_KEYS.missions, JSON.stringify([{ id: 'stale' }]));
    localStorage.setItem(`${SNAPSHOT_KEY_PREFIX}old`, JSON.stringify({ lessonId: 'old' }));
    const snapshot = {
      lessonId: 'new',
      state: 'SESSION_SUSPENDED' as const,
      currentBlockIndex: 1,
      validatedBlocks: [true, false],
      outcome: null,
      feedbackViewed: false,
      suspendedAt: 100,
    };
    const file = makeFile({ snapshots: [snapshot], units: [{ id: 1, progress: 95, isLocked: false }] });

    expect(applyProgressionImport(file, units)).toBe(true);
    expect(JSON.parse(localStorage.getItem('svt_progress') ?? '{}').xp).toBe(240);
    expect(JSON.parse(localStorage.getItem('svt_units') ?? '[]')[0].progress).toBe(95);
    expect(localStorage.getItem(`${SNAPSHOT_KEY_PREFIX}old`)).toBeNull();
    expect(JSON.parse(localStorage.getItem(`${SNAPSHOT_KEY_PREFIX}new`) ?? '{}').lessonId).toBe('new');
    expect(localStorage.getItem('kunz_user')).toBe('profil-conserve');
    expect(JSON.parse(localStorage.getItem(STORAGE_KEYS.missions) ?? 'null')).toEqual([]);
  });

  it('refuse une version inconnue avec un message lisible sans aucune mutation du store', () => {
    const storageBefore = storageState();
    const result = validateProgressionImport(JSON.stringify({ ...makeFile(), version: 999 }));
    expect(result.ok).toBe(false);
    expect(result.ok || (result as { ok: false; error: string }).error.toLowerCase()).toContain('version');
    expect(storageState()).toEqual(storageBefore);
  });

  it('import fichier invalide : aucune donnée actuelle supprimée', () => {
    localStorage.setItem('svt_progress', JSON.stringify({ xp: 42 }));
    localStorage.setItem(STORAGE_KEYS.mastery, JSON.stringify({ test: { level: 'mastered' } }));
    const before = storageState();

    expect(applyProgressionImport({} as ProgressionTransferFile, units)).toBe(false);
    expect(applyProgressionImport(null as unknown as ProgressionTransferFile, units)).toBe(false);
    expect(validateProgressionImport('{not json}').ok).toBe(false);
    expect(validateProgressionImport(JSON.stringify({ format: 'wrong' })).ok).toBe(false);
    expect(storageState()).toEqual(before);
  });

  it('conserve toutes les données et efface explicitement les missions après un import valide', () => {
    const evidence: MasteryEvidence = {
      id: 'ev-keep', conceptId: 'enzyme', dimension: 'document',
      source: 'document_analysis', score: 85, createdAt: 100,
    };
    const error = { id: 'err-1', kind: 'knowledge' as const, ruleIds: [], labelAr: 'test',
      count: 2, createdAt: 1, lastSeenAt: 1, reviewStartedAt: 1, reviewStage: 0, nextReviewAt: 2 };
    const recall = { id: 'rec-1', conceptId: 'enzyme', stage: 1 as const,
      nextReviewAt: 1000, createdAt: 100 };
    localStorage.setItem(STORAGE_KEYS.missions, JSON.stringify([{ id: 'M0', status: 'current' }]));
    const file = makeFile({
      evidences: [evidence],
      learningErrors: [error],
      recalls: [recall],
      snapshots: [{
        lessonId: 's1', state: 'SESSION_SUSPENDED' as const,
        currentBlockIndex: 0, validatedBlocks: [false],
        outcome: null, feedbackViewed: false, suspendedAt: 1,
      }],
    });
    expect(applyProgressionImport(file, units)).toBe(true);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEYS.evidences) ?? '[]')).toHaveLength(1);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEYS.learningErrors) ?? '[]')).toHaveLength(1);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEYS.recalls) ?? '[]')).toHaveLength(1);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEYS.missions) ?? 'null')).toEqual([]);
    expect(localStorage.getItem(`${SNAPSHOT_KEY_PREFIX}s1`)).not.toBeNull();
  });

  it('import fichier valide ne duplique aucun RecallItem actif', () => {
    const existingRecall = { id: 'dup-1', conceptId: 'enzyme', stage: 1 as const,
      nextReviewAt: 1000, createdAt: 100 };
    localStorage.setItem(STORAGE_KEYS.recalls, JSON.stringify([existingRecall]));
    const file = makeFile({ recalls: [existingRecall] });
    expect(applyProgressionImport(file, units)).toBe(true);
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.recalls) ?? '[]');
    expect(stored).toHaveLength(1);
    expect(stored[0].id).toBe('dup-1');
  });

  it('restaure exactement le store précédent si une écriture dépasse le quota', () => {
    const storage = localStorage as MockStorage;
    localStorage.setItem('svt_progress', JSON.stringify({ xp: 7 }));
    localStorage.setItem('svt_units', JSON.stringify(units));
    localStorage.setItem(STORAGE_KEYS.mastery, JSON.stringify({ old: true }));
    localStorage.setItem(`${SNAPSHOT_KEY_PREFIX}old`, JSON.stringify({ lessonId: 'old' }));
    localStorage.setItem('kunz_user', 'profil-conserve');
    const before = storageState();
    storage.maxCharacters = Object.entries(before)
      .reduce((total, [key, value]) => total + key.length + value.length, 0) + 20;
    const largeHistory = Array.from({ length: 20 }, (_, index) => ({
      date: String(index), score: 1, total: 1, unitTitle: 'x'.repeat(100),
    }));
    const file = makeFile({ progress: { ...progress, quizScoreHistory: largeHistory } });

    expect(applyProgressionImport(file, units)).toBe(false);
    expect(storageState()).toEqual(before);
  });
});
