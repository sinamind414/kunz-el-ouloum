import { Switch, VERB_CARDS_V2, ERROR_TAXONOMY } from './methodologyEngine';

export interface BoussoleStep {
  num: 1 | 2 | 3 | 4;
  ar: string;
  word: string;
  wordAr: string;
  whereAr: string;
  questionAr: string;
  templateAr?: string;
  color: string;
  colorSoft: string;
  actionsAr: string[];
  interditAr: string[];
  noteAr?: string;
  errorTag: string;
}

export const BOUSSOLE_STEPS: BoussoleStep[] = [
  {
    num: 1,
    ar: 'تَبَصَّر',
    word: 'أحدد فعل الأداء والكلمات المفتاحية',
    wordAr: 'أحدد الفعل',
    whereAr: 'المسودة فقط',
    questionAr: 'ما هو المطلوب بالضبط؟',
    templateAr: 'المطلوب: … (⩽5 كلمات)',
    color: '#1d4ed8',
    colorSoft: '#3b82f6',
    actionsAr: ['حدّث الفعل', 'سَبّب الكلمات المفتاحية'],
    interditAr: ['أن تكتب إجابة بالكامل', 'تذكر القواعد'],
    errorTag: 'verb_confusion',
  },
  {
    num: 2,
    ar: 'أدخل',
    word: 'أربط المعطيات بالوحدات',
    wordAr: 'جمع المعطيات',
    whereAr: 'على الورقة',
    questionAr: 'ما الذي أملك؟',
    templateAr: 'انطلاقًا من الوثيقة (…) نلاحظ أنّ … (قيمة + وحدة)',
    color: '#059669',
    colorSoft: '#10b981',
    actionsAr: ['سَحب القيم من الوثيقة', 'إرفاق جميع القيم بوحدتها'],
    interditAr: ['بدون وثيقة', 'بدون قيمة', 'بدون وحدة'],
    errorTag: 'missing_unit',
  },
  {
    num: 3,
    ar: 'أدر',
    word: 'أقرأ الوثيقة ثم أستنتج',
    wordAr: 'الربط السببي',
    whereAr: 'على الورقة',
    questionAr: 'هل يسمح الفعل بـ«لأنّ»؟',
    templateAr: 'وهذا لأنّ … وبالتالي …',
    color: '#d97706',
    colorSoft: '#f59e0b',
    actionsAr: ['ربط السبب بالنتيجة', 'استخدام «لأنّ» أو «وبالتالي»'],
    interditAr: ['أن تكتب دون فرض', 'إغفال المفتاح'],
    errorTag: 'premature_interpretation',
  },
  {
    num: 4,
    ar: 'افتح',
    word: 'أعيد صياغة المطلوب كحقيقة علمية',
    wordAr: 'الإنهاء',
    whereAr: 'على الورقة',
    questionAr: 'ما الخلاصة؟',
    templateAr: 'ومنه نستنتج أنّ … (أُعيد صياغة المطلوب)',
    color: '#7c3aed',
    colorSoft: '#a855f7',
    actionsAr: ['أعيد صياغة السؤال بحقيقة', 'أغلق الإجابة'],
    interditAr: ['إبقاء على المطلوب كما هو', 'بدون جملة خاتمية'],
    errorTag: 'missing_conclusion',
  },
];

export function getStep(id: 1 | 2 | 3 | 4): BoussoleStep | undefined {
  return BOUSSOLE_STEPS.find(s => s.num === id);
}

export const REGLE_D_OR_AR = '« لا خاتمةَ قبل حُجّة، ولا حُجّةَ قبل مُعطى، ولا مُعطى قبلَ فَهْمِ السؤال »';

export const TIME_RULE_AR = 'الربع الأول: تَبَصَّر + أدخل · النصف: أدر · الربع الأخير: افتح + الفحص';

export const FINGERS_RITUAL_AR = 'الإصبع ≈ الخطوة 1-2-3-4 تحت الطاولة';

export const SELF_CHECKS = [
  '٤ هل آخر جملة تُجيب «المطلوب»؟',
  '٣ هل كل تأكيد له «لأنّ»؟',
  '٢ هل ذكرت الوثيقة والقيمة والوحدة؟',
  '١ هل احترمت الفعل؟',
];

