import React, { useState, useEffect, useMemo, useRef, lazy, Suspense } from 'react';
import { BookOpen, Layers, Compass, Sun, Moon, User, Flame, Trophy, MessageCircle } from 'lucide-react';

import { Unit, UserProgress, Flashcard, QuizQuestion, TabId } from './types';
import { INITIAL_UNITS } from './unitCatalog';

// V3 — Architecture « La Boussole » : Focus Engine / Mastery Engine / Gating Engine.
import {
  loadMasteryState,
  saveMasteryState,
  recordExamAttempt,
  hasPassedExam,
  examPercent,
  pickExamQuestions,
  pickDrillQuestions,
  diagnoseWeakTopics,
  EXAM_QUESTION_COUNT,
  type MasteryState,
  type ExamMode,
} from './services/masteryEngine';
import { getNextAction, getActiveUnit, getMissionTitleAr, type FocusAction } from './services/focusEngine';
import {
  isTeacherOverrideEnabled,
  setTeacherOverrideEnabled,
  isUnitAccessible,
  getLockedUnitMessageAr,
  unlockNextUnit,
  unlockUnit,
} from './services/gatingEngine';
import { COACH_ACTION, type CoachEventData } from './services/coachEvents';
import { getFirstLessonId } from './data/unitLessonSequences';
import CoachEventModal from './components/CoachEventModal';

import SplashView from './components/SplashView';
import { stopPirateMusic } from './utils/audio';
import { AuthProvider, useAuth } from './context/AuthContext';
import { logEvent } from './utils/telemetryService';
import { ErrorBoundary } from "./components/ErrorBoundary";
import LoginScreen from './components/LoginScreen';
import { getPublishableSurvivalCardById } from './data/survivalCards';
import { DATA_VERSION } from './config/appConfig';
import { applyServiceWorkerUpdate, subscribeToServiceWorkerUpdates } from './registerServiceWorker';

// Lazy load heavy views (Fable 5 - reduce main bundle)
const QuizView = lazy(() => import('./components/QuizView'));
const StudyReminderModal = lazy(() => import('./components/StudyReminderModal'));
const LessonsView = lazy(() => import('./components/LessonsView'));
const CoachView = lazy(() => import('./components/CoachView'));
const InteractiveLessonView = lazy(() => import('./components/InteractiveLessonView'));
const MyPathView = lazy(() => import('./components/MyPathView'));
const MethodologyView = lazy(() => import('./components/MethodologyView'));
const SurvivalCardView = lazy(() => import('./components/SurvivalCardView'));
const TrainingView = lazy(() => import('./components/TrainingView'));
const ProgressView = lazy(() => import('./components/ProgressView'));

let quizCorpusPromise: Promise<typeof import('./quizCorpus')> | null = null;
const loadQuizCorpus = () => {
  if (!quizCorpusPromise) quizCorpusPromise = import('./quizCorpus');
  return quizCorpusPromise;
};

const DEFAULT_PROGRESS: UserProgress = {
  xp: 0,
  streak: 0,
  completedUnits: [],
  completedQuestionsCount: 0,
  studyMinutes: 0,
  flashcardStats: { again: 0, hard: 0, good: 0, easy: 0 },
  quizScoreHistory: []
};

const createDefaultProgress = (): UserProgress => ({
  ...DEFAULT_PROGRESS,
  completedUnits: [...DEFAULT_PROGRESS.completedUnits],
  flashcardStats: { ...DEFAULT_PROGRESS.flashcardStats },
  quizScoreHistory: [...DEFAULT_PROGRESS.quizScoreHistory]
});

function LoadingFallback() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3" dir="rtl">
      <div className="w-10 h-10 border-4 border-[#2ecc71]/30 border-t-[#006d37] rounded-full animate-spin" />
      <p className="text-sm font-bold text-[#506072]">تحميل الوحدة...</p>
    </div>
  );
}

// Organisation progressive (Phase 3) : 4 onglets + FAB Coach flottant.
const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'path', label: 'مساري', icon: Compass },
  { id: 'lessons', label: 'الدروس', icon: BookOpen },
  { id: 'training', label: 'أتدرب', icon: Layers },
  { id: 'progress', label: 'تقدمي', icon: Trophy },
];

