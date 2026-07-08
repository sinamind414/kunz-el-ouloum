export type BotMode = 'idle' | 'domain_menu' | 'diagnostic' | 'lesson' | 'quiz' | 'bac_challenge' | 'review';

export interface QuizState {
  questionId: string;
  questionIndex: number;
  totalQuestions: number;
  correctAnswers: number;
}

export interface BossState {
  scenarioId: string;
  questionIndex: number;
  totalQuestions: number;
  score: number;
  phase: 'answer' | 'eval';
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
  lastInteraction: number;
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
  lastInteraction: Date.now(),
};

export function getDefaultSession(): BotSession {
  return { ...defaultSession, mistakes: [], currentQuiz: null, boss: null, lastInteraction: Date.now() };
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
  mode: BotMode = 'quiz'
): BotSession {
  const newSession: BotSession = {
    ...session,
    mode,
    currentQuiz: {
      questionId: firstQuestionId,
      questionIndex: 0,
      totalQuestions,
      correctAnswers: 0,
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