export const SWITCH_QUESTION_AR = 'هل الفعل يسمح بـ«لأنّ»؟';

export const SWITCH_OPEN_VERBS = VERB_CARDS_V2.filter(c => c.switch === 'open').map(c => c.id);

export const SWITCH_CLOSED_VERBS = VERB_CARDS_V2.filter(c => c.switch === 'closed').map(c => c.id);

export type SwitchState = Switch;

export function getSwitchForVerb(verbId: string): SwitchState {
  return SWITCH_OPEN_VERBS.includes(verbId) ? 'open' : 'closed';
}

export function switchPathAr(verbId: string): string {
  return getSwitchForVerb(verbId) === 'open' ? '١٢٣٤' : '١٢٤';
}

export interface ErrorAddress {
  1: 'step_1';
  2: 'step_2';
  3: 'step_3';
  4: 'step_4';
  switch: 'switch';
}

// Dérivé de ERROR_TAXONOMY[*].step — une seule adresse par erreur (constat #5 v1).
// Aucune recopie manuelle : si la taxonomie bouge, l'adresse suit.
export const ERROR_ADDRESS_MAP: Record<string, '1' | '2' | '3' | '4' | 'switch'> =
  Object.fromEntries(
    Object.entries(ERROR_TAXONOMY).map(([code, item]) => [code, String(item.step) as '1' | '2' | '3' | '4' | 'switch'])
  );

export function errorAddressAr(addr: '1' | '2' | '3' | '4' | 'switch'): string {
  const map: Record<typeof addr, string> = {
    1: '١ تَبَصَّر',
    2: '٢ أدخل',
    3: '٣ أدر',
    4: '٤ افتح',
    switch: '🔑 المفتاح',
  };
  return map[addr];
}

export const ERROR_REMEDY_MAP: Record<string, string> = {
  missing_unit: 'كل قيمة عددية متبوعة بوحدتها (غ/ل، %، دقيقة، وحدة اعتبارية)',
  missing_reference: 'ابدأ بـ «انطلاقًا من الوثيقة …» أو «نلاحظ أن …»',
  premature_interpretation: 'احذف أي تفسير واكتف بوصف ما تراه العين فقط، ثم استنتج',
  conditional_hypothesis: 'صيغة إخبارية جازمة: «يؤثر …» بدلاً من «ربما يؤثر»',
  missing_conclusion: 'أختم بجملة استنتاجية: «ومنه نستنتج أن …»',
  verb_confusion: 'افحص الفعل في بداية الإجابة وتحرك الوثيقة',
  comparison_without_criteria: 'قارن وجهاً لوجه حسب معيار: «بينما …» أو «في حين …»',
  unbalanced_comparison: 'اكتب عن العنصر الأول ثم عن الثاني في نفس السطر',
  unsupported_claim: 'أضف الرابط: «وهذا لأنّ … وبالتالي …» — أو احذف التأكيد الذي لا سند له.',
};

export interface StepErrorGroup {
  address: '1' | '2' | '3' | '4' | 'switch';
  tags: string[];
}

export function groupErrorsByAddress(tags: string[]): StepErrorGroup[] {
  const groups: StepErrorGroup[] = [
    { address: '1', tags: [] },
    { address: 'switch', tags: [] },
    { address: '2', tags: [] },
    { address: '3', tags: [] },
    { address: '4', tags: [] },
  ];
  tags.forEach(tag => {
    const addr = ERROR_ADDRESS_MAP[tag];
    if (addr) {
      const g = groups.find(x => x.address === addr);
      if (g) g.tags.push(tag);
    }
  });
  return groups;
}

export interface SpecialFormat {
  verbId: string;
  name: string;
  step2Template: string;
  step3Template: string;
  step4Template: string;
}

