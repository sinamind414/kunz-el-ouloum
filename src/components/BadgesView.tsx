import { motion } from 'motion/react';
import { Award, Flame, BookOpen, Trophy, Target, Star, Brain, CheckCircle, Zap } from 'lucide-react';

interface BadgesViewProps {
  progress: any;
}

export default function BadgesView({ progress }: BadgesViewProps) {
  const completedUnitsCount = progress?.completedUnits?.length || 0;
  const streak = progress?.streak || 0;
  const xp = progress?.xp || 0;

  const achievementsList = [
    {
      id: 'streak_7',
      title: "أسبوع من الاستمرارية",
      description: "حافظ على حماسك بالدراسة لـ 7 أيام متتالية",
      unlocked: streak >= 7,
      current: streak,
      target: 7,
      badgeColor: "bg-[#ff9a4a]/10 text-[#ff5d40] border-[#ff9a4a]/20",
      icon: <Flame className="w-8 h-8 fill-current" />
    },
    {
      id: 'streak_30',
      title: "شهر من الاجتهاد",
      description: "حافظ على حماسك بالدراسة لـ 30 يوم متتالية",
      unlocked: streak >= 30,
      current: streak,
      target: 30,
      badgeColor: "bg-rose-500/10 text-rose-500 border-rose-500/20",
      icon: <Flame className="w-8 h-8 fill-current" />
    },
    {
      id: 'units_5',
      title: "إنهاء 5 وحدات بامتياز",
      description: "أنهِ دراسة وتدريب 5 وحدات دراسية بالكامل",
      unlocked: completedUnitsCount >= 5,
      current: completedUnitsCount,
      target: 5,
      badgeColor: "bg-[#2ecc71]/10 text-[#006d37] border-[#2ecc71]/20",
      icon: <BookOpen className="w-8 h-8" />
    },
    {
      id: 'units_10',
      title: "عالم الأحياء",
      description: "أنهِ دراسة وتدريب 10 وحدات دراسية",
      unlocked: completedUnitsCount >= 10,
      current: completedUnitsCount,
      target: 10,
      badgeColor: "bg-blue-500/10 text-blue-600 border-blue-500/20",
      icon: <Brain className="w-8 h-8" />
    },
    {
      id: 'xp_1000',
      title: "جامع الكنوز",
      description: "اكتسب 1,000 نقطة خبرة (XP)",
      unlocked: xp >= 1000,
      current: xp,
      target: 1000,
      badgeColor: "bg-[#fed65b]/20 text-[#944a00] border-[#fed65b]/30",
      icon: <Trophy className="w-8 h-8 fill-current text-white" />
    },
    {
      id: 'xp_5000',
      title: "أسطورة المعرفة",
      description: "اكتسب 5,000 نقطة خبرة (XP)",
      unlocked: xp >= 5000,
      current: xp,
      target: 5000,
      badgeColor: "bg-purple-500/10 text-purple-600 border-purple-500/20",
      icon: <Star className="w-8 h-8 fill-current" />
    },
    {
      id: 'first_quiz',
      title: "الخطوة الأولى",
      description: "أنهِ أول تدريب بنجاح",
      unlocked: xp > 0,
      current: xp > 0 ? 1 : 0,
      target: 1,
      badgeColor: "bg-teal-500/10 text-teal-600 border-teal-500/20",
      icon: <Target className="w-8 h-8" />
    },
    {
      id: 'perfect_score',
      title: "العلامة الكاملة",
      description: "احصل على علامة كاملة في التدريب",
      unlocked: completedUnitsCount >= 1,
      current: completedUnitsCount >= 1 ? 1 : 0,
      target: 1,
      badgeColor: "bg-[#006d37]/10 text-[#006d37] border-[#006d37]/20",
      icon: <CheckCircle className="w-8 h-8" />
    },
    {
      id: 'fast_learner',
      title: "سريع التعلم",
      description: "أنهِ وحدة دراسية في أقل من 3 أيام",
      unlocked: xp >= 500,
      current: xp >= 500 ? 1 : 0,
      target: 1,
      badgeColor: "bg-amber-500/10 text-amber-600 border-amber-500/20",
      icon: <Zap className="w-8 h-8" />
    }
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-24" dir="rtl">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#ffffff] border border-[#e2dabf]/60 rounded-3xl p-6 shadow-sm flex items-center justify-between"
      >
        <div>
          <h2 className="text-2xl font-black text-[#1f1c0b] flex items-center gap-2">
            <Award className="w-7 h-7 text-[#006d37]" />
            لوحة الإنجازات
          </h2>
          <p className="text-[#506072] text-sm mt-1">تتبع أوسمتك وإنجازاتك في رحلة التعلم</p>
        </div>
        <div className="bg-[#fff9ed] border-2 border-[#e2dabf]/60 rounded-2xl p-4 text-center">
          <p className="text-[#944a00] font-black text-2xl">{achievementsList.filter(a => a.unlocked).length}</p>
          <p className="text-[#506072] text-xs font-bold">أوسمة مكتسبة</p>
        </div>
      </motion.div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {achievementsList.map((ach, idx) => {
          const percentage = Math.min(100, Math.round((ach.current / ach.target) * 100));
          return (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              key={ach.id}
              className={`p-6 rounded-3xl border-2 transition-all relative overflow-hidden flex flex-col justify-between ${
                ach.unlocked 
                  ? 'bg-[#ffffff] border-[#fed65b]/40 shadow-sm' 
                  : 'bg-[#f3f4f5] border-[#e2dabf]/40 opacity-70 grayscale'
              }`}
            >
              {ach.unlocked && (
                <div className="absolute top-0 right-0 w-24 h-24 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none" />
              )}
              
              <div className="flex items-start justify-between mb-4">
                <div className={`p-4 rounded-2xl border-2 ${ach.unlocked ? ach.badgeColor : 'bg-[#e2dabf]/30 text-[#506072] border-[#bbcbbb]/30'}`}>
                  {ach.icon}
                </div>
                {ach.unlocked && (
                  <span className="bg-[#2ecc71]/10 text-[#006d37] px-3 py-1 rounded-full text-xs font-bold border border-[#2ecc71]/20">
                    مكتسب
                  </span>
                )}
              </div>

              <div>
                <h4 className="font-extrabold text-[#1f1c0b] text-lg">{ach.title}</h4>
                <p className="text-xs text-[#506072] mt-1.5 leading-relaxed">{ach.description}</p>
              </div>

              <div className="mt-6">
                <div className="flex justify-between text-xs font-bold mb-2">
                  <span className={ach.unlocked ? 'text-[#006d37]' : 'text-[#506072]'}>
                    التقدم: {ach.current} / {ach.target}
                  </span>
                  <span className={ach.unlocked ? 'text-[#006d37]' : 'text-[#506072]'}>{percentage}%</span>
                </div>
                <div className="w-full bg-[#e2dabf]/30 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${
                      ach.unlocked ? 'bg-[#2ecc71]' : 'bg-[#bbcbbb]'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
