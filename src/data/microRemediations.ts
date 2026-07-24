// src/data/microRemediations.ts
// V3 §3.3 — Micro-reprises ciblées (une seule erreur à la fois).
// Déclenchées par les codes d'erreur du ValidationEngine / des leçons actives.

export interface MicroRemediation {
  id: string;
  conceptId: string;
  triggerCodes: string[];
  titleAr: string;
  estimatedMinutes: number; // 2 à 4
  explanationAr: string;
  activeQuestionAr: string;
  acceptedEvidence: string[];
  nextAction: 'retry_document' | 'open_reflex' | 'schedule_recall';
}

export const MICRO_REMEDIATIONS: Record<string, MicroRemediation> = {
  'arnm_vs_adn': {
    id: 'mr_arnm_vs_adn',
    conceptId: 'transcription',
    triggerCodes: ['MISSING_ARNM', 'CONFUSION_ADN_ARNM', 'NO_NUCLEUS_LINK'],
    titleAr: 'ADN يبقى في النواة — ARNm يحمل النسخة',
    estimatedMinutes: 3,
    explanationAr:
      'ADN يبقى في النواة. ARNm هو النسخة التي تحمل المعلومة إلى الهيولى. اليوراسيل (U) موجود في ARNm لا في ADN.',
    activeQuestionAr: 'أي جزيء يحتوي اليوراسيل ويمكنه نقل نسخة المعلومة من النواة إلى الهيولى؟',
    acceptedEvidence: ['ARNm', 'اليوراسيل', 'النواة', 'الهيولى'],
    nextAction: 'retry_document',
  },
  'sens_transcription': {
    id: 'mr_sens_transcription',
    conceptId: 'transcription',
    triggerCodes: ['WRONG_SENSE', 'SENSE_3_5'],
    titleAr: 'الاتجاه: القالب 3′→5′، ARNm 5′→3′',
    estimatedMinutes: 2,
    explanationAr: 'يُقرأ القالب من 3′ نحو 5′، ويُركّب ARNm في اتجاه 5′ نحو 3′.',
    activeQuestionAr: 'في أي اتجاه يُركّب ARNm؟',
    acceptedEvidence: ['5', '3', 'القالب', 'ARNm'],
    nextAction: 'schedule_recall',
  },
  'codon_vs_anticodon': {
    id: 'mr_codon_vs_anticodon',
    conceptId: 'traduction',
    triggerCodes: ['CONFUSION_CODON_ANTICODON'],
    titleAr: 'الكودون على ARNm — مضاد الكودون على ARNt',
    estimatedMinutes: 2,
    explanationAr: 'الكودون موجود على ARNm؛ مضاد الكودون موجود على ARNt ويرتبط به بال complémentarité.',
    activeQuestionAr: 'أين يوجد الكودون وأين مضاد الكودون؟',
    acceptedEvidence: ['ARNm', 'ARNt', 'الكودون', 'مضاد الكودون'],
    nextAction: 'retry_document',
  },
  'enzyme_saturation': {
    id: 'mr_enzyme_saturation',
    conceptId: 'enzymes',
    triggerCodes: ['ENZYME_DISAPPEARS', 'NO_SATURATION'],
    titleAr: 'التشبّع: المواقع لا الإنزيم',
    estimatedMinutes: 3,
    explanationAr: 'عند Vmax يبقى الإنزيم موجوداً؛ جميع المواقع النشطة مشغولة فلا تزيد السرعة.',
    activeQuestionAr: 'لماذا تستقر السرعة عند Vmax؟',
    acceptedEvidence: ['المواقع النشطة', 'التشبّع', 'Vmax'],
    nextAction: 'retry_document',
  },
  'thylakoide_vs_stroma': {
    id: 'mr_thylakoide_vs_stroma',
    conceptId: 'photosynthese',
    triggerCodes: ['THYLAKOID_STROMA_CONFUSION', 'MISSING_THYLAKOID', 'WRONG_PHOTOSYNTHESIS_LOCATION'],
    titleAr: 'التايلاكويد يمتص الضوء — الحشوة تثبت CO₂',
    estimatedMinutes: 3,
    explanationAr: 'التفاعلات الضوئية تتم على أغشية التيلاكويد (ضوء → ATP/NADPH). أما تثبيت CO2 فيتم في الحشوة/السدى.',
    activeQuestionAr: 'أين تتم التفاعلات الضوئية، وأين يتم تثبيت CO2؟',
    acceptedEvidence: ['التيلاكويد', 'الحشوة', 'ضوء', 'CO2'],
    nextAction: 'schedule_recall',
  },
  'ppse_ppsi_threshold': {
    id: 'mr_ppse_ppsi_threshold',
    conceptId: 'synapse',
    triggerCodes: ['WRONG_PPM_PPSE', 'CONFUSION_PPSE_PPSI', 'MISSING_THRESHOLD'],
    titleAr: 'PPSE تنبيهي — PPSI تثبيطي — العتبة تقرر التوليد',
    estimatedMinutes: 3,
    explanationAr: 'PPSE يقرب الغشاء من العتبة (-50 mV) ويمكنه توليد كمون عمل. PPSI يبعد الغشاء عن العتبة (-80 mV) ويمنع التوليد.',
    activeQuestionAr: 'كيف يقرر المشبك ما إذا كان سيتم توليد كمون عمل أم لا؟',
    acceptedEvidence: ['PPSE', 'PPSI', 'عتبة', 'كمون عمل', 'تكامل'],
    nextAction: 'schedule_recall',
  },
  'subduction_water': {
    id: 'mr_subduction_water',
    conceptId: 'subduction',
    triggerCodes: ['MISSING_WATER', 'WRONG_SUBDUCTION_MELTING'],
    titleAr: 'الماء يخفض درجة انصهار الوشاح فوق اللوح الغائص',
    estimatedMinutes: 3,
    explanationAr: 'الماء المحرر من اللوح المحيطي الغائص يخفض درجة انصهار الوشاح ويسبب انصهاراً جزئياً يولد صهارة أنديزيتية.',
    activeQuestionAr: 'كيف يساهم الماء المحرر من اللوح الغائص في تولد الصهارة؟',
    acceptedEvidence: ['ماء', 'انصهار جزئي', 'وشاح', 'صهارة'],
    nextAction: 'schedule_recall',
  },
  'primary_structure_function': {
    id: 'mr_primary_structure_function',
    conceptId: 'protein_structure_function',
    triggerCodes: ['MISSING_PRIMARY_STRUCTURE', 'WRONG_STRUCTURE_FUNCTION'],
    titleAr: 'البنية الأولية → بنية ثالثية → موقع نشط → وظيفة',
    estimatedMinutes: 3,
    explanationAr: 'تتابع الأحماض الأمينية يحدد البنية الأولية، التي تنطوي إلى بنية ثالثية، فتشكّل الموقع النشط وتحدد الوظيفة.',
    activeQuestionAr: 'كيف يؤدي تغير حمض أميني واحد إلى تغير وظيفة البروتين؟',
    acceptedEvidence: ['تتابع الأحماض الأمينية', 'بنية ثالثية', 'موقع نشط', 'وظيفة'],
    nextAction: 'schedule_recall',
  },
  'cmh_self_nonself': {
    id: 'mr_cmh_self_nonself',
    conceptId: 'immunity_self_nonself',
    triggerCodes: ['MISSING_CMH', 'WRONG_SELF_NONSELF'],
    titleAr: 'CMH علامة التعرف على الذات',
    estimatedMinutes: 3,
    explanationAr: 'جزيئات CMH تحمل علامة التعرف على الخلايا الذاتية. عند اختلافها تتعرف المناعة على الخلايا الغريبة.',
    activeQuestionAr: 'لماذا يزداد احتمال نجاح الطعم عند تقارب CMH؟',
    acceptedEvidence: ['CMH', 'تعرف مناعي', 'ذات', 'لاذات'],
    nextAction: 'schedule_recall',
  },
  'lb_plasmocyte_antibody': {
    id: 'mr_lb_plasmocyte_antibody',
    conceptId: 'immunity_humoral_response',
    triggerCodes: ['MISSING_LB', 'WRONG_ANTIBODY_PRODUCTION'],
    titleAr: 'اللمفاوية B → خلية بلازمية → جسم مضاد',
    estimatedMinutes: 3,
    explanationAr: 'بعد تنشيطها تتكاثر اللمفاوية B ثم تتميز إلى خلية بلازمية تفرز الأجسام المضادة.',
    activeQuestionAr: 'من يفرز الأجسام المضادة، وما مصير اللمفاوية B المنشطة؟',
    acceptedEvidence: ['لمفاوية B', 'خلية بلازمية', 'جسم مضاد', 'تكاثر نسيلي'],
    nextAction: 'schedule_recall',
  },
  'lt_target_cell': {
    id: 'mr_lt_target_cell',
    conceptId: 'immunity_cellular_response',
    triggerCodes: ['MISSING_LT', 'WRONG_CELLULAR_RESPONSE'],
    titleAr: 'اللمفاوية T تتعرف على الخلية الهدف ثم تقتلها',
    estimatedMinutes: 3,
    explanationAr: 'اللمفاوية T النوعية تتعرف على المحدد المستضدي ثم تفرز مواد سامة تقتل الخلية الهدف.',
    activeQuestionAr: 'ما الفرق العملي بين الاستجابة الخلطية والاستجابة الخلوية؟',
    acceptedEvidence: ['لمفاوية T', 'خلية هدف', 'إقصاء خلوي', 'استجابة خلوية'],
    nextAction: 'schedule_recall',
  },
  'memory_primary_secondary': {
    id: 'mr_memory_primary_secondary',
    conceptId: 'immunity_memory',
    triggerCodes: ['MISSING_MEMORY', 'WRONG_PRIMARY_SECONDARY', 'NO_MEMORY_CELLS'],
    titleAr: 'خلايا الذاكرة تجعل الاستجابة الثانية أسرع وأقوى',
    estimatedMinutes: 3,
    explanationAr: 'عند التعرض الأول للمستضد تتكون خلايا ذاكرة تبقى طويلاً. عند التعرض الثاني تتعرف عليها بسرعة وتكاثر وتتمايز إلى خلايا منتجة للأجسام المضادة.',
    activeQuestionAr: 'لماذا الاستجابة الثانية أسرع وأقوى من الأولى؟',
    acceptedEvidence: ['خلايا ذاكرة', 'استجابة ثانوية', 'أسرع', 'أقوى', 'ذاكرة مناعية'],
    nextAction: 'schedule_recall',
  },
  'p_s_liquid_core': {
    id: 'mr_p_s_liquid_core',
    conceptId: 'seismic_waves',
    triggerCodes: ['MISSING_S_DISAPPEARANCE', 'WRONG_LIQUID_CORE'],
    titleAr: 'الموجات P و S والنواة الخارجية السائلة',
    estimatedMinutes: 3,
    explanationAr: 'الموجات S لا تنتشر في السوائل، لذلك يختفي جزء S عند النواة الخارجية السائلة.',
    activeQuestionAr: 'لماذا تختفي موجات S عند النواة الخارجية؟',
    acceptedEvidence: ['موجات S', 'نواة خارجية', 'سائلة', 'موجات P'],
    nextAction: 'schedule_recall',
  },
};

export function getMicroRemediationByCode(code: string): MicroRemediation | undefined {
  return Object.values(MICRO_REMEDIATIONS).find((r) => r.triggerCodes.includes(code));
}
