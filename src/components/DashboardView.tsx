import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  BookOpen,
  ChevronDown,
  Dices,
  Dumbbell,
  Flame,
  HelpCircle,
  Layers,
  Share2,
  Trophy,
} from 'lucide-react';
import TodayCard from './TodayCard';
import DailyGoalWidget from './DailyGoalWidget';
import SmartReminderCard from './SmartReminderCard';
import NbaCard from './NbaCard';
import WeeklyReportShareModal from './WeeklyReportShareModal';
import StreakCelebrationModal from './StreakCelebrationModal';
import { Unit, UserProgress, DailyGoalConfig } from '../types';
import { LOGO_URL } from '../data/brandAssets';
import type { LessonKind } from '../lib/parcours/parcoursPath';
import { playStreakMilestoneSound } from '../utils/audio';
// H3 : la série affichée est celle qui est encore vivante (0 si un jour a été manqué).
import { serieAfficheeDepuisDaily } from '../utils/activiteQuotidienne';

import {
  bacDaysLeft,
  biggestGapUnit,
  closestAchievementUnit,
  continueUnit,
  surpriseUnitId,
} from '../utils/dashboardActions';

interface DashboardViewProps {
  units: Unit[];
  progress: UserProgress;
  onLaunchQuiz: (unitId: number) => void;
  onLaunchRevision: (unitId: number) => void;
  onNavigateToTab?: (tab: any) => void;
  onUpdateDailyGoals?: (config: DailyGoalConfig) => void;
  isDarkMode?: boolean;
  onOpenLesson?: (lessonKey: string, kind: LessonKind, unitId: number) => void;
  onOpenQcm?: (unitId: number) => void;
}

