import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import InteractiveLessonView from './InteractiveLessonView';

const recordLessonTransferEvidence = vi.fn();

const mockSaveLessonSnapshot = vi.fn().mockReturnValue(true);
const mockLoadLessonSnapshot = vi.fn().mockReturnValue(null);
const mockClearLessonSnapshot = vi.fn().mockReturnValue(true);

vi.mock('../lib/lesson/sessionSnapshotService', () => ({
  saveLessonSnapshot: (...args: unknown[]) => mockSaveLessonSnapshot(...args),
  loadLessonSnapshot: (...args: unknown[]) => mockLoadLessonSnapshot(...args),
  clearLessonSnapshot: (...args: unknown[]) => mockClearLessonSnapshot(...args),
}));

vi.mock('../data/activeLessons', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../data/activeLessons')>();
  return {
    ...actual,
    ACTIVE_LESSONS: {
      'd1-u1-l2-transcription': {
        id: 'd1-u1-l2-transcription',
        title: 'درس اختبار الخروج',
        blocks: [
          {
            type: 'TEXT_AND_PRODUCE',
            objective: 'إكمال آخر كتلة',
            content: 'آخر كتلة [____]',
            popups: {},
            microTest: {
              prompt: 'اكتب كلمة العبور',
              acceptedAnswers: ['صحيح'],
              errorHint: 'حاول مجدداً',
            },
          },
        ],
      },
      'phase11_chapitres_21_22': {
        id: 'phase11_chapitres_21_22',
        title: 'درس اختبار التركيب الضوئي',
        blocks: [
          {
            type: 'TEXT_AND_PRODUCE',
            objective: 'إكمال آخر كتبة',
            content: 'آخر كتلة [____]',
            popups: {},
            microTest: {
              prompt: 'اكتب كلمة العبور',
              acceptedAnswers: ['صحيح'],
              errorHint: 'حاول مجدداً',
            },
          },
        ],
      },
      'immunity_self_nonself': {
        id: 'immunity_self_nonself',
        title: 'درس اختبار الذات واللاذات',
        blocks: [
          {
            type: 'TEXT_AND_PRODUCE',
            objective: 'إكمال آخر كتلة',
            content: 'آخر كتلة [____]',
            popups: {},
            microTest: {
              prompt: 'اكتب كلمة العبور',
              acceptedAnswers: ['صحيح'],
              errorHint: 'حاول مجدداً',
            },
          },
        ],
      },
      'immunity_humoral_response': {
        id: 'immunity_humoral_response',
        title: 'درس اختبار الاستجابة الخلطية',
        blocks: [
          {
            type: 'TEXT_AND_PRODUCE',
            objective: 'إكمال آخر كتلة',
            content: 'آخر كتلة [____]',
            popups: {},
            microTest: {
              prompt: 'اكتب كلمة العبور',
              acceptedAnswers: ['صحيح'],
              errorHint: 'حاول مجدداً',
            },
          },
        ],
      },
      'immunity_cellular_response': {
        id: 'immunity_cellular_response',
        title: 'درس اختبار الاستجابة الخلوية',
        blocks: [
          {
            type: 'TEXT_AND_PRODUCE',
            objective: 'إكمال آخر كتلة',
            content: 'آخر كتلة [____]',
            popups: {},
            microTest: {
              prompt: 'اكتب كلمة العبور',
              acceptedAnswers: ['صحيح'],
              errorHint: 'حاول مجدداً',
            },
          },
        ],
      },
      'immunity_memory_response': {
        id: 'immunity_memory_response',
        title: 'درس اختبار الذاكرة المناعية',
        blocks: [
          {
            type: 'TEXT_AND_PRODUCE',
            objective: 'إكمال آخر كتلة',
            content: 'آخر كتلة [____]',
            popups: {},
            microTest: {
              prompt: 'اكتب كلمة العبور',
              acceptedAnswers: ['صحيح'],
              errorHint: 'حاول مجدداً',
            },
          },
        ],
      },
        'seismic_waves': {
          id: 'seismic_waves',
          title: 'درس اختبار الأمواج الزلزالية',
          blocks: [
            {
              type: 'TEXT_AND_PRODUCE',
              objective: 'إكمال آخر كتلة',
              content: 'آخر كتلة [____]',
              popups: {},
              microTest: {
                prompt: 'اكتب كلمة العبور',
                acceptedAnswers: ['صحيح'],
                errorHint: 'حاول مجدداً',
              },
            },
          ],
        },
        'resume_test_lesson': {
          id: 'resume_test_lesson',
          title: 'درس اختبار الاسترجاع',
          blocks: [
            {
              type: 'TEXT_AND_PRODUCE',
              objective: 'الكتلة الأولى',
              content: 'الكتلة الأولى [____]',
              popups: {},
              microTest: {
                prompt: 'اكتب كلمة العبور',
                acceptedAnswers: ['صحيح'],
                errorHint: 'حاول مجدداً',
              },
            },
            {
              type: 'TEXT_AND_PRODUCE',
              objective: 'الكتلة الثانية',
              content: 'الكتبة الثانية [____]',
              popups: {},
              microTest: {
                prompt: 'اكتب كلمة العبور',
                acceptedAnswers: ['صحيح'],
                errorHint: 'حاول مجدداً',
              },
            },
          ],
        },
      },
    getLessonProgression: () => undefined,
  };
});

