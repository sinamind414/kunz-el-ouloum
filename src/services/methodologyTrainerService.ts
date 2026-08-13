import { CORE_REFLEXES, type CoreReflexId } from '../data/reflexes';
import type { MasteryEvidence } from '../data/store';
import { recordEvidence } from '../data/store';
import { METHODOLOGY_QA, type MethodologyQA } from '../methodologyKnowledge';
import { normalizeArabic } from '../utils/arabicNormalize';

export type MethodologyVerbKey = CoreReflexId;

export interface MethodologyTrainerMissionMeta {
  missionId: string;
  conceptId: string;
  relatedErrorIds?: string[];
}

export interface MethodologyTrainerVerb {
  id: MethodologyVerbKey;
  labelAr: string;
  color: string;
  keywords: string[];
  connectors: string[];
  qaIds: string[];
}

export const METHODOLOGY_TRAINER_VERBS: Record<MethodologyVerbKey, MethodologyTrainerVerb> = {
  analyse: {
    id: 'analyse',
    labelAr: 'حلل',
    color: '#2563eb',
    keywords: ['تمثل الوثيقة', 'نلاحظ', 'بدلالة', 'تزايد', 'تناقص', 'ثبات'],
    connectors: ['حيث', 'في البداية', 'ثم', 'ومنه نستنتج'],
    qaIds: ['meth_7', 'meth_4'],
  },
  interpret: {
    id: 'interpret',
    labelAr: 'فسر',
    color: '#d97706',
    keywords: ['يفسر', 'يعود السبب إلى', 'يرجع إلى', 'الآلية'],
    connectors: ['لأن', 'نتيجة لـ', 'يفسر ذلك بـ', 'وبالتالي'],
    qaIds: ['meth_8', 'meth_5'],
  },
  compare: {
    id: 'compare',
    labelAr: 'قارن',
    color: '#0e7490',
    keywords: ['أوجه التشابه', 'أوجه الاختلاف', 'المقارنة', 'المعيار'],
    connectors: ['بينما', 'في حين', 'بالمقابل', 'من جهة أخرى'],
    qaIds: ['meth_10', 'meth_7'],
  },
  hypothesize: {
    id: 'hypothesize',
    labelAr: 'اقترح فرضية',
    color: '#7c3aed',
    keywords: ['نفترض أن', 'سبب الظاهرة', 'قابلة للاختبار', 'يمكن التحقق'],
    connectors: ['نفترض أن', 'مما يؤدي إلى', 'ويمكن التحقق', 'نتيجة لذلك'],
    qaIds: ['meth_12', 'meth_14'],
  },
  explain: {
    id: 'explain',
    labelAr: 'اشرح / بيّن',
    color: '#059669',
    keywords: ['تبين الوثائق', 'الآلية', 'يتضح أن', 'شرح'],
    connectors: ['بذلك', 'من هنا', 'يتضح أن', 'وهذا يبين أن'],
    qaIds: ['meth_13', 'meth_8'],
  },
  validate: {
    id: 'validate',
    labelAr: 'صادق',
    color: '#e11d48',
    keywords: ['الفرضية', 'الدليل', 'المعطيات', 'التطابق'],
    connectors: ['بالاستناد إلى', 'يثبت', 'يؤكد', 'يتطابق مع'],
    qaIds: ['meth_11', 'meth_14'],
  },
};

// 'ثم' figure dans 6 des 9 corriges officiels et 'أما' dans 1 : leur absence
// de cette liste faisait tomber a 0 % la note de liaison de redactions
// pourtant correctement articulees.
const GENERIC_CONNECTORS = ['لأن', 'بما أن', 'إذن', 'يعود', 'يفسر', 'بينما', 'حيث', 'بالتالي', 'وعليه', 'نستنتج', 'ثم', 'أما'];
const PASS_THRESHOLD = 70;

export interface MethodologyEvaluation {
  score: number;
  rawScore: number;
  kwFound: string[];
  connFound: string[];
  forbiddenFound: string[];
  hasStructure: number;
  lengthOk: boolean;
  kwPct: number;
  connPct: number;
  structPct: number;
  /** Vrai si la reponse empile les mots-cles au lieu de rediger. */
  isKeywordStuffing: boolean;
}

export interface MethodologySubmissionResult {
  evaluation: MethodologyEvaluation;
  evidence: MasteryEvidence | null;
  missionCompleted: boolean;
}

function dedupe(items: string[]): string[] {
  return Array.from(new Set(items));
}

export function getMethodologyQuestionPool(verbKey: MethodologyVerbKey): MethodologyQA[] {
  const ids = METHODOLOGY_TRAINER_VERBS[verbKey]?.qaIds ?? [];
  const found = ids
    .map((id) => METHODOLOGY_QA.find((qa) => qa.id === id))
    .filter(Boolean) as MethodologyQA[];
  return found.length ? found : METHODOLOGY_QA.slice(6, 12);
}

