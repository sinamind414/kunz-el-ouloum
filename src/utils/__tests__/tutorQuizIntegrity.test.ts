// src/utils/__tests__/tutorQuizIntegrity.test.ts — Verrous des recommandations de l'audit المرشد.
//   #1 : options mélangées (la bonne réponse n'est plus toujours A) + notation cohérente.
//   #2 : logTutorActivity pousse les activités du tutor dans la file /api/student/sync.
//   #3/#4 : défi BAC auto-évalué + XP à la première complétion seulement (anti-farm).
//   #5 : lacunes de corpus comblées (استنساخ المعلومة الوراثية, المتقدرة).
import { describe, expect, it } from 'vitest';
import { processStudentInput, shuffledView } from '../../smartTutorEngine';
import { getDefaultSession, loadSession } from '../../utils/sessionManager';
import { getQuestionsForDomain, getQuestionById, getBossScenarioById, DOMAINS } from '../../data/smartBotData';
import { logTutorActivity } from '../../utils/studentAccount';
import { answerTutorQuestion } from '../../smartTutorEngine';

describe('REC #1 — mélange déterministe des options de quiz', () => {
  it('la bonne réponse n\'est plus toujours en position A (audit : 66/66 en A)', () => {
    for (const d of DOMAINS) {
      const positions = new Set<number>();
      let zeros = 0;
      let n = 0;
      for (const q of getQuestionsForDomain(d.id)) {
        const v = shuffledView(q);
        positions.add(v.correctIndex);
        if (v.correctIndex === 0) zeros += 1;
        n += 1;
        // Invariant pédagogique : le TEXTE de la bonne réponse reste le bon texte.
        expect(v.options[v.correctIndex]).toBe(q.options[q.correctIndex]);
      }
      expect(positions.size).toBeGreaterThanOrEqual(2);
      expect(zeros).toBeLessThan(n);
    }
  });

  it('déterministe : même question → même ordre affiché (prompt = notation)', () => {
    const q = getQuestionsForDomain(1)[0];
    expect(shuffledView(q)).toEqual(shuffledView(q));
  });

  it('aller-retour complet : diagnostique domaine 1 répondu via les options affichées → 23/23, XP 230', () => {
    let cur = processStudentInput(getDefaultSession(), 'التخصص الوظيفي للبروتينات').session;
    cur = processStudentInput(cur, 'اختبار تشخيصي').session;
    let correct = 0;
    let xp = 0;
    let guard = 0;
    while (guard++ < 30) {
      const qid = cur.currentQuiz?.questionId;
      expect(qid).toBeTruthy();
      const q = getQuestionById(qid as string);
      expect(q).toBeTruthy();
      const letter = ['A', 'B', 'C', 'D'][shuffledView(q as NonNullable<typeof q>).correctIndex];
      const res = processStudentInput(cur, letter);
      cur = res.session;
      if (res.action.text.includes('صحيحة')) correct += 1;
      if (res.action.reward) {
        xp = res.action.reward.xpGained;
        expect(res.action.reward.score).toBe(23);
        expect(res.action.reward.total).toBe(23);
        expect(res.action.reward.kind).toBe('quiz');
        expect(res.action.reward.domain).toBe('التخصص الوظيفي للبروتينات');
        break;
      }
    }
    expect(correct).toBe(23);
    expect(xp).toBe(230);
  });
});

describe('REC #3/#4 — défi BAC auto-évalué, XP anti-farm', () => {
  function runBoss(startSession: ReturnType<typeof getDefaultSession>): { xp: number; text: string } {
    let cur = processStudentInput(startSession, 'التخصص الوظيفي للبروتينات').session;
    cur = processStudentInput(cur, 'تحدي BAC').session;
    let xp = -1;
    let text = '';
    let guard = 0;
    while (guard++ < 10) {
      const sid = cur.boss?.scenarioId;
      expect(sid).toBeTruthy();
      const scen = getBossScenarioById(sid as string);
      expect(scen).toBeTruthy();
      const res = processStudentInput(cur, (scen as NonNullable<typeof scen>).correction);
      cur = res.session;
      text = res.action.text;
      if (res.action.reward) {
        xp = res.action.reward.xpGained;
        expect(res.action.reward.kind).toBe('mission');
        break;
      }
    }
    return { xp, text };
  }

  it('répondre le contenu des corrections → 2 scénarios × 10 pts = 20 XP à la 1re complétion', () => {
    localStorage.clear();
    const first = runBoss(getDefaultSession());
    expect(first.xp).toBe(20);
  });

  it('rejouer le même défi → 0 XP + mention « بدون XP إضافي » (completedBac rempli)', () => {
    const second = runBoss(loadSession());
    expect(second.xp).toBe(0);
    expect(second.text).toContain('بدون XP إضافي');
    const persisted = loadSession();
    expect(persisted.completedBac).toContain('1');
  });
});

describe('REC #2 — le المرشد part dans la file serveur', () => {
  it('logTutorActivity empile un event quiz dans boussole_activity_queue', () => {
    localStorage.clear();
    logTutorActivity('quiz', 23, 23, 'التخصص الوظيفي للبروتينات');
    const raw = JSON.parse(localStorage.getItem('boussole_activity_queue') || '[]') as Array<{
      kind: string;
      payload: { type: string; payload: { title: string; score: number; total: number; percent: number; domain: string } };
    }>;
    const mine = raw.filter((i) => i.kind === 'event' && i.payload.type === 'quiz' && i.payload.payload.title.includes('المرشد'));
    expect(mine.length).toBe(1);
    expect(mine[0].payload.payload.score).toBe(23);
    expect(mine[0].payload.payload.total).toBe(23);
    expect(mine[0].payload.payload.percent).toBe(100);
    expect(mine[0].payload.payload.domain).toBe('التخصص الوظيفي للبروتينات');
  });
});

describe('REC #5 — lacunes de corpus comblées', () => {
  it('استنساخ المعلومة الوراثية et المتقدرة trouvent désormais une réponse', () => {
    for (const q of ['كيف يتم استنساخ المعلومة الوراثية؟', 'ما هو التحول الطاقوي في المتقدرة؟']) {
      const a = answerTutorQuestion(q);
      expect(a.text.includes('لم أجد إجابة دقيقة'), q).toBe(false);
    }
  });
});
