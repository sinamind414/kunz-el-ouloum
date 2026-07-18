// src/data/lessonTransferChallenges.ts
// P1.3 — Défi BAC de sortie de leçon (Speckit EVIDENCE §5).
// Unique sortie par leçon : le réflexe BAC du chapitre, validé par ValidationEngine.

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
      | 'identify' | 'describe' | 'analyse' | 'interpret'
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
  'd1-u3-l1-enzyme': {
    id: 'lt_enzyme_saturation',
    lessonId: 'd1-u3-l1-enzyme',
    conceptId: 'unit:3',
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
