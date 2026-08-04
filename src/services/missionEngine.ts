// src/services/missionEngine.ts
// P1.1-B — Achever la boucle de mission (SpecKit CORRECTION_CURRENT §5 / §8).
// Moteur pur, sans React, sans dépendance UI. Sélection par priorité réelle
// et complétion UNIQUEMENT via une MasteryEvidence valide.

import {
  Mission,
  MissionStep,
  LearningError,
  MasteryEvidence,
  ConceptRoute,
  completeMissionWithEvidence,
  applyEvidenceToError,
  REVIEW_INTERVALS_DAYS,
} from '../data/store';

// Ordre de priorité exact (SpecKit §3) :
// 1. méthode répétée (erreur méthodologique non résolue, count >= 2)
// 2. contenu récent (erreur knowledge/document active)
// 3. rappel échu (prochaine revue dépassée, y compris erreur résolue)
// 4. méthode isolée (erreur méthodologique active, count < 2)
// 5. onboarding (première utilisation, aucune donnée)
export type MissionPriority =
  | 'method_repeated'
  | 'content_recent'
  | 'spaced_due'
  | 'method_isolated'
  | 'onboarding';

function priorityOf(error: LearningError, now: number): MissionPriority | null {
  // Une erreur déjà résolue ne revient que si son rappel est réellement échu.
  if (error.resolvedAt != null) {
    const reviewDue = error.nextReviewAt > 0 && now >= error.nextReviewAt;
    return reviewDue ? 'spaced_due' : null;
  }

  const isMethod = error.kind === 'methodology';

  // Erreurs actives : ordre strict (SpecKit §3).
  if (isMethod && error.count >= 2) return 'method_repeated';
  if (error.kind === 'knowledge' || error.kind === 'document') return 'content_recent';
  // Rappel échu uniquement si une revue a été planifiée (nextReviewAt > 0) et est dépassée.
  if (error.nextReviewAt > 0 && now >= error.nextReviewAt) return 'spaced_due';
  if (isMethod) return 'method_isolated';
  return null;
}

function computeMissionDuration(steps: MissionStep[]): number {
  return steps.reduce((total, step) => total + step.expectedMinutes, 0);
}

// Construit une Mission à partir d'une erreur + sa route.
function buildMissionFromError(error: LearningError, route: ConceptRoute | undefined, now: number): Mission {
  const conceptId = error.conceptId ?? error.id;
  const reflexId = error.reflexId;
  const cardId = route?.survivalCardId;
  const steps: MissionStep[] = [
    ...(cardId
      ? [{
          id: 'survival_card',
          action: 'survival_card' as const,
          titleAr: 'بطاقة نجاة',
          expectedMinutes: 2,
          conceptId,
          survivalCardId: cardId,
        }]
      : []),
    {
      id: 'recall',
      action: 'knowledge_recall',
      titleAr: 'استرجع من الذاكرة',
      expectedMinutes: 2,
      conceptId,
      reflexId,
    },
    {
      id: 'practice',
      action: error.kind === 'methodology' ? 'word_by_word' : 'document_analysis',
      titleAr: error.kind === 'methodology' ? 'تدرب على المنهجية' : 'حلل وثيقة',
      expectedMinutes: 4,
      conceptId,
      reflexId,
    },
    {
      id: 'verify',
      action: 'quiz',
      titleAr: 'تحقق',
      expectedMinutes: 3,
      conceptId,
      reflexId,
    },
  ];

  const reasonAr =
    error.count >= 2
      ? 'نسيت العلاقة الكمية مرتين.'
      : error.kind === 'methodology'
        ? 'خطأ منهجي واحد.'
        : 'خطأ في المحتوى.';

  return {
    id: `mission_${error.id}_${now}`,
    source: 'error',
    titleAr: route?.lessonId ? `راجع ${conceptId}` : `صحح ${conceptId}`,
    reasonAr,
    expectedMinutes: computeMissionDuration(steps),
    primaryActionLabelAr: 'ابدأ المهمة',
    steps,
    createdAt: now,
    relatedErrorIds: [error.id],
  };
}

function buildOnboardingMission(now: number): Mission {
  const steps: MissionStep[] = [
    { id: 'discover', action: 'knowledge_recall', titleAr: 'اكتشف مفهوما', expectedMinutes: 3 },
    { id: 'practice', action: 'word_by_word', titleAr: 'تدرب', expectedMinutes: 3 },
    { id: 'quiz', action: 'quiz', titleAr: 'تحقق', expectedMinutes: 3 },
  ];
  return {
    id: `mission_onboarding_${now}`,
    source: 'onboarding',
    titleAr: 'مهمة استكشاف',
    reasonAr: 'لا بيانات بعد — ابدأ باكتشاف خفيف.',
    expectedMinutes: computeMissionDuration(steps),
    primaryActionLabelAr: 'ابدأ المهمة',
    steps,
    createdAt: now,
    relatedErrorIds: [],
  };
}