export function evaluateMethodologyAnswer(
  text: string,
  qa: MethodologyQA,
  verbKey: MethodologyVerbKey
): MethodologyEvaluation {
  const norm = normalizeArabic(text);
  const verbMeta = METHODOLOGY_TRAINER_VERBS[verbKey];

  // Le fond (ce que la question exige) et la forme (les tournures-types du verbe)
  // sont notes separement. Les confondre dans un seul denominateur exigeait de
  // l'eleve qu'il emploie TOUTES les tournures du gabarit en plus des notions :
  // 10 des 12 reponses officielles restaient alors sous le seuil de 70, et un
  // empilement de mots-cles sans phrase obtenait un meilleur score qu'une
  // redaction correcte. Le fond est desormais l'assiette de la note, la forme
  // un bonus.
  // Certains `qa.keywords` sont des etiquettes de rubrique ('تحليل وثيقة',
  // 'كلمات مفتاحية', 'نص علمي') et non des notions a restituer : la correction
  // officielle elle-meme ne les contient pas. Exiger de l'eleve ce que le
  // corrige n'ecrit pas rend la note inatteignable. La reference fait foi :
  // une notion est exigible si le corrige officiel l'emploie.
  const normAnswer = normalizeArabic(qa.answer ?? '');
  const attendues = dedupe(qa.keywords).filter((keyword) => {
    const normalized = normalizeArabic(keyword);
    return normalized.length > 2 && normAnswer.includes(normalized);
  });
  // Si le corrige est absent ou muet, on retombe sur la liste brute plutot que
  // sur un denominateur vide (qui vaudrait 100 % a n'importe quelle reponse).
  const contentKeywords = attendues.length > 0 ? attendues : dedupe(qa.keywords);
  const styleMarkers = dedupe([...verbMeta.keywords, ...verbMeta.connectors]);
  const allKeywords = dedupe([...contentKeywords, ...styleMarkers]);

  const trouve = (keyword: string) => {
    const normalized = normalizeArabic(keyword);
    return normalized.length > 2 && norm.includes(normalized);
  };

  const kwFound = allKeywords.filter(trouve);
  const contentFound = contentKeywords.filter(trouve);
  const styleFound = styleMarkers.filter(trouve);

  const connFound = dedupe([...GENERIC_CONNECTORS, ...verbMeta.connectors]).filter((connector) =>
    norm.includes(normalizeArabic(connector))
  );

  const hasStructure = text
    .trim()
    .split(/[.\n]/)
    .filter((segment) => segment.trim().length > 8).length;
  const lengthOk = text.trim().length >= 40;

  // Fond : proportion des notions attendues par la question, reellement citees.
  const totalContent = Math.max(contentKeywords.length, 1);
  const contentPct = Math.min(100, Math.round((contentFound.length / totalContent) * 100));
  // Forme : bonus plafonne. Employer quelques tournures-types suffit ; les
  // empiler toutes n'achete pas la note, faute de quoi le remplissage de
  // mots-cles battrait la redaction scientifique.
  // Deux tournures suffisent a prouver la maitrise du gabarit : au-dela, le
  // bonus est sature, de sorte qu'empiler le vocabulaire ne rapporte plus rien.
  const stylePct = Math.min(100, styleFound.length * 50);
  const kwPct = contentPct;
  const connPct = Math.min(100, connFound.length * 25);
  const structPct = Math.min(100, hasStructure * 30 + (lengthOk ? 30 : 0));
  const rawScore = Math.round(
    contentPct * 0.55 + stylePct * 0.15 + connPct * 0.15 + structPct * 0.15,
  );

  const forbiddenFound = (CORE_REFLEXES[verbKey].forbiddenTerms ?? []).filter((term) =>
    norm.includes(normalizeArabic(term))
  );

  // Anti-remplissage. Une redaction reelle intercale des phrases entre les
  // notions ; les 12 corriges officiels plafonnent a 0,28 de densite de
  // mots-cles. Au-dela de 0,50, le texte n'est plus une redaction mais une
  // liste de termes empiles : sans ce garde-fou, un tel empilement obtenait
  // 94 la ou le corrige officiel obtenait 89.
  const kwCharCount = allKeywords.reduce((sum, keyword) => {
    const normalized = normalizeArabic(keyword);
    return normalized.length > 2 && norm.includes(normalized) ? sum + normalized.length : sum;
  }, 0);
  const keywordDensity = kwCharCount / Math.max(norm.length, 1);
  const isKeywordStuffing = keywordDensity > 0.5;

  const penalise = forbiddenFound.length > 0 || isKeywordStuffing;
  const score = penalise ? Math.min(rawScore, 30) : rawScore;

  return {
    score,
    rawScore,
    kwFound,
    connFound,
    forbiddenFound,
    hasStructure,
    lengthOk,
    kwPct,
    connPct,
    structPct,
    isKeywordStuffing,
  };
}

export function submitMethodologyAttempt(input: {
  text: string;
  qa: MethodologyQA;
  reflexId: MethodologyVerbKey;
  missionReflexId?: CoreReflexId;
  missionMeta?: MethodologyTrainerMissionMeta;
}): MethodologySubmissionResult {
  const evaluation = evaluateMethodologyAnswer(input.text, input.qa, input.reflexId);

  if (!input.missionReflexId || !input.missionMeta || evaluation.score < PASS_THRESHOLD) {
    return { evaluation, evidence: null, missionCompleted: false };
  }

  const evidence: MasteryEvidence = {
    id: `ev_${input.missionMeta.missionId}_${input.missionReflexId}_${Date.now()}`,
    conceptId: input.missionMeta.conceptId,
    dimension: 'methodology',
    reflexId: input.missionReflexId,
    source: 'word_by_word',
    score: evaluation.score,
    createdAt: Date.now(),
    relatedErrorIds: input.missionMeta.relatedErrorIds ?? [],
  };

  recordEvidence(evidence);

  return { evaluation, evidence, missionCompleted: true };
}
