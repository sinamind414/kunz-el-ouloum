import { useState, useMemo } from 'react';
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
import {
  selectMissionSelection,
  type MissionSelection,
} from '../services/missionEngine';
import type { MasteryState } from '../services/masteryEngine';
import { loadStore } from '../data/store';
import { getConceptRoute, routeErrorToTarget } from '../data/conceptRoutes';
import { getPublishableSurvivalCardById } from '../data/survivalCards';
import type { ConceptRoute } from '../data/store';
import type { CoreReflexId } from '../data/reflexes';

interface MyPathViewProps {
  units: Unit[];
  progress: UserProgress;
  mastery?: MasteryState;
  onLaunchQuiz: (unitId: number) => void;
  onLaunchRevision: (unitId: number) => void;
  onNavigateToTab: (tab: TabId) => void;
  onLaunchReflexMission?: (reflexId: CoreReflexId, meta: { missionId: string; conceptId: string; relatedErrorIds?: string[] }) => void;
  onLaunchSurvivalCard?: (cardId: string) => void;
  onOpenDocumentExercise?: (exerciseId: string) => void;
  onStartLesson?: (lessonId: string) => void;
  onResumeMission?: (mission: { kind: string; unitId: number }) => void;
  onLaunchExam?: (unitId: number) => void;
}

// Mappe une mission Manhadjiya (M0–M5) vers le réflexe méthodologique ciblé (P1.1-B).
const MISSION_REFLEX: Record<string, CoreReflexId | undefined> = {
  M2: 'analyse',
  M3: 'interpret',
  M4: 'hypothesize',
  M5: 'validate',
};

// #46 — M0 (التعرف على الوثيقة) et M1 (الوصف) relèvent des SUPPORTING_SKILLS
// `identify`/`describe`, absents des six réflexes canoniques du Trainer : un test
// délibéré (methodologyTrainerService.test.ts) fige cette liste à six entrées, et
// l'élargir pour deux missions aurait dénaturé le modèle méthodologique.
// Ces deux missions sont donc rattachées aux exercices documentaires RÉELS qui
// portent déjà ces verbes, validés par le moteur (ctx.actionVerb identify/describe) :
//   - translation_schema_q1 → حدد / identify  (unité 1, asset présent)
//   - ach_jnm_schema_q2     → صف  / describe  (unité 5, asset présent)
// Avant ce câblage, le clic sur M0/M1 ne montrait AUCUN écran : il marquait la
// mission « done » et créditait 20 XP, soit un tiers du parcours fondateur franchi
// à vide, sur le tout premier contact de l'élève avec l'application.
const MISSION_DOCUMENT_EXERCISE: Record<string, string | undefined> = {
  M0: 'translation_schema',
  M1: 'ach_jnm_schema',
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
  // Unité visée par l'icône. Rend la promesse vérifiable et garantit qu'aucune
  // cible n'est annoncée deux fois. `undefined` = icône sans cible d'unité
  // (compteur BAC), seule tolérée sans `unitId`.
  unitId?: number;
  onClick: () => void;
}

const BEGINNER_ASSIMILATION_STEPS = ['شاهد', 'افهم', 'أجب', 'صحّح', 'ثبّت'] as const;

/**
 * Rampe de lancement débutant « ابدأ من هنا ».
 * Rendue AUSSI pendant la formation Jour 0 : l'élève qui découvre l'application
 * est précisément celui qui a besoin de ce point d'entrée, or l'onboarding
 * s'affiche par défaut tant que la Manhadjiya n'est pas terminée.
 */
function BeginnerLaunchpad({ onNavigateToTab }: { onNavigateToTab: (tab: TabId) => void }) {
  return (
    <section
      className="mb-4 rounded-3xl border border-[#ffb347]/40 bg-gradient-to-br from-[#fff7e8] to-white dark:from-[#2a2118] dark:to-[#141916] p-4 md:p-5 shadow-sm"
      data-testid="mypath-beginner-launchpad"
    >
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
  );
}

