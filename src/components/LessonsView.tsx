import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { BookOpen, CheckCircle2, Compass, FileText, FlaskConical, HelpCircle, Layers, Lightbulb, Target } from 'lucide-react';
import { Unit } from '../types';
import { LessonBlock, LESSON_LIBRARY, LessonLibraryItem } from '../lessonData';
import LessonAdventurePortal from './LessonAdventurePortal';

interface LessonsViewProps {
  units: Unit[];
}

const blockStyles: Record<string, { label: string; className: string }> = {
  problem: { label: 'إشكالية', className: 'border-red-200 bg-red-50 text-red-900 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-100' },
  document: { label: 'وثيقة', className: 'border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-900/40 dark:bg-blue-950/20 dark:text-blue-100' },
  simulation: { label: 'محاكاة', className: 'border-purple-200 bg-purple-50 text-purple-900 dark:border-purple-900/40 dark:bg-purple-950/20 dark:text-purple-100' },
  scientific_text: { label: 'نص علمي', className: 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-100' },
  bac_tip: { label: 'منهجية BAC', className: 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-100' },
  quiz: { label: 'اختبار سريع', className: 'border-[#006d37]/20 bg-[#2ecc71]/10 text-[#005027] dark:border-[#2ecc71]/20 dark:bg-[#2ecc71]/10 dark:text-[#b9f6ca]' },
  text: { label: 'شرح', className: 'border-[#e2dabf] bg-white text-[#1f1c0b] dark:border-[#2ecc71]/10 dark:bg-[#141916] dark:text-gray-100' },
};

function getBlockStyle(type: string) {
  return blockStyles[type] || blockStyles.text;
}

function getBlockIcon(type: string) {
  if (type === 'problem') return <HelpCircle className="w-4 h-4" />;
  if (type === 'document') return <FileText className="w-4 h-4" />;
  if (type === 'simulation') return <FlaskConical className="w-4 h-4" />;
  if (type === 'bac_tip') return <Lightbulb className="w-4 h-4" />;
  if (type === 'quiz') return <CheckCircle2 className="w-4 h-4" />;
  return <BookOpen className="w-4 h-4" />;
}

function renderTextLine(text: string, index: number) {
  return (
    <p key={index} className="leading-8 whitespace-pre-line text-sm md:text-[15px]">
      {text}
    </p>
  );
}

function LessonBlockCard({ block }: { block: LessonBlock }) {
  const style = getBlockStyle(block.type);

  return (
    <div className={`rounded-2xl border p-4 md:p-5 shadow-sm ${style.className}`}>
      <div className="flex items-center gap-2 mb-3">
        {getBlockIcon(block.type)}
        <span className="text-[11px] font-black px-2 py-1 rounded-full bg-white/60 dark:bg-black/20 border border-current/10">
          {style.label}
        </span>
        {block.title && <h4 className="font-extrabold text-sm md:text-base">{block.title}</h4>}
      </div>

      {block.texts && block.texts.length > 0 && (
        <div className="space-y-2">
          {block.texts.map(renderTextLine)}
        </div>
      )}

      {block.buttons && block.buttons.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {block.buttons.map((button) => (
            <span key={button} className="text-xs font-bold px-3 py-1.5 rounded-full bg-white/70 dark:bg-black/20 border border-current/10">
              {button}
            </span>
          ))}
        </div>
      )}

      {block.question && (
        <div className="space-y-3 mt-2">
          <p className="font-extrabold leading-7">{block.question}</p>
          {block.options && (
            <div className="grid gap-2">
              {block.options.map((option, index) => (
                <div
                  key={`${option}-${index}`}
                  className={`rounded-xl px-3 py-2 text-sm border ${
                    index === block.correct
                      ? 'bg-[#2ecc71]/20 border-[#006d37]/30 font-bold'
                      : 'bg-white/60 dark:bg-black/20 border-current/10'
                  }`}
                >
                  {option}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function LessonsView({ units }: LessonsViewProps) {
  const unitsWithLessons = useMemo(
    () => units.filter((unit) => LESSON_LIBRARY.some((lesson) => lesson.unitId === unit.id)),
    [units]
  );
  const [selectedUnitId, setSelectedUnitId] = useState<number>(unitsWithLessons[0]?.id ?? 1);
  const lessonsForUnit = useMemo(
    () => LESSON_LIBRARY.filter((lesson) => lesson.unitId === selectedUnitId),
    [selectedUnitId]
  );
  const [selectedLessonKey, setSelectedLessonKey] = useState<string>(lessonsForUnit[0]?.key ?? LESSON_LIBRARY[0]?.key ?? '');
  const [adventureLesson, setAdventureLesson] = useState<LessonLibraryItem | null>(null);

  useEffect(() => {
    const currentStillVisible = lessonsForUnit.some((lesson) => lesson.key === selectedLessonKey);
    if (!currentStillVisible && lessonsForUnit[0]) {
      setSelectedLessonKey(lessonsForUnit[0].key);
    }
  }, [lessonsForUnit, selectedLessonKey]);

  const selectedLesson: LessonLibraryItem | undefined = LESSON_LIBRARY.find((lesson) => lesson.key === selectedLessonKey) || lessonsForUnit[0];

  return (
    <div className="space-y-6 pb-24 font-sans" dir="rtl">
      <section className="bg-gradient-to-br from-[#006d37] to-[#00562b] text-white rounded-3xl p-6 shadow-md relative overflow-hidden">
        <div className="absolute left-0 top-0 w-40 h-40 bg-[#2ecc71]/20 rounded-full blur-3xl" />
        <div className="relative z-10 flex items-start gap-3">
          <div className="p-3 rounded-2xl bg-white/10 border border-white/15">
            <Layers className="w-7 h-7 text-[#fed65b]" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-black">الدروس التفاعلية</h2>
            <p className="text-sm text-white/80 mt-2 leading-7 max-w-2xl">
              محتوى الدروس المستخرج من ملفات HTML/TypeScript في GitHub وDropbox: إشكاليات، وثائق، نصوص علمية، تنبيهات منهجية واختبارات قصيرة.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white dark:bg-[#141916] border border-[#e2dabf]/60 dark:border-[#2ecc71]/10 rounded-3xl p-4 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-[#006d37] dark:text-[#2ecc71] font-extrabold text-sm">
          <Target className="w-4 h-4" />
          <span>اختر الوحدة</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {unitsWithLessons.map((unit) => (
            <button
              key={unit.id}
              onClick={() => setSelectedUnitId(unit.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                selectedUnitId === unit.id
                  ? 'bg-[#006d37] text-white border-[#006d37] shadow-sm'
                  : 'bg-[#fff9ed] dark:bg-[#1c241f] text-[#006d37] dark:text-[#2ecc71] border-[#e2dabf]/60 dark:border-[#2ecc71]/10 hover:bg-[#fed65b]/20'
              }`}
            >
              {unit.title}
            </button>
          ))}
        </div>
      </section>

      <div className="grid lg:grid-cols-[280px_1fr] gap-5 items-start">
        <aside className="bg-white dark:bg-[#141916] border border-[#e2dabf]/60 dark:border-[#2ecc71]/10 rounded-3xl p-4 shadow-sm sticky top-24 space-y-2 max-h-[calc(100vh-120px)] overflow-y-auto">
          <h3 className="font-black text-[#1f1c0b] dark:text-gray-100 mb-3 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#006d37] dark:text-[#2ecc71]" />
            <span>دروس الوحدة ({lessonsForUnit.length})</span>
          </h3>
          {lessonsForUnit.map((lesson, index) => (
            <button
              key={lesson.key}
              onClick={() => setSelectedLessonKey(lesson.key)}
              className={`w-full text-right rounded-2xl px-3 py-3 text-xs leading-6 border transition-all cursor-pointer ${
                selectedLesson?.key === lesson.key
                  ? 'bg-[#2ecc71]/15 border-[#006d37]/30 text-[#006d37] dark:text-[#2ecc71] font-extrabold'
                  : 'bg-[#fff9ed]/50 dark:bg-[#1c241f] border-[#e2dabf]/50 dark:border-[#2ecc71]/10 text-[#504441] dark:text-gray-300 hover:bg-[#fed65b]/10'
              }`}
            >
              <span className="block text-[10px] opacity-70 mb-1">الدرس {index + 1}</span>
              {lesson.titleAr}
            </button>
          ))}
        </aside>

        <main className="space-y-5">
          {selectedLesson && (
            <motion.article
              key={selectedLesson.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-[#141916] border border-[#e2dabf]/60 dark:border-[#2ecc71]/10 rounded-3xl p-5 md:p-7 shadow-sm space-y-6"
            >
               <header className="space-y-3 border-b border-[#e2dabf]/50 dark:border-[#2ecc71]/10 pb-5">
                <span className="text-[11px] font-bold text-[#944a00] bg-[#fff9ed] border border-[#e2dabf]/70 rounded-full px-3 py-1 inline-block">
                  {selectedLesson.breadcrumb}
                </span>
                <h1 className="text-xl md:text-3xl font-black text-[#006d37] dark:text-[#2ecc71] leading-relaxed">
                  {selectedLesson.titleAr}
                </h1>
                {selectedLesson.objectives.length > 0 && (
                  <ul className="grid gap-2">
                    {selectedLesson.objectives.map((objective) => (
                      <li key={objective} className="text-sm leading-7 text-[#504441] dark:text-gray-300 bg-[#f3f4f5] dark:bg-[#1c241f] rounded-xl px-3 py-2">
                        {objective}
                      </li>
                    ))}
                  </ul>
                )}

                <button
                  onClick={() => setAdventureLesson(selectedLesson)}
                  className="mt-2 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-br from-[#006d37] to-[#00562b] text-white font-extrabold shadow-sm hover:brightness-105 transition-all cursor-pointer"
                >
                  <Compass className="w-5 h-5 text-[#fed65b]" />
                  افتح وضع القصة والتحدي لهذا الدرس
                </button>
              </header>

              {selectedLesson.phases.map((phase, phaseIndex) => (
                <section key={`${selectedLesson.key}-${phaseIndex}`} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-[#006d37] text-white flex items-center justify-center text-sm font-black">
                      {phase.step || phaseIndex + 1}
                    </span>
                    <h3 className="font-black text-[#1f1c0b] dark:text-gray-100">مرحلة التعلم</h3>
                  </div>
                  <div className="grid gap-3">
                    {phase.blocks.map((block, blockIndex) => (
                      <div key={`${selectedLesson.key}-${phaseIndex}-${blockIndex}`}>
                        <LessonBlockCard block={block} />
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </motion.article>
          )}
        </main>
      </div>

      {adventureLesson && (
        <LessonAdventurePortal
          lesson={adventureLesson}
          onClose={() => setAdventureLesson(null)}
        />
      )}
    </div>
  );
}
