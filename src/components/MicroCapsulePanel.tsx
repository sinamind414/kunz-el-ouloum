// MicroCapsulePanel.tsx — « فكرة في دقيقة » (audit item 15, sprint 11).
//
// Objet le plus court de l'app : entre la leçon (20-40 min) et la flashcard
// (5 s), il manquait la capsule de 60 secondes — le format qui, chez les
// chaînes de référence, dépasse le cours complet en audience.
//
// Contrat d'interaction :
//   • une seule capsule affichée à la fois (pas de mur de texte) ;
//   • la RÉPONSE de l'auto-test est masquée jusqu'au clic ;
//   • changer de capsule remasque la réponse — impossible de « lire les
//     réponses à la file » sans se poser la question.

import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Timer, Zap } from 'lucide-react';
import {
  capsuleOfTheDay,
  capsulesForUnit,
  todayKey,
  type MicroCapsule,
} from '../data/microCapsules';

interface MicroCapsulePanelProps {
  /** Unité affichée ; si aucune capsule, le panneau ne rend rien. */
  unitId: number;
  /** Injectable pour les tests (capsule du jour déterministe). */
  dayKey?: string;
}

export default function MicroCapsulePanel({ unitId, dayKey }: MicroCapsulePanelProps) {
  const capsules = useMemo(() => capsulesForUnit(unitId), [unitId]);
  const jour = dayKey ?? todayKey();

  // La capsule du jour sert de point d'entrée dans l'unité courante.
  const indexInitial = useMemo(() => {
    if (capsules.length === 0) return 0;
    const duJour = capsuleOfTheDay(jour, capsules);
    return Math.max(0, capsules.findIndex((c) => c.id === duJour.id));
  }, [capsules, jour]);

  const [index, setIndex] = useState(indexInitial);
  const [reponseVisible, setReponseVisible] = useState(false);

  useEffect(() => {
    setIndex(indexInitial);
    setReponseVisible(false);
  }, [indexInitial]);

  if (capsules.length === 0) return null;

  const capsule: MicroCapsule = capsules[Math.min(index, capsules.length - 1)];

  const aller = (delta: number) => {
    setIndex((i) => (i + delta + capsules.length) % capsules.length);
    setReponseVisible(false);
  };

  return (
    <section
      data-testid="capsule-panel"
      dir="rtl"
      className="bg-white dark:bg-[#141916] border border-[#d9a400]/40 dark:border-[#d9a400]/20 p-4 rounded-3xl shadow-sm"
    >
      <div className="flex flex-row-reverse items-center justify-between gap-2 mb-3">
        <div className="flex flex-row-reverse items-center gap-2">
          <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-[#fff7e0] dark:bg-black/20">
            <Zap className="w-4 h-4 text-[#d9a400]" />
          </span>
          <div className="text-right">
            <h3 className="text-sm font-black text-[#1f1c0b] dark:text-gray-100">فكرة في دقيقة</h3>
            <p className="text-[11px] text-[#506072] dark:text-gray-400">
              كبسولة {index + 1} من {capsules.length} في هذه الوحدة
            </p>
          </div>
        </div>
        <span
          data-testid="capsule-duree"
          className="flex flex-row-reverse items-center gap-1 text-[11px] font-bold text-[#506072] dark:text-gray-400 bg-[#f3f4f5] dark:bg-black/20 px-2.5 py-1 rounded-lg"
        >
          <Timer className="w-3.5 h-3.5" />
          {capsule.durationSec} ثانية
        </span>
      </div>

      <h4 data-testid="capsule-question" className="text-base font-black text-[#006d37] dark:text-[#2ecc71] mb-2">
        {capsule.questionAr}
      </h4>

      <p data-testid="capsule-idee" className="text-[15px] leading-8 text-[#1f1c0b] dark:text-gray-200 mb-3">
        {capsule.ideaAr}
      </p>

      <ol data-testid="capsule-etapes" className="mb-3 space-y-1.5">
        {capsule.stepsAr.map((s, i) => (
          <li key={s} className="flex flex-row-reverse items-start gap-2 text-sm leading-7 text-[#1f1c0b] dark:text-gray-200">
            <span className="shrink-0 w-5 h-5 mt-0.5 rounded-lg bg-[#e8f5ee] dark:bg-black/20 text-[11px] font-bold text-[#006d37] dark:text-[#2ecc71] flex items-center justify-center">
              {i + 1}
            </span>
            <span>{s}</span>
          </li>
        ))}
      </ol>

      <p
        data-testid="capsule-erreur"
        className="text-[13px] leading-7 text-rose-700 dark:text-rose-400 bg-rose-50/60 dark:bg-rose-500/10 rounded-2xl px-3 py-2 mb-3"
      >
        ⚠️ الخطأ الذي تقتله هذه الكبسولة: {capsule.errorAr}
      </p>

      <div className="rounded-2xl bg-[#f8fbfa] dark:bg-black/20 p-3 mb-3">
        <p data-testid="capsule-test" className="text-sm font-bold text-[#1f1c0b] dark:text-gray-100 mb-2">
          اختبر نفسك: {capsule.selfTestAr}
        </p>
        {reponseVisible ? (
          <p data-testid="capsule-reponse" className="text-sm leading-7 text-[#006d37] dark:text-[#2ecc71]">
            {capsule.answerAr}
          </p>
        ) : (
          <button
            data-testid="capsule-voir-reponse"
            onClick={() => setReponseVisible(true)}
            className="text-xs font-bold px-3 py-1.5 rounded-xl bg-[#006d37] hover:bg-[#00592d] text-white cursor-pointer transition-colors"
          >
            أظهر الجواب
          </button>
        )}
      </div>

      <div className="flex flex-row-reverse items-center justify-between">
        <button
          data-testid="capsule-precedente"
          onClick={() => aller(-1)}
          className="flex flex-row-reverse items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl bg-[#f3f4f5] dark:bg-[#1f2622] text-[#006d37] dark:text-[#2ecc71] cursor-pointer"
        >
          <ChevronRight className="w-4 h-4" />
          <span>السابقة</span>
        </button>
        <button
          data-testid="capsule-suivante"
          onClick={() => aller(1)}
          className="flex flex-row-reverse items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl bg-[#f3f4f5] dark:bg-[#1f2622] text-[#006d37] dark:text-[#2ecc71] cursor-pointer"
        >
          <span>التالية</span>
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
}
