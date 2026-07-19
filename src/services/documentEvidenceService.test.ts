// src/services/documentEvidenceService.test.ts
// P1.4 — Speckit DOCUMENTS_VIVANTS §7 : contextes + service de preuve documentaire.
import { describe, it, expect, beforeEach } from 'vitest';
import {
  DOCUMENT_PRACTICE_CONTEXTS,
  getDocumentPracticeContext,
} from '../data/documentPracticeContexts';
import {
  validateDocumentTrace,
  recordDocumentTrace,
} from './documentEvidenceService';
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

const okResult = (score = 80): ValidationResult => ({
  score, maxScore: 20, passed: true, threshold: 70, errors: [], matchedLois: [], brokenLois: [],
  suggestions: [], label: '', xp: 10, meta: { normalizedLength: 10, docType: 'quantitative', actionVerb: 'analyse', checksRun: [] },
});

const failResult = (): ValidationResult => ({
  score: 30, maxScore: 20, passed: false, threshold: 70, errors: [{ code: 'X', severity: 'major', loi: null, messageAr: '' }], matchedLois: [], brokenLois: [2],
  suggestions: [], label: '', xp: 0, meta: { normalizedLength: 10, docType: 'quantitative', actionVerb: 'analyse', checksRun: [] },
});

describe('DocumentPracticeContext', () => {
  it('les 6 contextes prioritaires existent (dont uracile_marque V3)', () => {
    const ids = DOCUMENT_PRACTICE_CONTEXTS.map((c) => c.exerciseId);
    expect(ids).toEqual(['michaelis_courbe', 'curare_table', 'nmj_ppm_courbe', 'sarin_gb_double', 'rifamycine_h1h2', 'uracile_marque']);
  });

  it('chaque contexte a goalAr, 3-6 vocabulaire, expectedEvidence non vide, altAr', () => {
    for (const c of DOCUMENT_PRACTICE_CONTEXTS) {
      expect(c.goalAr.length).toBeGreaterThan(0);
      expect(c.vocabulary.length).toBeGreaterThanOrEqual(3);
      expect(c.vocabulary.length).toBeLessThanOrEqual(6);
      expect(c.expectedEvidence.length).toBeGreaterThan(0);
      expect(c.altAr.length).toBeGreaterThan(0);
    }
  });

  it('reflexId canonique défini pour les contextes applicables', () => {
    for (const c of DOCUMENT_PRACTICE_CONTEXTS) {
      expect(['analyse', 'interpret', 'compare', 'hypothesize', 'explain', 'validate']).toContain(c.reflexId);
    }
  });

  it('getDocumentPracticeContext résout par exerciseId + questionId', () => {
    expect(getDocumentPracticeContext('michaelis_courbe', 'michaelis_courbe_q1')).toBeDefined();
    expect(getDocumentPracticeContext('michaelis_courbe', 'nope')).toBeUndefined();
  });
});

describe('validateDocumentTrace', () => {
  const ctx = getDocumentPracticeContext('michaelis_courbe', 'michaelis_courbe_q1')!;

  it('score >=70 + preuve + vocabulaire → valide', () => {
    const r = validateDocumentTrace({ context: ctx, answer: 'تزداد السرعة مع التركيز وتستقر عند التشبع بفعل الموقع النشط وVmax', validationResult: okResult() });
    expect(r.valid).toBe(true);
    expect(r.foundEvidence.length).toBeGreaterThanOrEqual(1);
  });

  it('score >=70 mais preuve attendue absente → invalide', () => {
    const r = validateDocumentTrace({ context: ctx, answer: 'هذا الإنزيم مهم جداً في الخلية', validationResult: okResult() });
    expect(r.valid).toBe(false);
  });
});

describe('recordDocumentTrace', () => {
  const ctx = getDocumentPracticeContext('michaelis_courbe', 'michaelis_courbe_q1')!;

  it('score <70 : pas de preuve, erreur créée', () => {
    const { evidence, errorCreated } = recordDocumentTrace({ context: ctx, answer: 'x', validationResult: failResult() });
    expect(evidence).toBeNull();
    expect(errorCreated).toBe(true);
  });

  it('réussite documentaire → MasteryEvidence document persistée', () => {
    const { evidence, errorCreated, store } = recordDocumentTrace({
      context: ctx,
      answer: 'تزداد السرعة مع التركيز وتبلغ قيمة قصوى وتستقر عند التشبع عبر الموقع النشط وVmax',
      validationResult: okResult(),
    });
    expect(evidence).not.toBeNull();
    expect(evidence!.dimension).toBe('document');
    expect(evidence!.source).toBe('document_analysis');
    expect(evidence!.conceptId).toBe('unit:3');
    expect(evidence!.reflexId).toBe('analyse');
    expect(errorCreated).toBe(false);
    expect(store.evidences.some((e) => e.id === evidence!.id)).toBe(true);
  });

  it('trace complète mais preuve manquante → pas de preuve valide', () => {
    const { evidence } = recordDocumentTrace({ context: ctx, answer: 'الموقع النشط مهم', validationResult: okResult() });
    expect(evidence).toBeNull();
  });
});
