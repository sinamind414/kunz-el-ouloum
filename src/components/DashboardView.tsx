import React, { useCallback, useEffect, useMemo, useState, lazy, Suspense } from 'react';
import {
  AlertTriangle,
  BookOpen,
  ChevronDown,
  Dices,
  Dumbbell,
  Flame,
  HelpCircle,
  Layers,
  Share2,
  Trophy,
  UserPlus,
} from 'lucide-react';
import DailyGoalWidget from './DailyGoalWidget';
import SmartReminderCard from './SmartReminderCard';
// 2026-10-14 (M7) — `TodayCard` et `NbaCard` ne sont plus importées
// statiquement : à elles deux, elles tiraient dans le bundle d'entrée tout le
// plan de révision et tout le chemin pédagogique (plan, cartes mentales, index
// des sessions BAC, banque de situations, contenus des leçons) — 536 Ko mesurés
// sur 938, soit 57 % de ce que l'élève téléchargeait AVANT de voir l'accueil
// (docs/AUDIT_EXTERNE_8_AXES_2026-10-14.md §10.3.1). Elles arrivent maintenant
// après le premier rendu, chacune avec son propre morceau.
const TodayCard = lazy(() => import('./TodayCard'));
const NbaCard = lazy(() => import('./NbaCard'));

/**
 * Placeholder de même hauteur que les cartes différées : sans lui, l'accueil
 * « sauterait » au moment où elles se posent (décalage de mise en page au
 * premier écran, le pire moment). Volontairement sans animation : il ne doit
 * attirer l'œil ni sur un réseau rapide (où il ne se voit pas), ni sur un
 * appareil lent (où l'animation coûterait plus que la carte à venir).
 */
function CarteDiffereeFallback({ hauteur = 'h-[104px]' }: { hauteur?: string }) {
  return (
    <div
      data-testid="carte-differee"
      aria-hidden="true"
      className={`w-full ${hauteur} rounded-3xl border border-[#e2dabf]/60 bg-[#fff9ed]/60 dark:border-gray-800 dark:bg-gray-900/40`}
    />
  );
}
import WeeklyReportShareModal from './WeeklyReportShareModal';
import StreakCelebrationModal from './StreakCelebrationModal';
import { Unit, UserProgress, DailyGoalConfig } from '../types';
import { LOGO_URL } from '../data/brandAssets';
import type { LessonKind } from '../lib/parcours/parcoursPath';
import { playStreakMilestoneSound } from '../utils/audio';
// H3 : la série affichée est celle qui est encore vivante (0 si un jour a été manqué).
import { cumulJoursDepuisDaily, serieAfficheeDepuisDaily } from '../utils/activiteQuotidienne';
// Correctif 14/10/2026 : le travail fait en invité n'est PLUS attribué d'office
// au compte qui se connecte sur le même appareil (téléphone partagé entre
// frères et sœurs, ou simple oubli de connexion). C'est l'élève qui tranche.
import {
  compterActivitesInvite,
  compterRefusSync,
  detaillerRefusSync,
  effacerActivitesInvite,
  effacerRefusSync,
  importerActivitesInvite,
} from '../utils/activityLog';

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
  onOpenLesson?: (lessonKey: string, kind: LessonKind, unitId: number) => void;
  onOpenQcm?: (unitId: number) => void;
  /** Ouvre la fenêtre de création de compte (sans e-mail). */
  onOpenAuth?: () => void;
  /** Vrai quand une session élève existe déjà : la carte disparaît. */
  connecte?: boolean;
}

