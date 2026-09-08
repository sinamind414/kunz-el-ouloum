// LessonsView.tsx
// Onglet الدروس restructuré en deux modes :
//   1) درس نشيط (Leçon Active)  : leçons TS interactives « mot par mot » (ACTIVE_LESSONS).
//   2) درس سلبي  (Leçon Passive) : les 23 leçons HTML officielles, organisées en
//      3 domaines du BAC → unités → chapitres (ordre canonique OFFICIAL_PROGRAM_SEQUENCE).
import { useState } from 'react';
import { BookOpen, ChevronLeft, Zap, MonitorPlay, Network, FlaskConical, Leaf, Globe2 } from 'lucide-react';
import HtmlLessonViewer from './HtmlLessonViewer';
import ActiveLessonView from './ActiveLessonView';
import { INITIAL_UNITS } from '../data';
import { getUnitLessonSequence } from '../data/unitLessonSequences';
import {
  PASSIVE_DOMAINS,
  hasHtmlFile,
  getActiveLessonKeysForUnit,
  getActiveLessonTitle,
  getPassiveLessonTitle,
  getUnitTitle,
  type LessonMode,
} from '../data/lessonModes';

const DOMAIN_ICONS = [FlaskConical, Leaf, Globe2];

const nextActiveInUnit = (unitId: number, currentKey: string): string | undefined => {
  const keys = getActiveLessonKeysForUnit(unitId);
  const idx = keys.indexOf(currentKey);
  return idx >= 0 && idx < keys.length - 1 ? keys[idx + 1] : undefined;
};

const nextPassiveInUnit = (unitId: number, currentKey: string): string | undefined => {
  const keys = getUnitLessonSequence(unitId).filter(hasHtmlFile);
  const idx = keys.indexOf(currentKey);
  return idx >= 0 && idx < keys.length - 1 ? keys[idx + 1] : undefined;
};

const firstActiveLessonOfNextUnit = (unitId: number): { unitId: number; key: string } | undefined => {
  const next = INITIAL_UNITS.find((u) => u.id > unitId);
  if (!next) return undefined;
  const first = getActiveLessonKeysForUnit(next.id)[0];
  return first ? { unitId: next.id, key: first } : firstActiveLessonOfNextUnit(next.id);
};

const unitOfActiveLesson = (key: string): number =>
  INITIAL_UNITS.find((u) => getActiveLessonKeysForUnit(u.id).includes(key))?.id ?? 1;

