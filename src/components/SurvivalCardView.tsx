// src/components/SurvivalCardView.tsx
// P1.2 — Rappel actif réel (SpecKit V2 §3.8) :
// carte visible → masquer → production écrite → révéler et comparer.
// Aucune carte brouillon (review=false) ne doit être instanciée ici.

import { useState } from 'react';
import { Eye, EyeOff, CheckCircle2, RotateCcw, Sparkles } from 'lucide-react';
import type { SurvivalCard } from '../types/survivalCard';

interface Props {
  card: SurvivalCard;
  onClose?: () => void;
  onRecallDone?: (cardId: string) => void;
}

export default function SurvivalCardView({ card, onClose, onRecallDone }: Props) {
  const [hidden, setHidden] = useState(false);
  const [produced, setProduced] = useState('');
  const [revealed, setRevealed] = useState(false);

  const handleReveal = () => {
    setRevealed(true);
    onRecallDone?.(card.id);
  };

  const reset = () => {
    setHidden(false);
    setProduced('');
    setRevealed(false);
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white dark:bg-[#141916] rounded-3xl border border-[#e2dabf]/60 dark:border-gray-800 shadow-sm p-5 md:p-7 space-y-4" dir="rtl">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-2.5 rounded-xl bg-[#006d37] text-white">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-black text-lg text-gray-900 dark:text-white">بطاقة نجاة — {card.conceptId}</h3>
            <p className="text-[11px] text-[#506072] dark:text-gray-400">
              مراجعة: {card.review.reviewedBy} · {card.review.sourceProgram}
            </p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-xs font-bold text-[#506072] hover:text-[#006d37] px-3 py-1.5 rounded-lg bg-[#f3f4f5] dark:bg-white/5">إغلاق</button>
        )}
      </div>

      {/* Étape 1 — idée centrale visible */}
      <div className="bg-[#fff9ed] dark:bg-[#1c241f] border border-[#e2dabf]/60 dark:border-amber-900/30 rounded-2xl p-4">
        <div className="text-[11px] font-black text-[#944a00] dark:text-amber-300 mb-1">الفكرة المركزية</div>
        <p className="font-black text-[#1f1c0b] dark:text-white leading-7">{card.coreIdeaAr}</p>
      </div>

      {/* Étape 2 — masquer la chaîne causale + production */}
      {!hidden ? (
        <button
          onClick={() => setHidden(true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#006d37] hover:bg-[#00562b] text-white rounded-xl font-black text-sm shadow-sm cursor-pointer"
        >
          <EyeOff className="w-4 h-4" /> أخفِ السلسلة السببية — أنتجها من الذاكرة
        </button>
      ) : (
        <div className="space-y-3 animate-in fade-in">
          <label className="text-xs font-black text-[#506072] dark:text-gray-300 flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#006d37]" />
            اكتب السلسلة السببية من الذاكرة (3–6 حلقات)
          </label>
          <textarea
            value={produced}
            onChange={(e) => setProduced(e.target.value)}
            rows={4}
            disabled={revealed}
            className="w-full bg-[#f8f9fa] dark:bg-[#0f1411] border border-[#e2dabf]/60 dark:border-gray-800 rounded-2xl p-3 text-sm leading-8 font-medium text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-[#006d37]/20 disabled:opacity-70"
            placeholder="1. … 2. … 3. …"
            dir="rtl"
          />
          {!revealed ? (
            <button
              onClick={handleReveal}
              disabled={produced.trim().length < 10}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#ff9a4a] hover:brightness-105 disabled:opacity-40 text-white rounded-xl font-black text-sm shadow-sm cursor-pointer"
            >
              <Eye className="w-4 h-4" /> أظهر و قارن
            </button>
          ) : (
            <div className="space-y-4 animate-in fade-in">
              <div className="grid md:grid-cols-2 gap-3">
                <div className="bg-[#f8f9fa] dark:bg-black/20 border border-[#e2dabf]/40 dark:border-gray-800 rounded-xl p-3">
                  <div className="font-black mb-1 text-[#006d37] text-xs">السلسلة الصحيحة</div>
                  <ol className="list-decimal list-inside text-[12px] leading-6 text-gray-700 dark:text-gray-200 space-y-1">
                    {card.causalChainAr.map((n, i) => (
                      <li key={i}>{n}</li>
                    ))}
                  </ol>
                </div>
                <div className="bg-[#fff9ed] dark:bg-amber-950/10 border border-[#e2dabf]/40 dark:border-amber-900/30 rounded-xl p-3">
                  <div className="font-black mb-1 text-amber-700 dark:text-amber-300 text-xs">مصيدة شائعة</div>
                  <p className="text-[12px] leading-6 text-amber-900 dark:text-amber-200 font-medium">{card.trapAr}</p>
                </div>
              </div>
              <div className="bg-[#2ecc71]/10 border border-[#2ecc71]/20 rounded-xl p-3 text-[12px] leading-7 font-bold text-[#006d37]">
                مفردات التنقيط ({card.scoringTerms.length}): {card.scoringTerms.join(' • ')}
              </div>
              <div className="flex gap-2">
                <button onClick={reset} className="flex-1 px-4 py-2.5 bg-white dark:bg-[#141916] border border-[#e2dabf] dark:border-gray-800 text-[#506072] dark:text-gray-300 rounded-xl font-bold text-xs cursor-pointer flex items-center justify-center gap-1">
                  <RotateCcw className="w-3.5 h-3.5" /> إعادة المحاولة
                </button>
                {onClose && (
                  <button onClick={onClose} className="flex-1 px-4 py-2.5 bg-[#006d37] hover:bg-[#00562b] text-white rounded-xl font-black text-xs cursor-pointer">
                    رجوع
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
