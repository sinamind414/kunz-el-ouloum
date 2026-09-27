// prerequis2AS.lock.test.ts — verrou du SPRINT 1 de l'audit
// docs/analyse/AUDIT_APP_5_LECONS_PRIORITAIRES.md :
//   1) module « تذكير بالمكتسبات القبلية » (génétique 2AS) en tête de l'unité 4
//      + 8 QCM de diagnostic (ids 509-516, unitId 4) ;
//   2) 3 micro-reprises de coopération immunitaire (interleukine, LT4, humoral
//      vs cellulaire) — l'audit avait mesuré 0 micro-reprise sur ces erreurs.
// Toute suppression de ces contenus doit être un choix relu, pas un effet de bord.

import { describe, expect, it } from 'vitest';
import { ACTIVE_LESSONS, LESSON_PROGRESSION } from './activeLessons';
import { MICRO_REMEDIATIONS, getMicroRemediationByCode } from './microRemediations';
import { CONCEPT_ROUTES } from './conceptRoutes';
import { RESUMES_LECONS, CHAPITRES_ANCRAGE } from './resumesLecons';
import { LESSON_GOLD_SUMMARIES } from './lessonGoldSummaries';
import { getUnitLessonSequence } from './unitLessonSequences';
import { SVT_QUIZ_QUESTIONS } from '../quizCorpus';

const CLE = 'prerequis2AS_genetique';

describe('Module prérequis 2AS — leçon active de rappel (U4)', () => {
  const lecon = ACTIVE_LESSONS[CLE];

  it('la leçon existe et porte un titre de rappel des acquis', () => {
    expect(lecon).toBeDefined();
    expect(lecon.id).toBe(CLE);
    expect(lecon.title).toContain('المكتسبات القبلية');
  });

  it('4 blocs : trous + tableau comparatif ABO/HLA + séquence de raisonnement + production', () => {
    expect(lecon.blocks.map((b) => b.type)).toEqual([
      'TEXT_AND_PRODUCE',
      'COMPARISON_TABLE',
      'SEQUENCE_ORDER',
      'TEXT_AND_PRODUCE',
    ]);
  });

  it('le bloc à trous couvre allèle / génotype / phénotype / codominance', () => {
    const b = lecon.blocks[0];
    if (b.type !== 'TEXT_AND_PRODUCE' || !('content' in b)) throw new Error('bloc 1 inattendu');
    expect(b.content.split('[____]').length - 1).toBe(5);
    for (const terme of ['المورثة', 'الأليل', 'النمط الوراثي', 'النمط الظاهري', 'التساوي السيادة']) {
      expect(Object.keys(b.popups), terme).toContain(terme);
    }
    expect(b.microTest.acceptedAnswers).toContain('AB');
  });

  it('le tableau oppose bien ABO (kريات حمراء) et HLA (toutes cellules nucléées)', () => {
    const b = lecon.blocks[1];
    if (b.type !== 'COMPARISON_TABLE') throw new Error('bloc 2 inattendu');
    expect(b.criteria).toHaveLength(4);
    expect(b.conclusionKeywords).toEqual(expect.arrayContaining(['HLA', 'التوافق النسيجي']));
    expect(b.summaryAr).toContain('التوافق في ABO لا يعني التوافق النسيجي');
  });

  it('la séquence de raisonnement va des allèles à l’acceptation du greffon', () => {
    const b = lecon.blocks[2];
    if (b.type !== 'SEQUENCE_ORDER') throw new Error('bloc 3 inattendu');
    expect(b.steps.map((s) => s.expectedOrder)).toEqual([1, 2, 3, 4, 5]);
    expect(b.summaryKeywords).toContain('النمط الفرداني');
  });
});

