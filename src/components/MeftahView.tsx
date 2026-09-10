// MeftahView.tsx
// « المفتاح » — مفتاح المنهجية V4.3 : 3 visages méthode + 3 visages application BAC 2025.
// Navigation 3 niveaux : grille des visages → visage (sections) → question BAC.
// Les أفعال détaillés renvoient au composant parent via onOpenVerb (methodologyVerbs.tsx).

import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  KeyRound, ChevronRight, Search, X, AlertTriangle, Sparkles,
  Target, ArrowLeft, BookOpen, Zap, CircleCheck,
} from 'lucide-react';
import {
  MEFTAH_LEVELS,
  MEFTA_BAC_EXERCISES,
  MEFTAH_THINK_ROW,
  MEFTAH_AFTER_CHECK,
  type MeftahLevel,
  type MeftahSection,
  type MeftahBacExercise,
  type MeftahBacQuestion,
} from '../data/meftahManhajia';
import { normalizeArabic } from '../utils/arabicNormalize';

interface Props {
  /** Ouvre le détail d'un réflexe canonique (فعل) dans la méthodologie existante. */
  onOpenVerb?: (verbId: string) => void;
}

type View =
  | { kind: 'home' }
  | { kind: 'level'; levelId: string }
  | { kind: 'bac' }
  | { kind: 'bacQuestion'; exerciseId: string; questionId: string };

const GOLD = '#c08a1f';
const GOLD_D = '#765108';
const TEAL = '#0e6b6b';

const LEVEL_ICONS: Record<string, React.ReactNode> = {
  base: <KeyRound className="w-8 h-8" />,
  plus: <Zap className="w-8 h-8" />,
  plusplus: <BookOpen className="w-8 h-8" />,
  bac: <Target className="w-8 h-8" />,
};

function matches(query: string, ...fields: (string | string[] | undefined)[]): boolean {
  const normQuery = normalizeArabic(query);
  if (!query || !normQuery) return true;
  for (const f of fields) {
    if (Array.isArray(f)) {
      for (const item of f) {
        if (normalizeArabic(item).includes(normQuery)) return true;
      }
    } else if (f && normalizeArabic(f).includes(normQuery)) return true;
  }
  return false;
}

function BackButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1 px-3 py-2 rounded-xl font-bold text-sm bg-white dark:bg-[#141916] border border-gray-200 dark:border-gray-800 text-[#006d37] dark:text-[#2ecc71] hover:bg-gray-50 dark:hover:bg-white/5 transition-all cursor-pointer"
    >
      <ChevronRight className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );
}

