// rappelVersDefter.test.tsx — LA CAUSE DÉCLARÉE ARRIVE VRAIEMENT AU دفتر.
//
// Lot 3 (2026-11-04), ENCHAÎNÉ sur les lots 1 + 2. Chaîne complète prouvée sur
// les modules RÉELS, sans simulacre :
//   élève rate un rappel → il DÉCLARE sa cause → enregistrerErreurs()
//   → profilErreurs (localStorage) → resumeProfilAr() / contexteCapitaine().
//
// On verrouille aussi le contraire : « سبب آخر » n'écrit rien, un sans-faute ne
// demande rien, une session n'écrit qu'UNE fois, et le SRS n'est pas touché.

import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import RappelTroisQuestions from '../RappelTroisQuestions';
import TrainingHubView from '../TrainingHubView';
import { CAUSES_QCM, QUESTION_CAUSE_AR } from '../../data/diagnosticQuiz';
import { enregistrerCauseDuRappel } from '../../lib/pontRappelErreurs';
import type { QuestionRappel } from '../../lib/invitationCapitaine';
import {
  enregistrerErreurs,
  profilErreurs,
  resumeProfilAr,
  totalErreurs,
} from '../../utils/profilErreurs';
import { assemblerEtatEleve, contexteCapitaine } from '../../lib/etatEleve';
import { fournirEtatEleve, reinitialiserEtatEleve } from '../../lib/etatEleveRuntime';
import { markDone, resetParcours } from '../../lib/parcours/parcoursProgress';
import { PARCOURS_FLAT, PARCOURS_DOMAINS } from '../../lib/parcours/parcoursPath';
import type { Corpus } from '../../data/corpusLoader';
import type { Flashcard, QuizQuestion } from '../../types';

const THEME_U1 = PARCOURS_DOMAINS.flatMap((d) => d.units).find((u) => u.unitId === 1)!.title;
const CLE_DEFTER = 'boussole_profil_erreurs';

function q(id: number, correctIndex = 1): QuestionRappel {
  return {
    id,
    uniteId: 1,
    questionAr: `سؤال ${id}`,
    optionsAr: ['خطأ', 'صواب'],
    correctIndex,
    explicationAr: `تفسير ${id}`,
    themeAr: THEME_U1,
  };
}

const TROIS = [q(1), q(2), q(3)];

function corpusDeTest(): Corpus {
  const questions: QuizQuestion[] = [1, 2, 3, 4, 5, 6].map((id) => ({
    id,
    unitId: 1,
    questionText: `سؤال ${id}`,
    options: ['خطأ', 'صواب'],
    correctAnswerIndex: 1,
    explanation: `تفسير ${id}`,
  }));
  const flashcards: Flashcard[] = questions.map((x) => ({
    id: `fc_q_${x.id}`,
    unitId: 1,
    question: x.questionText,
    answerBullets: [x.explanation],
  }));
  return { questions, flashcards };
}

function ouvrirUnites(n: number): void {
  resetParcours();
  const ids = [...new Set(PARCOURS_FLAT.map((i) => i.unitId))].sort((a, b) => a - b);
  for (const uid of ids.slice(0, n)) {
    for (const item of PARCOURS_FLAT.filter((i) => i.unitId === uid)) markDone(item.id);
  }
}

beforeEach(() => {
  localStorage.clear();
  reinitialiserEtatEleve();
});

afterEach(() => {
  cleanup();
  localStorage.clear();
  reinitialiserEtatEleve();
});

function rendre(options: { questions?: readonly QuestionRappel[] } = {}) {
  const onDemarrer = vi.fn();
  render(
    <RappelTroisQuestions
      questions={options.questions ?? TROIS}
      onDemarrer={onDemarrer}
      corpusPret
      onOuvrirGeste={vi.fn()}
      libelleGesteAr="تمارين بالوضعيات"
    />,
  );
  return { onDemarrer };
}

async function parcourir(user: ReturnType<typeof userEvent.setup>, reponses: number[], nombre: number): Promise<void> {
  await user.click(screen.getByTestId('rappel-demarrer'));
  for (let i = 0; i < nombre; i++) {
    await user.click(screen.getByTestId(`rappel-option-${reponses[i]}`));
    await user.click(screen.getByTestId('rappel-suivant'));
  }
}

describe('lot 3 — la déclaration est demandée, jamais imposée', () => {
  it('une erreur ⇒ LA question du produit et ses 4 causes, pas une de plus', async () => {
    const user = userEvent.setup();
    rendre();
    await parcourir(user, [0, 1, 1], 3);
    expect(screen.getByTestId('rappel-cause-question').textContent).toBe(QUESTION_CAUSE_AR);
    for (const c of CAUSES_QCM) {
      expect(screen.getByTestId(`rappel-cause-${c.id}`), c.id).toBeTruthy();
    }
  });

  it('sans-faute ⇒ AUCUNE question de cause, AUCUNE écriture', async () => {
    const user = userEvent.setup();
    rendre();
    await parcourir(user, [1, 1, 1], 3);
    expect(screen.queryByTestId('rappel-cause-bloc')).toBeNull();
    expect(totalErreurs()).toBe(0);
    expect(localStorage.getItem(CLE_DEFTER)).toBeNull();
  });

  it('le CTA vers le geste BAC reste visible AVEC la question de cause', async () => {
    const user = userEvent.setup();
    rendre();
    await parcourir(user, [0, 1, 1], 3);
    expect(screen.getByTestId('rappel-cause-bloc')).toBeTruthy();
    expect(screen.getByTestId('rappel-cta-geste')).toBeTruthy();
  });
});