export default function DashboardView({
  units,
  progress,
  onLaunchQuiz,
  onLaunchRevision,
  onNavigateToTab,
  onUpdateDailyGoals,
  isDarkMode = false,
  onOpenLesson,
  onOpenQcm,
  onOpenAuth,
  connecte = false,
}: DashboardViewProps) {
  const [showWeeklyShareModal, setShowWeeklyShareModal] = useState(false);
  // Activités de cet appareil produites AVANT toute connexion, à confirmer.
  const [activitesInvite, setActivitesInvite] = useState(0);
  // Refus de synchronisation (A2, 14/10/2026) : éléments que le serveur n'a pas
  // acceptés parce qu'ils sortaient du barème. Ce n'est PAS un cas normal — le
  // client calcule des notes entre 0 et 100 — donc le voir signalé ici a de la
  // valeur : cela indique un défaut ou une manipulation.
  const [refusSync, setRefusSync] = useState(0);
  const [raisonsRefus, setRaisonsRefus] = useState<Record<string, number>>({});
  const [importEnCours, setImportEnCours] = useState(false);
  const [showStreakModal, setShowStreakModal] = useState(false);
  const [showMoreTools, setShowMoreTools] = useState(false);

  // Le compteur n'est lu qu'une fois les données chargées et à chaque montage.
  // Pas d'intervalle : ce n'est pas un indicateur temps réel, et interroger
  // localStorage en boucle coûte plus qu'il n'apporte sur un téléphone lent.
  useEffect(() => {
    if (!connecte) {
      setActivitesInvite(0);
      return;
    }
    setActivitesInvite(compterActivitesInvite());
    // A2 : le serveur a refusé des éléments hors barème. L'élève l'apprend ICI
    // plutôt que de croire son travail arrivé chez le professeur.
    setRefusSync(compterRefusSync());
    setRaisonsRefus(detaillerRefusSync().raisons);
  }, [connecte]);

  const rattacherActivites = useCallback(async () => {
    setImportEnCours(true);
    try {
      await importerActivitesInvite();
      setActivitesInvite(compterActivitesInvite());
    } catch {
      /* réseau : la file reste, l'import repartira au prochain flush */
    } finally {
      setImportEnCours(false);
    }
  }, []);

  const refuserActivites = useCallback(() => {
    effacerActivitesInvite();
    setActivitesInvite(0);
  }, []);

  const missionUnit = useMemo(() => continueUnit(units, progress), [units, progress]);
  const gapUnit = useMemo(() => biggestGapUnit(units), [units]);
  const achievementUnit = useMemo(() => closestAchievementUnit(units), [units]);
  const bacDays = useMemo(() => bacDaysLeft(new Date()), []);

  /**
   * Ce que le compteur affiche : la SÉRIE tant qu'elle vit, le CUMUL sinon.
   * Jamais 0 quand du travail a été fait — c'est tout l'objet de la correction.
   */
  const serie = serieAfficheeDepuisDaily(progress.dailyGoals);
  const cumul = cumulJoursDepuisDaily(progress.dailyGoals);
  const cumulSerie = serie > 0 ? serie : cumul;

  const handleOpenStreakCelebration = () => {
    const serie = serieAfficheeDepuisDaily(progress.dailyGoals);
    if (serie > 0) playStreakMilestoneSound(serie);
    setShowStreakModal(true);
  };

  const openSurpriseQuiz = () => {
    const unitId = surpriseUnitId(units, progress);
    if (unitId !== null) onLaunchQuiz(unitId);
  };

  return (
    <div className="min-h-full space-y-5 bg-[#f8fbfa] px-4 pb-24 pt-5 dark:bg-gray-950" dir="rtl">
      <header className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[#006d37]/15 bg-white shadow-sm dark:bg-[#141916]">
            <img src={LOGO_URL} alt="كنز العلوم" className="h-11 w-11 object-contain" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-[#506072] dark:text-gray-400">لوحة البداية</p>
            <h1 className="truncate text-2xl font-black text-[#006d37] dark:text-emerald-400">ماذا أدرس الآن؟</h1>
          </div>
        </div>

        <button
          type="button"
          onClick={handleOpenStreakCelebration}
          className="flex shrink-0 items-center gap-2 rounded-2xl border border-[#e2dabf]/70 bg-[#fff9ed] px-3 py-2 text-xs font-black text-[#1f1c0b] shadow-sm transition hover:border-amber-400 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100"
          aria-label="عرض تقدمي اليوم"
        >
          <Flame className="h-4 w-4 text-[#ff9a4a]" fill="currentColor" />
          {/*
            LE COMPTEUR DIT LE TRAVAIL ACQUIS, PAS SEULEMENT LA SÉRIE DU MOMENT.
            Avant : `{serieAfficheeDepuisDaily(...)}` — après un jour manqué, un
            élève avec 42 jours derrière lui lisait « 0 ». Le compteur le plus
            visible de l'accueil lui annonçait donc que son travail n'existait
            plus, au moment précis où il risquait d'abandonner (« L'effet
            cumulé » : un jour manqué n'efface rien). Désormais la série reste
            affichée quand elle vit, et le CUMUL prend sa place quand elle est
            retombée.
          */}
          {cumulSerie > 0 ? (
            <span>{cumulSerie}</span>
          ) : (
            <span>{serieAfficheeDepuisDaily(progress.dailyGoals)}</span>
          )}
          <span className="text-[#e2dabf]">|</span>
          <span>{progress.xp} XP</span>
        </button>
      </header>


      {/*
        Invitation à créer un compte SANS adresse e-mail.
        Avant : le seul chemin vers l'inscription était l'avatar de l'en-tête,
        et le formulaire demandait une adresse « eleve@ecole.dz » que presque
        aucun élève n'a → les élèves ne s'inscrivaient pas (signalement du
        14/10/2026). La carte explique qu'il n'y a ni e-mail ni mot de passe à
        inventer, et rappelle que le mode invité reste possible.
      */}
      {!connecte && onOpenAuth && (
        <section
          data-testid="carte-compte-sans-email"
          aria-labelledby="sans-email-title"
          className="rounded-3xl border border-[#006d37]/20 bg-gradient-to-l from-[#eaf7ef] to-white p-4 shadow-sm dark:border-emerald-900/40 dark:from-emerald-950/30 dark:to-gray-900"
        >
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-[#006d37]/10 text-[#006d37] dark:text-emerald-400">
              <UserPlus className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 id="sans-email-title" className="text-sm font-black text-[#1f1c0b] dark:text-white">
                أنشئ حسابك بدون بريد إلكتروني
              </h2>
              <p className="mt-1 text-[11px] leading-relaxed text-[#506072] dark:text-gray-400">
                لا بريد ولا كلمة مرور تحفظها: تكتب اسمك، وتختار رمزًا سريًا من 6 أرقام،
                فيمنحك التطبيق رمز دخول قصيرًا. يحفظ أستاذك نتائجك ويتابع تقدمك.
              </p>
              <button
                type="button"
                onClick={onOpenAuth}
                className="mt-3 rounded-xl bg-[#006d37] px-4 py-2 text-xs font-black text-white shadow-sm transition hover:bg-[#00562b]"
              >
                إنشاء حساب في دقيقة
              </button>
              <span className="ms-2 align-middle text-[10px] font-bold text-[#506072] dark:text-gray-500">
                أو تابع كزائر — كل الدروس متاحة
              </span>
            </div>
          </div>
        </section>
      )}


      {connecte && refusSync > 0 && (
        <section
          data-testid="bandeau-refus-sync"
          aria-labelledby="refus-sync-title"
          className="rounded-3xl border border-red-300/70 bg-red-50 p-4 shadow-sm dark:border-red-900/50 dark:bg-red-950/30"
        >
          <h2 id="refus-sync-title" className="text-sm font-black text-[#8a1d1d] dark:text-red-200">
            لم تُسجَّل {refusSync} عناصر عند أستاذك
          </h2>
          <p className="mt-1 text-[11px] leading-relaxed text-[#8a1d1d]/90 dark:text-red-200/80">
            رفض الخادم هذه العناصر لأنها خارجة عن الشروط (علامة بين 0 و100، خطوة بين 1 و4، نص بطول معقول).
            عملُك محفوظ في هاتفك، لكنه لم يصل إلى متابعة أستاذك. إن تكرّر الأمر، أبلغنا.
          </p>
          <ul className="mt-2 list-inside list-disc text-[10px] text-[#8a1d1d]/80 dark:text-red-200/70">
            {Object.entries(raisonsRefus).map(([raison, n]) => (
              <li key={raison}>{raison} : {n}</li>
            ))}
          </ul>
          <div className="mt-3">
            <button
              type="button"
              onClick={() => {
                effacerRefusSync();
                setRefusSync(0);
                setRaisonsRefus({});
              }}
              className="rounded-xl border border-[#8a1d1d]/30 px-4 py-2 text-xs font-bold text-[#8a1d1d] dark:text-red-200"
            >
              حسناً، فهمت
            </button>
          </div>
        </section>
      )}

      {/*
        Travail fait sur cet appareil AVANT la connexion. Sur un téléphone
        partagé (le cas courant), ces activités ne sont pas forcément celles de
        l'élève connecté : il doit le dire. Avant le 14/10/2026 elles partaient
        silencieusement sous son nom dans le tableau de bord du professeur.
      */}
      {connecte && refusSync === 0 && activitesInvite > 0 && (
        <section
          data-testid="bandeau-activites-invite"
          aria-labelledby="activites-invite-title"
          className="rounded-3xl border border-amber-300/70 bg-amber-50 p-4 shadow-sm dark:border-amber-900/50 dark:bg-amber-950/30"
        >
          <h2 id="activites-invite-title" className="text-sm font-black text-[#7a4a00] dark:text-amber-200">
            نشاطات مسجَّلة في هذا الهاتف قبل إنشاء الحساب
          </h2>
          <p className="mt-1 text-[11px] leading-relaxed text-[#7a4a00]/90 dark:text-amber-200/80">
            وجدنا <b>{activitesInvite}</b> نشاطًا (اختبارات، تدريبات، إنتاجات) سُجّلت قبل الاتصال.
            إن كانت أنشطتك أنت، اربطها بحسابك ليظهر تقدّمك لأستاذك. وإن كان هذا الهاتف مشتركًا مع
            أخيك أو أختك، اختر «ليست لي».
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={rattacherActivites}
              disabled={importEnCours}
              className="rounded-xl bg-[#006d37] px-4 py-2 text-xs font-black text-white shadow-sm transition hover:bg-[#00562b] disabled:opacity-60"
            >
              {importEnCours ? 'جاري الربط...' : 'نعم، اربطها بحسابي'}
            </button>
            <button
              type="button"
              onClick={refuserActivites}
              className="rounded-xl border border-[#7a4a00]/30 px-4 py-2 text-xs font-bold text-[#7a4a00] dark:text-amber-200"
            >
              لا، ليست لي
            </button>
          </div>
        </section>
      )}

      <section aria-labelledby="daily-priority-title" className="space-y-2">
        <div className="flex items-end justify-between gap-3 px-1">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#944a00]">الأولوية</p>
            <h2 id="daily-priority-title" className="text-lg font-black text-[#1f1c0b] dark:text-white">خطوتك التالية</h2>
          </div>
          <span className="text-[11px] font-bold text-[#506072] dark:text-gray-400">مهمة واحدة، ثم اختر الباقي</span>
        </div>

        {onOpenLesson && onOpenQcm ? (
          <Suspense fallback={<CarteDiffereeFallback hauteur="h-[132px]" />}>
            <NbaCard onOpenLesson={onOpenLesson} onOpenQcm={onOpenQcm} testId="home-nba" />
          </Suspense>
        ) : (
          <button
            type="button"
            onClick={() => missionUnit && onLaunchQuiz(missionUnit.id)}
            disabled={!missionUnit}
            className="flex w-full items-center justify-between gap-4 rounded-3xl bg-gradient-to-l from-[#006d37] to-[#10b981] p-5 text-right text-white shadow-[0_10px_28px_rgba(0,109,55,0.2)] disabled:opacity-60"
          >
            <span>
              <span className="block text-xs font-bold text-white/75">مهمة قصيرة</span>
              <span className="mt-1 block text-lg font-black">{missionUnit?.title ?? 'لا توجد مهمة متاحة'}</span>
            </span>
            <span className="rounded-xl bg-white px-4 py-2 text-xs font-black text-[#006d37]">ابدأ</span>
          </button>
        )}
      </section>

      <section aria-labelledby="paths-title" className="space-y-3">
        <div className="px-1">
          <h2 id="paths-title" className="text-lg font-black text-[#1f1c0b] dark:text-white">ماذا تريد أن تفعل؟</h2>
          <p className="text-xs font-bold text-[#506072] dark:text-gray-400">ثلاثة اختيارات واضحة حسب هدفك الآن</p>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          <button
            type="button"
            onClick={() => onNavigateToTab?.('lesson')}
            className="group flex min-h-28 flex-col items-center justify-center gap-2 rounded-3xl border border-emerald-200 bg-white px-2 py-4 text-center shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-500 dark:border-emerald-900/50 dark:bg-gray-900"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-[#006d37] group-hover:bg-[#006d37] group-hover:text-white dark:bg-emerald-950/40 dark:text-emerald-300">
              <BookOpen className="h-5 w-5" />
            </span>
            <span className="text-sm font-black text-[#1f1c0b] dark:text-white">أتعلّم</span>
            <span className="text-[10px] font-bold text-[#506072] dark:text-gray-400">درس وشرح</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateToTab?.('training')}
            className="group flex min-h-28 flex-col items-center justify-center gap-2 rounded-3xl border border-amber-200 bg-white px-2 py-4 text-center shadow-sm transition hover:-translate-y-0.5 hover:border-amber-500 dark:border-amber-900/50 dark:bg-gray-900"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-[#944a00] group-hover:bg-[#944a00] group-hover:text-white dark:bg-amber-950/40 dark:text-amber-300">
              <Dumbbell className="h-5 w-5" />
            </span>
            <span className="text-sm font-black text-[#1f1c0b] dark:text-white">أتدرّب</span>
            <span className="text-[10px] font-bold text-[#506072] dark:text-gray-400">تمرين وBAC</span>
          </button>

          <button
            type="button"
            onClick={() => (gapUnit ?? missionUnit) && onLaunchRevision((gapUnit ?? missionUnit)!.id)}
            disabled={!gapUnit && !missionUnit}
            className="group flex min-h-28 flex-col items-center justify-center gap-2 rounded-3xl border border-sky-200 bg-white px-2 py-4 text-center shadow-sm transition hover:-translate-y-0.5 hover:border-sky-500 disabled:opacity-60 dark:border-sky-900/50 dark:bg-gray-900"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-700 group-hover:bg-sky-700 group-hover:text-white dark:bg-sky-950/40 dark:text-sky-300">
              <Layers className="h-5 w-5" />
            </span>
            <span className="text-sm font-black text-[#1f1c0b] dark:text-white">أراجع</span>
            <span className="text-[10px] font-bold text-[#506072] dark:text-gray-400">بطاقات وأخطاء</span>
          </button>
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-[#e2dabf]/70 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <button
          type="button"
          onClick={() => setShowMoreTools((value) => !value)}
          aria-expanded={showMoreTools}
          aria-controls="dashboard-more-tools"
          className="flex w-full items-center justify-between gap-4 px-5 py-4 text-right transition hover:bg-[#fff9ed]/70 dark:hover:bg-gray-800"
        >
          <span>
            <span className="block text-base font-black text-[#1f1c0b] dark:text-white">المزيد من الأدوات</span>
            <span className="block text-xs font-bold text-[#506072] dark:text-gray-400">الخطة، التذكير، المنهجية، الخرائط والتقدم</span>
          </span>
          <ChevronDown className={`h-5 w-5 shrink-0 text-[#006d37] transition-transform ${showMoreTools ? 'rotate-180' : ''}`} />
        </button>

        {showMoreTools && (
          <div id="dashboard-more-tools" className="space-y-4 border-t border-[#e2dabf]/50 p-4 dark:border-gray-800">
            <SmartReminderCard
              units={units}
              onContinueLesson={onLaunchQuiz}
              onLaunchRevision={onLaunchRevision}
              isDarkMode={isDarkMode}
            />

            {/* 2026-10-12 — la carte affiche le programme du jour sans ouvrir
                `plan` : cette page a désormais une porte principale unique
                (hub « المراجعة »). La carte reste informative.
                M7 — chargée après le premier rendu (elle tirait le plan de
                révision et ses données dans le bundle d'entrée). */}
            <Suspense fallback={<CarteDiffereeFallback />}>
              <TodayCard />
            </Suspense>

            <DailyGoalWidget
              dailyGoals={progress.dailyGoals}
              onOpenStreakModal={handleOpenStreakCelebration}
              onUpdateGoalConfig={(newConfig) => onUpdateDailyGoals?.(newConfig)}
              onQuickStartQuiz={() => onLaunchQuiz(1)}
              onQuickStartRevision={() => onLaunchRevision(1)}
              isDarkMode={isDarkMode}
            />

            <div>
              {/* 2026-10-12 — ce bloc ne contenait que des DOUBLONS : « مفتاح
                  المنهجية », « الأنميشن » et les examens ont tous un
                  emplacement principal unique (hub التمارين والتدريب). Un accès
                  en double fait croire à deux outils différents. Il ne reste que
                  ce qui n'a PAS d'autre porte : le المرشد, aidé à la demande. */}
              {/* 2026-10-14 — « تحتاج مساعدة؟ » était un tiroir d'assistance,
                  pas une rubrique : y ranger le capitaine revenait à dire
                  « appelle-le quand tu es perdu ». Or un guide se consulte même
                  quand tout va bien (pour choisir quoi travailler). L'entrée est
                  donc présentée pour ce qu'elle est : un accompagnement continu,
                  en tête du bloc, avec son nom. */}
              <h3 className="mb-2 px-1 text-sm font-black text-[#1f1c0b] dark:text-white">القبطان</h3>
              <div className="grid gap-2 sm:grid-cols-2">
                {/* Porte EXPLICITE vers le المرشد depuis l'accueil
                    (demande : « depuis l'accueil, question libre »). Le bouton
                    flottant existe déjà partout, mais il est petit : ici la
                    question libre a une entrée visible. */}
                <button type="button" onClick={() => onNavigateToTab?.('chat')} className="flex items-center gap-3 rounded-2xl border border-emerald-200 p-3 text-right dark:border-emerald-900/50">
                  <HelpCircle className="h-5 w-5 shrink-0 text-[#006d37]" />
                  <span><span className="block text-xs font-black dark:text-white">اسأل القبطان</span><span className="text-[10px] font-bold text-[#506072]">من أول سؤال إلى ليلة البكالوريا</span></span>
                </button>
                {/* Renvoi vers le hub, pas vers un outil : l'accueil ne remplace
                    pas la rubrique, il indique où aller. */}
                <button type="button" onClick={() => onNavigateToTab?.('training')} className="flex items-center gap-3 rounded-2xl border border-emerald-200 p-3 text-right dark:border-emerald-900/50">
                  <Dumbbell className="h-5 w-5 shrink-0 text-[#006d37]" />
                  <span><span className="block text-xs font-black dark:text-white">كل أدوات التدريب</span><span className="text-[10px] font-bold text-[#506072]">ثمانية فضاءات في مكان واحد</span></span>
                </button>
              </div>
            </div>

            <div>
              {/* 2026-10-12 — « تحدي 3 دقائق » (bootcamp) est parti : il a son
                  emplacement principal unique dans le hub « التمارين والتدريب ».
                  Deux portes pour le même outil font croire à deux outils. Il ne
                  reste que l'ACTION, qui n'existe nulle part ailleurs. */}
              <h3 className="mb-2 px-1 text-sm font-black text-[#1f1c0b] dark:text-white">اختبر نفسك الآن</h3>
              <div className="grid grid-cols-1 gap-2">
                <button type="button" onClick={openSurpriseQuiz} className="flex items-center gap-3 rounded-2xl border border-fuchsia-200 p-3 text-right dark:border-fuchsia-900/50">
                  <Dices className="h-5 w-5 shrink-0 text-fuchsia-600" />
                  <span><span className="block text-xs font-black dark:text-white">سؤال مفاجئ</span><span className="text-[10px] font-bold text-[#506072]">سؤال واحد، فوري، دون تحضير</span></span>
                </button>
              </div>
            </div>

            <div className="rounded-2xl bg-[#f8fbfa] p-3 dark:bg-gray-950">
              <div className="grid grid-cols-3 divide-x-reverse divide-x divide-[#e2dabf]/60 text-center dark:divide-gray-800">
                {/* 2026-10-12 — « تقدمي » (stats) et « الإنجازات » (badges) ont
                    quitté CE bloc pour « أنا » (leur porte principale, cf.
                    moiRaccourcis.ts). Les CHIFFRES restent — c'est une
                    information, pas une porte. Leur navigation en double
                    disparaît : plus de bouton qui ouvre la même page ailleurs.
                    D'où des <span> et non des <button> : rien d'inerte. */}
                <div className="px-2">
                  <span className="block text-base font-black text-sky-700">{bacDays ?? '—'}</span>
                  <span className="text-[10px] font-bold text-[#506072]">يوماً للـ BAC</span>
                </div>
                <div className="px-2">
                  <Trophy className="mx-auto mb-1 h-4 w-4 text-amber-500" />
                  <span className="block truncate text-[10px] font-bold text-[#506072]">{achievementUnit?.title ?? 'الإنجازات'}</span>
                </div>
                <button type="button" onClick={() => setShowWeeklyShareModal(true)} className="px-2 cursor-pointer">
                  <Share2 className="mx-auto mb-1 h-4 w-4 text-[#006d37]" />
                  <span className="text-[10px] font-bold text-[#506072]">تقرير الأسبوع</span>
                </button>
              </div>
            </div>

            {gapUnit && (
              <button type="button" onClick={() => onLaunchRevision(gapUnit.id)} className="flex w-full items-center gap-3 rounded-2xl border border-red-200 bg-red-50/50 p-3 text-right dark:border-red-900/50 dark:bg-red-950/20">
                <AlertTriangle className="h-5 w-5 shrink-0 text-red-600" />
                <span className="flex-1"><span className="block text-xs font-black text-red-800 dark:text-red-300">نقطة تحتاج مراجعة</span><span className="text-[10px] font-bold text-red-700/75 dark:text-red-300/75">{gapUnit.title}</span></span>
                <HelpCircle className="h-4 w-4 text-red-500" />
              </button>
            )}
          </div>
        )}
      </section>

      <WeeklyReportShareModal
        isOpen={showWeeklyShareModal}
        onClose={() => setShowWeeklyShareModal(false)}
        progress={progress}
        units={units}
      />

      <StreakCelebrationModal
        isOpen={showStreakModal}
        onClose={() => setShowStreakModal(false)}
        streakDays={serieAfficheeDepuisDaily(progress.dailyGoals)}
        onOpenShareModal={() => setShowWeeklyShareModal(true)}
      />
    </div>
  );
}
