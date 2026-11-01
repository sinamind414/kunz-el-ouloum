// enzymeInhibitors.lock.test.ts — verrous de la leçon active « المثبطات الإنزيمية »
// (audit des 5 leçons prioritaires, items 7 et 8 du backlog, sprint 5).
//
// Ce que le sprint promet et que ce fichier fige :
//   • une leçon active de 5 blocs qui va du document guidé à la production BAC ;
//   • le critère de décision Vmax → Km présent dans CHAQUE support (leçon,
//     tableau comparatif, méthode, résumé, micro-remédiations, rappels espacés) ;
//   • l'atelier des 6 courbes réellement composé de 6 questions distinctes ;
//   • la distinction « استقرار par تشبع » vs « استقرار par نفاد الركيزة »,
//     erreur la plus coûteuse au corrigé ;
//   • l'ancrage livre [10, 12] et le câblage complet (route, séquence U3,
//     progression, résumé, QCM 525-529).

import { describe, expect, it } from 'vitest';
import { ACTIVE_LESSONS, LESSON_PROGRESSION } from './activeLessons';
import { CONCEPT_ROUTES } from './conceptRoutes';
import { getUnitLessonSequence } from './unitLessonSequences';
import { RESUMES_LECONS } from './resumesLecons';
import { MICRO_REMEDIATIONS } from './microRemediations';
import { SPACED_RECALL_PROMPTS } from './spacedRecallPrompts';
import { sourceLivre } from './bookIndex';
import { SVT_QUIZ_QUESTIONS } from '../quizCorpus';

const LESSON_ID = 'enzyme_inhibitors';
const lecon = ACTIVE_LESSONS[LESSON_ID];

describe('leçon active — المثبطات الإنزيمية (U3)', () => {
  it('existe, titrée sur la décision tنافسي / لا تنافسي, 5 blocs ordonnés', () => {
    expect(lecon).toBeDefined();
    expect(lecon.id).toBe(LESSON_ID);
    expect(lecon.title).toContain('المثبطات');
    expect(lecon.title).toContain('تنافسي');
    expect(lecon.blocks).toHaveLength(5);
    expect(lecon.blocks.map((b) => b.type)).toEqual([
      'GUIDED_DOC_QA',
      'COMPARISON_TABLE',
      'SEQUENCE_ORDER',
      'GUIDED_DOC_QA',
      'TEXT_AND_PRODUCE',
    ]);
  });

  it('le bloc 1 fait lire les 3 courbes : analyse → comparaison Vmax/Km → type de mثبط', () => {
    const b = lecon.blocks[0] as any;
    expect(b.questions).toHaveLength(3);
    expect(b.questions.map((q: any) => q.verbAr)).toEqual(['حلل', 'قارن', 'استنتج']);
    const kw = b.questions.flatMap((q: any) => q.requiredKeywords as string[]);
    expect(kw).toContain('Vmax');
    expect(kw).toContain('Km');
    expect(kw).toContain('تنافسي');
    expect(kw).toContain('الموقع الفعال');
  });

  it('le tableau comparatif couvre les 5 critères attendus au corrigé', () => {
    const b = lecon.blocks[1] as any;
    expect(b.criteria.map((c: any) => c.id)).toEqual([
      'site_fixation',
      'ressemblance',
      'effet_vmax',
      'effet_km',
      'exces_substrat',
    ]);
    // le sens de la comparaison ne doit pas s'inverser silencieusement :
    // colonne droite = compétitif (Vmax inchangée), colonne gauche = non compétitif.
    const vmax = b.criteria.find((c: any) => c.id === 'effet_vmax');
    expect(vmax.rightExpected.join(' ')).toContain('لا تتغير');
    expect(vmax.leftExpected.join(' ')).toContain('تنخفض');
  });

  it('la méthode de lecture est une séquence de 5 étapes : axes → شاهد → Vmax → Km → استنتاج', () => {
    const b = lecon.blocks[2] as any;
    expect(b.steps).toHaveLength(5);
    expect(b.steps.map((s: any) => s.expectedOrder)).toEqual([1, 2, 3, 4, 5]);
    expect(b.steps[2].labelAr).toContain('Vmax');
    expect(b.steps[3].labelAr).toContain('Km');
  });

  it('atelier des 6 courbes : 6 questions distinctes, une par type de graphe', () => {
    const b = lecon.blocks[3] as any;
    const ids = b.questions.map((q: any) => q.id);
    expect(ids).toHaveLength(6);
    expect(new Set(ids).size).toBe(6);
    expect(ids).toEqual([
      'atelier_courbe1_substrat',
      'atelier_courbe2_temperature',
      'atelier_courbe3_ph',
      'atelier_courbe4_competitif',
      'atelier_courbe5_non_competitif',
      'atelier_courbe6_produit_temps',
    ]);
  });

  it('l atelier sépare explicitement تشبع (courbe 1) et نفاد الركيزة (courbe 6)', () => {
    const b = lecon.blocks[3] as any;
    const c1 = b.questions[0];
    const c6 = b.questions[5];
    expect(c1.requiredKeywords).toContain('التشبع');
    expect(c6.requiredKeywords).toContain('نفاد');
    expect(c6.errorHintAr).toContain('الزمن');
    expect(b.summaryAr).toContain('نفاد الركيزة');
  });

  it('les deux documents de la leçon pointent des SVG réellement présents dans le dépôt', async () => {
    const fs = await import('node:fs');
    const b0 = lecon.blocks[0] as any;
    const b3 = lecon.blocks[3] as any;
    for (const src of [b0.doc.assetSrc, b3.doc.assetSrc]) {
      expect(src.startsWith('/assets/images/schemas/')).toBe(true);
      expect(fs.existsSync(`public${src}`), src).toBe(true);
    }
    expect(b0.doc.assetSrc).not.toBe(b3.doc.assetSrc);
  });

  it('la production finale attend un raisonnement complet, pas un seul mot', () => {
    const b = lecon.blocks[4] as any;
    expect(b.prompt).toContain('Vmax');
    expect(b.acceptedAnswers.length).toBeGreaterThanOrEqual(2);
    expect(b.errorHint).toContain('تنافسي');
  });
});

