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

const GENERIC_CONNECTORS = ['لأن', 'بما أن', 'إذن', 'يعود', 'يفسر', 'بينما', 'حيث', 'بالتالي', 'وعليه', 'نستنتج'];
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
  const allKeywords = dedupe([
    ...qa.keywords,
    ...verbMeta.keywords,
    ...verbMeta.connectors,
  ]);

  const kwFound = allKeywords.filter((keyword) => {
    const normalized = normalizeArabic(keyword);
    return normalized.length > 2 && norm.includes(normalized);
  });

  const connFound = dedupe([...GENERIC_CONNECTORS, ...verbMeta.connectors]).filter((connector) =>
    norm.includes(normalizeArabic(connector))
  );

  const hasStructure = text
    .trim()
    .split(/[.\n]/)
    .filter((segment) => segment.trim().length > 8).length;
  const lengthOk = text.trim().length >= 40;

  const totalKw = Math.max(allKeywords.length, 6);
  const kwPct = Math.min(100, Math.round((kwFound.length / totalKw) * 100));
  const connPct = Math.min(100, connFound.length * 25);
  const structPct = Math.min(100, hasStructure * 30 + (lengthOk ? 30 : 0));
  const rawScore = Math.round(kwPct * 0.6 + connPct * 0.2 + structPct * 0.2);

  const forbiddenFound = (CORE_REFLEXES[verbKey].forbiddenTerms ?? []).filter((term) =>
    norm.includes(normalizeArabic(term))
  );

  const score = forbiddenFound.length > 0 ? Math.min(rawScore, 30) : rawScore;

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
