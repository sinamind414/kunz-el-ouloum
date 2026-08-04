import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Target, Search, Lightbulb, ChevronDown, CheckCircle2,
  BadgeCheck, FileText, GraduationCap, X, ArrowRight, ChevronRight,
  Route, Rocket, XCircle, BookOpen, Zap,
} from 'lucide-react';
import { METHODOLOGY_CARDS } from '../data/methodologyKnowledge';
import { METHODOLOGY_QA } from '../methodologyKnowledge';
import { METHODOLOGY_VERBS } from '../data/methodologyVerbs.tsx';
import MethodologyTrainer from './MethodologyTrainer';
import { normalizeArabic } from '../utils/arabicNormalize';
import { STUDY_GUIDE_CARDS } from '../studyGuide';
import { KnowledgeCards } from '../data/kunzDatabase';
import { MethodologyRules } from '../data/kunzDatabase';
import {
  BEGINNER_JOURNEY_STEPS,
  METHODOLOGY_ENTRY_DOORS,
  SUPPORTING_SKILLS_OVERVIEW,
} from '../data/methodologyJourney';
import { getMicroRemediationByCode, MICRO_REMEDIATIONS } from '../data/microRemediations';
import { getConceptRoute, routeErrorToTarget } from '../data/conceptRoutes';
import { loadStore, type LearningError } from '../data/store';
import type { MethodologyVerbKey } from '../services/methodologyTrainerService';
import {
  loadMethodologyRemediationFeedbackMap,
  setMethodologyRemediationFeedback,
  type MethodologyRemediationFeedbackEntry,
  type MethodologyRemediationFeedbackStatus,
} from '../services/methodologyRemediationFeedbackService';

// ─── Helpers ───────────────────────────────────────────────────────────────────

function matches(query: string, ...fields: (string | string[] | undefined)[]): boolean {
  if (!query) return true;
  const normQuery = normalizeArabic(query);
  if (!normQuery) return true;
  for (const f of fields) {
    if (Array.isArray(f)) {
      for (const item of f) {
        if (normalizeArabic(item).includes(normQuery)) return true;
      }
    } else if (f && normalizeArabic(f).includes(normQuery)) {
      return true;
    }
  }
  return false;
}

// ─── Inline sub-components ────────────────────────────────────────────────────

