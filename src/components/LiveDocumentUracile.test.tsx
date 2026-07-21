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

  it('reussite document → onEvidence appelle avec passed:true + evidenceId', async () => {
    const user = userEvent.setup();
    const onEvidence = vi.fn();
    render(<LiveDocumentUracile onEvidence={onEvidence} />);

    const textarea = screen.getByRole('textbox');
    await user.type(textarea, 'ظهور الوسم أولاً في النواة ظهور الوسم لاحقاً في الهيولى انتقال المعلومة عبر ARNm انتقال ARNm المعلومة تنسخ ثم تنقل');
    await user.click(screen.getAllByRole('button', { name: /صحّح بالمصحح الحقيقي/ })[0]);

    expect(await screen.findByText(/أحسنت/)).toBeDefined();
    expect(onEvidence).toHaveBeenCalledTimes(1);
    expect(onEvidence).toHaveBeenCalledWith({
      passed: true,
      evidenceId: expect.any(String),
      errorCreated: false,
    });
  });

  it('echec document → onEvidence appelle avec passed:false + errorCreated:true', async () => {
    const user = userEvent.setup();
    const onEvidence = vi.fn();
    render(<LiveDocumentUracile onEvidence={onEvidence} />);

    const textarea = screen.getByRole('textbox');
    await user.type(textarea, 'اليوراسيل يدخل النواة');
    await user.click(screen.getAllByRole('button', { name: /صحّح بالمصحح الحقيقي/ })[0]);

    expect(await screen.findByText(/نقطة تحتاج إلى مراجعة/)).toBeDefined();
    expect(onEvidence).toHaveBeenCalledTimes(1);
    expect(onEvidence).toHaveBeenCalledWith({
      passed: false,
      evidenceId: undefined,
      errorCreated: true,
    });
  });

  it('reponse incorrecte → echec + elements manquants + micro-remediation', async () => {
    const user = userEvent.setup();
    const onMicro = vi.fn();
    render(<LiveDocumentUracile onOpenMicroRemediation={onMicro} />);

    const textarea = screen.getByRole('textbox');
    await user.type(textarea, 'اليوراسيل يدخل النواة');
    await user.click(screen.getAllByRole('button', { name: /صحّح بالمصحح الحقيقي/ })[0]);

    expect(await screen.findByText(/تم تسجيل نقطة تحتاج إلى مراجعة/)).toBeDefined();
    expect(screen.getByText(/اذكر الملاحظة الأساسية من الوثيقة/)).toBeDefined();
    expect(screen.getByText(/اشرح الآلية العلمية/)).toBeDefined();

    const microBtn = screen.getByRole('button', { name: /ميكرو-تصحيح/ });
    expect(microBtn).toBeDefined();
    await user.click(microBtn);
    expect(onMicro).toHaveBeenCalledWith('mr_arnm_vs_adn');
  });

  it('document synapse → micro-reprise PPSE/seuil', async () => {
    const user = userEvent.setup();
    const onMicro = vi.fn();
    render(<LiveDocumentUracile exerciseId="synapse_integration" onOpenMicroRemediation={onMicro} />);

    const textarea = screen.getByRole('textbox');
    await user.type(textarea, 'PPSE واحد يولد دائماً كمون عمل');
    await user.click(screen.getAllByRole('button', { name: /صحّح بالمصحح الحقيقي/ })[0]);

    expect(await screen.findByText(/تم تسجيل نقطة تحتاج إلى مراجعة/)).toBeDefined();
    const microBtn = screen.getByRole('button', { name: /ميكرو-تصحيح/ });
    expect(microBtn).toBeDefined();
    await user.click(microBtn);
    expect(onMicro).toHaveBeenCalledWith('mr_ppse_ppsi_threshold');
  });

  it('document photosynthese → micro-reprise thylakoïde/stroma', async () => {
    const user = userEvent.setup();
    const onMicro = vi.fn();
    render(<LiveDocumentUracile exerciseId="photosynthese_cycle" onOpenMicroRemediation={onMicro} />);

    const textarea = screen.getByRole('textbox');
    await user.type(textarea, 'التثبيت يحدث في التيلاكويد');
    await user.click(screen.getAllByRole('button', { name: /صحّح بالمصحح الحقيقي/ })[0]);

    expect(await screen.findByText(/تم تسجيل نقطة تحتاج إلى مراجعة/)).toBeDefined();
    const microBtn = screen.getByRole('button', { name: /ميكرو-تصحيح/ });
    expect(microBtn).toBeDefined();
    await user.click(microBtn);
    expect(onMicro).toHaveBeenCalledWith('mr_thylakoide_vs_stroma');
  });

  it('document subduction → micro-reprise eau/adiabasie', async () => {
    const user = userEvent.setup();
    const onMicro = vi.fn();
    render(<LiveDocumentUracile exerciseId="subduction_water_melting" onOpenMicroRemediation={onMicro} />);

    const textarea = screen.getByRole('textbox');
    await user.type(textarea, 'الصفيحة المحيطية تنصهر بالكامل مباشرة');
    await user.click(screen.getAllByRole('button', { name: /صحّح بالمصحح الحقيقي/ })[0]);

    expect(await screen.findByText(/تم تسجيل نقطة تحتاج إلى مراجعة/)).toBeDefined();
    const microBtn = screen.getByRole('button', { name: /ميكرو-تصحيح/ });
    expect(microBtn).toBeDefined();
    await user.click(microBtn);
    expect(onMicro).toHaveBeenCalledWith('mr_subduction_water');
  });

  it('document protein → micro-reprise structure–fonction', async () => {
    const user = userEvent.setup();
    const onMicro = vi.fn();
    render(<LiveDocumentUracile exerciseId="mutation_protein_function" onOpenMicroRemediation={onMicro} />);

    const textarea = screen.getByRole('textbox');
    await user.type(textarea, 'كل طفرة تغير وظيفة البروتين دائماً');
    await user.click(screen.getAllByRole('button', { name: /صحّح بالمصحح الحقيقي/ })[0]);

    expect(await screen.findByText(/تم تسجيل نقطة تحتاج إلى مراجعة/)).toBeDefined();
    const microBtn = screen.getByRole('button', { name: /ميكرو-تصحيح/ });
    expect(microBtn).toBeDefined();
    await user.click(microBtn);
    expect(onMicro).toHaveBeenCalledWith('mr_primary_structure_function');
  });
});