export default function DashboardView({
  units,
  progress,
  onLaunchQuiz,
  onLaunchRevision,
  onNavigateToTab,
  onUpdateDailyGoals,
  isDarkMode = false,
  onOpenLesson,
  onOpenQcm,
}: DashboardViewProps) {
  const [showWeeklyShareModal, setShowWeeklyShareModal] = useState(false);
  const [showStreakModal, setShowStreakModal] = useState(false);
  const [showMoreTools, setShowMoreTools] = useState(false);

  const missionUnit = useMemo(() => continueUnit(units, progress), [units, progress]);
  const gapUnit = useMemo(() => biggestGapUnit(units), [units]);
  const achievementUnit = useMemo(() => closestAchievementUnit(units), [units]);
  const bacDays = useMemo(() => bacDaysLeft(new Date()), []);

  const handleOpenStreakCelebration = () => {
    const serie = serieAfficheeDepuisDaily(progress.dailyGoals);
    if (serie > 0) playStreakMilestoneSound(serie);
    setShowStreakModal(true);
  };

  const openSurpriseQuiz = () => {
    const unitId = surpriseUnitId(units, progress);
    if (unitId !== null) onLaunchQuiz(unitId);
  };

  return (
    <div className="min-h-full space-y-5 bg-[#f8fbfa] px-4 pb-24 pt-5 dark:bg-gray-950" dir="rtl">
      <header className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[#006d37]/15 bg-white shadow-sm dark:bg-[#141916]">
            <img src={LOGO_URL} alt="كنز العلوم" className="h-11 w-11 object-contain" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-[#506072] dark:text-gray-400">لوحة البداية</p>
            <h1 className="truncate text-2xl font-black text-[#006d37] dark:text-emerald-400">ماذا أدرس الآن؟</h1>
          </div>
        </div>

        <button
          type="button"
          onClick={handleOpenStreakCelebration}
          className="flex shrink-0 items-center gap-2 rounded-2xl border border-[#e2dabf]/70 bg-[#fff9ed] px-3 py-2 text-xs font-black text-[#1f1c0b] shadow-sm transition hover:border-amber-400 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100"
          aria-label="عرض تقدمي اليوم"
        >
          <Flame className="h-4 w-4 text-[#ff9a4a]" fill="currentColor" />
          <span>{serieAfficheeDepuisDaily(progress.dailyGoals)}</span>
          <span className="text-[#e2dabf]">|</span>
          <span>{progress.xp} XP</span>
        </button>
      </header>

      <section aria-labelledby="daily-priority-title" className="space-y-2">
        <div className="flex items-end justify-between gap-3 px-1">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#944a00]">الأولوية</p>
            <h2 id="daily-priority-title" className="text-lg font-black text-[#1f1c0b] dark:text-white">خطوتك التالية</h2>
          </div>
          <span className="text-[11px] font-bold text-[#506072] dark:text-gray-400">مهمة واحدة، ثم اختر الباقي</span>
        </div>

        {onOpenLesson && onOpenQcm ? (
          <NbaCard onOpenLesson={onOpenLesson} onOpenQcm={onOpenQcm} testId="home-nba" />
        ) : (
          <button
            type="button"
            onClick={() => missionUnit && onLaunchQuiz(missionUnit.id)}
            disabled={!missionUnit}
            className="flex w-full items-center justify-between gap-4 rounded-3xl bg-gradient-to-l from-[#006d37] to-[#10b981] p-5 text-right text-white shadow-[0_10px_28px_rgba(0,109,55,0.2)] disabled:opacity-60"
          >
            <span>
              <span className="block text-xs font-bold text-white/75">مهمة قصيرة</span>
              <span className="mt-1 block text-lg font-black">{missionUnit?.title ?? 'لا توجد مهمة متاحة'}</span>
            </span>
            <span className="rounded-xl bg-white px-4 py-2 text-xs font-black text-[#006d37]">ابدأ</span>
          </button>
        )}
      </section>

      <section aria-labelledby="paths-title" className="space-y-3">
        <div className="px-1">
          <h2 id="paths-title" className="text-lg font-black text-[#1f1c0b] dark:text-white">ماذا تريد أن تفعل؟</h2>
          <p className="text-xs font-bold text-[#506072] dark:text-gray-400">ثلاثة اختيارات واضحة حسب هدفك الآن</p>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          <button
            type="button"
            onClick={() => onNavigateToTab?.('lesson')}
            className="group flex min-h-28 flex-col items-center justify-center gap-2 rounded-3xl border border-emerald-200 bg-white px-2 py-4 text-center shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-500 dark:border-emerald-900/50 dark:bg-gray-900"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-[#006d37] group-hover:bg-[#006d37] group-hover:text-white dark:bg-emerald-950/40 dark:text-emerald-300">
              <BookOpen className="h-5 w-5" />
            </span>
            <span className="text-sm font-black text-[#1f1c0b] dark:text-white">أتعلّم</span>
            <span className="text-[10px] font-bold text-[#506072] dark:text-gray-400">درس وشرح</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateToTab?.('training')}
            className="group flex min-h-28 flex-col items-center justify-center gap-2 rounded-3xl border border-amber-200 bg-white px-2 py-4 text-center shadow-sm transition hover:-translate-y-0.5 hover:border-amber-500 dark:border-amber-900/50 dark:bg-gray-900"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-[#944a00] group-hover:bg-[#944a00] group-hover:text-white dark:bg-amber-950/40 dark:text-amber-300">
              <Dumbbell className="h-5 w-5" />
            </span>
            <span className="text-sm font-black text-[#1f1c0b] dark:text-white">أتدرّب</span>
            <span className="text-[10px] font-bold text-[#506072] dark:text-gray-400">تمرين وBAC</span>
          </button>

          <button
            type="button"
            onClick={() => (gapUnit ?? missionUnit) && onLaunchRevision((gapUnit ?? missionUnit)!.id)}
            disabled={!gapUnit && !missionUnit}
            className="group flex min-h-28 flex-col items-center justify-center gap-2 rounded-3xl border border-sky-200 bg-white px-2 py-4 text-center shadow-sm transition hover:-translate-y-0.5 hover:border-sky-500 disabled:opacity-60 dark:border-sky-900/50 dark:bg-gray-900"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-700 group-hover:bg-sky-700 group-hover:text-white dark:bg-sky-950/40 dark:text-sky-300">
              <Layers className="h-5 w-5" />
            </span>
            <span className="text-sm font-black text-[#1f1c0b] dark:text-white">أراجع</span>
            <span className="text-[10px] font-bold text-[#506072] dark:text-gray-400">بطاقات وأخطاء</span>
          </button>
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-[#e2dabf]/70 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <button
          type="button"
          onClick={() => setShowMoreTools((value) => !value)}
          aria-expanded={showMoreTools}
          aria-controls="dashboard-more-tools"
          className="flex w-full items-center justify-between gap-4 px-5 py-4 text-right transition hover:bg-[#fff9ed]/70 dark:hover:bg-gray-800"
        >
          <span>
            <span className="block text-base font-black text-[#1f1c0b] dark:text-white">المزيد من الأدوات</span>
            <span className="block text-xs font-bold text-[#506072] dark:text-gray-400">الخطة، التذكير، المنهجية، الخرائط والتقدم</span>
          </span>
          <ChevronDown className={`h-5 w-5 shrink-0 text-[#006d37] transition-transform ${showMoreTools ? 'rotate-180' : ''}`} />
        </button>

        {showMoreTools && (
          <div id="dashboard-more-tools" className="space-y-4 border-t border-[#e2dabf]/50 p-4 dark:border-gray-800">
            <SmartReminderCard
              units={units}
              onContinueLesson={onLaunchQuiz}
              onLaunchRevision={onLaunchRevision}
              isDarkMode={isDarkMode}
            />

            {/* 2026-10-12 — la carte affiche le programme du jour sans ouvrir
                `plan` : cette page a désormais une porte principale unique
                (hub « المراجعة »). La carte reste informative. */}
            <TodayCard />

            <DailyGoalWidget
              dailyGoals={progress.dailyGoals}
              onOpenStreakModal={handleOpenStreakCelebration}
              onUpdateGoalConfig={(newConfig) => onUpdateDailyGoals?.(newConfig)}
              onQuickStartQuiz={() => onLaunchQuiz(1)}
              onQuickStartRevision={() => onLaunchRevision(1)}
              isDarkMode={isDarkMode}
            />

            <div>
              {/* 2026-10-12 — ce bloc ne contenait que des DOUBLONS : « مفتاح
                  المنهجية », « الأنميشن » et les examens ont tous un
                  emplacement principal unique (hub التمارين والتدريب). Un accès
                  en double fait croire à deux outils différents. Il ne reste que
                  ce qui n'a PAS d'autre porte : le المرشد, aidé à la demande. */}
              <h3 className="mb-2 px-1 text-sm font-black text-[#1f1c0b] dark:text-white">تحتاج مساعدة؟</h3>
              <div className="grid gap-2 sm:grid-cols-2">
                {/* Porte EXPLICITE vers le المرشد depuis l'accueil
                    (demande : « depuis l'accueil, question libre »). Le bouton
                    flottant existe déjà partout, mais il est petit : ici la
                    question libre a une entrée visible. */}
                <button type="button" onClick={() => onNavigateToTab?.('chat')} className="flex items-center gap-3 rounded-2xl border border-emerald-200 p-3 text-right dark:border-emerald-900/50">
                  <HelpCircle className="h-5 w-5 shrink-0 text-[#006d37]" />
                  <span><span className="block text-xs font-black dark:text-white">المرشد الذكي</span><span className="text-[10px] font-bold text-[#506072]">اطرح أي سؤال</span></span>
                </button>
                {/* Renvoi vers le hub, pas vers un outil : l'accueil ne remplace
                    pas la rubrique, il indique où aller. */}
                <button type="button" onClick={() => onNavigateToTab?.('training')} className="flex items-center gap-3 rounded-2xl border border-emerald-200 p-3 text-right dark:border-emerald-900/50">
                  <Dumbbell className="h-5 w-5 shrink-0 text-[#006d37]" />
                  <span><span className="block text-xs font-black dark:text-white">كل أدوات التدريب</span><span className="text-[10px] font-bold text-[#506072]">ثمانية فضاءات في مكان واحد</span></span>
                </button>
              </div>
            </div>

            <div>
              {/* 2026-10-12 — « تحدي 3 دقائق » (bootcamp) est parti : il a son
                  emplacement principal unique dans le hub « التمارين والتدريب ».
                  Deux portes pour le même outil font croire à deux outils. Il ne
                  reste que l'ACTION, qui n'existe nulle part ailleurs. */}
              <h3 className="mb-2 px-1 text-sm font-black text-[#1f1c0b] dark:text-white">اختبر نفسك الآن</h3>
              <div className="grid grid-cols-1 gap-2">
                <button type="button" onClick={openSurpriseQuiz} className="flex items-center gap-3 rounded-2xl border border-fuchsia-200 p-3 text-right dark:border-fuchsia-900/50">
                  <Dices className="h-5 w-5 shrink-0 text-fuchsia-600" />
                  <span><span className="block text-xs font-black dark:text-white">سؤال مفاجئ</span><span className="text-[10px] font-bold text-[#506072]">سؤال واحد، فوري، دون تحضير</span></span>
                </button>
              </div>
            </div>

            <div className="rounded-2xl bg-[#f8fbfa] p-3 dark:bg-gray-950">
              <div className="grid grid-cols-3 divide-x-reverse divide-x divide-[#e2dabf]/60 text-center dark:divide-gray-800">
                {/* 2026-10-12 — « تقدمي » (stats) et « الإنجازات » (badges) ont
                    quitté CE bloc pour « أنا » (leur porte principale, cf.
                    moiRaccourcis.ts). Les CHIFFRES restent — c'est une
                    information, pas une porte. Leur navigation en double
                    disparaît : plus de bouton qui ouvre la même page ailleurs.
                    D'où des <span> et non des <button> : rien d'inerte. */}
                <div className="px-2">
                  <span className="block text-base font-black text-sky-700">{bacDays ?? '—'}</span>
                  <span className="text-[10px] font-bold text-[#506072]">يوماً للـ BAC</span>
                </div>
                <div className="px-2">
                  <Trophy className="mx-auto mb-1 h-4 w-4 text-amber-500" />
                  <span className="block truncate text-[10px] font-bold text-[#506072]">{achievementUnit?.title ?? 'الإنجازات'}</span>
                </div>
                <button type="button" onClick={() => setShowWeeklyShareModal(true)} className="px-2 cursor-pointer">
                  <Share2 className="mx-auto mb-1 h-4 w-4 text-[#006d37]" />
                  <span className="text-[10px] font-bold text-[#506072]">تقرير الأسبوع</span>
                </button>
              </div>
            </div>

            {gapUnit && (
              <button type="button" onClick={() => onLaunchRevision(gapUnit.id)} className="flex w-full items-center gap-3 rounded-2xl border border-red-200 bg-red-50/50 p-3 text-right dark:border-red-900/50 dark:bg-red-950/20">
                <AlertTriangle className="h-5 w-5 shrink-0 text-red-600" />
                <span className="flex-1"><span className="block text-xs font-black text-red-800 dark:text-red-300">نقطة تحتاج مراجعة</span><span className="text-[10px] font-bold text-red-700/75 dark:text-red-300/75">{gapUnit.title}</span></span>
                <HelpCircle className="h-4 w-4 text-red-500" />
              </button>
            )}
          </div>
        )}
      </section>

      <WeeklyReportShareModal
        isOpen={showWeeklyShareModal}
        onClose={() => setShowWeeklyShareModal(false)}
        progress={progress}
        units={units}
      />

      <StreakCelebrationModal
        isOpen={showStreakModal}
        onClose={() => setShowStreakModal(false)}
        streakDays={serieAfficheeDepuisDaily(progress.dailyGoals)}
        onOpenShareModal={() => setShowWeeklyShareModal(true)}
      />
    </div>
  );
}