function SearchBar({ query, setQuery }: { query: string; setQuery: (q: string) => void }) {
  return (
    <div className="flex-1 min-w-[180px]">
      <div className="flex items-center gap-2 bg-white dark:bg-[#141916] border border-gray-200 dark:border-gray-800 rounded-2xl px-4 py-2.5 shadow-sm">
        <Search className="w-5 h-5 text-gray-400 shrink-0" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ابحث في المفتاح..."
          className="flex-1 bg-transparent outline-none text-sm text-gray-800 dark:text-gray-200 placeholder:text-gray-400 font-medium"
        />
        {query && (
          <button onClick={() => setQuery('')} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}

function SectionCard({ section, onOpenVerb }: { section: MeftahSection; onOpenVerb?: (verbId: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-[#1a201c] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden"
    >
      <div
        className="p-4 md:p-5 cursor-pointer flex items-center justify-between gap-3 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
        onClick={() => setOpen((p) => !p)}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-black text-xs shrink-0" style={{ background: TEAL }}>
            {section.badge}
          </div>
          <div className="min-w-0">
            <div className="text-base font-black text-gray-900 dark:text-white">{section.title}</div>
            {section.introAr && <span className="text-[11px] text-gray-400 line-clamp-1">{section.introAr}</span>}
          </div>
        </div>
        <ChevronRight className={`w-5 h-5 text-gray-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </div>

      {open && (
        <div className="px-4 md:px-5 pb-4 md:pb-5 pt-1 space-y-3">
          {section.introAr && (
            <p className="text-sm text-gray-700 dark:text-gray-300 font-medium leading-7">{section.introAr}</p>
          )}

          {section.bullets && (
            <ul className="space-y-2">
              {section.bullets.map((b, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CircleCheck className="w-4 h-4 text-[#006d37] shrink-0 mt-1" />
                  <p className="text-sm text-gray-700 dark:text-gray-300 font-medium leading-7">{b}</p>
                </li>
              ))}
            </ul>
          )}

          {section.table && (
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
              <table className="w-full text-xs md:text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-black/20 text-gray-600 dark:text-gray-300">
                    <th className="p-2.5 text-right font-black" style={{ color: GOLD_D }}>
                      {section.id === 'phrasing' ? 'الدليل يسمح بـ' : 'الفعل'}
                    </th>
                    <th className="p-2.5 text-right font-black">الحركة</th>
                    {section.table.some((r) => r.mistakeAr) && <th className="p-2.5 text-right font-black text-rose-600 dark:text-rose-400">لا أفعل / الخطأ</th>}
                  </tr>
                </thead>
                <tbody>
                  {section.table.map((row, i) => (
                    <tr key={i} className="border-t border-gray-100 dark:border-gray-800">
                      <td className="p-2.5 font-black text-center" style={{ color: GOLD_D }}>
                        {row.verbAr}
                        {row.linkedVerbId && onOpenVerb && (
                          <button
                            onClick={() => onOpenVerb(row.linkedVerbId!)}
                            className="block mx-auto mt-1 px-2 py-0.5 rounded-full bg-[#c08a1f]/10 text-[9px] font-black hover:bg-[#c08a1f]/20 transition-colors cursor-pointer"
                            style={{ color: GOLD_D }}
                          >
                            افتح الفعل ↗
                          </button>
                        )}
                      </td>
                      <td className="p-2.5 text-gray-700 dark:text-gray-300 font-medium leading-6">{row.moveAr}</td>
                      {section.table!.some((r) => r.mistakeAr) && (
                        <td className="p-2.5 text-rose-700 dark:text-rose-300 font-medium leading-6 bg-rose-50/60 dark:bg-rose-950/10">
                          {row.mistakeAr || '—'}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {section.goldAr && (
            <div className="rounded-xl border border-[#ebd6a0] bg-[#fff8e8] dark:bg-[#3a2c14]/30 dark:border-[#c08a1f]/30 p-3">
              <div className="text-[10px] font-black mb-1 flex items-center gap-1" style={{ color: GOLD_D }}>
                <Sparkles className="w-3.5 h-3.5" /> قاعدة ذهبية
              </div>
              <p className="text-sm leading-7 font-medium" style={{ color: GOLD_D }}>{section.goldAr}</p>
            </div>
          )}

          {section.warnAr && (
            <div className="rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50 dark:bg-rose-950/20 p-3">
              <div className="text-[10px] font-black text-rose-600 dark:text-rose-400 mb-1 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> فاصل إلزامي
              </div>
              <p className="text-sm text-rose-800 dark:text-rose-200 font-medium leading-7">{section.warnAr}</p>
            </div>
          )}

          {section.linkedVerbId && onOpenVerb && (
            <button
              onClick={() => onOpenVerb(section.linkedVerbId!)}
              className="px-4 py-2 rounded-xl bg-[#006d37] text-white text-xs font-black cursor-pointer hover:bg-[#00562b] transition-colors"
            >
              جرّب هذا الفعل في التدريب ←
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
}

function BacQuestionCard({ question, onOpenVerb }: { question: MeftahBacQuestion; onOpenVerb?: (verbId: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-[#1a201c] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden"
      data-testid={`meftah-bac-question-${question.id}`}
    >
      <div
        data-testid={`${question.id}-header`}
        className="p-4 md:p-5 cursor-pointer flex items-start justify-between gap-3 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
        onClick={() => setOpen((p) => !p)}
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 mb-1">
            <span className="px-2 py-0.5 rounded-full bg-[#c08a1f] text-white text-[9px] font-black">{question.pointsLabel}</span>
            {question.tags.map((t) => (
              <span key={t} className="px-2 py-0.5 rounded-full bg-[#0e6b6b]/10 text-[#0e6b6b] dark:text-[#5eead4] text-[9px] font-black border border-[#0e6b6b]/20">{t}</span>
            ))}
          </div>
          <h4 className="font-black text-gray-900 dark:text-white text-sm md:text-base leading-7">{question.instructionAr}</h4>
        </div>
        <ChevronRight className={`w-5 h-5 text-gray-400 shrink-0 mt-1 transition-transform ${open ? 'rotate-180' : ''}`} />
      </div>

      {open && (
        <div className="px-4 md:px-5 pb-4 md:pb-5 space-y-3">
          <div className="rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-gray-800 p-3">
            <div className="text-[10px] font-black text-gray-500 dark:text-gray-400 mb-1">ما أفكر (30 ثانية صامتة)</div>
            <p className="text-xs md:text-sm text-gray-700 dark:text-gray-300 font-medium leading-7">{question.thinkAr}</p>
          </div>

          <div className="rounded-xl border-r-4 border-[#0e6b6b] bg-[#eaf5f4]/60 dark:bg-[#0e6b6b]/10 p-3">
            <div className="text-[10px] font-black text-[#0e6b6b] dark:text-[#5eead4] mb-1">ما أكتب</div>
            <ul className="space-y-2">
              {question.writeAr.map((w, i) => (
                <li key={i} className="text-xs md:text-sm text-gray-800 dark:text-gray-200 font-medium leading-7">• {w}</li>
              ))}
            </ul>
          </div>

          {question.trapAr && (
            <div className="rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50 dark:bg-rose-950/20 p-3">
              <div className="text-[10px] font-black text-rose-600 dark:text-rose-400 mb-1 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> الفخ
              </div>
              <p className="text-xs md:text-sm text-rose-800 dark:text-rose-200 font-medium leading-7">{question.trapAr}</p>
            </div>
          )}

          {question.linkedVerbId && onOpenVerb && (
            <button
              onClick={() => onOpenVerb(question.linkedVerbId!)}
              className="px-4 py-2 rounded-xl bg-[#006d37] text-white text-xs font-black cursor-pointer hover:bg-[#00562b] transition-colors"
            >
              تدرب على الفعل المناسب ←
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
}

function BacExerciseView({ exercise, onOpenVerb, onBack }: {
  exercise: MeftahBacExercise;
  onOpenVerb?: (verbId: string) => void;
  onBack: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <BackButton onClick={onBack} label="الرجوع إلى المفتاح" />
      </div>

      <div className="rounded-2xl border border-[#ebd6a0] bg-gradient-to-br from-[#fff8e8] to-white dark:from-[#3a2c14]/20 dark:to-[#141916] dark:border-[#c08a1f]/30 p-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="text-[10px] font-black" style={{ color: GOLD_D }}>بكالوريا 2025 · الموضوع الأول</div>
            <h3 className="text-lg font-black text-gray-900 dark:text-white mt-0.5">{exercise.titleAr}</h3>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">{exercise.subjectAr} · {exercise.pointsLabel}</p>
          </div>
          <span className="px-3 py-1.5 rounded-full bg-[#c08a1f] text-white text-[11px] font-black">تطبيق</span>
        </div>
        <div className="mt-3 rounded-xl bg-white/80 dark:bg-black/20 border border-[#ebd6a0]/60 dark:border-[#c08a1f]/20 p-3">
          <div className="text-[10px] font-black mb-1" style={{ color: GOLD_D }}>القفل</div>
          <p className="text-sm font-medium text-gray-800 dark:text-gray-200 leading-7">{exercise.lockAr}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        {MEFTAH_THINK_ROW.map((step) => (
          <div key={step.title} className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#141916] p-3">
            <div className="text-xs font-black" style={{ color: GOLD_D }}>{step.title}</div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium leading-6 mt-1">{step.desc}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {exercise.questions.map((q) => (
          <BacQuestionCard key={q.id} question={q} onOpenVerb={onOpenVerb} />
        ))}
      </div>

      <div className="rounded-2xl border border-[#0e6b6b]/30 bg-[#eaf5f4]/60 dark:bg-[#0e6b6b]/10 p-4">
        <div className="text-xs font-black text-[#0e6b6b] dark:text-[#5eead4] mb-2">بعد التمرين — مراجعة 10 ثوان</div>
        <div className="flex flex-wrap gap-2">
          {MEFTAH_AFTER_CHECK.map((c) => (
            <span key={c} className="px-2.5 py-1 rounded-full bg-white dark:bg-black/20 border border-[#0e6b6b]/20 text-[10px] font-black text-[#0e6b6b] dark:text-[#5eead4]">{c}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function MeftahView({ onOpenVerb }: Props) {
  const [view, setView] = useState<View>({ kind: 'home' });
  const [query, setQuery] = useState('');

  const goHome = () => {
    setView({ kind: 'home' });
    setQuery('');
  };

  const filteredLevels = useMemo(
    () =>
      MEFTAH_LEVELS.filter((lvl) =>
        matches(query, lvl.title, lvl.subtitle, lvl.fr, lvl.prerequisiteAr, lvl.tenSecondsAr, lvl.sections.flatMap((s) => [s.title, ...(s.bullets ?? []), ...(s.table ?? []).flatMap((r) => [r.verbAr, r.moveAr, r.mistakeAr])]))
      ),
    [query]
  );

  const filteredExercises = useMemo(
    () =>
      MEFTA_BAC_EXERCISES.filter((ex) =>
        matches(query, ex.titleAr, ex.subjectAr, ex.lockAr, ex.questions.flatMap((q) => [q.instructionAr, q.thinkAr, ...q.writeAr, ...(q.trapAr ? [q.trapAr] : [])]))
      ),
    [query]
  );

  const activeLevel: MeftahLevel | null =
    view.kind === 'level' ? MEFTAH_LEVELS.find((l) => l.id === view.levelId) ?? null : null;

  const activeExercise: MeftahBacExercise | null =
    view.kind === 'bacQuestion' ? MEFTA_BAC_EXERCISES.find((e) => e.id === view.exerciseId) ?? null : null;

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6 pb-24" dir="rtl" data-testid="meftah-view">
      {/* Hero */}
      <div className="mb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl text-white shadow-sm border" style={{ background: `linear-gradient(135deg, ${GOLD}, ${GOLD_D})`, borderColor: '#ebd6a0' }}>
            <KeyRound className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">المفتاح</h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mt-0.5">
              مفتاح المنهجية · 4 أسنان · بابان · تحليل دون تفسير
            </p>
          </div>
        </div>
      </div>

      {view.kind !== 'home' && (
        <div className="flex items-center gap-3 flex-wrap mb-4">
          <BackButton
            onClick={() => (view.kind === 'level' || view.kind === 'bac') ? goHome() : setView({ kind: 'bac' })}
            label={view.kind === 'bacQuestion' ? 'الرجوع إلى التمارين' : 'الرجوع إلى المفتاح'}
          />
          {view.kind !== 'bacQuestion' && <SearchBar query={query} setQuery={setQuery} />}
        </div>
      )}

      {/* ═══ Accueil : 3 visages méthode + 1 application BAC ═══ */}
      {view.kind === 'home' && (
        <div className="space-y-5" data-testid="meftah-home">
          <div className="rounded-2xl border border-[#ebd6a0] bg-[#fff8e8] dark:bg-[#3a2c14]/20 dark:border-[#c08a1f]/30 p-4">
            <p className="text-sm font-medium text-[#765108] dark:text-[#ffd27a] leading-7">
              لا تحفظ 4 وصفات؛ أتعلم 4 حركات. ابدأ بالوجه الأول من اليوم الأول، ثم تدرّج.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {filteredLevels.map((lvl, idx) => (
              <motion.button
                key={lvl.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => { setView({ kind: 'level', levelId: lvl.id }); setQuery(''); }}
                className="text-right rounded-3xl bg-white dark:bg-[#141916] border border-gray-200 dark:border-gray-800 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] transition-all cursor-pointer"
                style={{ borderTop: `4px solid ${GOLD}` }}
                data-testid={`meftah-level-${lvl.id}`}
              >
                <div className="w-14 h-14 rounded-2xl text-white flex items-center justify-center shadow-sm mb-3" style={{ background: `linear-gradient(135deg, ${GOLD}, ${GOLD_D})` }}>
                  {LEVEL_ICONS[lvl.id]}
                </div>
                <div className="text-lg font-black text-gray-900 dark:text-white">{lvl.title}</div>
                <div className="text-[11px] font-bold text-[#c08a1f] dark:text-[#ffd27a] mt-1">{lvl.prerequisiteAr}</div>
                <p className="text-xs text-gray-600 dark:text-gray-300 font-medium leading-6 mt-2">{lvl.subtitle}</p>
                <span className="text-[10px] text-gray-400 mt-2 block">{lvl.fr}</span>
                <span className="inline-flex items-center gap-1 text-xs font-extrabold mt-3" style={{ color: GOLD }}>
                  افتح الوجه <ArrowLeft className="w-3.5 h-3.5" />
                </span>
              </motion.button>
            ))}

            {/* Carte application BAC 2025 */}
            <motion.button
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: filteredLevels.length * 0.05 }}
              onClick={() => { setView({ kind: 'bac' }); setQuery(''); }}
              className="md:col-span-3 text-right rounded-3xl bg-gradient-to-br from-[#fff8e8] via-white to-white dark:from-[#3a2c14]/20 dark:via-[#141916] dark:to-[#141916] border-2 border-[#c08a1f]/50 dark:border-[#c08a1f]/30 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] transition-all cursor-pointer ring-1 ring-[#c08a1f]/20"
              data-testid="meftah-level-bac"
            >
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl text-white flex items-center justify-center shadow-sm" style={{ background: `linear-gradient(135deg, ${GOLD}, ${GOLD_D})` }}>
                    {LEVEL_ICONS.bac}
                  </div>
                  <div>
                    <div className="inline-flex items-center rounded-full bg-[#c08a1f]/10 text-[#765108] dark:text-[#ffd27a] px-2.5 py-1 text-[10px] font-black mb-1 border border-[#c08a1f]/20">
                      تطبيق على موضوع رسمي
                    </div>
                    <div className="text-lg font-black text-gray-900 dark:text-white">المفتاح · تطبيق BAC 2025</div>
                    <div className="text-[11px] font-bold text-[#c08a1f] dark:text-[#ffd27a] mt-0.5">التمارين الثلاثة · 5 + 7 + 8 ن</div>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 text-sm font-extrabold" style={{ color: GOLD }}>
                  كيف يستعمل التلميذ الأسنان على ورقة الامتحان <ArrowLeft className="w-4 h-4" />
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-300 font-medium leading-6 mt-3">
                لكل تعليمة: ما أفكر (السن المناسب) → ما أكتب (الجواب وفق عناصر الإجابة الرسمية) → الفخ الذي يضيّع النقاط.
              </p>
            </motion.button>
          </div>

          {(query && filteredLevels.length === 0 && filteredExercises.length === 0) && (
            <p className="text-sm text-gray-400 font-medium text-center p-4">لا توجد نتائج مطابقة في المفتاح.</p>
          )}
        </div>
      )}

      {/* ═══ Visage méthode (sections accordéon) ═══ */}
      {view.kind === 'level' && activeLevel && (
        <div className="space-y-4" data-testid={`meftah-level-view-${activeLevel.id}`}>
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#141916] p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl text-white flex items-center justify-center shrink-0" style={{ background: `linear-gradient(135deg, ${GOLD}, ${GOLD_D})` }}>
                {LEVEL_ICONS[activeLevel.id]}
              </div>
              <div>
                <h2 className="text-xl font-black text-gray-900 dark:text-white">{activeLevel.title}</h2>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 font-bold mt-0.5">{activeLevel.prerequisiteAr} · {activeLevel.fr}</p>
              </div>
            </div>
          </div>

          {(() => {
            const sections = activeLevel.sections.filter((s) =>
              matches(query, s.title, s.introAr, ...(s.bullets ?? []), ...(s.table ?? []).flatMap((r) => [r.verbAr, r.moveAr, r.mistakeAr]))
            );
            if (sections.length === 0) return <p className="text-sm text-gray-400 font-medium p-2">لا توجد نتائج مطابقة.</p>;
            return sections.map((s) => <SectionCard key={s.id} section={s} onOpenVerb={onOpenVerb} />);
          })()}

          <div className="rounded-2xl border border-[#c08a1f]/40 bg-[#fff8e8] dark:bg-[#3a2c14]/20 p-4">
            <div className="text-xs font-black mb-1" style={{ color: GOLD_D }}>المفتاح في 10 ثوانٍ</div>
            <p className="text-sm font-bold text-gray-800 dark:text-gray-200 leading-7">{activeLevel.tenSecondsAr}</p>
          </div>
        </div>
      )}

      {/* ═══ Grille des 3 exercices BAC ═══ */}
      {view.kind === 'bac' && (
        <div className="space-y-4" data-testid="meftah-bac-home">
          <div className="rounded-2xl border border-[#c08a1f]/40 bg-[#fff8e8] dark:bg-[#3a2c14]/20 p-4">
            <div className="text-xs font-black mb-1" style={{ color: GOLD_D }}>قبل أي كتابة · 30 ثانية صامتة</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
              {MEFTAH_THINK_ROW.map((s) => (
                <div key={s.title} className="rounded-xl bg-white/80 dark:bg-black/20 border border-[#ebd6a0]/60 dark:border-[#c08a1f]/20 p-3">
                  <div className="text-xs font-black" style={{ color: GOLD_D }}>{s.title}</div>
                  <p className="text-[11px] text-gray-600 dark:text-gray-300 font-medium leading-6 mt-1">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {filteredExercises.length === 0 && query ? (
            <p className="text-sm text-gray-400 font-medium p-2">لا توجد نتائج مطابقة.</p>
          ) : (
            filteredExercises.map((ex) => (
              <motion.button
                key={ex.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => { setView({ kind: 'bacQuestion', exerciseId: ex.id, questionId: '' }); setQuery(''); }}
                className="w-full text-right rounded-3xl bg-white dark:bg-[#141916] border border-gray-200 dark:border-gray-800 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-[0.99] transition-all cursor-pointer"
                style={{ borderTop: `4px solid ${GOLD}` }}
                data-testid={`meftah-bac-exercise-${ex.id}`}
              >
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-full bg-[#c08a1f] text-white text-[10px] font-black">{ex.pointsLabel}</span>
                      <h3 className="font-black text-gray-900 dark:text-white">{ex.titleAr}</h3>
                    </div>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 font-bold mt-1">{ex.subjectAr}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-300 font-medium leading-6 mt-2 line-clamp-2">🔒 {ex.lockAr}</p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-sm font-extrabold shrink-0" style={{ color: GOLD }}>
                    افتح التمرين <ArrowLeft className="w-4 h-4" />
                  </span>
                </div>
              </motion.button>
            ))
          )}
        </div>
      )}

      {/* ═══ Détail d'un exercice BAC ═══ */}
      {view.kind === 'bacQuestion' && activeExercise && (
        <BacExerciseView
          exercise={activeExercise}
          onOpenVerb={onOpenVerb}
          onBack={() => setView({ kind: 'bac' })}
        />
      )}
    </div>
  );
}
