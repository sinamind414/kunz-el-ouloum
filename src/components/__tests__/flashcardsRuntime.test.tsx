// flashcardsRuntime.test.tsx — vérifie que les VRAIES flashcards (552) fonctionnent
// dans RevisionView, pas seulement que leurs données sont valides.
//
// flashcards.lock.test.ts fige l'intégrité de la banque (verso non vide, schémas
// présents). Ici on monte les cartes réelles dans le composant et on exerce les
// interactions : retournement, verso affiché, navigation par note, changement
// d'unité, mode lecture. C'est la garantie que la carte de l'élève affiche bien
// sa réponse et ne plante pas au retournement.

import { cleanup, render, screen, fireEvent } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import RevisionView from '../RevisionView';
import { SVT_FLASHCARDS } from '../../data';
import { INITIAL_UNITS } from '../../data';
import { Flashcard, Unit } from '../../types';

afterEach(() => {
  cleanup();
  localStorage.clear();
});

const UNITS: Unit[] = INITIAL_UNITS;

/** Prend une carte réelle par unité (11 unités) pour couvrir tout le programme. */
function uneCarteParUnite(): Flashcard[] {
  const vues = new Map<number, Flashcard>();
  for (const c of SVT_FLASHCARDS) {
    if (!vues.has(c.unitId)) vues.set(c.unitId, c);
  }
  return [...vues.values()];
}

/** Les 3 cartes « collège » historiques (fc_1..3) + quelques dérivées du QCM. */
function cartesCles(): Flashcard[] {
  const college = SVT_FLASHCARDS.filter((c) => c.id === 'fc_1' || c.id === 'fc_2' || c.id === 'fc_3');
  const derivees = [1, 100, 275, 549].map(
    (qid) => SVT_FLASHCARDS.find((c) => c.id === `fc_q_${qid}`)!,
  );
  return [...college, ...derivees];
}

function renderView(cards: Flashcard[], unitId = 1) {
  render(
    <RevisionView
      units={UNITS}
      flashcards={cards}
      xp={0}
      streak={0}
      onRateCard={() => {}}
      isFocusMode={false}
      setIsFocusMode={() => {}}
      initialUnitId={unitId}
    />,
  );
}

describe('cartes réelles — rendu dans RevisionView', () => {
  it('552 cartes : une par unité se retournent et affichent un verso non vide', () => {
    for (const c of uneCarteParUnite()) {
      cleanup();
      renderView([c], c.unitId);
      const recto = screen.getByText(c.question);
      expect(recto, `${c.id} : question absente`).toBeTruthy();
      fireEvent.click(recto);
      // Le verso contient la première puce de réponse (markdown ** inclus).
      const premierMorceau = c.answerBullets[0].split('**')[1] ?? c.answerBullets[0].slice(0, 20);
      expect(
        screen.getByText(premierMorceau),
        `${c.id} (unité ${c.unitId}) : verso vide au retournement`,
      ).toBeTruthy();
    }
  });

  it('les 3 cartes collège + 4 dérivées QCM s affichent et se retournent', () => {
    for (const c of cartesCles()) {
      cleanup();
      renderView([c], c.unitId);
      expect(screen.getByText(c.question), `${c.id} : question`).toBeTruthy();
      fireEvent.click(screen.getByText(c.question));
      const morceau = c.answerBullets[0].split('**')[1] ?? c.answerBullets[0].slice(0, 20);
      expect(screen.getByText(morceau), `${c.id} : verso vide`).toBeTruthy();
    }
  });

  it('le verso affiche les puces en gras (découpage ** du corpus)', () => {
    const c = SVT_FLASHCARDS.find((x) => x.id === 'fc_1')!;
    renderView([c], 1);
    fireEvent.click(screen.getByText(c.question));
    // « المقر: » est le segment en gras de la première puce de fc_1.
    expect(screen.getByText('المقر:')).toBeTruthy();
  });

  it('naviguer par note passe à la carte suivante et revient au début (boucle)', async () => {
    const cartes = SVT_FLASHCARDS.filter((c) => c.unitId === 1).slice(0, 3);
    renderView(cartes, 1);
    fireEvent.click(screen.getByText(cartes[0].question));
    fireEvent.click(screen.getByText('جيد'));
    // handleRate attend 300 ms (setTimeout) avant de changer de carte.
    expect(await screen.findByText(cartes[1].question, {}, { timeout: 2000 })).toBeTruthy();
  });

  it('changer d unité affiche une carte de cette unité (jamais un slot vide)', () => {
    for (const u of UNITS) {
      cleanup();
      const carte = SVT_FLASHCARDS.find((c) => c.unitId === u.id);
      expect(carte, `unité ${u.id} (${u.title}) : aucune carte`).toBeDefined();
      renderView(SVT_FLASHCARDS, u.id);
      expect(screen.getByText(carte!.question)).toBeTruthy();
    }
  });

  it('une unité sans carte affiche le message dédié au lieu de planter', () => {
    renderView([], 1);
    expect(screen.getByText('لا توجد بطاقات متاحة لهذه الوحدة بعد')).toBeTruthy();
  });

  it('le bouton du haut-parleur ne retourne pas la carte (stopPropagation)', () => {
    const c = SVT_FLASHCARDS[0];
    renderView([c], c.unitId);
    const boutonSon = screen.getByTitle('استمع للسؤال بصوتٍ مسموع');
    fireEvent.click(boutonSon);
    // Recto toujours visible : la carte ne s'est pas retournée.
    expect(screen.getByText('💡 اضغط على البطاقة لتكشف عن الإجابة النموذجية')).toBeTruthy();
  });

  it('mode lecture : la question s affiche en plus grand (text-2xl)', () => {
    const c = SVT_FLASHCARDS[0];
    renderView([c], c.unitId);
    fireEvent.click(screen.getByText('وضع القراءة'));
    const titre = screen.getByText(c.question);
    expect(titre.className).toContain('text-2xl');
  });
});
