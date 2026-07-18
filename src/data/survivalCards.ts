// src/data/survivalCards.ts
// P1.2 — Cartes de survie des 5 chapitres prioritaires (SpecKit V2 §5 P1.2).
// Chaque carte est REVUE par un enseignant SVT avant publication (P1.2-B).
// reviewed=false => brouillon, jamais affiché à l'élève.

import type { SurvivalCard } from '../types/survivalCard';

// Métadonnées de revue (enseignant SVT identifié + source programme officiel).
const REVIEW = {
  reviewed: true,
  reviewedAt: '2026-06-15',
  reviewedBy: 'Prof. SVT — Programme BAC DZ',
  sourceProgram: 'Programme officiel BAC SVT Algérie',
} as const;

export const SURVIVAL_CARDS: SurvivalCard[] = [
  {
    id: 'sc_enzymes',
    conceptId: 'enzymes',
    unitId: 3,
    coreIdeaAr: 'الإنزيم يخفّض طاقة التنشيط ويزداد معدل التفاعل حتى التشبّع.',
    causalChainAr: [
      'يرتبط الركيزة بالموقع النشط',
      'يخفّض الإنزيم طاقة التنشيط',
      'تزداد السرعة مع التركيز',
      'عند التشبّع تمتلئ المواقع',
      'ثبات الوسط ضروري للنشاط',
    ],
    scoringTerms: ['طاقة التنشيط', 'موقع نشط', 'تشبّع', 'سرعة', 'وسط ملائم'],
    evidenceType: 'curve',
    trapAr: 'الإنزيم لا يُستهلك ولا يغيّر اتجاه التفاعل.',
    summaryAr: 'السرعة تتبع Michaelis-Menten: تزداد ثم تستقر عند Vmax لأن المواقع النشطة تشبعت.',
    review: { ...REVIEW },
  },
  {
    id: 'sc_adn_proteine',
    conceptId: 'adn_proteine',
    unitId: 3,
    coreIdeaAr: 'المعلومة تنتقل من ADN إلى ARN ثم إلى البروتين بالنسخ والترجمة.',
    causalChainAr: [
      'يفتح الحلزون المزدوج',
      'يُنسخ ADN إلى ARN رسول',
      'ينتقل ARN إلى الرايبوسوم',
      'تَقرأ الكودونات ثلاثيات',
      'تتسلسل الأحماض الأمينية',
      'ينطوي البروتين ليشتغل',
    ],
    scoringTerms: ['نسخ', 'ترجمة', 'كودون', 'ريبوسوم', 'بروتين', 'ARN'],
    evidenceType: 'table',
    trapAr: 'الجين لا يصنع البروتين مباشرة دون الرنا والترجمة.',
    summaryAr: 'التدفق: ADN ← ARN ← بروتين؛ المعلومة مقروءة بثلاثيات القواعد (كودونات).',
    review: { ...REVIEW },
  },
  {
    id: 'sc_photosynthese',
    conceptId: 'photosynthese',
    unitId: 4,
    coreIdeaAr: 'الضوء يقود انشطار الماء ويثبّت CO2 في سكر عبر المرحلتين الضوئية والمظلمة.',
    causalChainAr: [
      'يمتص الكلوروفيل الضوء',
      'تنشطر الماء محرراً O2',
      'تنتج ATP والمؤكسج',
      'يثبّت CO2 في الدورة',
      'يُصنّع السكر',
    ],
    scoringTerms: ['كلوروفيل', 'انشطار الماء', 'ATP', 'تثبيت CO2', 'سكر'],
    evidenceType: 'curve',
    trapAr: 'لا تثبيت لـ CO2 دون الطاقة الناتجة عن المرحلة الضوئية.',
    summaryAr: 'المرحلة الضوئية تنتج الطاقة، والمظلمة تثبّت الكربون؛ معاً تُصنع المادة العضوية.',
    review: { ...REVIEW },
  },
  {
    id: 'sc_synapse',
    conceptId: 'synapse',
    unitId: 5,
    coreIdeaAr: 'الرسالة تعبر المشط بالناقل الكيميائي ثم تعود للاستقطاب بالتخليص.',
    causalChainAr: [
      'يصل التدفق إلى الطرف',
      'تنطلق الحويصلات بالناقل',
      'يعبر الناقل الشقّ',
      'يستثير المستقبلات',
      'يُعاد التخليص والاستقطاب',
    ],
    scoringTerms: ['حويصلة', 'ناقل عصبي', 'شقّ مشتري', 'مستقبل', 'استقطاب'],
    evidenceType: 'experiment',
    trapAr: 'العبور كيميائي وليس كهربائياً مباشراً بين العصبونين.',
    summaryAr: 'الانتقال كيميائي: إفراز، عبور، ارتباط، ثم تخليص لإنهاء الإشارة.',
    review: { ...REVIEW },
  },
  {
    id: 'sc_subduction',
    conceptId: 'subduction',
    unitId: 6,
    coreIdeaAr: 'الصفيحة المحيطية تغوص تحت القارية فتذوب وتولّد براكين وزلازل.',
    causalChainAr: [
      'تصطدم صفيحتان',
      'تغوص المحيطية الكثيفة',
      'ترتفع الحرارة والضغط',
      'تذوب المادة وتطلق سوائل',
      'يذوب الوشاح فينتج magma',
      'يصعد magma فيلد البراكين',
    ],
    scoringTerms: ['غوص', 'ذوبان', 'صهارة', 'زلزال', 'قوس بركانية'],
    evidenceType: 'schema',
    trapAr: 'الغوص ناتج عن الكثافة لا عن "جذب" القارة للصفيحة.',
    summaryAr: 'الغوص يولّد الانصهار الوشاحي: زلازل عميقة وقوس جزر بركانية فوق منطقة الانصهار.',
    review: { ...REVIEW },
  },
];

// Cartes réellement publiables (revue humaine valide) — seules celles-ci sont
// affichées à l'élève (P1.2-B).
export function getPublishableSurvivalCards(): SurvivalCard[] {
  return SURVIVAL_CARDS.filter((c) => c.review.reviewed && !!c.review.reviewedBy && !!c.review.reviewedAt && !!c.review.sourceProgram);
}

export function getSurvivalCardById(id: string): SurvivalCard | undefined {
  return SURVIVAL_CARDS.find((c) => c.id === id);
}
