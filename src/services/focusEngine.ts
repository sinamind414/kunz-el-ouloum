// ═══════════════════════════════════════════════════════════════════════
// V3 — FOCUS ENGINE : « Voici ta mission du jour. »
// Couche 1 de l'architecture « La Boussole ».
//
// À chaque ouverture de l'application, le moteur scanne la progression de
// l'élève et détermine :
//   1. l'UNITÉ ACTIVE (première unité déverrouillée non maîtrisée) ;
//   2. la PROCHAINE ACTION unique (leçon → QCM → examen → remédiation).
//
// Règle fondatrice : une mission visible, une prochaine action, aucun
// cul-de-sac. Le reste du programme est mentalement verrouillé : toute
// l'énergie de l'interface converge vers cette cible.
// ═══════════════════════════════════════════════════════════════════════

import type { Unit } from '../types';
import type { MasteryState } from './masteryEngine';
import { EXAM_READY_PROGRESS } from './masteryEngine';
import { getFirstLessonId } from '../data/unitLessonSequences';

export type FocusActionKind = 'lesson' | 'quiz' | 'exam' | 'remediation' | 'all_done';

export interface FocusAction {
  kind: FocusActionKind;
  unitId: number;
  lessonId?: string;
  /** Libellé court de l'action (bouton principal). */
  labelAr: string;
  /** Explication pédagogique : « pourquoi cette étape ? ». */
  detailAr: string;
  /** Notions à revoir (remédiation uniquement). */
  weakTopicsAr?: string[];
}

/** Trie les unités par ordre officiel (id croissant). */
function sortedUnits(units: Unit[]): Unit[] {
  return [...units].sort((a, b) => a.id - b.id);
}

/**
 * Unité active = première unité DÉVERROUILLÉE et non encore validée.
 * Les unités déjà déverrouillées restent toujours accessibles (garde-fou
 * validé), mais l'énergie est dirigée vers la première non maîtrisée.
 */
export function getActiveUnit(units: Unit[], mastery: MasteryState): Unit | null {
  for (const unit of sortedUnits(units)) {
    if (!unit.isLocked && !mastery.validatedUnits.includes(unit.id)) return unit;
  }
  return null;
}

/**
 * Prochaine action de l'unité active (le « chemin de fer » de la V3) :
 *   échec récent  → remédiation ciblée ;
 *   progress = 0  → première leçon de l'unité ;
 *   progress < 60 → QCM d'entraînement ;
 *   progress ≥ 60 → examen de validation (Le Gardien).
 */
export function getNextAction(units: Unit[], mastery: MasteryState): FocusAction {
  const active = getActiveUnit(units, mastery);

  if (!active) {
    const last = sortedUnits(units).at(-1);
    return {
      kind: 'all_done',
      unitId: last?.id ?? 1,
      labelAr: 'أكملت كل الوحدات!',
      detailAr: 'كل الوحدات متقنة — راجع البطاقات أو تحدى نفسك في وضع BAC.',
    };
  }

  const failure = mastery.lastFailure;
  if (failure && failure.unitId === active.id) {
    const topics = failure.weakTopicsAr ?? [];
    return {
      kind: 'remediation',
      unitId: active.id,
      labelAr: 'ابدأ المعالجة المستهدفة',
      detailAr:
        topics.length > 0
          ? `تحتاج إلى مراجعة: ${topics.join('، ')} — قبل إعادة امتحان الوحدة.`
          : `أخطأت في ${failure.percent < 50 ? 'أغلب' : 'بعض'} أسئلة الامتحان — راجع الدرس ثم أعد المحاولة بأسئلة جديدة.`,
      weakTopicsAr: topics,
    };
  }

  if (active.progress <= 0) {
    const lessonId = getFirstLessonId(active.id);
    return {
      kind: lessonId ? 'lesson' : 'quiz',
      unitId: active.id,
      lessonId,
      labelAr: lessonId ? 'افتح الدرس الأول' : 'ابدأ التدريب',
      detailAr: 'لم تبدأ هذه الوحدة بعد — ابدأ بالدرس قبل أي تمرين.',
    };
  }

  if (active.progress < EXAM_READY_PROGRESS) {
    return {
      kind: 'quiz',
      unitId: active.id,
      labelAr: 'تدرب على QCM الوحدة',
      detailAr: `تقدمك ${active.progress}% — رسّخ معارفك قبل امتحان الوحدة (العتبة 80%).`,
    };
  }

  return {
    kind: 'exam',
    unitId: active.id,
    labelAr: 'اجتاز امتحان الوحدة',
    detailAr: `تقدمك ${active.progress}% — أنت جاهز لامتحان التحقق: 10 أسئلة، عتبة النجاح 80%.`,
  };
}

/** Libellé de la mission affiché dans la Boussole (« Où suis-je ? »). */
export function getMissionTitleAr(unit: Unit | null): string {
  if (!unit) return 'أنهيت كل الوحدات';
  return `الوحدة ${unit.id} — ${unit.title}`;
}
