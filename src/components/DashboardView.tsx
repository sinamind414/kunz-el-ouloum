import React, { useState, useMemo } from 'react';
import { Trophy, Flame, Play, Lock, ChevronRight, Compass, Target, Hourglass, AlertTriangle, Dices, HelpCircle, Moon, Share2, Network, Sparkles } from 'lucide-react';
import { Unit, UserProgress, DailyGoalConfig } from '../types';
import { LOGO_URL } from '../data';
// Nom officiel figé (docs/MARQUE.md §3) — source unique miftahSpec : zéro littéral rendu ici.
import { MIFTAH_NAME_OFFICIAL_AR } from '../data/miftahSpec';
import DailyGoalWidget from './DailyGoalWidget';
import SmartReminderCard from './SmartReminderCard';
import WeeklyReportShareModal from './WeeklyReportShareModal';
import StreakCelebrationModal from './StreakCelebrationModal';
import { playStreakMilestoneSound } from '../utils/audio';
// Cibles réelles des tuiles (owner 2026-09-15) — les 7 tuiles étaient inertes : aucun onClick.
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
}

export default function DashboardView({ 
  units, 
  progress, 
  onLaunchQuiz, 
  onLaunchRevision, 
  onNavigateToTab,
  onUpdateDailyGoals,
  isDarkMode = false 
}: DashboardViewProps) {
  const [showWeeklyShareModal, setShowWeeklyShareModal] = useState<boolean>(false);
  const [showStreakModal, setShowStreakModal] = useState<boolean>(false);

  const handleOpenStreakCelebration = () => {
    playStreakMilestoneSound(progress.streak || 1);
    setShowStreakModal(true);
  };

  // ── Tuiles d'action (owner 2026-09-15) ──────────────────────────────────────
  // Chaque tuile vise une cible RÉELLE recalculée depuis units/progress : la
  // maquette affichait « 325 يوم الباقي » et « 0% » figés, sans aucun handler.
  const missionUnit = useMemo(() => continueUnit(units, progress), [units, progress]);
  const gapUnit = useMemo(() => biggestGapUnit(units), [units]);
  const achievementUnit = useMemo(() => closestAchievementUnit(units), [units]);
  // `null` tant que la date officielle n'est pas tranchée (util/dashboardActions BAC_EXAM_DATE).
  const bacDays = useMemo(() => bacDaysLeft(new Date()), []);

  const openSurpriseQuiz = () => {
    const unitId = surpriseUnitId(units, progress);
    if (unitId !== null) onLaunchQuiz(unitId);
  };

  return (
    <div className="space-y-5 pb-24 px-4 pt-6 bg-[#f8fbfa] dark:bg-gray-950 min-h-full" dir="rtl">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white dark:bg-[#141916] rounded-2xl flex items-center justify-center shadow-sm border border-[#006d37]/15 overflow-hidden">
             <img src={LOGO_URL} alt="كنز العلوم" className="w-11 h-11 object-contain" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#006d37] dark:text-emerald-400">مساري</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-bold">رحلة التفوق في العلوم الطبيعية</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowWeeklyShareModal(true)}
            className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-300/40 dark:border-amber-700/50 rounded-2xl py-1.5 px-3 flex items-center gap-1.5 shadow-2xs text-xs font-black transition-all cursor-pointer"
            title="توليد ومشاركة بطاقة التقرير الأسبوعي"
          >
            <Share2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span className="hidden sm:inline">تقرير الأسبوع</span>
          </button>

          <div 
            onClick={handleOpenStreakCelebration}
            className="bg-[#fff9ed] dark:bg-gray-900 border border-[#e2dabf]/60 dark:border-gray-800 rounded-2xl py-1.5 px-3 flex items-center gap-3 shadow-sm text-sm font-bold text-[#1f1c0b] dark:text-gray-200 cursor-pointer hover:border-amber-400 transition-all hover:scale-102 active:scale-98"
            title="اضغط لعرض تفاصيل الـ Streak وسماع النغمة التفاعلية 🎵"
          >
            <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
              <Flame className="w-4 h-4 text-[#ff9a4a] animate-pulse" fill="currentColor" />
              <span>{progress.streak}</span>
            </div>
            <div className="w-px h-4 bg-[#e2dabf] dark:bg-gray-700"></div>
            <div className="flex items-center gap-1">
              <Trophy className="w-4 h-4 text-[#d4af37]" fill="currentColor" />
              <span>{progress.completedUnits.length}</span>
            </div>
            <div className="w-px h-4 bg-[#e2dabf] dark:bg-gray-700"></div>
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-500 dark:text-gray-400">XP</span>
              <span>{progress.xp}</span>
            </div>
          </div>
        </div>
      </div>

      {/* SMART REMINDER CARD (التذكير الذكي للدروس غير المفتوحة منذ أكثر من 48 ساعة) */}
      <SmartReminderCard
        units={units}
        onContinueLesson={(unitId) => onLaunchQuiz(unitId)}
        onLaunchRevision={(unitId) => onLaunchRevision(unitId)}
        isDarkMode={isDarkMode}
      />

      {/* DAILY GOAL WIDGET (الأهداف اليومية) */}
      <DailyGoalWidget 
        dailyGoals={progress.dailyGoals}
        onOpenStreakModal={handleOpenStreakCelebration}
        onUpdateGoalConfig={(newConfig) => {
          if (onUpdateDailyGoals) {
            onUpdateDailyGoals(newConfig);
          }
        }}
        onQuickStartQuiz={() => onLaunchQuiz(1)}
        onQuickStartRevision={() => onLaunchRevision(1)}
        isDarkMode={isDarkMode}
      />

      {/* Methodology Path Card */}
      <div 
        onClick={() => onNavigateToTab && onNavigateToTab('methodology')}
        className="bg-gradient-to-r from-[#006d37]/10 to-[#10b981]/10 dark:from-emerald-950/40 dark:to-teal-950/40 rounded-3xl p-4 border border-[#006d37]/30 shadow-[0_2px_10px_rgba(0,109,55,0.05)] flex items-center justify-between cursor-pointer hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20 transition-all active:scale-[0.99]"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#006d37] text-white flex items-center justify-center font-black shadow-sm">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-black text-[#006d37] dark:text-emerald-400 text-[15px]">🔑 {MIFTAH_NAME_OFFICIAL_AR} (ICM + 4 مراحل)</h3>
            <p className="text-xs text-[#006d37]/80 dark:text-emerald-300/80 font-medium">ابدأ التدريب على الأفعال الـ 8 واختبار مسودة 90 ثانية</p>
          </div>
        </div>
        <span className="text-xs font-black bg-[#006d37] hover:bg-[#005a2d] text-white px-3.5 py-2 rounded-xl shadow-sm">
          دخول
        </span>
      </div>

      {/* D3 Interactive Mind Maps Card */}
      <div 
        onClick={() => onNavigateToTab && onNavigateToTab('mindmap')}
        className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl p-4 text-white shadow-md flex items-center justify-between cursor-pointer hover:from-emerald-700 hover:to-teal-800 transition-all active:scale-[0.99] relative overflow-hidden"
      >
        <div className="absolute -left-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm text-white flex items-center justify-center font-black shadow-sm">
            <Network className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-black text-white text-[15px]">الخرائط الذهنية التفاعلية D3</h3>
              <span className="text-[10px] bg-white/25 px-2 py-0.5 rounded-full font-black text-white">جديد</span>
            </div>
            <p className="text-xs text-white/85 font-medium">استكشف شبكة الروابط والمفاهيم العلمية بقوة فيزياء D3 Force Graph</p>
          </div>
        </div>
        <span className="text-xs font-black bg-white text-emerald-800 hover:bg-emerald-50 px-3.5 py-2 rounded-xl shadow-sm relative z-10">
          استكشاف
        </span>
      </div>

      {/* U4 (audit) : galerie d'animations de mécanismes — accès mobile. */}
      <div
        onClick={() => onNavigateToTab && onNavigateToTab('animations')}
        className="bg-white dark:bg-gray-900 rounded-3xl p-4 border border-gray-100 dark:border-gray-800 shadow-[0_4px_15px_rgba(0,0,0,0.03)] flex items-center justify-between cursor-pointer hover:border-[#006d37]/30 transition-all active:scale-[0.99]"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#e8f5ee] dark:bg-emerald-900/30 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-[#006d37] dark:text-emerald-400 animate-pulse" />
          </div>
          <div>
            <h3 className="font-black text-[#006d37] dark:text-emerald-400 text-[15px]">الأنميشن العلمي</h3>
            <p className="text-xs text-[#506072] dark:text-gray-400 font-medium">محاكاة متحركة لآليات البكالوريا (السيالة العصبية، الصفائح، تركيب البروتين)</p>
          </div>
        </div>
        <span className="text-xs font-black bg-[#006d37] text-white px-3.5 py-2 rounded-xl shadow-sm">
          عرض
        </span>
      </div>

      {/* Stats Summary Card */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-4 border border-gray-100 dark:border-gray-800 shadow-[0_4px_15px_rgba(0,0,0,0.03)] flex items-center justify-between">
        <div className="flex flex-col items-center flex-1">
           <span className="font-bold text-[15px] text-[#1f1c0b] dark:text-white">المستوى 1</span>
           <span className="text-[11px] font-bold text-[#006d37] dark:text-emerald-400">طالب بكالوريا ممتاز</span>
        </div>
        
        <div className="w-px h-10 bg-gray-100 dark:bg-gray-800"></div>
        
        <div className="flex flex-col items-center flex-1">
           <span className="font-bold text-[18px] text-[#ff9a4a]">{progress.streak}</span>
           <div className="flex items-center gap-1 text-[#ff9a4a] font-bold text-[13px]">
              <span>يوم متواصل</span>
              <Flame className="w-4 h-4" fill="currentColor" />
           </div>
        </div>

        <div className="w-px h-10 bg-gray-100 dark:bg-gray-800"></div>
        
        <div className="flex flex-col items-center flex-1">
           <span className="font-bold text-[18px] text-[#a0522d] dark:text-amber-400">{progress.xp}</span>
           <div className="flex items-center gap-1 text-[#a0522d] dark:text-amber-400 font-bold text-[13px]">
              <span>XP</span>
              <Trophy className="w-4 h-4" fill="currentColor" />
           </div>
        </div>
      </div>

      {/* Big Action Card */}
      <div className="bg-gradient-to-r from-[#ff8c42] to-[#ffaa62] rounded-3xl p-5 shadow-[0_8px_20px_rgba(255,140,66,0.3)] text-white relative overflow-hidden">
         <div className="absolute top-1/2 -translate-y-1/2 right-4 opacity-20">
            <Target className="w-24 h-24" />
         </div>
         
         <div className="flex justify-between items-center relative z-10">
            <div className="flex items-center gap-4">
               <div className="bg-white/20 p-3 rounded-2xl">
                  <Target className="w-10 h-10 text-white" />
               </div>
               <div className="text-right">
                  <h3 className="font-black text-2xl text-white">مهمة 3</h3>
                  <h3 className="font-black text-2xl text-white">دقائق +15 XP</h3>
                  <p className="text-white/90 text-[13px] mt-1 font-bold">
                     {missionUnit ? `« ${missionUnit.title} »` : 'لا توجد وحدة متاحة حالياً'}
                  </p>
               </div>
            </div>
            <button
              onClick={() => missionUnit && onLaunchQuiz(missionUnit.id)}
              disabled={!missionUnit}
              className="bg-white text-[#ff8c42] font-bold px-5 py-2.5 rounded-2xl shadow-md hover:bg-gray-50 transition-colors text-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              ابدأ الآن!
            </button>
         </div>
      </div>

      {/* Grid of smaller cards */}
      <div className="grid grid-cols-2 gap-4 mt-6">
         {/* Streak Card */}
         <div
            onClick={handleOpenStreakCelebration}
            className="bg-white rounded-[28px] p-6 shadow-[0_8px_24px_rgba(0,0,0,0.04)] border border-gray-100 flex flex-col items-center text-center transition-transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
         >
            <div className="w-20 h-20 bg-gradient-to-tr from-[#10b981] to-[#34d399] rounded-full flex items-center justify-center mb-4 shadow-[0_8px_16px_rgba(16,185,129,0.25)] relative">
               <div className="absolute inset-0 rounded-full border-4 border-white/20"></div>
               <Flame className="w-10 h-10 text-white" fill="currentColor" />
            </div>
            <h4 className="font-black text-[17px] text-[#0f172a] mb-1">سلسلة الأيام</h4>
            <p className="text-[12px] text-gray-500 font-bold">ابدأ سلسلتك اليوم!</p>
         </div>

         {/* 3 Min Challenge Card */}
         <div
            onClick={() => onNavigateToTab && onNavigateToTab('bootcamp')}
            className="bg-white rounded-[28px] p-6 shadow-[0_8px_24px_rgba(0,0,0,0.04)] border border-gray-100 flex flex-col items-center text-center transition-transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
         >
            <div className="w-20 h-20 bg-gradient-to-tr from-[#f97316] to-[#fb923c] rounded-full flex items-center justify-center mb-4 shadow-[0_8px_16px_rgba(249,115,22,0.25)] relative">
               <div className="absolute inset-0 rounded-full border-4 border-white/20"></div>
               <Target className="w-10 h-10 text-white" />
            </div>
            <h4 className="font-black text-[17px] text-[#0f172a] mb-1">تحدي 3 دقائق</h4>
            <p className="text-[12px] text-gray-500 font-bold">ابدأ التحدي — اختبر معرفتك بسرعة</p>
         </div>

         {/* Warning Card */}
         <div
            onClick={() => gapUnit && onLaunchRevision(gapUnit.id)}
            className={`bg-white rounded-[28px] p-6 shadow-[0_8px_24px_rgba(0,0,0,0.04)] border border-gray-100 flex flex-col items-center text-center transition-transform hover:scale-[1.02] active:scale-[0.98] ${gapUnit ? 'cursor-pointer' : ''}`}>
            <div className="w-20 h-20 bg-gradient-to-tr from-[#ef4444] to-[#f87171] rounded-full flex items-center justify-center mb-4 shadow-[0_8px_16px_rgba(239,68,68,0.25)] relative">
               <div className="absolute inset-0 rounded-full border-4 border-white/20"></div>
               <AlertTriangle className="w-10 h-10 text-white" />
            </div>
            <h4 className="font-black text-[17px] text-[#0f172a] mb-1">ثغرة خطيرة</h4>
            <p className="text-[12px] text-gray-500 font-bold">{gapUnit ? `« ${gapUnit.title} » تحتاج مراجعة!` : 'لا توجد ثغرة — ممتاز!'}</p>
         </div>

         {/* BAC Timer Card */}
         <div
            onClick={() => onNavigateToTab && onNavigateToTab('stats')}
            className="bg-white rounded-[28px] p-6 shadow-[0_8px_24px_rgba(0,0,0,0.04)] border border-gray-100 flex flex-col items-center text-center transition-transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer">
            <div className="w-20 h-20 bg-gradient-to-tr from-[#3b82f6] to-[#60a5fa] rounded-full flex items-center justify-center mb-4 shadow-[0_8px_16px_rgba(59,130,246,0.25)] relative overflow-hidden">
               <Hourglass className="w-10 h-10 text-white relative z-10" />
               <div className="absolute -top-4 -right-4 w-12 h-12 bg-white/20 rounded-full"></div>
               <div className="absolute inset-0 rounded-full border-4 border-white/20"></div>
            </div>
            <h4 className="font-black text-[17px] text-[#0f172a] mb-1">عدّاد BAC</h4>
            <p className="text-[12px] text-gray-500 font-bold">{bacDays !== null ? `${bacDays} يوم الباقي — الوقت يمر` : 'التاريخ الرسمي قيد التأكيد'}</p>
         </div>

         {/* Surprise Question Card */}
         <div
            onClick={openSurpriseQuiz}
            className="bg-white rounded-[28px] p-6 shadow-[0_8px_24px_rgba(0,0,0,0.04)] border border-gray-100 flex flex-col items-center text-center transition-transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer">
            <div className="w-20 h-20 bg-gradient-to-tr from-[#d946ef] to-[#e879f9] rounded-full flex items-center justify-center mb-4 shadow-[0_8px_16px_rgba(217,70,239,0.25)] relative">
               <div className="absolute inset-0 rounded-full border-4 border-white/20"></div>
               <Dices className="w-10 h-10 text-white" />
               <div className="absolute -top-1 -left-1 bg-white rounded-full p-0.5 shadow-sm border border-gray-100">
                 <HelpCircle className="w-5 h-5 text-[#d946ef]" />
               </div>
            </div>
            <h4 className="font-black text-[17px] text-[#0f172a] mb-1">سؤال مفاجئ</h4>
            <p className="text-[12px] text-gray-500 font-bold">اختبر معلوماتك — سؤال عشوائي</p>
         </div>

         {/* Close to Achievement Card */}
         <div
            onClick={() => onNavigateToTab && onNavigateToTab('badges')}
            className="bg-white rounded-[28px] p-6 shadow-[0_8px_24px_rgba(0,0,0,0.04)] border border-gray-100 flex flex-col items-center text-center transition-transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer">
            <div className="w-20 h-20 bg-gradient-to-tr from-[#eab308] to-[#facc15] rounded-full flex items-center justify-center mb-4 shadow-[0_8px_16px_rgba(234,179,8,0.25)] relative">
               <div className="absolute inset-0 rounded-full border-4 border-white/20"></div>
               <Trophy className="w-10 h-10 text-white" />
            </div>
            <h4 className="font-black text-[17px] text-[#0f172a] mb-1">إنجاز قريب</h4>
            <p className="text-[12px] text-gray-500 font-bold">{achievementUnit ? `« ${achievementUnit.title} » ${Math.round(achievementUnit.progress ?? 0)}% — أكمل الوحدة!` : 'ابدأ وحدة لتقترب من إنجاز!'}</p>
         </div>
      </div>

      {/* Shareable Weekly Visual Performance Card Modal */}
      <WeeklyReportShareModal
        isOpen={showWeeklyShareModal}
        onClose={() => setShowWeeklyShareModal(false)}
        progress={progress}
        units={units}
      />

      {/* Streak Milestone Celebration Modal with Interactive Audio */}
      <StreakCelebrationModal
        isOpen={showStreakModal}
        onClose={() => setShowStreakModal(false)}
        streakDays={progress.streak || 1}
        onOpenShareModal={() => setShowWeeklyShareModal(true)}
      />

    </div>
  );
}
