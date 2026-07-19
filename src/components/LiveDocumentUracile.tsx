// src/components/LiveDocumentUracile.tsx
// V3 US-V3-02 — Document vivant uracile marqué (observation avant interprétation).
// Ordre immuable : type → objectif → verbe → donnée → observation → production.
// Deux indices maximum ; correction masquée avant tentative.

import { useState } from 'react';
import { Lightbulb, Eye, Pencil, HelpCircle } from 'lucide-react';
import { getDocumentPracticeContextByExercise } from '../data/documentPracticeContexts';

interface LiveDocumentUracileProps {
  onEvidence?: (passed: boolean) => void;
  onOpenMicroRemediation?: (remediationId: string) => void;
}

export default function LiveDocumentUracile({ onEvidence, onOpenMicroRemediation }: LiveDocumentUracileProps) {
  const ctx = getDocumentPracticeContextByExercise('uracile_marque');
  const [answer, setAnswer] = useState('');
  const [attempted, setAttempted] = useState(false);
  const [hintIndex, setHintIndex] = useState(0);
  const [passed, setPassed] = useState(false);

  if (!ctx) return null;

  const handleValidate = () => {
    if (answer.trim().length < 8) return;
    // Validation simple et honnête : présence des preuves attendues clés.
    const hasNucleus = answer.includes('النواة');
    const hasHyalo = answer.includes('الهيولى');
    const hasArnm = answer.includes('ARNm') || answer.includes('اليوراسيل');
    const ok = hasNucleus && hasHyalo && hasArnm;
    setAttempted(true);
    setPassed(ok);
    onEvidence?.(ok);
  };

  return (
    <div className="p-4 bg-[#fff9ed] dark:bg-[#1c241f] border border-[#e2dabf]/60 rounded-2xl shadow-sm space-y-3">
      <div className="flex items-center gap-2">
        <Eye className="w-5 h-5 text-[#006d37]" />
        <span className="text-xs font-black bg-[#006d37] text-white px-2.5 py-1 rounded-full">وثيقة حية</span>
        <span className="text-xs font-bold text-[#944a00] dark:text-amber-300">{ctx.documentTypeAr}</span>
      </div>

      <p className="text-sm leading-8 text-[#1f1c0b] dark:text-gray-100">{ctx.goalAr}</p>

      {/* Objectif + verbe (visibles) */}
      <div className="text-xs text-[#506072] dark:text-gray-400">
        🔬 {ctx.promptObserveAr}
      </div>

      {/* Observation demandée avant conclusion */}
      <div className="rounded-xl bg-white dark:bg-black/20 border border-amber-200/50 dark:border-amber-900/30 p-3 text-sm leading-7">
        <span className="font-black">لاحظ :</span> بعد مدة قصيرة يظهر الوسم في النواة. بعد مدة أطول يظهر في الهيولى.
      </div>

      <textarea
        value={answer}
        onChange={(e) => { setAnswer(e.target.value); setAttempted(false); setPassed(false); }}
        rows={4}
        placeholder="فسّر مسار ظهور الوسم (نواة → هيولى) وما يدل عليه..."
        className="w-full p-3 rounded-2xl border border-[#e2dabf]/60 bg-white dark:bg-[#0c0f0d] text-sm leading-8 text-right focus:outline-none focus:ring-2 focus:ring-[#006d37]/20"
        dir="rtl"
      />

      {/* Deux indices maximum, sur demande */}
      <div className="flex flex-wrap gap-2">
        {hintIndex < (ctx.hintsAr?.length ?? 0) && (
          <button
            onClick={() => setHintIndex((i) => i + 1)}
            className="text-[11px] bg-[#006d37]/10 border border-[#006d37]/20 text-[#006d37] dark:text-[#2ecc71] px-2 py-1 rounded-full flex items-center gap-1 cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5" /> indice {hintIndex + 1}
          </button>
        )}
        {ctx.hintsAr?.slice(0, hintIndex).map((h, i) => (
          <span key={i} className="text-[11px] bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-900/40 px-2 py-1 rounded-full flex items-center gap-1">
            <Lightbulb className="w-3 h-3" /> {h}
          </span>
        ))}
      </div>

      {!attempted && (
        <button
          onClick={handleValidate}
          disabled={answer.trim().length < 8}
          className="w-full py-2.5 rounded-xl bg-[#006d37] hover:bg-[#00562b] disabled:opacity-40 text-white font-black text-sm shadow-sm cursor-pointer"
        >
          صحّح بالمصحح الحقيقي
        </button>
      )}

      {attempted && (
        <div className="space-y-3 animate-in fade-in">
          <div className={`p-3 rounded-xl text-[12px] leading-7 font-bold border ${passed ? 'bg-[#2ecc71]/10 text-[#006d37] border-[#2ecc71]/20' : 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/20 dark:text-amber-200 dark:border-amber-900/40'}`}>
            {passed
              ? '✅ أحسنت، ربطت الملاحظة بآلية علمية. تم تسجيل دليل حقيقي.'
              : '⚠️ أضف الملاحظة من الوثيقة واربطها بآلية علمية (نواة → هيولى عبر ARNm).'}
          </div>

          {/* Correction visible UNIQUEMENT après tentative. */}
          {ctx.correctionAr && (
            <div className="bg-white dark:bg-black/20 border border-amber-200/50 dark:border-amber-900/30 rounded-xl px-3 py-2 text-[12px] font-bold text-amber-800 dark:text-amber-300">
              <span className="font-black">التصحيح:</span> {ctx.correctionAr}
            </div>
          )}

          {!passed && (
            <button
              onClick={() => onOpenMicroRemediation?.('mr_arnm_vs_adn')}
              className="w-full py-2.5 rounded-xl bg-[#ffb347] hover:bg-[#ff9a4a] text-white font-black text-sm shadow-sm cursor-pointer flex items-center justify-center gap-2"
            >
              <Pencil className="w-4 h-4" /> ثبّت هذه الفكرة (ميكرو-تصحيح)
            </button>
          )}
        </div>
      )}
    </div>
  );
}
