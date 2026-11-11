// ApprentissageTabs.tsx — bande de 3 onglets segmentés de la rubrique « التعلّم ».
//
// RÈGLES TENUES ICI (spec 4 rubriques, 2026-11-05) :
//   · ordre PÉDAGOGIQUE Cours → Entraînement → Révision, laissé tel quel : le
//     `dir="rtl"` global place الدروس à droite et المراجعة à gauche. Aucune
//     inversion manuelle : ni inversion du flex, ni tableau réordonné.
//   · double libellé AR (فصحى) + FR, comme la barre principale existante ; pas
//     de faux sélecteur de langue (l'app est 100 % arabe RTL, `index.html`).
//   · indicateurs de progression 100 % DÉRIVÉS de compteurs réels
//     (src/data/apprentissageProgression.ts), transmis par App.tsx en props.
//     Aucun chiffre n'est écrit ici, aucun dénominateur commun n'est inventé :
//     « X/72 leçons », « N tentatives », « N évaluations » ont chacun leur
//     unité. Si la prop est absente, on n'affiche RIEN (jamais un faux 0).
//   · swipe limité À CETTE BANDE (`touch-action: pan-y`), jamais à la page :
//     schémas, tableaux et FigureZoomLayer gardent leurs gestes. Les flèches
//     clavier et `aria-selected` donnent un accès équivalent sans tactile.
//   · la bande n'est PAS rendue pendant l'épreuve chronométrée ni en mode focus
//     (décision prise dans App.tsx, comme pour le capitaine).

import { useRef } from 'react';
import {
  ONGLETS_APPRENTISSAGE,
  type OngletApprentissageId,
} from '../data/apprentissageNav';
import type { ProgressionApprentissage } from '../data/apprentissageProgression';
// 2026-11-10 (demande du propriétaire) : l'élève ENTRE par le CHAPITRE (l'un des
// 3 domaines du programme), puis voit les rubriques de ce chapitre. Le sélecteur
// est monté SOUS la bande d'onglets : il vaut pour les trois onglets
// (الدروس / التمارين / المراجعة) et pour toutes les rubriques qui listent des
// unités (elles filtrent sur le chapitre actif, cf. src/lib/chapitreActif.ts).
import SelecteurChapitre from './SelecteurChapitre';

interface Props {
  actif: OngletApprentissageId;
  onChanger: (id: OngletApprentissageId) => void;
  /** Compteurs réels ; absence = aucun indicateur affiché. */
  progression?: ProgressionApprentissage;
}

/** Unité et intitulé exact de CHAQUE compteur (jamais un « /20 » générique). */
const PROGRESSION: Record<OngletApprentissageId, {
  ar: string;
  fr: string;
  uniteAr: string;
  valeur: (p: ProgressionApprentissage) => string;
}> = {
  cours: {
    ar: 'دروس مكتملة في المسار',
    fr: 'Leçons du parcours terminées',
    uniteAr: 'درس',
    valeur: (p) => `${p.leconsFaites}/${p.leconsTotal}`,
  },
  entrainement: {
    ar: 'محاولات اختبار مؤرشفة',
    fr: 'Tentatives d’épreuve archivées',
    uniteAr: 'محاولة',
    valeur: (p) => String(p.tentatives),
  },
  revision: {
    ar: 'تقييمات بطاقات مسجّلة',
    fr: 'Évaluations de cartes enregistrées',
    uniteAr: 'تقييم',
    valeur: (p) => String(p.evaluations),
  },
};

const SEUIL_SWIPE_PX = 48;

export default function ApprentissageTabs({ actif, onChanger, progression }: Props) {
  const xDepart = useRef<number | null>(null);
  const indexActif = ONGLETS_APPRENTISSAGE.findIndex((o) => o.id === actif);

  const allerA = (index: number) => {
    const cible = ONGLETS_APPRENTISSAGE[index];
    if (cible && cible.id !== actif) onChanger(cible.id);
  };

  return (
    <section
      dir="rtl"
      data-testid="apprentissage-tabs"
      aria-label="التعلّم"
      className="sticky top-0 z-30 border-b border-[#e2dabf]/60 bg-[#ffffff]/95 px-3 py-2 backdrop-blur-sm dark:border-[#2ecc71]/10 dark:bg-[#141916]/95"
    >
      <div className="mx-auto mb-2 flex max-w-3xl items-baseline justify-between gap-2">
        <h2 className="text-sm font-black text-[#006d37] dark:text-[#2ecc71]">التعلّم</h2>
        <span dir="ltr" className="text-[10px] font-semibold uppercase tracking-wide text-[#64748b]">
          Apprentissage
        </span>
      </div>

      <div
        role="tablist"
        aria-label="أقسام التعلّم"
        data-testid="apprentissage-tablist"
        className="mx-auto flex max-w-3xl gap-1 rounded-2xl bg-[#f3f4f5] p-1 dark:bg-[#1f2622]"
        style={{ touchAction: 'pan-y' }}
        onTouchStart={(e) => { xDepart.current = e.touches[0]?.clientX ?? null; }}
        onTouchEnd={(e) => {
          const depart = xDepart.current;
          xDepart.current = null;
          if (depart === null) return;
          const dx = (e.changedTouches[0]?.clientX ?? depart) - depart;
          if (Math.abs(dx) < SEUIL_SWIPE_PX) return;
          // En RTL, glisser vers la gauche révèle l'onglet suivant du DOM.
          allerA(dx < 0 ? indexActif + 1 : indexActif - 1);
        }}
        onKeyDown={(e) => {
          // RTL : ArrowRight recule d'un onglet, ArrowLeft avance.
          if (e.key === 'ArrowRight') { e.preventDefault(); allerA(indexActif - 1); }
          else if (e.key === 'ArrowLeft') { e.preventDefault(); allerA(indexActif + 1); }
          else if (e.key === 'Home') { e.preventDefault(); allerA(0); }
          else if (e.key === 'End') { e.preventDefault(); allerA(ONGLETS_APPRENTISSAGE.length - 1); }
        }}
      >
        {ONGLETS_APPRENTISSAGE.map((o) => {
          const estActif = o.id === actif;
          return (
            <button
              key={o.id}
              type="button"
              role="tab"
              aria-selected={estActif}
              tabIndex={estActif ? 0 : -1}
              data-testid={`apprentissage-onglet-${o.id}`}
              onClick={() => onChanger(o.id)}
              className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-2 transition-all cursor-pointer ${
                estActif
                  ? 'bg-[#ffffff] text-[#006d37] shadow-sm dark:bg-[#0c0f0d] dark:text-[#2ecc71]'
                  : 'text-[#64748b] hover:text-[#006d37] dark:text-gray-400'
              }`}
            >
              <span className="w-full truncate text-center text-xs font-black leading-tight">{o.ar}</span>
              <span dir="ltr" className="w-full truncate text-center text-[9px] font-semibold leading-none opacity-70">
                {o.fr}
              </span>
              {progression && (
                <span
                  data-testid={`apprentissage-progression-${o.id}`}
                  title={`${PROGRESSION[o.id].ar} · ${PROGRESSION[o.id].fr}`}
                  className="w-full truncate text-center text-[9px] font-bold leading-none text-[#944a00] opacity-90 dark:text-amber-300"
                >
                  {PROGRESSION[o.id].valeur(progression)} {PROGRESSION[o.id].uniteAr}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Les 3 chapitres : l'élève entre par le chapitre, puis voit ses rubriques. */}
      <SelecteurChapitre />
    </section>
  );
}
