// aminoAcidBehavior.lock.test.ts — verrou du SPRINT 3 de l'audit
// docs/analyse/AUDIT_APP_5_LECONS_PRIORITAIRES.md, constat n°1 et item 5 :
// « سلوك الأحماض الأمينية / pHi » était la notion n°1 du plan de renforcement
// et comptait ZÉRO occurrence dans l'application (0 leçon, 0 résumé, 0 QCM
// ciblé, 0 micro-remédiation). Ce verrou fige la correction, ancrée sur le
// chapitre 8 du livre officiel (« سلوك الأحماض الأمينية في الوسط » :
// électrophorèse de l'alanine à pH 2, 6 et 12).
import { describe, expect, it } from 'vitest';
import { ACTIVE_LESSONS, LESSON_PROGRESSION } from './activeLessons';
import { CONCEPT_ROUTES } from './conceptRoutes';
import { DOCUMENT_PRACTICE_CONTEXTS } from './documentPracticeContexts';
import { RESUMES_LECONS, CHAPITRES_ANCRAGE } from './resumesLecons';
import { LESSON_GOLD_SUMMARIES } from './lessonGoldSummaries';
import { MICRO_REMEDIATIONS } from './microRemediations';
import { SPACED_RECALL_PROMPTS } from './spacedRecallPrompts';
import { getUnitLessonSequence } from './unitLessonSequences';
import { SVT_QUIZ_QUESTIONS } from '../quizCorpus';

const CLE = 'amino_acid_behavior';

describe('Leçon active — سلوك الأحماض الأمينية / pHi (U2)', () => {
  const lecon = ACTIVE_LESSONS[CLE];

  it('existe, avec 4 blocs : document guidé, méthode ordonnée, comparatif, production', () => {
    expect(lecon).toBeDefined();
    expect(lecon.blocks.map((b) => b.type)).toEqual([
      'GUIDED_DOC_QA',
      'SEQUENCE_ORDER',
      'COMPARISON_TABLE',
      'TEXT_AND_PRODUCE',
    ]);
  });

  it('le document guidé suit la démarche du livre : analyse → charge → règle', () => {
    const b = lecon.blocks[0];
    if (b.type !== 'GUIDED_DOC_QA') throw new Error('bloc 1 inattendu');
    expect(b.questions.map((q) => q.id)).toEqual([
      'phi_analyse_migration',
      'phi_deduire_charge',
      'phi_regle_generale',
    ]);
    expect(b.questions[0].verbAr).toBe('حلل');
    for (const q of b.questions) {
      expect(q.validationMode, q.id).toBe('keywords');
      expect(q.requiredKeywords?.length ?? 0, q.id).toBeGreaterThanOrEqual(3);
      expect(q.errorHintAr, q.id).toBeTruthy();
    }
    // La règle attendue doit être exigée explicitement (pas d'à-peu-près).
    expect(b.questions[2].requiredKeywords).toEqual(
      expect.arrayContaining(['pHi', 'أقل', 'أعلى']),
    );
  });

  it('la méthode BAC compte 5 étapes ordonnées, du pH du tampon au sens de migration', () => {
    const b = lecon.blocks[1];
    if (b.type !== 'SEQUENCE_ORDER') throw new Error('bloc 2 inattendu');
    expect(b.steps.map((s) => s.expectedOrder)).toEqual([1, 2, 3, 4, 5]);
    expect(b.steps.map((s) => s.id)).toEqual([
      'lire_ph',
      'lire_phi',
      'comparer',
      'charge',
      'sens',
    ]);
    expect(b.summaryKeywords).toEqual(
      expect.arrayContaining(['pHi', 'الشحنة', 'المهبط', 'المصعد']),
    );
  });

  it('le comparatif oppose pH < pHi et pH > pHi sur 4 critères dont le sens de migration', () => {
    const b = lecon.blocks[2];
    if (b.type !== 'COMPARISON_TABLE') throw new Error('bloc 3 inattendu');
    expect(b.criteria.map((c) => c.id)).toEqual([
      'charge_nette',
      'groupement',
      'sens_migration',
      'exemple_ala',
    ]);
    const sens = b.criteria.find((c) => c.id === 'sens_migration')!;
    expect(sens.leftExpected.join(' ')).toContain('المهبط');
    expect(sens.rightExpected.join(' ')).toContain('المصعد');
    // Le piège classique : inverser les deux pôles.
    expect(sens.leftExpected.join(' ')).not.toContain('المصعد');
  });

  it('la production finale porte sur un mélange à séparer (3 pHi différents)', () => {
    const b = lecon.blocks[3];
    if (b.type !== 'TEXT_AND_PRODUCE') throw new Error('bloc 4 inattendu');
    if (!('prompt' in b)) throw new Error('forme « production libre » attendue');
    expect(b.prompt).toContain('pHi');
    expect(b.acceptedAnswers.length).toBeGreaterThanOrEqual(2);
    expect(b.errorHint).toBeTruthy();
  });
});