export const SPECIAL_FORMATS: SpecialFormat[] = [
  {
    verbId: 'verb_compare_v1',
    name: 'مقارنة',
    step2Template: 'أمتز الحجم في 2 أعمدة على معيار واحد',
    step3Template: 'بينما … في حين …',
    step4Template: 'الخلاصة: ...',
  },
  {
    verbId: 'verb_schema_v1',
    name: 'رسم تخطيطي',
    step2Template: 'البنيات + البيانات بأسهم',
    step3Template: 'أسهم مرقمة 1-2-3...',
    step4Template: 'العنوان + المفتاح',
  },
  {
    verbId: 'verb_schematic_v1',
    name: 'مخطط',
    step2Template: 'العناصر داخل أطر',
    step3Template: 'اتجاه الأسهم الواضح',
    step4Template: 'عنوان مؤطر',
  },
  {
    verbId: 'verb_hypothesis_v1',
    name: 'فرضية',
    step2Template: 'آلية دقيقة',
    step3Template: 'صياغة جازمة لا تحتوي على ربما',
    step4Template: 'قابلة للتجربة',
  },
  {
    verbId: 'verb_deduce_v1',
    name: 'استنتاج',
    step2Template: 'تجريد النتائج (بلا أرقام معادة)',
    step3Template: 'الربط السببي: الآلية (لأنّ / يعود ذلك إلى)',
    step4Template: 'جملة جامعة واحدة',
  },
];

export function getSpecialFormatForVerb(verbId: string): SpecialFormat | undefined {
  return SPECIAL_FORMATS.find(f => f.verbId === verbId);
}

export type NavigatorGradeKey = 'none' | 'deckhand' | 'sailor' | 'captain' | 'admiral';

export interface NavigatorGrade {
  key: NavigatorGradeKey;
  num: 1 | 2 | 3 | 4;
  nameAr: string;
  icon: string;
  title: string;
  sub: string;
  desc: string;
  conditionAr: string;
  emoji: string;
}

export const AID_LEVELS: NavigatorGrade[] = [
  {
    num: 1,
    key: 'deckhand',
    nameAr: 'نوتيّ',
    icon: '🛶',
    title: 'مع النموذج',
    sub: 'Modelage',
    desc: 'اكتشف الخطوات النموذجية والمفتاح',
    conditionAr: 'أولى الرحلات — واصل الإبحار لتكتسب الرتب',
    emoji: '⚡',
  },
  {
    num: 2,
    key: 'sailor',
    nameAr: 'ملاح',
    icon: '⛵',
    title: 'إكمال الفراغات',
    sub: 'Complétion',
    desc: 'أكمل النماذج بالمعطيات والوحدات',
    conditionAr: '5 رحلات مكتملة + رحلة واحدة بلا خطأ منهجي',
    emoji: '📝',
  },
  {
    num: 3,
    key: 'captain',
    nameAr: 'رجل البحر',
    icon: '🚢',
    title: 'كتابة بالبطاقة',
    sub: 'Guidée',
    desc: 'اكتب الإجابة مع دعم الفيشة',
    conditionAr: 'متوسط ≥ 75% في 3 أفعال أداء مختلفة',
    emoji: '✓',
  },
  {
    num: 4,
    key: 'admiral',
    nameAr: 'قبطان أعالي البحار',
    icon: '⚓',
    title: 'بكالوريا',
    sub: 'Examen',
    desc: 'إجابة محدودة الوقت دون دعم',
    conditionAr: 'ICM ≥ 90% في 3 وحدات مختلفة على الأقل',
    emoji: '🏆',
  },
];

export const TIME_RULES = {
  quart: 'الرُّبع الأول: تَبَصَّر + أدخل',
  half: 'النِّصف: أدر (أو الكتابة إن كان مغلقًا)',
  quarter: 'الرُّبع الأخير: افتح + الفحص',
};

export const ERROR_TAG_LABELS_AR: Record<string, string> = {
  unsupported_claim: 'ربط بلا سند',
  missing_unit: 'غياب الوحدة القياسية',
  missing_reference: 'تأكيد دون سند',
  premature_interpretation: 'تفسير مبكر أثناء التحليل',
  conditional_hypothesis: 'فرضية بصيغة الشك',
  missing_conclusion: 'غياب الجملة الختامية',
  verb_confusion: 'الخلط بين أفعال الأداء',
  comparison_without_criteria: 'مقارنة بلا معايير',
  unbalanced_comparison: 'مقارنة غير متوازنة',
};

export function getStepData(step: number): BoussoleStep | undefined {
  return BOUSSOLE_STEPS.find(s => s.num === step);
}

