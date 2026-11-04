// rappelTroisQuestions.test.tsx — L'ÉCHAUFFEMENT EST UN OUTIL, PAS UN GUIDE.
//
// Lot 2 (2026-11-04). On monte le VRAI panneau, on clique sur les options, on
// lit le feedback et on vérifie qu'aucune écriture de stockage n'a lieu. Le
// panneau ne porte NI nom de guide NI visage : une seule voix reste celle du
// Capitaine (consigne + bandeau).

import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ComponentProps } from 'react';
import RappelTroisQuestions from '../RappelTroisQuestions';
import { CAPITAINE_IDENTITE_AR } from '../../data/capitaineIdentite';
import type { QuestionRappel } from '../../lib/invitationCapitaine';

function q(id: number, correctIndex = 1): QuestionRappel {
  return {
    id,
    uniteId: 1,
    questionAr: `سؤال الاستذكار ${id}`,
    optionsAr: ['خطأ', 'صواب'],
    correctIndex,
    explicationAr: `التفسير الرسمي ${id}`,
  };
}

const TROIS = [q(1), q(2), q(3)];

afterEach(() => {
  cleanup();
  localStorage.clear();
});

function rendre(props: Partial<ComponentProps<typeof RappelTroisQuestions>> = {}) {
  const onDemarrer = props.onDemarrer ?? vi.fn();
  const onOuvrirGeste = props.onOuvrirGeste ?? vi.fn();
  const utils = render(
    <RappelTroisQuestions
      questions={TROIS}
      onDemarrer={onDemarrer}
      corpusPret
      onOuvrirGeste={onOuvrirGeste}
      libelleGesteAr="تمارين بالوضعيات"
      {...props}
    />,
  );
  return { ...utils, onDemarrer, onOuvrirGeste };
}

describe('rappel — optionnel et sans identité de guide', () => {
  it('avant le clic : une invitation, 3 دقائق, et AUCUNE question posée', () => {
    rendre();
    expect(screen.getByTestId('rappel-demarrer')).toBeTruthy();
    expect(screen.getByTestId('rappel-duree').textContent).toContain('3 دقائق');
    expect(screen.queryByTestId('rappel-question')).toBeNull();
  });

  it('le panneau ne signe AUCUN guide et n affiche AUCUN visage', () => {
    const { container } = rendre();
    const bloc = screen.getByTestId('rappel-panel');
    expect(bloc.textContent).not.toContain(CAPITAINE_IDENTITE_AR);
    expect(bloc.querySelector('img')).toBeNull();
    expect(container.querySelectorAll('[data-testid^="hub-"]')).toHaveLength(0);
  });

  it('le démarrage charge le corpus à la demande (une seule fois)', async () => {
    const user = userEvent.setup();
    const onDemarrer = vi.fn();
    rendre({ onDemarrer });
    await user.click(screen.getByTestId('rappel-demarrer'));
    expect(onDemarrer).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('rappel-question').textContent).toContain('سؤال الاستذكار 1');
  });

  it('« تخطّي » ferme le panneau : l élève peut aller droit au geste BAC', async () => {
    const user = userEvent.setup();
    rendre();
    await user.click(screen.getByTestId('rappel-demarrer'));
    await user.click(screen.getByTestId('rappel-fermer'));
    expect(screen.queryByTestId('rappel-panel')).toBeNull();
  });
});