vi.mock('../data/lessonGoldSummaries', () => ({
  getLessonGoldSummary: () => undefined,
}));

vi.mock('../data/lessonTransferChallenges', async (importOriginal) => {
  // #41 — On conserve la VRAIE implémentation de hasTransferContent : ce
  // garde-fou fait partie du verdict testé ici, le neutraliser reviendrait à
  // tester une version de l'écran que l'élève ne voit jamais.
  const actual =
    await importOriginal<typeof import('../data/lessonTransferChallenges')>();
  return {
    ...actual,
    getLessonTransferChallenge: () => ({
      lessonId: 'd1-u1-l2-transcription',
      conceptId: 'concept_exit_test',
      reflexId: 'analyse',
      titleAr: 'تحدي BAC اختباري',
      contextAr: 'سياق اختباري',
      questionAr: 'سؤال تحدي BAC',
      correctionAr: 'يظهر الوسم في النواة حيث يركب ARNm ثم ينتقل إلى الهيولى.',
      validation: { docType: 'mixed', actionVerb: 'analyse', domain: 'autre' },
    }),
  };
});

vi.mock('../lib/validation/ValidationEngine', () => ({
  validateAnswer: () => ({ passed: true, score: 80, maxScore: 100, errors: [] }),
}));

vi.mock('../services/masteryEvidenceService', () => ({
  recordLessonTransferEvidence: (...args: unknown[]) => recordLessonTransferEvidence(...args),
}));

vi.mock('./LiveDocumentUracile', () => ({
  default: ({ onEvidence }: {
    onEvidence?: (outcome: { passed: boolean; evidenceId?: string; errorCreated: boolean }) => void;
  }) => (
    <section aria-label="document vivant">
      <button onClick={() => onEvidence?.({ passed: true, evidenceId: 'evidence_doc', errorCreated: false })}>
        document réussi
      </button>
      <button onClick={() => onEvidence?.({ passed: false, errorCreated: true })}>
        document insuffisant
      </button>
    </section>
  ),
}));

afterEach(cleanup);

beforeEach(() => {
  recordLessonTransferEvidence.mockClear();
  mockSaveLessonSnapshot.mockClear();
  mockLoadLessonSnapshot.mockClear();
  mockClearLessonSnapshot.mockClear();
  mockLoadLessonSnapshot.mockReturnValue(null);
});

async function completeLastBlock() {
  const user = userEvent.setup();
  await user.type(screen.getByPlaceholderText('اكتب الكلمة السرية هنا...'), 'صحيح');
  await user.click(screen.getByRole('button', { name: 'تحقق' }));
  return user;
}

