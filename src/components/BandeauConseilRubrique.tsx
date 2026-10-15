// BandeauConseilRubrique.tsx — LE GUIDE ACCUEILLE, PUIS SE TAIT.
//
// Demande d'origine (14/10/2026) : « je veux que le tutor morchid parle quand tu
// rentres à une rubrique, donne des conseils comme un prof ». Le bandeau honore
// la demande, avec une règle en plus — la PREMIÈRE VISITE seulement. Voir
// `data/conseilsRubrique.ts` pour la raison complète.
//
// Une exception assumée au « une seule voix » : le bandeau est le SEUL endroit
// où le personnage apparaît en grand dans une rubrique. Ailleurs il est réduit
// au bouton rond, et sa bulle ne parle qu'au bon moment. Trois endroits qui
// parlent en même temps seraient trois guides concurrents.

import { CAPITAINE_IDENTITE_AR } from '../data/capitaineIdentite';
import { CAPITAINE_VISAGE_URL } from '../data/brandAssets';
import type { ConseilRubrique } from '../data/conseilsRubrique';

interface Props {
  conseil: ConseilRubrique;
  /** L'élève ferme le bandeau : il disparaît, et ne revient pas seul. */
  onFermer: () => void;
}

export default function BandeauConseilRubrique({ conseil, onFermer }: Props) {
  return (
    <div
      data-testid="bandeau-conseil-rubrique"
      dir="rtl"
      className="mb-4 flex items-start gap-3 rounded-2xl border border-[#006d37]/25 bg-[#f8fbfa] p-3.5 dark:border-emerald-400/25 dark:bg-[#121614]"
    >
      <img
        src={CAPITAINE_VISAGE_URL}
        alt=""
        aria-hidden="true"
        data-testid="bandeau-conseil-visage"
        className="h-14 w-14 shrink-0 rounded-2xl bg-[#fff9ed] object-cover"
      />
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-black tracking-wide text-[#006d37]/80 dark:text-emerald-400/80">
          {CAPITAINE_IDENTITE_AR}
        </p>
        {/*
          Le conseil EST le titre : il n'y a pas de mot d'introduction. Un
          professeur qui entre dans la salle ne dit pas « j'ai un conseil à te
          donner » — il donne le conseil.
        */}
        <p className="mt-1 text-[12.5px] font-bold leading-relaxed text-[#1f2b24] dark:text-gray-100">
          {conseil.conseilAr}
        </p>
        <p className="mt-1.5 text-[11px] leading-relaxed text-[#506072] dark:text-gray-400">
          ابدأ بـ: {conseil.gesteAr}
        </p>
        <button
          type="button"
          data-testid="bandeau-conseil-fermer"
          onClick={onFermer}
          className="mt-2 rounded-xl border border-black/10 px-3 py-1.5 text-[11px] font-bold text-[#506072] transition-colors hover:border-[#006d37] cursor-pointer dark:border-white/10 dark:text-gray-300"
        >
          فهمت
        </button>
      </div>
    </div>
  );
}
