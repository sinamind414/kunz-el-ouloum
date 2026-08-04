// src/lib/lesson/sessionSnapshotService.ts
// Responsable unique de la persistance localStorage des snapshots de session.
// Snapshot distinct de MasteryEvidence, LearningError et RecallItem.
// Ne crée ni preuve, ni erreur, ni rappel.

import type { LessonSessionState, LessonSessionOutcome } from './tunnelStateMachine';

export interface LessonSessionSnapshot {
  lessonId: string;
  state: LessonSessionState;
  currentBlockIndex: number;
  validatedBlocks: boolean[];
  outcome: LessonSessionOutcome | null;
  feedbackViewed: boolean;
  suspendedAt: number;
}

const SNAPSHOT_KEY_PREFIX = 'kunz_lesson_session_v1:';

function snapshotKey(lessonId: string): string {
  return `${SNAPSHOT_KEY_PREFIX}${lessonId}`;
}

function safeRead<T>(raw: string | null): T | null {
  if (raw == null) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function saveLessonSnapshot(lessonId: string, snapshot: LessonSessionSnapshot): boolean {
  try {
    if (typeof localStorage === 'undefined') return false;
    localStorage.setItem(snapshotKey(lessonId), JSON.stringify(snapshot));
    return true;
  } catch {
    return false;
  }
}

export function loadLessonSnapshot(lessonId: string): LessonSessionSnapshot | null {
  try {
    if (typeof localStorage === 'undefined') return null;
    const raw = localStorage.getItem(snapshotKey(lessonId));
    return safeRead<LessonSessionSnapshot>(raw);
  } catch {
    return null;
  }
}

export function clearLessonSnapshot(lessonId: string): boolean {
  try {
    if (typeof localStorage === 'undefined') return false;
    localStorage.removeItem(snapshotKey(lessonId));
    return true;
  } catch {
    return false;
  }
}

export function clearAllSnapshots(): boolean {
  try {
    if (typeof localStorage === 'undefined') return false;
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(SNAPSHOT_KEY_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    for (const key of keysToRemove) {
      localStorage.removeItem(key);
    }
    return true;
  } catch {
    return false;
  }
}