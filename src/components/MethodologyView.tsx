import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Target, Search, Lightbulb, AlertCircle, ChevronDown, CheckCircle2,
  BadgeCheck, FileText, GraduationCap, X, ArrowRight, ChevronRight,
  Sparkles, Route, Rocket, XCircle, BookOpen, Zap,
} from 'lucide-react';
import { METHODOLOGY_CARDS } from '../data/methodologyKnowledge';
import { METHODOLOGY_QA } from '../methodologyKnowledge';
import { METHODOLOGY_VERBS } from '../data/methodologyVerbs.tsx';
import MethodologyTrainer from './MethodologyTrainer';
import { normalizeArabic } from '../utils/arabicNormalize';
import { STUDY_GUIDE_CARDS } from '../studyGuide';
import { KnowledgeCards } from '../data/kunzDatabase';
import { MethodologyRules } from '../data/kunzDatabase';

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

// ─── Quick-start items ───────────────────────────────────────────────────────

const QUICK_START_ITEMS = [
  {
    id: 'qs_1',
    title: 'فهم الأفعال الأدائية',
    desc: 'ابدأ بفهم الفرق بين حلل وفسر واستنتج — هذا أساس كل إجابة في البكالوريا.',
    targetCategory: 'verbs' as const,
    icon: <BadgeCheck className="w-6 h-6" />,
    color: '#006d37',
    gradient: 'from-[#006d37] to-[#059669]',
  },
  {
    id: 'qs_2',
    title: 'تدرب على إجابة منهجية',
    desc: 'اختر فعل أدائي وحل وضعية مع تصحيح محلي فوري: كلمات مفتاحية + روابط + بنية.',
    targetCategory: 'trainer' as const,
    icon: <Sparkles className="w-6 h-6" />,
    color: '#7c3aed',
    gradient: 'from-[#7c3aed] to-[#a78bfa]',
  },
  {
    id: 'qs_3',
    title: 'احفظ القوالب الجاهزة',
    desc: 'القوالب المنهجية لكل نوع سؤال: تحليل وثيقة، مقارنة، تفسير، فرضية، تعليل.',
    targetCategory: 'templates' as const,
    icon: <GraduationCap className="w-6 h-6" />,
    color: '#4f46e5',
    gradient: 'from-[#4f46e5] to-[#6366f1]',
  },
  {
    id: 'qs_4',
    title: 'تعرّف على الأخطاء الشائعة',
    desc: 'الأخطاء التي يرتكبها أغلب الطلاب وكيف تتجنبها في كل إجابة.',
    targetCategory: 'errors' as const,
    icon: <AlertCircle className="w-6 h-6" />,
    color: '#e11d48',
    gradient: 'from-[#e11d48] to-[#f43f5e]',
  },
];

// ─── Common errors data ──────────────────────────────────────────────────────

const COMMON_ERRORS = [
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
];

// ─── Category type ────────────────────────────────────────────────────────────

type CategoryId = 'quickstart' | 'verbs' | 'templates' | 'qa' | 'errors' | 'terms' | 'guide' | 'trainer';

// ─── Main Component ──────────────────────────────────────────────────────────

