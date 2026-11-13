// pontRappelErreurs.ts — LE PONT VERS LE دفتر الأخطاء (lot 3, 2026-11-04).
//
// ADAPTER, PAS UN GUIDE. Aucune décision pédagogique ici :
//   · le Capitaine a décidé QUAND demander (`bilanDuRappel`) ;
//   · l'élève a déclaré LEQUEL (`CAUSES_QCM` du produit) ;
//   · ce module exécute l'écriture canonique, une seule fois par session.
//
// ÉCRITURE — changement de contrat explicite par rapport aux lots 1-2 :
//   · `boussole_profil_erreurs` (clé EXISTANTE, aucune nouvelle clé) ;
//   · `boussole_erreurs_fermees` uniquement si une erreur déjà fermée
//     réapparaît — comportement existant de `enregistrerErreurs`, pas du lot.
//   · « سبب آخر » (`code === null`) n'écrit RIEN : on n'invente pas une cause.
//
// N'ÉCRIT PAS : `kunz_flashcard_srs_v1` (SRS), `kunz-rappel-adaptatif-v1`,
// aucun compteur d'activité, aucun `signalTravail`. L'échauffement ne note pas
// l'élève et ne crédite pas une journée de travail : le contrat
// « Déclic → Focus → Révision, une fois/jour » reste intact.
//
// PONT SM-2 DÉLIBÉRÉMENT ABSENT : mesuré le 2026-11-04,
// `remediationPour()` ne trouve aucune micro-reprise pour les trois codes
// déclarables et `planifierRappelsPourErreurs([...])` renvoie `[]`. L'appeler
// chargerait un chunk de 164 Ko pour un no-op. Le pont reste branché sur
// `QuizView` et l'atelier méthodologique, prêt pour le jour où le corpus
// couvrira ces codes (même raisonnement que le H1 de `QuizView.tsx:218`).

import { enregistrerErreurs } from '../utils/profilErreurs';
import { causeParId } from '../data/diagnosticQuiz';

export interface EcritureRappel {
  /** Nombre d'occurrences réellement ajoutées au دفتر (0 ou 1). */
  enregistrees: number;
  /** Code de taxonomie écrit, ou `null` si l'élève a choisi « سبب آخر ». */
  code: string | null;
}

/**
 * Enregistre la cause DÉCLARÉE par l'élève. Un code inconnu de `CAUSES_QCM`
 * est ignoré sans exception : jamais de code fabriqué.
 */
export function enregistrerCauseDuRappel(causeId: string, theme: string): EcritureRappel {
  const cause = causeParId(causeId);
  if (!cause?.code) return { enregistrees: 0, code: null };
  const enregistrees = enregistrerErreurs([cause.code], { theme });
  return { enregistrees, code: cause.code };
}
