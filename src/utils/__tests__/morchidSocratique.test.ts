// src/utils/__tests__/morchidSocratique.test.ts — Verrous du LOT 2 du SpecKit
// (2026-10-01) : la démarche scientifique et le mode socratique.
//   KEO-103 — une question de sondage (probe) avant tout contenu de fiche
//   KEO-105 — triade imposée : ألاحظ → أستنتج → أخلص (GS-04)
//   KEO-106 — contrat du verbe de consigne : détecter, afficher, imposer (GS-05)
//   KEO-104 — bilan final CAUSE / ACTION / PORTE (GS-08)
import { describe, expect, it } from 'vitest';
import { processStudentInput } from '../../smartTutorEngine';
import { getDefaultSession, type BotSession } from '../sessionManager';
import { getBossScenarioById } from '../../data/smartBotData';

const bossAt = (scenarioId: string): BotSession => ({
  ...getDefaultSession(),
  activeDomainId: 1,
  mode: 'bac_challenge',
  boss: {
    scenarioId,
    questionIndex: 0,
    totalQuestions: 2,
    score: 0,
    phase: 'answer',
    hintLevel: 0,
    attempts: 0,
    openedAt: Date.now() - 120_000, // délai 90 s dépassé
  },
});

// ---------------------------------------------------------------------------
// KEO-103 — mode socratique : probe avant contenu (GS-01).
// ---------------------------------------------------------------------------
describe('KEO-103 — probe socratique avant tout contenu', () => {
  it('GS-01 : « ما هو الاستنساخ؟ » → la probe SEULE, zéro shortAnswer', () => {
    const r = processStudentInput(getDefaultSession(), 'ما هو الاستنساخ؟');
    expect(r.action.text).toContain('سؤال قبل الشرح');
    expect(r.action.text).toContain('أين يحدث الاستنساخ');
    expect(r.action.text).not.toContain('كلمات مفتاحية'); // pas de contenu de fiche
    expect(r.session.pendingProbeCardId).toBe('protein_synthesis');
  });

  it('la tentative de l’élève → verdict en 1 ligne PUIS le contenu', () => {
    const probe = processStudentInput(getDefaultSession(), 'ما هو الاستنساخ؟');
    const r = processStudentInput(probe.session, 'في النواة');
    expect(r.action.text).toContain('إجابتك في محلّها');
    expect(r.action.text).toContain('كلمات مفتاحية'); // contenu livré après la tentative
    expect(r.session.pendingProbeCardId).toBeFalsy();
  });

  it('tentative erronée → le JUUste attendu est nommé, puis le contenu', () => {
    const probe = processStudentInput(getDefaultSession(), 'ما هو الاستنساخ؟');
    const r = processStudentInput(probe.session, 'في الهيولى');
    expect(r.action.text).toContain('إجابتك غير موفقة');
    expect(r.action.text).toContain('النواة');
    expect(r.action.text).toContain('كلمات مفتاحية');
  });

  it('« اشرح لي » explicite → contenu complet, contournement journalisé (R2)', () => {
    const probe = processStudentInput(getDefaultSession(), 'ما هو الاستنساخ؟');
    const r = processStudentInput(probe.session, 'اشرح لي');
    expect(r.action.text).toContain('كلمات مفتاحية');
    expect(r.session.probeBypassed).toContain('protein_synthesis');
    // la carte contournée ne re-probe plus
    const again = processStudentInput(r.session, 'ما هو الاستنساخ؟');
    expect(again.action.text).toContain('كلمات مفتاحية');
    expect(again.action.text).not.toContain('سؤال قبل الشرح');
  });

  it('« راجع X » (quick action de révision) → contenu direct, pas de probe', () => {
    const r = processStudentInput(getDefaultSession(), 'راجع الغوص');
    expect(r.action.text).toContain('كلمات مفتاحية');
    expect(r.action.text).not.toContain('سؤال قبل الشرح');
    expect(r.session.pendingProbeCardId).toBeFalsy();
  });

  it('une question micro ciblée garde sa réponse ciblée (pas de probe)', () => {
    // « ما دور CMH؟ » est une question ciblée → réponse micro directe.
    const r = processStudentInput(getDefaultSession(), 'ما دور CMH؟');
    expect(r.action.text).not.toContain('سؤال قبل الشرح');
  });
});

