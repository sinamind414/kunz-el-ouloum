// WritingReviewPanel.tsx — « ما كتبته أنا » : relecture de la production
// personnelle de l'élève (sprint 27).
//
// Un élève qui a rédigé dix réponses dans l'atelier n'a aucun moyen de les
// revoir ensemble, ni de savoir ce qu'il rate systématiquement. Ce panneau
// affiche son profil d'erreurs — « tu oublies la conclusion dans 4 réponses
// sur 5 » — puis la liste de ses brouillons, les plus incomplets d'abord,
// chacun rouvrable en un clic.

import { AlertTriangle, FileText, RotateCcw } from 'lucide-react';
import type { BacExerciseIdea } from '../data/bacSessionIndex';
import { reviewDrafts, writingReport } from '../data/writingReview';

interface Props {
  onOpen: (idea: BacExerciseIdea) => void;
}

export default function WritingReviewPanel({ onOpen }: Props) {
  const rapport = writingReport();
  const revues = reviewDrafts();
  if (rapport.reponses === 0) return null;

  return (
    <section
      data-testid="writing-review"
      dir="rtl"
      className="rounded-3xl p-4 bg-white dark:bg-[#141916] border border-[#006d37]/30 mb-4"
    >
      <h2 className="flex flex-row-reverse items-center gap-2 text-sm font-black text-[#1f1c0b] dark:text-gray-100 mb-1">
        <FileText className="w-4 h-4" />
        ما كتبته أنا
      </h2>
      <p data-testid="review-bilan" className="text-[12px] text-[#506072] dark:text-gray-400 text-right mb-3">
        {rapport.reponses} جواباً على {rapport.exercices} تمريناً · {rapport.motsEcrits} كلمة ·
        متطلبات الشكل المحقّقة: {rapport.satisfaits} / {rapport.total}
      </p>

      {rapport.points.length > 0 && (
        <div data-testid="review-profil" className="rounded-2xl p-3 bg-[#fff9ed] dark:bg-black/20 mb-3">
          <p className="flex flex-row-reverse items-center gap-2 text-[11px] font-black text-[#8a6a00] dark:text-[#d9a400] mb-1">
            <AlertTriangle className="w-4 h-4" />
            ما تنساه غالباً
          </p>
          <ul className="space-y-1">
            {rapport.points.slice(0, 5).map((p) => (
              <li
                key={p.checkId}
                data-testid={`review-point-${p.checkId}`}
                className="text-[12px] leading-6 text-[#1f1c0b] dark:text-gray-200 text-right"
              >
                <span className="font-bold">{p.labelAr}</span> — {p.echecs} من {p.occasions} أجوبة ·{' '}
                <span className="text-[#506072] dark:text-gray-400">{p.hintAr}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <ul className="space-y-2">
        {revues.map((r) => (
          <li
            key={`${r.ideaId}.${r.familyId}`}
            data-testid={`review-draft-${r.ideaId}-${r.familyId}`}
            className="rounded-2xl p-3 bg-[#f8fbfa] dark:bg-black/20 border border-[#bbcbbb]/30"
          >
            <div className="flex flex-row-reverse items-start justify-between gap-2 mb-1">
              <p className="text-[12px] font-black text-[#1f1c0b] dark:text-gray-100 text-right">
                {r.idea ? `${r.idea.year} · ${r.idea.titleAr}` : r.ideaId} — {r.familleAr}
              </p>
              <span
                className={`shrink-0 text-[11px] font-bold px-2 py-0.5 rounded-lg ${
                  r.manquants.length === 0
                    ? 'bg-[#e8f5ee] text-[#006d37] dark:bg-black/20 dark:text-[#2ecc71]'
                    : 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400'
                }`}
              >
                {r.satisfaits} / {r.total}
              </span>
            </div>
            <p className="text-[12px] leading-6 text-[#506072] dark:text-gray-300 text-right mb-1">
              {r.extrait}
            </p>
            {r.manquants.length > 0 && (
              <p className="text-[11px] text-rose-700 dark:text-rose-400 text-right mb-1">
                ينقص: {r.manquants.map((m) => m.labelAr).join(' · ')}
              </p>
            )}
            {r.alertes.length > 0 && (
              <p className="text-[11px] text-amber-800 dark:text-amber-300 text-right mb-1">
                ⚠︎ {r.alertes.map((a) => a.labelAr).join(' · ')}
              </p>
            )}
            {r.idea && (
              <button
                data-testid={`review-reprendre-${r.ideaId}-${r.familyId}`}
                onClick={() => onOpen(r.idea!)}
                className="flex flex-row-reverse items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-xl bg-[#006d37] text-white cursor-pointer"
              >
                <span>أعد الكتابة</span>
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
