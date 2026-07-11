import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Target, Search, Lightbulb, SplitSquareVertical, AlertCircle, ChevronDown, CheckCircle2, GitCompareArrows, BadgeCheck, BookOpen, Layers, FileText, GraduationCap, X, ArrowRight, ChevronRight } from 'lucide-react';
import { METHODOLOGY_CARDS } from '../data/methodologyKnowledge';
import { METHODOLOGY_QA } from '../methodologyKnowledge';
import { KNOWLEDGE_CARDS } from '../knowledgeCards';
import { BOOK_TUTOR_QA } from '../bookTutorQA';
import { INITIAL_UNITS } from '../data';
import { DOMAIN_INFO } from './LessonsView';
import { normalizeArabic } from '../utils/arabicNormalize';

interface VerbData {
  id: string;
  verb: string;
  french: string;
  icon: React.ReactNode;
  color: string;
  definition: string;
  steps: string[];
  example: {
    context: string;
    question: string;
    answer: string;
  };
}

// Source: GitHub Flutter file lib/features/methodology/screens/methodology_screen.dart
// Six core BAC methodology verbs converted to the React view.
const METHODOLOGY_VERBS: VerbData[] = [
  {
    id: 'analyse',
    verb: 'حَلِّلْ',
    french: 'Analyser',
    icon: <Search className="w-6 h-6" />,
    color: 'from-[#3b82f6] to-[#2563eb]',
    definition: 'قراءة متأنية للوثيقة (منحنى، جدول، صورة...) وتفكيك معطياتها لإيجاد علاقة بين المتغيرات دون إعطاء الأسباب (إلا في التحليل المقارن).',
    steps: [
      'تعريف الوثيقة: "تمثل الوثيقة [الظاهرة المدروسة] بدلالة [المتغير] حيث نلاحظ..."',
      'تفكيك وتقسيم المعطيات: تقسيم المنحنى إلى مجالات أو الجدول إلى خانات وذكر التغيرات (تزايد، تناقص، ثبات).',
      'إيجاد العلاقة: ربط المتغيرات (كلما زاد... زاد/نقص...).',
      'الاستنتاج: استخراج حقيقة علمية أو نتيجة جزئية كخلاصة للتحليل.',
    ],
    example: {
      context: 'منحنى يمثل تغيرات سرعة التفاعل الإنزيمي بدلالة تركيز مادة التفاعل (الركيزة).',
      question: 'حلل المنحنى البياني.',
      answer: 'تمثل الوثيقة منحنى لتغيرات سرعة التفاعل بدلالة تركيز مادة التفاعل، حيث نلاحظ:\n- في التراكيز المنخفضة: تزايد سريع لسرعة التفاعل كلما زاد تركيز الركيزة (علاقة طردية).\n- في التراكيز العالية: ثبات سرعة التفاعل عند سرعة أعظمية (Vmax) رغم زيادة التركيز.\nالاستنتاج: سرعة التفاعل الإنزيمي تتأثر بتركيز الركيزة وتصل إلى حد التشبع بفضل تشكل المعقدات إنزيم-ركيزة.',
    },
  },
  {
    id: 'interpret',
    verb: 'فَسِّرْ',
    french: 'Interpréter',
    icon: <Lightbulb className="w-6 h-6" />,
    color: 'from-[#f59e0b] to-[#d97706]',
    definition: 'إعطاء معنى للنتائج الملاحظة بربطها بأسبابها العلمية الخفية. الإجابة عن سؤال "لماذا؟" و"كيف يحدث ذلك؟".',
    steps: [
      'ذكر الملاحظة أو النتيجة التجريبية (ماذا حدث في التجربة؟).',
      'ربط النتيجة بالسبب باستخدام عبارات الربط المنهجية (وهذا راجع إلى، يعود ذلك إلى، يفسر هذا بـ...).',
      'تقديم التبرير العلمي الدقيق والمفصل توظف فيه مكتسباتك المعرفية للوحدة.',
    ],
    example: {
      context: 'تجربة قياس نشاط إنزيم في درجات حرارة مختلفة (وسط به حرارة 60°م).',
      question: 'فسر تناقص وانعدام نشاط الإنزيم عند درجة حرارة 60°م.',
      answer: 'الملاحظة: انعدام نشاط الإنزيم عند 60°م.\nالتفسير: يرجع ذلك إلى أن الحرارة المرتفعة تؤدي إلى تخريب البنية الفراغية للإنزيم (كسر الروابط الضعيفة المثبتة للبنية مثل الروابط الهيدروجينية)، مما يؤدي إلى فقدان الموقع الفعال لشكله المميز، وبالتالي عدم تكامل الركيزة معه وعدم تشكل المعقد (إنزيم-مادة التفاعل ES).',
    },
  },
  {
    id: 'deduce',
    verb: 'اسْتَنْتِجْ',
    french: 'Déduire',
    icon: <SplitSquareVertical className="w-6 h-6" />,
    color: 'from-[#10b981] to-[#059669]',
    definition: 'الخروج بمعلومة جديدة أو حقيقة علمية أساسية كعصارة أو نتيجة نهائية بناءً على معطيات (تحليل أو تجربة) سابقة.',
    steps: [
      'التفطن للهدف الرئيسي من التجربة أو الوثيقة المدروسة.',
      'صياغة جملة إخبارية دقيقة ومختصرة تعبر عن الحقيقة العلمية المستخلصة.',
      'تجنب إعادة ذكر الملاحظات أو الأرقام أو التفاصيل التجريبية في الاستنتاج.',
    ],
    example: {
      context: 'إضافة أحماض أمينية مشعة للخلايا وتتبع مسارها المجهري، فتمركز الإشعاع كثيفاً في الشبكة الهيولية الفعالة (المحببة).',
      question: 'ماذا تستنتج من هذه النتيجة؟',
      answer: 'أستنتج أن مقر تركيب البروتين في الخلية حقيقية النواة هو الشبكة الهيولية المحببة (الفعالة).',
    },
  },
  {
    id: 'compare',
    verb: 'قَارِنْ',
    french: 'Comparer',
    icon: <GitCompareArrows className="w-6 h-6" />,
    color: 'from-[#06b6d4] to-[#0e7490]',
    definition: 'نشاط عقلي يتم من خلاله إظهار أوجه التشابه وأوجه الاختلاف بين عنصرين أو بين نتائج تجريبية في أوساط مختلفة.',
    steps: [
      'تقديم عناصر المقارنة: "المقارنة بين [أ] و [ب] حيث نلاحظ..."',
      'استخراج أوجه التشابه: ذكر العناصر أو النقاط المشتركة بينهما.',
      'استخراج أوجه الاختلاف: استخدام أدوات الربط المقارنة (بينما، بالمقابل، يقابله، في حين أن...).',
      'الاستنتاج: الخروج بخلاصة علمية تربط بين الطرفين المقارنين.',
    ],
    example: {
      context: 'مقارنة المردود الطاقوي في وسط هوائي (التنفس) ووسط لاهوائي (التخمر).',
      question: 'قارن بين ظاهرتي التنفس الخلوي والتخمر الكحولي.',
      answer: 'أوجه التشابه: كلاهما ظاهرة حيوية لإنتاج الطاقة (ATP) يتم فيهما هدم مادة الأيض (الغلوكوز).\nأوجه الاختلاف: التنفس يتم في وجود O2 ويحدث فيه هدم كلي للغلوكوز مع إنتاج طاقة كبيرة (38 أو 36 ATP). بينما التخمر يتم في غياب O2 ويحدث فيه هدم جزئي مع إنتاج طاقة ضئيلة (2 ATP) وبقايا عضوية (إيثانول).\nالاستنتاج: التنفس والتخمر آليتان تضمنان تحويل الطاقة الكيميائية الكامنة إلى طاقة قابلة للاستعمال في الخلية.',
    },
  },
  {
    id: 'justify',
    verb: 'عَلِّلْ / بَرِّرْ',
    french: 'Justifier',
    icon: <BadgeCheck className="w-6 h-6" />,
    color: 'from-[#f43f5e] to-[#e11d48]',
    definition: 'تقديم الحجج والبراهين العلمية المقنعة لإثبات صحة عبارة، نتيجة، أو اختيار معين بناءً على معطيات السند والمكتسبات.',
    steps: [
      'التبني الواضح للعبارة أو الاختيار المطلوب تبريره.',
      'استخراج الأدلة والشواهد من الوثيقة المدروسة (أرقام، ملاحظات مجهرية، نتائج).',
      'ربط الشاهد بالقاعدة العلمية مستخدماً أدوات التعليل (لأن، بما أن... فإن...، وهو ما يؤكد...).',
    ],
    example: {
      context: 'إصابة شخص بفيروس VIH وتناقص شديد في الخلايا اللمفاوية LT4.',
      question: 'علل تسمية فيروس VIH بفيروس فقدان المناعة المكتسبة.',
      answer: 'التعليل: يسمى كذلك لأن فيروس VIH يستهدف ويدمر الخلايا اللمفاوية LT4 المحورية (المساعدة)، وبما أن خلايا LT4 هي المسؤولة عن إفراز الإنترلوكين 2 (IL-2) الضروري لتنشيط وتكاثر اللمفاويات البائية (LB) والتائية (LT8)، فإن غيابها يؤدي إلى تعطيل الاستجابتين المناعيتين الخلطية والخلوية معاً، وبالتالي انهيار المنظومة المناعية المكتسبة للجسم.',
    },
  },
  {
    id: 'hypothesis',
    verb: 'اقْتَرِحْ فَرَضِيَّة',
    french: 'Hypothèse',
    icon: <AlertCircle className="w-6 h-6" />,
    color: 'from-[#8b5cf6] to-[#7c3aed]',
    definition: 'تقديم تفسير أو حل مؤقت منطقي لمشكل علمي مطروح بناءً على الملاحظات والمكتسبات، يقبل الصحة أو الخطأ ويتم التحقق منه تجريبياً لاحقاً.',
    steps: [
      'تحديد المشكل العلمي المطروح في السياق بدقة.',
      'صياغة جملة إخبارية واضحة تتضمن حلاً منطقياً وغير متناقض مع المعطيات.',
      'استخدام عبارات تفيد الاحتمال العلمي (ربما، يعود سبب ذلك إلى أن، قد يكون...).',
      'التأكد من أن الفرضية وجيهة (قابلة للاختبار والتحقق في الجزء الثاني من التمرين).',
    ],
    example: {
      context: 'إضافة مادة ألفا أمانيتين للخلايا وتوقف تركيب البروتين وتناقص كمية ARNm في النواة والهيولى.',
      question: 'اقترح فرضية تفسر آلية تأثير مادة ألفا أمانيتين على تركيب البروتين.',
      answer: 'الفرضية المقترحة: يعود سبب توقف تركيب البروتين إلى أن مادة ألفا أمانيتين تثبط عمل إنزيم ARN بوليميراز في النواة، مما يمنع عملية الاستنساخ وبالتالي عدم تشكل جزيئة الـ ARNm الضرورية للترجمة.',
    },
  },
];

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

