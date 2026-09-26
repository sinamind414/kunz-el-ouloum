// src/utils/__tests__/morchidCorrectifs.test.ts — Verrous des correctifs de
// l'audit du المرشد الذكي (2026-09-25). Un seul fichier pour que chaque bug
// confirmé (B2, B3, B5, B6, B7, B7b) et chaque correction scientifique (S1–S8)
// ne puisse plus revenir silencieusement.
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'fs';
import {
  processStudentInput,
  findBestKnowledgeCard,
  gradeQuizAnswer,
  startDiagnostic,
  shuffledView,
  getDailyMission,
  couperExtrait,
  SNIPPET_MAX,
} from '../../smartTutorEngine';
import {
  getDefaultSession,
  startDomainSession,
  type BotSession,
} from '../../utils/sessionManager';
import {
  getQuestionsForDomain,
  getBossScenarioById,
  DOMAINS,
} from '../../data/smartBotData';

const note = (t: string): number | null => {
  const m = t.match(/نقاطك لهذه الوضعية: (\d+)\/10/);
  return m ? Number(m[1]) : null;
};

const boss = (): BotSession => ({
  ...getDefaultSession(),
  activeDomainId: 1,
  mode: 'bac_challenge',
  boss: { scenarioId: 'boss1_q1', questionIndex: 0, totalQuestions: 2, score: 0, phase: 'answer' },
});

// ---------------------------------------------------------------------------
// B2 : une réponse qui NIE chaque point-clé ne doit plus être créditée 10/10.
// ---------------------------------------------------------------------------

describe('B2 — négation non créditée (audit Morchid)', () => {
  const sc = getBossScenarioById('boss1_q1')!;

  it('réponse niant tous les points-clés → 0/10', () => {
    const nie = processStudentInput(
      boss(),
      sc.keyPoints.map((k) => 'لا، ليس صحيحاً أن ' + k).join('؛ '),
    );
    expect(note(nie.action.text)).toBe(0);
  });

  it('réponse reprenant les points-clés → 10/10 (non régressif)', () => {
    const bon = processStudentInput(boss(), sc.keyPoints.join('؛ '));
    expect(note(bon.action.text)).toBe(10);
  });

  it('1 point nié + 3 affirmés → les 3 affirmés restent crédités (10/10)', () => {
    const mixte = processStudentInput(
      boss(),
      'لا، ' + sc.keyPoints[0] + '، لكن ' + sc.keyPoints.slice(1).join('، '),
    );
    expect(note(mixte.action.text)).toBe(10);
  });

  it('inversion de polarité sur un point positif → non crédité (« لا » adjacent)', () => {
    // keyPoint positif « CMH/HLA يعرض المستضادات… » ; l'élève l'inverse.
    expect(sc.keyPoints[0]).toContain('يعرض');
    const inv = processStudentInput(boss(), 'لا، ' + sc.keyPoints[0].replace('يعرض', 'لا يعرض'));
    expect(note(inv.action.text)).toBeLessThan(10);
  });
});

// ---------------------------------------------------------------------------
// B3 : matching par mot entier — « الباك » ne déclenche plus la carte du noyau.
// ---------------------------------------------------------------------------

describe('B3 — matching par mot entier (audit Morchid)', () => {
  it('« الباك » ne renvoie aucune carte (sous-chaîne « لب »)', () => {
    expect(findBestKnowledgeCard('الباك', null)).toBe(null);
  });

  it('« اللب » trouve toujours la carte du noyau terrestre', () => {
    expect(findBestKnowledgeCard('اللب', null)?.title).toContain('بنية الكرة');
  });

  it('« ماهو اللب » (en phrase) trouve le noyau', () => {
    expect(findBestKnowledgeCard('ماهو اللب', null)?.title).toContain('بنية الكرة');
  });

  it('« ما هو الغوص؟ » trouve la carte subduction (ponctuation arabe)', () => {
    // Régression introduite puis corrigée : ؟ (U+061F) est dans le bloc arabe.
    expect(findBestKnowledgeCard('ما هو الغوص؟', null)?.title).toContain('الغوص');
  });

  it('processStudentInput("الباك") ne sort plus le cours du noyau', () => {
    const out = processStudentInput(getDefaultSession(), 'الباك');
    expect(out.action.text).not.toContain('بنية الكرة الأرضية');
  });
});

// ---------------------------------------------------------------------------
// B5 : rentrer à l'accueil conserve erreurs / completedBac / date (anti-farm).
// ---------------------------------------------------------------------------

