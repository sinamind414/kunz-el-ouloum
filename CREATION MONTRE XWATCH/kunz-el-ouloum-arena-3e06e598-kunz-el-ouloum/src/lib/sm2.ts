// src/lib/sm2.ts — L'ALGORITHME DE RÉPÉTITION ESPACÉE, EN UN SEUL ENDROIT.
//
// ══════════════════════════════════════════════════════════════════════════
// POURQUOI CE MODULE EXISTE (état mesuré le 15/10/2026)
// ══════════════════════════════════════════════════════════════════════════
// Le dépôt contenait CINQ ordonnanceurs de révision qui s'ignoraient :
//   1. src/utils/flashcardsSrs.ts        — vrai SM-2, auto-évalué (flashcards)
//   2. src/data/spacedRecallIntervals.ts — échelle FIXE [1,3,7,14] (15 concepts)
//   3. src/lib/parcours/nbaEngine.ts     — J+14 fixe (parcours)
//   4. src/lib/parcours/gestureRecallEngine.ts — échelle fixe (gestes)
//   5. src/lib/tadwin/tadwinEngine.ts    — échelle fixe (carnet de fiches)
// La même échelle [1,3,7,14] était recopiée dans trois fichiers
// (`spacedRecallIntervals.ts`, `data/store.ts` → REVIEW_INTERVALS_DAYS, et en
// dur dans flashcardsSrs.ts sous la forme 1/6).
//
// Conséquence pour l'élève : dans quatre systèmes sur cinq, l'intervalle ne
// dépendait PAS de sa réponse. Le stage montait si on avait réussi, redescendait
// à zéro si on avait échoué, mais personne ne mesurait jamais À QUEL POINT la
// réponse était bonne : réussite minimale et réponse parfaite produisaient
// rigoureusement la même échéance. C'est une échelle, pas un algorithme.
//
// Ici : UNE transition, celle de SM-2 (Wozniak, 1987), et deux options
// EXPLICITES pour les différences légitimes entre usages. Ce module est PUR :
// aucun localStorage, aucun import du moteur, aucune lecture d'horloge implicite
// (`now` est toujours un paramètre) — donc testable sans navigateur.
//
// VARIANTES ASSUMÉES (et non cachées) :
//   · `apresEchec` — une carte de révision se reprÉSENTE dans la séance
//     (« intra-séance »), tandis qu'un concept ou un geste se rejoue le
//     lendemain (« lendemain »). Rejouer un concept entier dix minutes après
//     l'avoir raté n'apprend rien : c'est le lendemain que l'oubli commence.
//   · `ajustement` — SM-2 strict n'a pas de bouton « difficile »/« facile ».
//     L'ajustement dit « anki » ajoute ces deux modulations (×0,8 et ×1,3), ce
//     que faisaient déjà les flashcards avant ce module. Il n'est PAS appliqué
//     ailleurs : un concept n'a pas de note auto-déclarée.
//
// ATTENTION AU SENS DE `q` : SM-2 exige la qualité de la réponse (0 à 5), pas
// un booléen. C'est précisément la variable qui manquait partout ailleurs. La
// fonction `qualiteDepuisPreuves` la calcule à partir du TEXTE de l'élève, pour
// que l'intervalle dépende de ce qu'il a réellement écrit.

import { normalizeArabic } from '../utils/arabicNormalize';
import { sansArticle } from './routageDomaine';

export const JOUR_MS = 86_400_000;

/** Le facteur de facilité ne descend jamais sous cette valeur (SM-2 §4). */
export const SM2_EASE_MIN = 1.3;
/** Facteur de facilité d'un élément jamais vu. */
export const SM2_EASE_DEFAUT = 2.5;

/** Qualité de la réponse, au sens de SM-2 : 0 (rien) … 5 (parfaite). */
export type QualiteSm2 = 0 | 1 | 2 | 3 | 4 | 5;

