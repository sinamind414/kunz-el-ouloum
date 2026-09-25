// QuizView.fillBlank.test.tsx — verrou du rendu de la question à trous (S-C4).
// Convention du dépôt : pas de cleanup auto ; requêtes scoping au container
// via within(...). Matchers .toBeTruthy()/.toBeNull() (jest-dom non câblé).

import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import QuizView from '../QuizView';
import type { QuizQuestion } from '../../types';

vi.mock('../../utils/audio', () => ({
  playSuccessSound: vi.fn(),
  playFailureSound: vi.fn(),
}));

const fbQuestion: QuizQuestion = {
  id: 9000000,
  unitId: 1,
  questionText: 'أكمل: الجين يرتبط هنا بـ: _______',
  options: [],
  correctAnswerIndex: -1,
  explanation: 'التعريف الصحيح: قطعة من ADN تحمل معلومة تركيب سلسلة ببتيدية',
  kind: 'fillBlank',
  acceptedAnswers: ['قطعة من ADN تحمل معلومة تركيب سلسلة ببتيدية أو بروتين معين'],
};

const qcmQuestion: QuizQuestion = {
  id: 1,
  unitId: 1,
  questionText: 'سؤال تجريبي',
  options: ['أ', 'ب'],
  correctAnswerIndex: 0,
  explanation: 'شرح',
};

describe('S-C4 : QuizView mode question à trou', () => {
  it('affiche un champ de saisie (et non des options) pour une question fillBlank', () => {
    const { container } = render(
      <QuizView unitId={1} unitTitle="تجريبي" questions={[fbQuestion]} onClose={() => {}} onQuizComplete={() => {}} />
    );
    const input = within(container).getByLabelText('فراغ الإجابة') as HTMLInputElement;
    expect(input).toBeTruthy();
    expect(input.value).toBe('');
  });

  it('valide une réponse correcte et affiche le verdict', () => {
    const onQuizComplete = vi.fn();
    const { container } = render(
      <QuizView unitId={1} unitTitle="تجريبي" questions={[fbQuestion]} onClose={() => {}} onQuizComplete={onQuizComplete} />
    );
    const scoped = within(container);
    const input = scoped.getByLabelText('فراغ الإجابة') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'قطعة من ADN تحمل معلومة تركيب بروتين' } });
    fireEvent.click(scoped.getByText('تحقّق'));
    expect(scoped.getAllByText('إجابة صحيحة').length).toBeGreaterThan(0);
    fireEvent.click(scoped.getByText('إنهاء وحساب النتيجة'));
    expect(onQuizComplete).toHaveBeenCalledWith(expect.any(Number), 1);
    expect(onQuizComplete.mock.calls[0][0]).toBeGreaterThan(0);
  });

  it('reste compatible avec les QCM classiques (régression)', () => {
    const { container } = render(
      <QuizView unitId={1} unitTitle="تجريبي" questions={[qcmQuestion]} onClose={() => {}} onQuizComplete={() => {}} />
    );
    const scoped = within(container);
    expect(scoped.getAllByText('أ').length).toBeGreaterThan(0);
    expect(scoped.queryByLabelText('فراغ الإجابة')).toBeNull();
  });
});
