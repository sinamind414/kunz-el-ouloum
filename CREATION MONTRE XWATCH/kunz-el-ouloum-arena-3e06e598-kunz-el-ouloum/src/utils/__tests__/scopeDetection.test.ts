// src/utils/__tests__/scopeDetection.test.ts — Verrou de la R2 de l'audit
// qualité Morchid (2026-09-29) : détecteur IN-DOMAINE positif. Une question
// hors programme NON présente dans la liste noire doit être franchement
// déclarée « hors programme », et jamais renvoyer un extrait SVT vaguement lié.
// À l'inverse, toute vraie question SVT (même mal orthographiée) doit passer.
import { describe, expect, it } from 'vitest';
import { answerTutorQuestion } from '../../smartTutorEngine';

const isOutOfScope = (q: string): boolean =>
  answerTutorQuestion(q).sources?.[0]?.type === 'out_of_scope';

describe('R2 — hors-sujet NON listé rejeté', () => {
  it('rejette une question de cuisine', () => {
    expect(isOutOfScope('كيف أطبخ الكسكس بالخضر')).toBe(true);
  });
  it('rejette une question de sport', () => {
    expect(isOutOfScope('من هو أفضل لاعب كرة القدم في التاريخ')).toBe(true);
  });
});

describe('R2 — vraies questions SVT jamais bloquées', () => {
  it('protéines / immunité', () => {
    expect(isOutOfScope('ما هو دور البروتينات في المناعة')).toBe(false);
  });
  it('tectonique / subduction', () => {
    expect(isOutOfScope('اشرح لي ظاهرة الغوص في التكتونية')).toBe(false);
  });
  it('transformations énergétiques', () => {
    expect(isOutOfScope('ما هي التحولات الطاقوية في الخلية')).toBe(false);
  });
  it('terme SVT mal orthographié (R1 + R2)', () => {
    expect(isOutOfScope('ما هي وظيفة الميتوكندري')).toBe(false);
  });
  it('commande pédagogique (clic bouton)', () => {
    expect(isOutOfScope('دليل الإجابة في البكالوريا')).toBe(false);
  });
});
