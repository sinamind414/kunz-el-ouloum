/**
 * S-04 (SpecKit 002) — typage d'erreur R / A du tuteur Morchid.
 *
 * Verrou restauré après la fusion arena/01a0f7a7 : la branche supprimait
 * `speckitS03S04.test.ts` (95 lignes) et laissait `classifyError` sans aucun
 * test unitaire direct — `git grep classifyError -- '*.test.ts'` ne donnait
 * plus rien. Les 4 assertions ci-dessous sont reprises à l'identique de
 * l'ancien fichier.
 *
 * Couverture dispo : le bloc S-03 (triade C3) est verrouillé depuis par
 * `morchidSocratique.test.ts` (KEO-105) — il n'est donc pas répété ici.
 *
 * Règle : aucun signal de document et aucun verbe d'analyse → restitution (R) ;
 * dès qu'un signal de document OU un verbe d'analyse apparaît → analyse (A),
 * et A l'emporte sur R (le BAC paie l'analyse avant la restitution).
 */
import { describe, expect, it } from 'vitest';
import { classifyError } from '../../smartTutorEngine';

describe('S-04 — typage d\'erreur R / A', () => {
  it('un document dans la consigne → type A (analyse)', () => {
    expect(
      classifyError('الإجابة خاطئة', { keyPoints: [], situation: 'انطلاقاً من الوثيقة' }),
    ).toBe('A');
  });

  it('un verbe d\'exploitation → type A', () => {
    expect(classifyError('حلّل المنحنى', { keyPoints: [] })).toBe('A');
  });

  it('pas de document, pas de verbe → type R (restitution)', () => {
    expect(classifyError('الإنزيم موجود في النواة', { keyPoints: [] })).toBe('R');
  });

  it('quand A et R sont présents, A l\'emporte', () => {
    expect(
      classifyError('حلّل الوثيقة', { keyPoints: [], situation: 'الجدول' }),
    ).toBe('A');
  });
});
