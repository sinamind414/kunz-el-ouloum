import { describe, it, expect, beforeEach } from 'vitest';
import { loadStore } from '../data/store';
import {
  getDocumentPracticeContext,
} from '../data/documentPracticeContexts';
import {
  validateDocumentTrace,
  recordDocumentTrace,
} from './documentEvidenceService';
import {
  scheduleSpacedRecall,
  recordSpacedRecallAttempt,
} from './spacedRecallService';
import { getSpacedRecallPrompt } from '../data/spacedRecallPrompts';
import type { ValidationResult } from '../lib/validation/ValidationEngine';

class MockStorage implements Storage {
  private map = new Map<string, string>();
  get length() { return this.map.size; }
  clear() { this.map.clear(); }
  getItem(k: string) { return this.map.has(k) ? this.map.get(k)! : null; }
  key(i: number) { return Array.from(this.map.keys())[i] ?? null; }
  removeItem(k: string) { this.map.delete(k); }
  setItem(k: string, v: string) { this.map.set(k, String(v)); }
}

beforeEach(() => {
  global.localStorage = new MockStorage() as unknown as Storage;
});

const uracileCtx = getDocumentPracticeContext('uracile_marque', 'uracile_marque_q1')!;
const synapseCtx = getDocumentPracticeContext('synapse_integration', 'synapse_integration_q1')!;
const subductionCtx = getDocumentPracticeContext('subduction_water_melting', 'subduction_water_melting_q1')!;

const okResult = (score = 80): ValidationResult => ({
  score, maxScore: 20, passed: true, threshold: 70, errors: [], matchedLois: [], brokenLois: [],
  suggestions: [], label: '', xp: 10, meta: { normalizedLength: 30, docType: 'mixed', actionVerb: 'interpret', checksRun: [] },
});

const failResult = (): ValidationResult => ({
  score: 30, maxScore: 20, passed: false, threshold: 70, errors: [{ code: 'X', severity: 'major', loi: null, messageAr: '' }], matchedLois: [], brokenLois: [2],
  suggestions: [], label: '', xp: 0, meta: { normalizedLength: 5, docType: 'mixed', actionVerb: 'interpret', checksRun: [] },
});

