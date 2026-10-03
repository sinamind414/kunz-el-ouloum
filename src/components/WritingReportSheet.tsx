// WritingReportSheet.tsx — « تقرير عملي » : une page imprimable de ce que
// l'élève a réellement produit (sprint 39).
//
// Contexte algérien : le professeur demande des preuves de travail, et l'élève
// n'a rien à montrer d'une application — sinon des écrans. Cette feuille
// rassemble, sur une page A4 : ce qu'il a rédigé, sur quels sujets officiels,
// ce que la forme de ses réponses révèle, et ce qui lui manque le plus
// souvent.
//
// Aucune note n'y figure : le contrôle de forme n'évalue pas le fond, et un
// document destiné à un professeur ne doit pas se faire passer pour une
// évaluation. Le professeur lit les réponses ; la feuille dit où regarder.

import { useMemo } from 'react';
import { FileText, Printer } from 'lucide-react';
import { reviewDrafts, writingReport } from '../data/writingReview';
import { readPlanSettings } from '../data/planSettings';
import { INITIAL_UNITS } from '../unitCatalog';

interface Props {
  onClose: () => void;
}

const dateDuJour = () => new Date().toISOString().slice(0, 10);

export default function WritingReportSheet({ onClose }: Props) {
  const rapport = useMemo(() => writingReport(), []);
  const revues = useMemo(() => reviewDrafts(), []);
  const { daysLeft } = readPlanSettings();

  /** Unités touchées par les réponses écrites, les plus travaillées d'abord. */
  const unites = useMemo(() => {
    const compte = new Map<number, number>();
    for (const r of revues) {
      const unitId = r.idea?.unitIds[0];
      if (unitId != null) compte.set(unitId, (compte.get(unitId) ?? 0) + 1);
    }
    return [...compte.entries()]
      .map(([unitId, n]) => ({
        unitId,
        n,
        titre: INITIAL_UNITS.find((u) => u.id === unitId)?.title ?? `وحدة ${unitId}`,
      }))
      .sort((a, b) => b.n - a.n || a.unitId - b.unitId);
  }, [revues]);

  return (
    <section
      data-testid="writing-report"
      dir="rtl"
      className="feuille-rapport rounded-3xl p-4 bg-white dark:bg-[#141916] border-2 border-[#1f1c0b]/30 mb-4"
    >
      <style>{`@media print {
        body * { visibility: hidden !important; }
        .feuille-rapport, .feuille-rapport * { visibility: visible !important; }
        .feuille-rapport { position: absolute; inset: 0; border: 0; }
        .sans-impression { display: none !important; }
      }`}</style>

      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="text-right">
          <h2 className="flex items-center gap-2 text-base font-black text-[#1f1c0b] dark:text-gray-100">
            <FileText className="w-4 h-4" />
            تقرير العمل الكتابي
          </h2>
          <p data-testid="rapport-entete" className="text-[11px] text-[#506072] dark:text-gray-400">
            {dateDuJour()} · {daysLeft} يوماً قبل الامتحان · أجوبة محرَّرة على مواضيع بكالوريا رسمية
          </p>
        </div>
        <div className="sans-impression flex gap-2">
          <button
            data-testid="rapport-imprimer"
            onClick={() => {
              try {
                window.print();
              } catch {
                /* environnement sans impression */
              }
            }}
            className="flex flex-row-reverse items-center gap-2 px-3 py-1.5 rounded-2xl bg-[#1f1c0b] text-white text-[11px] font-bold cursor-pointer"
          >
            <span>اطبع</span>
            <Printer className="w-3.5 h-3.5" />
          </button>
          <button
            data-testid="rapport-fermer"
            onClick={onClose}
            className="px-3 py-1.5 rounded-2xl bg-[#f3f4f5] dark:bg-[#1f2622] text-[11px] font-bold text-[#506072] dark:text-gray-300 cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>

      <p data-testid="rapport-chiffres" className="text-[12px] leading-6 text-[#1f1c0b] dark:text-gray-200 text-right mb-3">
        {rapport.reponses} جواباً محرَّراً على {rapport.exercices} تمريناً · {rapport.motsEcrits} كلمة ·
        متطلبات الشكل المحقّقة {rapport.satisfaits} من {rapport.total}
      </p>

      {unites.length > 0 && (
        <p data-testid="rapport-unites" className="text-[12px] leading-6 text-right mb-3 text-[#506072] dark:text-gray-300">
          <span className="font-black text-[#1f1c0b] dark:text-gray-100">الوحدات المشتغَل عليها: </span>
          {unites.map((u) => `${u.titre} (${u.n})`).join(' · ')}
        </p>
      )}

      {rapport.points.length > 0 && (
        <div data-testid="rapport-manques" className="mb-3">
          <p className="text-[12px] font-black text-[#1f1c0b] dark:text-gray-100 text-right mb-1">
            ما يتكرّر نقصه في أجوبته
          </p>
          <ul className="list-disc pr-4 space-y-0.5">
            {rapport.points.slice(0, 5).map((p) => (
              <li key={p.checkId} className="text-[11px] leading-6 text-[#1f1c0b] dark:text-gray-200 text-right">
                {p.labelAr} — {p.echecs} من {p.occasions}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <p className="text-[12px] font-black text-[#1f1c0b] dark:text-gray-100 text-right mb-1">
          تفصيل الأجوبة
        </p>
        <ul className="space-y-1">
          {revues.map((r) => (
            <li
              key={`${r.ideaId}.${r.familyId}`}
              data-testid={`rapport-ligne-${r.ideaId}-${r.familyId}`}
              className="text-[11px] leading-6 text-right text-[#1f1c0b] dark:text-gray-200"
            >
              <span className="font-bold">
                {r.idea ? `بكالوريا ${r.idea.year} · ${r.idea.titleAr}` : r.ideaId}
              </span>{' '}
              — {r.familleAr} · {r.motsEcrits} كلمة · الشكل {r.satisfaits}/{r.total}
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-3 text-[10px] leading-5 text-[#506072] dark:text-gray-500 text-right">
        ملاحظة للأستاذ(ة): هذا التقرير لا يحمل أي علامة. « الشكل » يعني احترام بنية التعليمة
        (تحليل بالأرقام، أداة ربط سببية، مقدمة و خاتمة…)؛ أما صحة المضمون العلمي فتبقى لتقديركم.
      </p>
    </section>
  );
}
