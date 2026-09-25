export interface QuizQuestion {
  id: number;
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  diagramUrl?: string;
  unitId: number;
  /** 'fillBlank' = question à trou (micro-test S-C4) ; 'qcm' par défaut. */
  kind?: 'qcm' | 'fillBlank';
  /** Réponses acceptées (forme normale) quand kind === 'fillBlank'. */
  acceptedAnswers?: string[];
}

export interface Unit {
  id: number;
  title: string;
  lessonsCount: number;
  description: string;
  progress: number; // 0 to 100
  isLocked: boolean;
  domain: string;
  lastStudiedTimestamp?: number;
  lastLessonTitle?: string;
}

export interface Flashcard {
  id: string;
  unitId: number;
  question: string;
  answerBullets: string[];
  diagramUrl?: string;
  difficultyState?: 'again' | 'hard' | 'good' | 'easy';
}

export interface DailyGoalConfig {
  type: 'minutes' | 'questions';
  targetMinutes: number;
  targetQuestions: number;
  lastActiveDate: string;
  todayMinutes: number;
  todayQuestions: number;
  streakDays: number;
  completedToday: boolean;
  history?: {
    date: string;
    target: number;
    achieved: number;
    type: 'minutes' | 'questions';
    completed: boolean;
  }[];
}

export interface UserProgress {
  xp: number;
  streak: number;
  completedUnits: number[];
  completedQuestionsCount: number;
  studyMinutes: number;
  dailyGoals?: DailyGoalConfig;
  flashcardStats: {
    again: number;
    hard: number;
    good: number;
    easy: number;
  };
  quizScoreHistory: {
    date: string;
    score: number;
    total: number;
    unitTitle: string;
  }[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  /** Charge complète du moteur (quickActions, quiz, sources, reward) pour le rendu riche. */
  action?: {
    quickActions?: string[];
    quiz?: {
      id: string;
      question: string;
      options: string[];
    };
    sources?: { type: string; title: string }[];
    confidence?: number;
    reward?: {
      xpGained: number;
      /** Nature de l'activité terminée (journalisation serveur). */
      kind?: 'quiz' | 'mission';
      score?: number;
      total?: number;
      /** Titre du domaine — part dans la file /api/student/sync. */
      domain?: string;
    };
  };
}
