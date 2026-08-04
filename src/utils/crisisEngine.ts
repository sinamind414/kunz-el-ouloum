import { getQuestionsForDomain } from '../data/smartBotData';
import type { QuizQuestion } from '../data/smartBotData';
import type { BotSession } from './sessionManager';

export interface CrisisSession {
  questionsToAsk: QuizQuestion[];
  currentQuestionIndex: number;
  totalQuestionCount: number;
  score: number;
  isFinished: boolean;
  timePerQuestion: number;
}

export interface CrisisResult {
  survivalTime: string;
  score: string;
  message: string;
  badge: 'ironman' | 'soldat' | 'debutant' | 'ejecte';
  emoji: string;
}

export function startCrisisMode(session: BotSession): CrisisSession {
  const domainId = session.activeDomainId || Math.floor(Math.random() * 3) + 1;
  let pool: QuizQuestion[] = getQuestionsForDomain(domainId);
  const weightedPool: QuizQuestion[] = [];
  for (const q of pool) {
    if (session.mistakes.includes(q.topicId)) {
      weightedPool.push(q);
      weightedPool.push(q);
    } else {
      weightedPool.push(q);
    }
  }
  const shuffled = weightedPool.sort(() => Math.random() - 0.5).slice(0, 10);
  return {
    questionsToAsk: shuffled,
    currentQuestionIndex: 0,
    totalQuestionCount: shuffled.length,
    score: 0,
    isFinished: false,
    timePerQuestion: 45,
  };
}

export function gradeCrisisAnswer(crisis: CrisisSession, rawAnswer: string, _timeTakenMs: number): { newCrisis: CrisisSession; isCorrect: boolean } {
  if (!crisis.isFinished && crisis.currentQuestionIndex < crisis.totalQuestionCount) {
    const currentQ = crisis.questionsToAsk[crisis.currentQuestionIndex];
    let selectedIndex = -1;
    const lowerAns = rawAnswer.toLowerCase().trim();
    if (['a', '1'].includes(lowerAns)) selectedIndex = 0;
    else if (['b', '2'].includes(lowerAns)) selectedIndex = 1;
    else if (['c', '3'].includes(lowerAns)) selectedIndex = 2;
    else if (['d', '4'].includes(lowerAns)) selectedIndex = 3;
    const isCorrect = selectedIndex === currentQ.correctIndex;
    const newScore = crisis.score + (isCorrect ? 1 : 0);
    return { newCrisis: { ...crisis, currentQuestionIndex: crisis.currentQuestionIndex + 1, score: newScore, isFinished: crisis.currentQuestionIndex + 1 >= crisis.totalQuestionCount }, isCorrect };
  }
  return { newCrisis: crisis, isCorrect: false };
}

export function analyzeCrisisPerformance(crisis: CrisisSession): CrisisResult {
  const ratio = crisis.score / crisis.totalQuestionCount;
  let badge: CrisisResult['badge'], msg = '', emoji = '';
  if (ratio >= 0.9) { badge = 'ironman'; emoji = '🦾'; msg = 'ممتاز! أنت في قمة التركيز والاستجابة تحت الضغط.'; }
  else if (ratio >= 0.7) { badge = 'soldat'; emoji = '⚔️'; msg = 'جيد! لديك ثقافة علمية متينة ولكن انتبه للتفاصيل.'; }
  else if (ratio >= 0.4) { badge = 'debutant'; emoji = '🎒'; msg = 'تحذير: لا تزال هناك ثغرات في المعلومات. راجع بطاقاتك بسرعة.'; }
  else { badge = 'ejecte'; emoji = '💨'; msg = 'إقصاء! للأسف، استنفدت وقودك. يجب العودة إلى الدروس الأساسية.'; }
  return { survivalTime: `${((crisis.totalQuestionCount * crisis.timePerQuestion) / 60).toFixed(1)} دقيقة`, score: `${crisis.score}/${crisis.totalQuestionCount}`, message: msg, badge, emoji };
}
