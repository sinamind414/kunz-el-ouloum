import type { UserProgress } from '../types';
import type { BotSession } from './sessionManager';
import { KNOWLEDGE_CARDS } from '../data/smartBotData';

/**
 * Calcule le score de préparation BAC (plafonné à 80% pour l'APK gratuit)
 */
export function calculateRadarScore(progress: UserProgress, botSession: BotSession): number {
  let score = 0;

  // 1. XP globale (1 point par 10 XP, max 40 points)
  score += Math.min(40, progress.xp / 10);

  // 2. Domaines maîtrisés (10 points par domaine sans erreurs actives, max 30)
  const cleanDomains = [1, 2, 3].filter((domainId) => {
    return !botSession.mistakes.some((mistakeId) => {
      const card = KNOWLEDGE_CARDS.find((c) => c.id === mistakeId);
      return card?.domainId === domainId;
    });
  });
  score += cleanDomains.length * 10;

  // 3. Boss BAC réussis (5 points chacun, max 10 points pour 2 boss)
  score += Math.min(10, (botSession.completedBac?.length || 0) * 5);

  // PLAFOND APK à 80%
  return Math.min(80, Math.round(score));
}

export function getRadarStatus(score: number): { label: string; color: string } {
  if (score >= 80) return { label: 'جاهز للترقية', color: '#944a00' };
  if (score >= 50) return { label: 'مستوى جيد', color: '#006d37' };
  if (score >= 20) return { label: 'في الطريق', color: '#0891b2' };
  return { label: 'بداية الرحلة', color: '#ba1a1a' };
}
