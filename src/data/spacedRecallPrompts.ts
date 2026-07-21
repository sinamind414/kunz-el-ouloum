// src/data/spacedRecallPrompts.ts
// V3 §5 / §4.5 — Rappels actifs espacés (J+1 → J+14) par concept.
// Affichés seulement quand une preuve réelle existe (jamais avant tentative).

import type { CoreReflexId } from './reflexes';

export interface SpacedRecallPrompt {
  stage: number; // 0..3 → J+1, J+3, J+7, J+14
  conceptId: string;
  questionAr: string;
  reflexId: CoreReflexId;
  acceptedEvidence: string[];
  minEvidence: number;
}

// Indexé par conceptId → prompts ordonnés par stage.
export const SPACED_RECALL_PROMPTS: Record<string, SpacedRecallPrompt[]> = {
  transcription: [
    { stage: 0, conceptId: 'transcription', questionAr: 'في أي اتجاه يُركّب ARNm؟', reflexId: 'explain', acceptedEvidence: ['5', '3', 'ARNm'], minEvidence: 3 },
    { stage: 1, conceptId: 'transcription', questionAr: 'لماذا لا يخرج ADN من النواة؟', reflexId: 'explain', acceptedEvidence: ['ADN', 'النواة', 'ARNm', 'نسخة'], minEvidence: 3 },
    { stage: 2, conceptId: 'transcription', questionAr: 'فسّر مسار اليوراسيل المشع (نواة → هيولى).', reflexId: 'interpret', acceptedEvidence: ['النواة', 'الهيولى', 'ARNm', 'اليوراسيل'], minEvidence: 3 },
    { stage: 3, conceptId: 'transcription', questionAr: 'اكتب إجابة BAC قصيرة: كيف تتحول المعلومة الوراثية إلى رسالة قابلة للترجمة؟', reflexId: 'validate', acceptedEvidence: ['ADN', 'الاستنساخ', 'ARNm', 'الهيولى', 'الترجمة'], minEvidence: 3 },
  ],
  traduction: [
    { stage: 0, conceptId: 'traduction', questionAr: 'ماذا يربط الكودون بالحمض الأميني؟', reflexId: 'explain', acceptedEvidence: ['ARNt', 'مضاد الكودون', 'حمض أميني'], minEvidence: 2 },
    { stage: 1, conceptId: 'traduction', questionAr: 'لماذا يكون مضاد الكودون ضرورياً؟', reflexId: 'explain', acceptedEvidence: ['مضاد الكودون', 'الكودون', 'التكامل', 'ARNm'], minEvidence: 3 },
    { stage: 2, conceptId: 'traduction', questionAr: 'فسّر ترتيب الأحماض الأمينية في السلسلة الببتيدية.', reflexId: 'interpret', acceptedEvidence: ['الكودونات', 'ARNm', 'الأحماض الأمينية', 'الريبوزوم'], minEvidence: 3 },
    { stage: 3, conceptId: 'traduction', questionAr: 'اكتب إجابة BAC قصيرة: كيف تُترجم رسالة ARNm؟', reflexId: 'validate', acceptedEvidence: ['ARNm', 'الريبوزوم', 'ARNt', 'الكودون', 'سلسلة ببتيدية'], minEvidence: 3 },
  ],
  enzymes: [
    { stage: 0, conceptId: 'enzymes', questionAr: 'كيف تتغير السرعة مع تركيز الركيزة؟', reflexId: 'analyse', acceptedEvidence: ['السرعة', 'تركيز الركيزة', 'تزداد'], minEvidence: 3 },
    { stage: 1, conceptId: 'enzymes', questionAr: 'متى يبدأ التشبّع؟', reflexId: 'analyse', acceptedEvidence: ['التشبع', 'المواقع النشطة', 'الركيزة'], minEvidence: 2 },
    { stage: 2, conceptId: 'enzymes', questionAr: 'فسّر استقرار المنحنى عند Vmax.', reflexId: 'interpret', acceptedEvidence: ['Vmax', 'المواقع النشطة', 'مشغولة', 'التشبع'], minEvidence: 3 },
    { stage: 3, conceptId: 'enzymes', questionAr: 'اكتب إجابة BAC قصيرة: علل استقرار السرعة.', reflexId: 'validate', acceptedEvidence: ['السرعة', 'Vmax', 'المواقع النشطة', 'التشبع', 'الركيزة'], minEvidence: 3 },
  ],
  photosynthese: [
    { stage: 0, conceptId: 'photosynthese', questionAr: 'ما مقر التفاعلات الضوئية؟', reflexId: 'explain', acceptedEvidence: ['التيلاكويد', 'أغشية', 'الصانعة الخضراء'], minEvidence: 2 },
    { stage: 1, conceptId: 'photosynthese', questionAr: 'ما الفرق بين التيلاكويد والحشوة؟', reflexId: 'explain', acceptedEvidence: ['التيلاكويد', 'الحشوة', 'ضوء', 'CO2'], minEvidence: 3 },
    { stage: 2, conceptId: 'photosynthese', questionAr: 'فسّر دور الضوء في أغشية التيلاكويد.', reflexId: 'interpret', acceptedEvidence: ['الضوء', 'التيلاكويد', 'ATP', 'NADPH', 'طاقة'], minEvidence: 3 },
    { stage: 3, conceptId: 'photosynthese', questionAr: 'اكتب إجابة BAC قصيرة: علل مقر وآلية التفاعلات الضوئية.', reflexId: 'validate', acceptedEvidence: ['التيلاكويد', 'الضوء', 'ATP', 'NADPH', 'الحشوة', 'CO2'], minEvidence: 3 },
  ],
};

export function getSpacedRecallPrompts(conceptId: string): SpacedRecallPrompt[] {
  return SPACED_RECALL_PROMPTS[conceptId] ?? [];
}

export function getSpacedRecallPrompt(conceptId: string, stage: number): SpacedRecallPrompt | undefined {
  return getSpacedRecallPrompts(conceptId).find((prompt) => prompt.stage === stage);
}
