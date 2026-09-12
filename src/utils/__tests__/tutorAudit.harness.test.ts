// src/utils/__tests__/tutorAudit.harness.test.ts — harnais d'audit du tutor (exécution réelle)
// Audit المرشد الذكي : couverture, honnêteté hors-sujet, pertinence des réponses.
import { describe, expect, it } from 'vitest';
import { answerTutorQuestion } from '../../smartTutorEngine';

interface ProbeResult {
  question: string;
  answered: boolean;
  preview: string;
}

const PROBES: { q: string; shouldAnswer: boolean }[] = [
  // Questions du programme — DOIVENT trouver une réponse
  { q: 'اشرح لي آليات عملية الاستنساخ بالتفصيل', shouldAnswer: true },
  { q: 'ما معنى الخاصية الحمقلية؟', shouldAnswer: true },
  { q: 'لخص دور اللمفاويات LT4 في تنشيط المناعة', shouldAnswer: true },
  { q: 'ما هي مستويات البنية الفراغية للبروتين؟', shouldAnswer: true },
  { q: 'كيف يحدث التركيب الضوئي؟', shouldAnswer: true },
  { q: 'ما هو الغوص؟', shouldAnswer: true },
  { q: 'متى تتشكل الموجات الزلزالية؟', shouldAnswer: true },
  { q: 'ما هو الفرق بين التنفس والتخمر؟', shouldAnswer: true },
  { q: 'ما هو الإنزيم؟', shouldAnswer: true },
  // Méthodologie (suggestions officielles du moteur)
  { q: 'كيف أحلل وثيقة؟', shouldAnswer: true },
  { q: 'ما الفرق بين استخرج واستنتج؟', shouldAnswer: true },
  { q: 'كيف أعلل أو أبرر؟', shouldAnswer: true },
  { q: 'كيف أكتب نصا علميا؟', shouldAnswer: true },
  // Hors-sujet — doivent être refusées honnêtement
  { q: 'من هو ميسي؟', shouldAnswer: false },
  { q: 'كيف أطبخ الكسكس؟', shouldAnswer: false },
  { q: 'ما رأيك في السياسة؟', shouldAnswer: false },
];

const NO_ANSWER_MARK = 'لم أجد إجابة';

function probe(q: string): ProbeResult {
  const text = answerTutorQuestion(q)?.text || '';
  return {
    question: q,
    answered: !!text && !text.includes(NO_ANSWER_MARK),
    preview: text.slice(0, 60).replace(/\n/g, ' '),
  };
}

describe('AUDIT المرشد الذكي — couverture réelle', () => {
  it('couvre les questions du programme et refuse honnêtement le hors-sujet', () => {
    const results = PROBES.map((p) => ({ ...probe(p.q), shouldAnswer: p.shouldAnswer }));
    const answeredCount = results.filter((r) => r.answered).length;
    const misses = results.filter((r) => r.shouldAnswer && !r.answered);
    const falsePositives = results.filter((r) => !r.shouldAnswer && r.answered);

    const audit = ['\n═══ RÉSULTATS DES SONDES ═══',
      ...results.map((r) => `${r.answered ? 'OK  ' : 'MISS'} ${r.question} -> ${r.preview}`),
      `Couverture: ${answeredCount}/${results.length}`,
      `Questions du programme ratées: ${misses.map((m) => m.question).join(' | ') || 'aucune'}`,
      `Hors-sujet acceptés à tort: ${falsePositives.map((m) => m.question).join(' | ') || 'aucun'}`,
    ].join('\n');
    process.stdout.write(audit + '\n');

    expect(misses.length).toBe(0);
    expect(falsePositives.length).toBe(0);
  });

  it('BUG CIBLE : « اعطني قالب فرضية » doit répondre avec de la MÉTHODOLOGIE, pas un cours au hasard', () => {
    const text = answerTutorQuestion('اعطني قالب فرضية')?.text || '';
    process.stdout.write('\nTEST CIBLE قالب فرضية:\n' + text.slice(0, 300).replace(/\n/g, ' ¶ ') + '\n');
    expect(text).toContain('فرضي');
  });

  it('LACUNE : الحموض النووية (échec de matching rapporté par l\'audit)', () => {
    const text = answerTutorQuestion('ما هي الحموض النووية؟')?.text || '';
    process.stdout.write('\nTEST CIBLE الحموض النووية:\n' + text.slice(0, 300).replace(/\n/g, ' ¶ ') + '\n');
    expect(text).toContain('حمض');
  });
});
