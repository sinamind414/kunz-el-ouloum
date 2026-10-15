// src/lib/relais.ts — LE RELAIS HUMAIN : la quatrième et dernière tentative (§5.D).
//
// ══════════════════════════════════════════════════════════════════════════
// CE QUE CE MODULE EST, ET CE QU'IL N'EST PAS (décision prise le 15/10/2026)
// ══════════════════════════════════════════════════════════════════════════
//
// Le §5.D décrit QUATRE tentatives. Les trois premières sont livrées
// (`invitationCapitaine` + `prescriptions`) : dire, dire autrement, réduire. La
// quatrième est « le relais humain ». Elle a attendu un accord séparé parce
// qu'elle était la SEULE étape du §9 capable de faire sortir des données de
// l'appareil.
//
// LA RÈGLE RETENUE, écrite ici pour qu'elle ne se perde pas :
//
//   · l'application ne contacte PERSONNE, JAMAIS — pas de notification, pas de
//     partage, pas de serveur, pas de compte, pas de numéro stocké ;
//   · c'est l'ÉLÈVE qui nomme une personne, une seule fois, et ce nom reste sur
//     son appareil — le seul endroit où il a le droit d'être ;
//   · l'application ne fait que POSER deux questions : « من هو؟ », puis, le
//     lendemain au plus tôt, « هل تحدثت إلى X ؟ » ;
//   · AUCUNE CONSÉQUENCE : ni félicitation, ni compteur, ni échec. Le relais
//     n'entre pas dans le registre des prescriptions — ce n'est pas une
//     prescription, c'est une question. Un « لا » ne retire rien ; un « نعم »
//     n'ajoute rien.
//
// POURQUOI AUCUNE CONSÉQUENCE, ET PAS PAR DOUCEUR. Toute l'étape 1 tient sur des
// compteurs (`ignores`, `expires`, erreurs fermées) qui n'ont de valeur que si
// l'élève dit la vérité. Le jour où parler à un humain change un chiffre affiché,
// l'élève calcule au lieu de répondre — et l'instrument se casse.
//
// POURQUOI LE NOM EST UNE DONNÉE À PART. C'est le seul endroit du produit où un
// TIERS est nommé. Il vit sous sa propre clé, n'est joint à aucun relevé, n'est
// jamais exporté ni transmis, et s'efface d'un geste (`refuserLeRelais`) — un
// effacement qui vaut refus définitif : on ne repose jamais la question.
//
// CE MODULE EST PUR, SAUF SA PERSISTANCE, isolée en bas. Les règles vivent dans
// `questionDuRelais`, qui ne lit rien et ne décide de rien d'autre ; le module
// n'importe NI `prescriptions` NI la taxonomie des erreurs — le relais ne peut
// donc pas, par construction, toucher un compteur.

import { jourLocal } from '../utils/dayKey';

const CLE = 'boussole_relais_v1';

/** Longueur maximale d'un nom : un prénom, un rôle — pas une biographie. */
export const LONGUEUR_NOM_MAX = 40;

/**
 * Le délai minimal avant la relance, en plus du changement de jour.
 *
 * « Le lendemain » ne suffit pas : l'élève qui nomme quelqu'un à 23 h 50 et
 * rouvre l'application à 00 h 10 est le lendemain, et lui demander s'il a eu la
 * conversation serait absurde. Huit heures garantissent qu'une nuit est passée —
 * et une matinée au lycée en fait partie.
 */
export const RELANCE_MIN_MS = 8 * 60 * 60 * 1000;

/**
 * L'état du relais — trois horodatages, un nom, une réponse.
 *
 * Aucune de ces valeurs n'est un score : `relanceMs` et `demandeMs` disent QUAND
 * une question a été posée (pour ne jamais la reposer autrement), pas ce que
 * l'élève vaut.
 */
export interface Relais {
  /** Le nom écrit par l'élève, sur son appareil. `null` = personne encore. */
  nom: string | null;
  /** Quand la question de nomination a été POSÉE (première fois). */
  demandeMs: number | null;
  /** Quand l'élève a nommé quelqu'un. */
  nommeMs: number | null;
  /** Quand la relance a été POSÉE. */
  relanceMs: number | null;
  /** La réponse de l'élève — et rien d'autre. Elle ne déclenche rien. */
  reponse: 'oui' | 'non' | null;
  /** L'élève ne veut pas de relais : on ne lui repose jamais la question. */
  refusMs: number | null;
}