describe('B5 — anti-farm préservé à l\'accueil (audit Morchid)', () => {
  it('les données de progression survivent à la navigation vers l\'accueil', () => {
    const avant: BotSession = {
      ...getDefaultSession(),
      activeDomainId: 1,
      mistakes: ['subduction'],
      completedBac: ['1'],
      lastMissionDate: '2026-09-25',
    };
    const home = processStudentInput(avant, 'القائمة الرئيسية');
    expect(home.session.mistakes).toContain('subduction');
    expect(home.session.completedBac).toContain('1');
    expect(home.session.lastMissionDate).toBe('2026-09-25');
  });
});

// ---------------------------------------------------------------------------
// B6 : un quiz à 0 XP émet tout de même un reward (onXPGained → journalisation).
// ---------------------------------------------------------------------------

describe('B6 — activité 0-XP journalisée (audit Morchid)', () => {
  it('un reward est émis même à 0 bonnes réponses', () => {
    let cur = startDiagnostic(startDomainSession(1)).session;
    let rewardVu = false;
    for (let i = 0; i < 25 && cur.currentQuiz; i++) {
      const cq = getQuestionsForDomain(1).find((x) => x.id === cur.currentQuiz!.questionId)!;
      const vue = shuffledView(cq);
      const mauvaise = vue.correctIndex === 0 ? 1 : 0;
      const r = gradeQuizAnswer(cur, ['A', 'B', 'C', 'D'][mauvaise]);
      cur = r.session;
      if (r.action.reward) {
        rewardVu = true;
        break;
      }
    }
    expect(rewardVu).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// B7 : « اختبرني (في X) » lance un vrai QCM au lieu d'une carte.
// ---------------------------------------------------------------------------

describe('B7 — « اختبرني » lance un QCM (audit Morchid)', () => {
  it('« اختبرني في الغوص » lance un quiz en mode quiz', () => {
    const out = processStudentInput(
      { ...getDefaultSession(), activeDomainId: 3 },
      'اختبرني في الغوص',
    );
    expect(!!out.action.quiz).toBe(true);
    expect(out.session.mode).toBe('quiz');
    expect(!!out.session.currentQuiz).toBe(true);
  });

  it('« اختبرني في الاستنساخ » lance un quiz', () => {
    const out = processStudentInput(
      { ...getDefaultSession(), activeDomainId: 1 },
      'اختبرني في الاستنساخ',
    );
    expect(!!out.action.quiz).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// B7b : une réponse juste sur une lacune la retire (boucle de remédiation).
// ---------------------------------------------------------------------------

describe('B7b — boucle de remédiation (audit Morchid)', () => {
  it('répondre juste à la question d\'une lacune la retire de mistakes', () => {
    const avecErr: BotSession = {
      ...getDefaultSession(),
      activeDomainId: 3,
      mistakes: ['subduction'],
      mode: 'quiz',
      currentQuiz: { questionId: 'tect_q11', questionIndex: 0, totalQuestions: 1, correctAnswers: 0 },
    };
    const vue = shuffledView(getQuestionsForDomain(3).find((x) => x.id === 'tect_q11')!);
    const r = gradeQuizAnswer(avecErr, ['A', 'B', 'C', 'D'][vue.correctIndex]);
    expect(r.session.mistakes).not.toContain('subduction');
  });
});

// ---------------------------------------------------------------------------
// S1–S8 : corrections scientifiques verrouillées dans le corpus.
// ---------------------------------------------------------------------------

describe('S1–S8 — corrections scientifiques du corpus', () => {
  const data = readFileSync('src/data/smartBotData.ts', 'utf8');

  it('S4/S8 : fautes de frappe corrigées', () => {
    expect(data).not.toContain('الوشام');
    expect(data).not.toContain('منيل');
    expect(data).not.toContain('فيغوص الصهر');
    expect(data).not.toContain('تقارب متباعد');
    expect(data).not.toContain('احتكاك واحتكاك');
    expect(data).toContain('ميثيونين');
    expect(data).toContain('الوشاح');
  });

  it('S1 : absence des ondes S à la surface de Gutenberg', () => {
    expect(data).toContain('عدم مرور (اختفاء) موجات S');
  });

  it('S2 : zone d\'ombre des ondes P (103°–143°)', () => {
    expect(data).toContain('منطقة الظل (103°–143°)');
  });

  it('S3 : vitesse des ondes = rigidité + densité', () => {
    expect(data).toContain('بازدياد صلابة وكثافة');
  });

  it('S6 : divergence = تباعد', () => {
    expect(data).toContain('انفراج (تباعد)');
  });
});

// ---------------------------------------------------------------------------
// Non-régression : les domaines et leurs QCM restent intacts.
// ---------------------------------------------------------------------------

describe('cohérence des domaines et QCM', () => {
  for (const d of DOMAINS) {
    it(`domaine ${d.id} : QCM cohérents`, () => {
      const qs = getQuestionsForDomain(d.id);
      expect(qs.length).toBeGreaterThan(0);
      expect(qs.every((q) => q.domainId === d.id)).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// F10 (audit Solar Pro 2026-09-26) : la mission quotidienne affiche
// « المكافأة: +15 XP » et affiche une question de consolidation, mais
// getDailyMission ne positionnait JAMAIS session.currentQuiz → la réponse de
// l'élève retombait sur «لا يوجد اختبار جارٍ حالياً». Double dégât : les 15 XP
// promis n'étaient jamais versés, et completeDailyMission (jamais appelé) ne
// clôturait jamais la mission → elle se rejouait à l'infini, XP non compté.
// ---------------------------------------------------------------------------

describe('F10 — mission quotidienne : QCM démarré, 15 XP versés, mission clôturée', () => {
  it('démarre un QCM répondable (currentQuiz + mode quiz + carte ciblée)', () => {
    const m = getDailyMission(getDefaultSession());
    expect(!!m.action.quiz).toBeTruthy();
    expect(m.session.currentQuiz).toBeTruthy();
    expect(m.session.mode).toBe('quiz');
    // La question affichée et la question notée doivent être LA même.
    expect(m.session.currentQuiz?.questionId).toBe(m.action.quiz?.id);
    // missionTopicId est ce qui permet de clôturer + verser le bon barème.
    expect(!!m.session.currentQuiz?.missionTopicId).toBeTruthy();
  });

  it("achèvement → 15 XP (et non correctCount*10), kind 'mission', mission clôturée", () => {
    const m = getDailyMission(getDefaultSession());
    expect(!!m.action.quiz).toBeTruthy();

    // «ا» n'est pas la bonne réponse : le barème mission ne dépend pas du
    // succès, il est branché sur l'ACHÈVEMENT, comme l'affiche le texte.
    const r = processStudentInput(m.session, 'ا');
    const today = new Date().toISOString().split('T')[0];

    expect(r.action.reward?.xpGained).toBe(15);
    expect(r.action.reward?.kind).toBe('mission');
    expect(r.session.lastMissionDate).toBe(today);
    expect(r.session.currentQuiz).toBeNull();
    expect(r.action.text).toContain('مهمة اليوم مكتملة');
    expect(r.action.text).toContain('15 XP');
  });

  it('relance le jour même → clôturée (anti-rejeu, pas de farm d’XP)', () => {
    const m = getDailyMission(getDefaultSession());
    expect(!!m.action.quiz).toBeTruthy();
    const r = processStudentInput(m.session, 'ا');

    const again = getDailyMission(r.session);
    expect(again.action.quiz).toBeUndefined();
    expect(again.action.text).toContain('أنجزت مهمة اليوم');
    // Et surtout : aucun QCM ne redémarre → pas de 15 XP supplémentaires.
    expect(again.session.currentQuiz).toBeNull();
  });

  it('couperExtrait : coupe sur une fin de phrase, jamais au-delà de la limite', () => {
    const long = ('البروتين جزيء عظيم الأهمية في الكائنات الحية. يتألف من وحدات بنائية. '
      + 'تتصل هذه الأحماض بروابط ببتيدية. ').repeat(12);
    expect(long.length).toBeGreaterThan(SNIPPET_MAX);

    const c = couperExtrait(long);
    expect(c.truncated).toBeTruthy();
    expect(c.text.length).toBeLessThanOrEqual(SNIPPET_MAX);
    expect(['.', '؟', '!', '،', '؛', ';']).toContain(c.text.slice(-1));
    // On ne remonte à la phrase précédente que si elle garde ≥50% du max.
    expect(c.text.length).toBeGreaterThanOrEqual(SNIPPET_MAX * 0.5);
  });

  it('couperExtrait : texte court intact, sans ponctuation → limite dure', () => {
    const court = 'بنية البروتين الفراغية.';
    expect(couperExtrait(court)).toEqual({ text: court, truncated: false });

    const brut = 'الحمض النووي الريبوسومي'.repeat(80);
    const b = couperExtrait(brut);
    expect(b.truncated).toBeTruthy();
    expect(b.text.length).toBe(SNIPPET_MAX);
  });
});
