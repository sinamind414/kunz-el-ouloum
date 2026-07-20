// src/data/documentPracticeContexts.ts
// P1.4 / V3 §3.2 — Contextes de pratique documentaire.
// Chaque document expose objectif, verbe, vocabulaire, preuve attendue, alt text.
// Ordre immuable (V3 §4.4) : type → objectif → verbe → donnée → observation → production.

import type { CoreReflexId } from './reflexes';

export type DocumentAssetType = 'curve' | 'table' | 'experiment' | 'schema' | 'mixed';

export interface DocumentPracticeContext {
  exerciseId: string;
  questionId: string;
  conceptId: string;
  unitId: number;
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
