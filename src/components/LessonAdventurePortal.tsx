import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { BookOpen, CheckCircle2, AlertTriangle, Compass, Flag, MessageCircleQuestion, Sparkles, Target, X, ZoomIn } from 'lucide-react';
import { LessonBlock, LessonLibraryItem } from '../lessonData';
import { MASCOT_URL } from '../data';

interface LessonAdventurePortalProps {
  lesson: LessonLibraryItem;
  onClose: () => void;
  onAskTutor?: (question: string) => void;
}

const KEYWORD_DICT: string[] = [
  'الاستنساخ', 'الترجمة', 'الريبوزوم', 'البروتين', 'الحمض الأميني', 'الإنزيم', 'المناعة',
  'الخلطية', 'الخلوية', 'الذات', 'اللاذات', 'المناعية', 'العصبي', 'السيالة', 'الكمون',
  'التركيب الضوئي', 'التنفس', 'التخمر', 'الطاقة', 'الـ ATP', 'التكتونية', 'الصفيحة',
  'الغوص', 'الظهيرة', 'البرنس', 'النواة', 'الميتوكندرون', 'الصانعة', 'الهيولى',
  'النواة', 'النشاط الإنزيمي', 'درجة الحموضة', 'pH', 'الكيميوضوئية', 'الكيميوحيوية',
  'الموجات', 'الزلزالية', 'باطن الأرض', 'الصخور', 'الماغما', 'البازلت', 'الغرانيت',
  'الحمل الحراري', 'التدرج', 'الجيوتحراري', 'المستضد', 'الجسم المضاد', 'الماكروفاج',
  'الخلايا اللمفاوية', 'الفيروس', 'الدرس', 'البنية', 'الوظيفة', 'الطفرة', 'التمسخ',
];

function extractKeywords(text: string): string[] {
  const found = new Set<string>();
  for (const kw of KEYWORD_DICT) {
    if (text.includes(kw)) found.add(kw);
  }
  return Array.from(found).slice(0, 6);
}

interface AdventurePage {
  id: string;
  title: string;
  badge: string;
  blocks: LessonBlock[];
}

function buildPages(lesson: LessonLibraryItem): AdventurePage[] {
  const allBlocks = lesson.phases.flatMap((p) => p.blocks);

  // Single Path: Mot → Exemple → Micro-test → Méthodo incarnée
  const mots = allBlocks.filter((b) => b.type === 'problem');
  const exemples = allBlocks.filter((b) => b.type === 'document' || b.type === 'simulation');
  const microTests = allBlocks.filter((b) => b.type === 'quiz');
  const methodos = allBlocks.filter((b) => b.type === 'scientific_text' || b.type === 'bac_tip' || b.type === 'text');

  const pages: AdventurePage[] = [];

  pages.push({
    id: 'mot',
    title: 'الموت - الكلمة المفتاحية',
    badge: 'كلمة',
    blocks: mots.length > 0 ? mots : allBlocks.slice(0, 1),
  });

  pages.push({
    id: 'exemple',
    title: 'المثال - الوثيقة',
    badge: 'مثال',
    blocks: exemples.length > 0 ? exemples : allBlocks.slice(1, 3),
  });

  pages.push({
    id: 'microtest',
    title: 'الاختبار المصغر - إنتاج',
    badge: 'إنتاج',
    blocks: microTests.length > 0 ? microTests : allBlocks.slice(-2, -1),
  });

  pages.push({
    id: 'methodo',
    title: 'المنهجية المجسدة',
    badge: 'منهجية',
    blocks: methodos.length > 0 ? methodos : allBlocks.slice(-2),
  });

  return pages;
}

const blockStyleMap: Record<string, string> = {
  problem: 'border-red-200 bg-red-50 text-red-900 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-100',
  document: 'border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-900/40 dark:bg-blue-950/20 dark:text-blue-100',
  simulation: 'border-purple-200 bg-purple-50 text-purple-900 dark:border-purple-900/40 dark:bg-purple-950/20 dark:text-purple-100',
  scientific_text: 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-100',
  bac_tip: 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-100',
  quiz: 'border-[#006d37]/20 bg-[#2ecc71]/10 text-[#005027] dark:border-[#2ecc71]/20 dark:bg-[#2ecc71]/10 dark:text-[#b9f6ca]',
  text: 'border-[#e2dabf] bg-white text-[#1f1c0b] dark:border-[#2ecc71]/10 dark:bg-[#141916] dark:text-gray-100',
};

