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
    expect(screen.getByText(/أضف دليلاً من الوثيقة/)).toBeDefined();
    expect(screen.getByText(/اربط الدليل بآلية علمية/)).toBeDefined();

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

  it('document cmh → micro-reprise immunité', async () => {
    const user = userEvent.setup();
    const onMicro = vi.fn();
    render(<LiveDocumentUracile exerciseId="cmh_transplant_compatibility" onOpenMicroRemediation={onMicro} />);

    const textarea = screen.getByRole('textbox');
    await user.type(textarea, 'رفض الطعم يعتمد فقط على فصيلة الدم');
    await user.click(screen.getAllByRole('button', { name: /صحّح بالمصحح الحقيقي/ })[0]);

    expect(await screen.findByText(/تم تسجيل نقطة تحتاج إلى مراجعة/)).toBeDefined();
    const microBtn = screen.getByRole('button', { name: /ميكرو-تصحيح/ });
    expect(microBtn).toBeDefined();
    await user.click(microBtn);
    expect(onMicro).toHaveBeenCalledWith('mr_cmh_self_nonself');
  });

  it('document LB → micro-reprise réponse humorale', async () => {
    const user = userEvent.setup();
    const onMicro = vi.fn();
    render(<LiveDocumentUracile exerciseId="lb_antibody_response" onOpenMicroRemediation={onMicro} />);

    const textarea = screen.getByRole('textbox');
    await user.type(textarea, 'الخلايا اللمفاوية B تفرز الأجسام المضادة مباشرة');
    await user.click(screen.getAllByRole('button', { name: /صحّح بالمصحح الحقيقي/ })[0]);

    expect(await screen.findByText(/تم تسجيل نقطة تحتاج إلى مراجعة/)).toBeDefined();
    const microBtn = screen.getByRole('button', { name: /ميكرو-تصحيح/ });
    expect(microBtn).toBeDefined();
    await user.click(microBtn);
    expect(onMicro).toHaveBeenCalledWith('mr_lb_plasmocyte_antibody');
  });

  it('document LT → micro-reprise réponse cellulaire', async () => {
    const user = userEvent.setup();
    const onMicro = vi.fn();
    render(<LiveDocumentUracile exerciseId="lt_target_cell_response" onOpenMicroRemediation={onMicro} />);

    const textarea = screen.getByRole('textbox');
    await user.type(textarea, 'الاستجابة الخلوية تعتمد على الأجسام المضادة');
    await user.click(screen.getAllByRole('button', { name: /صحّح بالمصحح الحقيقي/ })[0]);

    expect(await screen.findByText(/تم تسجيل نقطة تحتاج إلى مراجعة/)).toBeDefined();
    const microBtn = screen.getByRole('button', { name: /ميكرو-تصحيح/ });
    expect(microBtn).toBeDefined();
    await user.click(microBtn);
    expect(onMicro).toHaveBeenCalledWith('mr_lt_target_cell');
  });

  it('document mémoire → micro-reprise réponse primaire/secondaire', async () => {
    const user = userEvent.setup();
    const onMicro = vi.fn();
    render(<LiveDocumentUracile exerciseId="primary_secondary_response" onOpenMicroRemediation={onMicro} />);

    const textarea = screen.getByRole('textbox');
    await user.type(textarea, 'الاستجابة الثانية هي نفسها الأولى');
    await user.click(screen.getAllByRole('button', { name: /صحّح بالمصحح الحقيقي/ })[0]);

    expect(await screen.findByText(/تم تسجيل نقطة تحتاج إلى مراجعة/)).toBeDefined();
    const microBtn = screen.getByRole('button', { name: /ميكرو-تصحيح/ });
    expect(microBtn).toBeDefined();
    await user.click(microBtn);
    expect(onMicro).toHaveBeenCalledWith('mr_memory_primary_secondary');
  });

  it('document seismic → micro-reprise ondes sismiques', async () => {
    const user = userEvent.setup();
    const onMicro = vi.fn();
    render(<LiveDocumentUracile exerciseId="seismic_p_s_core" onOpenMicroRemediation={onMicro} />);

    const textarea = screen.getByRole('textbox');
    await user.type(textarea, 'الموجات S تنتشر في جميع الوسائط بما فيها السوائل');
    await user.click(screen.getAllByRole('button', { name: /صحّح بالمصحح الحقيقي/ })[0]);

    expect(await screen.findByText(/تم تسجيل نقطة تحتاج إلى مراجعة/)).toBeDefined();
    const microBtn = screen.getByRole('button', { name: /ميكرو-تصحيح/ });
    expect(microBtn).toBeDefined();
    await user.click(microBtn);
    expect(onMicro).toHaveBeenCalledWith('mr_p_s_liquid_core');
  });

  it.each([
    {
      exerciseId: 'cmh_transplant_compatibility',
      observation: /اختلاف المحددات السطحية يؤدي إلى عدم توافق خلوي/,
      prompt: 'فسّر لماذا يقود اختلاف جزيئات CMH بين المعطي والمستقبل إلى رفض الطعم.',
    },
    {
      exerciseId: 'mutation_protein_function',
      observation: /يتغير حمض أميني في السلسلة، فتتغير طية البروتين/,
      prompt: 'فسّر كيف يؤدي تغير حمض أميني واحد إلى تغير وظيفة البروتين.',
    },
    {
      exerciseId: 'lb_antibody_response',
      observation: /ترتفع منطقة γ-غلوبولين في المصل/,
      prompt: 'اشرح كيف يؤدي التعرف النوعي للمستضد إلى تكاثر اللمفاوية B وتمايزها ثم زيادة الأجسام المضادة في المصل.',
    },
    {
      exerciseId: 'lt_target_cell_response',
      observation: /ينخفض عدد الخلايا الهدف الحية فقط عند وجود لمفاويات T نوعية/,
      prompt: 'اشرح كيف يثبت هذا الاختلاف أن اللمفاويات T تتعرف نوعياً على الخلايا المصابة ثم تقصيها.',
    },
    {
      exerciseId: 'primary_secondary_response',
      observation: /بعد الجرعة التذكيرية ترتفع الأجسام المضادة بسرعة أكبر/,
      prompt: 'فسّر لماذا تكون الاستجابة بعد الجرعة التذكيرية أسرع وأقوى مع ربط ذلك بخلايا الذاكرة المناعية.',
    },
    {
      exerciseId: 'seismic_p_s_core',
      observation: /تختفي موجات S عند النواة الخارجية/,
      prompt: 'فسّر لماذا يدل اختفاء الموجات S على سيولة النواة الخارجية.',
    },
  ])('affiche le contenu réel du contexte $exerciseId sans contenu uracile', ({ exerciseId, observation, prompt }) => {
    render(<LiveDocumentUracile exerciseId={exerciseId} />);

    expect(screen.getByText(observation)).toBeDefined();
    expect(screen.getByPlaceholderText(prompt)).toBeDefined();
    expect(screen.queryByText(/ARNm/)).toBeNull();
    expect(screen.queryByText(/اليوراسيل/)).toBeNull();
    expect(screen.queryByText(/الهيولى/)).toBeNull();
  });

  it.each([
    {
      exerciseId: 'mutation_protein_function',
      alts: [
        /يؤدي استبدال حمض أميني واحد إلى تغير بنية الهيموغلوبين/,
        /الحمض الأميني وحدة بناء لها مجموعة جانبية مميزة/,
        /تبين المستويات الثانوية للبروتينات/,
        /تآثرات تثبيت البنية الفراغية/,
        /بعض البروتينات تعتمد أيضاً على بنية رباعية/,
        /تلخص المستويات الأربعة لبنية البروتين/,
        /تغير السلسلة قد يغير مسار الطي نفسه/,
        /شبيهة بمقارنة Anagène تبين اختلافاً موضعياً بين تسلسلين/,
        /شبيهة بصف متعدد للتسلسلات تبين الموضع المختلف/,
      ],
      zoomButtons: 9,
    },
    {
      exerciseId: 'codon_anticodon',
      alts: [
        /الارتباط النوعي يحتفظ فقط بالزوج الصحيح بين الرامزة و ARNt الموافق/,
      ],
      zoomButtons: 1,
    },
    {
      exerciseId: 'cmh_transplant_compatibility',
      alts: [
        /اختلاف أنماط التراص يعكس اختلاف المحددات السطحية/,
        /HLA-I و HLA-II كهوية مناعية للخلية/,
        /عامل Rh مثال إضافي على اختلاف العلامات السطحية/,
        /بروتينات مدمجة داخل الغشاء البلازمي/,
        /النموذج الفسيفسائي المائع للغشاء مع مواقع البروتينات السطحية/,
        /سيولة الغشاء وإمكانية تحرك مكوناته البروتينية/,
      ],
      zoomButtons: 6,
    },
    {
      exerciseId: 'synapse_integration',
      alts: [
        /مستقبلات وقنوات مرتبطة بالربيطة تفتح بعد ارتباط الناقل العصبي/,
      ],
      zoomButtons: 1,
    },
    {
      exerciseId: 'lb_antibody_response',
      alts: [
        /ازدياد منطقة γ-غلوبولين بعد تنشيط الاستجابة الخلطية/,
        /تسبب تراصاً أو ترسباً للمستضدات/,
        /بلعمة المعقدات المناعية بعد تغليفها بالأجسام المضادة/,
        /استخلاص أجسام مضادة نوعية بفضل ارتباطها الحصري بالمستضد/,
        /شبيهة بالمجهر الإلكتروني تبين تجمعات مناعية/,
      ],
      zoomButtons: 5,
    },
    {
      exerciseId: 'lt_target_cell_response',
      alts: [
        /عدد الخلايا الهدف ينخفض فقط بوجود لمفاويات T نوعية/,
        /التعرف النوعي بين LT والخلية الهدف عبر CMH-I/,
        /LT تطلق perforines و granzymes بعد التعرف/,
        /تماس نوعي ينجح في الإقصاء وتماس غير نوعي لا يفعل القتل/,
      ],
      zoomButtons: 4,
    },
    {
      exerciseId: 'primary_secondary_response',
      alts: [
        /الجرعة التذكيرية ترفع عيار الأجسام المضادة بسرعة أكبر من الجرعة الأولى/,
        /تقارن مباشرة بين الاستجابة الأولية والثانوية على منحنى واحد/,
        /التعرض الأول يترك خلايا ذاكرة طويلة البقاء/,
        /أثر اللقاح الأول والجرعة التذكيرية على شدة الاستجابة/,
        /إعادة تنشيط خلايا الذاكرة بسرعة عند التعرض الثاني/,
        /تلخص مكان الذاكرة ضمن المسار الكامل للمناعة/,
        /تربط من المورثة إلى ARNm ثم الترجمة والتوجيه البروتيني داخل الوحدة 1/,
      ],
      zoomButtons: 7,
    },
  ])('affiche le visuel documentaire pour $exerciseId', ({ exerciseId, alts, zoomButtons }) => {
    render(<LiveDocumentUracile exerciseId={exerciseId} />);

    for (const alt of alts) {
      expect(screen.getByAltText(alt)).toBeDefined();
    }
    expect(screen.getAllByRole('button', { name: "Zoomer l'image" })).toHaveLength(zoomButtons);
  });
});
