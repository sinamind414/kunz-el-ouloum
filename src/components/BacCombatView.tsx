import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Clock, Swords, Trophy, ZoomIn } from 'lucide-react';
import { normalizeArabic } from '../utils/smartTutorEngine';

interface BacCombatBlock {
  id: string;
  label: string;
  instruction: string;
  placeholder: string;
  keywords: string[];
  maxPoints: number;
}

interface BacCombatChallenge {
  id: string;
  title: string;
  domain: string;
  image: string;
  question: string;
  blocks: BacCombatBlock[];
}

const CHALLENGES: BacCombatChallenge[] = [
  {
    id: 'protein-location',
    title: 'مقر تركيب البروتين',
    domain: 'المجال الأول — تركيب البروتين',
    image: '/assets/images/schemas/domaine1_proteines/schema_02_transcription.svg',
    question: 'بناءً على الوثيقة (مسار الإشعاع)، حلل مقر تركيب البروتين وآلية نقل الرسالة الوراثية.',
    blocks: [
      {
        id: 'observation',
        label: 'الملاحظة',
        instruction: 'ما الذي لاحظه العلماء من تتبع الإشعاع في الخلية؟',
        placeholder: 'اكتب الملاحظة الصارمة دون تفسير...',
        keywords: ['النواة', 'الهيولى', 'الستوبلازم', 'الشبكة', 'الريبوزومات', 'الإشعاع'],
        maxPoints: 5,
      },
      {
        id: 'interpretation',
        label: 'التفسير',
        instruction: 'كيف تفسر انتقال الرسالة من النواة إلى الهيولى؟',
        placeholder: 'اربط الملاحظة بالآلية العلمية...',
        keywords: ['الـ ARNm', 'الوسيط', 'الناقلة', 'الرسالة', 'الوراثية', 'الترجمة'],
        maxPoints: 8,
      },
      {
        id: 'conclusion',
        label: 'الاستنتاج',
        instruction: 'ما الاستنتاج العلمي الدقيق حول مقر تركيب البروتين؟',
        placeholder: 'صغ استنتاجاً منهجياً...',
        keywords: ['الهيولى', 'الشبكة', 'الهيولية', 'الداخلية', 'الريبوزومات', 'تركيب'],
        maxPoints: 7,
      },
    ],
  },
  {
    id: 'enzyme-ph',
    title: 'تأثير pH على النشاط الإنزيمي',
    domain: 'المجال الأول — النشاط الإنزيمي',
    image: '/assets/images/schemas/domaine1_proteines/schema_07_enzyme.svg',
    question: 'اشرح تأثير تغير درجة الحموضة (pH) على النشاط الإنزيمي بناءً على المعطيات.',
    blocks: [
      {
        id: 'observation',
        label: 'الملاحظة',
        instruction: 'ما الذي تلاحظه في منحنى النشاط الإنزيمي حسب pH؟',
        placeholder: 'صف سلوك المنحنى...',
        keywords: ['الذروة', 'الأمثل', 'pH', 'الوسط', 'ينخفض', 'يتوقف'],
        maxPoints: 5,
      },
      {
        id: 'interpretation',
        label: 'التفسير',
        instruction: 'لماذا يتغير النشاط عند تغير pH؟',
        placeholder: 'اربط بتأين الجذور الحرة...',
        keywords: ['الشحنة', 'التأين', 'الموقع', 'الفعال', 'الجذور', 'الكهربائية'],
        maxPoints: 8,
      },
      {
        id: 'conclusion',
        label: 'الاستنتاج',
        instruction: 'ما الاستنتاج حول وجود pH أمثل لكل إنزيم؟',
        placeholder: 'صغ الاستنتاج...',
        keywords: ['الأمثل', 'محدد', 'كل', 'إنزيم', 'pH', 'يناسب'],
        maxPoints: 7,
      },
    ],
  },
  {
    id: 'subduction',
    title: 'ظاهرة الغوص (Subduction)',
    domain: 'المجال الثالث — التكتونية العامة',
    image: '/assets/images/schemas/domaine3_tectonique/schema_16_subduction.svg',
    question: 'فسر ظاهرة الغوص وشواهدها الجيوفيزيائية من خلال المخطط.',
    blocks: [
      {
        id: 'observation',
        label: 'الملاحظة',
        instruction: 'ما الشواهد الجيولوجية والزلزالية لمنطقة الغوص؟',
        placeholder: 'اذكر الشواهد الأربعة...',
        keywords: ['الخندق', 'الزلازل', 'بنيوف', 'الحراري', 'الشذوذ', 'العمق'],
        maxPoints: 5,
      },
      {
        id: 'interpretation',
        label: 'التفسير',
        instruction: 'لماذا تغوص الصفيحة المحيطية تحت القارية؟',
        placeholder: 'اربط بالكثافة والثقل...',
        keywords: ['الكثافة', 'الثقل', 'المحيطية', 'القارية', 'البرنس', 'تبرد'],
        maxPoints: 8,
      },
      {
        id: 'conclusion',
        label: 'الاستنتاج',
        instruction: 'ما الاستنتاج حول توازن الكرة الأرضية؟',
        placeholder: 'صغ الاستنتاج التكتوني...',
        keywords: ['الغوص', 'الظهيرة', 'الاتساع', 'يتوازن', 'الأرض', 'ثابت'],
        maxPoints: 7,
      },
    ],
  },
];

