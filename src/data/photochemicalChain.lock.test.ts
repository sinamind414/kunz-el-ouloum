// photochemicalChain.lock.test.ts — verrous de la leçon « السلسلة الكيموضوئية »
// (audit, items 9, 10 et 11 du backlog, sprint 7).
//
// Contexte : المرحلة الكيموضوئية est la notion n°1 du classement de difficulté
// (83 points) et U6+U7 pèsent 39 % de l'épreuve. L'app couvrait les PREUVES
// expérimentales (Hill/Ruben, Jagendorf, Calvin) mais pas la CHAÎNE elle-même.
//
// Ce fichier fige :
//   • la chaîne complète en 8 étapes, dans l'ordre biologique et non le numérique ;
//   • l'eau comme donneur d'électrons et NADP⁺ comme accepteur final ;
//   • les DEUX sens de circulation de H⁺ (pompage puis retour), et le fait que
//     ATP naît du retour, pas de la lumière ;
//   • la synthèse U6/U7 (item 9) : même chimiosmose, donneurs et accepteurs
//     différents ;
//   • les 3 micro-fiches de l'item 10 et l'ancrage livre [33].

import { describe, expect, it } from 'vitest';
import { ACTIVE_LESSONS, LESSON_PROGRESSION } from './activeLessons';
import { CONCEPT_ROUTES } from './conceptRoutes';
import { getUnitLessonSequence } from './unitLessonSequences';
import { RESUMES_LECONS } from './resumesLecons';
import { LESSON_GOLD_SUMMARIES } from './lessonGoldSummaries';
import { MICRO_REMEDIATIONS } from './microRemediations';
import { SPACED_RECALL_PROMPTS } from './spacedRecallPrompts';
import { DOCUMENT_PRACTICE_CONTEXTS } from './documentPracticeContexts';
import { sourceLivre } from './bookIndex';
import { SVT_QUIZ_QUESTIONS } from '../quizCorpus';

const LESSON_ID = 'photochemical_chain';
const lecon = ACTIVE_LESSONS[LESSON_ID];

