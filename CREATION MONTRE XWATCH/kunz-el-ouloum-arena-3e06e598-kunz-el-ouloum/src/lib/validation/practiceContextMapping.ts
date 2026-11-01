// src/lib/validation/practiceContextMapping.ts
// Traduction d'un DocumentPracticeContext en ValidationContext.
//
// Cette logique vivait en double, inline dans LiveDocumentUracile.tsx : toute
// verification externe recopiait la regle, donc validait sa propre copie et non
// le code reellement execute. Elle est extraite ici pour que la production et
// les tests partagent une seule source de verite.
import type { CoreReflexId } from '../../data/reflexes';
import type { ValidationContext } from './ValidationEngine';

type MinimalContext = {
  documentType?: string;
  reflexId?: string;
  domain?: ValidationContext['domain'];
  expectedEvidence?: string[];
  vocabulary?: string[];
};

/**
 * Un document n'est 'quantitative' que s'il PORTE des valeurs (courbe, tableau,
 * document mixte). Un schema de structure et un dispositif experimental n'ont ni
 * axe gradue ni mesure : les declarer quantitatifs faisait exiger un marqueur de
 * tendance chiffree sur des reponses de localisation pourtant justes.
 */
export function getDocumentTypeForValidation(
  context: MinimalContext,
): ValidationContext['docType'] {
  if (context.documentType === 'experiment' || context.documentType === 'schema') {
    return 'qualitative';
  }
  if (context.reflexId === 'analyse') return 'quantitative';
  return 'mixed';
}

/**
 * Les six réflexes fondamentaux portent tous le même nom que l'actionVerb du moteur.
 * La correspondance doit donc être TOTALE : un `switch` partiel renvoyait `describe`
 * pour `hypothesize`, `validate` et `compare`, si bien que la loi #4 (interdiction de
 * « ربما », exigence de « نفترض أن ») ne s'exécutait sur AUCUNE des questions
 * d'hypothèse — celles-là mêmes que l'application présente comme son cœur méthodologique.
 * La table est exhaustive et vérifiée par le type : ajouter un réflexe sans décider de
 * son verbe casse la compilation au lieu de retomber silencieusement sur `describe`.
 */
const VERBE_PAR_REFLEXE: Record<CoreReflexId, ValidationContext['actionVerb']> = {
  analyse: 'analyse',
  interpret: 'interpret',
  explain: 'explain',
  compare: 'compare',
  hypothesize: 'hypothesize',
  validate: 'validate',
};

export function getActionVerbForValidation(
  context: MinimalContext,
): ValidationContext['actionVerb'] {
  const reflexe = context.reflexId as CoreReflexId | undefined;
  if (reflexe && reflexe in VERBE_PAR_REFLEXE) return VERBE_PAR_REFLEXE[reflexe];
  return 'describe';
}

/** Contexte de validation complet, tel que soumis par la surface « leçon ». */
export function toValidationContext(context: MinimalContext): ValidationContext {
  return {
    docType: getDocumentTypeForValidation(context),
    actionVerb: getActionVerbForValidation(context),
    domain: context.domain ?? 'autre',
    isNeuromuscular: false,
    // Barème positif : le vocabulaire du domaine (termes courts) ET les
    // preuves attendues (phrases) sont des cibles de contenu créditées.
    expectedTargets: [...(context.vocabulary ?? []), ...(context.expectedEvidence ?? [])],
  };
}
