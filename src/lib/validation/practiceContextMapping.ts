// src/lib/validation/practiceContextMapping.ts
// Traduction d'un DocumentPracticeContext en ValidationContext.
//
// Cette logique vivait en double, inline dans LiveDocumentUracile.tsx : toute
// verification externe recopiait la regle, donc validait sa propre copie et non
// le code reellement execute. Elle est extraite ici pour que la production et
// les tests partagent une seule source de verite.
import type { ValidationContext } from './ValidationEngine';

type MinimalContext = {
  documentType?: string;
  reflexId?: string;
  domain?: ValidationContext['domain'];
  expectedEvidence?: string[];
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

export function getActionVerbForValidation(
  context: MinimalContext,
): ValidationContext['actionVerb'] {
  switch (context.reflexId) {
    case 'analyse':
      return 'analyse';
    case 'interpret':
      return 'interpret';
    case 'explain':
      return 'explain';
    default:
      return 'describe';
  }
}

/** Contexte de validation complet, tel que soumis par la surface « leçon ». */
export function toValidationContext(context: MinimalContext): ValidationContext {
  return {
    docType: getDocumentTypeForValidation(context),
    actionVerb: getActionVerbForValidation(context),
    domain: context.domain ?? 'autre',
    isNeuromuscular: false,
    expectedTargets: context.expectedEvidence,
  };
}
