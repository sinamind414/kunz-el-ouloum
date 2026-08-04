// src/data/lessonTransferChallenges.ts
// P1.3 / V3 §4.5 — Défi BAC de sortie de leçon.
// Unique sortie par leçon : le réflexe BAC du chapitre, validé par ValidationEngine.
// Correction masquée avant toute tentative (règle produit-avant-correction).

import type { CoreReflexId } from './reflexes';

export interface LessonTransferChallenge {
  id: string;
  lessonId: string;
  conceptId: string;
  reflexId: CoreReflexId;
  titleAr: string;
  contextAr: string;
  questionAr: string;
  // Contexte transmis à ValidationEngine (vérifie une vraie réponse, pas un clic).
  validation: {
    docType: 'quantitative' | 'qualitative' | 'mixed';
    actionVerb:
      | 'identify' | 'describe' | 'analyse' | 'interpret' | 'explain'
      | 'compare' | 'hypothesize' | 'validate' | 'synthesize'
      | 'schematize' | 'justify' | 'critique';
    domain?: 'nerveux' | 'hormonal' | 'immuno' | 'genetique' | 'metabo' | 'tectonique' | 'enzyme' | 'autre';
    isNeuromuscular?: boolean;
    expectedTargets?: string[];
  };
  correctionAr: string;
  // Correction masquée avant tentative (règle produit-avant-correction).
}

export const LESSON_TRANSFER_CHALLENGES: Record<string, LessonTransferChallenge> = {
  'd1-u1-l2-transcription': {
    id: 'lt_transcription_uracile',
    lessonId: 'd1-u1-l2-transcription',
    conceptId: 'transcription',
    reflexId: 'interpret',
    titleAr: 'تحدي BAC — مسار اليوراسيل المشع',
    contextAr:
      'حُقنت خلية بنواة مشعة تُدمج اليوراسيل المشع في ARNm الجديد. بعد مدة قصيرة: وسّم في النواة. بعد مدة أطول: وسّم في الهيولى.',
    questionAr:
      'فسّر مسار ظهور الوسم: أي جزيء يظهر أولاً في النواة ثم في الهيولى، ولماذا يدل على نقل المعلومة؟',
    validation: {
      docType: 'qualitative',
      actionVerb: 'interpret',
      domain: 'genetique',
      isNeuromuscular: false,
      expectedTargets: ['النواة', 'الهيولى', 'ARNm', 'اليوراسيل', 'الاستنساخ'],
    },
    correctionAr:
      'يظهر الوسم أولاً في النواة حيث يُركّب ARNm (يحتوي اليوراسيل ولا يحتوي التايمين). ثم يظهر في الهيولى لأن ARNm يحمل نسخة المعلومة من النواة إلى الهيولى. هذا يدل على أن المعلومة تُنسخ في النواة ثم تُنقل.',
  },
  'd1-u1-l3-traduction': {
    id: 'lt_traduction_codon',
    lessonId: 'd1-u1-l3-traduction',
    conceptId: 'traduction',
    reflexId: 'explain',
    titleAr: 'تحدي BAC — الكودون إلى السلسلة الببتيدية',
    contextAr: 'يقرأ الريبوزوم رسالة ARNm ويربط كل كودون بحمضه الأميني عبر ARNt.',
    questionAr:
      'اشرح كيف ينتقل من الكودون إلى الحمض الأميني ثم إلى السلسلة الببتيدية (اربط الكودون بمضاد الكودون).',
    validation: {
      docType: 'qualitative',
      actionVerb: 'explain',
      domain: 'genetique',
      isNeuromuscular: false,
      expectedTargets: ['الكودون', 'مضاد الكودون', 'ARNt', 'الحمض الأميني', 'السلسلة الببتيدية'],
    },
    correctionAr:
      'يقرأ الريبوزوم الكودون على ARNm؛ يرتبط به مضاد الكودون على ARNt الحامل للحمض الأميني الموافق؛ تتشكل روابط ببتيدية بين الأحماض فيطول السلسلة الببتيدية.',
  },
  'd1-u3-l1-enzyme': {
    id: 'lt_enzyme_saturation',
    lessonId: 'd1-u3-l1-enzyme',
    conceptId: 'enzymes',
    reflexId: 'analyse',
    titleAr: 'تحدي BAC — تحليل منحنى النشاط الإنزيمي',
    contextAr: 'يمثّل المنحنى تطوّر سرعة تفاعل إنزيمي حسب تركيز الركيزة.',
    questionAr: 'حلّل المنحنى: كيف تتغيّر السرعة ولماذا تستقر عند التشبّع؟',
    validation: {
      docType: 'quantitative',
      actionVerb: 'analyse',
      domain: 'enzyme',
      isNeuromuscular: false,
      expectedTargets: ['الركيزة', 'الموقع النشط', 'التشبع', 'Vmax'],
    },
    correctionAr:
      'تزداد السرعة مع تركيز الركيزة لأن المواقع النشطة تتحرّك نحو التشبّع، ثم تستقر عند Vmax لأن جميع المواقع النشطة أصبحت مشغولة ولا يمكن للإنزيم استقبال ركيزة أكثر.',
  },
};

export function getLessonTransferChallenge(lessonId: string): LessonTransferChallenge | undefined {
  return LESSON_TRANSFER_CHALLENGES[lessonId];
}
