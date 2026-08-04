// src/components/MissionBanner.tsx
// V3 US-V3-01 / §4.2 — Écran mission court et repliable (aucun corrigé visible).
import { useState } from 'react';
import { Target, ChevronDown, BookOpen, Clock } from 'lucide-react';
import type { LessonGoldSummary } from '../data/lessonGoldSummaries';

interface MissionBannerProps {
  summary: LessonGoldSummary;
  estimatedMinutes: number;
}

export default function MissionBanner({ summary, estimatedMinutes }: MissionBannerProps) {
  const [open, setOpen] = useState(false);
  const statusLabel =
    summary.status === 'manuel_officiel_verifie'
      ? 'مصدر موثّق'
      : summary.status === 'a_valider_enseignant'
      ? 'بانتظار مراجعة أستاذ'
      : 'شرح Kunz';

  return (
    <div className="mx-4 mt-3 rounded-2xl bg-white dark:bg-[#141916] border border-[#e2dabf]/60 shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2 p-3 text-right cursor-pointer"
      >
        <Target className="w-5 h-5 text-[#006d37] dark:text-[#2ecc71] shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-bold text-[#944a00] dark:text-amber-300">🎯 المهمة</div>
          <div className="text-sm font-black text-[#1f1c0b] dark:text-white truncate">{summary.missionAr}</div>
        </div>
        <span className="text-[10px] text-[#506072] dark:text-gray-400 flex items-center gap-1 shrink-0">
          <Clock className="w-3.5 h-3.5" /> ~{estimatedMinutes} د
        </span>
        <ChevronDown className={`w-4 h-4 text-[#506072] transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="px-3 pb-3 space-y-2 border-t border-[#e2dabf]/40">
          <div className="flex items-center gap-2 text-[10px] text-[#506072] dark:text-gray-400 pt-2">
            <BookOpen className="w-3.5 h-3.5" /> {statusLabel}
            {summary.vocabulary.length > 0 && <span>• {summary.vocabulary.length} كلمات مفتاحية</span>}
          </div>
          <p className="text-xs text-[#1f1c0b] dark:text-gray-200 leading-6">
            🔬 {summary.evidenceAr}
          </p>
          {/* Structure BAC repliable : visible seulement sur action explicite. */}
          {summary.bacSentenceFrameAr && (
            <p className="text-[11px] text-[#006d37] dark:text-[#2ecc71] bg-[#f3f8f4] dark:bg-[#10231a] rounded-lg px-2 py-1.5">
              🧩 بنية إجابة BAC : {summary.bacSentenceFrameAr}
            </p>
          )}
          <p className="text-[11px] text-rose-500 font-bold">⚠️ {summary.commonErrorAr}</p>
        </div>
      )}
    </div>
  );
}
