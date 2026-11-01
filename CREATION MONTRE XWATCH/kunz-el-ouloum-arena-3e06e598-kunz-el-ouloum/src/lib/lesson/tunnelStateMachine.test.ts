// src/lib/lesson/tunnelStateMachine.test.ts
import { describe, it, expect } from 'vitest';
import {
  tunnelReducer,
  createInitialSessionData,
  canAdvance,
  type LessonSessionData,
} from './tunnelStateMachine';

describe('createInitialSessionData', () => {
  it('crée un état MISSION_VISIBLE avec le bon nombre de blocs', () => {
    const data = createInitialSessionData(5);
    expect(data.state).toBe('MISSION_VISIBLE');
    expect(data.totalBlocks).toBe(5);
    expect(data.validatedBlocks).toHaveLength(5);
    expect(data.validatedBlocks.every((v) => v === false)).toBe(true);
    expect(data.currentBlockIndex).toBe(0);
    expect(data.outcome).toBeNull();
  });
});

describe('tunnelReducer — MISSION_VISIBLE', () => {
  it('START_LESSON → BLOCKS_IN_PROGRESS', () => {
    const data = createInitialSessionData(3);
    const next = tunnelReducer(data, { type: 'START_LESSON' });
    expect(next.state).toBe('BLOCKS_IN_PROGRESS');
    expect(next.outcome).toBeNull();
  });

  it('EXIT → outcome aborted', () => {
    const data = createInitialSessionData(3);
    const next = tunnelReducer(data, { type: 'EXIT' });
    expect(next.outcome).toBe('aborted');
  });
});

describe('tunnelReducer — BLOCKS_IN_PROGRESS', () => {
  it('T1 : dernier bloc validé → EXIT_PRACTICE, outcome null, pas CompletionSheet', () => {
    const data = { ...createInitialSessionData(2), state: 'BLOCKS_IN_PROGRESS' as const };
    const afterFirst = tunnelReducer(data, { type: 'VALIDATE_BLOCK', blockIndex: 0 });
    expect(afterFirst.state).toBe('BLOCKS_IN_PROGRESS');
    expect(afterFirst.currentBlockIndex).toBe(1);
    expect(afterFirst.validatedBlocks[0]).toBe(true);

    const afterLast = tunnelReducer(afterFirst, { type: 'VALIDATE_BLOCK', blockIndex: 1 });
    expect(afterLast.state).toBe('EXIT_PRACTICE');
    expect(afterLast.outcome).toBeNull();
    expect(afterLast.validatedBlocks[1]).toBe(true);
  });

  it('validation d\'un bloc déjà validé ne change rien', () => {
    const data: LessonSessionData = {
      ...createInitialSessionData(3),
      state: 'BLOCKS_IN_PROGRESS',
      validatedBlocks: [true, false, false],
    };
    const next = tunnelReducer(data, { type: 'VALIDATE_BLOCK', blockIndex: 0 });
    expect(next.validatedBlocks).toEqual([true, false, false]);
  });

  it('SUSPEND_SESSION → SESSION_SUSPENDED', () => {
    const data: LessonSessionData = {
      ...createInitialSessionData(3),
      state: 'BLOCKS_IN_PROGRESS',
    };
    const next = tunnelReducer(data, { type: 'SUSPEND_SESSION' });
    expect(next.state).toBe('SESSION_SUSPENDED');
  });

  it('EXIT → outcome aborted sans preuve', () => {
    const data: LessonSessionData = {
      ...createInitialSessionData(3),
      state: 'BLOCKS_IN_PROGRESS',
    };
    const next = tunnelReducer(data, { type: 'EXIT' });
    expect(next.outcome).toBe('aborted');
  });
});

describe('tunnelReducer — EXIT_PRACTICE', () => {
  it('SET_OUTCOME → COMPLETION_VISIBLE', () => {
    const data: LessonSessionData = {
      ...createInitialSessionData(2),
      state: 'EXIT_PRACTICE',
      validatedBlocks: [true, true],
    };
    const next = tunnelReducer(data, { type: 'SET_OUTCOME', outcome: 'passed' });
    expect(next.state).toBe('COMPLETION_VISIBLE');
    expect(next.outcome).toBe('passed');
  });

  it('SUSPEND_SESSION depuis EXIT_PRACTICE → SESSION_SUSPENDED', () => {
    const data: LessonSessionData = {
      ...createInitialSessionData(2),
      state: 'EXIT_PRACTICE',
      validatedBlocks: [true, true],
    };
    const next = tunnelReducer(data, { type: 'SUSPEND_SESSION' });
    expect(next.state).toBe('SESSION_SUSPENDED');
  });
});

