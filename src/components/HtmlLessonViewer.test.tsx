import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import HtmlLessonViewer from './HtmlLessonViewer';

const mockOnClose = vi.fn();
const mockOnNextLesson = vi.fn();

const fakeHtml = `
<!DOCTYPE html>
<html>
<body>
  <div class="lesson-header">Chapter 1</div>
  <section class="card">Phase 1 content</section>
  <section class="card">Phase 2 content</section>
</body>
</html>
`;

vi.mock('../data/lessonHtmlGetters', () => ({
  LESSON_HTML_GETTERS: {
    'phase1_chapitres_1_2': () => Promise.resolve({ default: fakeHtml }),
    'phase2_chapitres_3_4': () => Promise.resolve({ default: fakeHtml }),
    'phase22_chapitres_43_44': () => Promise.resolve({ default: fakeHtml }),
    'phase22_chapitres_43_44_2': () => Promise.resolve({ default: fakeHtml }),
  },
}));

describe('HtmlLessonViewer', () => {
  it('ne montre pas le bouton suivant sur la première phase', async () => {
    render(<HtmlLessonViewer lessonKey="phase1_chapitres_1_2" onClose={mockOnClose} onNextLesson={mockOnNextLesson} />);

    await waitFor(() => {
      expect(screen.getByText('الدرس التفاعلي (HTML)')).toBeDefined();
    });

    expect(screen.queryByText('تابع إلى الدرس التالي')).toBeNull();
  });

  it('montre le bouton suivant sur la dernière phase quand une leçon suivante existe', async () => {
    render(<HtmlLessonViewer lessonKey="phase1_chapitres_1_2" onClose={mockOnClose} onNextLesson={mockOnNextLesson} />);

    await waitFor(() => {
      const iframe = document.querySelector('iframe');
      expect(iframe).toBeTruthy();
      expect(iframe?.getAttribute('srcdoc')).toContain('Phase 1 content');
    });

    const nextPhaseButton = screen.getByRole('button', { name: 'التالية' });
    fireEvent.click(nextPhaseButton);

    await waitFor(() => {
      const buttons = screen.getAllByRole('button');
      const labels = buttons.map(b => b.textContent);
      expect(labels.join(', ')).toContain('تابع إلى الدرس التالي');
    });
  });

  it('clic sur le bouton suivant appelle onNextLesson avec la bonne clé', async () => {
    render(<HtmlLessonViewer lessonKey="phase1_chapitres_1_2" onClose={mockOnClose} onNextLesson={mockOnNextLesson} />);

    await waitFor(() => {
      const iframe = document.querySelector('iframe');
      expect(iframe).toBeTruthy();
      expect(iframe?.getAttribute('srcdoc')).toContain('Phase 1 content');
    });

    const nextPhaseButton = screen.getByRole('button', { name: 'التالية' });
    fireEvent.click(nextPhaseButton);

    await waitFor(() => {
      const buttons = screen.getAllByRole('button');
      const labels = buttons.map(b => b.textContent);
      expect(labels.join(', ')).toContain('تابع إلى الدرس التالي');
    });

    const nextLessonButton = Array.from(screen.getAllByRole('button')).find(b => b.textContent?.includes('تابع إلى الدرس التالي'))!;
    fireEvent.click(nextLessonButton);

    expect(mockOnNextLesson).toHaveBeenCalledWith('phase1_chapitres_1_2_2');
  });

  it('dernière leçon HTML globale : pas de bouton suivant', async () => {
    render(<HtmlLessonViewer lessonKey="phase22_chapitres_43_44" onClose={mockOnClose} onNextLesson={mockOnNextLesson} />);

    await waitFor(() => {
      expect(screen.getByText('الدرس التفاعلي (HTML)')).toBeDefined();
    });

    const buttons = screen.getAllByRole('button');
    const labels = buttons.map(b => b.textContent);
    expect(labels.join(', ')).not.toContain('تابع إلى الدرس التالي');
  });

  it('aucune correction affichée avant interaction', async () => {
    render(<HtmlLessonViewer lessonKey="phase1_chapitres_1_2" onClose={mockOnClose} onNextLesson={mockOnNextLesson} />);

    await waitFor(() => {
      expect(screen.getByText('الدرس التفاعلي (HTML)')).toBeDefined();
    });

    expect(screen.queryByText(/صحّح بالمصحح الحقيقي/)).toBeNull();
  });

  it('affiche la position pédagogique 1/44 pour la première leçon', async () => {
    render(<HtmlLessonViewer lessonKey="phase1_chapitres_1_2" onClose={mockOnClose} onNextLesson={mockOnNextLesson} />);

    await waitFor(() => {
      const iframe = document.querySelector('iframe');
      expect(iframe).toBeTruthy();
      expect(iframe?.getAttribute('srcdoc')).toContain('Phase 1 content');
    });

    expect(screen.getByText('الدرس 1 / 44')).toBeDefined();
  });

  it('affiche la position pédagogique correcte pour une leçon intermédiaire', async () => {
    render(<HtmlLessonViewer lessonKey="phase2_chapitres_3_4" onClose={mockOnClose} onNextLesson={mockOnNextLesson} />);

    await waitFor(() => {
      const iframe = document.querySelector('iframe');
      expect(iframe).toBeTruthy();
      expect(iframe?.getAttribute('srcdoc')).toContain('Phase 1 content');
    });

    expect(screen.getByText('الدرس 3 / 44')).toBeDefined();
  });

  it('affiche 44/44 pour la dernière leçon HTML', async () => {
    render(<HtmlLessonViewer lessonKey="phase22_chapitres_43_44_2" onClose={mockOnClose} onNextLesson={mockOnNextLesson} />);

    await waitFor(() => {
      const iframe = document.querySelector('iframe');
      expect(iframe).toBeTruthy();
      expect(iframe?.getAttribute('srcdoc')).toContain('Phase 1 content');
    });

    expect(screen.getByText('الدرس 44 / 44')).toBeDefined();
  });

  it('n affiche jamais 22/22 dans le viewer HTML', async () => {
    render(<HtmlLessonViewer lessonKey="phase22_chapitres_43_44" onClose={mockOnClose} onNextLesson={mockOnNextLesson} />);

    await waitFor(() => {
      const iframe = document.querySelector('iframe');
      expect(iframe).toBeTruthy();
    });

    expect(screen.queryByText('22 / 22')).toBeNull();
  });
});
