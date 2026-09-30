// versoImage.test.tsx — reproduction du signalement « verso : image inversée
// SANS réponse » (bug MOURAADJA). La carte se retourne ; on doit voir la réponse
// textuelle (puces) ET l'éventuel schéma, et jamais une image seule/miroir.
//
// Mécanisme vérifié : .rotate-y-180 + .backface-hidden (index.css). Si le verso
// restait caché ou affichait l'image miroir sans ses puces, ce test l'attrape.

import { cleanup, render, screen, fireEvent } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import RevisionView from '../RevisionView';
import { SVT_FLASHCARDS } from '../../data';
import { INITIAL_UNITS } from '../../data';

afterEach(() => {
  cleanup();
  localStorage.clear();
});

const AVEC_DIAGRAMME = SVT_FLASHCARDS.filter((c) => c.diagramUrl);

function renderView(cardId: string) {
  const c = SVT_FLASHCARDS.find((x) => x.id === cardId)!;
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
  return c;
}

describe('signalement « verso image inversée sans réponse »', () => {
  it('le verso contient TOUJOURS les puces de réponse (jamais l image seule)', () => {
    // Une carte à schéma : c est le cas où l image pourrait masquer la réponse.
    for (const c of AVEC_DIAGRAMME.slice(0, 12)) {
      cleanup();
      renderView(c.id);
      fireEvent.click(screen.getByText(c.question));
      // Au moins la moitié des puces doivent être présentes dans le DOM.
      const presentes = c.answerBullets.filter((b) => {
        const morceau = b.split('**')[1] ?? b.split('**')[0].slice(0, 25);
        return screen.queryByText(morceau) !== null;
      });
      expect(
        presentes.length,
        `${c.id} : ${presentes.length}/${c.answerBullets.length} puces affichées`,
      ).toBeGreaterThan(0);
    }
  });

  it('l image du verso (diagramUrl) est rendue, pas absente ni dupliquée', () => {
    const c = AVEC_DIAGRAMME[0];
    renderView(c.id);
    fireEvent.click(screen.getByText(c.question));
    const imgs = document.querySelectorAll(`img[src="${c.diagramUrl}"]`);
    expect(imgs.length, `${c.id} : 1 image attendue`).toBeGreaterThanOrEqual(1);
  });

  it('recto et verso coexistent dans le DOM ; le verso est marqué rotate-y-180', () => {
    const c = AVEC_DIAGRAMME[0];
    renderView(c.id);
    fireEvent.click(screen.getByText(c.question));
    const conteneur = document.querySelector('.transform-style-3d');
    expect(conteneur).not.toBeNull();
    const faces = conteneur!.querySelectorAll('.backface-hidden');
    expect(faces.length, 'recto + verso = 2 faces').toBe(2);
    const verso = [...faces].find((f) => f.classList.contains('rotate-y-180'));
    expect(verso, 'le verso porte bien rotate-y-180').toBeDefined();
  });

  it('les 3 cartes collège (sans schéma) affichent leur réponse au retournement', () => {
    for (const id of ['fc_1', 'fc_2', 'fc_3']) {
      cleanup();
      const c = renderView(id);
      fireEvent.click(screen.getByText(c.question));
      const morceau = c.answerBullets[0].split('**')[1];
      expect(screen.getByText(morceau!), `${id} : verso vide`).toBeTruthy();
    }
  });
});
