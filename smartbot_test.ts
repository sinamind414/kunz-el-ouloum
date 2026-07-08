import { loadSession } from './src/utils/sessionManager.ts';
import { handleDomainClick, processStudentInput, answerTutorQuestion } from './src/utils/smartTutorEngine.ts';

let s = loadSession();
let r = handleDomainClick(s, 3);
console.log('domain3 actions:', r.action.quickActions?.join('|'));

s = r.session;
r = processStudentInput(s, 'اختبار تشخيصي');
console.log('diag:', r.action.quiz?.id, r.action.text.replace(/\n/g, ' / '));

s = r.session;
r = processStudentInput(s, 'A');
console.log('after answer:', r.action.quiz?.id, r.action.text.slice(0, 160).replace(/\n/g, ' / '));

s = r.session;
r = processStudentInput(s, 'راجع أخطائي السابقة');
console.log('mistakes:', r.action.text.slice(0, 160).replace(/\n/g, ' / '));

for (const q of ['بنية الكرة الأرضية', 'الموجات الزلزالية وبنية الأرض', 'كيف أحلل وثيقة؟', 'كرة القدم']) {
  const a = answerTutorQuestion(q);
  console.log(q, '=>', a.sources?.map(x => x.type + ':' + x.title).join('|'), 'quiz', a.quiz?.id || 'none');
}
