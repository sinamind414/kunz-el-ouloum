import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, AlertTriangle, Mic, Lightbulb, Target, BookOpen, Brain, FileText } from 'lucide-react';
import LessonAdventurePortal from './LessonAdventurePortal';
import { getExperimentalLesson, LESSON_LIBRARY } from '../lessonData';
import { SINGLE_PATH_LESSONS, SinglePathLesson, SinglePathStep } from '../data/singlePathLessons';
import SpeechToTextInput from './SpeechToTextInput';

interface InteractiveLessonViewProps {
  lessonId: string;
  onClose: () => void;
}

// Simple DragDrop component for Mot → Exemple
function DragDropBlock({ question, options, onCorrect, definition }: any) {
  const [selected, setSelected] = useState<string | null>(null);
  const [validated, setValidated] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleSelect = (opt: any) => {
    setSelected(opt.id);
    const correct = opt.correct;
    setIsCorrect(correct);
    setValidated(true);
    if (correct) {
      setTimeout(() => onCorrect && onCorrect(), 800);
    }
  };

  return (
    <div className="space-y-4 p-4 bg-[#fff9ed] dark:bg-[#1c241f] border border-[#e2dabf]/60 rounded-2xl">
      <p className="font-bold text-[#1f1c0b] dark:text-gray-100 leading-8 text-sm md:text-base">
        يتم التعبير عن المعلومة الوراثية على مرحلتين: الاستنساخ في النواة يتم انطلاقا من إحدى سلسلتي الـ ADN وتسمى
        <span className="inline-block bg-[#fed65b]/30 border-b-2 border-[#006d37] border-dashed px-2 mx-1 min-w-[100px] text-center">............</span>
      </p>
      <p className="text-sm font-bold text-[#1f1c0b] dark:text-gray-100">{question}</p>
      
      <div className="grid gap-2">
        {options.map((opt: any) => {
          const sel = selected === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => !validated && handleSelect(opt)}
              disabled={validated}
              className={`p-3 rounded-xl border text-sm font-bold text-right transition-all cursor-pointer flex justify-between items-center ${
                !validated ? 'bg-white dark:bg-[#141916] hover:bg-[#2ecc71]/10 border-[#e2dabf]/60 hover:border-[#006d37]/30' :
                sel && opt.correct ? 'bg-[#2ecc71]/15 border-[#006d37] text-[#006d37]' :
                sel && !opt.correct ? 'bg-rose-50 border-rose-300 text-rose-700' :
                'bg-white/50 opacity-50'
              }`}
            >
              <span>{opt.text}</span>
              {validated && sel && opt.correct && <CheckCircle2 className="w-5 h-5 text-[#006d37]" />}
              {validated && sel && !opt.correct && <AlertTriangle className="w-5 h-5 text-rose-500" />}
            </button>
          );
        })}
      </div>

      {validated && (
        <div className={`p-3 rounded-xl text-xs font-bold leading-6 ${isCorrect ? 'bg-[#2ecc71]/10 text-[#006d37] border border-[#2ecc71]/20' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
          {isCorrect ? options.find((o: any) => o.id === selected)?.correctFeedback || 'ممتاز!' : options.find((o: any) => o.id === selected)?.wrongFeedback || 'حاول مرة أخرى'}
          {definition && isCorrect && (
            <div className="mt-2 p-2 bg-white dark:bg-black/20 rounded-lg border text-[11px]">
              <strong>{definition.term}:</strong> {definition.def}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SinglePathPlayer({ lesson, onClose }: { lesson: SinglePathLesson; onClose: () => void }) {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const activeStep = lesson.steps[activeStepIndex];

  const handleStepComplete = () => {
    setCompletedSteps(prev => new Set([...prev, activeStepIndex]));
    if (activeStepIndex < lesson.steps.length - 1) {
      setTimeout(() => setActiveStepIndex(activeStepIndex + 1), 600);
    }
  };

  const handleSpeechValidate = (text: string, expectedKeywords: string[]) => {
    // Simple keyword check
    const lower = text.toLowerCase();
    const found = expectedKeywords.filter(k => lower.includes(k.toLowerCase())).length;
    if (found >= Math.ceil(expectedKeywords.length / 2) || text.length > 5) {
      handleStepComplete();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#f8f9fa] dark:bg-[#0c0f0d] flex flex-col font-sans" dir="rtl">
      {/* Header */}
      <header className="p-4 flex justify-between items-center bg-white dark:bg-[#141916] border-b border-[#e2dabf]/50 shadow-sm">
        <button onClick={onClose} className="p-2 rounded-full hover:bg-[#f3f4f5] text-[#506072] cursor-pointer">
          <X className="w-6 h-6" />
        </button>
        <div className="text-center flex-1 px-4">
          <h1 className="font-black text-[#006d37] dark:text-[#2ecc71] text-sm md:text-base line-clamp-1">{lesson.titleAr}</h1>
          <p className="text-[10px] text-[#506072] dark:text-gray-400">{lesson.breadcrumb}</p>
        </div>
        <div className="w-10 text-[10px] font-bold text-[#506072]">{activeStepIndex + 1}/{lesson.steps.length}</div>
      </header>

      {/* Progress */}
      <div className="px-4 py-3 bg-white dark:bg-[#141916] border-b border-[#e2dabf]/30">
        <div className="flex gap-2 max-w-2xl mx-auto">
          {lesson.steps.map((step, i) => (
            <div key={step.id} className="flex-1 flex flex-col items-center gap-1">
              <div className={`w-full h-2 rounded-full transition-all ${i < activeStepIndex || completedSteps.has(i) ? 'bg-[#2ecc71]' : i === activeStepIndex ? 'bg-[#006d37] animate-pulse' : 'bg-[#e2dabf]/30'}`} />
              <span className={`text-[9px] font-bold ${i === activeStepIndex ? 'text-[#006d37] dark:text-[#2ecc71]' : 'text-[#bbcbbb]'}`}>{step.badge}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-4 pb-32">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="bg-gradient-to-br from-[#006d37] to-[#00562b] text-white rounded-2xl p-5 shadow-md">
            <div className="flex items-center gap-2 mb-2">
              {activeStep.id === 'mot' && <BookOpen className="w-5 h-5 text-[#fed65b]" />}
              {activeStep.id === 'exemple' && <Target className="w-5 h-5 text-[#fed65b]" />}
              {activeStep.id === 'microtest' && <Brain className="w-5 h-5 text-[#fed65b]" />}
              {activeStep.id === 'methodo' && <FileText className="w-5 h-5 text-[#fed65b]" />}
              <span className="text-xs font-black bg-white/15 px-2.5 py-1 rounded-full">{activeStep.badge}</span>
            </div>
            <h2 className="text-xl font-black">{activeStep.title}</h2>
            <p className="text-sm text-white/80 mt-1 leading-7">{activeStep.instruction}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {lesson.motsSacre.map((mot, i) => (
                <span key={i} className="text-[10px] bg-white/10 border border-white/15 px-2 py-1 rounded-full">#{mot}</span>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep.id + activeStepIndex}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              {activeStep.content.map((block: any, idx: number) => {
                if (block.type === 'drag_drop') {
                  return <DragDropBlock key={idx} question={block.data.question} options={block.data.options} definition={block.data.definition} onCorrect={handleStepComplete} />;
                }
                if (block.type === 'speech_input') {
                  return (
                    <div key={idx} className="space-y-3 p-4 bg-white dark:bg-[#141916] border border-[#e2dabf]/60 rounded-2xl shadow-sm">
                      <p className="font-bold text-sm text-[#1f1c0b] dark:text-gray-100 flex items-start gap-2">
                        <span className="bg-[#006d37] text-white text-[10px] px-2 py-0.5 rounded-full shrink-0 mt-0.5">سؤال إنتاج</span>
                        <span>{block.data.question}</span>
                      </p>
                      <SpeechToTextInput
                        placeholder={block.data.placeholder}
                        expectedKeywords={block.data.expectedKeywords}
                        onValidate={(txt) => handleSpeechValidate(txt, block.data.expectedKeywords || [])}
                      />
                      <p className="text-[11px] text-[#506072] dark:text-gray-400 flex items-center gap-1">
                        <Lightbulb className="w-3.5 h-3.5 text-[#fed65b]" />
                        تلميح: {block.data.hint}
                      </p>
                    </div>
                  );
                }
                if (block.type === 'text') {
                  return (
                    <div key={idx} className="p-4 bg-white dark:bg-[#141916] border border-[#e2dabf]/50 rounded-2xl text-sm leading-8 whitespace-pre-line">
                      {block.data.text}
                    </div>
                  );
                }
                if (block.type === 'image_hotspot') {
                  return (
                    <div key={idx} className="p-4 bg-white dark:bg-[#141916] border rounded-2xl space-y-3">
                      <p className="text-sm font-bold">{block.data.question}</p>
                      <div className="relative rounded-xl overflow-hidden border bg-[#f3f4f5] h-48 flex items-center justify-center">
                        <span className="text-xs text-[#506072]">🖼️ {block.data.image} - {block.data.hotspots?.length} نقاط تفاعلية</span>
                      </div>
                      <div className="grid gap-2">
                        {block.data.hotspots?.map((hs: any) => (
                          <button key={hs.id} onClick={() => hs.correct && handleStepComplete()} className={`p-2 rounded-xl border text-xs font-bold text-right cursor-pointer ${hs.correct ? 'bg-[#2ecc71]/10 border-[#006d37]/20 hover:bg-[#2ecc71]/20' : 'bg-white border-[#e2dabf]/50 hover:bg-rose-50'}`}>
                            {hs.label} {hs.correct ? '✓' : ''}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                }
                if (block.type === 'methodo_boxes') {
                  return (
                    <div key={idx} className="space-y-3">
                      {block.data.boxes.map((box: any, bIdx: number) => (
                        <div key={bIdx} className="p-4 bg-[#fff9ed] dark:bg-[#1c241f] border border-[#e2dabf]/60 rounded-2xl space-y-2">
                          <label className="text-xs font-black text-[#944a00] block">{box.label}</label>
                          <p className="text-[11px] text-[#506072]">مثال: {box.example}</p>
                          <SpeechToTextInput
                            placeholder={box.placeholder}
                            expectedKeywords={box.keywords}
                            onValidate={(txt) => handleSpeechValidate(txt, box.keywords)}
                          />
                        </div>
                      ))}
                    </div>
                  );
                }
                return null;
              })}
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-between pt-6 gap-3">
            <button
              onClick={() => setActiveStepIndex(Math.max(0, activeStepIndex - 1))}
              disabled={activeStepIndex === 0}
              className="px-4 py-2.5 rounded-xl bg-white dark:bg-[#141916] border border-[#e2dabf]/60 text-sm font-bold text-[#506072] disabled:opacity-40 cursor-pointer"
            >
              السابق
            </button>
            <button
              onClick={handleStepComplete}
              disabled={activeStepIndex === lesson.steps.length - 1 && !completedSteps.has(activeStepIndex)}
              className="flex-1 px-6 py-2.5 rounded-xl bg-[#006d37] hover:bg-[#00562b] text-white font-black text-sm shadow-md disabled:opacity-40 cursor-pointer flex items-center justify-center gap-2"
            >
              {activeStepIndex === lesson.steps.length - 1 ? 'إنهاء الدرس ✓' : 'التالي ←'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function InteractiveLessonView({ lessonId, onClose }: InteractiveLessonViewProps) {
  const singlePathLesson = (SINGLE_PATH_LESSONS as any)[lessonId];

  if (singlePathLesson) {
    return <SinglePathPlayer lesson={singlePathLesson} onClose={onClose} />;
  }

  // Fallback to old system for other lessons
  const lesson = React.useMemo(() => {
    const fromLibrary = LESSON_LIBRARY.find(l => l.key === lessonId);
    if (fromLibrary) return fromLibrary;
    const experimental = getExperimentalLesson(lessonId);
    return {
      key: lessonId,
      unitId: 1,
      ...experimental,
    };
  }, [lessonId]);

  return (
    <LessonAdventurePortal
      lesson={lesson as any}
      onClose={onClose}
    />
  );
}
