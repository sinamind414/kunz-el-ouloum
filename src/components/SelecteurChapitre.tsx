// SelecteurChapitre.tsx — LES TROIS CHAPITRES (les 3 domaines du programme).
//
// L'élève ENTRE par le chapitre : trois cartes cliquables, puis les rubriques
// de ce chapitre s'affichent en dessous (le reste de l'application filtre
// ses listes d'unités sur le chapitre actif — cf. src/lib/chapitreActif.ts).
//
// OÙ EST MONTÉ CE SÉLECTEUR (demande du propriétaire, 2026-11-11) : dans la
// ZONE DE CONTENU de chaque vue, à l'endroit où l'élève choisit son unité ou
// sa méthode — plus une bande fine sous les onglets (qui était trop discrète
// et donnait l'impression que les chapitres « apparaissaient en bas »).
//
// TOUT EST DÉRIVÉ (AGENTS.md §5 : aucun contenu inventé) : le nom du domaine
// vient du catalogue des unités (PASSIVE_DOMAINS), les heures du référentiel
// officiel, l'icône des règles d'appariement existantes (lessonIcons).

import { CHAPITRES } from '../data/chapitres';
import { chapitreIcone } from '../data/lessonIcons';
import { useChapitreActif } from '../lib/chapitreActif';
import Icone from './Icone';

export default function SelecteurChapitre({ titre }: { titre?: string } = {}) {
  const { id: chapitreActif, set: setChapitre } = useChapitreActif();

  return (
    <section
      data-testid="selecteur-chapitre"
      aria-label="الفصول"
      className="mb-3 space-y-2"
    >
      {titre && (
        <h2 className="text-base font-black text-gray-900 dark:text-white">{titre}</h2>
      )}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {CHAPITRES.map((chapitre) => {
          const actif = chapitre.id === chapitreActif;
          return (
            <button
              key={chapitre.id}
              type="button"
              data-testid={`chapitre-${chapitre.id}`}
              aria-pressed={actif}
              onClick={() => setChapitre(chapitre.id)}
              className={`group flex flex-col sm:flex-row items-center sm:items-center gap-1.5 sm:gap-3 p-2 sm:p-3 rounded-2xl border-2 text-center sm:text-right transition-all cursor-pointer ${
                actif
                  ? 'border-[#006d37]/45 bg-[#f1faf4] shadow-sm dark:border-[#2ecc71]/45 dark:bg-[#122019]'
                  : 'border-[#e2dabf]/70 bg-white hover:border-[#006d37]/30 hover:bg-[#f8fbfa] dark:border-[#2ecc71]/20 dark:bg-[#141916] dark:hover:bg-[#151b17]'
              }`}
            >
              <span
                className={`inline-flex shrink-0 items-center justify-center w-9 h-9 sm:w-11 sm:h-11 rounded-xl text-white shadow-sm ${
                  actif
                    ? 'bg-[#006d37]'
                    : 'bg-[#006d37]/70 group-hover:bg-[#006d37]'
                }`}
              >
                <Icone
                  cle={chapitreIcone(chapitre.ar, chapitre.unites[0])}
                  className="w-5 h-5 sm:w-6 sm:h-6"
                />
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-[10px] sm:text-[13px] font-black leading-tight text-[#006d37] dark:text-[#2ecc71] line-clamp-2">
                  {chapitre.ar}
                </span>
                <span dir="ltr" className="block text-[9px] font-bold uppercase tracking-wide text-[#64748b] dark:text-gray-400">
                  {chapitre.fr}
                </span>
                <span className="hidden sm:block text-[10px] font-bold text-[#944a00] dark:text-amber-300">
                  {chapitre.unites.length} وحدات · {chapitre.heures} سا
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