describe('Module prérequis 2AS — câblage complet dans le parcours', () => {
  it('progression : le module mène au cours الذات واللاذات', () => {
    expect(LESSON_PROGRESSION[CLE]?.nextLessonId).toBe('immunity_self_nonself');
    expect(LESSON_PROGRESSION[CLE]?.completionMessageAr).toBeTruthy();
  });

  it('il est la PREMIÈRE leçon affichée de l’unité 4', () => {
    expect(getUnitLessonSequence(4)[0]).toBe(CLE);
  });

  it('route conceptuelle, résumé ancré au livre (ch. 14 et 23) et résumé d’or', () => {
    expect(CONCEPT_ROUTES['genetique_prerequis']?.lessonId).toBe(CLE);
    expect(CONCEPT_ROUTES['genetique_prerequis']?.unitId).toBe(4);
    expect(RESUMES_LECONS[CLE]?.points.length).toBeGreaterThanOrEqual(4);
    expect(CHAPITRES_ANCRAGE[CLE]).toEqual([14, 23]);
    expect(LESSON_GOLD_SUMMARIES[CLE]?.mechanismAr.length).toBeGreaterThanOrEqual(4);
  });
});

describe('QCM de diagnostic des prérequis (ids 509-516)', () => {
  const diag = SVT_QUIZ_QUESTIONS.filter((q) => q.id >= 509 && q.id <= 516);

  it('8 questions, toutes rattachées à l’unité 4', () => {
    expect(diag).toHaveLength(8);
    for (const q of diag) expect(q.unitId, `Q${q.id}`).toBe(4);
  });

  it('chaque question a 4 options distinctes, un index valide et une explication', () => {
    for (const q of diag) {
      expect(q.options, `Q${q.id}`).toHaveLength(4);
      expect(new Set(q.options).size, `Q${q.id} options dupliquées`).toBe(4);
      expect(q.correctAnswerIndex).toBeGreaterThanOrEqual(0);
      expect(q.correctAnswerIndex).toBeLessThan(4);
      expect(q.explanation.length, `Q${q.id}`).toBeGreaterThan(60);
    }
  });

  it('les notions diagnostiquées couvrent allèle, codominance, HLA et haplotype', () => {
    const texte = diag.map((q) => `${q.questionText} ${q.explanation}`).join(' ');
    for (const notion of ['الأليل', 'السيادة', 'HLA', 'النمط الفرداني', 'النمط الوراثي']) {
      expect(texte, notion).toContain(notion);
    }
  });
});

describe('Micro-reprises de coopération immunitaire (manque n°4 de l’audit)', () => {
  it('les 3 reprises existent avec un concept immunitaire routé', () => {
    for (const cle of ['role_interleukine', 'lt4_chef_orchestre', 'humoral_vs_cellulaire']) {
      const r = MICRO_REMEDIATIONS[cle];
      expect(r, cle).toBeDefined();
      expect(Object.keys(CONCEPT_ROUTES), cle).toContain(r.conceptId);
      expect(r.estimatedMinutes).toBeGreaterThanOrEqual(2);
      expect(r.estimatedMinutes).toBeLessThanOrEqual(4);
      expect(r.acceptedEvidence.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('les codes d’erreur de coopération résolvent la bonne reprise', () => {
    expect(getMicroRemediationByCode('MISSING_INTERLEUKINE')?.id).toBe('mr_role_interleukine');
    expect(getMicroRemediationByCode('CONFUSION_LT4_LT8')?.id).toBe('mr_lt4_chef_orchestre');
    expect(getMicroRemediationByCode('CONFUSION_HUMORAL_CELLULAR')?.id).toBe(
      'mr_humoral_vs_cellulaire',
    );
  });

  it('le contenu corrige l’erreur visée (IL2 ≠ anticorps, LT4 ≠ tueur, sérum = humorale)', () => {
    expect(MICRO_REMEDIATIONS['role_interleukine'].acceptedEvidence).toContain('التكاثر النسيلي');
    expect(MICRO_REMEDIATIONS['lt4_chef_orchestre'].acceptedEvidence).toContain('البرفورين');
    expect(MICRO_REMEDIATIONS['humoral_vs_cellulaire'].acceptedEvidence).toContain('المصل');
  });
});
