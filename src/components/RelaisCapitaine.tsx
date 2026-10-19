// RelaisCapitaine.tsx — LA SEULE PAROLE QUI MÈNE À UN HUMAIN (§5.D, étape 5 du §9).
//
// POURQUOI CE COMPOSANT EXISTE. Les trois premières tentatives du capitaine sont
// des phrases : elles se lisent et se ferment. La quatrième n'est pas une phrase,
// c'est une QUESTION QUI ATTEND UNE RÉPONSE ÉCRITE — un nom, ou un oui/non. Elle
// a donc besoin d'autre chose qu'un bouton « agir » : un champ, et deux boutons.
//
// CE QU'IL NE FAIT PAS, ET C'EST L'ESSENTIEL :
//   · il ne contacte personne — pas de notification, pas de partage, pas de lien ;
//   · il n'envoie rien nulle part : le nom est écrit dans le stockage LOCAL de
//     l'élève (`lib/relais.ts`) et n'en sort jamais ;
//   · il ne compte rien : ni félicitation, ni échec, ni série. « لا » ne coûte
//     rien, « نعم » ne rapporte rien. C'est ce qui rend la réponse vraie.
//
// Il est rendu par `App.tsx` dans la colonne de la bulle (un seul point
// d'insertion). Il disparaît de lui-même : dès que la réponse est écrite, la
// règle pure ne rend plus de question, et `onFait` fait recalculer l'état.

import { useEffect, useState } from 'react';
import { CAPITAINE_IDENTITE_AR } from '../data/capitaineIdentite';
import {
  DIVULGATION_NOMINATION_AR,
  DIVULGATION_RELANCE_AR,
  INDICE_RELAIS_AR,
  LIBELLE_RELAIS_EFFACER_AR,
  LIBELLE_RELAIS_NON_AR,
  LIBELLE_RELAIS_OUI_AR,
  LIBELLE_RELAIS_REFUS_AR,
  LIBELLE_RELAIS_TENIR_AR,
  LONGUEUR_NOM_MAX,
  marquerDemandePosee,
  marquerRelancePosee,
  nommerRelais,
  refuserLeRelais,
  repondreAuRelais,
  type QuestionRelais,
} from '../lib/relais';

const CARTE =
  'max-w-[17rem] rounded-2xl rounded-bl-sm border border-[#006d37]/25 bg-white p-3 shadow-lg dark:border-emerald-400/25 dark:bg-[#121614]';
const CHAMP =
  'min-w-0 flex-1 rounded-xl border border-black/10 bg-white px-2 py-1.5 text-[11px] font-bold text-[#1f2b24] outline-none focus:border-[#006d37] dark:border-white/10 dark:bg-[#0e1210] dark:text-gray-100';
const BOUTON_PLEIN =
  'rounded-xl bg-[#006d37] px-3 py-1.5 text-[11px] font-black text-white cursor-pointer';
const BOUTON_CREUX =
  'rounded-xl border border-black/10 px-2.5 py-1.5 text-[11px] font-bold text-[#506072] dark:border-white/10 dark:text-gray-300 cursor-pointer';
const DISCRET =
  'mt-1.5 cursor-pointer bg-transparent p-0 text-[10px] font-bold text-[#506072] underline dark:text-gray-400';