export default function LessonsView() {
  const [mode, setMode] = useState<LessonMode | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<number>(1);
  const [selectedDomain, setSelectedDomain] = useState<number | null>(null);
  const [selectedActiveLesson, setSelectedActiveLesson] = useState<string | null>(null);
  const [selectedPassiveLesson, setSelectedPassiveLesson] = useState<string | null>(null);

  // ----- Rendu d'une leçon ouverte -----
  if (selectedActiveLesson) {
    const inUnitNext = nextActiveInUnit(selectedUnit, selectedActiveLesson);
    const crossUnitNext = firstActiveLessonOfNextUnit(selectedUnit);
    const nextKey = inUnitNext ?? crossUnitNext?.key;
    const nextUnit = inUnitNext ? selectedUnit : crossUnitNext?.unitId;
    return (
      <ActiveLessonView
        lessonKey={selectedActiveLesson}
        onBack={() => { setSelectedActiveLesson(null); setSelectedUnit(unitOfActiveLesson(selectedActiveLesson)); }}
        onNext={nextKey && nextUnit ? () => { setSelectedUnit(nextUnit); setSelectedActiveLesson(nextKey); } : undefined}
        nextTitleAr={nextKey ? getActiveLessonTitle(nextKey) : undefined}
      />
    );
  }

  if (selectedPassiveLesson) {
    const nextKey = nextPassiveInUnit(selectedUnit, selectedPassiveLesson);
    return (
      <HtmlLessonViewer
        lessonKey={selectedPassiveLesson}
        onBack={() => setSelectedPassiveLesson(null)}
        onNext={nextKey ? () => setSelectedPassiveLesson(nextKey) : undefined}
        nextTitleAr={nextKey ? getPassiveLessonTitle(nextKey) : undefined}
      />
    );
  }

  // ----- Écran 1 : les deux icônes (Leçon Active / Leçon Passive) -----
  if (mode === null) {
    return (
      <div dir="rtl" className="space-y-5">
        <div className="bg-gradient-to-l from-[#006d37] via-[#008744] to-[#10b981] text-white p-5 md:p-6 rounded-3xl shadow-lg">
          <div className="flex items-center gap-2 text-xs font-bold bg-white/20 backdrop-blur-md px-3 py-1 rounded-full inline-block mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            <span>دروس السنة الثالثة ثانوي — علوم الطبيعة والحياة</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black">📚 قائمة الدروس</h1>
          <p className="text-white/90 text-sm mt-1 font-medium">
            اختر نوع الدرس : نشيط (تفاعلي خطوة بخطوة) أو سلبي (الدروس المقروءة)
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Leçon Active */}
          <button
            onClick={() => { setMode('active'); setSelectedDomain(null); }}
            className="group p-6 rounded-3xl border-2 border-emerald-200 dark:border-emerald-900/50 bg-gradient-to-b from-emerald-50 to-white dark:from-emerald-950/30 dark:to-[#161c18] hover:border-emerald-500 hover:shadow-lg transition-all text-center space-y-3"
          >
            <span className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#006d37] text-white shadow-md group-hover:scale-105 transition-transform">
              <Zap className="w-8 h-8" />
            </span>
            <span className="block text-lg font-black text-gray-800 dark:text-gray-100">الدرس النشيط</span>
            <span className="block text-xs font-bold text-gray-500 dark:text-gray-400 leading-relaxed">
              تعلّم تفاعلي « كلمة بكلمة » : مهمة، وثائق، محاكاة ومنهجية — مع تصحيح فوري لكل إنتاج
            </span>
          </button>

          {/* Leçon Passive */}
          <button
            onClick={() => { setMode('passive'); setSelectedDomain(null); }}
            className="group p-6 rounded-3xl border-2 border-teal-200 dark:border-teal-900/50 bg-gradient-to-b from-teal-50 to-white dark:from-teal-950/30 dark:to-[#161c18] hover:border-teal-500 hover:shadow-lg transition-all text-center space-y-3"
          >
            <span className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#0e6b6b] text-white shadow-md group-hover:scale-105 transition-transform">
              <MonitorPlay className="w-8 h-8" />
            </span>
            <span className="block text-lg font-black text-gray-800 dark:text-gray-100">الدرس السلبي</span>
            <span className="block text-xs font-bold text-gray-500 dark:text-gray-400 leading-relaxed">
              الدروس المقروءة الرسمية (23 درساً) — ثلاثة مجالات، كل مجال بوحداته وفصوله
            </span>
          </button>
        </div>
      </div>
    );
  }

  // ----- Écran 2a : Leçon Active — liste des unités avec leurs leçons actives -----
  if (mode === 'active') {
    const activeUnits = INITIAL_UNITS.filter((u) => getActiveLessonKeysForUnit(u.id).length > 0);
    return (
      <div dir="rtl" className="space-y-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMode(null)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
          >
            <span>→</span>
            <span>عودة</span>
          </button>
          <h2 className="text-xl font-black flex items-center gap-2">
            <Zap className="w-5 h-5 text-[#006d37]" />
            الدرس النشيط — تعلّم خطوة بخطوة
          </h2>
        </div>

        {activeUnits.length === 0 && (
          <p className="text-sm font-bold text-gray-500 dark:text-gray-400 text-center py-6">
            لا توجد دروس نشيطة بعد.
          </p>
        )}

        <div className="space-y-5">
          {activeUnits.map((u) => {
            const keys = getActiveLessonKeysForUnit(u.id);
            return (
              <section key={u.id} className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#161c18] overflow-hidden">
                <header className="bg-gradient-to-l from-[#006d37]/10 to-[#10b981]/10 dark:from-emerald-950/40 dark:to-teal-950/40 px-4 py-3 border-b border-gray-200 dark:border-gray-800">
                  <h3 className="text-sm font-black text-[#006d37] dark:text-emerald-300">{getUnitTitle(u.id)}</h3>
                  <p className="text-[11px] font-bold text-gray-500 mt-0.5">{u.description}</p>
                </header>
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                  {keys.map((key, i) => (
                    <button
                      key={key}
                      onClick={() => { setSelectedUnit(u.id); setSelectedActiveLesson(key); }}
                      className="group p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#161c18] hover:border-emerald-400 hover:shadow-md transition-all text-right flex items-center gap-3"
                    >
                      <span className="shrink-0 w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-[#006d37] dark:text-emerald-300 font-black flex items-center justify-center text-sm">
                        {i + 1}
                      </span>
                      <span className="flex-1 text-sm font-bold text-gray-800 dark:text-gray-100 leading-snug">
                        {getActiveLessonTitle(key)}
                      </span>
                      <ChevronLeft className="w-4 h-4 text-gray-300 group-hover:text-emerald-500 transition-all shrink-0" />
                    </button>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    );
  }

  // ----- Écran 2b : Leçon Passive — trois icônes de domaines -----
  if (mode === 'passive' && selectedDomain === null) {
    return (
      <div dir="rtl" className="space-y-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMode(null)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
          >
            <span>→</span>
            <span>عودة</span>
          </button>
          <h2 className="text-xl font-black flex items-center gap-2">
            <MonitorPlay className="w-5 h-5 text-[#0e6b6b]" />
            الدرس السلبي — اختر المجال
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PASSIVE_DOMAINS.map((d, i) => {
            const Icon = DOMAIN_ICONS[i] ?? Network;
            const chapters = d.unitIds.reduce(
              (acc, uid) => acc + getUnitLessonSequence(uid).filter(hasHtmlFile).length,
              0
            );
            return (
              <button
                key={d.id}
                onClick={() => setSelectedDomain(d.id)}
                className="group p-6 rounded-3xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-[#161c18] hover:border-teal-500 hover:shadow-lg transition-all text-center space-y-3"
              >
                <span className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#0e6b6b] text-white shadow-md group-hover:scale-105 transition-transform">
                  <Icon className="w-8 h-8" />
                </span>
                <span className="block text-lg font-black text-gray-800 dark:text-gray-100">
                  {d.emoji} {d.titleAr}
                </span>
                <span className="block text-xs font-bold text-gray-500 dark:text-gray-400">
                  {d.unitIds.length} وحدات · {chapters} فصلاً
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ----- Écran 3 : Leçon Passive — unités du domaine, chacune avec ses chapitres -----
  const domain = PASSIVE_DOMAINS.find((d) => d.id === selectedDomain);
  return (
    <div dir="rtl" className="space-y-5">
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={() => setSelectedDomain(null)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
        >
          <span>→</span>
          <span>عودة إلى المجالات</span>
        </button>
        <h2 className="text-xl font-black">
          {domain?.emoji} {domain?.titleAr}
        </h2>
      </div>

      <div className="space-y-5">
        {domain?.unitIds.map((uid) => {
          const unit = INITIAL_UNITS.find((u) => u.id === uid);
          const chapters = getUnitLessonSequence(uid).filter(hasHtmlFile);
          return (
            <section key={uid} className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#161c18] overflow-hidden">
              <header className="bg-gradient-to-l from-[#0e6b6b]/10 to-[#10b981]/10 dark:from-teal-950/40 dark:to-emerald-950/40 px-4 py-3 border-b border-gray-200 dark:border-gray-800">
                <h3 className="text-sm font-black text-[#0e6b6b] dark:text-teal-300">{getUnitTitle(uid)}</h3>
                <p className="text-[11px] font-bold text-gray-500 mt-0.5">{unit?.description}</p>
              </header>
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                {chapters.length === 0 && (
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400 col-span-2 text-center py-4">
                    لا توجد فصول في هذه الوحدة بعد.
                  </p>
                )}
                {chapters.map((key, i) => (
                  <button
                    key={key}
                    onClick={() => { setSelectedUnit(uid); setSelectedPassiveLesson(key); }}
                    className="group p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#161c18] hover:border-teal-400 hover:shadow-md transition-all text-right flex items-center gap-3"
                  >
                    <span className="shrink-0 w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-[#0e6b6b] dark:text-teal-300 font-black flex items-center justify-center text-sm">
                      {i + 1}
                    </span>
                    <span className="flex-1 text-sm font-bold text-gray-800 dark:text-gray-100 leading-snug">
                      {getPassiveLessonTitle(key)}
                    </span>
                    <ChevronLeft className="w-4 h-4 text-gray-300 group-hover:text-teal-500 transition-all shrink-0" />
                  </button>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
