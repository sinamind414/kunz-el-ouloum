import { useState, useEffect, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, 
  BookOpen, 
  BrainCircuit, 
  TrendingUp, 
  User, 
  Flame, 
  Trophy, 
  Layers,
  Sun,
  Moon,
  Target,
  Swords
} from 'lucide-react';

import { Unit, UserProgress, Flashcard } from './types';
import { INITIAL_UNITS, SVT_QUIZ_QUESTIONS, SVT_FLASHCARDS } from './data';

import SplashView from './components/SplashView';
import DashboardView from './components/DashboardView';
import QuizView from './components/QuizView';
import StudyReminderModal from './components/StudyReminderModal';
import { startPirateMusic, stopPirateMusic } from './utils/audio';

// Fable 5 audit: lazy load heavy views to reduce initial bundle (recharts, engines, etc)
const RevisionView = lazy(() => import('./components/RevisionView'));
const StatsView = lazy(() => import('./components/StatsView'));
const AITutorView = lazy(() => import('./components/AITutorView'));
const MethodologyView = lazy(() => import('./components/MethodologyView'));
const LessonsView = lazy(() => import('./components/LessonsView'));
const BacCombatView = lazy(() => import('./components/BacCombatView'));

const DATA_VERSION = 'github-500qcm-v1-fable5';

