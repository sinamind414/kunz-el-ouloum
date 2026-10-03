// src/utils/__tests__/morchidGardeFou.test.ts — Verrous du LOT 1 du SpecKit
// (bilan de vérité 2026-10-01) : le tuteur ne fait plus le travail à la place
// de l'élève, et la détresse n'est plus rejetée hors programme.
//   KEO-101 — « لا أعرف » → escalier de 3 indices, jamais la correction au 1ᵉʳ clic
//   KEO-102 — chrono minimal de 90 s avant tout indice sans tentative
//   KEO-201 — lexique affectif (فصحى + darija en détection) → réponse de soutien
//   KEO-205 — une seule voix : plus de lexique marin dans l'accueil
//   N1      — matching par mot entier aussi sur les guides (الباك ≠ لب)
//   N4      — « اختبرني » : plus de substitution silencieuse (fiche au lieu du test)
import { describe, expect, it } from 'vitest';
import { processStudentInput } from '../../smartTutorEngine';
import { getDefaultSession, type BotSession } from '../sessionManager';
import { getBossScenarioById } from '../../data/smartBotData';
import { WELCOME_TEXT } from '../../components/AITutorView';

const note = (t: string): number | null => {
  const m = t.match(/نقاطك لهذه الوضعية: (\d+)\/10/);
  return m ? Number(m[1]) : null;
};

/** Session boss avec chrono maîtrisé : elapsedMs = temps écoulé depuis
 *  l'ouverture de la situation (null = session héritée sans horodatage). */
const bossAt = (elapsedMs: number | null): BotSession => ({
  ...getDefaultSession(),
  activeDomainId: 1,
  mode: 'bac_challenge',
  boss: {
    scenarioId: 'boss1_q1',
    questionIndex: 0,
    totalQuestions: 2,
    score: 0,
    phase: 'answer',
    hintLevel: 0,
    attempts: 0,
    ...(elapsedMs == null ? {} : { openedAt: Date.now() - elapsedMs }),
  },
});

