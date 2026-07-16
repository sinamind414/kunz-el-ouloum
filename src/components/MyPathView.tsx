import { useState, useMemo, useEffect } from 'react';
import { Flame, Trophy, Target, AlertTriangle, Hourglass, Dices, HelpCircle, Check, Lock, PlayCircle, Sparkles, Compass, ArrowLeft } from 'lucide-react';
import { Unit, UserProgress, TabId } from '../types';
import { useAuth } from '../context/AuthContext';
import { calculateCountdown } from '../utils/countdownEngine';
import {
  loadMissions,
  getCurrentMission,
  canDoMissionToday,
  completeMission,
  getMissionsProgress,
  isManhadjiyaDone,
  type Mission,
} from '../utils/missionManager';

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

export default function MyPathView(props: MyPathViewProps) {
  const { units, progress, onLaunchQuiz, onLaunchRevision, onNavigateToTab } = props;

  // Formation Jour 0 (onboarding « 6 lois ») : accessible via un bouton dédié,
  // mais NE BLOQUE PLUS l'accès au tableau de bord (les 6 icônes s'affichent tout de suite).
  const [missions, setMissions] = useState<Mission[]>(() => loadMissions());
  const [showOnboarding, setShowOnboarding] = useState<boolean>(() => isManhadjiyaDone() ? false : false);
  useEffect(() => {
    setMissions(loadMissions());
  }, []);

  if (showOnboarding) {
    return (
      <div className="w-full max-w-2xl mx-auto p-4 md:p-6 pb-28" dir="rtl">
        <button
          onClick={() => setShowOnboarding(false)}
          className="mb-3 flex items-center gap-2 text-sm font-bold text-[#006d37] dark:text-[#2ecc71] cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          رجوع إلى مساري
        </button>
        <JourZeroView
          missions={missions}
          progress={progress}
          onMissionsChange={(m) => { setMissions(m); if (m.every((x) => x.status === 'done')) setShowOnboarding(false); }}
          onNavigateToTab={onNavigateToTab}
        />
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-4 md:p-6 pb-28" dir="rtl">
      {/* Accès direct à la formation Jour 0 (ne bloque plus le dashboard). */}
      <button
        onClick={() => setShowOnboarding(true)}
        className="mb-3 w-full flex items-center justify-center gap-2 rounded-2xl border border-[#006d37]/30 bg-white dark:bg-[#141916] px-4 py-2.5 text-xs font-black text-[#006d37] dark:text-[#2ecc71] cursor-pointer hover:bg-[#fff9ed] dark:hover:bg-[#1a221d] transition-colors"
      >
        <Compass className="w-4 h-4" />
        مسار المنهجية (6 قوانين Kunz) — ابدأ التكوين
      </button>
      <MotivationView
        units={units}
        progress={progress}
        onLaunchQuiz={onLaunchQuiz}
        onLaunchRevision={onLaunchRevision}
        onNavigateToTab={onNavigateToTab}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// JOUR 0 — 1 ouverture = 1 mission (non surchargé, arabe fousha)
// ═══════════════════════════════════════════════════════════════════════

function JourZeroView({
  missions,
  progress,
  onMissionsChange,
  onNavigateToTab,
}: {
  missions: Mission[];
  progress: UserProgress;
  onMissionsChange: (m: Mission[]) => void;
  onNavigateToTab: (tab: TabId) => void;
}) {
  const current = getCurrentMission(missions);
  const { done: doneCount, total } = getMissionsProgress(missions);
  const allDone = doneCount === total;
  const alreadyToday = !canDoMissionToday(missions) && !allDone;

  const handleStart = () => {
    if (!current) return;
    const updated = completeMission(current.id, false);
    if (updated) onMissionsChange(updated);
  };

  const handleExtra = () => {
    if (!current) return;
    const updated = completeMission(current.id, true);
    if (updated) onMissionsChange(updated);
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 md:p-6 pb-28" dir="rtl">
      {/* Zone 1 — Header 1 ligne : XP | streak | مسار المنهجية X/6 */}
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
          <span className="block text-xs font-black text-gray-900 dark:text-white">
            مسار المنهجية {doneCount}/{total} مهام
          </span>
          <span className="block text-[10px] text-gray-500 dark:text-gray-400">SVT · الجزائر</span>
        </div>
      </div>

      {/* Zone 2 — Carte verte Jour 0 + Loi actuelle */}
      <div className="rounded-3xl p-5 bg-gradient-to-br from-[#006d37] to-[#003d1e] text-white shadow-md mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Compass className="w-5 h-5 text-[#fed65b]" />
          <span className="font-black text-lg">تصبح غير صفر في 45 دقيقة</span>
        </div>
        <p className="text-white/85 text-sm leading-relaxed">
          6 قوانين ذهبية Kunz El Ouloum — كل فتح = مهمة واحدة فقط. عربية فصحى، أرقام فرنسية.
        </p>
        {current && (
          <div className="mt-3 bg-white/10 rounded-2xl px-4 py-3 flex items-center justify-between">
            <div>
              <div className="text-[11px] text-white/70">{current.id} — {current.titleAr}</div>
              <div className="font-black">{current.loiKunz}</div>
            </div>
            <div className="text-left">
              <div className="text-[11px] text-white/70">{current.duration} دقيقة</div>
              <div className="font-black text-[#fed65b]">+{current.xp} XP</div>
            </div>
          </div>
        )}
      </div>

      {/* Zone 3 — Timeline 6 ronds M0..M5 + grille 3x2 XP/durée */}
      <div className="rounded-3xl bg-white dark:bg-[#141916] border border-gray-200 dark:border-gray-800 p-4 shadow-sm mb-4">
        <div className="flex items-center justify-between mb-3">
          {missions.map((m) => (
            <div key={m.id} className="flex flex-col items-center gap-1 flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${
                  m.status === 'done'
                    ? 'bg-[#006d37] text-white'
                    : m.status === 'current'
                    ? 'bg-[#ff9a4a] text-white ring-2 ring-[#ff9a4a]/30'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                }`}
              >
                {m.status === 'done' ? <Check className="w-4 h-4" /> : m.status === 'current' ? <PlayCircle className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
              </div>
              <span className="text-[9px] font-bold text-gray-500 dark:text-gray-400">{m.id}</span>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-2">
          {missions.map((m) => (
            <div
              key={m.id}
              className={`rounded-xl px-2 py-1.5 text-center border ${
                m.status === 'current'
                  ? 'border-[#ff9a4a]/40 bg-[#fff9ed] dark:bg-[#1a221d]'
                  : 'border-gray-100 dark:border-gray-800'
              }`}
            >
              <div className="text-[10px] font-bold text-gray-700 dark:text-gray-200 truncate">{m.titleAr}</div>
              <div className="text-[9px] text-gray-400">{m.duration}د · +{m.xp}XP</div>
            </div>
          ))}
        </div>
      </div>

      {/* Zone 4 — Hero mission du jour orange + bouton */}
      {allDone ? (
        <div className="rounded-3xl p-6 bg-gradient-to-br from-[#2ecc71] to-[#006d37] text-white text-center shadow-md">
          <Sparkles className="w-10 h-10 mx-auto text-white mb-2" />
          <h2 className="font-black text-xl">مبروك! أنت غير صفر</h2>
          <p className="text-white/90 text-sm mt-1">مسارك الكامل مفتوح — 6 قوانين تمت.</p>
          <button
            onClick={() => onNavigateToTab('lessons')}
            className="mt-4 w-full rounded-2xl bg-white text-[#006d37] font-black py-3 text-sm hover:brightness-105 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            ادخل إلى الدروس <ArrowLeft className="w-4 h-4" />
          </button>
        </div>
      ) : alreadyToday ? (
        <div className="rounded-3xl p-6 bg-white dark:bg-[#141916] border border-gray-200 dark:border-gray-800 text-center shadow-sm">
          <div className="text-3xl mb-2">✅</div>
          <h2 className="font-black text-lg text-gray-900 dark:text-white">ممتاز! أكملت مهمة اليوم</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">عد غدا لمهمة جديدة — لا تكسر السلسلة!</p>
          {current && (
            <button
              onClick={handleExtra}
              className="mt-4 w-full rounded-2xl border border-dashed border-[#006d37]/40 text-[#006d37] dark:text-[#2ecc71] font-black py-3 text-sm hover:bg-[#fff9ed] dark:hover:bg-[#1a221d] transition-all cursor-pointer"
            >
              فعل مهمة إضافية اليوم (اختياري) — {current.titleAr} +{current.xp} XP
            </button>
          )}
        </div>
      ) : (
        current && (
          <button
            onClick={handleStart}
            className="w-full text-right rounded-3xl p-5 bg-gradient-to-br from-[#ffb347] to-[#ff9a4a] text-white shadow-md hover:brightness-105 active:scale-[0.99] transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                <Target className="w-7 h-7" />
              </div>
              <div className="flex-1">
                <h2 className="font-black text-lg leading-tight">
                  مهمة اليوم: {current.id} {current.titleAr} <span className="text-[#fff3d6]">+{current.xp} XP</span>
                </h2>
                <p className="text-white/90 text-sm mt-0.5 truncate">
                  {current.loiKunz} · {current.duration} دقيقة · عربية فصحى فقط
                </p>
              </div>
              <span className="bg-white text-[#b45309] font-black text-sm px-4 py-2 rounded-xl shrink-0">
                ابدأ المهمة الآن!
              </span>
            </div>
          </button>
        )
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// JOUR 1+ — 6 icônes motivantes (déjà codé)
// ═══════════════════════════════════════════════════════════════════════

function MotivationView({ units, progress, onLaunchQuiz, onLaunchRevision, onNavigateToTab }: MyPathViewProps) {
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
    <div className="w-full" dir="rtl">
      {/* Header 1 ligne : XP | streak | élève + rappel formation */}
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
          <span className="block text-[10px] text-[#006d37] dark:text-[#2ecc71]">أكملت المنهجية — أنت غير صفر</span>
        </div>
      </div>

      {/* Hero unique orange : 1 seule action principale */}
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

      {/* Grille 2x3 = 6 icônes rondes motivantes (aucune duplication bottom nav) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {icons.map(({ key, Icon, badge, title, line, ring, from, to, onClick }) => (
          <button
            key={key}
            onClick={onClick}
            className="flex flex-col items-center text-center gap-2 rounded-3xl bg-white dark:bg-[#141916] border border-gray-200 dark:border-gray-800 p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] transition-all cursor-pointer"
          >
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
