import { performance } from 'node:perf_hooks';
import { createHash } from 'node:crypto';
import { processStudentInput, answerTutorQuestion } from '../src/smartTutorEngine';
import { getDefaultSession } from '../src/utils/sessionManager';

const queries = [
  'ما هو الاستنساخ؟',
  'كيف يحدث التركيب الضوئي؟',
  'ما الفرق بين التنفس والتخمر؟',
  'ما دور CMH؟',
  'كيف أحلل وثيقة؟',
  'اعطني قالب فرضية',
  'ما هو الغوص؟',
  'اشرح كمون العمل',
  'ما هي بنية الجسم المضاد؟',
  'كيف تعمل الانزيمات؟',
  'من هو ميسي؟',
  'كيف أطبخ الكسكس؟',
  'راني خايف من الباك',
  'بلابلا',
  'ما هي الحموض النووية؟',
  'ما الفرق بين التركيب الضوئي والتنفس؟',
  'اشرح السلسلة التنفسية',
  'كيف تنتقل الرسالة العصبية؟',
  'ما هو VIH؟',
  'كيف تتشكل الجبال؟',
];

const canonical = (x: unknown) => JSON.stringify(x, (k, v) => k === 'lastInteraction' || k === 'openedAt' ? 0 : v);
const hash = (x: unknown) => createHash('sha256').update(canonical(x)).digest('hex').slice(0, 12);

// Warmup all branches.
for (const q of queries) answerTutorQuestion(q);

const durations: number[] = [];
for (let round = 0; round < 100; round++) {
  for (const q of queries) {
    const t0 = performance.now();
    answerTutorQuestion(q);
    durations.push(performance.now() - t0);
  }
}
durations.sort((a, b) => a - b);
const percentile = (p: number) => durations[Math.min(durations.length - 1, Math.floor(durations.length * p))];
console.log(JSON.stringify({
  calls: durations.length,
  meanMs: durations.reduce((a,b)=>a+b,0)/durations.length,
  p50Ms: percentile(.5),
  p95Ms: percentile(.95),
  p99Ms: percentile(.99),
  maxMs: durations.at(-1),
}, null, 2));

console.log('\nDETERMINISM_STATIC');
for (const q of queries) {
  const outs = Array.from({length: 20}, () => hash(processStudentInput(getDefaultSession(), q).action));
  console.log(JSON.stringify({q, variants: new Set(outs).size, hashes:[...new Set(outs)]}));
}

console.log('\nRANDOM_QUIZ');
for (const q of ['اختبرني في الغوص', 'اختبرني في الاستنساخ', 'اختبرني في التنفس الخلوي']) {
  const ids = Array.from({length: 100}, () => processStudentInput(getDefaultSession(), q).action.quiz?.id ?? 'none');
  const freq = Object.fromEntries([...new Set(ids)].map(id => [id, ids.filter(x=>x===id).length]));
  console.log(JSON.stringify({q, variants:Object.keys(freq).length, freq}));
}

console.log('\nTARGETED_QUIZ_SEQUENCE');
const originalRandom = Math.random;
for (const forcedRandom of [0, 0.5, 0.9999]) {
  Math.random = () => forcedRandom;
  let result = processStudentInput(getDefaultSession(), 'اختبرني في الاستنساخ');
  const visited: string[] = [];
  while (result.session.currentQuiz && visited.length < 20) {
    visited.push(result.session.currentQuiz.questionId);
    result = processStudentInput(result.session, 'A');
  }
  console.log(JSON.stringify({
    forcedRandom,
    visited,
    announcedTotal: 8,
    finalScoreText: result.action.text.match(/نتيجتك النهائية:[^\n]*/)?.[0] ?? null,
  }));
}
Math.random = originalRandom;

console.log('\nPROBES');
for (const q of [
  'اشرح لي المريخ',
  'ما هو اللب؟',
  'ما هو الباك؟',
  'هل الانزيم خلية؟',
  'التنفس لا ينتج ATP',
  'كيف يسبب اللاكتات التعب؟',
  'هل المتمم ضمن البرنامج؟',
  'نضج ARNm',
  'مبدأ الأسيلوسكوب',
  'كيف أطبخ البروتين؟',
  'LB',
  'LT',
  'كم تنتج جزيئة الغلوكوز من ATP؟',
  'ما هو الفرق بين التحليل والتفسير؟',
  'فسر نتائج هذه التجربة',
  '',
  'نعم',
]) {
  const r = processStudentInput(getDefaultSession(), q);
  console.log(JSON.stringify({q, confidence:r.action.confidence, source:r.action.sources?.[0], text:r.action.text.slice(0,220).replace(/\n/g,' ')}));
}
