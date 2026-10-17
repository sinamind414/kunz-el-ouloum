import React, { useState } from 'react';
import { 
  Target, 
  Clock, 
  CheckCircle2, 
  Flame, 
  Settings2, 
  Sparkles, 
  Trophy, 
  HelpCircle, 
  Plus, 
  ArrowLeft, 
  Zap,
  TrendingUp,
  Award,
  Volume2
} from 'lucide-react';
import { DailyGoalConfig } from '../types';
import { 
  playDailyGoalCelebrationSound, 
  playStreakMilestoneSound, 
  playXPGainSound 
} from '../utils/audio';

interface DailyGoalWidgetProps {
  dailyGoals?: DailyGoalConfig;
  onUpdateGoalConfig: (newConfig: DailyGoalConfig) => void;
  onQuickStartQuiz?: () => void;
  onQuickStartRevision?: () => void;
  onOpenStreakModal?: () => void;
  isDarkMode?: boolean;
}

export const getTodayDateKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const getDefaultDailyGoals = (): DailyGoalConfig => ({
  type: 'minutes',
  targetMinutes: 25,
  targetQuestions: 20,
  lastActiveDate: getTodayDateKey(),
  todayMinutes: 12,
  todayQuestions: 14,
  streakDays: 3,
  completedToday: false,
  history: [
    { date: '2026-08-28', target: 20, achieved: 25, type: 'minutes', completed: true },
    { date: '2026-08-29', target: 25, achieved: 30, type: 'minutes', completed: true },
    { date: '2026-08-30', target: 25, achieved: 28, type: 'minutes', completed: true },
    { date: '2026-08-31', target: 25, achieved: 15, type: 'minutes', completed: false },
    { date: getTodayDateKey(), target: 25, achieved: 12, type: 'minutes', completed: false }
  ]
});

