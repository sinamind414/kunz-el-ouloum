import { useState, useMemo, useRef } from 'react';
import { useCompteARebours } from '../hooks/useWallClock';
import { motion, AnimatePresence } from 'motion/react';
import { X, Timer, CheckCircle2, AlertCircle, ArrowLeft, ArrowRight, RotateCcw, Award, Check, BookOpen, GraduationCap, AlertOctagon, HelpCircle, Eye, EyeOff } from 'lucide-react';
import { QuizQuestion } from '../types';
import { LIBELLES_DIFFICULTE } from '../quizCorpus';
import { playSuccessSound, playFailureSound } from '../utils/audio';
import { validateFillBlank } from '../utils/fillBlankValidate';
// Anti-triche par clé volée (14/10/2026) : les propositions changent de place à
// chaque session. `grep -o 'correctAnswerIndex:[0-9]*'` extrait encore les clés
// du paquet livré, mais « la réponse est la 2ᵉ » n'est plus vrai que pendant la
// session où la clé a été volée. `origineDe` garde l'affichage des options
// cohérent avec l'ordre d'origine des données.
import { graineSession, melangerQuestions } from '../utils/melangeOptions';
// PRODUCTEUR DE MÉMOIRE (14/10/2026, point A de l'analyse LITE) : ce QCM devient
// la source des erreurs de l'élève. Sans lui, `profilErreurs` n'était alimenté
// que par l'atelier méthodologique — un élève qui n'y va jamais gardait une
// mémoire vide à vie, et le capitaine n'avait rien à lui dire.
import { CAUSES_QCM, doitDemanderCause, QUESTION_CAUSE_AR, REMERCIEMENT_CAUSE_AR, causeParId } from '../data/diagnosticQuiz';
import { enregistrerErreurs } from '../utils/profilErreurs';
import { planifierRappelsPourErreurs } from '../lib/planificationRappels';
// TC3/H1 (audit « architecture » 19/10/2026) : chaque réponse tourne la boucle
// « erreur → reprise » — un échec rend la question due sous 24 h, et la séance
// s'ouvre sur ce qui est dû. La règle (SM-2 borné, sans intervalle inventé)
// vit ENTIRÈREMENT dans lib/memoireQuestions.ts — ici, on ne fait qu'appeler.
import { enregistrerReponseQcm, ordonnerParDues } from '../lib/memoireQuestions';

interface QuizViewProps {
  unitId: number;
  unitTitle: string;
  questions: QuizQuestion[];
  onClose: () => void;
  onQuizComplete: (score: number, total: number) => void;
}