export default function MyPathView(props: MyPathViewProps) {
  const { units, progress, onLaunchQuiz, onLaunchRevision, onNavigateToTab, onLaunchReflexMission, onLaunchSurvivalCard, onOpenDocumentExercise, onStartLesson } = props;

  // Formation Jour 0 (onboarding « 6 lois ») : accessible via un bouton dédié,
  // mais NE BLOQUE PLUS l'accès au tableau de bord (les 6 icônes s'affichent tout de suite).
  const [missions, setMissions] = useState<Mission[]>(() => loadMissions());
  const [showOnboarding, setShowOnboarding] = useState<boolean>(() => !isManhadjiyaDone());

  if (showOnboarding) {
    return (
      <div className="w-full max-w-2xl mx-auto p-4 md:p-6 pb-28" dir="rtl">
        <BeginnerLaunchpad onNavigateToTab={onNavigateToTab} />
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
          onOpenDocumentExercise={onOpenDocumentExercise}
        />
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-4 md:p-6 pb-28" dir="rtl">
      <BeginnerLaunchpad onNavigateToTab={onNavigateToTab} />

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
        memoizedMissions={missions}
        onLaunchSurvivalCard={onLaunchSurvivalCard}
        onOpenDocumentExercise={onOpenDocumentExercise}
        onStartLesson={onStartLesson}
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
  onOpenDocumentExercise,
}: {
  missions: Mission[];
  progress: UserProgress;
  onMissionsChange: (m: Mission[]) => void;
  onNavigateToTab: (tab: TabId) => void;
  onLaunchReflexMission?: (reflexId: CoreReflexId, meta: { missionId: string; conceptId: string; relatedErrorIds?: string[] }) => void;
  onLaunchSurvivalCard?: (cardId: string) => void;
  onOpenDocumentExercise?: (exerciseId: string) => void;
}) {
  const current = getCurrentMission(missions);
  const { done: doneCount, total } = getMissionsProgress(missions);
  const allDone = doneCount === total;
  const alreadyToday = !canDoMissionToday(missions) && !allDone;

  const isFirstSessions = progress && progress.xp <= 150;

  /**
   * #46 — Résout la cible de contenu d'une mission d'accueil, dans l'ordre de
   * priorité pédagogique : carte de survie publiable > réflexe méthodologique >
   * exercice documentaire portant le verbe de la mission.
   *
   * Renvoie `null` uniquement si AUCUN contenu n'est atteignable (cas d'un
   * appelant qui ne fournirait pas les callbacks). C'est la seule fonction
   * autorisée à décider ce qu'ouvre une mission : avant, `handleStart` et
   * `handleExtra` dupliquaient cette logique et retombaient tous deux sur un
   * `completeMission()` silencieux dès que la table ne connaissait pas la
   * mission — ce qui était le cas de M0 et M1.
   */
  const resolveMissionTarget = (missionId: string): (() => void) | null => {
    const cardId = MISSION_SURVIVAL_CARD[missionId];
    if (cardId && onLaunchSurvivalCard && getPublishableSurvivalCardById(cardId)) {
      return () => onLaunchSurvivalCard(cardId);
    }
    const reflex = MISSION_REFLEX[missionId];
    if (reflex && onLaunchReflexMission) {
      // P1.1-B : ouvre l'entraînement sur le bon réflexe, sans choix intermédiaire.
      return () => onLaunchReflexMission(reflex, { missionId, conceptId: missionId });
    }
    const exerciseId = MISSION_DOCUMENT_EXERCISE[missionId];
    if (exerciseId && onOpenDocumentExercise) {
      return () => onOpenDocumentExercise(exerciseId);
    }
    return null;
  };

  const runMission = (allowExtraToday: boolean) => {
    if (!current) return;
    const open = resolveMissionTarget(current.id);
    if (open) {
      open();
      return;
    }
    // Aucun contenu atteignable : on ne crédite RIEN. Valider une mission sans
    // rien avoir montré apprend à l'élève que la progression ne mesure rien.
    const updated = completeMission(current.id, allowExtraToday);
    if (updated) onMissionsChange(updated);
  };

  const handleStart = () => runMission(false);
  const handleExtra = () => runMission(true);

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
            <div
              key={m.id}
              className="flex flex-col items-center gap-1 flex-1"
              {...(resolveMissionTarget(m.id) ? { 'data-testid': `mission-target-${m.id}` } : {})}
            >
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
            data-testid="mission-start"
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

function MotivationView({ units, progress, onLaunchQuiz, onLaunchRevision, onNavigateToTab, memoizedMissions, onLaunchSurvivalCard, onOpenDocumentExercise, onStartLesson }: MotivationViewProps) {
  const { user } = useAuth();

  // Sélection moteur (SpecKit §2/§6) : mission prioritaire OU état idle explicite.
  const selection: MissionSelection = useMemo(() => {
    const store = loadStore();
    const errors = store.learningErrors;
    // #47/#50 — La route était fabriquée ici à la volée, avec deux défauts :
    // elle cherchait une carte de survie par CONCEPT (`getPublishableSurvivalCardById(cid)`)
    // alors que cette fonction attend un ID DE CARTE (`sc_*`) — donc toujours
    // `undefined` — et elle figeait `unitId: 0`, une unité qui n'existe pas,
    // perdant le routage vers la leçon, le document et le quiz de l'unité.
    // `CONCEPT_ROUTES` porte déjà ces liaisons, est testée (conceptRoutes.test.ts)
    // et sert déjà CoachView et MethodologyView : on l'utilise au lieu de la
    // réimplémenter.
    const routes: Record<string, ConceptRoute> = {};
    for (const e of errors) {
      const cid = e.conceptId ?? e.id;
      if (!routes[cid]) {
        const known = getConceptRoute(cid);
        if (known) routes[cid] = known;
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

  // #49 — Lacune dangereuse : unité débloquée la plus basse, DISTINCTE de la cible
  // du jour. Sans cette exclusion, les deux tris (quasi identiques : seul le filtre
  // `< 100` diffère) désignaient la même unité, présentée à la fois comme « défi du
  // jour » et comme « lacune dangereuse ». On exige en outre une marge de progression
  // réelle : qualifier de « ثغرة خطيرة » une unité à 100 % est un contresens.
  const criticalWeakUnit = useMemo(() => {
    const unlocked = units
      .filter((u) => !u.isLocked && u.progress < 100 && u.id !== dailyTargetUnit?.id)
      .sort((a, b) => a.progress - b.progress);
    return unlocked[0];
  }, [units, dailyTargetUnit]);

  // #49 — Presque terminée : la plus avancée encore < 100. Le filtre `isLocked`
  // manquait, si bien qu'un élève pouvait se voir promettre « إنجاز قريب » sur une
  // unité verrouillée, donc inaccessible. Exclut aussi les deux cibles précédentes.
  const nearCompletionUnit = useMemo(() => {
    const exclus = new Set([dailyTargetUnit?.id, criticalWeakUnit?.id].filter((v) => v != null));
    const almost = units
      .filter((u) => !u.isLocked && u.progress < 100 && !exclus.has(u.id))
      .sort((a, b) => b.progress - a.progress);
    return almost[0];
  }, [units, dailyTargetUnit, criticalWeakUnit]);

  // #50 — Question surprise : `Math.random()` était appelé DANS un `useMemo([units])`,
  // donc la cible changeait à chaque recalcul du memo — ni reproductible, ni testable.
  // Le tirage est désormais dérivé du jour civil : stable sur une même journée
  // (l'élève retrouve la même surprise s'il revient), renouvelé le lendemain.
  const randomUnit = useMemo(() => {
    const exclus = new Set(
      [dailyTargetUnit?.id, criticalWeakUnit?.id, nearCompletionUnit?.id].filter((v) => v != null)
    );
    // Pas de repli sur les unités déjà ciblées : au premier lancement une seule
    // unité est déverrouillée, et un repli ferait doublon avec la cible du jour —
    // deux icônes, une seule unité, deux promesses. Sans unité distincte à
    // proposer, l'icône n'est simplement pas rendue.
    const pool = units.filter((u) => !u.isLocked && !exclus.has(u.id));
    if (!pool.length) return undefined;
    const daySeed = Math.floor(Date.now() / 86_400_000);
    return pool[daySeed % pool.length];
  }, [units, dailyTargetUnit, criticalWeakUnit, nearCompletionUnit]);

  /**
   * #47 — Exécute RÉELLEMENT la mission calculée par le moteur.
   *
   * Le bouton de la carte de mission appelait `onLaunchQuiz(dailyTargetUnit.id)` :
   * il annonçait une mission née d'une erreur précise et lançait un QCM sur une
   * unité sans rapport. `selection.mission.steps` n'était utilisé que pour en
   * afficher la longueur. On route désormais vers la cible du concept en cause,
   * via `routeErrorToTarget` — la même fonction que CoachView et MethodologyView,
   * déjà testée — en respectant sa priorité : carte publiable > leçon > document >
   * quiz de l'unité.
   */
  const runMissionAction = () => {
    if (selection.kind !== 'mission') return;
    const conceptId = selection.mission.steps.find((s) => s.conceptId)?.conceptId;
    if (conceptId) {
      const target = routeErrorToTarget(conceptId, { quizUnitId: dailyTargetUnit?.id });
      if (target.kind === 'survival_card' && onLaunchSurvivalCard) return onLaunchSurvivalCard(target.cardId);
      if (target.kind === 'lesson' && onStartLesson) return onStartLesson(target.lessonId);
      if (target.kind === 'document' && onOpenDocumentExercise) return onOpenDocumentExercise(target.exerciseId);
      if (target.kind === 'quiz') return onLaunchQuiz(target.unitId);
    }
    // Mission d'onboarding (aucun concept) : la cible du jour est la bonne porte.
    if (dailyTargetUnit) onLaunchQuiz(dailyTargetUnit.id);
  };

  const bacDays = useMemo(() => calculateCountdown().timeLeft.days, []);
  const firstName = (user?.name || 'Élève Kunz').split(' ')[0];

  // #49/#50 — Chaque icône déclare l'unité qu'elle vise (`unitId`), ce qui rend la
  // promesse vérifiable et empêche deux icônes de désigner la même cible. Une icône
  // dont la cible est absente n'est pas rendue : mieux vaut cinq repères exacts que
  // six dont un ment.
  const icons: MotivationIcon[] = [
    {
      key: 'streak',
      Icon: Flame,
      title: 'سلسلة الأيام',
      line: progress.streak > 0 ? `${progress.streak} يوم مواظبة — لا تكسرها!` : 'ابدأ سلسلتك اليوم!',
      ring: Math.min(100, (progress.streak % 30) * (100 / 30)),
      from: '#059669',
      to: '#10b981',
      // La série se cultive en révisant : on renvoie sur la cible du jour, qui est
      // aussi celle du héros — c'est la même intention, pas une promesse distincte.
      unitId: dailyTargetUnit?.id,
      onClick: () => dailyTargetUnit && onLaunchRevision(dailyTargetUnit.id),
    },
    {
      key: 'gap',
      Icon: AlertTriangle,
      title: 'ثغرة خطيرة',
      line: criticalWeakUnit ? `« ${criticalWeakUnit.title} » تحتاج مراجعة!` : '',
      ring: criticalWeakUnit?.progress ?? 0,
      from: '#f59e0b',
      to: '#ef4444',
      unitId: criticalWeakUnit?.id,
      onClick: () => criticalWeakUnit && onLaunchRevision(criticalWeakUnit.id),
    },
    {
      key: 'bac',
      Icon: Hourglass,
      title: 'عدّاد BAC',
      line: `${bacDays} يوم الباقي — الوقت يمر`,
      // Cet anneau représente le TEMPS écoulé, pas une maîtrise : c'est assumé et
      // signalé à l'élève par le libellé (« يوم الباقي »).
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
      line: randomUnit ? `« ${randomUnit.title} » — سؤال عشوائي` : '',
      // #49 — `ring: 60` était codé en dur : l'anneau affichait une progression que
      // l'élève n'avait jamais réalisée. Il reflète désormais l'unité tirée.
      ring: randomUnit?.progress ?? 0,
      from: '#a855f7',
      to: '#ec4899',
      unitId: randomUnit?.id,
      onClick: () => randomUnit && onLaunchQuiz(randomUnit.id),
    },
    {
      key: 'almost',
      Icon: Trophy,
      title: 'إنجاز قريب',
      line: nearCompletionUnit
        ? `« ${nearCompletionUnit.title} » ${nearCompletionUnit.progress}% — أكمل الوحدة!`
        : '',
      ring: nearCompletionUnit?.progress ?? 0,
      from: '#eab308',
      to: '#f59e0b',
      unitId: nearCompletionUnit?.id,
      // #50 — `onNavigateToTab('lessons')` perdait l'unité annoncée : l'élève
      // atterrissait sur la liste complète des leçons. On ouvre sa révision.
      onClick: () => nearCompletionUnit && onLaunchRevision(nearCompletionUnit.id),
    },
  ].filter((icon) => icon.key === 'bac' || icon.unitId != null);

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

      {/* Sélection moteur (SpecKit §6) : idle OU mission prioritaire. */}
      {selection.kind === 'idle' ? (
        <div className="rounded-3xl p-6 bg-white dark:bg-[#141916] border border-gray-200 dark:border-gray-800 text-center shadow-sm mb-5 whitespace-pre-line leading-relaxed">
          <div className="text-2xl mb-2">🌿</div>
          <p className="text-sm font-bold text-gray-900 dark:text-white">{selection.messageAr}</p>
          <button
            onClick={() => dailyTargetUnit && onLaunchQuiz(dailyTargetUnit.id)}
            data-testid="primary-action"
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
              onClick={runMissionAction}
              data-testid="primary-action"
              className="bg-white text-[#b45309] font-black text-sm px-4 py-2 rounded-xl shrink-0 cursor-pointer hover:brightness-105 transition-all"
            >
              {selection.mission.primaryActionLabelAr}
            </button>
          </div>
        </div>
      )}

      {/* Grille 2x3 = 6 icônes rondes motivantes (aucune duplication bottom nav) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {icons.map(({ key, Icon, badge, title, line, ring, from, to, unitId, onClick }) => (
          <button
            key={key}
            onClick={onClick}
            data-testid={`compass-icon-${key}`}
            data-unit-id={unitId ?? ''}
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
