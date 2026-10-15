// fillBlanksLoader.test.ts — le chargement différé ne doit RIEN changer au quiz.
//
// Sortir 50 Ko du bundle d'entrée (M7) n'a de valeur que si le contenu servi est
// identique. Ce fichier compare donc le chargeur différé à la source directe :
// mêmes questions, même ordre, mêmes identifiants.

import { describe, expect, it } from 'vitest';
import {
  chargerFillBlanks,
  peekFillBlanks,
  versQuizQuestions,
  __resetFillBlanksCache,
} from './fillBlanksLoader';
import { FILL_BLANK_QUESTIONS } from './fillBlanks';

describe('fillBlanksLoader — parité avec la source directe', () => {
  it('rend exactement les mêmes questions que l’import direct', async () => {
    __resetFillBlanksCache();
    const chargees = await chargerFillBlanks();
    expect(chargees).toHaveLength(FILL_BLANK_QUESTIONS.length);
    expect(chargees).toEqual(FILL_BLANK_QUESTIONS);
  });

  it('mémorise : deux appels ne retéléchargent pas, et le cache est interrogeable', async () => {
    __resetFillBlanksCache();
    expect(peekFillBlanks(), 'aucun cache ne doit exister avant le premier appel').toBeNull();
    const a = await chargerFillBlanks();
    const b = await chargerFillBlanks();
    expect(b).toBe(a);
    expect(peekFillBlanks()).toBe(a);
  });

  it('convertit une unité en questions de quiz, avec les identifiants décalés', () => {
    const questions = versQuizQuestions(FILL_BLANK_QUESTIONS, 1);
    expect(questions.length).toBeGreaterThan(0);
    for (const q of questions) {
      expect(q.unitId).toBe(1);
      expect(q.kind).toBe('fillBlank');
      expect(q.options).toEqual([]);
      expect(q.correctAnswerIndex).toBe(-1);
      expect(q.acceptedAnswers?.length ?? 0).toBeGreaterThan(0);
      // Convention historique (App.tsx) : 9 000 000 + rang, pour ne jamais
      // entrer en collision avec les identifiants du corpus QCM.
      expect(q.id).toBeGreaterThanOrEqual(9_000_000);
    }
  });

  it('une unité sans question à trous rend une liste vide, sans lever', () => {
    expect(versQuizQuestions(FILL_BLANK_QUESTIONS, 999)).toEqual([]);
  });

  it('la conversion est stable : deux appels donnent le même résultat', () => {
    expect(versQuizQuestions(FILL_BLANK_QUESTIONS, 2)).toEqual(versQuizQuestions(FILL_BLANK_QUESTIONS, 2));
  });
});