// ---------------------------------------------------------------------------
// KEO-102 : la règle d'or des 20-25 min devient un chrono moteur de 90 s.
// ---------------------------------------------------------------------------
describe('KEO-102 — chrono minimal avant indice', () => {
  it('« لا أعرف » à t+20 s sans tentative → refus + chrono, AUCUNE correction', () => {
    const r = processStudentInput(bossAt(20_000), 'لا أعرف');
    expect(r.action.text).toContain('لن أعطيك التصحيح الآن');
    expect(r.action.text).not.toContain('التصحيح النموذجي');
    expect(note(r.action.text)).toBeNull();
    // la session n'a pas bougé : aucun indice consommé, aucune tentative
    expect(r.session.boss?.hintLevel ?? 0).toBe(0);
    expect(r.session.boss?.attempts ?? 0).toBe(0);
  });

  it('« لا أعرف » à t+95 s → premier indice (pas un refus sec, pas la correction)', () => {
    const r = processStudentInput(bossAt(95_000), 'لا أعرف');
    expect(r.action.text).toContain('مفتاح 1/3');
    expect(r.action.text).not.toContain('التصحيح النموذجي');
    expect(r.session.boss?.hintLevel).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// KEO-101 : escalier de 3 indices, tentatives réelles, correction verrouillée.
// ---------------------------------------------------------------------------
describe('KEO-101 — escalier d’indices et correction verrouillée', () => {
  it('séquence « لا أعرف » ×4 → I1, I2, I3 puis la correction au 4ᵉ (score ≤ 3/10)', () => {
    let session = bossAt(null);
    const steps: string[] = [];
    let lastText = '';
    for (let i = 0; i < 4; i++) {
      const out = processStudentInput(session, 'لا أعرف');
      session = out.session;
      lastText = out.action.text;
      steps.push(out.action.text.includes('التصحيح النموذجي') ? 'CORRECTION' : 'INDICE');
    }
    expect(steps).toEqual(['INDICE', 'INDICE', 'INDICE', 'CORRECTION']);
    // correction débloquée par la voie des indices → score plafonné à 3/10
    const finalNote = note(lastText);
    expect(finalNote).not.toBeNull();
    expect(finalNote!).toBeLessThanOrEqual(3);
  });

  it('une saisie de moins de 15 caractères utiles n’est PAS une tentative', () => {
    const r = processStudentInput(bossAt(null), 'نعم لا فقط');
    expect(r.action.text).toContain('قصير جداً');
    expect(r.session.boss?.attempts ?? 0).toBe(0);
  });

  it('première tentative réelle → enregistrée SANS correction', () => {
    const sc = getBossScenarioById('boss1_q1')!;
    // KEO-106 : la situation demande «بيّن» → la réponse doit contenir un
    // connecteur causal pour être conforme au contrat du verbe.
    const ans = sc.keyPoints.join('؛ ') + '، مما يؤدي إلى استجابة مناعية';
    const r = processStudentInput(bossAt(null), ans);
    expect(r.action.text).toContain('سُجّلت محاولتك الأولى');
    expect(r.action.text).not.toContain('التصحيح النموذجي');
    expect(r.session.boss?.attempts).toBe(1);
  });

  it('deux tentatives réelles → correction avec score PLEIN (10/10)', () => {
    const sc = getBossScenarioById('boss1_q1')!;
    const ans = sc.keyPoints.join('؛ ') + '، مما يؤدي إلى استجابة مناعية';
    const first = processStudentInput(bossAt(null), ans);
    const second = processStudentInput(first.session, ans);
    expect(second.action.text).toContain('التصحيح النموذجي');
    expect(note(second.action.text)).toBe(10);
    // compteurs remis à zéro pour la situation suivante
    expect(second.session.boss?.hintLevel).toBe(0);
    expect(second.session.boss?.attempts).toBe(0);
    expect(second.session.boss?.openedAt).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// KEO-201 : la détresse n'est jamais hors programme (darija = détection,
// sortie strictement فصحى — AGENTS.md règle 5).
// ---------------------------------------------------------------------------
describe('KEO-201 — détresse détectée, jamais rejetée', () => {
  it('« راني خايف من الباك، ما نقدرش نراجع » (darija) → réponse de soutien en 3 temps', () => {
    const r = processStudentInput(getDefaultSession(), 'راني خايف من الباك، ما نقدرش نراجع');
    expect(r.action.text).toContain('سمعتك');
    expect(r.action.text).toContain('10 دقائق');
    expect(r.action.text).not.toContain('خارج قاعدة');
    expect(r.action.text).not.toContain('المجالات الثلاثة');
    // la darija n'est jamais reproduite dans la sortie
    expect(r.action.text).not.toContain('راني');
    expect(r.action.text).not.toContain('نقدرش');
  });

  it('détresse en فصحى (« خائف ») → même réponse de soutien', () => {
    const r = processStudentInput(getDefaultSession(), 'أنا خائف من بكالوريا العلوم');
    expect(r.action.text).toContain('سمعتك');
    expect(r.action.text).not.toContain('خارج قاعدة');
  });

  it('GS-16 : le bruit réel reste hors programme (كرة القدم) — le filtre n’est pas affaibli', () => {
    const r = processStudentInput(getDefaultSession(), 'كرة القدم');
    expect(r.action.text).toContain('خارج قاعدة');
  });
});

// ---------------------------------------------------------------------------
// N1 : matching par mot entier — « الباك » ne détourne plus fiches NI guides.
// ---------------------------------------------------------------------------
describe('N1 — matching par mot entier (guides et RAG)', () => {
  it('« الباك » ne renvoie NI la carte du noyau NI un guide d’étude', () => {
    const r = processStudentInput(getDefaultSession(), 'الباك');
    expect(r.action.text).not.toContain('بنية الكرة');
    expect(r.action.sources?.[0]?.type).not.toBe('guide');
  });
});

// ---------------------------------------------------------------------------
// N4 : « اختبرني » — fin des substitutions silencieuses.
// ---------------------------------------------------------------------------
describe('N4 — intention « اختبرني » sans substitution', () => {
  it('sujet identifié sans QCM (study_planning) → indisponibilité DITE, jamais une fiche', () => {
    const r = processStudentInput(getDefaultSession(), 'اختبرني في تنظيم وقت المراجعة');
    expect(r.action.quiz).toBeFalsy();
    expect(r.action.text).toContain('لا يوجد اختبار جاهز');
    expect(r.session.mode).not.toBe('quiz');
  });

  it('sujet non identifié (« اختبرني » seul) → demande de clarification, pas la 1ʳᵉ carte du domaine', () => {
    const r = processStudentInput({ ...getDefaultSession(), activeDomainId: 1 }, 'اختبرني');
    expect(r.action.quiz).toBeFalsy();
    expect(r.action.text).toContain('لم أحدّد الموضوع');
    expect(r.session.mode).not.toBe('quiz');
  });
});

// ---------------------------------------------------------------------------
// KEO-205 : une seule voix — l'accueil du tuteur abandonne le lexique marin.
// ---------------------------------------------------------------------------
describe('KEO-205 — accueil sans lexique marin (charte Boussole v2)', () => {
  it('WELCOME_TEXT ne contient ni «بحار» ni drapeau pirate, et nomme le المرشد الذكي', () => {
    expect(WELCOME_TEXT).not.toContain('بحار');
    expect(WELCOME_TEXT).not.toContain('🏴');
    expect(WELCOME_TEXT).toContain('المرشد الذكي');
  });
});
