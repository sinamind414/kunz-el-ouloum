import { useMemo } from 'react';
import { Flame, Trophy, Target, AlertTriangle, Hourglass, Dices, HelpCircle } from 'lucide-react';
import { Unit, UserProgress, TabId } from '../types';
import { useAuth } from '../context/AuthContext';
import { calculateCountdown } from '../utils/countdownEngine';

interface MyPathViewProps {
  units: Unit[];
  progress: UserProgress;
  onLaunchQuiz: (unitId: number) => void;
  onLaunchRevision: (unitId: number) => void;
  onNavigateToTab: (tab: TabId) => void;
}

// Une icône motivante = pourquoi j'ai envie d'étudier (jamais une navigation dupliquée de la bottom nav).
interface MotivationIcon {
  key: string;
  Icon: React.ElementType;
  badge?: React.ReactNode;
  title: string;
  line: string;
  ring: number; // 0-100 anneau de progression
  from: string;
  to: string;
  onClick: () => void;
}

export default function MyPathView({ units, progress, onLaunchQuiz, onLaunchRevision, onNavigateToTab }: MyPathViewProps) {
  const { user } = useAuth();

  // Unité cible du jour : la plus faible non terminée (quick win + comblage de lacune).
  const dailyTargetUnit = useMemo(() => {
    const incomplete = units.filter((u) => !u.isLocked && u.progress < 100).sort((a, b) => a.progress - b.progress);
    return incomplete[0] || units[0];
  }, [units]);

  // Lacune dangereuse : unité débloquée la plus basse (urgence de révision).
  const criticalWeakUnit = useMemo(() => {
    const unlocked = units.filter((u) => !u.isLocked).sort((a, b) => a.progress - b.progress);
    return unlocked[0] || units[0];
  }, [units]);

  // Presque terminée : unité la plus avancée encore < 100 (effet Zeigarnik / goal gradient).
  const nearCompletionUnit = useMemo(() => {
    const almost = units.filter((u) => u.progress < 100).sort((a, b) => b.progress - a.progress);
    return almost[0] || units[0];
  }, [units]);

  // Question surprise : unité débloquée au hasard (curiosity gap).
  const randomUnit = useMemo(() => {
    const pool = units.filter((u) => !u.isLocked);
    const src = pool.length ? pool : units;
    return src[Math.floor(Math.random() * src.length)] || units[0];
  }, [units]);

  const bacDays = useMemo(() => calculateCountdown().timeLeft.days, []);
  const firstName = (user?.name || 'Élève Kunz').split(' ')[0];

  const icons: MotivationIcon[] = [
    {
      key: 'streak',
      Icon: Flame,
      title: 'سلسلة الأيام',
      line: progress.streak > 0 ? `${progress.streak} يوم مواظبة — لا تكسرها!` : 'ابدأ سلسلتك اليوم!',
      ring: Math.min(100, (progress.streak % 30) * (100 / 30)),
      from: '#059669',
      to: '#10b981',
      onClick: () => onLaunchRevision(dailyTargetUnit.id),
    },
    {
      key: 'challenge',
      Icon: Target,
      title: 'تحدي 3 دقائق',
      line: 'ابدأ التحدي — اختبر معرفتك بسرعة',
      ring: dailyTargetUnit?.progress ?? 0,
      from: '#ffb347',
      to: '#ff9a4a',
      onClick: () => onLaunchQuiz(dailyTargetUnit.id),
    },
    {
      key: 'gap',
      Icon: AlertTriangle,
      title: 'ثغرة خطيرة',
      line: `« ${criticalWeakUnit?.title} » تحتاج مراجعة!`,
      ring: criticalWeakUnit?.progress ?? 0,
      from: '#f59e0b',
      to: '#ef4444',
      onClick: () => onLaunchRevision(criticalWeakUnit.id),
    },
    {
      key: 'bac',
      Icon: Hourglass,
      title: 'عدّاد BAC',
      line: `${bacDays} يوم الباقي — الوقت يمر`,
      ring: Math.max(5, Math.min(100, 100 - (bacDays / 365) * 100)),
      from: '#0ea5e9',
      to: '#6366f1',
      onClick: () => onNavigateToTab('progress'),
    },
    {
      key: 'surprise',
      Icon: Dices,
      badge: <HelpCircle className="w-4 h-4" />,
      title: 'سؤال مفاجئ',
      line: 'اختبر معلوماتك — سؤال عشوائي',
      ring: 60,
      from: '#a855f7',
      to: '#ec4899',
      onClick: () => onLaunchQuiz(randomUnit.id),
    },
    {
      key: 'almost',
      Icon: Trophy,
      title: 'إنجاز قريب',
      line: `« ${nearCompletionUnit?.title} » ${nearCompletionUnit?.progress ?? 0}% — أكمل الوحدة!`,
      ring: nearCompletionUnit?.progress ?? 0,
      from: '#eab308',
      to: '#f59e0b',
      onClick: () => onNavigateToTab('lessons'),
    },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto p-4 md:p-6 pb-28" dir="rtl">
      {/* Zone 1 — Header minimal 1 ligne : XP | streak | élève */}
      <div className="flex items-center justify-between gap-2 rounded-2xl bg-white dark:bg-[#141916] border border-gray-200 dark:border-gray-800 px-4 py-3 shadow-sm mb-4">
        <div className="flex items-center gap-3 text-sm font-black">
          <span className="flex items-center gap-1 text-[#b45309] dark:text-[#ffd27a]">
            <Trophy className="w-4 h-4 fill-current" /> {progress.xp} XP
          </span>
          <span className="text-gray-300 dark:text-gray-700">|</span>
          <span className="flex items-center gap-1 text-[#ff9a4a]">
            <Flame className="w-4 h-4 fill-current" /> {progress.streak} يوم
          </span>
        </div>
        <div className="text-right">
          <span className="block text-xs font-black text-gray-900 dark:text-white">{firstName}</span>
          <span className="block text-[10px] text-gray-500 dark:text-gray-400">SVT · الجزائر</span>
        </div>
      </div>

      {/* Zone 2 — Hero unique orange : 1 seule action principale */}
      <button
        onClick={() => dailyTargetUnit && onLaunchQuiz(dailyTargetUnit.id)}
        className="w-full text-right rounded-3xl p-5 bg-gradient-to-br from-[#ffb347] to-[#ff9a4a] text-white shadow-md mb-5 hover:brightness-105 active:scale-[0.99] transition-all cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
            <Target className="w-7 h-7" />
          </div>
          <div className="flex-1">
            <h2 className="font-black text-lg leading-tight">مهمة 3 دقائق <span className="text-[#fff3d6]">+15 XP</span></h2>
            <p className="text-white/90 text-sm mt-0.5 truncate">« {dailyTargetUnit?.title} »</p>
          </div>
          <span className="bg-white text-[#b45309] font-black text-sm px-4 py-2 rounded-xl shrink-0">
            ابدأ الآن!
          </span>
        </div>
      </button>

      {/* Zone 3 — Grille 2x3 = 6 icônes rondes motivantes (aucune duplication bottom nav) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {icons.map(({ key, Icon, badge, title, line, ring, from, to, onClick }) => (
          <button
            key={key}
            onClick={onClick}
            className="flex flex-col items-center text-center gap-2 rounded-3xl bg-white dark:bg-[#141916] border border-gray-200 dark:border-gray-800 p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] transition-all cursor-pointer"
          >
            {/* Icône ronde 80px avec anneau de progression */}
            <div
              className="relative w-20 h-20 rounded-full p-[3px]"
              style={{ background: `conic-gradient(${to} ${ring}%, rgba(0,0,0,0.08) ${ring}% 100%)` }}
            >
              <div
                className="w-full h-full rounded-full flex items-center justify-center text-white"
                style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
              >
                <Icon className="w-8 h-8" />
                {badge && (
                  <span className="absolute -top-1 -left-1 w-6 h-6 rounded-full bg-white text-[#a855f7] flex items-center justify-center shadow">
                    {badge}
                  </span>
                )}
              </div>
            </div>
            <span className="font-black text-sm text-gray-900 dark:text-white">{title}</span>
            <span className="text-[11px] leading-4 text-gray-500 dark:text-gray-400 line-clamp-2 min-h-[2rem]">{line}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
