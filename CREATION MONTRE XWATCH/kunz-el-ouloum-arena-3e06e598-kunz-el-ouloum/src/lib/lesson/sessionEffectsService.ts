// src/lib/lesson/sessionEffectsService.ts
// Point d’entrée unique pour les effets métier déclenchés par le tunnel.
// Aucune règle pédagogique ici : il orchestrate uniquement les services existants.
//
// Contrainte d’idempotence :
// - chaque effet porte un eventId ;
// - un même eventId rejoué ne déclenche pas de doublon.

import { recordLessonTransferEvidence } from '../../services/masteryEvidenceService';
import { recordDocumentTrace } from '../../services/documentEvidenceService';
import { getDocumentPracticeContextByExercise } from '../../data/documentPracticeContexts';
import { saveLessonSnapshot, clearLessonSnapshot } from './sessionSnapshotService';
import type { LessonSessionSnapshot } from './sessionSnapshotService';
import type { LessonSessionData, LessonSessionEvent } from './tunnelStateMachine';
import type { ValidationResult } from '../validation/ValidationEngine';
import type { CoreReflexId } from '../../data/reflexes';

export interface SessionEffect {
  eventId: string;
  type: 'SUBMIT_DOCUMENT_ATTEMPT' | 'SUBMIT_BAC_ATTEMPT' | 'SAVE_SNAPSHOT' | 'CLEAR_SNAPSHOT';
  lessonId: string;
  payload?: {
    exerciseId?: string;
    questionId?: string;
    answer?: string;
    validationResult?: ValidationResult;
    conceptId?: string;
    reflexId?: CoreReflexId;
    ruleIds?: string[];
    score?: number;
    snapshot?: LessonSessionSnapshot;
  };
}

export interface SessionEffectResult {
  eventId: string;
  skipped: boolean;
}

const MAX_PROCESSED_EVENTS = 500;
const processedEventIds = new Set<string>();
const processedEventOrder: string[] = [];

function markProcessed(eventId: string): boolean {
  if (processedEventIds.has(eventId)) {
    return false;
  }
  if (processedEventOrder.length >= MAX_PROCESSED_EVENTS) {
    const oldest = processedEventOrder.shift()!;
    processedEventIds.delete(oldest);
  }
  processedEventIds.add(eventId);
  processedEventOrder.push(eventId);
  return true;
}

export async function runSessionEffects(effects: SessionEffect[]): Promise<SessionEffectResult[]> {
  const results: SessionEffectResult[] = [];
  for (const effect of effects) {
    if (!markProcessed(effect.eventId)) {
      results.push({ eventId: effect.eventId, skipped: true });
      continue;
    }
    applySessionEffect(effect);
    results.push({ eventId: effect.eventId, skipped: false });
  }
  return results;
}

type SnapshotEffectParams =
  | { eventId: string; lessonId: string; action: 'SAVE_SNAPSHOT'; snapshot: LessonSessionSnapshot }
  | { eventId: string; lessonId: string; action: 'CLEAR_SNAPSHOT' };

export function buildSnapshotEffect(params: SnapshotEffectParams): SessionEffect {
  return {
    eventId: params.eventId,
    type: params.action,
    lessonId: params.lessonId,
    payload: params.action === 'SAVE_SNAPSHOT' ? { snapshot: params.snapshot } : undefined,
  };
}

export function buildTransferEvidenceEffect(params: {
  eventId: string;
  lessonId: string;
  conceptId: string;
  reflexId: CoreReflexId;
  score: number;
  ruleIds: string[];
}): SessionEffect {
  return {
    eventId: params.eventId,
    type: 'SUBMIT_BAC_ATTEMPT',
    lessonId: params.lessonId,
    payload: {
      conceptId: params.conceptId,
      reflexId: params.reflexId,
      score: params.score,
      ruleIds: params.ruleIds,
    },
  };
}

