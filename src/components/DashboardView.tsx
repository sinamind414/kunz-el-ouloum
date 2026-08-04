import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Flame, Play, Lock, CheckCircle, Brain, Sparkles, Target } from 'lucide-react';
import { Unit, UserProgress, TabId } from '../types';

interface DashboardViewProps {
  units: Unit[];
  progress: UserProgress;
  onLaunchQuiz: (unitId: number) => void;
  onLaunchRevision: (unitId: number) => void;
  onNavigateToTab?: (tab: TabId) => void;
}

export default function DashboardView({ units, progress, onLaunchQuiz, onLaunchRevision }: DashboardViewProps) {
  
  const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null);
  const [dailyGoalXP, setDailyGoalXP] = useState<number>(50);
  const todayXP = progress.xp % 60; // Mocked daily progress based on total XP for demonstration

  // Calculate active unit for the Continuer card
  // Rule: the first unit that is unlocked but not 100% completed
  const activeUnit = units.find(u => {
    const isLocked = u.isLocked && !progress.completedUnits.includes(u.id - 1);
    return !isLocked && u.progress < 100;
  }) || units[units.length - 1] || units[0];

  return (
    <div className="space-y-6 pb-20">
      
      {/* Top Welcome Banner with Stat Counters */}
      <motion.div 
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-[#006d37] to-[#00562b] text-[#ffffff] rounded-3xl p-6 shadow-md relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#2ecc71]/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 text-[#fed65b] font-bold text-sm">
              <Sparkles className="w-4 h-4" />
              <span>مرحباً بك مجدداً، أيها الباحث الذكي!</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold mt-1">كُنوز المعرفَة بانتظارِك</h2>
            <p className="text-xs md:text-sm text-[#ffffff]/80 mt-2 max-w-md">
              باقٍ على امتحان البكالوريا القليل. واصل المراجعة اليومية بذكاء لتضمن العلامة الكاملة في مادة العلوم الطبيعية!
            </p>
          </div>
          
          {/* Quick Stat Highlights */}
          <div className="flex gap-3 bg-[#ffffff]/10 p-3 rounded-2xl border border-[#ffffff]/15 backdrop-blur-md w-full md:w-auto justify-around">
            <div className="text-center px-2">
              <div className="text-[#fed65b] font-extrabold text-xl md:text-2xl">{progress.xp}</div>
              <div className="text-[10px] text-[#ffffff]/70 font-medium">نقطة XP</div>
            </div>
            <div className="w-[1px] bg-[#ffffff]/15" />
            <div className="text-center px-2">
              <div className="text-[#ff9a4a] font-extrabold text-xl md:text-2xl flex items-center justify-center gap-1">
                <span>{progress.streak}</span>
                <Flame className="w-4 h-4 fill-current animate-pulse" />
              </div>
              <div className="text-[10px] text-[#ffffff]/70 font-medium">يوم متتالي</div>
            </div>
            <div className="w-[1px] bg-[#ffffff]/15" />
            <div className="text-center px-2">
              <div className="text-[#2ecc71] font-extrabold text-xl md:text-2xl">{progress.completedQuestionsCount}</div>
              <div className="text-[10px] text-[#ffffff]/70 font-medium">أسئلة مجابة</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Continuer Card (Focus) */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-[#ffffff] border border-[#2ecc71] rounded-3xl p-6 shadow-md flex flex-col relative overflow-hidden group"
      >
        <div className="absolute top-0 bottom-0 right-0 w-2 bg-[#2ecc71] rounded-r-3xl" />
        
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-[#2ecc71]/10 text-[#006d37] p-3 rounded-2xl">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-[#506072] block">مواصلة التعلم</span>
            <h3 className="text-xl font-black text-[#1f1c0b]">الوحدة {activeUnit.id}: {activeUnit.title}</h3>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-2 mb-6">
          <div className="flex justify-between text-sm font-bold text-[#504441]">
            <span>التقدم</span>
            <span className="text-[#006d37]">{activeUnit.progress}%</span>
          </div>
          <div className="w-full bg-[#f3f4f5] h-3 rounded-full overflow-hidden border border-[#bbcbbb]/20">
            <div 
              className="h-full rounded-full transition-all duration-500 bg-[#2ecc71]" 
              style={{ width: `${activeUnit.progress}%` }} 
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button 
            onClick={() => {
              if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) window.navigator.vibrate(30);
              onLaunchQuiz(activeUnit.id);
            }}
            className="flex-1 bg-[#006d37] hover:bg-[#00562b] text-[#ffffff] px-6 py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>متابعة التدريب</span>
          </button>
          <button 
            onClick={() => {
              if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) window.navigator.vibrate(30);
              onLaunchRevision(activeUnit.id);
            }}
            className="flex-1 sm:flex-none sm:w-auto bg-[#fff9ed] hover:bg-[#fed65b]/20 text-[#006d37] border border-[#e2dabf] px-6 py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <Brain className="w-5 h-5 text-[#944a00]" />
            <span>المراجعة</span>
          </button>
        </div>
      </motion.div>

      {/* Daily Study Goal */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-[#ffffff] border border-[#e2dabf]/60 rounded-3xl p-5 shadow-sm"
      >
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <div className="bg-[#fed65b]/20 text-[#944a00] p-2.5 rounded-xl border border-[#fed65b]/30">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-[#1f1c0b]">الهدف اليومي</h3>
              <p className="text-xs font-bold text-[#506072]">اختر هدفك من نقاط الخبرة (XP)</p>
            </div>
          </div>
          
          <select 
            value={dailyGoalXP}
            onChange={(e) => {
              if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) window.navigator.vibrate(20);
              setDailyGoalXP(Number(e.target.value));
            }}
            className="bg-[#f3f4f5] border-2 border-[#e2dabf]/60 text-[#006d37] text-sm font-black rounded-xl px-4 py-2 outline-none focus:border-[#2ecc71] transition-colors cursor-pointer appearance-none text-center"
            dir="rtl"
          >
            <option value={20}>20 نقطة (خفيف)</option>
            <option value={50}>50 نقطة (عادي)</option>
            <option value={100}>100 نقطة (مكثف)</option>
            <option value={200}>200 نقطة (وحش)</option>
          </select>
        </div>

        <div className="space-y-2.5">
          <div className="flex justify-between text-sm font-bold text-[#504441]">
            <span>النقاط المكتسبة اليوم</span>
            <span className={todayXP >= dailyGoalXP ? "text-[#2ecc71]" : "text-[#006d37]"}>
              {Math.min(todayXP, dailyGoalXP)} / {dailyGoalXP} XP
            </span>
          </div>
          <div className="w-full bg-[#f3f4f5] h-3.5 rounded-full overflow-hidden border border-[#bbcbbb]/20 relative">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden ${todayXP >= dailyGoalXP ? 'bg-[#2ecc71]' : 'bg-[#fed65b]'}`} 
              style={{ width: `${Math.min((todayXP / dailyGoalXP) * 100, 100)}%` }} 
            >
              <div className="absolute inset-0 w-full h-full bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%,transparent_100%)] bg-[length:20px_20px] animate-[slide_1s_linear_infinite]" />
            </div>
          </div>
          {todayXP >= dailyGoalXP && (
            <motion.p 
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-[#006d37] font-black text-center mt-2 bg-[#2ecc71]/10 py-1.5 rounded-lg border border-[#2ecc71]/30"
            >
              🎉 بطل! لقد حققت هدفك اليومي بامتياز
            </motion.p>
          )}
        </div>
      </motion.div>

      {/* Horizontal Timeline */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-[#ffffff] border border-[#e2dabf]/60 rounded-3xl p-5 shadow-sm overflow-hidden"
        dir="ltr"
      >
        <div className="overflow-x-auto pb-6 pt-2 px-2 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }} dir="rtl">
          <style>{`
            .scrollbar-hide::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          <div className="flex justify-between items-center min-w-max">
            {units.map((unit, index) => {
              const isLocked = unit.isLocked && !progress.completedUnits.includes(unit.id - 1);
              const isCompleted = unit.progress === 100;
              const isActive = unit.id === activeUnit.id;
              const isSelected = selectedUnitId === unit.id;

              return (
                <div key={unit.id} className="flex items-center">
                  {/* Connector line before (except first) */}
                  {index > 0 && (
                    <div className={`w-6 md:w-12 h-1.5 ${units[index-1].progress === 100 ? 'bg-[#2ecc71]' : 'bg-[#e2dabf]/50'}`} />
                  )}
                  
                  {/* Node */}
                  <button 
                    onClick={() => {
                      if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
                        window.navigator.vibrate(40);
                      }
                      !isLocked && setSelectedUnitId(prev => prev === unit.id ? null : unit.id)
                    }}
                    className={`relative flex items-center justify-center w-12 h-12 rounded-full transition-all shrink-0 ${isLocked ? 'cursor-not-allowed' : 'cursor-pointer'} ${
                      isSelected 
                        ? 'bg-[#fff9ed] scale-110 shadow-md ring-4 ring-[#006d37]/10' 
                        : isCompleted
                          ? 'bg-[#2ecc71]/10 hover:bg-[#2ecc71]/20'
                          : isLocked
                            ? 'bg-[#f3f4f5] opacity-60 border-2 border-[#e2dabf]'
                            : isActive
                              ? 'bg-[#fff9ed] ring-4 ring-[#2ecc71]/30 shadow-[0_0_15px_rgba(46,204,113,0.4)]'
                              : 'bg-[#ffffff] hover:bg-[#fff9ed]'
                    }`}
                    title={unit.title}
                    disabled={isLocked}
                  >
                    {!isLocked && (
                      <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 48 48">
                        <circle
                          cx="24"
                          cy="24"
                          r="23"
                          fill="none"
                          stroke={isCompleted ? "#2ecc71" : "#e2dabf"}
                          strokeWidth="2"
                          className={isSelected || isActive ? "opacity-20" : "opacity-60"}
                        />
                        <circle
                          cx="24"
                          cy="24"
                          r="23"
                          fill="none"
                          stroke={isCompleted ? "#2ecc71" : "#006d37"}
                          strokeWidth="2.5"
                          strokeDasharray={23 * 2 * Math.PI}
                          strokeDashoffset={23 * 2 * Math.PI - (unit.progress / 100) * 23 * 2 * Math.PI}
                          strokeLinecap="round"
                          className="transition-all duration-1000 ease-out"
                        />
                      </svg>
                    )}
                    
                    {isActive && !isSelected && (
                      <div className="absolute inset-0 rounded-full animate-ping bg-[#2ecc71] opacity-20 pointer-events-none" />
                    )}
                    {isActive && !isSelected ? (
                      <Target className="w-6 h-6 text-[#006d37] z-10" />
                    ) : isCompleted ? (
                      <CheckCircle className="w-6 h-6 text-[#2ecc71] z-10" />
                    ) : isLocked ? (
                      <Lock className="w-5 h-5 text-[#bbcbbb] z-10" />
                    ) : (
                      <span className={`font-bold z-10 ${isSelected ? 'text-[#006d37]' : 'text-[#506072]'}`}>{unit.id}</span>
                    )}
                    
                    {/* Floating tooltip for active unit (if not selected) */}
                    {isActive && !isSelected && (
                      <div className="absolute -bottom-6 whitespace-nowrap text-[10px] font-bold text-[#006d37] bg-[#fff9ed] px-2 py-0.5 rounded-md border border-[#e2dabf]">
                        الوحدة {unit.id}
                      </div>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Unit Collapsible Card */}
        <AnimatePresence>
          {selectedUnitId && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              className="overflow-hidden"
              dir="rtl"
            >
              {(() => {
                const selectedUnit = units.find(u => u.id === selectedUnitId);
                if (!selectedUnit) return null;
                return (
                  <div className="bg-[#fff9ed] border border-[#e2dabf] rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-5 shadow-inner">
                    <div className="text-right flex-1 w-full">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[#944a00] font-bold text-sm bg-[#e2dabf]/40 px-2.5 py-0.5 rounded-lg border border-[#e2dabf]/50">الوحدة {selectedUnit.id}</span>
                        <span className="text-xs text-[#506072] font-bold">{selectedUnit.lessonsCount} درس</span>
                      </div>
                      <h4 className="text-lg font-black text-[#1f1c0b]">{selectedUnit.title}</h4>
                      <div className="flex items-center gap-3 mt-3">
                        <span className="text-xs font-bold text-[#504441] whitespace-nowrap">{selectedUnit.progress}%</span>
                        <div className="flex-1 bg-[#ffffff] h-2.5 rounded-full overflow-hidden border border-[#bbcbbb]/30">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${selectedUnit.progress === 100 ? 'bg-[#2ecc71]' : 'bg-[#006d37]'}`} 
                            style={{ width: `${selectedUnit.progress}%` }} 
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-3 w-full sm:w-auto">
                      <button 
                        onClick={() => {
                          if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) window.navigator.vibrate(30);
                          onLaunchQuiz(selectedUnit.id);
                        }}
                        className="flex-1 sm:w-auto bg-[#006d37] hover:bg-[#00562b] text-[#ffffff] px-6 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all hover:-translate-y-0.5 cursor-pointer"
                      >
                        <Play className="w-4 h-4 fill-current" />
                        <span>تدريب</span>
                      </button>
                      <button 
                        onClick={() => {
                          if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) window.navigator.vibrate(30);
                          onLaunchRevision(selectedUnit.id);
                        }}
                        className="flex-1 sm:w-auto bg-[#ffffff] hover:bg-[#fed65b]/20 text-[#006d37] border-2 border-[#e2dabf] px-6 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 cursor-pointer"
                      >
                        <Brain className="w-4 h-4 text-[#944a00]" />
                        <span>مراجعة</span>
                      </button>
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
