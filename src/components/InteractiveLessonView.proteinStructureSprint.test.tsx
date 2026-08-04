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

async function completeMission(user: ReturnType<typeof userEvent.setup>) {
  const block = screen.getByTestId('mission-choice-block-protein_structure_function-0');
  await user.click(within(block).getByRole('button', { name: /ابدأ من حالة الهيموغلوبين/ }));
  await user.click(within(block).getByRole('button', { name: 'ابدأ من هذه الزاوية ←' }));
}

async function completeFirstGuided(user: ReturnType<typeof userEvent.setup>) {
  const block = screen.getByTestId('guided-doc-block-protein_structure_function-1');
  const textareas = within(block).getAllByRole('textbox');
  const buttons = within(block).getAllByRole('button', { name: 'تحقق من الجواب' });

  await user.type(textareas[0], 'الوحدة الأساسية هي حمض أميني ولكل حمض أميني مجموعة جانبية');
  await user.click(buttons[0]);
  await user.type(textareas[1], 'البنية الأولية هي تتابع الأحماض الأمينية المرتبطة برابطة ببتيدية');
  await user.click(buttons[1]);
  await user.type(textareas[2], 'تغير حمض أميني واحد قد يغير الطي ثم وظيفة البروتين');
  await user.click(buttons[2]);
  await user.click(within(block).getByRole('button', { name: 'إنهاء هذا الجزء ←' }));
}

async function completeComparison(user: ReturnType<typeof userEvent.setup>) {
  const block = screen.getByTestId('comparison-table-block-protein_structure_function-2');
  const inputs = within(block).getAllByRole('textbox');

  await user.type(inputs[0], 'شكل حلزون لولبي');
  await user.type(inputs[1], 'شكل صفائح مستوية');
  await user.type(inputs[2], 'تثبتها روابط هيدروجينية');
  await user.type(inputs[3], 'تثبتها روابط هيدروجينية');
  await user.type(inputs[4], 'تمثل بنية ثانوية');
  await user.type(inputs[5], 'تمثل بنية ثانوية');
  await user.type(inputs[6], 'البنية الثانوية تشمل شكلين وتثبتها روابط هيدروجينية');

  await user.click(within(block).getByRole('button', { name: 'تحقق من المقارنة' }));
  await user.click(within(block).getByRole('button', { name: 'إنهاء هذا الجزء ←' }));
}

async function completeSecondGuided(user: ReturnType<typeof userEvent.setup>) {
  const block = screen.getByTestId('guided-doc-block-protein_structure_function-3');
  const textareas = within(block).getAllByRole('textbox');
  const buttons = within(block).getAllByRole('button', { name: 'تحقق من الجواب' });

  await user.type(textareas[0], 'من التآثرات روابط هيدروجينية وروابط شاردية');
  await user.click(buttons[0]);
  await user.type(textareas[1], 'هذه تآثرات تثبت البنية الثالثية وتحافظ على الشكل الفراغي');
  await user.click(buttons[1]);
  await user.type(textareas[2], 'الموقع النشط يرتبط بالبنية الثالثية وهو يحدد وظيفة البروتين');
  await user.click(buttons[2]);
  await user.click(within(block).getByRole('button', { name: 'إنهاء هذا الجزء ←' }));
}

async function completeSequence(user: ReturnType<typeof userEvent.setup>) {
  const block = screen.getByTestId('sequence-order-block-protein_structure_function-4');
  const selects = within(block).getAllByRole('combobox');
  const textarea = within(block).getByRole('textbox');

  await user.selectOptions(selects[0], '1');
  await user.selectOptions(selects[1], '2');
  await user.selectOptions(selects[2], '3');
  await user.selectOptions(selects[3], '4');
  await user.type(textarea, 'تبدأ البنية الأولية ثم البنية الثانوية ثم البنية الثالثية وقد تصل إلى البنية الرباعية');
  await user.click(within(block).getByRole('button', { name: 'تحقق من الترتيب' }));
  await user.click(within(block).getByRole('button', { name: 'إنهاء هذا الجزء ←' }));
}

describe('InteractiveLessonView protein structure sprint', () => {
  it('valide la nouvelle séquence de blocs avant la pratique de sortie', async () => {
    const user = userEvent.setup();
    render(<InteractiveLessonView lessonId="protein_structure_function" onClose={vi.fn()} />);

    await completeMission(user);
    await completeFirstGuided(user);
    await completeComparison(user);
    await completeSecondGuided(user);
    await completeSequence(user);

    const block = screen.getByTestId('guided-doc-block-protein_structure_function-5');
    const textareas = within(block).getAllByRole('textbox');
    const buttons = within(block).getAllByRole('button', { name: 'تحقق من الجواب' });

    await user.type(textareas[0], 'نلاحظ شكل منجلي في بعض كريات الدم في الحالة المرضية');
    await user.click(buttons[0]);
    await user.type(textareas[1], 'تغير حمض أميني واحد يمكن أن يغير بنية الهيموغلوبين');
    await user.click(buttons[1]);
    await user.type(textareas[2], 'تغير وظيفة الهيموغلوبين قد يؤدي في النهاية إلى مرض');
    await user.click(buttons[2]);
    await user.click(within(block).getByRole('button', { name: 'إنهاء هذا الجزء ←' }));

    expect(screen.getByLabelText('document vivant')).toBeTruthy();
  }, 15000);
});