describe('tunnelReducer — SESSION_SUSPENDED', () => {
  it('T5 : SESSION_SUSPEND depuis BLOCKS_IN_PROGRESS → SESSION_SUSPENDED', () => {
    const data: LessonSessionData = {
      ...createInitialSessionData(4),
      state: 'BLOCKS_IN_PROGRESS',
      currentBlockIndex: 2,
      validatedBlocks: [true, true, false, false],
    };
    const suspended = tunnelReducer(data, { type: 'SUSPEND_SESSION' });
    expect(suspended.state).toBe('SESSION_SUSPENDED');
  });

  it('T6 : RESUME_SESSION retourne au BLOCKS_IN_PROGRESS avec les données restaurées', () => {
    const suspended: LessonSessionData = {
      ...createInitialSessionData(4),
      state: 'SESSION_SUSPENDED',
    };
    const resumed = tunnelReducer(suspended, {
      type: 'RESUME_SESSION',
      currentBlockIndex: 2,
      validatedBlocks: [true, true, false, false],
    });
    expect(resumed.state).toBe('BLOCKS_IN_PROGRESS');
    expect(resumed.currentBlockIndex).toBe(2);
    expect(resumed.validatedBlocks).toEqual([true, true, false, false]);
  });

  it('RESUME avec tous les blocs validés → EXIT_PRACTICE', () => {
    const suspended: LessonSessionData = {
      ...createInitialSessionData(3),
      state: 'SESSION_SUSPENDED',
    };
    const resumed = tunnelReducer(suspended, {
      type: 'RESUME_SESSION',
      currentBlockIndex: 2,
      validatedBlocks: [true, true, true],
    });
    expect(resumed.state).toBe('EXIT_PRACTICE');
  });

  it('EXIT depuis suspendu → outcome aborted', () => {
    const data: LessonSessionData = {
      ...createInitialSessionData(3),
      state: 'SESSION_SUSPENDED',
    };
    const next = tunnelReducer(data, { type: 'EXIT' });
    expect(next.outcome).toBe('aborted');
  });
});

describe('tunnelReducer — COMPLETION_VISIBLE', () => {
  it('EXIT reste en COMPLETION_VISIBLE (déjà finalisé)', () => {
    const data: LessonSessionData = {
      ...createInitialSessionData(2),
      state: 'COMPLETION_VISIBLE',
      validatedBlocks: [true, true],
      outcome: 'passed',
    };
    const next = tunnelReducer(data, { type: 'EXIT' });
    expect(next.state).toBe('COMPLETION_VISIBLE');
  });
});

describe('canAdvance', () => {
  it('T2 : failed + feedback non vu → canAdvance = false', () => {
    const data: LessonSessionData = {
      ...createInitialSessionData(2),
      state: 'EXIT_PRACTICE',
      validatedBlocks: [true, true],
      outcome: 'failed',
      feedbackViewed: false,
    };
    expect(canAdvance(data)).toBe(false);
  });

  it('T3 : failed + feedback vu → canAdvance = true', () => {
    const data: LessonSessionData = {
      ...createInitialSessionData(2),
      state: 'EXIT_PRACTICE',
      validatedBlocks: [true, true],
      outcome: 'failed',
      feedbackViewed: true,
    };
    expect(canAdvance(data)).toBe(true);
  });

  it('passed → canAdvance = true', () => {
    const data: LessonSessionData = {
      ...createInitialSessionData(2),
      state: 'EXIT_PRACTICE',
      validatedBlocks: [true, true],
      outcome: 'passed',
      feedbackViewed: false,
    };
    expect(canAdvance(data)).toBe(true);
  });

  it('outcome null → canAdvance = false', () => {
    const data: LessonSessionData = {
      ...createInitialSessionData(2),
      state: 'EXIT_PRACTICE',
      validatedBlocks: [true, true],
      outcome: null,
      feedbackViewed: false,
    };
    expect(canAdvance(data)).toBe(false);
  });
});

describe('T4 : SESSION_EXIT → outcome aborted, pas de preuve ou rappel', () => {
  it('EXIT depuis BLOCKS_IN_PROGRESS → aborted', () => {
    const data: LessonSessionData = {
      ...createInitialSessionData(3),
      state: 'BLOCKS_IN_PROGRESS',
    };
    const next = tunnelReducer(data, { type: 'EXIT' });
    expect(next.outcome).toBe('aborted');
    // Le reducer ne crée ni preuve ni rappel — c'est un contrat respecté par construction.
    expect('evidences' in next).toBe(false);
    expect('recalls' in next).toBe(false);
  });

  it('EXIT depuis MISSION_VISIBLE → aborted', () => {
    const data = createInitialSessionData(3);
    const next = tunnelReducer(data, { type: 'EXIT' });
    expect(next.outcome).toBe('aborted');
  });

  it('EXIT depuis EXIT_PRACTICE sans outcome → aborted', () => {
    const data: LessonSessionData = {
      ...createInitialSessionData(2),
      state: 'EXIT_PRACTICE',
      validatedBlocks: [true, true],
      outcome: null,
      feedbackViewed: false,
    };
    const next = tunnelReducer(data, { type: 'EXIT' });
    expect(next.outcome).toBe('aborted');
  });
});