describe('InteractiveLessonView exit practice', () => {
  it('n affiche la pratique et non CompletionSheet qu apres le dernier bloc', async () => {
    render(<InteractiveLessonView lessonId="d1-u1-l2-transcription" onClose={vi.fn()} />);

    expect(screen.queryByLabelText('document vivant')).toBeNull();
    expect(screen.queryByText('سؤال تحدي BAC')).toBeNull();

    await completeLastBlock();

    expect(screen.getByLabelText('document vivant')).toBeDefined();
    expect(screen.getByText('سؤال تحدي BAC')).toBeDefined();
    expect(screen.getByRole('button', { name: 'إنهاء الممارسة والانتقال' })).toBeDefined();
    expect(screen.queryByText('أكملت الجلسة')).toBeNull();
  });

  it('affiche CompletionSheet passed apres document et BAC reussis', async () => {
    render(<InteractiveLessonView lessonId="d1-u1-l2-transcription" onClose={vi.fn()} />);
    const user = await completeLastBlock();

    await user.click(screen.getByRole('button', { name: 'document réussi' }));
    await user.type(
      screen.getByPlaceholderText('اكتب إجابتك التحليلية هنا…'),
      // #41 — « إجابة BAC صحيحة » ne contient aucune notion du cours et validait
      // pourtant le défi. Vraie réponse d'élève, reformulée sans copier le corrigé.
      'يظهر الوسم اولا في النواه اين يركب arnm ثم ينتقل الى الهيولى',
    );
    await user.click(screen.getByRole('button', { name: 'صحّح بالمصحح الحقيقي' }));
    await user.click(screen.getByRole('button', { name: 'إنهاء الممارسة والانتقال' }));

    expect(screen.getByText('أكملت الوثيقة وتحدي BAC بنجاح.')).toBeDefined();
    expect(recordLessonTransferEvidence).toHaveBeenCalledTimes(1);
  });

  // #41 — Contre-épreuve au niveau de l'ÉCRAN : ValidationEngine est ici mocké
  // « passed:true, 80 % », exactement la situation qui laissait une réponse
  // hors-sujet valider le Défi BAC et enregistrer une preuve de transfert.
  it('une réponse hors-sujet au Défi BAC n’est pas comptée comme réussie', async () => {
    render(<InteractiveLessonView lessonId="d1-u1-l2-transcription" onClose={vi.fn()} />);
    const user = await completeLastBlock();

    await user.click(screen.getByRole('button', { name: 'document réussi' }));
    await user.type(
      screen.getByPlaceholderText('اكتب إجابتك التحليلية هنا…'),
      'كرة القدم رياضة جميلة والطقس حار اليوم في المدينة',
    );
    await user.click(screen.getByRole('button', { name: 'صحّح بالمصحح الحقيقي' }));
    await user.click(screen.getByRole('button', { name: 'إنهاء الممارسة والانتقال' }));

    expect(screen.queryByText('أكملت الوثيقة وتحدي BAC بنجاح.')).toBeNull();
  });

  it('autorise une fin failed apres erreur sans preuve methodologique', async () => {
    render(<InteractiveLessonView lessonId="d1-u1-l2-transcription" onClose={vi.fn()} />);
    const user = await completeLastBlock();

    await user.click(screen.getByRole('button', { name: 'document insuffisant' }));
    fireEvent.click(screen.getByRole('button', { name: 'إنهاء الممارسة والانتقال' }));

    expect(screen.getByText('أنهيت الممارسة مع فكرة تحتاج إلى تثبيت.')).toBeDefined();
    expect(recordLessonTransferEvidence).not.toHaveBeenCalled();
  });

  it('affiche le document vivant photosynthese apres la derniere bloc', async () => {
    render(<InteractiveLessonView lessonId="phase11_chapitres_21_22" onClose={vi.fn()} />);
    await completeLastBlock();

    expect(screen.getByLabelText('document vivant')).toBeDefined();
    expect(screen.getByRole('button', { name: 'إنهاء الممارسة والانتقال' })).toBeDefined();
    expect(screen.queryByText('أكملت الجلسة')).toBeNull();
  });

  it('affiche le document vivant cmh apres la derniere bloc', async () => {
    render(<InteractiveLessonView lessonId="immunity_self_nonself" onClose={vi.fn()} />);
    await completeLastBlock();

    expect(screen.getByLabelText('document vivant')).toBeDefined();
    expect(screen.getByRole('button', { name: 'إنهاء الممارسة والانتقال' })).toBeDefined();
    expect(screen.queryByText('أكملت الجلسة')).toBeNull();
  });

  it('affiche le document vivant reponse humorale apres la derniere bloc', async () => {
    render(<InteractiveLessonView lessonId="immunity_humoral_response" onClose={vi.fn()} />);
    await completeLastBlock();

    expect(screen.getByLabelText('document vivant')).toBeDefined();
    expect(screen.getByRole('button', { name: 'إنهاء الممارسة والانتقال' })).toBeDefined();
    expect(screen.queryByText('أكملت الجلسة')).toBeNull();
  });

  it('affiche le document vivant reponse cellulaire apres la derniere bloc', async () => {
    render(<InteractiveLessonView lessonId="immunity_cellular_response" onClose={vi.fn()} />);
    await completeLastBlock();

    expect(screen.getByLabelText('document vivant')).toBeDefined();
    expect(screen.getByRole('button', { name: 'إنهاء الممارسة والانتقال' })).toBeDefined();
    expect(screen.queryByText('أكملت الجلسة')).toBeNull();
  });

  it('affiche le document vivant memoire apres la derniere bloc', async () => {
    render(<InteractiveLessonView lessonId="immunity_memory_response" onClose={vi.fn()} />);
    await completeLastBlock();

    expect(screen.getByLabelText('document vivant')).toBeDefined();
    expect(screen.getByRole('button', { name: 'إنهاء الممارسة والانتقال' })).toBeDefined();
    expect(screen.queryByText('أكملت الجلسة')).toBeNull();
  });

  it('affiche le document vivant seismic apres la derniere bloc', async () => {
    render(<InteractiveLessonView lessonId="seismic_waves" onClose={vi.fn()} />);
    await completeLastBlock();

    expect(screen.getByLabelText('document vivant')).toBeDefined();
    expect(screen.getByRole('button', { name: 'إنهاء الممارسة والانتقال' })).toBeDefined();
    expect(screen.queryByText('أكملت الجلسة')).toBeNull();
  });
});

