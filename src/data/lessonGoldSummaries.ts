// src/data/lessonGoldSummaries.ts
// V3 — Résumés d'Or (Speckit V3 §3.1). Source de vérité unique des résumés.
// Statut éditorial honnête et traçable : jamais « validé par un professeur »
// sans reviewedBy / reviewedAt réels. Les résumés non relus sont « شرح Kunz ».

export type EditorialStatus =
  | 'manuel_officiel_verifie'
  | 'adaptation_pedagogique'
  | 'a_valider_enseignant';

export interface LessonGoldSummary {
  lessonId: string;
  status: EditorialStatus;
  source?: {
    edition?: string;
    pages?: number[];
    sourceLabel?: string;
  };
  missionAr: string;
  mechanismAr: string[]; // 4 à 6 étapes causales
  evidenceAr: string; // preuve documentaire à reconnaître
  vocabulary: string[]; // 4 à 8 termes
  bacSentenceFrameAr?: string; // structure de réponse, non corrigé
  commonErrorAr: string;
  recallQuestionAr: string;
  review?: {
    reviewed: boolean;
    reviewedBy?: string;
    reviewedAt?: string;
    note?: string;
  };
}

export const LESSON_GOLD_SUMMARIES: Record<string, LessonGoldSummary> = {
  'd1-u1-l2-transcription': {
    lessonId: 'd1-u1-l2-transcription',
    status: 'adaptation_pedagogique',
    source: { sourceLabel: 'Résumé Kunz — programme BAC SVT Algérie' },
    missionAr: 'كيف تتحول المعلومة الوراثية الموجودة في ADN إلى رسالة ARNm قابلة للترجمة؟',
    mechanismAr: [
      'يفتح الإنزيم موضع البدء على سلسلة ADN القالبية',
      'تقرأ ARN بوليميراز السلسلة القالبية من 3′ نحو 5′',
      'تُركّب سلسلة ARNm في اتجاه 5′ نحو 3′',
      'تظهر القواعد النووية (A,U,G,C) مكان (T,A,C,G)',
      'ينفصل ARNm عن ADN ويخرج نحو الهيولى',
    ],
    evidenceAr: 'ظهور اليوراسيل (U) في ARNm دليل على النسخ لا النسخ العكسي.',
    vocabulary: ['ADN', 'ARN بوليميراز', 'السلسلة القالبية', 'ARNm', 'اليوراسيل', 'النواة', 'الهيولى'],
    bacSentenceFrameAr: 'تتم العملية داخل ______ حيث يركب ______ سلسلة ______ انطلاقا من ______.',
    commonErrorAr: 'الخلط بين ADN (يبقى في النواة) و ARNm (يحمل النسخة إلى الهيولى).',
    recallQuestionAr: 'في أي اتجاه يُركّب ARNm؟',
    review: { reviewed: false },
  },
  'd1-u1-l3-traduction': {
    lessonId: 'd1-u1-l3-traduction',
    status: 'adaptation_pedagogique',
    source: { sourceLabel: 'Résumé Kunz — programme BAC SVT Algérie' },
    missionAr: 'كيف تُترجم رسالة ARNm إلى سلسلة ببتيدية على الريبوزوم؟',
    mechanismAr: [
      'يرتبط ARNm بالريبوزوم عند الكودون AUG',
      'يحمل ARNt الحمض الأميني الموافق للكودون',
      'يقرأ الريبوزوم الكودون ويربطه بمضاد الكودون',
      'تتشكل روابط ببتيدية بين الأحماض الأمينية',
      'يتوقف التركيب عند كودون توقف',
    ],
    evidenceAr: 'مطابقة الكودون بـ مضاد الكودون تضمن ترتيب الأحماض الأمينية.',
    vocabulary: ['الريبوزوم', 'ARNt', 'الكودون', 'مضاد الكودون', 'الحمض الأميني', 'السلسلة الببتيدية'],
    bacSentenceFrameAr: 'يقرأ الريبوزوم ______ ويربطه بـ ______ الحامل للحمض الأميني.',
    commonErrorAr: 'الخلط بين الكودون (على ARNm) ومضاد الكودون (على ARNt).',
    recallQuestionAr: 'ماذا يربط الكودون بالحمض الأميني؟',
    review: { reviewed: false },
  },
  'd1-u3-l1-enzyme': {
    lessonId: 'd1-u3-l1-enzyme',
    status: 'adaptation_pedagogique',
    source: { sourceLabel: 'Résumé Kunz — programme BAC SVT Algérie' },
    missionAr: 'كيف تتغير سرعة تفاعل إنزيمي مع تركيز الركيزة ثم تستقر؟',
    mechanismAr: [
      'تزداد تركيز الركيزة المتاحة',
      'تزداد احتمال ارتباط الركيزة بالموقع النشط',
      'يتشكّل معقد إنزيم-ركيزة',
      'تقترب المواقع النشطة من التشبّع',
      'تستقر السرعة عند Vmax لأن المواقع جميعها مشغولة',
    ],
    evidenceAr: 'الاستقرار الأفقي للمنحنى عند Vmax دليل على تشبّع المواقع النشطة.',
    vocabulary: ['الركيزة', 'الموقع النشط', 'التشبّع', 'Vmax', 'السرعة', 'الإنزيم'],
    bacSentenceFrameAr: 'تزداد السرعة مع ______ ثم تستقر عند ______ لأن المواقع النشطة ______.',
    commonErrorAr: 'القول إن الإنزيم يختفي عند Vmax (il reste, seuls les sites sont saturés).',
    recallQuestionAr: 'لماذا تستقر السرعة عند Vmax؟',
    review: { reviewed: false },
  },
  'phase11_chapitres_21_22': {
    lessonId: 'phase11_chapitres_21_22',
    status: 'adaptation_pedagogique',
    source: { sourceLabel: 'Résumé Kunz — programme BAC SVT Algérie' },
    missionAr: 'كيف يحوّل الصانعة الخضراء الطاقة الضوئية إلى طاقة كيميائية؟',
    mechanismAr: [
      'يمتص الثايلاكويد الفوتونات',
      'ينشطر الماء وينطلق O2',
      'يتشكّل ATP و NADPH',
      'يُثبّت CO2 في الحشوة/السدى',
      'ينتج الغلوكوز والمادة العضوية',
    ],
    evidenceAr: 'التفاعلات الضوئية تحدث على أغشية التيلاكويد.',
    vocabulary: ['الصانعة الخضراء', 'التيلاكويد', 'الحشوة', 'الضوء', 'CO2', 'ATP', 'NADPH', 'الغلوكوز'],
    bacSentenceFrameAr: 'تتم التفاعلات الضوئية في ______ بينما يتم تثبيت CO2 في ______.',
    commonErrorAr: 'الخلط بين التيلاكويد (ضوء) والحشوة/السدى (تثبيت CO2).',
    recallQuestionAr: 'أين تتم التفاعلات الضوئية؟',
    review: { reviewed: false },
  },
  'synapse': {
    lessonId: 'synapse',
    status: 'adaptation_pedagogique',
    source: { sourceLabel: 'Résumé Kunz — programme BAC SVT Algérie' },
    missionAr: 'كيف يتحوّل التنبيه الكهربائي عند المشبك إلى رسالة كيميائية ثم كهربائية بعد مشبكية؟',
    mechanismAr: [
      'يصل كمون العمل إلى النهاية قبل المشبكية',
      'تنفتح قنوات Ca²⁺ الفولطية ويدخل الكالسيوم',
      'تندمج الحويصلات المشبكية ويُفرز الناقل العصبي',
      'يرتبط الناقل بمستقبلات نوعية على الغشاء بعد المشبكي',
      'يُفتح قنوات أيونية محدثة PPSE أو PPSI',
    ],
    evidenceAr: 'دخول Ca²⁺ إلى النهاية قبل المشبكية يسبب إفراز الناقل العصبي في الشق المشبكي.',
    vocabulary: ['كمون العمل', 'Ca²⁺', 'حويصلات مشبكية', 'ناقل عصبي', 'شق مشبكي', 'PPSE', 'PPSI'],
    bacSentenceFrameAr: 'عند وصول كمون العمل إلى النهاية قبل المشبكية، يدخل ______ مما يسبب إفراز ______ في ______.',
    commonErrorAr: 'الخلط بين PPSE (تنبيهي) و PPSI (تثبيطي)، أو اعتبار أن الإشارة تبقى كهربائية.',
    recallQuestionAr: 'ما هو دور Ca²⁺ في النقل المشبكي؟',
    review: { reviewed: false },
  },
  'subduction': {
    lessonId: 'subduction',
    status: 'adaptation_pedagogique',
    source: { sourceLabel: 'Résumé Kunz — programme BAC SVT Algérie' },
    missionAr: 'كيف يؤدي غوص صفيحة محيطية إلى تشكل صهارة ونشاط بركاني فوق الصفيحة الطافية؟',
    mechanismAr: [
      'صفيحة محيطية باردة وكثيفة تنغرز',
      'معادن مميهات تتحول في العمق',
      'يتحرر الماء من اللوح الغائص',
      'يخفض الماء درجة انصهار الوشاح فوق اللوح الغائص',
      'يتولد صهارة أنديزيتية وتصعد',
      'تغذي البركانية على الصفيحة الطافية',
    ],
    evidenceAr: 'الماء المحرر من اللوح الغائص يخفض درجة انصهار الوشاح ويولد صهارة أنديزيتية.',
    vocabulary: ['اندساس', 'ماء', 'انصهار جزئي', 'وشاح', 'صهارة', 'بركانية'],
    bacSentenceFrameAr: 'عند اندساس ______ يتحرر ______ مما يخفض درجة انصهار ______ ويتولد ______.',
    commonErrorAr: 'الاعتقاد أن الصفيحة المحيطية تنصهر بالكامل لتولد الصهارة.',
    recallQuestionAr: 'كيف يساهم الماء المحرر من اللوح الغائص في تولد الصهارة؟',
    review: { reviewed: false },
  },
  'protein_structure_function': {
    lessonId: 'protein_structure_function',
    status: 'adaptation_pedagogique',
    source: { sourceLabel: 'Résumé Kunz — programme BAC SVT Algérie' },
    missionAr: 'كيف يؤدي تغير في تتابع الأحماض الأمينية إلى تغير وظيفة البروتين؟',
    mechanismAr: [
      'يحدد تتابع الأحماض الأمينية البنية الأولية',
      'تنطوي السلسلة إلى بنية ثانوية وثالثية',
      'يتشكّل الموقع النشط من بنية 3D',
      'تغير حمض أميني حاسم يغيّر الموقع النشط',
      'تتغير الوظيفة البيولوجية أو يظهر المرض',
    ],
    evidenceAr: 'طفرة نقطية في جين الهيموغلوبين تغير حمضاً أمينياً واحداً وتغير وظيفة البروتين.',
    vocabulary: ['تتابع الأحماض الأمينية', 'البنية الأولية', 'البنية الثانوية', 'البنية الثالثية', 'الموقع النشط', 'الطفرات', 'الوظيفة'],
    bacSentenceFrameAr: 'يتغير ______ بسبب طفرة في ______ مما يغيّر ______ ويؤدي إلى ______.',
    commonErrorAr: 'الاعتقاد أن كل تغير في الحمض الأميني يغير الوظيفة؛ بعض الطفرات محايدة.',
    recallQuestionAr: 'ما العلاقة بين البنية والوظيفة البروتينية؟',
    review: { reviewed: false },
  },
  'immunity_self_nonself': {
    lessonId: 'immunity_self_nonself',
    status: 'adaptation_pedagogique',
    source: { sourceLabel: 'Résumé Kunz — programme BAC SVT Algérie' },
    missionAr: 'كيف يميز الجهاز المناعي بين الذات واللاذات ولماذا قد يرفض طعماً غير متوافق؟',
    mechanismAr: [
      'تحمل خلايا الجسم جزيئات CMH على سطحها',
      'تتعرف اللمفاويات T على CMH الذاتي',
      'خلايا الطوع تحمل CMH مختلف',
      'تتعرف المناعة على الخلايا الغريبة',
      'تحدث استجابة رفض الطعم',
    ],
    evidenceAr: 'اختلاف جزيئات CMH بين المعطي والمستقبل يسبب رفض الطعم غير المتوافق.',
    vocabulary: ['الذات', 'اللاذات', 'CMH', 'مستضد', 'طعم', 'رفض'],
    bacSentenceFrameAr: 'عندما يختلف ______ بين المعطي والمستقبل، يتعرف الجهاز المناعي على الطعم ك______.',
    commonErrorAr: 'الاعتقاد أن رفض الطعم يعتمد فقط على فصيلة الدم.',
    recallQuestionAr: 'لماذا يرفض الجسم طعماً غير متوافق؟',
    review: { reviewed: false },
  },
  'immunity_humoral_response': {
    lessonId: 'immunity_humoral_response',
    status: 'adaptation_pedagogique',
    source: { sourceLabel: 'Résumé Kunz — programme BAC SVT Algérie' },
    missionAr: 'كيف تؤدي اللمفاويات B إلى إنتاج أجسام مضادة نوعية ضد مستضد؟',
    mechanismAr: [
      'تتعرف اللمفاوية B على المستضد النوعي',
      'ينشط المستضد اللمفاوية B',
      'تتكاثر اللمفاوية B تكاثراً نسيلياً',
      'تتمايز إلى خلايا بلازمية',
      'تفرز الخلايا البلازمية أجساماً مضادة نوعية',
    ],
    evidenceAr: 'الانتباه والتكاثر النسيلي للـLB ينتج خلايا بلازمية تفرز أجساماً مضادة نوعية.',
    vocabulary: ['لمفاوية B', 'انتقاء نسيلي', 'تكاثر نسيلي', 'خلية بلازمية', 'جسم مضاد', 'معقد مناعي'],
    bacSentenceFrameAr: 'بعد تعرف ______ على ______ تتكاثر وتتمايز إلى ______ تفرز ______.',
    commonErrorAr: 'الاعتقاد أن الأجسام المضادة تفرزها الخلايا اللمفاوية B مباشرة دون تمايز.',
    recallQuestionAr: 'من يفرز الأجسام المضادة؟',
    review: { reviewed: false },
  },
  'immunity_cellular_response': {
    lessonId: 'immunity_cellular_response',
    status: 'adaptation_pedagogique',
    source: { sourceLabel: 'Résumé Kunz — programme BAC SVT Algérie' },
    missionAr: 'كيف تقصي اللمفاويات T الخلايا المصابة أو غير الذاتية؟',
    mechanismAr: [
      'تتعرف اللمفاوية T على المحدد المستضدي',
      'يرتبط المستقبل بالعرض النسيجي',
      'تنشط اللمفاوية T السامة',
      'تفرز مادة سامة تقتل الخلية الهدف',
      'تتم إزالة الخلايا المصابة',
    ],
    evidenceAr: 'التعرف النوعي لللمفاويات T على الخلية الهدف يؤدي إلى إقصاء خلوي مباشر.',
    vocabulary: ['لمفاوية T', 'خلية هدف', 'CMH', 'محدد مستضدي', 'تعرف نوعي', 'إقصاء خلوي'],
    bacSentenceFrameAr: 'تتعرف ______ على ______ presenting ______ فتؤدي إلى ______.',
    commonErrorAr: 'الاعتقاد أن الاستجابة الخلوية تعتمد على الأجسام المضادة.',
    recallQuestionAr: 'ما الفرق بين الاستجابة الخلطية والاستجابة الخلوية؟',
    review: { reviewed: false },
  },
  'seismic_waves': {
    lessonId: 'seismic_waves',
    status: 'adaptation_pedagogique',
    source: { sourceLabel: 'Résumé Kunz — programme BAC SVT Algérie' },
    missionAr: 'كيف تكشف الأمواج P وS عن بنية باطن الأرض؟',
    mechanismAr: [
      'تنطلق موجات P وS من البؤرة الزلزالية',
      'تتغير سرعتهما واتجاههما عند الانقطاعات',
      'تنتشر موجات P في الأوساط الصلبة والسائلة',
      'لا تنتشر موجات S في الأوساط السائلة',
      'يكشف اختفاء موجات S أن النواة الخارجية سائلة',
    ],
    evidenceAr: 'اختفاء موجات S عند حد غوتنبرغ وتغير سرعة موجات P يكشفان طبيعة النواة الخارجية.',
    vocabulary: ['موجات P', 'موجات S', 'انقطاع غوتنبرغ', 'نواة خارجية', 'وسط سائل'],
    bacSentenceFrameAr: 'تختفي موجات ______ عند ______ لأنها لا تنتشر في وسط ______.',
    commonErrorAr: 'الموجات P لا تختفي في السائل مثل موجات S، بل تنكسر وتتغير سرعتها.',
    recallQuestionAr: 'لماذا لا تنتشر موجات S في النواة الخارجية؟',
    review: { reviewed: false },
  },
};

export function getLessonGoldSummary(lessonId: string): LessonGoldSummary | undefined {
  return LESSON_GOLD_SUMMARIES[lessonId];
}
