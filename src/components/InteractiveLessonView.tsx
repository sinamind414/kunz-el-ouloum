import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, AlertTriangle, Lightbulb, Target, BookOpen, Brain, FileText, MousePointerClick, Lock, ArrowLeft } from 'lucide-react';
import LessonAdventurePortal from './LessonAdventurePortal';
import { getExperimentalLesson, LESSON_LIBRARY } from '../lessonData';
import { SINGLE_PATH_LESSONS, SinglePathLesson } from '../data/singlePathLessons';
import SpeechToTextInput from './SpeechToTextInput';
import { ACTIVE_LESSONS, ActiveLesson, Block } from '../data/activeLessons';
import { checkProduction, checkMethodologyStep, checkAnalysisPurity, isInsideHotspot } from '../utils/methodologyChecker';
import { logEvent } from '../utils/telemetryService';
import { ZoomImageButton } from './ZoomableImage';
import { getLessonTransferChallenge, type LessonTransferChallenge } from '../data/lessonTransferChallenges';
import { validateAnswer } from '../lib/validation/ValidationEngine';
import { recordLessonTransferEvidence } from '../services/masteryEvidenceService';
import { getLessonProgression, type LessonProgression } from '../data/activeLessons';
import { getLessonGoldSummary } from '../data/lessonGoldSummaries';
import { getMicroRemediationByCode } from '../data/microRemediations';
import type { CoreReflexId } from '../data/reflexes';
import { loadStore } from '../data/store';
import LiveDocumentUracile from './LiveDocumentUracile';
import MissionBanner from './MissionBanner';
import { MICRO_REMEDIATIONS } from '../data/microRemediations';

interface InteractiveLessonViewProps {
  lessonId: string;
  onClose: () => void;
  onStartLesson?: (lessonId: string) => void;
  onNavigateToTab?: (tab: 'path' | 'lessons' | 'training' | 'progress') => void;
  onLaunchReflexMission?: (reflexId: CoreReflexId, meta: { missionId: string; conceptId: string; relatedErrorIds?: string[] }) => void;
  onDocumentEvidence?: (outcome: { passed: boolean; evidenceId?: string; errorCreated: boolean }) => void;
}

type LessonSessionOutcome = 'passed' | 'doc_only' | 'failed' | 'aborted';

