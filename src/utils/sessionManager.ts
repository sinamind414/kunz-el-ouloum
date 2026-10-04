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
  /** KEO-101 (audit 2026-10-01) : indices déjà consommés sur la situation
   *  courante (0→3). « لا أعرف » délivre l'indice suivant, jamais la correction. */
  hintLevel?: number;
  /** KEO-101 : tentatives écrites RÉELLES (≥ 15 caractères utiles) sur la
   *  situation courante. Deux tentatives débloquent la correction (score plein). */
  attempts?: number;
  /** KEO-102 : horodatage (ms) d'ouverture de la situation courante — la
   *  correction/indices sont refusés avant 90 s sans tentative. */
  openedAt?: number;
  /** KEO-106 (SpecKit 2026-10-01) : nombre d'avertissements « contrat du
   *  verbe de consigne » déjà donnés sur la situation courante. Le premier
   *  écart est corrigé sans compter la tentative ; au deuxième, on avance
   *  (trappe anti-frustration). Remis à zéro à chaque situation. */
  verbWarnings?: number;
  /** KEO-104 : points-clés manqués, accumulés sur TOUT le défi (pas remis à
   *  zéro entre les situations) — nourrit le bilan final CAUSE/ACTION/PORTE. */
  missedKeyPoints?: string[];
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
  /** KEO-103 (SpecKit 2026-10-01) : carte dont la question de sondage
   *  (probe) est EN ATTENTE — la prochaine saisie de l'élève est traitée
   *  comme sa tentative, puis le contenu ciblé est livré. */
  pendingProbeCardId?: string | null;
  /** KEO-103 : cartes dont le probe a été contourné par deux demandes
   *  explicites « اشرح لي » (trappe anti-frustration, journalisée). */
  probeBypassed?: string[];
  /** KEO-105 (SpecKit 2026-10-01) : triade en cours (ألاحظ → أستنتج → أخلص)
   *  sur une question d'analyse posée en dialogue libre. */
  triadeStep?: 1 | 2 | 3 | null;
  /**
   * KEO-105 / S-03 (SpecKit 002) : famille du verbe qui a ouvert la triade.
   * Fermée (حلّل، استخرج) = décrire sans expliquer — «لأنّ» interdit à
   * l'étape 2 aussi. Ouverte (فسّر، علّل، استنتج) = le causal y est requis.
   */
  triadeClosed?: boolean;
  /** KEO-RSUM (flow الملخصات الذهبية, 2026-10-04) : état de navigation dans
   *  la liste des résumés — null = liste des unités, number = leçons de
   *  l'unité N, absent = on n'est pas dans le flow. Remis à zéro par
   *  getDefaultSession() (retour à l'accueil / مسح المحادثة). */
  pendingSummaryUnit?: number | null;
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
      // KEO-101/102 : remise à zéro des compteurs de la 1ʳᵉ situation.
      hintLevel: 0,
      attempts: 0,
      openedAt: Date.now(),
      // KEO-104/106 : compteurs du défi — erreurs de verbe par situation,
      // points-clés manqués accumulés sur tout le défi.
      verbWarnings: 0,
      missedKeyPoints: [],
    },
  };

  saveSession(newSession);
  return newSession;
}

/**
 * KEO-101 (audit 2026-10-01) : met à jour l'état de progression de la situation
 * BAC courante (indices consommés, tentatives réelles) sans changer de question.
 * Remplace l'ancien pattern « la moitié de la correction dans le moteur » :
 * la progression d'une même situation vit ici, dans l'état de session.
 */
export function recordBossProgress(
  session: BotSession,
  patch: Partial<Pick<BossState, 'hintLevel' | 'attempts' | 'verbWarnings' | 'missedKeyPoints'>>
): BotSession {
  if (!session.boss) return session;
  const newSession: BotSession = {
    ...session,
    boss: {
      ...session.boss,
      ...patch,
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
      // KEO-101/102 : chaque nouvelle situation repart de zéro (indices,
      // tentatives, chrono) — les compteurs ne fuient pas d'une question à l'autre.
      hintLevel: 0,
      attempts: 0,
      openedAt: Date.now(),
      // KEO-106 : l'avertissement verbe est par-situation ; KEO-104 : les
      // points manqués s'accumulent au fil du défi (ne PAS remettre à zéro).
      verbWarnings: 0,
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
