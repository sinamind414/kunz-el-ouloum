import { useState, useMemo } from 'react';
import { Flame, Trophy, Target, AlertTriangle, Hourglass, Dices, HelpCircle, Check, Lock, PlayCircle, Sparkles, Compass, ArrowLeft, ShieldCheck, BookOpen } from 'lucide-react';
import { Unit, UserProgress, TabId } from '../types';
import { useAuth } from '../context/AuthContext';
import { calculateCountdown } from '../utils/countdownEngine';
import { getNextAction, getMissionTitleAr, type FocusAction } from '../services/focusEngine';
import { EXAM_PASS_THRESHOLD, createEmptyMasteryState, type MasteryState } from '../services/masteryEngine';
import {
  loadMissions,
  getCurrentMission,
  canDoMissionToday,
  completeMission,
  getMissionsProgress,
  type Mission,
} from '../utils/missionManager';
import {
  selectMissionSelection,
  type MissionSelection,
} from '../services/missionEngine';
import { loadStore } from '../data/store';
import { getPublishableSurvivalCardById } from '../data/survivalCards';
import type { ConceptRoute } from '../data/store';
import type { CoreReflexId } from '../data/reflexes';

interface MyPathViewProps {
  units: Unit[];
  progress: UserProgress;
  /** V3 — état de maîtrise (unités validées, dernier échec…). Optionnel (rétrocompat). */
  mastery?: MasteryState;
  onLaunchQuiz: (unitId: number) => void;
  onLaunchRevision: (unitId: number) => void;
  onNavigateToTab: (tab: TabId) => void;
  onLaunchReflexMission?: (reflexId: CoreReflexId, meta: { missionId: string; conceptId: string; relatedErrorIds?: string[] }) => void;
  onLaunchSurvivalCard?: (cardId: string) => void;
  /** V3 — téléportation vers la prochaine action du Focus Engine (« أكمل من حيث توقفت »). */
  onResumeMission?: (action: FocusAction) => void;
  /** V3 — lancement de l'examen de validation d'unité (Le Gardien). */
  onLaunchExam?: (unitId: number) => void;
}

// Mappe une mission Manhadjiya (M0–M5) vers le réflexe méthodologique ciblé (P1.1-B).
const MISSION_REFLEX: Record<string, CoreReflexId | undefined> = {
  M2: 'analyse',
  M3: 'interpret',
  M4: 'hypothesize',
  M5: 'validate',
};

// Mappe une mission Manhadjiya vers la carte de survie validée de son concept (P1.2-B).
const MISSION_SURVIVAL_CARD: Record<string, string | undefined> = {
  M2: 'sc_enzymes',
  M3: 'sc_photosynthese',
  M4: 'sc_synapse',
  M5: 'sc_subduction',
};

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

const BEGINNER_ASSIMILATION_STEPS = ['شاهد', 'افهم', 'أجب', 'صحّح', 'ثبّت'] as const;