describe('Uracile → proof → recall cycle', () => {
  it('1. uracile réussite → evidence document créée + recall planifié', () => {
    const answer = 'ظهور الوسم أولاً في النواة حيث يُركّب ARNm ثم ظهوره لاحقاً في الهيولى لأن ARNm يحمل نسخة المعلومة، مما يدل على انتقال المعلومة عبر ARNm';
    const { evidence, errorCreated, store, trace } = recordDocumentTrace({
      context: uracileCtx,
      answer,
      validationResult: okResult(),
    });

    expect(trace.valid).toBe(true);
    expect(trace.structuredCriteria.observation).toBe(true);
    expect(trace.structuredCriteria.mechanism).toBe(true);
    expect(trace.structuredCriteria.conclusion).toBe(true);
    expect(evidence).not.toBeNull();
    expect(evidence!.dimension).toBe('document');
    expect(evidence!.source).toBe('document_analysis');
    expect(evidence!.conceptId).toBe('transcription');
    expect(errorCreated).toBe(false);

    const recallItem = store.recalls.find((r) => r.conceptId === 'transcription');
    expect(recallItem).toBeDefined();
    expect(recallItem!.stage).toBe(0);
    expect(recallItem!.completedAt).toBeUndefined();
    expect(recallItem!.sourceEvidenceId).toBe(evidence!.id);
  });

  it('2. uracile échec → error créée, pas d evidence, pas de recall', () => {
    const answer = 'اليوراسيل يدخل النواة';
    const { evidence, errorCreated, store, trace } = recordDocumentTrace({
      context: uracileCtx,
      answer,
      validationResult: failResult(),
    });

    expect(trace.valid).toBe(false);
    expect(evidence).toBeNull();
    expect(errorCreated).toBe(true);
    expect(store.learningErrors.length).toBeGreaterThan(0);
    const err = store.learningErrors.find((e) => e.conceptId === 'transcription');
    expect(err).toBeDefined();
    expect(store.recalls.length).toBe(0);
  });

  it('3. recall planifié → tenté avec succès → evidence methodology + stage avance', () => {
    const answer = 'ظهور الوسم أولاً في النواة حيث يُركّب ARNm ثم ظهوره لاحقاً في الهيولى لأن ARNm يحمل نسخة المعلومة، مما يدل على انتقال المعلومة عبر ARNm';
    const { store: storeAfterDoc } = recordDocumentTrace({
      context: uracileCtx,
      answer,
      validationResult: okResult(),
    });

    const recall = storeAfterDoc.recalls.find((r) => r.conceptId === 'transcription');
    expect(recall).toBeDefined();

    const prompt = getSpacedRecallPrompt('transcription', recall!.stage);
    expect(prompt).toBeDefined();

    const recallAnswer = 'يُركّب ARNm في الاتجاه 5 إلى 3';
    const outcome = recordSpacedRecallAttempt({
      recall: recall!,
      prompt: prompt!,
      answer: recallAnswer,
      now: Date.now(),
    });

    expect(outcome.passed).toBe(true);
    expect(outcome.evidence).not.toBeNull();
    expect(outcome.evidence!.dimension).toBe('methodology');
    expect(outcome.evidence!.source).toBe('word_by_word');
    expect(outcome.recall.stage).toBeGreaterThan(recall!.stage);
    expect(outcome.store.evidences.some((e) => e.id === outcome.evidence!.id)).toBe(true);
  });

  it('4. recall planifié → tenté avec échec → pas d evidence, remis à J+1', () => {
    const now = Date.now();
    const { recall: scheduledRecall } = scheduleSpacedRecall({
      conceptId: 'enzymes',
      reflexId: 'analyse',
      now,
    });
    expect(scheduledRecall).not.toBeNull();

    const prompt = getSpacedRecallPrompt('enzymes', scheduledRecall!.stage)!;
    expect(prompt).toBeDefined();

    const outcome = recordSpacedRecallAttempt({
      recall: scheduledRecall!,
      prompt,
      answer: 'لا أعرف',
      now: now + 1000,
    });

    expect(outcome.passed).toBe(false);
    expect(outcome.evidence).toBeNull();
    expect(outcome.recall.stage).toBe(0);
    expect(outcome.recall.completedAt).toBeUndefined();
  });

  it('5. cycle complet: uracile réussite → recall réussi → 2 evidences cumulées', () => {
    const now = Date.now();

    const docAnswer = 'ظهور الوسم أولاً في النواة حيث يُركّب ARNm ثم ظهوره لاحقاً في الهيولى لأن ARNm يحمل نسخة المعلومة، مما يدل على انتقال المعلومة عبر ARNm';
    const { evidence: docEvidence, store: s1 } = recordDocumentTrace({
      context: uracileCtx,
      answer: docAnswer,
      validationResult: okResult(85),
    });
    expect(docEvidence).not.toBeNull();

    const recall = s1.recalls.find((r) => r.conceptId === 'transcription');
    expect(recall).toBeDefined();

    const prompt = getSpacedRecallPrompt('transcription', recall!.stage);
    expect(prompt).toBeDefined();

    const recallAnswer = 'يُركّب ARNm في الاتجاه 5 إلى 3 على قالب ADN';
    const outcome = recordSpacedRecallAttempt({
      recall: recall!,
      prompt: prompt!,
      answer: recallAnswer,
      now: now + 1000,
    });

    expect(outcome.passed).toBe(true);
    const totalEvidences = outcome.store.evidences;
    expect(totalEvidences.length).toBeGreaterThanOrEqual(2);

    const docEv = totalEvidences.find((e) => e.source === 'document_analysis');
    const recallEv = totalEvidences.find((e) => e.id === outcome.evidence!.id);
    expect(docEv).toBeDefined();
    expect(recallEv).toBeDefined();
    expect(docEv!.conceptId).toBe('transcription');
    expect(recallEv!.dimension).toBe('methodology');

    const mastery = outcome.store.mastery['transcription'];
    expect(mastery).toBeDefined();
    expect(mastery.document.evidenceCount).toBeGreaterThanOrEqual(1);
    const methodEntries = Object.values(mastery.methodology).filter(Boolean);
    const totalMethodEvidences = methodEntries.reduce((sum, c) => sum + c.evidenceCount, 0);
    expect(totalMethodEvidences).toBeGreaterThanOrEqual(1);
  });

  it('6. scheduleSpacedRecall ne duplique pas pour même conceptId actif', () => {
    const r1 = scheduleSpacedRecall({ conceptId: 'transcription', reflexId: 'interpret', now: 1000 });
    expect(r1.recall).not.toBeNull();

    const r2 = scheduleSpacedRecall({ conceptId: 'transcription', reflexId: 'interpret', now: 2000 });
    expect(r2.recall).not.toBeNull();
    expect(r2.recall!.id).toBe(r1.recall!.id);

    const store = loadStore();
    const transcriptionRecalls = store.recalls.filter((r) => r.conceptId === 'transcription' && r.completedAt == null);
    expect(transcriptionRecalls.length).toBe(1);
  });

  it('7. validateDocumentTrace sur uracile rejette réponse sans mécanisme', () => {
    const answer = 'يظهر الوسم أولاً في النواة ثم لاحقاً في الهيولى';
    const trace = validateDocumentTrace({
      context: uracileCtx,
      answer,
      validationResult: okResult(70),
    });
    expect(trace.valid).toBe(false);
    expect(trace.structuredCriteria.observation).toBe(true);
    expect(trace.structuredCriteria.mechanism).toBe(false);
    expect(trace.structuredCriteria.conclusion).toBe(false);
  });

  it('8. synapse preuve document → RecallItem stage 0 planifié', () => {
    const answer = 'PPSE واحد دون العتبة لا يولد كمون عمل. أما تجمع الكمونات بعد المشبكية فيسمح ببلوغ العتبة وتولد كمون عمل في القطعة الابتدائية';
    const { evidence, errorCreated, store, trace } = recordDocumentTrace({
      context: synapseCtx,
      answer,
      validationResult: okResult(80),
    });

    expect(trace.valid).toBe(true);
    expect(evidence).not.toBeNull();
    expect(evidence!.conceptId).toBe('synapse');
    expect(evidence!.dimension).toBe('document');
    expect(errorCreated).toBe(false);

    const recall = store.recalls.find((r) => r.conceptId === 'synapse' && r.completedAt == null);
    expect(recall).toBeDefined();
    expect(recall!.stage).toBe(0);
    expect(recall!.sourceEvidenceId).toBe(evidence!.id);
  });

  it('9. subduction preuve document → RecallItem stage 0 planifié', () => {
    const answer = 'عند اندساس الصفيحة المحيطية الباردة الكثيفة تتحرر معادن ماء من الصخور الغائصة. هذا الماء يخفض درجة انصهار الوشاح فوق اللوح الغائص فيحدث انصهار جزئي يولد صهارة أنديزيتية تصعد وتغذي بركانية القوس.';
    const { evidence, errorCreated, store, trace } = recordDocumentTrace({
      context: subductionCtx,
      answer,
      validationResult: okResult(80),
    });

    expect(trace.valid).toBe(true);
    expect(evidence).not.toBeNull();
    expect(evidence!.conceptId).toBe('subduction');
    expect(evidence!.dimension).toBe('document');
    expect(errorCreated).toBe(false);

    const recall = store.recalls.find((r) => r.conceptId === 'subduction' && r.completedAt == null);
    expect(recall).toBeDefined();
    expect(recall!.stage).toBe(0);
    expect(recall!.sourceEvidenceId).toBe(evidence!.id);
  });
});
