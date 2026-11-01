import React, { useState, useMemo } from 'react';
import { 
  BellRing, 
  Clock, 
  ChevronLeft, 
  BrainCircuit, 
  Sparkles, 
  X, 
  RotateCcw, 
  Flame, 
  Play, 
  CheckCircle2, 
  AlertCircle,
  TrendingUp,
  HelpCircle
} from 'lucide-react';
import { Unit } from '../types';

interface SmartReminderCardProps {
  units: Unit[];
  onContinueLesson: (unitId: number) => void;
  onLaunchRevision?: (unitId: number) => void;
  isDarkMode?: boolean;
}

export default function SmartReminderCard({
  units,
  onContinueLesson,
  onLaunchRevision,
  isDarkMode = false
}: SmartReminderCardProps) {
  const [isDismissed, setIsDismissed] = useState<boolean>(false);
  const [snoozeUntil, setSnoozeUntil] = useState<number | null>(null);
  const [simulatedTimeHours, setSimulatedTimeHours] = useState<number | null>(null);

  // Find candidate units that haven't been studied in >= 48 hours and aren't 100% finished
  const staleUnitCandidate = useMemo(() => {
    const now = Date.now();
    const fortyEightHoursMs = 48 * 60 * 60 * 1000;

    // First check unlocked, in-progress units
    const candidates = units.filter(u => {
      if (u.isLocked || u.progress >= 100) return false;
      if (!u.lastStudiedTimestamp) return false;
      const elapsed = now - u.lastStudiedTimestamp;
      return elapsed >= fortyEightHoursMs;
    });

    if (candidates.length > 0) {
      // Return the one with the longest elapsed time
      return [...candidates].sort((a, b) => (a.lastStudiedTimestamp || 0) - (b.lastStudiedTimestamp || 0))[0];
    }

    // Fallback: If all units are fresh or completed, find any unlocked unit with <100% progress
    const fallbackUnit = units.find(u => !u.isLocked && u.progress < 100);
    return fallbackUnit || units[0] || null;
  }, [units]);

  // Calculate elapsed time
  const now = Date.now();
  const rawElapsedMs = staleUnitCandidate?.lastStudiedTimestamp 
    ? (now - staleUnitCandidate.lastStudiedTimestamp) 
    : (54 * 3600 * 1000); // 54 hours default for demonstration

  const elapsedHours = simulatedTimeHours !== null 
    ? simulatedTimeHours 
    : Math.max(48, Math.round(rawElapsedMs / (1000 * 60 * 60)));

  const elapsedDays = Math.floor(elapsedHours / 24);
  const remainingHoursInDay = elapsedHours % 24;

  const isSnoozed = snoozeUntil !== null && Date.now() < snoozeUntil;

  if (!staleUnitCandidate || isDismissed || isSnoozed) {
    return (
      <div className="flex items-center justify-between px-4 py-2 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50 rounded-2xl text-xs text-emerald-800 dark:text-emerald-300">
        <div className="flex items-center gap-2 font-bold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>التذكير الذكي: جميع دروسك محدثة ونشطة وفق جدول المراجعة المتباعدة!</span>
        </div>
        {(isDismissed || isSnoozed) && (
          <button 
            onClick={() => {
              setIsDismissed(false);
              setSnoozeUntil(null);
            }}
            className="text-[11px] font-black text-emerald-700 dark:text-emerald-300 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>إعادة إظهار التنبيه</span>
          </button>
        )}
      </div>
    );
  }

  const handleSnooze = () => {
    // Snooze for 24 hours
    setSnoozeUntil(Date.now() + 24 * 60 * 60 * 1000);
  };

  const lessonName = staleUnitCandidate.lastLessonTitle || "آليات الاستنساخ والترجمة وتنشيط الأحماض";

  return (
    <div 
      className={`relative overflow-hidden rounded-3xl border transition-all duration-300 shadow-[0_4px_25px_rgba(0,0,0,0.04)] ${
        isDarkMode 
          ? 'bg-gradient-to-br from-gray-900 via-gray-900/95 to-amber-950/20 border-amber-500/30 text-white' 
          : 'bg-gradient-to-br from-[#fffdfa] via-[#fffbf3] to-[#fef8ea] border-amber-200/80 text-[#1f1c0b]'
      }`}
      dir="rtl"
    >
      {/* Ambient background glow */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none" />

      {/* Top Header Bar */}
      <div className={`px-4 sm:px-5 py-3 flex items-center justify-between border-b ${
        isDarkMode ? 'border-amber-500/20 bg-amber-950/20' : 'border-amber-100 bg-amber-50/50'
      }`}>
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-400 text-white flex items-center justify-center font-black shadow-sm">
              <BellRing className="w-4 h-4 animate-wiggle" />
            </div>
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white dark:ring-gray-900 animate-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-xs text-amber-800 dark:text-amber-300 flex items-center gap-1">
                <BrainCircuit className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                تذكير ذكي — خوارزمية التكرار المتباعد
              </span>
            </div>
          </div>
        </div>

        {/* Elapsed Time Badge & Dismiss */}
        <div className="flex items-center gap-2">
          <span className="bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-[11px] font-black px-2.5 py-1 rounded-xl flex items-center gap-1.5 shadow-2xs">
            <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
            <span>لم يُفتح منذ {elapsedHours} ساعة {elapsedDays >= 2 ? `(يومان و${remainingHoursInDay} س)` : ''}</span>
          </span>

          <button
            onClick={() => setIsDismissed(true)}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            title="إخفاء التنبيه"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-4 sm:p-5 space-y-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-extrabold bg-[#006d37]/10 text-[#006d37] dark:text-emerald-400 px-2 py-0.5 rounded-md">
                الوحدة {staleUnitCandidate.id}
              </span>
              <h4 className="font-black text-base sm:text-[17px] text-[#1f1c0b] dark:text-white">
                {staleUnitCandidate.title}
              </h4>
            </div>

            <p className="text-xs text-gray-600 dark:text-gray-300 font-medium flex items-center gap-1.5">
              <span className="font-bold text-amber-700 dark:text-amber-400">الدرس المقترح:</span>
              <span className="text-gray-800 dark:text-gray-200 font-bold">{lessonName}</span>
            </p>
          </div>

          {/* Mini Progress Indicator */}
          <div className="bg-white/80 dark:bg-gray-800/80 p-2.5 rounded-2xl border border-amber-100 dark:border-gray-700 flex items-center gap-3 self-start md:self-auto min-w-[170px]">
            <div className="flex-1 space-y-1">
              <div className="flex justify-between text-[11px] font-bold">
                <span className="text-gray-500 dark:text-gray-400">نسبة التقدم</span>
                <span className="text-[#006d37] dark:text-emerald-400 font-black">{staleUnitCandidate.progress}%</span>
              </div>
              <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${staleUnitCandidate.progress}%` }}
                />
              </div>
            </div>
            <span className="text-xs font-black text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2 py-1 rounded-xl">
              باقي {100 - staleUnitCandidate.progress}%
            </span>
          </div>
        </div>

        {/* Cognitive Science Hint Box */}
        <div className="bg-white/90 dark:bg-gray-800/90 rounded-2xl p-3 border border-amber-200/60 dark:border-gray-700/80 flex items-start gap-2.5 text-xs">
          <div className="w-6 h-6 rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5 font-black">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div className="flex-1 text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
            <span className="font-bold text-amber-800 dark:text-amber-300 ml-1">
              منحنى إبينغهاوس (Ebbinghaus):
            </span>
            التوقف لأكثر من 48 ساعة دون مراجعة يؤدي لنسيان 60% من المفاهيم. جلسة سريعة لمدة 5 دقائق الآن تستعيد 95% من قوة الذاكرة الدائمة!
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 pt-1">
          <button
            onClick={() => onContinueLesson(staleUnitCandidate.id)}
            className="flex-1 min-w-[200px] py-2.5 px-4 bg-gradient-to-r from-[#006d37] via-[#008040] to-[#10b981] hover:opacity-95 text-white rounded-2xl font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>متابعة إكمال هذا الدرس الآن (+25 XP)</span>
            <ChevronLeft className="w-4 h-4" />
          </button>

          {onLaunchRevision && (
            <button
              onClick={() => onLaunchRevision(staleUnitCandidate.id)}
              className="py-2.5 px-3.5 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-2xl font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-500" />
              <span>مراجعة البطاقات</span>
            </button>
          )}

          <button
            onClick={handleSnooze}
            className="py-2.5 px-3 bg-amber-50/60 dark:bg-amber-950/40 hover:bg-amber-100/60 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-300 border border-amber-200/50 dark:border-amber-800/50 rounded-2xl font-bold text-xs transition-colors cursor-pointer"
            title="تأجيل التذكير لمدة 24 ساعة"
          >
            <span>تذكيري لاحقاً</span>
          </button>
        </div>
      </div>
    </div>
  );
}