// Sélectionne la mission du jour. Renvoie null si aucune donnée et pas d'onboarding requis.
export function selectMission(
  errors: LearningError[],
  routes: Record<string, ConceptRoute>,
  options: { now?: number; forceOnboarding?: boolean } = {}
): Mission | null {
  const now = options.now ?? Date.now();

  if (options.forceOnboarding) {
    return buildOnboardingMission(now);
  }

  const ranked = errors
    .map((e) => ({ e, p: priorityOf(e, now) }))
    .filter((x) => x.p != null)
    .sort((a, b) => priorityWeight(a.p!) - priorityWeight(b.p!));

  if (ranked.length === 0) {
    // Aucune erreur : onboarding découverte (jamais présenté comme faiblesse).
    return buildOnboardingMission(now);
  }

  const top = ranked[0].e;
  return buildMissionFromError(top, routes[top.conceptId ?? top.id], now);
}

// Sélection typée (SpecKit §2) : mission prioritaire OU état idle explicite.
export type MissionSelection =
  | { kind: 'mission'; mission: Mission; priority: MissionPriority }
  | { kind: 'idle'; messageAr: string };

const IDLE_MESSAGE_AR = [
  'أنت على المسار الصحيح.',
  'لا توجد مراجعة مستحقة اليوم.',
  'يمكنك اختيار تحدٍ إضافي إذا أردت.',
].join('\n');

// Détermine si l'élève est déjà actif (a des preuves, erreurs ou missions terminées).
function hasExistingActivity(
  errors: LearningError[],
  options: { completedMissions?: number } = {}
): boolean {
  const hasErrors = errors.length > 0;
  const hasCompleted = (options.completedMissions ?? 0) > 0;
  return hasErrors || hasCompleted;
}

export function selectMissionSelection(
  errors: LearningError[],
  routes: Record<string, ConceptRoute>,
  options: {
    now?: number;
    forceOnboarding?: boolean;
    completedMissions?: number;
  } = {}
): MissionSelection {
  const now = options.now ?? Date.now();

  if (options.forceOnboarding) {
    return { kind: 'mission', mission: buildOnboardingMission(now), priority: 'onboarding' };
  }

  const ranked = errors
    .map((e) => ({ e, p: priorityOf(e, now) }))
    .filter((x) => x.p != null)
    .sort((a, b) => priorityWeight(a.p!) - priorityWeight(b.p!));

  if (ranked.length === 0) {
    // Aucune erreur active/rappel échu.
    // Onboarding réservé à la première utilisation (aucune donnée, aucune activité).
    if (!hasExistingActivity(errors, options)) {
      return { kind: 'mission', mission: buildOnboardingMission(now), priority: 'onboarding' };
    }
    // Élève déjà actif et à jour → état idle explicite (jamais un faux motif de faiblesse).
    return { kind: 'idle', messageAr: IDLE_MESSAGE_AR };
  }

  const top = ranked[0];
  return { kind: 'mission', mission: buildMissionFromError(top.e, routes[top.e.conceptId ?? top.e.id], now), priority: top.p! };
}

function priorityWeight(p: MissionPriority): number {
  // Plus bas = plus prioritaire (SpecKit §3) :
  // méthode répétée > contenu récent > rappel échu > méthode isolée > onboarding.
  switch (p) {
    case 'method_repeated':
      return 1;
    case 'content_recent':
      return 2;
    case 'spaced_due':
      return 3;
    case 'method_isolated':
      return 4;
    case 'onboarding':
      return 5;
  }
}

// Complète une mission. Retourne la mission (terminée ou non) + les erreurs mises à jour.
// RÈGLE : sans evidence valide, la mission n'est JAMAIS terminée.
export function closeMissionLoop(
  mission: Mission,
  evidence: MasteryEvidence | null,
  errors: LearningError[],
  now: number = Date.now()
): { mission: Mission; errors: LearningError[] } {
  const { mission: completedMission } = completeMissionWithEvidence(mission, evidence, now);

  if (!evidence) {
    // Pas de preuve -> mission ouverte, erreurs inchangées.
    return { mission, errors };
  }

  // Met à jour les erreurs liées à partir de la preuve réelle.
  // On applique la preuve à l'ERREUR ORIGINALE (préserve count/révues), pas à une graine neuve.
  const related = new Set(mission.relatedErrorIds);
  const updated = errors.map((e) => {
    if (!related.has(e.id)) return e;
    return applyEvidenceToError(e, evidence, { passed: evidence.score >= 70, now });
  });

  return { mission: completedMission, errors: updated };
}

export { REVIEW_INTERVALS_DAYS };