const AccordionCard: React.FC<{
  id: string;
  headerNode: React.ReactNode;
  badge?: string;
  icon: React.ReactNode;
  accent: string;
  children: React.ReactNode;
}> = ({ headerNode, badge, icon, accent, children }) => {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-[#1a201c] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden"
    >
      <div
        className="p-4 md:p-5 cursor-pointer flex items-center justify-between gap-3 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
        onClick={() => setOpen((p) => !p)}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className={`p-2.5 rounded-xl bg-gradient-to-br ${accent} text-white shadow-sm shrink-0`}>
            {icon}
          </div>
          <div className="min-w-0">
            <div className="text-base md:text-lg font-black text-gray-900 dark:text-white truncate">{headerNode}</div>
            {badge && <span className="text-[11px] font-bold text-gray-400 dark:text-gray-500">{badge}</span>}
          </div>
        </div>
        <div className={`transition-transform duration-300 shrink-0 ${open ? 'rotate-180' : ''}`}>
          <ChevronDown className="w-5 h-5 text-gray-400" />
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28 }}
            className="overflow-hidden"
          >
            <div className="p-4 md:p-5 pt-0 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-black/20">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const Chip: React.FC<{ children: React.ReactNode; variant?: 'emerald' | 'amber' | 'rose' | 'indigo' }> = ({ children, variant = 'emerald' }) => {
  const styles: Record<string, string> = {
    emerald: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-100 dark:border-emerald-800',
    amber: 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-100 dark:border-amber-800',
    rose: 'bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border-rose-100 dark:border-rose-800',
    indigo: 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-indigo-100 dark:border-indigo-800',
  };
  return (
    <span className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-md border ${styles[variant] || styles.emerald}`}>
      {children}
    </span>
  );
};

// ─── Entry doors & resource icons ───────────────────────────────────────────

const ENTRY_DOOR_ICONS = {
  beginner: { icon: <Rocket className="w-6 h-6" />, color: '#f97316', gradient: 'from-[#f97316] to-[#ea580c]' },
  verb: { icon: <BadgeCheck className="w-6 h-6" />, color: '#006d37', gradient: 'from-[#006d37] to-[#059669]' },
  error: { icon: <XCircle className="w-6 h-6" />, color: '#e11d48', gradient: 'from-[#e11d48] to-[#f43f5e]' },
} as const;

const BEGINNER_ASSIMILATION_STEPS = ['شاهد', 'افهم', 'أجب', 'صحّح', 'ثبّت'] as const;

type ProgressVariant = 'emerald' | 'amber' | 'rose' | 'indigo';
type ErrorUrgencyBucket = 'due_today' | 'recurring' | 'almost_fixed' | 'active' | 'stabilized';

interface ProgressIndicator {
  label: string;
  variant: ProgressVariant;
  score: number;
  bandLabel: string;
  bandRangeLabel: string;
}

interface MethodologyErrorCard {
  id: string;
  templateCode?: string;
  matchedRemediationCode?: string;
  title: string;
  desc: string;
  forbidden: string[];
  correct: string;
  bad: string;
  good: string;
  color: string;
  source: 'library' | 'personalized';
  conceptId?: string;
  reflexId?: import('../data/reflexes').CoreReflexId;
  errorCount?: number;
  labelAr?: string;
  reviewStage?: number;
  nextReviewAtMs?: number;
  nextReviewLabel?: string;
  urgencyBucket?: ErrorUrgencyBucket;
  progressIndicator?: ProgressIndicator;
}

interface MethodologyHistoryItem {
  id: string;
  title: string;
  status: ErrorUrgencyBucket;
  count: number;
  dateLabel: string;
  nextReviewAtMs?: number;
  nextReviewLabel?: string;
  progressIndicator: ProgressIndicator;
}

function getRemediationFeedbackKey(errorCard: MethodologyErrorCard, remediationId: string): string {
  return `${errorCard.source}:${errorCard.id}:${remediationId}`;
}

function getRemediationFeedbackVariant(status: MethodologyRemediationFeedbackStatus): ProgressVariant {
  return status === 'practiced' ? 'emerald' : 'amber';
}

function getRemediationFeedbackLabel(status: MethodologyRemediationFeedbackStatus): string {
  return status === 'practiced' ? 'مارستها' : 'لم أفهم بعد';
}

function getRemediationFeedbackMessage(status: MethodologyRemediationFeedbackStatus): string {
  return status === 'practiced'
    ? 'أحسنت. سُجّل أنك مارست هذه الإعادة — انتقل الآن إلى التطبيق أو التدريب.'
    : 'لا بأس. سُجّل أنك لم تفهم بعد — افتح الدعم أولاً ثم ارجع لنفس السؤال.';
}

// ─── Common errors data ──────────────────────────────────────────────────────

const COMMON_ERRORS: MethodologyErrorCard[] = [
  {
    id: 'err_analysis_interp',
    title: 'خلط التحليل بالتفسير',
    desc: 'التحليل = وصف المعطيات (ماذا نلاحظ؟). التفسير = إعطاء السبب العلمي (لماذا؟). لا تخلط بينهما أبداً في البكالوريا.',
    forbidden: MethodologyRules.analysisForbiddenWords,
    correct: 'استعمل: نلاحظ، تزايد، تناقص، ثبات، قيمة أعظمية، قيمة دنيا.',
    bad: 'نلاحظ تزايد السرعة لأن الإنزيم نشط.',
    good: 'نلاحظ تزايد سرعة التفاعل بدلالة تركيز الركيزة حتى الوصول إلى قيمة أعظمية.',
    color: '#e11d48',
  },
  {
    id: 'err_hypothesis_maybe',
    title: 'استعمال "ربما" في الفرضية',
    desc: 'الفرضية العلمية يجب أن تكون مؤكدة ومحددة وقابلة للاختبار. تجنب اللغة الغامضة.',
    forbidden: MethodologyRules.hypothesisForbiddenWords,
    correct: 'استعمل: يعود سبب... إلى... نتيجة لـ... مما يؤدي إلى...',
    bad: 'ربما السبب هو الإنزيم.',
    good: 'يعود سبب توقف التفاعل إلى أن مادة ألفا أمانيتين تثبط إنزيم ARN بوليميراز.',
    color: '#7c3aed',
  },
  {
    id: 'err_problem_format',
    title: 'المشكل العلمي بدون تنسيق صحيح',
    desc: 'المشكل العلمي سؤال وليس عبارة. يجب أن يبدأ بأداة استفهام وينتهي بعلامة استفهام.',
    forbidden: [] as string[],
    correct: 'ابدأ بـ: كيف، لماذا، ما هو، ما هي. وانتهِ بـ ؟',
    bad: 'نريد معرفة مقر تركيب البروتين في الخلية.',
    good: 'ما هو مقر تركيب البروتين في الخلية حقيقية النواة؟',
    color: '#d97706',
  },
  {
    id: 'err_passive_voice',
    title: 'استعمال صيغة مفعلولة في التحليل',
    desc: 'التحليل يتطلب لغة علمية فعالة ودقيقة وليست سلبية. المصحح يبحث عن الأفعال الحركية.',
    forbidden: MethodologyRules.analysisPassiveVocabularyBanned,
    correct: 'استعمل: تزايد، تناقص، انعدام، ثبات، ظهور، اختفاء.',
    bad: 'المنحنى يرتفع في البداية ثم ينخفض.',
    good: 'نلاحظ تزايد قيمة المتغير في المجال الأول ثم تناقصها في المجال الثاني.',
    color: '#0e7490',
  },
  {
    id: 'err_conclusion_repeat',
    title: 'الاستنتاج هو تكرار الملاحظة',
    desc: 'الاستنتاج يجب أن يكون حقيقة علمية جديدة ومختصرة تجيب عن هدف السؤال، وليس وصفاً للأرقام.',
    forbidden: [] as string[],
    correct: 'صغ حقيقة علمية في سطر واحد تجيب عن "ماذا نستنتج؟".',
    bad: 'نستنتج أن المنحنى وصل إلى 50 ثم استقر.',
    good: 'نستنتج أن سرعة التفاعل الإنزيمي تصل إلى حد التشبع عند تركيز معين للركيزة.',
    color: '#059669',
  },
  {
    id: 'err_long_conclusion',
    title: 'الخاتمة في النص العلمي طويلة جداً',
    desc: 'الخاتمة يجب أن تكون موجزة (أقل من 150 حرف) ومباشرة وتجيب عن الإشكالية المطروحة في المقدمة.',
    forbidden: [] as string[],
    correct: 'اجعل الخاتمة سطرين أو ثلاثة فقط: جواب مباشر عن المطلوب.',
    bad: 'وفي الختام نلاحظ أن كل ما سبق يثبت أن البروتين يتركب في الريبوزومات وأن الشفرة الوراثية ثلاثية وأن ARNm ينقل المعلومة وأن...',
    good: 'وعليه، يتم تركيب البروتين على مستوى الريبوزومات في الهيولى انطلاقاً من ARNm المنتج في النواة.',
    color: '#b45309',
  },
].map((error) => ({ ...error, source: 'library' as const, templateCode: error.id }));

const METHODOLOGY_ERROR_BY_ID = Object.fromEntries(
  COMMON_ERRORS.map((error) => [error.id, error])
) as Record<string, MethodologyErrorCard>;

const URGENCY_SECTIONS: { bucket: Exclude<ErrorUrgencyBucket, 'stabilized'>; titleAr: string; descAr: string }[] = [
  { bucket: 'due_today', titleAr: 'مستحقة اليوم', descAr: 'راجِع هذه الأخطاء الآن قبل أن تتراكم.' },
  { bucket: 'recurring', titleAr: 'تعود كثيراً', descAr: 'هذه الأخطاء رجعت أكثر من مرة وتحتاج تثبيتاً أقوى.' },
  { bucket: 'almost_fixed', titleAr: 'قريبة من التصحيح', descAr: 'تحسنت، لكن يلزم تثبيت أخير قبل الاستقرار.' },
  { bucket: 'active', titleAr: 'نشطة حالياً', descAr: 'أخطاء جديدة أو غير مستقرة بعد.' },
];

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfLocalDay(timeMs: number): number {
  const date = new Date(timeMs);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

function formatRelativeReviewDelay(daysFromNow: number): string {
  if (daysFromNow <= 0) return 'اليوم';
  if (daysFromNow === 1) return 'خلال يوم';
  if (daysFromNow === 2) return 'خلال يومين';
  if (daysFromNow <= 10) return `خلال ${daysFromNow} أيام`;
  return `خلال ${daysFromNow} يوماً`;
}

function getUrgencyBucket(error: LearningError, now: number): ErrorUrgencyBucket {
  if (error.resolvedAt != null) return 'stabilized';
  if (error.nextReviewAt > 0 && now >= error.nextReviewAt) return 'due_today';
  if (error.count >= 3) return 'recurring';
  if (error.reviewStage >= 2) return 'almost_fixed';
  return 'active';
}

function getProgressBand(score: number): Pick<ProgressIndicator, 'bandLabel' | 'bandRangeLabel' | 'variant'> {
  if (score >= 85) return { bandLabel: 'مستقر', bandRangeLabel: '85–100', variant: 'emerald' };
  if (score >= 65) return { bandLabel: 'يقترب من التثبيت', bandRangeLabel: '65–84', variant: 'amber' };
  if (score >= 45) return { bandLabel: 'قيد التثبيت', bandRangeLabel: '45–64', variant: 'indigo' };
  return { bandLabel: 'هش ويحتاج إعادة', bandRangeLabel: '0–44', variant: 'rose' };
}

function computeStabilizationScore(error: LearningError, now: number): number {
  if (error.resolvedAt != null) {
    const resolvedBase = 88 + Math.min(12, error.reviewStage * 4);
    return Math.max(85, Math.min(100, resolvedBase - Math.max(0, error.count - 1) * 2));
  }

  const stageAnchors = [18, 36, 58, 78];
  const stageAnchor = stageAnchors[Math.max(0, Math.min(error.reviewStage, stageAnchors.length - 1))];
  const duePenalty = error.nextReviewAt > 0 && now >= error.nextReviewAt ? 20 : 0;
  const recurrencePenalty = Math.min(24, Math.max(0, error.count - 1) * 8);
  const futureReviewBonus = error.nextReviewAt > now ? 8 : 0;
  const score = stageAnchor + futureReviewBonus - duePenalty - recurrencePenalty;
  return Math.max(8, Math.min(92, score));
}

function getProgressIndicator(error: LearningError, now: number): ProgressIndicator {
  const bucket = getUrgencyBucket(error, now);
  const score = computeStabilizationScore(error, now);
  const band = getProgressBand(score);

  if (bucket === 'stabilized') {
    return {
      label: 'مستقرة بعد التصحيح',
      score,
      ...band,
      variant: 'emerald',
    };
  }
  if (bucket === 'due_today') {
    return {
      label: 'مراجعة مستحقة اليوم',
      score,
      ...band,
      variant: 'rose',
    };
  }
  if (bucket === 'recurring') {
    return {
      label: `عادت ${error.count} مرات`,
      score,
      ...band,
      variant: 'rose',
    };
  }
  if (bucket === 'almost_fixed') {
    return {
      label: 'قريبة من التصحيح',
      score,
      ...band,
      variant: 'amber',
    };
  }
  return {
    label: 'تحتاج تدخلاً الآن',
    score,
    ...band,
    variant: 'indigo',
  };
}

function formatNextReviewLabel(error: LearningError, now: number): string | undefined {
  if (!error.nextReviewAt || error.nextReviewAt <= 0) return undefined;

  const reviewDayStart = startOfLocalDay(error.nextReviewAt);
  const nowDayStart = startOfLocalDay(now);
  const dayDelta = Math.round((reviewDayStart - nowDayStart) / DAY_MS);

  if (error.resolvedAt == null) {
    if (dayDelta < 0) return 'فات موعدها';
    return formatRelativeReviewDelay(dayDelta);
  }

  if (dayDelta >= 0 && dayDelta <= 30) {
    return formatRelativeReviewDelay(dayDelta);
  }

  return new Date(error.nextReviewAt).toLocaleDateString('ar-DZ');
}

function resolveMethodologyRemediation(error: LearningError) {
  for (const ruleId of error.ruleIds) {
    const remediation = getMicroRemediationByCode(ruleId);
    if (remediation) return remediation;
  }

  const rules = new Set(error.ruleIds);
  if (rules.has('FORBIDDEN_RUBBAMA') || rules.has('MISSING_NAFTARID') || rules.has('MISSING_TARGET') || error.reflexId === 'hypothesize') {
    return getMicroRemediationByCode('err_hypothesis_maybe');
  }
  if (rules.has('err_problem_format')) {
    return getMicroRemediationByCode('err_problem_format');
  }
  if (rules.has('err_long_conclusion') || (error.reflexId === 'explain' && rules.has('MISSING_BLOCKS'))) {
    return getMicroRemediationByCode('err_long_conclusion');
  }
  if (rules.has('err_conclusion_repeat') || error.reflexId === 'validate') {
    return getMicroRemediationByCode('err_conclusion_repeat');
  }
  if (rules.has('FORBIDDEN_KULLAMA') || rules.has('MISSING_KULLAMA') || rules.has('MISSING_RELATION_MARKER') || rules.has('WRONG_PPM_PPSE') || error.reflexId === 'analyse' || error.reflexId === 'interpret' || error.reflexId === 'compare') {
    return getMicroRemediationByCode('err_analysis_interp');
  }
  return undefined;
}

function buildPersonalizedMethodologyCard(error: LearningError, now: number): MethodologyErrorCard {
  const directRemediation = resolveMethodologyRemediation(error);
  const progressIndicator = getProgressIndicator(error, now);
  const urgencyBucket = getUrgencyBucket(error, now);
  const template = directRemediation
    ? METHODOLOGY_ERROR_BY_ID[directRemediation.triggerCodes.find((code) => code.startsWith('err_')) ?? '']
    : null;

  if (template) {
    return {
      ...template,
      id: `store_${error.id}`,
      templateCode: template.id,
      matchedRemediationCode: directRemediation?.id,
      source: 'personalized',
      conceptId: error.conceptId,
      reflexId: error.reflexId,
      errorCount: error.count,
      labelAr: error.labelAr,
      reviewStage: error.reviewStage,
      nextReviewAtMs: error.nextReviewAt,
      nextReviewLabel: formatNextReviewLabel(error, now),
      urgencyBucket,
      progressIndicator,
      desc: `${template.desc} — ظهر هذا الخطأ الحقيقي ${error.count} مرات${error.conceptId ? ` في مفهوم ${error.conceptId}` : ''}.`,
    };
  }

  if (directRemediation) {
    return {
      id: `store_${error.id}`,
      matchedRemediationCode: directRemediation.id,
      title: directRemediation.titleAr,
      desc: `${directRemediation.explanationAr} — ظهر هذا الخطأ الحقيقي ${error.count} مرات${error.conceptId ? ` في مفهوم ${error.conceptId}` : ''}.`,
      forbidden: [],
      correct: `للإصلاح: ${directRemediation.activeQuestionAr}`,
      bad: `القواعد المرتبطة: ${error.ruleIds.join(' • ') || 'غير محددة'}`,
      good: `أدرج في جوابك: ${directRemediation.acceptedEvidence.slice(0, 4).join(' • ')}`,
      color: '#7c3aed',
      source: 'personalized',
      conceptId: error.conceptId,
      reflexId: error.reflexId ?? directRemediation.reflexId,
      errorCount: error.count,
      labelAr: error.labelAr,
      reviewStage: error.reviewStage,
      nextReviewAtMs: error.nextReviewAt,
      nextReviewLabel: formatNextReviewLabel(error, now),
      urgencyBucket,
      progressIndicator,
    };
  }

  return {
    id: `store_${error.id}`,
    title: error.labelAr || 'خطأ منهجي حقيقي',
    desc: `هذا الخطأ سُجل فعلياً ${error.count} مرات ويحتاج إلى إعادة تثبيت موجّهة.`,
    forbidden: [],
    correct: 'اتبع التمرين التصحيحي ثم أعد إنتاج الجواب بصياغة أوضح.',
    bad: `القواعد المرتبطة: ${error.ruleIds.join(' • ') || 'غير محددة'}`,
    good: 'أعد بناء الجواب انطلاقاً من الفعل المطلوب والدليل المناسب والخلاصة القصيرة.',
    color: '#7c3aed',
    source: 'personalized',
    conceptId: error.conceptId,
    reflexId: error.reflexId,
    errorCount: error.count,
    labelAr: error.labelAr,
    reviewStage: error.reviewStage,
    nextReviewAtMs: error.nextReviewAt,
    nextReviewLabel: formatNextReviewLabel(error, now),
    urgencyBucket,
    progressIndicator,
  };
}

// ─── Category type ────────────────────────────────────────────────────────────

type CategoryId = 'quickstart' | 'verbs' | 'templates' | 'qa' | 'errors' | 'terms' | 'guide' | 'trainer';

// ─── Main Component ──────────────────────────────────────────────────────────

export default function MethodologyView(props: {
  missionReflexId?: import('../data/reflexes').CoreReflexId;
  missionMeta?: { missionId: string; conceptId: string; relatedErrorIds?: string[] };
  onMissionComplete?: (reflexId: import('../data/reflexes').CoreReflexId) => void;
  onStartLesson?: (lessonId: string) => void;
  onLaunchQuiz?: (unitId: number) => void;
  onLaunchSurvivalCard?: (cardId: string) => void;
  onOpenDocumentExercise?: (exerciseId: string) => void;
}) {
  const { missionReflexId, missionMeta, onMissionComplete, onStartLesson, onLaunchQuiz, onLaunchSurvivalCard, onOpenDocumentExercise } = props;
  const [query, setQuery] = useState('');
  const [activeVerbId, setActiveVerbId] = useState<string>(METHODOLOGY_VERBS[0].id);
  const [selectedTrainerVerb, setSelectedTrainerVerb] = useState<MethodologyVerbKey>('analyse');
  const [verbViewOpen, setVerbViewOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<CategoryId | null>(null);
  const [hideStabilizedHistory, setHideStabilizedHistory] = useState(false);
  const [remediationFeedbackByKey, setRemediationFeedbackByKey] = useState<Record<string, MethodologyRemediationFeedbackEntry>>(
    () => loadMethodologyRemediationFeedbackMap()
  );

  // ── Filtered data ──
  const filteredMeth = useMemo(
    () => METHODOLOGY_QA.filter((q) => matches(query, q.question, q.answer, q.keywords, q.category, q.template)),
    [query]
  );
  const filteredTemplates = useMemo(
    () => METHODOLOGY_CARDS.filter((c) => matches(query, c.title, c.steps, c.triggers)),
    [query]
  );
  const filteredStudyGuide = useMemo(
    () => STUDY_GUIDE_CARDS.filter((card) =>
      matches(query, card.title, card.subtitle, card.triggers, card.keywords, card.sections.flatMap((s) => [s.heading, ...s.bullets]))
    ),
    [query]
  );
  const filteredVerbs = useMemo(
    () => METHODOLOGY_VERBS.filter((v) => matches(query, v.verb, v.french, v.definition, v.steps)),
    [query]
  );
  const methodologyStoreState = useMemo(() => {
    try {
      const now = Date.now();
      const methodologyErrors = loadStore().learningErrors
        .filter((error) => error.kind === 'methodology')
        .sort((a, b) => (b.resolvedAt ?? b.lastSeenAt) - (a.resolvedAt ?? a.lastSeenAt));

      const active = methodologyErrors
        .filter((error) => error.resolvedAt == null)
        .map((error) => buildPersonalizedMethodologyCard(error, now))
        .sort((a, b) => {
          const weight = (bucket?: ErrorUrgencyBucket) => {
            switch (bucket) {
              case 'due_today': return 1;
              case 'recurring': return 2;
              case 'almost_fixed': return 3;
              case 'active': return 4;
              default: return 5;
            }
          };
          const byBucket = weight(a.urgencyBucket) - weight(b.urgencyBucket);
          if (byBucket !== 0) return byBucket;
          return (b.errorCount ?? 0) - (a.errorCount ?? 0);
        });

      const history: MethodologyHistoryItem[] = methodologyErrors.slice(0, 6).map((error) => {
        const progressIndicator = getProgressIndicator(error, now);
        return {
          id: error.id,
          title: error.labelAr || buildPersonalizedMethodologyCard(error, now).title,
          status: getUrgencyBucket(error, now),
          count: error.count,
          dateLabel: new Date(error.resolvedAt ?? error.lastSeenAt).toLocaleDateString('ar-DZ'),
          nextReviewAtMs: error.nextReviewAt,
          nextReviewLabel: formatNextReviewLabel(error, now),
          progressIndicator,
        };
      });

      return { active, history };
    } catch {
      return { active: [] as MethodologyErrorCard[], history: [] as MethodologyHistoryItem[] };
    }
  }, [activeCategory]);

  const realMethodologyErrors = methodologyStoreState.active;
  const methodologyHistory = methodologyStoreState.history;
  const hasStabilizedHistoryItems = useMemo(
    () => methodologyHistory.some((item) => item.status === 'stabilized'),
    [methodologyHistory]
  );
  const visibleMethodologyHistory = useMemo(
    () => hideStabilizedHistory
      ? methodologyHistory.filter((item) => item.status !== 'stabilized')
      : methodologyHistory,
    [hideStabilizedHistory, methodologyHistory]
  );

  const filteredErrors = useMemo(() => {
    const source = realMethodologyErrors.length > 0 ? realMethodologyErrors : COMMON_ERRORS;
    return source.filter((e) => matches(query, e.title, e.desc, e.correct, e.bad, e.good, e.forbidden, e.labelAr));
  }, [query, realMethodologyErrors]);
  const groupedFilteredErrors = useMemo(() => {
    const groups = new Map<Exclude<ErrorUrgencyBucket, 'stabilized'>, MethodologyErrorCard[]>();
    for (const section of URGENCY_SECTIONS) groups.set(section.bucket, []);
    for (const error of filteredErrors) {
      if (!error.urgencyBucket || error.urgencyBucket === 'stabilized') continue;
      groups.get(error.urgencyBucket as Exclude<ErrorUrgencyBucket, 'stabilized'>)?.push(error);
    }
    for (const section of URGENCY_SECTIONS) {
      const items = groups.get(section.bucket) ?? [];
      items.sort((a, b) => {
        const aReview = a.nextReviewAtMs ?? Number.MAX_SAFE_INTEGER;
        const bReview = b.nextReviewAtMs ?? Number.MAX_SAFE_INTEGER;
        if (section.bucket === 'due_today') {
          if (aReview !== bReview) return aReview - bReview;
          if ((a.errorCount ?? 0) !== (b.errorCount ?? 0)) return (b.errorCount ?? 0) - (a.errorCount ?? 0);
          return (a.progressIndicator?.score ?? 0) - (b.progressIndicator?.score ?? 0);
        }
        if (section.bucket === 'recurring') {
          if ((b.errorCount ?? 0) !== (a.errorCount ?? 0)) return (b.errorCount ?? 0) - (a.errorCount ?? 0);
          if (aReview !== bReview) return aReview - bReview;
          return (a.progressIndicator?.score ?? 0) - (b.progressIndicator?.score ?? 0);
        }
        if (section.bucket === 'almost_fixed') {
          if ((b.reviewStage ?? 0) !== (a.reviewStage ?? 0)) return (b.reviewStage ?? 0) - (a.reviewStage ?? 0);
          if ((b.progressIndicator?.score ?? 0) !== (a.progressIndicator?.score ?? 0)) return (b.progressIndicator?.score ?? 0) - (a.progressIndicator?.score ?? 0);
          return aReview - bReview;
        }
        if (aReview !== bReview) return aReview - bReview;
        if ((a.progressIndicator?.score ?? 0) !== (b.progressIndicator?.score ?? 0)) return (a.progressIndicator?.score ?? 0) - (b.progressIndicator?.score ?? 0);
        return (b.errorCount ?? 0) - (a.errorCount ?? 0);
      });
    }
    return groups;
  }, [filteredErrors]);

  const mostUrgentVisibleError = useMemo(() => {
    for (const section of URGENCY_SECTIONS) {
      const items = groupedFilteredErrors.get(section.bucket) ?? [];
      if (items.length > 0) return items[0];
    }
    return null;
  }, [groupedFilteredErrors]);
  const filteredTerms = useMemo(
    () => KnowledgeCards.filter((kc) => matches(query, kc.term, kc.definition)),
    [query]
  );

  const activeVerb = METHODOLOGY_VERBS.find((v) => v.id === activeVerbId) || METHODOLOGY_VERBS[0];

  const RESOURCE_CATEGORIES: { id: Exclude<CategoryId, 'quickstart' | 'verbs' | 'errors'>; title: string; fr: string; icon: React.ReactNode; color: string; gradient: string; desc: string; count: number }[] = [
    { id: 'templates', title: 'القوالب المنهجية', fr: 'Modèles de réponse', icon: <GraduationCap className="w-7 h-7" />, color: '#4f46e5', gradient: 'from-[#4f46e5] to-[#6366f1]', desc: 'قوالب جاهزة لكل نوع إجابة: تحليل وثيقة، مقارنة، فرضية، ونص علمي.', count: METHODOLOGY_CARDS.length },
    { id: 'qa', title: 'أسئلة وأجوبة منهجية', fr: 'Q/R Méthodologie', icon: <FileText className="w-7 h-7" />, color: '#d97706', gradient: 'from-[#d97706] to-[#f59e0b]', desc: 'أسئلة متكررة حول المنهجية مع إجابات تفصيلية من كتاب المنهجية.', count: METHODOLOGY_QA.length },
    { id: 'terms', title: 'المصطلحات المفتاحية', fr: 'Termes clés', icon: <BookOpen className="w-7 h-7" />, color: '#0f766e', gradient: 'from-[#0f766e] to-[#14b8a6]', desc: 'المصطلحات العلمية الرسمية التي تمنح جوابك الدقة والنقاط.', count: KnowledgeCards.length },
    { id: 'guide', title: 'دليل المراجعة', fr: 'Parcours de révision', icon: <Route className="w-7 h-7" />, color: '#0e7490', gradient: 'from-[#0e7490] to-[#06b6d4]', desc: 'خطة دراسة المجالات الثلاثة، بروتوكول المراجعة، والتجارب الأساسية.', count: STUDY_GUIDE_CARDS.length },
    { id: 'trainer', title: 'التدريب التفاعلي', fr: 'Entraîneur', icon: <Zap className="w-7 h-7" />, color: '#7c3aed', gradient: 'from-[#7c3aed] to-[#a78bfa]', desc: 'اكتب إجابتك وحللها محلياً: كلمات مفتاحية + روابط + بنية.', count: 6 },
  ];

  const goBack = () => {
    setActiveCategory(null);
    setVerbViewOpen(false);
    setQuery('');
  };

  const navigateToCategory = (catId: CategoryId) => {
    setActiveCategory(catId);
    setVerbViewOpen(false);
    setQuery('');
  };

  const openVerbDetails = (verbId: MethodologyVerbKey) => {
    setActiveVerbId(verbId);
    setActiveCategory('verbs');
    setVerbViewOpen(true);
    setQuery('');
  };

  const openTrainerForVerb = (verbId: MethodologyVerbKey) => {
    setSelectedTrainerVerb(verbId);
    setActiveCategory('trainer');
    setQuery('');
  };

  const getRemediationForCard = (err: MethodologyErrorCard) => {
    if (err.matchedRemediationCode) {
      const direct = Object.values(MICRO_REMEDIATIONS).find((item) => item.id === err.matchedRemediationCode);
      if (direct) return direct;
    }
    return getMicroRemediationByCode(err.templateCode ?? err.id);
  };

  const buildSupportAction = (
    conceptId: string,
    preferredTarget: 'auto' | 'document' | 'lesson' = 'auto'
  ): { label: string; run: () => void } | null => {
    const directRoute = getConceptRoute(conceptId);

    if (preferredTarget === 'document' && directRoute?.documentExerciseId && onOpenDocumentExercise) {
      return { label: 'افتح الوثيقة التطبيقية', run: () => onOpenDocumentExercise(directRoute.documentExerciseId!) };
    }
    if (preferredTarget === 'lesson' && directRoute?.lessonId && onStartLesson) {
      return { label: 'افتح الدرس الداعم', run: () => onStartLesson(directRoute.lessonId!) };
    }

    const route = routeErrorToTarget(conceptId, { quizUnitId: directRoute?.unitId });
    if (route.kind === 'survival_card' && onLaunchSurvivalCard) {
      return { label: 'افتح بطاقة النجاة', run: () => onLaunchSurvivalCard(route.cardId) };
    }
    if (route.kind === 'lesson' && onStartLesson) {
      return { label: 'افتح الدرس الداعم', run: () => onStartLesson(route.lessonId) };
    }
    if (route.kind === 'document' && onOpenDocumentExercise) {
      return { label: 'افتح الوثيقة التطبيقية', run: () => onOpenDocumentExercise(route.exerciseId) };
    }
    if (route.kind === 'quiz' && onLaunchQuiz) {
      return { label: 'افتح QCM الوحدة', run: () => onLaunchQuiz(route.unitId) };
    }

    if (directRoute?.lessonId && onStartLesson) {
      return { label: 'افتح الدرس الداعم', run: () => onStartLesson(directRoute.lessonId!) };
    }
    if (directRoute?.documentExerciseId && onOpenDocumentExercise) {
      return { label: 'افتح الوثيقة التطبيقية', run: () => onOpenDocumentExercise(directRoute.documentExerciseId!) };
    }
    if (directRoute?.unitId != null && onLaunchQuiz) {
      return { label: 'افتح QCM الوحدة', run: () => onLaunchQuiz(directRoute.unitId!) };
    }
    return null;
  };

  const getPrimaryCorrectionAction = (err: MethodologyErrorCard) => {
    const remediation = getRemediationForCard(err);
    const supportAction = remediation ? buildSupportAction(remediation.conceptId, remediation.preferredSupportTarget ?? 'auto') : null;

    if (remediation?.preferredSupportTarget === 'document' && supportAction) {
      return {
        label: 'صحّح الآن عبر الوثيقة',
        detail: supportAction.label,
        run: supportAction.run,
      };
    }

    if (remediation?.reflexId) {
      return {
        label: 'صحّح الآن بالتدريب',
        detail: `روفلكس ${remediation.reflexId}`,
        run: () => openTrainerForVerb(remediation.reflexId!),
      };
    }

    if (supportAction) {
      return {
        label: 'افتح الدعم الآن',
        detail: supportAction.label,
        run: supportAction.run,
      };
    }

    return null;
  };

  const getProgressColor = (variant: ProgressVariant) =>
    variant === 'emerald'
      ? '#059669'
      : variant === 'amber'
        ? '#d97706'
        : variant === 'rose'
          ? '#e11d48'
          : '#4f46e5';

  const saveRemediationFeedback = (feedbackKey: string, status: MethodologyRemediationFeedbackStatus) => {
    const entry: MethodologyRemediationFeedbackEntry = { status, updatedAt: Date.now() };
    setRemediationFeedbackByKey((prev) => ({ ...prev, [feedbackKey]: entry }));
    setMethodologyRemediationFeedback(feedbackKey, status, entry.updatedAt);
  };

  const urgentPrimaryAction = mostUrgentVisibleError ? getPrimaryCorrectionAction(mostUrgentVisibleError) : null;

  const renderErrorCard = (err: MethodologyErrorCard, idx: number) => {
    const remediation = getRemediationForCard(err);
    const supportAction = remediation ? buildSupportAction(remediation.conceptId, remediation.preferredSupportTarget ?? 'auto') : null;
    const remediationFeedbackKey = remediation ? getRemediationFeedbackKey(err, remediation.id) : null;
    const remediationFeedback = remediationFeedbackKey ? remediationFeedbackByKey[remediationFeedbackKey] : undefined;
    return (
      <motion.div
        key={err.id}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: idx * 0.06 }}
        className="bg-white dark:bg-[#1a201c] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden"
      >
        <div className="p-4 md:p-5 flex items-center gap-3" style={{ borderRight: `4px solid ${err.color}` }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0" style={{ background: err.color }}>
            <XCircle className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-black text-gray-900 dark:text-white text-base">{err.title}</h4>
              {err.source === 'personalized' && err.progressIndicator && (
                <Chip variant={err.progressIndicator.variant}>{err.progressIndicator.label}</Chip>
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-5">{err.desc}</p>
            {err.source === 'personalized' && err.nextReviewLabel && (
              <p className="text-[10px] text-[#006d37] dark:text-[#2ecc71] mt-1">المراجعة القادمة: {err.nextReviewLabel}</p>
            )}
          </div>
        </div>

        <div className="px-4 md:px-5 pb-4 md:pb-5 pt-2 space-y-3">
          {err.forbidden.length > 0 && (
            <div className="flex items-start gap-2">
              <span className="text-xs font-black text-rose-600 dark:text-rose-400 shrink-0 mt-0.5">ممنوع:</span>
              <div className="flex flex-wrap gap-1">
                {err.forbidden.map((w, wi) => (
                  <Chip key={wi} variant="rose">{w}</Chip>
                ))}
              </div>
            </div>
          )}

          {err.source === 'personalized' && err.progressIndicator && (
            <div className="rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-black/20 p-3">
              <div className="flex items-center justify-between text-[10px] font-black text-gray-500 dark:text-gray-400 mb-1">
                <span>درجة التثبيت</span>
                <span>{err.progressIndicator.score}% — {err.progressIndicator.bandLabel} ({err.progressIndicator.bandRangeLabel})</span>
              </div>
              <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${err.progressIndicator.score}%`, backgroundColor: getProgressColor(err.progressIndicator.variant) }}
                />
              </div>
            </div>
          )}

          <div className="flex items-start gap-2">
            <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">الصحيح:</span>
            <p className="text-sm text-gray-700 dark:text-gray-300 font-medium leading-6">{err.correct}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <div className="bg-rose-50 dark:bg-rose-950/15 border border-rose-200 dark:border-rose-900/30 rounded-xl p-3">
              <div className="text-[10px] font-black text-rose-600 dark:text-rose-400 mb-1 flex items-center gap-1">
                <XCircle className="w-3 h-3" /> خاطئ
              </div>
              <p className="text-xs text-rose-800 dark:text-rose-200 font-medium leading-6">{err.bad}</p>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-950/15 border border-emerald-200 dark:border-emerald-900/30 rounded-xl p-3">
              <div className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 mb-1 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> صحيح
              </div>
              <p className="text-xs text-emerald-800 dark:text-emerald-200 font-medium leading-6">{err.good}</p>
            </div>
          </div>

          {remediation && (
            <div className="rounded-2xl border border-indigo-200 dark:border-indigo-900/40 bg-indigo-50 dark:bg-indigo-950/20 p-4 space-y-3" data-testid={`methodology-remediation-${err.templateCode ?? err.id}`}>
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <div className="text-[10px] font-black text-indigo-600 dark:text-indigo-300 mb-1">إعادة تثبيت سريعة</div>
                  <h5 className="font-black text-indigo-900 dark:text-white text-sm">{remediation.titleAr}</h5>
                </div>
                {remediationFeedback && (
                  <Chip variant={getRemediationFeedbackVariant(remediationFeedback.status)}>
                    {getRemediationFeedbackLabel(remediationFeedback.status)}
                  </Chip>
                )}
              </div>
              <p className="text-xs text-indigo-900 dark:text-indigo-100 leading-6 font-medium">{remediation.explanationAr}</p>
              <div className="rounded-xl bg-white/70 dark:bg-black/20 border border-indigo-100 dark:border-indigo-900/30 p-3">
                <div className="text-[10px] font-black text-indigo-700 dark:text-indigo-300 mb-1">سؤال الإصلاح</div>
                <p className="text-xs text-gray-800 dark:text-gray-200 font-medium leading-6">{remediation.activeQuestionAr}</p>
              </div>
              <div className="flex flex-wrap gap-1">
                {remediation.acceptedEvidence.map((term, termIndex) => (
                  <Chip key={termIndex} variant="indigo">{term}</Chip>
                ))}
              </div>
              <div className="rounded-xl border border-indigo-100 dark:border-indigo-900/30 bg-white/70 dark:bg-black/20 p-3 space-y-2">
                <div className="text-[10px] font-black text-indigo-700 dark:text-indigo-300">بعد هذه الإعادة، كيف كان وضعك؟</div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => remediationFeedbackKey && saveRemediationFeedback(remediationFeedbackKey, 'practiced')}
                    className={`px-4 py-2 rounded-xl text-xs font-black cursor-pointer transition-colors ${remediationFeedback?.status === 'practiced'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white dark:bg-[#141916] border border-emerald-200 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-300'}`}
                  >
                    مارستها
                  </button>
                  <button
                    type="button"
                    onClick={() => remediationFeedbackKey && saveRemediationFeedback(remediationFeedbackKey, 'blocked')}
                    className={`px-4 py-2 rounded-xl text-xs font-black cursor-pointer transition-colors ${remediationFeedback?.status === 'blocked'
                      ? 'bg-amber-500 text-white'
                      : 'bg-white dark:bg-[#141916] border border-amber-200 dark:border-amber-900/40 text-amber-700 dark:text-amber-300'}`}
                  >
                    لم أفهم بعد
                  </button>
                </div>
                {remediationFeedback && (
                  <p className="text-[11px] font-bold text-gray-600 dark:text-gray-300" data-testid={`methodology-remediation-feedback-${err.templateCode ?? err.id}`}>
                    آخر متابعة: {getRemediationFeedbackLabel(remediationFeedback.status)} — {getRemediationFeedbackMessage(remediationFeedback.status)}
                  </p>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {remediation.reflexId && (
                  <button
                    onClick={() => openTrainerForVerb(remediation.reflexId!)}
                    className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-black cursor-pointer"
                  >
                    جرّب التصحيح الآن
                  </button>
                )}
                {supportAction && (
                  <button
                    onClick={supportAction.run}
                    className="px-4 py-2 rounded-xl bg-white dark:bg-[#141916] border border-indigo-200 dark:border-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-xs font-bold cursor-pointer"
                  >
                    {supportAction.label}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6 pb-24" dir="rtl">
      {/* ── Hero ── */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-2xl shadow-sm border border-emerald-200 dark:border-emerald-800">
            <Target className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">كيف أجيب؟</h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base font-medium mt-1">
              ابدأ من الباب الذي يشبه وضعك اليوم، ثم انتقل إلى الفعل أو التصحيح المناسب.
            </p>
          </div>
        </div>
      </motion.div>

      {!activeCategory && (
        <div className="space-y-6" data-testid="methodology-entry-home">
          <section className="rounded-3xl border border-orange-200 dark:border-orange-900/40 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/10 p-4" data-testid="methodology-beginner-assimilation">
            <div className="flex items-center gap-2 mb-2 text-orange-800 dark:text-orange-200 font-black text-sm">
              <Rocket className="w-4 h-4" />
              للمبتدئ: هذا هو ترتيب التعلم داخل التطبيق
            </div>
            <p className="text-sm text-orange-700 dark:text-orange-100 leading-7 font-medium">
              لا تحفظ أولاً. ابدأ بالصورة أو الوثيقة، ثم افهم الفكرة، ثم أجب، ثم صحّح، ثم ثبّت المعلومة بسؤال قصير.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {BEGINNER_ASSIMILATION_STEPS.map((step, index) => (
                <span key={step} className="inline-flex items-center rounded-full bg-white/90 dark:bg-black/20 border border-orange-200/70 dark:border-orange-900/30 px-2.5 py-1 text-[10px] font-black text-orange-700 dark:text-orange-200">
                  {index + 1}. {step}
                </span>
              ))}
            </div>
          </section>

          <section>
            <div className="mb-3">
              <h2 className="text-lg font-black text-gray-900 dark:text-white">ماذا تريد أن تتعلم اليوم؟</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-1">
                اختر مساراً واحداً فقط للبدء — ثم اكتب، صحح، واصل.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3" data-testid="methodology-entry-doors">
              {METHODOLOGY_ENTRY_DOORS.map((door, idx) => {
                const meta = ENTRY_DOOR_ICONS[door.id];
                const target = door.id === 'beginner' ? 'quickstart' : door.id === 'verb' ? 'verbs' : 'errors';
                const isPrimaryDoor = door.id === 'beginner';
                return (
                  <motion.button
                    key={door.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => navigateToCategory(target)}
                    data-testid={isPrimaryDoor ? 'methodology-primary-entry-door' : undefined}
                    className={`text-right rounded-3xl border p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] transition-all cursor-pointer ${
                      isPrimaryDoor
                        ? 'md:col-span-3 bg-gradient-to-br from-orange-50 via-amber-50 to-white dark:from-orange-950/30 dark:via-amber-950/20 dark:to-[#141916] border-orange-200 dark:border-orange-900/40 ring-1 ring-orange-200/70 dark:ring-orange-900/30'
                        : 'bg-white dark:bg-[#141916] border-gray-200 dark:border-gray-800'
                    }`}
                    style={{ borderTop: `4px solid ${meta.color}` }}
                  >
                    <div className={`flex gap-4 ${isPrimaryDoor ? 'md:items-center md:justify-between' : 'items-center'}`}>
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`${isPrimaryDoor ? 'w-14 h-14 md:w-16 md:h-16' : 'w-12 h-12'} rounded-2xl bg-gradient-to-br ${meta.gradient} text-white flex items-center justify-center shadow-sm shrink-0`}>
                          {meta.icon}
                        </div>
                        <div className="min-w-0">
                          {isPrimaryDoor && (
                            <div className="inline-flex items-center rounded-full bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-200 px-2.5 py-1 text-[10px] font-black mb-2">
                              الباب الأول المقترح للمبتدئ
                            </div>
                          )}
                          <div className={`${isPrimaryDoor ? 'text-lg md:text-xl' : 'text-base'} font-black text-gray-900 dark:text-white`}>{door.title}</div>
                          <div className={`${isPrimaryDoor ? 'text-xs text-orange-700 dark:text-orange-300' : 'text-[11px] text-gray-400'} font-bold mt-1`}>{door.subtitle}</div>
                        </div>
                      </div>

                      {isPrimaryDoor && (
                        <div className="hidden md:flex shrink-0 items-center rounded-2xl bg-white/80 dark:bg-black/20 border border-orange-200/70 dark:border-orange-900/30 px-4 py-3 text-right">
                          <div>
                            <div className="text-[11px] font-black text-orange-700 dark:text-orange-300">إذا كنت متردداً</div>
                            <div className="text-sm font-black text-gray-900 dark:text-white">ابدأ من هنا أولاً</div>
                          </div>
                        </div>
                      )}
                    </div>
                    <p className={`text-xs leading-6 font-medium ${isPrimaryDoor ? 'text-gray-700 dark:text-gray-200 mt-4 md:max-w-2xl' : 'text-gray-600 dark:text-gray-300 mt-3 min-h-[3.5rem]'}`}>
                      {door.description}
                      {isPrimaryDoor && ' هذا هو الباب الافتراضي إذا كان التلميذ لا يعرف أول خطوة.'}
                    </p>
                    <div className="mt-4 flex items-center justify-between gap-3 flex-wrap">
                      {isPrimaryDoor ? (
                        <div className="flex flex-wrap gap-2">
                          <span className="inline-flex items-center rounded-full bg-white/90 dark:bg-black/20 border border-orange-200/70 dark:border-orange-900/30 px-2.5 py-1 text-[10px] font-black text-orange-700 dark:text-orange-200">1) افهم الفعل</span>
                          <span className="inline-flex items-center rounded-full bg-white/90 dark:bg-black/20 border border-orange-200/70 dark:border-orange-900/30 px-2.5 py-1 text-[10px] font-black text-orange-700 dark:text-orange-200">2) اكتب إنتاجاً قصيراً</span>
                          <span className="inline-flex items-center rounded-full bg-white/90 dark:bg-black/20 border border-orange-200/70 dark:border-orange-900/30 px-2.5 py-1 text-[10px] font-black text-orange-700 dark:text-orange-200">3) صحّح فوراً</span>
                        </div>
                      ) : <span />}
                      <div className="inline-flex items-center gap-1 text-xs font-extrabold" style={{ color: meta.color }}>
                        <span>{isPrimaryDoor ? 'ابدأ من هنا أولاً' : door.cta}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </section>

          <section className="rounded-3xl border border-orange-200 dark:border-orange-900/40 bg-orange-50 dark:bg-orange-950/20 p-4" data-testid="methodology-learning-order">
            <h3 className="font-black text-orange-800 dark:text-orange-200 flex items-center gap-2 mb-2">
              <Rocket className="w-4 h-4" /> الترتيب المقترح للمبتدئ
            </h3>
            <p className="text-sm text-orange-700 dark:text-orange-100 leading-7 font-medium">
              ابدأ بـ <strong>حلّل</strong> ثم <strong>فسّر</strong> ثم <strong>قارن</strong> ثم <strong>اقترح فرضية</strong> ثم <strong>صادق</strong> وأخيرا <strong>اشرح / بيّن</strong>.
            </p>
          </section>

          <section>
            <div className="mb-3">
              <h3 className="text-base font-black text-gray-900 dark:text-white">موارد إضافية بعد المسار</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-1">
                افتح هذه الموارد عندما تعرف بالفعل ما تريد مراجعته أو إنتاجه.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3" data-testid="methodology-secondary-resources">
              {RESOURCE_CATEGORIES.map((cat, idx) => (
                <motion.button
                  key={cat.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  onClick={() => navigateToCategory(cat.id)}
                  className="flex flex-col items-center text-center gap-2 rounded-3xl bg-white dark:bg-[#141916] border border-gray-200 dark:border-gray-800 p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] transition-all cursor-pointer"
                  style={{ borderTop: `4px solid ${cat.color}` }}
                >
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-sm" style={{ background: `linear-gradient(135deg, ${cat.color}, ${cat.color}cc)` }}>
                    {cat.icon}
                  </div>
                  <span className="font-black text-sm text-gray-900 dark:text-white leading-tight">{cat.title}</span>
                  <span className="text-[10px] text-gray-400">{cat.fr}</span>
                </motion.button>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* ═══════ LEVEL 2 — Category detail ═══════ */}
      {activeCategory && (
        <div className="space-y-5">
          {/* Back + search bar */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={goBack}
              className="flex items-center gap-1 px-3 py-2 rounded-xl font-bold text-sm bg-white dark:bg-[#141916] border border-gray-200 dark:border-gray-800 text-[#006d37] dark:text-[#2ecc71] hover:bg-gray-50 dark:hover:bg-white/5 transition-all cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
              <span>الرجوع</span>
            </button>
            <div className="flex-1 min-w-[200px]">
              <div className="flex items-center gap-2 bg-white dark:bg-[#141916] border border-gray-200 dark:border-gray-800 rounded-2xl px-4 py-2.5 shadow-sm">
                <Search className="w-5 h-5 text-gray-400 shrink-0" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="ابحث هنا..."
                  className="flex-1 bg-transparent outline-none text-sm text-gray-800 dark:text-gray-200 placeholder:text-gray-400 font-medium"
                />
                {query && (
                  <button onClick={() => setQuery('')} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer">
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ══ BEGINNER PATH ══ */}
          {activeCategory === 'quickstart' && (
            <div className="space-y-4" data-testid="methodology-beginner-path">
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/10 border border-orange-200 dark:border-orange-900/40 rounded-2xl p-4">
                <h3 className="text-base font-black text-orange-800 dark:text-orange-300 mb-2 flex items-center gap-2">
                  <Rocket className="w-5 h-5" />
                  ابدأ من هنا
                </h3>
                <p className="text-sm text-orange-700 dark:text-orange-200 leading-7 font-medium">
                  هذا المسار موجّه للمبتدئ: شاهد أولاً، ثم افهم الفعل، ثم أجب، ثم صحّح، ثم ثبّت المعلومة بسؤال قصير أو تدريب محلي.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {BEGINNER_ASSIMILATION_STEPS.map((step, index) => (
                    <span key={step} className="inline-flex items-center rounded-full bg-white/90 dark:bg-black/20 border border-orange-200/70 dark:border-orange-900/30 px-2.5 py-1 text-[10px] font-black text-orange-700 dark:text-orange-200">
                      {index + 1}. {step}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid gap-4">
                {BEGINNER_JOURNEY_STEPS.map((step) => (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-[#1a201c] rounded-2xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm"
                    data-testid={`journey-step-${step.reflexId}`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <div className="text-[10px] font-black text-orange-500 mb-1">الخطوة {step.order}</div>
                        <h4 className="font-black text-gray-900 dark:text-white text-base">{step.titleAr}</h4>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">{step.estimatedMinutes} دقائق</p>
                      </div>
                      <span className="w-10 h-10 rounded-2xl bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-200 flex items-center justify-center font-black shrink-0">
                        {step.order}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm leading-7">
                      <p className="text-gray-800 dark:text-gray-200 font-medium"><strong>التركيز:</strong> {step.focusAr}</p>
                      <p className="text-emerald-700 dark:text-emerald-300 font-medium"><strong>الإنتاج:</strong> {step.productionAr}</p>
                      <p className="text-rose-700 dark:text-rose-300 font-medium"><strong>تجنب:</strong> {step.mistakeAr}</p>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-4">
                      <button
                        onClick={() => openVerbDetails(step.reflexId)}
                        className="px-4 py-2 rounded-xl bg-[#006d37] text-white text-xs font-black cursor-pointer"
                      >
                        افهم هذا الفعل
                      </button>
                      <button
                        onClick={() => openTrainerForVerb(step.reflexId)}
                        className="px-4 py-2 rounded-xl bg-white dark:bg-[#141916] border border-[#e2dabf] dark:border-gray-800 text-[#944a00] dark:text-amber-300 text-xs font-bold cursor-pointer"
                      >
                        جرّب الآن
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50 dark:bg-emerald-950/20 p-4">
                <h4 className="font-black text-emerald-800 dark:text-emerald-200 mb-2">مهارات مساندة بعد إنهاء المسار</h4>
                <div className="flex flex-wrap gap-1.5">
                  {SUPPORTING_SKILLS_OVERVIEW.map((skill) => (
                    <Chip key={skill} variant="emerald">{skill}</Chip>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ══ VERBS ══ */}
          {activeCategory === 'verbs' && (
            <div className="space-y-5">
              {verbViewOpen ? (
                <div className="space-y-4">
                  <button
                    onClick={() => setVerbViewOpen(false)}
                    className="flex items-center gap-1 px-3 py-2 rounded-xl font-bold text-sm bg-white dark:bg-[#141916] border border-gray-200 dark:border-gray-800 text-[#006d37] dark:text-[#2ecc71] hover:bg-gray-50 dark:hover:bg-white/5 transition-all cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                    <span>الرجوع إلى الأفعال</span>
                  </button>
                  <main className="bg-white dark:bg-[#1a201c] rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm p-5 md:p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`p-3 rounded-2xl bg-gradient-to-br ${activeVerb.color} text-white shadow-sm`}>
                        {activeVerb.icon}
                      </div>
                      <div>
                        <h3 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2 flex-wrap">
                          {activeVerb.verb}
                          <span className="text-sm font-bold text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md">
                            {activeVerb.french}
                          </span>
                        </h3>
                      </div>
                    </div>

                    <div className="mb-5">
                      <h4 className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-2">التعريف الجوهري</h4>
                      <p className="text-gray-800 dark:text-gray-200 font-medium leading-relaxed bg-gray-50 dark:bg-black/20 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                        {activeVerb.definition}
                      </p>
                    </div>

                    <div className="mb-5">
                      <h4 className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-2">خطوات الإجابة المنهجية</h4>
                      <div className="space-y-2">
                        {activeVerb.steps.map((step, stepIdx) => (
                          <div key={stepIdx} className="flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-[#006d37] fill-[#2ecc71]/10" />
                            <p className="text-gray-700 dark:text-gray-300 font-medium text-sm md:text-base leading-7">{step}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50 rounded-xl p-4 md:p-5">
                      <h4 className="text-sm font-bold text-emerald-800 dark:text-emerald-400 mb-3 flex items-center gap-2">
                        <Lightbulb className="w-4 h-4" />
                        مثال تطبيقي من البكالوريا
                      </h4>
                      <div className="space-y-3 text-sm md:text-base">
                        <div className="flex flex-col md:flex-row gap-1 md:gap-2">
                          <span className="font-bold text-gray-700 dark:text-gray-300 shrink-0">السياق:</span>
                          <span className="text-gray-600 dark:text-gray-400 font-medium leading-7">{activeVerb.example.context}</span>
                        </div>
                        <div className="flex flex-col md:flex-row gap-1 md:gap-2">
                          <span className="font-bold text-gray-700 dark:text-gray-300 shrink-0">السؤال:</span>
                          <span className="text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-100/50 dark:bg-emerald-900/30 px-2 rounded">{activeVerb.example.question}</span>
                        </div>
                        <div className="mt-3 pt-3 border-t border-emerald-200/50 dark:border-emerald-800/50">
                          <span className="font-bold text-gray-700 dark:text-gray-300 block mb-1">الإجابة المنهجية:</span>
                          <p className="text-gray-800 dark:text-gray-200 font-medium leading-8 whitespace-pre-line">
                            {activeVerb.example.answer}
                          </p>
                        </div>
                      </div>
                    </div>
                  </main>
                </div>
              ) : (
                /* Grille d'icônes des 6 verbes (style écran principal — noms sur les icônes) */
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {filteredVerbs.length === 0 ? (
                    <p className="text-sm text-gray-400 font-medium p-3 col-span-full">لا توجد نتائج مطابقة.</p>
                  ) : (
                    filteredVerbs.map((v) => (
                      <button
                        key={v.id}
                        onClick={() => { setActiveVerbId(v.id); setVerbViewOpen(true); }}
                        className="flex flex-col items-center text-center gap-2 rounded-3xl bg-white dark:bg-[#141916] border border-gray-200 dark:border-gray-800 p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] transition-all cursor-pointer"
                      >
                        <span className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${v.color} text-white flex items-center justify-center shadow-sm`}>
                          {v.icon}
                        </span>
                        <span className="font-black text-base text-gray-900 dark:text-white leading-tight">{v.verb}</span>
                        <span className="text-[10px] text-gray-400">{v.french}</span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {/* ══ TEMPLATES ══ */}
          {activeCategory === 'templates' && (
            <div className="grid grid-cols-1 gap-4">
              {filteredTemplates.length === 0 ? (
                <p className="text-sm text-gray-400 font-medium">لا توجد نتائج مطابقة للبحث.</p>
              ) : (
                filteredTemplates.map((card) => (
                  <AccordionCard
                    key={card.id}
                    id={card.id}
                    icon={<GraduationCap className="w-5 h-5" />}
                    accent="from-[#6366f1] to-[#4f46e5]"
                    headerNode={card.title}
                  >
                    <ol className="space-y-2">
                      {card.steps.map((step, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <span className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          <p className="text-gray-700 dark:text-gray-300 font-medium text-sm md:text-base leading-7">{step}</p>
                        </li>
                      ))}
                    </ol>
                  </AccordionCard>
                ))
              )}
            </div>
          )}

          {/* ══ Q/A MANHADIJIYA ══ */}
          {activeCategory === 'qa' && (
            <div className="grid grid-cols-1 gap-4">
              {filteredMeth.length === 0 ? (
                <p className="text-sm text-gray-400 font-medium">لا توجد نتائج مطابقة للبحث.</p>
              ) : (
                filteredMeth.map((qa) => (
                  <AccordionCard
                    key={qa.id}
                    id={qa.id}
                    icon={<FileText className="w-5 h-5" />}
                    accent="from-[#f59e0b] to-[#d97706]"
                    headerNode={qa.question}
                    badge={qa.category}
                  >
                    <div className="space-y-3">
                      <p className="text-gray-800 dark:text-gray-200 font-medium leading-8 whitespace-pre-line">{qa.answer}</p>
                      {qa.template && (
                        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/50 rounded-xl p-3">
                          <span className="text-xs font-bold text-amber-700 dark:text-amber-400">القالب الجاهز:</span>
                          <p className="text-gray-700 dark:text-gray-300 font-medium text-sm leading-7 mt-1">{qa.template}</p>
                        </div>
                      )}
                      <div className="flex flex-wrap gap-1.5">
                        {qa.keywords.map((k, ki) => (
                          <Chip key={ki}>{k}</Chip>
                        ))}
                      </div>
                    </div>
                  </AccordionCard>
                ))
              )}
            </div>
          )}

          {/* ══ COMMON ERRORS (NEW) ══ */}
          {activeCategory === 'errors' && (
            <div className="space-y-4">
              <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 rounded-2xl p-4 text-sm leading-7 text-rose-800 dark:text-rose-200 font-bold">
                {realMethodologyErrors.length > 0
                  ? `هذه أخطاؤك المنهجية الحقيقية المسجلة في التطبيق (${realMethodologyErrors.length}). أصلحها من هنا ثم ارجع إلى الإنتاج.`
                  : 'هذه الأخطاء الستة هي الأكثر تكراراً في أوراق البكالوريا. كل خطأ يعرض: الوصف، الكلمات الممنوعة، والصياغة الصحيحة مقارنة بالخاطئة. تدرّب على تجنبها في كل إجابة تكتبها.'}
              </div>

              {mostUrgentVisibleError && urgentPrimaryAction && (
                <div className="rounded-2xl border border-[#006d37]/20 bg-gradient-to-br from-[#006d37]/5 to-[#2ecc71]/5 p-4 space-y-3" data-testid="methodology-urgent-cta">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-[10px] font-black text-[#006d37] dark:text-[#2ecc71] mb-1">الإجراء الأكثر إلحاحاً</div>
                      <h4 className="font-black text-gray-900 dark:text-white text-sm">{mostUrgentVisibleError.title}</h4>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">{urgentPrimaryAction.detail}</p>
                    </div>
                    <Chip variant={mostUrgentVisibleError.progressIndicator?.variant ?? 'indigo'}>
                      {mostUrgentVisibleError.progressIndicator?.label ?? 'ابدأ الآن'}
                    </Chip>
                  </div>
                  <button
                    onClick={urgentPrimaryAction.run}
                    className="w-full px-4 py-3 rounded-xl bg-[#006d37] hover:bg-[#00562b] text-white text-sm font-black cursor-pointer"
                  >
                    صحّح الآن الخطأ الأكثر إلحاحاً
                  </button>
                </div>
              )}

              {methodologyHistory.length > 0 && (
                <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a201c] p-4 space-y-3" data-testid="methodology-error-history">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <h4 className="font-black text-gray-900 dark:text-white text-sm">سجل أخطائي المنهجية</h4>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">يعرض ما تم تصحيحه وما عاد للظهور مجدداً.</p>
                    </div>
                    {hasStabilizedHistoryItems && (
                      <button
                        type="button"
                        data-testid="methodology-hide-stabilized-toggle"
                        onClick={() => setHideStabilizedHistory((prev) => !prev)}
                        className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-black/20 text-[11px] font-black text-gray-700 dark:text-gray-200 cursor-pointer"
                      >
                        {hideStabilizedHistory ? 'أظهر الأخطاء المستقرة' : 'أخفِ الأخطاء المستقرة'}
                      </button>
                    )}
                  </div>
                  <div className="space-y-2">
                    {visibleMethodologyHistory.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-black/20 px-3 py-4 text-[11px] font-bold text-gray-500 dark:text-gray-400">
                        لا توجد أخطاء غير مستقرة في السجل الآن.
                      </div>
                    ) : visibleMethodologyHistory.map((item) => (
                      <div key={item.id} className="rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-black/20 px-3 py-2 space-y-2">
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-black text-gray-900 dark:text-white truncate">{item.title}</p>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400">آخر ظهور/تصحيح: {item.dateLabel}</p>
                            {item.nextReviewLabel && (
                              <p className="text-[10px] text-[#006d37] dark:text-[#2ecc71]">المراجعة القادمة: {item.nextReviewLabel}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Chip variant={item.progressIndicator.variant}>{item.progressIndicator.label}</Chip>
                            <span className="text-[10px] font-black text-gray-500 dark:text-gray-400">×{item.count}</span>
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center justify-between text-[10px] font-black text-gray-500 dark:text-gray-400 mb-1">
                            <span>درجة التثبيت</span>
                            <span>{item.progressIndicator.score}% — {item.progressIndicator.bandLabel} ({item.progressIndicator.bandRangeLabel})</span>
                          </div>
                          <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{ width: `${item.progressIndicator.score}%`, backgroundColor: getProgressColor(item.progressIndicator.variant) }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {filteredErrors.length === 0 ? (
                <p className="text-sm text-gray-400 font-medium">لا توجد نتائج مطابقة للبحث.</p>
              ) : realMethodologyErrors.length > 0 ? (
                <div className="space-y-6" data-testid="methodology-urgency-sections">
                  {URGENCY_SECTIONS.map((section) => {
                    const items = groupedFilteredErrors.get(section.bucket) ?? [];
                    if (items.length === 0) return null;
                    return (
                      <section key={section.bucket} className="space-y-3" data-testid={`urgency-section-${section.bucket}`}>
                        <div>
                          <h4 className="font-black text-gray-900 dark:text-white text-sm">{section.titleAr}</h4>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">{section.descAr}</p>
                        </div>
                        <div className="space-y-4">
                          {items.map((err, idx) => renderErrorCard(err, idx))}
                        </div>
                      </section>
                    );
                  })}
                </div>
              ) : (
                filteredErrors.map((err, idx) => renderErrorCard(err, idx))
              )}
            </div>
          )}

          {/* ══ KEY TERMS (NEW) ══ */}
          {activeCategory === 'terms' && (
            <div className="space-y-4">
              <div className="bg-teal-50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-900/40 rounded-2xl p-4 text-sm leading-7 text-teal-800 dark:text-teal-200 font-bold">
                هذه المصطلحات هي "المواد المقدسة" المستخرجة من البرنامج الرسمي DZ.
                استعملها بدقة في إجاباتك — المصحح يبحث عنها ويمنح النقاط على أساس وجودها.
              </div>
              {filteredTerms.length === 0 ? (
                <p className="text-sm text-gray-400 font-medium">لا توجد نتائج مطابقة للبحث.</p>
              ) : (
                <div className="grid sm:grid-cols-2 gap-3">
                  {filteredTerms.map((kc, idx) => (
                    <motion.div
                      key={kc.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      className="bg-white dark:bg-[#1a201c] rounded-2xl border border-gray-200 dark:border-gray-800 p-4 shadow-sm hover:shadow-sm transition-shadow"
                    >
                      <div className="flex items-start gap-2 mb-2">
                        <span className="w-6 h-6 rounded-lg bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">
                          {kc.unitId}
                        </span>
                        <h4 className="font-black text-gray-900 dark:text-white text-sm">{kc.term}</h4>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-300 leading-6 font-medium">{kc.definition}</p>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ══ STUDY GUIDE ══ */}
          {activeCategory === 'guide' && (
            <div className="grid grid-cols-1 gap-4">
              {filteredStudyGuide.length === 0 ? (
                <p className="text-sm text-gray-400 font-medium">لا توجد نتائج مطابقة للبحث.</p>
              ) : (
                filteredStudyGuide.map((card) => (
                  <AccordionCard
                    key={card.id}
                    id={card.id}
                    icon={<Route className="w-5 h-5" />}
                    accent="from-[#0e7490] to-[#06b6d4]"
                    badge={card.subtitle}
                    headerNode={card.title}
                  >
                    <div className="space-y-4">
                      {card.sections.map((section, sectionIdx) => (
                        <div key={sectionIdx} className="bg-white/70 dark:bg-black/20 border border-gray-100 dark:border-gray-800 rounded-xl p-3">
                          <h4 className="text-sm font-black text-cyan-700 dark:text-cyan-300 mb-2">{section.heading}</h4>
                          <ul className="space-y-2">
                            {section.bullets.map((bullet, bulletIdx) => (
                              <li key={bulletIdx} className="flex items-start gap-2 text-gray-800 dark:text-gray-200 font-medium leading-7 text-sm md:text-base">
                                <CheckCircle2 className="w-4 h-4 mt-1 text-cyan-600 dark:text-cyan-300 shrink-0" />
                                <span>{bullet}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                      <div className="flex flex-wrap gap-1.5">
                        {card.keywords.map((k, ki) => (
                          <Chip key={ki} variant="indigo">{k}</Chip>
                        ))}
                      </div>
                    </div>
                  </AccordionCard>
                ))
              )}
            </div>
          )}

          {/* ══ TRAINER ══ */}
          {activeCategory === 'trainer' && (
            <div className="space-y-4">
              <div className="bg-[#f5f3ff] dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/40 rounded-2xl p-3 text-[12px] leading-6 text-[#4c1d95] dark:text-purple-200 font-bold">
                Kunz El Ouloum — مجاني 100% لفهم الآليات ومنطق الإجابة.
                التصحيح الكامل + مواضيع BAC + متابعة أسبوعية ← <span className="underline">Kunz Pro</span> (نسخة مدفوعة).
              </div>
              <MethodologyTrainer
                initialVerb={selectedTrainerVerb}
                missionReflexId={missionReflexId}
                missionMeta={missionMeta}
                onMissionComplete={onMissionComplete}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
