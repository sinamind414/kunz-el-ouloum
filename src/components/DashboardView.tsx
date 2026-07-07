import { motion } from 'motion/react';
import { Trophy, Flame, Play, Lock, ChevronRight, BookOpen, GraduationCap, CheckCircle, Brain, Sparkles, User } from 'lucide-react';
import { Unit, UserProgress } from '../types';

interface DashboardViewProps {
  units: Unit[];
  progress: UserProgress;
  onLaunchQuiz: (unitId: number) => void;
  onLaunchRevision: (unitId: number) => void;
  onNavigateToTab: (tab: 'home' | 'lessons' | 'review' | 'stats' | 'chat' | 'methodology') => void;
}

export default function DashboardView({ units, progress, onLaunchQuiz, onLaunchRevision, onNavigateToTab }: DashboardViewProps) {
  
  // Calculate average progress
  const averageProgress = Math.round(
    units.reduce((acc, u) => acc + u.progress, 0) / units.length
  );

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

      {/* Main Domain Highlight Block */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-[#ffffff] border border-[#e2dabf]/60 rounded-3xl p-6 shadow-sm flex flex-col relative overflow-hidden group"
      >
        <div className="absolute top-4 left-4 bg-[#2ecc71]/10 text-[#006d37] w-12 h-12 rounded-full flex items-center justify-center">
          <GraduationCap className="w-6 h-6" />
        </div>

        <div className="space-y-1">
          <span className="text-xs font-bold text-[#506072] block">المجال الأول</span>
          <h3 className="text-3xl font-black text-[#006d37] tracking-tight">البروتينات</h3>
        </div>

        <p className="text-sm text-[#504441] leading-relaxed mt-4 max-w-xl">
          دراسة معمقة لآليات تركيب البروتين، العلاقة بين بنيته الفراغية ووظيفته الحيوية الأساسية، ودوره الأساسي الفعّال في الدفاع عن العضوية والتنظيم المناعي للجسم البشري.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mt-6 pt-6 border-t border-[#e2dabf]/30">
          <div className="bg-[#fff9ed] border border-[#e2dabf]/40 rounded-2xl px-5 py-3 text-center w-full sm:w-auto shadow-inner">
            <span className="text-xs text-[#504441] block font-medium">إجمالي الدروس</span>
            <span className="text-2xl font-black text-[#006d37]">44 درس</span>
          </div>
          
          <button 
            onClick={() => onNavigateToTab('lessons')}
            className="w-full sm:w-auto bg-[#fff9ed] hover:bg-[#fed65b]/20 text-[#006d37] hover:text-[#00562b] border border-[#e2dabf] px-5 py-3 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <Brain className="w-4 h-4 text-[#944a00]" />
            <span>انتقل إلى الدروس التفاعلية</span>
            <ChevronRight className="w-4 h-4 rotate-180" />
          </button>
        </div>
      </motion.div>

      {/* Units Progress List */}
      <div className="space-y-4">
        <h4 className="text-lg font-bold text-[#1f1c0b] flex items-center gap-2 px-1">
          <BookOpen className="w-5 h-5 text-[#006d37]" />
          <span>وحدات المجال المقررة:</span>
        </h4>

        <div className="grid gap-4 md:grid-cols-1">
          {units.map((unit, index) => {
            const isLocked = unit.isLocked && !progress.completedUnits.includes(unit.id - 1);
            
            return (
              <motion.div
                key={unit.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className={`relative bg-[#ffffff] border ${isLocked ? 'border-[#e2dabf]/30 opacity-80' : 'border-[#e2dabf]/60 hover:shadow-md'} rounded-3xl p-5 shadow-sm transition-all duration-300 flex flex-col md:flex-row justify-between gap-4`}
              >
                {/* Visual Accent Bar */}
                <div className={`absolute top-0 bottom-0 right-0 w-2 rounded-r-3xl ${unit.progress === 100 ? 'bg-[#2ecc71]' : unit.progress > 0 ? 'bg-[#006d37]' : 'bg-[#e2dabf]'}`} />

                {/* Left side info */}
                <div className="flex-1 space-y-3 pr-4">
                  <div className="flex items-center gap-2">
                    <span className="bg-[#fff9ed] text-[#944a00] border border-[#e2dabf]/50 text-xs px-2.5 py-1 rounded-lg font-bold">
                      الوحدة {unit.id}
                    </span>
                    <span className="text-xs text-[#506072] font-semibold">{unit.lessonsCount} درس</span>
                  </div>

                  <h5 className="text-lg font-bold text-[#1f1c0b] flex items-center gap-1.5">
                    {unit.title}
                    {unit.progress === 100 && (
                      <CheckCircle className="w-4 h-4 text-[#2ecc71] fill-current text-white" />
                    )}
                  </h5>

                  {/* Progress Indicator */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-[#504441]">
                      <span>تقدم التدريبات</span>
                      <span className="font-bold">{unit.progress}%</span>
                    </div>
                    <div className="w-full bg-[#f3f4f5] h-2.5 rounded-full overflow-hidden border border-[#bbcbbb]/20">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${unit.progress === 100 ? 'bg-[#2ecc71]' : 'bg-[#006d37]'}`} 
                        style={{ width: `${unit.progress}%` }} 
                      />
                    </div>
                  </div>
                </div>

                {/* Right side Actions */}
                <div className="flex md:flex-col justify-end gap-2 md:w-48">
                  {isLocked ? (
                    <div className="w-full bg-[#f3f4f5] text-[#506072] border border-[#e2dabf]/50 text-xs py-3.5 rounded-xl font-bold flex items-center justify-center gap-2">
                      <Lock className="w-4 h-4 text-[#944a00]" />
                      <span>ابـدأ الـوحدة</span>
                    </div>
                  ) : (
                    <>
                      <button 
                        onClick={() => onLaunchQuiz(unit.id)}
                        className="flex-1 bg-[#006d37] hover:bg-[#00562b] text-[#ffffff] px-4 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>ابدأ تدريب الاختبار</span>
                      </button>
                      <button 
                        onClick={() => onLaunchRevision(unit.id)}
                        className="flex-1 bg-[#fff9ed] hover:bg-[#fed65b]/10 text-[#006d37] border border-[#e2dabf] px-4 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Brain className="w-3.5 h-3.5 text-[#944a00]" />
                        <span>متابعة بطاقات الذكاء</span>
                      </button>
                    </>
                  )}
                </div>

              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
