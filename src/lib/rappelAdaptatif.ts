// src/lib/rappelAdaptatif.ts — L'ORDONNANCEUR DE RAPPEL, ADOSSÉ À L'ALGORITHME CANONIQUE.
//
// ══════════════════════════════════════════════════════════════════════════
// CE QUI EXISTAIT AVANT (mesuré le 15/10/2026)
// ══════════════════════════════════════════════════════════════════════════
// `src/data/spacedRecallPrompts.ts` contient 15 concepts × 4 questions, avec
// pour chacune la liste des PREUVES attendues dans la réponse de l'élève
// (`acceptedEvidence`) et le nombre exigé (`minEvidence`). C'est un très beau
// corpus — et il était INERTE :
//
//   $ grep -rn "from '.*spacedRecallPrompts'" src/
//   → 5 fichiers, tous des tests. Zéro consommateur à l'exécution.
//
// Autrement dit : ces 60 questions n'ont jamais été posées à un élève, et les
// preuves qui permettent de CORRIGER une réponse libre n'ont jamais servi à
// corriger quoi que ce soit. De même, `MICRO_REMEDIATIONS.nextAction` pouvait
// valoir `'schedule_recall'` — une intention de programmer un rappel qui n'était
// lue par personne.
//
// Ce module est le chaînon manquant : il prend ces deux corpus inertes, les
// relie à l'algorithme SM-2 (`src/lib/sm2.ts`) et à une mémoire persistée, et
// répond à trois questions :
//   · QUOI réviser maintenant ?   → prochainRappelDu()
//   · QUELLE question poser ?     → promptPour()
//   · COMBIEN de temps avant la prochaine fois ? → noterRappel() le calcule
//
// La dernière est celle qui manquait à tout le dépôt. Avant, une réponse juste
// et une réponse parfaite produisaient la même échéance (J+1 → J+3 → J+7 → J+14,
// uniquement selon le nombre de passages). Désormais l'échéance dépend de la
// qualité de la réponse, mesurée sur le texte de l'élève.
//
// Module PUREMENT local (localStorage), comme gestureRecallEngine : hors ligne
// d'abord, aucune requête, aucun compte.

import {
  estDue,
  etatSm2Initial,
  joursAvantEcheance,
  prochainEtatSm2,
  qualiteDepuisPreuves,
  type EtatSm2,
  type QualiteSm2,
} from './sm2';

/**
 * Une mémoire par élément : les clés sont des identifiants de concept ou de fiche.
 *
 * Module SANS dépendance au corpus de questions, à dessein : il est importé par
 * le moteur du tuteur, et y faire entrer `spacedRecallPrompts.ts` (18 Ko de
 * questions) alourdirait le bundle pour un contenu que le tuteur n'affiche pas.
 * Le pont vers le corpus vit dans `rappelConcepts.ts`, importé uniquement par
 * les écrans qui posent réellement ces questions.
 */
export type BanqueRappels = Record<string, EtatSm2>;

export const CLE_RAPPEL_ADAPTATIF = 'kunz-rappel-adaptatif-v1';

// ══════════════════════════════════════════════════════════════════════════
// Persistance
// ══════════════════════════════════════════════════════════════════════════

function stockage(): Storage | null {
  try {
    if (typeof window === 'undefined') return null;
    return window.localStorage;
  } catch {
    return null; // navigation privée verrouillée : on continue sans mémoire
  }
}

/** Lit la banque. Un contenu illisible ou corrompu vaut banque vide, jamais une exception. */
export function chargeBanque(): BanqueRappels {
  const s = stockage();
  if (!s) return {};
  try {
    const brut = s.getItem(CLE_RAPPEL_ADAPTATIF);
    if (!brut) return {};
    const j = JSON.parse(brut) as unknown;
    if (!j || typeof j !== 'object') return {};
    const propre: BanqueRappels = {};
    for (const [cle, valeur] of Object.entries(j as Record<string, unknown>)) {
      const v = valeur as Partial<EtatSm2> | null;
      if (
        v &&
        typeof v.ease === 'number' &&
        typeof v.intervalDays === 'number' &&
        typeof v.dueAt === 'number' &&
        typeof v.reps === 'number'
      ) {
        propre[cle] = {
          ease: v.ease,
          intervalDays: v.intervalDays,
          dueAt: v.dueAt,
          reps: v.reps,
          lapses: typeof v.lapses === 'number' ? v.lapses : 0,
        };
      }
    }
    return propre;
  } catch {
    return {};
  }
}

