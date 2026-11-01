// diagnosticQuiz.ts — « D'OÙ VIENT CETTE ERREUR ? » — LA QUESTION QUI MANQUAIT.
//
// POURQUOI CE FICHIER EXISTE (14/10/2026, point A de l'analyse de KUNZ-EL-OULOUM-LITE).
//
// `utils/profilErreurs.ts` savait suivre les erreurs d'un élève, mais
// `enregistrerErreurs` n'était appelé qu'à DEUX endroits de toute
// l'application — les productions de l'atelier méthodologique
// (`MethodologyCompilerView`, L361 et L459). Conséquence mesurée : un élève qui
// ne touche jamais cet atelier garde une mémoire d'erreurs VIDE à vie, et la
// bulle du capitaine ne pourra jamais lui dire « on sait où tu te trompes ».
//
// Le LITE (dépôt `KUNZ-EL-OULOUM-LITE`) règle ce même problème d'une façon qui
// tient en une question : à la fin d'une séance, l'élève DÉCLARE lui-même son
// type de brèche (T1–T4). C'est peu coûteux, et surtout c'est HONNÊTE : aucune
// question du corpus ne porte d'étiquette de notion, donc l'application n'a
// aucun moyen de déduire la cause d'une erreur. Toute déduction serait une
// invention — et `profilErreurs.ts` dit déjà ce qu'il faut en penser
// (« Inventer ces confusions serait pire que de ne pas les avoir »).
//
// Donc ici : une question, quatre réponses possibles, un seul enregistrement par
// séance. Ce que l'élève déclare devient une donnée réutilisable.
//
// CE MODULE EST VOLONTAIREMENT LÉGER : il ne contient que des chaînes et des
// codes. Il est importé par `QuizView`, pas par l'entrée du bundle.

/**
 * Une cause que l'élève peut reconnaître dans sa propre erreur.
 *
 * `code` est une clé de `ERROR_TAXONOMY` — ou `null` pour « autre chose ».
 * Le `null` est DÉLIBÉRÉ et nécessaire : enregistrer une cause inventée pour un
 * élève qui ne se reconnaît dans aucune proposition fausserait tout le profil
 * et, plus tard, les messages du guide. Ne rien écrire est une réponse valide.
 */
export interface CausePossible {
  id: string;
  /** Ce que l'élève lit et reconnaît. */
  libelleAr: string;
  /** Précision courte, sous le libellé. */
  precisionAr: string;
  /** Code de la taxonomie, ou `null` si l'application ne sait pas le ranger. */
  code: string | null;
}

/**
 * Les quatre causes proposées à la fin d'un QCM.
 *
 * L'ordre va du plus fréquent au plus rare dans une erreur de QCM, et le
 * vocabulaire est celui de l'élève (aucun terme de pédagogie). La quatrième
 * existe pour ne pas forcer un choix faux.
 */
export const CAUSES_QCM: readonly CausePossible[] = [
  {
    id: 'notion',
    libelleAr: 'لم أكن أعرف المفهوم',
    precisionAr: 'خلطت بين مصطلحين، أو نسيت المفهوم أصلًا',
    code: 'notion_confusion',
  },
  {
    id: 'preuve',
    libelleAr: 'عرفت الفكرة ولم أستدلّ عليها',
    precisionAr: 'أجبت بالنتيجة وحدها دون التجربة أو الوثيقة التي تثبتها',
    code: 'unsupported_claim',
  },
  {
    id: 'support',
    libelleAr: 'لم أقرأ السؤال أو الوثيقة بتمعّن',
    precisionAr: 'استعجلت، أو تجاهلت قيمة أو وسما في الوثيقة',
    code: 'missing_reference',
  },
  {
    id: 'autre',
    libelleAr: 'سبب آخر',
    precisionAr: 'لن نسجّل شيئًا — لا نخترع سببًا لا تعرفه',
    code: null,
  },
] as const;

/** Question posée à l'élève — une seule par séance. */
export const QUESTION_CAUSE_AR = 'من أين جاء خطؤك في هذا التمرين؟';

/** Marque posée sur la cause déjà retenue, pour ne pas redemander. */
export const REMERCIEMENT_CAUSE_AR = 'سُجّل. سيتذكّره القبطان في المرة القادمة.';

/** La cause correspondant à un identifiant, ou `null` si l'identifiant est inconnu. */
export function causeParId(id: string | null | undefined): CausePossible | null {
  if (typeof id !== 'string') return null;
  return CAUSES_QCM.find((c) => c.id === id) ?? null;
}

/**
 * Faut-il poser la question ?
 *
 * Trois refus, et chacun a sa raison :
 *  · aucune erreur dans la séance → il n'y a rien à expliquer ;
 *  · question déjà posée dans cette séance → on ne demande pas deux fois ;
 *  · moins d'une erreur → identique au premier cas, écrit explicitement pour
 *    que la règle reste lisible si le calcul du score change un jour.
 */
export function doitDemanderCause(erreurs: number, dejaDemande: boolean): boolean {
  if (dejaDemande) return false;
  return Number.isFinite(erreurs) && erreurs >= 1;
}
