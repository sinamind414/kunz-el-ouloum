// WritingReviewPanel.test.tsx — panneau « ما كتبته أنا » (sprint 27).

import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import WritingReviewPanel from '../WritingReviewPanel';
import { TRAINER_PREFIX } from '../../data/writingProgress';

afterEach(cleanup);
beforeEach(() => localStorage.clear());

const ecrire = (ideaId: string, familyId: string, texte: string) =>
  localStorage.setItem(`${TRAINER_PREFIX}${ideaId}.${familyId}`, texte);

describe('panneau de relecture', () => {
  it('ne s’affiche pas tant que rien n’a été écrit', () => {
    const { container } = render(<WritingReviewPanel onOpen={() => {}} />);
    expect(container.firstChild).toBeNull();
  });

  it('résume la production et liste chaque réponse', () => {
    ecrire('bac2023_s2_e3', 'verb_analyser', 'نلاحظ ارتفاع من 10% إلى 80% أي كلما زاد التركيز كلما زاد النشاط.');
    render(<WritingReviewPanel onOpen={() => {}} />);
    expect(screen.getByTestId('review-bilan').textContent).toContain('1');
    expect(screen.getByTestId('review-draft-bac2023_s2_e3-verb_analyser')).toBeTruthy();
  });

  it('affiche le profil d’erreurs avec le conseil associé', () => {
    ecrire('bac2024_s1_e3', 'verb_analyser', 'نلاحظ أن النشاط يرتفع.');
    render(<WritingReviewPanel onOpen={() => {}} />);
    const point = screen.getByTestId('review-point-chiffres');
    expect(point.textContent).toContain('1');
    expect(point.textContent).toContain('حلّل بالأرقام');
  });

  it('permet de reprendre une réponse, en transmettant l’exercice', async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    ecrire('bac2024_s1_e3', 'verb_analyser', 'نلاحظ أن النشاط يرتفع.');
    render(<WritingReviewPanel onOpen={onOpen} />);
    await user.click(screen.getByTestId('review-reprendre-bac2024_s1_e3-verb_analyser'));
    expect(onOpen).toHaveBeenCalledWith(expect.objectContaining({ id: 'bac2024_s1_e3' }));
  });

  it('n’offre pas de reprise pour un exercice disparu du corpus', () => {
    ecrire('bac1999_s1_e1', 'verb_analyser', 'نص قديم');
    render(<WritingReviewPanel onOpen={() => {}} />);
    expect(screen.getByTestId('review-draft-bac1999_s1_e1-verb_analyser')).toBeTruthy();
    expect(screen.queryByTestId('review-reprendre-bac1999_s1_e1-verb_analyser')).toBeNull();
  });
});
