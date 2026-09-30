// flashcardsExhaustif.test.tsx — parcours des 552 cartes réelles : on retourne
// CHACUNE et on vérifie que son verso affiche sa première puce de réponse.
// C'est la garantie exhaustive « aucune carte ne montre un verso vide ».
//
// Court (552 retournements en lot) : on ne render qu'une carte à la fois et on
// ne cherche que le segment identifiant de la première puce.

import { cleanup, render, screen, fireEvent } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import RevisionView from '../RevisionView';
import { SVT_FLASHCARDS } from '../../data';
import { INITIAL_UNITS } from '../../data';

afterEach(() => {
  cleanup();
  localStorage.clear();
});

describe('exhaustif — les 552 cartes se retournent avec un verso', () => {
  // 552 retournements : on laisse 60 s (le délai par défaut de 5 s est dépassé).
  it('chaque carte affiche sa première puce de réponse au retournement', () => {    const echecs: string[] = [];
    for (const c of SVT_FLASHCARDS) {
      cleanup();
      render(
        <RevisionView
          units={INITIAL_UNITS}
          flashcards={[c]}
          xp={0}
          streak={0}
          onRateCard={() => {}}
          isFocusMode={false}
          setIsFocusMode={() => {}}
          initialUnitId={c.unitId}
        />,
      );
      fireEvent.click(screen.getByText(c.question));
      const segments = c.answerBullets[0].split('**');
      const cible = (segments[1] ?? segments[0]).trim().slice(0, 30);
      if (screen.queryByText(cible) === null) echecs.push(`${c.id} (u${c.unitId})`);
    }
    expect(echecs, `cartes au verso vide : ${echecs.join(', ')}`).toEqual([]);
  }, 60000);
});
