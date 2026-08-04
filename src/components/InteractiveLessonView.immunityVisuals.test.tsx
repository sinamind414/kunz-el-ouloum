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

describe('InteractiveLessonView immunity visual integration', () => {
  it('affiche les nouveaux supports du lesson soi/non-soi', () => {
    render(<InteractiveLessonView lessonId="immunity_self_nonself" onClose={vi.fn()} />);

    expect(screen.getByText(/فهم كيف تمثل جزيئات HLA \/ CMH بطاقة الهوية المناعية/)).toBeTruthy();
    expect(screen.getByText(/انقر على جزيئات HLA \/ CMH السطحية/)).toBeTruthy();
    expect(screen.getByAltText(/وثيقة حديثة تبين كيف تسمح المحددات السطحية بتحديد الزمرة الدموية/)).toBeTruthy();
    expect(screen.getByAltText(/وثيقة حديثة تقارن بين Rh\+ و Rh−/)).toBeTruthy();
    expect(screen.getByAltText(/بروتينات مدمجة داخل الغشاء البلازمي/)).toBeTruthy();
    expect(screen.getByAltText(/النموذج الفسيفسائي المائع للغشاء/)).toBeTruthy();
    expect(screen.getByAltText(/الغشاء بنية مائعة ديناميكية تسمح بحركة البروتينات السطحية/)).toBeTruthy();
  });

  it('affiche les nouveaux supports du lesson réponse humorale', () => {
    render(<InteractiveLessonView lessonId="immunity_humoral_response" onClose={vi.fn()} />);

    expect(screen.getByText(/الاستجابة الخلطية من لمفاوية B نوعية/)).toBeTruthy();
    expect(screen.getByText(/انقر على اللمفاوية B/)).toBeTruthy();
    expect(screen.getByAltText(/السلاسل الثقيلة والخفيفة وموقعي الارتباط بالمستضد/)).toBeTruthy();
    expect(screen.getByAltText(/خطوط الترسب في الانتشار المناعي المزدوج/)).toBeTruthy();
    expect(screen.getByAltText(/تشكل معقد الهجوم الغشائي بعد تنشيط المتممة/)).toBeTruthy();
  });

  it('affiche les nouveaux supports du lesson réponse cellulaire', () => {
    render(<InteractiveLessonView lessonId="immunity_cellular_response" onClose={vi.fn()} />);

    expect(screen.getByText(/كيف تتعرف اللمفاوية T القاتلة على الخلية الهدف/)).toBeTruthy();
    expect(screen.getByText(/انقر على اللمفاوية T القاتلة/)).toBeTruthy();
    expect(screen.getByAltText(/التكاثر النسيلي وتميز اللمفاويات T بعد التنشيط/)).toBeTruthy();
    expect(screen.getByAltText(/إطلاق perforines و granzymes نحو الخلية الهدف/)).toBeTruthy();
    expect(screen.getByAltText(/تماس نوعي ينجح في الإقصاء وتماس غير نوعي/)).toBeTruthy();
  });

  it('affiche les nouveaux supports du lesson mémoire immunitaire', () => {
    render(<InteractiveLessonView lessonId="immunity_memory_response" onClose={vi.fn()} />);

    expect(screen.getByText(/لماذا تكون الاستجابة الثانوية أسرع وأقوى/)).toBeTruthy();
    expect(screen.getByText(/انقر على الاستجابة الثانوية/)).toBeTruthy();
    expect(screen.getByAltText(/تشكل خلايا ذاكرة بعد التعرض الأول/)).toBeTruthy();
    expect(screen.getByAltText(/أثر الجرعة التذكيرية على شدة الاستجابة المناعية/)).toBeTruthy();
    expect(screen.getByAltText(/إعادة تنشيط خلايا الذاكرة بسرعة عند التعرض الثاني/)).toBeTruthy();
    expect(screen.getByAltText(/تلخص مسار المناعة من التعرف إلى الاستجابة ثم الذاكرة/)).toBeTruthy();
  });
});
