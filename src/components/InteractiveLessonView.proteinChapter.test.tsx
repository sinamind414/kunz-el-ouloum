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

async function completeMissionChoiceBlocks(user: ReturnType<typeof userEvent.setup>) {
  let block = screen.getByTestId('mission-choice-block-d1-u1-l1-expression-genique-0');
  await user.click(within(block).getByRole('button', { name: /ابدأ من وضعية البريون/ }));
  await user.click(within(block).getByRole('button', { name: 'ابدأ من هذه الزاوية ←' }));

  block = screen.getByTestId('mission-choice-block-d1-u1-l1-expression-genique-1');
  await user.click(within(block).getByRole('button', { name: /ابدأ من سؤال التركيب/ }));
  await user.click(within(block).getByRole('button', { name: 'ابدأ من هذه الزاوية ←' }));
}

async function completeGuidedDocBlock(user: ReturnType<typeof userEvent.setup>) {
  const block = screen.getByTestId('guided-doc-block-d1-u1-l1-expression-genique-2');
  const textareas = within(block).getAllByRole('textbox');

  await user.type(textareas[0], 'نلاحظ مورثات مختلفة وبروتينات مختلفة');
  await user.click(within(block).getAllByRole('button', { name: 'تحقق من الجواب' })[0]);

  await user.type(textareas[1], 'كل مورثة تحمل معلومات بروتين محدد');
  await user.click(within(block).getAllByRole('button', { name: 'تحقق من الجواب' })[1]);

  await user.type(textareas[2], 'التعبير المورثي هو استعمال المعلومات الوراثية في تركيب بروتين');
  await user.click(within(block).getAllByRole('button', { name: 'تحقق من الجواب' })[2]);

  await user.click(within(block).getByRole('button', { name: 'إنهاء هذا الجزء ←' }));
}

async function completeDualEvidenceBlock(user: ReturnType<typeof userEvent.setup>) {
  const block = screen.getByTestId('dual-evidence-block-d1-u1-l1-expression-genique-3');
  const textareas = within(block).getAllByRole('textbox');

  await user.type(textareas[0], 'يتم تركيب البروتين على مستوى الريبوزومات');
  await user.type(textareas[1], 'لأن الإشعاع ظهر في هذه المناطق في الوثيقتين');
  await user.click(within(block).getByRole('button', { name: 'تحقق من الجواب' }));
  await user.click(within(block).getByRole('button', { name: 'إنهاء هذا الجزء ←' }));
}

