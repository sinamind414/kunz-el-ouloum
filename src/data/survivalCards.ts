// src/data/survivalCards.ts
// P1.2 — Cartes de survie des 5 chapitres prioritaires (Speckit V2 §5 P1.2).
// Contenu issu de la REVUE ÉDITORIALE (CONTENT_REVIEW_SURVIVAL_CARDS.md).
// Statut : BROUILLON (reviewed:false) — approbation propriétaire + enseignant SVT
// requise avant publication (le code ne les affiche PAS tant que reviewed != true).

import type { SurvivalCard } from '../types/survivalCard';

export const SURVIVAL_CARDS: SurvivalCard[] = [
  {
    id: 'sc_enzymes',
    conceptId: 'enzymes',
    unitId: 3,
    coreIdeaAr: 'تزداد سرعة التفاعل الإنزيمي مع تركيز الركيزة ثم تستقر عند تشبع المواقع النشطة.',
    causalChainAr: [
      'زيادة تركيز الركيزة',
      'زيادة تشكّل المعقد إنزيم-ركيزة',
      'تشبّع المواقع النشطة',
      'بلوغ السرعة القصوى Vmax',
    ],
    scoringTerms: ['الركيزة', 'الموقع النشط', 'التشبع', 'Vmax'],
    evidenceType: 'curve',
    trapAr: 'لا تقل إن الإنزيم يختفي عند بلوغ Vmax.',
    review: { reviewed: false },
  },
  {
    id: 'sc_adn_proteine',
    conceptId: 'adn_proteine',
    unitId: 1,
    coreIdeaAr: 'تحدد مورثة ADN تتابع الأحماض الأمينية للبروتين عبر الاستنساخ ثم الترجمة.',
    causalChainAr: [
      'مورثة ADN',
      'استنساخ ARNm',
      'ترجمة على الريبوزوم',
      'سلسلة ببتيدية',
      'بروتين وظيفي',
    ],
    scoringTerms: ['ADN', 'ARNm', 'الاستنساخ', 'الترجمة', 'الريبوزوم'],
    evidenceType: 'table',
    trapAr: 'لا تقل إن ADN يخرج من النواة ليصنع البروتين مباشرة.',
    review: { reviewed: false },
  },
  {
    id: 'sc_photosynthese',
    conceptId: 'photosynthese',
    unitId: 6,
    coreIdeaAr: 'تحوّل الصانعة الخضراء الطاقة الضوئية إلى طاقة كيميائية كامنة في المادة العضوية.',
    causalChainAr: [
      'امتصاص الضوء',
      'إنتاج ATP وNADPH',
      'تثبيت CO₂',
      'تركيب مادة عضوية',
      'تحرير O₂',
    ],
    scoringTerms: ['الصانعة الخضراء', 'الضوء', 'CO₂', 'ATP', 'المادة العضوية'],
    evidenceType: 'curve',
    trapAr: 'لا تقل إن المرحلة الكيميوحيوية لا تحتاج نواتج المرحلة الكيميوضوئية.',
    review: { reviewed: false },
  },
  {
    id: 'sc_synapse',
    conceptId: 'synapse',
    unitId: 5,
    coreIdeaAr: 'يتحوّل التنبيه الكهربائي عند المشبك إلى رسالة كيميائية ثم إلى استجابة كهربائية بعد مشبكية.',
    causalChainAr: [
      'وصول كمون العمل',
      'دخول Ca²⁺',
      'تحرير الوسيط الكيميائي',
      'تثبّت على مستقبل نوعي',
      'كمون بعد مشبكي',
    ],
    scoringTerms: ['كمون العمل', 'Ca²⁺', 'وسيط كيميائي', 'مستقبل نوعي', 'كمون بعد مشبكي'],
    evidenceType: 'experiment',
    trapAr: 'لا تخلط بين القناة الفولطية للكالسيوم والقناة الكيميائية بعد المشبكية.',
    review: { reviewed: false },
  },
  {
    id: 'sc_subduction',
    conceptId: 'subduction',
    unitId: 9,
    coreIdeaAr: 'تغوص الصفيحة المحيطية الأكثر كثافة تحت صفيحة أخرى فتسبب زلازل وبركنة وتضاريس مميّزة.',
    causalChainAr: [
      'تقارب الصفائح',
      'غوص الصفيحة المحيطية',
      'مستوى بنيوف وزلازل',
      'انصهار جزئي وصعود ماغما',
      'بركنة وسلسلة جبلية',
    ],
    scoringTerms: ['الغوص', 'الكثافة', 'مستوى بنيوف', 'الماغما', 'البركنة'],
    evidenceType: 'schema',
    trapAr: 'لا تفسر الغوص بمجرد وجود ضغط؛ اذكر كثافة الصفيحة المحيطية وطبيعة الأستينوسفير.',
    review: { reviewed: false },
  },
];

// Cartes réellement publiables (revue humaine valide) — seules celles-ci sont
// affichées à l'élève (P1.2-B). Tant que reviewed=false, la liste est vide.
export function getPublishableSurvivalCards(): SurvivalCard[] {
  return SURVIVAL_CARDS.filter(
    (c) => c.review.reviewed && !!c.review.reviewedBy && !!c.review.reviewedAt && !!c.review.sourceProgram
  );
}

// Renvoie la carte UNIQUEMENT si elle est publiable (jamais un brouillon).
export function getPublishableSurvivalCardById(id: string): SurvivalCard | undefined {
  const card = SURVIVAL_CARDS.find((c) => c.id === id);
  if (!card) return undefined;
  const ok = card.review.reviewed && !!card.review.reviewedBy && !!card.review.reviewedAt && !!card.review.sourceProgram;
  return ok ? card : undefined;
}

export function getSurvivalCardById(id: string): SurvivalCard | undefined {
  return SURVIVAL_CARDS.find((c) => c.id === id);
}