export default function DailyGoalWidget({
  dailyGoals,
  onUpdateGoalConfig,
  onQuickStartQuiz,
  onQuickStartRevision,
  onOpenStreakModal,
  isDarkMode = false
}: DailyGoalWidgetProps) {
  const currentGoals = dailyGoals || getDefaultDailyGoals();
  const [isEditing, setIsEditing] = useState(false);
  const [goalType, setGoalType] = useState<'minutes' | 'questions'>(currentGoals.type || 'minutes');
  const [customTargetMinutes, setCustomTargetMinutes] = useState(currentGoals.targetMinutes || 25);
  const [customTargetQuestions, setCustomTargetQuestions] = useState(currentGoals.targetQuestions || 20);
  const [showAddManualTime, setShowAddManualTime] = useState(false);
  const [manualMinutesInput, setManualMinutesInput] = useState(10);

  const isMinutes = goalType === 'minutes';
  const currentVal = isMinutes ? (currentGoals.todayMinutes || 0) : (currentGoals.todayQuestions || 0);
  const targetVal = isMinutes ? (currentGoals.targetMinutes || 25) : (currentGoals.targetQuestions || 20);
  const progressPercent = Math.min(100, Math.round((currentVal / (targetVal || 1)) * 100));
  const isGoalCompleted = currentVal >= targetVal;

  const minutePresets = [15, 25, 40, 60];
  const questionPresets = [10, 20, 35, 50];

  const handleSaveGoal = () => {
    const isCompleted = isMinutes 
      ? (currentGoals.todayMinutes >= customTargetMinutes) 
      : (currentGoals.todayQuestions >= customTargetQuestions);

    const updated: DailyGoalConfig = {
      ...currentGoals,
      type: goalType,
      targetMinutes: customTargetMinutes,
      targetQuestions: customTargetQuestions,
      completedToday: isCompleted
    };
    onUpdateGoalConfig(updated);
    setIsEditing(false);
    if (isCompleted && !currentGoals.completedToday) {
      playDailyGoalCelebrationSound();
    } else {
      playXPGainSound();
    }
  };

  const handleAddManualMinutes = () => {
    if (manualMinutesInput <= 0) return;
    const newMinutes = (currentGoals.todayMinutes || 0) + manualMinutesInput;
    const isCompleted = isMinutes ? (newMinutes >= currentGoals.targetMinutes) : currentGoals.completedToday;
    
    const updated: DailyGoalConfig = {
      ...currentGoals,
      todayMinutes: newMinutes,
      completedToday: isCompleted
    };
    onUpdateGoalConfig(updated);
    setShowAddManualTime(false);

    if (isCompleted && !currentGoals.completedToday) {
      playDailyGoalCelebrationSound();
    } else {
      playXPGainSound();
    }
  };

  const handleStreakClick = () => {
    playStreakMilestoneSound(currentGoals.streakDays || 1);
    if (onOpenStreakModal) {
      onOpenStreakModal();
    }
  };

  const handleCelebrationClick = () => {
    playDailyGoalCelebrationSound();
  };

  const dayNames = ['سبت', 'أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة'];
  const todayIdx = new Date().getDay(); // 0 is Sunday, 6 is Saturday

  return (
    <div 
      className={`rounded-3xl border transition-all duration-300 overflow-hidden shadow-[0_6px_25px_rgba(0,0,0,0.04)] ${
        isDarkMode 
          ? 'bg-gray-900 border-gray-800 text-white' 
          : 'bg-white border-emerald-100/70 text-[#1f1c0b]'
      }`}
      dir="rtl"
    >
      {/* Header Banner */}
      <div className={`p-4 sm:p-5 flex items-center justify-between border-b ${
        isDarkMode ? 'border-gray-800 bg-gray-900/50' : 'border-emerald-50 bg-gradient-to-r from-emerald-50/70 via-teal-50/40 to-amber-50/40'
      }`}>
        <div className="flex items-center gap-3">
          {/* Sprint 50 : bouton quand l'objectif est atteint (donc cliquable),
              simple pastille sinon — un élément inerte ne doit pas être un
              bouton vide dans l'ordre de tabulation. */}
          <button
            type="button"
            disabled={!isGoalCompleted}
            aria-label={isGoalCompleted ? 'احتفل بإنجاز هدف اليوم' : undefined}
            onClick={isGoalCompleted ? handleCelebrationClick : undefined}
            className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black shadow-sm ${
              isGoalCompleted 
                ? 'bg-gradient-to-tr from-amber-500 to-yellow-400 text-white animate-bounce cursor-pointer hover:scale-105 transition-transform'
                : 'bg-[#006d37] text-white'
            }`}
            title={isGoalCompleted ? 'اضغط لسماع نغمة الانتصار 🎵' : 'الهدف اليومي'}
          >
            {isGoalCompleted ? <Trophy className="w-5 h-5" /> : <Target className="w-5 h-5" />}
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-[16px] text-[#006d37] dark:text-emerald-400">
                الهدف اليومي
              </h3>
              {isGoalCompleted && (
                <button 
                  onClick={handleCelebrationClick}
                  className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[11px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-emerald-500/20 hover:bg-emerald-500/25 transition-all cursor-pointer"
                  title="استمع لنغمة التتويج اليومي"
                >
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>مكتمل 100%! 🎵</span>
                </button>
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              {isMinutes ? 'تركيز على وقت الاستذكار اليومي' : 'تركيز على عدد التمارين والأسئلة'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Streak indicator - Clickable with sound effect */}
          <button 
            onClick={handleStreakClick}
            className="flex items-center gap-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-600 dark:text-amber-400 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer active:scale-95 shadow-2xs"
            title="اضغط للاستماع لنغمة المواظبة وعرض الأوسمة"
          >
            <Flame className="w-3.5 h-3.5 fill-current text-amber-500 animate-pulse" />
            <span>{currentGoals.streakDays || 1} أيام 🔥</span>
          </button>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors border cursor-pointer ${
              isEditing 
                ? 'bg-[#006d37] text-white border-[#006d37]' 
                : isDarkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 border-gray-700' : 'bg-white text-gray-600 hover:bg-gray-50 border-gray-200'
            }`}
            title="تعديل الهدف اليومي"
          >
            <Settings2 className="w-4 h-4" />
            <span className="hidden sm:inline">{isEditing ? 'إغلاق' : 'تعديل'}</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-4 sm:p-5 space-y-4">
        
        {/* EDITING MODAL / PANEL */}
        {isEditing ? (
          <div className={`p-4 rounded-2xl border space-y-4 ${
            isDarkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-emerald-50/40 border-emerald-200/60'
          }`}>
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-[#006d37] dark:text-emerald-400 flex items-center gap-1.5">
                <Settings2 className="w-4 h-4" />
                تخصيص الهدف ومقياس الإنجاز
              </span>
              <button 
                onClick={() => setIsEditing(false)}
                className="text-xs text-gray-400 hover:text-gray-600 font-bold"
              >
                إلغاء
              </button>
            </div>

            {/* Goal Type Selector */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 dark:bg-gray-900 rounded-xl">
              <button
                type="button"
                onClick={() => setGoalType('minutes')}
                className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  goalType === 'minutes'
                    ? 'bg-[#006d37] text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>دقائق المذاكرة</span>
              </button>
              <button
                type="button"
                onClick={() => setGoalType('questions')}
                className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  goalType === 'questions'
                    ? 'bg-[#006d37] text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                }`}
              >
                <Target className="w-4 h-4" />
                <span>عدد الأسئلة</span>
              </button>
            </div>

            {/* Target Value Selector */}
            {goalType === 'minutes' ? (
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block">
                  اختر المدة المستهدفة يومياً:
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {minutePresets.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setCustomTargetMinutes(m)}
                      className={`py-2 rounded-xl text-xs font-black transition-all border ${
                        customTargetMinutes === m
                          ? 'bg-[#006d37] text-white border-[#006d37] shadow-sm'
                          : isDarkMode ? 'bg-gray-800 text-gray-300 border-gray-700' : 'bg-white text-gray-700 border-gray-200 hover:border-emerald-300'
                      }`}
                    >
                      {m} دقيقة
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <span className="text-xs text-gray-500 font-bold whitespace-nowrap">قيمة مخصصة:</span>
                  <input
                    type="range"
                    min="5"
                    max="120"
                    step="5"
                    value={customTargetMinutes}
                    onChange={(e) => setCustomTargetMinutes(Number(e.target.value))}
                    className="w-full accent-[#006d37]"
                  />
                  <span className="text-xs font-black text-[#006d37] dark:text-emerald-400 min-w-[50px] text-left">
                    {customTargetMinutes} د
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block">
                  اختر عدد الأسئلة المستهدفة يومياً:
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {questionPresets.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setCustomTargetQuestions(q)}
                      className={`py-2 rounded-xl text-xs font-black transition-all border ${
                        customTargetQuestions === q
                          ? 'bg-[#006d37] text-white border-[#006d37] shadow-sm'
                          : isDarkMode ? 'bg-gray-800 text-gray-300 border-gray-700' : 'bg-white text-gray-700 border-gray-200 hover:border-emerald-300'
                      }`}
                    >
                      {q} سؤال
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <span className="text-xs text-gray-500 font-bold whitespace-nowrap">قيمة مخصصة:</span>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    step="5"
                    value={customTargetQuestions}
                    onChange={(e) => setCustomTargetQuestions(Number(e.target.value))}
                    className="w-full accent-[#006d37]"
                  />
                  <span className="text-xs font-black text-[#006d37] dark:text-emerald-400 min-w-[50px] text-left">
                    {customTargetQuestions} س
                  </span>
                </div>
              </div>
            )}

            <button
              onClick={handleSaveGoal}
              className="w-full py-2.5 bg-[#006d37] hover:bg-[#005a2d] text-white rounded-xl font-black text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              حفظ وتطبيق الهدف الجديد
            </button>
          </div>
        ) : null}

        {/* PROGRESS DISPLAY SECTION */}
        <div className="space-y-3">
          <div className="flex justify-between items-baseline">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-[#006d37] dark:text-emerald-400">
                {currentVal}
              </span>
              <span className="text-sm font-bold text-gray-500 dark:text-gray-400">
                / {targetVal} {isMinutes ? 'دقيقة مذاكرة' : 'سؤال مكتمل'}
              </span>
            </div>
            
            <div className="flex items-center gap-1">
              <span className="text-base font-black text-[#1f1c0b] dark:text-white">
                {progressPercent}%
              </span>
              {progressPercent >= 100 ? (
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">✨ تم الإنجاز</span>
              ) : (
                <span className="text-xs text-gray-400 font-medium">متبقي {Math.max(0, targetVal - currentVal)} {isMinutes ? 'د' : 'س'}</span>
              )}
            </div>
          </div>

          {/* Dynamic Visual Progress Bar */}
          <div className="relative w-full h-4 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden p-0.5 border border-gray-200/50 dark:border-gray-700">
            <div 
              className={`h-full rounded-full transition-all duration-700 relative overflow-hidden ${
                progressPercent >= 100
                  ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                  : progressPercent >= 50
                  ? 'bg-gradient-to-r from-[#006d37] to-[#10b981]'
                  : 'bg-gradient-to-r from-amber-500 to-[#10b981]'
              }`}
              style={{ width: `${progressPercent}%` }}
            >
              {/* Shimmer animation on progress bar */}
              <div className="absolute inset-0 bg-white/20 -skew-x-12 animate-pulse"></div>
            </div>
          </div>

          {/* Quick Motivational Hint */}
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-1">
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>
                {progressPercent === 0 && 'ابدأ أول تمرين اليوم لتسجيل تقدمك!'}
                {progressPercent > 0 && progressPercent < 50 && 'بداية ممتازة، واصل خطوتك التالية!'}
                {progressPercent >= 50 && progressPercent < 100 && 'أنت في منتصف الطريق نحو هدف اليوم!'}
                {progressPercent >= 100 && 'رائع جداً! تجاوزت هدفك اليومي بكفاءة.'}
              </span>
            </div>

            {/* Quick manual logging toggle */}
            <button
              onClick={() => setShowAddManualTime(!showAddManualTime)}
              className="text-[11px] font-bold text-[#006d37] dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              <span>تسجيل دراسة خارجية</span>
            </button>
          </div>
        </div>

        {/* MANUAL TIME LOGGING DRAWER */}
        {showAddManualTime && (
          <div className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs ${
            isDarkMode ? 'bg-gray-800/60 border-gray-700' : 'bg-gray-50 border-gray-200'
          }`}>
            <span className="font-bold text-gray-700 dark:text-gray-300">
              أضف دقائق درستها خارج التطبيق:
            </span>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-white dark:bg-gray-900 border rounded-lg px-2 py-1">
                <input 
                  type="number" 
                  min="1" 
                  max="120"
                  value={manualMinutesInput}
                  onChange={(e) => setManualMinutesInput(Math.max(1, Number(e.target.value)))}
                  className="w-12 bg-transparent text-center font-bold text-xs outline-none"
                />
                <span className="text-[10px] text-gray-400">د</span>
              </div>
              <button
                onClick={handleAddManualMinutes}
                className="bg-[#006d37] text-white px-3 py-1.5 rounded-lg font-bold hover:bg-[#005a2d] transition-colors"
              >
                إضافة
              </button>
            </div>
          </div>
        )}

        {/* 7-DAY STREAK / PROGRESS MINI-CALENDAR */}
        <div className={`pt-3 border-t flex items-center justify-between ${
          isDarkMode ? 'border-gray-800' : 'border-gray-100'
        }`}>
          <div className="text-[11px] font-black text-gray-400 flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-amber-500" />
            <span>نشاط هذا الأسبوع:</span>
          </div>

          <div className="flex items-center gap-1.5">
            {dayNames.map((dName, idx) => {
              const isToday = idx === ((todayIdx + 1) % 7); // match arabic week starting sat
              const isAchieved = idx < 3 || (isToday && isGoalCompleted); // simulated active history + today
              return (
                <div key={dName} className="flex flex-col items-center gap-1">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${
                    isAchieved
                      ? 'bg-emerald-500 text-white shadow-xs'
                      : isToday
                      ? 'border-2 border-dashed border-[#006d37] text-[#006d37] dark:text-emerald-400 bg-emerald-50/30'
                      : isDarkMode ? 'bg-gray-800 text-gray-600' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {isAchieved ? '✓' : idx + 1}
                  </div>
                  <span className={`text-[9px] font-bold ${
                    isToday ? 'text-[#006d37] dark:text-emerald-400 font-black' : 'text-gray-400'
                  }`}>
                    {dName}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Shortcuts */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          {onQuickStartQuiz && (
            <button
              onClick={onQuickStartQuiz}
              className="py-2.5 px-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-xs shadow-sm hover:opacity-95 transition-all flex items-center justify-center gap-1.5 active:scale-98"
            >
              <Target className="w-4 h-4" />
              <span>حل أسئلة سريعة</span>
            </button>
          )}

          {onQuickStartRevision && (
            <button
              onClick={onQuickStartRevision}
              className="py-2.5 px-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-xs shadow-sm hover:opacity-95 transition-all flex items-center justify-center gap-1.5 active:scale-98"
            >
              <Clock className="w-4 h-4" />
              <span>مراجعة البطاقات الذكية</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
