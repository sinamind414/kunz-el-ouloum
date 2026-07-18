// src/data/documentPracticeContexts.ts
// P1.4 — Contextes de pratique documentaire (Speckit DOCUMENTS_VIVANTS §2-§3).
// Chaque document expose objectif, verbe, vocabulaire, preuve attendue, alt text.

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
];

export function getDocumentPracticeContext(
  exerciseId: string,
  questionId: string
): DocumentPracticeContext | undefined {
  return DOCUMENT_PRACTICE_CONTEXTS.find(
    (c) => c.exerciseId === exerciseId && c.questionId === questionId
  );
}