describe('Câblage de la leçon dans l’application', () => {
  it('ouvre l’unité 2 dans la séquence officielle', () => {
    expect(getUnitLessonSequence(2)[0]).toBe(CLE);
  });

  it('a une progression vers la leçon structure/fonction', () => {
    expect(LESSON_PROGRESSION[CLE]?.nextLessonId).toBe('protein_structure_function');
    expect(LESSON_PROGRESSION[CLE]?.completionMessageAr).toBeTruthy();
  });

  it('a une route conceptuelle vers un document d’électrophorèse réel', () => {
    const route = CONCEPT_ROUTES[CLE];
    expect(route?.unitId).toBe(2);
    expect(route?.lessonId).toBe(CLE);
    const doc = DOCUMENT_PRACTICE_CONTEXTS.find(
      (c) => c.exerciseId === route?.documentExerciseId,
    );
    expect(doc, 'document de pratique introuvable').toBeDefined();
    expect(doc!.unitId).toBe(2);
    expect(doc!.correctionAr).toContain('pHi');
  });

  it('a un résumé ancré au chapitre 8 du livre officiel', () => {
    expect(CHAPITRES_ANCRAGE[CLE]).toEqual([8]);
    const r = RESUMES_LECONS[CLE];
    expect(r).toBeDefined();
    expect(r.points.length).toBeGreaterThanOrEqual(4);
    expect(r.termeBac).toContain('pHi');
  });

  it('a un résumé d’or avec la preuve documentaire de l’alanine', () => {
    const g = LESSON_GOLD_SUMMARIES[CLE];
    expect(g).toBeDefined();
    expect(g.evidenceAr).toContain('pHi');
    expect(g.mechanismAr.length).toBeGreaterThanOrEqual(4);
    expect(g.vocabulary).toEqual(expect.arrayContaining(['pHi', 'المهبط', 'المصعد']));
  });

  it('a 4 rappels espacés (J+1 → J+14) sur le concept', () => {
    const prompts = SPACED_RECALL_PROMPTS[CLE];
    expect(prompts).toHaveLength(4);
    expect(prompts.map((p) => p.stage)).toEqual([0, 1, 2, 3]);
  });
});

describe('Remédiation et évaluation du pHi', () => {
  it('2 micro-remédiations couvrent la règle et la confusion des électrodes', () => {
    const mrs = Object.values(MICRO_REMEDIATIONS).filter((m) => m.conceptId === CLE);
    expect(mrs.map((m) => m.id).sort()).toEqual([
      'mr_phi_charge_regle',
      'mr_sens_migration_electrode',
    ]);
    for (const m of mrs) {
      expect(m.estimatedMinutes, m.id).toBeGreaterThanOrEqual(2);
      expect(m.estimatedMinutes, m.id).toBeLessThanOrEqual(4);
      expect(m.triggerCodes.length, m.id).toBeGreaterThanOrEqual(2);
      expect(m.acceptedEvidence.length, m.id).toBeGreaterThanOrEqual(3);
    }
  });

  it('8 QCM (517-524) de l’unité 2 évaluent la règle pH/pHi', () => {
    const qcm = SVT_QUIZ_QUESTIONS.filter((q) => q.id >= 517 && q.id <= 524);
    expect(qcm).toHaveLength(8);
    for (const q of qcm) {
      expect(q.unitId, `QCM ${q.id}`).toBe(2);
      expect(q.options.length, `QCM ${q.id}`).toBe(4);
      expect(q.explanation.length, `QCM ${q.id}`).toBeGreaterThanOrEqual(40);
    }
    const texte = qcm.map((q) => `${q.questionText} ${q.explanation}`).join(' ');
    expect(texte).toContain('pHi');
    expect(texte).toContain('المصعد');
    expect(texte).toContain('المهبط');
    expect(texte).toContain('أمفوتيري');
  });

  it('le mot « pHi » n’est plus absent de l’application (constat n°1 de l’audit)', () => {
    const sources = [
      JSON.stringify(ACTIVE_LESSONS[CLE]),
      JSON.stringify(RESUMES_LECONS[CLE]),
      JSON.stringify(LESSON_GOLD_SUMMARIES[CLE]),
      JSON.stringify(SVT_QUIZ_QUESTIONS.filter((q) => q.id >= 517 && q.id <= 524)),
    ];
    for (const s of sources) expect(s).toContain('pHi');
  });
});
