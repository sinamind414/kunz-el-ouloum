// UnitIntroPortal.tsx — carte d'ouverture d'unité (audit item 19, sprint 13).
//
// AVANT ce sprint, ce portail affichait TOUJOURS le contenu de l'unité 1
// (activités sur l'ARN), quelle que soit l'unité ouverte, et chargeait des
// photos Unsplash distantes — donc rien du tout hors connexion, alors que
// l'app est conçue pour fonctionner offline sur 3G.
//
// Il rend désormais la carte d'ouverture réelle de l'unité demandée :
// la question centrale, la promesse (un savoir-FAIRE), l'itinéraire, les
// prérequis 2AS, les pièges, le poids mesuré au BAC, et une première action.
// C'est le format « ماذا سندرس في المناعة ؟ » (15:44 — 79 K vues) : aucune
// leçon, seulement de quoi entrer dans l'unité en sachant ce qu'on cherche.

import { AlertTriangle, ArrowLeft, Compass, Flag, ListOrdered, Target, X } from 'lucide-react';
import { motion } from 'motion/react';
import { openingForUnit } from '../data/unitOpenings';

interface UnitIntroPortalProps {
  unitId: number;
  unitTitle: string;
  onStartLesson: () => void;
  onClose: () => void;
}

export default function UnitIntroPortal({
  unitId,
  unitTitle,
  onStartLesson,
  onClose,
}: UnitIntroPortalProps) {
  const opening = openingForUnit(unitId);

  return (
    <div
      className="fixed inset-0 z-50 bg-[#fff9ed] dark:bg-[#0c0f0d] flex flex-col font-sans"
      dir="rtl"
      data-testid="unit-intro-portal"
    >
      <header className="p-4 flex justify-between items-center bg-white/80 dark:bg-[#141916]/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-800/50 z-20">
        <button
          data-testid="portal-fermer"
          onClick={onClose}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors cursor-pointer"
          aria-label="إغلاق"
        >
          <X className="w-6 h-6" />
        </button>
        <span data-testid="portal-unite" className="font-bold text-gray-800 dark:text-gray-200 text-sm">
          {opening ? opening.titleAr : unitTitle}
        </span>
        <span className="w-10 text-center text-xs font-bold text-gray-400">{unitId}</span>
      </header>

      <main className="flex-1 overflow-y-auto pb-28">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="max-w-2xl mx-auto w-full p-4 md:p-8 space-y-5"
        >
          {!opening ? (
            <p data-testid="portal-vide" className="text-base text-[#506072] dark:text-gray-400">
              لا توجد بعد بطاقة افتتاح لهذه الوحدة. ابدأ مباشرة بالأسئلة.
            </p>
          ) : (
            <>
              <section className="space-y-2">
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full text-xs font-bold">
                  <Compass className="w-3.5 h-3.5" />
                  <span>ماذا سندرس في هذه الوحدة؟</span>
                </span>
                <h1
                  data-testid="portal-question"
                  className="text-2xl md:text-4xl font-black text-gray-900 dark:text-white leading-snug"
                >
                  {opening.questionAr}
                </h1>
              </section>

              <section
                data-testid="portal-promesse"
                className="rounded-3xl p-4 bg-white dark:bg-[#141916] border border-[#006d37]/25"
              >
                <p className="flex flex-row-reverse items-center gap-1.5 text-sm font-black text-[#006d37] dark:text-[#2ecc71] mb-1">
                  <Target className="w-4 h-4" />
                  <span>في نهاية الوحدة ستكون قادراً على</span>
                </p>
                <p className="text-[15px] leading-8 text-[#1f1c0b] dark:text-gray-200">{opening.promiseAr}</p>
              </section>

              <section className="rounded-3xl p-4 bg-white dark:bg-[#141916] border border-[#bbcbbb]/30">
                <p className="flex flex-row-reverse items-center gap-1.5 text-sm font-black text-[#1f1c0b] dark:text-gray-100 mb-2">
                  <ListOrdered className="w-4 h-4" />
                  <span>الطريق ({opening.roadmapAr.length} محطات)</span>
                </p>
                <ol data-testid="portal-roadmap" className="space-y-1.5">
                  {opening.roadmapAr.map((etape, i) => (
                    <li
                      key={etape}
                      className="flex flex-row-reverse items-start gap-2 text-sm leading-7 text-[#1f1c0b] dark:text-gray-200"
                    >
                      <span className="shrink-0 w-5 h-5 mt-0.5 rounded-lg bg-[#e8f5ee] dark:bg-black/20 text-[11px] font-bold text-[#006d37] dark:text-[#2ecc71] flex items-center justify-center">
                        {i + 1}
                      </span>
                      <span>{etape}</span>
                    </li>
                  ))}
                </ol>
              </section>

              <section className="rounded-3xl p-4 bg-[#f8fbfa] dark:bg-black/20 border border-[#bbcbbb]/30">
                <p className="text-sm font-black text-[#1f1c0b] dark:text-gray-100 mb-2">
                  ما يجب أن تعرفه قبل البداية
                </p>
                <ul data-testid="portal-prerequis" className="space-y-1">
                  {opening.prerequisAr.map((p) => (
                    <li key={p} className="text-sm leading-7 text-[#506072] dark:text-gray-300">• {p}</li>
                  ))}
                </ul>
              </section>

              <section className="rounded-3xl p-4 bg-rose-50/60 dark:bg-rose-500/10 border border-rose-200/60">
                <p className="flex flex-row-reverse items-center gap-1.5 text-sm font-black text-rose-700 dark:text-rose-400 mb-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span>الأخطاء التي تتكرّر في هذه الوحدة</span>
                </p>
                <ul data-testid="portal-pieges" className="space-y-1">
                  {opening.trapsAr.map((t) => (
                    <li key={t} className="text-sm leading-7 text-rose-700 dark:text-rose-300">⚠️ {t}</li>
                  ))}
                </ul>
              </section>

              {opening.bacWeightPercent !== undefined && (
                <p
                  data-testid="portal-poids"
                  className="text-[13px] text-[#506072] dark:text-gray-400 text-center"
                >
                  وزن هذه الوحدة في الامتحان حسب دراسة الدورات: {opening.bacWeightPercent}٪
                </p>
              )}

              <section
                data-testid="portal-premiere-action"
                className="rounded-3xl p-4 bg-[#fff9ed] dark:bg-black/20 border border-[#d9a400]/40"
              >
                <p className="flex flex-row-reverse items-center gap-1.5 text-sm font-black text-[#8a6a00] dark:text-[#d9a400] mb-1">
                  <Flag className="w-4 h-4" />
                  <span>ابدأ بهذا</span>
                </p>
                <p className="text-[15px] leading-8 text-[#1f1c0b] dark:text-gray-200">{opening.firstActionAr}</p>
              </section>
            </>
          )}
        </motion.div>
      </main>

      <footer className="p-4 bg-white/90 dark:bg-[#141916]/90 backdrop-blur-md border-t border-gray-200/50 dark:border-gray-800/50">
        <button
          data-testid="portal-commencer"
          onClick={onStartLesson}
          className="max-w-2xl mx-auto w-full flex flex-row-reverse items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-[#006d37] hover:bg-[#00592d] text-white text-sm font-bold cursor-pointer transition-colors"
        >
          <span>ادخل إلى الوحدة</span>
          <ArrowLeft className="w-4 h-4" />
        </button>
      </footer>
    </div>
  );
}
