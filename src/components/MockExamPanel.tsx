// MockExamPanel.tsx — « موضوع تجريبي » composé d'exercices réellement tombés
// (sprint 41).
//
// Trois exercices 5/7/8 points, trois unités et trois sessions différentes,
// tirés du corpus officiel. Le numéro du sujet est affiché et modifiable :
// un professeur peut dire « faites le sujet 12 » et toute la classe obtient
// exactement le même, sur n'importe quel appareil.
//
// Chaque exercice s'ouvre dans l'atelier d'écriture : l'élève y retrouve les
// supports réels, les consignes réelles et le contrôle de forme.

import { useState } from 'react';
import { Clock, Dices, FileText, Printer } from 'lucide-react';
import type { BacExerciseIdea } from '../data/bacSessionIndex';
import { composeMockExam, numeroDuJour } from '../data/mockExam';
import { INITIAL_UNITS } from '../unitCatalog';

interface Props {
  onTrain: (idea: BacExerciseIdea) => void;
}

const titreUnite = (unitId: number) =>
  INITIAL_UNITS.find((u) => u.id === unitId)?.title ?? `وحدة ${unitId}`;

export default function MockExamPanel({ onTrain }: Props) {
  const [numero, setNumero] = useState(() => numeroDuJour());
  const sujet = composeMockExam(numero);

  return (
    <section
      data-testid="mock-exam"
      dir="rtl"
      className="feuille-sujet rounded-3xl p-4 bg-white dark:bg-[#141916] border-2 border-[#1f1c0b]/30 mb-4"
    >
      <style>{`@media print {
        body * { visibility: hidden !important; }
        .feuille-sujet, .feuille-sujet * { visibility: visible !important; }
        .feuille-sujet { position: absolute; inset: 0; border: 0; }
        .sans-impression { display: none !important; }
      }`}</style>

      <div className="flex flex-row-reverse items-start justify-between gap-3 mb-3">
        <div className="text-right">
          <h2 className="flex flex-row-reverse items-center gap-2 text-base font-black text-[#1f1c0b] dark:text-gray-100">
            <FileText className="w-4 h-4" />
            موضوع تجريبي رقم {sujet.numero}
          </h2>
          <p data-testid="mock-entete" className="flex flex-row-reverse items-center gap-2 text-[11px] text-[#506072] dark:text-gray-400">
            <Clock className="w-3.5 h-3.5" />
            {Math.floor(sujet.dureeMinutes / 60)} سا و {sujet.dureeMinutes % 60} د ·{' '}
            {sujet.totalPoints} نقطة · ثلاثة تمارين من دورات {sujet.sessions.join(' · ')}
          </p>
        </div>
        <div className="sans-impression flex flex-row-reverse gap-2">
          <button
            data-testid="mock-suivant"
            onClick={() => setNumero((n) => n + 1)}
            className="flex flex-row-reverse items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-[#006d37] text-white text-[11px] font-bold cursor-pointer"
          >
            <span>موضوع آخر</span>
            <Dices className="w-3.5 h-3.5" />
          </button>
          <button
            data-testid="mock-imprimer"
            onClick={() => {
              try {
                window.print();
              } catch {
                /* environnement sans impression */
              }
            }}
            className="flex flex-row-reverse items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-[#1f1c0b] text-white text-[11px] font-bold cursor-pointer"
          >
            <span>اطبع</span>
            <Printer className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <ol className="space-y-3">
        {sujet.exercices.map((e, i) => (
          <li
            key={e.id}
            data-testid={`mock-exercice-${i + 1}`}
            className="rounded-2xl p-3 bg-[#f8fbfa] dark:bg-black/20 border border-[#bbcbbb]/30"
          >
            <p className="text-[12px] font-black text-[#1f1c0b] dark:text-gray-100 text-right mb-1">
              التمرين {i + 1} ({String(e.points).padStart(2, '0')} نقاط) — {titreUnite(e.unitIds[0])}
            </p>
            <p className="text-[13px] leading-7 text-[#1f1c0b] dark:text-gray-200 text-right mb-1">
              {e.ideaAr}
            </p>
            <ul className="list-disc pr-4 mb-2 space-y-0.5">
              {e.supportsAr.map((s) => (
                <li key={s} className="text-[11px] leading-6 text-[#506072] dark:text-gray-300 text-right">
                  {s}
                </li>
              ))}
            </ul>
            <p className="text-[11px] text-[#8a6a00] dark:text-[#d9a400] text-right mb-2">
              التعليمات: {e.verbsAr.join(' · ')}
            </p>
            <button
              data-testid={`mock-ouvrir-${e.id}`}
              onClick={() => onTrain(e)}
              className="sans-impression text-[11px] font-bold px-3 py-1 rounded-xl bg-[#006d37] text-white cursor-pointer"
            >
              اكتب جواب هذا التمرين
            </button>
          </li>
        ))}
      </ol>

      <p className="mt-3 text-[10px] leading-5 text-[#506072] dark:text-gray-500 text-right">
        المصدر: مواضيع بكالوريا رسمية (2017-2026). النصوص هنا ملخّصة للتدريب على البنية و التعليمات؛
        للاطلاع على الموضوع الأصلي كاملاً ارجع إلى الدورة المذكورة.
      </p>
    </section>
  );
}
