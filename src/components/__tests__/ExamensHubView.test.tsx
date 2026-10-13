// ExamensHubView.test.tsx — verrous du sous-écran « الاختبارات » (2026-10-12).
//
// Ce sous-écran existe parce que les examens ont quitté « الدروس » : produire
// une réponse est de l'entraînement, pas de l'apprentissage. Les tests figent
// (1) les deux examens sont bien là, (2) un clic transmet le bon mode, et
// (3) l'écran fait le lien avec le hub — pas de troisième porte.

import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ExamensHubView from '../ExamensHubView';
import { TRAINING_ENTRIES } from '../../data/trainingHub';

afterEach(cleanup);

describe('sous-écran examens — contenu', () => {
  it('expose les deux examens attendus', () => {
    render(<ExamensHubView onOpen={() => {}} />);
    expect(screen.getByTestId('examens-qcm')).toBeTruthy();
    expect(screen.getByTestId('examens-bac')).toBeTruthy();
  });

  it('annonce le geste, pas seulement le nom de l outil', () => {
    render(<ExamensHubView onOpen={() => {}} />);
    expect(screen.getByTestId('examens-qcm').textContent).toContain('أختبر فصلاً محدداً');
    expect(screen.getByTestId('examens-bac').textContent).toContain('أجتاز امتحاناً كاملاً');
  });

  it('est bien atteint UNIQUEMENT depuis l entrée examens du hub', () => {
    const tabs = TRAINING_ENTRIES.map((e) => e.tab);
    expect(tabs).toContain('examens');
    // Les deux examens gardent leur mode dans LessonsView : ils ne doivent pas
    // devenir des entrées de hub à part (ce serait trois portes pour un geste).
    expect(tabs).not.toContain('qcm');
    expect(tabs).not.toContain('bac');
  });
});

describe('sous-écran examens — navigation', () => {
  it('un clic transmet exactement le mode demande', async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    render(<ExamensHubView onOpen={onOpen} />);

    await user.click(screen.getByTestId('examens-bac'));
    expect(onOpen).toHaveBeenCalledWith('bac');

    await user.click(screen.getByTestId('examens-qcm'));
    expect(onOpen).toHaveBeenLastCalledWith('qcm');
    expect(onOpen).toHaveBeenCalledTimes(2);
  });

  it('le retour n est rendu que s il est fourni', () => {
    const { rerender } = render(<ExamensHubView onOpen={() => {}} />);
    expect(screen.queryByTestId('examens-retour')).toBeNull();
    rerender(<ExamensHubView onOpen={() => {}} onBack={() => {}} />);
    expect(screen.getByTestId('examens-retour')).toBeTruthy();
  });
});
