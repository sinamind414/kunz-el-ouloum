import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Target, Sparkles, BookOpen, Layers, CheckCircle2, AlertTriangle, 
  Clock, ShieldAlert, ArrowLeft, ArrowRight, RotateCcw, 
  HelpCircle, Check, X, Award, ChevronDown, ChevronUp, Cpu, 
  Calendar, FileText, CheckSquare, Zap, Eye, Lightbulb, Compass, Key, Printer
} from 'lucide-react';
import {
  VERB_CARDS, UNIVERSAL_GRAMMAR_RULES, TRAINING_EXERCISES,
  ERROR_TAXONOMY, TrainingExercise, Switch, StepId, STEP_NAMES_AR, STEP_TEMPLATES, VERB_CARDS_V2, getVerbCardV2,
  detectSourceGate, isDualSource, detectExistenceGate, detectSourceKind, SourceGate, ExistenceGate, SourceKind, Movement, MEMORY_TEMPLATES, STEP0_TEMPLATE_AR, classifyConclusion,
  MIFTAH_VERSION, MIFTAH_NAME_OFFICIAL_AR, MIFTAH_TAGLINE_AR, MIFTAH_NOMENCLATURE, READY_SENTENCES, SYNTHESIS, SPECIAL_FORMS
} from '../data/methodologyEngine';
import { isExtensionUnlocked, recordDrillResult, getDrillStatus, getMasteryStatus, recordTypeMastery, todayISO } from '../data/v3Progress';
import { DRILL_BANK, drawDailyConsignes, gradeDrill, PHASE0_DEMOS, isPhase0Done, completePhase0, resetPhase0, DrillAnswer, DrillConsigne, DrillGrade, DRILL_LABELS } from '../data/drillBank';
import { evaluateStudentProduction, ScoreReport, SwitchLine, StepLine } from '../utils/methodologyScorer';
import { methodologyToLetterWithText, MethodologyLetterReport } from '../utils/methodologyToLetter';
import { logProduction, getProductionLogs, getVerbEvolution, VerbEvolutionStats, ProductionLogEntry, verbSlidingRatio } from '../utils/methodologyLog';
import { evaluatePhase2, remediationTargets } from '../utils/phase2';
import { addCorrectionItem, getCorrectionQueue, markCorrection, correctionStats, setRealScore } from '../utils/correctionQueue';
import { calibrationStats, calibrationMessageAr, gapOf } from '../utils/calibration';
import ProductionEvolutionPanel from './ProductionEvolutionPanel';
import BoussoleCard from './BoussoleCard';
import MiftahCard from './MiftahCard';
import MeftahView from './MeftahView';
import TahlilWall from './TahlilWall';
import CorrecteurPanel from './CorrecteurPanel';
import { TIME_RULES, getStepData } from '../data/boussoleData';

import {
  TONE, switchTone, swAr, ATELIERS, AUTOMATION_THRESHOLD, icmLabel, icmLabelFr, REVIEW_GAPS,
} from './methodologyShared';
import type { ToneKey, AtelierId } from './methodologyShared';
import VerbsRefTab from './VerbsRefTab';
import MasteryMatrixTab from './MasteryMatrixTab';
import EngineRulesTab from './EngineRulesTab';
import CorrectionTab from './CorrectionTab';
import BoussoleCardTab from './BoussoleCardTab';
import ScoreReportPanel from './ScoreReportPanel';
import Stage1Panel from './Stage1Panel';
import Stage2Panel from './Stage2Panel';
import Stage34Panel from './Stage34Panel';
import Phase0DrillSection from './Phase0DrillSection';
import StepBarAndGates from './StepBarAndGates';


interface MethodologyProps {
  onBackToHome?: () => void;
}

