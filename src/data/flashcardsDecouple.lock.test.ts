// flashcardsDecouple.lock.test.ts — B6 (audit externe v2, « ligne par ligne »).
//
// DÉFAUT HISTORIQUE : `SVT_FLASHCARDS = SVT_QUIZ_QUESTIONS.map(...)` recyclait
// les 550 QCM en « cartes » EN COPIANT aussi `options` et `correctOptionIndex`
// dans chaque carte — de la donnée morte (aucun consommateur, RevisionView ne
// rend jamais les options), et sémantiquement trompeuse : ces cartes étaient
// des QCM habillés, pas des cartes de rappel actif.
//
// B6 fix : les cartes dérivées ne transportent PLUS les champs options —
// la carte est un couple question → réponse (verso = bonne réponse + texte
// d'explication du QCM source, chaîne déjà verrouillée par flashcards.lock).
// La banque reste crédible au regard de l'audit : aucune donnée QCM morte.
import { describe, expect, it } from 'vitest';
import { SVT_FLASHCARDS } from './index';

describe('B6 — les flashcards ne sont plus des QCM habillés', () => {
  it('AUCUNE carte ne transporte les champs morts du QCM (options / correctOptionIndex)', () => {
    const porteuses = SVT_FLASHCARDS.filter(
      (c) => 'options' in c || 'correctOptionIndex' in c,
    ).map((c) => c.id);
    expect(porteuses).toEqual([]);
  });

  it('toutes les cartes restent un couple question → verso réel (pas de carte creuse)', () => {
    // Vague 2 action 9 : 588 = 35 cartes hosila (vraies cartes, livres) + 550
    // dérivées QCM + 3 collège — la part non dérivée croîtra tranche après tranche.
    expect(SVT_FLASHCARDS.length).toBe(588);
    for (const c of SVT_FLASHCARDS) {
      expect(c.question.trim().length).toBeGreaterThanOrEqual(8);
      expect(c.answerBullets.length).toBeGreaterThan(0);
    }
  });
});
