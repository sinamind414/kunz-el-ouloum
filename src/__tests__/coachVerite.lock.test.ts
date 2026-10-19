// coachVerite.lock.test.ts — TC1 « arrêter de mentir » (audit coach Morchid,
// 18/10/2026, 40/100). Les défauts mesurés par cet audit étaient VERROUILLÉS
// par l'absence de test : aucun test ne demandait « une copie fausse
// n'obtient pas 10/10 », aucune durée affichée n'était contrôlée. Ce fichier
// gèle les cinq réparations de la tranche :
//   H1a causale par MOT (لان ⊄ الانزيم) · H1b verbe = premier mot de la
//   consigne · H6 détresse jamais « hors programme » · H7 zéro donnée
//   inventée (durées, pourcentages, XP, félicitations hors-sol).
// H1(c) notation par relations = tranche M, reste documentée au backlog.

import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  contientMotArabe,
  detectConsigneVerb,
  detecterDetresse,
  normalizeArabic,
} from '../smartTutorEngine';

const ENGINE = readFileSync(resolve(__dirname, '../smartTutorEngine.ts'), 'utf8');
const REMINDER = readFileSync(resolve(__dirname, '../components/SmartReminderCard.tsx'), 'utf8');
const QUIZ = readFileSync(resolve(__dirname, '../components/QuizView.tsx'), 'utf8');

describe('TC1/H1a — causalité par mot entier, pas par sous-chaîne', () => {
  it('« لان » ne matche PAS les mots scientifiques qui le contiennent', () => {
    // Les 7 phrases du corpus descriptif de l'audit : النشاط الإنزيمي, الإنسان,
    // الأنسولين, الانقسام, الانتشار, الانتقال — toutes contiennent « لان ».
    for (const phrase of [
      'نلاحظ أن النشاط الإنزيمي يزداد',
      'الإنسان يفرز الأنسولين',
      'تحفظ الخلية انقسامها الخلوي',
      'ظهر الانتشار عبر الغشاء',
      'يمثل الانتقال تياراً معتدلاً',
      'يحدث الانقسام في الميتوز',
    ]) {
      expect(contientMotArabe(normalizeArabic(phrase), normalizeArabic('لأنّ')), phrase)
        .toBe(false);
    }
  });

  it('« لأنّ » en mot autonome reste détecté — en tête, milieu, après واو', () => {
    expect(contientMotArabe(normalizeArabic('فشل التفاعل لأنّ الوسط حمضي'), normalizeArabic('لأنّ'))).toBe(true);
    expect(contientMotArabe(normalizeArabic('لأنّ الحمض يثبط الإنزيم'), normalizeArabic('لأنّ'))).toBe(true);
    expect(contientMotArabe(normalizeArabic('ومونداً بسبب نقص الأكسجين'), normalizeArabic('بسبب'))).toBe(true);
  });
});

describe('TC1/H1b — le contrat du verbe vient du PREMIER VERBE d impératif de la consigne', () => {
  // Entrées BRUTES (l API prend le texte non normalisé : la ponctuation est la
  // frontière de phrase ; le moteur normalise chaque jeton à l unité).
  it('les 3 erreurs mesurées de l audit ne produisent plus de contrat faux', () => {
    expect(detectConsigneVerb('اشرح العلاقة بين بنية الهيموغلوبين ووظيفته')).toBeNull();
    expect(detectConsigneVerb('اربط بين المرحلتين المعروضتين')).toBeNull();
    expect(detectConsigneVerb('ما دور الحمل الحراري في صفيحة المحيطات؟')).toBeNull();
  });

  it('les consignes réelles de la banque gardent leur contrat', () => {
    expect(detectConsigneVerb('فسر العلاقة بين المعطيين')?.verb).toBe('فسر');
    expect(detectConsigneVerb('حلل الوثيقة المزوّدة')?.verb).toBe('حلل');
    expect(detectConsigneVerb('صف ما تظهره الوثيقة')?.verb).toBe('صف');
    // verbe précédé de « و » d'union
    expect(detectConsigneVerb('وقارن بين المنحنيين')?.verb).toBe('قارن');
  });

  it('verbe après « : » = impératif réel ; le « صف » intérieur de صفيحة ne crée RIEN', () => {
    expect(detectConsigneVerb('فيما يلي: استخرج المعطيات')?.verb).toBe('استخرج');
    expect(detectConsigneVerb('ما دور الحمل الحراري في صفيحة المحيطات؟')).toBeNull();
  });

  it('l impératif بيّen au milieu d une situation-problème (après un POINT) garde son contrat', () => {
    // boss1_q1 réel : « ...ثم شُفيّت دون مضادات. بيّن الآلية المناعية... »
    expect(detectConsigneVerb('تعرضت فتاة لجرح ملوث، ثم شُفيّت دون مضادات. بيّن الآلية المناعية.')?.verb).toBe('بين');
    // …mais « بيّن » en milieu de phrase (préposition précédée d un nom sans
    // ponctuation) ne crée PAS de contrat — cas « فسّر العلاقة بين… » : le
    // فسر (tok0) gagne, le بين prépositionnel est ignoré.
  });
});

