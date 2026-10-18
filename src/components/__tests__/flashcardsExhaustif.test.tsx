// flashcardsExhaustif.test.tsx — parcours des cartes réelles (569 depuis le
// filtre T3a : 531 QCM dérivées + 35 hosila + 3 collège) : on retourne
// CHACUNE et on vérifie que son verso affiche sa première puce de réponse.
// C'est la garantie exhaustive « aucune carte ne montre un verso vide ».
//
// Court (569 retournements en lot) : on ne render qu'une carte à la fois et on
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

describe('exhaustif — les 569 cartes se retournent avec un verso', () => {
  // 569 retournements : on laisse 75 s (60 s dépassait à 60,9 s mesurés — T3a).
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
      // correspondance partielle : les versos hosila sont des PHRASES sans
      // label markdown (le fragment n'est pas un nœud de texte à lui seul).
      if (screen.queryAllByText(cible, { exact: false }).length === 0) echecs.push(`${c.id} (u${c.unitId})`);
    }
    expect(echecs, `cartes au verso vide : ${echecs.join(', ')}`).toEqual([]);
  }, 75000);
});
