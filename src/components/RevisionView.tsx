import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Volume2, Key, HelpCircle, Layers, BookOpen, VolumeX, Sparkles, Eye, EyeOff, Check, AlertCircle, ArrowLeft } from 'lucide-react';
import { Flashcard, Unit } from '../types';
import { playFlipSound, playSuccessSound, playFailureSound } from '../utils/audio';
import { DOMAIN_INFO } from './LessonsView';

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

const DEFAULT_DOMAIN = { fr: '', icon: Layers, color: '#006d37', light: '#eafaf1', dark: '#00562b' };

export default function RevisionView({ units, flashcards, onRateCard, initialUnitId, isFocusMode, setIsFocusMode }: RevisionViewProps) {
  const [selectedUnitId, setSelectedUnitId] = useState<number>(initialUnitId);
  const [selectedDomain, setSelectedDomain] = useState<string>(() => {
    const initialUnit = units.find((u) => u.id === initialUnitId);
    return initialUnit ? initialUnit.domain : (units[0]?.domain ?? '');
  });
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [mode, setMode] = useState<'flashcard' | 'qcm'>('qcm');
  const [qcmSelected, setQcmSelected] = useState<number | null>(null);
  const [qcmAnswered, setQcmAnswered] = useState(false);

  const resetQcm = () => {
    setQcmSelected(null);
    setQcmAnswered(false);
  };

  // Group units by domain (preserving natural order).
  const domains = useMemo(() => {
    const ordered: string[] = [];
    const byDomain = new Map<string, Unit[]>();
    for (const unit of units) {
      if (!byDomain.has(unit.domain)) {
        byDomain.set(unit.domain, []);
        ordered.push(unit.domain);
      }
      byDomain.get(unit.domain)!.push(unit);
    }
    return ordered.map((name) => ({ name, units: byDomain.get(name)! }));
  }, [units]);

  const domainInfo = DOMAIN_INFO[selectedDomain] ?? DEFAULT_DOMAIN;
  const cardCountByUnit = useMemo(() => {
    const map: Record<number, number> = {};
    for (const c of flashcards) map[c.unitId] = (map[c.unitId] ?? 0) + 1;
    return map;
  }, [flashcards]);

  useEffect(() => {
    if (units.some((unit) => unit.id === initialUnitId)) {
      setSelectedUnitId(initialUnitId);
      setCurrentCardIndex(0);
      setIsFlipped(false);
      resetQcm();
      stopAudio();
    }
  }, [initialUnitId, units]);

  // Filter cards by selected unit
  const activeCards = flashcards.filter((c) => c.unitId === selectedUnitId);
  const currentCard = activeCards[currentCardIndex];

  const handleUnitChange = (unitId: number) => {
    setSelectedUnitId(unitId);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    resetQcm();
    stopAudio();
  };

  const handleDomainChange = (domain: string) => {
    setSelectedDomain(domain);
    const firstUnit = domains.find((d) => d.name === domain)?.units[0];
    if (firstUnit) handleUnitChange(firstUnit.id);
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
        setCurrentCardIndex((prev) => prev + 1);
      } else {
        // Wrap around to repeat or complete
        setCurrentCardIndex(0);
      }
    }, 300);
  };

  // QCM mode: select an option -> instant red/green feedback + sound
  const handleQcmSelect = (idx: number) => {
    if (qcmAnswered || !currentCard) return;
    setQcmSelected(idx);
    setQcmAnswered(true);
    if (idx === currentCard.correctOptionIndex) {
      playSuccessSound();
    } else {
      playFailureSound();
    }
  };

  const handleQcmNext = () => {
    resetQcm();
    if (currentCardIndex < activeCards.length - 1) {
      setCurrentCardIndex((prev) => prev + 1);
    } else {
      setCurrentCardIndex(0);
    }
  };

  const optionLetters = ['أ', 'ب', 'ج', 'د'];

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
    const unit = units.find((u) => u.id === selectedUnitId);
    return unit ? unit.title : '';
  };

  return (
    <div
      className={`space-y-6 pb-24 select-none font-sans w-full ${isFocusMode ? 'max-w-2xl mx-auto' : ''}`}
      style={{ ['--dc' as string]: domainInfo.color, ['--dl' as string]: domainInfo.light, ['--dd' as string]: domainInfo.dark } as React.CSSProperties}
    >
      
      {/* Focus Mode Header Bar */}
      {isFocusMode && (
        <div className="flex flex-row-reverse items-center justify-between w-full bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 px-4 py-3 text-white shadow-lg text-right">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--dc)] animate-ping" />
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
              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-white text-xs font-extrabold transition-all cursor-pointer shadow-sm"
              style={{ backgroundColor: 'var(--dc)' }}
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
        <section className="bg-[#ffffff] dark:bg-[#141916] border border-[#e2dabf]/60 dark:border-[var(--dc)]/10 p-4 rounded-3xl shadow-sm space-y-4">
          <label className="text-xs font-bold text-[#506072] dark:text-gray-300 block">اختر المجال ثم الوحدة لمراجعة البطاقات الذكية:</label>

          {/* Domain selector (colored by domain) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {domains.map((domain) => {
              const info = DOMAIN_INFO[domain.name] ?? DEFAULT_DOMAIN;
              const Icon = info.icon;
              const isSel = selectedDomain === domain.name;
              return (
                <button
                  key={domain.name}
                  onClick={() => handleDomainChange(domain.name)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer border"
                  style={{
                    backgroundColor: isSel ? info.color : info.light,
                    borderColor: info.color,
                    color: isSel ? '#ffffff' : info.color,
                  }}
                >
                  <Icon className="w-4 h-4" />
                  <span className="flex flex-col items-start leading-tight">
                    <span>{domain.name}</span>
                    <span className="text-[9px] font-semibold opacity-80">{info.fr}</span>
                  </span>
                </button>
              );
            })}
          </div>

          {/* Unit selector (filtered by selected domain, colored by domain) */}
          <div className="flex flex-wrap gap-2 pt-1">
            {domains
              .find((d) => d.name === selectedDomain)
              ?.units.map((unit) => {
                const count = cardCountByUnit[unit.id] ?? 0;
                const isSel = selectedUnitId === unit.id;
                return (
                  <button
                    key={unit.id}
                    onClick={() => handleUnitChange(unit.id)}
                    className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer border ${
                      isSel ? 'shadow-sm' : 'hover:brightness-95'
                    }`}
                    style={{
                      backgroundColor: isSel ? domainInfo.color : domainInfo.light,
                      borderColor: domainInfo.color,
                      color: isSel ? '#ffffff' : domainInfo.color,
                    }}
                  >
                    {unit.title}
                    <span className="opacity-70 mr-1 text-[10px]">({count})</span>
                  </button>
                );
              })}
          </div>
        </section>
      )}

      {/* Revision Title Header - Hidden in Focus Mode */}
      {!isFocusMode && (
        <section className="flex justify-between items-end px-1">
          <div>
            <h2 className="text-2xl font-black font-display" style={{ color: 'var(--dc)' }}>المراجعة الذكية</h2>
            <p className="text-xs text-[#506072] dark:text-gray-300 font-semibold mt-1">الوحدة: {getSelectedUnitTitle()}</p>
          </div>
          
          {/* Actions bar */}
          <div className="flex items-center gap-2">
            {/* Focus Mode button */}
            <button
              onClick={() => setIsFocusMode(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#fff9ed] dark:bg-[#1c241f] border border-[#e2dabf]/70 dark:border-[var(--dc)]/10 hover:bg-[#fed65b]/20 font-bold text-xs transition-all cursor-pointer shadow-sm"
              title="تفعيل وضع التركيز"
              id="flashcard-focus-toggle"
              style={{ color: 'var(--dc)' }}
            >
              <Eye className="w-4 h-4" style={{ color: 'var(--dc)' }} />
              <span>وضع التركيز</span>
            </button>

            {/* Remaining Badge */}
            <div className="flex items-center gap-1.5 bg-[#ffffff] dark:bg-[#141916] border border-[#e2dabf]/60 dark:border-[var(--dc)]/10 px-3.5 py-1.5 rounded-xl shadow-sm text-sm font-bold" style={{ color: 'var(--dc)' }}>
              <Layers className="w-4 h-4" style={{ color: 'var(--dc)' }} />
              <span>{activeCards.length > 0 ? `${currentCardIndex + 1} / ${activeCards.length}` : '0 / 0'}</span>
            </div>
          </div>
        </section>
      )}

      {/* Mode selector: QCM vs Flashcards - Hidden in Focus Mode */}
      {!isFocusMode && (
        <section className="flex items-center gap-1.5 bg-[#ffffff] dark:bg-[#141916] border border-[#e2dabf]/60 dark:border-[var(--dc)]/10 p-1.5 rounded-2xl shadow-sm w-fit">
          <button
            onClick={() => { setMode('qcm'); resetQcm(); }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer ${mode === 'qcm' ? 'text-white shadow-sm' : 'text-[#506072] dark:text-gray-300 hover:brightness-95'}`}
            style={mode === 'qcm' ? { backgroundColor: 'var(--dc)' } : undefined}
          >
            <Check className="w-4 h-4" />
            <span>أسئلة QCM</span>
          </button>
          <button
            onClick={() => setMode('flashcard')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer ${mode === 'flashcard' ? 'text-white shadow-sm' : 'text-[#506072] dark:text-gray-300 hover:brightness-95'}`}
            style={mode === 'flashcard' ? { backgroundColor: 'var(--dc)' } : undefined}
          >
            <Layers className="w-4 h-4" />
            <span>بطاقات ذكية</span>
          </button>
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
      ) : mode === 'qcm' ? (
        <div className="flex flex-col gap-6">
          {/* QCM Question Card */}
          <div className={`border rounded-3xl p-6 md:p-8 shadow-[0_4px_16px_rgba(68,42,34,0.05)] transition-colors duration-300 ${
            isFocusMode
              ? 'bg-[#121714] border-[var(--dc)]/30 shadow-[0_8px_32px_rgba(0,0,0,0.5)] text-white'
              : 'bg-[#ffffff] dark:bg-[#141916] border-[#e2dabf]/80 dark:border-[var(--dc)]/10 text-[#1f1c0b] dark:text-gray-100'
          }`}>
            {currentCard.diagramUrl && (
              <div className={`mb-4 w-full rounded-2xl p-4 flex items-center justify-center border max-h-48 overflow-hidden ${
                isFocusMode ? 'bg-black/40 border-[var(--dc)]/20' : 'bg-[#f3f4f5] dark:bg-black/20 border-[#bbcbbb]/30 dark:border-[var(--dc)]/10'
              }`}>
                <img className={`object-contain max-h-40 w-full ${isFocusMode ? '' : 'mix-blend-multiply'}`} src={currentCard.diagramUrl} alt="Schéma" referrerPolicy="no-referrer" />
              </div>
            )}

            <div className="flex justify-between items-start gap-3 mb-4">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                isFocusMode ? 'bg-[var(--dc)]/30 text-[var(--dc)]' : 'text-[#944a00] bg-[#fff9ed] border border-[#e2dabf]'
              }`}>سؤال QCM</span>

              <button
                onClick={() => speakText(currentCard.question)}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors shadow-sm cursor-pointer ${
                  isPlayingAudio
                    ? 'bg-[#ba1a1a]/10 text-[#ba1a1a]'
                    : (isFocusMode ? 'bg-[var(--dc)]/20 text-[var(--dc)] hover:bg-[var(--dc)]/40' : 'bg-[#fff9ed] hover:bg-[#fed65b]/20 text-[#944a00]')
                }`}
                title="استمع للسؤال بصوتٍ مسموع"
              >
                {isPlayingAudio ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>

            <h3 className={`text-lg md:text-xl font-extrabold leading-relaxed ${isFocusMode ? 'text-gray-100' : 'text-[#1f1c0b] dark:text-gray-100'}`}>
              {currentCard.question}
            </h3>

            {/* Multiple Choice Options */}
            <div className="grid gap-3 mt-5">
              {currentCard.options?.map((opt, idx) => {
                const isSelected = qcmSelected === idx;
                const isCorrect = currentCard.correctOptionIndex === idx;
                const answered = qcmAnswered;

                let cls = isFocusMode
                  ? 'border-white/10 bg-[#161c18] hover:bg-[#1a251e] text-white'
                  : 'border-[#e2dabf] bg-[#ffffff] hover:bg-[#fcf3d8]/20 dark:bg-[#1a221d] dark:hover:bg-[#202c25] dark:border-zinc-800 text-[#1f1c0b] dark:text-gray-200';
                let letterCls = isFocusMode
                  ? 'border-white/20 text-gray-300'
                  : 'border-[#e2dabf] text-[#506072]';
                let icon = null;

                if (answered) {
                  if (isCorrect) {
                    cls = 'border-2 border-[#2ecc71] bg-[#2ecc71]/10 text-[#006d37] dark:text-[#9af6c0] font-bold shadow-sm';
                    letterCls = 'bg-[#2ecc71] text-[#ffffff] border-[#2ecc71]';
                    icon = <Check className="w-5 h-5 text-[#2ecc71] stroke-[3]" />;
                  } else if (isSelected) {
                    cls = 'border-2 border-[#ba1a1a] bg-[#ba1a1a]/10 text-[#ba1a1a] dark:text-red-300 font-bold shadow-sm';
                    letterCls = 'bg-[#ba1a1a] text-[#ffffff] border-[#ba1a1a]';
                    icon = <AlertCircle className="w-5 h-5 text-[#ba1a1a]" />;
                  } else {
                    cls = isFocusMode
                      ? 'border-white/5 bg-[#161c18] opacity-40 text-gray-400'
                      : 'border-[#e2dabf]/50 bg-[#ffffff] dark:bg-[#141916] opacity-60 text-gray-500';
                    letterCls = 'border-[#e2dabf]/50 text-[#506072]/50';
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={answered}
                    onClick={() => handleQcmSelect(idx)}
                    className={`flex items-center justify-start p-4 rounded-2xl border transition-all duration-300 w-full text-right group cursor-pointer ${cls}`}
                  >
                    <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold text-sm ml-4 transition-colors ${letterCls}`}>
                      {optionLetters[idx]}
                    </div>
                    <span className="text-base flex-1">{opt}</span>
                    {icon}
                  </button>
                );
              })}
            </div>

            {/* Explanation after answering */}
            {qcmAnswered && currentCard.answerBullets[1] && (
              <div className={`mt-5 rounded-2xl p-4 border text-sm space-y-2 text-right ${
                isFocusMode
                  ? 'bg-black/30 border-[var(--dc)]/20 text-gray-200'
                  : 'bg-[#fff9ed] dark:bg-[#1a221d] border-[#fed65b]/50 dark:border-[var(--dc)]/20 text-[#504441] dark:text-gray-200'
              }`}>
                <div className={`flex items-center gap-2 font-bold ${isFocusMode ? 'text-[var(--dc)]' : 'text-[#944a00] dark:text-[var(--dc)]'}`}>
                  <BookOpen className="w-4 h-4" />
                  <span>الشرح والمبرر العلمي:</span>
                </div>
                <p className="leading-relaxed">{currentCard.answerBullets[1]}</p>
              </div>
            )}
          </div>

          {/* Next question button */}
          {qcmAnswered && (
            <button
              onClick={handleQcmNext}
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl text-white font-extrabold shadow-md transition-all active:scale-95 cursor-pointer"
              style={{ backgroundColor: 'var(--dc)' }}
            >
              <span>السؤال التالي</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
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
                <div className={`backface-hidden border rounded-3xl p-6 md:p-8 w-full h-full min-h-[360px] flex flex-col justify-between transition-colors duration-300 overflow-y-auto ${
                  isFocusMode 
                  ? 'bg-[#121714] border-[var(--dc)]/30 shadow-[0_8px_32px_rgba(0,0,0,0.5)] text-white' 
                  : 'bg-[#ffffff] dark:bg-[#141916] border-[#e2dabf]/80 dark:border-[var(--dc)]/10 shadow-[0_4px_16px_rgba(68,42,34,0.05)] text-[#1f1c0b] dark:text-gray-100'
              }`}>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                      isFocusMode ? 'bg-[var(--dc)]/30 text-[var(--dc)] border border-[var(--dc)]/40' : 'text-[#944a00] bg-[#fff9ed] border border-[#e2dabf]'
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
                          : (isFocusMode ? 'bg-[var(--dc)]/20 text-[var(--dc)] hover:bg-[var(--dc)]/40' : 'bg-[#fff9ed] hover:bg-[#fed65b]/20')
                      } flex items-center justify-center transition-colors shadow-sm cursor-pointer`}
                      style={!isFocusMode && !isPlayingAudio ? { color: 'var(--dc)' } : undefined}
                      title="استمع للسؤال بصوتٍ مسموع"
                    >
                      {isPlayingAudio ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                  </div>

                  <h3 className={`text-lg md:text-xl font-extrabold leading-relaxed ${isFocusMode ? 'text-gray-100' : 'text-[#1f1c0b] dark:text-gray-100'}`}>
                    {currentCard.question}
                  </h3>

                  {/* QCM options on the front (correct answer hidden until flip) */}
                  {currentCard.options && currentCard.options.length > 0 && (
                    <div className="grid gap-2 pt-1">
                      {currentCard.options.map((opt, oIdx) => (
                        <div
                          key={oIdx}
                          className={`flex items-start gap-2.5 px-3 py-2.5 rounded-xl border text-sm leading-relaxed ${
                            isFocusMode
                              ? 'bg-black/30 border-white/10 text-gray-200'
                              : 'bg-[#f3f4f5] dark:bg-black/20 border-[#bbcbbb]/40 dark:border-[var(--dc)]/10 text-[#1f1c0b] dark:text-gray-200'
                          }`}
                        >
                          <span className={`font-extrabold shrink-0 ${isFocusMode ? 'text-[var(--dc)]' : 'text-[var(--dc)]'}`}>
                            {String.fromCharCode(65 + oIdx)})
                          </span>
                          <span>{opt}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Diagram attachment if present on front */}
                {currentCard.diagramUrl && (
                  <div className={`my-4 w-full rounded-2xl p-4 flex items-center justify-center border max-h-48 md:max-h-56 overflow-hidden ${
                    isFocusMode ? 'bg-black/40 border-[var(--dc)]/20' : 'bg-[#f3f4f5] dark:bg-black/20 border-[#bbcbbb]/30 dark:border-[var(--dc)]/10'
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
                  isFocusMode ? 'text-[var(--dc)] border-[var(--dc)]/20' : 'text-[#506072] border-[#e2dabf]/30'
                }`}>
                  💡 اضغط على البطاقة لتكشف عن الإجابة النموذجية
                </div>
              </div>

              {/* BACK SIDE */}
              <div className={`backface-hidden rotate-y-180 absolute inset-0 border rounded-3xl p-6 md:p-8 w-full h-full min-h-[360px] flex flex-col justify-between overflow-y-auto transition-colors duration-300 ${
                isFocusMode 
                  ? 'bg-[#181d1a] border-[var(--dc)]/40 shadow-[0_8px_32px_rgba(0,0,0,0.5)] text-white' 
                  : 'bg-[#fff9ed] dark:bg-[#1c241f] border-[#e2dabf] dark:border-[var(--dc)]/15 shadow-[0_4px_16px_rgba(68,42,34,0.08)] text-[#504441] dark:text-gray-100'
              }`}>
                
                <div className="space-y-4 text-right">
                  <div className="flex justify-between items-center">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 ${
                      isFocusMode ? 'bg-[var(--dc)]/30 text-[var(--dc)]' : 'text-[var(--dc)] bg-[var(--dc)]/10'
                    }`}>
                      <Key className="w-3.5 h-3.5" />
                      <span>الإجابة العلمية المعتمدة</span>
                    </span>
                    <span className={`text-[10px] font-semibold ${isFocusMode ? 'text-gray-400' : 'text-[#506072] dark:text-gray-300'}`}>تعتمد على الكلمات المفتاحية الوزارية</span>
                  </div>

                  {/* QCM options on the back with the correct answer highlighted */}
                  {currentCard.options && currentCard.options.length > 0 && (
                    <div className="grid gap-2">
                      {currentCard.options.map((opt, oIdx) => {
                        const isCorrect = oIdx === currentCard.correctOptionIndex;
                        return (
                          <div
                            key={oIdx}
                            className={`flex items-start gap-2.5 px-3 py-2.5 rounded-xl border text-sm leading-relaxed transition-colors ${
                              isCorrect
                                ? 'bg-[#006d37]/12 border-[#006d37]/40 text-[#00562b] dark:text-[#9af6c0] font-bold'
                                : (isFocusMode ? 'bg-black/30 border-white/10 text-gray-400' : 'bg-[#f3f4f5] dark:bg-black/20 border-[#bbcbbb]/40 dark:border-[var(--dc)]/10 text-[#504441] dark:text-gray-300')
                            }`}
                          >
                            <span className={`font-extrabold shrink-0 ${isCorrect ? 'text-[#006d37] dark:text-[#2ecc71]' : (isFocusMode ? 'text-gray-500' : 'text-[#506072] dark:text-gray-400')}`}>
                              {String.fromCharCode(65 + oIdx)})
                            </span>
                            <span>{opt}</span>
                            {isCorrect && (
                              <span className="mr-auto font-extrabold text-[#006d37] dark:text-[#2ecc71]">✓</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Bullet points answer */}
                  <ul className={`text-sm md:text-base space-y-3 leading-relaxed ${isFocusMode ? 'text-gray-200' : 'text-[#504441] dark:text-gray-100'}`}>
                    {currentCard.answerBullets.map((bullet, bIdx) => {
                      // Simple regex-like formatting for bold tags in our data
                      const parts = bullet.split('**');
                      return (
                        <li key={bIdx} className="list-disc list-inside">
                          {parts.map((part, pIdx) => 
                            pIdx % 2 === 1 
                              ? <strong key={pIdx} className="font-black" style={{ color: 'var(--dc)' }}>{part}</strong> 
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
              ? 'bg-[#121714] border-[var(--dc)]/30 text-white' 
              : 'bg-[#ffffff] dark:bg-[#141916] border-[#e2dabf]/60 dark:border-[var(--dc)]/10 text-[#1f1c0b] dark:text-gray-100'
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
                className="flex flex-col items-center justify-center py-3.5 rounded-2xl text-[#ffffff] active:scale-95 transition-all shadow-md cursor-pointer"
                style={{ backgroundColor: 'var(--dc)' }}
              >
                <span className="font-extrabold text-sm mb-1 text-[#fed65b]">جيد</span>
                <span className="text-[9px] font-bold opacity-90">1 يوم</span>
              </button>

              {/* Easy Button */}
              <button
                onClick={() => handleRate('easy')}
                className="flex flex-col items-center justify-center py-3.5 rounded-2xl hover:bg-[var(--dc)]/25 active:scale-95 transition-all shadow-sm border border-[var(--dc)]/20 dark:border-[var(--dc)]/10 cursor-pointer"
                style={{ backgroundColor: 'var(--dc)', color: '#ffffff' }}
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