export function getStepByTag(tag: string): BoussoleStep | undefined {
  const tagToStep: Record<string, number> = {
    unsupported_claim: 3,
    missing_unit: 2,
    missing_reference: 3,
    premature_interpretation: 3,
    conditional_hypothesis: 3,
    missing_conclusion: 4,
    verb_confusion: 1,
    comparison_without_criteria: 2,
    unbalanced_comparison: 2,
  };
  const stepNum = tagToStep[tag];
  return stepNum ? getStep(stepNum as 1 | 2 | 3 | 4) : undefined;
}

export interface BoussoleCap {
  id: 1 | 2 | 3 | 4;
  num: number;
  ar: string;
  word: string;
  color: string;
  colorSoft: string;
  questionAr: string;
  verbAr: string;
  gestureAr: string;
  stepsAr: string[];
  desc: string;
}

export const BOUSSOLE_CAPS: BoussoleCap[] = [
  {
    id: 1, num: 1, ar: 'تَبَصَّر', word: 'أحدد الفعل', color: '#1d4ed8', colorSoft: '#3b82f6',
    questionAr: 'ما المطلوب؟', verbAr: 'حَلِّلْ / فَسِّرْ', gestureAr: '👇 4 أضراس',
    stepsAr: ['حدد الفعل', 'سَبّب الكلمات'],
    desc: 'نوتيّ — أولى الرحلات — واصل الإبحار لتكتسب الرتب',
  },
  {
    id: 2, num: 2, ar: 'أدخل', word: 'جمع المعطيات', color: '#059669', colorSoft: '#10b981',
    questionAr: 'ما الأملك؟', verbAr: 'حَلِّلْ / فَسِّرْ', gestureAr: '👇 3 أضراس',
    stepsAr: ['اكتب الوثيقة', 'أرد القيم'],
    desc: 'ملاح — 5 رحلات مكتملة + رحلة واحدة بلا خطأ منهجي',
  },
  {
    id: 3, num: 3, ar: 'أدر', word: 'الربط السببي', color: '#d97706', colorSoft: '#f59e0b',
    questionAr: 'هل يسمح بالسبب؟', verbAr: 'فَسِّرْ', gestureAr: '👇 2 أضراس',
    stepsAr: ['استخدم لأن', 'كن جديراً بالنتيجة'],
    desc: 'رجل البحر — متوسط ≥ 75% في 3 أفعال أداء مختلفة',
  },
  {
    id: 4, num: 4, ar: 'افتح', word: 'الإنهاء', color: '#7c3aed', colorSoft: '#a855f7',
    questionAr: 'ما الخلاصة؟', verbAr: 'حَلِّلْ / فَسِّرْ', gestureAr: '👇 1 إصبع',
    stepsAr: ['أعد صياغة السؤال', '،كتب جملة خاتمية'],
    desc: 'قبطان — ICM ≥ 90% في 3 وحدات مختلفة على الأقل',
  },
];

export function capForStage(stage: 1 | 2 | 3 | 4): BoussoleCap {
  return BOUSSOLE_CAPS[stage - 1];
}

export function groupErrorsByCap(tags: string[]): { capId: number; tags: string[] }[] {
  const groups: Record<number, string[]> = { 1: [], 2: [], 3: [], 4: [] };
  tags.forEach(tag => {
    const step = getStepByTag(tag);
    if (step) groups[step.num].push(tag);
  });
  return Object.entries(groups).map(([id, tags]) => ({ capId: Number(id), tags }));
}

export const VENT_CAP_MAP: Record<string, 1 | 2 | 3 | 4> = {
  unsupported_claim: 3,
  missing_unit: 2,
  missing_reference: 3,
  premature_interpretation: 3,
  conditional_hypothesis: 3,
  missing_conclusion: 4,
  verb_confusion: 1,
  comparison_without_criteria: 2,
  unbalanced_comparison: 2,
};

export type CapId = 1 | 2 | 3 | 4;

export const BOUSSOLE_STAGES_META: { num: 1 | 2 | 3 | 4; title: string; description: string }[] = [
  { num: 1, title: 'مع النموذج', description: 'استكشف الخطوات النموذجية' },
  { num: 2, title: 'إكمال الفراغات', description: 'أكمل النماذج' },
  { num: 3, title: 'كتابة بالبطاقة', description: 'اكتب الإجابة' },
  { num: 4, title: 'بكالوريا', description: 'الإجابة تحت ضغط الوقت' },
];