// ---------------------------------------------------------------------------
// KEO-105 — triade imposée sur les questions d'analyse (GS-04).
// ---------------------------------------------------------------------------
describe('KEO-105 — triade ألاحظ → أستنتج → أخلص', () => {
  it('GS-04 : « فسّر نتائج هذه التجربة » → demande du bloc 1 SEUL, «لأنّ» interdit', () => {
    const r = processStudentInput(getDefaultSession(), 'فسّر نتائج هذه التجربة');
    expect(r.action.text).toContain('الخطوة 1 · ألاحظ');
    expect(r.action.text).toContain('لأنّ');
    expect(r.action.text).not.toContain('كلمات مفتاحية'); // aucun contenu livré
    expect(r.session.triadeStep).toBe(1);
  });

  it('«لأنّ» dans le bloc 1 → refus et retour au donné, sans corriger le fond', () => {
    const t1 = processStudentInput(getDefaultSession(), 'فسّر نتائج هذه التجربة');
    const r = processStudentInput(t1.session, 'لأن الإنزيم يعمل بسرعة كبيرة');
    expect(r.action.text).toContain('ليس بعد');
    expect(r.action.text).toContain('الملاحظة');
    expect(r.session.triadeStep).toBe(1); // on reste au bloc 1
  });

  it('parcours complet : observation → interprétation → conclusion', () => {
    let s = processStudentInput(getDefaultSession(), 'فسّر نتائج هذه التجربة').session;
    const obs = processStudentInput(s, 'نلاحظ أن استهلاك الأكسجين يرتفع من الدقيقة صفر إلى الدقيقة عشرة');
    expect(obs.action.text).toContain('الخطوة 2');
    expect(obs.session.triadeStep).toBe(2);
    const interp = processStudentInput(obs.session, 'لأن الميتوكوندري تستعمل الأكسجين كمستقبل نهائي للإلكترونات');
    expect(interp.action.text).toContain('الخطوة 3');
    expect(interp.session.triadeStep).toBe(3);
    const concl = processStudentInput(interp.session, 'ومنه نستنتج أن الخلايا تقوم بتنفس هوائي');
    expect(concl.action.text).toContain('أكملتَ التثليث');
    expect(concl.session.triadeStep).toBeFalsy();
  });

  it('les questions de MÉTHODE ne sont pas déviées (« كيف أحلل وثيقة؟ »)', () => {
    const r = processStudentInput(getDefaultSession(), 'كيف أحلل وثيقة؟');
    expect(r.action.sources?.[0]?.type).toBe('methodology');
    expect(r.session.triadeStep).toBeFalsy();
  });

  // S-03 (SpecKit 002, fusion master) : famille FERMÉE — حلّل/استخرج = on
  // décrit, on n'explique pas. «لأنّ» est refusé à l'étape 2 AUSSI.
  it('famille fermée (حلّل) : «لأنّ» REFUSÉ à l’étape 2, relation acceptée', () => {
    const open = processStudentInput(getDefaultSession(), 'حلّل نتائج هذه التجربة');
    expect(open.session.triadeClosed).toBe(true);
    const obs = processStudentInput(open.session, 'نلاحظ أن استهلاك الأكسجين يرتفع من الدقيقة صفر إلى الدقيقة عشرة');
    expect(obs.action.text).toContain('عائلة مغلقة');
    // «لأنّ» à l'étape 2 → refus, on reste bloqué.
    const refus = processStudentInput(obs.session, 'لأن الميتوكوندري تستهلك الأكسجين');
    expect(refus.action.text).toContain('العائلة المغلقة');
    expect(refus.session.triadeStep).toBe(2);
    // L'interaction sans causal → acceptée, on passe à la conclusion.
    const ok = processStudentInput(obs.session, 'شدة استهلاك الأكسجين تتناسب مع نشاط الميتوكوندري');
    expect(ok.session.triadeStep).toBe(3);
  });

  it('famille fermée : la triade se referme proprement (drapeau remis à zéro)', () => {
    let s = processStudentInput(getDefaultSession(), 'حلّل نتائج هذه التجربة').session;
    s = processStudentInput(s, 'نلاحظ ارتفاع الاستهلاك من صفر إلى عشرة').session;
    s = processStudentInput(s, 'الاستهلاك يتناسب مع نشاط الخلية').session;
    const done = processStudentInput(s, 'ومنه نستنتج أن الخلايا نشيطة');
    expect(done.action.text).toContain('أكملتَ التثليث');
    expect(done.session.triadeStep).toBeFalsy();
    expect(done.session.triadeClosed).toBe(false);
  });

  it('famille OUVERTE (فسّر) : le causal reste EXIGÉ à l’étape 2 (contraste)', () => {
    const open = processStudentInput(getDefaultSession(), 'فسّر نتائج هذه التجربة');
    expect(open.session.triadeClosed).toBe(false);
    const obs = processStudentInput(open.session, 'نلاحظ ارتفاع الاستهلاك من صفر إلى عشرة');
    const sansCausal = processStudentInput(obs.session, 'الميتوكوندري نشيطة في هذه المرحلة');
    expect(sansCausal.action.text).toContain('رابطاً سببياً');
    expect(sansCausal.session.triadeStep).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// KEO-106 — contrat du verbe de consigne (GS-05).
// ---------------------------------------------------------------------------
describe('KEO-106 — contrat du verbe de consigne', () => {
  it('le contrat s’affiche AVANT que l’élève écrive (démarrage du défi)', () => {
    const r = processStudentInput({ ...getDefaultSession(), activeDomainId: 1 }, 'تحدي BAC');
    expect(r.action.text).toContain('عقد الفعل «بيّن»');
    expect(r.action.text).toContain('يُمنع');
  });

  it('GS-05 : réponse sans lien causal à «بيّن» → écart nommé, PAS de note, réécriture', () => {
    const sc = getBossScenarioById('boss1_q1')!;
    const r = processStudentInput(bossAt('boss1_q1'), sc.keyPoints.join('؛ '));
    expect(r.action.text).toContain('توقّف عند الفعل');
    expect(r.action.text).toContain('عقد الفعل «بيّن»');
    expect(r.action.text).not.toContain('التصحيح النموذجي');
    // l'avertissement ne consomme pas la tentative
    expect(r.session.boss?.attempts ?? 0).toBe(0);
    expect(r.session.boss?.verbWarnings).toBe(1);
  });

  it('au 2ᵉ écart on avance (trappe anti-frustration), puis la tentative compte', () => {
    const sc = getBossScenarioById('boss1_q1')!;
    const w = processStudentInput(bossAt('boss1_q1'), sc.keyPoints.join('؛ '));
    const r = processStudentInput(w.session, sc.keyPoints.join('؛ '));
    expect(r.action.text).toContain('سُجّلت محاولتك الأولى');
    expect(r.session.boss?.attempts).toBe(1);
  });

  it('réponse CONFORME (lien causal) → tentative enregistrée directement', () => {
    const sc = getBossScenarioById('boss1_q1')!;
    const ans = sc.keyPoints.join('؛ ') + '، مما يؤدي إلى استجابة مناعية';
    const r = processStudentInput(bossAt('boss1_q1'), ans);
    expect(r.action.text).toContain('سُجّلت محاولتك الأولى');
    expect(r.session.boss?.verbWarnings ?? 0).toBe(0);
  });

  it('verbe interdisant le causal («صف») : «لأنّ» dans la réponse → écart nommé', () => {
    const r = processStudentInput(bossAt('boss3_q3'), 'الظاهرة تتغير لأن السبب كذا وهذا تفسير');
    expect(r.action.text).toContain('توقّف عند الفعل');
    expect(r.session.boss?.attempts ?? 0).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// S-05 / S-04 / S-10 (SpecKit 002, master 81984de — fusion 2026-10-01).
// ---------------------------------------------------------------------------
describe('S-05 — rappel actif en fin d’explication', () => {
  it('toute fiche livrée se termine par une tâche de rappel (صح أم خطأ)', () => {
    const r = processStudentInput(getDefaultSession(), 'راجع الغوص');
    expect(r.action.text).toContain('قبل أن ننتقل');
    expect(r.action.text).toContain('صح أم خطأ');
  });

  it('le contenu servi après la probe porte AUSSI la tâche de rappel', () => {
    const probe = processStudentInput(getDefaultSession(), 'ما هو الاستنساخ؟');
    const r = processStudentInput(probe.session, 'في النواة');
    expect(r.action.text).toContain('كلمات مفتاحية');
    expect(r.action.text).toContain('صح أم خطأ');
  });
});

// ---------------------------------------------------------------------------
// KEO-104 — bilan final CAUSE / ACTION / PORTE (GS-08).
// ---------------------------------------------------------------------------
describe('KEO-104 — aucun bilan sans cause, action et porte', () => {
  const runChallenge = (): string => {
    let s = processStudentInput({ ...getDefaultSession(), activeDomainId: 1 }, 'تحدي BAC').session;
    // Situation 1 : deux tentatives faibles (avec causal : conformes au verbe).
    let r = processStudentInput(s, 'محاولة أولى ضعيفة مما يؤدي إلى شيء عام');
    r = processStudentInput(r.session, 'محاولة ثانية ضعيفة مما يؤدي إلى شيء عام');
    // Situation 2 : deux tentatives faibles → fin du défi.
    r = processStudentInput(r.session, 'محاولة أولى في الوضعية الثانية لأن المناعة خلطية');
    r = processStudentInput(r.session, 'محاولة ثانية في الوضعية الثانية لأن المناعة خلطية');
    return r.action.text;
  };

  it('GS-08 : le bilan final contient CAUSE chiffrée, ACTION ≤ 15 min et PORTE', () => {
    const text = runChallenge();
    expect(text).toContain('انتهى تحدي BAC');
    expect(text).toContain('السبب المسمّى');
    expect(text).toContain('وضعيات، غابت عن إجابتك النقطة');
    expect(text).toContain('عملك الآن (10 دقائق)');
    expect(text).toContain('ومنه نستنتج أنّ');
    expect(text).toContain('الدرس المعني');
    expect(text).toContain('مفتاح الدرس'); // lessonKey explicite, jamais inventé
  });

  it('S-04 : le bilan final TYPE l’erreur (استرجاع/تحليل) en première ligne', () => {
    const text = runChallenge();
    expect(text).toContain('النوع:');
    // Les situations du domaine 1 portent des verbes d'exploitation → type A.
    expect(text).toContain('التحليل');
  });

  it('S-10 : score < 50 % → le protocole d’étude s’impose en tête des actions', () => {
    let s = processStudentInput({ ...getDefaultSession(), activeDomainId: 1 }, 'تحدي BAC').session;
    let r = processStudentInput(s, 'محاولة أولى ضعيفة مما يؤدي إلى شيء عام');
    r = processStudentInput(r.session, 'محاولة ثانية ضعيفة مما يؤدي إلى شيء عام');
    r = processStudentInput(r.session, 'محاولة أولى في الوضعية الثانية لأن المناعة خلطية');
    r = processStudentInput(r.session, 'محاولة ثانية في الوضعية الثانية لأن المناعة خلطية');
    expect(r.action.quickActions?.[0]).toBe('كيف أدرس العلوم؟');
  });

  it('la correction intermédiaire affiche le contrat de la situation SUIVANTE', () => {
    let s = processStudentInput({ ...getDefaultSession(), activeDomainId: 1 }, 'تحدي BAC').session;
    let r = processStudentInput(s, 'محاولة أولى مما يؤدي إلى شيء');
    r = processStudentInput(r.session, 'محاولة ثانية مما يؤدي إلى شيء');
    expect(r.action.text).toContain('السؤال التالي');
    expect(r.action.text).toContain('عقد الفعل'); // contrat de la situation suivante
  });
});
