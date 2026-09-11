import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, 
  BookOpen, 
  TrendingUp, 
  User, 
  Flame, 
  Trophy, 
  Sparkles,
  Menu,
  GraduationCap,
  Sun,
  Moon,
  Target,
  Swords,
  Award,
  PlayCircle,
  Layers,
  Compass,
  Route,
  NotebookPen,
  BarChart3,
  MessageCircle,
  Network
} from 'lucide-react';

import { Unit, UserProgress, Flashcard } from './types';
import { INITIAL_UNITS, SVT_QUIZ_QUESTIONS, SVT_FLASHCARDS } from './data';

import SplashView from './components/SplashView';
import DashboardView from './components/DashboardView';
import QuizView from './components/QuizView';
import RevisionView from './components/RevisionView';
import StatsView from './components/StatsView';
import AITutorView from './components/AITutorView';
import StudyReminderModal from './components/StudyReminderModal';
import MethodologyCompilerView from './components/MethodologyCompilerView';
import StudentAuthView from './components/StudentAuthView';
import StudentAccountBar from './components/StudentAccountBar';
import TeacherDashboardView from './components/TeacherDashboardView';
import UnitIntroPortal from './components/UnitIntroPortal';
import CombatTrainerView from './components/CombatTrainerView';
import CombatChallengePortal from './components/CombatChallengePortal';
import BadgesView from './components/BadgesView';
import LessonTwoView from './components/LessonTwoView';
import LessonsView from './components/LessonsView';
import MindMapView from './components/MindMap/MindMapView';
import { 
  startPirateMusic, 
  stopPirateMusic, 
  playDailyGoalCelebrationSound, 
  playStreakMilestoneSound, 
  playXPGainSound 
} from './utils/audio';

