// MockExamPanel.test.tsx — sujet blanc composé (sprint 41).

import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import MockExamPanel from '../MockExamPanel';
import { composeMockExam, numeroDuJour } from '../../data/mockExam';

afterEach(cleanup);

describe('panneau du sujet blanc', () => {
  it('ouvre sur le sujet du jour, identique pour toute la classe', () => {
    render(<MockExamPanel onTrain={() => {}} />);
    const attendu = composeMockExam(numeroDuJour());
    expect(screen.getByTestId('mock-exam').textContent).toContain(String(attendu.numero));
    for (let i = 1; i <= 3; i += 1) expect(screen.getByTestId(`mock-exercice-${i}`)).toBeTruthy();
  });

  it('affiche la durée et le barème officiels', () => {
    render(<MockExamPanel onTrain={() => {}} />);
    const entete = screen.getByTestId('mock-entete').textContent ?? '';
    expect(entete).toContain('4');
    expect(entete).toContain('30');
    expect(entete).toContain('20');
  });

  it('montre pour chaque exercice ses supports et ses consignes', () => {
    render(<MockExamPanel onTrain={() => {}} />);
    const attendu = composeMockExam(numeroDuJour());
    const premier = screen.getByTestId('mock-exercice-1');
    expect(premier.textContent).toContain(attendu.exercices[0].supportsAr[0]);
    expect(premier.textContent).toContain(attendu.exercices[0].verbsAr[0]);
  });

  it('change de sujet à la demande', async () => {
    const user = userEvent.setup();
    render(<MockExamPanel onTrain={() => {}} />);
    const avant = screen.getByTestId('mock-exercice-1').textContent;
    await user.click(screen.getByTestId('mock-suivant'));
    expect(screen.getByTestId('mock-exam').textContent).toContain(String(numeroDuJour() + 1));
    expect(screen.getByTestId('mock-exercice-1').textContent).not.toBe(avant);
  });

  it('envoie l’exercice choisi vers l’atelier', async () => {
    const user = userEvent.setup();
    const onTrain = vi.fn();
    render(<MockExamPanel onTrain={onTrain} />);
    const premier = composeMockExam(numeroDuJour()).exercices[0];
    await user.click(screen.getByTestId(`mock-ouvrir-${premier.id}`));
    expect(onTrain).toHaveBeenCalledWith(expect.objectContaining({ id: premier.id }));
  });

  it('s’imprime, et précise que les énoncés sont résumés', async () => {
    const user = userEvent.setup();
    const imprimer = vi.fn();
    vi.stubGlobal('print', imprimer);
    render(<MockExamPanel onTrain={() => {}} />);
    await user.click(screen.getByTestId('mock-imprimer'));
    expect(imprimer).toHaveBeenCalled();
    expect(screen.getByTestId('mock-exam').textContent).toContain('ملخّصة');
    vi.unstubAllGlobals();
  });
});
