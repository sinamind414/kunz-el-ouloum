// qcm.integrite.lock.test.ts — verrous de la banque QCM (audit
// docs/AUDIT_QCM_VS_LIVRE_2026-09-20). Fige : les comptes (50 quiz leçons +
// 3 single-path), l'hygiène structurelle (index valide, options uniques, pas de
// fuite), et la DETTE LEXICALE app/livre mesurée (Rubisco, granodiorite,
// Gutenberg absents du livre ; divergence ظهيرة/الظهرات). Toute évolution de la
// banque ou du livre doit repasser par ce fichier — jamais un glissement.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { EXPERIMENTAL_LESSONS } from '../lessonData';
import { SINGLE_PATH_LESSONS } from './singlePathLessons';

function norm(s: string): string {
  return s
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[\u064B-\u065F\u0670\u0640]/g, '')
    .replace(/[إأآٱا]/g, 'ا')
    .replace(/ء/g, '')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/[^\u0600-\u06FF a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

interface QcmExtrait {
  cle: string;
  question: string;
  options: string[];
  corrects: number[]; // indices valides (lessonData) — pour singlePath : nb options correct===true
  forme: 'index' | 'booleen';
}

const quizLecons: QcmExtrait[] = [];
for (const [cle, lecon] of Object.entries(EXPERIMENTAL_LESSONS)) {
  for (const phase of lecon.phases) {
    for (const bloc of phase.blocks) {
      if (bloc.type !== 'quiz' || !bloc.options) continue;
      quizLecons.push({
        cle,
        question: bloc.question ?? '',
        options: bloc.options,
        corrects: bloc.correct === undefined ? [] : [bloc.correct],
        forme: 'index',
      });
    }
  }
}

const quizSinglePath: QcmExtrait[] = [];
for (const lecon of Object.values(SINGLE_PATH_LESSONS)) {
  for (const etape of lecon.steps ?? []) {
    for (const contenu of etape.content ?? []) {
      const d = (contenu as { data?: unknown }).data as
        | { question?: string; options?: { text: string; correct: boolean }[] }
        | undefined;
      if (!d?.options || typeof d.question !== 'string') continue;
      quizSinglePath.push({
        cle: lecon.key,
        question: d.question,
        options: d.options.map((o) => o.text),
        corrects: d.options.map((o, i) => (o.correct ? i : -1)).filter((i) => i >= 0),
        forme: 'booleen',
      });
    }
  }
}

describe('banque QCM — comptes figés (audit 2026-09-20)', () => {
  it('50 quiz dans les leçons expérimentales, 3 dans les single-path', () => {
    expect(quizLecons).toHaveLength(50);
    expect(quizSinglePath).toHaveLength(3);
  });

  it('chaque quiz a 3 options distinctes (normalisées)', () => {
    for (const q of [...quizLecons, ...quizSinglePath]) {
      expect(q.options, q.cle).toHaveLength(3);
      const uniques = new Set(q.options.map(norm));
      expect(uniques.size, `${q.cle} : options dupliquées`).toBe(3);
    }
  });

  it('lessonData : l index de réponse est valide et unique ; singlePath : exactement 1 correcte', () => {
    for (const q of quizLecons) {
      expect(q.corrects).toHaveLength(1);
      expect(q.corrects[0], `${q.cle} : ${q.question.slice(0, 40)}`).toBeGreaterThanOrEqual(0);
      expect(q.corrects[0]).toBeLessThan(3);
    }
    for (const q of quizSinglePath) {
      expect(q.corrects, `${q.cle} : ${q.question.slice(0, 40)}`).toHaveLength(1);
    }
  });

  it('aucune fuite : la bonne réponse n est pas copiée mot pour mot dans la question', () => {
    for (const q of [...quizLecons, ...quizSinglePath]) {
      const bonne = norm(q.options[q.corrects[0]]);
      const nq = norm(q.question);
      expect(nq.includes(bonne), `${q.cle} : fuite « ${q.question.slice(0, 50)} »`).toBe(false);
    }
  });
});

describe('banque QCM — dette lexicale app/livre MESURÉE et figée', () => {
  const ft: string[] = JSON.parse(readFileSync(join(process.cwd(), 'data', 'bookContent.json'), 'utf-8')).book.full_text;
  const livre = norm(ft.join(' '));
  const present = (t: string) => livre.includes(norm(t));

  it('termes de QCM CONFIRMÉS dans le livre (ancrage fort — ne pas supprimer)', () => {
    for (const terme of ['gaba', 'انترلوكين', 'برفورين', 'بيريدوتيت', 'افيوليت', 'انديزيت', 'استينوسفير', 'اسموزي']) { // gaba = graphie latine de l'OCR (غابا arabe absent)
      expect(present(terme), `terme ancré devenu absent : ${terme}`).toBe(true);
    }
  });

  it('dette documentée : termes de QCM ABSENTS du livre (enrichissements assumés)', () => {
    // Si l'un devient présent (re-OCR, erratum, harmonisation) → mettre à jour
    // cet état et retirer le badge « hors nomenclature du livre » (audit §4.1).
    expect(present('روبيسكو')).toBe(false); // Q7 (le livre ne nomme pas l'enzyme)
    expect(present('غرانودوريت')).toBe(false); // Q18 (l'andésite est présente)
    expect(present('غوتنبرغ')).toBe(false); // Q21 réparée (R2) : le QCM dit العمق 2900 كم ; le terme reste absent du LIVRE
  });

  it('divergence dorsale : le livre dit الظهرات, l app dit ظهيرة — état figé', () => {
    expect(present('ظهرات')).toBe(true);
    expect(present('ظهيره')).toBe(false);
  });

  it('R1 (2026-09-20) : les distracteurs farces historiques ne reviennent pas', () => {
    const farces = [
      'النواة وتخرب الـ ADN',
      'العضلات وتسبب انقباضها',
      'يتحول التيلاكويد إلى ميتوكندرون',
      'الخميرة لا تحتوي على إنزيمات',
      'الشمس تدور حول الأرض',
      'لا يوجد أي فرق بينهما',
      'حرارتها تشبه حرارة محرك السيارة',
      'صخر الغرانيت والكوارتز',
      'الجبال تتكون من براكين بازلتية حديثة',
      'الصخر المتحول يتكون في السطح فقط',
      'عشوائي ومختلط دائماً',
      'يتجمد فيموت ثم يحيى',
      'الليف العصبي يموت بعد كل تنبيه',
    ];
    const corpus = [...quizLecons, ...quizSinglePath]
      .map((q) => `${q.question} ${q.options.join(' ')}`)
      .join(' ');
    for (const f of farces) {
      expect(corpus.includes(f), `farce réapparue : « ${f} »`).toBe(false);
    }
  });

  it('R2 (2026-09-20) : les QCM disent الظهرات (terme du livre) et s ancrent à 2900 km', () => {
    const corpus = [...quizLecons, ...quizSinglePath]
      .map((q) => `${q.question} ${q.options.join(' ')}`)
      .join(' ');
    expect(corpus.includes('ظهيره'), 'R2 : الظهيرة est revenu dans un QCM (le livre dit الظهرات)').toBe(false);
    expect(corpus.includes('غوتنبرغ'), 'R2 : le nom Gutenberg est revenu (le livre : profondeur 2900)').toBe(false);
    expect(corpus.includes('2900')).toBe(true);
  });

  it('les 2 QCM de culture générale (phase22) restent identifiés comme hors-TDM', () => {
    const phase22 = quizLecons.filter((q) => q.cle.startsWith('phase22'));
    expect(phase22).toHaveLength(2); // Q30 métamorphique/nari, Q31 piège pétrolier
  });
});
