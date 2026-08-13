import { validateAnswer, type ValidationContext } from '../lib/validation/ValidationEngine';
import { normalizeAr } from '../lib/validation/normalizeAr';

export interface LocalCheckResult {
  valid: boolean;
  code?: string;
  messageAr: string;
}

// #43 — Un mot-clé peut désormais proposer des variantes séparées par « | ».
// Sans cela, la vérification exigeait UNE graphie exacte : l'élève qui écrit
// « من الطرف الخماسي نحو الطرف الثلاثي » — réponse juste, en toutes lettres —
// était refusé parce que la donnée n'attendait que les chiffres « 5 » et « 3 ».
// Rétrocompatible : aucun mot-clé existant ne contient « | ».
// Les flèches (→, ->, ⟶) sont effacées par normalizeAr, qui ne conserve ni
// ponctuation ni symboles. Or « 5' → 3' » est la façon la plus courante
// d'écrire un sens de lecture. On les traduit donc en mot avant normalisation.
function markArrows(text: string): string {
  return text.replace(/(->|-->|→|⟶|⇒|=>)/g, ' نحو ');
}

function keywordVariants(keyword: string): string[] {
  return (
    keyword
      .split('|')
      // Le filtrage se fait APRÈS normalisation : « → » et « -> » sont réduits à
      // du vide par normalizeAr, et `haystack.includes('')` vaut toujours true.
      // Filtrer la graphie brute laissait donc passer n'importe quelle réponse.
      .map((variant) => normalizeAr(variant))
      .filter((variant) => variant.length > 0)
  );
}

// #33 — L'arabe agglutine ses outils grammaticaux au mot suivant. L'élève qui
// répond « الروابط الهيدروجينية » (avec l'article, au pluriel) écrit la même
// chose que le mot-clé « روابط هيدروجينية », mais `includes` échoue sur le
// « ال » collé. Trois réponses justes sur vingt-deux étaient refusées pour ce
// seul motif graphique, sans le moindre enjeu scientifique.
//
// On compare donc MOT À MOT lorsque la sous-chaîne échoue. Le rapprochement est
// volontairement ASYMÉTRIQUE : seul le mot de la RÉPONSE peut porter un affixe,
// le mot-clé est pris tel quel, pour ne jamais réduire « وظيفة » à « ظيفة ».
// Honnêteté de mesure : sur les données actuelles, rendre ce rapprochement
// symétrique ne change AUCUN verdict (la voie rapide par sous-chaîne rattrape
// les cas concernés) ; c'est une précaution de conception, pas un correctif.
// Il en va de même du plancher de 3 caractères sur le radical.
//
// La CONTIGUÏTÉ et l'ORDRE interne du mot-clé, eux, sont bel et bien exigés et
// OBSERVABLES : sans eux, un « حمض » et un « أميني » dispersés dans deux
// propositions sans rapport vaudraient le terme « حمض أميني ».
//
// Mesuré sur les 22 questions, avec des réponses justes librement rédigées
// (et non calquées sur `errorHintAr`, qui recopie les mots-clés attendus) :
// 3/22 acceptées avant, 20/22 après ce seul changement, 22/22 une fois ajoutées
// les deux variantes de données ci-dessous ; 0 acceptation sur 110 réponses
// fausses, vides ou hors-sujet.
const AGGLUTINATED_PREFIXES = ['وال', 'فال', 'بال', 'كال', 'لل', 'ال', 'و', 'ف', 'ب', 'ك', 'ل'];
// Pluriels sains (masculin/féminin) et duel. Le pluriel BRISÉ (رابطة → روابط)
// n'est pas dérivable par affixe : il relève des variantes « | » de la donnée.
const REGULAR_SUFFIXES = ['ات', 'ون', 'ين', 'ان'];

// `normalizeAr` conserve la ponctuation collée au mot (« الثالثية، », « وP »).
// Découper sur les seuls espaces laissait donc des jetons ponctués qui ne
// pouvaient s'apparier à rien.
function tokenize(text: string): string[] {
  return normalizeAr(markArrows(text))
    .split(/[^\p{L}\p{N}]+/u)
    .filter((token) => token.length > 0);
}