describe('leçon active — السلسلة الكيموضوئية (U6)', () => {
  it('existe, 5 blocs : document → séquence → bilan → synthèse U6/U7 → production', () => {
    expect(lecon).toBeDefined();
    expect(lecon.blocks).toHaveLength(5);
    expect(lecon.blocks.map((b) => b.type)).toEqual([
      'GUIDED_DOC_QA',
      'SEQUENCE_ORDER',
      'TEXT_AND_PRODUCE',
      'COMPARISON_TABLE',
      'TEXT_AND_PRODUCE',
    ]);
  });

  it('bloc 1 : origine (eau) → trajet (PSI/NADP) → couplage (gradient)', () => {
    const b = lecon.blocks[0] as any;
    expect(b.questions).toHaveLength(3);
    expect(b.questions.map((q: any) => q.verbAr)).toEqual(['حدد', 'حلل', 'فسر']);
    const kw = b.questions.flatMap((q: any) => q.requiredKeywords as string[]);
    expect(kw).toContain('الماء');
    expect(kw).toContain('NADP');
    expect(kw).toContain('الكرة المذنبة');
  });

  it('bloc 2 : 8 étapes, photolyse en 3e position et ATP en dernier', () => {
    const b = lecon.blocks[1] as any;
    expect(b.steps).toHaveLength(8);
    expect(b.steps.map((s: any) => s.expectedOrder)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(b.steps[2].labelAr).toContain('التحلل الضوئي للماء');
    expect(b.steps[5].labelAr).toContain('PSI');
    expect(b.steps[7].labelAr).toContain('ATP');
    // l'ordre PSII → PSI doit être respecté malgré la numérotation historique
    const psii = b.steps.findIndex((s: any) => s.labelAr.includes('PSII'));
    const psi = b.steps.findIndex((s: any) => s.labelAr.includes('PSI ') || s.id.includes('psi'));
    expect(psii).toBeLessThan(psi);
  });

  it('bloc 3 : le bilan distingue produits et déchet (l O2 n est pas un produit utile)', () => {
    const b = lecon.blocks[2] as any;
    expect(b.content).toContain('[____]');
    expect(Object.keys(b.popups)).toContain('الأكسجين');
    expect(b.microTest.prompt).toContain('فضلة');
    expect(b.microTest.acceptedAnswers.length).toBeGreaterThanOrEqual(2);
  });

  it('bloc 4 (item 9) : synthèse U6/U7 sur 5 critères, ATP synthase identique des deux côtés', () => {
    const b = lecon.blocks[3] as any;
    expect(b.criteria.map((c: any) => c.id)).toEqual([
      'photo_cmp_membrane',
      'photo_cmp_source',
      'photo_cmp_accepteur',
      'photo_cmp_compartiment',
      'photo_cmp_enzyme',
    ]);
    const enzyme = b.criteria.find((c: any) => c.id === 'photo_cmp_enzyme');
    // le seul critère où les deux colonnes coïncident : c'est tout l'argument
    expect(enzyme.leftExpected).toContain('الكرة المذنبة');
    expect(enzyme.rightExpected).toContain('الكرة المذنبة');
    const acc = b.criteria.find((c: any) => c.id === 'photo_cmp_accepteur');
    expect(acc.leftExpected.join(' ')).toContain('الأكسجين');
    expect(acc.rightExpected.join(' ')).toContain('NADP');
  });

  it('bloc 5 : la production sépare le rôle de la lumière du mécanisme de l ATP', () => {
    const b = lecon.blocks[4] as any;
    expect(b.prompt).toContain('جاغندورف');
    expect(b.acceptedAnswers.join(' ')).toContain('تدرج');
    expect(b.errorHint).toContain('الكرة المذنبة');
  });

  it('les deux figures existent réellement dans public/', async () => {
    const fs = await import('node:fs');
    const srcs = [(lecon.blocks[0] as any).doc.assetSrc, (lecon.blocks[3] as any).assetSrc];
    for (const src of srcs) {
      expect(src.startsWith('/assets/images/schemas/domaine2_energie/')).toBe(true);
      expect(fs.existsSync(`public${src}`), src).toBe(true);
    }
    expect(srcs[0]).not.toBe(srcs[1]);
  });
});

describe('câblage de la chaîne photochimique', () => {
  it('insérée dans l unité 6 entre Jagendorf (preuve) et Calvin (consommateur)', () => {
    const seq = getUnitLessonSequence(6);
    const i = seq.indexOf(LESSON_ID);
    expect(i).toBeGreaterThan(-1);
    expect(seq[i - 1]).toBe('d2-u6-l2-jagendorf');
    expect(seq[i + 1]).toBe('d2-u6-l3-calvin');
    expect(LESSON_PROGRESSION['d2-u6-l2-jagendorf']?.nextLessonId).toBe(LESSON_ID);
    expect(LESSON_PROGRESSION[LESSON_ID]?.nextLessonId).toBe('d2-u6-l3-calvin');
  });

  it('route conceptuelle + document d entraînement dédié', () => {
    const r = CONCEPT_ROUTES[LESSON_ID];
    expect(r.unitId).toBe(6);
    expect(r.documentExerciseId).toBe('photochemical_chain_membrane');
    const doc = DOCUMENT_PRACTICE_CONTEXTS.find(
      (d) => d.exerciseId === 'photochemical_chain_membrane',
    );
    expect(doc).toBeDefined();
    expect(doc!.unitId).toBe(6);
    expect(doc!.conceptId).toBe(LESSON_ID);
    expect(doc!.expectedEvidence).toHaveLength(4);
    expect(doc!.trapAr).toContain('الضوء لا يركب ATP');
  });

  it('ancrage livre documenté sur le chapitre 33', () => {
    const s = sourceLivre(LESSON_ID, '');
    expect(s?.mode).toBe('ancre-documentee');
    expect(s?.chapitres.map((c) => c.chapter)).toEqual([33]);
  });

  it('résumé et résumé d or : les deux sens de H⁺ sont explicites', () => {
    const r = RESUMES_LECONS[LESSON_ID];
    expect(r.points).toHaveLength(6);
    expect(r.termeBac).toContain('الكرة المذنبة');
    const g = LESSON_GOLD_SUMMARIES[LESSON_ID];
    expect(g.mechanismAr).toHaveLength(5);
    expect(g.commonErrorAr).toContain('الحشوة');
    expect(g.vocabulary.length).toBeLessThanOrEqual(8);
  });

  it('les 3 micro-fiches de l item 10 existent et visent ce concept', () => {
    const cles = ['photolyse_origine_o2', 'gradient_h_direction', 'psii_avant_psi'];
    for (const k of cles) {
      const m = MICRO_REMEDIATIONS[k];
      expect(m, k).toBeDefined();
      expect(m.conceptId).toBe(LESSON_ID);
      expect(m.estimatedMinutes).toBeGreaterThanOrEqual(2);
      expect(m.estimatedMinutes).toBeLessThanOrEqual(4);
      expect(m.acceptedEvidence.length).toBeGreaterThanOrEqual(3);
    }
    expect(MICRO_REMEDIATIONS['photolyse_origine_o2'].explanationAr).toContain('روبن');
    expect(MICRO_REMEDIATIONS['gradient_h_direction'].explanationAr).toContain('جاغندورف');
    expect(MICRO_REMEDIATIONS['psii_avant_psi'].explanationAr).toContain('تاريخي');
  });

  it('4 rappels espacés, étapes 0 à 3', () => {
    const p = SPACED_RECALL_PROMPTS[LESSON_ID];
    expect(p).toHaveLength(4);
    expect(p.map((x) => x.stage)).toEqual([0, 1, 2, 3]);
    for (const x of p) {
      expect(x.conceptId).toBe(LESSON_ID);
      expect(x.acceptedEvidence.length).toBeGreaterThanOrEqual(x.minEvidence);
    }
  });
});

describe('QCM 540-549 — chaîne photochimique et pont U6/U7', () => {
  const ajoutes = SVT_QUIZ_QUESTIONS.filter((q) => q.id >= 540 && q.id <= 549);

  it('10 questions : 8 sur l unité 6 et 2 sur l unité 7 (la synthèse)', () => {
    expect(ajoutes).toHaveLength(10);
    expect(ajoutes.filter((q) => q.unitId === 6)).toHaveLength(8);
    expect(ajoutes.filter((q) => q.unitId === 7)).toHaveLength(2);
  });

  it('forme : 4 options distinctes, index valide, explication argumentée', () => {
    for (const q of ajoutes) {
      expect(q.options).toHaveLength(4);
      expect(new Set(q.options).size).toBe(4);
      expect(q.correctAnswerIndex).toBeGreaterThanOrEqual(0);
      expect(q.correctAnswerIndex).toBeLessThan(4);
      expect(q.explanation.length).toBeGreaterThanOrEqual(40);
    }
  });

  it('couvre les pièges visés : origine de l O2, ordre PSII/PSI, sens de H⁺, Jagendorf, Mitchell', () => {
    const t = ajoutes.map((q) => `${q.questionText} ${q.options.join(' ')} ${q.explanation}`).join(' ');
    for (const attendu of [
      'التحلل الضوئي للماء',
      'PSII',
      'PSI',
      'NADP',
      'الكرة المذنبة',
      'جاغندورف',
      'ميتشل',
      'التجويف',
    ]) {
      expect(t, attendu).toContain(attendu);
    }
  });
});
