import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Target, Search, Lightbulb, SplitSquareVertical, AlertCircle, ChevronDown, CheckCircle2, GitCompareArrows, BadgeCheck } from 'lucide-react';

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

export default function MethodologyView() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6 pb-24" dir="rtl">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-2xl shadow-sm border border-emerald-200 dark:border-emerald-800">
            <Target className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">تدريب المسعى العلمي والمنهجية</h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base font-medium mt-1">
              أتقن الأفعال الستة الأكثر تكراراً في بكالوريا الجزائر لضمان إجابة دقيقة ومنظمة.
            </p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 gap-5">
        {METHODOLOGY_VERBS.map((verbItem, index) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
            key={verbItem.id}
            className="bg-white dark:bg-[#1a201c] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden"
          >
            <div 
              className="p-5 md:p-6 cursor-pointer flex items-center justify-between hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
              onClick={() => toggleExpand(verbItem.id)}
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${verbItem.color} text-white shadow-sm`}>
                  {verbItem.icon}
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2 flex-wrap">
                    {verbItem.verb}
                    <span className="text-sm font-bold text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md">
                      {verbItem.french}
                    </span>
                  </h2>
                </div>
              </div>
              <div className={`transition-transform duration-300 ${expandedId === verbItem.id ? 'rotate-180' : ''}`}>
                <ChevronDown className="w-6 h-6 text-gray-400" />
              </div>
            </div>

            <AnimatePresence>
              {expandedId === verbItem.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="p-5 md:p-6 pt-0 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-black/20">
                    <div className="mb-6 mt-4">
                      <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-2">📌 المنطق الجوهري والتعريف</h3>
                      <p className="text-gray-800 dark:text-gray-200 font-medium leading-relaxed bg-white dark:bg-[#1f2622] p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
                        {verbItem.definition}
                      </p>
                    </div>

                    <div className="mb-6">
                      <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-2">👣 خطوات الإجابة المنهجية</h3>
                      <div className="space-y-2">
                        {verbItem.steps.map((step, stepIdx) => (
                          <div key={stepIdx} className="flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-[#006d37] fill-[#2ecc71]/10" />
                            <p className="text-gray-700 dark:text-gray-300 font-medium text-sm md:text-base leading-7">{step}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50 rounded-xl p-4 md:p-5">
                      <h3 className="text-sm font-bold text-emerald-800 dark:text-emerald-400 mb-3 flex items-center gap-2">
                        <Lightbulb className="w-4 h-4" />
                        مثال تطبيقي من البكالوريا
                      </h3>
                      <div className="space-y-3 text-sm md:text-base">
                        <div className="flex flex-col md:flex-row gap-1 md:gap-2">
                          <span className="font-bold text-gray-700 dark:text-gray-300 shrink-0">السياق:</span>
                          <span className="text-gray-600 dark:text-gray-400 font-medium leading-7">{verbItem.example.context}</span>
                        </div>
                        <div className="flex flex-col md:flex-row gap-1 md:gap-2">
                          <span className="font-bold text-gray-700 dark:text-gray-300 shrink-0">السؤال:</span>
                          <span className="text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-100/50 dark:bg-emerald-900/30 px-2 rounded">{verbItem.example.question}</span>
                        </div>
                        <div className="mt-3 pt-3 border-t border-emerald-200/50 dark:border-emerald-800/50">
                          <span className="font-bold text-gray-700 dark:text-gray-300 block mb-1">الإجابة المنهجية:</span>
                          <p className="text-gray-800 dark:text-gray-200 font-medium leading-8 whitespace-pre-line">
                            {verbItem.example.answer}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
