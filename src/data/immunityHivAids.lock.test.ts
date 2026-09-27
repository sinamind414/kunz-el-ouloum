// immunityHivAids.lock.test.ts — verrous du dossier VIH / SIDA (unité 4).
//
// Item 3 bis de l'audit : c'était le plus gros écart offre/demande du corpus
// (~700 K vues cumulées chez trois chaînes concurrentes contre 4 QCM réels).
//
// Ce fichier fige ce que le sprint promet :
//   • une leçon de 5 blocs : courbes → cycle viral → séropositif/SIDA →
//     diagnostic → production BAC ;
//   • les trois repères chiffrés ou nommés qui tombent en examen : gp120/CD4,
//     الانقلاب المصلي, seuil 200 LT4/mm³ ;
//   • la distinction « موجب المصل ≠ مريض بالسيدا », erreur la plus coûteuse ;
//   • le fait que LT4 soit traitée comme cellule ACTIVATRICE (interleukine 2),
//     seule explication de l'effondrement simultané des deux immunités ;
//   • l'ancrage livre [22, 23] et le câblage complet.

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

const LESSON_ID = 'immunity_hiv_aids';
const lecon = ACTIVE_LESSONS[LESSON_ID];
const tout = JSON.stringify(lecon);

describe('leçon active — VIH / السيدا (U4)', () => {
  it('existe, 5 blocs, enchaînement documents → cycle → comparaison → diagnostic → production', () => {
    expect(lecon).toBeDefined();
    expect(lecon.blocks).toHaveLength(5);
    expect(lecon.blocks.map((b) => b.type)).toEqual([
      'GUIDED_DOC_QA',
      'SEQUENCE_ORDER',
      'COMPARISON_TABLE',
      'GUIDED_DOC_QA',
      'TEXT_AND_PRODUCE',
    ]);
  });

  it('les 3 repères d examen sont présents : gp120/CD4, الانقلاب المصلي, seuil 200', () => {
    expect(tout).toContain('gp120');
    expect(tout).toContain('CD4');
    expect(tout).toContain('الانقلاب المصلي');
    expect(tout).toContain('200');
  });

  it('bloc 1 : lecture des 3 courbes en analyse → explication → déduction', () => {
    const b = lecon.blocks[0] as any;
    expect(b.questions).toHaveLength(3);
    expect(b.questions.map((q: any) => q.verbAr)).toEqual(['حلل', 'فسر', 'استنتج']);
    const kw = b.questions.flatMap((q: any) => q.requiredKeywords as string[]);
    expect(kw).toContain('الحمولة الفيروسية');
    expect(kw).toContain('LT4');
    expect(kw).toContain('انتهازية');
  });

  it('bloc 2 : cycle viral en 6 étapes, dans l ordre biologique (fixation → bourgeonnement)', () => {
    const b = lecon.blocks[1] as any;
    expect(b.steps).toHaveLength(6);
    expect(b.steps.map((s: any) => s.expectedOrder)).toEqual([1, 2, 3, 4, 5, 6]);
    expect(b.steps[0].labelAr).toContain('gp120');
    expect(b.steps[2].labelAr).toContain('النسخ العكسي');
    expect(b.steps[3].labelAr).toContain('اندماج');
    expect(b.steps[5].labelAr).toContain('التبرعم');
    // la nature rétrovirale doit être explicitée, pas seulement illustrée
    expect(b.summaryKeywords).toContain('الاستنساخ العكسي');
  });

  it('bloc 3 : séropositif vs malade — la contagiosité est identique dans les deux colonnes', () => {
    const b = lecon.blocks[2] as any;
    expect(b.criteria.map((c: any) => c.id)).toEqual([
      'vih_presence_ac',
      'vih_taux_lt4',
      'vih_charge_virale',
      'vih_symptomes',
      'vih_contagion',
    ]);
    const contagion = b.criteria.find((c: any) => c.id === 'vih_contagion');
    expect(contagion.leftExpected).toContain('ينقل العدوى');
    expect(contagion.rightExpected).toContain('ينقل العدوى');
    const lt4 = b.criteria.find((c: any) => c.id === 'vih_taux_lt4');
    expect(lt4.leftExpected.join(' ')).toContain('200');
    expect(b.summaryAr).toContain('والعكس غير صحيح');
  });

  it('bloc 4 : diagnostic — ELISA/Western blot = anticorps, PCR = ARN viral, fenêtre sérologique', () => {
    const b = lecon.blocks[3] as any;
    expect(b.questions).toHaveLength(3);
    expect(b.summaryAr).toContain('PCR');
    expect(b.summaryAr).toContain('Western blot');
    const fenetre = b.questions[1];
    expect(fenetre.requiredKeywords).toContain('الانقلاب المصلي');
    expect(fenetre.errorHintAr).toContain('PCR');
  });

  it('bloc 5 : la production cible LT4 comme cellule activatrice (interleukine), pas exécutrice', () => {
    const b = lecon.blocks[4] as any;
    expect(b.prompt).toContain('LT4');
    expect(b.acceptedAnswers.join(' ')).toContain('الأنترلوكين');
    expect(b.errorHint).toContain('LTc');
    expect(b.errorHint).toContain('LB');
  });

  it('les deux figures VIH existent réellement dans public/', async () => {
    const fs = await import('node:fs');
    const srcs = [(lecon.blocks[0] as any).doc.assetSrc, (lecon.blocks[1] as any).assetSrc];
    for (const src of srcs) {
      expect(src.startsWith('/assets/images/schemas/domaine1_immunite/')).toBe(true);
      expect(fs.existsSync(`public${src}`), src).toBe(true);
    }
    expect(srcs[0]).not.toBe(srcs[1]);
  });
});

