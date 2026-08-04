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
  getLessonTransferChallenge: (lessonId: string) => lessonId === 'd1-u1-l3-traduction'
    ? {
      lessonId: 'd1-u1-l3-traduction',
      conceptId: 'traduction',
      reflexId: 'explain',
      titleAr: 'تحدي BAC اختباري',
      contextAr: 'سياق اختباري',
      questionAr: 'سؤال تحدي BAC',
      correctionAr: 'تصحيح اختباري',
      validation: { docType: 'qualitative', actionVerb: 'explain', domain: 'genetique' },
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

async function completeReasoningBlock(user: ReturnType<typeof userEvent.setup>) {
  const block = screen.getByTestId('reasoning-count-block-d1-u1-l3-traduction-0');
  await user.click(within(block).getByRole('button', { name: /3 قواعد/ }));
  await user.type(within(block).getByRole('textbox'), '4 ثم 16 ثم 64، لذلك نحتاج ثلاث قواعد');
  await user.click(within(block).getByRole('button', { name: 'تحقق من الاستدلال' }));
  await user.click(within(block).getByRole('button', { name: 'إنهاء هذا الجزء ←' }));
}

async function completeCodonBlock(user: ReturnType<typeof userEvent.setup>) {
  const block = screen.getByTestId('guided-doc-block-d1-u1-l3-traduction-1');
  const textareas = within(block).getAllByRole('textbox');
  const buttons = within(block).getAllByRole('button', { name: 'تحقق من الجواب' });

  await user.type(textareas[0], 'الكودون يوجد على ARNm ومضاد الكودون يوجد على ARNt');
  await user.click(buttons[0]);
  await user.type(textareas[1], 'يضمن التكامل بينهما أن يحمل ARNt الحمض الأميني الصحيح');
  await user.click(buttons[1]);
  await user.type(textareas[2], 'AUG رامزة بداية بينما توجد رامزات توقف');
  await user.click(buttons[2]);

  await user.click(within(block).getByRole('button', { name: 'إنهاء هذا الجزء ←' }));
}

async function completePolysomeBlock(user: ReturnType<typeof userEvent.setup>) {
  const block = screen.getByTestId('guided-doc-block-d1-u1-l3-traduction-3');
  const textareas = within(block).getAllByRole('textbox');
  const buttons = within(block).getAllByRole('button', { name: 'تحقق من الجواب' });

  await user.type(textareas[0], 'يتم تركيب البروتين على مستوى الريبوزومات في الهيولى');
  await user.click(buttons[0]);
  await user.type(textareas[1], 'عدة ريبوزومات تقرأ نفس ARNm مما يؤدي إلى زيادة كمية البروتين');
  await user.click(buttons[1]);

  await user.click(within(block).getByRole('button', { name: 'إنهاء هذا الجزء ←' }));
}

async function completeRibosomeStructureBlock(user: ReturnType<typeof userEvent.setup>) {
  const block = screen.getByTestId('guided-doc-block-d1-u1-l3-traduction-4');
  const textareas = within(block).getAllByRole('textbox');
  const buttons = within(block).getAllByRole('button', { name: 'تحقق من الجواب' });

  await user.type(textareas[0], 'يتكون من تحت وحدة كبرى وتحت وحدة صغرى وله الموقعان A و P');
  await user.click(buttons[0]);
  await user.type(textareas[1], 'يحمل ARNt الحمض الأميني في طرفه والرامزة المضادة في الطرف الآخر');
  await user.click(buttons[1]);

  await user.click(within(block).getByRole('button', { name: 'إنهاء هذا الجزء ←' }));
}

async function completeActivationBlock(user: ReturnType<typeof userEvent.setup>) {
  const block = screen.getByTestId('sequence-order-block-d1-u1-l3-traduction-5');
  const selects = within(block).getAllByRole('combobox');
  const textarea = within(block).getByRole('textbox');

  await user.selectOptions(selects[0], '1');
  await user.selectOptions(selects[1], '2');
  await user.selectOptions(selects[2], '3');
  await user.selectOptions(selects[3], '4');
  await user.type(textarea, 'تحتاج الترجمة إلى ATP وإنزيم نوعي كي يرتبط كل حمض أميني ب ARNt الموافق');
  await user.click(within(block).getByRole('button', { name: 'تحقق من الترتيب' }));
  await user.click(within(block).getByRole('button', { name: 'إنهاء هذا الجزء ←' }));
}

describe('InteractiveLessonView translation sprint 3', () => {
  it('rejette un mauvais choix de nombre de bases', async () => {
    const user = userEvent.setup();
    render(<InteractiveLessonView lessonId="d1-u1-l3-traduction" onClose={vi.fn()} />);

    const block = screen.getByTestId('reasoning-count-block-d1-u1-l3-traduction-0');
    await user.click(within(block).getByRole('button', { name: /2 قواعد/ }));
    await user.type(within(block).getByRole('textbox'), '4 ثم 16 فقط');
    await user.click(within(block).getByRole('button', { name: 'تحقق من الاستدلال' }));

    expect(within(block).getByText(/قاعدة أو قاعدتان لا تكفيان/)).toBeTruthy();
    expect(within(block).queryByRole('button', { name: 'إنهاء هذا الجزء ←' })).toBeNull();
  });

  it('valide le bloc codon/anticodon seulement quand les trois réponses sont correctes', async () => {
    const user = userEvent.setup();
    render(<InteractiveLessonView lessonId="d1-u1-l3-traduction" onClose={vi.fn()} />);

    await completeReasoningBlock(user);

    const block = screen.getByTestId('guided-doc-block-d1-u1-l3-traduction-1');
    const textareas = within(block).getAllByRole('textbox');
    const buttons = within(block).getAllByRole('button', { name: 'تحقق من الجواب' });

    await user.type(textareas[0], 'الكودون يوجد على ARNm');
    await user.click(buttons[0]);

    expect(within(block).queryByRole('button', { name: 'إنهاء هذا الجزء ←' })).toBeNull();

    await user.clear(textareas[0]);
    await user.type(textareas[0], 'الكودون يوجد على ARNm ومضاد الكودون يوجد على ARNt');
    await user.click(buttons[0]);
    await user.type(textareas[1], 'يضمن التكامل بينهما أن يحمل ARNt الحمض الأميني الصحيح');
    await user.click(buttons[1]);
    await user.type(textareas[2], 'AUG رامزة بداية بينما توجد رامزات توقف');
    await user.click(buttons[2]);

    expect(within(block).getByRole('button', { name: 'إنهاء هذا الجزء ←' })).toBeTruthy();
  });

  it('valide les nouveaux blocs machines et activation avant la pratique de sortie', async () => {
    const user = userEvent.setup();
    render(<InteractiveLessonView lessonId="d1-u1-l3-traduction" onClose={vi.fn()} />);

    await completeReasoningBlock(user);
    await completeCodonBlock(user);

    let block = screen.getByTestId('sequence-order-block-d1-u1-l3-traduction-2');
    expect(within(block).getByAltText(/تلخص مراحل الترجمة: انطلاق، استطالة، توقف/)).toBeTruthy();
    expect(within(block).getByAltText(/تجربة تثبت نوعية ارتباط الرامزة مع ARNt الموافق/)).toBeTruthy();
    let selects = within(block).getAllByRole('combobox');
    let textarea = within(block).getByRole('textbox');

    await user.selectOptions(selects[0], '1');
    await user.selectOptions(selects[1], '2');
    await user.selectOptions(selects[2], '3');
    await user.selectOptions(selects[3], '4');
    await user.selectOptions(selects[4], '5');
    await user.selectOptions(selects[5], '6');
    await user.type(textarea, 'يرتبط الريبوزوم ب ARNm ويدخل ARNt ثم تتشكل رابطة ببتيدية حتى رامزة التوقف');
    await user.click(within(block).getByRole('button', { name: 'تحقق من الترتيب' }));
    await user.click(within(block).getByRole('button', { name: 'إنهاء هذا الجزء ←' }));

    await completePolysomeBlock(user);
    block = screen.getByTestId('guided-doc-block-d1-u1-l3-traduction-3');
    expect(within(block).getByAltText(/تتبع البروتين داخل الخلايا من الشبكة الهيولية الخشنة إلى الغولجي/)).toBeTruthy();

    await completeRibosomeStructureBlock(user);
    await completeActivationBlock(user);

    block = screen.getByTestId('sequence-order-block-d1-u1-l3-traduction-6');
    expect(within(block).getByAltText(/خلايا بنكرياسية مفرزة تربط الشبكة الهيولية الخشنة وجهاز غولجي بالإفراز/)).toBeTruthy();
    expect(within(block).getByAltText(/انتقال الوسم البروتيني زمنياً من الشبكة الهيولية إلى الغولجي ثم الحويصلات/)).toBeTruthy();
    selects = within(block).getAllByRole('combobox');
    textarea = within(block).getByRole('textbox');

    await user.selectOptions(selects[0], '1');
    await user.selectOptions(selects[1], '2');
    await user.selectOptions(selects[2], '3');
    await user.selectOptions(selects[3], '4');
    await user.type(textarea, 'ينتقل البروتين من الشبكة الهيولية إلى جهاز غولجي ثم إلى الحويصلات حتى يصل إلى مكان عمله');
    await user.click(within(block).getByRole('button', { name: 'تحقق من الترتيب' }));
    await user.click(within(block).getByRole('button', { name: 'إنهاء هذا الجزء ←' }));

    expect(screen.getByLabelText('document vivant')).toBeTruthy();
    expect(screen.getByText('سؤال تحدي BAC')).toBeTruthy();
  }, 15000);
});