export interface EtatSm2 {
  /** Facteur de facilité (≥ 1,3). Il MONTE quand l'élève réussit facilement. */
  ease: number;
  /** Intervalle courant en jours (0 = à revoir dans la même séance). */
  intervalDays: number;
  /** Échéance, en millisecondes depuis l'époque. */
  dueAt: number;
  /** Répétitions consécutives réussies (q ≥ 3). Remis à 0 après un échec. */
  reps: number;
  /** Nombre d'échecs essuyés — trace honnête de la difficulté réelle. */
  lapses: number;
}

/** Ce qu'on fait après un échec (q < 3). Voir l'en-tête pour le pourquoi. */
export type ApresEchec = 'intra-seance' | 'lendemain';

export interface OptionsSm2 {
  apresEchec?: ApresEchec;
  ajustement?: 'aucun' | 'anki';
}

/** État d'un élément jamais révisé. */
export function etatSm2Initial(now: number = Date.now()): EtatSm2 {
  return { ease: SM2_EASE_DEFAUT, intervalDays: 0, dueAt: now, reps: 0, lapses: 0 };
}

/**
 * LA TRANSITION SM-2. Renvoie le nouvel état sans rien persister.
 *
 *   EF' = EF + (0,1 − (5−q) × (0,08 + (5−q) × 0,02))
 *   q < 3  → cycle remis à zéro (l'élément est considéré comme non su)
 *   q ≥ 3  → rép. 1 : 1 jour · rép. 2 : 6 jours · ensuite : I × EF'
 *
 * La mise à jour de EF a lieu DANS TOUS LES CAS, y compris après un échec :
 * c'est ce qui fait qu'un élément régulièrement raté revient plus souvent même
 * une fois réussi — l'algorithme retient la difficulté, il ne l'oublie pas à la
 * première réussite.
 */
export function prochainEtatSm2(
  previous: EtatSm2 | null,
  q: QualiteSm2,
  now: number,
  options: OptionsSm2 = {},
): EtatSm2 {
  const { apresEchec = 'lendemain', ajustement = 'aucun' } = options;
  const etat = previous ?? etatSm2Initial(now);

  const ease = Math.max(SM2_EASE_MIN, etat.ease + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));

  if (q < 3) {
    // Échec. Deux comportements légitimes selon la nature de l'élément.
    const intervalDays = apresEchec === 'intra-seance' ? 0 : 1;
    return {
      ease,
      intervalDays,
      dueAt: now + intervalDays * JOUR_MS,
      reps: 0,
      lapses: etat.lapses + 1,
    };
  }

  const reps = etat.reps + 1;
  let intervalDays: number;
  if (reps === 1) intervalDays = 1;
  else if (reps === 2) intervalDays = 6;
  else intervalDays = Math.max(1, Math.round(etat.intervalDays * ease));

  if (ajustement === 'anki') {
    // Modulations « difficile » / « facile ». Sans elles, une auto-évaluation
    // « facile » et une auto-évaluation « bien » donneraient la même échéance,
    // et les boutons mentiraient à l'élève.
    if (q === 3) intervalDays = Math.max(1, Math.round(intervalDays * 0.8));
    if (q === 5) intervalDays = Math.max(4, Math.round(intervalDays * 1.3));
  }

  return { ease, intervalDays, dueAt: now + intervalDays * JOUR_MS, reps, lapses: etat.lapses };
}

/** L'élément est-il à réviser ? */
export function estDue(etat: EtatSm2 | null, now: number = Date.now()): boolean {
  if (!etat) return true; // jamais vu = jamais révisé
  return etat.dueAt <= now;
}

/** Jours restants avant l'échéance (0 si déjà due). */
export function joursAvantEcheance(etat: EtatSm2 | null, now: number = Date.now()): number {
  if (!etat) return 0;
  return Math.max(0, Math.ceil((etat.dueAt - now) / JOUR_MS));
}

