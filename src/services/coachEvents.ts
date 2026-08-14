// V3 — COACH PROACTIF : événements pédagogiques déclenchés par le parcours.
// Le Coach n'est plus seulement une boîte de discussion réactive : il surgit
// au bon moment (retour après absence, échec, validation, unité verrouillée).

export type CoachEventTone = 'warn' | 'success' | 'info';

export interface CoachEventAction {
  id: string;
  labelAr: string;
  variant?: 'primary' | 'ghost';
}

export interface CoachEventData {
  kind:
    | 'locked_unit'
    | 'exam_passed'
    | 'diagnostic_passed'
    | 'exam_failed'
    | 'drill_done'
    | 'return_after_absence';
  tone: CoachEventTone;
  titleAr: string;
  messageAr: string;
  /** Notions faibles (échec d'examen) — affichées en puces. */
  weakTopicsAr?: string[];
  /** Score en % (échec d'examen). */
  percent?: number;
  /** Unité concernée par l'événement (pour router les actions). */
  unitId?: number;
  /** Mode d'examen à rejouer via l'action « réessayer ». */
  examMode?: import('./masteryEngine').ExamMode;
  actions: CoachEventAction[];
}

export const COACH_ACTION = {
  RESUME: 'resume',
  CLOSE: 'close',
  DIAGNOSTIC: 'diagnostic',
  REVIEW_LESSON: 'review_lesson',
  DRILL: 'drill',
  RETRY_EXAM: 'retry_exam',
  NEXT_UNIT: 'next_unit',
} as const;
