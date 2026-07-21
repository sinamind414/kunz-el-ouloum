import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DAY_MS, type RecallItem } from '../data/store';
import SpacedRecallCard from './SpacedRecallCard';

class MockStorage implements Storage {
  private map = new Map<string, string>();
  get length() { return this.map.size; }
  clear() { this.map.clear(); }
  getItem(k: string) { return this.map.has(k) ? this.map.get(k)! : null; }
  key(i: number) { return Array.from(this.map.keys())[i] ?? null; }
  removeItem(k: string) { this.map.delete(k); }
  setItem(k: string, v: string) { this.map.set(k, String(v)); }
}

beforeEach(() => {
  cleanup();
  global.localStorage = new MockStorage() as unknown as Storage;
});

const makeRecall = (overrides?: Partial<RecallItem>): RecallItem => ({
  id: 'recall_test_1',
  conceptId: 'transcription',
  reflexId: 'explain',
  stage: 0,
  nextReviewAt: Date.now() - DAY_MS,
  createdAt: Date.now() - 2 * DAY_MS,
  ...overrides,
});

describe('SpacedRecallCard', () => {
  it('affiche le concept et la question du prompt', () => {
    render(<SpacedRecallCard recall={makeRecall()} onComplete={vi.fn()} />);
    expect(screen.getByText('transcription')).toBeDefined();
    expect(screen.getByText(/في أي اتجاه يُركّب ARNm/)).toBeDefined();
  });

  it('bouton desactive si reponse <8 caracteres', () => {
    render(<SpacedRecallCard recall={makeRecall()} onComplete={vi.fn()} />);
    const btn = screen.getByRole('button', { name: /تحقّق من التذكّر/ });
    expect(btn.hasAttribute('disabled')).toBe(true);
  });

  it('reponse insuffisante → echec + elements attendus affiches', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(<SpacedRecallCard recall={makeRecall()} onComplete={onComplete} />);

    const textarea = screen.getByRole('textbox');
    await user.type(textarea, 'لا أتذكر الإجابة');
    await user.click(screen.getByRole('button', { name: /تحقّق من التذكّر/ }));

    expect(await screen.findByText(/الإجابة غير كافية/)).toBeDefined();
    expect(onComplete).toHaveBeenCalled();
  });

  it('reponse correcte → message de reussite', async () => {
    const user = userEvent.setup();
    render(<SpacedRecallCard recall={makeRecall()} onComplete={vi.fn()} />);

    const textarea = screen.getByRole('textbox');
    await user.type(textarea, 'يُركّب ARNm في الاتجاه 5 إلى 3 على قالب ADN');
    await user.click(screen.getByRole('button', { name: /تحقّق من التذكّر/ }));

    expect(await screen.findByText(/تذكّر صحيح ومثبت بدليل/)).toBeDefined();
  });
});