export function sauveBanque(banque: BanqueRappels): void {
  const s = stockage();
  if (!s) return;
  try {
    s.setItem(CLE_RAPPEL_ADAPTATIF, JSON.stringify(banque));
  } catch {
    /* quota dépassé : la séance en cours reste valable, la mémoire repartira à neuf */
  }
}

/** État d'un élément, ou null s'il n'a jamais été révisé. */
export function etatRappel(itemId: string, banque: BanqueRappels = chargeBanque()): EtatSm2 | null {
  return banque[itemId] ?? null;
}

// ══════════════════════════════════════════════════════════════════════════
// Le geste central : noter une réponse
// ══════════════════════════════════════════════════════════════════════════

/**
 * Enregistre une réponse et renvoie le nouvel état — dont l'intervalle, qui est
 * ce qu'on annonce à l'élève.
 *
 * C'est LA fonction qui n'existait pas : jusqu'ici le verdict du rappel était
 * calculé puis jeté (`reponseAuRappel` dans le moteur produisait « ✅ صحيح »
 * sans rien enregistrer). L'élève qui répondait parfaitement et celui qui
 * répondait à peine étaient reprogrammés à l'identique.
 */
export function noterRappel(
  itemId: string,
  q: QualiteSm2,
  now: number = Date.now(),
): EtatSm2 {
  const banque = chargeBanque();
  const suivant = prochainEtatSm2(banque[itemId] ?? null, q, now);
  banque[itemId] = suivant;
  sauveBanque(banque);
  return suivant;
}

/**
 * Note directement une réponse LIBRE : c'est le chemin normal pour un concept,
 * dont les preuves attendues sont déclarées dans le corpus.
 */
export function noterReponseLibre(
  itemId: string,
  reponse: string,
  preuves: { acceptedEvidence: readonly string[]; minEvidence: number },
  now: number = Date.now(),
): { etat: EtatSm2; qualite: QualiteSm2 } {
  const qualite = qualiteDepuisPreuves(reponse, preuves);
  return { etat: noterRappel(itemId, qualite, now), qualite };
}

/**
 * Programme un rappel SANS réponse — l'unique usage est la micro-reprise qui
 * déclare `nextAction: 'schedule_recall'` : après une erreur, la notion doit
 * revenir, et il n'y a pas encore de réponse à noter.
 *
 * Un élément déjà programmé n'est PAS écrasé : une erreur survenue aujourd'hui
 * ne doit pas annuler un espacement déjà construit.
 */
export function planifierRappel(itemId: string, now: number = Date.now()): EtatSm2 {
  const banque = chargeBanque();
  if (banque[itemId]) return banque[itemId]!;
  const initial = etatSm2Initial(now);
  // Jamais révisé : dû immédiatement, premier rappel à J+1 une fois répondu.
  initial.dueAt = now;
  banque[itemId] = initial;
  sauveBanque(banque);
  return initial;
}

// ══════════════════════════════════════════════════════════════════════════
// Sélection : quoi réviser maintenant ?
// ══════════════════════════════════════════════════════════════════════════

/** Identifiants dus, du plus en retard au plus récent. */
export function elementsDus(now: number = Date.now(), banque = chargeBanque()): string[] {
  return Object.entries(banque)
    .filter(([, etat]) => estDue(etat, now))
    .sort((a, b) => a[1].dueAt - b[1].dueAt)
    .map(([id]) => id);
}

/** Jours restants avant le prochain rappel d'un élément (0 = dû). */
export function dansCombienDeJours(
  itemId: string,
  now: number = Date.now(),
  banque: BanqueRappels = chargeBanque(),
): number {
  return joursAvantEcheance(banque[itemId] ?? null, now);
}

// ══════════════════════════════════════════════════════════════════════════
// Petit pont avec le reste de l'application
// ══════════════════════════════════════════════════════════════════════════

/**
 * La phrase que l'élève lit après avoir répondu — et qui prouve que le délai
 * n'est pas une constante. Un tuteur qui n'annonce jamais ses échéances laisse
 * croire qu'elles n'existent pas ; c'est précisément ce qui se passait.
 * Chiffres latins (convention latinDigits.ts).
 */
export function phraseEcheance(intervalDays: number): string {
  if (intervalDays <= 0) return 'أعيدها عليك في هذه الجلسة.';
  if (intervalDays === 1) return 'أعيدها عليك غدًا.';
  if (intervalDays === 2) return 'أعيدها عليك بعد يومين.';
  if (intervalDays < 30) return `أعيدها عليك بعد ${intervalDays} أيام.`;
  return `أعيدها عليك بعد ${Math.round(intervalDays / 30)} شهر.`;
}