export const RELAIS_VIDE: Relais = {
  nom: null,
  demandeMs: null,
  nommeMs: null,
  relanceMs: null,
  reponse: null,
  refusMs: null,
};

// ─────────────────────────────────────────────────────────────────────────────
// Les textes — en arabe فصحى, et un seul endroit pour chacun.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * La question de nomination.
 *
 * « خطأك » et non « هذا الخطأ » : nommer l'erreur PRÉCISE demanderait la
 * taxonomie des erreurs dans l'entrée du bundle (mesuré le 14/10 : +6 Ko sur le
 * premier écran). Le geste, lui, est clair : une erreur du دفتر, expliquée par
 * quelqu'un qui sait — en une minute.
 */
export const QUESTION_RELAIS_AR = 'اطلب من شخص تثق به أن يشرح لك خطأك في دقيقة. من هو؟';

/** Les trois personnes qui peuvent réellement expliquer — un indice, pas une liste. */
export const INDICE_RELAIS_AR = 'أستاذ، أستاذ دعم، زميل';

export const LIBELLE_RELAIS_TENIR_AR = 'تمّ';
export const LIBELLE_RELAIS_REFUS_AR = 'لا أريد';
export const LIBELLE_RELAIS_OUI_AR = 'نعم';
export const LIBELLE_RELAIS_NON_AR = 'لا';
export const LIBELLE_RELAIS_EFFACER_AR = 'امسح الاسم';

/** La relance, telle qu'elle a été arrêtée — le nom, et rien d'autre. */
export function phraseRelanceAr(nom: string): string {
  return `هل تحدثت إلى ${nom} ؟`;
}

/**
 * Ce que le capitaine a à poser, ou `null`.
 *
 * Le type est délibérément PAS `Invitation` : une invitation devient une
 * prescription tracée (`emettrePrescription`), et le relais ne doit jamais en
 * devenir une. Le compilateur interdit ici ce qu'un commentaire ne suffirait pas
 * à empêcher.
 */
export type QuestionRelais =
  | { genre: 'nomination'; questionAr: string }
  | { genre: 'relance'; nom: string; questionAr: string };