describe('InteractiveLessonView protein chapter sprint 1', () => {
  it('affiche et valide les deux écrans mission avant le document guidé', async () => {
    const user = userEvent.setup();
    render(<InteractiveLessonView lessonId="d1-u1-l1-expression-genique" onClose={vi.fn()} />);

    let block = screen.getByTestId('mission-choice-block-d1-u1-l1-expression-genique-0');
    expect(within(block).getByText(/كيف يمكن لتغير في بنية بروتين/)).toBeTruthy();
    await user.click(within(block).getByRole('button', { name: /ابدأ من وضعية البريون/ }));
    await user.click(within(block).getByRole('button', { name: 'ابدأ من هذه الزاوية ←' }));

    block = screen.getByTestId('mission-choice-block-d1-u1-l1-expression-genique-1');
    expect(within(block).getByText(/العنكبوت يصنع خيطاً دقيقاً جداً/)).toBeTruthy();
    await user.click(within(block).getByRole('button', { name: /ابدأ من سؤال التركيب/ }));
    await user.click(within(block).getByRole('button', { name: 'ابدأ من هذه الزاوية ←' }));

    expect(screen.getByTestId('guided-doc-block-d1-u1-l1-expression-genique-2')).toBeTruthy();
  });

  it('valide le GuidedDocQaBlock seulement quand toutes les sous-réponses sont correctes', async () => {
    const user = userEvent.setup();
    render(<InteractiveLessonView lessonId="d1-u1-l1-expression-genique" onClose={vi.fn()} />);

    await completeMissionChoiceBlocks(user);

    const block = screen.getByTestId('guided-doc-block-d1-u1-l1-expression-genique-2');
    const textareas = within(block).getAllByRole('textbox');
    const validateButtons = within(block).getAllByRole('button', { name: 'تحقق من الجواب' });

    await user.type(textareas[0], 'نلاحظ مورثات مختلفة وبروتينات مختلفة');
    await user.click(validateButtons[0]);

    expect(within(block).queryByRole('button', { name: 'إنهاء هذا الجزء ←' })).toBeNull();

    await user.type(textareas[1], 'كل مورثة تحمل معلومات بروتين محدد');
    await user.click(validateButtons[1]);
    await user.type(textareas[2], 'التعبير المورثي هو استعمال المعلومات الوراثية في تركيب بروتين');
    await user.click(validateButtons[2]);

    expect(within(block).getByText(/التعبير المورثي هو استعمال المعلومة/)).toBeTruthy();
    expect(within(block).getByRole('button', { name: 'إنهاء هذا الجزء ←' })).toBeTruthy();
  });

  it('exige information + justification dans le DualEvidenceBlock', async () => {
    const user = userEvent.setup();
    render(<InteractiveLessonView lessonId="d1-u1-l1-expression-genique" onClose={vi.fn()} />);

    await completeMissionChoiceBlocks(user);
    await completeGuidedDocBlock(user);

    const block = screen.getByTestId('dual-evidence-block-d1-u1-l1-expression-genique-3');
    const textareas = within(block).getAllByRole('textbox');

    await user.type(textareas[0], 'يتم تركيب البروتين على مستوى الريبوزومات');
    await user.click(within(block).getByRole('button', { name: 'تحقق من الجواب' }));

    expect(within(block).queryByRole('button', { name: 'إنهاء هذا الجزء ←' })).toBeNull();
    expect(within(block).getByText('الإجابة فارغة.')).toBeTruthy();

    await user.type(textareas[1], 'لأن الإشعاع ظهر في هذه المناطق في الوثيقتين');
    await user.click(within(block).getByRole('button', { name: 'تحقق من الجواب' }));

    expect(within(block).getByRole('button', { name: 'إنهاء هذا الجزء ←' })).toBeTruthy();
  }, 10000);

  it('rejette ربما dans le bloc hypothèse/expérience', async () => {
    const user = userEvent.setup();
    render(<InteractiveLessonView lessonId="d1-u1-l1-expression-genique" onClose={vi.fn()} />);

    await completeMissionChoiceBlocks(user);
    await completeGuidedDocBlock(user);
    await completeDualEvidenceBlock(user);

    const block = screen.getByTestId('hypothesis-experiment-block-d1-u1-l1-expression-genique-4');
    const textareas = within(block).getAllByRole('textbox');

    await user.type(textareas[0], 'ربما يوجد جزيء وسيط ينقل المعلومة');
    await user.type(textareas[1], 'المجموعة الثالثة بعد حقن ARN ركبت هيموغلوبين');
    await user.type(textareas[2], 'تؤيد النتائج وجود جزيء وسيط من نوع ARN يوجه تركيب بروتين');
    await user.click(within(block).getByRole('button', { name: 'تحقق من الجواب' }));

    expect(within(block).getByText(/وليس بـ «ربما»/)).toBeTruthy();
    expect(within(block).queryByRole('button', { name: 'إنهاء هذا الجزء ←' })).toBeNull();
  }, 10000);

  it('accepte la nomination ARNm dans le second bloc hypothèse/expérience', async () => {
    const user = userEvent.setup();
    render(<InteractiveLessonView lessonId="d1-u1-l1-expression-genique" onClose={vi.fn()} />);

    await completeMissionChoiceBlocks(user);
    await completeGuidedDocBlock(user);
    await completeDualEvidenceBlock(user);

    let block = screen.getByTestId('hypothesis-experiment-block-d1-u1-l1-expression-genique-4');
    let textareas = within(block).getAllByRole('textbox');
    await user.type(textareas[0], 'نفترض أن جزيء وسيطاً ينقل المعلومة من النواة إلى السيتوبلازم لتركيب البروتين');
    await user.type(textareas[1], 'المجموعة الثالثة بعد حقن ARN ركبت هيموغلوبين');
    await user.type(textareas[2], 'تؤيد النتائج وجود جزيء وسيط من نوع ARN يوجه تركيب بروتين');
    await user.click(within(block).getByRole('button', { name: 'تحقق من الجواب' }));
    await user.click(within(block).getByRole('button', { name: 'إنهاء هذا الجزء ←' }));

    block = screen.getByTestId('hypothesis-experiment-block-d1-u1-l1-expression-genique-5');
    textareas = within(block).getAllByRole('textbox');
    await user.type(textareas[0], 'نفترض أن ARN يحتوي على اليوراسيل وينتقل من النواة إلى السيتوبلازم');
    await user.type(textareas[1], 'يظهر الوسم أولاً في النواة ثم في السيتوبلازم');
    await user.type(textareas[2], 'تتحقق الفرضية لأن ARN ينتقل من النواة إلى السيتوبلازم');
    await user.type(textareas[3], 'ARNm');
    await user.click(within(block).getByRole('button', { name: 'تحقق من الجواب' }));

    expect(within(block).getByText('التسمية صحيحة.')).toBeTruthy();
    expect(within(block).getByRole('button', { name: 'إنهاء هذا الجزء ←' })).toBeTruthy();
  }, 10000);
});
