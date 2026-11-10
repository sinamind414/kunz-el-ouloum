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
// Étage 3 / R2 : priorité CALCULÉE sur les 65 idées BAC, pour TOUTE unité.
// Les 🔴/🟡/🟢 des schémas sont des légendes d'image, pas des priorités.
import { phrasePrioriteAr, prioritePourUnite } from '../data/prioritesBac';
// Les DEUX poids d'une unité (audit externe « claude 5.2 ») : le poids ANNONCÉ
// (répartition du programme, mesuré aux sprints précédents) et la part
// CONSTATÉE (points réellement portés par l'unité dans les 65 exercices BAC
// indexés). Les deux sont vrais, à des niveaux différents : on les affiche
// côte à côte plutôt que d'en corriger un par l'autre.
import { observedUnitSharePercent } from '../data/bacSessionIndex';
// Notions que l'élève a ratées (constat automatique, pas déclaration).
import { notionsDominantes } from '../utils/profilErreurs';

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
  // `null` pour une unité inexistante : aucune étiquette inventée.
  const priorite = prioritePourUnite(unitId);
  // Part CONSTATÉE de l'unité dans les points des 65 exercices BAC indexés
  // (mesurée par le dépôt, pas estimée) — arrondie à une décimale.
  const observe = observedUnitSharePercent()[unitId];
  const partObservee = typeof observe === 'number' ? Math.round(observe * 10) / 10 : undefined;
  // Notions que l'élève a lui-même ratées dans cette unité (fait, pas hypothèse).
  const notionsRatees = notionsDominantes(6).filter((n) => n.uniteId === unitId);

  return (
    <div
      /* ZONE SÛRE (APK Android 15+) : portail plein écran → on réserve la
         barre d'état (haut) et la barre de navigation système (bas). */
      className="fixed inset-0 z-50 bg-[#fff9ed] dark:bg-[#0c0f0d] flex flex-col font-sans pt-[var(--pfe-safe-top)] pb-[var(--pfe-safe-bottom)]"
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
        {priorite && (
          <p
            data-testid="portal-priorite"
            className="mx-auto mt-3 w-[calc(100%-2rem)] max-w-2xl rounded-2xl bg-[#e5f6ed] px-3 py-2 text-center text-[11px] font-bold text-[#006d37] dark:bg-[#0f2a1c] dark:text-emerald-300"
          >
            {phrasePrioriteAr(priorite)}
          </p>
        )}
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
                <p className="flex items-center gap-1.5 text-sm font-black text-[#006d37] dark:text-[#2ecc71] mb-1">
                  <Target className="w-4 h-4" />
                  <span>في نهاية الوحدة ستكون قادراً على</span>
                </p>
                <p className="text-[15px] leading-8 text-[#1f1c0b] dark:text-gray-200">{opening.promiseAr}</p>
              </section>

              <section className="rounded-3xl p-4 bg-white dark:bg-[#141916] border border-[#bbcbbb]/30">
                <p className="flex items-center gap-1.5 text-sm font-black text-[#1f1c0b] dark:text-gray-100 mb-2">
                  <ListOrdered className="w-4 h-4" />
                  <span>الطريق ({opening.roadmapAr.length} محطات)</span>
                </p>
                <ol data-testid="portal-roadmap" className="space-y-1.5">
                  {opening.roadmapAr.map((etape, i) => (
                    <li
                      key={etape}
                      className="flex items-start gap-2 text-sm leading-7 text-[#1f1c0b] dark:text-gray-200"
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
                <p className="flex items-center gap-1.5 text-sm font-black text-rose-700 dark:text-rose-400 mb-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span>الأخطاء التي تتكرّر في هذه الوحدة</span>
                </p>
                <ul data-testid="portal-pieges" className="space-y-1">
                  {opening.trapsAr.map((t) => (
                    <li key={t} className="text-sm leading-7 text-rose-700 dark:text-rose-300">⚠️ {t}</li>
                  ))}
                </ul>
              </section>

              {/* NOTIONS QUE L'ÉLÈVE A RATÉES DANS CETTE UNITÉ (audit externe
                  « claude 5.2 », axe 3). Ces notions sont un FAIT : chaque QCM
                  porte la notion qu'il interroge (le titre de sa figure) et
                  l'application enregistre celle qu'il a ratée — sans attendre
                  la déclaration de l'élève. Rien n'est inventé : si l'élève n'a
                  rien raté dans cette unité, la section n'apparaît pas. */}
              {notionsRatees.length > 0 && (
                <section
                  data-testid="portal-notions-ratees"
                  className="rounded-3xl p-4 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60"
                >
                  <p className="text-sm font-black text-amber-800 dark:text-amber-300 mb-2">
                    ما الذي تعثّرت فيه في هذه الوحدة (من أسئلتك أنت)
                  </p>
                  <ul className="space-y-1">
                    {notionsRatees.map((n) => (
                      <li
                        key={n.notion}
                        className="text-sm leading-7 text-amber-800 dark:text-amber-200"
                      >
                        • {n.notion} — {n.occurrences} مرة
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* LES DEUX POIDS (audit externe « claude 5.2 », axe 2).
                  Le poids ANNONCÉ vient de la répartition du programme
                  (unités 1 à 7 mesurées ; 8 à 11 non mesurées — on n'invente
                  pas un chiffre). La part CONSTATÉE est calculée par le dépôt
                  lui-même (`observedUnitSharePercent`) sur les 65 exercices BAC
                  indexés : elle existe pour les 11 unités.
                  L'élève voit ainsi l'écart au lieu d'un chiffre unique. */}
              {(opening.bacWeightPercent !== undefined || partObservee !== undefined) && (
                <div
                  data-testid="portal-poids"
                  className="text-[13px] text-[#506072] dark:text-gray-400 text-center leading-7"
                >
                  {opening.bacWeightPercent !== undefined && (
                    <p>
                      وزن هذه الوحدة في الامتحان حسب دراسة الدورات: {opening.bacWeightPercent}٪
                    </p>
                  )}
                  {partObservee !== undefined && (
                    <p data-testid="portal-poids-observe">
                      حصّتها من نقاط المواضيع المفهرسة (مقاس): {partObservee}٪
                    </p>
                  )}
                </div>
              )}

              <section
                data-testid="portal-premiere-action"
                className="rounded-3xl p-4 bg-[#fff9ed] dark:bg-black/20 border border-[#d9a400]/40"
              >
                <p className="flex items-center gap-1.5 text-sm font-black text-[#8a6a00] dark:text-[#d9a400] mb-1">
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
