export interface QuizQuestion {
  id: number;
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  diagramUrl?: string;
  unitId: number;
  /** Corpus dual (Speckit §8) : 'elite' compte pour BAC readiness, 'drill' = vocabulaire. */
  corpus?: 'elite' | 'drill';
}

export interface Unit {
  id: number;
  title: string;
  lessonsCount: number;
  description: string;
  progress: number; // 0 to 100
  isLocked: boolean;
  domain: string;
}

export interface Flashcard {
  id: string;
  unitId: number;
  question: string;
  answerBullets: string[];
  diagramUrl?: string;
  difficultyState?: 'again' | 'hard' | 'good' | 'easy';
  options?: string[];
  correctOptionIndex?: number;
}

export interface UserProgress {
  xp: number;
  streak: number;
  completedUnits: number[];
  completedQuestionsCount: number;
  studyMinutes: number;
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

export type TabId = 'path' | 'lessons' | 'training' | 'progress';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}
