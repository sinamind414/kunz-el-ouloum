import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { BookOpen, ChevronRight, ArrowRight, CheckCircle2, XCircle, Lightbulb, Target } from 'lucide-react';
import { DOCUMENT_ANALYSIS_EXERCISES, type DocAnalysisExercise } from '../data/documentAnalysisExercises';
import { useSmartValidation } from '../hooks/useSmartValidation';

interface DocumentAnalysisViewProps {
  onBack: () => void;
  onLaunchQuiz?: (unitId: number) => void;
}

const VERB_COLOR: Record<string, string> = {
  حلل: '#006d37',
  فسر: '#0891b2',
  قارن: '#7c3aed',
  صف: '#d97706',
  حدد: '#0e7490',
  'اقترح فرضية': '#e11d48',
  صادق: '#be123c',
  'أنجز مخططا': '#4f46e5',
  'أنجز رسما': '#4f46e5',
  'اكتب نصا علميا': '#059669',
};

export default function DocumentAnalysisView({ onBack }: DocumentAnalysisViewProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeQ, setActiveQ] = useState(0);

  const selected = useMemo(
    () => DOCUMENT_ANALYSIS_EXERCISES.find((e) => e.id === selectedId) || null,
    [selectedId]
  );

  return (
    <div className="w-full max-w-3xl mx-auto" dir="rtl">
      {/* En-tête */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-sm font-bold text-[#506072] dark:text-gray-300 hover:text-[#006d37] transition-colors cursor-pointer"
        >
          <ChevronRight className="w-4 h-4" /> رجوع
        </button>
        <span className="flex items-center gap-1.5 font-black text-sm text-[#059669]">
          <BookOpen className="w-4 h-4" /> تحليل الوثائق — 15 وثيقة نخبة
        </span>
      </div>

      {!selected ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {DOCUMENT_ANALYSIS_EXERCISES.map((ex) => (
            <button
              key={ex.id}
              onClick={() => {
                setSelectedId(ex.id);
                setActiveQ(0);
              }}
              className="text-right rounded-3xl p-4 bg-white dark:bg-[#141916] border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-[0.99] transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-black text-gray-900 dark:text-white text-sm">{ex.doc.descriptionAr}</span>
                <ArrowRight className="w-4 h-4 text-[#059669] shrink-0" />
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400">
                <span className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800">{ex.domain}</span>
                <span className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800">{ex.questions.length} أسئلة</span>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <ExerciseScreen exercise={selected} qIndex={activeQ} setQIndex={setActiveQ} onBackToList={() => setSelectedId(null)} />
      )}
    </div>
  );
}

function ExerciseScreen({
  exercise,
  qIndex,
  setQIndex,
  onBackToList,
}: {
  exercise: DocAnalysisExercise;
  qIndex: number;
  setQIndex: (i: number) => void;
  onBackToList: () => void;
}) {
  const q = exercise.questions[qIndex];
  const { result, submit, reset } = useSmartValidation({ ctx: q.ctx });
  const [answer, setAnswer] = useState('');

  const handleValidate = () => {
    submit(answer);
  };

  const handleNext = () => {
    if (qIndex < exercise.questions.length - 1) {
      setQIndex(qIndex + 1);
      setAnswer('');
      reset();
    } else {
      onBackToList();
      setAnswer('');
      reset();
    }
  };

  return (
    <div className="space-y-4">
      {/* Carte doc */}
      <div className="rounded-3xl bg-white dark:bg-[#141916] border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-[#059669]/10 text-[#059669]">
            {exercise.domain}
          </span>
          <span className="text-[10px] font-bold text-gray-400">{exercise.doc.type}</span>
        </div>
        <p className="text-gray-800 dark:text-gray-200 font-medium leading-7">{exercise.doc.descriptionAr}</p>
        <p className="text-xs text-gray-400 mt-2">{exercise.correctionAr}</p>
      </div>

      {/* Question */}
      <div className="rounded-3xl bg-gradient-to-br from-[#006d37]/5 to-[#059669]/5 border border-[#006d37]/20 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <span
            className="text-[11px] font-black px-2.5 py-1 rounded-lg text-white"
            style={{ background: VERB_COLOR[q.verb] || '#006d37' }}
          >
            {q.verb}
          </span>
          <span className="text-[10px] font-bold text-gray-400">القانون رقم {q.loiFocus}</span>
        </div>
        <p className="text-gray-900 dark:text-white font-bold leading-8">{q.promptAr}</p>
        <p className="text-[11px] text-[#006d37] dark:text-[#2ecc71] mt-2 flex items-center gap-1">
          <Lightbulb className="w-3.5 h-3.5" /> {q.templateHint}
        </p>

        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="اكتب إجابتك العلمية هنا…"
          className="w-full mt-3 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0c0f0d] p-3 text-sm text-gray-800 dark:text-gray-100 leading-7 min-h-[120px] resize-y outline-none focus:border-[#006d37]"
        />

        <div className="flex items-center gap-2 mt-3">
          <button
            onClick={handleValidate}
            className="flex-1 bg-[#006d37] text-white font-black py-2.5 rounded-xl text-sm hover:bg-[#005a2e] transition-colors cursor-pointer"
          >
            صحّح إجابتي
          </button>
          {result && (
            <button
              onClick={handleNext}
              className="flex-1 bg-[#ff9a4a] text-white font-black py-2.5 rounded-xl text-sm hover:brightness-105 transition-all cursor-pointer flex items-center justify-center gap-1"
            >
              {qIndex < exercise.questions.length - 1 ? 'السؤال التالي' : 'القائمة'} <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Résultat */}
      {result && (
        <ResultSheet result={result} />
      )}
    </div>
  );
}

function ResultSheet({ result }: { result: ReturnType<typeof useSmartValidation>['result'] }) {
  if (!result) return null;
  const passed = result.passed;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border p-5 shadow-sm bg-white dark:bg-[#141916] border-gray-200 dark:border-gray-800"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {passed ? (
            <CheckCircle2 className="w-6 h-6 text-[#006d37]" />
          ) : (
            <XCircle className="w-6 h-6 text-[#e11d48]" />
          )}
          <span className="font-black text-gray-900 dark:text-white">
            {result.score}/{result.maxScore} · {passed ? 'مقبول' : 'يحتاج تحسين'}
          </span>
        </div>
        <span className="text-xs font-bold text-[#b45309] dark:text-[#ffd27a]">+{result.xp} XP</span>
      </div>

      {/* Lois cassées */}
      {result.brokenLois.length > 0 && (
        <div className="mb-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 rounded-2xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-4 h-4 text-rose-600" />
            <span className="text-xs font-black text-rose-700 dark:text-rose-300">القوانين التي تحتاج مراجعة</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {result.brokenLois.map((l) => (
              <span key={l} className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300">
                القانون رقم {l}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Messages d'erreur / suggestions */}
      {result.errors.filter((e) => e.severity !== 'hint').length > 0 && (
        <ul className="space-y-1.5 mb-3">
          {result.errors
            .filter((e) => e.severity !== 'hint')
            .map((e, i) => (
              <li key={i} className="text-[12px] leading-6 text-gray-700 dark:text-gray-300 flex items-start gap-2">
                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-[#ff9a4a] shrink-0" />
                {e.messageAr}
              </li>
            ))}
        </ul>
      )}

      {result.suggestions.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1">
          {result.suggestions.map((s, i) => (
            <span key={i} className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border border-amber-100 dark:border-amber-900/40">
              {s}
            </span>
          ))}
        </div>
      )}

      {/* Barème Kunz (obligatoire) */}
      <p className="text-[10px] text-gray-400 leading-5 border-t border-gray-100 dark:border-gray-800 pt-2 mt-1">
        {result.label}
      </p>
    </motion.div>
  );
}