/**
 * Délai avant de revoir un élément, en jours, PAR RÉPONSE.
 * Commode pour l'interface, mais ce n'est qu'un raccourci de lecture : c'est
 * `prochainEtatSm2` qui fait foi.
 */
export function intervalleApres(
  previous: EtatSm2 | null,
  q: QualiteSm2,
  now: number = Date.now(),
  options: OptionsSm2 = {},
): number {
  return prochainEtatSm2(previous, q, now, options).intervalDays;
}

/**
 * ÉCHELLE NOMINALE de SM-2 — ce que produirait une suite de réponses parfaites.
 * Elle sert à AFFICHER un ordre de grandeur honnête à l'élève (« à quel rythme
 * ça s'espacera si tout va bien »), jamais à ordonnancer : aucun élève ne
 * répond toujours parfaitement, et c'est justement là que l'algorithme travaille.
 *
 * Toute échelle fixe affichée comme si c'était le calendrier de l'élève est un
 * mensonge (défaut corrigé le 14/10 : deux écrans promettaient des échéances
 * différentes). Ici, la seule échelle admise est celle-ci, et elle est
 * étiquetée « nominale » partout où elle s'affiche.
 */
export function echelleNominaleSm2(nombre = 4, now = Date.now()): number[] {
  const out: number[] = [];
  let etat: EtatSm2 | null = null;
  for (let i = 0; i < nombre; i++) {
    etat = prochainEtatSm2(etat, 5, now);
    out.push(etat.intervalDays);
  }
  return out;
}

// ══════════════════════════════════════════════════════════════════════════
// LA QUALITÉ D'UNE RÉPONSE — la variable qui manquait
// ══════════════════════════════════════════════════════════════════════════

/**
 * Met une chaîne sous forme comparable : normalisée, ponctuation → espaces,
 * article défini retiré mot à mot.
 *
 * POURQUOI L'ARTICLE EST RETIRÉ DES DEUX CÔTÉS. En arabe, l'article définitif
 * est COLLÉ au mot : `نسخ` dans le corpus et `النسخ` sous la plume de l'élève
 * désignent la même notion, et une comparaison littérale les sépare. C'est
 * exactement ce qui avait rendu le dernier mot de chaque question interrogative
 * invisible au moteur avant le 14/10 (le `؟` collé) — même famille de défaut :
 * une langue où tout se colle, comparée comme si tout était séparé.
 *
 * La règle de retrait est `sansArticle` de `routageDomaine.ts`, IMPORTÉE et non
 * recopiée : c'est la duplication de cette logique qui avait produit cinq
 * échelles de révision concurrentes.
 */
function formeComparable(x: string): string {
  return (
    ' ' +
    normalizeArabic(x)
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .replace(/\s+/g, ' ')
      .trim() +
    ' '
  );
}

/**
 * La même chaîne, proclitiques retirés de chaque mot.
 *
 * Deux proclitiques seulement, et pas plus :
 *   · l'article `ال` — confié à `sansArticle` ;
 *   · la conjonction `و` quand elle est SUIVIE de l'article (`والترجمة`).
 * On ne retire pas un `و` isolé : `وحدة` deviendrait `حدة`, qui est un autre mot.
 * La condition « commence par وال et fait au moins 6 lettres » ne vise que le
 * cas non ambigu — c'est un proclitique, jamais une racine.
 */
function sansProclitiques(x: string): string {
  return formeComparable(x)
    .trim()
    .split(' ')
    .map((mot) => {
      const sansWaw = mot.length >= 6 && mot.startsWith('وال') ? mot.slice(1) : mot;
      return sansArticle(sansWaw);
    })
    .join(' ');
}

