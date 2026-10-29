// src/components/RappelBadge.tsx — TRANCHE P1-2 : la puce 🔴🟡🟢 de rappel
// espacé, affichée sur les cartes de leçons (LessonsView, actives et
// passives). Invisible si la leçon n'a aucune mémoire SM-2 réelle — jamais
// de badge de complaisance (voir src/lib/rappelBadges.ts pour les règles).

import { infoBadgeRappel } from '../lib/rappelBadges';

const STYLE_PAR_COULEUR: Record<string, string> = {
  rouge: 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300',
  jaune: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300',
  vert: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300',
};

export default function RappelBadge({ lessonKey, testId }: { lessonKey: string; testId?: string }) {
  const info = infoBadgeRappel(lessonKey);
  if (!info) return null;
  return (
    <span
      data-testid={testId ?? `badge-rappel-${lessonKey}`}
      className={`inline-block mt-1 px-2 py-0.5 rounded-lg text-[10px] font-black ${STYLE_PAR_COULEUR[info.couleur]}`}
    >
      {info.libelle}
    </span>
  );
}
