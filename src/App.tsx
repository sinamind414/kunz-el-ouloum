import { useState, useEffect, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Home,
  BookOpen,
  User,
  Flame,
  Trophy,
  Sparkles,
  Sun,
  Moon,
  Swords,
  PlayCircle,
  Layers,
  Search,
  PenTool,
  Dumbbell,
  Key,
  Sprout
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { Unit, UserProgress, Flashcard, QuizQuestion } from './types';
import { INITIAL_UNITS } from './unitCatalog';
import { loadCorpus, peekCorpus, prefetchCorpusWhenIdle } from './data/corpusLoader';
// M7 (2026-10-14) — les questions « à trous » (~50 Ko) ne sont plus dans le
// bundle d'entrée : elles ne servent qu'au quiz. Même motif que le corpus QCM
// ci-dessus (import dynamique + cache + préchargement au repos).
import {
  chargerFillBlanks,
  peekFillBlanks,
  prefetchFillBlanksWhenIdle,
  versQuizQuestions,
  type QuestionATrous,
} from './data/fillBlanksLoader';

/** Identité élève persistée entre les sessions (le JWT vit dans api.ts). */
const STUDENT_STORE_KEY = 'boussole_student';
function loadStoredStudent(): { name: string; email: string } | null {
  try {
    const raw = localStorage.getItem(STUDENT_STORE_KEY);
    if (!raw) return null;
    const j = JSON.parse(raw) as { name?: unknown; email?: unknown };
    if (typeof j.name === 'string' && typeof j.email === 'string') {
      return { name: j.name, email: j.email };
    }
  } catch {
    /* JSON corrompu → pas de session */
  }
  return null;
}
import { healSavedFlashcards } from './utils/flashcardsSanitize';
// H3 (audit 8 axes, 2026-10-14) : le jour se calcule en HEURE LOCALE (voir
// utils/dayKey.ts) et l'activité quotidienne — objectif + série de jours — se
// crédite par une seule porte testée (utils/activiteQuotidienne.ts).
import { jourLocal } from './utils/dayKey';
import {
  appliquerActiviteQuotidienne,
  estimationMinutesQuiz,
  OBJECTIF_QUOTIDIEN_DEFAUT,
  serieAfficheeDepuisDaily,
} from './utils/activiteQuotidienne';
// Nomenclature figée (docs/MARQUE.md §3) — la rubrique porte le nom officiel de la source
// unique miftahSpec : aucun littéral dans ce fichier (garde-fou check:miftah §13, 2026-09-15).
import { MIFTAH_NAME_OFFICIAL_AR } from './data/miftahSpec';
import { AR_LATN } from './utils/latinDigits';

import SplashView from './components/SplashView';
import ChunkErrorBoundary from './components/ChunkErrorBoundary';

// ─────────────────────── Chargement différé des vues ───────────────────────
// Sprint 30 : le bundle principal pesait 3,97 Mo (964 Ko gzip). Toutes les
// vues étaient importées statiquement, donc téléchargées avant l'affichage du
// tableau de bord — y compris le compilateur de méthodologie, le tableau de
// bord enseignant ou les cartes mentales, que la plupart des élèves n'ouvrent
// pas dans une session. Ces vues passent en import dynamique : leur code n'est
// récupéré qu'au moment où l'onglet est ouvert.
//
// Restent chargées d'avance, parce qu'elles sont le chemin normal des
// premières secondes : le splash, le tableau de bord, les leçons, la révision
// et le quiz.
const AnimationsView = lazy(() => import('./components/AnimationsView'));
const SituationBankView = lazy(() => import('./components/SituationBankView'));
const SchemaDrillView = lazy(() => import('./components/SchemaDrillView'));
const RevisionPlanView = lazy(() => import('./components/RevisionPlanView'));
const BacIdeasView = lazy(() => import('./components/BacIdeasView'));
const MethodologyCompilerView = lazy(() => import('./components/MethodologyCompilerView'));
const TeacherDashboardView = lazy(() => import('./components/TeacherDashboardView'));
const CombatTrainerView = lazy(() => import('./components/CombatTrainerView'));
const Bac2025ExamView = lazy(() => import('./components/Bac2025ExamView'));
const BadgesView = lazy(() => import('./components/BadgesView'));
const MindMapView = lazy(() => import('./components/MindMap/MindMapView'));
const StatsView = lazy(() => import('./components/StatsView'));
const AITutorView = lazy(() => import('./components/AITutorView'));
const TadwinView = lazy(() => import('./components/TadwinView'));
const QuizView = lazy(() => import('./components/QuizView'));
const RevisionView = lazy(() => import('./components/RevisionView'));
const LessonsView = lazy(() => import('./components/LessonsView'));
// Un pilier du design OPUS 5.5 (photo « أنا ») :
// ouvert aussi peu que les autres onglets secondaires → import différé.
const MoiView = lazy(() => import('./components/MoiView'));
const LessonTwoView = lazy(() => import('./components/LessonTwoView'));
const TrainingHubView = lazy(() => import('./components/TrainingHubView'));
// Hub « الاختبارات » — sous-écran du hub S'entraîner (2026-10-12).
const ExamensHubView = lazy(() => import('./components/ExamensHubView'));
// Hub « المراجعة » — miroir du hub d'entraînement, côté consolidation.
const ReviewHubView = lazy(() => import('./components/ReviewHubView'));
// « مساري » — le parcours verrouillé (Phase 2, GO 2026-10-16). Le zombie
// documenté par integriteVues.lock.test.ts redevient vivant : l'écran existait
// (17 tests verts) mais n'était jamais rendu par l'application.
const ParcoursView = lazy(() => import('./components/ParcoursView'));
const CombatChallengePortal = lazy(() => import('./components/CombatChallengePortal'));
const UnitIntroPortal = lazy(() => import('./components/UnitIntroPortal'));
const StudentAuthView = lazy(() => import('./components/StudentAuthView'));
// Brique MOTIVATION (docs/INTEGRATION_FOCUS_MOTIVATION.md) — la dernière
// famille de processus (SE MOTIVER) : le déclic pour démarrer, le minuteur
// pour tenir. 100 % hors-ligne, chargés seulement à l'ouverture de l'onglet.
const FocusTimer = lazy(() => import('./components/FocusTimer'));
const MotivationDeclic = lazy(() => import('./components/MotivationDeclic'));


/** Écran d'attente d'une vue différée — discret, en arabe, sans saut de page. */
function VueEnChargement() {
  return (
    <div className="flex items-center justify-center py-16" dir="rtl" data-testid="vue-chargement">
      <span className="text-sm font-bold text-[#506072] dark:text-gray-400">جارٍ التحميل…</span>
    </div>
  );
}

import DashboardView from './components/DashboardView';
import StudyReminderModal from './components/StudyReminderModal';
import StudentAccountBar from './components/StudentAccountBar';
import { getApiToken } from './utils/api';
import { MORCHID_ASK_EVENT, type MorchidAskDetail } from './lib/morchidBridge';
// Silence du guide pendant l'épreuve (défaut corrigé le 14/10/2026) : le bouton
// flottant restait accessible pendant « موضوع تجريبي », une épreuve chronométrée.
import { abonnerExamen, examenActif } from './lib/examenEnCours';
// La bulle du capitaine : elle parle au bon moment (4 lois d'Atomic Habits),
// et se tait le reste du temps. Voir lib/invitationCapitaine.ts.
import { useInvitationCapitaine } from './hooks/useInvitationCapitaine';
// Import LÉGER : le nom seul, sans le contenu du guide (voir capitaineIdentite.ts).
import { CAPITAINE_IDENTITE_AR } from './data/capitaineIdentite';
import { CAPITAINE_VISAGE_URL } from './data/brandAssets';
// Le guide en entrée de rubrique : il accueille à la PREMIÈRE visite, puis se
// tait (voir data/conseilsRubrique.ts pour la raison).
import BandeauConseilRubrique from './components/BandeauConseilRubrique';
// Étape 5 (§5.D) : le relais humain. Une carte, deux questions, aucune sortie de
// l'appareil — voir `lib/relais.ts` pour la règle complète.
import RelaisCapitaine from './components/RelaisCapitaine';
import { conseilDeRubrique, type ConseilRubrique } from './data/conseilsRubrique';
import { marquerRubriqueVue } from './lib/conseilRubrique';
import { replanifierRevue, SEUIL_FRAGILE } from './lib/parcours/parcoursProgress';
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
  // Exercice sur lequel ouvrir l'atelier quand on arrive depuis le plan.
  const [bacIdeaFocus, setBacIdeaFocus] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState<'splash' | 'home' | 'review' | 'stats' | 'chat' | 'methodology' | 'bootcamp' | 'badges' | 'lesson' | 'workshop' | 'mindmap' | 'teacher' | 'animations' | 'situations' | 'schemas' | 'training' | 'plan' | 'bacideas' | 'focus' | 'tadwin' | 'moi' | 'reviser' | 'examens' | 'parcours'>('splash');
  // Deep-link : ouverture d'une leçon précise depuis un raccourci (الدروس, أنا…).
  const [parcoursLesson, setParcoursLesson] = useState<{ key: string; kind: 'html' | 'active'; unitId: number } | null>(null);
  // Deep-link : ouverture du QCM d'une unité précise (raccourci).
  const [parcoursQcm, setParcoursQcm] = useState<number | null>(null);
  // Deep-link : examen à ouvrir dans LessonsView ('qcm' = QCM du livre,
  // 'bac' = tests bac complets). Les examens ont quitté « الدروس » le
  // 2026-10-12 pour le hub S'entraîner (src/data/trainingHub.ts, `examens`).
  const [parcoursMode, setParcoursMode] = useState<'qcm' | 'bac' | null>(null);
  const ouvrirLeçonDepuisParcours = (key: string, kind: 'html' | 'active', unitId: number) => {
    setParcoursLesson({ key, kind, unitId });
    setParcoursQcm(null);
    setCurrentTab('lesson');
  };
  const ouvrirQcmDepuisParcours = (unitId: number) => {
    setParcoursQcm(unitId);
    setParcoursLesson(null);
    setCurrentTab('lesson');
  };
  // Examen choisi dans le hub S'entraîner → LessonsView l'ouvre en mode examen.
  const ouvrirExamen = (mode: 'qcm' | 'bac') => {
    setParcoursMode(mode);
    setParcoursQcm(null);
    setParcoursLesson(null);
    setCurrentTab('lesson');
  };
  const [activeMindMapUnitId, setActiveMindMapUnitId] = useState<number>(1);
  // Assistant contextuel « المرشد » (2026-10-11) : question apportée par une
  // vue via src/lib/morchidBridge.ts. Transmise à AITutorView, qui pré-remplit
  // le champ sans envoyer à la place de l'élève.
  const [morchidSeed, setMorchidSeed] = useState<string | null>(null);
  // Une épreuve est-elle en cours ? Si oui, le guide se tait.
  const [epreuveEnCours, setEpreuveEnCours] = useState<boolean>(() => examenActif());
  // Écoute globale : n'importe quelle vue peut appeler le المرشد sans qu'un
  // callback traverse toute l'arborescence.
  useEffect(() => {
    const onMorchidAsk = (e: Event) => {
      const detail = (e as CustomEvent<MorchidAskDetail>).detail;
      if (!detail?.question) return;
      setMorchidSeed(detail.question);
      setCurrentTab('chat');
    };
    window.addEventListener(MORCHID_ASK_EVENT, onMorchidAsk);
    return () => window.removeEventListener(MORCHID_ASK_EVENT, onMorchidAsk);
  }, []);

  // Abonnement au signal d'épreuve : un seul point d'écoute, dans App, plutôt
  // qu'une condition recopiée dans chaque vue qui pourrait afficher le bouton.
  useEffect(() => abonnerExamen(setEpreuveEnCours), []);

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  // Session élève persistée (correctif : la session était perdue à chaque F5).
  // On ne réaffiche un compte que s'il reste AVEC un jeton valide.
  const [studentName, setStudentName] = useState<string | null>(() =>
    getApiToken() ? loadStoredStudent()?.name ?? null : null,
  );
  const [studentEmail, setStudentEmail] = useState<string | null>(() =>
    getApiToken() ? loadStoredStudent()?.email ?? null : null,
  );
  const handleStudentLogout = () => {
    setStudentName(null);
    setStudentEmail(null);
    try {
      localStorage.removeItem(STUDENT_STORE_KEY);
    } catch {
      /* stockage indisponible */
    }
  };
  
  // Stop music once we exit the splash screen
  useEffect(() => {
    if (currentTab !== 'splash') {
      stopPirateMusic();
    }
  }, [currentTab]);
  
  // Quiz and revision action states
  const [activeQuizUnitId, setActiveQuizUnitId] = useState<number | null>(null);

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
  // Le corpus (549 QCM + flashcards) arrive en différé — voir data/corpusLoader.ts.
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [corpusQuestions, setCorpusQuestions] = useState<QuizQuestion[]>([]);
  // Seed 100 % honnête : premier lancement = zéro réel.
  // (plus aucune statistique de démonstration — tout s'écrit avec l'activité réelle)
  const [progress, setProgress] = useState<UserProgress>({
    xp: 0,
    streak: 0,
    completedUnits: [],
    completedQuestionsCount: 0,
    studyMinutes: 0,
    // H3 : dernier jour d'activité d'abord VIDE. Rempli par une activité réelle
    // (voir appliquerActiviteQuotidienne) — jamais par le simple lancement de
    // l'application, sans quoi la série se construirait sur les ouvertures.
    dailyGoals: { ...OBJECTIF_QUOTIDIEN_DEFAUT },
    flashcardStats: {
      again: 0,
      hard: 0,
      good: 0,
      easy: 0
    },
    quizScoreHistory: []
  });

  /**
   * La bulle du capitaine. `signalTravail` monte quand l'élève produit du
   * travail : la bulle se recalcule alors (et se tait, puisque l'élève vient
   * de travailler — c'est voulu).
   */
  /**
   * La rubrique ouverte fait partie de l'ÉTAT DE L'ÉLÈVE (famille « contexte »),
   * donc elle est connue AVANT l'appel : c'est ce qui permet à la bulle et au
   * bandeau de conseil de lire le même état au lieu de relire chacun sa tranche.
   * `conseilDeRubrique` est pur et bon marché — le contenu, lui, ne bouge pas.
   */
  const conseilCourant: ConseilRubrique | null = conseilDeRubrique(currentTab);

  // Audit Capitaine §6.2 : signalTravail est un COMPTEUR d'évènements de travail
  // réel (QCM d'unité, chapitre du livre) — pas `units.length`, constant, qui ne
  // recalculait jamais la bulle.
  const [signalBulle, setSignalBulle] = useState(0);

  const { invitation, relais, etat, ignorer, accepter, rafraichir } = useInvitationCapitaine({
    daily: progress.dailyGoals,
    // §6.2 : plus de `units[0]?.title` (le premier titre du catalogue, offert à
    // tout le monde) — faute de prop, le hook lit le témoin réel du parcours.
    epreuveEnCours,
    signalTravail: signalBulle,
    rubrique: currentTab,
    rubriqueAUnConseil: Boolean(conseilCourant),
  });

  /**
   * Le conseil d'entrée de rubrique.
   *
   * `ouvertureAuto` distingue les deux façons d'afficher le même bandeau :
   *  · ouvert automatiquement, une seule fois, à la première visite ;
   *  · rouvert par l'élève via le « ؟ » de l'en-tête, autant de fois qu'il veut.
   * Sans cette distinction, le bandeau se fermerait puis se rouvrirait tout seul
   * au changement d'onglet — le comportement le plus agaçant possible.
   */
  const [conseilFerme, setConseilFerme] = useState(true);
  /**
   * L'état est délibérément HORS des dépendances de cet effet, et ce n'est pas un
   * oubli : l'effet doit se déclencher quand l'élève CHANGE DE RUBRIQUE, pas
   * quand l'état se recalcule. Sans cela, `marquerRubriqueVue` — juste en dessous
   * — rendrait `conseilRubriqueAPrendre` faux au recalcul suivant, et l'effet
   * refermerait le bandeau que l'élève est en train de lire.
   */
  useEffect(() => {
    if (!conseilCourant) {
      setConseilFerme(true);
      return;
    }
    // La famille « contexte » de l'état unique : la liste des rubriques déjà vues
    // n'est plus relue ici, et la décision de parler n'est plus prise deux fois.
    if (etat.contexte.conseilRubriqueAPrendre) {
      // On mémorise À L'AFFICHAGE, pas à la fermeture : un élève qui change
      // d'onglet sans lire ne doit pas revoir le même discours indéfiniment.
      marquerRubriqueVue(currentTab);
      setConseilFerme(false);
    } else {
      setConseilFerme(true);
    }
  }, [currentTab, conseilCourant]);

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
    // Garde-fou verso vide (bug 2026-09-20) : UNE carte au verso vide dans le stock
    // local ⇒ tout le blob est rejeté (healSavedFlashcards strict) et remplacé par le
    // jeu complet du dépôt — soigne n'importe quel appareil au prochain chargement.
    const healedFlashcards = savedFlashcards ? healSavedFlashcards(savedFlashcards) : null;
    if (healedFlashcards) {
      setFlashcards(healedFlashcards);
    }
    // Le jeu de référence n'est chargé que si le stock local est absent ou
    // corrompu : dans ce cas seulement, on attend le corpus.
    if (!healedFlashcards) {
      void loadCorpus().then(({ flashcards: reference }) => {
        setFlashcards(reference);
        try {
          localStorage.setItem('svt_flashcards', JSON.stringify(reference));
        } catch { /* quota — sera retenté au prochain save */ }
      });
    }
    prefetchCorpusWhenIdle();
    prefetchFillBlanksWhenIdle();
    if (savedProgress) {
      const parsed: UserProgress = savedProgress;
      // H3 : jour LOCAL (l'élève est à Alger, pas à Greenwich). En UTC, la remise
      // à zéro des compteurs se faisait à 01 h 00 du matin.
      const today = jourLocal();

      // Ensure daily goals exist and date is synchronized
      if (!parsed.dailyGoals) {
        parsed.dailyGoals = { ...OBJECTIF_QUOTIDIEN_DEFAUT, lastActiveDate: today };
      } else if (parsed.dailyGoals.lastActiveDate !== today) {
        // Date changed: reset today's counters
        // NB (H3) : on ne touche PAS à `streakDays` ni à `serieDernierJour` ici.
        // La série se juge sur les jours TRAVAILLÉS, pas sur les jours où
        // l'application a été ouverte : la réinitialiser à l'ouverture ferait
        // perdre une série à un élève qui ouvre l'app le matin sans étudier.
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

  // Crédite les minutes d'une phase de focus terminée (FocusTimer) dans
  // l'objectif quotidien + le temps d'étude global, exactement comme
  // handleRateCard le fait pour les cartes. Sert la brique MOTIVATION
  // (docs/INTEGRATION_FOCUS_MOTIVATION.md §1c).
  // NB : FocusTimer joue déjà son propre son de fin de phase — on n'en
  // rejoue aucun ici pour éviter le double.
  const addStudyMinutes = (min: number) => {
    if (!min || min <= 0) return;

    // H3 : une seule porte pour créditer l'activité (compteurs + série).
    const r = appliquerActiviteQuotidienne(progress, { minutes: min });
    const updatedProgress: UserProgress = {
      ...r.progress,
      studyMinutes: progress.studyMinutes + min,
    };

    setProgress(updatedProgress);
    saveToLocalStorage(units, flashcards, updatedProgress);
    updateLastStudyTime();
    if (r.palier) playStreakMilestoneSound(r.palier);
  };

  // Déclic de motivation affiché UNE fois par jour au tableau de bord, avant
  // la première session (recommandation §2 du doc d'intégration). La clé
  // datée empêche toute ré-ouverture dans la même journée.
  const DECLIC_SHOWN_KEY = 'kunz_declic_shown_v1';
  const [isDeclicOverlayOpen, setIsDeclicOverlayOpen] = useState(false);

  useEffect(() => {
    if (currentTab !== 'home') return;
    const today = jourLocal();
    try {
      if (localStorage.getItem(DECLIC_SHOWN_KEY) !== today) {
        setIsDeclicOverlayOpen(true);
      }
    } catch {
      /* lecture indisponible → on tente l'affichage quand même */
      setIsDeclicOverlayOpen(true);
    }
  }, [currentTab, DECLIC_SHOWN_KEY]);

  const closeDeclicOverlay = () => {
    // Jour LOCAL, comme la lecture ci-dessus : sinon, entre 00 h et 01 h, la clé
    // écrite (UTC) ne correspondrait pas à la clé lue (donc re-déclic).
    const today = jourLocal();
    try {
      localStorage.setItem(DECLIC_SHOWN_KEY, today);
    } catch {
      /* quota dépassé — l'oubli de la clé est sans gravité */
    }
    setIsDeclicOverlayOpen(false);
  };

  // SM-2 Spaced Repetition flashcard rating callback
  const handleRateCard = (cardId: string, rating: 'again' | 'hard' | 'good' | 'easy') => {
    // Reward points based on effort rating
    const pointsAwarded = rating === 'easy' ? 15 : rating === 'good' ? 10 : rating === 'hard' ? 5 : 2;
    
    const updatedStats = { ...progress.flashcardStats };
    updatedStats[rating] += 1;

    // Advance study minutes
    const addedMinutes = Math.floor(Math.random() * 3) + 2; // 2-4 minutes

    // H3 : objectif du jour + série, par la porte unique.
    const objectifAtteintAvant = progress.dailyGoals?.completedToday === true;
    const r = appliquerActiviteQuotidienne(progress, { minutes: addedMinutes, questions: 1 });
    const updatedProgress: UserProgress = {
      ...r.progress,
      xp: progress.xp + pointsAwarded,
      studyMinutes: progress.studyMinutes + addedMinutes,
      flashcardStats: updatedStats
    };

    setProgress(updatedProgress);
    saveToLocalStorage(units, flashcards, updatedProgress);
    updateLastStudyTime();

    if (r.palier) playStreakMilestoneSound(r.palier);
    if (r.progress.dailyGoals!.completedToday && !objectifAtteintAvant) {
      playDailyGoalCelebrationSound();
    } else {
      playXPGainSound();
    }
  };

  const [activeUnitPortalId, setActiveUnitPortalId] = useState<number | null>(null);
  const [activeCombatChallenge, setActiveCombatChallenge] = useState<{id: string, title: string, mode: 'coach'|'sprint'} | null>(null);

  // Questions « à trous » : chargées hors du bundle d'entrée (M7).
  const [questionsATrous, setQuestionsATrous] = useState<QuestionATrous[] | null>(() => peekFillBlanks());

  /**
   * Ouvre le quiz en s'assurant que les questions à trous sont là.
   *
   * Pourquoi ATTENDRE plutôt qu'ouvrir tout de suite : si le quiz s'ouvrait sans
   * elles puis les recevait une seconde plus tard, la liste de questions
   * changerait SOUS les yeux de l'élève (nombre de questions, progression). Le
   * préchargement au repos fait que, en pratique, ce chemin est synchrone.
   * Et si le morceau est injoignable (hors ligne), le quiz s'ouvre QUAND MÊME,
   * avec le seul corpus QCM : jamais un bouton sans effet.
   */
  const ouvrirQuiz = (unitId: number) => {
    const deja = peekFillBlanks();
    if (deja) {
      setQuestionsATrous(deja);
      setActiveQuizUnitId(unitId);
      return;
    }
    chargerFillBlanks()
      .then(setQuestionsATrous)
      .catch(() => {
        /* hors ligne : on ouvre le quiz avec le corpus seul */
      })
      .finally(() => setActiveQuizUnitId(unitId));
  };

  // Launching and finishing Quiz callback
  const handleLaunchQuiz = (unitId: number) => {
    // Update last studied timestamp on the unit
    const updatedUnits = units.map(u => u.id === unitId ? { ...u, lastStudiedTimestamp: Date.now() } : u);
    setUnits(updatedUnits);
    saveToLocalStorage(updatedUnits, flashcards, progress);
    updateLastStudyTime();

    // Le corpus peut ne pas être encore là (chargement différé) : on le
    // demande AVANT d'ouvrir le quiz, et l'écran s'actualise dès son arrivée.
    void loadCorpus().then(({ questions }) => setCorpusQuestions(questions));

    // Show portal for Unit 1 instead of launching quiz directly
    if (unitId === 1) {
      setActiveUnitPortalId(unitId);
    } else {
      ouvrirQuiz(unitId);
    }
  };

  // Unité présélectionnée dans المراجعة الذكية (tuile « ثغرة خطيرة », SmartReminderCard).
  const [selectedRevisionUnitId, setSelectedRevisionUnitId] = useState<number>(1);

  const handleLaunchRevision = (unitId: number) => {
    setSelectedRevisionUnit(unitId);
  };

  const setSelectedRevisionUnit = (unitId: number) => {
    setSelectedRevisionUnitId(unitId);
    setCurrentTab('review');
  };

  // XP gagnés dans le المرشد الذكي (tutor) — même patron que handleQuizComplete :
  // incrément XP + questions comptées + son, persisté immédiatement.
  const handleTutorXPGained = (
    xpGained: number,
    questionsAnswered: number,
    details?: { kind?: 'quiz' | 'mission'; score?: number; total?: number; domain?: string }
  ) => {
    // H3 : le travail du tutor compte désormais dans l'objectif du jour et dans
    // la série. Avant, un élève pouvait passer une heure dans المرشد الذكي —
    // mission quotidienne comprise — et lire « 0 دقيقة » sur son tableau de bord.
    const r = appliquerActiviteQuotidienne(progress, {
      questions: questionsAnswered,
      minutes: estimationMinutesQuiz(questionsAnswered),
    });
    const updatedProgress: UserProgress = {
      ...r.progress,
      xp: progress.xp + xpGained,
      completedQuestionsCount: progress.completedQuestionsCount + questionsAnswered,
    };
    setProgress(updatedProgress);
    saveToLocalStorage(units, flashcards, updatedProgress);
    if (r.palier) playStreakMilestoneSound(r.palier);
    playXPGainSound();

    // Rec #2 de l'audit المرشد : le travail du tutor part AUSSI dans la file
    // serveur (/api/student/sync → table activities → dashboard enseignant),
    // au lieu de rester confiné au localStorage.
    if (details && (details.total ?? 0) > 0) {
      import('./utils/studentAccount').then(({ logTutorActivity }) => {
        logTutorActivity(details.kind ?? 'quiz', details.score ?? 0, details.total ?? 0, details.domain ?? '');
      });
    }
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
    if (activeQuizUnitId !== null && percent >= 60 && activeQuizUnitId < units.length) {
      const nextId = activeQuizUnitId + 1;
      updatedUnits[nextId - 1].isLocked = false;
    }

    const updatedHistory = [
      ...progress.quizScoreHistory,
      {
        date: new Date().toLocaleDateString(AR_LATN),
        score,
        total,
        unitTitle: activeUnit.title
      }
    ];

    // H3 : objectif du jour + série, par la porte unique. La durée d'un quiz
    // reste une ESTIMATION (1,5 min/question) — la même que celle du tuteur.
    const objectifAtteintAvant = progress.dailyGoals?.completedToday === true;
    const quizMinutesEstimated = estimationMinutesQuiz(total);
    const r = appliquerActiviteQuotidienne(progress, { minutes: quizMinutesEstimated, questions: total });

    const updatedProgress: UserProgress = {
      ...r.progress,
      xp: progress.xp + xpRewarded,
      studyMinutes: progress.studyMinutes + quizMinutesEstimated,
      completedQuestionsCount: progress.completedQuestionsCount + total,
      quizScoreHistory: updatedHistory,
      completedUnits: percent >= 80 ? [...new Set([...progress.completedUnits, activeUnit.id])] : progress.completedUnits
    };

    setUnits(updatedUnits);
    setProgress(updatedProgress);
    saveToLocalStorage(updatedUnits, flashcards, updatedProgress);
    updateLastStudyTime();
    // Audit Capitaine §6.2 : la bulle se recalcule après un travail réel mesuré.
    setSignalBulle((s) => s + 1);

    // Lot 0022: log quiz activity for teacher dashboard
    const unit = units.find((u) => u.id === activeQuizUnitId);
    if (activeQuizUnitId !== null) {
      import('./utils/studentAccount').then(({ logQuizActivity }) => {
        logQuizActivity(activeQuizUnitId, score, total, unit?.title || 'quiz');
      });
    }

    if (r.palier) playStreakMilestoneSound(r.palier);
    if (r.progress.dailyGoals!.completedToday && !objectifAtteintAvant) {
      playDailyGoalCelebrationSound();
    } else {
      playXPGainSound();
    }
  };

  // Audit Capitaine §2 (2026-10-17) : le résultat de اختبار الكتاب (QCM du
  // livre, ouvert depuis le جسر du parcours) est PERSISTÉ avec `source: 'livre'`
  // + `chapitre`. scoreQcmUnite (جسر) ne les lit pas (aucun score d'un autre
  // quiz réutilisé silencieusement comme note de l'unité) ; scoreLivreUnite
  // (parcoursMeta) agrège par unité et alimente le diagnostic du coach.
  const enregistrerScoreLivre = (res: { unitId: number; score: number; total: number; chapitre: number }) => {
    const unite = INITIAL_UNITS[res.unitId - 1];
    if (!unite) return;
    const updatedProgress: UserProgress = {
      ...progress,
      quizScoreHistory: [
        ...progress.quizScoreHistory,
        {
          date: new Date().toLocaleDateString(AR_LATN),
          score: res.score,
          total: res.total,
          unitTitle: unite.title,
          source: 'livre',
          chapitre: res.chapitre,
        },
      ],
    };
    setProgress(updatedProgress);
    saveToLocalStorage(units, flashcards, updatedProgress);

    // Audit Capitaine §4.2 : une restitution MESURÉE pour cette unité (le
    // score du livre) clôt la revue J+14 éventuellement échue du جسر —
    // l'échéance repart à J+14 et le drapeau fragile suit la mesure
    // (échec < seuil → re-priorisé). Un score absent ne clôt rien.
    replanifierRevue(`parcours:u${res.unitId}:jalon`, res.total > 0 && res.score / res.total < SEUIL_FRAGILE);
    // §6.2 : la bulle se recalcule après un travail réel mesuré.
    setSignalBulle((s) => s + 1);
  };
  if (activeCombatChallenge) {
    // Épreuve officielle bac2025 : la boucle élève de bout en bout (Pierre 2).
    if (activeCombatChallenge.id === 'bac-2025-sujets') {
      return <Bac2025ExamView onClose={() => setActiveCombatChallenge(null)} />;
    }
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
          ouvrirQuiz(activeUnitPortalId);
          setActiveUnitPortalId(null);
        }}
      />
    );
  }

  if (activeQuizUnitId !== null) {
    const activeUnit = units.find(u => u.id === activeQuizUnitId);
    // S-C4 : on réintègre les micro-tests « remplir le trou » (161 questions
    // à trous d'origine Flutter, jusqu'ici définies mais jamais câblées).
    // M7 : elles arrivent du chargeur différé, pas du bundle d'entrée.
    const fillBlankQuestions: QuizQuestion[] = versQuizQuestions(questionsATrous ?? [], activeQuizUnitId);
    const corpus = corpusQuestions.length > 0 ? corpusQuestions : (peekCorpus()?.questions ?? []);
    const questions = [
      ...corpus.filter(q => q.unitId === activeQuizUnitId),
      ...fillBlankQuestions,
    ];

    return (
      <QuizView 
        unitId={activeQuizUnitId}
        unitTitle={activeUnit ? activeUnit.title : ''}
        questions={questions.length > 0 ? questions : corpus}
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

  // U1 (audits Opus 5.5 / Gemini 3.8) : navigation principale consolidée 12 → 5.
  // Les vues secondaires restent accessibles à un clic (groupe « المزيد »)
  // et par les cartes du tableau de bord (onNavigateToTab).
  //
  // 2026-10-11 — restructuration en 5 rubriques principales, UNE par objectif :
  //   الرئيسية (que faire maintenant ?) → الدروس (comprendre) →
  //   التمارين والتدريب (produire une réponse) → المراجعة (consolider) → أنا
  //   (suivre). Chaque rubrique porte ses espaces dans un hub dédié
  //   (src/data/trainingHub.ts, src/data/revisionHub.ts) : plus de menu
  //   « المزيد » fourre-tout, et un seul emplacement principal par fonction.
  //   « المرشد » quitte CETTE barre : il devient un assistant contextuel
  //   accessible depuis n'importe quelle rubrique via le bouton flottant
  //   « fab-morchid » — une rubrique ne peut pas contenir à la fois la
  //   mission, le diagnostic, le défi et les résumés.
  //   Rappel des départs précédents (principes conservés, jamais supprimés) :
  //   « البكالوريا » (2026-10-09), « مسار تعلمك » (moteur parcours intact,
  //   compteur + leçon suggérée en tête de « الدرس الرسمي »), « تقدمي » et les
  //   raccourcis « أنا » (voir src/data/moiRaccourcis.ts).
  const PRIMARY_NAV: { tab: typeof currentTab; label: string; fr: string; Icon: LucideIcon }[] = [
    { tab: 'home', label: 'الرئيسية', fr: 'Accueil', Icon: Home },
    { tab: 'lesson', label: 'الدروس', fr: 'Apprendre', Icon: BookOpen },
    { tab: 'training', label: 'التمارين والتدريب', fr: "S'entraîner", Icon: Dumbbell },
    // Phase 2, Commit C (GO 2026-10-16) : « مفتاح المنهجية » reçoit sa PROPRE
    // porte visible. La plainte expert : l'élève « ne se retrouvait plus,
    // surtout مفتاح المنهجية ». Après la Phase 1 (la porte ouvre l'atelier
    // المفتاح) et la sortie du hub التمارين — pour rester à UNE seule porte
    // (verrou PortesUniques) — le 6ᵉ portail rend l'outil permanent.
    { tab: 'methodology', label: 'المنهجية', fr: 'Méthode', Icon: Key },
    { tab: 'reviser', label: 'المراجعة', fr: 'Réviser', Icon: Layers },
    { tab: 'moi', label: 'أنا', fr: 'Moi', Icon: Sprout },
  ];
  // « المزيد » — VIDE depuis le 2026-10-12 : les deux derniers outils qu'il
  // portait ont rejoint leur rubrique d'objectif.
  //   • « المؤقّت (تركيز) » : outil transversal, pas un contenu à apprendre ni
  //     à réviser → plus une rubrique du tout. Il reste ouvert par le Déclic
  //     ( MotivationDeclic → setCurrentTab('focus') ), autrement dit au moment
  //     où l'élève s'engage à travailler — pas en errant dans un menu.
  //   • « الخرائط الذهنية » : outil de SYNTHÈSE → déplacé dans « الدروس »
  //     (Apprendre), cf. LessonsView, carte data-testid="lecons-mindmap".
  // Le tableau est gardé (structure inchangée) mais vide : le bloc « المزيد »
  // n'est plus rendu tant qu'aucun outil secondaire n'y revient.
  const SECONDARY_NAV: { tab: typeof currentTab; label: string; Icon: LucideIcon }[] = [];

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
        onLogin={(name, identifiant) => {
          // `identifiant` est le code de connexion (XXXX-XXXX) pour un compte
          // sans adresse e-mail, ou l'adresse elle-même : dans les deux cas
          // c'est ce qui identifie l'élève à l'écran.
          setStudentName(name);
          setStudentEmail(identifiant);
          try {
            localStorage.setItem(STUDENT_STORE_KEY, JSON.stringify({ name, email: identifiant }));
          } catch {
            /* stockage indisponible */
          }
        }}
      />

      {/* Dynamic Top App Bar matching Screen 2 */}
      {!isFocusMode && currentTab !== 'home' && (
        <header className="bg-[#ffffff] dark:bg-[#141916] shadow-[0_2px_12px_rgba(0,109,55,0.06)] border-b border-[#e2dabf]/40 dark:border-[#2ecc71]/10 flex flex-row-reverse justify-between items-center px-4 md:px-8 h-16 md:h-20 w-full shrink-0 z-40 select-none">
        
        {/* Left Side: Avatar block */}
        <div className="flex items-center gap-3">
          {studentEmail ? (
            <StudentAccountBar
              onOpenTeacher={() => setCurrentTab('teacher')}
              onLogout={handleStudentLogout}
            />
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
          {currentTab === 'reviser' ? 'المراجعة' :
           currentTab === 'parcours' ? 'مساري' :
           currentTab === 'review' ? 'المراجعة الذكية' :
           currentTab === 'stats' ? 'لوحة الإحصائيات' : 
           currentTab === 'badges' ? 'الأوسمة والإنجازات' : 
           currentTab === 'methodology' ? MIFTAH_NAME_OFFICIAL_AR : 
           currentTab === 'bootcamp' ? 'تحدي البكالوريا' : 
            currentTab === 'lesson' ? 'الدروس' :
            currentTab === 'workshop' ? 'الورشة التفاعلية' : 
           currentTab === 'animations' ? 'الأنميشن العلمي' :
           currentTab === 'situations' ? 'تمارين بالوضعيات' :
           currentTab === 'schemas' ? 'ارسم من الذاكرة' :
           currentTab === 'training' ? 'التمارين والتدريب' :
           currentTab === 'examens' ? 'الاختبارات' :
           currentTab === 'plan' ? 'خطة المراجعة النهائية' :
           currentTab === 'bacideas' ? 'أفكار التمارين حسب الدورة' :
           currentTab === 'focus' ? 'المؤقّت (بومودورو)' :
           currentTab === 'tadwin' ? 'التدوين الشامل' :
           currentTab === 'mindmap' ? 'الخرائط الذهنية (D3)' :
            currentTab === 'chat' ? CAPITAINE_IDENTITE_AR :
            currentTab === 'teacher' ? 'لوحة المتابعة' :
            'كنز العلوم'}
          {/*
            Le rappel est DISPONIBLE sans être imposé : c'est la différence entre
            un professeur qu'on peut réinterroger et un bandeau publicitaire.
            Le bouton n'existe que pour les rubriques qui ont réellement un
            conseil — ailleurs, il n'y a rien à rouvrir.
          */}
          {conseilCourant && (
            <button
              type="button"
              data-testid="conseil-rubrique-ouvrir"
              onClick={() => setConseilFerme((f) => !f)}
              title="نصيحة القبطان في هذه الصفحة"
              aria-label="نصيحة القبطان في هذه الصفحة"
              className="ms-2 inline-flex h-5 w-5 items-center justify-center rounded-full border border-[#006d37]/40 align-middle text-[11px] font-black text-[#006d37] transition-colors hover:bg-[#006d37] hover:text-white cursor-pointer dark:border-emerald-400/40 dark:text-emerald-300"
            >
              ؟
            </button>
          )}
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

          {/* U1 (audit Opus/Gemini) : navigation principale consolidée — 8 onglets. */}
          {PRIMARY_NAV.map(({ tab, label, fr, Icon }) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              title={`${label} · ${fr}`}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all cursor-pointer ${
                currentTab === tab
                  ? 'bg-[#e5f6ed] text-[#006d37] dark:bg-[#2ecc71]/15 dark:text-[#2ecc71]'
                  : 'text-[#504441] hover:bg-[#fff9ed] hover:text-[#006d37] dark:text-gray-300 dark:hover:bg-[#1d2620]'
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span className="min-w-0 flex-1 text-start leading-tight">{label}</span>
              <span
                dir="ltr"
                className={`shrink-0 text-[9px] font-semibold uppercase tracking-wide ${
                  currentTab === tab ? 'text-[#006d37]/70' : 'text-[#64748b]/70'
                }`}
              >
                {fr}
              </span>
            </button>
          ))}

          {/* Groupe « المزيد » — n'est rendu que s'il porte au moins une entrée.
              Vide depuis le 2026-10-12 (focus → Déclic, mindmap → الدرس). */}
          {SECONDARY_NAV.length > 0 && (
            <>
              <div className="text-[10px] font-black tracking-widest text-[#506072] uppercase px-4 mt-5 mb-3">المزيد</div>

              {SECONDARY_NAV.map(({ tab, label, Icon }) => (
                <button
                  key={tab}
                  onClick={() => handleTabChange(tab)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-[13px] font-semibold transition-all cursor-pointer ${
                    currentTab === tab
                      ? 'bg-[#2ecc71]/15 text-[#006d37]'
                      : 'text-[#504441]/80 hover:bg-[#fff9ed] hover:text-[#006d37]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </button>
              ))}
            </>
          )}
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
              {/* Suspense enveloppe l'ensemble du canevas : une seule frontière
                  suffit, puisqu'un seul onglet est monté à la fois. */}
              <ChunkErrorBoundary>
              <Suspense fallback={<VueEnChargement />}>
              {/* Hors du Suspense de l'onglet À DESSEIN : le conseil ne doit pas
                  attendre le chargement du morceau de la rubrique pour apparaître,
                  sinon il surgirait après coup, sur une page déjà commencée. */}
              {conseilCourant && !conseilFerme && !epreuveEnCours && (
                <BandeauConseilRubrique conseil={conseilCourant} onFermer={() => setConseilFerme(true)} />
              )}
              {currentTab === 'home' && (
                <DashboardView 
                  units={units}
                  progress={progress}
                  onLaunchQuiz={handleLaunchQuiz}
                  onLaunchRevision={handleLaunchRevision}
                  onNavigateToTab={setCurrentTab}
                  onUpdateDailyGoals={handleUpdateDailyGoals}
                  isDarkMode={isDarkMode}
                  onOpenLesson={ouvrirLeçonDepuisParcours}
                  onOpenQcm={ouvrirQcmDepuisParcours}
                  onOpenAuth={() => setIsAuthOpen(true)}
                  connecte={Boolean(studentName || studentEmail)}
                />
              )}

              {/* « مساري » — l'écran du parcours verrouillé (Commit A, Phase 2).
                  Les handlers existants (ouvrirLeçonDepuisParcours /
                  ouvrirQcmDepuisParcours) sont exactement les props de
                  ParcoursView : leçon par leçon, exercices liés au مجال.
                  Le retour passe par la nav permanente (sidebar / barre mobile),
                  comme pour le tableau de bord. */}
              {currentTab === 'parcours' && (
                <ParcoursView
                  onOpenLesson={ouvrirLeçonDepuisParcours}
                  onOpenQcm={ouvrirQcmDepuisParcours}
                />
              )}

              {/* Hub « الاختبارات » — sous-écran de S'entraîner. Les examens
                  proprement dits restent dans LessonsView (données et UI
                  existantes) : on les ouvre par deep-link, on ne les duplique pas. */}
              {currentTab === 'examens' && (
                <ExamensHubView
                  onOpen={(mode) => ouvrirExamen(mode)}
                  onBack={() => setCurrentTab('training')}
                />
              )}

              {/* Hub « المراجعة » — la rubrique principale. Les trois espaces
                  de consolidation sont déclarés dans src/data/revisionHub.ts. */}
              {currentTab === 'reviser' && (
                <ReviewHubView
                  onOpen={(tab) => setCurrentTab(tab)}
                  onBackToHome={() => setCurrentTab('home')}
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
                  initialUnitId={selectedRevisionUnitId}
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
                  onXPGained={handleTutorXPGained}
                  questionInitiale={morchidSeed}
                  onQuestionInitialeConsumed={() => setMorchidSeed(null)}
                  /* Audit Capitaine §1 (2026-10-17) : « اشرح <unité> » ouvre
                     la leçon réelle (mêmes handlers que مساري). */
                  onOuvrirLeconDuCoach={ouvrirLeçonDepuisParcours}
                />
              )}

              {currentTab === 'tadwin' && (
                <TadwinView onBackToHome={() => setCurrentTab('home')} />
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
                <LessonsView
                  onRateCard={handleRateCard}
                  initialLesson={parcoursLesson ?? undefined}
                  initialQcm={parcoursQcm ?? undefined}
                  initialMode={parcoursMode ?? undefined}
                  onDeepLinkConsumed={() => { setParcoursLesson(null); setParcoursQcm(null); setParcoursMode(null); }}
                  onOpenTab={(tab) => setCurrentTab(tab as typeof currentTab)}
                  /* Audit Capitaine §2 : le score de اختبار الكتاب atteint
                     enfin quizScoreHistory (source: 'livre', par chapitre). */
                  onScoreLivre={enregistrerScoreLivre}
                />
              )}

              {currentTab === 'moi' && (
                <MoiView
                  nomEleve={studentName}
                  courriel={studentEmail}
                  onOuvrir={(onglet) => handleTabChange(onglet)}
                />
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

              {currentTab === 'animations' && (
                <AnimationsView onBackToHome={() => setCurrentTab('training')} />
              )}

              {currentTab === 'training' && (
                <TrainingHubView
                  onOpen={(tab) => setCurrentTab(tab)}
                  onBackToHome={() => setCurrentTab('home')}
                />
              )}

              {currentTab === 'plan' && (
                <RevisionPlanView
                  onBackToHome={() => setCurrentTab('training')}
                  onOpenRedaction={(ideaId) => {
                    setBacIdeaFocus(ideaId);
                    setCurrentTab('bacideas');
                  }}
                />
              )}

              {currentTab === 'bacideas' && (
                <BacIdeasView
                  onBackToHome={() => setCurrentTab('training')}
                  focusIdeaId={bacIdeaFocus}
                />
              )}

              {currentTab === 'situations' && (
                <SituationBankView onBackToHome={() => setCurrentTab('training')} />
              )}

              {currentTab === 'schemas' && (
                <SchemaDrillView onBackToHome={() => setCurrentTab('training')} />
              )}

              {currentTab === 'focus' && (
                <FocusTimer isDarkMode={isDarkMode} onFocusComplete={addStudyMinutes} />
              )}
              </Suspense>
              </ChunkErrorBoundary>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Déclic de motivation — une fois par jour, par-dessus le tableau de
          bord. Enchaînement visé : Déclic (déclencher) → Focus (tenir) →
          Révision (agir). cf. docs/INTEGRATION_FOCUS_MOTIVATION.md §2. */}
      {isDeclicOverlayOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          data-testid="declic-overlay"
          onClick={closeDeclicOverlay}
        >
          <div className="w-full max-w-xl" onClick={(e) => e.stopPropagation()}>
            <Suspense fallback={<VueEnChargement />}>
              <MotivationDeclic
                isDarkMode={isDarkMode}
                streakDays={serieAfficheeDepuisDaily(progress.dailyGoals)}
                onStart={() => {
                  closeDeclicOverlay();
                  updateLastStudyTime();
                  setCurrentTab('review');
                }}
                onStartFocus={() => {
                  closeDeclicOverlay();
                  setCurrentTab('focus');
                }}
              />
            </Suspense>
            <div className="mt-3 flex justify-center">
              <button
                type="button"
                onClick={closeDeclicOverlay}
                className="text-sm font-bold text-white/80 hover:text-white underline-offset-2 cursor-pointer"
              >
                ليس الآن
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Barre mobile : les 4 piliers OPUS 5.5 + nos accès (8 au total).
          Style repris des photos : icône + label AR + label FR, pastille
          active vert pâle. `min-w-0` + `truncate` : 8 colonnes doivent tenir
          dans 360px sans déborder. */}
      {!isFocusMode && (
        <nav className="md:hidden bg-[#f8fbfa] dark:bg-[#141916] shadow-[0_-5px_15px_rgba(0,0,0,0.05)] shrink-0 h-[80px] z-40 flex items-center gap-0.5 px-0.5 pb-2 rounded-t-[24px] select-none border-t border-[#e2e8e0]/50 dark:border-[#2ecc71]/10" dir="rtl">

        {PRIMARY_NAV.map(({ tab, label, fr, Icon }) => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
            title={`${label} · ${fr}`}
            className={`relative flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl px-0 transition-all h-[64px] cursor-pointer ${
              currentTab === tab
                ? 'bg-[#e5f6ed] text-[#006d37] dark:bg-[#2ecc71]/15 dark:text-[#2ecc71]'
                : 'text-[#64748b] hover:text-[#006d37] dark:text-gray-400'
            }`}
          >
            <Icon className="w-5 h-5 shrink-0" />
            <span className="w-full truncate text-center text-[9px] font-bold leading-tight">
              {label}
            </span>
            <span
              dir="ltr"
              className="w-full truncate text-center text-[7.5px] font-semibold leading-none opacity-70"
            >
              {fr}
            </span>
            {currentTab === tab && <div className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-[#006d37] dark:bg-[#2ecc71]"></div>}
          </button>
        ))}

      </nav>
      )}

      {/* Assistant contextuel « المرشد الذكي ». Depuis la restructuration du
          2026-10-11 il n'est plus une rubrique de la barre : un bouton
          flottant l'ouvre depuis N'IMPORTE quelle rubrique — cours
          (« explique-moi cette notion »), exercice, correction, accueil.
          Masqué dans la vue elle-même, sur le splash et en mode focus. */}
      {/*
        LE GUIDE SE TAIT PENDANT L'ÉPREUVE. Sans `!epreuveEnCours`, l'élève
        pouvait ouvrir le المرشد au milieu d'une épreuve chronométrée de 4 h 30
        et lui demander la réponse — ce qui annule la simulation. L'épreuve
        affiche sa propre explication de ce silence (MockExamPanel).
      */}
      {!isFocusMode && !epreuveEnCours && currentTab !== 'chat' && (
        <div className="fixed bottom-24 left-4 z-40 md:bottom-8 flex flex-col items-start gap-2">
          {/*
            LA BULLE PARLE AU BON MOMENT, PAS EN PERMANENCE (loi 1). Un signal
            toujours présent n'est plus un signal : c'est le mur du fond qui
            disparaît. Quand il n'y a rien à dire, la bulle n'existe pas — il
            reste le bouton, qu'un clic ouvre.
          */}
          {invitation && (
            <div
              data-testid="bulle-capitaine"
              dir="rtl"
              className="max-w-[17rem] rounded-2xl rounded-bl-sm border border-[#006d37]/25 bg-white p-3 shadow-lg dark:border-emerald-400/25 dark:bg-[#121614]"
            >
              <p className="text-[11px] font-black text-[#006d37] dark:text-emerald-300">{CAPITAINE_IDENTITE_AR}</p>
              <p className="mt-1 text-[12px] font-bold leading-relaxed text-[#1f2b24] dark:text-gray-100">
                {invitation.messageAr}
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-[#506072] dark:text-gray-300">{invitation.actionAr}</p>
              {/* Loi 4 : la récompense immédiate est nommée, jamais différée. */}
              <p className="mt-1 text-[10px] font-bold text-[#006d37] dark:text-emerald-400">{invitation.gainImmediatAr}</p>
              <div className="mt-2 flex items-center gap-2">
                <button
                  type="button"
                  data-testid="bulle-capitaine-agir"
                  onClick={() => {
                    // L'intention est mémorisée AVANT d'aller à l'écran : c'est
                    // elle qui distingue, dans la boucle du coach, « il n'a pas
                    // vu » de « il a vu et n'a pas pu ». Le travail, lui, ne
                    // sera crédité que s'il a réellement lieu (et c'est
                    // `activiteQuotidienne` qui en décide, pas ce clic).
                    accepter();
                    setCurrentTab(invitation.cible);
                  }}
                  className="rounded-xl bg-[#006d37] px-3 py-1.5 text-[11px] font-black text-white cursor-pointer"
                >
                  {invitation.actionAr}
                </button>
                <button
                  type="button"
                  data-testid="bulle-capitaine-fermer"
                  onClick={ignorer}
                  aria-label="إغلاق"
                  className="rounded-xl border border-black/10 px-2.5 py-1.5 text-[11px] font-bold text-[#506072] dark:border-white/10 dark:text-gray-300 cursor-pointer"
                >
                  لاحقًا
                </button>
              </div>
            </div>
          )}
          {/*
            LE RELAIS HUMAIN (§5.D, étape 5). Il n'est pas une invitation de plus :
            quand il parle, la bulle se tait (`invitationDuMoment` rend `null`), donc
            une seule voix s'adresse à l'élève. Rien ne sort de l'appareil — le nom
            est écrit en local, et il s'efface d'un geste.
          */}
          <RelaisCapitaine question={relais} onFait={rafraichir} />
          {/*
            LE BOUTON RESTE ROND — c'est le repère (14/10/2026, demande
            explicite). Ce qui change : la boussole cède la place au VISAGE du
            personnage, qui devient ainsi reconnaissable dans toute
            l'application et pas seulement dans sa rubrique.

            Fond crème et anneau vert plutôt que le vert plein d'avant : mesuré
            à l'écran, le chapeau marron du personnage se confondait avec le vert
            sombre, et le visage perdait sa lisibilité à 56 px. Le crème
            (#fff9ed) est déjà une couleur de la charte.
          */}
          <button
            type="button"
            data-testid="fab-morchid"
            onClick={() => setCurrentTab('chat')}
            title={CAPITAINE_IDENTITE_AR}
            aria-label={CAPITAINE_IDENTITE_AR}
            className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border-2 border-[#006d37] bg-[#fff9ed] shadow-lg shadow-[#006d37]/30 transition-transform hover:scale-105 active:scale-95 cursor-pointer dark:bg-[#121614]"
          >
            <img
              src={CAPITAINE_VISAGE_URL}
              alt=""
              aria-hidden="true"
              className="h-full w-full object-cover"
            />
          </button>
        </div>
      )}
    </div>
  );
}
