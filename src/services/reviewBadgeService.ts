// src/services/reviewBadgeService.ts
// #63 (second volet) / #69 — Libellé de provenance éditoriale affiché à l'élève.
//
// Trois surfaces doivent répondre à la même question — « qui a relu ce contenu,
// et cette relecture fait-elle autorité ? » — et la réponse doit être la même
// partout. MissionBanner (#63) et SurvivalCardView (#59) avaient chacun leur
// propre copie de la règle ; la troisième surface, les contextes de document,
// n'en avait aucune. Trois copies d'une règle de confiance, c'est trois
// occasions de la desserrer d'un côté sans s'en apercevoir de l'autre.
//
// Doctrine, identique à celle arrêtée en #59 et reprise en #63 :
//   - une revue saisie sur l'appareil n'est PAS authentifiable hors ligne ;
//   - on ne prétend donc pas la valider : on l'annonce comme locale ;
//   - le libellé « مصدر موثّق » reste RÉSERVÉ à la donnée livrée ;
//   - une revue aux métadonnées implausibles (nom blanc, date de l'an 3000)
//     n'est pas affichée du tout.
import { loadReviewOverride, type EditorialItemType } from './editorialReviewService';
import { isReviewMetadataUsable } from '../types/survivalCard';

export type ReviewBadgeTone = 'trusted' | 'local' | 'pending' | 'app';

export interface ReviewBadge {
  labelAr: string;
  tone: ReviewBadgeTone;
}

/** Libellés — aucune lettre latine : l'élève est arabophone (cf. #67). */
export const REVIEW_BADGE_TRUSTED = 'مصدر موثّق';
export const REVIEW_BADGE_PENDING = 'بانتظار مراجعة أستاذ';
export const REVIEW_BADGE_APP = 'من إعداد التطبيق — لم يراجعه أستاذ';

export function localReviewLabel(reviewedBy: string): string {
  return `مراجعة محلية على هذا الجهاز (${reviewedBy}) — غير موثقة`;
}

/**
 * Calcule le badge à afficher pour un item éditorial.
 *
 * @param sourceStatus statut figé dans la donnée livrée. `undefined` est traité
 *   comme « non relu » et non comme « fiable » : 31 des 42 contextes de document
 *   ne portent aucun statut, et un champ absent ne vaut pas une caution.
 */
export function getReviewBadge(
  type: EditorialItemType,
  id: string,
  sourceStatus?: string
): ReviewBadge {
  const override = loadReviewOverride(type, id);
  const plausible =
    override != null &&
    override.reviewed === true &&
    isReviewMetadataUsable({
      reviewed: override.reviewed,
      reviewedBy: override.reviewedBy,
      reviewedAt: override.reviewedAt,
      sourceProgram: override.sourceProgram,
    });

  if (plausible && override.reviewedBy) {
    return { labelAr: localReviewLabel(override.reviewedBy), tone: 'local' };
  }
  if (sourceStatus === 'manuel_officiel_verifie') {
    return { labelAr: REVIEW_BADGE_TRUSTED, tone: 'trusted' };
  }
  if (sourceStatus === 'a_valider_enseignant') {
    return { labelAr: REVIEW_BADGE_PENDING, tone: 'pending' };
  }
  return { labelAr: REVIEW_BADGE_APP, tone: 'app' };
}
