import React, { useState, useRef, useEffect, useId } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, AlertTriangle, Lightbulb, Target, BookOpen, Brain, FileText, MousePointerClick, Lock, ArrowLeft } from 'lucide-react';
import LessonAdventurePortal from './LessonAdventurePortal';
import { getExperimentalLesson, LESSON_LIBRARY } from '../lessonData';
import { SINGLE_PATH_LESSONS, SinglePathLesson } from '../data/singlePathLessons';
import SpeechToTextInput from './SpeechToTextInput';
import {
  ACTIVE_LESSONS,
  ActiveLesson,
  Block,
  MissionChoiceBlock,
  GuidedDocQaBlock,
  DualEvidenceBlock,
  HypothesisExperimentBlock,
  ComparisonTableBlock,
  SequenceOrderBlock,
  ReasoningCountBlock,
} from '../data/activeLessons';
import { checkProduction, checkMethodologyStep, checkAnalysisPurity, isInsideHotspot } from '../utils/methodologyChecker';
import { logEvent } from '../utils/telemetryService';
import { ZoomImageButton } from './ZoomableImage';
import { getLessonTransferChallenge, hasTransferContent, type LessonTransferChallenge } from '../data/lessonTransferChallenges';
import { validateAnswer } from '../lib/validation/ValidationEngine';
import { runSessionEffects, buildEffectsForEvent, buildTransferEvidenceEffect } from '../lib/lesson/sessionEffectsService';
import { getLessonProgression, type LessonProgression } from '../data/activeLessons';
import { getLessonGoldSummary } from '../data/lessonGoldSummaries';
import { getMicroRemediationByCode } from '../data/microRemediations';
import type { CoreReflexId } from '../data/reflexes';
import { loadStore } from '../data/store';
import LiveDocumentUracile from './LiveDocumentUracile';
import MissionBanner from './MissionBanner';
import { MICRO_REMEDIATIONS } from '../data/microRemediations';
import { tunnelReducer } from '../lib/lesson/tunnelStateMachine';
import { loadLessonSnapshot, clearLessonSnapshot } from '../lib/lesson/sessionSnapshotService';
import type { LessonSessionSnapshot } from '../lib/lesson/sessionSnapshotService';
import type { LessonSessionEvent, LessonSessionOutcome } from '../lib/lesson/tunnelStateMachine';
import {
  validateComparisonRow,
  validateDualEvidenceAnswer,
  validateEngineAnswer,
  validateHypothesisNaming,
  validateKeywordAnswer,
  validateReasoningCount,
  validateSequenceOrder,
} from '../services/proteinChapterValidationService';

