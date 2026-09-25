import { processStudentInput, getDailyMission, handleDomainClick, startDiagnostic, gradeQuizAnswer, findBestKnowledgeCard, shuffledView } from '../src/smartTutorEngine';
import { getDefaultSession, startDomainSession, type BotSession } from '../src/utils/sessionManager';
import { KNOWLEDGE_CARDS, getQuestionsForDomain, getCardById, DOMAIN_QUESTION_BANKS, DOMAINS } from '../src/data/smartBotData';

const line = (s: string) => console.log(s);

// ---------- B1 : la mission quotidienne est-elle resoluble ? ----------
line('===== B1 : solvabilite de la mission quotidienne =====');
const cardsSansQuiz: string[] = [];
for (const card of KNOWLEDGE_CARDS) {
  const q = getQuestionsForDomain(card.domainId).filter((x) => x.topicId === card.id);
  if (q.length === 0) cardsSansQuiz.push(`${card.id} (dom ${card.domainId})`);
}
line(`cartes sans QCM correspondant (topicId === card.id) : ${cardsSansQuiz.length}`);
if (cardsSansQuiz.length) line('  -> ' + cardsSansQuiz.join(', '));

const missionDefaut = getDailyMission(getDefaultSession());
line(`mission (session vide) : quiz present = ${!!missionDefaut.action.quiz}`);
if (missionDefaut.action.quiz) line(`  question : ${missionDefaut.action.quiz.question.slice(0, 60)}`);

// verification de la coherence d'ordre du prompt affiche vs corrige (prot_q2)
line('\n===== B1b : coherence ordre melange prompt vs correction =====');
const q2 = getQuestionsForDomain(1).find((q) => q.id === 'prot_q2');
if (q2) {
  const v1 = shuffledView(q2);
  const v2 = shuffledView(q2);
  line(`prot_q2 : prompt/correction identiques = ${JSON.stringify(v1.options) === JSON.stringify(v2.options)} (seed deterministe)`);
  line(`  correctIndex melange = ${v1.correctIndex} / original = ${q2.correctIndex}`);
} else line('prot_q2 introuvable');

// ---------- B2 : la note BAC ignore-t-elle la negation ? ----------
line('\n===== B2 : negation ignoree dans la notation BAC =====');
const sessionBoss: BotSession = {
  ...getDefaultSession(),
  activeDomainId: 1,
  mode: 'bac_challenge',
  boss: { scenarioId: 'boss1_q1', questionIndex: 0, totalQuestions: 2, score: 0, phase: 'answer' },
};
// reponse niant toute la correction mais contenant les memes mots-cles
const resBoss = processStudentInput(sessionBoss, 'لا، البروتين لا يتكون من أحماض أمينية، لا يوجد نسخ ولا ترجمة، الريبوزوم لا يركب أي شيء، الكودون AUG ليس كودون بداية');
const m = resBoss.action.text.match(/نقاطك لهذه الوضعية: (\d+)\/10/);
line(`reponse NEGATIVE totale -> note = ${m ? m[1] : '?'}/10  (attendu si bug : 10)`);
const resBoss2 = processStudentInput(sessionBoss, 'لا أعرف');
const m2 = resBoss2.action.text.match(/نقاطك لهذه الوضعية: (\d+)\/10/);
line(`« لا أعرف » -> note = ${m2 ? m2[1] : '?'}/10 (attendu : 0)`);

// ---------- B3 : « الباك » renvoie-t-il la carte du noyau terrestre ? ----------
line('\n===== B3 : « الباك » -> carte du noyau ? =====');
const cardBak = findBestKnowledgeCard('الباك', null);
line(`findBestKnowledgeCard('الباك', null) = ${cardBak ? cardBak.title + ' (domaine ' + cardBak.domainId + ')' : 'null'}`);
const resBak = processStudentInput(getDefaultSession(), 'الباك');
line(`processStudentInput('الباك') : ${(resBak.action.text || '').slice(0, 70)}`);

