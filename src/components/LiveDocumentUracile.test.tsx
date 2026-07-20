import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LiveDocumentUracile from './LiveDocumentUracile';

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

describe('LiveDocumentUracile', () => {
  it('affiche le type de document et l objectif', () => {
    render(<LiveDocumentUracile />);
    expect(screen.getByText('وثيقة حية')).toBeDefined();
    expect(screen.getByText(/تفسير مسار ظهور اليوراسيل المشع/)).toBeDefined();
  });

  it('bouton validation desactive si reponse <8 caracteres', () => {
    render(<LiveDocumentUracile />);
    const btn = screen.getAllByRole('button', { name: /صحّح بالمصحح الحقيقي/ })[0];
    expect(btn.hasAttribute('disabled')).toBe(true);
  });

  it('indice apparait au clic', async () => {
    const user = userEvent.setup();
    render(<LiveDocumentUracile />);
    await user.click(screen.getAllByText(/indice/)[0]);
    expect(screen.getByText(/ركّز على كلمتي/)).toBeDefined();
  });

  it('reponse incorrecte → echec + elements manquants + micro-remediation', async () => {
    const user = userEvent.setup();
    const onMicro = vi.fn();
    render(<LiveDocumentUracile onOpenMicroRemediation={onMicro} />);

    const textarea = screen.getByRole('textbox');
    await user.type(textarea, 'اليوراسيل يدخل النواة');
    await user.click(screen.getAllByRole('button', { name: /صحّح بالمصحح الحقيقي/ })[0]);

    expect(await screen.findByText(/تم تسجيل نقطة تحتاج إلى مراجعة/)).toBeDefined();
    expect(screen.getByText(/اذكر ترتيب ظهور الوسم/)).toBeDefined();
    expect(screen.getByText(/اشرح تركيب أو انتقال ARNm/)).toBeDefined();

    const microBtn = screen.getByRole('button', { name: /ميكرو-تصحيح/ });
    expect(microBtn).toBeDefined();
    await user.click(microBtn);
    expect(onMicro).toHaveBeenCalledWith('mr_arnm_vs_adn');
  });
});
