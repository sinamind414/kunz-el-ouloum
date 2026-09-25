import { processStudentInput, findBestKnowledgeCard, gradeQuizAnswer, startDiagnostic, shuffledView } from '../src/smartTutorEngine';
import { getDefaultSession, startDomainSession, type BotSession } from '../src/utils/sessionManager';
import { getQuestionsForDomain, getBossScenarioById, DOMAINS } from '../src/data/smartBotData';

const ok = (cond: boolean, label: string) => console.log(`${cond ? 'PASS' : '*** FAIL ***'}  ${label}`);

// ---------- B2 : la negation n'est plus creditee ----------
console.log('\n== B2 : notation BAC et negation ==');
const boss = (id = 'boss1_q1'): BotSession => ({
  ...getDefaultSession(), activeDomainId: 1, mode: 'bac_challenge',
  boss: { scenarioId: id, questionIndex: 0, totalQuestions: 2, score: 0, phase: 'answer' },
});
const note = (t: string) => { const m = t.match(/نقاطك لهذه الوضعية: (\d+)\/10/); return m ? Number(m[1]) : null; };
const sc = getBossScenarioById('boss1_q1')!;
const nie = processStudentInput(boss(), sc.keyPoints.map((k) => 'لا، ليس صحيحاً أن ' + k).join('؛ '));
ok(note(nie.action.text) === 0, `reponse niant tout -> ${note(nie.action.text)}/10 (attendu 0)`);
const bon = processStudentInput(boss(), sc.keyPoints.join('؛ '));
ok(note(bon.action.text) === 10, `reponse correcte -> ${note(bon.action.text)}/10 (attendu 10)`);
const mixte = processStudentInput(boss(), 'لا، ' + sc.keyPoints[0] + '، لكن ' + sc.keyPoints.slice(1).join('، '));
ok(note(mixte.action.text) === 10, `1 point nie sur 4 + 3 affirmes -> ${note(mixte.action.text)}/10 (attendu 10)`);

// ---------- B3 : plus de matching par sous-chaine ----------
console.log('\n== B3 : matching par mot entier ==');
ok(findBestKnowledgeCard('الباك', null) === null, `'الباك' ne renvoie plus la carte du noyau (null attendu)`);
ok(findBestKnowledgeCard('اللب', null)?.title.includes('بنية الكرة') === true, `'اللب' trouve toujours la carte du noyau`);
ok(findBestKnowledgeCard('ماهو اللب', null)?.title.includes('بنية الكرة') === true, `'اللب' (en phrase) trouve le noyau`);
const resBak = processStudentInput(getDefaultSession(), 'الباك');
ok(!resBak.action.text.includes('بنية الكرة الأرضية'), `processStudentInput('الباك') ne sort plus la tectonique`);

// ---------- B5 : completedBac preserve a l'accueil ----------
console.log('\n== B5 : anti-farm preserve ==');
const avecBac: BotSession = { ...getDefaultSession(), activeDomainId: 1, mistakes: ['subduction'], completedBac: ['1'], lastMissionDate: '2026-09-25' };
const home = processStudentInput(avecBac, 'القائمة الرئيسية');
ok(home.session.mistakes.includes('subduction'), 'erreurs preservees');
ok(home.session.completedBac.includes('1'), 'completedBac preserve (anti-farm intact)');
ok(home.session.lastMissionDate === '2026-09-25', 'date de mission preservee');

// ---------- B6 : quiz 0-XP remonte un reward ----------
console.log('\n== B6 : activite 0-XP journalisee ==');
const s = startDomainSession(1);
const s1 = startDiagnostic(s);
let cur = s1.session;
let rewardVu = false;
for (let i = 0; i < 25 && cur.currentQuiz; i++) {
  const cq = getQuestionsForDomain(1).find((x) => x.id === cur.currentQuiz!.questionId)!;
  const vue = shuffledView(cq);
  const mauvaise = vue.correctIndex === 0 ? 1 : 0; // lettre volontairement fausse
  const r = gradeQuizAnswer(cur, ['A', 'B', 'C', 'D'][mauvaise]);
  cur = r.session;
  if (r.action.reward) {
    rewardVu = true;
    console.log(`  reward final : xp=${r.action.reward.xpGained} score=${r.action.reward.score}/${r.action.reward.total}`);
    break;
  }
}
ok(rewardVu, 'un reward est emis meme a 0 bonnes reponses (onXPGained sera appele)');

// ---------- B7 : اختبرني lance un QCM ----------
console.log('\n== B7 : اختبرني ==');
const t1 = processStudentInput({ ...getDefaultSession(), activeDomainId: 3 }, 'اختبرني في الغوص');
ok(!!t1.action.quiz, `'اختبرني في الغوص' lance un QCM (id=${t1.action.quiz?.id ?? '-'})`);
ok(t1.session.mode === 'quiz' && !!t1.session.currentQuiz, 'session en mode quiz avec currentQuiz');
const t2 = processStudentInput({ ...getDefaultSession(), activeDomainId: 1 }, 'اختبرني في الاستنساخ');
ok(!!t2.action.quiz, `'اختبرني في الاستنساخ' lance un QCM (id=${t2.action.quiz?.id ?? '-'})`);

// ---------- B7b : remise en etat des erreurs ----------
console.log('\n== B7b : boucle de remédiation ==');
const avecErr: BotSession = { ...getDefaultSession(), activeDomainId: 3, mistakes: ['subduction'], mode: 'quiz',
  currentQuiz: { questionId: 'tect_q11', questionIndex: 0, totalQuestions: 1, correctAnswers: 0 } };
const q11 = getQuestionsForDomain(3).find((x) => x.id === 'tect_q11')!;
const vue11 = shuffledView(q11);
const bonneLettre = ['A', 'B', 'C', 'D'][vue11.correctIndex];
const rCorr = gradeQuizAnswer(avecErr, bonneLettre);
ok(!rCorr.session.mistakes.includes('subduction'), `reponse juste sur 'subduction' -> lacune retiree (mistakes=[${rCorr.session.mistakes.join(',')}])`);

// ---------- S1/S2/S4/S6/S7/S8 : contenu ----------
console.log('\n== Contenu scientifique ==');
import { readFileSync } from 'fs';
const data = readFileSync('src/data/smartBotData.ts', 'utf8');
ok(!data.includes('الوشام'), 'plus de "الوشام"');
ok(!data.includes('منيل'), 'plus de "منيل"');
ok(!data.includes('فيغوص الصهر'), 'plus de "فيغوص الصهر"');
ok(!data.includes('تقارب متباعد'), 'plus de "تقارب متباعد"');
ok(data.includes('ميثيونين'), '"ميثيونين" present');
ok(data.includes('عدم مرور (اختفاء) موجات S'), 'S1 corrigé (absence des ondes S)');
ok(data.includes('منطقة الظل (103°–143°)'), 'S2 corrigé (zone d\'ombre P)');
ok(data.includes('بازدياد صلابة وكثافة'), 'S3 aligné (rigidité + densité)');
ok(data.includes('انفراج (تباعد)'), 'S6 corrigé');

console.log('\n== Domaines et QCM intacts ==');
for (const d of DOMAINS) {
  const qs = getQuestionsForDomain(d.id);
  ok(qs.length > 0 && qs.every((q) => q.domainId === d.id), `domaine ${d.id} : ${qs.length} QCM coherents`);
}
