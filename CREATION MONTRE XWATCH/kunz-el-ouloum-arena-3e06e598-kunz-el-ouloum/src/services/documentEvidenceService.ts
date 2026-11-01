// src/services/documentEvidenceService.ts
// Garde-fou de CONTENU documentaire (contre-épreuves #40/#41) + traces locales.
//
// Contexte : la surface « analyse de document » notait sur la FORME seule
// (`passed && pourcentage >= 70`) — une réponse hors-sujet mais bien formulée
// s'affichait « مقبول » 80-95 %. Le verdict affiché exige désormais AUSSI que
// la réponse mobilise réellement le document :
//
//   verdictAffiche = validateAnswer(...).passed && answerHasDocumentContent(...)
//
// Contrat du garde-fou (contre-épreuve #41) :
//  · aucune réponse creuse / hors-sujet / vide / baratin / copie de l'énoncé
//    ne doit être affichée comme acceptée ;
//  · 100 % des corrections officielles atteignables doivent passer.
//
// Méthode : on extrait du contexte de pratique (expectedEvidence + vocabulary)
// et de la correction officielle les termes « preuve » (mots ≥ 4 lettres, ou
// tokens latins ≥ 2 lettres — PPM, PPSE, ADN, ARNm…), en EXCLUANT les mots de
// l'énoncé (goalAr / prompts) : copier l'énoncé ne compte jamais comme preuve.
// La réponse est acceptée si elle contient au moins un terme de preuve.

import type { DocumentPracticeContext } from '../data/documentPracticeContexts';
import { normalizeAr } from '../lib/validation/normalizeAr';
import type { ValidationResult } from '../lib/validation/ValidationEngine';

const TRACE_KEY = 'kunz_v2:document_traces';
const MAX_TRACES = 300;

/** Terme « preuve » : token latin/court (PPM, ADN…) ou mot arabe ≥ 4 lettres. */
function isEvidenceToken(w: string): boolean {
  if (/[A-Za-z0-9]/.test(w)) return w.length >= 2;
  return w.length >= 4;
}

/**
 * Mots du DISCOURS documentaire générique : ils ne prouvent rien (on peut les
 * écrire sans avoir lu le document). Ils pullulent dans expectedEvidence
 * (« تبين الوثيقة 1 … ») et dans les corrections — d'où la fuite classique :
 * « قارن بين الوثيقة الأولى والثانية » passait le garde-fou.
 */
const DISCURSIVE_STOPWORDS_AR = new Set([
  'الوثيقه', 'الوثائق', 'الوثيقتين', 'الوثيقه1', 'الوثيقه2',
  'الجدول', 'الجدولين', 'الشكل', 'الشكلين', 'الاشكال', 'المنحي', 'المنحني',
  'المنحنيات', 'البيان', 'الصوره', 'الصور', 'السند', 'السندات', 'المعطيات',
  'نلاحظ', 'تبين', 'يظهر', 'تظهر', 'توضح', 'يبرز', 'يتضح', 'نستنتج',
  'الاولي', 'الثانيه', 'الاول', 'الثاني', 'الاولى',
  // « نتيجة لذلك » (attendu dans la correction) ≠ « النتيجة واضحة » (baratin) :
  // le mot « نتيجة » seul ne prouve aucun contenu — un élève qui l'écrit sans
  // avoir lu le document passe, il faut donc l'exclure des preuves.
  'نتيجه', 'النتيجه', 'نتائج', 'النتائج',
]);

/** Termes de l'énoncé à ignorer — copier l'énoncé n'est pas une preuve. */
function enunciTerms(practice: DocumentPracticeContext): Set<string> {
  const ignore = new Set<string>();
  for (const s of [practice.goalAr, practice.promptObserveAr, practice.promptProduceAr]) {
    if (!s) continue;
    for (const w of normalizeAr(s).split(/\s+/)) if (w.length >= 2) ignore.add(w);
  }
  return ignore;
}

/**
 * Termes de preuve uniques du contexte de pratique (expectedEvidence +
 * vocabulary). La correction officielle n'est PAS une source de tokens : elle
 * contient le vocabulaire du discours documentaire qui fait fuiter les
 * réponses creuses (« النتيجة واضحة »…).
 */
export function getEvidenceTokens(practice: DocumentPracticeContext, _correctionAr?: string): string[] {
  const ignore = enunciTerms(practice);
  const tokens = new Set<string>();
  for (const s of [...practice.expectedEvidence, ...practice.vocabulary]) {
    if (!s) continue;
    for (const w of normalizeAr(s).split(/\s+/)) {
      if (w.length < 2) continue;
      const norm = normalizeAr(w).replace(/[0-9]+$/g, '');
      if (isEvidenceToken(norm) && !ignore.has(norm) && !DISCURSIVE_STOPWORDS_AR.has(norm)) tokens.add(norm);
    }
  }
  return [...tokens];
}

/** Garde-fou : la réponse mobilise-t-elle au moins un terme de preuve ? */
export function answerHasDocumentContent(answer: string, practice: DocumentPracticeContext, correctionAr: string): boolean {
  const t = normalizeAr(answer);
  if (!t) return false;
  return getEvidenceTokens(practice, correctionAr).some((w) => t.includes(w));
}

// ── Traces locales (offline-first) ──────────────────────────────────────
export interface DocumentTrace {
  at: number;
  exerciseId: string;
  questionId: string;
  answer: string;
  score: number;
  passed: boolean;
  normalizedLength: number;
}

export interface DocumentTraceInput {
  context: DocumentPracticeContext;
  answer: string;
  validationResult: ValidationResult;
}

function readTraces(): DocumentTrace[] {
  try {
    const raw = localStorage.getItem(TRACE_KEY);
    return raw ? (JSON.parse(raw) as DocumentTrace[]) : [];
  } catch {
    return [];
  }
}

/** Enregistre la tentative (une ligne par tentative, sans doublon de clé). */
export function recordDocumentTrace(input: DocumentTraceInput): void {
  const { context, answer, validationResult } = input;
  try {
    const traces = readTraces();
    traces.push({
      at: Date.now(),
      exerciseId: context.exerciseId,
      questionId: context.questionId,
      answer,
      score: validationResult.score,
      passed: validationResult.passed,
      normalizedLength: validationResult.meta?.normalizedLength ?? 0,
    });
    localStorage.setItem(TRACE_KEY, JSON.stringify(traces.slice(-MAX_TRACES)));
  } catch {
    // localStorage indisponible : télémétrie silencieusement désactivée.
  }
}

export function getDocumentTraces(): DocumentTrace[] {
  return readTraces();
}
