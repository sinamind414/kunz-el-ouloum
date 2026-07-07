import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Volume2, Key, Star, Award, ChevronLeft, ArrowRight, HelpCircle, Layers, BookOpen, VolumeX, Sparkles, Eye, EyeOff } from 'lucide-react';
import { Flashcard, Unit } from '../types';
import { playFlipSound, playSuccessSound } from '../utils/audio';

interface RevisionViewProps {
  units: Unit[];
  flashcards: Flashcard[];
  xp: number;
  streak: number;
  onRateCard: (cardId: string, rating: 'again' | 'hard' | 'good' | 'easy') => void;
  initialUnitId: number;
  isFocusMode: boolean;
  setIsFocusMode: (val: boolean) => void;
}

export default function RevisionView({ units, flashcards, xp, streak, onRateCard, initialUnitId, isFocusMode, setIsFocusMode }: RevisionViewProps) {
  const [selectedUnitId, setSelectedUnitId] = useState<number>(initialUnitId);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  useEffect(() => {
    if (units.some(unit => unit.id === initialUnitId)) {
      setSelectedUnitId(initialUnitId);
      setCurrentCardIndex(0);
      setIsFlipped(false);
      stopAudio();
    }
  }, [initialUnitId, units]);

  // Filter cards by selected unit
  const activeCards = flashcards.filter(c => c.unitId === selectedUnitId);
  const currentCard = activeCards[currentCardIndex];

  const handleUnitChange = (unitId: number) => {
    setSelectedUnitId(unitId);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    stopAudio();
  };

  const handleFlip = () => {
    playFlipSound();
    setIsFlipped(!isFlipped);
  };

  const handleRate = (rating: 'again' | 'hard' | 'good' | 'easy') => {
    if (!currentCard) return;

    // Play pleasant success sound upon correct recall evaluation
    if (rating === 'good' || rating === 'easy') {
      playSuccessSound();
    } else {
      playFlipSound();
    }

    // Send the rating to the parent app state to reward XP, update count
    onRateCard(currentCard.id, rating);

    // Fade and transition to the next card or loop
    setIsFlipped(false);
    stopAudio();
    setTimeout(() => {
      if (currentCardIndex < activeCards.length - 1) {
        setCurrentCardIndex(prev => prev + 1);
      } else {
        // Wrap around to repeat or complete
        setCurrentCardIndex(0);
      }
    }, 300);
  };

  // Text-to-Speech narration for academic accessibility
  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      if (isPlayingAudio) {
        setIsPlayingAudio(false);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ar-SA'; // Arabic voice
      utterance.rate = 0.85; // Slightly slower for scientific readability
      
      utterance.onend = () => {
        setIsPlayingAudio(false);
      };
      utterance.onerror = () => {
        setIsPlayingAudio(false);
      };

      setIsPlayingAudio(true);
      window.speechSynthesis.speak(utterance);
    } else {
      alert("متصفحك لا يدعم توليد الصوت للغة العربية.");
    }
  };

  const stopAudio = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingAudio(false);
  };

  const getSelectedUnitTitle = () => {
    const unit = units.find(u => u.id === selectedUnitId);
    return unit ? unit.title : '';
  };

  return (
    <div className={`space-y-6 pb-24 select-none font-sans w-full ${isFocusMode ? 'max-w-2xl mx-auto' : ''}`}>
      
      {/* Focus Mode Header Bar */}
      {isFocusMode && (
        <div className="flex flex-row-reverse items-center justify-between w-full bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 px-4 py-3 text-white shadow-lg text-right">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2ecc71] animate-ping" />
            <span className="text-xs font-bold text-gray-200">وضع التركيز نشط</span>
          </div>
          
          <div className="text-xs font-extrabold text-[#fed65b] line-clamp-1 pr-2">
            البطاقات التعليمية • {getSelectedUnitTitle()}
          </div>

          <div className="flex items-center gap-2.5">
            {/* Card Progress Badge in Focus Mode */}
            <div className="text-xs font-bold bg-white/10 px-2.5 py-1 rounded-lg">
              {currentCardIndex + 1} / {activeCards.length}
            </div>

            <button
              onClick={() => setIsFocusMode(false)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#006d37] hover:bg-[#008f47] text-white text-xs font-extrabold transition-all cursor-pointer shadow-sm"
              title="إلغاء وضع التركيز"
              id="exit-focus-btn"
            >
              <EyeOff className="w-3.5 h-3.5" />
              <span>إلغاء التركيز</span>
            </button>
          </div>
        </div>
      )}

      {/* Selection Filter Tab Selector - Hidden in Focus Mode */}
      {!isFocusMode && (
        <section className="bg-[#ffffff] dark:bg-[#141916] border border-[#e2dabf]/60 dark:border-[#2ecc71]/10 p-4 rounded-3xl shadow-sm space-y-3">
          <label className="text-xs font-bold text-[#506072] dark:text-gray-300 block">اختر وحدة الدراسة لتوليد بطاقات المراجعة:</label>
          <div className="flex flex-wrap gap-2">
            {units.map((unit) => (
              <button
                key={unit.id}
                onClick={() => handleUnitChange(unit.id)}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  selectedUnitId === unit.id
                    ? 'bg-[#006d37] text-[#ffffff] shadow-sm'
                    : 'bg-[#fff9ed] dark:bg-[#1c241f] text-[#006d37] dark:text-[#2ecc71] border border-[#e2dabf]/50 dark:border-[#2ecc71]/10 hover:bg-[#fed65b]/15'
                }`}
              >
                {unit.title}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Revision Title Header - Hidden in Focus Mode */}
      {!isFocusMode && (
        <section className="flex justify-between items-end px-1">
          <div>
            <h2 className="text-2xl font-black text-[#006d37] dark:text-[#2ecc71] font-display">المراجعة الذكية</h2>
            <p className="text-xs text-[#506072] dark:text-gray-300 font-semibold mt-1">الوحدة: {getSelectedUnitTitle()}</p>
          </div>
          
          {/* Actions bar */}
          <div className="flex items-center gap-2">
            {/* Focus Mode button */}
            <button
              onClick={() => setIsFocusMode(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#fff9ed] dark:bg-[#1c241f] border border-[#e2dabf]/70 dark:border-[#2ecc71]/10 text-[#006d37] dark:text-[#2ecc71] hover:bg-[#fed65b]/20 font-bold text-xs transition-all cursor-pointer shadow-sm"
              title="تفعيل وضع التركيز"
              id="flashcard-focus-toggle"
            >
              <Eye className="w-4 h-4 text-[#006d37] dark:text-[#2ecc71]" />
              <span>وضع التركيز</span>
            </button>

            {/* Remaining Badge */}
            <div className="flex items-center gap-1.5 bg-[#ffffff] dark:bg-[#141916] text-[#504441] dark:text-gray-100 border border-[#e2dabf]/60 dark:border-[#2ecc71]/10 px-3.5 py-1.5 rounded-xl shadow-sm text-sm font-bold">
              <Layers className="w-4 h-4 text-[#006d37] dark:text-[#2ecc71]" />
              <span>{activeCards.length > 0 ? `${currentCardIndex + 1} / ${activeCards.length}` : '0 / 0'}</span>
            </div>
          </div>
        </section>
      )}

      {activeCards.length === 0 ? (
        <div className="bg-[#ffffff] rounded-3xl p-8 border border-[#e2dabf]/60 shadow-sm text-center py-16 space-y-4">
          <HelpCircle className="w-12 h-12 text-[#944a00] mx-auto opacity-70" />
          <h3 className="font-bold text-lg text-[#1f1c0b]">لا توجد بطاقات متاحة لهذه الوحدة بعد</h3>
          <p className="text-sm text-[#504441] max-w-sm mx-auto">
            قم بإكمال دروس أخرى لفتح محتوى البطاقات الذكية الإضافية!
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          
          {/* Card Flip Interface */}
          <div className="perspective-1000 w-full min-h-[360px] cursor-pointer" onClick={handleFlip}>
            <motion.div
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              className="transform-style-3d relative w-full h-full min-h-[360px]"
            >
              
              {/* FRONT SIDE */}
              <div className={`backface-hidden border rounded-3xl p-6 md:p-8 w-full h-full min-h-[360px] flex flex-col justify-between transition-colors duration-300 ${
                isFocusMode 
                  ? 'bg-[#121714] border-[#006d37]/30 shadow-[0_8px_32px_rgba(0,0,0,0.5)] text-white' 
                  : 'bg-[#ffffff] dark:bg-[#141916] border-[#e2dabf]/80 dark:border-[#2ecc71]/10 shadow-[0_4px_16px_rgba(68,42,34,0.05)] text-[#1f1c0b] dark:text-gray-100'
              }`}>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                      isFocusMode ? 'bg-[#006d37]/30 text-[#2ecc71] border border-[#006d37]/40' : 'text-[#944a00] bg-[#fff9ed] border border-[#e2dabf]'
                    }`}>سؤال الفهم</span>
                    
                    {/* Speaker Button */}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation(); // Avoid flipping the card
                        speakText(currentCard.question);
                      }}
                      className={`w-9 h-9 rounded-full ${
                        isPlayingAudio 
                          ? 'bg-[#ba1a1a]/10 text-[#ba1a1a]' 
                          : (isFocusMode ? 'bg-[#006d37]/20 text-[#2ecc71] hover:bg-[#006d37]/40' : 'bg-[#fff9ed] text-[#006d37] hover:bg-[#fed65b]/20')
                      } flex items-center justify-center transition-colors shadow-sm cursor-pointer`}
                      title="استمع للسؤال بصوتٍ مسموع"
                    >
                      {isPlayingAudio ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                  </div>

                  <h3 className={`text-lg md:text-xl font-extrabold leading-relaxed ${isFocusMode ? 'text-gray-100' : 'text-[#1f1c0b] dark:text-gray-100'}`}>
                    {currentCard.question}
                  </h3>
                </div>

                {/* Diagram attachment if present on front */}
                {currentCard.diagramUrl && (
                  <div className={`my-4 w-full rounded-2xl p-4 flex items-center justify-center border max-h-48 md:max-h-56 overflow-hidden ${
                    isFocusMode ? 'bg-black/40 border-[#006d37]/20' : 'bg-[#f3f4f5] dark:bg-black/20 border-[#bbcbbb]/30 dark:border-[#2ecc71]/10'
                  }`}>
                    <img 
                      className={`object-contain max-h-40 md:max-h-48 w-full ${isFocusMode ? '' : 'mix-blend-multiply'}`} 
                      src={currentCard.diagramUrl} 
                      alt="Scientific Illustration" 
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}

                <div className={`text-center text-xs font-bold border-t pt-4 mt-4 animate-bounce ${
                  isFocusMode ? 'text-[#2ecc71] border-[#006d37]/20' : 'text-[#506072] border-[#e2dabf]/30'
                }`}>
                  💡 اضغط على البطاقة لتكشف عن الإجابة النموذجية
                </div>
              </div>

              {/* BACK SIDE */}
              <div className={`backface-hidden rotate-y-180 absolute inset-0 border rounded-3xl p-6 md:p-8 w-full h-full min-h-[360px] flex flex-col justify-between overflow-y-auto transition-colors duration-300 ${
                isFocusMode 
                  ? 'bg-[#181d1a] border-[#006d37]/40 shadow-[0_8px_32px_rgba(0,0,0,0.5)] text-white' 
                  : 'bg-[#fff9ed] dark:bg-[#1c241f] border-[#e2dabf] dark:border-[#2ecc71]/15 shadow-[0_4px_16px_rgba(68,42,34,0.08)] text-[#504441] dark:text-gray-100'
              }`}>
                
                <div className="space-y-4 text-right">
                  <div className="flex justify-between items-center">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 ${
                      isFocusMode ? 'bg-[#006d37]/30 text-[#2ecc71]' : 'text-[#006d37] bg-[#2ecc71]/10'
                    }`}>
                      <Key className="w-3.5 h-3.5" />
                      <span>الإجابة العلمية المعتمدة</span>
                    </span>
                    <span className={`text-[10px] font-semibold ${isFocusMode ? 'text-gray-400' : 'text-[#506072] dark:text-gray-300'}`}>تعتمد على الكلمات المفتاحية الوزارية</span>
                  </div>

                  {/* Bullet points answer */}
                  <ul className={`text-sm md:text-base space-y-3 leading-relaxed ${isFocusMode ? 'text-gray-200' : 'text-[#504441] dark:text-gray-100'}`}>
                    {currentCard.answerBullets.map((bullet, bIdx) => {
                      // Simple regex-like formatting for bold tags in our data
                      const parts = bullet.split('**');
                      return (
                        <li key={bIdx} className="list-disc list-inside">
                          {parts.map((part, pIdx) => 
                            pIdx % 2 === 1 
                              ? <strong key={pIdx} className={isFocusMode ? 'text-[#2ecc71] font-black' : 'text-[#006d37] dark:text-[#2ecc71] font-black'}>{part}</strong> 
                              : part
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>

                <div className={`text-center text-xs font-bold border-t pt-4 mt-4 ${
                  isFocusMode ? 'text-[#fed65b] border-white/10' : 'text-[#944a00] border-[#e2dabf]/30'
                }`}>
                  🌟 انقر مجدداً لقلب البطاقة للسؤال
                </div>
              </div>

            </motion.div>
          </div>

          {/* SM-2 Spaced Repetition Feedback Controller */}
          <section className={`border rounded-3xl p-5 shadow-sm space-y-4 transition-colors duration-300 ${
            isFocusMode 
              ? 'bg-[#121714] border-[#006d37]/30 text-white' 
              : 'bg-[#ffffff] dark:bg-[#141916] border-[#e2dabf]/60 dark:border-[#2ecc71]/10 text-[#1f1c0b] dark:text-gray-100'
          }`}>
            <p className={`text-xs font-bold text-center flex items-center justify-center gap-1 ${
              isFocusMode ? 'text-gray-300' : 'text-[#506072] dark:text-gray-300'
            }`}>
              <Sparkles className="w-3.5 h-3.5 text-[#fed65b] fill-[#fed65b]" />
              <span>ما مدى صعوبة استرجاع هذه الإجابة وتذكرها؟</span>
            </p>
            
            <div className="grid grid-cols-4 gap-2 w-full">
              {/* Again Button */}
              <button
                onClick={() => handleRate('again')}
                className="flex flex-col items-center justify-center py-3.5 rounded-2xl bg-[#ffdad6] dark:bg-red-950/20 text-[#ba1a1a] dark:text-red-400 hover:bg-[#ffdad6]/80 dark:hover:bg-red-950/40 active:scale-95 transition-all shadow-sm border border-[#ba1a1a]/10 dark:border-red-900/30 cursor-pointer"
              >
                <span className="font-extrabold text-sm mb-1">إعادة</span>
                <span className="text-[9px] font-bold opacity-80">&lt; 1 دقيقة</span>
              </button>

              {/* Hard Button */}
              <button
                onClick={() => handleRate('hard')}
                className="flex flex-col items-center justify-center py-3.5 rounded-2xl bg-[#f3f4f5] dark:bg-zinc-800/40 text-[#1f1c0b] dark:text-zinc-200 hover:bg-[#e7e8e9] dark:hover:bg-zinc-800/60 active:scale-95 transition-all shadow-sm border border-[#bbcbbb]/40 dark:border-zinc-700/30 cursor-pointer"
              >
                <span className="font-extrabold text-sm mb-1">صعب</span>
                <span className="text-[9px] font-bold opacity-80">6 دقائق</span>
              </button>

              {/* Good Button */}
              <button
                onClick={() => handleRate('good')}
                className="flex flex-col items-center justify-center py-3.5 rounded-2xl bg-[#006d37] hover:bg-[#00562b] text-[#ffffff] active:scale-95 transition-all shadow-md cursor-pointer"
              >
                <span className="font-extrabold text-sm mb-1 text-[#fed65b]">جيد</span>
                <span className="text-[9px] font-bold opacity-90">1 يوم</span>
              </button>

              {/* Easy Button */}
              <button
                onClick={() => handleRate('easy')}
                className="flex flex-col items-center justify-center py-3.5 rounded-2xl bg-[#2ecc71]/15 text-[#005027] dark:text-[#2ecc71] hover:bg-[#2ecc71]/25 active:scale-95 transition-all shadow-sm border border-[#2ecc71]/20 dark:border-[#2ecc71]/10 cursor-pointer"
              >
                <span className="font-extrabold text-sm mb-1">سهل</span>
                <span className="text-[9px] font-bold opacity-80">4 أيام</span>
              </button>
            </div>
          </section>

        </div>
      )}

    </div>
  );
}
