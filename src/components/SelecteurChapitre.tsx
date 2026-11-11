// SelecteurChapitre.tsx — LES TROIS CHAPITRES (les 3 domaines du programme).
//
// L'élève ENTRE par le chapitre : trois cartes cliquables, puis les rubriques
// de ce chapitre s'affichent en dessous (le reste de l'application filtre
// ses listes d'unités sur le chapitre actif — cf. src/lib/chapitreActif.ts).
//
// TOUT EST DÉRIVÉ (AGENTS.md §5 : aucun contenu inventé) : le nom du domaine
// vient du catalogue des unités, les heures du référentiel officiel, le
// nombre d'unités du catalogue. Aucun libellé n'est écrit « à la main »
// ailleurs que dans ce composant (source unique).

import { CHAPITRES } from '../data/chapitres';
import { useChapitreActif } from '../lib/chapitreActif';

export default function SelecteurChapitre() {
  const { id: chapitreActif, set: setChapitre } = useChapitreActif();

  return (
    <section
      data-testid="selecteur-chapitre"
      aria-label="الفصول"
      className="mx-auto mb-2 max-w-3xl px-1"
    >
      <div className="grid grid-cols-3 gap-2">
        {CHAPITRES.map((chapitre) => {
          const actif = chapitre.id === chapitreActif;
          return (
            <button
              key={chapitre.id}
              type="button"
              data-testid={`chapitre-${chapitre.id}`}
              aria-pressed={actif}
              onClick={() => setChapitre(chapitre.id)}
              className={`flex min-w-0 flex-col items-center gap-0.5 rounded-2xl border px-2 py-2 text-center transition-all cursor-pointer ${
                actif
                  ? 'border-[#006d37]/40 bg-[#f1faf4] ring-1 ring-[#006d37]/25 dark:border-[#2ecc71]/40 dark:bg-[#122019]'
                  : 'border-[#e2dabf]/60 bg-[#f8fbfa] hover:border-[#006d37]/30 hover:bg-[#f1faf4] dark:border-[#2ecc71]/15 dark:bg-[#151b17]'
              }`}
            >
              <span className="w-full truncate text-[11px] font-black leading-tight text-[#006d37] dark:text-[#2ecc71]">
                {chapitre.ar}
              </span>
              <span dir="ltr" className="text-[9px] font-semibold uppercase tracking-wide text-[#64748b] dark:text-gray-400">
                {chapitre.fr}
              </span>
              <span className="text-[9px] font-bold text-[#944a00] dark:text-amber-300">
                {chapitre.unites.length} وحدات · {chapitre.heures} سا
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
