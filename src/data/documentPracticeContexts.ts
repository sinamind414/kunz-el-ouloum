// src/data/documentPracticeContexts.ts
// P1.4 / V3 §3.2 — Contextes de pratique documentaire.
// Chaque document expose objectif, verbe, vocabulaire, preuve attendue, alt text.
// Ordre immuable (V3 §4.4) : type → objectif → verbe → donnée → observation → production.

import type { CoreReflexId } from './reflexes';
import type { ValidationContext } from '../lib/validation/ValidationEngine';

export type DocumentAssetType = 'curve' | 'table' | 'experiment' | 'schema' | 'mixed';

export interface DocumentPracticeContext {
  exerciseId: string;
  questionId: string;
  conceptId: string;
  unitId: number;
  lessonId?: string;
  documentType: DocumentAssetType;
  reflexId?: CoreReflexId;
  goalAr: string;
  vocabulary: string[];
  expectedEvidence: string[];
  trapAr?: string;
  assetSrc?: string;
  altAr: string;
  // V3 §3.2 — étendu pour document vivant complet.
  sourceStatus?: 'manuel_officiel_verifie' | 'adaptation_pedagogique' | 'exercice_kunz' | 'a_valider_enseignant';
  documentTypeAr?: string;
  promptObserveAr?: string; // demande d'observer, pas de conclure
  promptProduceAr?: string; // production BAC
  hintsAr?: [string, string]; // [où regarder, quel lien]
  correctionAr?: string; // masquée avant tentative
  domain?: ValidationContext['domain'];
  criteria?: {
    evidence: string[];
    mechanism?: string[];
    conclusion?: string[];
  };
}

