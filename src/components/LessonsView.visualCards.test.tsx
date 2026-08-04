import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import LessonsView from './LessonsView';
import { INITIAL_UNITS } from '../unitCatalog';

afterEach(cleanup);

describe('LessonsView visual cards', () => {
  it('affiche des visuels modernes sur la page lessons et lance le zoom', async () => {
    const user = userEvent.setup();
    render(<LessonsView units={INITIAL_UNITS} onStartLesson={vi.fn()} />);

    expect(screen.getByText('للمبتدئ: ابدأ بالصورة ثم افتح الدرس')).toBeTruthy();
    const image = screen.getAllByAltText(/خيط العنكبوت/)[0];
    expect(image).toBeTruthy();

    await user.click(image);
    expect(screen.getByRole('button', { name: 'Fermer' })).toBeTruthy();
  });

  it('affiche aussi des miniatures avec zoom sur les cartes de domaines et unités', async () => {
    const user = userEvent.setup();
    render(<LessonsView units={INITIAL_UNITS} onStartLesson={vi.fn()} />);

    const domainImage = screen.getByAltText(/صورة حديثة تمثل مدخل تركيب البروتين/);
    expect(domainImage).toBeTruthy();

    await user.click(screen.getAllByRole('button', { name: 'افتح المجال ←' })[0]);

    const unitImage = screen.getByAltText(/خريطة بصرية حديثة تلخص الانتقال من المورثة إلى البروتين الوظيفي/);
    expect(unitImage).toBeTruthy();

    await user.click(unitImage);
    expect(screen.getByRole('button', { name: 'Fermer' })).toBeTruthy();
  });

  it('ouvre le lesson actif depuis une carte visuelle', async () => {
    const user = userEvent.setup();
    const onStartLesson = vi.fn();
    render(<LessonsView units={INITIAL_UNITS} onStartLesson={onStartLesson} />);

    await user.click(screen.getAllByRole('button', { name: 'افتح الدرس ←' })[0]);
    expect(onStartLesson).toHaveBeenCalled();
    expect(onStartLesson).toHaveBeenCalledWith('d1-u1-l1-expression-genique');
  });

  it('affiche des cartes visuelles dans la liste des leçons d’une unité avec zoom et ouverture', async () => {
    const user = userEvent.setup();
    const onStartLesson = vi.fn();
    render(<LessonsView units={INITIAL_UNITS} onStartLesson={onStartLesson} />);

    await user.click(screen.getAllByRole('button', { name: 'افتح المجال ←' })[0]);
    await user.click(screen.getAllByRole('button', { name: 'افتح الوحدة ←' })[0]);

    expect(screen.getByText('قائمة مضغوطة للهاتف: كبّر الصورة بسرعة ثم افتح الدرس من نفس البطاقة.')).toBeTruthy();
    expect(screen.getAllByText('تركيب البروتين').length).toBeGreaterThan(0);

    const activeLessonImage = screen.getByAltText(/صورة افتتاحية حديثة تربط خيط العنكبوت/);
    expect(activeLessonImage).toBeTruthy();

    await user.click(activeLessonImage);
    expect(screen.getByRole('button', { name: 'Fermer' })).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Fermer' }));

    const legacyLessonImage = screen.getAllByAltText(/صورة حديثة تمهيدية تربط سؤال تركيب البروتين بخيط العنكبوت/)[0];
    expect(legacyLessonImage).toBeTruthy();

    await user.click(screen.getAllByRole('button', { name: 'افتح الدرس التفاعلي ←' })[0]);
    expect(onStartLesson).toHaveBeenCalledWith('d1-u1-l1-expression-genique');

    expect(screen.getByText('اختر درسا من القائمة')).toBeTruthy();
    await user.click(screen.getAllByRole('button', { name: 'افتح هذا الدرس ←' })[0]);

    await waitFor(() => {
      expect(screen.queryByText('اختر درسا من القائمة')).toBeNull();
    });
  });
});
