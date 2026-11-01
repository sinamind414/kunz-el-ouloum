// loisKunz.ts
// Les 6 Lois Absolues Kunz (loi_0 … loi_5). Contenu canon en Arabe Fus'ha strict.
// Stockage : localStorage 'kunz_lois_absolues_v2' (voir useSmartValidation / MethodologyView).

export type LoiId = `loi_${0 | 1 | 2 | 3 | 4 | 5}`;

export interface LoiKunz {
  id: LoiId;
  numero: 0 | 1 | 2 | 3 | 4 | 5;
  titreAr: string;
  titreFr: string;
  loiAbsolueAr: string;
  loiAbsolueFr: string;
  checklist: string[];
  template: string;
  exempleFaux: string;
  exempleJuste: string;
  interdit: string[];
  obligatoire: string[];
  xp: number;
  verbes: string[];
}

export const LOIS_KUNZ: LoiKunz[] = [
  {
    id: 'loi_0',
    numero: 0,
    titreAr: 'قانون التحديد',
    titreFr: 'Identifier',
    loiAbsolueAr: 'حدّد نوع الوثيقة أولاً (منحنى، جدول، تخطيط، صورة)، ثم حدد المحورين X و Y ووحداتهما، وحدّد هدف السياق قبل أي جملة.',
    loiAbsolueFr: 'Identifie le type de doc + X/Y + unités + objectif du contexte avant toute phrase.',
    checklist: [
      'نوع الوثيقة محدد (منحنى/جدول/تخطيط/صورة)',
      'المحوران X و Y مع وحداتهما',
      'الهدف (السياق) واضح قبل الكتابة',
      'المصطلحات العلمية الدقيقة مستعملة',
    ],
    template: 'تتعلق الوثيقة بـ … وتمثل المحور الصادي … والمحور الفاصل … بالوحدة …',
    exempleFaux: 'الوثيقة تبين نتيجة.',
    exempleJuste: 'الوثيقة عبارة عن منحنى يمثل تطور سرعة التفاعل (المحور الصادي، وحدة مول/د) بدلالة تركيز الركيزة (المحور الفاصل، وحدة مول/ل).',
    interdit: ['إجابة دون تحديد النوع', 'خلط الوحدات'],
    obligatoire: ['نوع الوثيقة', 'المحوران والوحدات', 'الهدف'],
    xp: 10,
    verbes: ['حدد', 'عيّن', 'استخرج'],
  },
  {
    id: 'loi_1',
    numero: 1,
    titreAr: 'قانون الوصف',
    titreFr: 'Décrire',
    loiAbsolueAr: 'لكل قيمة وصفية، أدرج القيمة العددية ووحدتها وشرطها الزمني أو الظرفي.',
    loiAbsolueFr: 'Valeur + unité + condition/temps pour chaque description.',
    checklist: [
      'قيمة عددية مذكورة',
      'وحدة مذكورة',
      'شرط أو زمن مذكور',
      'صياغة موجزة لا تفسير',
    ],
    template: 'نلاحظ … (قيمة … بوحدة …) عند (الزمن/الشرط …).',
    exempleFaux: 'السرعة تزداد.',
    exempleJuste: 'نلاحظ زيادة سرعة التفاعل لتصل إلى قيمتها العظمية 50 مول/د بعد 10 دقائق.',
    interdit: ['وصف بلا وحدة', 'خلط الوصف بالتفسير'],
    obligatoire: ['قيمة', 'وحدة', 'شرط'],
    xp: 10,
    verbes: ['صف', 'اذكر', 'وصف'],
  },
  {
    id: 'loi_2',
    numero: 2,
    titreAr: 'قانون التحليل',
    titreFr: 'Analyser',
    loiAbsolueAr: 'حلّل في 4 خطوات: لاحظ، قارن، اربط، استنتج. في الوثيقة الكمّية استعمل «كلما… كلما…»، وفي النوعية استعمل «بينما/في حين»، وتجنّب «هذا يدل» في علاقة.',
    loiAbsolueFr: '4 étapes ; quanti=كلما ; quali=بينما ; pas « هذا يدل » dans relation.',
    checklist: [
      'ملاحظة المعطيات',
      'مقارنة بين المتغيرات',
      'ربط بـ كلما (كمّي) أو بينما/في حين (نوعي)',
      'استنتاج مختصر',
    ],
    template: 'كلما زاد/نقص … كلما زاد/نقص … (كمّي) | نلاحظ … بينما … (نوعي).',
    exempleFaux: 'هذا يدل على أن السرعة تزداد.',
    exempleJuste: 'كلما زاد تركيز الركيزة كلما زادت سرعة التفاعل حتى الوصول إلى قيمة عظمية ثابتة.',
    interdit: ['استعمال كلما في وثيقة نوعية', '« هذا يدل » في علاقة'],
    obligatoire: ['كلما (كمّي)', 'بينما/في حين (نوعي)', '4 خطوات'],
    xp: 15,
    verbes: ['حلل', 'قارن', 'حلل مقارنا'],
  },
  {
    id: 'loi_3',
    numero: 3,
    titreAr: 'قانون التفسير',
    titreFr: 'Interpréter',
    loiAbsolueAr: 'فسّر «لماذا» على مستويين على الأقل (جزيئي ← خلوي ← وظيفي)، مع احترام قواعد PPM/ACh: في اللوحة المحركة PPM لا PPSE، والأستيل كولين يفتح قنوات مرتبطة بالربيطة لا فولطية.',
    loiAbsolueFr: 'Pourquoi ; ≥2 niveaux mol→cell→physio ; règles PPM/ACh.',
    checklist: [
      'سبب علمي (لماذا)',
      'مستوى جزيئي',
      'مستوى خلوي أو وظيفي',
      'احترام PPM/PPSE وأستيل كولين',
    ],
    template: 'يرجع ذلك على المستوى الجزيئي إلى … وعلى المستوى الخلوي إلى … مما يؤدي وظيفياً إلى …',
    exempleFaux: 'لأن الإنزيم يعمل.',
    exempleJuste: 'يرجع توقف التفاعل على المستوى الجزيئي إلى ارتباط المثبط بموقع نشاط الإنزيم، وعلى المستوى الخلوي إلى انخفاض إنتاج المادة، مما يؤدي وظيفياً إلى توقف النمو.',
    interdit: ['PPSE في اللوحة المحركة', 'أستيل كولين + قنوات فولطية', 'خلط التليف بالتشنج'],
    obligatoire: ['سبب', 'مستويان', 'قواعد PPM/ACh'],
    xp: 15,
    verbes: ['فسر', 'اشرح', 'وضح', 'علل'],
  },
  {
    id: 'loi_4',
    numero: 4,
    titreAr: 'قانون الفرضية',
    titreFr: 'Hypothèse',
    loiAbsolueAr: 'صغ الفرضية بـ «نفترض أن» متبوعة بهدف جزيئي واضح وقابل للاختبار. يُمنع «ربما» وإطلاق الكلام دون هدف.',
    loiAbsolueFr: 'نفترض أن + cible mol. ; interdire ربما.',
    checklist: [
      'صياغة بـ «نفترض أن»',
      'هدف جزيئي محدد',
      'قابلية للاختبار',
      'غياب «ربما»',
    ],
    template: 'نفترض أن … (هدف جزيئي: إنزيم/مستقبل/قناة) … يؤدي إلى …',
    exempleFaux: 'ربما السبب هو الإنزيم.',
    exempleJuste: 'نفترض أن ارتباط المادة بإنزيم ARN بوليميراز يثبط نسخ الحمض النووي.',
    interdit: ['ربما', 'فرضية بلا هدف جزيئي'],
    obligatoire: ['نفترض أن', 'هدف جزيئي'],
    xp: 15,
    verbes: ['اقترح فرضية', 'صغ فرضية'],
  },
  {
    id: 'loi_5',
    numero: 5,
    titreAr: 'قانون المصادقة والتركيب',
    titreFr: 'Valider / Synthèse',
    loiAbsolueAr: 'ركّب الوثيقتين معاً: وثيقة 1 + وثيقة 2 + رابط (أسمنت)، واحترم وضع H2: إن كانت غير ضرورية أو غير مدعومة بالمعطيات فلا تَنفِها قطعياً. أنجز نصاً أو تخطيطاً منظّماً.',
    loiAbsolueFr: 'Doc1+Doc2+ciment ; H2 non étayée ; texte/schéma structuré.',
    checklist: [
      'استغلال الوثيقة 1',
      'استغلال الوثيقة 2',
      'ربط (أسمنت) بينهما',
      'معالجة H2 بحذر (غير ضرورية/غير مدعومة لا تلغي)',
    ],
    template: 'تبين الوثيقة 1 … وتبين الوثيقة 2 … وبربطهما نستنتج …',
    exempleFaux: 'الفرضية الثانية خاطئة وتلغى.',
    exempleJuste: 'تبين الوثيقة 1 ارتباط المادة بالمستقبل، وتبين الوثيقة 2 انخفاض الاستجابة، وبربطهما نستنتج تثبيط الإشارة؛ أما الفرضية الثانية H2 فتظل غير مدعومة بالمعطيات دون نفي قاطع.',
    interdit: ['نفي قاطع لـ H2 بلا دليل', 'تركيب بوثيقة واحدة'],
    obligatoire: ['وثيقة 1', 'وثيقة 2', 'رابط', 'حذر H2'],
    xp: 20,
    verbes: ['صادق', 'ناقش', 'أثبت', 'اكتب نصا علميا', 'أنجز مخططا'],
  },
];

export function getLoi(id: LoiId): LoiKunz | undefined {
  return LOIS_KUNZ.find((l) => l.id === id);
}

export const LOIS_STORAGE_KEY = 'kunz_lois_absolues_v2';