export default function MethodologyView(props: {
  missionReflexId?: import('../data/reflexes').CoreReflexId;
  missionMeta?: { missionId: string; conceptId: string; relatedErrorIds?: string[] };
  onMissionComplete?: (reflexId: import('../data/reflexes').CoreReflexId) => void;
}) {
  const { missionReflexId, missionMeta, onMissionComplete } = props;
  const [query, setQuery] = useState('');
  const [activeVerbId, setActiveVerbId] = useState<string>(METHODOLOGY_VERBS[0].id);
  const [verbViewOpen, setVerbViewOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<CategoryId | null>(null);

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
  const filteredErrors = useMemo(
    () => COMMON_ERRORS.filter((e) => matches(query, e.title, e.desc, e.correct, e.bad, e.good, e.forbidden)),
    [query]
  );
  const filteredTerms = useMemo(
    () => KnowledgeCards.filter((kc) => matches(query, kc.term, kc.definition)),
    [query]
  );

  const activeVerb = METHODOLOGY_VERBS.find((v) => v.id === activeVerbId) || METHODOLOGY_VERBS[0];

  // ── 8 Categories (was 5) ──
  const CATEGORIES: { id: CategoryId; title: string; fr: string; icon: React.ReactNode; color: string; gradient: string; desc: string; count: number }[] = [
    { id: 'quickstart', title: 'البداية السريعة', fr: 'Démarrage rapide', icon: <Rocket className="w-7 h-7" />, color: '#f97316', gradient: 'from-[#f97316] to-[#ea580c]', desc: 'أين تبدأ؟ 4 مسارات مقترحة حسب مستواك.', count: QUICK_START_ITEMS.length },
    { id: 'verbs', title: 'الأفعال الأدائية الستة', fr: 'Les 6 verbes BAC', icon: <BadgeCheck className="w-7 h-7" />, color: '#006d37', gradient: 'from-[#006d37] to-[#059669]', desc: 'حلل، فسر، استنتج، قارن، علل، اقترح فرضية — مع تعريف وخطوات ومثال لكل فعل.', count: METHODOLOGY_VERBS.length },
    { id: 'templates', title: 'القوالب المنهجية', fr: 'Modèles de réponse', icon: <GraduationCap className="w-7 h-7" />, color: '#4f46e5', gradient: 'from-[#4f46e5] to-[#6366f1]', desc: 'قوالب جاهزة لكل نوع إجابة: تحليل وثيقة، مسعى علمي، مقارنة، فرضية، تعليل.', count: METHODOLOGY_CARDS.length },
    { id: 'qa', title: 'أسئلة وأجوبة منهجية', fr: 'Q/R Méthodologie', icon: <FileText className="w-7 h-7" />, color: '#d97706', gradient: 'from-[#d97706] to-[#f59e0b]', desc: 'أسئلة متكررة حول المنهجية مع إجابات تفصيلية من كتاب المنهجية.', count: METHODOLOGY_QA.length },
    { id: 'errors', title: 'الأخطاء الشائعة', fr: 'Erreurs fréquentes', icon: <XCircle className="w-7 h-7" />, color: '#e11d48', gradient: 'from-[#e11d48] to-[#f43f5e]', desc: '6 أخطاء منهجية يرتكبها أغلب الطلاب مع الأمثلة الصحيحة والخاطئة.', count: COMMON_ERRORS.length },
    { id: 'terms', title: 'المصطلحات المفتاحية', fr: 'Termes clés', icon: <BookOpen className="w-7 h-7" />, color: '#0f766e', gradient: 'from-[#0f766e] to-[#14b8a6]', desc: '"المواد المقدسة" — المصطلحات العلمية الرسمية من البرنامج DZ.', count: KnowledgeCards.length },
    { id: 'guide', title: 'دليل المراجعة', fr: 'Parcours de révision', icon: <Route className="w-7 h-7" />, color: '#0e7490', gradient: 'from-[#0e7490] to-[#06b6d4]', desc: 'خطة دراسة المجالات الثلاثة، بروتوكول المراجعة، والتجارب الأساسية.', count: STUDY_GUIDE_CARDS.length },
    { id: 'trainer', title: 'التدريب التفاعلي', fr: 'Entraîneur', icon: <Zap className="w-7 h-7" />, color: '#7c3aed', gradient: 'from-[#7c3aed] to-[#a78bfa]', desc: 'اكتب إجابتك وحللها محلياً: كلمات مفتاحية + روابط منطقية + بنية.', count: 6 },
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

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6 pb-24" dir="rtl">
      {/* ── Hero ── */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-2xl shadow-sm border border-emerald-200 dark:border-emerald-800">
            <Target className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">المنهجية والمسعى العلمي</h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base font-medium mt-1">
              8 أقسام منظمة — اختر القسم الذي يناسبك.
            </p>
          </div>
        </div>
      </motion.div>

      {/* ═══════ LEVEL 1 — Category grid (icônes + noms pour choisir le thème) ═══════ */}
      {!activeCategory && (
        <section className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {CATEGORIES.map((cat, idx) => (
            <motion.button
              key={cat.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => setActiveCategory(cat.id)}
              className="flex flex-col items-center text-center gap-2 rounded-3xl bg-white dark:bg-[#141916] border border-gray-200 dark:border-gray-800 p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] transition-all cursor-pointer"
              style={{ borderTop: `4px solid ${cat.color}` }}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-sm"
                style={{ background: `linear-gradient(135deg, ${cat.color}, ${cat.color}cc)` }}
              >
                {cat.icon}
              </div>
              <span className="font-black text-sm text-gray-900 dark:text-white leading-tight">{cat.title}</span>
              <span className="text-[10px] text-gray-400">{cat.fr}</span>
            </motion.button>
          ))}
        </section>
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

          {/* ══ QUICK START ══ */}
          {activeCategory === 'quickstart' && (
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/10 border border-orange-200 dark:border-orange-900/40 rounded-2xl p-4">
                <h3 className="text-base font-black text-orange-800 dark:text-orange-300 mb-2 flex items-center gap-2">
                  <Rocket className="w-5 h-5" />
                  من أين أبدأ؟
                </h3>
                <p className="text-sm text-orange-700 dark:text-orange-200 leading-7 font-medium">
                  إذا كنت مبتدئاً، اتبع الترتيب أدناه. إذا كنت متوسطاً أو متقدماً، اختر النقطة التي تحتاجها.
                  كل بطولة تنقلك مباشرة إلى القسم المناسب.
                </p>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {QUICK_START_ITEMS.map((item, idx) => (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.08 }}
                    onClick={() => navigateToCategory(item.targetCategory)}
                    className="group text-right bg-white dark:bg-[#1a201c] rounded-2xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm hover:shadow-md transition-all cursor-pointer"
                    style={{ borderRight: `4px solid ${item.color}` }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${item.gradient} text-white flex items-center justify-center shrink-0`}>
                        {item.icon}
                      </div>
                      <div>
                        <h4 className="font-black text-gray-900 dark:text-white text-sm">{item.title}</h4>
                        <span className="text-[10px] font-bold text-gray-400">الخطوة {idx + 1}</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-300 leading-6 font-medium">{item.desc}</p>
                    <div className="flex items-center gap-1 mt-3 text-xs font-extrabold" style={{ color: item.color }}>
                      <span>انتقل</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </motion.button>
                ))}
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
                هذه الأخطاء الستة هي الأكثر تكراراً في أوراق البكالوريا. كل خطأ يعرض: الوصف، الكلمات الممنوعة،
                والصياغة الصحيحة مقارنة بالخاطئة. تدرّب على تجنبها في كل إجابة تكتبها.
              </div>
              {filteredErrors.length === 0 ? (
                <p className="text-sm text-gray-400 font-medium">لا توجد نتائج مطابقة للبحث.</p>
              ) : (
                filteredErrors.map((err, idx) => (
                  <motion.div
                    key={err.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.06 }}
                    className="bg-white dark:bg-[#1a201c] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden"
                  >
                    {/* Error header */}
                    <div className="p-4 md:p-5 flex items-center gap-3" style={{ borderRight: `4px solid ${err.color}` }}>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0" style={{ background: err.color }}>
                        <XCircle className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-black text-gray-900 dark:text-white text-base">{err.title}</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-5">{err.desc}</p>
                      </div>
                    </div>

                    {/* Error details */}
                    <div className="px-4 md:px-5 pb-4 md:pb-5 pt-2 space-y-3">
                      {/* Forbidden words */}
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

                      {/* Correct words */}
                      <div className="flex items-start gap-2">
                        <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">الصحيح:</span>
                        <p className="text-sm text-gray-700 dark:text-gray-300 font-medium leading-6">{err.correct}</p>
                      </div>

                      {/* Bad vs Good example */}
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
                    </div>
                  </motion.div>
                ))
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
                initialVerb="analyse"
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
