import { useEffect, useMemo, useState, lazy, Suspense } from 'react';
import { motion } from 'motion/react';
import { BookOpen, Layers, Dna, Zap, Globe2, ChevronRight, Sparkles, ChevronLeft } from 'lucide-react';
import { Unit } from '../types';
import { LESSON_LIBRARY, LessonLibraryItem } from '../lessonData';
import { SINGLE_PATH_LESSONS } from '../data/singlePathLessons';
import SvtConceptsView from './SvtConceptsView';

const InteractiveLessonView = lazy(() => import('./InteractiveLessonView'));
const HtmlLessonViewer = lazy(() => import('./HtmlLessonViewer'));

interface LessonsViewProps {
  units: Unit[];
  onStartLesson: (lessonId: string) => void;
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

export default function LessonsView({ units, onStartLesson }: LessonsViewProps) {
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
  const [showSvt, setShowSvt] = useState(false);

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
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6 pb-24 font-sans" dir="rtl">
      <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-1">الدروس</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        درس تفاعلي بدون تمرير: كلمة مفتاحية → مثال → اختبار → منهجية
      </p>

      {/* Breadcrumb navigation (visible uniquement à l'intérieur d'un domaine) */}
      {(selectedDomain || showSvt) && (
        <nav className="flex items-center gap-2 flex-wrap text-sm mb-4">
          <button
            onClick={() => { backToDomains(); setShowSvt(false); }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer text-[#006d37] dark:text-[#2ecc71] hover:bg-[#fed65b]/15"
          >
            <ChevronRight className="w-4 h-4" />
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
      )}

      {/* LEVEL 1 — Grille d'icônes rondes : 3 domaines + Concepts SVT */}
      {!selectedDomain && !showSvt && (
        <>
          <section className="grid grid-cols-2 gap-3">
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
                  className="flex flex-col items-center text-center gap-3 rounded-3xl p-6 shadow-sm border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#141916] hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] transition-all cursor-pointer"
                >
                  <span
                    className="w-20 h-20 rounded-full flex items-center justify-center text-white shadow-md"
                    style={{ background: `linear-gradient(135deg, ${info.color}, ${info.color}cc)` }}
                  >
                    <Icon className="w-9 h-9" />
                  </span>
                  <div>
                    <h3 className="text-base font-black text-[#1f1c0b] dark:text-gray-100 leading-snug">{domain.name}</h3>
                    <p className="text-[11px] text-[#506072] dark:text-gray-400 mt-1">{info.fr}</p>
                  </div>
                  <span className="text-[11px] font-bold text-gray-400">
                    {unitCount} وحدة · {chapterCount} درس
                  </span>
                </motion.button>
              );
            })}

            {/* 4e icône — Concepts SVT */}
            <motion.button
              key="svt-concepts"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: domains.length * 0.06 }}
              onClick={() => setShowSvt(true)}
              className="flex flex-col items-center text-center gap-3 rounded-3xl p-6 shadow-sm border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#141916] hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] transition-all cursor-pointer"
            >
              <span
                className="w-20 h-20 rounded-full flex items-center justify-center text-white shadow-md"
                style={{ background: 'linear-gradient(135deg, #0284c7, #0284c7cc)' }}
              >
                <BookOpen className="w-9 h-9" />
              </span>
              <div>
                <h3 className="text-base font-black text-[#1f1c0b] dark:text-gray-100 leading-snug">مكتبة المصطلحات</h3>
                <p className="text-[11px] text-[#506072] dark:text-gray-400 mt-1">Concepts SVT — مفاهيم علمية</p>
              </div>
              <span className="text-[11px] font-bold text-gray-400">استكشف المفاهيم</span>
            </motion.button>
          </section>

          {/* Raccourci — Leçons actives "Mot par Mot" */}
          <div className="mt-5 p-5 bg-gradient-to-br from-emerald-900/40 to-slate-800 border border-emerald-700/50 rounded-2xl">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <h3 className="font-black text-emerald-400 text-base">دروس تفاعلية جديدة (Mot par Mot)</h3>
            </div>
            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={() => onStartLesson('d1-u1-l2-transcription')}
                className="flex items-center justify-between p-4 bg-slate-900/60 rounded-xl hover:bg-slate-900 transition-colors text-right group"
              >
                <div>
                  <span className="block font-bold text-white">الاستنساخ وتدخل الإنزيم</span>
                  <span className="text-xs text-slate-400">المجال 1 - الوحدة 1</span>
                </div>
                <ChevronLeft className="w-5 h-5 text-slate-500 group-hover:text-emerald-400 transition-colors" />
              </button>
              <button
                onClick={() => onStartLesson('d1-u1-l3-traduction')}
                className="flex items-center justify-between p-4 bg-slate-900/60 rounded-xl hover:bg-slate-900 transition-colors text-right group"
              >
                <div>
                  <span className="block font-bold text-white">الترجمة والشفرة الوراثية</span>
                  <span className="text-xs text-slate-400">المجال 1 - الوحدة 1</span>
                </div>
                <ChevronLeft className="w-5 h-5 text-slate-500 group-hover:text-emerald-400 transition-colors" />
              </button>
            </div>
          </div>
        </>
      )}

      {/* LEVEL 1b — Concepts SVT library */}
      {!selectedDomain && showSvt && (
        <section>
          <SvtConceptsView />
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
