import type { BotSession } from './sessionManager';
import type { UserProgress } from '../types';
import { KNOWLEDGE_CARDS } from '../data/smartBotData';

export interface PredictionResult {
  minExpected: number;
  maxExpected: number;
  confidence: string;
  criticalMistakes: string[];
  battlePlan: string[];
  inspirationalMessage: string;
}

export function generateBacPrediction(session: BotSession, globalProgress: UserProgress): PredictionResult {
  const mistakes = session.mistakes || [];
  const totalPossiblePoints = 20;
  let severitySum = 0;
  const topicErrorCount: Record<string, number> = {};
  const criticalTopics: string[] = [];

  mistakes.forEach((topicId) => {
    const card = KNOWLEDGE_CARDS.find((c) => c.id === topicId);
    if (!card) return;
    if (!topicErrorCount[topicId]) {
      topicErrorCount[topicId] = 0;
      severitySum += 3;
      criticalTopics.push(card.title);
    } else {
      topicErrorCount[topicId]++;
      severitySum += 0.5;
    }
  });

  const lostPoints = Math.min(8, severitySum);
  const estimatedScore = totalPossiblePoints - lostPoints + (Math.random() * 2);
  const minEstimate = Math.max(7, estimatedScore - 1.5);
  const maxEstimate = Math.min(17, estimatedScore + 1.5);
  const battlePlan = criticalTopics.slice(0, 3);

  if (battlePlan.length < 3) {
    const allDomains = KNOWLEDGE_CARDS.filter((c) => !mistakes.includes(c.id));
    battlePlan.push(...allDomains.slice(0, 3 - battlePlan.length).map((c) => c.title));
  }

  let msg = '';
  if (minEstimate >= 16) msg = 'أنت في موقف ممتاز! استمر على هذا المنوال لتحقيق 18 فما فوق.';
  else if (minEstimate >= 12) msg = 'مستوى جيد، لكن انتبه للتفاصيل. طبق الخطة أدناه للارتفاع فوق 14.';
  else msg = '⚠️ تنبيه: مستواك الحالي يعرضك للخطر. يجب عليك مراجعة هذه الدروس الثلاثة لإنقاذ معدلك.';

  return {
    minExpected: parseFloat(minEstimate.toFixed(2)),
    maxExpected: parseFloat(maxEstimate.toFixed(2)),
    confidence: minEstimate > 14 ? 'عالية' : minEstimate > 10 ? 'متوسطة' : 'منخفضة',
    criticalMistakes: criticalTopics,
    battlePlan,
    inspirationalMessage: msg,
  };
}