function AppShell() {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('theme');
      return saved === 'dark';
    } catch {
      return false;
    }
  });

  const [currentTab, setCurrentTab] = useState<TabId | 'splash'>('splash');
  const [activeQuizUnitId, setActiveQuizUnitId] = useState<number | null>(null);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [isCoachOpen, setIsCoachOpen] = useState(false);

  // ─── V3 « La Boussole » : état du Mastery Engine + examens + Coach proactif ───
  const [mastery, setMastery] = useState<MasteryState>(() => loadMasteryState());
  const [examRequest, setExamRequest] = useState<{ unitId: number; mode: ExamMode; questions: QuizQuestion[] } | null>(null);
  const [coachEvent, setCoachEvent] = useState<CoachEventData | null>(null);
  const [teacherOverride, setTeacherOverride] = useState<boolean>(() => isTeacherOverrideEnabled());
  const absenceCheckedRef = useRef(false);

  const setMasteryAndSave = (next: MasteryState) => {
    setMastery(next);
    saveMasteryState(next);
  };

  const handleTeacherOverrideChange = (enabled: boolean) => {
    setTeacherOverrideEnabled(enabled);
    setTeacherOverride(enabled);
  };

  // P1.1-B — une mission de réflexe ouvre l'entraînement méthodologique sur le
  // bon réflexe (sans choix intermédiaire), puis revient au parcours.
  const [activeMissionReflex, setActiveMissionReflex] = useState<{
    reflexId: import('./data/reflexes').CoreReflexId;
    missionId: string;
    conceptId: string;
    relatedErrorIds?: string[];
  } | null>(null);

  const handleLaunchReflexMission = (
    reflexId: import('./data/reflexes').CoreReflexId,
    meta: { missionId: string; conceptId: string; relatedErrorIds?: string[] }
  ) => setActiveMissionReflex({ reflexId, ...meta });

  // P1.2-B — une carte de survie validée ouvre le rappel actif avant quiz/document.
  const [activeSurvivalCardId, setActiveSurvivalCardId] = useState<string | null>(null);
  const handleLaunchSurvivalCard = (cardId: string) => setActiveSurvivalCardId(cardId);
  const activeSurvivalCard = useMemo(
    () => (activeSurvivalCardId ? getPublishableSurvivalCardById(activeSurvivalCardId) : null),
    [activeSurvivalCardId]
  );

  useEffect(() => {
    if (currentTab !== 'splash') stopPirateMusic();
  }, [currentTab]);

  useEffect(() => { setIsFocusMode(false); }, [currentTab]);

  // Reminder logic
  useEffect(() => {
    if (currentTab === 'splash') return;
    const last = localStorage.getItem('lastStudyTime');
    const sched = localStorage.getItem('scheduledReminderTime');
    const now = Date.now();
    if (sched && now >= Number(sched)) {
      setIsReminderModalOpen(true);
      localStorage.removeItem('scheduledReminderTime');
      return;
    }
    if (last && !sched) {
      if (now - Number(last) > 24 * 60 * 60 * 1000) setIsReminderModalOpen(true);
    } else if (!last) {
      localStorage.setItem('lastStudyTime', now.toString());
    }
  }, [currentTab]);

  const handleScheduleReminder = (hours: number) => {
    localStorage.setItem('scheduledReminderTime', (Date.now() + hours * 3600 * 1000).toString());
    if ('Notification' in window) Notification.requestPermission();
    setIsReminderModalOpen(false);
  };
  const updateLastStudyTime = () => localStorage.setItem('lastStudyTime', Date.now().toString());

  // V3 — Coach proactif : retour après ≥ 3 jours d'absence → message
  // bienveillant + reprise guidée (une seule fois par session).
  // On lit les données PERSISTÉES (pas l'état React pré-hydratation) après un
  // court délai, pour que l'accueil soit prêt quand l'événement surgit.
  useEffect(() => {
    if (absenceCheckedRef.current) return;
    if (currentTab === 'splash') return;
    absenceCheckedRef.current = true;
    const timer = window.setTimeout(() => {
      try {
        if (isReminderModalOpen) return; // le rappel planifié prime, pas de double modal
        const last = localStorage.getItem('lastStudyTime');
        if (!last) return;
        const daysAway = Math.floor((Date.now() - Number(last)) / (24 * 3600 * 1000));
        if (daysAway < 3) return;
        const savedUnits = JSON.parse(localStorage.getItem('svt_units') || 'null') as Unit[] | null;
        const savedProgress = JSON.parse(localStorage.getItem('svt_progress') || 'null') as UserProgress | null;
        const unitsForCheck = Array.isArray(savedUnits) && savedUnits.length > 0 ? savedUnits : units;
        const hasStarted =
          unitsForCheck.some((u) => u.progress > 0) || (savedProgress?.completedQuestionsCount ?? progress.completedQuestionsCount) > 0;
        if (!hasStarted) return;
        const activeUnit = getActiveUnit(unitsForCheck, loadMasteryState());
        setCoachEvent({
          kind: 'return_after_absence',
          tone: 'info',
          unitId: activeUnit?.id ?? 1,
          titleAr: `مرحباً بعودتك بعد ${daysAway} أيام!`,
          messageAr: `غبت ${daysAway} يوماً — لا مشكلة، فالمواظبة أهم من الكمية. بوصلة اليوم جاهزة: ${getMissionTitleAr(activeUnit)}.`,
          actions: [
            { id: COACH_ACTION.RESUME, labelAr: 'أكمل من حيث توقفت' },
            { id: COACH_ACTION.CLOSE, labelAr: 'لاحقاً', variant: 'ghost' },
          ],
        });
      } catch {
        /* offline-first : silencieux */
      }
    }, 600);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTab]);

  const [units, setUnits] = useState<Unit[]>(INITIAL_UNITS);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[] | null>(null);
  const [isUpdateReady, setIsUpdateReady] = useState(false);
  const [progress, setProgress] = useState<UserProgress>(() => createDefaultProgress());

  // Module 1 — Auth Offline-First : lit le profil caché (localStorage) pour ne jamais bloquer l'offline.
  const { user, signOut } = useAuth();

  // Module 2 — Télémétrie : trace l'ouverture de l'app (online/offline) une fois l'utilisateur connu.
  useEffect(() => {
    if (user) logEvent('APP_OPENED', { online: navigator.onLine });
  }, [user]);

  useEffect(() => subscribeToServiceWorkerUpdates(() => setIsUpdateReady(true)), []);

  useEffect(() => {
    if (!user) return;
    if (currentTab !== 'training' && activeQuizUnitId === null) return;

    let cancelled = false;
    void loadQuizCorpus().then(({ SVT_FLASHCARDS, SVT_QUIZ_QUESTIONS }) => {
      if (cancelled) return;
      setQuizQuestions(SVT_QUIZ_QUESTIONS);
      try {
        const savedVersion = localStorage.getItem('svt_data_version');
        const savedFlashcards = localStorage.getItem('svt_flashcards');
        if (savedVersion === DATA_VERSION && savedFlashcards) {
          const parsedCards = JSON.parse(savedFlashcards);
          setFlashcards(parsedCards.length && parsedCards[0].options ? parsedCards : SVT_FLASHCARDS);
          return;
        }
      } catch {
        // fallback below
      }
      setFlashcards(SVT_FLASHCARDS);
    });

    return () => {
      cancelled = true;
    };
  }, [user, currentTab, activeQuizUnitId]);

  useEffect(() => {
    if (activeSurvivalCardId && !activeSurvivalCard) {
      setActiveSurvivalCardId(null);
    }
  }, [activeSurvivalCardId, activeSurvivalCard]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    try {
      const savedVersion = localStorage.getItem('svt_data_version');
      if (savedVersion !== DATA_VERSION) {
        saveToLocalStorage(INITIAL_UNITS, null, createDefaultProgress());
        return;
      }
      const savedUnits = localStorage.getItem('svt_units');
      const savedProgress = localStorage.getItem('svt_progress');
      if (savedUnits) {
        const parsedUnits = JSON.parse(savedUnits);
        if (Array.isArray(parsedUnits)) setUnits(parsedUnits);
      }
      if (savedProgress) {
        const parsedProgress = JSON.parse(savedProgress);
        if (parsedProgress && typeof parsedProgress === 'object') {
          setProgress({ ...createDefaultProgress(), ...parsedProgress });
        }
      }
    } catch {
      saveToLocalStorage(INITIAL_UNITS, null, createDefaultProgress());
      setUnits(INITIAL_UNITS);
      setFlashcards([]);
      setQuizQuestions(null);
      setProgress(createDefaultProgress());
    }
  }, []);

  const saveToLocalStorage = (newUnits: Unit[], newCards: Flashcard[] | null, newProgress: UserProgress) => {
    try {
      localStorage.setItem('svt_data_version', DATA_VERSION);
      localStorage.setItem('svt_units', JSON.stringify(newUnits));
      if (newCards) {
        localStorage.setItem('svt_flashcards', JSON.stringify(newCards));
      } else {
        localStorage.removeItem('svt_flashcards');
      }
      localStorage.setItem('svt_progress', JSON.stringify(newProgress));
    } catch {}
  };

  const handleRateCard = (_cardId: string, rating: 'again' | 'hard' | 'good' | 'easy') => {
    const points = rating === 'easy' ? 15 : rating === 'good' ? 10 : rating === 'hard' ? 5 : 2;
    const updatedStats = { ...progress.flashcardStats };
    updatedStats[rating] += 1;
    const addedMinutes = Math.floor(Math.random() * 3) + 2;
    const updated: UserProgress = { ...progress, xp: progress.xp + points, studyMinutes: progress.studyMinutes + addedMinutes, flashcardStats: updatedStats };
    setProgress(updated);
    saveToLocalStorage(units, flashcards, updated);
    updateLastStudyTime();
  };

  const navigateToTab = (tab: TabId) => setCurrentTab(tab);

  const handleLaunchQuiz = (unitId: number) => setActiveQuizUnitId(unitId);
  const handleLaunchRevision = (_unitId: number) => {
    setCurrentTab('training');
  };
  const handleStartLesson = (lessonId: string) => {
    setActiveLessonId(lessonId);
    setCurrentTab('lessons');
  };

  // ─── V3 : lancement des examens (validation / diagnostic / drill) ───
  const launchExam = (unitId: number, mode: ExamMode) => {
    setCoachEvent(null);
    void loadQuizCorpus().then(({ SVT_QUIZ_QUESTIONS }) => {
      const pool = SVT_QUIZ_QUESTIONS.filter((q) => q.unitId === unitId);
      if (pool.length === 0) return;
      let questions: QuizQuestion[];
      if (mode === 'drill') {
        const wrongIds = mastery.lastFailure?.unitId === unitId ? mastery.lastFailure.wrongQuestionIds : [];
        questions = pickDrillQuestions(pool, wrongIds);
      } else {
        const lastAttempt = [...mastery.attempts].reverse().find((a) => a.unitId === unitId && a.mode === mode);
        questions = pickExamQuestions(pool, lastAttempt?.questionIds ?? [], EXAM_QUESTION_COUNT);
      }
      setExamRequest({ unitId, mode, questions });
      setActiveQuizUnitId(unitId);
    });
  };

  const handleLaunchExam = (unitId: number) => launchExam(unitId, 'validation');

  // V3 : clic sur une unité verrouillée → le Coach surgit (jamais de mur silencieux).
  const handleLockedUnitClick = (unit: Unit) => {
    if (isUnitAccessible(unit, teacherOverride)) return;
    setCoachEvent({
      kind: 'locked_unit',
      tone: 'warn',
      unitId: unit.id,
      titleAr: `الوحدة ${unit.id} ما زالت مقفلة`,
      messageAr: getLockedUnitMessageAr(units, unit),
      actions: [
        { id: COACH_ACTION.RESUME, labelAr: 'العودة إلى وحدتك الحالية' },
        { id: COACH_ACTION.DIAGNOSTIC, labelAr: 'اجتز اختباراً تشخيصياً لفتحها الآن', variant: 'ghost' },
        { id: COACH_ACTION.CLOSE, labelAr: 'حسناً', variant: 'ghost' },
      ],
    });
  };

  // V3 : téléportation vers la prochaine action du Focus Engine (« أكمل من حيث توقفت »).
  const handleResumeMission = (action: FocusAction) => {
    switch (action.kind) {
      case 'lesson':
        if (action.lessonId) handleStartLesson(action.lessonId);
        break;
      case 'quiz':
        handleLaunchQuiz(action.unitId);
        break;
      case 'exam':
        launchExam(action.unitId, 'validation');
        break;
      case 'remediation':
        launchExam(action.unitId, 'drill');
        break;
      case 'all_done':
        navigateToTab('training');
        break;
    }
  };

  // V3 : traitement du résultat d'un examen (Le Gardien / diagnostique / drill).
  const handleExamComplete = (request: { unitId: number; mode: ExamMode; questions: QuizQuestion[] }, score: number, total: number, wrongIds: number[]) => {
    setExamRequest(null);
    setActiveQuizUnitId(null);
    const { unitId, mode, questions } = request;
    const activeUnit = units.find((u) => u.id === unitId);
    const unitTitle = activeUnit?.title ?? '';
    const percent = examPercent(score, total);
    const passed = hasPassedExam(score, total);

    let nextMastery = recordExamAttempt(mastery, {
      unitId,
      mode,
      score,
      total,
      questionIds: questions.map((q) => q.id),
      wrongQuestionIds: wrongIds,
    });

    // Drill : boucle corrective douce — jamais de lastFailure ni de blocage.
    if (mode === 'drill') {
      setMasteryAndSave(nextMastery);
      updateLastStudyTime();
      setCoachEvent({
        kind: 'drill_done',
        tone: passed ? 'success' : 'info',
        unitId,
        examMode: 'validation',
        titleAr: passed ? 'أحسنت! أنهيت التدريب التصحيحي' : 'خطوة في الطريق الصحيح',
        messageAr: passed
          ? `حصلت على ${percent}%. أصبحت جاهزاً لمحاولة جديدة في امتحان الوحدة (عتبة 80%).`
          : `حصلت على ${percent}%. راجع شرح كل سؤال أخطأت فيه ثم أعد التدريب أو الامتحان.`,
        actions: [
          { id: COACH_ACTION.RETRY_EXAM, labelAr: 'اجتاز امتحان الوحدة الآن' },
          { id: COACH_ACTION.REVIEW_LESSON, labelAr: 'راجع درس الوحدة', variant: 'ghost' },
          { id: COACH_ACTION.CLOSE, labelAr: 'لاحقاً', variant: 'ghost' },
        ],
      });
      return;
    }

    if (!passed) {
      // Échec → diagnostic des lacunes + boucle de remédiation ciblée.
      const wrongQuestions = questions.filter((q) => wrongIds.includes(q.id));
      const weakTopics = diagnoseWeakTopics(unitId, wrongQuestions);
      if (nextMastery.lastFailure && nextMastery.lastFailure.unitId === unitId) {
        nextMastery = { ...nextMastery, lastFailure: { ...nextMastery.lastFailure, weakTopicsAr: weakTopics } };
      }
      setMasteryAndSave(nextMastery);
      updateLastStudyTime();
      setCoachEvent({
        kind: 'exam_failed',
        tone: 'warn',
        unitId,
        examMode: mode,
        percent,
        weakTopicsAr: weakTopics,
        titleAr: `لم تنجح بعد — ${unitTitle}`,
        messageAr:
          mode === 'validation'
            ? `العتبة المطلوبة هي 80% وحصلت على ${percent}%. لا تقلق: هذه خطة دقيقة لسد الثغرات، ثم محاولة جديدة بأسئلة مختلفة.`
            : `حصلت على ${percent}%. كشف الاختبار التشخيصي نقاط ضعفك — ابدأ بالمراجعة المستهدفة قبل الإعادة.`,
        actions: [
          { id: COACH_ACTION.REVIEW_LESSON, labelAr: '1. راجع درس الوحدة أولاً' },
          { id: COACH_ACTION.DRILL, labelAr: '2. تدريب تصحيحي على أسئلة أخطائك', variant: 'ghost' },
          { id: COACH_ACTION.RETRY_EXAM, labelAr: '3. أعد الامتحان بأسئلة جديدة', variant: 'ghost' },
          { id: COACH_ACTION.CLOSE, labelAr: 'لاحقاً', variant: 'ghost' },
        ],
      });
      return;
    }

    // Réussite → validation, déverrouillage, célébration.
    const updatedUnits = mode === 'validation' ? unlockNextUnit(units, unitId) : unlockUnit(units, unitId);
    const nextUnit = units.find((u) => u.id === unitId + 1);
    const updated: UserProgress = {
      ...progress,
      xp: progress.xp + 100 + score * 10,
      completedQuestionsCount: progress.completedQuestionsCount + total,
      quizScoreHistory: [...progress.quizScoreHistory, { date: new Date().toLocaleDateString('ar-DZ'), score, total, unitTitle }],
      completedUnits: [...new Set([...progress.completedUnits, unitId])],
    };
    setUnits(updatedUnits);
    setProgress(updated);
    saveToLocalStorage(updatedUnits, flashcards, updated);
    setMasteryAndSave(nextMastery);
    updateLastStudyTime();
    setCoachEvent({
      kind: mode === 'validation' ? 'exam_passed' : 'diagnostic_passed',
      tone: 'success',
      unitId,
      titleAr: `مبروك! أتقنت « ${unitTitle} » 🎉`,
      messageAr:
        mode === 'validation'
          ? `حصلت على ${percent}%. انكسر قفل ${nextUnit ? `الوحدة ${nextUnit.id} « ${nextUnit.title} »` : 'الوحدة الموالية'} — واصل التقدم!`
          : `حصلت على ${percent}%. فتحت هذه الوحدة مباشرة بفضل مستواك المتقدم — بدون إعادة دروسها.`,
      actions: [
        nextUnit
          ? { id: COACH_ACTION.NEXT_UNIT, labelAr: `ابدأ الوحدة الموالية: ${nextUnit.title}` }
          : { id: COACH_ACTION.RESUME, labelAr: 'واصل مسار البوصلة' },
        { id: COACH_ACTION.CLOSE, labelAr: 'العودة إلى مساري', variant: 'ghost' },
      ],
    });
  };

  const handleQuizComplete = (score: number, total: number, wrongIds: number[] = []) => {
    // V3 : si un examen est en cours, on passe au traitement dédié (Le Gardien).
    if (examRequest) {
      handleExamComplete(examRequest, score, total, wrongIds);
      return;
    }
    const activeUnit = units.find(u => u.id === activeQuizUnitId);
    if (!activeUnit) return;
    const percent = Math.round((score / total) * 100);
    // V3 : le QCM libre fait progresser, mais SEUL l'examen de validation
    // (80%) — ou le test diagnostique — déverrouille l'unité suivante.
    const updatedUnits = units.map(u => u.id === activeQuizUnitId ? { ...u, progress: Math.max(u.progress, percent) } : u);
    const updated: UserProgress = {
      ...progress,
      xp: progress.xp + score * 20,
      completedQuestionsCount: progress.completedQuestionsCount + total,
      quizScoreHistory: [...progress.quizScoreHistory, { date: new Date().toLocaleDateString('ar-DZ'), score, total, unitTitle: activeUnit.title }],
      completedUnits: percent >= 80 ? [...new Set([...progress.completedUnits, activeUnit.id])] : progress.completedUnits
    };
    setUnits(updatedUnits);
    setProgress(updated);
    saveToLocalStorage(updatedUnits, flashcards, updated);
    updateLastStudyTime();
  };

  // V3 : actions du modal Coach proactif (routage centralisé).
  const handleCoachAction = (actionId: string) => {
    const event = coachEvent;
    setCoachEvent(null);
    if (!event) return;
    const unitId = event.unitId ?? 1;
    switch (actionId) {
      case COACH_ACTION.RESUME: {
        handleResumeMission(getNextAction(units, mastery));
        break;
      }
      case COACH_ACTION.DIAGNOSTIC:
        launchExam(unitId, 'diagnostic');
        break;
      case COACH_ACTION.REVIEW_LESSON: {
        const lessonId = getFirstLessonId(unitId);
        if (lessonId) handleStartLesson(lessonId);
        else navigateToTab('lessons');
        break;
      }
      case COACH_ACTION.DRILL:
        launchExam(unitId, 'drill');
        break;
      case COACH_ACTION.RETRY_EXAM:
        launchExam(unitId, event.examMode === 'diagnostic' ? 'diagnostic' : 'validation');
        break;
      case COACH_ACTION.NEXT_UNIT: {
        const lessonId = getFirstLessonId(unitId + 1);
        if (lessonId) handleStartLesson(lessonId);
        else navigateToTab('lessons');
        break;
      }
      case COACH_ACTION.CLOSE:
      default:
        break;
    }
  };

  const updateBanner = isUpdateReady ? (
    <div className="fixed left-4 right-4 md:left-auto md:right-6 bottom-24 md:bottom-6 z-[70] bg-[#0f1d14] text-white border border-[#2ecc71]/30 shadow-2xl rounded-2xl px-4 py-3 flex flex-col gap-3 md:max-w-sm" dir="rtl">
      <div>
        <p className="text-sm font-black text-[#fed65b]">تحديث جديد جاهز</p>
        <p className="text-xs text-gray-200 leading-5">تم تنزيل نسخة أحدث من التطبيق. حدّث الآن للاستفادة من آخر التحسينات دون فقدان تقدمك المحلي.</p>
      </div>
      <div className="flex items-center gap-2 justify-start">
        <button
          onClick={() => {
            const started = applyServiceWorkerUpdate();
            if (!started) setIsUpdateReady(false);
          }}
          className="px-3 py-2 rounded-xl bg-[#2ecc71] text-[#052e16] text-xs font-black cursor-pointer"
        >
          حدّث الآن
        </button>
        <button
          onClick={() => setIsUpdateReady(false)}
          className="px-3 py-2 rounded-xl bg-white/10 text-white text-xs font-bold cursor-pointer"
        >
          لاحقاً
        </button>
      </div>
    </div>
  ) : null;

  // Gatekeeper Offline-First : si aucun profil caché, on affiche LoginScreen (jamais l'app).
  if (!user) {
    return <>{updateBanner}<LoginScreen /></>;
  }

  if (activeQuizUnitId !== null) {
    // V3 : en mode examen, les questions viennent de la requête d'examen
    // (10 QCM de l'unité, drill correctif…), pas du tirage libre.
    if (!examRequest && !quizQuestions) return <>{updateBanner}<LoadingFallback /></>;
    const activeUnit = units.find(u => u.id === activeQuizUnitId);
    const freeQuestions = quizQuestions ? quizQuestions.filter(q => q.unitId === activeQuizUnitId) : [];
    const questions = examRequest ? examRequest.questions : (freeQuestions.length > 0 ? freeQuestions : quizQuestions ?? []);
    return (
      <>
        {updateBanner}
        <Suspense fallback={<LoadingFallback />}>
          <QuizView
            unitId={activeQuizUnitId}
            unitTitle={activeUnit ? activeUnit.title : ''}
            questions={questions}
            examMode={examRequest?.mode}
            onClose={() => { setActiveQuizUnitId(null); setExamRequest(null); }}
            onQuizComplete={handleQuizComplete}
          />
        </Suspense>
      </>
    );
  }

  if (activeLessonId) {
    return (
      <>
        {updateBanner}
        <Suspense fallback={<LoadingFallback />}>
          <InteractiveLessonView
            lessonId={activeLessonId}
            onClose={() => setActiveLessonId(null)}
            onStartLesson={handleStartLesson}
            onNavigateToTab={navigateToTab}
            onLaunchReflexMission={handleLaunchReflexMission}
          />
        </Suspense>
      </>
    );
  }

  if (currentTab === 'splash') {
    return <>{updateBanner}<SplashView onStart={() => setCurrentTab('path')} /></>;
  }

  return (
    <div className={`min-h-screen flex flex-col ${isFocusMode ? 'bg-gradient-to-b from-[#060a07] to-[#0e1411] text-gray-100' : 'bg-[#f8f9fa] text-[#191c1d] pt-16 md:pt-20 dark:bg-[#0c0f0d] dark:text-gray-100'}`}>
      {updateBanner}
      <Suspense fallback={null}>
        <StudyReminderModal isOpen={isReminderModalOpen} onClose={() => { setIsReminderModalOpen(false); updateLastStudyTime(); }} onSchedule={handleScheduleReminder} />
      </Suspense>

      {!isFocusMode && (
        <header className="bg-[#ffffff] dark:bg-[#141916] shadow-[0_2px_12px_rgba(0,109,55,0.06)] border-b border-[#e2dabf]/40 dark:border-[#2ecc71]/10 flex flex-row-reverse justify-between items-center px-4 md:px-8 h-16 md:h-20 w-full fixed top-0 z-40">
          <div className="flex items-center gap-3">
          <div className="relative cursor-pointer" onClick={() => setCurrentTab('progress')}>
            <div className="absolute inset-0 bg-[#2ecc71]/20 rounded-full blur-sm" />
              <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#006d37] text-white flex items-center justify-center border-2 border-white shadow-sm">
                <User className="w-5 h-5" />
              </div>
            </div>
            <div className="hidden sm:block text-right">
              <span className="text-[10px] text-[#506072] block font-bold">طالب متميز</span>
              <span className="text-xs font-black text-[#1f1c0b] dark:text-white">SVT BAC DZ - 5 Rubriques</span>
            </div>
          </div>
          <div className="font-extrabold text-xl md:text-2xl text-[#006d37] font-display">
            {currentTab === 'path' ? 'مساري' : currentTab === 'lessons' ? 'الدروس' : currentTab === 'training' ? 'أتدرب' : 'تقدمي'}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2.5 rounded-full bg-[#f3f4f5] dark:bg-[#1f2622] border border-[#e2dabf]/50 dark:border-[#2ecc71]/10 text-[#506072] dark:text-zinc-300 cursor-pointer">
              {isDarkMode ? <Sun className="w-4 h-4 text-[#fed65b]" /> : <Moon className="w-4 h-4" />}
            </button>
            <div className="flex items-center gap-1 bg-[#fff9ed] border border-[#e2dabf]/80 px-3 py-1.5 rounded-full font-bold text-xs text-[#1f1c0b]">
              <Flame className="w-4 h-4 text-[#ff9a4a] fill-[#ff9a4a] animate-pulse" />
              <span>{progress.streak}</span>
              <span className="text-[#e2dabf] px-1">|</span>
              <Trophy className="w-3.5 h-3.5 text-[#fed65b] fill-[#fed65b]" />
              <span>{progress.xp} XP</span>
            </div>
          </div>
        </header>
      )}

      <div className={`flex-1 flex w-full ${isFocusMode ? 'max-w-4xl' : 'max-w-5xl'} mx-auto`}>
        {!isFocusMode && (
          <aside className="hidden md:flex shrink-0 w-64 bg-white dark:bg-[#141916] border-l border-[#e2dabf]/50 dark:border-[#2ecc71]/10 flex-col py-6 px-4 gap-2 h-[calc(100vh-80px)] sticky top-20 right-0">
            <div className="text-[10px] font-black tracking-widest text-[#506072] uppercase px-4 mb-4">مسار BAC SVT - 100% Offline</div>
            {TABS.map(tab => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.id;
              return (
                <button key={tab.id} onClick={() => setCurrentTab(tab.id)} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all cursor-pointer ${isActive ? 'bg-[#2ecc71]/15 text-[#006d37]' : 'text-[#504441] hover:bg-[#fff9ed] hover:text-[#006d37]'}`}>
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
            <div className="mt-4 p-3 bg-[#fff9ed] border border-[#e2dabf]/60 rounded-xl text-[11px] leading-6 text-[#504441]">
              <strong>هيكل التطبيق:</strong><br/>
              • مساري → مهمة 3 دقائق + رادار + نقاط ضعف<br/>
              • الدروس → Mot→Exemple→Micro-test→Méthodo<br/>
              • أتدرب → QCM + بطاقات + تحدي BAC + منهجية<br/>
              • تقدمي → XP + رادار + أوسمة<br/>
              • المرشد → زر عائم أيمن سفلي
            </div>
          </aside>
        )}

        <main className={`flex-1 px-4 py-6 md:py-8 overflow-x-hidden ${isFocusMode ? 'flex items-center justify-center min-h-screen py-12' : ''}`}>
          <ErrorBoundary>
            <div key={currentTab}>
              <Suspense fallback={<LoadingFallback />}>
                {currentTab === 'path' && <MyPathView units={units} progress={progress} mastery={mastery} onLaunchQuiz={handleLaunchQuiz} onLaunchRevision={handleLaunchRevision} onNavigateToTab={navigateToTab} onLaunchReflexMission={handleLaunchReflexMission} onLaunchSurvivalCard={handleLaunchSurvivalCard} onResumeMission={handleResumeMission} onLaunchExam={handleLaunchExam} />}
                {currentTab === 'lessons' && <LessonsView units={units} progress={progress} onStartLesson={handleStartLesson} validatedUnits={mastery.validatedUnits} onLockedUnitClick={handleLockedUnitClick} teacherOverride={teacherOverride} />}
                {currentTab === 'training' && (
                  quizQuestions && flashcards.length > 0
                    ? <TrainingView units={units} flashcards={flashcards} progress={progress} onLaunchQuiz={handleLaunchQuiz} onLaunchRevision={handleLaunchRevision} onStartLesson={handleStartLesson} onLaunchSurvivalCard={handleLaunchSurvivalCard} onRateCard={handleRateCard} isFocusMode={isFocusMode} setIsFocusMode={setIsFocusMode} onNavigateToTab={navigateToTab} onLaunchExam={handleLaunchExam} onLockedUnitClick={handleLockedUnitClick} teacherOverride={teacherOverride} />
                    : <LoadingFallback />
                )}
                {currentTab === 'progress' && <ProgressView progress={progress} units={units} onNavigateToTab={navigateToTab} teacherOverride={teacherOverride} onTeacherOverrideChange={handleTeacherOverrideChange} />}
              </Suspense>
            </div>
          </ErrorBoundary>
        </main>
      </div>

      {!isFocusMode && (
        <nav className="md:hidden bg-white border-t border-[#bbcbbb]/30 shadow-[0_-4px_16px_rgba(0,109,55,0.06)] fixed bottom-0 left-0 right-0 h-16 z-40 flex items-center justify-around px-1 rounded-t-2xl">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setCurrentTab(tab.id)} className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all w-14 cursor-pointer ${isActive ? 'bg-[#2ecc71]/10 text-[#006d37]' : 'text-[#506072] hover:text-[#006d37]'}`}>
                <Icon className="w-5 h-5" />
                <span className="text-[9px] font-bold mt-1">{tab.label}</span>
                {isActive && <div className="w-1 h-1 bg-[#006d37] rounded-full mt-1" />}
              </button>
            );
          })}
        </nav>
      )}

      {/* FAB Coach flottant (bas-droite) */}
      {!isFocusMode && (
        <button
          onClick={() => setIsCoachOpen(true)}
          className="fixed bottom-20 md:bottom-6 right-4 z-50 w-14 h-14 rounded-full bg-[#006d37] text-white shadow-lg shadow-[#006d37]/30 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform cursor-pointer"
          aria-label="Ouvrir le Coach"
        >
          <MessageCircle className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#ff9a4a] border-2 border-white text-[9px] font-black flex items-center justify-center">1</span>
        </button>
      )}

      {/* Modal Coach */}
      {isCoachOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black/50 flex justify-center items-end md:items-center px-0 md:px-4"
          onClick={() => setIsCoachOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full md:max-w-2xl max-h-[90vh] md:max-h-[80vh] overflow-y-auto bg-white dark:bg-[#141916] rounded-t-[28px] md:rounded-3xl shadow-2xl"
          >
            <Suspense fallback={<LoadingFallback />}>
              <CoachView
                progress={progress}
                units={units}
                onStartLesson={handleStartLesson}
                onSignOut={signOut}
                onClose={() => setIsCoachOpen(false)}
              />
            </Suspense>
          </div>
        </div>
      )}

      {/* V3 — Coach proactif : modal événementiel (unité verrouillée, examen, absence…). */}
      {coachEvent && <CoachEventModal event={coachEvent} onAction={handleCoachAction} />}

      {/* P1.1-B — overlay mission réflexe : entraînement méthodologique ciblé. */}
      {activeMissionReflex && (
        <div className="fixed inset-0 z-[55] bg-black/50 flex justify-center items-end md:items-center px-0 md:px-4 overflow-y-auto py-6">
          <div className="w-full md:max-w-3xl bg-white dark:bg-[#141916] rounded-t-[28px] md:rounded-3xl shadow-2xl">
            <Suspense fallback={<LoadingFallback />}>
              <MethodologyView
                missionReflexId={activeMissionReflex.reflexId}
                missionMeta={{ missionId: activeMissionReflex.missionId, conceptId: activeMissionReflex.conceptId, relatedErrorIds: activeMissionReflex.relatedErrorIds }}
                onMissionComplete={() => setActiveMissionReflex(null)}
              />
            </Suspense>
          </div>
        </div>
      )}

      {/* P1.2-B — overlay carte de survie validée (rappel actif). */}
      {activeSurvivalCardId && activeSurvivalCard && (
        <div className="fixed inset-0 z-[55] bg-black/50 flex justify-center items-end md:items-center px-0 md:px-4 overflow-y-auto py-6">
          <Suspense fallback={<LoadingFallback />}>
            <SurvivalCardView card={activeSurvivalCard} onClose={() => setActiveSurvivalCardId(null)} />
          </Suspense>
        </div>
      )}

    </div>
  );
}

// Module 1 — Point d'entrée : AuthProvider encapsule l'app. Le gate est géré dans AppShell.
export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}