describe('câblage du dossier VIH', () => {
  it('placée dans l unité 4 juste avant la synthèse d unité', () => {
    const seq = getUnitLessonSequence(4);
    expect(seq).toContain(LESSON_ID);
    expect(seq[seq.indexOf(LESSON_ID) + 1]).toBe('immunity_cooperation');
    expect(LESSON_PROGRESSION[LESSON_ID]?.nextLessonId).toBe('immunity_cooperation');
  });

  it('route conceptuelle + document d entraînement dédié', () => {
    const r = CONCEPT_ROUTES[LESSON_ID];
    expect(r.unitId).toBe(4);
    expect(r.documentExerciseId).toBe('vih_evolution_courbes');
    const doc = DOCUMENT_PRACTICE_CONTEXTS.find((d) => d.exerciseId === 'vih_evolution_courbes');
    expect(doc).toBeDefined();
    expect(doc!.conceptId).toBe(LESSON_ID);
    expect(doc!.unitId).toBe(4);
    expect(doc!.documentType).toBe('curve');
    expect(doc!.expectedEvidence.length).toBeGreaterThanOrEqual(4);
    expect(doc!.trapAr).toContain('موجب المصل');
  });

  it('ancrage livre documenté sur les chapitres 22 et 23', () => {
    const s = sourceLivre(LESSON_ID, '');
    expect(s?.mode).toBe('ancre-documentee');
    expect(s?.chapitres.map((c) => c.chapter)).toEqual([22, 23]);
  });

  it('résumé (6 points) et résumé d or cohérents', () => {
    const r = RESUMES_LECONS[LESSON_ID];
    expect(r.points).toHaveLength(6);
    expect(r.termeBac).toContain('الانقلاب المصلي');
    const g = LESSON_GOLD_SUMMARIES[LESSON_ID];
    expect(g.mechanismAr).toHaveLength(5);
    expect(g.vocabulary.length).toBeLessThanOrEqual(8);
    expect(g.commonErrorAr).toContain('موجب المصل');
  });

  it('les 2 micro-remédiations du dossier existent et visent ce concept', () => {
    for (const k of ['seropositif_vs_sida', 'charge_virale_vs_lt4']) {
      const m = MICRO_REMEDIATIONS[k];
      expect(m, k).toBeDefined();
      expect(m.conceptId).toBe(LESSON_ID);
      expect(m.estimatedMinutes).toBeGreaterThanOrEqual(2);
      expect(m.estimatedMinutes).toBeLessThanOrEqual(4);
      expect(m.acceptedEvidence.length).toBeGreaterThanOrEqual(3);
    }
    expect(MICRO_REMEDIATIONS['seropositif_vs_sida'].explanationAr).toContain('200');
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

describe('QCM 530-539 — le déficit de banque sur le VIH est comblé', () => {
  const ajoutes = SVT_QUIZ_QUESTIONS.filter((q) => q.id >= 530 && q.id <= 539);

  it('10 questions unité 4, ids contigus', () => {
    expect(ajoutes).toHaveLength(10);
    expect(ajoutes.map((q) => q.id)).toEqual([530, 531, 532, 533, 534, 535, 536, 537, 538, 539]);
    for (const q of ajoutes) expect(q.unitId).toBe(4);
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

  it('couvre le cycle, le diagnostic, le seuil et le piège séropositif/SIDA', () => {
    const t = ajoutes.map((q) => `${q.questionText} ${q.options.join(' ')} ${q.explanation}`).join(' ');
    for (const attendu of [
      'gp120',
      'الاستنساخ العكسي',
      'الانقلاب المصلي',
      'موجب المصل',
      '200',
      'ELISA',
      'PCR',
      'الأنترلوكين',
    ]) {
      expect(t, attendu).toContain(attendu);
    }
  });

  it('la banque VIH de l unité 4 dépasse désormais la douzaine de questions', () => {
    const u4 = SVT_QUIZ_QUESTIONS.filter(
      (q) =>
        q.unitId === 4 &&
        /VIH|السيدا|فيروس|موجب المصل|LT4/.test(`${q.questionText} ${q.options.join(' ')}`),
    );
    expect(u4.length).toBeGreaterThanOrEqual(12);
  });
});