const DEFAULT_PROGRESS: UserProgress = {
  xp: 0,
  streak: 0,
  completedUnits: [],
  completedQuestionsCount: 0,
  studyMinutes: 0,
  flashcardStats: {
    again: 0,
    hard: 0,
    good: 0,
    easy: 0
  },
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

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const savedTheme = localStorage.getItem('theme');
      return savedTheme === 'dark';
    } catch {
      return false;
    }
  });

  const [currentTab, setCurrentTab] = useState<'splash' | 'home' | 'lessons' | 'review' | 'stats' | 'chat' | 'methodology' | 'combat'>('splash');
  
  useEffect(() => {
    if (currentTab !== 'splash') {
      stopPirateMusic();
    }
  }, [currentTab]);
  
  const [activeQuizUnitId, setActiveQuizUnitId] = useState<number | null>(null);
  const [activeRevisionUnitId, setActiveRevisionUnitId] = useState<number | null>(null);
  const [isFocusMode, setIsFocusMode] = useState<boolean>(false);

  useEffect(() => {
    setIsFocusMode(false);
  }, [currentTab]);

  const [isReminderModalOpen, setIsReminderModalOpen] = useState<boolean>(false);

  useEffect(() => {
    if (currentTab === 'splash') return;
    const lastStudyTime = localStorage.getItem('lastStudyTime');
    const scheduledReminderTime = localStorage.getItem('scheduledReminderTime');
    const now = Date.now();

    if (scheduledReminderTime && now >= Number(scheduledReminderTime)) {
      setIsReminderModalOpen(true);
      localStorage.removeItem('scheduledReminderTime');
      return;
    }

    if (lastStudyTime && !scheduledReminderTime) {
      const msSinceLastStudy = now - Number(lastStudyTime);
      if (msSinceLastStudy > 24 * 60 * 60 * 1000) {
        setIsReminderModalOpen(true);
      }
    } else if (!lastStudyTime) {
      localStorage.setItem('lastStudyTime', now.toString());
    }
  }, [currentTab]);

  const handleScheduleReminder = (hours: number) => {
    const scheduledTime = Date.now() + hours * 60 * 60 * 1000;
    localStorage.setItem('scheduledReminderTime', scheduledTime.toString());
    if ('Notification' in window) {
      Notification.requestPermission();
    }
    setIsReminderModalOpen(false);
  };

  const updateLastStudyTime = () => {
    localStorage.setItem('lastStudyTime', Date.now().toString());
  };

  const [units, setUnits] = useState<Unit[]>(INITIAL_UNITS);
  const [flashcards, setFlashcards] = useState<Flashcard[]>(SVT_FLASHCARDS);
  const [progress, setProgress] = useState<UserProgress>(() => createDefaultProgress());

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
      if (savedFlashcards) setFlashcards(JSON.parse(savedFlashcards));
      if (savedProgress) setProgress(JSON.parse(savedProgress));
    } catch (error) {
      console.warn('Invalid saved SVT progress, resetting local data.', error);
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
    } catch (error) {
      console.warn('Unable to persist SVT progress locally.', error);
    }
  };

  const handleRateCard = (cardId: string, rating: 'again' | 'hard' | 'good' | 'easy') => {
    const pointsAwarded = rating === 'easy' ? 15 : rating === 'good' ? 10 : rating === 'hard' ? 5 : 2;
    const updatedStats = { ...progress.flashcardStats };
    updatedStats[rating] += 1;
    const addedMinutes = Math.floor(Math.random() * 3) + 2;
    const updatedProgress: UserProgress = {
      ...progress,
      xp: progress.xp + pointsAwarded,
      studyMinutes: progress.studyMinutes + addedMinutes,
      flashcardStats: updatedStats
    };
    setProgress(updatedProgress);
    saveToLocalStorage(units, flashcards, updatedProgress);
    updateLastStudyTime();
  };

  const handleLaunchQuiz = (unitId: number) => {
    setActiveQuizUnitId(unitId);
  };

  const handleLaunchRevision = (unitId: number) => {
    setActiveRevisionUnitId(unitId);
    setCurrentTab('review');
  };

  const handleQuizComplete = (score: number, total: number) => {
    const activeUnit = units.find(u => u.id === activeQuizUnitId);
    if (!activeUnit) return;
    const percent = Math.round((score / total) * 100);
    const xpRewarded = score * 20;
    const updatedUnits = units.map(u => {
      if (u.id === activeQuizUnitId) {
        return { ...u, progress: Math.max(u.progress, percent) };
      }
      return u;
    });
    if (percent >= 60 && activeQuizUnitId !== null && activeQuizUnitId < units.length) {
      const nextId = activeQuizUnitId + 1;
      updatedUnits[nextId - 1].isLocked = false;
    }
    const updatedHistory = [
      ...progress.quizScoreHistory,
      { date: new Date().toLocaleDateString('ar-DZ'), score, total, unitTitle: activeUnit.title }
    ];
    const updatedProgress: UserProgress = {
      ...progress,
      xp: progress.xp + xpRewarded,
      completedQuestionsCount: progress.completedQuestionsCount + total,
      quizScoreHistory: updatedHistory,
      completedUnits: percent >= 80 ? [...new Set([...progress.completedUnits, activeUnit.id])] : progress.completedUnits
    };
    setUnits(updatedUnits);
    setProgress(updatedProgress);
    saveToLocalStorage(updatedUnits, flashcards, updatedProgress);
    updateLastStudyTime();
  };

  if (activeQuizUnitId !== null) {
    const activeUnit = units.find(u => u.id === activeQuizUnitId);
    const questions = SVT_QUIZ_QUESTIONS.filter(q => q.unitId === activeQuizUnitId);
    return (
      <QuizView 
        unitId={activeQuizUnitId}
        unitTitle={activeUnit ? activeUnit.title : ''}
        questions={questions.length > 0 ? questions : SVT_QUIZ_QUESTIONS}
        onClose={() => setActiveQuizUnitId(null)}
        onQuizComplete={handleQuizComplete}
      />
    );
  }

  if (currentTab === 'splash') {
    return <SplashView onStart={() => setCurrentTab('home')} />;
  }

  return (
    <div className={`min-h-screen transition-all duration-500 flex flex-col ${
      isFocusMode 
        ? 'bg-gradient-to-b from-[#060a07] to-[#0e1411] text-gray-100' 
        : 'bg-[#f8f9fa] text-[#191c1d] pt-16 md:pt-20 dark:bg-[#0c0f0d] dark:text-gray-100'
    }`}>
      
      <StudyReminderModal 
        isOpen={isReminderModalOpen} 
        onClose={() => {
          setIsReminderModalOpen(false);
          updateLastStudyTime();
        }} 
        onSchedule={handleScheduleReminder} 
      />

      {!isFocusMode && (
        <header className="bg-[#ffffff] dark:bg-[#141916] shadow-[0_2px_12px_rgba(0,109,55,0.06)] border-b border-[#e2dabf]/40 dark:border-[#2ecc71]/10 flex flex-row-reverse justify-between items-center px-4 md:px-8 h-16 md:h-20 w-full fixed top-0 z-40 select-none">
        <div className="flex items-center gap-3">
          <div className="relative cursor-pointer" onClick={() => setCurrentTab('stats')}>
            <div className="absolute inset-0 bg-[#2ecc71]/20 rounded-full blur-sm" />
            <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#006d37] text-white flex items-center justify-center border-2 border-[#ffffff] shadow-sm">
              <User className="w-5 h-5 md:w-6 md:h-6" />
            </div>
          </div>
          <div className="hidden sm:block text-right">
            <span className="text-[10px] text-[#506072] block font-bold">طالب متميز</span>
            <span className="text-xs font-black text-[#1f1c0b]">SVT BAC DZ</span>
          </div>
        </div>
        <div className="font-extrabold text-xl md:text-2xl text-[#006d37] font-display select-none">
          {currentTab === 'home' ? 'كنز العلوم' : currentTab === 'review' ? 'المراجعة الذكية' : currentTab === 'stats' ? 'لوحة الإحصائيات' : 'المرشد الذكي'}
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 md:p-2.5 rounded-full bg-[#f3f4f5] dark:bg-[#1f2622] hover:bg-[#fff9ed] dark:hover:bg-[#141916] border border-[#e2dabf]/50 dark:border-[#2ecc71]/10 hover:border-[#006d37]/40 text-[#506072] dark:text-zinc-300 hover:text-[#006d37] dark:hover:text-[#2ecc71] transition-all cursor-pointer shadow-sm flex items-center justify-center"
            title={isDarkMode ? "الوضع المضيء" : "الوضع الداكن"}
            id="theme-toggle-btn"
          >
            {isDarkMode ? <Sun className="w-4.5 h-4.5 text-[#fed65b] fill-[#fed65b]" /> : <Moon className="w-4.5 h-4.5 text-[#506072]" />}
          </button>
          <div className="flex items-center gap-1 bg-[#fff9ed] border border-[#e2dabf]/80 px-2.5 md:px-3 py-1.5 rounded-full font-bold text-[11px] md:text-xs text-[#1f1c0b] shadow-sm">
            <Flame className="w-4 h-4 text-[#ff9a4a] fill-[#ff9a4a] animate-pulse" />
            <span>{progress.streak}</span>
            <span className="text-[#e2dabf] px-1">|</span>
            <Trophy className="w-3.5 h-3.5 text-[#fed65b] fill-[#fed65b] text-white" />
            <span>{progress.xp} XP</span>
          </div>
        </div>
      </header>
      )}

      <div className={`flex-1 flex w-full ${isFocusMode ? 'max-w-4xl' : 'max-w-5xl'} mx-auto`}>
        
        {!isFocusMode && (
          <aside className="hidden md:flex shrink-0 w-64 bg-[#ffffff] dark:bg-[#141916] border-l border-[#e2dabf]/50 dark:border-[#2ecc71]/10 flex-col py-6 px-4 gap-2 select-none h-[calc(100vh-80px)] sticky top-20 right-0">
          <div className="text-[10px] font-black tracking-widest text-[#506072] uppercase px-4 mb-4">القائمة الرئيسية</div>
          <button onClick={() => setCurrentTab('home')} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all cursor-pointer ${currentTab === 'home' ? 'bg-[#2ecc71]/15 text-[#006d37]' : 'text-[#504441] hover:bg-[#fff9ed] hover:text-[#006d37]'}`}><Home className="w-5 h-5" /><span>الرئيسية والوحدات</span></button>
          <button onClick={() => setCurrentTab('lessons')} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all cursor-pointer ${currentTab === 'lessons' ? 'bg-[#2ecc71]/15 text-[#006d37]' : 'text-[#504441] hover:bg-[#fff9ed] hover:text-[#006d37]'}`}><Layers className="w-5 h-5" /><span>الدروس</span></button>
          <button onClick={() => setCurrentTab('review')} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all cursor-pointer ${currentTab === 'review' ? 'bg-[#2ecc71]/15 text-[#006d37]' : 'text-[#504441] hover:bg-[#fff9ed] hover:text-[#006d37]'}`}><BookOpen className="w-5 h-5" /><span>المراجعة الذكية</span></button>
          <button onClick={() => setCurrentTab('chat')} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all cursor-pointer ${currentTab === 'chat' ? 'bg-[#2ecc71]/15 text-[#006d37]' : 'text-[#504441] hover:bg-[#fff9ed] hover:text-[#006d37]'}`}><BrainCircuit className="w-5 h-5" /><span>المرشد الذكي</span></button>
          <button onClick={() => setCurrentTab('stats')} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all cursor-pointer ${currentTab === 'stats' ? 'bg-[#2ecc71]/15 text-[#006d37]' : 'text-[#504441] hover:bg-[#fff9ed] hover:text-[#006d37]'}`}><TrendingUp className="w-5 h-5" /><span>الإحصائيات والأداء</span></button>
          <button onClick={() => setCurrentTab('methodology')} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all cursor-pointer ${currentTab === 'methodology' ? 'bg-[#2ecc71]/15 text-[#006d37]' : 'text-[#504441] hover:bg-[#fff9ed] hover:text-[#006d37]'}`}><Target className="w-5 h-5" /><span>تدريب المنهجية</span></button>
          <button onClick={() => setCurrentTab('combat')} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all cursor-pointer ${currentTab === 'combat' ? 'bg-[#2ecc71]/15 text-[#006d37]' : 'text-[#504441] hover:bg-[#fff9ed] hover:text-[#006d37]'}`}><Swords className="w-5 h-5" /><span>تحدي البكالوريا</span></button>
        </aside>
        )}

        <main className={`flex-1 px-4 py-6 md:py-8 overflow-x-hidden ${isFocusMode ? 'flex items-center justify-center min-h-screen py-12' : ''}`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {currentTab === 'home' && (
                <DashboardView 
                  units={units}
                  progress={progress}
                  onLaunchQuiz={handleLaunchQuiz}
                  onLaunchRevision={handleLaunchRevision}
                  onNavigateToTab={setCurrentTab}
                />
              )}
              <Suspense fallback={<LoadingFallback />}>
                {currentTab === 'lessons' && <LessonsView units={units} />}
                {currentTab === 'review' && (
                  <RevisionView 
                    units={units}
                    flashcards={flashcards}
                    xp={progress.xp}
                    streak={progress.streak}
                    onRateCard={handleRateCard}
                    initialUnitId={activeRevisionUnitId ?? 1}
                    isFocusMode={isFocusMode}
                    setIsFocusMode={setIsFocusMode}
                  />
                )}
                {currentTab === 'stats' && <StatsView progress={progress} units={units} />}
                {currentTab === 'chat' && <AITutorView />}
                {currentTab === 'methodology' && <MethodologyView />}
                {currentTab === 'combat' && <BacCombatView />}
              </Suspense>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {!isFocusMode && (
        <nav className="md:hidden bg-[#ffffff] border-t border-[#bbcbbb]/30 shadow-[0_-4px_16px_rgba(0,109,55,0.06)] fixed bottom-0 left-0 right-0 h-16 z-40 flex items-center justify-around px-1 rounded-t-2xl select-none overflow-x-auto">
        <button onClick={() => setCurrentTab('home')} className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all w-14 cursor-pointer ${currentTab === 'home' ? 'bg-[#2ecc71]/10 text-[#006d37]' : 'text-[#506072] hover:text-[#006d37]'}`}><Home className="w-5 h-5" /><span className="text-[10px] font-bold mt-1">الرئيسية</span></button>
        <button onClick={() => setCurrentTab('lessons')} className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all w-14 cursor-pointer ${currentTab === 'lessons' ? 'bg-[#2ecc71]/10 text-[#006d37]' : 'text-[#506072] hover:text-[#006d37]'}`}><Layers className="w-5 h-5" /><span className="text-[10px] font-bold mt-1">الدروس</span></button>
        <button onClick={() => setCurrentTab('stats')} className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all w-14 cursor-pointer ${currentTab === 'stats' ? 'bg-[#2ecc71]/10 text-[#006d37]' : 'text-[#506072] hover:text-[#006d37]'}`}><TrendingUp className="w-5 h-5" /><span className="text-[10px] font-bold mt-1">الإحصائيات</span></button>
        <button onClick={() => setCurrentTab('methodology')} className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all w-14 cursor-pointer ${currentTab === 'methodology' ? 'bg-[#2ecc71]/10 text-[#006d37]' : 'text-[#506072] hover:text-[#006d37]'}`}><Target className="w-5 h-5" /><span className="text-[10px] font-bold mt-1">المنهجية</span></button>
        <button onClick={() => setCurrentTab('review')} className={`flex flex-col items-center justify-center p-2.5 rounded-full transition-all w-16 cursor-pointer ${currentTab === 'review' ? 'bg-[#2ecc71] text-[#ffffff] shadow-md scale-110 -translate-y-2' : 'bg-[#2ecc71]/10 text-[#006d37]'}`}><BookOpen className="w-5 h-5" /><span className="text-[10px] font-bold mt-0.5">المراجعة</span></button>
        <button onClick={() => setCurrentTab('chat')} className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all w-14 cursor-pointer ${currentTab === 'chat' ? 'bg-[#2ecc71]/10 text-[#006d37]' : 'text-[#506072] hover:text-[#006d37]'}`}><BrainCircuit className="w-5 h-5" /><span className="text-[10px] font-bold mt-1">المرشد</span></button>
        <button onClick={() => setCurrentTab('combat')} className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all w-14 shrink-0 cursor-pointer ${currentTab === 'combat' ? 'bg-[#2ecc71]/10 text-[#006d37]' : 'text-[#506072] hover:text-[#006d37]'}`}><Swords className="w-5 h-5" /><span className="text-[10px] font-bold mt-1">التحدي</span></button>
      </nav>
      )}
    </div>
  );
}
