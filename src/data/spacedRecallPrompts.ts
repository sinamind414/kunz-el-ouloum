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
  synapse: [
    { stage: 0, conceptId: 'synapse', questionAr: 'ما الفرق بين PPSE و PPSI؟', reflexId: 'explain', acceptedEvidence: ['PPSE', 'PPSI', 'تنبيهي', 'تثبيطي', 'عتبة'], minEvidence: 3 },
    { stage: 1, conceptId: 'synapse', questionAr: 'أين يحدث الإدماج العصبي؟', reflexId: 'explain', acceptedEvidence: ['إدماج عصبي', 'تكامل', 'قطعة ابتدائية', 'كمون عمل'], minEvidence: 3 },
    { stage: 2, conceptId: 'synapse', questionAr: 'لماذا لا يولد PPSE واحد دائماً كمون عمل؟', reflexId: 'interpret', acceptedEvidence: ['PPSE', 'عتبة', 'تكامل', 'كمون عمل'], minEvidence: 3 },
    { stage: 3, conceptId: 'synapse', questionAr: 'فسّر كيف يؤدي الإدماج الزماني أو المكاني إلى بلوغ العتبة.', reflexId: 'validate', acceptedEvidence: ['إدماج زماني', 'إدماج مكاني', 'عتبة', 'PPSE', 'كمون عمل'], minEvidence: 3 },
  ],
  subduction: [
    { stage: 0, conceptId: 'subduction', questionAr: 'ما معنى الاندساس؟', reflexId: 'explain', acceptedEvidence: ['اندساس', 'صفيحة محيطية', 'أكثف', 'باردة'], minEvidence: 3 },
    { stage: 1, conceptId: 'subduction', questionAr: 'ما دور الماء المحرر من اللوح الغائص؟', reflexId: 'explain', acceptedEvidence: ['ماء', 'انصهار', 'وشاح', 'درجة انصهار'], minEvidence: 3 },
    { stage: 2, conceptId: 'subduction', questionAr: 'لماذا يحدث الانصهار الجزئي فوق اللوح الغائص؟', reflexId: 'interpret', acceptedEvidence: ['ماء', 'انصهار جزئي', 'وشاح', 'صهارة'], minEvidence: 3 },
    { stage: 3, conceptId: 'subduction', questionAr: 'فسّر العلاقة بين الاندساس والمغماطية والبركانية.', reflexId: 'validate', acceptedEvidence: ['اندساس', 'ماء', 'انصهار', 'صهارة', 'بركانية', 'قوس'], minEvidence: 3 },
  ],
  protein_structure_function: [
    { stage: 0, conceptId: 'protein_structure_function', questionAr: 'ما الذي يحدد البنية الأولية للبروتين؟', reflexId: 'explain', acceptedEvidence: ['تتابع الأحماض الأمينية', 'البنية الأولية', 'الجين', 'الطفرات'], minEvidence: 3 },
    { stage: 1, conceptId: 'protein_structure_function', questionAr: 'كيف يؤثر تغير حمض أميني على البنية الفراغية؟', reflexId: 'explain', acceptedEvidence: ['بنية ثالثية', 'طية', 'موقع نشط', 'شكل'], minEvidence: 3 },
    { stage: 2, conceptId: 'protein_structure_function', questionAr: 'ما العلاقة بين البنية والوظيفة البروتينية؟', reflexId: 'interpret', acceptedEvidence: ['بنية', 'وظيفة', 'موقع نشط', 'تفاعل'], minEvidence: 3 },
    { stage: 3, conceptId: 'protein_structure_function', questionAr: 'اكتب جواب BAC قصير: كيف تؤدي الطفرة إلى تغير وظيفي؟', reflexId: 'validate', acceptedEvidence: ['طفرة', 'حمض أميني', 'بنية', 'وظيفة', 'مرض'], minEvidence: 3 },
  ],
  immunity_self_nonself: [
    { stage: 0, conceptId: 'immunity_self_nonself', questionAr: 'ما المقصود بالذات واللاذات؟', reflexId: 'explain', acceptedEvidence: ['ذات', 'لاذات', 'CMH', 'خلايا'], minEvidence: 3 },
    { stage: 1, conceptId: 'immunity_self_nonself', questionAr: 'ما دور CMH في التعرف المناعي؟', reflexId: 'explain', acceptedEvidence: ['CMH', 'تعرف مناعي', 'ذات', 'لاذات'], minEvidence: 3 },
    { stage: 2, conceptId: 'immunity_self_nonself', questionAr: 'لماذا يرفض الجسم طعماً غير متوافق؟', reflexId: 'interpret', acceptedEvidence: ['CMH', 'رفض', 'طعم', 'تعرف'], minEvidence: 3 },
    { stage: 3, conceptId: 'immunity_self_nonself', questionAr: 'فسّر العلاقة بين اختلاف CMH ورفض الطعم.', reflexId: 'validate', acceptedEvidence: ['CMH', 'اختلاف', 'رفض', 'طعم', 'استجابة مناعية'], minEvidence: 3 },
  ],
  immunity_humoral_response: [
    { stage: 0, conceptId: 'immunity_humoral_response', questionAr: 'من يفرز الأجسام المضادة؟', reflexId: 'explain', acceptedEvidence: ['خلية بلازمية', 'لمفاوية B', 'جسم مضاد'], minEvidence: 2 },
    { stage: 1, conceptId: 'immunity_humoral_response', questionAr: 'ما الفرق بين اللمفاوية B والخلية البلازمية؟', reflexId: 'explain', acceptedEvidence: ['لمفاوية B', 'خلية بلازمية', 'تمايز', 'إفراز'], minEvidence: 3 },
    { stage: 2, conceptId: 'immunity_humoral_response', questionAr: 'كيف يؤدي الانتقاء النسيلي إلى استجابة نوعية؟', reflexId: 'interpret', acceptedEvidence: ['انتقاء نسيلي', 'تكاثر', 'تمايز', 'نوعية'], minEvidence: 3 },
    { stage: 3, conceptId: 'immunity_humoral_response', questionAr: 'اشرح تشكل المعقد المناعي بعد دخول مستضد.', reflexId: 'validate', acceptedEvidence: ['مستضد', 'جسم مضاد', 'معقد مناعي', 'بلازمية'], minEvidence: 3 },
  ],
   immunity_cellular_response: [
    { stage: 0, conceptId: 'immunity_cellular_response', questionAr: 'ما هي الخلية الهدف في الاستجابة الخلوية؟', reflexId: 'explain', acceptedEvidence: ['خلية هدف', 'مصابة', 'غير ذاتية', 'لمفاوية T'], minEvidence: 3 },
    { stage: 1, conceptId: 'immunity_cellular_response', questionAr: 'كيف تتعرف اللمفاويات T على الخلية المصابة؟', reflexId: 'explain', acceptedEvidence: ['تعرف نوعي', 'محدد مستضدي', 'CMH', 'مستقبل'], minEvidence: 3 },
    { stage: 2, conceptId: 'immunity_cellular_response', questionAr: 'ما الفرق بين الاستجابة الخلطية والاستجابة الخلوية؟', reflexId: 'interpret', acceptedEvidence: ['خلطية', 'خلوية', 'أجسام مضادة', 'إقصاء خلوي'], minEvidence: 3 },
    { stage: 3, conceptId: 'immunity_cellular_response', questionAr: 'فسّر كيف يؤدي التعرف النوعي إلى إقصاء الخلايا الهدف.', reflexId: 'validate', acceptedEvidence: ['تعرف نوعي', 'إقصاء خلوي', 'خلية هدف', 'لمفاوية T', 'استجابة خلوية'], minEvidence: 3 },
  ],
  seismic_waves: [
    { stage: 0, conceptId: 'seismic_waves', questionAr: 'ما الفرق بين الموجات P و S؟', reflexId: 'explain', acceptedEvidence: ['موجة P', 'موجة S', 'ضغط', 'قص'], minEvidence: 2 },
    { stage: 1, conceptId: 'seismic_waves', questionAr: 'لماذا تختفي الموجات S عند النواة الخارجية؟', reflexId: 'explain', acceptedEvidence: ['موجات S', 'نواة خارجية', 'سائلة', 'قص'], minEvidence: 3 },
    { stage: 2, conceptId: 'seismic_waves', questionAr: 'كيف يدل تغير سرعة الموجات P على بنية باطن الأرض؟', reflexId: 'interpret', acceptedEvidence: ['سرعة P', 'انقطاع', 'وسط', 'باطن الأرض'], minEvidence: 3 },
    { stage: 3, conceptId: 'seismic_waves', questionAr: 'فسّر كيف تستنتج سيولة النواة الخارجية من الأمواج الزلزالية.', reflexId: 'validate', acceptedEvidence: ['موجات S', 'اختفاء', 'نواة خارجية', 'سائلة', 'قوى قص'], minEvidence: 3 },
  ],
};

export function getSpacedRecallPrompts(conceptId: string): SpacedRecallPrompt[] {
  return SPACED_RECALL_PROMPTS[conceptId] ?? [];
}

export function getSpacedRecallPrompt(conceptId: string, stage: number): SpacedRecallPrompt | undefined {
  return getSpacedRecallPrompts(conceptId).find((prompt) => prompt.stage === stage);
}
