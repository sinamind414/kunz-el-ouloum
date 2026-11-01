// src/data/reflexes.ts
// P0.0 — Référentiel canonique unique des six réflexes (source unique, jamais dupliqué).
// Spec V2 §2.1 / §2.2. Aucune autre copie des réflexes ne doit exister ailleurs.

export type CoreReflexId =
  | 'analyse'
  | 'interpret'
  | 'compare'
  | 'hypothesize'
  | 'explain'
  | 'validate';

export interface CoreReflex {
  id: CoreReflexId;
  labelAr: string;
  labelFr: string;
  mantraAr: string;
  purposeAr: string;
  connectorsAr: string[];
  checklist: string[];
  forbiddenTerms?: string[];
}

export const CORE_REFLEXES: Record<CoreReflexId, CoreReflex> = {
  analyse: {
    id: 'analyse',
    labelAr: 'حلّل',
    labelFr: 'Analyser',
    mantraAr: 'أعرّف → ألاحظ → أربط → أستنتج',
    purposeAr: 'وصف ما تلاحظه في الوثيقة دون تفسير (ملاحظة محضة).',
    connectorsAr: ['نلاحظ', 'يظهر', 'يتمثل', 'يتجلى'],
    checklist: [
      'أعرّف نوع الوثيقة والمتغيرات',
      'ألاحظ ما يظهر دون تفسير',
      'أربط بين العناصر الملاحَظة',
      'أستنتج استنتاجا محضا',
    ],
    forbiddenTerms: [],
  },
  interpret: {
    id: 'interpret',
    labelAr: 'فسّر',
    labelFr: 'Interpréter',
    mantraAr: 'ظاهرة → سبب → دلالة',
    purposeAr: 'ربط الظاهرة الملاحَظة بسببه العلمي ودلالتها.',
    connectorsAr: ['لأن', 'يعود السبب إلى', 'نتيجة ل', 'يرجع إلى'],
    checklist: [
      'أذكر الظاهرة الملاحَظة',
      'أعطِ السبب العلمي الدقيق',
      'أبين الدلالة على المستوى الخلوي أو العضوي',
    ],
    forbiddenTerms: [],
  },
  compare: {
    id: 'compare',
    labelAr: 'قارن',
    labelFr: 'Comparer',
    mantraAr: 'مشترك → مختلف → خلاصة',
    purposeAr: 'إبراز أوجه الشبه والاختلاف ثم استخلاص خلاصة.',
    connectorsAr: ['من جهة', 'من جهة أخرى', 'في حين', 'على العكس'],
    checklist: [
      'أذكر ما هو مشترك',
      'أذكر ما هو مختلف',
      'أستخلص خلاصة مقارنة',
    ],
    forbiddenTerms: [],
  },
  hypothesize: {
    id: 'hypothesize',
    labelAr: 'اقترح فرضية',
    labelFr: 'Émettre une hypothèse',
    mantraAr: 'دليل → آلية → فرضية قابلة للاختبار',
    purposeAr: 'صياغة فرضية محددة وقابلة للاختبار من الأدلة المتوفرة.',
    connectorsAr: ['نفترض أن', 'مما يؤدي إلى', 'يمكن أن', 'بفرض أن'],
    checklist: [
      'أستند إلى دليل من الوثيقة',
      'أقترح آلية محتملة',
      'أصيغ فرضية قابلة للاختبار',
    ],
    // ربما interdit UNIQUEMENT dans la production de l'élève pour ce réflexe (V2 §2.1).
    forbiddenTerms: ['ربما'],
  },
  explain: {
    id: 'explain',
    labelAr: 'اشرح / بيّن',
    labelFr: 'Expliquer / Montrer',
    mantraAr: 'وثائق → ربط → جواب',
    purposeAr: 'ربط عدة وثائق أو مفاهيم لبناء جواب متماسك.',
    connectorsAr: ['بذلك', 'من هنا', 'تبين', 'يتضح أن'],
    checklist: [
      'أستحضر الوثائق أو المفاهيم المعنية',
      'أربط بينها',
      'أصيغ جوابا متماسكا',
    ],
    forbiddenTerms: [],
  },
  validate: {
    id: 'validate',
    labelAr: 'صادق',
    labelFr: 'Valider',
    mantraAr: 'دليل → مواجهة → حكم',
    purposeAr: 'مواجهة النتيجة بالأدلة واتخاذ حكم علمي.',
    connectorsAr: ['بالاستناد إلى', 'يتطابق', 'يثبت', 'يؤكد'],
    checklist: [
      'أعرض الدليل',
      'أواجه النتيجة بالدليل',
      'أصدر حكما علميا',
    ],
    forbiddenTerms: [],
  },
};

