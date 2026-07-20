import { useState } from 'react';
import { CheckCircle2, Clock, RotateCcw } from 'lucide-react';
import { getSpacedRecallPrompt } from '../data/spacedRecallPrompts';
import { DAY_MS, type RecallItem } from '../data/store';
import { recordSpacedRecallAttempt, type SpacedRecallOutcome } from '../services/spacedRecallService';

interface SpacedRecallCardProps {
  recall: RecallItem;
  onUpdated: () => void;
}

export default function SpacedRecallCard({ recall, onUpdated }: SpacedRecallCardProps) {
  const prompt = getSpacedRecallPrompt(recall.conceptId, recall.stage);
  const [answer, setAnswer] = useState('');
  const [outcome, setOutcome] = useState<SpacedRecallOutcome | null>(null);

  if (!prompt) return null;

  const submit = () => {
    if (answer.trim().length < 8) return;
    const result = recordSpacedRecallAttempt({ recall, prompt, answer });
    setOutcome(result);
    onUpdated();
  };

  const nextDays = outcome && !outcome.recall.completedAt
    ? Math.max(1, Math.round((outcome.recall.nextReviewAt - Date.now()) / DAY_MS))
    : null;

  return (
    <article className="rounded-2xl border border-amber-200 dark:border-amber-900/40 bg-amber-50 dark:bg-amber-950/20 p-3 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs font-black text-amber-800 dark:text-amber-300">
          <Clock className="w-4 h-4" /> {recall.conceptId}
        </div>
        <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400">J+{[1, 3, 7, 14][recall.stage]}</span>
      </div>

      <p className="text-sm font-bold leading-7 text-gray-900 dark:text-white">{prompt.questionAr}</p>
      <textarea
        value={answer}
        onChange={(event) => { setAnswer(event.target.value); setOutcome(null); }}
        rows={3}
        dir="rtl"
        placeholder="اكتب جوابك من الذاكرة…"
        className="w-full rounded-xl border border-amber-200 dark:border-amber-900/40 bg-white dark:bg-[#0c0f0d] p-3 text-sm leading-7 focus:outline-none focus:ring-2 focus:ring-amber-400/30"
      />

      {!outcome && (
        <button
          onClick={submit}
          disabled={answer.trim().length < 8}
          className="w-full rounded-xl bg-[#006d37] py-2.5 text-sm font-black text-white disabled:opacity-40 cursor-pointer"
        >
          تحقّق من التذكّر
        </button>
      )}

      {outcome && (
        <div className={`rounded-xl border p-3 text-xs font-bold leading-6 ${outcome.passed ? 'border-green-200 bg-green-50 text-green-800 dark:border-green-900/40 dark:bg-green-950/20 dark:text-green-300' : 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-300'}`}>
          <div className="flex items-center gap-2">
            {outcome.passed ? <CheckCircle2 className="w-4 h-4" /> : <RotateCcw className="w-4 h-4" />}
            <span>{outcome.passed ? 'تذكّر صحيح ومثبت بدليل.' : 'الإجابة غير كافية؛ عاد التذكير إلى J+1.'}</span>
          </div>
          <span className="block mt-1">{outcome.score} / 100</span>
          {outcome.recall.completedAt
            ? <span className="block mt-1">اكتملت دورة J+14.</span>
            : nextDays != null && <span className="block mt-1">المراجعة التالية بعد {nextDays} يوم.</span>}
          {!outcome.passed && (
            <span className="block mt-1">العناصر المنتظرة: {prompt.acceptedEvidence.join('، ')}</span>
          )}
        </div>
      )}
    </article>
  );
}