export default function RelaisCapitaine({
  question,
  onFait,
}: {
  /** La question du moment, ou `null` quand le relais n'a rien à demander. */
  question: QuestionRelais | null;
  /** Appelé après une réponse écrite : l'état se recalcule, la carte s'en va. */
  onFait?: () => void;
}) {
  const [nom, setNom] = useState('');
  const genre = question?.genre ?? null;

  /**
   * LA DATE DE NAISSANCE DE LA QUESTION, posée quand elle est RÉELLEMENT à
   * l'écran — pas quand elle est calculée.
   *
   * C'est ce qui garantit le « une seule fois » : le calcul peut être rejoué dix
   * fois (rendu, navigation, StrictMode), la date ne s'écrit qu'une fois. Et
   * comme l'écriture a lieu ici, une question jamais affichée — onglet du
   * capitaine, épreuve, nuit — n'est jamais consommée en silence.
   */
  useEffect(() => {
    if (genre === 'nomination') marquerDemandePosee(Date.now());
    else if (genre === 'relance') marquerRelancePosee(Date.now());
  }, [genre]);

  if (!question) return null;

  if (question.genre === 'nomination') {
    return (
      <div data-testid="relais-capitaine" dir="rtl" role="status" aria-live="polite" className={CARTE}>
        <p className="text-[11px] font-black text-[#006d37] dark:text-emerald-300">{CAPITAINE_IDENTITE_AR}</p>
        <p className="mt-1 text-[12px] font-bold leading-relaxed text-[#1f2b24] dark:text-gray-100">
          {question.questionAr}
        </p>
        <p className="mt-1 text-[10px] leading-relaxed text-[#506072] dark:text-gray-300">{INDICE_RELAIS_AR}</p>
        {/* Audit Capitaine §7 : la promesse de silence est ÉCRITE sous la question,
            pas enfouie dans un commentaire — confier un nom doit être éclairé. */}
        <p className="mt-1 text-[10px] leading-relaxed text-[#506072] dark:text-gray-300" data-testid="relais-divulgation">
          {DIVULGATION_NOMINATION_AR}
        </p>
        <form
          className="mt-2 flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const propre = nom.trim().slice(0, LONGUEUR_NOM_MAX);
            if (!propre) return;
            nommerRelais(propre, Date.now());
            setNom('');
            onFait?.();
          }}
        >
          <input
            data-testid="relais-nom"
            aria-label="اسم الشخص"
            dir="rtl"
            value={nom}
            maxLength={LONGUEUR_NOM_MAX}
            onChange={(e) => setNom(e.target.value)}
            className={CHAMP}
          />
          <button type="submit" data-testid="relais-nommer" className={BOUTON_PLEIN}>
            {LIBELLE_RELAIS_TENIR_AR}
          </button>
        </form>
        <button
          type="button"
          data-testid="relais-refus"
          onClick={() => {
            refuserLeRelais(Date.now());
            onFait?.();
          }}
          className={DISCRET}
        >
          {LIBELLE_RELAIS_REFUS_AR}
        </button>
      </div>
    );
  }

  return (
    <div data-testid="relais-capitaine" dir="rtl" className={CARTE}>
      <p className="text-[11px] font-black text-[#006d37] dark:text-emerald-300">{CAPITAINE_IDENTITE_AR}</p>
      <p className="mt-1 text-[12px] font-bold leading-relaxed text-[#1f2b24] dark:text-gray-100">
        {question.questionAr}
      </p>
      {/* Audit Capitaine §7 : la réponse honorée reste hors de tout compteur —
          c'est dit sur la carte, pour que le « نعم » reste une vérité. */}
      <p className="mt-1 text-[10px] leading-relaxed text-[#506072] dark:text-gray-300" data-testid="relais-divulgation">
        {DIVULGATION_RELANCE_AR}
      </p>
      <div className="mt-2 flex items-center gap-2">
        <button
          type="button"
          data-testid="relais-oui"
          onClick={() => {
            repondreAuRelais('oui');
            onFait?.();
          }}
          className={BOUTON_PLEIN}
        >
          {LIBELLE_RELAIS_OUI_AR}
        </button>
        <button
          type="button"
          data-testid="relais-non"
          onClick={() => {
            repondreAuRelais('non');
            onFait?.();
          }}
          className={BOUTON_CREUX}
        >
          {LIBELLE_RELAIS_NON_AR}
        </button>
      </div>
      {/* Effacer = refuser : la question ne reviendra pas. C'est dit au survol,
          pas caché — un effacement qui revient n'est pas un effacement. */}
      <button
        type="button"
        data-testid="relais-effacer"
        title="لن نعيد السؤال"
        onClick={() => {
          refuserLeRelais(Date.now());
          onFait?.();
        }}
        className={DISCRET}
      >
        {LIBELLE_RELAIS_EFFACER_AR}
      </button>
    </div>
  );
}
