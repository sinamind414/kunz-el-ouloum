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

// Ordre de priorité exact (§6 P1.1) :
// 1. erreur méthodologique répétée (count >= 2)
// 2. erreur de contenu récente
// 3. rappel espacé échu
// 4. erreur méthodologique isolée
// 5. onboarding sans donnée
export type MissionPriority =
  | 'method_repeated'
  | 'content_recent'
  | 'spaced_due'
  | 'method_isolated'
  | 'onboarding';

function priorityOf(error: LearningError, now: number): MissionPriority | null {
  if (error.resolvedAt != null) return null;
  const isMethod = error.kind === 'methodology';
  if (isMethod && error.count >= 2) return 'method_repeated';
  if (error.kind === 'knowledge' || error.kind === 'document') return 'content_recent';
  // Rappel échu uniquement si une revue a été planifiée (nextReviewAt > 0) et est dépassée.
  if (error.nextReviewAt > 0 && now >= error.nextReviewAt) return 'spaced_due';
  if (isMethod) return 'method_isolated';
  return null;
}

// Construit une Mission 3 étapes / 8-9 min à partir d'une erreur + sa route.
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
    expectedMinutes: 9,
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
    expectedMinutes: 9,
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

function priorityWeight(p: MissionPriority): number {
  // Plus bas = plus prioritaire (§6 P1.1 : méthode répétée > contenu récent > rappel échu > méthode isolée).
  switch (p) {
    case 'method_repeated':
      return 1;
    case 'spaced_due':
      return 2;
    case 'content_recent':
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
