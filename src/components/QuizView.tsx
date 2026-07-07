import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Timer, CheckCircle2, AlertCircle, ArrowLeft, ArrowRight, RotateCcw, Award, Check, BookOpen, GraduationCap, AlertOctagon, HelpCircle, Sparkles, Eye, EyeOff } from 'lucide-react';
import { QuizQuestion } from '../types';
import { playSuccessSound, playFailureSound } from '../utils/audio';
import { MASCOT_URL } from '../data';
import { getHintForIncorrectOption, getGeneralHint } from '../utils/hints';

interface QuizViewProps {
  unitId: number;
  unitTitle: string;
  questions: QuizQuestion[];
  onClose: () => void;
  onQuizComplete: (score: number, total: number) => void;
}

export default function QuizView({ unitId, unitTitle, questions, onClose, onQuizComplete }: QuizViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({});
  const [isAnswered, setIsAnswered] = useState<{ [key: number]: boolean }>({});
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes in seconds (900s)
  const [quizFinished, setQuizFinished] = useState(false);
  const [score, setScore] = useState(0);
  const [showGeneralHint, setShowGeneralHint] = useState<boolean>(false);
  const [isFocusMode, setIsFocusMode] = useState<boolean>(false);
  const completionSubmittedRef = useRef(false);

  const currentQuestion = questions[currentIndex] || questions[0];

  const finishQuiz = () => {
    if (completionSubmittedRef.current) return;
    completionSubmittedRef.current = true;
    setQuizFinished(true);
    onQuizComplete(score, questions.length);
  };

  // Timer Effect: when time is over, submit the quiz once and lock answers.
  useEffect(() => {
    if (quizFinished) return;

    if (timeLeft <= 0) {
      finishQuiz();
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => Math.max(prev - 1, 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft, quizFinished, score, questions.length]);

  // Format Time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOptionSelect = (optionIdx: number) => {
    if (quizFinished || timeLeft <= 0 || isAnswered[currentIndex]) return; // Cannot change answer once locked/submitted

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

  const handleNext = () => {
    setShowGeneralHint(false);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Finished quiz!
      finishQuiz();
    }
  };

  const handlePrev = () => {
    setShowGeneralHint(false);
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  // Option Lettering (أ, ب, ج, د)
  const optionLetters = ['أ', 'ب', 'ج', 'د'];

  // Overall Score Stats
  const scorePercentage = Math.round((score / questions.length) * 100);

  return (
    <div className={`min-h-screen transition-all duration-500 flex flex-col items-center select-none font-sans selection:bg-[#2ecc71]/20 ${
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
        <div className="w-full max-w-2xl px-4 md:px-0 mt-6 flex flex-row-reverse items-center justify-between bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 px-4 py-3 text-white shadow-lg animate-fadeIn text-right">
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
                  السؤال {currentIndex + 1} من {questions.length}
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
                  style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
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
                  <div className="flex flex-row-reverse justify-between items-start gap-4 text-right">
                    <h2 className={`text-xl font-bold leading-relaxed flex-1 ${isFocusMode ? 'text-gray-100' : 'text-[#1f1c0b] dark:text-gray-100'}`}>
                      {currentQuestion.questionText}
                    </h2>
                    
                    {!isAnswered[currentIndex] && (
                      <button
                        onClick={() => setShowGeneralHint(!showGeneralHint)}
                        className={`shrink-0 flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                          showGeneralHint 
                            ? (isFocusMode ? 'bg-[#006d37]/30 text-[#2ecc71] border-[#006d37]/40 shadow-sm' : 'bg-[#fff9ed] text-[#006d37] border-[#006d37]/40 shadow-sm') 
                            : (isFocusMode ? 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10' : 'bg-[#fcfcfc] dark:bg-zinc-800 text-[#506072] dark:text-zinc-300 border-[#e2dabf] dark:border-zinc-700 hover:border-[#006d37]/30 hover:text-[#006d37]')
                        }`}
                        id={`general-hint-btn-${currentQuestion.id}`}
                      >
                        <Sparkles className={`w-3.5 h-3.5 ${showGeneralHint ? 'text-[#006d37] animate-bounce' : 'text-[#506072]'}`} />
                        <span>طلب تلميح</span>
                      </button>
                    )}
                  </div>

                  {/* General Hint Bubble */}
                  <AnimatePresence>
                    {showGeneralHint && !isAnswered[currentIndex] && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className={`border rounded-2xl p-3.5 text-xs leading-relaxed flex flex-row-reverse gap-2 items-start overflow-hidden mt-1 text-right ${
                          isFocusMode 
                            ? 'bg-black/30 border-[#006d37]/20 text-gray-200' 
                            : 'bg-[#fff9ed] dark:bg-[#1a221d] border-[#fed65b]/40 dark:border-[#2ecc71]/20 text-[#504441] dark:text-gray-200'
                        }`}
                      >
                        <span className="text-base shrink-0">💡</span>
                        <div className="space-y-1 flex-1">
                          <span className={`font-extrabold block ${isFocusMode ? 'text-[#2ecc71]' : 'text-[#944a00] dark:text-[#2ecc71]'}`}>إرشاد مساعد التلميحات:</span>
                          <p>{getGeneralHint(currentQuestion.id)}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Multiple Choice Options */}
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

                {/* Explanation Card (Pedagogical Feedback) */}
                {isAnswered[currentIndex] && (
                  <div className="space-y-4">
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`rounded-2xl p-4 border text-sm space-y-2 text-right ${
                        isFocusMode 
                          ? 'bg-black/30 border-[#006d37]/20 text-gray-200' 
                          : 'bg-[#fff9ed] dark:bg-[#1a221d] border-[#fed65b]/50 dark:border-[#2ecc71]/20 text-[#504441] dark:text-gray-200'
                      }`}
                    >
                      <div className={`flex flex-row-reverse items-center gap-2 font-bold ${
                        isFocusMode ? 'text-[#2ecc71]' : 'text-[#944a00] dark:text-[#2ecc71]'
                      }`}>
                        <BookOpen className="w-4 h-4" />
                        <span>الشرح والمبرر العلمي:</span>
                      </div>
                      <p className="leading-relaxed">
                        {currentQuestion.explanation}
                      </p>
                    </motion.div>

                    {/* Smart Hint Assistant (Analyzing incorrect answers) */}
                    {(() => {
                      const selectedOptionIdx = selectedAnswers[currentIndex];
                      const isWrong = selectedOptionIdx !== undefined && selectedOptionIdx !== currentQuestion.correctAnswerIndex;
                      if (!isWrong) return null;

                      return (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 }}
                          className={`border rounded-2xl p-4 text-sm space-y-3 text-right ${
                            isFocusMode 
                              ? 'bg-black/40 border-red-900/30 text-gray-200' 
                              : 'bg-red-50/10 border border-red-200/50 dark:bg-red-950/10 dark:border-red-900/30'
                          }`}
                        >
                          <div className="flex flex-row-reverse items-start gap-3">
                            {/* Mascot Avatar */}
                            <div className="w-12 h-12 rounded-full border border-[#006d37]/20 overflow-hidden shrink-0 bg-white/80 flex items-center justify-center p-0.5 shadow-sm">
                              <img 
                                src={MASCOT_URL} 
                                alt="Mascot Avatar" 
                                className="w-full h-full object-contain"
                                referrerPolicy="no-referrer"
                              />
                            </div>

                            {/* Content Balloon */}
                            <div className="space-y-1.5 flex-1">
                              <div className="flex flex-row-reverse justify-between items-center">
                                <div className="flex items-center gap-1.5 text-red-700 font-extrabold dark:text-red-400">
                                  <HelpCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                                  <span>مساعد التلميحات • تحليل الخطأ الشائع</span>
                                </div>
                                <span className="text-[10px] bg-red-100 text-red-800 px-2 py-0.5 rounded-full font-bold dark:bg-red-900/40 dark:text-red-300">
                                  مراجعة المفاهيم
                                </span>
                              </div>
                              
                              <p className={`text-xs leading-relaxed ${isFocusMode ? 'text-gray-300' : 'text-[#506072] dark:text-gray-300'}`}>
                                لقد اخترت الخيار <span className="font-bold text-[#ba1a1a] dark:text-red-400">({optionLetters[selectedOptionIdx]})</span>: <span className="italic">"{currentQuestion.options[selectedOptionIdx]}"</span>. دعنا نفهم لماذا هذا الخيار غير دقيق:
                              </p>
                              
                              <div className={`p-3 rounded-xl border text-xs font-medium leading-relaxed shadow-inner ${
                                isFocusMode ? 'bg-black/30 border-red-900/20 text-gray-200' : 'bg-white/60 dark:bg-black/20 border-red-100/40 text-[#1f1c0b] dark:text-gray-200'
                              }`}>
                                {getHintForIncorrectOption(currentQuestion.id, selectedOptionIdx)}
                              </div>
                            </div>
                          </div>
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
                <span>{currentIndex === questions.length - 1 ? 'إنهاء وحساب النتيجة' : 'التالي'}</span>
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
              <h2 className="text-2xl md:text-3xl font-black text-[#006d37]">مبارك إتمام التدريب!</h2>
              <p className="text-[#504441] text-sm max-w-sm mx-auto leading-relaxed">
                لقد أنجزت تمرين وحدة <span className="font-bold text-[#006d37]">{unitTitle}</span> بنجاح. إليك تفاصيل نتيجتك العلمية:
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
                <span className="text-4xl font-black text-[#944a00]">{score} / {questions.length}</span>
              </div>
            </div>

            {/* Student Feedback Title */}
            <div className="max-w-md mx-auto text-sm text-[#504441] leading-relaxed">
              {scorePercentage >= 80 ? (
                <div className="text-[#006d37] font-bold flex items-center justify-center gap-1.5 bg-[#2ecc71]/10 p-3 rounded-xl border border-[#2ecc71]/20">
                  <CheckCircle2 className="w-4 h-4 fill-current text-white" />
                  <span>مستوى ممتاز! أنت جاهز تماماً للبكالوريا في هذه الوحدة.</span>
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

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 max-w-xs mx-auto">
              <button 
                onClick={onClose}
                className="w-full h-12 bg-[#006d37] hover:bg-[#00562b] text-[#ffffff] font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <span>العودة للرئيسية</span>
              </button>
              
              <button 
                onClick={() => {
                  setCurrentIndex(0);
                  setSelectedAnswers({});
                  setIsAnswered({});
                  setTimeLeft(900);
                  setScore(0);
                  completionSubmittedRef.current = false;
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
