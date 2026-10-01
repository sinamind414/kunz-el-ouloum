export type BotMode = 'idle' | 'domain_menu' | 'diagnostic' | 'lesson' | 'quiz' | 'bac_challenge' | 'review';

export interface QuizState {
  questionId: string;
  questionIndex: number;
  totalQuestions: number;
  correctAnswers: number;
  /** F10 (audit Morchid 2026-09-26) : si ce QCM est la question de
   *  consolidation de la mission quotidienne, identifiant de la carte
   *  ciblée. Permet de verser les +15 XP promis et de clôturer la mission
   *  (completeDailyMission) — jusque-là jamais appelé. */
  missionTopicId?: string;
}

export interface BossState {
  scenarioId: string;
  questionIndex: number;
  totalQuestions: number;
  score: number;
  phase: 'answer' | 'eval';
  /**
   * R1 (audit Morchid R1 2026-10-01) : la correction modèle n'est plus servie
   * au premier « لا أعرف ». On grimpe un escalier d'indices.
   * hintLevel = nombre d'indices déjà consommés (0..3). À 3, la correction
   * se débloque mais le score est plafonné à 3/10.
   */
  hintLevel?: number;
  /**
   * R1 : tentatives écrites réelles (≥ 15 caractères utiles) sur la situation
   * courante. Deux tentatives débloquent la correction ET le score plein.
   */
  attempts?: number;
  /**
   * R3 : horodateur de l'affichage de la situation courante. La règle d'or de
   * studyGuide.ts (« pas de correction avant 20-25 min de tentative ») devient
   * une contrainte : la correction est refusée avant 90 s sans tentative.
   */
  openedAt?: number;
}

export interface BotSession {
  activeDomainId: number | null;
  activeUnitId: number | null;
  activeTopicId: string | null;
  mode: BotMode;
  currentQuiz: QuizState | null;
  boss: BossState | null;
  mistakes: string[];
  completedBac: string[];
  lastMissionDate: string | null;
  lastMissionTopic: string | null;
  lastCardId: string | null;
  /**
   * R2 (audit Morchid 2026-10-01) : id de la fiche dont la probe socratique
   * vient d'être posée. L'élève répond → on sert shortAnswer. Un changement
   * de sujet (autre fiche) réarme la probe. Jamais deux probes pour la même
   * carte d'affilée : un second « اشرح لي X » sert le contenu directement.
   */
  lastProbeCard: string | null;
  /**
   * S-03 (SpecKit 002) : triade scientifique C3. Quand la consigne porte un
   * verbe méthodique (حلّل/فسّر/استنتج/قارن/علّل/اقترح/استخرج), Morchid ne
   * livre aucune conclusion avant que l'élève parcoure les trois cases, une à
   * une : ألاحظ (observation, interdit de لأنّ) → أفسّر (interprétation) →
   * أخلص (conclusion). `null` = triade inactive.
   */
  triad: TriadState | null;
  lastInteraction: number;
}

export type TriadStep = 'observation' | 'interpretation' | 'conclusion';

export interface TriadState {
  verb: string;
  step: TriadStep;
  /** Verbe à famille fermée (حلّل/استخرج) → « لأنّ » interdit dans أفسّر. */
  closedFamily: boolean;
  /** Verbe à famille ouverte (فسّر/علّل) → « لأنّ » autorisé. */
  topic: string;
}

const STORAGE_KEY = 'smart_tutor_session';

const defaultSession: BotSession = {
  activeDomainId: null,
  activeUnitId: null,
  activeTopicId: null,
  mode: 'idle',
  currentQuiz: null,
  boss: null,
  mistakes: [],
  completedBac: [],
  lastMissionDate: null,
  lastMissionTopic: null,
  lastCardId: null,
  lastProbeCard: null,
  triad: null,
  lastInteraction: Date.now(),
};

export function getDefaultSession(): BotSession {
  return { ...defaultSession, mistakes: [], currentQuiz: null, boss: null, lastProbeCard: null, triad: null, lastInteraction: Date.now() };
}

/**
 * B3 (audit Morchid 2026-09-22) : neutralise un état actif (quiz/boss) resté dans
 * localStorage alors que les messages ne sont pas persistés. Sans cela, au refresh,
 * TOUT input de l'élève serait noté comme réponse à une question jamais affichée.
 * Préserve stats/mistakes/completedBac — ne touche qu'au mode et aux états actifs.
 */
export function clearPendingInteractions(session: BotSession): BotSession {
  if (!session.currentQuiz && !session.boss) return session;
  return { ...session, mode: 'idle', currentQuiz: null, boss: null, lastInteraction: Date.now() };
}

