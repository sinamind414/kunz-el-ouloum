// weeklyStats — logique pure du panneau hebdo StatsView (P1 audit).
// Extraite pour être testable sans monter Recharts / le composant 1300 lignes.
import { AR_LATN, toLatinDigits } from './latinDigits';

export interface QuizScoreEntry {
  date: string;
  score: number;
  total: number;
}

export interface DailyGoalsLike {
  type: 'minutes' | 'questions';
  todayMinutes: number;
  todayQuestions: number;
  targetMinutes: number;
  targetQuestions: number;
}

/** Ligne prête pour Recharts (clés arabes stables côté tooltip/barres). */
export interface WeeklyDayPoint {
  /** Nom arabe du VRAI jour civil (pas une case Sat→Fri figée). */
  day: string;
  dateKey: string;
  isToday: boolean;
  /** Jour entièrement écoulé (seuls ces jours comptent dans la moyenne). */
  isPast: boolean;
  xp: number;
  questions: number;
  completionRate: number;
  studyMins: number;
}

/** getDay() JS : 0 = dimanche … 6 = samedi. */
const AR_DAY_BY_JS_DAY = [
  'الأحد',
  'الإثنين',
  'الثلاثاء',
  'الأربعاء',
  'الخميس',
  'الجمعة',
  'السبت',
];

export function arabicDayName(d: Date): string {
  return AR_DAY_BY_JS_DAY[d.getDay()];
}

export const TARGET_DAILY_XP = 50;

/**
 * Construit les 7 derniers jours (le plus ancien d'abord) 100 % à partir de
 * l'historique réel. Les étiquettes de jour sont celles du calendrier, pas une
 * grille « سبت→جمعة » qui décalait les libellés sauf si aujourd'hui = vendredi.
 */
export function buildWeeklyPerformanceData(
  history: readonly QuizScoreEntry[],
  dailyGoals: DailyGoalsLike | undefined,
  today: Date = new Date(),
): WeeklyDayPoint[] {
  const byDate = new Map<string, { xp: number; questions: number }>();
  for (const q of history) {
    const key = toLatinDigits(q.date);
    const cur = byDate.get(key) || { xp: 0, questions: 0 };
    cur.xp += q.score * 20; // règle XP réelle (+20 / bonne réponse)
    cur.questions += q.total;
    byDate.set(key, cur);
  }

  const points: WeeklyDayPoint[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setHours(12, 0, 0, 0);
    d.setDate(today.getDate() - i);
    const dateKey = toLatinDigits(d.toLocaleDateString(AR_LATN));
    const real = byDate.get(dateKey) || { xp: 0, questions: 0 };
    const isToday = i === 0;
    const isPast = i > 0;

    let completionRate = Math.min(130, Math.round((real.xp / TARGET_DAILY_XP) * 100));
    let studyMins = 0;

    if (isToday && dailyGoals) {
      const curr =
        dailyGoals.type === 'minutes' ? dailyGoals.todayMinutes : dailyGoals.todayQuestions;
      const target =
        dailyGoals.type === 'minutes' ? dailyGoals.targetMinutes : dailyGoals.targetQuestions;
      completionRate = Math.max(
        completionRate,
        Math.min(150, Math.round((curr / Math.max(1, target)) * 100)),
      );
      if (dailyGoals.type === 'minutes') studyMins = dailyGoals.todayMinutes;
    }

    points.push({
      day: arabicDayName(d),
      dateKey,
      isToday,
      isPast,
      xp: real.xp,
      questions: real.questions,
      completionRate,
      studyMins,
    });
  }
  return points;
}

/** Forme exacte consommée par StatsView / Recharts. */
export interface WeeklyChartRow {
  day: string;
  isToday: boolean;
  isPast: boolean;
  'نقاط XP': number;
  'معدل الإنجاز %': number;
  'الهدف المستهدف XP': number;
  'هدف الإنجاز %': number;
  questionsCount: number;
  studyMins: number;
}

export function toWeeklyChartRows(points: readonly WeeklyDayPoint[]): WeeklyChartRow[] {
  return points.map((p) => ({
    day: p.day,
    isToday: p.isToday,
    isPast: p.isPast,
    'نقاط XP': p.xp,
    'معدل الإنجاز %': p.completionRate,
    'الهدف المستهدف XP': TARGET_DAILY_XP,
    'هدف الإنجاز %': 100,
    questionsCount: p.questions,
    studyMins: p.studyMins,
  }));
}

/**
 * Moyenne d'achèvement sur les jours **clos** (isPast) uniquement — le jour
 * en cours ne pollue pas la moyenne tant qu'il n'est pas terminé.
 * Retourne 0 s'il n'y a aucun jour clos (filtre honnête, pas de mock).
 */
export function avgCompletionRate(
  points: readonly Pick<WeeklyDayPoint, 'isPast' | 'completionRate'>[],
): number {
  const pastDays = points.filter((p) => p.isPast);
  if (!pastDays.length) return 0;
  const sum = pastDays.reduce((acc, p) => acc + p.completionRate, 0);
  return Math.round(sum / pastDays.length);
}

/**
 * Meilleur jour **réellement productif**. Sans activité → null
 * (l'UI affiche un tiret honnête plutôt que « السبت » à 0 XP).
 */
export function bestDay(
  points: readonly Pick<WeeklyDayPoint, 'day' | 'xp'>[],
): Pick<WeeklyDayPoint, 'day' | 'xp'> | null {
  const active = points.filter((p) => p.xp > 0);
  if (!active.length) return null;
  return active.reduce((best, p) => (p.xp > best.xp ? p : best), active[0]);
}
