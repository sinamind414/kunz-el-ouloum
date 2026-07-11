export interface QuizQuestion {
  id: number;
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  diagramUrl?: string;
  unitId: number;
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

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}