function BlockCard({ block }: { key?: string; block: LessonBlock }) {
  const className = blockStyleMap[block.type] || blockStyleMap.text;
  const keywords = useMemo(() => extractKeywords((block.texts || []).join(' ') + ' ' + (block.title || '')), [block]);
  const [picked, setPicked] = useState<number | null>(null);
  const revealed = picked !== null;
  const isCorrectIndex = (i: number) => i === block.correct;

  return (
    <div className={`rounded-2xl border p-4 md:p-5 shadow-sm ${className}`}>
      {block.title && (
        <h4 className="font-extrabold text-sm md:text-base mb-3 flex items-start gap-2">
          <span className="mt-1 w-2 h-2 rounded-full bg-current opacity-70 shrink-0" />
          {block.title}
        </h4>
      )}

      {block.texts && block.texts.length > 0 && (
        <div className="space-y-2">
          {block.texts.map((text, i) => (
            <p key={i} className="leading-8 whitespace-pre-line text-sm md:text-[15px]">
              {text}
            </p>
          ))}
        </div>
      )}

      {keywords.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {keywords.map((kw) => (
            <span
              key={kw}
              className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-white/70 dark:bg-black/20 border border-current/10"
            >
              #{kw}
            </span>
          ))}
        </div>
      )}

      {block.question && (
        <div className="space-y-3 mt-3">
          <p className="font-extrabold leading-7">{block.question}</p>
          {block.options && (
            <div className="grid gap-2">
              {block.options.map((option, index) => {
                const isPicked = picked === index;
                const showCorrect = revealed && isCorrectIndex(index);
                const showWrong = revealed && isPicked && !isCorrectIndex(index);
                const stateCls = !revealed
                  ? 'bg-white/60 dark:bg-black/20 border-current/10 hover:border-[#006d37]/40'
                  : showCorrect
                    ? 'bg-[#2ecc71]/20 border-[#006d37]/40 font-bold'
                    : showWrong
                      ? 'bg-rose-100 dark:bg-rose-950/30 border-rose-400 font-bold'
                      : 'bg-white/40 dark:bg-black/10 border-current/10 opacity-60';
                return (
                  <button
                    key={`${option}-${index}`}
                    type="button"
                    onClick={() => !revealed && setPicked(index)}
                    disabled={revealed}
                    className={`text-right rounded-xl px-3 py-2 text-sm border transition-all cursor-pointer flex items-center justify-between gap-2 ${stateCls}`}
                  >
                    <span>{option}</span>
                    {showCorrect && <CheckCircle2 className="w-5 h-5 text-[#006d37] shrink-0" />}
                    {showWrong && <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}
          {revealed && (
            <div className={`p-3 rounded-xl text-xs font-bold leading-6 ${picked === block.correct ? 'bg-[#2ecc71]/10 text-[#006d37] border border-[#2ecc71]/20' : 'bg-rose-50 dark:bg-rose-950/20 text-rose-700 border border-rose-200'}`}>
              {picked === block.correct
                ? '✅ إجابة صحيحة!'
                : `❌ إجابة خاطئة — الصحيحة : ${block.options?.[block.correct ?? 0]}`}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function LessonAdventurePortal({ lesson, onClose, onAskTutor }: LessonAdventurePortalProps) {
  const pages = useMemo(() => buildPages(lesson), [lesson]);
  const [activePage, setActivePage] = useState(0);
  const [showMascot, setShowMascot] = useState(false);

  const page = pages[activePage];
  const askSuggestion = useMemo(
    () => `اشرح لي "${lesson.titleAr.replace(/^الدرس\s+\d+\s*:?\s*/, '')}" بأسلوب مبسط`,
    [lesson.titleAr]
  );

  const lessonKeywords = useMemo(() => {
    const allText = lesson.phases
      .flatMap((p) => p.blocks)
      .flatMap((b) => [...(b.texts || []), b.title || '', b.question || ''])
      .join(' ');
    return extractKeywords(allText);
  }, [lesson]);

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-stretch justify-center" dir="rtl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#f8f9fa] dark:bg-[#0c0f0d] w-full max-w-3xl h-full overflow-y-auto shadow-2xl"
      >
        <header className="sticky top-0 z-10 bg-gradient-to-br from-[#006d37] to-[#00562b] text-white p-5 shadow-md flex items-start gap-3">
          <div className="p-2.5 rounded-2xl bg-white/10 border border-white/15 shrink-0">
            <Compass className="w-6 h-6 text-[#fed65b]" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[11px] font-bold text-white/80 bg-white/10 px-2.5 py-1 rounded-full inline-block mb-2">
              {lesson.breadcrumb}
            </span>
            <h2 className="text-xl md:text-2xl font-black leading-relaxed">رحلة تعلم: {lesson.titleAr}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 transition-all cursor-pointer shrink-0"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        <nav className="sticky top-[88px] z-10 bg-[#ffffff] dark:bg-[#141916] border-b border-[#e2dabf]/50 dark:border-[#2ecc71]/10 px-4 py-3 flex gap-2 overflow-x-auto">
          {pages.map((p, i) => (
            <button
              key={p.id}
              onClick={() => setActivePage(i)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activePage === i
                  ? 'bg-[#006d37] text-white shadow-sm'
                  : 'bg-[#fff9ed] dark:bg-[#1c241f] text-[#006d37] dark:text-[#2ecc71] hover:bg-[#fed65b]/20'
              }`}
            >
              {i === 0 ? <Flag className="w-4 h-4" /> : i === 1 ? <BookOpen className="w-4 h-4" /> : i === 2 ? <CheckCircle2 className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              {p.title}
            </button>
          ))}
        </nav>

        <main className="px-4 py-5 space-y-4 pb-28">
          {activePage === 0 && lesson.objectives && lesson.objectives.length > 0 && (
            <div className="bg-[#fff9ed] dark:bg-[#1c241f] border border-[#e2dabf]/70 rounded-2xl p-4 space-y-2">
              <h3 className="text-sm font-black text-[#944a00] flex items-center gap-2">
                <Target className="w-4 h-4" />
                أهداف الدرس — ما تحتوي هذه leçon
              </h3>
              <ul className="space-y-1.5">
                {lesson.objectives.map((obj, i) => (
                  <li key={i} className="text-xs leading-6 text-[#504441] dark:text-gray-300 flex gap-2">
                    <span className="text-[#006d37] mt-1 shrink-0">•</span>
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex items-center gap-2 text-[#944a00] bg-[#fff9ed] dark:bg-[#1c241f] border border-[#e2dabf]/70 rounded-full px-3 py-1.5 w-fit text-xs font-extrabold">
            <span className="w-2 h-2 rounded-full bg-[#fed65b]" />
            {page.badge}
          </div>

          {page.blocks.map((block, i) => (
            <BlockCard key={`${page.id}-${i}`} block={block} />
          ))}

          {activePage === pages.length - 1 && lessonKeywords.length > 0 && (
            <div className="bg-[#006d37]/5 dark:bg-[#006d37]/10 border border-[#006d37]/20 rounded-2xl p-4 space-y-2">
              <h3 className="text-sm font-black text-[#006d37] dark:text-[#2ecc71] flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                مots clés à retenir (الكلمات المفتاحية)
              </h3>
              <div className="flex flex-wrap gap-2">
                {lessonKeywords.map((kw) => (
                  <span
                    key={kw}
                    className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-white dark:bg-black/20 border border-[#006d37]/20 text-[#006d37] dark:text-[#2ecc71]"
                  >
                    #{kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => setShowMascot(true)}
            className="flex items-center gap-2 text-xs font-bold text-[#006d37] dark:text-[#2ecc71] bg-[#2ecc71]/10 border border-[#006d37]/20 rounded-xl px-3 py-2 cursor-pointer hover:bg-[#2ecc71]/20 transition-all"
          >
            <ZoomIn className="w-4 h-4" />
            عرض رفيق المراجعة
          </button>
        </main>

        {onAskTutor && (
          <button
            onClick={() => onAskTutor(askSuggestion)}
            className="fixed bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#006d37] text-white font-extrabold shadow-lg border border-white/20 cursor-pointer hover:bg-[#00562b] transition-all"
          >
            <MessageCircleQuestion className="w-5 h-5" />
            اسأل المرشد الذكي عن هذا الدرس
          </button>
        )}
      </motion.div>

      {showMascot && (
        <div
          className="fixed inset-0 z-[60] bg-black/70 flex items-center justify-center p-4"
          onClick={() => setShowMascot(false)}
        >
          <img
            src={MASCOT_URL}
            alt="رفيق المراجعة"
            className="max-w-[80%] max-h-[80%] rounded-3xl bg-white p-4 shadow-2xl"
          />
        </div>
      )}
    </div>
  );
}