// Simple DragDrop component for Mot → Exemple
interface DragDropOption {
  id: string;
  text: string;
  correct: boolean;
  correctFeedback?: string;
  wrongFeedback?: string;
}
interface DragDropDefinition {
  term: string;
  def: string;
}
interface DragDropBlockProps {
  question: string;
  options: DragDropOption[];
  onCorrect?: () => void;
  definition?: DragDropDefinition;
}
function DragDropBlock({ question, options, onCorrect, definition }: DragDropBlockProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [validated, setValidated] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleSelect = (opt: DragDropOption) => {
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
        {options.map((opt: DragDropOption) => {
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
          {isCorrect ? options.find((o: DragDropOption) => o.id === selected)?.correctFeedback || 'ممتاز!' : options.find((o: DragDropOption) => o.id === selected)?.wrongFeedback || 'حاول مرة أخرى'}
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

export default function InteractiveLessonView({
  lessonId,
  onClose,
  onStartLesson,
  onNavigateToTab,
  onLaunchReflexMission,
  onDocumentEvidence,
}: InteractiveLessonViewProps) {
  const activeLesson = ACTIVE_LESSONS[lessonId];
  // V3 — micro-reprise ciblée (affichée quand l'élève clique sur "ثبّت هذه الفكرة").
  const [microRemediationId, setMicroRemediationId] = React.useState<string | null>(null);
  const remediation = microRemediationId ? getMicroRemediationByCode(microRemediationId) ?? (microRemediationId.startsWith('mr_') ? Object.values(MICRO_REMEDIATIONS).find((r) => r.id === microRemediationId) : undefined) : undefined;

  // V3 — Carte de micro-reprise ciblée (affichée au-dessus du tunnel, en overlay).
  if (remediation) {
    return (
      <div className="fixed inset-0 z-[60] bg-black/30 flex items-center justify-center p-4" dir="rtl">
        <div className="bg-white dark:bg-[#141916] rounded-3xl p-5 max-w-lg w-full shadow-xl space-y-3">
          <div className="text-sm font-black text-[#944a00] dark:text-amber-300">🎯 {remediation.titleAr}</div>
          <p className="text-xs text-[#1f1c0b] dark:text-gray-200 leading-6">{remediation.explanationAr}</p>
          <p className="text-sm font-bold text-[#1f1c0b] dark:text-white">❓ {remediation.activeQuestionAr}</p>
          <div className="flex gap-2">
            <button
              onClick={() => setMicroRemediationId(null)}
              className="flex-1 py-2.5 rounded-xl bg-[#006d37] hover:bg-[#00562b] text-white font-black text-sm cursor-pointer"
            >
              فهمت — عدّ للتحدّي
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Pilier 1 : tunnel actif "Mot par Mot" (si une leçon active est définie).
  if (activeLesson) {
    return (
      <ActiveLessonTunnel
        lesson={activeLesson}
        onClose={onClose}
        onStartLesson={onStartLesson}
        onNavigateToTab={onNavigateToTab}
        onLaunchReflexMission={onLaunchReflexMission}
        onOpenMicroRemediation={setMicroRemediationId}
        onDocumentEvidence={onDocumentEvidence}
      />
    );
  }

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

// ============================================================================
// PILIER 1 : Leçon Active "Mot par Mot" — tunnel à étapes verrouillées.
// ============================================================================

function renderContentWithBlanks(content: string) {
  const parts = content.split('[____]');
  return parts.map((part, i) => (
    <React.Fragment key={i}>
      {part}
      {i < parts.length - 1 && (
        <span className="inline-block bg-[#fed65b]/30 border-b-2 border-dashed border-[#006d37] px-2 mx-1 min-w-[70px] text-center">
          ........
        </span>
      )}
    </React.Fragment>
  ));
}

function ActiveLessonTunnel({
  lesson,
  onClose,
  onStartLesson,
  onNavigateToTab,
  onLaunchReflexMission,
  onOpenMicroRemediation,
  onDocumentEvidence,
}: {
  lesson: ActiveLesson;
  onClose: () => void;
  onStartLesson?: (lessonId: string) => void;
  onNavigateToTab?: (tab: 'path' | 'lessons' | 'training' | 'progress') => void;
  onLaunchReflexMission?: (reflexId: CoreReflexId, meta: { missionId: string; conceptId: string; relatedErrorIds?: string[] }) => void;
  onOpenMicroRemediation?: (remediationId: string) => void;
  onDocumentEvidence?: (outcome: { passed: boolean; evidenceId?: string; errorCreated: boolean }) => void;
}) {
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0);
  const [validated, setValidated] = useState<boolean[]>(() => lesson.blocks.map(() => false));
  const [blockData, setBlockData] = useState<Record<number, any>>({});
  const [blocksCompleted, setBlocksCompleted] = useState(false);
  const [exitPracticeOpened, setExitPracticeOpened] = useState(false);
  const [sessionOutcome, setSessionOutcome] = useState<LessonSessionOutcome | null>(null);

  const setBlockState = (i: number, patch: any) =>
    setBlockData((prev) => ({ ...prev, [i]: { ...prev[i], ...patch } }));

  const validateBlock = (i: number) => {
    const next = [...validated];
    next[i] = true;
    setValidated(next);
    if (i < lesson.blocks.length - 1) {
      setTimeout(() => setCurrentBlockIndex(i + 1), 500);
    } else if (i === lesson.blocks.length - 1) {
      setBlocksCompleted(true);
      setExitPracticeOpened(true);
    }
  };

  const handleHotspotClick = (e: React.MouseEvent<HTMLImageElement>, i: number, block: any) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const ok = isInsideHotspot(x, y, block.hotspot.correctZone);
    setBlockState(i, { hotspotOk: ok });
    if (ok) {
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(60);
      setTimeout(() => validateBlock(i), 600);
    }
  };

  if (blocksCompleted && exitPracticeOpened && sessionOutcome !== null) {
    return (
      <CompletionSheet
        lesson={lesson}
        outcome={sessionOutcome}
        onClose={onClose}
        onStartLesson={onStartLesson}
        onNavigateToTab={onNavigateToTab}
        onLaunchReflexMission={onLaunchReflexMission}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#f8f9fa] dark:bg-[#0c0f0d] flex flex-col font-sans" dir="rtl">
      {/* Header */}
      <header className="p-4 flex justify-between items-center bg-white dark:bg-[#141916] border-b border-[#e2dabf]/50 shadow-sm">
        <button onClick={onClose} className="p-2 rounded-full hover:bg-[#f3f4f5] text-[#506072] cursor-pointer">
          <X className="w-6 h-6" />
        </button>
        <div className="text-center flex-1 px-4">
          <h1 className="font-black text-[#006d37] dark:text-[#2ecc71] text-sm md:text-base line-clamp-1">{lesson.title}</h1>
          <p className="text-[10px] text-[#506072] dark:text-gray-400">تعلّم نشط — كلمة بكلمة</p>
        </div>
        <div className="w-10 text-[10px] font-bold text-[#506072]">{currentBlockIndex + 1}/{lesson.blocks.length}</div>
      </header>

      {/* US-V3-01 — Écran mission (Résumé d'Or) repliable, durée calculée honnête. */}
      {(() => {
        const gs = getLessonGoldSummary(lesson.id);
        if (!gs) return null;
        const estimated = lesson.blocks.length * 2 + 3; // blocs + document/défi
        return <MissionBanner summary={gs} estimatedMinutes={estimated} />;
      })()}

      {/* Progress verrouillé */}
      <div className="px-4 py-3 bg-white dark:bg-[#141916] border-b border-[#e2dabf]/30">
        <div className="flex gap-2 max-w-2xl mx-auto">
          {lesson.blocks.map((_, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className={`w-full h-2 rounded-full transition-all ${validated[i] ? 'bg-[#2ecc71]' : i === currentBlockIndex ? 'bg-[#006d37] animate-pulse' : 'bg-[#e2dabf]/30'}`} />
              <span className={`text-[9px] font-bold ${i === currentBlockIndex ? 'text-[#006d37] dark:text-[#2ecc71]' : 'text-[#bbcbbb]'}`}>{i + 1}</span>
            </div>
          ))}
        </div>
      </div>

      <main className="flex-1 overflow-y-auto p-4 pb-32">
        <div className="max-w-2xl mx-auto space-y-6">
          {lesson.blocks.map((block: Block, i: number) => {
            const isCurrent = i === currentBlockIndex;
            const isDone = validated[i];
            if (!isCurrent && !isDone) {
              // Bloc verrouillé (flouté)
              return (
                <div key={i} className="p-4 bg-white/60 dark:bg-white/5 border border-[#e2dabf]/40 rounded-2xl text-center text-[#506072] blur-[3px] select-none">
                  <Lock className="w-6 h-6 mx-auto mb-1" />
                  <span className="text-xs font-bold">مرحلة مقفلة — أتمم المرحلة السابقة</span>
                </div>
              );
            }
            return (
              <AnimatePresence mode="wait" key={i}>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-4"
                >
                  {block.type === 'TEXT_AND_PRODUCE' ? (
                    <TextAndProduceBlockView
                      block={block}
                      lessonId={lesson.id}
                      blockIndex={i}
                      state={blockData[i] || {}}
                      setState={(patch: any) => setBlockState(i, patch)}
                      onValidated={() => validateBlock(i)}
                    />
                  ) : (
                    <HotspotAndMethodologyBlockView
                      block={block}
                      lessonId={lesson.id}
                      blockIndex={i}
                      state={blockData[i] || {}}
                      setState={(patch: any) => setBlockState(i, patch)}
                      onHotspotClick={(e: React.MouseEvent<HTMLImageElement>) => handleHotspotClick(e, i, block)}
                      onValidated={() => validateBlock(i)}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            );
          })}
        </div>

        {blocksCompleted && exitPracticeOpened && (
          <LessonExitSection
            lessonId={lesson.id}
            exerciseId={LESSON_DOCUMENT_EXERCISE_ID[lesson.id]}
            onOpenMicroRemediation={onOpenMicroRemediation}
            onDocumentEvidence={onDocumentEvidence}
            onCompletePractice={setSessionOutcome}
          />
        )}
      </main>
    </div>
  );
}

// Correction A — CompletionSheet : fin de leçon + orientation réelle (§3).
function CompletionSheet({
  lesson,
  outcome,
  onClose,
  onStartLesson,
  onNavigateToTab,
  onLaunchReflexMission,
}: {
  lesson: ActiveLesson;
  outcome: LessonSessionOutcome;
  onClose: () => void;
  onStartLesson?: (lessonId: string) => void;
  onNavigateToTab?: (tab: 'path' | 'lessons' | 'training' | 'progress') => void;
  onLaunchReflexMission?: (reflexId: CoreReflexId, meta: { missionId: string; conceptId: string; relatedErrorIds?: string[] }) => void;
}) {
  const progression: LessonProgression | undefined = getLessonProgression(lesson.id);
  // Difficulté détectée = erreur méthodologique active sur ce concept (Speckit B/A).
  const hasActiveError = React.useMemo(() => {
    try {
      const store = loadStore();
      return store.learningErrors.some(
        (e: any) => !e.resolvedAt && (e.conceptId === lesson.id || (progression?.recommendedReflexId && e.reflexId === progression.recommendedReflexId))
      );
    } catch {
      return false;
    }
  }, [lesson.id, progression]);
  const needsConsolidation = outcome === 'failed' || outcome === 'aborted' || hasActiveError;

  const outcomeMessage = outcome === 'passed'
    ? 'أكملت الوثيقة وتحدي BAC بنجاح.'
    : outcome === 'doc_only'
      ? 'سجّلت دليلاً وثائقياً دون إتمام تحدي BAC.'
      : outcome === 'failed'
        ? 'أنهيت الممارسة مع فكرة تحتاج إلى تثبيت.'
        : 'أنهيت الجلسة دون تسجيل دليل جديد.';

  const goNext = () => {
    if (progression?.nextLessonId && onStartLesson) {
      onStartLesson(progression.nextLessonId);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#f8f9fa] dark:bg-[#0c0f0d] flex flex-col font-sans" dir="rtl">
      <header className="p-4 flex justify-between items-center bg-white dark:bg-[#141916] border-b border-[#e2dabf]/50 shadow-sm">
        <button onClick={onClose} className="p-2 rounded-full hover:bg-[#f3f4f5] text-[#506072] cursor-pointer">
          <X className="w-6 h-6" />
        </button>
        <div className="text-center flex-1 px-4">
          <h1 className="font-black text-[#006d37] dark:text-[#2ecc71] text-sm md:text-base line-clamp-1">{lesson.title}</h1>
          <p className="text-[10px] text-[#506072] dark:text-gray-400">اكتملت الدرس</p>
        </div>
        <div className="w-10" />
      </header>

      <main className="flex-1 overflow-y-auto p-4 pb-32">
        <div className="max-w-2xl mx-auto space-y-5">
          <div className="rounded-3xl p-6 bg-gradient-to-br from-[#006d37] to-[#00562b] text-white text-center shadow-md">
            <CheckCircle2 className="w-12 h-12 mx-auto text-[#fed65b]" />
            <h2 className="font-black text-2xl mt-2">أكملت الجلسة</h2>
            <p className="text-white/90 text-sm mt-2 leading-7">{outcomeMessage}</p>
            {progression?.completionMessageAr && outcome === 'passed' && (
              <p className="text-white/90 text-sm mt-2 leading-7">{progression.completionMessageAr}</p>
            )}
          </div>

          <div className="space-y-3">
            {progression?.nextLessonId && (
              <button
                onClick={goNext}
                className="w-full py-4 rounded-2xl bg-[#006d37] hover:bg-[#00562b] text-white font-black text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <ArrowLeft className="w-5 h-5" />
                تابع إلى الدرس التالي
              </button>
            )}

            {needsConsolidation && (
              <button
                onClick={() => {
                  const reflex = progression?.recommendedReflexId ?? 'analyse';
                  if (onLaunchReflexMission) {
                    onLaunchReflexMission(reflex, { missionId: `consolidate_${lesson.id}`, conceptId: lesson.id });
                  } else {
                    onClose();
                  }
                }}
                className="w-full py-4 rounded-2xl bg-[#ffb347] hover:bg-[#ff9a4a] text-white font-black text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Brain className="w-5 h-5" />
                ثبّت هذه الفكرة في 3 دقائق
              </button>
            )}

            <button
              onClick={() => (onNavigateToTab ? onNavigateToTab('path') : onClose())}
              className="w-full py-3 rounded-2xl bg-white dark:bg-[#141916] border border-[#e2dabf]/60 text-[#506072] dark:text-gray-300 font-bold text-sm flex items-center justify-center gap-2 cursor-pointer hover:bg-[#fff9ed] dark:hover:bg-white/5 transition-colors"
            >
              العودة إلى مساري
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

function BacTransferChallengeSection({
  lessonId,
  onAttempt,
}: {
  lessonId: string;
  onAttempt: (passed: boolean) => void;
}) {
  const challenge = getLessonTransferChallenge(lessonId);
  if (!challenge) return null;
  return <BacTransferChallenge challenge={challenge} onAttempt={onAttempt} />;
}

// V3 US-V3-02 — Sortie de leçon : document vivant par leçon.
const LESSON_DOCUMENT_EXERCISE_ID: Record<string, string> = {
  'd1-u1-l2-transcription': 'uracile_marque',
  'lecon_transcription': 'uracile_marque',
  'phase11_chapitres_21_22': 'photosynthese_cycle',
  'synapse': 'synapse_integration',
  'subduction': 'subduction_water_melting',
  'protein_structure_function': 'mutation_protein_function',
};

function LessonExitSection({
  lessonId,
  exerciseId,
  onOpenMicroRemediation,
  onDocumentEvidence,
  onCompletePractice,
}: {
  lessonId: string;
  exerciseId?: string;
  onOpenMicroRemediation?: (remediationId: string) => void;
  onDocumentEvidence?: (outcome: { passed: boolean; evidenceId?: string; errorCreated: boolean }) => void;
  onCompletePractice: (outcome: LessonSessionOutcome) => void;
}) {
  const showLiveDoc = !!exerciseId;
  const [documentAttempted, setDocumentAttempted] = useState(false);
  const [documentPassed, setDocumentPassed] = useState(false);
  const [bacAttempted, setBacAttempted] = useState(false);
  const [bacPassed, setBacPassed] = useState(false);

  const handleDocumentEvidence = (outcome: { passed: boolean; evidenceId?: string; errorCreated: boolean }) => {
    setDocumentAttempted(true);
    setDocumentPassed(outcome.passed);
    onDocumentEvidence?.(outcome);
  };

  const handleBacAttempt = (passed: boolean) => {
    setBacAttempted(true);
    setBacPassed(passed);
  };

  const finishPractice = () => {
    if (documentPassed && bacPassed) {
      onCompletePractice('passed');
    } else if (documentPassed && !bacAttempted) {
      onCompletePractice('doc_only');
    } else if (documentAttempted || bacAttempted) {
      onCompletePractice('failed');
    } else {
      onCompletePractice('aborted');
    }
  };

  return (
    <div className="space-y-4">
      {showLiveDoc && exerciseId && (
        <LiveDocumentUracile
          exerciseId={exerciseId}
          onOpenMicroRemediation={onOpenMicroRemediation}
          onEvidence={handleDocumentEvidence}
        />
      )}
      <BacTransferChallengeSection lessonId={lessonId} onAttempt={handleBacAttempt} />
      <button
        onClick={finishPractice}
        className="w-full py-3 rounded-2xl bg-[#006d37] hover:bg-[#00562b] text-white font-black text-sm shadow-md cursor-pointer"
      >
        إنهاء الممارسة والانتقال
      </button>
    </div>
  );
}

// Défi BAC de sortie : la réussite est calculée par ValidationEngine (réelle),
// jamais déclarée par l'élève. Correction masquée avant tentative.
function BacTransferChallenge({
  challenge,
  onAttempt,
}: {
  challenge: LessonTransferChallenge;
  onAttempt: (passed: boolean) => void;
}) {
  const [answer, setAnswer] = useState('');
  const [attempted, setAttempted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [passed, setPassed] = useState(false);

  const handleValidate = () => {
    if (answer.trim().length < 5) return;
    const result = validateAnswer(answer, { ...challenge.validation, isNeuromuscular: challenge.validation.isNeuromuscular ?? false });
    const s = Math.round((result.score / result.maxScore) * 100);
    setAttempted(true);
    setScore(s);
    const attemptPassed = result.passed && s >= 70;
    setPassed(attemptPassed);

    recordLessonTransferEvidence({
      lessonId: challenge.lessonId,
      conceptId: challenge.conceptId,
      reflexId: challenge.reflexId,
      score: s,
      ruleIds: result.errors.map((e) => e.code),
    });
    onAttempt(attemptPassed);
  };

  return (
    <div className="p-4 bg-[#fff9ed] dark:bg-[#1c241f] border border-[#e2dabf]/60 rounded-2xl shadow-sm space-y-3">
      <div className="flex items-center gap-2">
        <Target className="w-5 h-5 text-[#006d37]" />
        <span className="text-xs font-black bg-[#006d37] text-white px-2.5 py-1 rounded-full">تحدي BAC</span>
        <span className="text-xs font-bold text-[#944a00] dark:text-amber-300">{challenge.titleAr}</span>
      </div>
      <p className="text-sm leading-8 text-[#1f1c0b] dark:text-gray-100">{challenge.contextAr}</p>
      <p className="text-sm font-bold text-[#1f1c0b] dark:text-white">{challenge.questionAr}</p>

      <textarea
        value={answer}
        onChange={(e) => { setAnswer(e.target.value); setAttempted(false); setScore(null); }}
        rows={4}
        placeholder="اكتب إجابتك التحليلية هنا…"
        className="w-full p-3 rounded-2xl border border-[#e2dabf]/60 bg-white dark:bg-[#0c0f0d] text-sm leading-8 text-right focus:outline-none focus:ring-2 focus:ring-[#006d37]/20"
        dir="rtl"
      />

      {!attempted && (
        <button
          onClick={handleValidate}
          disabled={answer.trim().length < 5}
          className="w-full py-2.5 rounded-xl bg-[#006d37] hover:bg-[#00562b] disabled:opacity-40 text-white font-black text-sm shadow-sm cursor-pointer"
        >
          صحّح بالمصحح الحقيقي
        </button>
      )}

      {attempted && (
        <div className="space-y-3 animate-in fade-in">
          <div className={`p-3 rounded-xl text-[12px] leading-7 font-bold border ${
            passed ? 'bg-[#2ecc71]/10 text-[#006d37] border-[#2ecc71]/20' : 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/20 dark:text-amber-200 dark:border-amber-900/40'
          }`}>
            {passed
              ? '✅ أحسنت، طبّقت المنهجية بنجاح. تم تسجيل دليل حقيقي لتقدّمك.'
              : '⚠️ راجع العناصر الناقصة ثم أعد المحاولة. تم تسجيل نقطة تحتاج إلى مراجعة.'}
            {score != null && <span className="block mt-1 font-black">{score} / 100</span>}
          </div>

          {/* Correction visible UNIQUEMENT après tentative. */}
          <div className="bg-white dark:bg-black/20 border border-amber-200/50 dark:border-amber-900/30 rounded-xl px-3 py-2 text-[12px] font-bold text-amber-800 dark:text-amber-300">
            <span className="font-black">التصحيح:</span> {challenge.correctionAr}
          </div>
        </div>
      )}
    </div>
  );
}

function TextAndProduceBlockView({
  block,
  lessonId,
  blockIndex,
  state,
  setState,
  onValidated,
}: {
  block: any;
  lessonId: string;
  blockIndex: number;
  state: any;
  setState: (patch: any) => void;
  onValidated: () => void;
}) {
  const [text, setText] = useState('');
  const [checked, setChecked] = useState(false);
  const ok = checked && checkProduction(text, block.microTest.acceptedAnswers);

  const verify = () => {
    const valid = checkProduction(text, block.microTest.acceptedAnswers);
    setChecked(true);
    if (valid) {
      onValidated();
    } else {
      // Module 3 — Tracking des lacunes : échec du micro-test (mots-clés manquants).
      logEvent('METHOD_FAIL', {
        lessonId,
        blockIndex,
        missingKeywords: block.microTest.acceptedAnswers,
      });
    }
  };

  return (
    <div className="p-4 bg-white dark:bg-[#141916] border border-[#e2dabf]/60 rounded-2xl shadow-sm space-y-3">
      <div className="flex items-center gap-2">
        <BookOpen className="w-5 h-5 text-[#fed65b]" />
        <span className="text-xs font-black bg-[#006d37] text-white px-2.5 py-1 rounded-full">الهدف</span>
        <span className="text-xs text-[#506072] dark:text-gray-400">{block.objective}</span>
      </div>

      <p className="text-sm md:text-base leading-9 text-[#1f1c0b] dark:text-gray-100">{renderContentWithBlanks(block.content)}</p>

      {Object.keys(block.popups || {}).length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(block.popups).map(([term]: any) => (
            <button
              key={term}
              onClick={() => setState({ openPopup: state.openPopup === term ? null : term })}
              className="text-[10px] bg-[#006d37]/10 border border-[#006d37]/20 hover:bg-[#006d37]/20 text-[#006d37] dark:text-[#2ecc71] px-2 py-1 rounded-full cursor-pointer"
            >
              {term}
            </button>
          ))}
        </div>
      )}
      {state.openPopup && block.popups[state.openPopup] && (
        <div className="p-3 bg-[#fff9ed] dark:bg-[#1c241f] border border-[#e2dabf]/60 rounded-xl text-xs leading-6">
          <strong className="text-[#944a00]">{state.openPopup}:</strong> {block.popups[state.openPopup]}
        </div>
      )}

      {/* Micro-test */}
      <div className="mt-2 p-3 bg-[#f3f8f4] dark:bg-[#10231a] border border-[#2ecc71]/30 rounded-xl space-y-2">
        <p className="text-sm font-bold text-[#1f1c0b] dark:text-gray-100">{block.microTest.prompt}</p>
        <input
          value={text}
          onChange={(e) => { setText(e.target.value); setChecked(false); }}
          placeholder="اكتب الكلمة السرية هنا..."
          className="w-full p-2.5 rounded-xl border border-[#e2dabf]/60 bg-white dark:bg-[#0c0f0d] text-sm text-right focus:outline-none focus:ring-2 focus:ring-[#006d37]"
          dir="rtl"
        />
        {!ok && (
          <button onClick={verify} className="w-full py-2 rounded-xl bg-[#006d37] hover:bg-[#00562b] text-white font-black text-sm cursor-pointer">
            تحقق
          </button>
        )}
        {checked && ok && (
          <div className="flex items-center gap-2 text-[#006d37] dark:text-[#2ecc71] font-bold text-sm">
            <CheckCircle2 className="w-5 h-5" /> ممتاز! الكلمة صحيحة — انتقل للمرحلة التالية.
          </div>
        )}
        {checked && !ok && (
          <p className="text-rose-400 font-bold text-xs">{block.microTest.errorHint}</p>
        )}
      </div>
    </div>
  );
}

function HotspotAndMethodologyBlockView({
  block,
  lessonId,
  blockIndex,
  state,
  onHotspotClick,
  onValidated,
}: {
  block: any;
  lessonId: string;
  blockIndex: number;
  state: any;
  setState: (patch: any) => void;
  onHotspotClick: (e: React.MouseEvent<HTMLImageElement>) => void;
  onValidated: () => void;
}) {
  const [stepResults, setStepResults] = useState<Record<number, any>>({});
  // Dédupe : on logge l'échec d'une étape au plus une fois jusqu'à ce qu'elle devienne valide.
  const loggedFails = useRef<Record<number, boolean>>({});
  const allStepsValid =
    block.methodology.steps.length > 0 &&
    block.methodology.steps.every((_: any, idx: number) => stepResults[idx]?.valid);

  const checkStep = (idx: number, value: string) => {
    const step = block.methodology.steps[idx];
    const kw = checkMethodologyStep(value, step.requiredKeywords);
    const isAnalysis = step.label.includes('تحليل');
    const pure = isAnalysis ? checkAnalysisPurity(value) : true;
    setStepResults((prev) => ({
      ...prev,
      [idx]: { valid: kw.valid && pure, kwMessage: kw.message, pure },
    }));

    // Module 3 — Tracking des lacunes pédagogiques (TEST 6).
    const hasContent = value.trim().length > 0;
    if (hasContent && (!kw.valid || !pure)) {
      if (!loggedFails.current[idx]) {
        loggedFails.current[idx] = true;
        const missing = step.requiredKeywords.filter((k: string) => !value.includes(k));
        logEvent('METHOD_FAIL', { lessonId, blockIndex, missingKeywords: missing });
      }
    } else if (kw.valid && pure) {
      loggedFails.current[idx] = false;
      logEvent('METHOD_SUCCESS', { lessonId, blockIndex });
    }
  };

  return (
    <div className="space-y-4">
      <div className="p-4 bg-white dark:bg-[#141916] border border-[#e2dabf]/60 rounded-2xl shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-[#fed65b]" />
          <span className="text-xs font-black bg-[#006d37] text-white px-2.5 py-1 rounded-full">الهدف</span>
          <span className="text-xs text-[#506072] dark:text-gray-400">{block.objective}</span>
        </div>
        <p className="text-sm leading-8 text-[#1f1c0b] dark:text-gray-100">{block.introText}</p>

        {/* Hotspot image */}
        <div className="relative rounded-xl overflow-hidden border bg-[#f3f4f5]">
          <ZoomImageButton src={block.schemaSrc} alt={block.hotspot.prompt} referrerPolicy="no-referrer" className="absolute top-2 right-2" />
          <img
            src={block.schemaSrc}
            alt={block.hotspot.prompt}
            className="w-full h-56 object-contain cursor-crosshair select-none"
            onClick={onHotspotClick}
            draggable={false}
          />
          {state.hotspotOk && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#006d37]/20">
              <span className="px-3 py-2 bg-[#006d37] text-white text-xs font-bold rounded-xl flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> {block.hotspot.successFeedback}
              </span>
            </div>
          )}
        </div>
        <p className="text-xs font-bold text-[#1f1c0b] dark:text-gray-100 flex items-center gap-1">
          <MousePointerClick className="w-4 h-4 text-[#006d37]" /> {block.hotspot.prompt}
        </p>
        {state.hotspotOk === false && (
          <p className="text-rose-400 font-bold text-xs">❌ غير صحيح — انقر على المقر الصحيح داخل المخطط.</p>
        )}
      </div>

      {/* Methodology */}
      <div className="p-4 bg-[#fff9ed] dark:bg-[#1c241f] border border-[#e2dabf]/60 rounded-2xl space-y-3">
        <p className="text-sm font-bold text-[#1f1c0b] dark:text-gray-100">{block.methodology.prompt}</p>
        {block.methodology.steps.map((step: any, idx: number) => (
          <div key={idx} className="space-y-2">
            <label className="text-xs font-black text-[#944a00] block">{step.label}</label>
            <textarea
              placeholder={step.placeholder}
              onChange={(e) => checkStep(idx, e.target.value)}
              className="w-full p-2.5 rounded-xl border border-[#e2dabf]/60 bg-white dark:bg-[#0c0f0d] text-sm text-right focus:outline-none focus:ring-2 focus:ring-[#006d37]"
              rows={2}
              dir="rtl"
            />
            {stepResults[idx] && !stepResults[idx].valid && (
              <p className="text-rose-400 font-bold text-xs">
                {!stepResults[idx].pure
                  ? '⚠️ خطأ منهجي: التحليل ملاحظة محضة. احذف التفسير (لأن/راجع إلى).'
                  : stepResults[idx].kwMessage}
              </p>
            )}
            {stepResults[idx]?.valid && (
              <p className="text-[#006d37] dark:text-[#2ecc71] font-bold text-xs flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> {stepResults[idx].kwMessage}
              </p>
            )}
          </div>
        ))}
        {allStepsValid && (
          <button onClick={onValidated} className="w-full py-2 rounded-xl bg-[#006d37] hover:bg-[#00562b] text-white font-black text-sm cursor-pointer">
            إنهاء التحليل ←
          </button>
        )}
      </div>
    </div>
  );
}