export default function QuizView({ unitTitle, questions, onClose, onQuizComplete }: QuizViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({});
  const [isAnswered, setIsAnswered] = useState<{ [key: number]: boolean }>({});
  // Sprint 45 : le temps restant est LU sur l'horloge (useCompteARebours) et
  // non décrémenté par des ticks — un onglet mis en arrière-plan ne prolonge
  // plus le quiz.
  const DUREE_QUIZ_SEC = 900; // 15 minutes
  // Clé de relance : la changer redémarre le compte à rebours (le hook
  // repositionne l'échéance quand la durée ou l'activité change).
  const [essai, setEssai] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [score, setScore] = useState(0);
  const [isFocusMode, setIsFocusMode] = useState<boolean>(false);
  // État des questions à trou (kind === 'fillBlank') — S-C4.
  const [fbInput, setFbInput] = useState<{ [key: number]: string }>({});
  const [fbResult, setFbResult] = useState<{ [key: number]: boolean }>({});
  // Déclaration de la cause d'erreur : UNE seule question par séance, à la fin.
  const [causeDeclaree, setCauseDeclaree] = useState<string | null>(null);
  const [causeDemandee, setCauseDemandee] = useState(false);

  // ── TC3/H1 : LES QUESTIONS ACTIVES DE CETTE SÉANCE. ─────────────────────
  // À l'ouverture : les dues de la mémoire passent en tête (reprise de
  // l'échec), le reste suit. Au clic « أعد أخطائي فقط » : SEULES les ratées
  // de la séance sont rejouées. `null` tant qu'aucune reprise n'a été demandée.
  const [actives, setActives] = useState<QuizQuestion[]>(() => ordonnerParDues(questions));
  // Le crédit de progression (XP, minutes, score d'unité) ne se paie qu'UNE
  // fois : la reprise des ratées est du travail supplémentaire, pas une
  // seconde note qui écraserait la première.
  const dejaCrediteRef = useRef(false);
  // Les questions ratées de la séance qui vient de se terminer — la matière
  // de la liste de fin et du bouton de reprise.
  const [rateesSeance, setRateesSeance] = useState<QuizQuestion[]>([]);

  /**
   * Graine de la session : stable tant que l'onglet/la session vit, neuve à la
   * session suivante. Mémoïsée pour que les propositions ne se réordonnent pas
   * à chaque rendu.
   */
  const graine = useMemo(() => graineSession(), []);

  /**
   * Les questions telles que l'élève les VOIT : mêmes propositions, autre
   * ordre, clé recalculée. Le reste du composant ne connaît que cette liste —
   * c'est volontaire : une seule source d'affichage, donc aucun risque de
   * comparer une position affichée à une clé d'origine.
   */
  const vues = useMemo(
    () => melangerQuestions(actives, 'correctAnswerIndex', graine),
    [actives, graine],
  );

  const currentQuestion = vues[currentIndex] || vues[0];

  /** La réponse garde-t-elle la question fermée ? (vues et actives même index) */
  const estCorrecteReponse = (index: number): boolean => {
    const q = vues[index];
    if (!q) return false;
    return q.kind === 'fillBlank'
      ? fbResult[index] === true
      : selectedAnswers[index] === q.correctAnswerIndex;
  };

  const timeLeft = useCompteARebours({
    dureeSec: DUREE_QUIZ_SEC + essai * 0, // la dépendance utile est `actif`
    actif: !quizFinished,
    rafraichissementMs: 500,
  });

  // Format Time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOptionSelect = (optionIdx: number) => {
    if (isAnswered[currentIndex]) return; // Cannot change answer once locked/submitted

    setSelectedAnswers({
      ...selectedAnswers,
      [currentIndex]: optionIdx
    });
    setIsAnswered({
      ...isAnswered,
      [currentIndex]: true
    });

    if (optionIdx === currentQuestion.correctAnswerIndex) {
      playSuccessSound();
      setScore((prev) => prev + 1);
    } else {
      playFailureSound();
    }
  };

  const handleFbSubmit = () => {
    if (isAnswered[currentIndex] || currentQuestion.kind !== 'fillBlank') return;
    const { correct } = validateFillBlank(fbInput[currentIndex] ?? '', currentQuestion.acceptedAnswers ?? []);
    setFbResult((prev) => ({ ...prev, [currentIndex]: correct }));
    setIsAnswered((prev) => ({ ...prev, [currentIndex]: true }));
    if (correct) {
      playSuccessSound();
      setScore((prev) => prev + 1);
    } else {
      playFailureSound();
    }
  };

  const handleNext = () => {
    if (currentIndex < actives.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Fin de séance — TC3/H1 : CHAQUE réponse tourne la boucle mémoire
      // (échec → due sous 24 h ; réussite à l'échéance → intervalle allongé).
      // Un seul lieu d'écriture : ici, sur la séance complète, jamais dans les
      // handlers de clic (une réponse modifiable jusqu'au verrouillage ne
      // deviendrait un fait qu'à la fin).
      for (let i = 0; i < actives.length; i += 1) {
        const question = actives[i];
        enregistrerReponseQcm(question.id, question.unitId, estCorrecteReponse(i));
      }
      setRateesSeance(actives.filter((_, i) => !estCorrecteReponse(i)));
      // Finished quiz!
      setQuizFinished(true);
      // Le crédit (XP, minutes, score d'unité) ne se paie qu'à la PREMIÈRE
      // fin : une reprise des ratées n'est pas une seconde note.
      if (!dejaCrediteRef.current) {
        dejaCrediteRef.current = true;
        onQuizComplete(score, actives.length);
      }
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  // Option Lettering (أ, ب, ج, د)
  const optionLetters = ['أ', 'ب', 'ج', 'د'];

  // Overall Score Stats
  const scorePercentage = Math.round((score / actives.length) * 100);

  /** Nombre d'erreurs de la séance — la matière première de la déclaration. */
  const erreursQuiz = Math.max(0, actives.length - score);

  /**
   * L'élève déclare d'où vient son erreur. On enregistre ce qu'il DIT, jamais ce
   * qu'on suppose : le code vient de sa réponse, et « سبب آخر » n'enregistre
   * rien du tout. Le thème transmis est le titre de l'unité, pour que le guide
   * puisse plus tard nommer l'endroit — pas seulement le type.
   */
  const declarerCause = (id: string) => {
    const cause = causeParId(id);
    setCauseDeclaree(id);
    setCauseDemandee(true);
    if (cause?.code) {
      enregistrerErreurs([cause.code], { theme: unitTitle });
      // H1 (audit 16/10) : même pont que l'atelier. Les trois codes déclarables
      // ici n'ont pas encore de micro-reprise dans le corpus — l'appel est
      // prêt pour le jour où le corpus en couvre un, et il coûte un simple
      // lookup. Ne PAS le brancher serait recréer l'orphelin `planifierRappel`.
      planifierRappelsPourErreurs([cause.code]);
    }
  };

  return (
    // `dir` explicite (sprint 48) : l'écran héritait du `dir="rtl"` de la page,
    // ce qui suffit aujourd'hui mais casse dès qu'il est rendu dans un
    // conteneur LTR (aperçu, impression, intégration) — et l'ordre des
    // nombres et de la ponctuation devient alors illisible.
    <div dir="rtl" className={`min-h-screen transition-all duration-500 flex flex-col items-center select-none font-sans selection:bg-[#2ecc71]/20 ${
      isFocusMode 
        ? 'bg-gradient-to-b from-[#060a07] to-[#0e1411] text-gray-100' 
        : 'bg-[#f8f9fa] text-[#191c1d] dark:bg-[#0c0f0d] dark:text-gray-100'
    }`}>
      
      {/* Quiz Top App Bar - Hidden in Focus Mode */}
      {!isFocusMode && (
        <header className="bg-[#ffffff] dark:bg-[#141916] shadow-sm border-b border-[#bbcbbb]/20 dark:border-[#2ecc71]/10 w-full fixed top-0 z-50 h-16 flex items-center justify-between px-6">
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-[#f3f4f5] dark:hover:bg-zinc-800 flex items-center justify-center text-[#006d37] dark:text-[#2ecc71] transition-colors cursor-pointer"
            title="إغلاق التمرين"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="font-bold text-lg md:text-xl text-[#006d37] dark:text-[#2ecc71] text-center flex-1 pr-4">
            علوم الطبيعة والحياة • {unitTitle}
          </div>

          <div className="flex items-center gap-2">
            {/* Focus Mode button */}
            <button
              onClick={() => setIsFocusMode(true)}
              className="p-2 rounded-full bg-[#f3f4f5] dark:bg-zinc-800 text-[#006d37] dark:text-[#2ecc71] hover:bg-[#fed65b]/20 transition-all cursor-pointer flex items-center justify-center border border-transparent hover:border-[#006d37]/20"
              title="تفعيل وضع التركيز"
              id="quiz-focus-toggle-header"
            >
              <Eye className="w-5 h-5" />
            </button>
          </div>
        </header>
      )}

      {/* Focus Mode Header Overlay */}
      {isFocusMode && !quizFinished && (
        <div className="w-full max-w-2xl px-4 md:px-0 mt-6 flex items-center justify-between bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 px-4 py-3 text-white shadow-lg animate-fadeIn text-right">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2ecc71] animate-ping" />
            <span className="text-xs font-bold text-gray-200">وضع التركيز نشط</span>
          </div>

          <div className="text-xs font-extrabold text-[#fed65b] line-clamp-1">
            علوم الطبيعة • {unitTitle}
          </div>

          <button
            onClick={() => setIsFocusMode(false)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#006d37] hover:bg-[#008f47] text-white text-xs font-extrabold transition-all cursor-pointer shadow-sm"
            id="quiz-exit-focus-btn"
          >
            <EyeOff className="w-3.5 h-3.5" />
            <span>إلغاء التركيز</span>
          </button>
        </div>
      )}

      {/* Main Container */}
      <main className={`w-full max-w-2xl px-4 md:px-0 pb-28 flex-1 flex flex-col gap-6 transition-all duration-500 ${isFocusMode && !quizFinished ? 'pt-8' : 'pt-24'}`}>
        
        {!quizFinished ? (
          <>
            {/* Progress and Timer Section */}
            <section className="flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-sm text-[#506072]">
                  السؤال {currentIndex + 1} من {actives.length}
                </span>
                
                {/* Timer Badge */}
                <div className="flex items-center gap-1.5 text-[#ba1a1a] font-bold text-sm bg-[#ffdad6] px-3.5 py-1.5 rounded-full shadow-sm animate-pulse">
                  <Timer className="w-4 h-4 text-[#ba1a1a] fill-current text-white" />
                  <span className="font-mono">{formatTime(timeLeft)}</span>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-[#e1e3e4] h-2.5 rounded-full overflow-hidden border border-[#bbcbbb]/10">
                <div 
                  className="bg-[#006d37] h-full rounded-full transition-all duration-300" 
                  style={{ width: `${((currentIndex + 1) / actives.length) * 100}%` }}
                />
              </div>
            </section>

            {/* Question Card Content */}
            <AnimatePresence mode="wait">
              <motion.section 
                key={currentIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className={`transition-all duration-300 rounded-3xl p-6 flex flex-col gap-5 ${
                  isFocusMode 
                    ? 'bg-[#121714] border-[#006d37]/30 shadow-[0_8px_32px_rgba(0,0,0,0.5)] text-white' 
                    : 'bg-[#ffffff] dark:bg-[#141916] border-[#e2dabf]/50 dark:border-[#2ecc71]/10 shadow-[0_4px_24px_rgba(0,109,55,0.04)] text-[#191c1d] dark:text-gray-100'
                }`}
              >
                {/* Diagram Area if available */}
                {currentQuestion.diagramUrl && (
                  <div className={`w-full rounded-2xl p-4 flex flex-col items-center justify-center border relative overflow-hidden group transition-colors ${
                    isFocusMode ? 'bg-black/40 border-[#006d37]/20' : 'bg-[#f3f4f5] dark:bg-black/20 border-[#bbcbbb]/30 dark:border-[#2ecc71]/10'
                  }`}>
                    <div className="absolute top-2 right-2 bg-[#ffffff]/80 dark:bg-black/60 backdrop-blur-sm px-2 py-1 rounded-lg text-[10px] text-[#506072] dark:text-gray-300 font-semibold flex items-center gap-1 border border-[#bbcbbb]/10">
                      <GraduationCap className="w-3.5 h-3.5 text-[#006d37] dark:text-[#2ecc71]" />
                      <span>رسم تخطيطي توضيحي</span>
                    </div>
                    <img 
                      className={`object-contain max-h-[220px] w-full select-none ${isFocusMode ? '' : 'mix-blend-multiply'}`} 
                      src={currentQuestion.diagramUrl} 
                      alt="Biology Diagram"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}

                {/* Question Text & General Hint Trigger */}
                <div className="flex flex-col gap-2">
                  {/* M3 (audit 8 axes) — étiquetage de difficulté : chaque QCM
                      affiche désormais son palier (donnée dérivée des segments
                      D1/D2/D3, jamais inventée). Les fillBlank n'en ont pas. */}
                  {currentQuestion.difficulte && (
                    <div className="flex">
                      <span
                        title="مستوى صعوبة السؤال"
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${
                          currentQuestion.difficulte === 1
                            ? (isFocusMode
                                ? 'bg-white/5 text-gray-300 border-white/10'
                                : 'bg-[#f3f4f5] text-[#506072] border-[#bbcbbb]/40')
                            : currentQuestion.difficulte === 2
                              ? (isFocusMode
                                  ? 'bg-[#006d37]/20 text-[#2ecc71] border-[#006d37]/30'
                                  : 'bg-[#fff9ed] text-[#006d37] border-[#006d37]/40')
                              : (isFocusMode
                                  ? 'bg-[#ba1a1a]/20 text-[#ff8a80] border-[#ba1a1a]/30'
                                  : 'bg-[#fdecec] text-[#ba1a1a] border-[#ba1a1a]/40')
                        }`}
                      >
                        صعوبة: {LIBELLES_DIFFICULTE[currentQuestion.difficulte]}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-start gap-4 text-right">
                    <h2 className={`text-xl font-bold leading-relaxed flex-1 ${isFocusMode ? 'text-gray-100' : 'text-[#1f1c0b] dark:text-gray-100'}`}>
                      {currentQuestion.questionText}
                    </h2>
                  </div>

                  {/* H2 (audit coach 18/10/2026) : le faux confort « طلب تلميح »
                      est supprimé. La bulle générique (« اقرأ السؤال بتأنٍ… »)
                      s'affichait pour 544 questions sur 531 servies : du rempli-
                      sage qui ressemblait à de l'aide. L'aide réelle de CE
                      panneau est l'explication de la question courante —
                      affichée intégralement après la réponse, et toujours
                      disponible via l'écran du المرشد. */}
                </div>

                {/* H2 (audit coach 18/10/2026) : les DEUX boutons « المرشد » du
                    quiz sont retirés. Mesure de l'audit (s_quiz, s_quiz_indice) :
                    ils ouvraient l'onglet chat EN ARRIÈRE-PLAN — App rend le
                    quiz en priorité, donc RIEN n'apparaissait, et la question
                    pré-remplie attendait la fin du quiz. Le bouton « لماذا
                    إجابتي خاطئة؟ » est doublé par l'explication affichée
                    en ligne juste après la réponse (H2 : « afficher à sa place
                    l'explication de cette question, sans quitter le quiz »).
                    Les points d'entrée hors-quiz du maillage contextuel
                    (leçons, flashcards, situations, schémas) ne sont pas touchés. */}

                {/* Question à trou (S-C4) : input + validation tolérante */}
                {/* QCM (par défaut) ou question à trou (S-C4) selon le type */}
                {currentQuestion.kind === 'fillBlank' ? (
                  <div className="flex flex-col gap-3">
                    <div className={`flex items-center gap-2 rounded-2xl p-2 border ${
                      isFocusMode ? 'bg-black/30 border-[#006d37]/20' : 'bg-[#f3f4f5] dark:bg-black/20 border-[#bbcbbb]/30 dark:border-[#2ecc71]/10'
                    }`}>
                      <input
                        dir="rtl"
                        value={fbInput[currentIndex] ?? ''}
                        onChange={(e) => setFbInput((prev) => ({ ...prev, [currentIndex]: e.target.value }))}
                        disabled={isAnswered[currentIndex]}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleFbSubmit(); }}
                        placeholder="اكتب إجابتك هنا..."
                        aria-label="فراغ الإجابة"
                        className={`flex-1 bg-transparent focus:outline-none text-right text-base font-bold p-2 ${
                          isFocusMode ? 'text-gray-100' : 'text-[#1f1c0b] dark:text-gray-100'
                        } ${isAnswered[currentIndex] ? (fbResult[currentIndex] ? 'text-[#006d37] dark:text-[#2ecc71]' : 'text-[#ba1a1a]') : ''}`}
                      />
                      {!isAnswered[currentIndex] && (
                        <button
                          onClick={handleFbSubmit}
                          disabled={(fbInput[currentIndex] ?? '').trim().length === 0}
                          className="shrink-0 bg-[#006d37] text-white font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-[#00562b] active:scale-95 transition-all disabled:opacity-40 cursor-pointer"
                        >
                          تحقّق
                        </button>
                      )}
                    </div>
                    {isAnswered[currentIndex] && (
                      <span className={`text-sm font-bold flex items-center gap-2 ${fbResult[currentIndex] ? 'text-[#006d37] dark:text-[#2ecc71]' : 'text-[#ba1a1a]'}`}>
                        {fbResult[currentIndex] ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                        {fbResult[currentIndex] ? 'إجابة صحيحة' : 'إجابة غير مكتملة — راجع التصحيح أدناه'}
                      </span>
                    )}
                  </div>
                ) : (
                <div className="flex flex-col gap-3">
                  {currentQuestion.options.map((option, idx) => {
                    const isSelected = selectedAnswers[currentIndex] === idx;
                    const isCorrect = currentQuestion.correctAnswerIndex === idx;
                    const hasAnswered = isAnswered[currentIndex];

                    // Class calculation based on state
                    let buttonClass = isFocusMode 
                      ? "border-white/10 bg-[#161c18] hover:bg-[#1a251e] text-white" 
                      : "border-[#e2dabf] bg-[#ffffff] hover:bg-[#fcf3d8]/20 dark:bg-[#1a221d] dark:hover:bg-[#202c25] dark:border-zinc-800";
                    let letterClass = isFocusMode 
                      ? "border-white/20 text-gray-300" 
                      : "border-[#e2dabf] text-[#506072] group-hover:border-[#006d37] group-hover:text-[#006d37] dark:border-zinc-700 dark:text-zinc-300";
                    let showIcon = null;

                    if (hasAnswered) {
                      if (isCorrect) {
                        // Correct option
                        buttonClass = "border-2 border-[#2ecc71] bg-[#2ecc71]/10 text-white shadow-sm";
                        letterClass = "bg-[#2ecc71] text-[#ffffff] border-[#2ecc71]";
                        showIcon = <Check className="w-5 h-5 text-[#2ecc71] stroke-[3]" />;
                      } else if (isSelected) {
                        // User selected wrong option
                        buttonClass = "border-2 border-[#ba1a1a] bg-[#ba1a1a]/10 text-white";
                        letterClass = "bg-[#ba1a1a] text-[#ffffff] border-[#ba1a1a]";
                        showIcon = <AlertCircle className="w-5 h-5 text-[#ba1a1a]" />;
                      } else {
                        // Unselected wrong options
                        buttonClass = isFocusMode 
                          ? "border-white/5 bg-[#161c18] opacity-30 text-gray-400" 
                          : "border-[#e2dabf]/50 bg-[#ffffff] dark:bg-[#141916] opacity-60 text-gray-500";
                        letterClass = isFocusMode 
                          ? "border-white/5 text-gray-500" 
                          : "border-[#e2dabf]/50 text-[#506072]/50";
                      }
                    } else if (isSelected) {
                      // Selected but not confirmed? We submit on select, so this state is transitionary
                      buttonClass = "border-2 border-[#006d37] dark:border-[#2ecc71] bg-[#006d37]/10 text-white";
                    }

                    return (
                      <motion.button
                        key={idx}
                        disabled={hasAnswered}
                        onClick={() => handleOptionSelect(idx)}
                        whileTap={{ scale: hasAnswered ? 1 : 0.99 }}
                        className={`flex items-center justify-start p-4 rounded-2xl border transition-all duration-300 w-full text-right group cursor-pointer ${buttonClass}`}
                      >
                        {/* Option Letter Bullet */}
                        <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold text-sm ml-4 transition-colors ${letterClass}`}>
                          {optionLetters[idx]}
                        </div>
                        
                        {/* Option Text */}
                        <span className={`text-base flex-1 ${hasAnswered && isCorrect ? (isFocusMode ? 'text-[#2ecc71] font-bold' : 'text-[#006d37] font-bold') : (isFocusMode ? 'text-gray-200' : 'text-[#1f1c0b] dark:text-gray-200')}`}>
                          {option}
                        </span>

                        {/* Status Icon */}
                        {showIcon}
                      </motion.button>
                    );
                  })}
                </div>
                )}

                {/* Explanation Card (Pedagogical Feedback) */}
                {isAnswered[currentIndex] && (
                  // M5 (2026-10-17) : le feedback est ANNONCÉ — un lecteur
                  // d'écran ne devine pas qu'un bloc est apparu.
                  <div className="space-y-4" aria-live="polite">
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`rounded-2xl p-4 border text-sm space-y-2 text-right ${
                        isFocusMode 
                          ? 'bg-black/30 border-[#006d37]/20 text-gray-200' 
                          : 'bg-[#fff9ed] dark:bg-[#1a221d] border-[#fed65b]/50 dark:border-[#2ecc71]/20 text-[#504441] dark:text-gray-200'
                      }`}
                    >
                      <div className={`flex items-center gap-2 font-bold ${
                        isFocusMode ? 'text-[#2ecc71]' : 'text-[#944a00] dark:text-[#2ecc71]'
                      }`}>
                        <BookOpen className="w-4 h-4" />
                        <span>الشرح والمبرر العلمي:</span>
                      </div>
                      <p className="leading-relaxed">
                        {currentQuestion.explanation}
                      </p>
                    </motion.div>

                    {/* H2 (audit coach 18/10/2026) : le faux panneau « تحليل
                        الخطأ الشائع » (rempli à 99,2 % d'une phrase générique,
                        ses aides indexées sur d'anciens ids 1-6 désormais
                        désalignés du corpus) est supprimé. Remplacé par le
                        rappel honest de l'option choisie — l'ANALYSE réelle
                        est l'explication scientifique de CETTE question,
                        affichée ci-dessus (elle existe pour 531/531 QCM). */}
                    {(() => {
                      const selectedOptionIdx = selectedAnswers[currentIndex];
                      const isWrong = currentQuestion.kind !== 'fillBlank' && selectedOptionIdx !== undefined && selectedOptionIdx !== currentQuestion.correctAnswerIndex;
                      if (!isWrong) return null;
                      return (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 }}
                          className={`border rounded-2xl p-3.5 text-sm text-right ${
                            isFocusMode
                              ? 'bg-black/40 border-[#ba1a1a]/30 text-gray-200'
                              : 'bg-red-50/10 border border-[#ba1a1a]/25 dark:bg-red-950/10'
                          }`}
                        >
                          <p className={`text-xs leading-relaxed font-bold ${isFocusMode ? 'text-gray-300' : 'text-[#506072] dark:text-gray-300'}`}>
                            إجابتك في هذا السؤال كان الاختيار{' '}
                            <span className="text-[#ba1a1a] dark:text-red-400">
                              ({optionLetters[selectedOptionIdx]}) « {currentQuestion.options[selectedOptionIdx]} »
                            </span>{' '}
                            — الشرح العلمي أعلاه يوضّح المفهوم المرتبط بهذا الخطأ، ويمكنك إعادة سؤال الوحدة لاحقاً لتثبيته.
                          </p>
                        </motion.div>
                      );
                    })()}
                  </div>
                )}
              </motion.section>
            </AnimatePresence>

            {/* Navigation Actions Footer */}
            <section className="flex gap-4 mt-auto">
              <button
                disabled={currentIndex === 0}
                onClick={handlePrev}
                className={`flex-1 font-bold h-14 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-40 cursor-pointer ${
                  isFocusMode 
                    ? 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10' 
                    : 'bg-[#ffffff] dark:bg-[#141916] border border-[#e2dabf] dark:border-zinc-800 text-[#506072] dark:text-zinc-300 hover:bg-[#f3f4f5]'
                }`}
              >
                <ArrowRight className="w-4 h-4" />
                <span>السابق</span>
              </button>

              <button
                disabled={!isAnswered[currentIndex]}
                onClick={handleNext}
                className="flex-[2] bg-[#006d37] text-[#ffffff] font-bold h-14 rounded-2xl flex items-center justify-center gap-2 shadow-md hover:bg-[#00562b] active:scale-95 transition-all disabled:opacity-40 cursor-pointer"
              >
                <span>{currentIndex === actives.length - 1 ? 'إنهاء وحساب النتيجة' : 'التالي'}</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </section>
          </>
        ) : (
          /* Quiz Score Report / Success Card */
          <motion.section 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#ffffff] rounded-3xl p-8 border border-[#e2dabf]/60 shadow-lg text-center space-y-8"
          >
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-[#2ecc71]/10 rounded-full blur-xl animate-ping" />
              <div className="relative bg-[#2ecc71] w-20 h-20 rounded-full flex items-center justify-center text-[#ffffff] mx-auto shadow-md">
                <Award className="w-12 h-12 stroke-[2.5]" />
              </div>
            </div>

            <div className="space-y-3">
              {/* H7 (audit coach 18/10/2026) : l'écran de fin ne peut plus
                  féliciter un score nul (« مبارك… بنجاح » s'affichait même à
                  0/50). Titre NEUTRE ; la appréciation est la seule ligne
                  évaluative, et elle reste scrupuleusement dans les limites
                  de la donnée (aucune promesse de « جاهز للبكالوريا » dérivée
                  d'une seule séance de QCM). */}
              <h2 className="text-2xl md:text-3xl font-black text-[#006d37]">انتهاء تمرين الوحدة</h2>
              <p className="text-[#504441] text-sm max-w-sm mx-auto leading-relaxed">
                أنجزت تمرين وحدة <span className="font-bold text-[#006d37]">{unitTitle}</span> — نتيجتك في هذه الجلسة:
              </p>
            </div>

            {/* Score Ring / Stats Row */}
            <div className="grid grid-cols-2 gap-4 bg-[#fff9ed] p-5 rounded-2xl border border-[#e2dabf]/50 max-w-md mx-auto">
              <div className="text-center">
                <span className="text-xs text-[#504441] block">معدل الإجابة الصحيحة</span>
                <span className="text-4xl font-black text-[#006d37]">{scorePercentage}%</span>
              </div>
              <div className="w-[1px] bg-[#e2dabf]" />
              <div className="text-center">
                <span className="text-xs text-[#504441] block">النتيجة الإجمالية</span>
                <span className="text-4xl font-black text-[#944a00]">{score} / {actives.length}</span>
              </div>
            </div>

            {/* Student Feedback Title — M5 : annoncé aussi (fin de séance) */}
            <div className="max-w-md mx-auto text-sm text-[#504441] leading-relaxed" aria-live="polite">
              {scorePercentage >= 80 ? (
                <div className="text-[#006d37] font-bold flex items-center justify-center gap-1.5 bg-[#2ecc71]/10 p-3 rounded-xl border border-[#2ecc71]/20">
                  <CheckCircle2 className="w-4 h-4 fill-current text-white" />
                  <span>مستوى ممتاز في هذه الجلسة. ثبّته بإعادة حل الوحدة في مراجعة قادمة.</span>
                </div>
              ) : scorePercentage >= 50 ? (
                <div className="text-[#944a00] font-bold flex items-center justify-center gap-1.5 bg-[#fed65b]/20 p-3 rounded-xl border border-[#fed65b]/30">
                  <HelpCircle className="w-4 h-4" />
                  <span>مستوى جيد. ينصح بمراجعة المخططات التخطيطية وإعادة حل الأسئلة.</span>
                </div>
              ) : (
                <div className="text-[#ba1a1a] font-bold flex items-center justify-center gap-1.5 bg-[#ffdad6] p-3 rounded-xl border border-[#ba1a1a]/20">
                  <AlertOctagon className="w-4 h-4" />
                  <span>تحتاج لمزيد من التدريب. راجع بطاقات التكرار المتباعد لتثبيت المفاهيم.</span>
                </div>
              )}
            </div>

            {/* D'OÙ VIENT L'ERREUR — une seule fois, à la fin de la séance.
                Le LITE posait cette question en fin de leçon ; ici elle vit à la
                fin du QCM, qui est l'exercice le plus fréquent de l'application.
                Elle n'apparaît QUE s'il y a eu au moins une erreur : demander
                « pourquoi as-tu échoué ? » à un élève qui a tout juste est une
                faute de pédagogie, pas une collecte de données. */}
            {doitDemanderCause(erreursQuiz, causeDemandee) && (
              <div className="max-w-md mx-auto w-full rounded-2xl border border-[#006d37]/25 bg-[#f8fbfa] p-4 text-right dark:bg-[#121614]" dir="rtl">
                <p className="text-sm font-black text-[#006d37] dark:text-emerald-300">{QUESTION_CAUSE_AR}</p>
                <p className="mt-1 text-[11px] leading-relaxed text-[#506072] dark:text-gray-400">
                  سؤال واحد فقط، ولن يتكرّر في هذه الجلسة. الجواب يُحفظ على هاتفك وحدك.
                </p>
                <div className="mt-3 space-y-2">
                  {CAUSES_QCM.map((cause) => (
                    <button
                      key={cause.id}
                      type="button"
                      data-testid={`cause-${cause.id}`}
                      onClick={() => declarerCause(cause.id)}
                      className="w-full rounded-xl border border-[#e2dabf] bg-white p-3 text-right transition-colors hover:border-[#006d37] cursor-pointer dark:border-gray-800 dark:bg-[#1a1f1c]"
                    >
                      <span className="block text-xs font-black text-[#1f2b24] dark:text-gray-100">{cause.libelleAr}</span>
                      <span className="mt-0.5 block text-[10px] leading-relaxed text-[#506072] dark:text-gray-400">{cause.precisionAr}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {causeDemandee && causeDeclaree && (
              <p
                data-testid="cause-enregistree"
                className="max-w-md mx-auto text-xs font-bold text-[#006d37] dark:text-emerald-300"
                dir="rtl"
              >
                {causeParId(causeDeclaree)?.code ? REMERCIEMENT_CAUSE_AR : 'لم نسجّل شيئًا. لم يُخترع سبب لم تعرفه.'}
              </p>
            )}

            {/* TC3/H1 — CE QUI RESTE OUVERT : la liste des ratées de la séance,
                nommées une à une. Avant cette tranche, une question ratée
                disparaissait à jamais (« إعادة المحاولة » rejouait tout, dans
                le même ordre). Ces questions sont DÛES demain : elles ouvriront
                la prochaine séance de l'unité. */}
            {rateesSeance.length > 0 && (
              <div
                data-testid="quiz-erreurs-seance"
                dir="rtl"
                className="max-w-md mx-auto w-full rounded-2xl border border-[#ba1a1a]/25 bg-[#ffdad6]/20 p-4 text-right"
              >
                <p className="text-sm font-black text-[#ba1a1a]">
                  أخطاء هذه الجلسة — ستعود في مقدمتك القادمة: {rateesSeance.length}
                </p>
                <ul className="mt-2 max-h-48 space-y-1.5 overflow-y-auto pl-1">
                  {rateesSeance.map((q) => (
                    <li key={q.id} className="text-[11px] leading-relaxed text-[#504441]">
                      <span>•</span>{' '}
                      <span className="texte-question-ratee">{q.questionText}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 max-w-xs mx-auto">
              <button
                onClick={onClose}
                className="w-full h-12 bg-[#006d37] hover:bg-[#00562b] text-[#ffffff] font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <span>العودة للرئيسية</span>
              </button>

              {/* TC3/H1 — LA REPRISE CIBLÉE : rejouer SEULEMENT les ratées, pas
                  les 50 questions. Crédit : aucun (déjà payé à la première fin),
                  la mémoire, elle, tourne normalement. */}
              {rateesSeance.length > 0 && (
                <button
                  type="button"
                  data-testid="quiz-reprise-erreurs"
                  onClick={() => {
                    setActives(rateesSeance);
                    setCurrentIndex(0);
                    setSelectedAnswers({});
                    setIsAnswered({});
                    setFbInput({});
                    setFbResult({});
                    setEssai((n) => n + 1);
                    setScore(0);
                    setQuizFinished(false);
                  }}
                  className="w-full h-12 bg-[#fff9ed] hover:bg-[#fed65b]/10 text-[#006d37] border border-[#e2dabf] font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>أعد أخطائي فقط ({rateesSeance.length})</span>
                </button>
              )}

              <button
                onClick={() => {
                  setActives(questions);
                  setCurrentIndex(0);
                  setSelectedAnswers({});
                  setIsAnswered({});
                  setFbInput({});
                  setFbResult({});
                  setEssai((n) => n + 1);
                  setScore(0);
                  setQuizFinished(false);
                }}
                className="w-full h-12 bg-[#fff9ed] hover:bg-[#fed65b]/10 text-[#006d37] border border-[#e2dabf] font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>إعادة المحاولة والتدرب</span>
              </button>
            </div>
          </motion.section>
        )}

      </main>
    </div>
  );
}