function tokenMatches(answerToken: string, keywordToken: string): boolean {
  if (answerToken === keywordToken) return true;
  for (const prefix of AGGLUTINATED_PREFIXES) {
    if (!answerToken.startsWith(prefix)) continue;
    const stripped = answerToken.slice(prefix.length);
    // Garde-fou : ne pas réduire un mot à un radical trop court, sous peine de
    // rapprochements fortuits entre mots sans rapport.
    if (stripped.length < 3) continue;
    if (stripped === keywordToken) return true;
    for (const suffix of REGULAR_SUFFIXES) {
      if (!stripped.endsWith(suffix)) continue;
      const bare = stripped.slice(0, -suffix.length);
      if (bare.length >= 3 && bare === keywordToken) return true;
    }
  }
  for (const suffix of REGULAR_SUFFIXES) {
    if (!answerToken.endsWith(suffix)) continue;
    const bare = answerToken.slice(0, -suffix.length);
    if (bare.length >= 3 && bare === keywordToken) return true;
  }
  return false;
}

function containsTokenSequence(answerTokens: string[], keywordTokens: string[]): boolean {
  if (keywordTokens.length === 0) return false;
  for (let start = 0; start + keywordTokens.length <= answerTokens.length; start += 1) {
    if (keywordTokens.every((needle, offset) => tokenMatches(answerTokens[start + offset], needle))) {
      return true;
    }
  }
  return false;
}

function includesNormalized(text: string, keyword: string): boolean {
  const haystack = normalizeAr(markArrows(text));
  const variants = keywordVariants(keyword);
  if (variants.length === 0) return false;
  // Voie rapide : la sous-chaîne exacte reste la règle et garantit la
  // rétrocompatibilité de tout ce qui passait déjà.
  if (variants.some((variant) => haystack.includes(variant))) return true;
  const answerTokens = tokenize(text);
  return keyword
    .split('|')
    .map((variant) => tokenize(variant))
    .some((keywordTokens) => containsTokenSequence(answerTokens, keywordTokens));
}

// #44 — Certaines questions portent sur un SENS, et le sens ne se vérifie pas
// par présence : « من 5 نحو 3 » et « من 3 نحو 5 » contiennent exactement les
// mêmes mots-clés, alors que le second est faux.
//
// `orderedKeywords` désigne le SOUS-ENSEMBLE des mots-clés qui portent le sens,
// et non la totalité : la marque de direction (« نحو », « من ») se place tantôt
// entre les deux bornes, tantôt avant, et exiger l'ordre sur tous les mots-clés
// refusait les sept formulations correctes mesurées.
//
// On cherche la première occurrence de chaque borne À PARTIR du curseur, et non
// l'ordre des premières occurrences dans toute la réponse : une copie complète
// cite d'abord le sens de LECTURE (3'→5') puis le sens de SYNTHÈSE (5'→3'),
// et doit rester acceptée.
function includesInOrder(text: string, orderedKeywords: string[]): boolean {
  const haystack = normalizeAr(markArrows(text));
  let cursor = 0;
  for (const keyword of orderedKeywords) {
    let found = -1;
    let length = 0;
    for (const variant of keywordVariants(keyword)) {
      const index = haystack.indexOf(variant, cursor);
      if (index !== -1 && (found === -1 || index < found)) {
        found = index;
        length = variant.length;
      }
    }
    if (found === -1) return false;
    cursor = found + length;
  }
  return true;
}

export function validateKeywordAnswer(
  answer: string,
  requiredKeywords: string[],
  forbiddenKeywords: string[] = [],
  options: { orderedKeywords?: string[] } = {},
): LocalCheckResult {
  const raw = answer.trim();
  if (!raw) {
    return { valid: false, code: 'EMPTY_ANSWER', messageAr: 'الإجابة فارغة.' };
  }

  for (const forbidden of forbiddenKeywords) {
    if (includesNormalized(raw, forbidden)) {
      return {
        valid: false,
        code: 'FORBIDDEN_KEYWORD',
        messageAr: `تجنب استعمال: ${forbidden}`,
      };
    }
  }

  const missing = requiredKeywords.filter((keyword) => !includesNormalized(raw, keyword));
  if (missing.length > 0) {
    return {
      valid: false,
      code: 'MISSING_REQUIRED_KEYWORDS',
      messageAr: `أضف العناصر الأساسية: ${missing.slice(0, 3).join('، ')}`,
    };
  }

  // Tous les mots-clés sont présents : reste à vérifier le sens, s'il est en jeu.
  const ordered = options.orderedKeywords ?? [];
  if (ordered.length > 1 && !includesInOrder(raw, ordered)) {
    return {
      valid: false,
      code: 'WRONG_KEYWORD_ORDER',
      messageAr: 'العناصر موجودة لكن الاتجاه معكوس. راجع ترتيب الأطراف.',
    };
  }

  return {
    valid: true,
    messageAr: 'إجابة مقبولة.',
  };
}

