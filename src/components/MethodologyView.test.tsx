import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import MethodologyView from './MethodologyView';

describe('MethodologyView parcours d’entrée', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  beforeEach(() => {
    localStorage.clear();
  });
  it('affiche 3 portes d’entrée puis met en avant la porte débutant', () => {
    render(<MethodologyView />);

    expect(screen.getByTestId('methodology-entry-home')).toBeTruthy();
    expect(screen.getByTestId('methodology-beginner-assimilation')).toBeTruthy();
    expect(screen.getByText(/للمبتدئ: هذا هو ترتيب التعلم داخل التطبيق/)).toBeTruthy();
    expect(screen.getByRole('button', { name: /لا أعرف من أين أبدأ/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /أريد تعلم فعل BAC/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /لدي خطأ أريد إصلاحه/i })).toBeTruthy();

    const primaryDoor = screen.getByTestId('methodology-primary-entry-door');
    expect(within(primaryDoor).getByText('الباب الأول المقترح للمبتدئ')).toBeTruthy();
    expect(within(primaryDoor).getAllByText('ابدأ من هنا أولاً').length).toBeGreaterThan(0);

    const resources = screen.getByTestId('methodology-secondary-resources');
    expect(within(resources).getByText('القوالب المنهجية')).toBeTruthy();
    expect(within(resources).getByText('التدريب التفاعلي')).toBeTruthy();
  });

  it('ouvre un parcours débutant avec ordre pédagogique explicite', async () => {
    const user = userEvent.setup();
    render(<MethodologyView />);

    await user.click(screen.getByRole('button', { name: /لا أعرف من أين أبدأ/i }));

    const steps = screen.getAllByTestId(/journey-step-/);
    expect(steps).toHaveLength(6);
    expect(steps.map((step) => within(step).getByRole('heading').textContent)).toEqual([
      'حلّل',
      'فسّر',
      'قارن',
      'اقترح فرضية',
      'صادق',
      'اشرح / بيّن',
    ]);

    expect(screen.getByText('مهارات مساندة بعد إنهاء المسار')).toBeTruthy();
    expect(screen.getByText('استنتج')).toBeTruthy();
    expect(screen.getByText('علل / برر')).toBeTruthy();
  });

  it('ouvre la porte verbes BAC sans réexposer deduce/justify comme verbes principaux', async () => {
    const user = userEvent.setup();
    render(<MethodologyView />);

    await user.click(screen.getByRole('button', { name: /أريد تعلم فعل BAC/i }));

    expect(screen.getByText('حَلِّلْ')).toBeTruthy();
    expect(screen.getByText('فَسِّرْ')).toBeTruthy();
    expect(screen.getByText('قَارِنْ')).toBeTruthy();
    expect(screen.getByText('اقْتَرِحْ فَرَضِيَّة')).toBeTruthy();
    expect(screen.getByText('اشْرَحْ / بَيِّنْ')).toBeTruthy();
    expect(screen.getByText('صَادِقْ')).toBeTruthy();
    expect(screen.queryByText('اسْتَنْتِجْ')).toBeNull();
    expect(screen.queryByText('عَلِّلْ / بَرِّرْ')).toBeNull();
  });

  it('ouvre la porte correction vers les erreurs fréquentes', async () => {
    const user = userEvent.setup();
    render(<MethodologyView />);

    await user.click(screen.getByRole('button', { name: /لدي خطأ أريد إصلاحه/i }));

    expect(screen.getByText('خلط التحليل بالتفسير')).toBeTruthy();
    expect(screen.getByText('استعمال "ربما" في الفرضية')).toBeTruthy();
  });

  it('propose une micro-reprise ciblée et un lien direct vers la document cible', async () => {
    const user = userEvent.setup();
    const onOpenDocumentExercise = vi.fn();
    render(<MethodologyView onOpenDocumentExercise={onOpenDocumentExercise} />);

    await user.click(screen.getByRole('button', { name: /لدي خطأ أريد إصلاحه/i }));

    const remediation = screen.getByTestId('methodology-remediation-err_analysis_interp');
    expect(remediation).toBeTruthy();
    await user.click(within(remediation).getByRole('button', { name: 'افتح الوثيقة التطبيقية' }));
    expect(onOpenDocumentExercise).toHaveBeenCalledWith('michaelis_courbe');

    await user.click(within(remediation).getByRole('button', { name: 'جرّب التصحيح الآن' }));
    expect(screen.getByText('تدريب منهجي — حلل')).toBeTruthy();
  });

  it('mémorise le retour élève sur une micro-remédiation', async () => {
    const user = userEvent.setup();
    const firstRender = render(<MethodologyView />);

    await user.click(screen.getByRole('button', { name: /لدي خطأ أريد إصلاحه/i }));

    let remediation = screen.getByTestId('methodology-remediation-err_analysis_interp');
    await user.click(within(remediation).getByRole('button', { name: 'مارستها' }));
    expect(within(remediation).getByTestId('methodology-remediation-feedback-err_analysis_interp').textContent).toContain('آخر متابعة: مارستها');

    firstRender.unmount();

    render(<MethodologyView />);
    await user.click(screen.getByRole('button', { name: /لدي خطأ أريد إصلاحه/i }));

    remediation = screen.getByTestId('methodology-remediation-err_analysis_interp');
    expect(within(remediation).getByTestId('methodology-remediation-feedback-err_analysis_interp').textContent).toContain('آخر متابعة: مارستها');

    await user.click(within(remediation).getByRole('button', { name: 'لم أفهم بعد' }));
    expect(within(remediation).getByTestId('methodology-remediation-feedback-err_analysis_interp').textContent).toContain('آخر متابعة: لم أفهم بعد');
    expect(localStorage.getItem('kunz_methodology_remediation_feedback_v1')).toContain('blocked');
  });

  it('personnalise la porte erreur avec tri réel et CTA vers l’erreur la plus urgente', async () => {
    const user = userEvent.setup();
    const onOpenDocumentExercise = vi.fn();
    const now = Date.now();
    localStorage.setItem('kunz_learning_errors_v1', JSON.stringify([
      {
        id: 'real-method-error-active',
        kind: 'methodology',
        conceptId: 'enzymes',
        reflexId: 'analyse',
        ruleIds: ['FORBIDDEN_KULLAMA'],
        labelAr: 'خطأ حقيقي في التحليل',
        count: 3,
        createdAt: now,
        lastSeenAt: now,
        reviewStartedAt: now,
        reviewStage: 0,
        nextReviewAt: now,
      },
      {
        id: 'real-method-error-almost',
        kind: 'methodology',
        conceptId: 'transcription',
        reflexId: 'explain',
        ruleIds: ['MISSING_BLOCKS'],
        labelAr: 'خطأ شبه مصحح',
        count: 1,
        createdAt: now - 2000,
        lastSeenAt: now - 2000,
        reviewStartedAt: now - 2000,
        reviewStage: 2,
        nextReviewAt: now + 1000,
      },
      {
        id: 'real-method-error-recurring',
        kind: 'methodology',
        conceptId: 'enzymes',
        reflexId: 'analyse',
        ruleIds: ['MISSING_RELATION_MARKER'],
        labelAr: 'خطأ يعود باستمرار',
        count: 3,
        createdAt: now - 1500,
        lastSeenAt: now - 1500,
        reviewStartedAt: now - 1500,
        reviewStage: 1,
        nextReviewAt: now + 5000,
      },
      {
        id: 'real-method-error-generic',
        kind: 'methodology',
        conceptId: 'transcription',
        reflexId: 'compare',
        ruleIds: ['UNMAPPED_RULE_CODE'],
        labelAr: 'خطأ نشط جديد',
        count: 1,
        createdAt: now - 1200,
        lastSeenAt: now - 1200,
        reviewStartedAt: now - 1200,
        reviewStage: 0,
        nextReviewAt: now + 8000,
      },
      {
        id: 'real-method-error-corrected',
        kind: 'methodology',
        conceptId: 'transcription',
        reflexId: 'hypothesize',
        ruleIds: ['FORBIDDEN_RUBBAMA'],
        labelAr: 'فرضية تم تصحيحها',
        count: 1,
        createdAt: now - 1000,
        lastSeenAt: now - 1000,
        reviewStartedAt: now - 1000,
        reviewStage: 1,
        nextReviewAt: now - 1000,
        resolvedAt: now - 500,
      },
    ]));

    render(<MethodologyView onOpenDocumentExercise={onOpenDocumentExercise} />);

    await user.click(screen.getByRole('button', { name: /لدي خطأ أريد إصلاحه/i }));

    expect(screen.getByText(/هذه أخطاؤك المنهجية الحقيقية المسجلة في التطبيق/)).toBeTruthy();
    expect(screen.getAllByText(/ظهر هذا الخطأ الحقيقي 3 مرات/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/المراجعة القادمة:/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/درجة التثبيت/).length).toBeGreaterThan(0);
    expect(screen.getByTestId('methodology-urgent-cta')).toBeTruthy();
    expect(screen.getByTestId('methodology-urgency-sections')).toBeTruthy();
    expect(screen.getByTestId('urgency-section-due_today')).toBeTruthy();
    expect(screen.getByTestId('urgency-section-recurring')).toBeTruthy();
    expect(screen.getByTestId('urgency-section-almost_fixed')).toBeTruthy();
    expect(screen.getByTestId('urgency-section-active')).toBeTruthy();
    const sections = screen.getAllByTestId(/urgency-section-/);
    expect(sections.map((section) => within(section).getAllByRole('heading')[0].textContent)).toEqual([
      'مستحقة اليوم',
      'تعود كثيراً',
      'قريبة من التصحيح',
      'نشطة حالياً',
    ]);
    expect(screen.getAllByText(/هش ويحتاج إعادة|قيد التثبيت|يقترب من التثبيت|مستقر/).length).toBeGreaterThan(0);
    await user.click(screen.getByRole('button', { name: 'صحّح الآن الخطأ الأكثر إلحاحاً' }));
    expect(onOpenDocumentExercise).toHaveBeenCalledWith('michaelis_courbe');
    const history = screen.getByTestId('methodology-error-history');
    expect(history).toBeTruthy();
    expect(within(history).getByText('مستقرة بعد التصحيح')).toBeTruthy();
    expect(within(history).getByText('عادت 3 مرات')).toBeTruthy();
    expect(within(history).getByText('قريبة من التصحيح')).toBeTruthy();
    expect(within(history).getAllByText(/درجة التثبيت/).length).toBeGreaterThan(0);
  });

  it('affiche des libellés relatifs et peut masquer les erreurs stabilisées', async () => {
    const user = userEvent.setup();
    const dayMs = 24 * 60 * 60 * 1000;
    const now = Date.now();

    localStorage.setItem('kunz_learning_errors_v1', JSON.stringify([
      {
        id: 'overdue-method-error',
        kind: 'methodology',
        conceptId: 'enzymes',
        reflexId: 'analyse',
        ruleIds: ['FORBIDDEN_KULLAMA'],
        labelAr: 'خطأ فات موعده',
        count: 2,
        createdAt: now - (2 * dayMs),
        lastSeenAt: now - (2 * dayMs),
        reviewStartedAt: now - (2 * dayMs),
        reviewStage: 0,
        nextReviewAt: now - dayMs,
      },
      {
        id: 'future-method-error',
        kind: 'methodology',
        conceptId: 'transcription',
        reflexId: 'compare',
        ruleIds: ['UNMAPPED_RULE_CODE'],
        labelAr: 'خطأ مراجعته بعد 3 أيام',
        count: 1,
        createdAt: now - 1000,
        lastSeenAt: now - 1000,
        reviewStartedAt: now - 1000,
        reviewStage: 0,
        nextReviewAt: now + (3 * dayMs),
      },
      {
        id: 'stabilized-method-error',
        kind: 'methodology',
        conceptId: 'transcription',
        reflexId: 'hypothesize',
        ruleIds: ['FORBIDDEN_RUBBAMA'],
        labelAr: 'فرضية مستقرة',
        count: 1,
        createdAt: now - (5 * dayMs),
        lastSeenAt: now - (4 * dayMs),
        reviewStartedAt: now - (4 * dayMs),
        reviewStage: 2,
        nextReviewAt: now + dayMs,
        resolvedAt: now - (2 * dayMs),
      },
    ]));

    render(<MethodologyView />);

    await user.click(screen.getByRole('button', { name: /لدي خطأ أريد إصلاحه/i }));

    expect(screen.getAllByText('المراجعة القادمة: فات موعدها').length).toBeGreaterThan(0);
    expect(screen.getAllByText('المراجعة القادمة: خلال 3 أيام').length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: 'أخفِ الأخطاء المستقرة' })).toBeTruthy();
    expect(screen.getByText('فرضية مستقرة')).toBeTruthy();

    await user.click(screen.getByRole('button', { name: 'أخفِ الأخطاء المستقرة' }));

    expect(screen.getByRole('button', { name: 'أظهر الأخطاء المستقرة' })).toBeTruthy();
    expect(screen.queryByText('فرضية مستقرة')).toBeNull();
    expect(screen.getByText('خطأ فات موعده')).toBeTruthy();
  });
});