/** Le terme apparaît-il, avec ou sans ses proclitiques ? */
function contientPreuve(texte: string, texteNu: string, terme: string): boolean {
  const t = formeComparable(terme);
  if (texte.includes(t)) return true;
  // Les deux sens sont tentés : l'élève peut ajouter l'article au mot du corpus
  // (« التيلاكويد » pour `تيلاكويد`) comme l'enlever (« نسخ » pour `النسخ`).
  const tNu = sansProclitiques(terme);
  return ` ${texteNu} `.includes(` ${tNu} `);
}

export interface PreuvesAttendues {
  /** Termes dont la présence dans la réponse constitue une preuve. */
  acceptedEvidence: readonly string[];
  /** Nombre de preuves exigées pour considérer la réponse comme juste. */
  minEvidence: number;
}

/**
 * Note une réponse LIBRE de 0 à 5 en comptant les preuves qu'elle contient.
 *
 * C'est le cœur du correctif du 15/10/2026. Jusque-là, deux réponses très
 * inégales produisaient la même échéance :
 *   · « لا أعرف »                              → échec, tout pareil
 *   · « التيلاكويد أغشية الصانعة الخضراء »      → réussite, tout pareil
 * Avec `qualiteDepuisPreuves`, le second contient trois preuves sur trois et
 * obtient 5 : son intervalle s'allonge. Le premier obtient 0 : il revient vite.
 *
 * BARÈME (volontairement dur, et voici pourquoi) :
 *   0 preuve                       → 0  (rien à évaluer)
 *   moins que `minEvidence`        → 2  (partiel : c'est un ÉCHEC au sens SM-2,
 *                                        donc rééchelonnage court — dire
 *                                        « presque » à un élève ne l'aide pas)
 *   `minEvidence` atteint          → 3, puis 4 et 5 selon la part des preuves
 * Une réponse qui donne le minimum exigé vaut 3, pas 4 : l'algorithme doit
 * distinguer « ça passe » de « c'est solide », sans quoi le facteur de
 * facilité ne servirait à rien.
 */
export function qualiteDepuisPreuves(reponse: string, preuves: PreuvesAttendues): QualiteSm2 {
  const total = preuves.acceptedEvidence.length;
  const seuil = Math.max(1, Math.min(preuves.minEvidence, total));
  if (total === 0) return 0;

  const texte = formeComparable(reponse);
  const texteNu = sansProclitiques(reponse);
  const trouvees = preuves.acceptedEvidence.filter((t) =>
    contientPreuve(texte, texteNu, t),
  ).length;

  if (trouvees === 0) return 0;
  if (trouvees < seuil) return 2;
  if (trouvees >= total) return 5;
  // Le seuil minimal atteint vaut 3 ; il faut avoir couvert l'essentiel (70 %)
  // pour monter à 4. La note 5 reste réservée à la réponse complète.
  const part = trouvees / total;
  return part >= 0.7 ? 4 : 3;
}

/**
 * Traduit une auto-évaluation (« صح » / « خطأ » / « لا أعرف ») en qualité SM-2.
 *
 * POURQUOI CE N'EST PAS UNE NOTE D'ÉLÈVE. Ces trois mots sont le verdict que
 * l'élève porte sur sa PROPRE restitution — c'est ainsi que fonctionnent Anki et
 * toutes les applications de cartes. Les accepter ne dégrade pas l'algorithme :
 * ce qu'il faut, c'est que le verdict soit TRANSMIS à l'ordonnanceur au lieu
 * d'être jeté (défaut mesuré : `reponseAuRappel` produisait le verdict puis ne
 * l'enregistrait nulle part).
 *
 *   « صح »   → 4 : réussi
 *   « خطأ »  → 2 : échec franc
 *   « لا أعرف » → 1 : échec ET difficulté déclarée (EF baissera plus vite)
 */
export function qualiteDepuisAutoEvaluation(verdict: 'vrai' | 'faux' | 'incertain'): QualiteSm2 {
  if (verdict === 'vrai') return 4;
  if (verdict === 'faux') return 2;
  return 1;
}
