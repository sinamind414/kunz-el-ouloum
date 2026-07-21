import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import InteractiveLessonView from './InteractiveLessonView';

const recordLessonTransferEvidence = vi.fn();

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
    },
    getLessonProgression: () => undefined,
  };
});

vi.mock('../data/lessonGoldSummaries', () => ({
  getLessonGoldSummary: () => undefined,
}));

vi.mock('../data/lessonTransferChallenges', () => ({
  getLessonTransferChallenge: () => ({
    lessonId: 'd1-u1-l2-transcription',
    conceptId: 'concept_exit_test',
    reflexId: 'analyse',
    titleAr: 'تحدي BAC اختباري',
    contextAr: 'سياق اختباري',
    questionAr: 'سؤال تحدي BAC',
    correctionAr: 'تصحيح اختباري',
    validation: { docType: 'mixed', actionVerb: 'analyse', domain: 'autre' },
  }),
}));

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
    await user.type(screen.getByPlaceholderText('اكتب إجابتك التحليلية هنا…'), 'إجابة BAC صحيحة');
    await user.click(screen.getByRole('button', { name: 'صحّح بالمصحح الحقيقي' }));
    await user.click(screen.getByRole('button', { name: 'إنهاء الممارسة والانتقال' }));

    expect(screen.getByText('أكملت الوثيقة وتحدي BAC بنجاح.')).toBeDefined();
    expect(recordLessonTransferEvidence).toHaveBeenCalledTimes(1);
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
});