describe('câblage de la leçon dans le parcours', () => {
  it('clôt la séquence de l unité 3 et y est atteinte depuis la leçon enzymatique', () => {
    const seq = getUnitLessonSequence(3);
    expect(seq[seq.length - 1]).toBe(LESSON_ID);
    expect(LESSON_PROGRESSION['d1-u3-l1-enzyme']?.nextLessonId).toBe(LESSON_ID);
    expect(LESSON_PROGRESSION[LESSON_ID]?.nextLessonId).toBeUndefined();
    expect(LESSON_PROGRESSION[LESSON_ID]?.recommendedReflexId).toBe('interpret');
  });

  it('route conceptuelle sur l unité 3 avec exercice documentaire et carte de survie', () => {
    const r = CONCEPT_ROUTES[LESSON_ID];
    expect(r.unitId).toBe(3);
    expect(r.lessonId).toBe(LESSON_ID);
    expect(r.documentExerciseId).toBe('michaelis_courbe');
    expect(r.survivalCardId).toBe('sc_enzymes');
  });

  it('ancrage livre documenté sur les chapitres 10 et 12', () => {
    const s = sourceLivre(LESSON_ID, '');
    expect(s?.mode).toBe('ancre-documentee');
    expect(s?.chapitres.map((c) => c.chapter)).toEqual([10, 12]);
  });

  it('résumé de 6 points, terme BAC sur Vmax/Km', () => {
    const r = RESUMES_LECONS[LESSON_ID];
    expect(r.points).toHaveLength(6);
    expect(r.objectif.length).toBeGreaterThanOrEqual(15);
    expect(r.termeBac).toContain('Vmax');
    expect(r.points.join(' ')).toContain('الموقع الفعال');
  });

  it('les 2 micro-remédiations de l item 7 existent et visent ce concept', () => {
    const a = MICRO_REMEDIATIONS['inhib_competitif_vs_non'];
    const b = MICRO_REMEDIATIONS['lire_vmax_km'];
    for (const m of [a, b]) {
      expect(m).toBeDefined();
      expect(m.conceptId).toBe(LESSON_ID);
      expect(m.estimatedMinutes).toBeGreaterThanOrEqual(2);
      expect(m.estimatedMinutes).toBeLessThanOrEqual(4);
      expect(m.triggerCodes.length).toBeGreaterThanOrEqual(2);
      expect(m.acceptedEvidence.length).toBeGreaterThanOrEqual(3);
    }
    expect(a.explanationAr).toContain('Vmax');
    expect(b.explanationAr).toContain('Vmax/2');
  });

  it('4 rappels espacés, étapes 0 à 3', () => {
    const p = SPACED_RECALL_PROMPTS[LESSON_ID];
    expect(p).toHaveLength(4);
    expect(p.map((x) => x.stage)).toEqual([0, 1, 2, 3]);
    for (const x of p) {
      expect(x.conceptId).toBe(LESSON_ID);
      expect(x.minEvidence).toBeGreaterThanOrEqual(2);
      expect(x.acceptedEvidence.length).toBeGreaterThanOrEqual(x.minEvidence);
    }
  });
});

describe('QCM 525-529 — banque de l unité 3 sur les mثبطات', () => {
  const ajoutes = SVT_QUIZ_QUESTIONS.filter((q) => q.id >= 525 && q.id <= 529);

  it('5 questions, toutes sur l unité 3, ids uniques et contigus', () => {
    expect(ajoutes).toHaveLength(5);
    expect(ajoutes.map((q) => q.id)).toEqual([525, 526, 527, 528, 529]);
    for (const q of ajoutes) expect(q.unitId).toBe(3);
  });

  it('chaque question : 4 options, index correct valide, explication argumentée', () => {
    for (const q of ajoutes) {
      expect(q.options).toHaveLength(4);
      expect(q.correctAnswerIndex).toBeGreaterThanOrEqual(0);
      expect(q.correctAnswerIndex).toBeLessThan(4);
      expect(q.explanation.length).toBeGreaterThanOrEqual(40);
      expect(new Set(q.options).size).toBe(4);
    }
  });

  it('couvre les 5 pièges visés : تنافسي, لا تنافسي, Km, نفاد الركيزة, pH', () => {
    const texte = ajoutes.map((q) => `${q.questionText} ${q.options.join(' ')} ${q.explanation}`).join(' ');
    for (const attendu of ['تنافسي', 'لا تنافسي', 'Km', 'نفاد الركيزة', 'الموقع الفعال']) {
      expect(texte, attendu).toContain(attendu);
    }
  });
});
