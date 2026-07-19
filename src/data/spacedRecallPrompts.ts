// src/data/spacedRecallPrompts.ts
// V3 §5 / §4.5 — Rappels actifs espacés (J+1 → J+14) par concept.
// Affichés seulement quand une preuve réelle existe (jamais avant tentative).

import type { CoreReflexId } from './reflexes';

export interface SpacedRecallPrompt {
  stage: number; // 0..3 → J+1, J+3, J+7, J+14
  conceptId: string;
  questionAr: string;
  reflexId: CoreReflexId;
}

// Indexé par conceptId → prompts ordonnés par stage.
export const SPACED_RECALL_PROMPTS: Record<string, SpacedRecallPrompt[]> = {
  transcription: [
    { stage: 0, conceptId: 'transcription', questionAr: 'في أي اتجاه يُركّب ARNm؟', reflexId: 'explain' },
    { stage: 1, conceptId: 'transcription', questionAr: 'لماذا لا يخرج ADN من النواة؟', reflexId: 'explain' },
    { stage: 2, conceptId: 'transcription', questionAr: 'فسّر مسار اليوراسيل المشع (نواة → هيولى).', reflexId: 'interpret' },
    { stage: 3, conceptId: 'transcription', questionAr: 'اكتب إجابة BAC قصيرة: كيف تتحول المعلومة الوراثية إلى رسالة قابلة للترجمة؟', reflexId: 'validate' },
  ],
  traduction: [
    { stage: 0, conceptId: 'traduction', questionAr: 'ماذا يربط الكودون بالحمض الأميني؟', reflexId: 'explain' },
    { stage: 1, conceptId: 'traduction', questionAr: 'لماذا يكون مضاد الكودون ضرورياً؟', reflexId: 'explain' },
    { stage: 2, conceptId: 'traduction', questionAr: 'فسّر ترتيب الأحماض الأمينية في السلسلة الببتيدية.', reflexId: 'interpret' },
    { stage: 3, conceptId: 'traduction', questionAr: 'اكتب إجابة BAC قصيرة: كيف تُترجم رسالة ARNm؟', reflexId: 'validate' },
  ],
  enzymes: [
    { stage: 0, conceptId: 'enzymes', questionAr: 'كيف تتغير السرعة مع تركيز الركيزة؟', reflexId: 'analyse' },
    { stage: 1, conceptId: 'enzymes', questionAr: 'متى يبدأ التشبّع؟', reflexId: 'analyse' },
    { stage: 2, conceptId: 'enzymes', questionAr: 'فسّر استقرار المنحنى عند Vmax.', reflexId: 'interpret' },
    { stage: 3, conceptId: 'enzymes', questionAr: 'اكتب إجابة BAC قصيرة: علل استقرار السرعة.', reflexId: 'validate' },
  ],
};

export function getSpacedRecallPrompts(conceptId: string): SpacedRecallPrompt[] {
  return SPACED_RECALL_PROMPTS[conceptId] ?? [];
}
