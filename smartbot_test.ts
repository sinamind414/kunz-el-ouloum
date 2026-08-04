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

// ── ValidationEngine · T1–T12 (Speckit §5.5) ──
import { runValidationTests } from './src/lib/validation/validationTests.ts';
const vResults = runValidationTests();
let vFailed = 0;
console.log('\n── ValidationEngine · Tests T1–T12 ──');
for (const r of vResults) {
  if (!r.pass) vFailed++;
  console.log(`[${r.pass ? 'PASS' : 'FAIL'}] ${r.id} · ${r.desc} (${r.detail}) :: ${r.info}`);
}
console.log(`\nValidation: ${vResults.length - vFailed}/${vResults.length} PASS`);
if (vFailed > 0) process.exit(1);
