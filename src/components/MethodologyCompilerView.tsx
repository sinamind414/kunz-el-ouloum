import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Target, Sparkles, BookOpen, Layers, CheckCircle2, AlertTriangle, 
  Clock, ShieldAlert, ArrowLeft, ArrowRight, RotateCcw, 
  HelpCircle, Check, X, Award, ChevronDown, ChevronUp, Cpu, 
  Calendar, FileText, CheckSquare, Zap, Eye, Lightbulb, Compass, Key
} from 'lucide-react';
import {
  VERB_CARDS, UNIVERSAL_GRAMMAR_RULES, TRAINING_EXERCISES,
  ERROR_TAXONOMY, TrainingExercise, Switch, StepId, STEP_NAMES_AR, STEP_TEMPLATES, VERB_CARDS_V2, getVerbCardV2,
  detectSourceGate, isDualSource, detectExistenceGate, detectSourceKind, SourceGate, ExistenceGate, SourceKind, Movement, MEMORY_TEMPLATES, STEP0_TEMPLATE_AR, classifyConclusion,
  MIFTAH_VERSION, MIFTAH_NAME_OFFICIAL_AR, MIFTAH_NOMENCLATURE, READY_SENTENCES, SYNTHESIS, SPECIAL_FORMS
} from '../data/methodologyEngine';
import { isExtensionUnlocked, recordDrillResult, getDrillStatus, getMasteryStatus, recordTypeMastery, todayISO } from '../data/v3Progress';
import { DRILL_BANK, drawDailyConsignes, gradeDrill, PHASE0_DEMOS, isPhase0Done, completePhase0, resetPhase0, DrillAnswer, DrillConsigne, DrillGrade, DRILL_LABELS } from '../data/drillBank';
import { evaluateStudentProduction, ScoreReport, SwitchLine, StepLine } from '../utils/methodologyScorer';
import { logProduction, getProductionLogs, getVerbEvolution, VerbEvolutionStats, ProductionLogEntry, verbSlidingRatio } from '../utils/methodologyLog';
import { evaluatePhase2, remediationTargets } from '../utils/phase2';
import { addCorrectionItem, getCorrectionQueue, markCorrection, correctionStats, setRealScore } from '../utils/correctionQueue';
import { calibrationStats, calibrationMessageAr, gapOf } from '../utils/calibration';
import ProductionEvolutionPanel from './ProductionEvolutionPanel';
import BoussoleCard from './BoussoleCard';
import MiftahCard from './MiftahCard';
import { TIME_RULES, getStepData } from '../data/boussoleData';

// B1 · tons du rapport + libellés interrupteur au niveau module (le bloc « 4 étapes » les lit hors closure)
const TONE = {
  red:     'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/40 text-red-800 dark:text-red-200',
  amber:   'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40 text-amber-800 dark:text-amber-200',
  emerald: 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-200',
  muted:   'bg-gray-50 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700 text-gray-400',
} as const;
type ToneKey = keyof typeof TONE;
const switchTone = (s: SwitchLine): ToneKey =>
  s.violated ? 'red'
  : s.choiceCorrect === false ? 'amber'
  : 'emerald';
const swAr = (s: Switch): string => (s === 'open' ? 'مفتوح' : 'مغلق');

// m2 · seuil d'automatisation unique (code + texte d'aide)
const AUTOMATION_THRESHOLD = 90;
const icmLabel = (icm: number | null): string => icm === null ? '' : icm < 60 ? 'ضعيف' : icm < 90 ? 'متوسط' : 'ممتاز';
const icmLabelFr = (icm: number | null): string => icm === null ? '' : icm < 60 ? 'faible' : icm < 90 ? 'moyen' : 'fort';

const REVIEW_GAPS = [1, 3, 7, 16, 30];

interface MethodologyProps {
  onBackToHome?: () => void;
}