function gradeBlock(answer: string, keywords: string[], maxPoints: number): { points: number; matched: string[] } {
  const nAnswer = normalizeArabic(answer);
  if (!nAnswer) return { points: 0, matched: [] };

  const matched = keywords.filter((kw) => nAnswer.includes(normalizeArabic(kw)));
  const ratio = matched.length / keywords.length;
  const points = Math.round(maxPoints * Math.min(1, ratio * 1.4));
  return { points, matched };
}

type Mode = 'coach' | 'sprint';

export default function BacCombatView() {
  const [mode, setMode] = useState<Mode>('coach');
  const [activeId, setActiveId] = useState<string>(CHALLENGES[0].id);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [zoom, setZoom] = useState(false);
  const [sprintStart, setSprintStart] = useState<number | null>(null);
  const [sprintElapsed, setSprintElapsed] = useState(0);

  const challenge = useMemo(() => CHALLENGES.find((c) => c.id === activeId) || CHALLENGES[0], [activeId]);

  const totalMax = useMemo(() => challenge.blocks.reduce((s, b) => s + b.maxPoints, 0), [challenge]);

  const results = useMemo(() => {
    return challenge.blocks.map((b) => {
      const answer = answers[`${challenge.id}-${b.id}`] || '';
      const { points, matched } = gradeBlock(answer, b.keywords, b.maxPoints);
      return { block: b, points, matched, answer };
    });
  }, [answers, challenge]);

  const totalPoints = results.reduce((s, r) => s + r.points, 0);

  const startSprint = () => {
    setMode('sprint');
    setSubmitted(false);
    setSprintStart(Date.now());
    setSprintElapsed(0);
  };

  const finishSprint = () => {
    if (sprintStart) setSprintElapsed(Math.round((Date.now() - sprintStart) / 1000));
    setSprintStart(null);
    setSubmitted(true);
  };

  const setAnswer = (blockId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [`${challenge.id}-${blockId}`]: value }));
  };

  return (
    <div className="space-y-6 pb-24 font-sans" dir="rtl">
      <section className="bg-gradient-to-br from-[#7a1f1f] to-[#5a1414] text-white rounded-3xl p-6 shadow-md relative overflow-hidden">
        <div className="absolute left-0 top-0 w-40 h-40 bg-[#fed65b]/20 rounded-full blur-3xl" />
        <div className="relative z-10 flex items-start gap-3">
          <div className="p-3 rounded-2xl bg-white/10 border border-white/15">
            <Swords className="w-7 h-7 text-[#fed65b]" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-black">تحدي البكالوريا</h2>
            <p className="text-sm text-white/80 mt-2 leading-7 max-w-2xl">
              تدرب على تصحيح الوثائق بأسلوب البكالوريا: الملاحظة، التفسير، والاستنتاج. وضع «المرشد» يصحح فوراً، ووضع «السريع» يقيس الوقت قبل التصحيح.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white dark:bg-[#141916] border border-[#e2dabf]/60 dark:border-[#2ecc71]/10 rounded-3xl p-4 shadow-sm flex flex-wrap items-center gap-3">
        <button
          onClick={() => { setMode('coach'); setSubmitted(false); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
            mode === 'coach'
              ? 'bg-[#006d37] text-white border-[#006d37] shadow-sm'
              : 'bg-[#fff9ed] dark:bg-[#1c241f] text-[#006d37] dark:text-[#2ecc71] border-[#e2dabf]/60 dark:border-[#2ecc71]/10'
          }`}
        >
          وضع المرشد (تصحيح فوري)
        </button>
        {mode === 'sprint' ? (
          <button
            onClick={finishSprint}
            className="px-4 py-2 rounded-xl text-xs font-bold border bg-[#fed65b] text-[#5a1414] border-[#fed65b] shadow-sm cursor-pointer"
          >
            إنهاء التحدي السريع
          </button>
        ) : (
          <button
            onClick={startSprint}
            className="px-4 py-2 rounded-xl text-xs font-bold border bg-[#7a1f1f] text-white border-[#7a1f1f] shadow-sm cursor-pointer flex items-center gap-2"
          >
            <Clock className="w-4 h-4" />
            بدء التحدي السريع
          </button>
        )}
        <span className="text-xs font-bold text-[#506072] mr-auto">
          المجموع الكلي: {totalMax} نقطة
        </span>
      </section>

      <section className="bg-white dark:bg-[#141916] border border-[#e2dabf]/60 dark:border-[#2ecc71]/10 rounded-3xl p-4 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {CHALLENGES.map((c) => (
            <button
              key={c.id}
              onClick={() => { setActiveId(c.id); setSubmitted(false); setSprintStart(null); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                activeId === c.id
                  ? 'bg-[#7a1f1f] text-white border-[#7a1f1f]'
                  : 'bg-[#fff9ed] dark:bg-[#1c241f] text-[#7a1f1f] dark:text-[#fed65b] border-[#e2dabf]/60 dark:border-[#2ecc71]/10'
              }`}
            >
              {c.title}
            </button>
          ))}
        </div>
      </section>

      <motion.article
        key={challenge.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-[#141916] border border-[#e2dabf]/60 dark:border-[#2ecc71]/10 rounded-3xl p-5 md:p-7 shadow-sm space-y-6"
      >
        <header className="space-y-2 border-b border-[#e2dabf]/50 dark:border-[#2ecc71]/10 pb-4">
          <span className="text-[11px] font-bold text-[#944a00] bg-[#fff9ed] border border-[#e2dabf]/70 rounded-full px-3 py-1 inline-block">
            {challenge.domain}
          </span>
          <h1 className="text-xl md:text-2xl font-black text-[#7a1f1f] dark:text-[#fed65b] leading-relaxed">
            {challenge.title}
          </h1>
          <p className="text-sm leading-7 text-[#504441] dark:text-gray-300">{challenge.question}</p>
        </header>

        <button
          onClick={() => setZoom(true)}
          className="flex items-center gap-2 text-xs font-bold text-[#006d37] dark:text-[#2ecc71] bg-[#2ecc71]/10 border border-[#006d37]/20 rounded-xl px-3 py-2 cursor-pointer hover:bg-[#2ecc71]/20 transition-all"
        >
          <ZoomIn className="w-4 h-4" />
          عرض المخطط العلمي (Zoom)
        </button>

        <div className="space-y-5">
          {challenge.blocks.map((block) => {
            const value = answers[`${challenge.id}-${block.id}`] || '';
            const result = results.find((r) => r.block.id === block.id);
            const showCorrection = submitted || mode === 'coach';
            return (
              <div
                key={block.id}
                className="rounded-2xl border border-[#e2dabf]/60 dark:border-[#2ecc71]/10 bg-[#fff9ed]/40 dark:bg-[#1c241f] p-4 space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-extrabold text-sm md:text-base text-[#1f1c0b] dark:text-gray-100 flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-[#7a1f1f] text-white flex items-center justify-center text-xs font-black">
                      {block.label.charAt(0)}
                    </span>
                    {block.label}
                  </h4>
                  <span className="text-[11px] font-bold text-[#506072]">{block.maxPoints} نقطة</span>
                </div>

                <p className="text-sm leading-7 text-[#504441] dark:text-gray-300">{block.instruction}</p>

                <textarea
                  value={value}
                  onChange={(e) => setAnswer(block.id, e.target.value)}
                  placeholder={block.placeholder}
                  rows={3}
                  disabled={mode === 'sprint' && sprintStart === null && submitted}
                  className="w-full rounded-xl border border-[#e2dabf] dark:border-[#2ecc71]/20 bg-white dark:bg-[#141916] p-3 text-sm leading-7 focus:outline-none focus:ring-2 focus:ring-[#006d37]/40 resize-y"
                />

                {showCorrection && result && (
                  <div className="rounded-xl bg-[#f3f4f5] dark:bg-[#0c0f0d] p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-[#006d37] dark:text-[#2ecc71]">
                        النقاط: {result.points} / {block.maxPoints}
                      </span>
                      {result.matched.length > 0 && (
                        <span className="text-[11px] font-bold text-[#944a00]">
                          الكلمات المفتاحية الموجودة: {result.matched.length}/{block.keywords.length}
                        </span>
                      )}
                    </div>
                    {result.matched.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {result.matched.map((kw) => (
                          <span key={kw} className="text-[11px] font-bold px-2 py-1 rounded-full bg-[#2ecc71]/20 text-[#005027] dark:text-[#b9f6ca] border border-[#006d37]/20">
                            {kw}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-[#b42318]">
                        أضف الكلمات المفتاحية العلمية لتحسين تصحيحك المحلي.
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between gap-3 pt-2 border-t border-[#e2dabf]/50 dark:border-[#2ecc71]/10">
          <span className="text-sm font-extrabold text-[#1f1c0b] dark:text-gray-100 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[#fed65b] fill-[#fed65b]" />
            المجموع: {totalPoints} / {totalMax}
          </span>
          {(mode === 'coach') && (
            <button
              onClick={() => setSubmitted(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-[#006d37] text-white cursor-pointer shadow-sm hover:bg-[#00562b] transition-all"
            >
              تصحيح الإجابات
            </button>
          )}
          {mode === 'sprint' && sprintElapsed > 0 && (
            <span className="text-xs font-bold text-[#7a1f1f] dark:text-[#fed65b] flex items-center gap-2">
              <Clock className="w-4 h-4" />
              الزمن: {sprintElapsed} ث
            </span>
          )}
        </div>
      </motion.article>

      {zoom && (
        <div
          className="fixed inset-0 z-[60] bg-black/70 flex items-center justify-center p-4"
          onClick={() => setZoom(false)}
        >
          <img
            src={challenge.image}
            alt={challenge.title}
            className="max-w-[90%] max-h-[90%] rounded-3xl bg-white p-3 shadow-2xl"
          />
        </div>
      )}
    </div>
  );
}
