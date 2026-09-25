import { processStudentInput } from '../src/smartTutorEngine';
import { getDefaultSession, type BotSession } from '../src/utils/sessionManager';
import { getBossScenarioById, getBossScenariosForDomain } from '../src/data/smartBotData';

const line = (s: string) => console.log(s);

const sessionBoss = (scenarioId: string, total: number): BotSession => ({
  ...getDefaultSession(),
  activeDomainId: 1,
  mode: 'bac_challenge',
  boss: { scenarioId, questionIndex: 0, totalQuestions: total, score: 0, phase: 'answer' },
});

const note = (text: string): string => {
  const m = text.match(/نقاطك لهذه الوضعية: (\d+)\/10/);
  return m ? m[1] + '/10' : '(absente)';
};

line('===== B2 : la negation fausse-t-elle la notation ? =====');
const sc = getBossScenarioById('boss1_q1');
if (sc) {
  line(`keyPoints du scenario : ${JSON.stringify(sc.keyPoints)}`);
  // 1) reponse qui nie EXPLICITEMENT chaque point-cle en reprenant ses mots
  const nieTout = sc.keyPoints.map((kp) => 'لا، ليس صحيحاً أن ' + kp).join('؛ ');
  const r1 = processStudentInput(sessionBoss('boss1_q1', 2), nieTout);
  line(`A) negation de TOUS les points-cles -> note = ${note(r1.action.text)}`);
  // 2) reponse qui reprend les points-cles tels quels (temoin positif)
  const r2 = processStudentInput(sessionBoss('boss1_q1', 2), sc.keyPoints.join('؛ '));
  line(`B) reprise exacte des points-cles -> note = ${note(r2.action.text)}`);
  // 3) reponse partiellement negative (50% des mots)
  const nieMoitie = sc.keyPoints.slice(0, 2).map((kp) => 'أرفض أن ' + kp).join('؛ ') + '؛ ' + sc.keyPoints.slice(2).join('؛ ');
  const r3 = processStudentInput(sessionBoss('boss1_q1', 2), nieMoitie);
  line(`C) moitie niee, moitie reprise    -> note = ${note(r3.action.text)}`);
}

line('\n===== B1 : la mission peut-elle viser study_planning ? =====');
// study_planning n'a aucun QCM : peut-elle devenir cible de mission ou erreur ?
const scenarios = getBossScenariosForDomain(1);
line(`scenarios BAC domaine 1 : ${scenarios.map((s) => s.id).join(', ')}`);
// verif : un topicId de QCM peut-il valoir 'study_planning' ?
import { getQuestionsForDomain } from '../src/data/smartBotData';
const d1 = getQuestionsForDomain(1);
line(`topicIds uniques du domaine 1 : ${[...new Set(d1.map((q) => q.topicId))].join(', ')}`);
const d3 = getQuestionsForDomain(3);
line(`topicIds uniques du domaine 3 : ${[...new Set(d3.map((q) => q.topicId))].join(', ')}`);
line(`'study_planning' est-il un topicId de QCM ? ${[...new Set([...d1, ...d3].map((q) => q.topicId))].includes('study_planning')}`);
