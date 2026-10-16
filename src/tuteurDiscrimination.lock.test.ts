// src/tuteurDiscrimination.lock.test.ts — verrou du banc de discrimination
// (audit v4b, 16/10/2026) : des questions portant sur des NOTIONS DISTINTES
// doivent recevoir des réponses DISTINCTES, servies depuis le contenu EXISTANT
// du dépôt (microAnswers verbatim — aucune rédaction nouvelle).
//
// Mesuré avant correctif (12 questions → 7 réponses distinctes, 58 %) :
//   · « السيدا » et « الذاكرة المناعية » → même fiche « الاستجابة المناعية »,
//     même texte, conf 75 — deux notions différentes, une seule réponse ;
//   · « دور النقال » et « مراحل النسخ » → même fiche « تركيب البروتين » ;
//   · « البوليزوم » → repli « لا يوجد نصّ مطابق » alors que le corpus contient
//     un QCM dédié (quizCorpus q. 21) et une fiche mot-clé (tutorKnowledge
//     chunk_396) ;
//   · « التخمر اللاكتيكي » et « دور المايتوكوندري » → même fiche
//     « التنفس والتخمر », sans distinguer les deux notions.
import { describe, expect, it } from 'vitest';
import { processStudentInput } from './smartTutorEngine';
import { getDefaultSession } from './utils/sessionManager';

const session = () => ({ ...getDefaultSession(), activeDomainId: null });
const reponse = (q: string): string => processStudentInput(session(), q).action.text;

describe('banc de discrimination (audit v4b) — chaque notion reçoit SA réponse', () => {
  it('« السيدا » distingue VIH (le virus) du stade maladie — texte verbatim du QCM 2269', () => {
    expect(reponse('واش هو مرض السيدا؟')).toContain('المرحلة المرضية');
  });

  it('« الذاكرة المناعية » parle de la réponse secondaire — texte verbatim du QCM 140', () => {
    expect(reponse('واش هي الذاكرة المناعية؟')).toContain('الاستجابة الثانية');
  });

  it('« مراحل النسخ » cite les trois étapes du corpus (chunk_395)', () => {
    expect(reponse('واش هي مراحل النسخ؟')).toContain('الاستطالة');
  });

  it('« دور النقال » décrit la structure ARNt (chunk_397)', () => {
    expect(reponse('واش هو دور النقال في الترجمة؟')).toContain('الرامزة المضادة');
  });

  it('« البوليزوم » n\'est plus un repli : le QCM dédié existait dans le corpus', () => {
    const t = reponse('واش هو البوليزوم؟');
    expect(t, t.slice(0, 120)).not.toContain('لا يوجد نصّ');
    expect(t).toContain('البوليزوم');
  });

  it('« التخمر اللاكتيكي » cite le rendement et l\'acide lactique (book_22)', () => {
    expect(reponse('واش هو التخمر اللاكتيكي؟')).toContain('حمض لبني');
  });

  it('« دور المايتوكوندري » cite le cycle de Krebs (book_21)', () => {
    expect(reponse('واش هو دور المايتوكوندري؟')).toContain('حلقة كريبس');
  });

  it('« الخلايا التائية القاتلة » décrit le mécanisme LTc/CD8 — pas la leçon VIH', () => {
    expect(reponse('واش هو دور الخلايا التائية القاتلة؟')).toContain('CD8');
  });

  it('deux notions voisines ne partagent plus la même réponse (paires mesurées)', () => {
    expect(reponse('واش هو مرض السيدا؟')).not.toBe(reponse('واش هي الذاكرة المناعية؟'));
    expect(reponse('واش هو دور النقال في الترجمة؟')).not.toBe(reponse('واش هي مراحل النسخ؟'));
    expect(reponse('واش هي مراحل التحلل السكري؟')).not.toBe(reponse('واش هو التخمر اللاكتيكي؟'));
  });
});
