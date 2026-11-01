// scripts/audit-morchid.ts — Sonde qualité LIVE du المرشد الذكي (aucune modification d'état).
// Mesure : taille des bases, taux de réponse, honnêteté hors-sujet, distribution des sources, XP.
import { answerTutorQuestion, processStudentInput } from '../src/smartTutorEngine';
import { getDefaultSession } from '../src/utils/sessionManager';
import { TUTOR_KNOWLEDGE } from '../src/tutorKnowledge';
import { BOOK_TUTOR_QA } from '../src/bookTutorQA';
import { findBestMethodologyQA } from '../src/methodologyKnowledge';
import { STUDY_GUIDE_CARDS } from '../src/studyGuide';
import { KNOWLEDGE_CARDS as LEGACY_CARDS } from '../src/knowledgeCards';
import { KNOWLEDGE_CARDS, DOMAINS, getQuestionsForDomain, getBossScenariosForDomain } from '../src/data/smartBotData';
import * as methodo from '../src/methodologyKnowledge';

const FALLBACK_MARK = 'لم أجد إجابة دقيقة';

const QUESTIONS: Array<{ q: string; expect: 'hit' | 'refus' | 'any' }> = [
  { q: 'ما هي آليات تركيب البروتين؟', expect: 'hit' },
  { q: 'اشرح لي بنية البروتين الفراغية', expect: 'hit' },
  { q: 'ما الفرق بين ARNm و ARNt؟', expect: 'hit' },
  { q: 'كيف يتم استنساخ المعلومة الوراثية؟', expect: 'hit' },
  { q: 'اشرح لي الاستجابة المناعية', expect: 'hit' },
  { q: 'ما هي الأجسام المضادة؟', expect: 'hit' },
  { q: 'كيف تتم الترجمة في الهيولى؟', expect: 'hit' },
  { q: 'ما هو التحول الطاقوي في المتقدرة؟', expect: 'hit' },
  { q: 'اشرح لي التنفس الخلوي', expect: 'hit' },
  { q: 'ما هو التخمر؟', expect: 'hit' },
  { q: 'اشرح النشاط التكتوني للصفائح', expect: 'hit' },
  { q: 'ما هي حدود الصفائح التكتونية؟', expect: 'hit' },
  { q: 'التخصص الوظيفي للأنزيمات', expect: 'hit' },
  { q: 'كيف أحلل وثيقة؟', expect: 'hit' },
  { q: 'اعطني قالب فرضية', expect: 'hit' },
  { q: 'ما الفرق بين استخرج واستنتج؟', expect: 'hit' },
  { q: 'كيف أكتب نصا علميا؟', expect: 'hit' },
  { q: 'بروتوكول دراسة أي وحدة في 5 خطوات', expect: 'hit' },
  { q: 'الترجمة والشيفرة الجينية', expect: 'hit' },
  { q: 'دور الميتوكوندري في الطاقة', expect: 'any' },
  { q: 'شكون دار تركيب البروتين؟', expect: 'any' },
  { q: 'كيفاش نفهم المناعة بسرعة؟', expect: 'any' },
  { q: 'متى يحدث الانقسام الخلوي؟', expect: 'any' },
  { q: 'ههههه', expect: 'refus' },
  { q: 'blabla', expect: 'refus' },
  { q: 'من فاز في مباراة كرة القدم؟', expect: 'refus' },
  { q: 'أفضل فيلم سينما؟', expect: 'refus' },
  { q: 'أخبار اليوم', expect: 'refus' },
];

let hits = 0, honestRefus = 0, softFallback = 0, missed = 0;
const sourceCounts: Record<string, number> = {};
const failures: string[] = [];

console.log('══ TAILLE DES BASES DE CONNAISSANCES ══');
console.log(`Cartes internes (smartBotData) : ${KNOWLEDGE_CARDS.length}`);
console.log(`Cartes legacy (knowledgeCards) : ${LEGACY_CARDS.length}`);
console.log(`Chunks الدروس (tutorKnowledge): ${TUTOR_KNOWLEDGE.length}`);
console.log(`QA livre (bookTutorQA)        : ${BOOK_TUTOR_QA.length}`);
console.log(`QA méthodologie               : ${(methodo as any).METHODOLOGY_QA?.length ?? Object.values(methodo).find((v) => Array.isArray(v))?.length ?? '?'}`);
console.log(`Guides d'étude (studyGuide)   : ${STUDY_GUIDE_CARDS.length}`);
for (const d of DOMAINS) {
  console.log(`  Domaine ${d.id} « ${d.title} » : ${getQuestionsForDomain(d.id).length} questions quiz · ${getBossScenariosForDomain(d.id).length} scénarios BAC`);
}

console.log('\n══ SONDE LIVE : 28 QUESTIONS ÉLÈVE ══');
for (const { q, expect } of QUESTIONS) {
  const a = answerTutorQuestion(q);
  const src = a.sources?.[0]?.type ?? 'none';
  sourceCounts[src] = (sourceCounts[src] || 0) + 1;
  const isFallback = a.text.includes(FALLBACK_MARK);
  const isRefus = src === 'out_of_scope';
  const cls = isRefus ? 'REFUS' : isFallback ? 'FALLBACK' : 'HIT';
  if (cls === 'HIT') hits++;
  else if (cls === 'REFUS') honestRefus++;
  else softFallback++;
  if ((expect === 'hit' && cls !== 'HIT') || (expect === 'refus' && cls !== 'REFUS')) {
    failures.push(`[${expect}→${cls}] ${q} (source=${src})`);
  }
  console.log(`${cls.padEnd(8)} src=${src.padEnd(13)} conf=${String(a.confidence ?? '-').padEnd(4)} ${q}`);
}

console.log('\n══ RÉSULTATS ══');
const total = QUESTIONS.length;
console.log(`Hits directs : ${hits}`);
console.log(`Répartition sources : ${JSON.stringify(sourceCounts)}`);
console.log(`Échecs vs attente (${failures.length}) :`);
for (const f of failures) console.log('  ' + f);

// XP quiz : simulation d'un diagnostic complet en répondant toujours « A ».
{
  let cur = processStudentInput(getDefaultSession(), DOMAINS[0].title).session;
  cur = processStudentInput(cur, 'اختبار تشخيصي').session;
  let xp = 0;
  let guard = 0;
  while (guard++ < 30) {
    const res = processStudentInput(cur, 'A');
    cur = res.session;
    if (res.action.reward) { xp = res.action.reward.xpGained; break; }
  }
  console.log(`\n══ XP : diagnostic domaine 1 complet (répondre toujours « A ») → XP de fin de quiz : ${xp}`);
}

// XP boss fight : auto-évaluation toujours « إجابة كاملة (+10) ».
{
  let cur = processStudentInput(getDefaultSession(), DOMAINS[0].title).session;
  cur = processStudentInput(cur, 'تحدي BAC').session;
  let xp = 0;
  let guard = 0;
  while (guard++ < 30) {
    const res = processStudentInput(cur, 'إجابة كاملة');
    cur = res.session;
    if (res.action.reward) { xp = res.action.reward.xpGained; break; }
  }
  console.log(`══ XP : défi BAC domaine 1 avec auto-évaluation « +10 » systématique → XP : ${xp}`);
}