interface InteractiveLessonViewProps {
  lessonId: string;
  onClose: () => void;
  onStartLesson?: (lessonId: string) => void;
  onNavigateToTab?: (tab: 'path' | 'lessons' | 'training' | 'progress') => void;
  onLaunchReflexMission?: (reflexId: CoreReflexId, meta: { missionId: string; conceptId: string; relatedErrorIds?: string[] }) => void;
  onDocumentEvidence?: (outcome: { passed: boolean; evidenceId?: string; errorCreated: boolean }) => void;
}

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
  const initialSession = React.useMemo(
    () => ({
      state: 'BLOCKS_IN_PROGRESS' as const,
      currentBlockIndex: 0,
      validatedBlocks: Array(lesson.blocks.length).fill(false),
      totalBlocks: lesson.blocks.length,
      outcome: null,
      feedbackViewed: false,
    }),
    [lesson.id, lesson.blocks.length]
  );

  const [session, dispatch] = React.useReducer(tunnelReducer, initialSession);
  const [blockData, setBlockData] = React.useState<Record<number, any>>({});
  const [resumeSnapshot, setResumeSnapshot] = React.useState<LessonSessionSnapshot | null>(null);
  const [showResumePrompt, setShowResumePrompt] = React.useState(false);
  const sessionId = React.useId();
  const eventRevision = React.useRef(0);

  useEffect(() => {
    const saved = loadLessonSnapshot(lesson.id);
    if (saved && saved.state === 'SESSION_SUSPENDED') {
      setResumeSnapshot(saved);
      setShowResumePrompt(true);
    }
  }, [lesson.id]);

  const sessionRef = React.useRef(session);
  sessionRef.current = session;

  const dispatchSessionEvent = React.useCallback(
    (event: LessonSessionEvent) => {
      const next = tunnelReducer(sessionRef.current, event);
      dispatch(event);
      const eventId = `tunnel_${lesson.id}_${sessionId}_${++eventRevision.current}`;
      const effects = buildEffectsForEvent(event, next, lesson.id, eventId);
      runSessionEffects(effects);
      return next;
    },
    [lesson.id, sessionId]
  );

  const handleClose = () => {
    dispatchSessionEvent({ type: 'EXIT' });
    onClose();
  };

  const setBlockState = (i: number, patch: any) =>
    setBlockData((prev) => ({ ...prev, [i]: { ...prev[i], ...patch } }));

  const validateBlock = (i: number) => {
    dispatchSessionEvent({ type: 'VALIDATE_BLOCK', blockIndex: i });
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

  const practiceVisible =
    session.state === 'EXIT_PRACTICE' ||
    (session.state === 'SESSION_SUSPENDED' && session.validatedBlocks.every(Boolean));

  if (practiceVisible) {
    return (
      <div className="fixed inset-0 z-50 bg-[#f8f9fa] dark:bg-[#0c0f0d] flex flex-col font-sans" dir="rtl">
        <header className="p-4 flex justify-between items-center bg-white dark:bg-[#141916] border-b border-[#e2dabf]/50 shadow-sm">
          <button onClick={handleClose} className="p-2 rounded-full hover:bg-[#f3f4f5] text-[#506072] cursor-pointer">
            <X className="w-6 h-6" />
          </button>
          <div className="text-center flex-1 px-4">
            <h1 className="font-black text-[#006d37] dark:text-[#2ecc71] text-sm md:text-base line-clamp-1">{lesson.title}</h1>
            <p className="text-[10px] text-[#506072] dark:text-gray-400">تعلّم نشط — كلمة بكلمة</p>
          </div>
          <div className="w-10 text-[10px] font-bold text-[#506072]">{session.currentBlockIndex + 1}/{lesson.blocks.length}</div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 pb-32">
          <div className="max-w-2xl mx-auto space-y-4">
          <LessonExitSection
            lessonId={lesson.id}
            exerciseId={LESSON_DOCUMENT_EXERCISE_ID[lesson.id]}
            onOpenMicroRemediation={onOpenMicroRemediation}
            onDocumentEvidence={onDocumentEvidence}
            onCompletePractice={(outcome) => dispatchSessionEvent({ type: 'SET_OUTCOME', outcome })}
          />
          </div>
        </main>
      </div>
    );
  }

  if (session.state === 'COMPLETION_VISIBLE' && session.outcome !== null) {
    return (
      <CompletionSheet
        lesson={lesson}
        outcome={session.outcome}
        onClose={onClose}
        onStartLesson={onStartLesson}
        onNavigateToTab={onNavigateToTab}
        onLaunchReflexMission={onLaunchReflexMission}
      />
    );
  }

  if (showResumePrompt && resumeSnapshot) {
    return (
      <ResumeOverlay
        lesson={lesson}
        onResume={() => {
          dispatchSessionEvent({
            type: 'RESUME_SESSION',
            currentBlockIndex: resumeSnapshot.currentBlockIndex,
            validatedBlocks: resumeSnapshot.validatedBlocks,
          });
          setShowResumePrompt(false);
        }}
        onNew={() => {
          clearLessonSnapshot(lesson.id);
          dispatchSessionEvent({ type: 'START_LESSON' });
          setShowResumePrompt(false);
        }}
        onClose={onClose}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#f8f9fa] dark:bg-[#0c0f0d] flex flex-col font-sans" dir="rtl">
      {/* Header */}
      <header className="p-4 flex justify-between items-center bg-white dark:bg-[#141916] border-b border-[#e2dabf]/50 shadow-sm">
        <button onClick={handleClose} className="p-2 rounded-full hover:bg-[#f3f4f5] text-[#506072] cursor-pointer">
          <X className="w-6 h-6" />
        </button>
        <div className="text-center flex-1 px-4">
          <h1 className="font-black text-[#006d37] dark:text-[#2ecc71] text-sm md:text-base line-clamp-1">{lesson.title}</h1>
          <p className="text-[10px] text-[#506072] dark:text-gray-400">تعلّم نشط — كلمة بكلمة</p>
        </div>
        <div className="w-10 text-[10px] font-bold text-[#506072]">{session.currentBlockIndex + 1}/{lesson.blocks.length}</div>
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
              <div className={`w-full h-2 rounded-full transition-all ${session.validatedBlocks[i] ? 'bg-[#2ecc71]' : i === session.currentBlockIndex ? 'bg-[#006d37] animate-pulse' : 'bg-[#e2dabf]/30'}`} />
              <span className={`text-[9px] font-bold ${i === session.currentBlockIndex ? 'text-[#006d37] dark:text-[#2ecc71]' : 'text-[#bbcbbb]'}`}>{i + 1}</span>
            </div>
          ))}
        </div>
      </div>

      <main className="flex-1 overflow-y-auto p-4 pb-32">
        <div className="max-w-2xl mx-auto space-y-6">
          {lesson.blocks.map((block: Block, i: number) => {
            const isCurrent = i === session.currentBlockIndex;
            const isDone = session.validatedBlocks[i];
            if (!isCurrent && !isDone) {
              // Bloc verrouillé (flouté)
              return (
                <div key={i} data-testid="lesson-block" data-block-index={i} data-block-state="locked" className="p-4 bg-white/60 dark:bg-white/5 border border-[#e2dabf]/40 rounded-2xl text-center text-[#506072] blur-[3px] select-none">
                  <Lock className="w-6 h-6 mx-auto mb-1" />
                  <span className="text-xs font-bold">مرحلة مقفلة — أتمم المرحلة السابقة</span>
                </div>
              );
            }
            return (
              <AnimatePresence mode="wait" key={i}>
                <motion.div
                  data-testid="lesson-block"
                  data-block-index={i}
                  data-block-state={isCurrent ? 'current' : 'completed'}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-4"
                >
                  {block.type === 'TEXT_AND_PRODUCE' && (
                    <TextAndProduceBlockView
                      block={block}
                      lessonId={lesson.id}
                      blockIndex={i}
                      state={blockData[i] || {}}
                      setState={(patch: any) => setBlockState(i, patch)}
                      onValidated={() => validateBlock(i)}
                    />
                  )}
                  {block.type === 'HOTSPOT_AND_METHODOLOGY' && (
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
                  {block.type === 'MISSION_CHOICE' && (
                    <MissionChoiceBlockView
                      block={block}
                      lessonId={lesson.id}
                      blockIndex={i}
                      state={blockData[i] || {}}
                      setState={(patch: any) => setBlockState(i, patch)}
                      onValidated={() => validateBlock(i)}
                    />
                  )}
                  {block.type === 'GUIDED_DOC_QA' && (
                    <GuidedDocQaBlockView
                      block={block}
                      lessonId={lesson.id}
                      blockIndex={i}
                      state={blockData[i] || {}}
                      setState={(patch: any) => setBlockState(i, patch)}
                      onValidated={() => validateBlock(i)}
                    />
                  )}
                  {block.type === 'DUAL_EVIDENCE' && (
                    <DualEvidenceBlockView
                      block={block}
                      lessonId={lesson.id}
                      blockIndex={i}
                      state={blockData[i] || {}}
                      setState={(patch: any) => setBlockState(i, patch)}
                      onValidated={() => validateBlock(i)}
                    />
                  )}
                  {block.type === 'HYPOTHESIS_EXPERIMENT' && (
                    <HypothesisExperimentBlockView
                      block={block}
                      lessonId={lesson.id}
                      blockIndex={i}
                      state={blockData[i] || {}}
                      setState={(patch: any) => setBlockState(i, patch)}
                      onValidated={() => validateBlock(i)}
                    />
                  )}
                  {block.type === 'COMPARISON_TABLE' && (
                    <ComparisonTableBlockView
                      block={block}
                      lessonId={lesson.id}
                      blockIndex={i}
                      state={blockData[i] || {}}
                      setState={(patch: any) => setBlockState(i, patch)}
                      onValidated={() => validateBlock(i)}
                    />
                  )}
                  {block.type === 'SEQUENCE_ORDER' && (
                    <SequenceOrderBlockView
                      block={block}
                      lessonId={lesson.id}
                      blockIndex={i}
                      state={blockData[i] || {}}
                      setState={(patch: any) => setBlockState(i, patch)}
                      onValidated={() => validateBlock(i)}
                    />
                  )}
                  {block.type === 'REASONING_COUNT' && (
                    <ReasoningCountBlockView
                      block={block}
                      lessonId={lesson.id}
                      blockIndex={i}
                      state={blockData[i] || {}}
                      setState={(patch: any) => setBlockState(i, patch)}
                      onValidated={() => validateBlock(i)}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            );
          })}
        </div>
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

function ResumeOverlay({
  lesson,
  onResume,
  onNew,
  onClose,
}: {
  lesson: ActiveLesson;
  onResume: () => void;
  onNew: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white dark:bg-[#141916] rounded-3xl p-6 max-w-md w-full shadow-xl space-y-5">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-[#006d37]/10 flex items-center justify-center mx-auto mb-3">
            <BookOpen className="w-8 h-8 text-[#006d37]" />
          </div>
          <h2 className="font-black text-lg text-[#1f1c0b] dark:text-white">{lesson.title}</h2>
          <p className="text-sm text-[#506072] dark:text-gray-400 mt-2 leading-7">
            توجد جلسة سابقة لم تكتمل. هل تريد متابعة من حيث توقفت؟
          </p>
        </div>
        <div className="space-y-3">
          <button
            onClick={onResume}
            className="w-full py-3.5 rounded-2xl bg-[#006d37] hover:bg-[#00562b] text-white font-black text-sm shadow-md cursor-pointer flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            تابع من حيث توقفت
          </button>
          <button
            onClick={onNew}
            className="w-full py-3.5 rounded-2xl bg-white dark:bg-[#141916] border border-[#e2dabf]/60 text-[#506072] dark:text-gray-300 font-bold text-sm cursor-pointer hover:bg-[#fff9ed] dark:hover:bg-white/5 transition-colors"
          >
            ابدأ من جديد
          </button>
          <button
            onClick={onClose}
            className="w-full py-2 text-xs text-[#506072] dark:text-gray-500 font-bold cursor-pointer hover:text-rose-500 transition-colors"
          >
            إلغاء
          </button>
        </div>
      </div>
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
  'd1-u1-l3-traduction': 'codon_anticodon',
  'phase11_chapitres_21_22': 'photosynthese_cycle',
  'synapse': 'synapse_integration',
  'subduction': 'subduction_water_melting',
  'protein_structure_function': 'mutation_protein_function',
  'immunity_self_nonself': 'cmh_transplant_compatibility',
  'immunity_humoral_response': 'lb_antibody_response',
  'immunity_cellular_response': 'lt_target_cell_response',
  'immunity_memory_response': 'primary_secondary_response',
  'seismic_waves': 'seismic_p_s_core',
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
  const bacAttemptId = useId();
  const bacAttemptRevision = useRef(0);

  const handleValidate = () => {
    if (answer.trim().length < 5) return;
    const result = validateAnswer(answer, { ...challenge.validation, isNeuromuscular: challenge.validation.isNeuromuscular ?? false });
    const s = Math.round((result.score / result.maxScore) * 100);
    setAttempted(true);
    setScore(s);
    // #41 — la forme méthodologique ne suffit pas : sans recouvrement avec le
    // corrigé officiel, une réponse hors-sujet validait le défi et enregistrait
    // une preuve de transfert.
    const attemptPassed = result.passed && s >= 70 && hasTransferContent(answer, challenge);
    setPassed(attemptPassed);

    runSessionEffects([
      buildTransferEvidenceEffect({
        eventId: `bac_${challenge.lessonId}_${bacAttemptId}_${++bacAttemptRevision.current}`,
        lessonId: challenge.lessonId,
        conceptId: challenge.conceptId,
        reflexId: challenge.reflexId,
        score: s,
        ruleIds: result.errors.map((e) => e.code),
      }),
    ]);
    onAttempt(attemptPassed);
  };

  return (
    <div data-testid="bac-challenge" className="p-4 bg-[#fff9ed] dark:bg-[#1c241f] border border-[#e2dabf]/60 rounded-2xl shadow-sm space-y-3">
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

function LessonDocPreview({
  assetSrc,
  altAr,
  captionAr,
}: {
  assetSrc?: string;
  altAr: string;
  captionAr?: string;
}) {
  return (
    <div className="space-y-2">
      <div className="relative rounded-xl overflow-hidden border bg-[#f3f4f5] dark:bg-[#0c0f0d] min-h-40 flex items-center justify-center p-4">
        {assetSrc ? (
          <>
            <ZoomImageButton src={assetSrc} alt={altAr} referrerPolicy="no-referrer" className="absolute top-2 right-2" />
            <img src={assetSrc} alt={altAr} className="max-h-64 w-full object-contain" draggable={false} />
          </>
        ) : (
          <p className="text-xs text-center text-[#506072] dark:text-gray-400 leading-6">{altAr}</p>
        )}
      </div>
      {captionAr && <p className="text-[11px] font-bold text-[#506072] dark:text-gray-400">{captionAr}</p>}
    </div>
  );
}

function LessonDocGallery({
  items,
}: {
  items: { assetSrc?: string; altAr?: string; captionAr?: string }[];
}) {
  const validItems = items.filter((item) => item.assetSrc || item.altAr);

  if (validItems.length <= 1) {
    const item = validItems[0];
    return item ? <LessonDocPreview assetSrc={item.assetSrc} altAr={item.altAr ?? 'وثيقة'} captionAr={item.captionAr} /> : null;
  }

  const gridClass = validItems.length === 2
    ? 'grid md:grid-cols-2 gap-4'
    : validItems.length === 3
      ? 'grid md:grid-cols-2 xl:grid-cols-3 gap-4'
      : 'grid md:grid-cols-2 gap-4';

  return (
    <div className={gridClass}>
      {validItems.map((item, index) => (
        <LessonDocPreview
          key={`${item.assetSrc ?? item.altAr ?? 'doc'}-${index}`}
          assetSrc={item.assetSrc}
          altAr={item.altAr ?? 'وثيقة'}
          captionAr={item.captionAr}
        />
      ))}
    </div>
  );
}

function MissionChoiceBlockView({
  block,
  lessonId,
  blockIndex,
  state,
  setState,
  onValidated,
}: {
  block: MissionChoiceBlock;
  lessonId: string;
  blockIndex: number;
  state: any;
  setState: (patch: any) => void;
  onValidated: () => void;
}) {
  const selectedChoiceId = state.selectedChoiceId as string | undefined;

  return (
    <div className="p-4 bg-white dark:bg-[#141916] border border-[#e2dabf]/60 rounded-2xl shadow-sm space-y-4" data-testid={`mission-choice-block-${lessonId}-${blockIndex}`}>
      <div className="flex items-center gap-2">
        <Target className="w-5 h-5 text-[#fed65b]" />
        <span className="text-xs font-black bg-[#006d37] text-white px-2.5 py-1 rounded-full">مهمة الانطلاق</span>
        <span className="text-xs text-[#506072] dark:text-gray-400">{block.objective}</span>
      </div>

      <div className="rounded-3xl overflow-hidden border border-[#e2dabf]/50 bg-gradient-to-br from-[#006d37] to-[#00562b] text-white p-5 space-y-4">
        <h3 className="text-xl font-black">{block.heroTitle}</h3>
        <p className="text-sm leading-8 text-white/90">{block.heroText}</p>
        <LessonDocGallery
          items={[
            { assetSrc: block.imageSrc, altAr: block.heroTitle },
            { assetSrc: block.supportAssetSrc, altAr: block.supportAltAr, captionAr: block.supportCaptionAr },
          ]}
        />
      </div>

      <div className="grid gap-3">
        {block.choices.map((choice) => (
          <button
            key={choice.id}
            type="button"
            onClick={() => setState({ selectedChoiceId: choice.id })}
            className={`p-4 rounded-2xl border text-right transition-all cursor-pointer ${selectedChoiceId === choice.id
              ? 'bg-[#2ecc71]/10 border-[#006d37] text-[#006d37] dark:text-[#2ecc71]'
              : 'bg-[#fff9ed] dark:bg-[#1c241f] border-[#e2dabf]/60 text-[#1f1c0b] dark:text-white hover:border-[#006d37]/40'}`}
          >
            <div className="font-black text-sm">{choice.labelAr}</div>
            <div className="text-xs mt-1 leading-6 text-[#506072] dark:text-gray-400">{choice.descriptionAr}</div>
          </button>
        ))}
      </div>

      {selectedChoiceId && (
        <button onClick={onValidated} className="w-full py-3 rounded-xl bg-[#006d37] hover:bg-[#00562b] text-white font-black text-sm cursor-pointer">
          ابدأ من هذه الزاوية ←
        </button>
      )}
    </div>
  );
}

function GuidedDocQaBlockView({
  block,
  lessonId,
  blockIndex,
  state,
  setState,
  onValidated,
}: {
  block: GuidedDocQaBlock;
  lessonId: string;
  blockIndex: number;
  state: any;
  setState: (patch: any) => void;
  onValidated: () => void;
}) {
  const answers = state.answers ?? {};
  const results = state.results ?? {};
  const allValid = block.questions.length > 0 && block.questions.every((question) => results[question.id]?.valid);

  const handleAnswerChange = (questionId: string, value: string) => {
    setState({
      answers: { ...answers, [questionId]: value },
      results: { ...results, [questionId]: undefined },
    });
  };

  const validateQuestion = (question: GuidedDocQaBlock['questions'][number]) => {
    const answer = answers[question.id] ?? '';
    const result = question.validationMode === 'engine' && question.validationCtx
      ? validateEngineAnswer(answer, question.validationCtx)
      : validateKeywordAnswer(answer, question.requiredKeywords ?? [], question.forbiddenKeywords ?? [], {
          orderedKeywords: question.orderedKeywords,
        });

    if (!result.valid) {
      logEvent('METHOD_FAIL', { lessonId, blockIndex, questionId: question.id, code: result.code });
    }

    setState({
      results: {
        ...results,
        [question.id]: {
          ...result,
          messageAr: result.valid ? (question.successMessageAr ?? result.messageAr) : (question.errorHintAr ?? result.messageAr),
        },
      },
    });
  };

  return (
    <div className="p-4 bg-white dark:bg-[#141916] border border-[#e2dabf]/60 rounded-2xl shadow-sm space-y-4" data-testid={`guided-doc-block-${lessonId}-${blockIndex}`}>
      <div className="flex items-center gap-2">
        <FileText className="w-5 h-5 text-[#fed65b]" />
        <span className="text-xs font-black bg-[#006d37] text-white px-2.5 py-1 rounded-full">الهدف</span>
        <span className="text-xs text-[#506072] dark:text-gray-400">{block.objective}</span>
      </div>

      <LessonDocGallery
        items={[
          { assetSrc: block.doc.assetSrc, altAr: block.doc.altAr, captionAr: block.doc.captionAr },
          { assetSrc: block.doc.secondaryAssetSrc, altAr: block.doc.secondaryAltAr, captionAr: block.doc.secondaryCaptionAr },
        ]}
      />

      <div className="space-y-4">
        {block.questions.map((question) => (
          <div key={question.id} className="p-3 bg-[#fff9ed] dark:bg-[#1c241f] border border-[#e2dabf]/60 rounded-2xl space-y-2">
            <label className="text-sm font-black text-[#1f1c0b] dark:text-white block">
              <span className="text-[#944a00] ml-1">{question.verbAr}</span>
              {question.promptAr}
            </label>
            <textarea
              value={answers[question.id] ?? ''}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              rows={3}
              dir="rtl"
              className="w-full p-2.5 rounded-xl border border-[#e2dabf]/60 bg-white dark:bg-[#0c0f0d] text-sm text-right focus:outline-none focus:ring-2 focus:ring-[#006d37]"
            />
            <button
              type="button"
              onClick={() => validateQuestion(question)}
              className="px-4 py-2 rounded-xl bg-[#006d37] hover:bg-[#00562b] text-white text-xs font-black cursor-pointer"
            >
              تحقق من الجواب
            </button>
            {results[question.id] && (
              <p className={`text-xs font-bold leading-6 ${results[question.id].valid ? 'text-[#006d37] dark:text-[#2ecc71]' : 'text-rose-500'}`}>
                {results[question.id].messageAr}
              </p>
            )}
          </div>
        ))}
      </div>

      {allValid && (
        <div className="space-y-3">
          <div className="p-3 bg-[#f3f8f4] dark:bg-[#10231a] border border-[#2ecc71]/30 rounded-xl text-xs leading-6 font-bold text-[#006d37] dark:text-[#2ecc71]">
            {block.summaryAr}
          </div>
          <button onClick={onValidated} className="w-full py-2.5 rounded-xl bg-[#006d37] hover:bg-[#00562b] text-white font-black text-sm cursor-pointer">
            إنهاء هذا الجزء ←
          </button>
        </div>
      )}
    </div>
  );
}

function DualEvidenceBlockView({
  block,
  lessonId,
  blockIndex,
  state,
  setState,
  onValidated,
}: {
  block: DualEvidenceBlock;
  lessonId: string;
  blockIndex: number;
  state: any;
  setState: (patch: any) => void;
  onValidated: () => void;
}) {
  const extractionText = state.extractionText ?? '';
  const justificationText = state.justificationText ?? '';
  const extractionResult = state.extractionResult;
  const justificationResult = state.justificationResult;
  const blockValid = extractionResult?.valid && justificationResult?.valid;

  const runValidation = () => {
    const result = validateDualEvidenceAnswer(
      extractionText,
      justificationText,
      block.extractionKeywords,
      block.justificationKeywords,
    );
    if (!result.valid) {
      logEvent('METHOD_FAIL', { lessonId, blockIndex, code: result.extraction.code ?? result.justification.code });
    }
    setState({
      extractionResult: result.extraction,
      justificationResult: result.justification,
    });
  };

  return (
    <div className="p-4 bg-white dark:bg-[#141916] border border-[#e2dabf]/60 rounded-2xl shadow-sm space-y-4" data-testid={`dual-evidence-block-${lessonId}-${blockIndex}`}>
      <div className="flex items-center gap-2">
        <Target className="w-5 h-5 text-[#fed65b]" />
        <span className="text-xs font-black bg-[#006d37] text-white px-2.5 py-1 rounded-full">الهدف</span>
        <span className="text-xs text-[#506072] dark:text-gray-400">{block.objective}</span>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <LessonDocPreview {...block.docA} />
        <LessonDocPreview {...block.docB} />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-black text-[#1f1c0b] dark:text-white">{block.extractionPromptAr}</label>
        <textarea
          value={extractionText}
          onChange={(e) => setState({ extractionText: e.target.value, extractionResult: undefined })}
          rows={3}
          dir="rtl"
          className="w-full p-2.5 rounded-xl border border-[#e2dabf]/60 bg-white dark:bg-[#0c0f0d] text-sm text-right focus:outline-none focus:ring-2 focus:ring-[#006d37]"
        />
        {extractionResult && (
          <p className={`text-xs font-bold ${extractionResult.valid ? 'text-[#006d37] dark:text-[#2ecc71]' : 'text-rose-500'}`}>
            {extractionResult.messageAr}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-black text-[#1f1c0b] dark:text-white">{block.justificationPromptAr}</label>
        <textarea
          value={justificationText}
          onChange={(e) => setState({ justificationText: e.target.value, justificationResult: undefined })}
          rows={3}
          dir="rtl"
          className="w-full p-2.5 rounded-xl border border-[#e2dabf]/60 bg-white dark:bg-[#0c0f0d] text-sm text-right focus:outline-none focus:ring-2 focus:ring-[#006d37]"
        />
        {justificationResult && (
          <p className={`text-xs font-bold ${justificationResult.valid ? 'text-[#006d37] dark:text-[#2ecc71]' : 'text-rose-500'}`}>
            {justificationResult.messageAr}
          </p>
        )}
      </div>

      <button type="button" onClick={runValidation} className="w-full py-2.5 rounded-xl bg-[#006d37] hover:bg-[#00562b] text-white font-black text-sm cursor-pointer">
        تحقق من الجواب
      </button>

      {blockValid && (
        <div className="space-y-3">
          <div className="p-3 bg-[#f3f8f4] dark:bg-[#10231a] border border-[#2ecc71]/30 rounded-xl text-xs leading-6 font-bold text-[#006d37] dark:text-[#2ecc71]">
            {block.summaryAr}
          </div>
          <button onClick={onValidated} className="w-full py-2.5 rounded-xl bg-[#006d37] hover:bg-[#00562b] text-white font-black text-sm cursor-pointer">
            إنهاء هذا الجزء ←
          </button>
        </div>
      )}
    </div>
  );
}

function HypothesisExperimentBlockView({
  block,
  lessonId,
  blockIndex,
  state,
  setState,
  onValidated,
}: {
  block: HypothesisExperimentBlock;
  lessonId: string;
  blockIndex: number;
  state: any;
  setState: (patch: any) => void;
  onValidated: () => void;
}) {
  const hypothesisText = state.hypothesisText ?? '';
  const resultText = state.resultText ?? '';
  const validationText = state.validationText ?? '';
  const namingText = state.namingText ?? '';
  const checks = state.checks ?? {};
  const messages = state.messages ?? {};
  const blockValid = checks.hypothesisValid && checks.resultValid && checks.validationValid && (block.namingPromptAr ? checks.namingValid : true);

  const runValidation = () => {
    const hypothesisResult = validateEngineAnswer(hypothesisText, {
      docType: 'mixed',
      actionVerb: 'hypothesize',
      isNeuromuscular: false,
      domain: 'genetique',
      expectedTargets: block.expectedTargets,
    });
    const resultCheck = validateKeywordAnswer(resultText, block.resultKeywords ?? block.expectedTargets);
    const validationCheck = validateKeywordAnswer(validationText, block.validationKeywords ?? block.expectedTargets, ['ربما']);
    const namingCheck = block.namingPromptAr
      ? validateHypothesisNaming(namingText, block.namingAccepted ?? [])
      : undefined;

    if (!hypothesisResult.valid || !resultCheck.valid || !validationCheck.valid || (namingCheck && !namingCheck.valid)) {
      logEvent('METHOD_FAIL', {
        lessonId,
        blockIndex,
        code: hypothesisResult.code ?? resultCheck.code ?? validationCheck.code ?? namingCheck?.code,
      });
    }

    setState({
      checks: {
        hypothesisValid: hypothesisResult.valid,
        resultValid: resultCheck.valid,
        validationValid: validationCheck.valid,
        namingValid: namingCheck?.valid,
      },
      messages: {
        hypothesis: hypothesisResult.valid ? 'فرضية منضبطة.' : hypothesisResult.messageAr,
        result: resultCheck.messageAr,
        validation: validationCheck.messageAr,
        naming: namingCheck?.messageAr,
      },
    });
  };

  return (
    <div className="p-4 bg-white dark:bg-[#141916] border border-[#e2dabf]/60 rounded-2xl shadow-sm space-y-4" data-testid={`hypothesis-experiment-block-${lessonId}-${blockIndex}`}>
      <div className="flex items-center gap-2">
        <Brain className="w-5 h-5 text-[#fed65b]" />
        <span className="text-xs font-black bg-[#006d37] text-white px-2.5 py-1 rounded-full">الهدف</span>
        <span className="text-xs text-[#506072] dark:text-gray-400">{block.objective}</span>
      </div>

      <div className="p-3 bg-[#fff9ed] dark:bg-[#1c241f] border border-[#e2dabf]/60 rounded-xl text-sm font-bold leading-7 text-[#1f1c0b] dark:text-white">
        {block.problemAr}
      </div>

      <LessonDocPreview assetSrc={block.experimentAssetSrc} altAr={block.experimentAltAr} />

      <div className="space-y-2">
        <label className="text-sm font-black text-[#1f1c0b] dark:text-white">{block.hypothesisPromptAr}</label>
        <textarea
          value={hypothesisText}
          onChange={(e) => setState({ hypothesisText: e.target.value, checks: { ...checks, hypothesisValid: false } })}
          rows={3}
          dir="rtl"
          className="w-full p-2.5 rounded-xl border border-[#e2dabf]/60 bg-white dark:bg-[#0c0f0d] text-sm text-right focus:outline-none focus:ring-2 focus:ring-[#006d37]"
        />
        {messages.hypothesis && <p className={`text-xs font-bold ${checks.hypothesisValid ? 'text-[#006d37] dark:text-[#2ecc71]' : 'text-rose-500'}`}>{messages.hypothesis}</p>}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-black text-[#1f1c0b] dark:text-white">{block.resultPromptAr}</label>
        <textarea
          value={resultText}
          onChange={(e) => setState({ resultText: e.target.value, checks: { ...checks, resultValid: false } })}
          rows={3}
          dir="rtl"
          className="w-full p-2.5 rounded-xl border border-[#e2dabf]/60 bg-white dark:bg-[#0c0f0d] text-sm text-right focus:outline-none focus:ring-2 focus:ring-[#006d37]"
        />
        {messages.result && <p className={`text-xs font-bold ${checks.resultValid ? 'text-[#006d37] dark:text-[#2ecc71]' : 'text-rose-500'}`}>{messages.result}</p>}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-black text-[#1f1c0b] dark:text-white">{block.validationPromptAr}</label>
        <textarea
          value={validationText}
          onChange={(e) => setState({ validationText: e.target.value, checks: { ...checks, validationValid: false } })}
          rows={3}
          dir="rtl"
          className="w-full p-2.5 rounded-xl border border-[#e2dabf]/60 bg-white dark:bg-[#0c0f0d] text-sm text-right focus:outline-none focus:ring-2 focus:ring-[#006d37]"
        />
        {messages.validation && <p className={`text-xs font-bold ${checks.validationValid ? 'text-[#006d37] dark:text-[#2ecc71]' : 'text-rose-500'}`}>{messages.validation}</p>}
      </div>

      {block.namingPromptAr && (
        <div className="space-y-2">
          <label className="text-sm font-black text-[#1f1c0b] dark:text-white">{block.namingPromptAr}</label>
          <input
            value={namingText}
            onChange={(e) => setState({ namingText: e.target.value, checks: { ...checks, namingValid: false } })}
            dir="rtl"
            className="w-full p-2.5 rounded-xl border border-[#e2dabf]/60 bg-white dark:bg-[#0c0f0d] text-sm text-right focus:outline-none focus:ring-2 focus:ring-[#006d37]"
          />
          {messages.naming && <p className={`text-xs font-bold ${checks.namingValid ? 'text-[#006d37] dark:text-[#2ecc71]' : 'text-rose-500'}`}>{messages.naming}</p>}
        </div>
      )}

      <button type="button" onClick={runValidation} className="w-full py-2.5 rounded-xl bg-[#006d37] hover:bg-[#00562b] text-white font-black text-sm cursor-pointer">
        تحقق من الجواب
      </button>

      {blockValid && (
        <div className="space-y-3">
          <div className="p-3 bg-[#f3f8f4] dark:bg-[#10231a] border border-[#2ecc71]/30 rounded-xl text-xs leading-6 font-bold text-[#006d37] dark:text-[#2ecc71]">
            {block.summaryAr}
          </div>
          <button onClick={onValidated} className="w-full py-2.5 rounded-xl bg-[#006d37] hover:bg-[#00562b] text-white font-black text-sm cursor-pointer">
            إنهاء هذا الجزء ←
          </button>
        </div>
      )}
    </div>
  );
}

function ComparisonTableBlockView({
  block,
  lessonId,
  blockIndex,
  state,
  setState,
  onValidated,
}: {
  block: ComparisonTableBlock;
  lessonId: string;
  blockIndex: number;
  state: any;
  setState: (patch: any) => void;
  onValidated: () => void;
}) {
  const rows = state.rows ?? {};
  const rowResults = state.rowResults ?? {};
  const conclusionText = state.conclusionText ?? '';
  const conclusionResult = state.conclusionResult;
  const allRowsValid = block.criteria.every((criterion) => rowResults[criterion.id]?.valid);
  const blockValid = allRowsValid && conclusionResult?.valid;

  const validateRows = () => {
    const nextResults: Record<string, { valid: boolean; messageAr: string }> = {};
    for (const criterion of block.criteria) {
      const left = rows[criterion.id]?.left ?? '';
      const right = rows[criterion.id]?.right ?? '';
      const result = validateComparisonRow(left, right, criterion.leftExpected, criterion.rightExpected);
      nextResults[criterion.id] = result;
      if (!result.valid) {
        logEvent('METHOD_FAIL', { lessonId, blockIndex, criterionId: criterion.id, code: result.code });
      }
    }

    const nextConclusion = validateKeywordAnswer(conclusionText, block.conclusionKeywords);
    setState({ rowResults: nextResults, conclusionResult: nextConclusion });
  };

  return (
    <div className="p-4 bg-white dark:bg-[#141916] border border-[#e2dabf]/60 rounded-2xl shadow-sm space-y-4" data-testid={`comparison-table-block-${lessonId}-${blockIndex}`}>
      <div className="flex items-center gap-2">
        <FileText className="w-5 h-5 text-[#fed65b]" />
        <span className="text-xs font-black bg-[#006d37] text-white px-2.5 py-1 rounded-full">الهدف</span>
        <span className="text-xs text-[#506072] dark:text-gray-400">{block.objective}</span>
      </div>
      <p className="text-sm font-black text-[#1f1c0b] dark:text-white">{block.promptAr}</p>
      {block.altAr && (
        <LessonDocGallery
          items={[
            { assetSrc: block.assetSrc, altAr: block.altAr },
            ...(block.supportGallery ?? []),
          ]}
        />
      )}

      <div className="space-y-3">
        {block.criteria.map((criterion) => (
          <div key={criterion.id} className="p-3 bg-[#fff9ed] dark:bg-[#1c241f] border border-[#e2dabf]/60 rounded-2xl space-y-2">
            <p className="text-sm font-black text-[#944a00] dark:text-amber-300">{criterion.labelAr}</p>
            <div className="grid md:grid-cols-2 gap-2">
              <input
                value={rows[criterion.id]?.left ?? ''}
                onChange={(e) => setState({ rows: { ...rows, [criterion.id]: { ...rows[criterion.id], left: e.target.value } } })}
                placeholder="ADN"
                dir="rtl"
                className="w-full p-2.5 rounded-xl border border-[#e2dabf]/60 bg-white dark:bg-[#0c0f0d] text-sm text-right focus:outline-none focus:ring-2 focus:ring-[#006d37]"
              />
              <input
                value={rows[criterion.id]?.right ?? ''}
                onChange={(e) => setState({ rows: { ...rows, [criterion.id]: { ...rows[criterion.id], right: e.target.value } } })}
                placeholder="ARN"
                dir="rtl"
                className="w-full p-2.5 rounded-xl border border-[#e2dabf]/60 bg-white dark:bg-[#0c0f0d] text-sm text-right focus:outline-none focus:ring-2 focus:ring-[#006d37]"
              />
            </div>
            {rowResults[criterion.id] && (
              <p className={`text-xs font-bold ${rowResults[criterion.id].valid ? 'text-[#006d37] dark:text-[#2ecc71]' : 'text-rose-500'}`}>
                {rowResults[criterion.id].messageAr}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-black text-[#1f1c0b] dark:text-white">{block.conclusionPromptAr}</label>
        <textarea
          value={conclusionText}
          onChange={(e) => setState({ conclusionText: e.target.value, conclusionResult: undefined })}
          rows={3}
          dir="rtl"
          className="w-full p-2.5 rounded-xl border border-[#e2dabf]/60 bg-white dark:bg-[#0c0f0d] text-sm text-right focus:outline-none focus:ring-2 focus:ring-[#006d37]"
        />
        {conclusionResult && (
          <p className={`text-xs font-bold ${conclusionResult.valid ? 'text-[#006d37] dark:text-[#2ecc71]' : 'text-rose-500'}`}>
            {conclusionResult.messageAr}
          </p>
        )}
      </div>

      <button type="button" onClick={validateRows} className="w-full py-2.5 rounded-xl bg-[#006d37] hover:bg-[#00562b] text-white font-black text-sm cursor-pointer">
        تحقق من المقارنة
      </button>

      {blockValid && (
        <div className="space-y-3">
          <div className="p-3 bg-[#f3f8f4] dark:bg-[#10231a] border border-[#2ecc71]/30 rounded-xl text-xs leading-6 font-bold text-[#006d37] dark:text-[#2ecc71]">
            {block.summaryAr}
          </div>
          <button onClick={onValidated} className="w-full py-2.5 rounded-xl bg-[#006d37] hover:bg-[#00562b] text-white font-black text-sm cursor-pointer">
            إنهاء هذا الجزء ←
          </button>
        </div>
      )}
    </div>
  );
}

function SequenceOrderBlockView({
  block,
  lessonId,
  blockIndex,
  state,
  setState,
  onValidated,
}: {
  block: SequenceOrderBlock;
  lessonId: string;
  blockIndex: number;
  state: any;
  setState: (patch: any) => void;
  onValidated: () => void;
}) {
  const orderMap = state.orderMap ?? {};
  const summaryText = state.summaryText ?? '';
  const orderResult = state.orderResult;
  const summaryResult = state.summaryResult;
  const blockValid = orderResult?.valid && summaryResult?.valid;

  const runValidation = () => {
    const orderedIds = [...block.steps]
      .sort((a, b) => Number(orderMap[a.id] ?? 999) - Number(orderMap[b.id] ?? 999))
      .map((step) => step.id);
    const expectedIds = [...block.steps]
      .sort((a, b) => a.expectedOrder - b.expectedOrder)
      .map((step) => step.id);

    const nextOrderResult = validateSequenceOrder(orderedIds, expectedIds);
    const nextSummaryResult = validateKeywordAnswer(summaryText, block.summaryKeywords);

    if (!nextOrderResult.valid || !nextSummaryResult.valid) {
      logEvent('METHOD_FAIL', { lessonId, blockIndex, code: nextOrderResult.code ?? nextSummaryResult.code });
    }

    setState({ orderResult: nextOrderResult, summaryResult: nextSummaryResult });
  };

  return (
    <div className="p-4 bg-white dark:bg-[#141916] border border-[#e2dabf]/60 rounded-2xl shadow-sm space-y-4" data-testid={`sequence-order-block-${lessonId}-${blockIndex}`}>
      <div className="flex items-center gap-2">
        <Brain className="w-5 h-5 text-[#fed65b]" />
        <span className="text-xs font-black bg-[#006d37] text-white px-2.5 py-1 rounded-full">الهدف</span>
        <span className="text-xs text-[#506072] dark:text-gray-400">{block.objective}</span>
      </div>
      <p className="text-sm font-black text-[#1f1c0b] dark:text-white">{block.promptAr}</p>
      {block.altAr && (
        <LessonDocGallery
          items={[
            { assetSrc: block.assetSrc, altAr: block.altAr },
            { assetSrc: block.secondaryAssetSrc, altAr: block.secondaryAltAr, captionAr: block.secondaryCaptionAr },
            ...(block.supportGallery ?? []),
          ]}
        />
      )}

      <div className="space-y-3">
        {block.steps.map((step) => (
          <div key={step.id} className="p-3 bg-[#fff9ed] dark:bg-[#1c241f] border border-[#e2dabf]/60 rounded-2xl flex items-center justify-between gap-3">
            <span className="text-sm font-bold text-[#1f1c0b] dark:text-white">{step.labelAr}</span>
            <select
              value={orderMap[step.id] ?? ''}
              onChange={(e) => setState({ orderMap: { ...orderMap, [step.id]: e.target.value } })}
              className="px-3 py-2 rounded-xl border border-[#e2dabf]/60 bg-white dark:bg-[#0c0f0d] text-sm"
            >
              <option value="">الترتيب</option>
              {block.steps.map((_, idx) => (
                <option key={idx + 1} value={idx + 1}>{idx + 1}</option>
              ))}
            </select>
          </div>
        ))}
      </div>
      {orderResult && (
        <p className={`text-xs font-bold ${orderResult.valid ? 'text-[#006d37] dark:text-[#2ecc71]' : 'text-rose-500'}`}>
          {orderResult.messageAr}
        </p>
      )}

      <div className="space-y-2">
        <label className="text-sm font-black text-[#1f1c0b] dark:text-white">{block.summaryPromptAr}</label>
        <textarea
          value={summaryText}
          onChange={(e) => setState({ summaryText: e.target.value, summaryResult: undefined })}
          rows={4}
          dir="rtl"
          className="w-full p-2.5 rounded-xl border border-[#e2dabf]/60 bg-white dark:bg-[#0c0f0d] text-sm text-right focus:outline-none focus:ring-2 focus:ring-[#006d37]"
        />
        {summaryResult && (
          <p className={`text-xs font-bold ${summaryResult.valid ? 'text-[#006d37] dark:text-[#2ecc71]' : 'text-rose-500'}`}>
            {summaryResult.messageAr}
          </p>
        )}
      </div>

      <button type="button" onClick={runValidation} className="w-full py-2.5 rounded-xl bg-[#006d37] hover:bg-[#00562b] text-white font-black text-sm cursor-pointer">
        تحقق من الترتيب
      </button>

      {blockValid && (
        <div className="space-y-3">
          <div className="p-3 bg-[#f3f8f4] dark:bg-[#10231a] border border-[#2ecc71]/30 rounded-xl text-xs leading-6 font-bold text-[#006d37] dark:text-[#2ecc71]">
            {block.summaryAr}
          </div>
          <button onClick={onValidated} className="w-full py-2.5 rounded-xl bg-[#006d37] hover:bg-[#00562b] text-white font-black text-sm cursor-pointer">
            إنهاء هذا الجزء ←
          </button>
        </div>
      )}
    </div>
  );
}

function ReasoningCountBlockView({
  block,
  lessonId,
  blockIndex,
  state,
  setState,
  onValidated,
}: {
  block: ReasoningCountBlock;
  lessonId: string;
  blockIndex: number;
  state: any;
  setState: (patch: any) => void;
  onValidated: () => void;
}) {
  const selectedSymbolCount = state.selectedSymbolCount as 1 | 2 | 3 | undefined;
  const rationaleText = state.rationaleText ?? '';
  const validation = state.validation;
  const blockValid = validation?.valid;

  const runValidation = () => {
    const result = validateReasoningCount(selectedSymbolCount, rationaleText);
    if (!result.valid) {
      logEvent('METHOD_FAIL', { lessonId, blockIndex, code: result.choice.code ?? result.rationale.code });
    }
    setState({ validation: result });
  };

  return (
    <div className="p-4 bg-white dark:bg-[#141916] border border-[#e2dabf]/60 rounded-2xl shadow-sm space-y-4" data-testid={`reasoning-count-block-${lessonId}-${blockIndex}`}>
      <div className="flex items-center gap-2">
        <Brain className="w-5 h-5 text-[#fed65b]" />
        <span className="text-xs font-black bg-[#006d37] text-white px-2.5 py-1 rounded-full">الهدف</span>
        <span className="text-xs text-[#506072] dark:text-gray-400">{block.objective}</span>
      </div>

      <p className="text-sm font-black text-[#1f1c0b] dark:text-white">{block.promptAr}</p>
      {block.altAr && <LessonDocPreview assetSrc={block.assetSrc} altAr={block.altAr} />}

      <div className="grid gap-2">
        {block.options.map((option) => (
          <button
            key={option.symbolCount}
            type="button"
            onClick={() => setState({ selectedSymbolCount: option.symbolCount, validation: undefined })}
            className={`p-3 rounded-xl border text-sm font-bold text-right cursor-pointer ${selectedSymbolCount === option.symbolCount ? 'bg-[#2ecc71]/10 border-[#006d37] text-[#006d37]' : 'bg-white dark:bg-[#0c0f0d] border-[#e2dabf]/60 text-[#1f1c0b] dark:text-white'}`}
          >
            {option.symbolCount} قواعد ⟵ {option.combinations} احتمالات
          </button>
        ))}
      </div>
      {validation && (
        <p className={`text-xs font-bold ${validation.choice.valid ? 'text-[#006d37] dark:text-[#2ecc71]' : 'text-rose-500'}`}>
          {validation.choice.messageAr}
        </p>
      )}

      <div className="space-y-2">
        <label className="text-sm font-black text-[#1f1c0b] dark:text-white">{block.rationalePromptAr}</label>
        <textarea
          value={rationaleText}
          onChange={(e) => setState({ rationaleText: e.target.value, validation: undefined })}
          rows={3}
          dir="rtl"
          className="w-full p-2.5 rounded-xl border border-[#e2dabf]/60 bg-white dark:bg-[#0c0f0d] text-sm text-right focus:outline-none focus:ring-2 focus:ring-[#006d37]"
        />
        {validation && (
          <p className={`text-xs font-bold ${validation.rationale.valid ? 'text-[#006d37] dark:text-[#2ecc71]' : 'text-rose-500'}`}>
            {validation.rationale.messageAr}
          </p>
        )}
      </div>

      <button type="button" onClick={runValidation} className="w-full py-2.5 rounded-xl bg-[#006d37] hover:bg-[#00562b] text-white font-black text-sm cursor-pointer">
        تحقق من الاستدلال
      </button>

      {blockValid && (
        <div className="space-y-3">
          <div className="p-3 bg-[#f3f8f4] dark:bg-[#10231a] border border-[#2ecc71]/30 rounded-xl text-xs leading-6 font-bold text-[#006d37] dark:text-[#2ecc71]">
            {block.summaryAr}
          </div>
          <button onClick={onValidated} className="w-full py-2.5 rounded-xl bg-[#006d37] hover:bg-[#00562b] text-white font-black text-sm cursor-pointer">
            إنهاء هذا الجزء ←
          </button>
        </div>
      )}
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

        {(block.supportAssetSrc || block.supportSecondaryAssetSrc || block.supportGallery?.length) && (
          <LessonDocGallery
            items={[
              { assetSrc: block.supportAssetSrc, altAr: block.supportAltAr ?? 'وثيقة داعمة', captionAr: block.supportCaptionAr },
              { assetSrc: block.supportSecondaryAssetSrc, altAr: block.supportSecondaryAltAr, captionAr: block.supportSecondaryCaptionAr },
              ...(block.supportGallery ?? []),
            ]}
          />
        )}

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