export function buildDocumentTraceEffect(params: {
  eventId: string;
  lessonId: string;
  exerciseId: string;
  questionId: string;
  answer: string;
  validationResult: ValidationResult;
}): SessionEffect {
  return {
    eventId: params.eventId,
    type: 'SUBMIT_DOCUMENT_ATTEMPT',
    lessonId: params.lessonId,
    payload: {
      exerciseId: params.exerciseId,
      questionId: params.questionId,
      answer: params.answer,
      validationResult: params.validationResult,
    },
  };
}

export function applySessionEffect(effect: SessionEffect): void {
  switch (effect.type) {
    case 'SUBMIT_DOCUMENT_ATTEMPT': {
      const { payload } = effect;
      if (!payload?.exerciseId || !payload?.answer || !payload?.validationResult) {
        return;
      }
      const context = getDocumentPracticeContextByExercise(payload.exerciseId);
      if (!context) return;
      recordDocumentTrace({
        context,
        answer: payload.answer,
        validationResult: payload.validationResult,
      });
      break;
    }
    case 'SUBMIT_BAC_ATTEMPT': {
      const { lessonId, payload } = effect;
      if (!payload?.conceptId || !payload?.reflexId || typeof payload.score !== 'number') {
        return;
      }
      recordLessonTransferEvidence({
        lessonId,
        conceptId: payload.conceptId,
        reflexId: payload.reflexId,
        score: payload.score,
        ruleIds: payload.ruleIds ?? [],
      });
      break;
    }
    case 'SAVE_SNAPSHOT': {
      const { lessonId, payload } = effect;
      if (!payload?.snapshot) return;
      saveLessonSnapshot(lessonId, payload.snapshot);
      break;
    }
    case 'CLEAR_SNAPSHOT': {
      clearLessonSnapshot(effect.lessonId);
      break;
    }
    default:
      break;
  }
}

export function buildEffectsForEvent(
  event: LessonSessionEvent,
  snapshot: LessonSessionData,
  lessonId: string,
  eventId: string,
): SessionEffect[] {
  switch (event.type) {
    case 'VALIDATE_BLOCK': {
      const snap: LessonSessionSnapshot = {
        lessonId,
        state: snapshot.state,
        currentBlockIndex: snapshot.currentBlockIndex,
        validatedBlocks: snapshot.validatedBlocks,
        outcome: snapshot.outcome,
        feedbackViewed: snapshot.feedbackViewed,
        suspendedAt: Date.now(),
      };
      return [buildSnapshotEffect({ eventId, lessonId, snapshot: snap, action: 'SAVE_SNAPSHOT' })];
    }
    case 'RESUME_SESSION':
    case 'START_LESSON': {
      const snap: LessonSessionSnapshot = {
        lessonId,
        state: snapshot.state,
        currentBlockIndex: snapshot.currentBlockIndex,
        validatedBlocks: snapshot.validatedBlocks,
        outcome: snapshot.outcome,
        feedbackViewed: snapshot.feedbackViewed,
        suspendedAt: Date.now(),
      };
      return [buildSnapshotEffect({ eventId, lessonId, snapshot: snap, action: 'SAVE_SNAPSHOT' })];
    }
    case 'SET_OUTCOME': {
      if (snapshot.state === 'COMPLETION_VISIBLE') {
        return [buildSnapshotEffect({ eventId, lessonId, action: 'CLEAR_SNAPSHOT' })];
      }
      return [];
    }
    case 'SUSPEND_SESSION':
    case 'EXIT': {
      const snap: LessonSessionSnapshot = {
        lessonId,
        state: snapshot.state,
        currentBlockIndex: snapshot.currentBlockIndex,
        validatedBlocks: snapshot.validatedBlocks,
        outcome: snapshot.outcome ?? 'aborted',
        feedbackViewed: snapshot.feedbackViewed,
        suspendedAt: Date.now(),
      };
      return [buildSnapshotEffect({ eventId, lessonId, snapshot: snap, action: 'SAVE_SNAPSHOT' })];
    }
    default:
      return [];
  }
}