export const CORE_REFLEX_IDS: CoreReflexId[] = Object.keys(CORE_REFLEXES) as CoreReflexId[];

// Compétences complémentaires — NE PAS nommer "les six réflexes" (V2 §2.2).
export type SupportingSkillId =
  | 'identify'
  | 'describe'
  | 'deduce'
  | 'justify'
  | 'scientific_text'
  | 'schema'
  | 'drawing';

export interface SupportingSkill {
  id: SupportingSkillId;
  labelAr: string;
  miniChecklist: string[];
  starterAr: string;
  commonErrorAr: string;
}

export const SUPPORTING_SKILLS: Record<SupportingSkillId, SupportingSkill> = {
  identify: {
    id: 'identify',
    labelAr: 'حدد',
    miniChecklist: ['أميّز العنصر', 'أسمّيه بدقة'],
    starterAr: 'أحدد ...',
    commonErrorAr: 'خلط بين عنصرين متجاورين.',
  },
  describe: {
    id: 'describe',
    labelAr: 'صف',
    miniChecklist: ['أذكر الخصائص', 'أرتب الوصف'],
    starterAr: 'نلاحظ أن ...',
    commonErrorAr: 'وصف غير كمي أو غامض.',
  },
  deduce: {
    id: 'deduce',
    labelAr: 'استنتج',
    miniChecklist: ['أربط المعطيات', 'أستنتج نتيجة'],
    starterAr: 'ومنه نستنتج أن ...',
    commonErrorAr: 'قفز من دون رابط منطقي.',
  },
  justify: {
    id: 'justify',
    labelAr: 'علل / برر',
    miniChecklist: ['أذكر السبب', 'أربطه بالنتيجة'],
    starterAr: 'يعود السبب إلى ...',
    commonErrorAr: 'تعليل بدون ربط بالنتيجة.',
  },
  scientific_text: {
    id: 'scientific_text',
    labelAr: 'اكتب نصا علميا',
    miniChecklist: ['مشكل ؟', 'جسم بكلمات مفتاحية', 'خلاصة < 150 حرفا'],
    starterAr: 'كيف ... ؟',
    commonErrorAr: 'خلاصة طويلة أو بدون علامة استفهام.',
  },
  schema: {
    id: 'schema',
    labelAr: 'أنجز مخططا',
    miniChecklist: ['عنوان', 'أطراف', 'سهام واتجاهات'],
    starterAr: 'المخطط يوضح ...',
    commonErrorAr: 'مخطط بلا أسهم أو تسميات.',
  },
  drawing: {
    id: 'drawing',
    labelAr: 'أنجز رسما',
    miniChecklist: ['مقياس', 'تسميات', 'تدرج'],
    starterAr: 'الرسم يبين ...',
    commonErrorAr: 'رسم بلا تسميات أو مقياس.',
  },
};

// Message bienveillant unique pour la règle "ربما" (V2 §2.1).
export const HYPOTHESIS_RBMA_MESSAGE =
  'مهلاً يا باحث: الفرضية يجب أن تكون محددة وقابلة للاختبار.\nاستعمل «نفترض أن… مما يؤدي إلى…» بدل «ربما».';
