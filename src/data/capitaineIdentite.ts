// capitaineIdentite.ts — LE NOM DU GUIDE, et rien d'autre.
//
// POURQUOI CE FICHIER EXISTE (14/10/2026). `App.tsx` n'a besoin que d'une
// chaîne : le nom affiché du capitaine. En l'important depuis `data/capitaine.ts`,
// il tirait dans le bundle d'ENTRÉE tout ce que ce fichier importe pour ses
// messages — le moteur méthodologique (105 Ko) et `boussoleData`. Mesuré :
// 166 Ko → 270 Ko d'entrée pour afficher un titre d'onglet.
//
// C'est le défaut déjà documenté dans `brandAssets.ts` (« une constante de six
// caractères entraînait tout le corpus dans le bundle d'entrée »). Même remède :
// les constantes sont DÉPLACÉES ici — pas recopiées — et `data/capitaine.ts`
// les ré-exporte, donc le reste de l'application ne change pas.
//
// DÉCISIONS DE MARQUE (elles appartiennent à `docs/MARQUE.md`, pas à ce fichier).
// Les deux constantes sont isolées en tête pour que le coût d'un changement soit
// visible : renommer le guide se fait ICI, en une ligne, sans toucher au contenu.

/** Nom affiché du guide — « le capitaine ». */
export const CAPITAINE_NOM_AR = 'القبطان';

/** Fonction — « مُرشد » (le guide), terme déjà employé dans l'application. */
export const CAPITAINE_FONCTION_AR = 'مُرشد كنز العلوم';

/** Identité complète, affichée telle quelle (titre d'onglet, en-têtes). */
export const CAPITAINE_IDENTITE_AR = `${CAPITAINE_NOM_AR} — ${CAPITAINE_FONCTION_AR}`;
