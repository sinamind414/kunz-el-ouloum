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
};

export function getLessonGoldSummary(lessonId: string): LessonGoldSummary | undefined {
  return LESSON_GOLD_SUMMARIES[lessonId];
}