export const DOCUMENT_PRACTICE_CONTEXTS: DocumentPracticeContext[] = [
  {
    exerciseId: 'michaelis_courbe',
    questionId: 'michaelis_courbe_q1',
    conceptId: 'unit:3',
    unitId: 3,
    documentType: 'curve',
    reflexId: 'analyse',
    goalAr: 'فهم تغير سرعة التفاعل الإنزيمي حسب تركيز الركيزة إلى غاية التشبع.',
    vocabulary: ['الركيزة', 'السرعة', 'التشبع', 'الموقع النشط', 'Vmax'],
    expectedEvidence: [
      'تزداد السرعة مع التركيز',
      'تبلغ السرعة قيمة قصوى',
      'تستقر السرعة عند التشبع',
    ],
    trapAr: 'لا تقل إن الإنزيم يختفي عند بلوغ Vmax.',
    altAr: 'منحنى يصعد مع تركيز الركيزة ثم يستوي أفقياً عند سرعة قصوى.',
  },
  {
    exerciseId: 'curare_table',
    questionId: 'curare_table_q1',
    conceptId: 'unit:1',
    unitId: 1,
    documentType: 'table',
    reflexId: 'analyse',
    goalAr: 'ربط تغير الانقباض العضلي بتأثير الكورار على المستقبلات النيكوتينية.',
    vocabulary: ['الكورار', 'أستيل كولين', 'مستقبل نيكوتيني', 'قناة مرتبطة بالربيطة', 'انقباض'],
    expectedEvidence: [
      'زيادة تركيز الكورار',
      'انخفاض الانقباض',
      'بقاء/تغير الاستجابة حسب الشروط',
    ],
    trapAr: 'الكورار يمنع الارتباط ولا يدمر الناقل.',
    altAr: 'جدول يوضح انخفاض قوة الانقباض كلما زاد تركيز الكورار.',
  },
  {
    exerciseId: 'nmj_ppm_courbe',
    questionId: 'nmj_ppm_courbe_q1',
    conceptId: 'unit:5',
    unitId: 5,
    documentType: 'curve',
    reflexId: 'analyse',
    goalAr: 'فهم علاقة تركيز الناقل بزمن كمون اللوحة المحركة.',
    vocabulary: ['PPM', 'ناقل عصبي', 'أستيل كولين', 'مستقبل', 'قناة كيميائية'],
    expectedEvidence: [
      'علاقة تركيز الناقل بزمن الكمون',
      'قصر الكمون مع زيادة التركيز',
    ],
    trapAr: 'لا تخلط PPM مع PPSE أو PPSI.',
    altAr: 'منحنى يربط تركيز الناقل بزمن كمون اللوحة المحركة.',
  },
  {
    exerciseId: 'sarin_gb_double',
    questionId: 'sarin_gb_double_q1',
    conceptId: 'unit:5',
    unitId: 5,
    documentType: 'experiment',
    reflexId: 'hypothesize',
    goalAr: 'تحديد آلية تأثير السارين على النقل المشبكي.',
    vocabulary: ['AChE', 'أستيل كولين', 'تثبيط إنزيمي', 'شق مشبكي', 'كمون عمل'],
    expectedEvidence: [
      'بقاء الأستيل كولين',
      'غياب نواتج التفكيك',
      'وجود الإنزيم مع غياب نشاطه',
    ],
    trapAr: 'السارين يثبّط AChE ولا يدمر الناقل مباشرة.',
    altAr: 'وثيقة تجريبية تظهر استمرار الأستيل كولين في الشق المشبكي عند التسمم بالسارين.',
  },
  {
    exerciseId: 'rifamycine_h1h2',
    questionId: 'rifamycine_h1h2_q1',
    conceptId: 'unit:1',
    unitId: 1,
    documentType: 'table',
    reflexId: 'hypothesize',
    goalAr: 'ربط تأثير الريفاميسين بتثبيط الاستنساخ وتشكيل ARNm.',
    vocabulary: ['ARN بوليميراز', 'ADN', 'ARNm', 'الاستنساخ', 'تثبيط'],
    expectedEvidence: [
      'تثبيط الاستنساخ',
      'غياب تشكل ARNm',
      'ارتباط الريفاميسين بالبوليميراز',
    ],
    trapAr: 'الريفاميسين يمنع الاستنساخ ولا يمنع الترجمة مباشرة.',
    altAr: 'جدول يوضح غياب حلقات H1 وH2 (ARNm) عند إضافة الريفاميسين.',
  },
  // V3 US-V3-02 — Document vivant uracile marqué (pilote transcription).
  {
    exerciseId: 'uracile_marque',
    questionId: 'uracile_marque_q1',
    conceptId: 'transcription',
    unitId: 1,
    documentType: 'experiment',
    reflexId: 'interpret',
    domain: 'genetique',
    sourceStatus: 'adaptation_pedagogique',
    documentTypeAr: 'تجربة تتبّع اليوراسيل المشع',
    goalAr: 'تفسير مسار ظهور اليوراسيل المشع من النواة إلى الهيولى.',
    vocabulary: ['اليوراسيل', 'النواة', 'الهيولى', 'ARNm', 'الاستنساخ'],
    expectedEvidence: [
      'ظهور الوسم أولاً في النواة',
      'ظهور الوسم لاحقاً في الهيولى',
      'انتقال المعلومة عبر ARNm',
    ],
    trapAr: 'لا تقل إن ADN يخرج من النواة.',
    altAr: 'تجربة: خلية بنواة مشعة، وسّم يظهر في النواة ثم في الهيولى بعد مدة أطول.',
    promptObserveAr: 'أين يظهر الوسم أولاً؟ ثم أين يظهر لاحقاً؟',
    promptProduceAr: 'فسّر ماذا يدل انتقال الوسم من النواة إلى الهيولى.',
    hintsAr: [
      'ركّز على كلمتي: أولاً / لاحقاً.',
      'ما الجزيء الذي يحتوي اليوراسيل ولا يحتوي التايمين؟',
    ],
    correctionAr:
      'يظهر الوسم أولاً في النواة حيث يُركّب ARNm (يحتوي اليوراسيل). ثم يظهر في الهيولى لأن ARNm يحمل نسخة المعلومة. هذا يدل على نسخ المعلومة في النواة ثم نقلها.',
    criteria: {
      evidence: ['أولاً في النواة', 'اولا في النواة', 'لاحقاً في الهيولى', 'لاحقا في الهيولى'],
      mechanism: ['يُركّب ARNm', 'يركب ARNm', 'استنساخ ARNm', 'ينتقل ARNm', 'انتقال ARNm'],
      conclusion: ['المعلومة تُنسخ ثم تُنقل', 'المعلومة تنسخ ثم تنقل', 'يحمل نسخة المعلومة', 'ينقل نسخة المعلومة'],
    },
  },
  {
    exerciseId: 'photosynthese_cycle',
    questionId: 'photosynthese_cycle_q1',
    conceptId: 'photosynthese',
    unitId: 6,
    documentType: 'schema',
    reflexId: 'analyse',
    domain: 'metabo',
    sourceStatus: 'adaptation_pedagogique',
    documentTypeAr: 'مخطط الصانعة الخضراء ودور التيلاكويد',
    goalAr: 'تحديد موقع التفاعلات الضوئية وربطها بإنتاج ATP و NADPH.',
    vocabulary: ['التيلاكويد', 'الحشوة', 'الضوء', 'CO2', 'ATP', 'NADPH', 'الغلوكوز'],
    expectedEvidence: [
      'التفاعلات الضوئية على التيلاكويد',
      'إنتاج ATP و NADPH',
      'تثبيت CO2 في الحشوة',
    ],
    trapAr: 'لا تخلط بين التيلاكويد (ضوء) والحشوة (تثبيت CO2).',
    altAr: 'مخطط يظهر التيلاكويد (أغشية مكدّسة) والحشوة (فضاء داخلي) داخل الصانعة الخضراء.',
    promptObserveAr: 'أين يحدث التقاط الفوتونات وتحليل الماء؟',
    promptProduceAr: 'حلّل دور التيلاكويد في تحويل الطاقة الضوئية.',
    hintsAr: [
      'انظر إلى الأغشية المكدّسة داخل الصانعة الخضراء.',
      'ما هو المنتج الأولي للطاقة الضوئية؟',
    ],
    correctionAr:
      'التفاعلات الضوئية تتم على أغشية التيلاكويد حيث يُنتج ATP و NADPH ويُنشر O2. أما تثبيت CO2 فيتم في الحشوة/السدى لإنتاج الغلوكوز.',
    criteria: {
      evidence: ['التيلاكويد', 'أغشية التيلاكويد', 'الضوء', 'الفوتونات'],
      mechanism: ['ATP', 'NADPH', 'تحليل الماء', 'ينتج O2'],
      conclusion: ['طاقة ضوئية → طاقة كيميائية', 'تثبيت CO2 في الحشوة'],
    },
  },
  {
    exerciseId: 'synapse_integration',
    questionId: 'synapse_integration_q1',
    conceptId: 'synapse',
    unitId: 5,
    documentType: 'experiment',
    reflexId: 'interpret',
    sourceStatus: 'adaptation_pedagogique',
    documentTypeAr: 'تسجيلات لكمونات بعد مشبكية',
    goalAr: 'تفسير كيف يسمح الإدماج الزماني أو المكاني ببلوغ العتبة وتوليد كمون عمل.',
    vocabulary: ['PPSE', 'PPSI', 'العتبة', 'القطعة الابتدائية', 'إدماج زماني', 'إدماج مكاني'],
    expectedEvidence: [
      'PPSE واحد دون العتبة',
      'تجمع الكمونات بعد المشبكية',
      'بلوغ العتبة وتولد كمون عمل'
    ],
    trapAr: 'لا تقل إن PPSE واحد يولد دائماً كمون عمل.',
    altAr: 'مخطط يظهر محصلة الكمونات بعد مشبكية متعددة عند القطعة الابتدائية.',
    promptObserveAr: 'قارن بين تنبيه واحد وتنبيهات متقاربة: متى تبلغ المحصلة العتبة؟',
    promptProduceAr: 'فسّر لماذا لا يولد PPSE واحد كمون عمل دائماً، وكيف يؤدي الإدماج إلى بلوغ العتبة.',
    hintsAr: [
      'ابدأ بمقارنة محصلة الكمونات مع قيمة العتبة.',
      'اربط تزامن أو تقارب التنبيهات بتجمع PPSE عند القطعة الابتدائية.'
    ],
    correctionAr:
      'لا يولد PPSE واحد كمون عمل إذا بقي دون العتبة. عند تزامن أو تقارب عدة PPSE يحدث إدماج زماني أو مكاني، فتبلغ المحصلة العتبة على مستوى القطعة الابتدائية ويتولد كمون عمل.',
    criteria: {
      evidence: ['PPSE واحد دون العتبة', 'تجمع الكمونات', 'بلوغ العتبة'],
      mechanism: ['إدماج زماني', 'إدماج مكاني', 'القطعة الابتدائية'],
      conclusion: ['يتولد كمون عمل', 'بلوغ العتبة'],
    },
  },
  {
    exerciseId: 'subduction_water_melting',
    questionId: 'subduction_water_melting_q1',
    conceptId: 'subduction',
    unitId: 9,
    documentType: 'schema',
    reflexId: 'interpret',
    domain: 'tectonique',
    sourceStatus: 'adaptation_pedagogique',
    documentTypeAr: 'مخطط الغوص — تحرير الماء وانصهار الوشاح',
    goalAr: 'تفسير كيف يؤدي غوص اللوح المحيطي إلى تحرير الماء ثم انصهار جزئي للوشاح فوق اللوح الغائص.',
    vocabulary: ['اندساس', 'ماء', 'انصهار جزئي', 'وشاح', 'صهارة', 'بركانية'],
    expectedEvidence: [
      'اندساس الصفيحة المحيطية',
      'تحرير الماء من اللوح الغائص',
      'انصهار جزئي للوشاح',
      'تولد صهارة وبركانية',
    ],
    trapAr: 'لا تنصهر الصفيحة المحيطية الغائصة بالكامل مباشرة لتولد الصهارة.',
    altAr: 'مخطط يظهر اللوح المحيطي الغائص، الماء المتحرر، وانصهار الوشاح فوقه.',
    promptObserveAr: 'ما الذي يتحرر من اللوح الغائص عند الغوص العميق؟',
    promptProduceAr: 'فسّر كيف يساهم الماء المحرر من اللوح الغائص في تولد الصهارة والبركانية فوق الصفيحة الطافية.',
    hintsAr: [
      'انظر إلى معادن ماء محررة من اللوح الغائص.',
      'ما هي نقطة انصهار الوشاح في وجود الماء؟',
    ],
    correctionAr:
      'عند اندساس الصفيحة المحيطية الباردة الكثيفة تتحرر معادن ماء من الصخور الغائصة. هذا الماء يخفض درجة انصهار الوشاح فوق اللوح الغائص فيحدث انصهار جزئي يولد صهارة أنديزيتية تصعد وتغذي بركانية القوس.',
    criteria: {
      evidence: ['اندساس', 'ماء محرر', 'انصهار جزئي', 'صهارة'],
      mechanism: ['الماء يخفض درجة الانصهار', 'الوشاح فوق اللوح الغائص', 'صهارة أنديزيتية'],
      conclusion: ['بركانية القوس', 'تولد صهارة بسبب الماء'],
    },
  },
];

export function getDocumentPracticeContext(
  exerciseId: string,
  questionId: string
): DocumentPracticeContext | undefined {
  return DOCUMENT_PRACTICE_CONTEXTS.find(
    (c) => c.exerciseId === exerciseId && c.questionId === questionId
  );
}

// V3 US-V3-02 — récupère un contexte documentaire par exerciseId (pilote transcription).
export function getDocumentPracticeContextByExercise(exerciseId: string): DocumentPracticeContext | undefined {
  return DOCUMENT_PRACTICE_CONTEXTS.find((c) => c.exerciseId === exerciseId);
}
