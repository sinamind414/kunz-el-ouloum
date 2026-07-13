import React, { useState, useEffect, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Home, BookOpen, Layers, Target, Compass, Sun, Moon, User, Flame, Trophy } from 'lucide-react';

import { Unit, UserProgress, Flashcard } from './types';
import { INITIAL_UNITS, SVT_QUIZ_QUESTIONS, SVT_FLASHCARDS } from './data';

import SplashView from './components/SplashView';
import DashboardView from './components/DashboardView';
import QuizView from './components/QuizView';
import StudyReminderModal from './components/StudyReminderModal';
import { stopPirateMusic } from './utils/audio';
import { AuthProvider, useAuth } from './context/AuthContext';
import { logEvent } from './utils/telemetryService';
import LoginScreen from './components/LoginScreen';

// Lazy load heavy views (Fable 5 - reduce main bundle)
const RevisionView = lazy(() => import('./components/RevisionView'));
const MethodologyView = lazy(() => import('./components/MethodologyView'));
const LessonsView = lazy(() => import('./components/LessonsView'));
const CoachView = lazy(() => import('./components/CoachView'));
const InteractiveLessonView = lazy(() => import('./components/InteractiveLessonView'));
const StatsView = lazy(() => import('./components/StatsView'));
const BadgesView = lazy(() => import('./components/BadgesView'));

const DATA_VERSION = 'github-500qcm-v1-fable5-8tabs';

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

type TabId = 'home' | 'lessons' | 'review' | 'methodology' | 'coach' | 'stats' | 'badges';