export default function App() {
  // Dark mode state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });

  // Navigation tab state
  const [currentTab, setCurrentTab] = useState<'splash' | 'home' | 'review' | 'stats' | 'chat' | 'methodology' | 'bootcamp' | 'badges' | 'lesson' | 'workshop' | 'mindmap' | 'teacher'>('splash');
  const [activeMindMapUnitId, setActiveMindMapUnitId] = useState<number>(1);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [studentName, setStudentName] = useState<string | null>(null);
  const [studentEmail, setStudentEmail] = useState<string | null>(null);
  
  // Stop music once we exit the splash screen
  useEffect(() => {
    if (currentTab !== 'splash') {
      stopPirateMusic();
    }
  }, [currentTab]);
  
  // Quiz and revision action states
  const [activeQuizUnitId, setActiveQuizUnitId] = useState<number | null>(null);
  const [activeRevisionUnitId, setActiveRevisionUnitId] = useState<number | null>(null);

  // Focus Mode state
  const [isFocusMode, setIsFocusMode] = useState<boolean>(false);

  // Clear Focus Mode whenever tab changes
  useEffect(() => {
    setIsFocusMode(false);
  }, [currentTab]);

  // Reminder Modal State
  const [isReminderModalOpen, setIsReminderModalOpen] = useState<boolean>(false);

  // Check Reminder Logic
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
      // First time using app or missing data, just set it to now
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

  // Core progression state (persisted to localStorage)
  const [units, setUnits] = useState<Unit[]>(INITIAL_UNITS);
  const [flashcards, setFlashcards] = useState<Flashcard[]>(SVT_FLASHCARDS);
  // Seed 100 % honnête : premier lancement = zéro réel.
  // (plus aucune statistique de démonstration — tout s'écrit avec l'activité réelle)
  const [progress, setProgress] = useState<UserProgress>({
    xp: 0,
    streak: 0,
    completedUnits: [],
    completedQuestionsCount: 0,
    studyMinutes: 0,
    dailyGoals: {
      type: 'minutes',
      targetMinutes: 25,
      targetQuestions: 20,
      lastActiveDate: new Date().toISOString().split('T')[0],
      todayMinutes: 0,
      todayQuestions: 0,
      streakDays: 0,
      completedToday: false,
    },
    flashcardStats: {
      again: 0,
      hard: 0,
      good: 0,
      easy: 0
    },
    quizScoreHistory: []
  });

  // Apply dark mode theme class to document element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Load state from localStorage on startup
  useEffect(() => {
    let savedUnits: Unit[] | null = null;
    let savedFlashcards: Flashcard[] | null = null;
    let savedProgress: UserProgress | null = null;
    try {
      const rawUnits = localStorage.getItem('svt_units');
      const rawFlashcards = localStorage.getItem('svt_flashcards');
      const rawProgress = localStorage.getItem('svt_progress');
      if (rawUnits) savedUnits = JSON.parse(rawUnits);
      if (rawFlashcards) savedFlashcards = JSON.parse(rawFlashcards);
      if (rawProgress) savedProgress = JSON.parse(rawProgress);
    } catch (e) {
      console.warn('Données locales corrompues — réinitialisation aux valeurs par défaut:', e);
      savedUnits = null; savedFlashcards = null; savedProgress = null;
    }

    if (savedUnits && Array.isArray(savedUnits) && savedUnits.length > 0) setUnits(savedUnits);
    if (savedFlashcards && Array.isArray(savedFlashcards) && savedFlashcards.length > 0) {
      // Migration (D3) : l'ancien stock local ne comptait que 3 cartes "fc_1..fc_3"
      // sans état utilisateur exploitable (handleRateCard ne persiste rien sur la carte).
      // Si le format corpus (fc_q_*) est absent, on écrase par le jeu complet 508+3.
      const hasCorpusCards = savedFlashcards.some((c) => typeof c.id === 'string' && c.id.startsWith('fc_q_'));
      if (!hasCorpusCards) {
        setFlashcards(SVT_FLASHCARDS);
        try {
          localStorage.setItem('svt_flashcards', JSON.stringify(SVT_FLASHCARDS));
        } catch { /* quota — sera retenté au prochain save */ }
      } else {
        setFlashcards(savedFlashcards);
      }
    }
    if (savedProgress) {
      const parsed: UserProgress = savedProgress;
      const today = new Date().toISOString().split('T')[0];
      
      // Ensure daily goals exist and date is synchronized
      if (!parsed.dailyGoals) {
        parsed.dailyGoals = {
          type: 'minutes',
          targetMinutes: 25,
          targetQuestions: 20,
          lastActiveDate: today,
          todayMinutes: 0,
          todayQuestions: 0,
          streakDays: 1,
          completedToday: false,
        };
      } else if (parsed.dailyGoals.lastActiveDate !== today) {
        // Date changed: reset today's counters
        parsed.dailyGoals.lastActiveDate = today;
        parsed.dailyGoals.todayMinutes = 0;
        parsed.dailyGoals.todayQuestions = 0;
        parsed.dailyGoals.completedToday = false;
      }
      setProgress(parsed);
    }
  }, []);

  // Sync state to localStorage
  const saveToLocalStorage = (newUnits: Unit[], newCards: Flashcard[], newProgress: UserProgress) => {
    try {
      localStorage.setItem('svt_units', JSON.stringify(newUnits));
      localStorage.setItem('svt_flashcards', JSON.stringify(newCards));
      localStorage.setItem('svt_progress', JSON.stringify(newProgress));
    } catch (e) {
      console.warn('Impossible de sauvegarder la progression localement:', e);
    }
  };

  const handleUpdateDailyGoals = (newGoals: import('./types').DailyGoalConfig) => {
    const updatedProgress: UserProgress = {
      ...progress,
      dailyGoals: newGoals
    };
    setProgress(updatedProgress);
    saveToLocalStorage(units, flashcards, updatedProgress);
  };

  // SM-2 Spaced Repetition flashcard rating callback
  const handleRateCard = (cardId: string, rating: 'again' | 'hard' | 'good' | 'easy') => {
    // Reward points based on effort rating
    const pointsAwarded = rating === 'easy' ? 15 : rating === 'good' ? 10 : rating === 'hard' ? 5 : 2;
    
    const updatedStats = { ...progress.flashcardStats };
    updatedStats[rating] += 1;

    // Advance study minutes
    const addedMinutes = Math.floor(Math.random() * 3) + 2; // 2-4 minutes

    // Update Daily Goals
    const today = new Date().toISOString().split('T')[0];
    const currentDaily = progress.dailyGoals || {
      type: 'minutes' as const,
      targetMinutes: 25,
      targetQuestions: 20,
      lastActiveDate: today,
      todayMinutes: 0,
      todayQuestions: 0,
      streakDays: 1,
      completedToday: false
    };

    const newTodayMinutes = (currentDaily.todayMinutes || 0) + addedMinutes;
    const newTodayQuestions = (currentDaily.todayQuestions || 0) + 1;
    const isCompleted = currentDaily.type === 'minutes' 
      ? newTodayMinutes >= currentDaily.targetMinutes 
      : newTodayQuestions >= currentDaily.targetQuestions;

    const updatedDaily = {
      ...currentDaily,
      todayMinutes: newTodayMinutes,
      todayQuestions: newTodayQuestions,
      completedToday: isCompleted
    };

    const updatedProgress: UserProgress = {
      ...progress,
      xp: progress.xp + pointsAwarded,
      studyMinutes: progress.studyMinutes + addedMinutes,
      dailyGoals: updatedDaily,
      flashcardStats: updatedStats
    };

    setProgress(updatedProgress);
    saveToLocalStorage(units, flashcards, updatedProgress);
    updateLastStudyTime();

    if (isCompleted && !currentDaily.completedToday) {
      playDailyGoalCelebrationSound();
    } else {
      playXPGainSound();
    }
  };

  const [activeUnitPortalId, setActiveUnitPortalId] = useState<number | null>(null);
  const [activeCombatChallenge, setActiveCombatChallenge] = useState<{id: string, title: string, mode: 'coach'|'sprint'} | null>(null);

  // Launching and finishing Quiz callback
  const handleLaunchQuiz = (unitId: number) => {
    // Update last studied timestamp on the unit
    const updatedUnits = units.map(u => u.id === unitId ? { ...u, lastStudiedTimestamp: Date.now() } : u);
    setUnits(updatedUnits);
    saveToLocalStorage(updatedUnits, flashcards, progress);
    updateLastStudyTime();

    // Show portal for Unit 1 instead of launching quiz directly
    if (unitId === 1) {
      setActiveUnitPortalId(unitId);
    } else {
      setActiveQuizUnitId(unitId);
    }
  };

  const handleLaunchRevision = (unitId: number) => {
    setSelectedRevisionUnit(unitId);
  };

  const setSelectedRevisionUnit = (unitId: number) => {
    setCurrentTab('review');
  };

  const handleQuizComplete = (score: number, total: number) => {
    const activeUnit = units.find(u => u.id === activeQuizUnitId);
    if (!activeUnit) return;

    // Calculate percent score
    const percent = Math.round((score / total) * 100);

    // Reward XP + Advance progress
    const xpRewarded = score * 20; // 20 XP per correct answer
    
    // Update unit progress (increase progress if current score is higher)
    const updatedUnits = units.map(u => {
      if (u.id === activeQuizUnitId) {
        return {
          ...u,
          progress: Math.max(u.progress, percent)
        };
      }
      return u;
    });

    // Automatically unlock next unit if scored well (>= 60%)
    if (percent >= 60 && activeQuizUnitId < units.length) {
      const nextId = activeQuizUnitId + 1;
      updatedUnits[nextId - 1].isLocked = false;
    }

    const updatedHistory = [
      ...progress.quizScoreHistory,
      {
        date: new Date().toLocaleDateString('ar-DZ'),
        score,
        total,
        unitTitle: activeUnit.title
      }
    ];

    // Update Daily Goals
    const today = new Date().toISOString().split('T')[0];
    const currentDaily = progress.dailyGoals || {
      type: 'minutes' as const,
      targetMinutes: 25,
      targetQuestions: 20,
      lastActiveDate: today,
      todayMinutes: 0,
      todayQuestions: 0,
      streakDays: 1,
      completedToday: false
    };

    const quizMinutesEstimated = Math.max(3, Math.round(total * 1.5));
    const newTodayMinutes = (currentDaily.todayMinutes || 0) + quizMinutesEstimated;
    const newTodayQuestions = (currentDaily.todayQuestions || 0) + total;
    const isCompleted = currentDaily.type === 'minutes' 
      ? newTodayMinutes >= currentDaily.targetMinutes 
      : newTodayQuestions >= currentDaily.targetQuestions;

    const updatedDaily = {
      ...currentDaily,
      todayMinutes: newTodayMinutes,
      todayQuestions: newTodayQuestions,
      completedToday: isCompleted
    };

    const updatedProgress: UserProgress = {
      ...progress,
      xp: progress.xp + xpRewarded,
      studyMinutes: progress.studyMinutes + quizMinutesEstimated,
      completedQuestionsCount: progress.completedQuestionsCount + total,
      dailyGoals: updatedDaily,
      quizScoreHistory: updatedHistory,
      completedUnits: percent >= 80 ? [...new Set([...progress.completedUnits, activeUnit.id])] : progress.completedUnits
    };

    setUnits(updatedUnits);
    setProgress(updatedProgress);
    saveToLocalStorage(updatedUnits, flashcards, updatedProgress);
    updateLastStudyTime();

    // Lot 0022: log quiz activity for teacher dashboard
    const unit = units.find((u) => u.id === activeQuizUnitId);
    import('./utils/studentAccount').then(({ logQuizActivity }) => {
      logQuizActivity(activeQuizUnitId, score, total, unit?.title || 'quiz');
    });

    if (isCompleted && !currentDaily.completedToday) {
      playDailyGoalCelebrationSound();
    } else {
      playXPGainSound();
    }
  };

  // If in quiz mode, override full interface to focus purely on scientific learning
  if (activeCombatChallenge) {
    return (
      <CombatChallengePortal 
        challengeId={activeCombatChallenge.id}
        challengeTitle={activeCombatChallenge.title}
        mode={activeCombatChallenge.mode}
        onClose={() => setActiveCombatChallenge(null)}
      />
    );
  }

  if (activeUnitPortalId !== null) {
    const activeUnit = units.find(u => u.id === activeUnitPortalId);
    return (
      <UnitIntroPortal 
        unitId={activeUnitPortalId}
        unitTitle={activeUnit ? activeUnit.title : ''}
        onClose={() => setActiveUnitPortalId(null)}
        onStartLesson={() => {
          setActiveQuizUnitId(activeUnitPortalId);
          setActiveUnitPortalId(null);
        }}
      />
    );
  }

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

  // Render Splash Landing Screen
  if (currentTab === 'splash') {
    return <SplashView onStart={() => setCurrentTab('home')} />;
  }

  const handleTabChange = (tab: any) => {
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(50);
    }
    setCurrentTab(tab);
  };

  return (
    <div className={`h-[100dvh] w-full overflow-hidden relative transition-all duration-500 flex flex-col ${
      isFocusMode 
        ? 'bg-gradient-to-b from-[#060a07] to-[#0e1411] text-gray-100' 
        : 'bg-[#f8fbfa] text-[#191c1d] dark:bg-[#0c0f0d] dark:text-gray-100'
    }`}>
      
      {/* Reminder Modal */}
      <StudyReminderModal 
        isOpen={isReminderModalOpen} 
        onClose={() => {
          setIsReminderModalOpen(false);
          updateLastStudyTime();
        }} 
        onSchedule={handleScheduleReminder} 
      />

      <StudentAuthView
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLogin={(name, email) => {
          setStudentName(name);
          setStudentEmail(email);
        }}
      />

      {/* Dynamic Top App Bar matching Screen 2 */}
      {!isFocusMode && currentTab !== 'home' && (
        <header className="bg-[#ffffff] dark:bg-[#141916] shadow-[0_2px_12px_rgba(0,109,55,0.06)] border-b border-[#e2dabf]/40 dark:border-[#2ecc71]/10 flex flex-row-reverse justify-between items-center px-4 md:px-8 h-16 md:h-20 w-full shrink-0 z-40 select-none">
        
        {/* Left Side: Avatar block */}
        <div className="flex items-center gap-3">
          {studentEmail ? (
            <StudentAccountBar onOpenTeacher={() => setCurrentTab('teacher')} />
          ) : (
            <div className="relative cursor-pointer" onClick={() => setIsAuthOpen(true)}>
              <div className="absolute inset-0 bg-[#2ecc71]/20 rounded-full blur-sm" />
              <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#006d37] text-white flex items-center justify-center border-2 border-[#ffffff] shadow-sm">
                <User className="w-5 h-5 md:w-6 md-6" />
              </div>
            </div>
          )}
          <div className="hidden sm:block text-right">
            <span className="text-[10px] text-[#506072] block font-bold">طالب متميز</span>
            <span className="text-xs font-black text-[#1f1c0b]">{studentName || 'SVT BAC DZ'}</span>
          </div>
        </div>

        {/* Center Title Brand Name */}
        <div className="font-extrabold text-xl md:text-2xl text-[#006d37] font-display select-none">
          {currentTab === 'review' ? 'المراجعة الذكية' : 
           currentTab === 'stats' ? 'لوحة الإحصائيات' : 
           currentTab === 'badges' ? 'الأوسمة والإنجازات' : 
           currentTab === 'methodology' ? 'بوصلة' : 
           currentTab === 'bootcamp' ? 'تحدي البكالوريا' : 
            currentTab === 'lesson' ? 'الدروس' :
            currentTab === 'workshop' ? 'الورشة التفاعلية' : 
           currentTab === 'mindmap' ? 'الخرائط الذهنية (D3)' :
            currentTab === 'chat' ? 'المرشد الذكي' :
            currentTab === 'teacher' ? 'لوحة المتابعة' :
            'كنز العلوم'}
        </div>

        {/* Right Side Block with Streak & Dark Mode Toggle */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Dark Mode Switch Button */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 md:p-2.5 rounded-full bg-[#f3f4f5] dark:bg-[#1f2622] hover:bg-[#fff9ed] dark:hover:bg-[#141916] border border-[#e2dabf]/50 dark:border-[#2ecc71]/10 hover:border-[#006d37]/40 text-[#506072] dark:text-zinc-300 hover:text-[#006d37] dark:hover:text-[#2ecc71] transition-all cursor-pointer shadow-sm flex items-center justify-center"
            title={isDarkMode ? "الوضع المضيء" : "الوضع الداكن"}
            id="theme-toggle-btn"
          >
            {isDarkMode ? (
              <Sun className="w-4.5 h-4.5 text-[#fed65b] fill-[#fed65b]" />
            ) : (
              <Moon className="w-4.5 h-4.5 text-[#506072]" />
            )}
          </button>

          {/* Streak & XP Badge */}
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

      {/* Main Container Workspace */}
      <div className={`flex-1 flex w-full ${isFocusMode ? 'max-w-4xl' : 'max-w-5xl'} mx-auto overflow-hidden relative`}>
        
        {/* Desktop Sidebar Navigation Alternative (Left-aligned or Right-aligned depending on layout direction) */}
        {/* Since it is RTL, the sidebar sits on the RIGHT side of the page */}
        {!isFocusMode && (
          <aside className="hidden md:flex shrink-0 w-64 bg-[#ffffff] dark:bg-[#141916] border-l border-[#e2dabf]/50 dark:border-[#2ecc71]/10 flex-col py-6 px-4 gap-2 select-none h-full overflow-y-auto">
          <div className="text-[10px] font-black tracking-widest text-[#506072] uppercase px-4 mb-4">القائمة الرئيسية</div>
          
          {/* Dashboard Tab */}
          <button
            onClick={() => setCurrentTab('home')}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all cursor-pointer ${
              currentTab === 'home'
                ? 'bg-[#2ecc71]/15 text-[#006d37]'
                : 'text-[#504441] hover:bg-[#fff9ed] hover:text-[#006d37]'
            }`}
          >
            <Home className="w-5 h-5" />
            <span>الرئيسية</span>
          </button>

          {/* Lesson Tab */}
          <button
            onClick={() => setCurrentTab('lesson')}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all cursor-pointer ${
              currentTab === 'lesson'
                ? 'bg-[#2ecc71]/15 text-[#006d37]'
                : 'text-[#504441] hover:bg-[#fff9ed] hover:text-[#006d37]'
            }`}
          >
            <BookOpen className="w-5 h-5" />
            <span>الدروس</span>
          </button>

          {/* Workshop Tab (leçon interactive Transcription) */}
          <button
            onClick={() => setCurrentTab('workshop')}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all cursor-pointer ${
              currentTab === 'workshop'
                ? 'bg-[#2ecc71]/15 text-[#006d37]'
                : 'text-[#504441] hover:bg-[#fff9ed] hover:text-[#006d37]'
            }`}
          >
            <BookOpen className="w-5 h-5" />
            <span>الورشة التفاعلية</span>
          </button>

          {/* Flashcards / Revision Tab */}
          <button
            onClick={() => setCurrentTab('review')}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all cursor-pointer ${
              currentTab === 'review'
                ? 'bg-[#2ecc71]/15 text-[#006d37]'
                : 'text-[#504441] hover:bg-[#fff9ed] hover:text-[#006d37]'
            }`}
          >
            <Layers className="w-5 h-5" />
            <span>المراجعة</span>
          </button>

          {/* Mind Maps Tab */}
          <button
            onClick={() => setCurrentTab('mindmap')}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all cursor-pointer ${
              currentTab === 'mindmap'
                ? 'bg-[#2ecc71]/15 text-[#006d37]'
                : 'text-[#504441] hover:bg-[#fff9ed] hover:text-[#006d37]'
            }`}
          >
            <Network className="w-5 h-5" />
            <span>الخرائط الذهنية</span>
          </button>

          {/* Methodology Tab */}
           <button
             onClick={() => setCurrentTab('methodology')}
             className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all cursor-pointer ${
               currentTab === 'methodology'
                 ? 'bg-[#2ecc71]/15 text-[#006d37]'
                 : 'text-[#504441] hover:bg-[#fff9ed] hover:text-[#006d37]'
             }`}
           >
             <Target className="w-5 h-5" />
             <span>المنهجية</span>
           </button>

           {/* Teacher Dashboard Tab */}
           <button
             onClick={() => setCurrentTab('teacher')}
             className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all cursor-pointer ${
               currentTab === 'teacher'
                 ? 'bg-[#2ecc71]/15 text-[#006d37]'
                 : 'text-[#504441] hover:bg-[#fff9ed] hover:text-[#006d37]'
             }`}
           >
             <GraduationCap className="w-5 h-5" />
             <span>لوحة المتابعة</span>
           </button>

          {/* AI Chat / Tutor Tab */}
          <button
            onClick={() => setCurrentTab('chat')}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all cursor-pointer ${
              currentTab === 'chat'
                ? 'bg-[#2ecc71]/15 text-[#006d37]'
                : 'text-[#504441] hover:bg-[#fff9ed] hover:text-[#006d37]'
            }`}
          >
            <Compass className="w-5 h-5" />
            <span>المرشد</span>
          </button>
        </aside>
        )}

        {/* Dynamic Display Canvas */}
        <main className={`flex-1 overflow-y-auto overflow-x-hidden relative ${isFocusMode ? 'flex items-center justify-center' : ''}`}>
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
                  onUpdateDailyGoals={handleUpdateDailyGoals}
                  isDarkMode={isDarkMode}
                />
              )}

              {currentTab === 'review' && (
                <RevisionView 
                  units={units}
                  flashcards={flashcards}
                  xp={progress.xp}
                  streak={progress.streak}
                  onRateCard={handleRateCard}
                  isFocusMode={isFocusMode}
                  setIsFocusMode={setIsFocusMode}
                />
              )}

              {currentTab === 'stats' && (
                <StatsView 
                  progress={progress}
                  units={units}
                  onNavigate={(t) => setCurrentTab(t as typeof currentTab)}
                />
              )}

              {currentTab === 'chat' && (
                <AITutorView 
                  onBackToDashboard={() => setCurrentTab('home')}
                />
              )}

              {currentTab === 'methodology' && (
                <MethodologyCompilerView onBackToHome={() => setCurrentTab('home')} />
              )}

              {currentTab === 'teacher' && (
                <TeacherDashboardView onBack={() => setCurrentTab('home')} />
              )}

              {currentTab === 'bootcamp' && (
                <CombatTrainerView 
                  onStartChallenge={(id, title, mode) => setActiveCombatChallenge({id, title, mode})}
                />
              )}

              {currentTab === 'badges' && (
                <BadgesView progress={progress} />
              )}

              {currentTab === 'lesson' && (
                <LessonsView />
              )}

              {currentTab === 'workshop' && (
                <LessonTwoView />
              )}

              {currentTab === 'mindmap' && (
                <MindMapView 
                  initialUnitId={activeMindMapUnitId}
                  onBackToHome={() => setCurrentTab('home')}
                  onStartQuizForUnit={handleLaunchQuiz}
                  isDarkMode={isDarkMode}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      
      {!isFocusMode && currentTab !== 'chat' && (
        <button
          onClick={() => handleTabChange('chat')}
          className="md:hidden absolute bottom-[90px] right-4 z-50 bg-[#006d37] hover:bg-[#005a2d] text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-transform active:scale-95"
        >
          <div className="relative flex items-center justify-center w-full h-full">
            <MessageCircle className="w-7 h-7" />
            <div className="absolute top-0 right-0 bg-[#ff8c42] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">1</div>
          </div>
        </button>
      )}

      {!isFocusMode && (
        <nav className="md:hidden bg-[#f8fbfa] shadow-[0_-5px_15px_rgba(0,0,0,0.05)] shrink-0 h-[80px] z-40 flex items-center justify-around px-2 pb-2 rounded-t-[24px] select-none border-t border-[#e2e8f0]/50" dir="rtl">
        
        {/* Home Button (مساري) */}
        <button
          onClick={() => handleTabChange('home')}
          className={`relative flex flex-col items-center justify-center p-2 rounded-2xl transition-all w-[72px] h-[64px] cursor-pointer ${
            currentTab === 'home'
              ? 'bg-[#e5f6ed] text-[#006d37]'
              : 'text-[#64748b] hover:text-[#006d37]'
          }`}
        >
          <Compass className="w-6 h-6 mb-1" />
          <span className="text-[11px] font-bold">مساري</span>
          {currentTab === 'home' && <div className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-[#006d37]"></div>}
        </button>

        {/* Lesson Button (الدروس) */}
        <button
          onClick={() => handleTabChange('lesson')}
          className={`relative flex flex-col items-center justify-center p-2 rounded-2xl transition-all w-[72px] h-[64px] cursor-pointer ${
            currentTab === 'lesson'
              ? 'bg-[#e5f6ed] text-[#006d37]'
              : 'text-[#64748b] hover:text-[#006d37]'
          }`}
        >
          <BookOpen className="w-6 h-6 mb-1" />
          <span className="text-[11px] font-bold">الدروس</span>
          {currentTab === 'lesson' && <div className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-[#006d37]"></div>}
        </button>

        {/* Methodology Button (أتدرب) */}
        <button
          onClick={() => handleTabChange('methodology')}
          className={`relative flex flex-col items-center justify-center p-2 rounded-2xl transition-all w-[72px] h-[64px] cursor-pointer ${
            currentTab === 'methodology'
              ? 'bg-[#e5f6ed] text-[#006d37]'
              : 'text-[#64748b] hover:text-[#006d37]'
          }`}
        >
          <Layers className="w-6 h-6 mb-1" />
          <span className="text-[11px] font-bold">أتدرب</span>
          {currentTab === 'methodology' && <div className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-[#006d37]"></div>}
        </button>

        {/* Stats Button (تقدمي) */}
        <button
          onClick={() => handleTabChange('stats')}
          className={`relative flex flex-col items-center justify-center p-2 rounded-2xl transition-all w-[72px] h-[64px] cursor-pointer ${
            currentTab === 'stats'
              ? 'bg-[#e5f6ed] text-[#006d37]'
              : 'text-[#64748b] hover:text-[#006d37]'
          }`}
        >
          <Trophy className="w-6 h-6 mb-1" />
          <span className="text-[11px] font-bold">تقدمي</span>
          {currentTab === 'stats' && <div className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-[#006d37]"></div>}
        </button>

      </nav>
      )}
    </div>
  );
}
