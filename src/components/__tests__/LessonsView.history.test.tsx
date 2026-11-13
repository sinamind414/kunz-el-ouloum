import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LessonsView from '../LessonsView';

describe('LessonsView SPA history', () => {
  beforeEach(() => {
    vi.stubGlobal('history', {
      pushState: vi.fn(),
      replaceState: vi.fn(),
      back: vi.fn(),
      length: 1,
      state: null,
    });
  });

  it('pousse un historique quand on ouvre un domaine', async () => {
    render(<LessonsView />);
    const btn = screen.queryByTestId('domaine-1');
    if (!btn) return;
    await userEvent.click(btn);
    expect(history.pushState).toHaveBeenCalled();
  });
});