export default function MethodologyCompilerView({ onBackToHome }: MethodologyProps) {
  // Navigation Tabs: 'engine_rules' (Couche 0) | 'verbs_ref' (Fiches) | 'simulator' (4 Stades) | 'mastery_matrix' (Analytics & Erreurs)
  const [activeTab, setActiveTab] = useState<AtelierId>('simulator');
  // File de correction (Phase 3) — bump pour rafraîchir l'onglet + le badge
  const [correctionVersion, setCorrectionVersion] = useState(0);
  // Grille de lettres (portage TS) — verdict officiel calculé au submit
  const [letterReport, setLetterReport] = useState<MethodologyLetterReport | null>(null);
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
      setLetterReport(null);
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
    // Stage 2 (complétion) : la lettre n'est pas le verdict d'une copie — pas de grille
    setLetterReport(null);
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
    // Grille de lettres : la lettre naît des statuts des critères (jamais du %)
    setLetterReport(methodologyToLetterWithText(rep, studentText));

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
              4 أسنان · 3 بوابات · إجابة تفتح النقطة — {MIFTAH_TAGLINE_AR}
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
        {/* Grille d'ateliers — les 7 vues du المفتاح visibles d'un coup (remplace la barre défilante) */}
        <div className="pt-5 mt-4 border-t border-white/20">
          <span className="block text-[11px] font-bold text-white/80 mb-2">اختر الورشة التي تريد العمل بها</span>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {ATELIERS.map(a => {
              const Icon = a.icon;
              const isActive = activeTab === a.id;
              const pending = a.id === 'correction' ? correctionStats().pending : 0;
              return (
                <button
                  key={a.id}
                  onClick={() => setActiveTab(a.id)}
                  className={`relative flex flex-col items-start gap-1 p-3 rounded-2xl text-right transition-all min-h-[76px] cursor-pointer ${
                    isActive
                      ? 'bg-white text-[#006d37] shadow-md ring-2 ring-[#fed65b]'
                      : 'bg-white/15 text-white hover:bg-white/25'
                  }`}
                >
                  <span className="flex items-center gap-2 w-full">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="text-[11px] md:text-xs font-black leading-tight flex-1">{a.label}</span>
                    {pending > 0 && (
                      <span className="bg-[#ff8c42] text-white text-[10px] font-black px-1.5 rounded-full shrink-0">{pending}</span>
                    )}
                  </span>
                  <span className={`text-[10px] font-bold leading-tight ${isActive ? 'text-[#006d37]/70' : 'text-white/70'}`}>{a.hint}</span>
                </button>
              );
            })}
          </div>

          {/* Fiche المفتاح imprimable — accès secondaire (le bouton طبع vit dans cette vue) */}
          <button
            onClick={() => setActiveTab('boussole_card')}
            className={`mt-2 inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-[11px] font-bold transition-all cursor-pointer ${
              activeTab === 'boussole_card'
                ? 'bg-white text-[#006d37] shadow-md'
                : 'bg-white/15 text-white hover:bg-white/25'
            }`}
          >
            <Printer className="w-3.5 h-3.5" />
            <span> {MIFTAH_NOMENCLATURE.miftah} — للطباعة</span>
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
                     <option key={v.id} value={v.id} disabled={locked}>{v.verbAr}{locked ? ' — 🔒 بعد إتقان 3 أنواع أسئلة' : ''}</option>
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
          <Phase0DrillSection
            phase0Done={phase0Done}
            setPhase0Done={setPhase0Done}
            p0Index={p0Index}
            setP0Index={setP0Index}
            p0Pick={p0Pick}
            setP0Pick={setP0Pick}
            p0Shown={p0Shown}
            setP0Shown={setP0Shown}
            drillActive={drillActive}
            setDrillActive={setDrillActive}
            drillSec={drillSec}
            setDrillSec={setDrillSec}
            drillAnswers={drillAnswers}
            setDrillAnswers={setDrillAnswers}
            drillGrade={drillGrade}
            setDrillGrade={setDrillGrade}
            drillStatus={drillStatus}
            setDrillStatus={setDrillStatus}
            masteryStatus={masteryStatus}
            DRILL_TODAY={DRILL_TODAY}
            setExtensionUnlocked={setExtensionUnlocked}
          />
          {/* StepBar — stages 1-3, masquée tant que le gate est ouvert (B2) */}
          {/* Gate titles rendered by StepBarAndGates (extracted child of this vue):
              🚪 البوابة 1 — قفل أصلا؟ · ⚙️ البوابة 3 — أي حركة يطلب هذا القفل؟ */}
          <StepBarAndGates
            currentStage={currentStage}
            currentExercise={currentExercise}
            currentVerb={currentVerb}
            selectedVerbId={selectedVerbId}
            gateOpen={gateOpen}
            showSourceGate={showSourceGate}
            setShowSourceGate={setShowSourceGate}
            showGate2={showGate2}
            setShowGate2={setShowGate2}
            showSwitchGate={showSwitchGate}
            setShowSwitchGate={setShowSwitchGate}
            switchChoice={switchChoice}
            setSwitchChoice={setSwitchChoice}
            setSourceGate={setSourceGate}
            setGate2Choice={setGate2Choice}
            setGate3Choice={setGate3Choice}
            setIsDual={setIsDual}
            step0Text={step0Text}
            setStep0Text={setStep0Text}
          />

          {/* STAGE 1: MODELAGE (النمذجة بالخطوات والألوان) */}
          {(currentStage === 1 && currentExercise) && (
          <Stage1Panel
            currentExercise={currentExercise}
            currentVerb={currentVerb}
            selectedVerbId={selectedVerbId}
            highlightedSteps={highlightedSteps}
            setHighlightedSteps={setHighlightedSteps}
            handleSelectStage={handleSelectStage}
          />
          )}

          {/* STAGE 2: CLOZE COMPLETION (الإكمال مع روابط جاهزة) */}
          {(currentStage === 2 && currentExercise) && (
          <Stage2Panel
            currentExercise={currentExercise}
            clozeAnswers={clozeAnswers}
            setClozeAnswers={setClozeAnswers}
            clozeSubmitted={clozeSubmitted}
            handleCheckStage2={handleCheckStage2}
            handleSelectStage={handleSelectStage}
          />
          )}

          {/* STAGE 3 & 4: GUIDED & CONSTRAINED PRODUCTION (masqué tant que le gate est ouvert) */}
          {((currentStage === 3 || currentStage === 4) && currentExercise && !gateOpen) && (
          <Stage34Panel
            currentExercise={currentExercise}
            currentStage={currentStage as 3 | 4}
            currentVerb={currentVerb}
            gateOpen={gateOpen}
            isDual={isDual}
            sourceGate={sourceGate}
            refCardOpen={refCardOpen}
            setRefCardOpen={setRefCardOpen}
            draftVerb={draftVerb}
            setDraftVerb={setDraftVerb}
            draftSteps={draftSteps}
            setDraftSteps={setDraftSteps}
            draftFinalSentence={draftFinalSentence}
            setDraftFinalSentence={setDraftFinalSentence}
            isDraftCompleted={isDraftCompleted}
            setIsDraftCompleted={setIsDraftCompleted}
            studentText={studentText}
            setStudentText={setStudentText}
            editorPlaceholder={editorPlaceholder}
            selfScore={selfScore}
            setSelfScore={setSelfScore}
            selectedEvidenceForCriterion={selectedEvidenceForCriterion}
            setSelectedEvidenceForCriterion={setSelectedEvidenceForCriterion}
            timerSeconds={timerSeconds}
            isDev={isDev}
            handleResetExercise={handleResetExercise}
            handleSubmitProduction={handleSubmitProduction}
          />
          )}

          {/* EVALUATION REPORT & ICM CALCULATION RESULTS */}
          {scoreReport && (
          <ScoreReportPanel
            scoreReport={scoreReport}
            letterReport={letterReport}
            examMode={examMode}
            freeReview={freeReview}
            selfScore={selfScore}
            currentStage={currentStage}
            currentExercise={currentExercise}
            currentVerb={currentVerb}
            selectedVerbId={selectedVerbId}
            sourceGate={sourceGate}
            gate2Choice={gate2Choice}
            gate3Choice={gate3Choice}
            studentText={studentText}
            step0Text={step0Text}
            handleSelectStage={handleSelectStage}
            setCurrentStage={setCurrentStage}
            setHighlightedSteps={setHighlightedSteps}
            setShowSourceGate={setShowSourceGate}
            setShowSwitchGate={setShowSwitchGate}
          />
          )}

        </section>
      )}

      {activeTab === 'verbs_ref' && (
        <VerbsRefTab
          expandedVerbCardId={expandedVerbCardId}
          setExpandedVerbCardId={setExpandedVerbCardId}
          setSelectedVerbId={setSelectedVerbId}
          setSelectedExerciseId={setSelectedExerciseId}
          setActiveTab={setActiveTab}
        />
      )}

      {activeTab === 'mastery_matrix' && (
        <MasteryMatrixTab
          matrixScores={matrixScores}
          weeklyErrorCounters={weeklyErrorCounters}
          reviewSchedule={reviewSchedule}
          evolutionStats={evolutionStats}
          handleResumeDraft={handleResumeDraft}
          setEvolutionVersion={setEvolutionVersion}
        />
      )}

      {activeTab === 'engine_rules' && (
        <EngineRulesTab />
      )}

      {activeTab === 'correction' && (
        <CorrectionTab
          realScoreDrafts={realScoreDrafts}
          setRealScoreDrafts={setRealScoreDrafts}
          setCorrectionVersion={setCorrectionVersion}
        />
      )}

      {activeTab === 'boussole_card' && (
        <BoussoleCardTab />
      )}

      {/* TAB 6: المفتاح v{MIFTAH_VERSION} — 3 visages méthode + BAC 2025 — la loi lisible */}
      {activeTab === 'meftah' && (
        <MeftahView onOpenVerb={() => setActiveTab('verbs_ref')} />
      )}

      {/* TAB 7: جدار حلّل — couche 1 Trainer : le geste, gate v2 (audits 1-2) */}
      {activeTab === 'tahlil_wall' && (
        <TahlilWall onBack={() => setActiveTab('meftah')} />
      )}

    </div>
  );
}
