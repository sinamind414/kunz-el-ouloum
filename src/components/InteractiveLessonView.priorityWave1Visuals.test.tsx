import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

describe('InteractiveLessonView priority wave 1 visuals', () => {
  it('affiche les nouveaux supports des deux missions d expression genique', async () => {
    const user = userEvent.setup();
    render(<InteractiveLessonView lessonId="d1-u1-l1-expression-genique" onClose={vi.fn()} />);

    let block = screen.getByTestId('mission-choice-block-d1-u1-l1-expression-genique-0');
    expect(within(block).getByAltText(/الهستولوجيا الإسفنجية المرتبطة بحالة البريون/)).toBeTruthy();
    await user.click(within(block).getByRole('button', { name: /ابدأ من وضعية البريون/ }));
    await user.click(within(block).getByRole('button', { name: 'ابدأ من هذه الزاوية ←' }));

    block = screen.getByTestId('mission-choice-block-d1-u1-l1-expression-genique-1');
    expect(within(block).getByAltText(/بنية الخلية الحيوانية ومسار المعلومة من النواة إلى الهيولى/)).toBeTruthy();
  });

  it('affiche les trois nouveaux supports ARN dans la comparaison transcription', () => {
    render(<InteractiveLessonView lessonId="d1-u1-l2-transcription" onClose={vi.fn()} />);

    const block = screen.getByTestId('comparison-table-block-d1-u1-l2-transcription-0');
    expect(within(block).getByAltText(/تركيب النيكليوتيد الريبوزي/)).toBeTruthy();
    expect(within(block).getByAltText(/ARN سلسلة واحدة تبنى/)).toBeTruthy();
    expect(within(block).getByAltText(/تلخص مكونات ARN ووظيفته الأساسية/)).toBeTruthy();
  });
});
