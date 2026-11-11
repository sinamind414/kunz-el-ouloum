// src/data/chapitres.ts — LES TROIS CHAPITRES DE L'APPLICATION.
//
// POURQUOI 3 CHAPITRES (demande du propriétaire, 2026-11-10)
// L'application présentait ses 11 unités à plat : onze pastilles d'un coup,
// dans chaque rubrique. L'élève ne savait pas par où commencer. La structure
// officielle du programme le dit mieux que nous : TROIS domaines, chacun avec
// ses unités, ses heures et sa fenêtre trimestrielle. L'élève entre donc par
// le CHAPITRE, puis voit les rubriques de CE chapitre.
//
// SOURCE UNIQUE (rien n'est inventé, rien n'est dupliqué)
//   · les 3 domaines, leur nom officiel arabe et leurs unités
//     → `src/data/lessonModes.ts` (PASSIVE_DOMAINS) — la même source que la
//       navigationPassive des leçons (domaine → unité → chapitre) ;
//   · le volume horaire officiel → `src/data/curriculumOfficial.ts`
//     (PROGRESSION_OFFICIELLE), sommé par domaine, jamais arrondi à la main.

import { PASSIVE_DOMAINS } from './lessonModes';
import { PROGRESSION_OFFICIELLE } from './curriculumOfficial';

export interface Chapitre {
  /** 1, 2 ou 3 — le numéro du domaine dans le programme officiel. */
  id: number;
  /** Nom officiel du domaine, en arabe (fصحى). */
  ar: string;
  /** Étiquette de structure (français) — un repère, pas un contenu. */
  fr: string;
  /** Volume horaire officiel du chapitre (heures du référentiel). */
  heures: number;
  /** Identifiants des unités du chapitre, dans l'ordre du programme. */
  unites: number[];
}

/** Les trois chapitres, dans l'ordre officiel (1, 2, 3). */
export const CHAPITRES: Chapitre[] = PASSIVE_DOMAINS.map((domaine) => ({
  id: domaine.id,
  ar: domaine.titleAr,
  fr: `Domaine ${domaine.id}`,
  heures: PROGRESSION_OFFICIELLE.filter((p) => p.domaine === domaine.id).reduce((s, p) => s + p.heures, 0),
  unites: [...domaine.unitIds],
}));

/** Le chapitre d'une unité (par son identifiant). */
export function chapitreDUnite(uniteId: number): Chapitre | undefined {
  return CHAPITRES.find((c) => c.unites.includes(uniteId));
}

/** Les identifiants d'unités d'un chapitre (vide si le chapitre est inconnu). */
export function unitesDuChapitre(chapitreId: number): number[] {
  return CHAPITRES.find((c) => c.id === chapitreId)?.unites ?? [];
}