export function validateEngineAnswer(
  answer: string,
  ctx: ValidationContext,
): LocalCheckResult {
  const result = validateAnswer(answer, ctx);
  const blockingErrors = result.errors.filter((error) => error.severity !== 'hint');
  if (!result.passed || blockingErrors.length > 0) {
    return {
      valid: false,
      code: blockingErrors[0]?.code ?? result.errors[0]?.code ?? 'ENGINE_REJECTED',
      messageAr: blockingErrors[0]?.messageAr ?? result.errors[0]?.messageAr ?? 'الإجابة تحتاج إلى تحسين.',
    };
  }
  return {
    valid: true,
    messageAr: 'إجابة منهجية مقبولة.',
  };
}

export function validateDualEvidenceAnswer(
  extraction: string,
  justification: string,
  extractionKeywords: string[],
  justificationKeywords: string[],
): {
  extraction: LocalCheckResult;
  justification: LocalCheckResult;
  valid: boolean;
} {
  const extractionResult = validateKeywordAnswer(extraction, extractionKeywords);
  const justificationResult = validateKeywordAnswer(justification, justificationKeywords);

  return {
    extraction: extractionResult,
    justification: justificationResult,
    valid: extractionResult.valid && justificationResult.valid,
  };
}

export function validateHypothesisNaming(
  answer: string,
  accepted: string[],
): LocalCheckResult {
  const raw = answer.trim();
  if (!raw) {
    return { valid: false, code: 'EMPTY_ANSWER', messageAr: 'اكتب تسمية الجزيء.' };
  }
  const ok = accepted.some((item) => includesNormalized(raw, item));
  return ok
    ? { valid: true, messageAr: 'التسمية صحيحة.' }
    : { valid: false, code: 'WRONG_NAMING', messageAr: 'التسمية غير دقيقة بعد.' };
}

export function validateComparisonRow(
  left: string,
  right: string,
  leftExpected: string[],
  rightExpected: string[],
): LocalCheckResult {
  const leftResult = validateKeywordAnswer(left, leftExpected);
  if (!leftResult.valid) {
    return { valid: false, code: leftResult.code, messageAr: `جهة ADN: ${leftResult.messageAr}` };
  }

  const rightResult = validateKeywordAnswer(right, rightExpected);
  if (!rightResult.valid) {
    return { valid: false, code: rightResult.code, messageAr: `جهة ARN: ${rightResult.messageAr}` };
  }

  return { valid: true, messageAr: 'المعيار مكتمل في الجهتين.' };
}

export function validateSequenceOrder(
  orderedIds: string[],
  expectedIds: string[],
): LocalCheckResult {
  if (orderedIds.length !== expectedIds.length) {
    return { valid: false, code: 'WRONG_SEQUENCE_ORDER', messageAr: 'أكمل ترتيب جميع المراحل أولاً.' };
  }

  const valid = orderedIds.every((id, index) => id === expectedIds[index]);
  return valid
    ? { valid: true, messageAr: 'ترتيب المراحل صحيح.' }
    : { valid: false, code: 'WRONG_SEQUENCE_ORDER', messageAr: 'ترتيب المراحل غير صحيح بعد.' };
}

export function validateReasoningCount(
  selectedSymbolCount: 1 | 2 | 3 | undefined,
  rationale: string,
): {
  choice: LocalCheckResult;
  rationale: LocalCheckResult;
  valid: boolean;
} {
  const choice = selectedSymbolCount === 3
    ? { valid: true, messageAr: 'الاختيار الصحيح هو ثلاث قواعد.' }
    : { valid: false, code: 'WRONG_SYMBOL_COUNT', messageAr: 'قاعدة أو قاعدتان لا تكفيان لتشفير 20 حمضاً أمينياً.' };

  const rationaleResult = validateKeywordAnswer(rationale, ['4', '16', '64']);

  return {
    choice,
    rationale: rationaleResult,
    valid: choice.valid && rationaleResult.valid,
  };
}
