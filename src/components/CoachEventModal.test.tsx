import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import CoachEventModal from './CoachEventModal';
import type { CoachEventData } from '../services/coachEvents';

afterEach(cleanup);

describe('CoachEventModal — Coach proactif (V3)', () => {
  it('affiche le message de verrouillage et route l’action choisie', async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    const event: CoachEventData = {
      kind: 'locked_unit',
      tone: 'warn',
      unitId: 2,
      titleAr: 'الوحدة 2 ما زالت مقفلة',
      messageAr: 'عذراً! لا يمكنك القفز إلى الوحدة 2 قبل إتقان « تركيب البروتين ».',
      actions: [
        { id: 'resume', labelAr: 'العودة إلى وحدتك الحالية' },
        { id: 'diagnostic', labelAr: 'اجتز اختباراً تشخيصياً لفتحها الآن', variant: 'ghost' },
      ],
    };

    render(<CoachEventModal event={event} onAction={onAction} />);

    expect(screen.getByTestId('coach-event-modal')).toBeTruthy();
    expect(screen.getByText('الوحدة 2 ما زالت مقفلة')).toBeTruthy();
    expect(screen.getByText(/لا يمكنك القفز إلى الوحدة 2/)).toBeTruthy();

    await user.click(screen.getByRole('button', { name: 'اجتز اختباراً تشخيصياً لفتحها الآن' }));
    expect(onAction).toHaveBeenCalledWith('diagnostic');
  });

  it('affiche le score et les notions faibles après un échec d’examen', () => {
    const event: CoachEventData = {
      kind: 'exam_failed',
      tone: 'warn',
      unitId: 1,
      percent: 50,
      weakTopicsAr: ['مرحلة الاستنساخ', 'مرحلة الترجمة'],
      titleAr: 'لم تنجح بعد — تركيب البروتين',
      messageAr: 'العتبة المطلوبة هي 80%.',
      actions: [{ id: 'review_lesson', labelAr: 'راجع درس الوحدة أولاً' }],
    };

    render(<CoachEventModal event={event} onAction={vi.fn()} />);

    expect(screen.getByText('50%')).toBeTruthy();
    expect(screen.getByText('🎯 راجع هذه النقاط قبل الإعادة:')).toBeTruthy();
    expect(screen.getByText('مرحلة الاستنساخ')).toBeTruthy();
    expect(screen.getByText('مرحلة الترجمة')).toBeTruthy();
  });

  it('célèbre la réussite et l’ouverture de la porte suivante', () => {
    const event: CoachEventData = {
      kind: 'exam_passed',
      tone: 'success',
      unitId: 1,
      titleAr: 'مبروك! أتقنت « تركيب البروتين » 🎉',
      messageAr: 'انكسر قفل الوحدة 2 — واصل التقدم!',
      actions: [{ id: 'next_unit', labelAr: 'ابدأ الوحدة الموالية' }],
    };

    render(<CoachEventModal event={event} onAction={vi.fn()} />);

    expect(screen.getByText('وحدة متقنة!')).toBeTruthy();
    expect(screen.getByText(/انكسر قفل الوحدة 2/)).toBeTruthy();
  });
});
