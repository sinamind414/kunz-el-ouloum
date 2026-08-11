import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import LessonsView from './LessonsView';
import { INITIAL_UNITS } from '../unitCatalog';

// Contrat remplacé (V3) : l'ancienne UI « cartes visuelles zoomables » a été
// remplacée par la grille d'icônes guidée + le verrouillage progressif
// (Gating Engine). Ces tests couvrent donc le catalogue tel qu'il est
// réellement rendu aujourd'hui.

afterEach(cleanup);

describe('LessonsView — catalogue guidé et gating V3', () => {
  it('affiche les 3 domaines du programme + la bibliothèque SVT', () => {
    render(<LessonsView units={INITIAL_UNITS} onStartLesson={vi.fn()} />);
    expect(screen.getByText('الدروس')).toBeTruthy();
    expect(screen.getAllByRole('button', { name: 'افتح المجال ←' })).toHaveLength(3);
    expect(screen.getByText('مكتبة المصطلحات SVT')).toBeTruthy();
  });

  it('verrouille les unités futures et appelle le Coach au clic (Gating)', async () => {
    const user = userEvent.setup();
    const onStartLesson = vi.fn();
    const onLockedUnitClick = vi.fn();

    render(
      <LessonsView
        units={INITIAL_UNITS}
        onStartLesson={onStartLesson}
        onLockedUnitClick={onLockedUnitClick}
      />,
    );

    await user.click(screen.getAllByRole('button', { name: 'افتح المجال ←' })[0]);

    // Unité 1 déverrouillée → accessible ; unités 2..5 verrouillées.
    expect(screen.getAllByRole('button', { name: 'افتح الوحدة ←' })).toHaveLength(1);
    const lockedButtons = screen.getAllByRole('button', { name: '🔒 افتح بعد إتقان الوحدة السابقة' });
    expect(lockedButtons.length).toBe(4);

    await user.click(lockedButtons[0]);
    expect(onLockedUnitClick).toHaveBeenCalledTimes(1);
    expect(onLockedUnitClick).toHaveBeenCalledWith(expect.objectContaining({ id: 2, isLocked: true }));
  });

  it('déverrouille une unité validée et laisse passer le clic', async () => {
    const user = userEvent.setup();
    const onLockedUnitClick = vi.fn();
    const units = INITIAL_UNITS.map((u) => (u.id === 2 ? { ...u, isLocked: false } : u));

    render(
      <LessonsView
        units={units}
        onStartLesson={vi.fn()}
        onLockedUnitClick={onLockedUnitClick}
        validatedUnits={[1]}
      />,
    );

    await user.click(screen.getAllByRole('button', { name: 'افتح المجال ←' })[0]);
    // Unités 1 et 2 ouvertes maintenant.
    expect(screen.getAllByRole('button', { name: 'افتح الوحدة ←' })).toHaveLength(2);
    expect(screen.getByText('✅ متقنة')).toBeTruthy();
  });

  it('lance une leçon active depuis la liste des leçons de l’unité', async () => {
    const user = userEvent.setup();
    const onStartLesson = vi.fn();

    render(<LessonsView units={INITIAL_UNITS} onStartLesson={onStartLesson} />);

    await user.click(screen.getAllByRole('button', { name: 'افتح المجال ←' })[0]);
    await user.click(screen.getByRole('button', { name: 'افتح الوحدة ←' }));

    // Séquence officielle unité 1 : [phase1 (legacy), d1-u1-l1 (active), d1-u1-l2 (active), phase2 (legacy), d1-u1-l3 (active)].
    const lessonButtons = screen.getAllByRole('button', { name: 'افتح هذا الدرس ←' });
    expect(lessonButtons.length).toBe(5);

    await user.click(lessonButtons[1]);
    expect(onStartLesson).toHaveBeenCalledWith('d1-u1-l1-expression-genique');
  });
});