function AccordionCard({
  id,
  headerNode,
  badge,
  icon,
  accent,
  children,
}: {
  id: string;
  headerNode: React.ReactNode;
  badge?: string;
  icon: React.ReactNode;
  accent: string;
  children: React.ReactNode;
}) {
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
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block text-[11px] font-bold bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-md border border-emerald-100 dark:border-emerald-800">
      {children}
    </span>
  );
}

type CategoryId = 'verbs' | 'templates' | 'manhadjiya' | 'svt';

export default function MethodologyView() {
  const [query, setQuery] = useState('');
  const [activeVerbId, setActiveVerbId] = useState<string>(METHODOLOGY_VERBS[0].id);
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<CategoryId | null>(null);

  const domainOf = useMemo(() => {
    const map: Record<number, string> = {};
    for (const u of INITIAL_UNITS) map[u.id] = u.domain;
    return map;
  }, []);

  const unitTitle = useMemo(() => {
    const map: Record<number, string> = {};
    for (const u of INITIAL_UNITS) map[u.id] = u.title;
    return map;
  }, []);

  const filteredMeth = useMemo(
    () => METHODOLOGY_QA.filter((q) => matches(query, q.question, q.answer, q.keywords, q.category, q.template)),
    [query]
  );

  const filteredTemplates = useMemo(
    () => METHODOLOGY_CARDS.filter((c) => matches(query, c.title, c.steps, c.triggers)),
    [query]
  );

  const filteredVerbs = useMemo(
    () => METHODOLOGY_VERBS.filter((v) => matches(query, v.verb, v.french, v.definition, v.steps)),
    [query]
  );

  const svtByDomain = useMemo(() => {
    type Item = any;
    const items: Item[] = [
      ...KNOWLEDGE_CARDS.map((c) => ({ ...c, _t: 'card' })),
      ...BOOK_TUTOR_QA.map((b) => ({ ...b, _t: 'book', unitId: b.unitId })),
    ];
    const byDomain = new Map<string, Map<number, Item[]>>();
    for (const it of items) {
      const d = domainOf[it.unitId];
      if (!d) continue;
      if (!byDomain.has(d)) byDomain.set(d, new Map());
      const dm = byDomain.get(d)!;
      if (!dm.has(it.unitId)) dm.set(it.unitId, []);
      dm.get(it.unitId)!.push(it);
    }
    return Array.from(byDomain.entries()).map(([domain, unitsMap]) => ({
      domain,
      units: Array.from(unitsMap.entries())
        .sort((a, b) => a[0] - b[0])
        .map(([uid, its]) => ({ unitId: uid, items: its })),
    }));
  }, [domainOf]);

  const activeVerb = METHODOLOGY_VERBS.find((v) => v.id === activeVerbId) || METHODOLOGY_VERBS[0];

  const CATEGORIES: { id: CategoryId; title: string; fr: string; icon: React.ReactNode; color: string; desc: string; count: number }[] = [
    { id: 'verbs', title: 'الأفعال الستة الأساسية', fr: 'Les 6 verbes BAC', icon: <BadgeCheck className="w-7 h-7" />, color: '#006d37', desc: 'حلل، فسر، استنتج، قارن، علل، اقترح فرضية', count: METHODOLOGY_VERBS.length },
    { id: 'templates', title: 'القوالب المنهجية', fr: 'Modèles de réponse', icon: <GraduationCap className="w-7 h-7" />, color: '#4f46e5', desc: 'قوالب جاهزة لكل نوع من الإجابات', count: METHODOLOGY_CARDS.length },
    { id: 'manhadjiya', title: 'أسئلة المنهجية', fr: 'Q/R LIVRE MANHADJIYA', icon: <FileText className="w-7 h-7" />, color: '#d97706', desc: 'أسئلة وأجوبة من كتاب المنهجية', count: METHODOLOGY_QA.length },
    { id: 'svt', title: 'مكتبة المصطلحات SVT', fr: 'Concepts SVT', icon: <BookOpen className="w-7 h-7" />, color: '#0284c7', desc: 'مصطلحات ومفاهيم من الكتب المدرسية', count: KNOWLEDGE_CARDS.length + BOOK_TUTOR_QA.length },
  ];

  const goBack = () => {
    setActiveCategory(null);
    setSelectedDomain(null);
    setQuery('');
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6 pb-24" dir="rtl">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-2xl shadow-sm border border-emerald-200 dark:border-emerald-800">
            <Target className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">تدريب المسعى العلمي والمنهجية</h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base font-medium mt-1">
              اختر rubrique pour الدخول إليها — كل عنصر بأيقونته الخاصة.
            </p>
          </div>
        </div>
      </motion.div>

      {/* LEVEL 1 — Category grid (each item has a single icon) */}
      {!activeCategory && (
        <section className="grid sm:grid-cols-2 gap-4">
          {CATEGORIES.map((cat, idx) => (
            <motion.button
              key={cat.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.06 }}
              onClick={() => setActiveCategory(cat.id)}
              className="group text-right rounded-3xl p-5 shadow-sm border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#141916] hover:shadow-md transition-all cursor-pointer flex flex-col gap-3"
              style={{ borderTop: `4px solid ${cat.color}` }}
            >
              <div className="flex items-center justify-between">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 text-white"
                  style={{ background: cat.color }}
                >
                  {cat.icon}
                </div>
                <span
                  className="text-[11px] font-black px-3 py-1 rounded-full text-white"
                  style={{ background: cat.color }}
                >
                  {cat.count} عنصر
                </span>
              </div>
              <div>
                <h3 className="text-lg font-black text-gray-900 dark:text-white leading-snug">{cat.title}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{cat.fr}</p>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 font-medium leading-6">{cat.desc}</p>
              <div className="flex items-center gap-1 text-xs font-extrabold mt-auto" style={{ color: cat.color }}>
                <span>ادخل الـ rubrique</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.button>
          ))}
        </section>
      )}

      {/* LEVEL 2 — Focused view of the selected category (only its items) */}
      {activeCategory && (
        <div className="space-y-5">
          {/* Back + search */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={goBack}
              className="flex items-center gap-1 px-3 py-2 rounded-xl font-bold text-sm bg-white dark:bg-[#141916] border border-gray-200 dark:border-gray-800 text-[#006d37] dark:text-[#2ecc71] hover:bg-gray-50 dark:hover:bg-white/5 transition-all cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
              <span>الرجوع للمجالات</span>
            </button>
            <div className="flex-1 min-w-[200px]">
              <div className="flex items-center gap-2 bg-white dark:bg-[#141916] border border-gray-200 dark:border-gray-800 rounded-2xl px-4 py-2.5 shadow-sm">
                <Search className="w-5 h-5 text-gray-400 shrink-0" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="ابحث داخل هذه الـ rubrique..."
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

          {/* === VERBS === */}
          {activeCategory === 'verbs' && (
            <div className="grid lg:grid-cols-[260px_1fr] gap-5 items-start">
              <aside className="bg-white dark:bg-[#141916] border border-gray-200 dark:border-gray-800 rounded-3xl p-3 shadow-sm flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible snap-x snap-mandatory">
                {filteredVerbs.map((v) => {
                  const isActive = v.id === activeVerbId;
                  return (
                    <button
                      key={v.id}
                      onClick={() => setActiveVerbId(v.id)}
                      className={`snap-start shrink-0 lg:w-full text-right rounded-2xl px-3 py-3 flex items-center justify-between gap-3 border transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#006d37]/10 border-[#006d37] text-[#006d37] dark:text-[#2ecc71] font-extrabold'
                          : 'bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className={`w-9 h-9 rounded-xl bg-gradient-to-br ${v.color} text-white flex items-center justify-center shrink-0`}>
                          {v.icon}
                        </span>
                        <span className="leading-tight">
                          <span className="block text-base font-black whitespace-nowrap">{v.verb}</span>
                          <span className="block text-[10px] opacity-70 whitespace-nowrap">{v.french}</span>
                        </span>
                      </span>
                      <ArrowRight className={`w-4 h-4 shrink-0 hidden lg:block ${isActive ? 'text-[#006d37] dark:text-[#2ecc71]' : 'text-gray-300'}`} />
                    </button>
                  );
                })}
              </aside>

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
                  <h4 className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-2">📌 المنطق الجوهري والتعريف</h4>
                  <p className="text-gray-800 dark:text-gray-200 font-medium leading-relaxed bg-gray-50 dark:bg-black/20 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                    {activeVerb.definition}
                  </p>
                </div>

                <div className="mb-5">
                  <h4 className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-2">👣 خطوات الإجابة المنهجية</h4>
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
          )}

          {/* === TEMPLATES === */}
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

          {/* === MANHADJIYA Q/A === */}
          {activeCategory === 'manhadjiya' && (
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
                    badge={qa.sourceBook}
                    headerNode={qa.question}
                  >
                    <div className="space-y-3">
                      <p className="text-gray-800 dark:text-gray-200 font-medium leading-8 whitespace-pre-line">{qa.answer}</p>
                      {qa.template && (
                        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/50 rounded-xl p-3">
                          <span className="text-xs font-bold text-amber-700 dark:text-amber-400">📐 القالب الجاهز:</span>
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

          {/* === SVT LIBRARY (by domain) === */}
          {activeCategory === 'svt' && (
            <div>
              <div className="flex flex-wrap gap-2 mb-4">
                <button
                  onClick={() => setSelectedDomain(null)}
                  className={`px-4 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer border ${
                    selectedDomain === null
                      ? 'bg-[#006d37] text-white border-[#006d37] shadow-sm'
                      : 'bg-white dark:bg-[#141916] border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'
                  }`}
                >
                  كل المجالات
                </button>
                {svtByDomain.map(({ domain }) => {
                  const info = DOMAIN_INFO[domain];
                  const isSel = selectedDomain === domain;
                  return (
                    <button
                      key={domain}
                      onClick={() => setSelectedDomain(domain)}
                      className="px-4 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer border"
                      style={{
                        backgroundColor: isSel ? info?.color : '#ffffff',
                        borderColor: info?.color,
                        color: isSel ? '#ffffff' : info?.color,
                      }}
                    >
                      {domain}
                    </button>
                  );
                })}
              </div>

              {svtByDomain
                .filter(({ domain }) => !selectedDomain || domain === selectedDomain)
                .map(({ domain, units }) => {
                  const info = DOMAIN_INFO[domain];
                  return (
                    <div key={domain} className="mb-6">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="w-3 h-3 rounded-full" style={{ background: info?.color }} />
                        <h3 className="text-base font-black text-gray-800 dark:text-gray-100">{domain}</h3>
                        <span className="text-[11px] font-bold text-gray-400">{info?.fr}</span>
                      </div>
                      <div className="space-y-5 pr-4 border-r-2 pl-2" style={{ borderColor: info?.color }}>
                        {units.map(({ unitId, items }) => {
                          const filteredItems = items.filter((it: any) =>
                            it._t === 'book'
                              ? matches(query, it.question, it.answer, it.topic, it.keywords, it.sourceBook)
                              : matches(query, it.title, it.shortAnswer, it.aliases, it.keywords, it.source)
                          );
                          if (filteredItems.length === 0) return null;
                          return (
                            <div key={unitId}>
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-black text-white px-2.5 py-1 rounded-lg" style={{ background: info?.color }}>
                                  الوحدة {unitId}
                                </span>
                                <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                                  {unitTitle[unitId] ?? ''}
                                </span>
                              </div>
                              <div className="grid grid-cols-1 gap-3">
                                {filteredItems.map((it: any) => {
                                  if (it._t === 'book') {
                                    return (
                                      <AccordionCard
                                        key={it.id}
                                        id={it.id}
                                        icon={<BookOpen className="w-5 h-5" />}
                                        accent="from-[#0ea5e9] to-[#0284c7]"
                                        badge={`📚 ${it.sourceBook} — ${it.topic}`}
                                        headerNode={it.question}
                                      >
                                        <div className="space-y-3">
                                          <p className="text-gray-800 dark:text-gray-200 font-medium leading-8 whitespace-pre-line">{it.answer}</p>
                                          {it.followUp && (
                                            <p className="text-xs font-bold text-sky-700 dark:text-sky-300">↪ سؤال متابعة: {it.followUp}</p>
                                          )}
                                          <div className="flex flex-wrap gap-1.5">
                                            {it.keywords.map((k: string, ki: number) => (
                                              <Chip key={ki}>{k}</Chip>
                                            ))}
                                          </div>
                                        </div>
                                      </AccordionCard>
                                    );
                                  }
                                  return (
                                    <AccordionCard
                                      key={it.id}
                                      id={it.id}
                                      icon={<Layers className="w-5 h-5" />}
                                      accent="from-[#006d37] to-[#00562b]"
                                      badge={it.source}
                                      headerNode={it.title}
                                    >
                                      <div className="space-y-3">
                                        <p className="text-gray-800 dark:text-gray-200 font-medium leading-8 whitespace-pre-line">{it.shortAnswer}</p>
                                        <div className="flex flex-wrap gap-1.5">
                                          {it.keywords.map((k: string, ki: number) => (
                                            <Chip key={ki}>{k}</Chip>
                                          ))}
                                        </div>
                                        {it.relatedQuestions?.length > 0 && (
                                          <div className="pt-1">
                                            <span className="text-xs font-bold text-gray-500 dark:text-gray-400">أسئلة ذات صلة:</span>
                                            <div className="flex flex-wrap gap-1.5 mt-1">
                                              {it.relatedQuestions.map((rq: string, ri: number) => (
                                                <span key={ri} className="text-[11px] font-bold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-md">
                                                  {rq}
                                                </span>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </AccordionCard>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
