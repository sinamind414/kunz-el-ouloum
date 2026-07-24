// src/lib/lesson/tunnelStateMachine.ts
// State machine pure pour le tunnel de leçon Kunz.
// Aucun appel localStorage, aucun service métier.
// Transitions déterministes — pas d'effets de bord.

export type LessonSessionState =
  | 'MISSION_VISIBLE'
  | 'BLOCKS_IN_PROGRESS'
  | 'EXIT_PRACTICE'
  | 'COMPLETION_VISIBLE'
  | 'SESSION_SUSPENDED';

export type LessonSessionOutcome =
  | 'passed'
  | 'doc_only'
  | 'failed'
  | 'aborted';

export interface LessonSessionData {
  state: LessonSessionState;
  currentBlockIndex: number;
  validatedBlocks: boolean[];
  totalBlocks: number;
  outcome: LessonSessionOutcome | null;
  feedbackViewed: boolean;
}

export type LessonSessionEvent =
  | { type: 'START_LESSON' }
  | { type: 'VALIDATE_BLOCK'; blockIndex: number }
  | { type: 'VIEW_FEEDBACK' }
  | { type: 'SET_OUTCOME'; outcome: LessonSessionOutcome }
  | { type: 'SUSPEND_SESSION' }
  | { type: 'RESUME_SESSION'; currentBlockIndex: number; validatedBlocks: boolean[] }
  | { type: 'EXIT' };

export function createInitialSessionData(totalBlocks: number): LessonSessionData {
  return {
    state: 'MISSION_VISIBLE',
    currentBlockIndex: 0,
    validatedBlocks: Array(totalBlocks).fill(false),
    totalBlocks,
    outcome: null,
    feedbackViewed: false,
  };
}

function allBlocksValidated(data: LessonSessionData): boolean {
  return data.validatedBlocks.every((v) => v);
}

export function tunnelReducer(
  data: LessonSessionData,
  event: LessonSessionEvent,
): LessonSessionData {
  switch (data.state) {
    case 'MISSION_VISIBLE': {
      if (event.type === 'START_LESSON') {
        return { ...data, state: 'BLOCKS_IN_PROGRESS' };
      }
      if (event.type === 'EXIT') {
        return { ...data, outcome: 'aborted' };
      }
      return data;
    }

    case 'BLOCKS_IN_PROGRESS': {
      if (event.type === 'VALIDATE_BLOCK') {
        const idx = event.blockIndex;
        if (idx < 0 || idx >= data.totalBlocks) return data;
        if (data.validatedBlocks[idx]) return data;
        const nextValidated = [...data.validatedBlocks];
        nextValidated[idx] = true;
        const lastBlock = idx === data.totalBlocks - 1;
        if (lastBlock) {
          return {
            ...data,
            validatedBlocks: nextValidated,
            state: 'EXIT_PRACTICE',
            currentBlockIndex: idx,
          };
        }
        return {
          ...data,
          validatedBlocks: nextValidated,
          currentBlockIndex: Math.min(idx + 1, data.totalBlocks - 1),
        };
      }
      if (event.type === 'SUSPEND_SESSION') {
        return { ...data, state: 'SESSION_SUSPENDED' };
      }
      if (event.type === 'EXIT') {
        return { ...data, outcome: 'aborted' };
      }
      return data;
    }

    case 'EXIT_PRACTICE': {
      if (event.type === 'SET_OUTCOME') {
        return { ...data, outcome: event.outcome, state: 'COMPLETION_VISIBLE' };
      }
      if (event.type === 'SUSPEND_SESSION') {
        return { ...data, state: 'SESSION_SUSPENDED' };
      }
      if (event.type === 'EXIT') {
        return { ...data, outcome: data.outcome ?? 'aborted' };
      }
      return data;
    }

    case 'COMPLETION_VISIBLE': {
      if (event.type === 'EXIT') {
        return data;
      }
      return data;
    }

    case 'SESSION_SUSPENDED': {
      if (event.type === 'RESUME_SESSION') {
        const restoredValidated = event.validatedBlocks;
        const restoredIndex = event.currentBlockIndex;
        const nextState = allBlocksValidated({
          ...data,
          validatedBlocks: restoredValidated,
        })
          ? 'EXIT_PRACTICE'
          : 'BLOCKS_IN_PROGRESS';
        return {
          ...data,
          state: nextState,
          currentBlockIndex: restoredIndex,
          validatedBlocks: restoredValidated,
        };
      }
      if (event.type === 'EXIT') {
        return { ...data, outcome: 'aborted' };
      }
      return data;
    }

    default:
      return data;
  }
}

export function canAdvance(data: LessonSessionData): boolean {
  if (data.state !== 'EXIT_PRACTICE') return false;
  if (data.outcome == null) return false;
  if (data.outcome === 'failed' && !data.feedbackViewed) return false;
  return true;
}