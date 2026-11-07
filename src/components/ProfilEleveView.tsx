// ProfilEleveView.tsx — LE PROFIL ÉLÈVE MINIMAL (audit coach 2026-11-06,
// reco 1 — lot 🔴 ; GO propriétaire : panneau rendu par Calculs/حسابي via
// MoiView, ZÉRO changement d'App.tsx, zéro verrou de navigation à réviser).
//
// TROIS LIGNES D'HONNÊTETÉ, héritées des décisions du propriétaire (voir
// utils/profilEleve.ts pour le détaillé) :
//   · la filière est AFFICHÉE — l'app est mono-filière, un sélecteur
//     inventerait un choix qui n'existe pas ;
//   · le décompte BAC est affiché AVEC son étiquette provisoire — l'élève
//     ne « confirme » jamais une date, seul un arrêté officiel le fait ;
//   · l'objectif de note est LOCAL et INERTE pour le coach : il s'affiche,
//     il ne déclenche rien. Aucun couplage moteur (verrou de test dédié).
//
// Le panneau est une carte de l'écran حسابي — pas une rubrique : il ne
// cherche aucune porte, il ne compte pas dans PortesUniques.
import { useMemo, useState } from 'react';
import { Flag } from 'lucide-react';
import {
  ETIQUETTE_DATE_BAC_PROVISOIRE_AR,
  BAC_EXAM_DATE,
  BAC_EXAM_DATE_IS_PROVISIONAL,
  bacDaysLeft,
} from '../utils/dashboardActions';
import {
  FILIERE_PROFIL_AR,
  OBJECTIF_NOTE_SUR,
  OBJECTIFS_NOTE_PROPOSES,
  enregistrerObjectifNote,
  effacerProfilEleve,
  lireProfilEleve,
} from '../utils/profilEleve';

export default function ProfilEleveView() {
  // Lecture UNIQUE au montage (l'écran Calculs se remonte à chaque entrée,
  // comme partout dans l'app) : le panneau n'est pas un réactif de stockage.
  const [profil, setProfil] = useState(() => lireProfilEleve());

  const joursAvantBac = useMemo(() => bacDaysLeft(new Date(), BAC_EXAM_DATE), []);

  const choisirObjectif = (note: number): void => {
    enregistrerObjectifNote(note);
    // L'objectif est écrit au stockage, jamais réutilisé par le moteur :
    // la confirmation vient d'une UNIQUE relecture (la vérité reste au
    // stockage, pas à l'état local — une seule source, comme partout).
    setProfil(lireProfilEleve());
  };

  return (
    <section
      data-testid="profil-eleve"
      className="rounded-[24px] border border-[#e2dabf] bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-[#161c18]"
    >
      <div className="flex items-center gap-2">
        <Flag aria-hidden="true" className="h-4 w-4 text-[#006d37] dark:text-[#2ecc71]" />
        <h2 className="text-base font-black text-gray-900 dark:text-gray-50">
          ملفّي
        </h2>
      </div>
      <p className="mt-1 text-xs leading-6 text-gray-500 dark:text-gray-400">
        ثلاث معلومات صادقة — محفوظة محلياً على جهازك فقط، ولا تُرسَل لأي جهة.
      </p>

      <dl className="mt-3 divide-y divide-[#f0e8d4] dark:divide-gray-800/70">
        {/* La filière : un constat affiché — pas un réglage. */}
        <div className="py-2.5" data-testid="profil-filiere">
          <dt className="text-sm text-gray-700 dark:text-gray-300">الشعبة</dt>
          <dd className="mt-0.5 text-sm font-bold text-[#006d37] dark:text-emerald-300">
            {FILIERE_PROFIL_AR}
          </dd>
        </div>

        {/* L'horizon : le décompte réel, ÉTIQUETÉ dans les mots de R5. */}
        <div className="py-2.5" data-testid="profil-horizon">
          <dt className="text-sm text-gray-700 dark:text-gray-300">
            العدّاد إلى البكالوريا
          </dt>
          <dd className="mt-0.5 text-sm font-bold text-gray-900 dark:text-gray-100">
            {joursAvantBac === null ? '—' : `${joursAvantBac} يوماً`}
            {BAC_EXAM_DATE_IS_PROVISIONAL && (
              <span className="ms-2 text-[10px] font-bold text-amber-700 dark:text-amber-400">
                ({ETIQUETTE_DATE_BAC_PROVISOIRE_AR})
              </span>
            )}
          </dd>
        </div>

        {/* L'objectif : /20 (échelle réelle du BAC). Écrit local, aucune
            conséquence pour le coach — le caption le dit explicitement. */}
        <div className="py-2.5" data-testid="profil-objectif">
          <dt className="text-sm text-gray-700 dark:text-gray-300">
            هدفك في البكالوريا (من {OBJECTIF_NOTE_SUR})
          </dt>
          <dd className="mt-1.5">
            <div className="flex flex-wrap gap-1.5">
              {OBJECTIFS_NOTE_PROPOSES.map((note) => {
                const choisi = profil.objectifNote === note;
                return (
                  <button
                    key={note}
                    type="button"
                    data-testid={`profil-objectif-${note}`}
                    aria-pressed={choisi}
                    onClick={() => choisirObjectif(note)}
                    className={`cursor-pointer rounded-xl border px-3 py-1 text-xs font-black transition-all ${
                      choisi
                        ? 'border-[#006d37] bg-[#006d37] text-white dark:border-[#2ecc71] dark:bg-[#2ecc71] dark:text-[#1f1c0b]'
                        : 'border-[#e2dabf] bg-[#f8fbfa] text-gray-700 hover:border-[#006d37] hover:bg-[#e5f6ed] dark:border-gray-700 dark:bg-[#161c18] dark:text-gray-200 dark:hover:border-[#2ecc71]'
                    }`}
                  >
                    <span dir="ltr">{note}</span>
                  </button>
                );
              })}
            </div>
            <p className="mt-1 text-[10px] leading-5 text-gray-500 dark:text-gray-400">
              رقم من (20) تحفظه لنفسك — {profil.objectifNote === null ? 'لم تختر بعد.' : 'هدفك مسجَّل محلياً، للتذكّر فقط.'}
            </p>
          </dd>
        </div>
      </dl>

      {/* Remise à zéro : honnête et discrète — l'élève reste le propriétaire. */}
      {profil.objectifNote !== null && (
        <button
          type="button"
          data-testid="profil-effacer"
          onClick={() => {
            effacerProfilEleve();
            setProfil(lireProfilEleve());
          }}
          className="cursor-pointer text-[10px] font-bold text-gray-400 underline decoration-dotted hover:text-[#944a00] dark:text-gray-500"
        >
          محو الهدف
        </button>
      )}
    </section>
  );
}
