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
  getLessonTransferChallenge: (lessonId: string) => lessonId === 'd1-u1-l2-transcription'
    ? {
      lessonId: 'd1-u1-l2-transcription',
      conceptId: 'transcription',
      reflexId: 'interpret',
      titleAr: 'تحدي BAC اختباري',
      contextAr: 'سياق اختباري',
      questionAr: 'سؤال تحدي BAC',
      correctionAr: 'تصحيح اختباري',
      validation: { docType: 'qualitative', actionVerb: 'interpret', domain: 'genetique' },
    }
    : undefined,
}));

vi.mock('./LiveDocumentUracile', () => ({
  default: () => <section aria-label="document vivant">document vivant</section>,
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

async function completeComparisonBlock(user: ReturnType<typeof userEvent.setup>) {
  const block = screen.getByTestId('comparison-table-block-d1-u1-l2-transcription-0');
  const inputs = within(block).getAllByRole('textbox');

  for (const input of inputs) {
    await user.clear(input);
  }

  await user.type(inputs[0], 'سكر منقوص الأكسجين وهو ريبوز منقوص الأكسجين');
  await user.type(inputs[1], 'سكر ريبوز');
  await user.type(inputs[2], 'A T C G والثايمين');
  await user.type(inputs[3], 'A U C G واليوراسيل');
  await user.type(inputs[4], 'ثنائي من سلسلتين');
  await user.type(inputs[5], 'أحادي من سلسلة واحدة');
  await user.type(inputs[6], 'يحفظ المعلومات الوراثية أي تخزين المعلومة الوراثية');
  await user.type(inputs[7], 'ينقل المعلومة الوراثية وهي نسخة من المعلومة الوراثية');
  await user.type(inputs[8], 'ADN و ARN يختلفان في البنية لكنهما يرتبطان بالمعلومة الوراثية');

  await user.click(within(block).getByRole('button', { name: 'تحقق من المقارنة' }));
  await user.click(within(block).getByRole('button', { name: 'إنهاء هذا الجزء ←' }));
}

async function completeTranscriptionGuidedDoc(user: ReturnType<typeof userEvent.setup>) {
  const block = screen.getByTestId('guided-doc-block-d1-u1-l2-transcription-1');
  const textareas = within(block).getAllByRole('textbox');
  const buttons = within(block).getAllByRole('button', { name: 'تحقق من الجواب' });

  await user.type(textareas[0], 'يُقرأ القالب من 3 إلى 5 ويُركب ARNm من 5 إلى 3');
  await user.click(buttons[0]);
  await user.type(textareas[1], 'يزداد تركيز المثبط ويظهر انخفاض في تشكل ARNm');
  await user.click(buttons[1]);
  await user.type(textareas[2], 'ARN بوليمراز ضروري في الاستنساخ لأن تثبيطه يوقف تشكل ARNm');
  await user.click(buttons[2]);

  await user.click(within(block).getByRole('button', { name: 'إنهاء هذا الجزء ←' }));
}

describe('InteractiveLessonView transcription sprint 2', () => {
  it('valide la comparaison seulement quand les lignes et la conclusion sont complètes', async () => {
    const user = userEvent.setup();
    render(<InteractiveLessonView lessonId="d1-u1-l2-transcription" onClose={vi.fn()} />);

    const block = screen.getByTestId('comparison-table-block-d1-u1-l2-transcription-0');
    const inputs = within(block).getAllByRole('textbox');

    await user.type(inputs[0], 'سكر منقوص الأكسجين');
    await user.type(inputs[1], 'سكر ريبوز');
    await user.click(within(block).getByRole('button', { name: 'تحقق من المقارنة' }));

    expect(within(block).queryByRole('button', { name: 'إنهاء هذا الجزء ←' })).toBeNull();
    expect(within(block).getAllByText(/أضف العناصر الأساسية|جهة ADN|جهة ARN/).length).toBeGreaterThan(0);

    await completeComparisonBlock(user);
    expect(screen.getByTestId('guided-doc-block-d1-u1-l2-transcription-1')).toBeTruthy();
  });

  it('rejette un ordre faux des étapes de الاستنساخ', async () => {
    const user = userEvent.setup();
    render(<InteractiveLessonView lessonId="d1-u1-l2-transcription" onClose={vi.fn()} />);

    await completeComparisonBlock(user);
    await completeTranscriptionGuidedDoc(user);

    const block = screen.getByTestId('sequence-order-block-d1-u1-l2-transcription-2');
    const selects = within(block).getAllByRole('combobox');
    const textarea = within(block).getByRole('textbox');

    await user.selectOptions(selects[0], '2');
    await user.selectOptions(selects[1], '1');
    await user.selectOptions(selects[2], '3');
    await user.selectOptions(selects[3], '4');
    await user.selectOptions(selects[4], '5');
    await user.type(textarea, 'يتثبت ARN بوليمراز على السلسلة القالب ثم يركب ARNm حسب التكامل');
    await user.click(within(block).getByRole('button', { name: 'تحقق من الترتيب' }));

    expect(within(block).getByText('ترتيب المراحل غير صحيح بعد.')).toBeTruthy();
    expect(within(block).queryByRole('button', { name: 'إنهاء هذا الجزء ←' })).toBeNull();
  }, 10000);

  it('valide les deux blocs de séquence et atteint la pratique de sortie', async () => {
    const user = userEvent.setup();
    render(<InteractiveLessonView lessonId="d1-u1-l2-transcription" onClose={vi.fn()} />);

    await completeComparisonBlock(user);
    await completeTranscriptionGuidedDoc(user);

    let block = screen.getByTestId('sequence-order-block-d1-u1-l2-transcription-2');
    let selects = within(block).getAllByRole('combobox');
    let textarea = within(block).getByRole('textbox');

    await user.selectOptions(selects[0], '1');
    await user.selectOptions(selects[1], '2');
    await user.selectOptions(selects[2], '3');
    await user.selectOptions(selects[3], '4');
    await user.selectOptions(selects[4], '5');
    await user.type(textarea, 'يتثبت ARN بوليمراز ثم يستعمل السلسلة القالب ويضيف نيكليوتيدات ARNm حسب التكامل');
    await user.click(within(block).getByRole('button', { name: 'تحقق من الترتيب' }));
    await user.click(within(block).getByRole('button', { name: 'إنهاء هذا الجزء ←' }));

    block = screen.getByTestId('sequence-order-block-d1-u1-l2-transcription-3');
    selects = within(block).getAllByRole('combobox');
    textarea = within(block).getByRole('textbox');

    await user.selectOptions(selects[0], '1');
    await user.selectOptions(selects[1], '2');
    await user.selectOptions(selects[2], '3');
    await user.selectOptions(selects[3], '4');
    await user.type(textarea, 'يتحول ARNm أولي إلى ARNm ناضج أقصر بعد حذف بعض المقاطع');
    await user.click(within(block).getByRole('button', { name: 'تحقق من الترتيب' }));
    await user.click(within(block).getByRole('button', { name: 'إنهاء هذا الجزء ←' }));

    expect(screen.getByLabelText('document vivant')).toBeTruthy();
    expect(screen.getByText('سؤال تحدي BAC')).toBeTruthy();
  });
});