export default function MethodologyCompilerView({ onBackToHome }: MethodologyProps) {
  // Navigation Tabs: 'engine_rules' (Couche 0) | 'verbs_ref' (Fiches) | 'simulator' (4 Stades) | 'mastery_matrix' (Analytics & Erreurs)
  const [activeTab, setActiveTab] = useState<'simulator' | 'verbs_ref' | 'engine_rules' | 'mastery_matrix' | 'correction' | 'boussole_card'>('simulator');
  // File de correction (Phase 3) — bump pour rafraîchir l'onglet + le badge
  const [correctionVersion, setCorrectionVersion] = useState(0);
  const [refCardOpen, setRefCardOpen] = useState(false); // carte-référence en stage 4
  // Phase 4 — auto-évaluation /20 (calibration) + brouillons des notes réelles
  const [selfScore, setSelfScore] = useState<string>('');
  const [realScoreDrafts, setRealScoreDrafts] = useState<Record<string, string>>({});
  // Ligne 7 — mode examen (auto-scoring + note réelle humaine de référence) / révision libre (dernier mois)
  const [examMode, setExamMode] = useState(false);
  const [freeReview, setFreeReview] = useState(false);
  // Update 2026-09-06 (MARQUE §12) — TROIS PORTES en cascade :
  //   🚪 existence = sourceGate ('paper'⇔قفل / 'memory'⇔لا قفل) · 📥 gate2 · ⚙️ gate3
  const [gate2Choice, setGate2Choice] = useState<SourceKind | null>(null);
  const [gate3Choice, setGate3Choice] = useState<Movement | null>(null);
  const [showGate2, setShowGate2] = useState(false);

  // Selected Verb & Exercise for Training
  const [selectedVerbId, setSelectedVerbId] = useState<string>('verb_analyse_v1');
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>('ex_analyse_protein_01');
  const [currentStage, setCurrentStage] = useState<1 | 2 | 3 | 4>(1);
  const [switchChoice, setSwitchChoice] = useState<Switch | null>(null);
  const [showSwitchGate, setShowSwitchGate] = useState(false);
  // V3.1 double gate ورقة/رأس
  const [sourceGate, setSourceGate] = useState<SourceGate | null>(null);
  const [showSourceGate, setShowSourceGate] = useState(false);
  const [isDual, setIsDual] = useState(false);
  const [step0Text, setStep0Text] = useState<string>('');
  const [extensionUnlocked, setExtensionUnlocked] = useState<boolean>(false);
  // D1 (MARQUE §11) : drill = 3 jours distincts à 12/12 ; verso = 3 types maîtrisés (stage 4).
  const [drillStatus, setDrillStatus] = useState(() => getDrillStatus());
  const [masteryStatus, setMasteryStatus] = useState(() => getMasteryStatus());
  // Phase 1 (audit §6) : مصفاة التعليمات — 12 consignes tirées du jour sur une banque ≥ 50,
  // deux portes par consigne (source + mode), 60 s. Phase 0 ouvre le d'abord.
  const DRILL_TODAY: DrillConsigne[] = React.useMemo(() => drawDailyConsignes(todayISO()), []);
  const [drillActive, setDrillActive] = useState(false);
  const [drillSec, setDrillSec] = useState(60);
  const [drillAnswers, setDrillAnswers] = useState<Record<string, DrillAnswer>>({});
  const [drillGrade, setDrillGrade] = useState<DrillGrade | null>(null);
  // Phase 0 — auto-pace, avec feedback
  const [phase0Done, setPhase0Done] = useState(() => isPhase0Done());
  const [p0Index, setP0Index] = useState(0);
  const [p0Pick, setP0Pick] = useState<DrillAnswer>({});
  const [p0Shown, setP0Shown] = useState(false);

  // Stage 1: Modelage State
  const [highlightedSteps, setHighlightedSteps] = useState<Record<number, boolean>>({});

  // Stage 2: Complétion State
  const [clozeAnswers, setClozeAnswers] = useState<Record<string, string>>({});
  const [clozeSubmitted, setClozeSubmitted] = useState<boolean>(false);

  // Stage 3 & 4: Production States
  const [studentText, setStudentText] = useState<string>('');
  const [selectedEvidenceForCriterion, setSelectedEvidenceForCriterion] = useState<Record<string, boolean>>({});

  // Stage 4: 90 Seconds Draft & Timer
  const [timerSeconds, setTimerSeconds] = useState<number>(180);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [draftVerb, setDraftVerb] = useState<string>('');
  const [draftSteps, setDraftSteps] = useState<string>('');
  const [draftFinalSentence, setDraftFinalSentence] = useState<string>('');
  const [isDraftCompleted, setIsDraftCompleted] = useState<boolean>(false);

  // Evaluation & Results
  const [scoreReport, setScoreReport] = useState<ScoreReport | null>(null);

  // Expanded verb in verbs_ref
  const [expandedVerbCardId, setExpandedVerbCardId] = useState<string | null>('verb_analyse_v1');

  // Carnet de bord : historique des productions & diagnostic d'évolution
  const [evolutionVersion, setEvolutionVersion] = useState(0); // bump pour rafraîchir le diagnostic

  // m1 · aucune statistique fictive : le carnet (localStorage) est la seule source
  const [matrixScores, setMatrixScores] = useState<Record<string, Record<string, number>>>({});

  const [weeklyErrorCounters, setWeeklyErrorCounters] = useState<Record<string, number>>({});

  const currentVerb = VERB_CARDS.find(v => v.id === selectedVerbId) || VERB_CARDS[0];
  const currentExercise = TRAINING_EXERCISES.find(e => e.id === selectedExerciseId) || null;

  // Diagnostic d'évolution : statistiques par verbe depuis le carnet de bord
  const evolutionStats: VerbEvolutionStats[] = React.useMemo(
    () => VERB_CARDS.map(v => getVerbEvolution(v.id)).filter((s): s is VerbEvolutionStats => s !== null),
    [evolutionVersion]
  );
  const currentVerbStats = getVerbEvolution(selectedVerbId);

  // B2 · écran interrupteur : tant que le gate est ouvert, seuls contexte + gate sont rendus
  // V3.1 : double gate — Gate1 ورقة/رأس puis Gate2 صورة/فيلم
  const gateOpen = currentStage === 3 && (showSourceGate || showGate2 || showSwitchGate);

  // m3 · bouton de dev réservé au développement
  const isDev = (import.meta as unknown as { env?: { DEV?: boolean } }).env?.DEV === true;

  // V3.1 : extension unlocked check
  useEffect(() => {
    setExtensionUnlocked(isExtensionUnlocked());
    setDrillStatus(getDrillStatus());
    setMasteryStatus(getMasteryStatus());
  }, [evolutionVersion]);

  // m1 · header = dernier ICM du carnet, ou « — » si aucune production
  const lastIcm: number | null = React.useMemo(() => {
    const logs = getProductionLogs();
    return logs.length ? logs[logs.length - 1].icm : null;
  }, [evolutionVersion]);

  // m1 · calendrier calculé depuis le carnet : prochaine révision par verbe (J+1/3/7/16/30)
  const reviewSchedule = React.useMemo(() => {
    const byVerb = new Map<string, ProductionLogEntry[]>();
    getProductionLogs().forEach(e => {
      const arr = byVerb.get(e.verbId) || [];
      arr.push(e);
      byVerb.set(e.verbId, arr);
    });
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const items: { verbAr: string; gap: number; nextDate: Date; due: boolean; daysLeft: number }[] = [];
    byVerb.forEach(entries => {
      const sorted = [...entries].sort((a, b) => a.dateISO.localeCompare(b.dateISO));
      const last = sorted[sorted.length - 1];
      const gap = REVIEW_GAPS[Math.min(sorted.length - 1, REVIEW_GAPS.length - 1)];
      const nextDate = new Date(last.dateISO);
      nextDate.setHours(0, 0, 0, 0);
      nextDate.setDate(nextDate.getDate() + gap);
      const daysLeft = Math.round((nextDate.getTime() - today.getTime()) / 86400000);
      items.push({ verbAr: last.verbAr, gap, nextDate, due: daysLeft <= 0, daysLeft: Math.max(0, daysLeft) });
    });
    return items.sort((a, b) => a.nextDate.getTime() - b.nextDate.getTime());
  }, [evolutionVersion]);

  // Mineur · placeholder de l'éditeur dérivé des moules du verbe (filtré par card.path)
  // V3.1 : si sourceGate===memory → قالب حفظ
  const editorPlaceholder = React.useMemo(() => {
    if (sourceGate === 'memory') {
      const card = getVerbCardV2(selectedVerbId);
      if (card?.id === 'verb_list_v1') return `اكتب صياغتك المنهجية الكاملة هنا...\n${MEMORY_TEMPLATES.list.ar}`;
      return `اكتب صياغتك المنهجية الكاملة هنا...\n${MEMORY_TEMPLATES.define.ar}`;
    }
    const card = getVerbCardV2(selectedVerbId);
    if (!card) return 'اكتب صياغتك المنهجية الكاملة هنا...';
    if (isDual && card.path.includes(2) && card.path.includes(3)) {
      return `اكتب صياغتك المنهجية الكاملة هنا...\nمن الوثيقة: قيمة + وحدة\nمن الدرس: آلية/مكتسب\nثم ${STEP_TEMPLATES[4][0]}`;
    }
    const parts: string[] = [];
    if (card.path.includes(2)) parts.push(STEP_TEMPLATES[2][0]);
    if (card.path.includes(3)) {
      const mold = (STEP_TEMPLATES[3] as unknown as Record<string, string[]>)[card.step3Mode]?.[0];
      if (mold) parts.push(mold);
    }
    if (card.path.includes(4)) parts.push(STEP_TEMPLATES[4][0]);
    return `اكتب صياغتك المنهجية الكاملة هنا...\n${parts.join('\n')}`;
  }, [selectedVerbId, sourceGate, isDual]);

  // Timer Effect for Stage 4
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  // V3.1 drill timer 60s
  useEffect(() => {
    if (!drillActive) return;
    if (drillSec <= 0) {
      setDrillActive(false);
      const g = gradeDrill(DRILL_TODAY, drillAnswers);
      setDrillGrade(g);
      recordDrillResult(g.score);
      setDrillStatus(getDrillStatus());
      setExtensionUnlocked(isExtensionUnlocked());
      return;
    }
    const id = setInterval(()=> setDrillSec(s=> s-1), 1000);
    return ()=> clearInterval(id);
  }, [drillActive, drillSec]);

  // Handle stage change
const handleSelectStage = (stage: 1 | 2 | 3 | 4) => {
     if (!currentExercise) return;
     setCurrentStage(stage);
     setScoreReport(null);
     setSwitchChoice(null);
     if (stage === 3) {
      if (freeReview) {
        // Révision libre (dernier mois) : la méthode est un outil, pas un mur — pas de portes
        setSourceGate(null);
        setIsDual(false);
        setSwitchChoice(null);
        setGate2Choice(null);
        setGate3Choice(null);
        setShowSourceGate(false);
        setShowGate2(false);
        setShowSwitchGate(false);
        return;
      }
       // V3.1 double gate : Gate1 ورقة/رأس auto-skip pour paper pour préserver test harness
      // TROIS PORTES en cascade (MARQUE §12) — l'élève répond TOUJOURS la porte 1 d'abord.
      setSourceGate(null);
      setIsDual(false);
      setSwitchChoice(null);
      setGate2Choice(null);
      setGate3Choice(null);
      setShowSourceGate(true);
      setShowGate2(false);
      setShowSwitchGate(false);
     } else if (stage === 4) {
       setSourceGate(null);
       setShowSourceGate(false);
       setShowSwitchGate(false);
       setTimerSeconds(examMode ? 3600 : currentExercise.stage4.timeLimitSec);
       setIsTimerRunning(true);
       setIsDraftCompleted(false);
       if (freeReview) setRefCardOpen(true); // la carte reste un outil permanent
     } else {
       setShowSourceGate(false);
       setShowSwitchGate(false);
       setIsTimerRunning(false);
     }
   };

  // Submit Stage 2
  const handleCheckStage2 = () => {
    if (!currentExercise) return;
    setClozeSubmitted(true);
    let fullText = currentExercise.stage2.clozePrompt;
    currentExercise.stage2.blanks.forEach(b => {
      fullText = fullText.replace(`{{${b.id}}}`, clozeAnswers[b.id] || '');
    });
    const rep = evaluateStudentProduction(selectedVerbId, fullText, undefined, 2, { switchChoice });
    setScoreReport(rep);
    // Carnet de bord : archiver la production complétée (diagnostic d'évolution)
    logProduction({
      verbId: selectedVerbId,
      verbAr: currentVerb.verbAr,
      theme: currentExercise.theme,
      stage: 2,
      text: fullText,
      icm: rep.icm,
      criteriaSummary: rep.criteriaResults.map(c => ({ label: c.label, passed: c.passed })),
      errorTags: rep.detectedErrors.map(e => e.tag),
    });
    setEvolutionVersion(v => v + 1);

    // Lot 0011: stage 2 errors also update weekly error counters
    if (rep.detectedErrors.length > 0) {
      setWeeklyErrorCounters(prev => {
        const nextCounters = { ...prev };
        rep.detectedErrors.forEach(err => {
          nextCounters[err.tag] = (nextCounters[err.tag] || 0) + 1;
        });
        return nextCounters;
      });
    }
  };

  // Submit Stage 3 or 4
  const handleSubmitProduction = () => {
    if (!currentExercise) return;
    const draft = {
      verb: draftVerb,
      steps: draftSteps,
      finalSentence: draftFinalSentence
    };
    const rep = evaluateStudentProduction(selectedVerbId, studentText, draft, currentStage, { switchChoice });
    setScoreReport(rep);

    // Carnet de bord : archiver le brouillon complet de l'élève (texte + résumé)
    const fullDraft = `${studentText}${draftVerb || draftSteps || draftFinalSentence ? `\n— البطاقة: ${[draftVerb, draftSteps, draftFinalSentence].filter(Boolean).join(' · ')}` : ''}`.trim();
    logProduction({
      verbId: selectedVerbId,
      verbAr: currentVerb.verbAr,
      theme: currentExercise.theme,
      stage: currentStage === 4 ? 4 : 3,
      text: fullDraft,
      icm: rep.icm,
      criteriaSummary: rep.criteriaResults.map(c => ({ label: c.label, passed: c.passed })),
      errorTags: rep.detectedErrors.map(e => e.tag),
      durationSec: currentStage === 4 && currentExercise ? Math.max(0, currentExercise.stage4.timeLimitSec - timerSeconds) : undefined,
    });
    // D1 (MARQUE §11) : stage 4 au seuil = type de question maîtrisé → verso débloqué à 3 types.
    if (currentStage === 4 && rep.icm >= currentExercise.stage4.passIcmThreshold) {
      recordTypeMastery(selectedVerbId);
      setMasteryStatus(getMasteryStatus());
      setExtensionUnlocked(isExtensionUnlocked());
    }

    // Phase 3 (audit §3.5) : la production passe au correcteur UNIQUEMENT si la
    // FORME est validée — sinon renvoi ciblé (micro-2a), pas de file.
    if (currentStage >= 3) {
      // Update 2026-09-06 (MARQUE §12) — verdict sur les 3 portes + la forme
      const q = currentExercise.question;
      const cardV2 = getVerbCardV2(selectedVerbId);
      const expExistence = detectExistenceGate(q);
      const expSource = expExistence === 'lock' ? (detectSourceKind(q) ?? 'document') : null;
      const expMovement: Movement | null = expExistence === 'lock' ? (cardV2 && cardV2.movement !== 'drawer' ? cardV2.movement : 'photo') : null;
      const gatesActive = currentStage === 3 && !freeReview;
      const existenceOk = gatesActive && sourceGate ? ((sourceGate === 'paper' ? 'lock' : 'no_lock') === expExistence) : null;
      const sourceOk = gatesActive && sourceGate === 'paper' ? (gate2Choice && expSource ? gate2Choice === expSource : null) : null;
      const movementOk = gatesActive && sourceGate === 'paper' ? (gate3Choice && expMovement ? gate3Choice === expMovement : null) : null;
      const verdict = evaluatePhase2({
        existenceGateOk: existenceOk,
        sourceGateOk: sourceOk,
        movementGateOk: movementOk,
        icm: rep.icm,
        typicalErrorViolated: rep.switchLine.violated,
      });
      if (verdict.formeValidee) {
        const self = currentStage === 4 ? Number(selfScore) : undefined;
        addCorrectionItem({
          verbId: selectedVerbId, verbAr: currentVerb.verbAr, theme: currentExercise.theme,
          stage: currentStage === 4 ? 4 : 3,
          dateISO: new Date().toISOString(),
          text: fullDraft, icm: rep.icm, errorTags: rep.detectedErrors.map(e => e.tag),
          selfScore: self != null && isFinite(self) && self >= 0 && self <= 20 ? self : undefined,
          mode: examMode ? 'examen' : undefined,
        });
        setCorrectionVersion(v => v + 1);
        if (!examMode) setSelfScore(''); // en examen: la prévision reste visible sur la carte de résultat
      }
    }
    setEvolutionVersion(v => v + 1);

    // Update matrix score & error counters
    if (currentExercise.theme) {
      setMatrixScores(prev => ({
        ...prev,
        [selectedVerbId]: {
          ...(prev[selectedVerbId] || {}),
          [currentExercise.theme]: rep.icm
        }
      }));
    }

    if (rep.detectedErrors.length > 0) {
      setWeeklyErrorCounters(prev => {
        const nextCounters = { ...prev };
        rep.detectedErrors.forEach(err => {
          nextCounters[err.tag] = (nextCounters[err.tag] || 0) + 1;
        });
        return nextCounters;
      });
    }
  };

  // Reprendre un brouillon archivé (diagnostic → simulateur)
  const handleResumeDraft = (entry: ProductionLogEntry) => {
    setSelectedVerbId(entry.verbId);
    const ex = TRAINING_EXERCISES.find(e => e.verbId === entry.verbId && e.theme === entry.theme)
      || TRAINING_EXERCISES.find(e => e.verbId === entry.verbId)
      || TRAINING_EXERCISES[0];
    setSelectedExerciseId(ex.id);
    setCurrentStage(entry.stage === 2 ? 2 : 4);
    // Restaurer le texte (retirer le résumé « البطاقة » stocké après la ligne)
    const restoredText = entry.text.split('\n— البطاقة:')[0];
    setStudentText(restoredText);
    const draftPart = entry.text.includes('— البطاقة:') ? entry.text.split('— البطاقة:')[1].split(' · ') : [];
    setDraftVerb(draftPart[0] || '');
    setDraftSteps(draftPart[1] || '');
    setDraftFinalSentence(draftPart[2] || '');
    setIsDraftCompleted(!!restoredText);
    setScoreReport(null);
    // M2 · aucun choix résiduel : l'interrupteur se rejoue à chaque verbe (jamais de choiceCorrect au bac)
    setSwitchChoice(null);
    setShowSwitchGate(false);
    setActiveTab('simulator');
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset exercise
  const handleResetExercise = () => {
    setStudentText('');
    setHighlightedSteps({});
    setClozeAnswers({});
    setClozeSubmitted(false);
    setScoreReport(null);
    // M2 · changer de verbe/exercice au stade 3 rouvre le gate (le choix ne survit pas)
    setSwitchChoice(null);
    if (currentStage === 3 && currentExercise) {
      const sg = detectSourceGate(currentExercise.question);
      setSourceGate(sg);
      setIsDual(isDualSource(currentExercise.question));
      const verbCard = getVerbCardV2(selectedVerbId);
      const isMemoryVerb = verbCard?.id === 'verb_define_v1' || verbCard?.id === 'verb_list_v1';
      if (isMemoryVerb || sg === 'memory') {
        setShowSourceGate(true);
        setShowSwitchGate(false);
      } else if (sg === 'paper') {
        setShowSourceGate(false);
        setShowSwitchGate(true);
      } else {
        setShowSourceGate(true);
        setShowSwitchGate(false);
      }
    } else {
      setShowSourceGate(false);
      setShowSwitchGate(false);
    }
    setDraftVerb('');
    setDraftSteps('');
    setDraftFinalSentence('');
    setIsDraftCompleted(false);
    if (currentStage === 4 && currentExercise) {
      setTimerSeconds(currentExercise.stage4.timeLimitSec);
      setIsTimerRunning(true);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-3 md:p-6 pb-28 text-right font-sans" dir="rtl">
      
      {/* Header Banner: Le Compilateur SVT */}
      <header className="bg-gradient-to-r from-[#006d37] via-[#008744] to-[#10b981] text-white p-5 md:p-7 rounded-3xl shadow-lg mb-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold mb-2">
              <Cpu className="w-3.5 h-3.5" />
              <span>نظام التجميع البيداغوجي الموحد (Compilateur SVT)</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">🔑 {MIFTAH_NAME_OFFICIAL_AR} v{MIFTAH_VERSION}</h1>
            <p className="text-white/90 text-sm md:text-base mt-1 max-w-2xl font-medium">
              4 أسنان · 3 بوابات · إجابة تفتح النقطة — منهجية الإجابة في علوم الحياة والأرض · بكالوريا
            </p>
          </div>

          {/* Quick Metrics Badge */}
          <div className="flex items-center gap-3 bg-black/20 backdrop-blur-md p-3 rounded-2xl border border-white/15">
            <div className="text-center px-3 border-l border-white/20">
              <span className="block text-[11px] text-white/80 font-bold">مؤشر ICM الحالي</span>
              <span className="text-xl md:text-2xl font-black text-[#fed65b]">{lastIcm === null ? '—' : `${lastIcm}%`}</span>
              {lastIcm !== null && <span className="block text-[10px] font-black leading-none mt-0.5 text-white">{icmLabel(lastIcm)} <span className="opacity-70 font-normal latin">({icmLabelFr(lastIcm)})</span></span>}
            </div>
            <div className="text-center px-3">
              <span className="block text-[11px] text-white/80 font-bold">المرحلة النشطة</span>
              <span className="text-sm md:text-base font-black text-white">المستوى {currentStage} / 4</span>
            </div>
          </div>
        </div>

        {/* Global Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pt-5 mt-4 border-t border-white/20 no-scrollbar">
          <button
            onClick={() => setActiveTab('simulator')}
            className={`px-4 py-2 rounded-xl font-bold text-xs md:text-sm whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'simulator'
                ? 'bg-white text-[#006d37] shadow-md'
                : 'bg-white/15 text-white hover:bg-white/25'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>الخطوات الأربع</span>
          </button>

          <button
            onClick={() => setActiveTab('verbs_ref')}
            className={`px-4 py-2 rounded-xl font-bold text-xs md:text-sm whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'verbs_ref'
                ? 'bg-white text-[#006d37] shadow-md'
                : 'bg-white/15 text-white hover:bg-white/25'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>فهرس الأفعال الثمانية والنماذج</span>
          </button>

          <button
            onClick={() => setActiveTab('mastery_matrix')}
            className={`px-4 py-2 rounded-xl font-bold text-xs md:text-sm whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'mastery_matrix'
                ? 'bg-white text-[#006d37] shadow-md'
                : 'bg-white/15 text-white hover:bg-white/25'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>مصفوفة الإتقان</span>
          </button>

          <button
            onClick={() => setActiveTab('correction')}
            className={`px-4 py-2 rounded-xl font-bold text-xs md:text-sm whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'correction'
                ? 'bg-white text-[#006d37] shadow-md'
                : 'bg-white/15 text-white hover:bg-white/25'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>المصححة {correctionStats().pending > 0 ? `(${correctionStats().pending})` : ''}</span>
          </button>

          <button
            onClick={() => setActiveTab('engine_rules')}
            className={`px-4 py-2 rounded-xl font-bold text-xs md:text-sm whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'engine_rules'
                ? 'bg-white text-[#006d37] shadow-md'
                : 'bg-white/15 text-white hover:bg-white/25'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>قواعد الإجابة الـ 4 (الطبقة 0)</span>
          </button>

          <button
            onClick={() => setActiveTab('boussole_card')}
            className={`px-4 py-2 rounded-xl font-bold text-xs md:text-sm whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'boussole_card'
                ? 'bg-white text-[#006d37] shadow-md'
                : 'bg-white/15 text-white hover:bg-white/25'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>🔑 {MIFTAH_NOMENCLATURE.miftah} — للطباعة</span>
          </button>
        </div>
      </header>

      {/* TAB 1: 4-STAGE FADING SIMULATOR */}
      {activeTab === 'simulator' && (
        <section className="space-y-6">
          {/* Top Stage Progression Bar */}
          <div className="bg-white dark:bg-[#161c18] p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="flex flex-col md:flex-row items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-gray-500 dark:text-gray-400">فعل الأداء:</span>
                <select
                  value={selectedVerbId}
                  onChange={(e) => {
                    setSelectedVerbId(e.target.value);
                    const matchingEx = TRAINING_EXERCISES.find(ex => ex.verbId === e.target.value);
                    if (matchingEx) setSelectedExerciseId(matchingEx.id);
                    handleResetExercise();
                  }}
                  className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-black text-gray-900 dark:text-white px-3 py-1.5 rounded-xl text-sm"
                >
                  {VERB_CARDS_V2.map(v => {
                     const isMemory = v.id === 'verb_define_v1' || v.id === 'verb_list_v1';
                     const locked = isMemory && !extensionUnlocked;
                     return (
                     <option key={v.id} value={v.id} disabled={locked}>{v.verbAr}{locked ? ' — 🔒 بعد إتقان ٣ أنواع أسئلة' : ''}</option>
                     );
                  })}
                </select>
              </div>

              {(() => {
                const verbExercises = TRAINING_EXERCISES.filter(ex => ex.verbId === selectedVerbId);
                if (verbExercises.length <= 1) return null;
                return (
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-gray-500 dark:text-gray-400">الوثيقة:</span>
                    <select
                      value={selectedExerciseId}
                      onChange={(e) => {
                        setSelectedExerciseId(e.target.value);
                        handleResetExercise();
                      }}
                      className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-black text-gray-900 dark:text-white px-3 py-1.5 rounded-xl text-sm"
                    >
                      {verbExercises.map(ex => (
                        <option key={ex.id} value={ex.id}>{ex.themeAr} — {ex.supportTitle}</option>
                      ))}
                    </select>
                  </div>
                );
              })()}

              <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                القاعدة: لا نسحب وسيلتي مساعدة في نفس الوقت
              </div>
            </div>

            {/* Indicateur d'évolution du verbe sélectionné */}
            {currentVerbStats && (
              <div className="flex flex-wrap items-center gap-2 pt-1 px-1">
                <span className="text-[10px] font-black text-gray-500 dark:text-gray-400">تطورك في هذا الفعل:</span>
                <span className="text-[10px] font-bold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full px-2 py-0.5">
                  {currentVerbStats.attempts} محاولات
                </span>
                <span className="text-[10px] font-bold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full px-2 py-0.5">
                  آخر علامة: {currentVerbStats.last}%
                </span>
                {currentVerbStats.delta !== null && (
                  <span className={`text-[10px] font-black rounded-full px-2 py-0.5 ${currentVerbStats.delta > 0 ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300' : currentVerbStats.delta < 0 ? 'bg-rose-100 dark:bg-rose-950/40 text-rose-600' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
                    {currentVerbStats.delta > 0 ? '▲ +' : currentVerbStats.delta < 0 ? '▼ ' : '＝ '}{currentVerbStats.delta}
                  </span>
                )}
                <span className="text-[9px] text-gray-400 dark:text-gray-600 font-bold">(محفوظ محلياً — شخّص تطورك في «مصفوفة الإتقان»)</span>
              </div>
            )}

{/* Ligne 7 — mode examen / mode révision libre (dernier mois) */}
            <div className="flex flex-wrap gap-2 pt-2">
              <button
                onClick={() => {
                  const next = !examMode;
                  setExamMode(next);
                  if (next && currentExercise) {
                    handleSelectStage(4);
                    setTimerSeconds(3600);
                    setIsTimerRunning(true);
                  } else if (!next && currentStage === 4 && currentExercise) {
                    setTimerSeconds(currentExercise.stage4.timeLimitSec);
                  }
                }}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-black border transition-all ${examMode ? 'bg-slate-800 text-white border-slate-700 ring-2 ring-slate-500/30' : 'bg-gray-50 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'}`}
              >
                🎓 وضع الامتحان — 60د · بلا إعادة · النتيجة هي الحكم
              </button>
              <button
                onClick={() => setFreeReview(f => !f)}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-black border transition-all ${freeReview ? 'bg-violet-600 text-white border-violet-500 ring-2 ring-violet-500/30' : 'bg-gray-50 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'}`}
              >
                📖 المراجعة الحرة (الشهر الأخير) — بلا جدران
              </button>
            </div>
            {freeReview && (
              <div className="mt-2 p-3 rounded-xl bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-900/50 text-[11px] font-bold text-violet-900 dark:text-violet-300 leading-relaxed">
                📖 المراجعة الحرة: أي محطة مطلوبة، البطاقة مرجع دائم، بلا جدران — المنهجية أداة، لا سياج.
              </div>
            )}

{/* 4 Stages Pills */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2">
{[
                { num: 1, title: 'النمذجة (Modelage)', desc: 'تحديد خطوات الخبير بالألوان' },
                { num: 2, title: 'الإكمال (Complétion)', desc: 'ملء الفراغات مع روابط جاهزة' },
                { num: 3, title: 'إنتاج موجه (Guidée)', desc: 'كتابة مع البوصلة والإثبات' },
                { num: 4, title: 'محاكاة البكالوريا', desc: 'توقيت + مسودة 90ث + بدون مساعدة' }
              ].map(st => (
                <button
                  key={st.num}
                  onClick={() => handleSelectStage(st.num as any)}
                  className={`p-3 rounded-xl border text-right transition-all flex flex-col justify-between ${
                    currentStage === st.num
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 shadow-sm ring-2 ring-emerald-500/20'
                      : 'bg-gray-50 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                      currentStage === st.num ? 'bg-emerald-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}>
                      {st.num}
                    </span>
                    {currentStage === st.num && (
                      <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-bold">نشط</span>
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-xs md:text-sm text-gray-900 dark:text-white">{st.title}</h4>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 leading-tight">{st.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>


          {/* Phase 0 — افتح الباب : 6 éléments auto-pace avec feedback (audit §6) */}
          {/* Phase 0 — افتح الباب : 6 éléments auto-pace, cascade des 3 portes (MARQUE §12) */}
          {!phase0Done && (() => {
            const demo = PHASE0_DEMOS[p0Index];
            const item = DRILL_BANK.find(c => c.id === demo.bankId)!;
            const ok1 = p0Pick.g1 === item.existence;
            const ok2 = item.source === null ? true : p0Pick.g2 === item.source;
            const ok3 = item.movement === 'drawer' ? true : p0Pick.g3 === item.movement;
            const allOk = ok1 && ok2 && ok3;
            const answered = !!p0Pick.g1 && (item.source === null || !!p0Pick.g2) && (item.movement === 'drawer' || !!p0Pick.g3);
            const btnCls = (active: boolean, correct: boolean, tone: string) =>
              p0Shown ? `${correct ? 'bg-emerald-600 text-white border-emerald-600' : `bg-white dark:bg-[#1b221e] border-gray-300 opacity-60`}`
                      : (active ? `bg-${tone}-600 text-white border-${tone}-600` : 'bg-white dark:bg-[#1b221e] border-gray-300');
            return (
              <div className="bg-gradient-to-r from-emerald-50 to-amber-50 dark:from-emerald-950/30 dark:to-amber-950/20 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-900/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-black text-sm">🚪 Phase 0 — افتح الباب <span className="text-xs font-bold text-gray-500">({p0Index + 1}/6)</span></div>
                  <button onClick={()=>{resetPhase0(); setP0Index(0); setP0Pick({}); setP0Shown(false);}} className="text-[11px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 underline">إعادة</button>
                </div>
                <div className="bg-white dark:bg-[#161c18] p-3 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-bold">{item.consigne}</div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <div className="text-[11px] font-bold text-gray-500 mb-1">🚪 البوابة ١ — قفل؟</div>
                    <div className="flex gap-1">
                      {([['lock','🔒 قفل'],['no_lock','🧠 لا قفل']] as const).map(([v,l])=>(
                        <button key={v} disabled={p0Shown} onClick={()=> setP0Pick(pk=>({...pk, g1: v}))} className={`px-2 py-1.5 rounded-lg text-xs font-bold border ${btnCls(p0Pick.g1===v, p0Shown && v===item.existence, 'emerald')}`}>{l}</button>
                      ))}
                    </div>
                  </div>
                  {p0Pick.g1 === 'lock' && (
                    <div>
                      <div className="text-[11px] font-bold text-gray-500 mb-1">📥 البوابة ٢ — المصدر؟</div>
                      <div className="flex gap-1">
                        {([['document','📄 وثيقة'],['mixed','📄+🧠 مختلط']] as const).map(([v,l])=>(
                          <button key={v} disabled={p0Shown} onClick={()=> setP0Pick(pk=>({...pk, g2: v}))} className={`px-2 py-1.5 rounded-lg text-xs font-bold border ${btnCls(p0Pick.g2===v, p0Shown && v===item.source, 'sky')}`}>{l}</button>
                        ))}
                      </div>
                    </div>
                  )}
                  {p0Pick.g1 === 'lock' && p0Pick.g2 && (
                    <div>
                      <div className="text-[11px] font-bold text-gray-500 mb-1">⚙️ البوابة ٣ — الحركة؟</div>
                      <div className="flex gap-1">
                        {([['photo','📷'],['film','🎬'],['smith','🔨']] as const).map(([v,l])=>(
                          <button key={v} disabled={p0Shown} onClick={()=> setP0Pick(pk=>({...pk, g3: v}))} className={`px-2 py-1.5 rounded-lg text-xs font-bold border ${btnCls(p0Pick.g3===v, p0Shown && v===item.movement, 'violet')}`}>{l}</button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                {p0Shown ? (
                  <div className="space-y-1.5">
                    <div className={`text-xs font-bold ${allOk ? 'text-emerald-600' : 'text-amber-600'}`}>{allOk ? '✅ صحيح — القفل فُتح' : '✗ الإجابة الصحيحة مظللة أعلاه'}</div>
                    <div className="text-[11px] text-gray-600 dark:text-gray-400">{demo.whyAr}</div>
                    <button onClick={()=>{ if (p0Index + 1 >= PHASE0_DEMOS.length) { completePhase0(); setPhase0Done(true); } else { setP0Index(i=>i+1); setP0Pick({}); setP0Shown(false); } }} className="px-4 py-1.5 bg-[#006d37] text-white rounded-xl font-bold text-xs">{p0Index + 1 >= PHASE0_DEMOS.length ? '✅ إنهاء Phase 0 — المصفاة مفتوحة' : 'التالي'}</button>
                  </div>
                ) : (
                  <button disabled={!answered} onClick={()=> setP0Shown(true)} className={`px-4 py-1.5 rounded-xl font-bold text-xs ${answered ? 'bg-amber-600 text-white' : 'bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed'}`}>تأكيد</button>
                )}
              </div>
            );
          })()}

          {/* V3.1 مصفاة التعليمات — 60s 12 consignes (débloque verso) */}
          <div className="bg-gradient-to-r from-amber-50 to-sky-50 dark:from-amber-950/20 dark:to-sky-950/20 p-4 rounded-2xl border border-amber-200 dark:border-amber-900/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div>
              <div className="font-black text-sm flex items-center gap-2">🧠 مصفاة التعليمات — ٦٠ ث <span className="text-xs bg-white dark:bg-black/20 px-2 py-0.5 rounded-full border">٣ أيام × ١٢/١٢ → شارة «حامل المفتاح» + المرحلة ٢</span></div>
              <div className="text-xs text-gray-600 dark:text-gray-400">ورقة أم رأس؟ 🚪 قفل؟ 📥 من أين؟ ⚙️ أي حركة؟ {drillStatus.met ? '✅ ' + drillStatus.badgeAr : `أيام ناجحة: ${drillStatus.perfectDays} / ${drillStatus.goal}`} — الإخفاق لا يصفّر: يؤجل اليوم التالي فقط · الورقة الخلفية: {masteryStatus.met ? '✅ ' + masteryStatus.badgeAr : `إتقان ${masteryStatus.types.length} / ${masteryStatus.goal} أنواع`}</div>
              <div className="text-[11px] text-gray-500 dark:text-gray-400">تتبدل التعليمات كل يوم (بنك ٦٩) — القاعدة واحدة: احفظ القاعدة لا العناصر</div>
            </div>
            {!drillActive ? (
              <button disabled={!phase0Done} onClick={()=>{setDrillAnswers({}); setDrillGrade(null); setDrillSec(60); setDrillActive(true);}} className={`px-4 py-2 rounded-xl font-bold text-xs shadow ${phase0Done ? 'bg-[#006d37] text-white' : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'}`}>{phase0Done ? (drillStatus.met ? 'إعادة المصفاة' : 'ابدأ المصفاة') : '🔒 أكمل Phase 0 أولا'}</button>
            ) : (
              <div className="font-mono font-black text-lg bg-black/10 px-3 py-1 rounded-xl">{drillSec} ث</div>
            )}
          </div>
{drillActive && (
            <div className="bg-white dark:bg-[#161c18] p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {DRILL_TODAY.map((c, i)=> (
                  <div key={c.id} className="p-2 rounded-xl border bg-gray-50 dark:bg-black/20 space-y-1">
                    <span className="text-xs font-bold leading-tight">{i + 1}. {c.consigne}</span>
                    <div className="flex flex-wrap items-center gap-1">
                      {([['lock','🔒 قفل'],['no_lock','🧠 لا قفل']] as const).map(([v,l])=> (
                        <button key={v} onClick={()=> setDrillAnswers(a=> ({...a, [c.id]: {...a[c.id], g1: v}}))} className={`px-2 py-1 rounded-lg text-[11px] font-bold border ${drillAnswers[c.id]?.g1===v ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white dark:bg-[#1b221e] border-gray-300'}`}>{l}</button>
                      ))}
                      {drillAnswers[c.id]?.g1 === 'lock' && (
                        <>
                          <span className="w-1 shrink-0" />
                          {([['document','📄 وثيقة'],['mixed','📄+🧠 مختلط']] as const).map(([v,l])=> (
                            <button key={v} onClick={()=> setDrillAnswers(a=> ({...a, [c.id]: {...a[c.id], g2: v}}))} className={`px-2 py-1 rounded-lg text-[11px] font-bold border ${drillAnswers[c.id]?.g2===v ? 'bg-sky-600 text-white border-sky-600' : 'bg-white dark:bg-[#1b221e] border-gray-300'}`}>{l}</button>
                          ))}
                        </>
                      )}
                      {drillAnswers[c.id]?.g1 === 'lock' && drillAnswers[c.id]?.g2 && (
                        <>
                          <span className="w-1 shrink-0" />
                          {([['photo','📷'],['film','🎬'],['smith','🔨']] as const).map(([v,l])=> (
                            <button key={v} onClick={()=> setDrillAnswers(a=> ({...a, [c.id]: {...a[c.id], g3: v}}))} className={`px-2 py-1 rounded-lg text-[11px] font-bold border ${drillAnswers[c.id]?.g3===v ? 'bg-violet-600 text-white border-violet-600' : 'bg-white dark:bg-[#1b221e] border-gray-300'}`}>{l}</button>
                          ))}
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={()=>{
                const g = gradeDrill(DRILL_TODAY, drillAnswers);
                setDrillGrade(g);
                recordDrillResult(g.score);
                setDrillStatus(getDrillStatus());
                setExtensionUnlocked(isExtensionUnlocked());
                setDrillActive(false);

              }} className="w-full py-2 bg-emerald-600 text-white rounded-xl font-bold text-sm">صحّح — {gradeDrill(DRILL_TODAY, drillAnswers).results.filter(r=>r.answered).length}/12</button>
            </div>
          )}
          {/* Phase 1 — résultats de la tentative du jour */}
          {drillGrade && !drillActive && (
            <div className="bg-white dark:bg-[#161c18] p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-2">
              <div className="font-black text-sm flex items-center justify-between">
                <span>نتيجة اليوم — {drillGrade.score}/12</span>
                <span className="text-xs text-gray-500">{drillStatus.met ? '✅ ' + drillStatus.badgeAr : `أيام ناجحة: ${drillStatus.perfectDays} / ${drillStatus.goal}`}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                {drillGrade.results.map(r=> (
                  <div key={r.c.id} className={`p-1.5 rounded-lg text-[11px] border ${r.correct ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/40' : 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900/40'}`}>
                    <span className="font-bold">{r.correct ? '✓' : '✗'} {r.c.consigne}</span>
                    {!r.correct && (() => {
                      const fail = [!r.ok1 ? 'البوابة ١' : null, !r.ok2 ? 'البوابة ٢' : null, !r.ok3 ? 'البوابة ٣' : null].filter(Boolean).join(' + ');
                      const ok = `${DRILL_LABELS.g1[r.c.existence]} · ${r.c.source ? DRILL_LABELS.g2[r.c.source] : '—'} · ${DRILL_LABELS.g3[r.c.movement]}`;
                      return <span className="block text-gray-500 dark:text-gray-400">الصحيح: {ok} — الخطأ: {fail}</span>;
                    })()}
                  </div>
                ))}
              </div>
            </div>
          )}



{/* StepBar — stages 1-3, masquée tant que le gate est ouvert (B2) */}
          {currentStage >= 1 && currentStage <= 3 && currentExercise && !gateOpen && (() => {
            const card = getVerbCardV2(selectedVerbId);
            if (!card) return null;
            const lampState = currentStage === 3 ? (switchChoice ?? 'pending') : card.switch;
            // Mineur · la case affiche le moule de l'étape, pas un « ✓ » qui se lit comme « fait »
            const moldForStep = (step: StepId): string => {
              if (step === 1) return 'المطلوب: ………';
              if (!card.path.includes(step)) return 'لا تُكتب هنا';
              if (step === 2) return STEP_TEMPLATES[2][0];
              if (step === 4) return STEP_TEMPLATES[4][0];
              const mold = (STEP_TEMPLATES[3] as unknown as Record<string, string[]>)[card.step3Mode]?.[0];
              if (mold) return `«${mold}»`;
              return lampState === 'open' ? '«لأنّ» مطلوبة' : 'لا «لأنّ»';
            };
            return (
              <div dir="rtl" className="space-y-2 mb-4">
                <div className="grid grid-cols-4 gap-2">
                  {([1, 2, 3, 4] as StepId[]).map(step => {
                    const applicable = step === 1 || card.path.includes(step);
                    const isStep3 = step === 3;
                    const isStep3Open = lampState === 'open';
                    const isStep3Pending = lampState === 'pending';
                    return (
                      <div key={step} className={`p-3 rounded-xl border text-center text-xs ${
                        !applicable ? 'bg-gray-50 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700 text-gray-400'
                        : isStep3 ? (isStep3Open ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40' : isStep3Pending ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40' : 'bg-gray-50 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700 text-gray-400')
                        : 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-200'
                      }`}>
                        <div className="font-black text-lg leading-none">{step}</div>
                        <div className="font-bold text-sm mt-1">{STEP_NAMES_AR[step]}</div>
                        {isStep3 && (
                          <div className={`mt-1 inline-block px-1.5 rounded text-[10px] font-bold ${
                            isStep3Open ? 'bg-emerald-200/60 dark:bg-emerald-900/60' : isStep3Pending ? 'bg-amber-200/60 dark:bg-amber-900/60' : 'bg-gray-200/80 dark:bg-gray-700 line-through'
                          }`}>
                            «لأنّ»
                          </div>
                        )}
                        <div className="mt-1 font-bold text-[11px] leading-relaxed">
                          {moldForStep(step)}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {/* Mineur · §8 : le Miftah est montré ET justifié */}
                <div className="text-[11px] font-bold text-gray-500 dark:text-gray-400 text-center">
                  {card.switch === 'open' ? 'الفعل يطلب الآلية ← «لأنّ» مطلوبة' : 'الفعل يطلب الوصف ← لا «لأنّ»'}
                </div>
              </div>
            );
          })()}

          {/* V3.1 Gate1 — ورقة أم رأس؟ (double gate) */}
          {/* 🚪 Update 2026-09-06 (MARQUE §12) — TROIS PORTES, cascade progressive */}
          {showSourceGate && currentStage === 3 && currentExercise && (() => {
            return (
              <div className="bg-white dark:bg-[#161c18] p-5 md:p-6 rounded-2xl border-2 border-amber-300 dark:border-amber-800 shadow-sm space-y-4">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <Key className="w-5 h-5 text-amber-500" />
                  <span>🚪 البوابة ١ — قفل أصلا؟</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">هل تستند المعطيات إلى وثيقة / شكل / جدول / منحنى / رسم؟ لا ⇒ 🧠 الدُرج مباشرة · نعم ⇒ البوابة ٢</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => { setSourceGate('paper'); setShowSourceGate(false); setShowGate2(true); setSwitchChoice(null); }}
                    className="p-4 rounded-xl border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-500 dark:hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-all font-bold text-center"
                  >
                    <div>🔒 قفل</div>
                    <div className="text-[11px] font-normal">وثيقة / شكل — هناك ما يُفتَح</div>
                  </button>
                  <button
                    onClick={() => { setSourceGate('memory'); setShowSourceGate(false); setShowGate2(false); setShowSwitchGate(false); setIsDual(false); setSwitchChoice(null); setGate2Choice(null); setGate3Choice(null); }}
                    className="p-4 rounded-xl border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-500 dark:hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-all font-bold text-center"
                  >
                    <div>🧠 لا قفل</div>
                    <div className="text-[11px] font-normal">دُرج المعرفة — من تَبَصَّر إلى افتح</div>
                  </button>
                </div>
              </div>
            );
          })()}
          {showGate2 && currentStage === 3 && currentExercise && (() => {
            return (
              <div className="bg-white dark:bg-[#161c18] p-5 md:p-6 rounded-2xl border-2 border-sky-300 dark:border-sky-800 shadow-sm space-y-4">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <Key className="w-5 h-5 text-sky-500" />
                  <span>📥 البوابة ٢ — من أين آتي بمادة الإدخال؟</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">«ومعلوماتك / ومكتسباتك» مذكورة في السؤال ⇒ مختلط (عمودان) · غير ذلك ⇒ وثيقة فقط</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => { setIsDual(false); setGate2Choice('document'); setShowGate2(false); setShowSwitchGate(true); }}
                    className="p-4 rounded-xl border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-500 dark:hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-all font-bold text-center"
                  >
                    <div>📄 وثيقة فقط</div>
                    <div className="text-[11px] font-normal">عمود واحد في المسودة</div>
                  </button>
                  <button
                    onClick={() => { setIsDual(true); setGate2Choice('mixed'); setShowGate2(false); setShowSwitchGate(true); }}
                    className="p-4 rounded-xl border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-500 dark:hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-all font-bold text-center"
                  >
                    <div>📄+🧠 مختلط</div>
                    <div className="text-[11px] font-normal">عمودان: [من الوثيقة | من معلوماتي]</div>
                  </button>
                </div>
              </div>
            );
          })()}
          {/* Switch Gate — stage 3 only, Gate2 صورة/فيلم (renommage de مغلق/مفتوح) — B2 : boutons neutres */}
          {showSwitchGate && currentStage === 3 && currentExercise && !showSourceGate && (() => {
            return (
              <div className="bg-white dark:bg-[#161c18] p-5 md:p-6 rounded-2xl border-2 border-violet-300 dark:border-violet-800 shadow-sm space-y-4">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <Key className="w-5 h-5 text-violet-500" />
                  <span>⚙️ البوابة ٣ — أي حركة يطلب هذا القفل؟</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">📷 وصف واستخراج · 🎬 تفسير ورابط «لأنّ» · 🔨 تصنيع: فرضية / اقتراح / توصية (لا جواب واحد صحيح)</p>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => { setGate3Choice('photo'); setSwitchChoice('closed'); setShowSwitchGate(false); }}
                    className="p-4 rounded-xl border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-500 dark:hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-all font-bold text-center"
                  >
                    <div className="text-2xl">📷</div>
                    <div className="text-sm">الصورة</div>
                    <div className="text-[10px] font-normal text-gray-400">حلل · قارن · استخرج</div>
                  </button>
                  <button
                    onClick={() => { setGate3Choice('film'); setSwitchChoice('open'); setShowSwitchGate(false); }}
                    className="p-4 rounded-xl border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-500 dark:hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-all font-bold text-center"
                  >
                    <div className="text-2xl">🎬</div>
                    <div className="text-sm">الفيلم</div>
                    <div className="text-[10px] font-normal text-gray-400">اشرح · فسر · استنتج</div>
                  </button>
                  <button
                    onClick={() => { setGate3Choice('smith'); setSwitchChoice('open'); setShowSwitchGate(false); }}
                    className="p-4 rounded-xl border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-500 dark:hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-all font-bold text-center"
                  >
                    <div className="text-2xl">🔨</div>
                    <div className="text-sm">الحدّاد</div>
                    <div className="text-[10px] font-normal text-gray-400">اقترح · برر · ناقض</div>
                  </button>
                </div>
              </div>
            );
          })()}

              {/* Current Exercise Subject Context */}
          {currentExercise ? (
          <div className="bg-white dark:bg-[#161c18] p-5 md:p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="flex items-center justify-between gap-3 mb-3 border-b border-gray-100 dark:border-gray-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="bg-[#006d37] text-white px-2.5 py-1 rounded-lg text-xs font-black">
                  {currentExercise.themeAr}
                </span>
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                  {currentExercise.supportTitle}
                </span>
              </div>
              <span className="text-xs font-bold text-gray-400">
                السند: {currentExercise.supportType === 'schema' ? 'مخطط' : currentExercise.supportType}
              </span>
            </div>

            <div className="space-y-3">
              {/* STEP0 — الهدف العام (V3.1) : ligne 0 avant tout */}
              <div className="bg-sky-50 dark:bg-sky-950/20 p-3 rounded-xl border border-sky-200 dark:border-sky-900/40">
                <label className="text-xs font-black text-sky-800 dark:text-sky-300 block mb-1">الهدف العام ٠ — ماذا أفهم قبل أن أقرأ؟</label>
                <input
                  type="text"
                  value={step0Text}
                  onChange={(e) => setStep0Text(e.target.value)}
                  placeholder={STEP0_TEMPLATE_AR.replace('_____','……')}
                  className="w-full bg-white dark:bg-[#0f1a1f] border border-sky-200 dark:border-sky-800 rounded-lg p-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-sky-500 outline-none"
                />
                <span className="text-[11px] text-sky-600 dark:text-sky-400">اكتب هدفك في سطر واحد — لا يُصحَّح، لكنه يوجّه قراءتك</span>
              </div>
              <p className="text-sm md:text-base text-gray-700 dark:text-gray-300 font-medium leading-relaxed">
                <strong className="text-gray-900 dark:text-white">السياق العلمي: </strong>
                {currentExercise.context}
              </p>

              {currentExercise.dataSnippet && (
                <div className="bg-emerald-50/70 dark:bg-emerald-950/20 p-3.5 rounded-xl border border-emerald-100 dark:border-emerald-900/40 text-xs md:text-sm font-medium text-emerald-950 dark:text-emerald-200 whitespace-pre-line">
                  {currentExercise.dataSnippet}
                </div>
              )}

              {currentExercise.diagramUrl && (
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-[#1b221e]">
                  <img
                    src={currentExercise.diagramUrl}
                    alt={currentExercise.supportTitle}
                    className="w-full h-auto object-contain"
                  />
                </div>
              )}

              <div className="bg-amber-50 dark:bg-amber-950/30 p-3.5 rounded-xl border border-amber-200 dark:border-amber-900/50 flex items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-black text-amber-800 dark:text-amber-400 block mb-0.5">التعليمة المستهدفة:</span>
                  <p className="text-sm md:text-base font-black text-gray-900 dark:text-white">
                    {currentExercise.question}
                  </p>
                </div>
                <div className="p-2 bg-amber-200/50 dark:bg-amber-900/50 rounded-lg text-amber-800 dark:text-amber-300 text-xs font-black shrink-0">
                  {currentVerb.verbAr}
                </div>
              </div>
            </div>
          </div>
          ) : (
            <div className="bg-white dark:bg-[#161c18] p-5 md:p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm text-center">
              <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-3" />
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                اختر حلّل / فسّر / قارن للتدريب — أو راجع بطاقات الأفعال
              </p>
            </div>
          )}

          {/* STAGE 1: MODELAGE (النمذجة بالخطوات والألوان) */}
          {currentStage === 1 && currentExercise && (
            <div className="bg-white dark:bg-[#161c18] p-5 md:p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
                <div>
                  <h3 className="text-base md:text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
                    <Eye className="w-5 h-5 text-blue-600" />
                    <span>المرحلة 1: النمذجة (استكشاف خطوات الإجابة النموذجية)</span>
                  </h3>
                  <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
                    اقرأ إجابة الخبير، وانقر على الأجزاء لتحديد كل خطوة من خطوات هيكل الفعل.
                  </p>
                </div>
              </div>

              {/* Steps Legend — couleurs Boussole via stepMap (pas le n° brut) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                {currentExercise.stage1.segments.map((seg, idx) => {
                  const mappedStep = (getVerbCardV2(selectedVerbId)?.stepMap?.[seg.stepNumber - 1] ?? seg.stepNumber) as StepId;
                  const boussoleColor = getStepData(mappedStep)?.color ?? '#10b981';
                  const isDone = highlightedSteps[seg.stepNumber];
                  return (
                  <div
                    key={idx}
                    style={isDone ? { borderColor: boussoleColor, backgroundColor: `${boussoleColor}14` } : undefined}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between ${
                      isDone
                        ? 'text-gray-800 dark:text-gray-200'
                        : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/40 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: boussoleColor }} />
                      <span>{STEP_NAMES_AR[mappedStep]}: {(currentVerb.structureSteps[idx] || 'خطوة هيكلية').replace(/^\d+\.\s*/, '')}</span>
                    </span>
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: boussoleColor }} />
                    ) : (
                      <span className="w-4 h-4 rounded-full border border-gray-300 dark:border-gray-600"></span>
                    )}
                  </div>
                  );
                })}
              </div>

              {/* Expert Answer with Clickable Segments — même couleur stepMap que la légende */}
              <div className="p-5 bg-gray-50 dark:bg-[#121614] rounded-2xl border border-gray-200 dark:border-gray-800 space-y-3 leading-relaxed text-sm md:text-base">
                {currentExercise.stage1.segments.map((seg, idx) => {
                  const isMarked = highlightedSteps[seg.stepNumber];
                  const mappedStep = (getVerbCardV2(selectedVerbId)?.stepMap?.[seg.stepNumber - 1] ?? seg.stepNumber) as StepId;
                  const boussoleColor = getStepData(mappedStep)?.color ?? '#10b981';
                  return (
                    <motion.div
                      key={idx}
                      whileHover={{ scale: 1.01 }}
                      onClick={() => setHighlightedSteps(prev => ({ ...prev, [seg.stepNumber]: true }))}
                      style={isMarked ? { borderColor: boussoleColor, backgroundColor: `${boussoleColor}1A` } : undefined}
                      className={`p-3 rounded-xl cursor-pointer border transition-all ${
                        isMarked
                          ? 'shadow-sm text-gray-800 dark:text-gray-200'
                          : 'bg-white dark:bg-[#1b221e] border-gray-200 dark:border-gray-700 hover:border-emerald-400 text-gray-800 dark:text-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-bold text-gray-400 mb-1">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: boussoleColor }} />
                          <span>{STEP_NAMES_AR[mappedStep]} (انقر للتحديد)</span>
                        </span>
                        {isMarked && <span className="font-bold" style={{ color: boussoleColor }}>تم التعرف عليها ✓</span>}
                      </div>
                      <p className="font-medium whitespace-pre-line">{seg.text}</p>
                    </motion.div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => currentExercise && setHighlightedSteps(Object.fromEntries(currentExercise.stage1.segments.map(s => [s.stepNumber, true])))}
                  className="text-xs font-bold text-gray-500 hover:text-emerald-600"
                >
                  كشف جميع الخطوات
                </button>

                <button
                  onClick={() => handleSelectStage(2)}
                  className="px-5 py-2.5 bg-[#006d37] hover:bg-[#00562b] text-white rounded-xl font-bold text-sm flex items-center gap-2 shadow-sm"
                >
                  <span>الانتقال للمرحلة 2 (الإكمال)</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STAGE 2: CLOZE COMPLETION (الإكمال مع روابط جاهزة) */}
          {currentStage === 2 && currentExercise && (
            <div className="bg-white dark:bg-[#161c18] p-5 md:p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
                <div>
                  <h3 className="text-base md:text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
                    <CheckSquare className="w-5 h-5 text-amber-600" />
                    <span>المرحلة 2: الإكمال (الشكل جاهز والمجهود على المضمون)</span>
                  </h3>
                  <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
                    الروابط المنهجية موجودة سلفاً، املأ الفراغات بالمعطيات العلمية والوحدات المطلوبة.
                  </p>
                </div>
              </div>

              {/* Interactive Cloze Inputs Form */}
              <div className="space-y-4">
                {currentExercise.stage2.blanks.map((b, idx) => (
                  <div key={b.id} className="p-4 bg-gray-50 dark:bg-[#121614] rounded-xl border border-gray-200 dark:border-gray-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                        الفراغ ({idx + 1}): {b.hint}
                      </span>
                      {clozeSubmitted && (
                        <span className="text-xs font-bold text-gray-500">
                          المتوقع: {b.expectedText}
                        </span>
                      )}
                    </div>
                    <input
                      type="text"
                      value={clozeAnswers[b.id] || ''}
                      onChange={(e) => setClozeAnswers({ ...clozeAnswers, [b.id]: e.target.value })}
                      placeholder={`اكتب هنا: ${b.hint}...`}
                      className="w-full bg-white dark:bg-[#1a221d] border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 text-sm text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={handleCheckStage2}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-sm"
                >
                  فحص الإجابة وحساب ICM
                </button>

                <button
                  onClick={() => handleSelectStage(3)}
                  className="px-5 py-2.5 bg-[#006d37] hover:bg-[#00562b] text-white rounded-xl font-bold text-sm flex items-center gap-2 shadow-sm"
                >
                  <span>الانتقال للمرحلة 3 (الإنتاج الموجّه)</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STAGE 3 & 4: GUIDED & CONSTRAINED PRODUCTION (masqué tant que le gate est ouvert) */}
          {(currentStage === 3 || currentStage === 4) && currentExercise && !gateOpen && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Main Writing Area (8 cols on lg) */}
              <div className="lg:col-span-8 space-y-4">
                
                {/* Stage 4 Special Banner: 90s Draft + Timer */}
                {currentStage === 4 && (
                  <div className="bg-gradient-to-r from-red-600 to-amber-600 text-white p-4 rounded-2xl shadow-md space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 animate-pulse" />
                        <span className="font-black text-sm">محاكاة البكالوريا (توقيت رسمي)</span>
                      </div>
                      <div className="font-mono text-xl font-black bg-black/30 px-3 py-1 rounded-xl">
                        {Math.floor(timerSeconds / 60)}:{(timerSeconds % 60).toString().padStart(2, '0')}
                      </div>
                    </div>

                    {/* Phase 3 — carte-référence : rédaction libre avec la carte à portée de main */}
                    <div className="bg-white/10 backdrop-blur-sm p-3.5 rounded-xl border border-white/20 text-xs space-y-2">
                      <button onClick={()=> setRefCardOpen(o=>!o)} className="w-full flex items-center justify-between font-bold text-white">
                        <span>📇 البطاقة — مرجع حر (افتحها في أي لحظة)</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${refCardOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {refCardOpen && (
                        <div className="space-y-1.5 pt-1 border-t border-white/15">
                          <div className="font-bold text-emerald-300">{currentVerb.verbAr} — {currentVerb.goal}</div>
                          {currentVerb.structureSteps.map((st, i) => (
                            <div key={i} className="text-white/80 leading-relaxed">• {st}</div>
                          ))}
                          <div className="pt-1 text-white/70"><span className="font-bold text-amber-300">الروابط:</span> {currentVerb.requiredConnectors.join(' · ')}</div>
                          <details className="pt-1">
                            <summary className="cursor-pointer font-bold text-white/70">المثال النموذجي</summary>
                            <p className="mt-1 text-white/60 whitespace-pre-line">{currentVerb.goodExample.answer}</p>
                          </details>
                        </div>
                      )}
                    </div>

                    {/* Compulsory 90s Draft Accordion */}
                    <div className="bg-white/10 backdrop-blur-sm p-3.5 rounded-xl border border-white/20 text-xs space-y-2">
                      <div className="flex items-center justify-between font-bold">
                        <span>مخطط المسودة الإلزامي (تقنية الـ 90 ثانية في البكالوريا)</span>
                        <span className={isDraftCompleted ? 'text-emerald-300 font-bold' : 'text-amber-200'}>
                          {isDraftCompleted ? '✓ مسودة مكتملة' : 'مطلوب للمحاكاة'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <input
                          type="text"
                          value={draftVerb}
                          onChange={(e) => setDraftVerb(e.target.value)}
                          placeholder="الفعل المحدد (مثلاً: حَلل)"
                          className="bg-black/20 border border-white/20 rounded-lg p-2 text-white placeholder-white/60 text-xs outline-none"
                        />
                        <input
                          type="text"
                          value={draftSteps}
                          onChange={(e) => setDraftSteps(e.target.value)}
                          placeholder="المطلوب (≤ ٥ كلمات)"
                          className="bg-black/20 border border-white/20 rounded-lg p-2 text-white placeholder-white/60 text-xs outline-none"
                        />
                        <input
                          type="text"
                          value={draftFinalSentence}
                          onChange={(e) => {
                            setDraftFinalSentence(e.target.value);
                            if (draftVerb && draftSteps && e.target.value) setIsDraftCompleted(true);
                          }}
                          placeholder="الخاتمة المتوقعة"
                          className="bg-black/20 border border-white/20 rounded-lg p-2 text-white placeholder-white/60 text-xs outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Dual note V3.1 */}
                {isDual && sourceGate==='paper' && (
                  <div className="bg-emerald-50 dark:bg-emerald-950/20 p-3 rounded-xl border border-emerald-200 dark:border-emerald-900/40 text-xs">
                    <span className="font-black">ورقة بعمودين — «معلوماتك + الوثيقة»:</span>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <span className="bg-white dark:bg-black/20 p-2 rounded border">من الوثيقة: قيمة + وحدة</span>
                      <span className="bg-white dark:bg-black/20 p-2 rounded border">من الدرس: آلية/مكتسب</span>
                    </div>
                  </div>
                )}
                {sourceGate==='memory' && (
                  <div className="bg-amber-50 dark:bg-amber-950/20 p-3 rounded-xl border border-amber-200 dark:border-amber-900/40 text-xs">
                    <span className="font-black">🧠 وضع حفظ — لا خاتمة بعد حُجة، بل جملة نجاة:</span>
                    <div className="mt-1 font-medium text-amber-900 dark:text-amber-200">{MEMORY_TEMPLATES.define.ar} — {MEMORY_TEMPLATES.list.ar.split('ـ').slice(0,2).join(' · ')}…</div>
                  </div>
                )}
                {/* Text Area */}
                <div className="bg-white dark:bg-[#161c18] p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="font-black text-sm text-gray-900 dark:text-white flex items-center gap-2">
                      <FileText className="w-4 h-4 text-emerald-600" />
                      <span>محرر الإجابة النموذجية المكتوبة:</span>
                    </label>
                    <span className="text-xs font-bold text-gray-400">
                      {studentText.split(/\s+/).filter(Boolean).length} كلمة
                    </span>
                  </div>

                  <textarea
                    rows={8}
                    value={studentText}
                    onChange={(e) => setStudentText(e.target.value)}
                    placeholder={editorPlaceholder}
                    className="w-full bg-gray-50 dark:bg-[#121614] border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-sm md:text-base text-gray-900 dark:text-white font-medium leading-relaxed focus:ring-2 focus:ring-emerald-500 outline-none"
                  />

                   {/* Phase 4 — auto-évaluation /20 AVANT le verdict (calibration) */}
                   {currentStage === 4 && (
                    <div className="flex flex-wrap items-center gap-3 bg-sky-50 dark:bg-sky-950/30 p-3 rounded-xl border border-sky-200 dark:border-sky-800/60">
                      <span className="text-xs font-black text-sky-900 dark:text-sky-300">🪞 قبل التصحيح: ما النقطة التي تتوقعها على 20؟</span>
                      <input
                        type="number" min={0} max={20} step={0.25}
                        value={selfScore}
                        onChange={(e) => setSelfScore(e.target.value)}
                        className="w-24 px-2.5 py-1.5 rounded-lg border border-sky-200 dark:border-sky-800/60 bg-white dark:bg-black/30 text-sky-900 dark:text-sky-200 text-sm font-black focus:ring-2 focus:ring-sky-500 outline-none"
                      />
                      <span className="text-[11px] text-sky-700 dark:text-sky-400 font-medium">تتنبأ ثم تُصحَّح: الفارق بين توقعك ونقطة الأستاذ هو مرآة المرحلة 4.</span>
                    </div>
                   )}

                   {/* Actions & Submit */}
                   <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      {isDev && (
                        <button
                          onClick={() => currentExercise && setStudentText(currentExercise.stage1.expertAnswer)}
                          className="text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-emerald-600"
                        >
                          إدراج نص تجريبي للاختبار
                        </button>
                      )}

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleResetExercise}
                        className="p-2.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all"
                        title="إعادة تعيين"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleSubmitProduction}
                        disabled={studentText.trim().length === 0 || (currentStage === 4 && !isDraftCompleted) || (currentStage === 4 && !(Number(selfScore) >= 0 && Number(selfScore) <= 20 && selfScore !== ''))}
                        className="px-6 py-2.5 bg-[#006d37] hover:bg-[#00562b] disabled:opacity-50 text-white rounded-xl font-bold text-sm shadow-md flex items-center gap-2"
                      >
                        <Sparkles className="w-4 h-4 text-[#fed65b]" />
                        <span>تقييم الإجابة وحساب ICM</span>
                      </button>
                    </div>
                  </div>
                </div>

              </div>

              {/* Colonne latérale : critères au stade 3, chrono au stade 4 (M1 : bac sans carte) */}
              <div className="lg:col-span-4 space-y-4">
              {currentStage === 3 && (
                <div className="bg-white dark:bg-[#161c18] p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm sticky top-4">
                  <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3 mb-3">
                    <div className="flex items-center gap-2">
                      <Compass className="w-5 h-5 text-emerald-600" />
                      <div>
                        <h4 className="font-black text-sm text-gray-900 dark:text-white">معايير الفعل</h4>
                        <span className="text-[11px] text-gray-400">توجيه قبلي وتأكيد بالإثبات</span>
                      </div>
                    </div>
                    <span className="text-xs font-black bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-md">
                      {Object.values(selectedEvidenceForCriterion).filter(Boolean).length} / {currentVerb.criteria.length}
                    </span>
                  </div>

                  {/* Single Column Checklist (Constraint: Une seule colonne) */}
                  <div className="space-y-3">
                    {currentVerb.criteria.map((cr, idx) => {
                      const isChecked = selectedEvidenceForCriterion[cr.id];
                      return (
                        <div
                          key={cr.id}
                          onClick={() => {
                            setSelectedEvidenceForCriterion(prev => ({
                              ...prev,
                              [cr.id]: !prev[cr.id]
                            }));
                          }}
                          className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                            isChecked
                              ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500/80 text-emerald-900 dark:text-emerald-200 shadow-sm'
                              : 'bg-gray-50 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-start gap-2.5">
                            <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                              isChecked ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-gray-300 dark:border-gray-600'
                            }`}>
                              {isChecked && <Check className="w-3 h-3" />}
                            </div>
                            <div className="space-y-1">
                              <p className="font-bold">{cr.wording.compass}</p>
                              <div className="text-[11px] text-gray-500 dark:text-gray-400 bg-white/60 dark:bg-black/20 px-2 py-0.5 rounded">
                                <span className="text-emerald-600 font-bold">السؤال السابر: </span>
                                {cr.wording.probe}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                </div>
              )}
              {currentStage === 4 && (
                <div className="bg-white dark:bg-[#161c18] p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm sticky top-4 space-y-3">
                  <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-3">
                    <Clock className="w-5 h-5 text-amber-600" />
                    <h4 className="font-black text-sm text-gray-900 dark:text-white">الزمن (يتناسب مع النقاط)</h4>
                  </div>
                  <div className="font-mono text-2xl font-black text-center bg-gray-50 dark:bg-[#121614] rounded-xl py-2 text-gray-900 dark:text-white">
                    {Math.floor(timerSeconds / 60)}:{(timerSeconds % 60).toString().padStart(2, '0')}
                  </div>
                  <ul className="space-y-1.5 text-xs font-bold text-gray-700 dark:text-gray-300">
                    <li className="flex items-start gap-2"><span>⏳</span><span>{TIME_RULES.quart}</span></li>
                    <li className="flex items-start gap-2"><span>✍️</span><span>{TIME_RULES.half}</span></li>
                    <li className="flex items-start gap-2"><span>✅</span><span>{TIME_RULES.quarter}</span></li>
                  </ul>
                </div>
              )}
              </div>
            </div>
          )}

          {/* EVALUATION REPORT & ICM CALCULATION RESULTS */}
          {scoreReport && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-[#161c18] p-6 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-xl space-y-6"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-5">
                <div>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">تقرير التدقيق المنهجي</span>
                  <h3 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                    <Award className="w-6 h-6 text-amber-500" />
                    <span>مؤشر المطابقة المنهجية (ICM)</span>
                  </h3>
                </div>

                <div className="flex items-center gap-3">
                  <div className={`px-5 py-2.5 rounded-2xl text-center font-black ${
                    scoreReport.icm >= 90
                      ? 'bg-emerald-500 text-white'
                      : scoreReport.icm >= 60
                      ? 'bg-amber-500 text-white'
                      : 'bg-red-500 text-white'
                  }`}>
                    <span className="text-2xl md:text-3xl block leading-none">{scoreReport.icm}%</span>
                    <span className="text-[10px] uppercase">معدل ICM · {icmLabel(scoreReport.icm)} <span className="latin opacity-80">({icmLabelFr(scoreReport.icm)})</span></span>
                  </div>
                </div>
              </div>

              {/* Phase 2 — verdict « forme validée » (audit §3.3) : les 3 portes, jamais le fond */}
              {/* Ligne 7 — mode examen : le score auto par tags, la note réelle humaine est la référence */}
              {examMode && (() => {
                const steps = scoreReport.stepReport.filter(l => l.applicable);
                const passed = steps.filter(l => l.passed).length;
                return (
                  <div className="p-4 rounded-2xl bg-slate-900 dark:bg-black/70 border border-slate-700 text-white space-y-1.5">
                    <div className="flex items-center gap-2 font-black text-sm">📝 ورقة الامتحان — النتيجة الآلية</div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-bold">
                      <span>ICM الشكل: {scoreReport.icm}/100</span>
                      <span>الخطوات: {passed}/{steps.length}</span>
                      {scoreReport.detectedErrors.length > 0 && (
                        <span className="text-red-300">الأخطاء: {scoreReport.detectedErrors.map(e => e.tag).join(' · ')}</span>
                      )}
                      {selfScore !== '' && <span className="text-sky-300">توقعك: {selfScore}/20</span>}
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      في الامتحان لا إعادة: النتيجة هي الحكم، والدرس في المعايرة — النقطة الفعلية /20 يضيفها الأستاذ في «المصححة»، وسيظهر لك العبر.
                    </p>
                  </div>
                );
              })()}

              {(() => {
                const q = currentExercise?.question ?? '';
                const cardV2 = getVerbCardV2(selectedVerbId);
                const expExistence = detectExistenceGate(q);
                const expSource = expExistence === 'lock' ? (detectSourceKind(q) ?? 'document') : null;
                const expMovement: Movement | null = expExistence === 'lock' ? (cardV2 && cardV2.movement !== 'drawer' ? cardV2.movement : 'photo') : null;
                const gatesActive = currentStage === 3 && !freeReview;
                const existenceOk = gatesActive && sourceGate ? ((sourceGate === 'paper' ? 'lock' : 'no_lock') === expExistence) : null;
                const sourceOk = gatesActive && sourceGate === 'paper' ? (gate2Choice && expSource ? gate2Choice === expSource : null) : null;
                const movementOk = gatesActive && sourceGate === 'paper' ? (gate3Choice && expMovement ? gate3Choice === expMovement : null) : null;
                const v = evaluatePhase2({
                  existenceGateOk: existenceOk,
                  sourceGateOk: sourceOk,
                  movementGateOk: movementOk,
                  icm: scoreReport.icm,
                  typicalErrorViolated: scoreReport.switchLine.violated,
                });
                return (
                  <div className={`p-4 rounded-2xl border flex items-start gap-3 ${v.formeValidee ? 'bg-sky-50 dark:bg-sky-950/30 border-sky-200 dark:border-sky-800/60' : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/60'}`}>
                    <ShieldAlert className={`w-5 h-5 shrink-0 mt-0.5 ${v.formeValidee ? 'text-sky-600 dark:text-sky-400' : 'text-amber-600 dark:text-amber-400'}`} />
                    <div className="flex-1">
                      <h4 className={`font-black text-sm ${v.formeValidee ? 'text-sky-900 dark:text-sky-300' : 'text-amber-900 dark:text-amber-300'}`}>الحكم الآلي — {v.formeValidee ? 'الشكل مُتحقَّق منه' : 'الشكل ناقص'}</h4>
                      <p className={`text-xs md:text-sm font-medium mt-0.5 ${v.formeValidee ? 'text-sky-800 dark:text-sky-400' : 'text-amber-800 dark:text-amber-400'}`}>{v.messageAr}</p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {v.gates.map(g => (
                          <span key={g.id} className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${g.passed === null ? 'bg-gray-100 dark:bg-gray-800/50 text-gray-400 border-gray-200 dark:border-gray-700' : g.passed ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60' : 'bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800/60'}`}>{g.passed === null ? '—' : g.passed ? '✓' : '✗'} {g.labelAr}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Renvoi ciblé (audit §3.7) : micro-2a sur la sous-étape en défaut, pas la re-Phase-2 */}
              {currentStage < 4 && (() => {
                const targets = remediationTargets(scoreReport.stepReport);
                if (targets.length === 0) return null;
                return (
                  <div className="bg-red-50 dark:bg-red-950/30 p-4 rounded-2xl border border-red-200 dark:border-red-800/60 space-y-2">
                    <div className="flex items-start gap-3">
                      <RotateCcw className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-black text-sm text-red-900 dark:text-red-300">الرجوع المستهدف — إكمال 2a مصغّر</h4>
                        <p className="text-xs text-red-800 dark:text-red-400 font-medium mt-0.5">لا إعادة المرحلة 2 كاملة: نعكف فقط على الخطوة الناقصة في النموذج، ثم نعود للإنتاج.</p>
                        <div className="mt-1.5 space-y-1">
                          {targets.map(t => (
                            <div key={t.step} className="text-xs font-bold text-red-900 dark:text-red-300 flex items-start gap-1.5">
                              <span className="shrink-0">الخطوة {t.step}:</span>
                              <span className="font-medium">{t.remedyAr ?? 'راجع نموذج هذه الخطوة ثم أعد كتابتها.'}</span>
                            </div>
                          ))}
                        </div>
                        {examMode ? (
                          <p className="text-[11px] font-bold text-red-900 dark:text-red-300 bg-white dark:bg-black/30 rounded-lg p-2">في الامتحان لا إعادة: النتيجة هي الحكم، والدرس في المعايرة — أضف نقطتك الفعلية في «المصححة».</p>
                        ) : (
                        <div className="flex flex-wrap gap-2 mt-2">
                          <button onClick={()=>{
                            setCurrentStage(1);
                            setHighlightedSteps(Object.fromEntries(scoreReport.stepReport.filter(l=>l.applicable && !l.passed).map(l=>[l.step, true])));
                            setShowSourceGate(false);
                            setShowSwitchGate(false);
                          }} className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs">🔁 إعادة الخطوات الناقصة (النموذج)</button>
                          <button onClick={()=> setCurrentStage(3)} className="px-3 py-1.5 bg-white dark:bg-black/30 text-red-700 dark:text-red-300 rounded-xl font-bold text-xs border border-red-200 dark:border-red-800/60">العودة للإنتاج</button>
                        </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Pedagogical Decision Engine Result */}
              <div className="bg-emerald-50 dark:bg-emerald-950/30 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 flex items-start gap-3">
                <Cpu className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-black text-sm text-emerald-900 dark:text-emerald-300">قرار محرك التوجيه البيداغوجي:</h4>
                  <p className="text-xs md:text-sm text-emerald-800 dark:text-emerald-400 font-medium mt-0.5">
                    {scoreReport.pedagogicalDecisionAr}
                  </p>
                  {scoreReport.nextPedagogicalStage !== currentStage && (
                    <button
                      onClick={() => handleSelectStage(scoreReport.nextPedagogicalStage)}
                      className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-[#006d37] hover:bg-[#00562b] text-white rounded-xl text-xs font-black shadow-sm"
                    >
                      الانتقال إلى المرحلة {scoreReport.nextPedagogicalStage} الآن
                    </button>
                  )}
                </div>
              </div>

              {/* 🔑 Ligne interrupteur */}
              {scoreReport.switchLine && (() => {
                const s = scoreReport.switchLine;
                return (
                  <div dir="rtl" className={`p-4 rounded-2xl border text-sm space-y-2 ${TONE[switchTone(s)]}`}>
                    <div className="flex items-center gap-2 font-bold">
                      <Key className="w-4 h-4" />
                      <span>المفتاح</span>
                      <span className="mx-1 text-gray-400">·</span>
                      <span>الفعل: <span className="font-black">{swAr(s.truth)}</span></span>
                      <span className="text-xs font-normal opacity-70">
                        {s.truth === 'open' ? '— «لأنّ» مطلوبة' : '— لا «لأنّ»'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 flex-wrap text-xs">
                      {s.choice !== null && (
                        <span>
                          اختيارك: <span className="font-black">{swAr(s.choice)}</span>{' '}
                          <span className="font-bold">{s.choiceCorrect ? '✓' : '✗'}</span>
                        </span>
                      )}
                      <span className="font-bold">
                        {s.violated ? `✗ ${ERROR_TAXONOMY[s.truth === 'closed' ? 'premature_interpretation' : 'unsupported_claim'].nameAr}`
                                    : '✓ احترمتَ الفعل'}
                      </span>
                    </div>
                    {s.remedyAr && (
                      <div className="pt-1 border-t border-current/10 font-bold">
                        الدواء: <span className="font-normal">{s.remedyAr}</span>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Les 4 étapes */}
              <div dir="rtl" className="space-y-2">
                <h4 className="font-bold text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  <span>الخطوات الأربع</span>
                </h4>
                <div className="grid grid-cols-4 gap-2">
                  {scoreReport.stepReport.map((sl: StepLine) => {
                    const tone: ToneKey = !sl.applicable ? 'muted' : sl.passed ? 'emerald' : 'red';
                    const isSwitchStep = sl.step === 3;
                    const truth = scoreReport.switchLine.truth;
                    return (
                      <div key={sl.step} className={`p-3 rounded-xl border text-center text-xs ${TONE[tone]}`}>
                        <div className="font-black text-lg leading-none">{sl.step}</div>
                        <div className="font-bold text-sm mt-1">{STEP_NAMES_AR[sl.step]}</div>
                        {isSwitchStep && (
                          <div className={`mt-1 inline-block px-1.5 rounded text-[10px] font-bold ${
                            truth === 'open' ? 'bg-emerald-200/60 dark:bg-emerald-900/60' : 'bg-gray-200/80 dark:bg-gray-700 line-through'
                          }`}>
                            «لأنّ»
                          </div>
                        )}
                        <div className="mt-1 font-bold text-[11px]">
                          {!sl.applicable ? 'لا تُكتب هنا' : sl.passed ? '✓' : '✗'}
                        </div>
                        {sl.errorTags.length > 0 && (
                          <div className="mt-1 space-y-0.5 text-[11px]">
                            {sl.errorTags.map(tag => (
                              <div key={tag} className="bg-red-200/60 dark:bg-red-900/60 px-1 rounded">
                                {ERROR_TAXONOMY[tag]?.nameAr ?? 'ملاحظة منهجية'}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                {(() => {
                  const first = scoreReport.stepReport.find(s => s.applicable && !s.passed && s.remedyAr);
                  return first ? (
                    <div className="p-3 rounded-xl bg-white dark:bg-gray-900 border text-sm">
                      <span className="font-bold">ابدأ بالخطوة {first.step} ({STEP_NAMES_AR[first.step]}) : </span>
                      {first.remedyAr}
                    </div>
                  ) : null;
                })()}
                {/* V3.1 عام/خاص helper */}
                {(() => {
                  const lastSentence = studentText.split(/[\.!؟\n]/).filter(Boolean).pop() || '';
                  const cls = classifyConclusion(lastSentence, step0Text || '');
                  return (
                    <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-900/40 text-xs">
                      <span className="font-black">الهدف العام ٠ + الخاتمة — عام أم خاص؟</span>
                      <span className="mx-2 px-2 py-0.5 rounded-full bg-white dark:bg-black/20 border text-[11px] font-bold">{cls === 'generic' ? 'عام (يعيد الهدف)' : cls === 'specific' ? 'خاص (يجيب المطلوب)' : 'غير مصنّف'}</span>
                      <span className="text-[11px] text-gray-600 dark:text-gray-400">— إن كانت «خاص» بلا سند من الوثيقة فهي تهويل</span>
                    </div>
                  );
                })()}
              </div>

              {/* M6 · couche enseignant repliée : critères + erreurs sous « التفاصيل » */}
              <details className="bg-gray-50 dark:bg-black/20 rounded-2xl border border-gray-200 dark:border-gray-800 px-4 py-3">
                <summary className="font-bold text-sm text-gray-700 dark:text-gray-300 cursor-pointer">التفاصيل</summary>
                <div className="pt-3 space-y-6">
              {/* Criteria hits list */}
              <div className="space-y-3">
                <h4 className="font-bold text-sm text-gray-700 dark:text-gray-300">تدقيق معايير الفعل ({currentVerb.verbAr}):</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {scoreReport.criteriaResults.map(res => (
                    <div
                      key={res.criterionId}
                      className={`p-3.5 rounded-xl border text-xs flex items-start justify-between gap-3 ${
                        res.passed
                          ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40 text-emerald-900 dark:text-emerald-200'
                          : 'bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-900/40 text-red-900 dark:text-red-200'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 font-bold">
                          {res.passed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          ) : (
                            <X className="w-4 h-4 text-red-600 shrink-0" />
                          )}
                          <span>{res.label}</span>
                        </div>
                        <p className="text-[11px] text-gray-600 dark:text-gray-400">{res.feedback}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Detected Errors & Counter-actions */}
              {scoreReport.detectedErrors.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h4 className="font-bold text-sm text-red-700 dark:text-red-400 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    <span>الأخطاء المنهجية المرصودة وخطة التصحيح الفوري:</span>
                  </h4>
                  <div className="space-y-2">
                    {scoreReport.detectedErrors.map((err, idx) => (
                      <div key={idx} className="p-4 bg-red-50 dark:bg-red-950/20 rounded-xl border border-red-200 dark:border-red-900/40 text-xs space-y-1">
                        <div className="flex items-center justify-between font-bold text-red-800 dark:text-red-300">
                          <span>{err.nameAr}</span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300">{err.descriptionAr}</p>
                        <div className="pt-1 text-emerald-700 dark:text-emerald-400 font-bold">
                          <span>الإجراء العلاجي المطلوب: </span>
                          <span>{err.counterActionAr}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
                </div>
              </details>

            </motion.div>
          )}

        </section>
      )}

      {/* TAB 2: VERB CARDS DIRECTORY & ANNOTATED COUNTER-EXAMPLES */}
      {activeTab === 'verbs_ref' && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white">فهرس الأفعال الثمانية الموحدة</h2>
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
                فيشة معيارية لكل فعل تشمل: الهيكل الإلزامي، الروابط، المحظورات، ونموذج الخطأ المعلم.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {VERB_CARDS.map((verbCard) => {
              const isExpanded = expandedVerbCardId === verbCard.id;
              return (
                <div 
                  key={verbCard.id}
                  className="bg-white dark:bg-[#161c18] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden"
                >
                  <div 
                    onClick={() => setExpandedVerbCardId(isExpanded ? null : verbCard.id)}
                    className="p-5 cursor-pointer flex items-center justify-between hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-black flex items-center justify-center text-sm shadow-sm">
                        {verbCard.verbAr.slice(0, 3)}
                      </div>
                      <div>
                        <h3 className="font-black text-lg text-gray-900 dark:text-white flex items-center gap-2">
                          {verbCard.verbAr}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{verbCard.goal}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedVerbId(verbCard.id);
                          const ex = TRAINING_EXERCISES.find(item => item.verbId === verbCard.id);
                          if (ex) setSelectedExerciseId(ex.id);
                          setActiveTab('simulator');
                        }}
                        className="hidden sm:flex items-center gap-1 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 rounded-lg text-xs font-bold border border-emerald-200 dark:border-emerald-800"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>تدريب المحاكي</span>
                      </button>

                      {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                    </div>
                  </div>

                  {/* Expanded Verb Details */}
                  {isExpanded && (
                    <div className="p-5 pt-0 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-black/20 space-y-5">
                      
                      {/* Structure Steps & Connectors */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div className="p-4 bg-white dark:bg-[#1b221e] rounded-xl border border-gray-200 dark:border-gray-700/60 space-y-2">
                          <h4 className="font-bold text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                            <Layers className="w-4 h-4" />
                            <span>الهيكل الإلزامي (3 إلى 4 خطوات):</span>
                          </h4>
                          <ul className="space-y-1.5 text-xs text-gray-700 dark:text-gray-300 font-medium">
                            {verbCard.structureSteps.map((step, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="text-emerald-600 font-bold">•</span>
                                <span>{step}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="p-4 bg-white dark:bg-[#1b221e] rounded-xl border border-gray-200 dark:border-gray-700/60 space-y-2">
                          <h4 className="font-bold text-xs text-blue-700 dark:text-blue-400 flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4" />
                            <span>الروابط اللفظية الإلزامية:</span>
                          </h4>
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {verbCard.requiredConnectors.map((conn, idx) => (
                              <span key={idx} className="bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 px-2.5 py-1 rounded-md text-xs font-bold border border-blue-100 dark:border-blue-900/50">
                                {conn}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Model Example vs Annotated Counter-Example */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        
                        {/* 100% Good Example */}
                        <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800/60 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              <span>إجابة نموذجية ممتازة</span>
                            </span>
                            <span className="bg-emerald-600 text-white font-black text-[10px] px-2 py-0.5 rounded-full">
                              100% (20/20)
                            </span>
                          </div>
                          <p className="text-xs text-gray-800 dark:text-gray-200 font-medium whitespace-pre-line leading-relaxed">
                            {verbCard.goodExample.answer}
                          </p>
                        </div>

                        {/* Annotated Bad Counter-Example with circled error */}
                        <div className="p-4 bg-red-50/70 dark:bg-red-950/30 rounded-xl border border-red-200 dark:border-red-900/60 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-red-800 dark:text-red-300 flex items-center gap-1">
                              <AlertTriangle className="w-4 h-4 text-red-600" />
                              <span>مثال مضاد معلّم (Contre-exemple)</span>
                            </span>
                            <span className="bg-red-600 text-white font-black text-[10px] px-2 py-0.5 rounded-full">
                              {verbCard.badExample.scorePercent}% (خطأ شائع)
                            </span>
                          </div>
                          
                          <div className="p-2.5 bg-white dark:bg-[#1a1214] rounded-lg border border-red-200 dark:border-red-900/40 text-xs text-gray-800 dark:text-gray-200 font-medium">
                            <p className="leading-relaxed">{verbCard.badExample.answer}</p>
                            <div className="mt-2 pt-2 border-t border-red-100 dark:border-red-950 text-[11px] text-red-700 dark:text-red-400 font-bold">
                              <span>الخطأ القاتل: </span>
                              <span className="bg-red-100 dark:bg-red-900/40 px-1.5 py-0.5 rounded border border-red-300 dark:border-red-700">{verbCard.badExample.circledError}</span>
                            </div>
                          </div>

                          <p className="text-[11px] text-red-600 dark:text-red-400/90 font-medium">
                            {verbCard.badExample.flawDescription}
                          </p>
                        </div>

                      </div>

                    </div>
                  )}

                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* TAB 3: MASTERY MATRIX & ERROR LOG */}
      {activeTab === 'mastery_matrix' && (
        <section className="space-y-6">
          
          {/* Matrix Header */}
          <div className="bg-white dark:bg-[#161c18] p-5 md:p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
            <div>
              <h2 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white">مصفوفة الإتقان (الأفعال × الوحدات)</h2>
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
                القاعدة: لا يُعتبر الفعل مؤتمتاً ومكتسباً حتى يحقق التلميذ ICM ≥ 90% في 3 وحدات مختلفة على الأقل.
              </p>
            </div>

            {/* B (audit §3.8) — stabilité sur le noyau : ratio glissant (fenêtre 10) */}
            {(() => {
              const logs = getProductionLogs();
              const rows = VERB_CARDS_V2.map(v => ({ v, r: verbSlidingRatio(v.id, 10, logs) })).filter(x => x.r.total > 0);
              if (rows.length === 0) return null;
              return (
                <div className="space-y-2">
                  <h4 className="font-black text-sm text-gray-700 dark:text-gray-300">الاستقرار على النواة — الإنتاجات الأخيرة (١٠) الخالية من الخطأ النموذجي للفعل</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {rows.map(({ v, r }) => (
                      <div key={v.id} className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-black/20">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className="text-gray-800 dark:text-gray-200">{v.verbAr}</span>
                          <span className={r.ratio === null ? 'text-gray-400' : r.ratio >= 80 ? 'text-emerald-600' : r.ratio >= 50 ? 'text-amber-600' : 'text-red-600'}>{r.ratio === null ? '—' : r.ratio + '%'} <span className="text-[10px] text-gray-400 font-normal">({r.clean}/{r.total})</span></span>
                        </div>
                        <div className="mt-1.5 h-1.5 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
                          <div className={`h-full rounded-full ${r.ratio === null ? '' : r.ratio >= 80 ? 'bg-emerald-500' : r.ratio >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: (r.ratio ?? 0) + '%' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Matrix Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs md:text-sm text-right border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <th className="p-3 font-black text-gray-700 dark:text-gray-300">فعل الأداء</th>
                    <th className="p-3 font-bold text-gray-600 dark:text-gray-400 text-center">تركيب البروتين</th>
                    <th className="p-3 font-bold text-gray-600 dark:text-gray-400 text-center">النشاط الإنزيمي</th>
                    <th className="p-3 font-bold text-gray-600 dark:text-gray-400 text-center">المناعة</th>
                    <th className="p-3 font-bold text-gray-600 dark:text-gray-400 text-center">الاتصال العصبي</th>
                    <th className="p-3 font-bold text-gray-600 dark:text-gray-400 text-center">التنظيم الهرموني</th>
                    <th className="p-3 font-bold text-gray-600 dark:text-gray-400 text-center">التحولات الطاقوية</th>
                    <th className="p-3 font-bold text-gray-600 dark:text-gray-400 text-center">الظواهر الجيولوجية</th>
                    <th className="p-3 font-bold text-gray-600 dark:text-gray-400 text-center">الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  {VERB_CARDS_V2.map((verb) => {
                    const scores = matrixScores[verb.id] || {};
                    const isAutomated = Object.values(scores).filter((s: any) => Number(s) >= AUTOMATION_THRESHOLD).length >= 3;
                    return (
                      <tr key={verb.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-white/5">
                        <td className="p-3 font-black text-gray-900 dark:text-white">{verb.verbAr}</td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-1 rounded-md font-bold text-xs ${
                            (scores.protein_synthesis || 0) >= AUTOMATION_THRESHOLD ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                          }`}>
                            {scores.protein_synthesis || 0}%
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-1 rounded-md font-bold text-xs ${
                            (scores.enzymology || 0) >= AUTOMATION_THRESHOLD ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                          }`}>
                            {scores.enzymology || 0}%
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-1 rounded-md font-bold text-xs ${
                            (scores.immunology || 0) >= AUTOMATION_THRESHOLD ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300'
                          }`}>
                            {scores.immunology || 0}%
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-1 rounded-md font-bold text-xs ${
                            (scores.neuro_comm || 0) >= AUTOMATION_THRESHOLD ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                          }`}>
                            {scores.neuro_comm || 0}%
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-1 rounded-md font-bold text-xs ${
                            (scores.regulations || 0) >= AUTOMATION_THRESHOLD ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                          }`}>
                            {scores.regulations || 0}%
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-1 rounded-md font-bold text-xs ${
                            (scores.energy_transformations || 0) >= AUTOMATION_THRESHOLD ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                          }`}>
                            {scores.energy_transformations || 0}%
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-1 rounded-md font-bold text-xs ${
                            (scores.geodynamics || 0) >= AUTOMATION_THRESHOLD ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                          }`}>
                            {scores.geodynamics || 0}%
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-black ${
                            isAutomated 
                              ? 'bg-emerald-600 text-white' 
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }`}>
                            {isAutomated ? 'مؤتمت' : 'قيد التدريب'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Weekly Error Typology Counters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-[#161c18] p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
                <h3 className="font-black text-base text-gray-900 dark:text-white flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-red-600" />
                  <span>دفتر الأخطاء النوعية (الأسبوع الحالي)</span>
                </h3>
                <span className="text-xs font-bold text-gray-400">توجيه الجهد نحو الخلل السائد</span>
              </div>

              <div className="space-y-3">
                {Object.keys(weeklyErrorCounters).length === 0 ? (
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-bold text-center py-4">
                    لا أخطاء مرصودة بعد — ابدأ التدريب لتشخيص الخلل السائد.
                  </p>
                ) : Object.entries(weeklyErrorCounters).map(([tag, count]) => {
                  const errorDef = ERROR_TAXONOMY[tag];
                  if (!errorDef) return null;
                  return (
                    <div key={tag} className="p-3.5 bg-gray-50 dark:bg-[#121614] rounded-xl border border-gray-200 dark:border-gray-800 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-xs md:text-sm text-gray-900 dark:text-white block">
                          {errorDef.nameAr}
                        </span>
                        <span className="text-[11px] text-gray-500 dark:text-gray-400">{errorDef.example}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 rounded-lg font-black text-xs">
                          {count} تكرار
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Calendrier de révision calculé depuis le carnet (m1 : aucune date fictive) */}
            <div className="bg-white dark:bg-[#161c18] p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
                <h3 className="font-black text-base text-gray-900 dark:text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-emerald-600" />
                  <span>جدول التكرار المتباعد للذاكرة</span>
                </h3>
                <span className="text-xs font-bold text-emerald-600">5 دقائق استرجاع كتابي</span>
              </div>

              <div className="space-y-2.5">
                {reviewSchedule.length === 0 ? (
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-bold text-center py-4">
                    لا مراجعات مجدولة بعد — أكمل إنتاجًا مقيّمًا ليبدأ الجدول.
                  </p>
                ) : reviewSchedule.map((item, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 dark:bg-[#121614] rounded-xl border border-gray-200 dark:border-gray-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-black text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-gray-800 dark:text-gray-200">
                        يوم +{item.gap}
                      </span>
                      <span className="font-bold text-xs md:text-sm text-gray-800 dark:text-gray-200">{item.verbAr}</span>
                    </div>
                    <span className={`text-xs font-bold ${item.due ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'}`}>
                      {item.due ? 'جاهز للمراجعة' : `بعد ${item.daysLeft} يوم`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Diagnostic d'évolution : brouillons archivés + progression dans le temps */}
          <div className="border-t border-gray-100 dark:border-gray-800 pt-5">
            <ProductionEvolutionPanel
              stats={evolutionStats}
              onResume={handleResumeDraft}
              onRefresh={() => setEvolutionVersion(v => v + 1)}
            />
          </div>

        </section>
      )}

      {/* TAB 4: UNIVERSAL GRAMMAR RULES (Couche 0) */}
      {activeTab === 'engine_rules' && (
        <section className="space-y-6">
          <div className="bg-white dark:bg-[#161c18] p-5 md:p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
            <div>
              <h2 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white">الطبقة 0: قواعد الإجابة الموحدة (100% من الأسئلة)</h2>
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
                هذه القواعد الأربعة هي "نظام التشغيل" الذي تدور فوقه جميع أفعال الأداء، ويتعلمها الطالب مرة واحدة وتصلح لجميع مواضيع البكالوريا.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {UNIVERSAL_GRAMMAR_RULES.map(rule => (
                <div 
                  key={rule.ruleNumber}
                  className="p-5 rounded-2xl bg-gray-50 dark:bg-[#121614] border border-gray-200 dark:border-gray-800 space-y-2 hover:border-emerald-400 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="w-7 h-7 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center">
                      {rule.ruleNumber}
                    </span>
                    <span className="text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 px-2.5 py-0.5 rounded-full">
                      {rule.badge}
                    </span>
                  </div>
                  <h3 className="font-black text-sm md:text-base text-gray-900 dark:text-white">{rule.titleAr}</h3>
                  <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                    {rule.summaryAr}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* TAB 5: MIFTAH — بطاقة المفتاح recto/verso (pro) */}
      {activeTab === 'correction' && (() => {
        const queue = getCorrectionQueue();
        const stats = correctionStats();
        return (
          <section className="space-y-4">
            <div className="bg-white dark:bg-[#161c18] p-5 md:p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
              <h2 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white">المصححة — قائمة التصحيح</h2>
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
                القاعدة: الآلة تحقّق من الشكل (٣ بوابات) — الأستاذ يضمن المضمون. كل إنتاج «صحيح الشكل» يصل هنا.
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300">بانتظار: {stats.pending}</span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300">مضمونها سليم: {stats.approved}</span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 dark:bg-red-950/50 text-red-800 dark:text-red-300">تحتاج تصحيحا: {stats.corrections}</span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-200 dark:bg-slate-800/70 text-slate-800 dark:text-slate-300">📝 امتحانات: {stats.examCount}</span>
              </div>
              {(() => {
                const cs = calibrationStats(queue);
                if (cs.n === 0) return null;
                const msg = calibrationMessageAr(cs);
                return (
                  <div className="mt-3 p-3 rounded-xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/60 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-bold">
                      <span className="text-sky-900 dark:text-sky-300">🪞 المعايرة — توقع مقابل حقيقي (n={cs.n}):</span>
                      <span className="text-gray-700 dark:text-gray-300">متوسط العبر {cs.meanGap! >= 0 ? '+' : ''}{cs.meanGap!.toFixed(1)} · |المتوسط| {cs.meanAbsGap!.toFixed(1)}</span>
                      <span className="text-amber-700 dark:text-amber-300">مبالغة {cs.overconfident}</span>
                      <span className="text-emerald-700 dark:text-emerald-300">تواضع {cs.underconfident}</span>
                      <span className="text-sky-700 dark:text-sky-300">مضبوط {cs.calibrated}/{cs.n}</span>
                    </div>
                    {cs.spark.length >= 2 && (
                      <div className="flex items-end gap-0.5 h-6" title="|العبر| — آخر 5">
                        {cs.spark.map((v, i) => (
                          <div key={i} className="w-2.5 bg-sky-400/80 rounded-t" style={{ height: `${Math.max(8, Math.min(100, (v / 10) * 100))}%` }} />
                        ))}
                      </div>
                    )}
                    {msg && <p className="text-[11px] leading-relaxed text-sky-800 dark:text-sky-400 font-medium">{msg}</p>}
                  </div>
                );
              })()}
            </div>
            {queue.length === 0 ? (
              <div className="bg-white dark:bg-[#161c18] p-8 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 text-center text-sm text-gray-400">
                لا إنتاجات بعد — أرسل إنتاجاً من المحاكاة (الشكل الصحيح يصل تلقائياً إلى هنا).
              </div>
            ) : (
              <div className="space-y-3">
                {queue.map(item => (
                  <div key={item.id} className={`bg-white dark:bg-[#161c18] p-4 rounded-2xl border shadow-sm ${item.status === 'pending' ? 'border-amber-200 dark:border-amber-900/50' : item.status === 'approved' ? 'border-emerald-200 dark:border-emerald-900/50' : 'border-red-200 dark:border-red-900/50'}`}>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="font-black text-sm text-gray-900 dark:text-white">{item.verbAr} {item.theme ? <span className="text-xs font-bold text-gray-400">· {item.theme}</span> : null}</div>
                      <div className="flex items-center gap-2 text-[11px] font-bold">
                        <span className="text-gray-400">{new Date(item.dateISO).toLocaleDateString('fr-DZ')}</span>
                        <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800/60 text-gray-600 dark:text-gray-300">ICM {item.icm}%</span>
                        {item.mode === 'examen' && <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800/70 text-slate-800 dark:text-slate-300">📝 امتحان — 60د</span>}
                        <span className={`px-2 py-0.5 rounded-full ${item.status === 'pending' ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300' : item.status === 'approved' ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300' : 'bg-red-100 dark:bg-red-950/50 text-red-800 dark:text-red-300'}`}>
                          {item.status === 'pending' ? 'بانتظار المصحح' : item.status === 'approved' ? 'المضمون سليم' : 'تحتاج تصحيحاً'}
                        </span>
                      </div>
                    </div>
                    {item.errorTags.length > 0 && (
                      <div className="mt-1 text-[11px] text-gray-400 font-bold">أخطاء الشكل المرصودة: {item.errorTags.join(' · ')}</div>
                    )}
                    {(item.selfScore != null || item.realScore != null || item.status === 'pending') && (
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        {item.selfScore != null && (
                          <span className="px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950/50 text-sky-800 dark:text-sky-300 text-[11px] font-bold">التوقع: {item.selfScore}/20</span>
                        )}
                        {item.realScore != null && (
                          <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300 text-[11px] font-bold">الحقيقي: {item.realScore}/20</span>
                        )}
                        {(() => {
                          const g = gapOf(item);
                          if (g === null) return null;
                          const tone = Math.abs(g) <= 1 ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300' : Math.abs(g) <= 3 ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300' : 'bg-red-100 dark:bg-red-950/50 text-red-800 dark:text-red-300';
                          return <span className={`px-2 py-0.5 rounded-full ${tone} text-[11px] font-black`}>العبر {g > 0 ? '+' : ''}{g} — {g > 0 ? 'مبالغة' : g < 0 ? 'تواضع' : 'معايرة مثالية'}</span>;
                        })()}
                        {item.status === 'pending' && (
                          <span className="flex items-center gap-1.5 mr-auto">
                            <input
                              type="number" min={0} max={20} step={0.25}
                              placeholder="النقطة الفعلية /20"
                              value={realScoreDrafts[item.id] ?? ''}
                              onChange={(e) => setRealScoreDrafts(d => ({ ...d, [item.id]: e.target.value }))}
                              className="w-28 px-2 py-1 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-black/30 text-xs font-bold text-gray-800 dark:text-gray-200 outline-none focus:ring-2 focus:ring-sky-500"
                            />
                            <button
                              disabled={realScoreDrafts[item.id] === ''}
                              onClick={() => {
                                const v = Number(realScoreDrafts[item.id]);
                                setRealScore(item.id, v);
                                setRealScoreDrafts(d => ({ ...d, [item.id]: '' }));
                                setCorrectionVersion(x => x + 1);
                              }}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${realScoreDrafts[item.id] !== '' ? 'bg-sky-600 text-white' : 'bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed'}`}
                            >حفظ النقطة الفعلية</button>
                          </span>
                        )}
                      </div>
                    )}
                    <p className="mt-2 text-xs leading-relaxed text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-black/20 p-3 rounded-xl whitespace-pre-line max-h-40 overflow-y-auto">{item.text}</p>
                    {item.status === 'pending' ? (
                      <div className="flex flex-wrap items-center gap-2 mt-3">
                        <button onClick={()=>{ markCorrection(item.id, 'approved'); setCorrectionVersion(v=>v+1); }} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs">✅ المضمون سليم</button>
                        <button onClick={()=>{ markCorrection(item.id, 'corrections'); setCorrectionVersion(v=>v+1); }} className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs">✏️ تحتاج تصحيحاً</button>
                      </div>
                    ) : item.noteAr ? (
                      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">ملاحظة المصحح: {item.noteAr}</div>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </section>
        );
      })()}

      {activeTab === 'boussole_card' && (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400">
              بطاقة {MIFTAH_NOMENCLATURE.miftah} v{MIFTAH_VERSION} — مطابقة 100% للـ HTML المستقل <span className="latin">/miftah.html</span> — تُطبع A4 recto/verso
            </p>
            <div className="flex gap-2">
              <a href="/miftah.html" target="_blank" rel="noopener" className="px-3 py-2 bg-white border border-gray-200 rounded-xl font-bold text-xs">فتح HTML المستقل</a>
              <button onClick={() => window.print()} className="px-4 py-2 bg-[#006d37] hover:bg-[#00562b] text-white rounded-xl font-bold text-sm shadow-md">
                طباعة (A4)
              </button>
            </div>
          </div>
          <MiftahCard />
          <details className="print:hidden bg-gray-50 dark:bg-black/20 rounded-xl border p-3 text-xs">
            <summary className="font-bold cursor-pointer">بطاقة البوصلة المدمجة (legacy) — للمرجع السريع</summary>
            <div className="mt-3"><BoussoleCard /></div>
          </details>
        </section>
      )}

    </div>
  );
}