export default function MyPathView(props: MyPathViewProps) {
  const { units, progress, mastery, onLaunchQuiz, onLaunchRevision, onNavigateToTab, onLaunchReflexMission, onLaunchSurvivalCard, onResumeMission, onLaunchExam } = props;

  // Formation Jour 0 (onboarding « 6 lois ») : accessible via un bouton dédié,
  // mais NE BLOQUE PLUS l'accès au tableau de bord (les 6 icônes s'affichent tout de suite).
  const [missions, setMissions] = useState<Mission[]>(() => loadMissions());
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);

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
          onLaunchReflexMission={onLaunchReflexMission}
          onLaunchSurvivalCard={onLaunchSurvivalCard}
        />
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-4 md:p-6 pb-28" dir="rtl">
      <section className="mb-4 rounded-3xl border border-[#ffb347]/40 bg-gradient-to-br from-[#fff7e8] to-white dark:from-[#2a2118] dark:to-[#141916] p-4 md:p-5 shadow-sm" data-testid="mypath-beginner-launchpad">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="inline-flex items-center rounded-full bg-[#ffedd5] dark:bg-[#4b2f12] px-2.5 py-1 text-[10px] font-black text-[#b45309] mb-2">
              للمبتدئ أو إذا كنت لا تعرف من أين تبدأ
            </div>
            <h2 className="text-lg md:text-xl font-black text-[#1f1c0b] dark:text-white">ابدأ من هنا</h2>
            <p className="text-sm text-[#6a5b43] dark:text-gray-300 leading-7 mt-1">
              مسار بسيط يساعدك على الفهم قبل الحفظ: افتح التدريب، ثم ابدأ بباب «كيف أجيب؟» قبل أي تحدٍ أو QCM.
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#ff9a4a] text-white flex items-center justify-center shrink-0 shadow-sm">
            <Compass className="w-6 h-6" />
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {BEGINNER_ASSIMILATION_STEPS.map((step, index) => (
            <span
              key={step}
              className="inline-flex items-center rounded-full border border-[#ffd7a8] dark:border-[#6c4a1f] bg-white/90 dark:bg-black/10 px-2.5 py-1 text-[10px] font-black text-[#944a00] dark:text-[#ffd27a]"
            >
              {index + 1}. {step}
            </span>
          ))}
        </div>
        <button
          onClick={() => onNavigateToTab('training')}
          className="mt-4 w-full rounded-2xl bg-[#ff9a4a] hover:brightness-105 text-white font-black py-3 text-sm shadow-sm cursor-pointer"
        >
          ابدأ الآن من «أتدرب» ثم افتح «كيف أجيب؟»
        </button>
      </section>

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
        mastery={mastery}
        onLaunchQuiz={onLaunchQuiz}
        onLaunchRevision={onLaunchRevision}
        onNavigateToTab={onNavigateToTab}
        onResumeMission={onResumeMission}
        onLaunchExam={onLaunchExam}
        memoizedMissions={missions}
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
  onLaunchReflexMission,
  onLaunchSurvivalCard,
}: {
  missions: Mission[];
  progress: UserProgress;
  onMissionsChange: (m: Mission[]) => void;
  onNavigateToTab: (tab: TabId) => void;
  onLaunchReflexMission?: (reflexId: CoreReflexId, meta: { missionId: string; conceptId: string; relatedErrorIds?: string[] }) => void;
  onLaunchSurvivalCard?: (cardId: string) => void;
}) {
  const current = getCurrentMission(missions);
  const { done: doneCount, total } = getMissionsProgress(missions);
  const allDone = doneCount === total;
  const alreadyToday = !canDoMissionToday(missions) && !allDone;

  const isFirstSessions = progress && progress.xp <= 150;

  const handleStart = () => {
    if (!current) return;
    // P1.2-B — la mission démarre par la carte de survie UNIQUEMENT si publiable (revue).
    const cardId = MISSION_SURVIVAL_CARD[current.id];
    if (cardId && onLaunchSurvivalCard && getPublishableSurvivalCardById(cardId)) {
      onLaunchSurvivalCard(cardId);
      return;
    }
    const reflex = MISSION_REFLEX[current.id];
    if (reflex && onLaunchReflexMission) {
      // P1.1-B : ouvre l'entraînement sur le bon réflexe, sans choix intermédiaire.
      onLaunchReflexMission(reflex, { missionId: current.id, conceptId: current.id });
      return;
    }
    const updated = completeMission(current.id, false);
    if (updated) onMissionsChange(updated);
  };

  const handleExtra = () => {
    if (!current) return;
    const cardId = MISSION_SURVIVAL_CARD[current.id];
    if (cardId && onLaunchSurvivalCard && getPublishableSurvivalCardById(cardId)) {
      onLaunchSurvivalCard(cardId);
      return;
    }
    const reflex = MISSION_REFLEX[current.id];
    if (reflex && onLaunchReflexMission) {
      onLaunchReflexMission(reflex, { missionId: current.id, conceptId: current.id });
      return;
    }
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
            className={`w-full text-right rounded-3xl p-5 bg-gradient-to-br from-[#ffb347] to-[#ff9a4a] text-white shadow-md hover:brightness-105 active:scale-[0.99] transition-all cursor-pointer relative overflow-hidden ${isFirstSessions ? 'ring-4 ring-[#ff9a4a]/50 ring-offset-2 ring-offset-white dark:ring-offset-[#0c0f0d] animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]' : ''}`}
          >
            {isFirstSessions && (
               <div className="absolute top-0 right-0 px-3 py-1 bg-white text-[#b45309] text-[10px] font-black rounded-bl-xl rounded-tr-3xl shadow-sm z-10">
                 ابدأ من هنا (خطوة أساسية)
               </div>
            )}
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

interface MotivationViewProps extends MyPathViewProps {
  memoizedMissions: Mission[];
}

function MotivationView({ units, progress, mastery, onLaunchQuiz, onLaunchRevision, onNavigateToTab, onResumeMission, onLaunchExam, memoizedMissions }: MotivationViewProps) {
  const { user } = useAuth();

  // V3 — Focus Engine : l'unité active + LA prochaine action unique.
  const focus: FocusAction = useMemo(
    () => getNextAction(units, mastery ?? createEmptyMasteryState()),
    [units, mastery],
  );
  const focusUnit = units.find((u) => u.id === focus.unitId) ?? null;

  // Sélection moteur (SpecKit §2/§6) : mission prioritaire OU état idle explicite.
  const selection: MissionSelection = useMemo(() => {
    const store = loadStore();
    const errors = store.learningErrors;
    const routes: Record<string, ConceptRoute> = {};
    for (const e of errors) {
      const cid = e.conceptId ?? e.id;
      if (!routes[cid]) {
        const cardId = getPublishableSurvivalCardById(cid)?.id;
        routes[cid] = { conceptId: cid, unitId: 0, ...(cardId ? { survivalCardId: cardId } : {}) };
      }
    }
    const completedMissions = memoizedMissions.filter((m) => m.completedAt != null).length;
    return selectMissionSelection(errors, routes, { completedMissions });
  }, [memoizedMissions]);

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

      {/* ═══════════ V3 — LA BOUSSOLE : objectif unique + prochaine action ═══════════ */}
      {focus.kind === 'all_done' ? (
        <div className="rounded-3xl p-6 bg-gradient-to-br from-[#2ecc71] to-[#006d37] text-white text-center shadow-md mb-5" data-testid="mypath-focus-card">
          <Trophy className="w-10 h-10 mx-auto text-[#fed65b] mb-2" />
          <h2 className="font-black text-xl">مبروك! أتقنت كل الوحدات</h2>
          <p className="text-white/90 text-sm mt-1 leading-7">لم يبقَ أي قفل — ثبّت معارفك بالبطاقات وتحدى نفسك في وضع BAC.</p>
          <button
            onClick={() => onNavigateToTab('training')}
            className="mt-4 w-full rounded-2xl bg-white text-[#006d37] font-black py-3 text-sm hover:brightness-105 transition-all cursor-pointer"
          >
            افتح «أتدرب»
          </button>
        </div>
      ) : (
        <section
          className="rounded-3xl p-5 md:p-6 bg-gradient-to-br from-[#006d37] to-[#003d1e] text-white shadow-md mb-5"
          data-testid="mypath-focus-card"
        >
          <div className="flex items-center gap-2 mb-3">
            <Compass className="w-5 h-5 text-[#fed65b]" />
            <span className="text-[11px] font-black tracking-wide text-[#fed65b]">هدفك الحالي — البوصلة</span>
          </div>
          <h2 className="text-xl md:text-2xl font-black leading-snug">{getMissionTitleAr(focusUnit)}</h2>
          {focusUnit && (
            <p className="mt-1 text-[11px] text-white/70">{focusUnit.domain} · {focusUnit.lessonsCount} دروس</p>
          )}

          <div className="mt-3 flex items-center gap-3">
            <div className="flex-1 h-2.5 rounded-full bg-white/15 overflow-hidden">
              <div className="h-full rounded-full bg-[#fed65b] transition-all" style={{ width: `${Math.min(100, focusUnit?.progress ?? 0)}%` }} />
            </div>
            <span className="text-sm font-black text-[#fed65b]">{focusUnit?.progress ?? 0}%</span>
          </div>

          <div className="mt-3 rounded-2xl bg-white/10 px-4 py-3">
            <p className="text-[11px] font-black text-white/70 mb-0.5">الخطوة التالية</p>
            <p className="text-sm font-black">{focus.labelAr}</p>
            <p className="text-[11px] text-white/75 leading-6 mt-0.5">{focus.detailAr}</p>
            {focus.weakTopicsAr && focus.weakTopicsAr.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {focus.weakTopicsAr.map((topic) => (
                  <span key={topic} className="rounded-full bg-[#ff9a4a]/25 text-[#ffd27a] px-2.5 py-0.5 text-[10px] font-black">
                    {topic}
                  </span>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => (onResumeMission ? onResumeMission(focus) : onLaunchQuiz(focus.unitId))}
            className="mt-4 w-full rounded-2xl bg-gradient-to-br from-[#ffb347] to-[#ff9a4a] text-white font-black py-4 text-base shadow-lg hover:brightness-105 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2"
            data-testid="mypath-resume-btn"
          >
            <PlayCircle className="w-5 h-5" />
            أكمل من حيث توقفت
          </button>

          {focus.kind === 'exam' && onLaunchExam && (
            <div className="mt-2 flex items-center justify-between gap-2">
              <button
                onClick={() => onLaunchExam(focus.unitId)}
                className="flex-1 rounded-2xl bg-[#fed65b] text-[#052e16] font-black py-3 text-sm hover:brightness-105 transition-all cursor-pointer flex items-center justify-center gap-2"
                data-testid="mypath-exam-btn"
              >
                <ShieldCheck className="w-4 h-4" />
                اجتاز امتحان الوحدة الآن
              </button>
              <button
                onClick={() => onLaunchQuiz(focus.unitId)}
                className="rounded-2xl border border-white/25 text-white/85 font-bold py-3 px-3 text-xs hover:bg-white/10 transition-colors cursor-pointer"
              >
                تدرب أولاً
              </button>
            </div>
          )}

          {focus.kind !== 'exam' && (
            <p className="mt-2.5 text-[10px] text-white/60 leading-5 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 shrink-0" />
              تفتح الوحدة الموالية بعد اجتياز امتحان هذه الوحدة بنسبة {EXAM_PASS_THRESHOLD}%.
            </p>
          )}
        </section>
      )}

      {/* Sélection moteur (SpecKit §6) : idle OU mission prioritaire. */}
      {selection.kind === 'idle' ? (
        <div className="rounded-3xl p-6 bg-white dark:bg-[#141916] border border-gray-200 dark:border-gray-800 text-center shadow-sm mb-5 whitespace-pre-line leading-relaxed">
          <div className="text-2xl mb-2">🌿</div>
          <p className="text-sm font-bold text-gray-900 dark:text-white">{selection.messageAr}</p>
          <button
            onClick={() => dailyTargetUnit && onLaunchQuiz(dailyTargetUnit.id)}
            className="mt-4 w-full rounded-2xl border border-dashed border-[#006d37]/40 text-[#006d37] dark:text-[#2ecc71] font-black py-3 text-sm hover:bg-[#fff9ed] dark:hover:bg-[#1a221d] transition-all cursor-pointer"
          >
            تحدٍ إضافي اختياري
          </button>
        </div>
      ) : (
        <div className="w-full text-right rounded-3xl p-5 bg-gradient-to-br from-[#ffb347] to-[#ff9a4a] text-white shadow-md mb-5">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
              <Target className="w-7 h-7" />
            </div>
            <div className="flex-1">
              <h2 className="font-black text-lg leading-tight">
                {selection.mission.titleAr}
              </h2>
              <p className="text-white/90 text-sm mt-0.5 truncate">
                {selection.mission.reasonAr} · {selection.mission.expectedMinutes} دقيقة · {selection.mission.steps.length} خطوات
              </p>
            </div>
            <button
              onClick={() => dailyTargetUnit && onLaunchQuiz(dailyTargetUnit.id)}
              className="bg-white text-[#b45309] font-black text-sm px-4 py-2 rounded-xl shrink-0 cursor-pointer hover:brightness-105 transition-all"
            >
              {selection.mission.primaryActionLabelAr}
            </button>
          </div>
        </div>
      )}

      {/* V3 : l'ancien hero « مهمة 3 دقائق » a été remplacé par la Boussole
          (objectif unique + « أكمل من حيث توقفت ») ci-dessus. */}

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