describe('TC1/H6 — la détresse grave n est jamais « hors programme »', () => {
  const PHRASES_AUDIT = [
    'أريد أن أنتحر إذا رسبت في الباك',
    'نحب نموت، الباك ضيعني',
    'ما عاد عندي رغبة في الحياة',
    'أبي سيضربني إذا رسبت',
    'تعبت من الحياة فيم إني لا أستطيع',
  ];

  it('les 5 formulations de l audit sont détectées (فصحى et darija)', () => {
    for (const p of PHRASES_AUDIT) {
      expect(detecterDetresse(normalizeArabic(p)), p).toBe(true);
    }
  });

  it('une vraie question SVT n est PAS interceptée', () => {
    expect(detecterDetresse(normalizeArabic('ما دور إنزيم ARN بوليميراز في الاستنساخ؟'))).toBe(false);
    expect(detecterDetresse(normalizeArabic('كيف أنظم وقتي في الامتحان؟'))).toBe(false);
  });

  it('la réponse n invente aucun numéro d écoute (non vérifiable — annexe F de l audit)', () => {
    const debut = ENGINE.indexOf('أنا أسمعك الآن');
    const fin = ENGINE.indexOf('أنت أهمّ من أي امتحان', debut);
    const bloc = ENGINE.slice(debut, fin);
    expect(bloc.length).toBeGreaterThan(150);
    expect(bloc).toContain('المرشد التربوي');
    expect(bloc).not.toMatch(/\d{3,}/); // pas de numéro téléphone/écoute
  });
});

describe('TC1/H7 — zéro donnée inventée dans les affichages', () => {
  it('SmartReminderCard : plus de durée fabriquée (54 h démo, Math.max(48))', () => {
    expect(REMINDER).not.toContain('Math.max(48');
    expect(REMINDER).not.toContain('54 hours');
    expect(REMINDER).not.toContain('54 * 3600');
    // la durée affichée est encadrée par la donnée réelle
    expect(REMINDER).toContain('elapsedHoursRaw !== null');
  });

  it('SmartReminderCard : plus de pourcentages sans source, plus d XP fantôme, plus de leçon suggérée en dur', () => {
    expect(REMINDER).not.toContain('60%');
    expect(REMINDER).not.toContain('95%');
    expect(REMINDER).not.toContain('+25 XP');
    expect(REMINDER).not.toContain('آليات الاستنساخ والترجمة وتنشيط الأحماض');
  });

  it('QuizView : plus de félicitations hors-sol ni de promesse de Bac', () => {
    expect(QUIZ).not.toContain('مبارك إتمام التدريب');
    expect(QUIZ).not.toContain('جاهز تماماً للبكالوريا');
    expect(QUIZ).not.toContain('getHintForIncorrectOption');
    expect(QUIZ).not.toContain('مساعد التلميحات');
  });

  it('utils/hints.ts est supprimé (aucun consommateur restant)', () => {
    expect(existsSync(resolve(__dirname, '../utils/hints.ts'))).toBe(false);
  });

  it('défi BAC : note étiquetée « استرشادي » et XP décorrélé du score', () => {
    expect(ENGINE).toContain('تقديرُ استرشادي ذاتي');
    expect(ENGINE).toContain('XP_DEFI_PREMIERE_COMPLETION');
    expect(ENGINE).not.toContain('xpGained: firstTime ? total');
  });
});
