import { useEffect, useMemo, useState, lazy, Suspense } from 'react';
import { motion } from 'motion/react';
import { BookOpen, Layers, Target, Dna, Zap, Globe2, ChevronRight, ArrowRight } from 'lucide-react';
import { Unit } from '../types';
import { LESSON_LIBRARY, LessonLibraryItem } from '../lessonData';
import { SINGLE_PATH_LESSONS } from '../data/singlePathLessons';

const InteractiveLessonView = lazy(() => import('./InteractiveLessonView'));
const HtmlLessonViewer = lazy(() => import('./HtmlLessonViewer'));

interface LessonsViewProps {
  units: Unit[];
}

// Display metadata per domain (icon, palette, French subtitle).
export const DOMAIN_INFO: Record<string, { fr: string; icon: typeof Dna; color: string; light: string; dark: string }> = {
  'التخصص الوظيفي للبروتينات': {
    fr: 'Spécialisation fonctionnelle des protéines',
    icon: Dna,
    color: '#006d37',
    light: '#eafaf1',
    dark: '#00562b',
  },
  'التحولات الطاقوية': {
    fr: 'Transformations énergétiques',
    icon: Zap,
    color: '#b45309',
    light: '#fef3e2',
    dark: '#92400e',
  },
  'التكتونية العامة': {
    fr: 'Tectonique générale',
    icon: Globe2,
    color: '#1d4ed8',
    light: '#eaf1fe',
    dark: '#1e40af',
  },
};

const DEFAULT_DOMAIN_INFO = { fr: '', icon: Layers, color: '#006d37', light: '#eafaf1', dark: '#00562b' };

// Strips the leading global "الدرس N :" prefix so the lesson shows a single, clean title.
function cleanLessonTitle(title: string): string {
  return title.replace(/^\s*الدرس\s+\d+\s*:\s*/, '').trim();
}