export function loadSession(): BotSession {
  if (typeof window === 'undefined') return getDefaultSession();

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Partial<BotSession>;
      return { ...getDefaultSession(), ...parsed };
    }
  } catch (error) {
    console.error('Erreur de chargement de session:', error);
  }

  return getDefaultSession();
}

export function saveSession(session: BotSession): void {
  if (typeof window === 'undefined') return;

  try {
    const next = { ...session, lastInteraction: Date.now() };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch (error) {
    console.error('Erreur de sauvegarde de session:', error);
  }
}

export function startDomainSession(domainId: number, currentMistakes: string[] = []): BotSession {
  const newSession: BotSession = {
    ...getDefaultSession(),
    activeDomainId: domainId,
    mode: 'domain_menu',
    mistakes: [...currentMistakes],
  };

  saveSession(newSession);
  return newSession;
}

export function startQuiz(
  session: BotSession,
  totalQuestions: number,
  firstQuestionId: string,
  mode: BotMode = 'quiz',
  missionTopicId?: string
): BotSession {
  const newSession: BotSession = {
    ...session,
    mode,
    currentQuiz: {
      questionId: firstQuestionId,
      questionIndex: 0,
      totalQuestions,
      correctAnswers: 0,
      missionTopicId,
    },
  };

  saveSession(newSession);
  return newSession;
}

export function recordQuizAnswer(
  session: BotSession,
  isCorrect: boolean,
  topicIdForMistake: string | null,
  nextQuestionId: string | null
): BotSession {
  if (!session.currentQuiz) return session;

  const updatedMistakes = [...session.mistakes];
  if (!isCorrect && topicIdForMistake && !updatedMistakes.includes(topicIdForMistake)) {
    updatedMistakes.push(topicIdForMistake);
  }
  // B7 (audit Morchid 2026-09-25) : boucle de remédiation — une réponse JUSTE sur
  // un sujet précédemment raté le retire des lacunes. Sans cela, les erreurs
  // s'accumulaient à vie dans « راجع أخطائي السابقة » sans moyen de les effacer.
  if (isCorrect && topicIdForMistake) {
    const at = updatedMistakes.indexOf(topicIdForMistake);
    if (at >= 0) updatedMistakes.splice(at, 1);
  }

  const correctAnswers = session.currentQuiz.correctAnswers + (isCorrect ? 1 : 0);
  const nextIndex = session.currentQuiz.questionIndex + 1;
  const isLastQuestion = nextIndex >= session.currentQuiz.totalQuestions;

  const newSession: BotSession = {
    ...session,
    mistakes: updatedMistakes,
    currentQuiz: isLastQuestion || !nextQuestionId
      ? null
      : {
          ...session.currentQuiz,
          questionId: nextQuestionId,
          questionIndex: nextIndex,
          correctAnswers,
        },
    mode: isLastQuestion || !nextQuestionId ? 'domain_menu' : session.mode,
  };

  saveSession(newSession);
  return newSession;
}

export function resetSession(): BotSession {
  const session = getDefaultSession();
  saveSession(session);
  return session;
}

export function startBossFightSession(
  session: BotSession,
  firstScenarioId: string,
  totalQuestions: number
): BotSession {
  const newSession: BotSession = {
    ...session,
    mode: 'bac_challenge',
    boss: {
      scenarioId: firstScenarioId,
      questionIndex: 0,
      totalQuestions,
      score: 0,
      phase: 'answer',
      hintLevel: 0,
      attempts: 0,
      openedAt: Date.now(),
    },
  };

  saveSession(newSession);
  return newSession;
}

export function startBossStep(
  session: BotSession,
  points: number,
  nextScenarioId: string,
  nextIndex: number
): BotSession {
  if (!session.boss) return session;

  const newSession: BotSession = {
    ...session,
    boss: {
      ...session.boss,
      scenarioId: nextScenarioId,
      questionIndex: nextIndex,
      score: session.boss.score + points,
      phase: 'answer',
      // R1/R3 : l'escalier d'indices et le chrono se réinitialisent par situation.
      hintLevel: 0,
      attempts: 0,
      openedAt: Date.now(),
    },
  };

  saveSession(newSession);
  return newSession;
}

export function finishBossFight(session: BotSession): BotSession {
  const newSession: BotSession = {
    ...session,
    mode: 'domain_menu',
    boss: null,
  };

  saveSession(newSession);
  return newSession;
}

export function completeDailyMission(session: BotSession, topicId: string): BotSession {
  const today = new Date().toISOString().split('T')[0];
  const newSession: BotSession = {
    ...session,
    lastMissionDate: today,
    lastMissionTopic: topicId,
  };
  saveSession(newSession);
  return newSession;
}
