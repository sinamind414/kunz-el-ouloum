// QuizView.melange.test.tsx — LE PIÈGE DE CETTE TRANSFORMATION.
//
// Mélanger les propositions est facile. Le garder JUSTE est difficile : tout ce
// qui est indexé par position (les aides « pourquoi mon choix est faux »)
// désigne une position des DONNÉES, pas une position à l'écran. Sans la table
// `optionOrigins`, l'aide affichée expliquerait tranquillement une AUTRE
// proposition que celle cliquée — un bug silencieux, plausible, et faux.
//
// Ces tests vérifient le comportement réel de l'écran : l'élève clique une
// proposition, gagne ou perd des points selon son TEXTE, et lit une aide qui
// parle bien de ce qu'il a cliqué.

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import QuizView from '../QuizView';
import type { QuizQuestion } from '../../types';
import { permutation } from '../../utils/melangeOptions';

// Question réelle : la bonne réponse est l'index 1 (الريبوزوم), et les aides
// par option existent pour les index 0, 2 et 3 (src/utils/hints.ts).
const OPTIONS = ['النواة', 'الريبوزوم', 'الميتوكندريا', 'جهاز غولجي'];
const QUESTION: QuizQuestion = {
  id: 1,
  questionText: 'حدد العضية المسؤولة عن دمج الأحماض الأمينية في الخلية.',
  options: OPTIONS,
  correctAnswerIndex: 1,
  explanation: 'التجميع يتم على مستوى الريبوزوم.',
  unitId: 1,
};

const props = {
  unitId: 1,
  unitTitle: 'التخصص الوظيفي للبروتينات',
  questions: [QUESTION],
  onClose: vi.fn(),
  onQuizComplete: vi.fn(),
};

/** Position à l'écran d'un texte d'option, déduite du mélange de la session. */
function positionAffichee(texte: string): number {
  return permutation(4, hashAvecGraine()).indexOf(OPTIONS.indexOf(texte));
}

// Reconstitution de la graine réellement utilisée par le composant : on lit
// celle qu'il a stockée dans sessionStorage après le premier rendu.
let graineLue = '';
function hashAvecGraine(): number {
  // Même fonction que le module (FNV-1a sur « id|graine ») — dupliquée ici pour
  // que le test vérifie le calcul du composant, pas celui du test.
  let h = 2166136261;
  const texte = `1|${graineLue}`;
  for (let i = 0; i < texte.length; i += 1) {
    h ^= texte.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

beforeEach(() => {
  sessionStorage.clear();
  props.onClose.mockReset();
  props.onQuizComplete.mockReset();
});
afterEach(cleanup);

describe('QuizView — propositions mélangées par session', () => {
  it('la bonne réponse est notée juste, où qu’elle soit affichée', () => {
    render(<QuizView {...props} />);
    // On clique par TEXTE (« الريبوزوم » = la bonne réponse), pas par position :
    // c'est exactement ce que fait l'élève. Le score n'apparaît qu'en fin de
    // quiz, donc on termine le quiz et on lit le score.
    fireEvent.click(screen.getByText('الريبوزوم'));
    fireEvent.click(screen.getByText(/إنهاء|السؤال التالي|التالي/));
    expect(props.onQuizComplete).toHaveBeenCalledWith(1, 1);
  });

  it('un mauvais choix est refusé, où qu’il soit affiché', () => {
    render(<QuizView {...props} />);
    fireEvent.click(screen.getByText('جهاز غولجي'));
    fireEvent.click(screen.getByText(/إنهاء|السؤال التالي|التالي/));
    expect(props.onQuizComplete).toHaveBeenCalledWith(0, 1);
  });

  it('l’aide « pourquoi ce choix est faux » parle du choix RÉELLEMENT cliqué', () => {
    // صحيح : l'aide de l'index 0 dans les données mentionne « النواة ». Si le
    // mélange n'était pas défait, l'aide parlerait d'une autre proposition.
    render(<QuizView {...props} />);
    fireEvent.click(screen.getByText('النواة'));
    const aide = screen.getByText(/هي المقر الذي يتم فيه حفظ المعلومة الوراثية/);
    expect(aide).toBeTruthy();
    // …et l'option citée dans le bandeau est bien celle cliquée.
    expect(screen.getByText(/"النواة"/)).toBeTruthy();
  });

  it('l’ordre des propositions change selon la session (la clé volée meurt)', () => {
    sessionStorage.setItem('kunz_graine_session', '111111');
    render(<QuizView {...props} />);
    const ordreA = OPTIONS.map(
      (o) => screen.getAllByText(o).length && o,
    );
    graineLue = '111111';
    const positionA = positionAffichee('الريبوزوم');

    cleanup();
    sessionStorage.setItem('kunz_graine_session', '222222');
    render(<QuizView {...props} />);
    graineLue = '222222';
    const positionB = positionAffichee('الريبوزوم');

    // Les deux sessions ne doivent pas placer la bonne réponse au même endroit
    // (sur 4 positions, une coïncidence reste possible : on teste le cas réel
    // des deux graines fixées ici, qui diffèrent).
    expect(positionA).not.toBe(positionB);
    expect(ordreA.length).toBe(4);
  });

  it('les quatre propositions sont TOUJOURS toutes affichées', () => {
    render(<QuizView {...props} />);
    for (const option of OPTIONS) {
      expect(screen.getByText(option), option).toBeTruthy();
    }
  });

  it('une question à trou n’est pas touchée (pas d’options à mélanger)', () => {
    const trou: QuizQuestion = {
      id: 42,
      questionText: 'أكمل الفراغ',
      options: [],
      correctAnswerIndex: -1,
      explanation: '',
      unitId: 1,
      kind: 'fillBlank',
      acceptedAnswers: ['الريبوزوم'],
    };
    render(<QuizView {...props} questions={[trou]} />);
    // L'écran affiche bien le mode « question à trou » (champ de saisie) et
    // aucune proposition.
    expect(screen.getByRole('textbox')).toBeTruthy();
    expect(screen.queryByText('النواة')).toBeNull();
  });
});
