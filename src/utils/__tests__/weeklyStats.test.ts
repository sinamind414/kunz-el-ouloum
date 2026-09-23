// P1 — verrous de la logique hebdo StatsView (stats 100 % réel).
import { describe, expect, it } from 'vitest';
import {
  arabicDayName,
  avgCompletionRate,
  bestDay,
  buildWeeklyPerformanceData,
  toWeeklyChartRows,
  TARGET_DAILY_XP,
} from '../weeklyStats';
import { AR_LATN } from '../latinDigits';

describe('buildWeeklyPerformanceData', () => {
  // Aujourd'hui figé = mercredi 23 septembre 2026 (locale sandbox).
  const today = new Date(2026, 8, 23, 15, 0, 0);

  it('étiquette chaque jour avec le vrai nom civil (pas de grille سبت→جمعة figée)', () => {
    const points = buildWeeklyPerformanceData([], undefined, today);
    expect(points).toHaveLength(7);
    expect(points.map((p) => p.day)).toEqual([
      'الخميس', // -6
      'الجمعة', // -5
      'السبت', // -4
      'الأحد', // -3
      'الإثنين', // -2
      'الثلاثاء', // -1
      'الأربعاء', // today
    ]);
    expect(points[6].isToday).toBe(true);
    expect(points[6].isPast).toBe(false);
    expect(points.slice(0, 6).every((p) => p.isPast)).toBe(true);
  });

  it('arabicDayName couvre getDay() 0..6', () => {
    expect(arabicDayName(new Date(2026, 8, 20))).toBe('الأحد'); // dimanche
    expect(arabicDayName(new Date(2026, 8, 26))).toBe('السبت'); // samedi
  });

  it('XP = score × 20 et completionRate plafonné à 130 % (jours clos)', () => {
    const d5 = new Date(today);
    d5.setDate(today.getDate() - 5); // vendredi 18/09/2026
    const key = d5.toLocaleDateString(AR_LATN);
    const points = buildWeeklyPerformanceData(
      [{ date: key, score: 4, total: 5 }],
      undefined,
      today,
    );
    const day = points.find((p) => p.dateKey === key)!;
    expect(day.xp).toBe(80); // 4 × 20
    expect(day.completionRate).toBe(Math.min(130, Math.round((80 / TARGET_DAILY_XP) * 100)));
    expect(day.questions).toBe(5);
    expect(day.isPast).toBe(true);
    expect(day.isToday).toBe(false);
  });

  it('aucun historique → 7 jours à 0, isPast correct, pas de mock', () => {
    const points = buildWeeklyPerformanceData([], undefined, today);
    expect(points.every((p) => p.xp === 0 && p.completionRate === 0)).toBe(true);
    expect(points[6].isToday).toBe(true);
    expect(points[0].isPast).toBe(true);
  });
});

describe('avgCompletionRate — jours clos uniquement (P1)', () => {
  it('moyenne les jours isPast et ignore le jour en cours', () => {
    const avg = avgCompletionRate([
      { isPast: true, completionRate: 100 },
      { isPast: true, completionRate: 0 },
      { isPast: false, completionRate: 150 }, // aujourd'hui ne compte pas
    ]);
    expect(avg).toBe(50); // (100 + 0) / 2
  });

  it('aucun jour clos → 0 (honnête, pas de valeur inventée)', () => {
    expect(avgCompletionRate([{ isPast: false, completionRate: 150 }])).toBe(0);
    expect(avgCompletionRate([])).toBe(0);
  });
});

describe('bestDay — pas de faux champion à 0 XP', () => {
  it('null sans activité', () => {
    expect(
      bestDay([
        { day: 'السبت', xp: 0 },
        { day: 'الأحد', xp: 0 },
      ]),
    ).toBeNull();
  });

  it('désigne le max parmi les jours avec XP > 0', () => {
    const b = bestDay([
      { day: 'السبت', xp: 20 },
      { day: 'الأحد', xp: 100 },
      { day: 'الإثنين', xp: 60 },
    ]);
    expect(b).toEqual({ day: 'الأحد', xp: 100 });
  });
});

describe('toWeeklyChartRows — clés Recharts stables', () => {
  it('mappe xp/completionRate vers les clés arabes attendues par le tooltip', () => {
    const rows = toWeeklyChartRows(buildWeeklyPerformanceData([], undefined, new Date(2026, 8, 23)));
    expect(rows).toHaveLength(7);
    expect(rows[0]['نقاط XP']).toBe(0);
    expect(rows[0]['معدل الإنجاز %']).toBe(0);
    expect(rows[0]['الهدف المستهدف XP']).toBe(TARGET_DAILY_XP);
    expect(rows[0]['هدف الإنجاز %']).toBe(100);
    expect(typeof rows[0].questionsCount).toBe('number');
    expect(typeof rows[0].studyMins).toBe('number');
  });
});
