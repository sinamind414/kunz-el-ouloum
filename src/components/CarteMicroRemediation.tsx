// CarteMicroRemediation.tsx — LA MICRO-REPRISE DEVIENNE VISIBLE (H1, audit 16/10).
//
// POURQUOI CETTE CARTE EXISTE. `MICRO_REMEDIATIONS` contenait 31 entrées
// complètes — titre, explication, question active, preuves acceptées, durée
// estimée (2 à 4 minutes) — et AUCUNE vue ne les affichait. Un corpus non
// montré n'est pas une fonctionnalité, c'est une intention stockée.
//
// LA CARTE EST VOLONTAIREMENT PUREMENT AFFICHAGE : aucun état, aucun effet,
// aucune navigation. Le moment et la surface sont décidés par l'appelant
// (après correction à l'atelier, après la déclaration de cause au QCM) — la
// décision pédagogique reste à un seul endroit, et ce composant ne peut pas
// en diverger. Le contenu vient INTEGRALEMENT du corpus (`MicroRemediation`) :
// rien n'est reformulé ici — reformuler créerait une seconde source qui
// divergerait en silence, le défaut précisément payé cinq fois dans ce dépôt.
//
// RTL natif, sobre sur un téléphone d'entrée de gamme : pas d'animation, pas
// d'image, un badge de durée pour que l'élève sache que c'est court AVANT de
// commencer (2 à 4 minutes — c'est la promesse du corpus, affichée textuellement).

import type { MicroRemediation } from '../data/microRemediations';

export default function CarteMicroRemediation({ remediation }: { remediation: MicroRemediation }) {
  return (
    <div
      data-testid="carte-micro-remediation"
      dir="rtl"
      className="mb-3 rounded-2xl border border-emerald-500/35 bg-emerald-50 px-3.5 py-3 dark:border-emerald-400/30 dark:bg-emerald-500/10"
    >
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <p className="text-[11px] font-bold tracking-wide text-emerald-700 dark:text-emerald-300">
          تذكير موجّه — يعالج الخطأ المكتشف
        </p>
        <span className="shrink-0 rounded-full border border-emerald-500/40 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:border-emerald-400/40 dark:text-emerald-300">
          {remediation.estimatedMinutes} د
        </span>
      </div>
      <p className="text-[14px] font-bold leading-relaxed text-[#00562b] dark:text-emerald-200">
        {remediation.titleAr}
      </p>
      <p className="mt-1.5 text-[12.5px] leading-relaxed text-[#1d3a2a] dark:text-emerald-100/85">
        {remediation.explanationAr}
      </p>
      <p className="mt-2 border-t border-emerald-500/25 pt-2 text-[12.5px] font-bold leading-relaxed text-emerald-800 dark:border-emerald-400/25 dark:text-emerald-200">
        ✍️ {remediation.activeQuestionAr}
      </p>
    </div>
  );
}