describe('rappel — feedback immédiat, sans notation', () => {
  it('bonne réponse ⇒ feedback, explication du corpus, et bouton suivant', async () => {
    const user = userEvent.setup();
    rendre();
    await user.click(screen.getByTestId('rappel-demarrer'));
    await user.click(screen.getByTestId('rappel-option-1'));
    const fb = screen.getByTestId('rappel-feedback');
    expect(fb.textContent).toContain('إجابة صحيحة');
    expect(fb.textContent).toContain('التفسير الرسمي 1');
    expect(screen.getByTestId('rappel-suivant')).toBeTruthy();
  });

  it('mauvaise réponse ⇒ la bonne réponse est NOMMÉE, pas seulement « faux »', async () => {
    const user = userEvent.setup();
    rendre();
    await user.click(screen.getByTestId('rappel-demarrer'));
    await user.click(screen.getByTestId('rappel-option-0'));
    expect(screen.getByTestId('rappel-feedback').textContent).toContain('صواب');
  });

  it('une seule réponse par question : un 2ᵉ clic ne compte pas deux fois', async () => {
    const user = userEvent.setup();
    rendre();
    await user.click(screen.getByTestId('rappel-demarrer'));
    await user.click(screen.getByTestId('rappel-option-1'));
    await user.click(screen.getByTestId('rappel-option-0'));
    await user.click(screen.getByTestId('rappel-suivant'));
    await user.click(screen.getByTestId('rappel-option-0'));
    await user.click(screen.getByTestId('rappel-suivant'));
    await user.click(screen.getByTestId('rappel-option-0'));
    await user.click(screen.getByTestId('rappel-suivant'));
    expect(screen.getByTestId('rappel-bilan').textContent).toContain('1 من 3');
  });

  it('3 questions ⇒ bilan + CTA vers UN geste BAC', async () => {
    const user = userEvent.setup();
    const { onOuvrirGeste } = rendre();
    await user.click(screen.getByTestId('rappel-demarrer'));
    for (let i = 0; i < 3; i++) {
      await user.click(screen.getByTestId('rappel-option-1'));
      await user.click(screen.getByTestId('rappel-suivant'));
    }
    expect(screen.getByTestId('rappel-bilan').textContent).toContain('3 من 3');
    const cta = screen.getByTestId('rappel-cta-geste');
    expect(cta.textContent).toContain('تمارين بالوضعيات');
    await user.click(cta);
    expect(onOuvrirGeste).toHaveBeenCalledTimes(1);
  });

  it('sans consigne d état ⇒ AUCUN CTA inventé', async () => {
    const user = userEvent.setup();
    rendre({ onOuvrirGeste: null });
    await user.click(screen.getByTestId('rappel-demarrer'));
    for (let i = 0; i < 3; i++) {
      await user.click(screen.getByTestId('rappel-option-1'));
      await user.click(screen.getByTestId('rappel-suivant'));
    }
    expect(screen.getByTestId('rappel-bilan')).toBeTruthy();
    expect(screen.queryByTestId('rappel-cta-geste')).toBeNull();
  });

  it('2 questions seulement ⇒ bilan sur 2, pas de 3ᵉ question fabriquée', async () => {
    const user = userEvent.setup();
    rendre({ questions: [q(1), q(2)] });
    await user.click(screen.getByTestId('rappel-demarrer'));
    for (let i = 0; i < 2; i++) {
      await user.click(screen.getByTestId('rappel-option-1'));
      await user.click(screen.getByTestId('rappel-suivant'));
    }
    expect(screen.getByTestId('rappel-bilan').textContent).toContain('2 من 2');
  });

  it('ZÉRO stockage : répondre aux 3 questions n écrit aucune clé', async () => {
    const user = userEvent.setup();
    const avant = localStorage.length;
    rendre();
    await user.click(screen.getByTestId('rappel-demarrer'));
    for (let i = 0; i < 3; i++) {
      await user.click(screen.getByTestId('rappel-option-1'));
      await user.click(screen.getByTestId('rappel-suivant'));
    }
    expect(localStorage.length).toBe(avant);
  });
});

describe('rappel — corpus absent : honnêteté', () => {
  it('en chargement ⇒ message d attente, pas de fausse question', async () => {
    const user = userEvent.setup();
    rendre({ questions: [], corpusPret: false });
    await user.click(screen.getByTestId('rappel-demarrer'));
    expect(screen.getByTestId('rappel-indisponible').textContent).toContain('جارٍ');
  });

  it('corpus chargé mais vide ⇒ on le dit et on renvoie au geste BAC', async () => {
    const user = userEvent.setup();
    rendre({ questions: [], corpusPret: true });
    await user.click(screen.getByTestId('rappel-demarrer'));
    expect(screen.getByTestId('rappel-indisponible').textContent).toContain('غير متاحة');
  });
});