export default function LessonsView({ units }: LessonsViewProps) {
  // Only keep units that actually contain lessons.
  const unitsWithLessons = useMemo(
    () => units.filter((unit) => LESSON_LIBRARY.some((lesson) => lesson.unitId === unit.id)),
    [units]
  );

  // Build the 3 domains (preserving their natural order) → units.
  const domains = useMemo(() => {
    const ordered: string[] = [];
    const byDomain = new Map<string, Unit[]>();
    for (const unit of unitsWithLessons) {
      if (!byDomain.has(unit.domain)) {
        byDomain.set(unit.domain, []);
        ordered.push(unit.domain);
      }
      byDomain.get(unit.domain)!.push(unit);
    }
    return ordered.map((name) => ({ name, units: byDomain.get(name)! }));
  }, [unitsWithLessons]);

  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null);
  const [selectedLessonKey, setSelectedLessonKey] = useState<string>('');
  const [openLessonKey, setOpenLessonKey] = useState<string | null>(null);

  const domainUnits = useMemo(
    () => (selectedDomain ? unitsWithLessons.filter((u) => u.domain === selectedDomain) : []),
    [selectedDomain, unitsWithLessons]
  );

  const lessonsForUnit = useMemo(
    () => (selectedUnitId ? LESSON_LIBRARY.filter((lesson) => lesson.unitId === selectedUnitId) : []),
    [selectedUnitId]
  );

  // Order lessons by their chapter number. Lessons that keep the original title expose
  // "الدرس N"; split sub-lessons (e.g. "كيف تكونت قمة إيفرست") have no number, so we place
  // them just after the preceding numbered chapter to preserve the real chapter sequence.
  const sortedLessonsForUnit = useMemo(() => {
    let lastNum = 0;
    const withKeys = lessonsForUnit.map((lesson) => {
      const m = lesson.titleAr.match(/الدرس\s+(\d+)/);
      let key: number;
      if (m) {
        key = Number(m[1]);
        lastNum = key;
      } else {
        key = lastNum + 0.5;
      }
      return { lesson, key };
    });
    return withKeys.sort((a, b) => a.key - b.key).map((x) => x.lesson);
  }, [lessonsForUnit]);

  useEffect(() => {
    const currentStillVisible = lessonsForUnit.some((lesson) => lesson.key === selectedLessonKey);
    if (!currentStillVisible && lessonsForUnit[0]) {
      setSelectedLessonKey(lessonsForUnit[0].key);
    }
  }, [lessonsForUnit, selectedLessonKey]);

  const selectedLesson: LessonLibraryItem | undefined =
    LESSON_LIBRARY.find((lesson) => lesson.key === selectedLessonKey) || lessonsForUnit[0];

  const selectedUnit = unitsWithLessons.find((u) => u.id === selectedUnitId) || null;
  const domainInfo = selectedDomain ? DOMAIN_INFO[selectedDomain] ?? DEFAULT_DOMAIN_INFO : DEFAULT_DOMAIN_INFO;

  const goToDomain = (domain: string) => {
    setSelectedDomain(domain);
    setSelectedUnitId(null);
    setOpenLessonKey(null);
  };

  const goToUnit = (unitId: number) => {
    setSelectedUnitId(unitId);
    setOpenLessonKey(null);
  };

  const backToDomains = () => {
    setSelectedDomain(null);
    setSelectedUnitId(null);
    setOpenLessonKey(null);
  };

  const backToUnits = () => {
    setSelectedUnitId(null);
    setOpenLessonKey(null);
  };

  return (
    <div className="space-y-6 pb-24 font-sans" dir="rtl">
      <section className="bg-gradient-to-br from-[#006d37] to-[#00562b] text-white rounded-3xl p-6 shadow-md relative overflow-hidden">
        <div className="absolute left-0 top-0 w-40 h-40 bg-[#2ecc71]/20 rounded-full blur-3xl" />
        <div className="relative z-10 flex items-start gap-3">
          <div className="p-3 rounded-2xl bg-white/10 border border-white/15">
            <Layers className="w-7 h-7 text-[#fed65b]" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-black">الدروس التفاعلية - بدون تمرير</h2>
            <p className="text-sm text-white/80 mt-2 leading-7 max-w-2xl">
              كل درس = 4 خطوات فقط: <strong>كلمة مفتاحية → مثال موثق → اختبار إنتاجي (كتابي + صوتي 🎤) → منهجية مجسدة</strong>. صفحة واحدة بلا scroll infini.
            </p>
          </div>
        </div>
      </section>

      {/* Breadcrumb navigation */}
      <nav className="flex items-center gap-2 flex-wrap text-sm">
        <button
          onClick={backToDomains}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
            selectedDomain ? 'text-[#006d37] dark:text-[#2ecc71] hover:bg-[#fed65b]/15' : 'text-[#006d37] dark:text-[#2ecc71] opacity-70'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>المجالات</span>
        </button>
        {selectedDomain && (
          <>
            <ChevronRight className="w-4 h-4 opacity-40" />
            <button
              onClick={backToUnits}
              disabled={!selectedUnitId}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                selectedUnitId
                  ? 'text-[#006d37] dark:text-[#2ecc71] hover:bg-[#fed65b]/15'
                  : 'text-[#1f1c0b] dark:text-gray-100 opacity-70'
              }`}
            >
              {selectedDomain}
            </button>
          </>
        )}
        {selectedUnit && (
          <>
            <ChevronRight className="w-4 h-4 opacity-40" />
            <span className="px-3 py-1.5 rounded-xl font-bold text-[#1f1c0b] dark:text-gray-100 opacity-90">{selectedUnit.title}</span>
          </>
        )}
      </nav>

      {/* LEVEL 1 — Domains */}
      {!selectedDomain && (
        <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {domains.map((domain, idx) => {
            const info = DOMAIN_INFO[domain.name] ?? DEFAULT_DOMAIN_INFO;
            const Icon = info.icon;
            const unitCount = domain.units.length;
            const chapterCount = domain.units.reduce(
              (acc, u) => acc + LESSON_LIBRARY.filter((l) => l.unitId === u.id).length,
              0
            );
            return (
              <motion.button
                key={domain.name}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.06 }}
                onClick={() => goToDomain(domain.name)}
                className="group text-right rounded-3xl p-5 shadow-sm border border-[#e2dabf]/60 dark:border-[#2ecc71]/10 bg-white dark:bg-[#141916] hover:shadow-md transition-all cursor-pointer flex flex-col gap-4"
                style={{ borderTop: `4px solid ${info.color}` }}
              >
                <div className="flex items-center justify-between">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0"
                    style={{ background: info.light }}
                  >
                    <Icon className="w-9 h-9" style={{ color: info.color }} />
                  </div>
                  <span
                    className="text-[11px] font-black px-3 py-1 rounded-full"
                    style={{ background: info.color, color: '#fff' }}
                  >
                    المجال {idx + 1}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#1f1c0b] dark:text-gray-100 leading-snug">{domain.name}</h3>
                  <p className="text-xs text-[#506072] dark:text-gray-400 mt-1">{info.fr}</p>
                </div>
                <div className="flex items-center gap-3 text-[11px] font-bold text-[#504441] dark:text-gray-300">
                  <span className="flex items-center gap-1">
                    <Target className="w-3.5 h-3.5" style={{ color: info.color }} />
                    {unitCount} وحدة
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5" style={{ color: info.color }} />
                    {chapterCount} درس
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs font-extrabold mt-auto" style={{ color: info.color }}>
                  <span>استكشف الوحدات</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.button>
            );
          })}
        </section>
      )}

      {/* LEVEL 2 — Units of the selected domain */}
      {selectedDomain && !selectedUnitId && (
        <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {domainUnits.map((unit, idx) => {
            const info = DOMAIN_INFO[selectedDomain] ?? DEFAULT_DOMAIN_INFO;
            const chapterCount = LESSON_LIBRARY.filter((l) => l.unitId === unit.id).length;
            return (
              <motion.button
                key={unit.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => goToUnit(unit.id)}
                className="group text-right rounded-3xl p-5 shadow-sm border border-[#e2dabf]/60 dark:border-[#2ecc71]/10 bg-white dark:bg-[#141916] hover:shadow-md transition-all cursor-pointer flex flex-col gap-3"
                style={{ borderTop: `4px solid ${info.color}` }}
              >
                <div className="flex items-center justify-between">
                  <span
                    className="text-[11px] font-black px-3 py-1 rounded-full"
                    style={{ background: info.light, color: info.color }}
                  >
                    الوحدة {idx + 1}
                  </span>
                  {unit.isLocked && <span className="text-[10px] font-bold text-amber-600">🔒 مغلقة</span>}
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#1f1c0b] dark:text-gray-100 leading-snug">{unit.title}</h3>
                  <p className="text-xs text-[#506072] dark:text-gray-400 mt-1 leading-6">{unit.description}</p>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="flex items-center gap-1 text-[11px] font-bold text-[#504441] dark:text-gray-300">
                    <BookOpen className="w-3.5 h-3.5" style={{ color: info.color }} />
                    {chapterCount} درس
                  </span>
                  {unit.progress > 0 && (
                    <span className="text-[11px] font-bold" style={{ color: info.color }}>{unit.progress}%</span>
                  )}
                </div>
                <div className="w-full h-1.5 rounded-full bg-[#e2dabf]/50 dark:bg-white/10 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${unit.progress}%`, background: info.color }} />
                </div>
              </motion.button>
            );
          })}
        </section>
      )}

      {/* LEVEL 3 — Lessons of the selected unit */}
      {selectedUnitId && (
        <div className="grid lg:grid-cols-[280px_1fr] gap-5 items-start">
          <aside className="bg-white dark:bg-[#141916] border border-[#e2dabf]/60 dark:border-[#2ecc71]/10 rounded-3xl p-4 shadow-sm sticky top-24 space-y-2 max-h-[calc(100vh-120px)] overflow-y-auto" style={{ ['--dc']: domainInfo.color, ['--dl']: domainInfo.light } as any}>
            <h3 className="font-black text-[#1f1c0b] dark:text-gray-100 mb-3 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#006d37] dark:text-[#2ecc71]" />
              <span>دروس الوحدة ({lessonsForUnit.length})</span>
            </h3>
            {sortedLessonsForUnit.map((lesson, index) => (
              <button
                key={lesson.key}
                onClick={() => { setSelectedLessonKey(lesson.key); setOpenLessonKey(lesson.key); }}
                className={`w-full text-right rounded-2xl px-3 py-3 text-xs leading-6 border transition-all cursor-pointer ${
                  selectedLesson?.key === lesson.key
                    ? 'bg-[var(--dl)] border-[var(--dc)] text-[var(--dc)] dark:text-[var(--dc)] font-extrabold'
                    : 'bg-[#fff9ed]/50 dark:bg-[#1c241f] border-[#e2dabf]/50 dark:border-white/10 text-[#504441] dark:text-gray-300 hover:bg-[var(--dl)]'
                }`}
              >
                <span className="block text-[10px] opacity-70 mb-1">الدرس {index + 1}</span>
                {cleanLessonTitle(lesson.titleAr)}
              </button>
            ))}
          </aside>

          <main className="space-y-0">
            {openLessonKey ? (
              <Suspense fallback={<div className="p-10 text-center text-sm font-bold">تحميل الدرس التفاعلي...</div>}>
                {SINGLE_PATH_LESSONS[openLessonKey] ? (
                  <InteractiveLessonView lessonId={openLessonKey} onClose={() => setOpenLessonKey(null)} />
                ) : (
                  <HtmlLessonViewer lessonKey={openLessonKey} onClose={() => setOpenLessonKey(null)} />
                )}
              </Suspense>
            ) : (
              <div className="p-10 text-center text-sm text-[#506072] bg-white dark:bg-[#141916] rounded-3xl border border-[#e2dabf]/60 dark:border-[#2ecc71]/10">اختر درسا من القائمة</div>
            )}
          </main>
        </div>
      )}
    </div>
  );
}
