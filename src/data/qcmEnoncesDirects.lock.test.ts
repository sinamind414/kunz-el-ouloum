// qcmEnoncesDirects.lock.test.ts — Vague 2 (audit externe v2, 2026-10-17).
//
// DÉFAUT MESURÉ : 148/550 énoncés du QCM étaient des MÉTA-QUESTIONS d'examen —
// ils parlent de l'épreuve (« أي خيار يطابق البرنامج الرسمي ? », « سؤال
// البكالوريا طلب تفسير... أي إجابة تستحق النقطة ? », « من بين الأجوبة... »)
// au lieu de poser la question scientifique. Deux conséquences :
//   1. l'élève lit un méta-discours au lieu d'une qüestion d'SVT autonome ;
//   2. ces textes servent de RECTO aux flashcards dérivées (fc_q_*) — un recto
//      qui présuppose des options est inexploitable en rappel actif.
// Le décompte de l'audit « 80 gabarits ×10 » était FAUX au niveau du texte
// (550 énoncés tous distincts — mesure scripts jetable) ; le vrai défaut est
// la phraséologie méta, corrigée énoncé par énoncé.
//
// FIX : réécriture des 148 énoncés en questions/directives DIRECTES (فصحى) —
// réponses et explications INTACTES (chaîne dérivation flashcards verrouillée).
import { describe, expect, it } from 'vitest';
import { SVT_QUIZ_QUESTIONS } from '../quizCorpus';

// Marqueurs du méta-discours d'examen (interdits dans les énoncés du corpus).
const MARQUEURS_META = [
  'حين يَرِد',
  'في سؤال من نوع',
  'سؤال البكالوريا طلب',
  'أي خيار',
  'أي جواب',
  'أي إجابة',
  'أي معلومة دقيقة تبعد',
  'من بين الأجوبة',
  'الخيارات',
  'الأجوبة التالية',
  'اختر الأدق',
  'تستحق النقطة',
  'المصحح',
  'البرنامج الرسمي',
];

describe('Vague 2 — énoncés du QCM directs (pas de méta-discours d examen)', () => {
  it('0 énoncé ne mentionne les options, la note ou le correcteur', () => {
    const atteints: Array<{ id: number; texte: string }> = [];
    for (const q of SVT_QUIZ_QUESTIONS) {
      for (const m of MARQUEURS_META) {
        if (q.questionText.includes(m)) {
          atteints.push({ id: q.id, texte: `${m} :: ${q.questionText.slice(0, 60)}` });
          break;
        }
      }
    }
    expect(atteints, `énoncés méta restants (${atteints.length}):\n${atteints.map((x) => `Q${x.id} ${x.texte}`).join('\n')}`).toEqual([]);
  });
});