// Seulement 5 onglets visibles dans la nav (stats/badges accessibles via l'avatar)
const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'home', label: 'الرئيسية', icon: Home },
  { id: 'lessons', label: 'الدروس', icon: BookOpen },
  { id: 'review', label: 'المراجعة', icon: Layers },
  { id: 'methodology', label: 'المنهجية', icon: Target },
  { id: 'coach', label: 'المرشد', icon: Compass },
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
  const [activeRevisionUnitId, setActiveRevisionUnitId] = useState<number | null>(null);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);

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

  const [units, setUnits] = useState<Unit[]>(INITIAL_UNITS);
  const [flashcards, setFlashcards] = useState<Flashcard[]>(SVT_FLASHCARDS);
  const [progress, setProgress] = useState<UserProgress>(() => createDefaultProgress());

  // Module 1 — Auth Offline-First : lit le profil caché (localStorage) pour ne jamais bloquer l'offline.
  const { user, signOut } = useAuth();

  // Module 2 — Télémétrie : trace l'ouverture de l'app (online/offline) une fois l'utilisateur connu.
  useEffect(() => {
    if (user) logEvent('APP_OPENED', { online: navigator.onLine });
  }, [user]);

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
        saveToLocalStorage(INITIAL_UNITS, SVT_FLASHCARDS, createDefaultProgress());
        return;
      }
      const savedUnits = localStorage.getItem('svt_units');
      const savedFlashcards = localStorage.getItem('svt_flashcards');
      const savedProgress = localStorage.getItem('svt_progress');
      if (savedUnits) setUnits(JSON.parse(savedUnits));
      if (savedFlashcards) {
        const parsedCards = JSON.parse(savedFlashcards);
        setFlashcards(parsedCards.length && parsedCards[0].options ? parsedCards : SVT_FLASHCARDS);
      }
      if (savedProgress) setProgress(JSON.parse(savedProgress));
    } catch {
      saveToLocalStorage(INITIAL_UNITS, SVT_FLASHCARDS, createDefaultProgress());
      setUnits(INITIAL_UNITS);
      setFlashcards(SVT_FLASHCARDS);
      setProgress(createDefaultProgress());
    }
  }, []);

  const saveToLocalStorage = (newUnits: Unit[], newCards: Flashcard[], newProgress: UserProgress) => {
    try {
      localStorage.setItem('svt_data_version', DATA_VERSION);
      localStorage.setItem('svt_units', JSON.stringify(newUnits));
      localStorage.setItem('svt_flashcards', JSON.stringify(newCards));
      localStorage.setItem('svt_progress', JSON.stringify(newProgress));
    } catch {}
  };

  const handleRateCard = (_cardId: string, rating: 'again' | 'hard' | 'good' | 'easy') => {
    const points = rating === 'easy' ? 15 : rating === 'good' ? 10 : rating === 'hard' ? 5 : 2;
    const updatedStats = { ...progress.flashcardStats };
    (updatedStats as any)[rating] += 1;
    const addedMinutes = Math.floor(Math.random() * 3) + 2;
    const updated: UserProgress = { ...progress, xp: progress.xp + points, studyMinutes: progress.studyMinutes + addedMinutes, flashcardStats: updatedStats };
    setProgress(updated);
    saveToLocalStorage(units, flashcards, updated);
    updateLastStudyTime();
  };

  const handleLaunchQuiz = (unitId: number) => setActiveQuizUnitId(unitId);
  const handleLaunchRevision = (unitId: number) => {
    setActiveRevisionUnitId(unitId);
    setCurrentTab('review');
  };
  const handleStartLesson = (lessonId: string) => {
    setActiveLessonId(lessonId);
    setCurrentTab('lessons');
  };

  const handleQuizComplete = (score: number, total: number) => {
    const activeUnit = units.find(u => u.id === activeQuizUnitId);
    if (!activeUnit) return;
    const percent = Math.round((score / total) * 100);
    const updatedUnits = units.map(u => u.id === activeQuizUnitId ? { ...u, progress: Math.max(u.progress, percent) } : u);
    if (percent >= 60 && activeQuizUnitId !== null && activeQuizUnitId < units.length) {
      const nextId = activeQuizUnitId + 1;
      if (updatedUnits[nextId - 1]) updatedUnits[nextId - 1].isLocked = false;
    }
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

  // Gatekeeper Offline-First : si aucun profil caché, on affiche LoginScreen (jamais l'app).
  if (!user) {
    return <LoginScreen />;
  }

  if (activeQuizUnitId !== null) {
    const activeUnit = units.find(u => u.id === activeQuizUnitId);
    const questions = SVT_QUIZ_QUESTIONS.filter(q => q.unitId === activeQuizUnitId);
    return <QuizView unitId={activeQuizUnitId} unitTitle={activeUnit ? activeUnit.title : ''} questions={questions.length > 0 ? questions : SVT_QUIZ_QUESTIONS} onClose={() => setActiveQuizUnitId(null)} onQuizComplete={handleQuizComplete} />;
  }

  if (activeLessonId) {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <InteractiveLessonView lessonId={activeLessonId} onClose={() => setActiveLessonId(null)} />
      </Suspense>
    );
  }

  if (currentTab === 'splash') {
    return <SplashView onStart={() => setCurrentTab('home')} />;
  }

  return (
    <div className={`min-h-screen flex flex-col ${isFocusMode ? 'bg-gradient-to-b from-[#060a07] to-[#0e1411] text-gray-100' : 'bg-[#f8f9fa] text-[#191c1d] pt-16 md:pt-20 dark:bg-[#0c0f0d] dark:text-gray-100'}`}>
      <StudyReminderModal isOpen={isReminderModalOpen} onClose={() => { setIsReminderModalOpen(false); updateLastStudyTime(); }} onSchedule={handleScheduleReminder} />

      {!isFocusMode && (
        <header className="bg-[#ffffff] dark:bg-[#141916] shadow-[0_2px_12px_rgba(0,109,55,0.06)] border-b border-[#e2dabf]/40 dark:border-[#2ecc71]/10 flex flex-row-reverse justify-between items-center px-4 md:px-8 h-16 md:h-20 w-full fixed top-0 z-40">
          <div className="flex items-center gap-3">
            <div className="relative cursor-pointer" onClick={() => setCurrentTab('stats')}>
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
            {currentTab === 'home' ? 'كنز العلوم' : currentTab === 'lessons' ? 'الدروس' : currentTab === 'review' ? 'المراجعة الذكية' : currentTab === 'methodology' ? 'المنهجية' : currentTab === 'stats' ? 'لوحة الإحصائيات' : currentTab === 'badges' ? 'لوحة الأوسمة' : 'المرشد الموجه'}
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
            <div className="text-[10px] font-black tracking-widest text-[#506072] uppercase px-4 mb-4">5 Rubriques Essentielles - 100% Offline</div>
            {TABS.map(tab => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.id;
              return (
                <button key={tab.id} onClick={() => setCurrentTab(tab.id)} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all cursor-pointer ${isActive ? 'bg-[#2ecc71]/15 text-[#006d37]' : 'text-[#504441] hover:bg-[#fff9ed] hover:text-[#006d37]'}`}>
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                  {tab.id === 'coach' && <span className="mr-auto text-[9px] bg-indigo-500 text-white px-1.5 py-0.5 rounded-full">Coach</span>}
                </button>
              );
            })}
            <div className="mt-4 p-3 bg-[#fff9ed] border border-[#e2dabf]/60 rounded-xl text-[11px] leading-6 text-[#504441]">
              <strong>Architecture finale:</strong><br/>
              • الرئيسية → 3 domaines<br/>
              • الدروس → Mot→Exemple→Micro-test→Méthodo (4 étapes, sans scroll)<br/>
              • المراجعة → SM-2 flashcards<br/>
              • المنهجية → 4 verbes BAC<br/>
              • المرشد → Coach orientation offline (pas LLM)
            </div>
          </aside>
        )}

        <main className={`flex-1 px-4 py-6 md:py-8 overflow-x-hidden ${isFocusMode ? 'flex items-center justify-center min-h-screen py-12' : ''}`}>
          <AnimatePresence mode="wait">
            <motion.div key={currentTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
              {currentTab === 'home' && <DashboardView units={units} progress={progress} onLaunchQuiz={handleLaunchQuiz} onLaunchRevision={handleLaunchRevision} onNavigateToTab={setCurrentTab as any} />}
              <Suspense fallback={<LoadingFallback />}>
                {currentTab === 'lessons' && <LessonsView units={units} onStartLesson={handleStartLesson} />}
                {currentTab === 'review' && <RevisionView units={units} flashcards={flashcards} xp={progress.xp} streak={progress.streak} onRateCard={handleRateCard} initialUnitId={activeRevisionUnitId ?? 1} isFocusMode={isFocusMode} setIsFocusMode={setIsFocusMode} />}
                {currentTab === 'methodology' && <MethodologyView />}
                {currentTab === 'coach' && <CoachView progress={progress} units={units} onStartLesson={handleStartLesson} onSignOut={signOut} />}
                {currentTab === 'stats' && <StatsView progress={progress} units={units} onNavigateToTab={setCurrentTab as any} />}
                {currentTab === 'badges' && <BadgesView progress={progress} />}
              </Suspense>
            </motion.div>
          </AnimatePresence>
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