describe('lot 3 — écriture réelle, une seule, avec le bon thème', () => {
  it('cause « notion » ⇒ 1 occurrence dans le دفتر, AVEC le titre de l unité', async () => {
    const user = userEvent.setup();
    rendre();
    await parcourir(user, [0, 1, 1], 3);
    await user.click(screen.getByTestId('rappel-cause-notion'));

    expect(totalErreurs()).toBe(1);
    const entree = profilErreurs()['notion_confusion'];
    expect(entree).toBeTruthy();
    expect(entree.n).toBe(1);
    expect(entree.themes).toContain(THEME_U1);
    expect(screen.getByTestId('rappel-cause-enregistree').textContent).toContain('سُجّل');
  });

  it('UNE seule écriture par session : les boutons disparaissent après déclaration', async () => {
    const user = userEvent.setup();
    rendre();
    await parcourir(user, [0, 0, 0], 3);
    await user.click(screen.getByTestId('rappel-cause-preuve'));
    expect(screen.queryByTestId('rappel-cause-bloc')).toBeNull();
    expect(totalErreurs()).toBe(1); // 3 erreurs ≠ 3 occurrences : pas d'inflation
  });

  it('« سبب آخر » ⇒ ZÉRO écriture et un message honnête', async () => {
    const user = userEvent.setup();
    rendre();
    await parcourir(user, [0, 1, 1], 3);
    await user.click(screen.getByTestId('rappel-cause-autre'));
    expect(totalErreurs()).toBe(0);
    expect(localStorage.getItem(CLE_DEFTER)).toBeNull();
    expect(screen.getByTestId('rappel-cause-enregistree').textContent).toContain('لم نسجّل شيئًا');
  });

  it('cause inconnue (code orphelin) ⇒ ignorée sans exception', () => {
    expect(enregistrerCauseDuRappel('cause_qui_nexiste_pas', THEME_U1)).toEqual({
      enregistrees: 0,
      code: null,
    });
    expect(totalErreurs()).toBe(0);
  });

  it('deux sessions sur la MÊME cause ⇒ le profil peut enfin parler', async () => {
    const user = userEvent.setup();
    for (let session = 0; session < 2; session++) {
      rendre();
      await parcourir(user, [0, 1, 1], 3);
      await user.click(screen.getByTestId('rappel-cause-notion'));
      cleanup();
    }
    expect(totalErreurs()).toBe(2);
    expect(resumeProfilAr()).not.toBeNull();
  });

  it('UNE session isolée ne fait PAS croire à un profil', async () => {
    const user = userEvent.setup();
    rendre();
    await parcourir(user, [0, 1, 1], 3);
    await user.click(screen.getByTestId('rappel-cause-notion'));
    expect(totalErreurs()).toBe(1);
    expect(resumeProfilAr()).toBeNull();
  });

  it('AUCUNE nouvelle clé : seul le دفتر existant est touché, jamais le SRS', async () => {
    const user = userEvent.setup();
    rendre();
    await parcourir(user, [0, 1, 1], 3);
    await user.click(screen.getByTestId('rappel-cause-notion'));
    const cles: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k) cles.push(k);
    }
    expect(cles).toEqual([CLE_DEFTER]);
    expect(localStorage.getItem('kunz_flashcard_srs_v1')).toBeNull();
    expect(localStorage.getItem('kunz-rappel-adaptatif-v1')).toBeNull();
  });
});

describe('lot 3 — la chaîne remonte jusqu au Capitaine', () => {
  it('totalErreurs() alimente bien contexteCapitaine().erreursAReprendre', () => {
    enregistrerErreurs(['notion_confusion'], { theme: THEME_U1 });
    expect(totalErreurs()).toBe(1);
    const etat = assemblerEtatEleve({
      daily: undefined,
      maintenant: new Date(2026, 10, 4, 10, 0, 0),
      erreurs: { total: totalErreurs(), dominante: null, capital: { fermees: 0, rouvertes: 0, total: 0 } },
    });
    expect(contexteCapitaine(etat).erreursAReprendre).toBe(1);
  });

  it('dans le VRAI hub : déclarer écrit le thème du parcours, et le CTA ouvre le module', async () => {
    ouvrirUnites(2);
    fournirEtatEleve(assemblerEtatEleve({
      daily: undefined,
      maintenant: new Date(2026, 10, 4, 10, 0, 0),
      rubrique: 'training',
      rubriqueAUnConseil: true,
      rubriquesDejaVues: ['training'],
      competence: { verdicts: {}, faibles: [], unitePrioritaire: null },
      erreurs: { total: 0, dominante: null, capital: { fermees: 0, rouvertes: 0, total: 0 } },
    }));
    const onOpen = vi.fn();
    const user = userEvent.setup();
    render(<TrainingHubView onOpen={onOpen} corpusRappel={corpusDeTest()} />);

    await user.click(screen.getByTestId('rappel-demarrer'));
    await user.click(screen.getByTestId('rappel-option-0'));
    await user.click(screen.getByTestId('rappel-suivant'));
    await user.click(screen.getByTestId('rappel-option-1'));
    await user.click(screen.getByTestId('rappel-suivant'));
    await user.click(screen.getByTestId('rappel-option-1'));
    await user.click(screen.getByTestId('rappel-suivant'));

    await user.click(screen.getByTestId('rappel-cause-support'));
    expect(profilErreurs()['missing_reference'].themes).toContain(THEME_U1);
    await user.click(screen.getByTestId('rappel-cta-geste'));
    expect(onOpen).toHaveBeenCalledWith('situations');
    // La consigne du lot 1 et les 7 cartes n'ont pas bougé.
    expect(screen.getByTestId('consigne-entree-capitaine')).toBeTruthy();
    expect(screen.getAllByTestId('recommande-aujourdhui')).toHaveLength(1);
  });
});
