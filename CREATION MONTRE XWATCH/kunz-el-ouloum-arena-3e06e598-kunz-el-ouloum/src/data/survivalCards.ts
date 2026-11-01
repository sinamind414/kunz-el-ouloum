// src/data/survivalCards.ts
// P1.2 — Cartes de survie des 5 chapitres prioritaires (Speckit V2 §5 P1.2).
// Contenu issu de la REVUE ÉDITORIALE (CONTENT_REVIEW_SURVIVAL_CARDS.md).
// Statut : mixed — sc_enzymes reviewed:true, les autres reviewed:false.
// Le code n'affiche que les cartes reviewed:true (getPublishableSurvivalCards).

import { isCardPublishable, type SurvivalCard } from '../types/survivalCard';
import type { ReviewMetadata } from './store';

const REVIEW_OVERRIDE_PREFIX = 'kunz_review_v2:survival_card:';

function loadReviewOverride(id: string): ReviewMetadata | null {
  try {
    const raw = localStorage.getItem(`${REVIEW_OVERRIDE_PREFIX}${id}`);
    if (!raw) return null;
    return JSON.parse(raw) as ReviewMetadata;
  } catch { return null; }
}

function applyOverride(card: SurvivalCard): SurvivalCard {
  const override = loadReviewOverride(card.id);
  if (!override) return card;
  return { ...card, review: { ...card.review, ...override } };
}

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
  return SURVIVAL_CARDS.map(applyOverride).filter(isCardPublishable);
}

// Renvoie la carte UNIQUEMENT si elle est publiable (jamais un brouillon).
export function getPublishableSurvivalCardById(id: string): SurvivalCard | undefined {
  const card = SURVIVAL_CARDS.find((c) => c.id === id);
  if (!card) return undefined;
  const overridden = applyOverride(card);
  return isCardPublishable(overridden) ? overridden : undefined;
}

export function getSurvivalCardById(id: string): SurvivalCard | undefined {
  return SURVIVAL_CARDS.find((c) => c.id === id);
}