// ─────────────────────────────────────────────────────────────────────────────
// Les règles — pures, testables, et rien d'autre.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * La question du moment, ou `null`.
 *
 * Le MOMENT (épreuve, nuit, travail déjà fait, silence après une bulle fermée)
 * n'est pas jugé ici : c'est `capitainePeutParler` qui le fait, une seule fois
 * pour tout le module voisin. Cette fonction ne connaît que le relais.
 *
 *   1. Refus explicite (`refusMs`)         → silence définitif ;
 *   2. jamais posée + un motif retiré      → LA NOMINATION ;
 *   3. posée, personne de nommé            → la même question, qui attend ;
 *   4. nommée, le même jour                → rien (la conversation n'a pas eu lieu) ;
 *   5. nommée, le lendemain et ≥ 8 h       → LA RELANCE, une fois ;
 *   6. réponse donnée                      → silence définitif.
 *
 * « Le lendemain » n'est pas une politesse : demander « هل تحدثت إليه ؟ » dans la
 * minute qui suit la nomination garantirait un « لا » — et un « لا » obtenu comme
 * ça ne veut rien dire.
 */
export function questionDuRelais(o: {
  relais: Relais;
  /** Un motif est déjà retiré : le capitaine a renoncé, l'humain devient la suite. */
  unMotifEstRetire: boolean;
  maintenantMs: number;
}): QuestionRelais | null {
  const r = o.relais;

  // 1. Il a dit non. Une seule fois suffit, et cela vaut pour toujours.
  if (r.refusMs !== null) return null;

  // 2. Et 3. La nomination : posée une fois, elle attend sa réponse telle quelle.
  //
  // `demandeMs` est de la comptabilité ; LE NOM EST LA VÉRITÉ. Écrire un nom
  // ferme la nomination même si la date de la question manque — ce cas arrive
  // réellement (démonstration du 15/10 : un nom écrit sans passage par l'écran),
  // et une règle qui dépend de l'ordre d'écriture de l'interface est une règle
  // fausse. Un nom existe ⇒ la nomination n'est plus jamais posée.
  if (r.nom === null) {
    if (r.demandeMs === null && !o.unMotifEstRetire) return null;
    return { genre: 'nomination', questionAr: QUESTION_RELAIS_AR };
  }

  // 4. et 5. La relance.
  if (r.reponse !== null) return null;
  if (r.nommeMs === null) return null;
  if (jourLocal(new Date(r.nommeMs)) === jourLocal(new Date(o.maintenantMs))) return null;
  if (o.maintenantMs - r.nommeMs < RELANCE_MIN_MS) return null;

  // 6. Elle se posera une fois, puis restera posée jusqu'à la réponse.
  return { genre: 'relance', nom: r.nom, questionAr: phraseRelanceAr(r.nom) };
}

// ─────────────────────────────────────────────────────────────────────────────
// Persistance — la seule partie qui touche au stockage.
// ─────────────────────────────────────────────────────────────────────────────

function stockage(): Storage | null {
  try {
    if (typeof window === 'undefined') return null;
    return window.localStorage;
  } catch {
    return null;
  }
}

const msOuNull = (x: unknown): number | null =>
  typeof x === 'number' && Number.isFinite(x) && x > 0 ? x : null;

/**
 * Lu par `lireEtatEleve`, et par lui seul dans le chemin de décision : le nom
 * fait partie de la famille « relation », donc de l'état assemblé une fois.
 *
 * Tolérant par construction : une valeur illisible donne `RELAIS_VIDE`, jamais
 * une exception. Le pire cas est de reposer une question, pas de casser l'écran.
 */
export function lireRelais(): Relais {
  const s = stockage();
  if (!s) return RELAIS_VIDE;
  try {
    const brut = s.getItem(CLE);
    if (!brut) return RELAIS_VIDE;
    const j = JSON.parse(brut) as unknown;
    if (!j || typeof j !== 'object') return RELAIS_VIDE;
    const o = j as Partial<Relais>;
    const nom = typeof o.nom === 'string' ? o.nom.trim().slice(0, LONGUEUR_NOM_MAX) : '';
    return {
      nom: nom.length > 0 ? nom : null,
      demandeMs: msOuNull(o.demandeMs),
      nommeMs: msOuNull(o.nommeMs),
      relanceMs: msOuNull(o.relanceMs),
      reponse: o.reponse === 'oui' || o.reponse === 'non' ? o.reponse : null,
      refusMs: msOuNull(o.refusMs),
    };
  } catch {
    return RELAIS_VIDE;
  }
}

function ecrire(r: Relais): void {
  const s = stockage();
  if (!s) return;
  try {
    s.setItem(CLE, JSON.stringify(r));
  } catch {
    /* stockage plein : on perd la question, jamais le travail de l'élève */
  }
}

/** Idempotent : la question n'a qu'une date de naissance, même relue dix fois. */
export function marquerDemandePosee(ms: number): void {
  const r = lireRelais();
  if (r.demandeMs !== null) return;
  ecrire({ ...r, demandeMs: ms });
}

/** Idempotent, pour la même raison : une relance posée une fois. */
export function marquerRelancePosee(ms: number): void {
  const r = lireRelais();
  if (r.relanceMs !== null) return;
  ecrire({ ...r, relanceMs: ms });
}

/** L'élève a nommé quelqu'un. Un nom vide ne remplace jamais un nom. */
export function nommerRelais(nom: string, ms: number): void {
  const propre = nom.trim().slice(0, LONGUEUR_NOM_MAX);
  if (!propre) return;
  const r = lireRelais();
  ecrire({ ...r, nom: propre, nommeMs: ms, reponse: null });
}

/** La réponse. Elle n'ouvre aucun compteur et n'en ferme aucun. */
export function repondreAuRelais(reponse: 'oui' | 'non'): void {
  const r = lireRelais();
  ecrire({ ...r, reponse });
}

/**
 * « Je ne veux pas de relais. » — et c'est définitif.
 *
 * Le nom est effacé, et `refusMs` empêche la question de revenir : la poser de
 * nouveau serait exactement la mécanique collante que ce produit refuse. Un élève
 * qui efface le nom ne sera pas relancé ; c'est le prix, assumé, de la sincérité.
 */
export function refuserLeRelais(ms: number): void {
  const r = lireRelais();
  ecrire({ ...r, nom: null, nommeMs: null, relanceMs: null, reponse: null, refusMs: ms });
}