describe('InteractiveLessonView session resume', () => {
  it('ouverture avec snapshot suspendu -> proposition de reprise', async () => {
    mockLoadLessonSnapshot.mockReturnValue({
      lessonId: 'resume_test_lesson',
      state: 'SESSION_SUSPENDED',
      currentBlockIndex: 0,
      validatedBlocks: [true, false],
      outcome: null,
      feedbackViewed: false,
      suspendedAt: Date.now(),
    });

    render(<InteractiveLessonView lessonId="resume_test_lesson" onClose={vi.fn()} />);

    expect(screen.getByText('توجد جلسة سابقة لم تكتمل. هل تريد متابعة من حيث توقفت؟')).toBeDefined();
    expect(screen.getByRole('button', { name: 'تابع من حيث توقفت' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'ابدأ من جديد' })).toBeDefined();
  });

  it('continuer -> bloc exact restaure', async () => {
    mockLoadLessonSnapshot.mockReturnValue({
      lessonId: 'resume_test_lesson',
      state: 'SESSION_SUSPENDED',
      currentBlockIndex: 1,
      validatedBlocks: [true, false],
      outcome: null,
      feedbackViewed: false,
      suspendedAt: Date.now(),
    });

    render(<InteractiveLessonView lessonId="resume_test_lesson" onClose={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: 'تابع من حيث توقفت' }));

    expect(screen.getByText('الكتبة الثانية')).toBeDefined();
  });

  it('commencer nouveau -> snapshot ignore/supprime', async () => {
    mockLoadLessonSnapshot.mockReturnValue({
      lessonId: 'resume_test_lesson',
      state: 'SESSION_SUSPENDED',
      currentBlockIndex: 1,
      validatedBlocks: [true, false],
      outcome: null,
      feedbackViewed: false,
      suspendedAt: Date.now(),
    });

    render(<InteractiveLessonView lessonId="resume_test_lesson" onClose={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: 'ابدأ من جديد' }));

    expect(mockClearLessonSnapshot).toHaveBeenCalledWith('resume_test_lesson');
    expect(screen.getByText('1/2')).toBeDefined();
  });

  it('validation bloc -> snapshot actualise', async () => {
    const user = userEvent.setup();
    render(<InteractiveLessonView lessonId="d1-u1-l2-transcription" onClose={vi.fn()} />);

    await user.type(screen.getByPlaceholderText('اكتب الكلمة السرية هنا...'), 'صحيح');
    await user.click(screen.getByRole('button', { name: 'تحقق' }));

    expect(mockSaveLessonSnapshot).toHaveBeenCalledWith(
      'd1-u1-l2-transcription',
      expect.objectContaining({
        lessonId: 'd1-u1-l2-transcription',
        validatedBlocks: [true],
      })
    );
  });

  it('CompletionSheet -> snapshot supprime', async () => {
    const user = userEvent.setup();
    render(<InteractiveLessonView lessonId="d1-u1-l2-transcription" onClose={vi.fn()} />);

    await user.type(screen.getByPlaceholderText('اكتب الكلمة السرية هنا...'), 'صحيح');
    await user.click(screen.getByRole('button', { name: 'تحقق' }));
    await user.click(screen.getByRole('button', { name: 'document réussi' }));
    await user.type(
      screen.getByPlaceholderText('اكتب إجابتك التحليلية هنا…'),
      // #41 — « إجابة BAC صحيحة » ne contient aucune notion du cours et validait
      // pourtant le défi. Vraie réponse d'élève, reformulée sans copier le corrigé.
      'يظهر الوسم اولا في النواه اين يركب arnm ثم ينتقل الى الهيولى',
    );
    await user.click(screen.getByRole('button', { name: 'صحّح بالمصحح الحقيقي' }));
    await user.click(screen.getByRole('button', { name: 'إنهاء الممارسة والانتقال' }));

    expect(mockClearLessonSnapshot).toHaveBeenCalledWith('d1-u1-l2-transcription');
  });

  it('aucune evidence/error/recall creee par snapshot', async () => {
    const user = userEvent.setup();
    render(<InteractiveLessonView lessonId="d1-u1-l2-transcription" onClose={vi.fn()} />);

    await user.type(screen.getByPlaceholderText('اكتب الكلمة السرية هنا...'), 'صحيح');
    await user.click(screen.getByRole('button', { name: 'تحقق' }));

    expect(mockSaveLessonSnapshot).toHaveBeenCalled();
    expect(recordLessonTransferEvidence).not.toHaveBeenCalled();
  });
});
