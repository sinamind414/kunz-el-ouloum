// ReviewHubView.tsx — hub « المراجعة » (5e rubrique principale).
//
// Sur le modèle de TrainingHubView.tsx : une seule rubrique principale
// (« المراجعة ») qui ouvre elle-même trois espaces. L'élève choisit le geste
// de consolidation, pas une marque interne.
//
// Objectif unique de CET espace : mémoriser et consolider. Les cartes sont
// déclarées dans src/data/revisionHub.ts (source unique du regroupement).

import { ArrowRight, CalendarDays, Layers, PenTool } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { REVISION_ENTRIES, type RevisionTab } from '../data/revisionHub';

interface ReviewHubViewProps {
  onOpen: (tab: RevisionTab) => void;
  onBackToHome?: () => void;
}

const ICONS: Record<string, LucideIcon> = {
  layers: Layers,
  calendar: CalendarDays,
  penTool: PenTool,
};

export default function ReviewHubView({ onOpen, onBackToHome }: ReviewHubViewProps) {
  return (
    <div className="min-h-screen p-4 md:p-8 max-w-5xl mx-auto" dir="rtl" data-testid="revision-hub">
      {/* RTL : le conteneur est en dir="rtl", donc `flex-row` place le PREMIER
          enfant à droite (début de lecture). */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <span className="w-12 h-12 rounded-2xl bg-gradient-to-l from-[#006d37] to-emerald-600 flex items-center justify-center shadow-md">
            <Layers className="w-6 h-6 text-white" />
          </span>
          <div className="text-right">
            <h1 className="text-2xl md:text-3xl font-black text-[#1f1c0b] dark:text-gray-100">المراجعة</h1>
            <p className="text-sm text-[#506072] dark:text-gray-400">اختر كيف تريد تثبيت ما تعلمته اليوم</p>
          </div>
        </div>
        {onBackToHome && (
          <button
            data-testid="revhub-retour"
            onClick={onBackToHome}
            className="flex flex-row-reverse items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#f3f4f5] dark:bg-[#1f2622] border border-[#bbcbbb]/30 text-sm font-bold text-[#006d37] dark:text-[#2ecc71] cursor-pointer"
          >
            <span>العودة</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {REVISION_ENTRIES.map((e) => {
          const Icon = ICONS[e.icon] ?? Layers;
          return (
            <button
              key={e.tab}
              data-testid={`revhub-${e.tab}`}
              onClick={() => onOpen(e.tab)}
              className="text-right bg-white dark:bg-[#141916] rounded-3xl p-5 border border-[#bbcbbb]/30 dark:border-[#2ecc71]/10 shadow-sm hover:shadow-md hover:border-[#006d37]/40 transition-all cursor-pointer"
            >
              {/* dir="rtl" + flex-row → icône à DROITE du texte, comme dans le
                  menu latéral. */}
              <div className="flex items-start gap-3">
                <span className="shrink-0 w-10 h-10 rounded-2xl bg-[#e8f5ee] dark:bg-black/20 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-[#006d37] dark:text-[#2ecc71]" />
                </span>
                <div className="flex-1">
                  <h2 className="text-base font-black text-[#1f1c0b] dark:text-gray-100 mb-1">{e.titleAr}</h2>
                  <p className="text-[13px] leading-6 text-[#506072] dark:text-gray-400 mb-2">{e.descriptionAr}</p>
                  <span className="inline-block text-[11px] font-bold px-2.5 py-1 rounded-lg bg-[#fff9ed] dark:bg-black/20 text-[#8a6a00] dark:text-[#d9a400]">
                    {e.gestureAr}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
