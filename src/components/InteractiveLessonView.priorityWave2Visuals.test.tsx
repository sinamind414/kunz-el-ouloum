import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import InteractiveLessonView from './InteractiveLessonView';

const mockSaveLessonSnapshot = vi.fn().mockReturnValue(true);
const mockLoadLessonSnapshot = vi.fn().mockReturnValue(null);
const mockClearLessonSnapshot = vi.fn().mockReturnValue(true);

vi.mock('../lib/lesson/sessionSnapshotService', () => ({
  saveLessonSnapshot: (...args: unknown[]) => mockSaveLessonSnapshot(...args),
  loadLessonSnapshot: (...args: unknown[]) => mockLoadLessonSnapshot(...args),
  clearLessonSnapshot: (...args: unknown[]) => mockClearLessonSnapshot(...args),
}));

vi.mock('../data/lessonGoldSummaries', () => ({
  getLessonGoldSummary: () => undefined,
}));

vi.mock('../data/lessonTransferChallenges', () => ({
  getLessonTransferChallenge: () => undefined,
}));

vi.mock('../utils/telemetryService', () => ({
  logEvent: vi.fn(),
}));

afterEach(cleanup);

beforeEach(() => {
  mockSaveLessonSnapshot.mockClear();
  mockLoadLessonSnapshot.mockClear();
  mockClearLessonSnapshot.mockClear();
  mockLoadLessonSnapshot.mockReturnValue(null);
});

describe('InteractiveLessonView priority wave 2 visuals', () => {
  it('affiche le support canal ligand-dependant dans la lecon synapse', () => {
    render(<InteractiveLessonView lessonId="synapse" onClose={vi.fn()} />);

    expect(screen.getByAltText(/مستقبلات وقنوات مرتبطة بالربيطة على الغشاء بعد المشبكي/)).toBeTruthy();
  });
});