// ---------- B4 : le changement de domaine melange-t-il les QCM ? ----------
line('\n===== B4 : coherence domaine affiche vs QCM =====');
const dom2 = handleDomainClick(getDefaultSession(), 2);
line(`apres clic domaine 2 : activeDomainId = ${dom2.session.activeDomainId}`);
const diag2 = startDiagnostic(dom2.session);
const qDom2 = getQuestionsForDomain(2);
line(`QCM domaine 2 : ${qDom2.length} questions ; ids = ${qDom2.slice(0, 3).map((q) => q.id).join(', ')}...`);
const diagQ = diag2.action.quiz;
line(`premier QCM du diagnostic : ${diagQ ? diagQ.id + ' / ' + diagQ.question.slice(0, 40) : 'AUCUN'}`);
const bad = qDom2.find((q) => q.domainId !== 2);
line(`QCM affecte au domaine 2 mais domainId !== 2 : ${bad ? bad.id : 'aucun'}`);

// ---------- B5 : l'accueil efface-t-il erreurs et XP ? ----------
line('\n===== B5 : preserve-t-on erreurs et completedBac ? =====');
const avecErreurs: BotSession = {
  ...getDefaultSession(),
  activeDomainId: 3,
  mistakes: ['subduction', 'earth_structure'],
  completedBac: ['1'],
};
const resHome = processStudentInput(avecErreurs, 'القائمة الرئيسية');
line(`apres « القائمة الرئيسية » : mistakes = [${resHome.session.mistakes.join(', ')}] | completedBac = [${resHome.session.completedBac.join(',')}]`);

// ---------- B6 : decompte des questions et XP zero ----------
line('\n===== B6 : decompte des questions par domaine =====');
for (const d of DOMAINS) {
  const qs = getQuestionsForDomain(d.id);
  line(`domaine ${d.id} (${d.title}) : ${qs.length} questions`);
}
const allIds = Object.values(DOMAIN_QUESTION_BANKS).flat().map((q) => q.id);
line(`total brut = ${allIds.length}`);

// XP zero : quiz rate a 0 -> reward ? (test direct gradeQuizAnswer)
line('\n----- B6b : tentative 0-XP est-elle journalisee -----');
const s0 = startDomainSession(1);
const s1 = startDiagnostic(s0);
const firstId = s1.session.currentQuiz?.questionId;
const qfirst = firstId ? getQuestionsForDomain(1).find((q) => q.id === firstId) : undefined;
if (qfirst) {
  const view = shuffledView(qfirst);
  const mauvaise = view.correctIndex === 0 ? 1 : 0;
  const resMauvaise = gradeQuizAnswer(s1.session, ['A', 'B', 'C', 'D'][mauvaise]);
  line(`reponse volontairement fausse : xpGained = ${resMauvaise.action.reward?.xpGained ?? 'undefined'} (onXPGained n est appele que si > 0 -> non journalise)`);
}

// ---------- B7 : « اختبرني » declenche-t-il un test ? ----------
line('\n===== B7 : « اختبرني » declenche-t-il un QCM ? =====');
const resTest1 = processStudentInput({ ...getDefaultSession(), activeDomainId: 3 }, 'اختبرني في الغوص');
line(`« اختبرني في الغوص » : quiz = ${resTest1.action.quiz ? resTest1.action.quiz.id : 'AUCUN'} | texte = ${resTest1.action.text.slice(0, 60)}`);
const resTest2 = processStudentInput({ ...getDefaultSession(), activeDomainId: 1 }, 'اختبرني في الاستنساخ');
line(`« اختبرني في الاستنساخ » : quiz = ${resTest2.action.quiz ? resTest2.action.quiz.id : 'AUCUN'} | texte = ${resTest2.action.text.slice(0, 60)}`);

// ---------- B8 : dernier QCM encore cliquable apres fin ----------
line('\n===== B8 : disabling UI =====');
line('AITutorView L289-327 : disabled = (msg.id !== lastQuizMsgId) -> seul le dernier QCM est cliquable (deja fixe)');
