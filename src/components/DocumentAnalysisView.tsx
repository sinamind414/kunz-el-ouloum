import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { BookOpen, ChevronRight, ArrowRight, CheckCircle2, XCircle, Lightbulb, Target, Search } from 'lucide-react';
import { DOCUMENT_ANALYSIS_EXERCISES, type DocAnalysisExercise } from '../data/documentAnalysisExercises';
import { getDocumentPracticeContext } from '../data/documentPracticeContexts';
import { useSmartValidation } from '../hooks/useSmartValidation';
import { recordDocumentTrace } from '../services/documentEvidenceService';

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

const MAX_HINTS = 2;

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
  const [hintsShown, setHintsShown] = useState(0);
  const [recorded, setRecorded] = useState<boolean | null>(null);

  // Contexte de pratique documentaire (objectif, vocabulaire, preuve attendue).
  const practice = useMemo(
    () => getDocumentPracticeContext(exercise.id, q.id),
    [exercise.id, q.id]
  );

  const handleValidate = () => {
    if (answer.trim().length < 2) return;
    const r = submit(answer);
    // Validation de la trace documentaire réelle (preuve + vocabulaire).
    const outcome = recordDocumentTrace({ context: practice!, answer, validationResult: r });
    setRecorded(outcome.evidence != null);
  };

  const handleNext = () => {
    if (qIndex < exercise.questions.length - 1) {
      setQIndex(qIndex + 1);
      setAnswer('');
      reset();
      setHintsShown(0);
      setRecorded(null);
    } else {
      onBackToList();
      setAnswer('');
      reset();
      setHintsShown(0);
      setRecorded(null);
    }
  };

  const showHint = () => setHintsShown((h) => Math.min(MAX_HINTS, h + 1));

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
      </div>

      {/* Question + contexte de pratique */}
      <div className="rounded-3xl bg-gradient-to-br from-[#006d37]/5 to-[#059669]/5 border border-[#006d37]/20 p-5 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <span
            className="text-[11px] font-black px-2.5 py-1 rounded-lg text-white"
            style={{ background: VERB_COLOR[q.verb] || '#006d37' }}
          >
            {q.verb}
          </span>
          <span className="text-[10px] font-bold text-gray-400">القانون رقم {q.loiFocus}</span>
        </div>
        <p className="text-gray-900 dark:text-white font-bold leading-8">{q.promptAr}</p>

        {/* Objectif + preuve attendue visibles AVANT la production (Speckit §4). */}
        {practice && (
          <div className="bg-[#fff9ed] dark:bg-[#1c241f] border border-[#e2dabf]/60 dark:border-amber-900/30 rounded-2xl p-3 space-y-2">
            <div className="text-[11px] font-black text-[#944a00] dark:text-amber-300 flex items-center gap-1">
              <Target className="w-3.5 h-3.5" /> هدف الوثيقة
            </div>
            <p className="text-[12px] font-bold text-[#1f1c0b] dark:text-white leading-6">{practice.goalAr}</p>
            <div className="text-[11px] font-black text-[#006d37] dark:text-[#2ecc71] flex items-center gap-1">
              <Search className="w-3.5 h-3.5" /> ابحث عن
            </div>
            <div className="flex flex-wrap gap-1">
              {practice.expectedEvidence.map((e, i) => (
                <span key={i} className="text-[10px] font-bold bg-[#2ecc71]/15 text-[#006d37] px-2 py-0.5 rounded-full">
                  {e}
                </span>
              ))}
            </div>
          </div>
        )}

        <p className="text-[11px] text-[#006d37] dark:text-[#2ecc71] flex items-center gap-1">
          <Lightbulb className="w-3.5 h-3.5" /> {q.templateHint}
        </p>

        {/* Indices progressifs (max 2) */}
        {hintsShown > 0 && practice && (
          <div className="space-y-1">
            {hintsShown >= 1 && (
              <p className="text-[11px] bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-lg px-3 py-2 text-amber-800 dark:text-amber-200 font-medium">
                💡 تلميح 1 — مفردات مفتاحية: {practice.vocabulary.slice(0, 3).join(' · ')}
              </p>
            )}
            {hintsShown >= 2 && (
              <p className="text-[11px] bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-lg px-3 py-2 text-amber-800 dark:text-amber-200 font-medium">
                💡 تلميح 2 — {practice.trapAr ?? 'ركّز على العلاقة بين المتغيرات.'}
              </p>
            )}
          </div>
        )}
        {hintsShown < MAX_HINTS && !result && (
          <button
            onClick={showHint}
            className="text-[11px] font-bold text-[#944a00] dark:text-amber-300 hover:underline cursor-pointer"
          >
            عرض تلميح ({hintsShown}/{MAX_HINTS})
          </button>
        )}

        <textarea
          value={answer}
          onChange={(e) => { setAnswer(e.target.value); setRecorded(null); }}
          placeholder="اكتب إجابتك العلمية هنا…"
          className="w-full mt-1 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0c0f0d] p-3 text-sm text-gray-800 dark:text-gray-100 leading-7 min-h-[120px] resize-y outline-none focus:border-[#006d37]"
        />

        <div className="flex items-center gap-2 mt-3">
          <button
            onClick={handleValidate}
            disabled={answer.trim().length < 2}
            className="flex-1 bg-[#006d37] text-white font-black py-2.5 rounded-xl text-sm hover:bg-[#005a2e] transition-colors disabled:opacity-40 cursor-pointer"
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

      {/* Résultat — correction modèle masquée jusqu'à la tentative */}
      {result && (
        <ResultSheet result={result} correctionAr={exercise.correctionAr} recorded={recorded} />
      )}
    </div>
  );
}

function ResultSheet({
  result,
  correctionAr,
  recorded,
}: {
  result: ReturnType<typeof useSmartValidation>['result'];
  correctionAr: string;
  recorded: boolean | null;
}) {
  if (!result) return null;
  const passed = result.passed;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border p-5 shadow-sm bg-white dark:bg-[#141916] border-gray-200 dark:border-gray-800 space-y-3"
    >
      <div className="flex items-center justify-between mb-2">
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

      {/* Preuve documentaire réellement enregistrée (jamais par clic). */}
      {recorded != null && (
        <div className={`text-[11px] font-bold p-2 rounded-lg ${recorded ? 'bg-[#2ecc71]/10 text-[#006d37]' : 'bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-300'}`}>
          {recorded ? '✅ تم تسجيل دليل وثيقة حقيقي لتقدّمك.' : '⚠️ تم تسجيل نقطة تحتاج إلى مراجعة (وثيقة).'}
        </div>
      )}

      {result.brokenLois.length > 0 && (
        <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 rounded-2xl p-3">
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

      {result.errors.filter((e) => e.severity !== 'hint').length > 0 && (
        <ul className="space-y-1.5">
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

      {/* Correction modèle — visible UNIQUEMENT après tentative. */}
      <div className="bg-white dark:bg-black/20 border border-emerald-200/50 dark:border-emerald-900/30 rounded-xl px-3 py-2 text-[12px] font-bold text-emerald-800 dark:text-emerald-300">
        <span className="font-black">التصحيح:</span> {correctionAr}
      </div>

      <p className="text-[10px] text-gray-400 leading-5 border-t border-gray-100 dark:border-gray-800 pt-2 mt-1">
        {result.label}
      </p>
    </motion.div>
  );
}
