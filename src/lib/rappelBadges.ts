// src/lib/rappelBadges.ts — TRANCHE P1-2, restant principal (29/10/2026) :
// LES BADGES 🔴🟡🟢 DE RAPPEL SUR LES LEÇONS.
//
// POURQUOI. La boucle SM-2 fonctionne et est prouvée en UI réelle (rapport
// commité cca91ec), mais l'élève ne la VOIT que dans la mission du jour.
// Le badge rend la mémoire visible LÀ où l'élève choisit quoi étudier.
//
// NAMESPACE UNIFIÉ (constaté, verrouillé par les lock tests du corpus) :
// les identifiants de concepts de rappel SONT des clés de leçon —
//   · corpus manuel (16) : clés type `phase1_chapitres_1_2` ;
//   · corpus auto (63) : lessonId de LESSON_GOLD_SUMMARIES.
// Le badge d'une leçon lit donc directement l'état SM-2 de la même clé.
//
// RÈGLES (honnêteté : jamais de badge sans mémoire réelle) :
//   · la leçon n'a pas de concept au corpus  → null (pas de badge) ;
//   · concept au corpus mais JAMAIS planifié  → null (pas d'info inventée) ;
//   · échu (dueAt ≤ maintenant)               → 🔴 مراجعة مستحقة ;
//   · programmé, intervalle < 21 jours         → 🟡 مراجعة قادمة ;
//   · programmé, intervalle ≥ 21 jours         → 🟢 مراجعة راسخة.
// Le seuil 21 jours = le premier palier « long » du SM-2 de l'app (après
// 1/3/6/14 : rép. distinctes, question d'entretien) — assumé, commenté,
// verrouillé par test.
//
// MODULE LOCAL uniquement (localStorage via chargeBanque) — rien ne quitte
// le téléphone.

import { chargeBanque, type BanqueRappels } from './rappelAdaptatif';
import { estConceptRappel } from './rappelConcepts';

export type CouleurBadgeRappel = 'rouge' | 'jaune' | 'vert';

export interface BadgeRappelInfo {
  couleur: CouleurBadgeRappel;
  /** Libellé arabe فصحى affiché tel quel (emoji porteur de la couleur). */
  libelle: string;
}

/** Premier palier « long » du SM-2 date-v2 (1/3/6/14 puis I × EF) : au-delà,
 *  l'espacement traverse des semaines — l'ancrage est réel, pas promis. */
export const SEUIL_ANCRAGE_JOURS = 21;

export function infoBadgeRappel(
  lessonKey: string,
  now: number = Date.now(),
  banque: BanqueRappels = chargeBanque(),
): BadgeRappelInfo | null {
  if (!estConceptRappel(lessonKey)) return null;
  const etat = banque[lessonKey];
  if (!etat) return null;
  if (etat.dueAt <= now) {
    return { couleur: 'rouge', libelle: '🔴 مراجعة مستحقة' };
  }
  if (etat.intervalDays >= SEUIL_ANCRAGE_JOURS) {
    return { couleur: 'vert', libelle: '🟢 مراجعة راسخة' };
  }
  return { couleur: 'jaune', libelle: '🟡 مراجعة قادمة' };
}
