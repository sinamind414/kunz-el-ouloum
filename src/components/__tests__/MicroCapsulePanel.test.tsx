// MicroCapsulePanel.test.tsx — verrous d'interaction des capsules (item 15, sprint 11).
//
// Le verrou central est pédagogique : la réponse de l'auto-test ne doit jamais
// être lisible sans que l'élève l'ait demandée, et passer à la capsule suivante
// doit la remasquer — sinon l'objet dégénère en liste de réponses à survoler.

import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import MicroCapsulePanel from '../MicroCapsulePanel';
import { capsuleOfTheDay, capsulesForUnit } from '../../data/microCapsules';

afterEach(cleanup);

describe('MicroCapsulePanel — affichage', () => {
  it('affiche une seule capsule de l unité demandée', () => {
    render(<MicroCapsulePanel unitId={2} dayKey="2026-09-27" />);
    const attendue = capsuleOfTheDay('2026-09-27', capsulesForUnit(2));
    expect(screen.getByTestId('capsule-question').textContent).toBe(attendue.questionAr);
    expect(screen.getAllByTestId('capsule-question')).toHaveLength(1);
  });

  it('affiche la durée, les étapes et l erreur visée', () => {
    render(<MicroCapsulePanel unitId={5} dayKey="2026-09-27" />);
    expect(screen.getByTestId('capsule-duree').textContent).toMatch(/\d+/);
    expect(screen.getByTestId('capsule-etapes').children.length).toBeGreaterThanOrEqual(2);
    expect(screen.getByTestId('capsule-erreur').textContent).toContain('الخطأ');
  });

  it('ne rend rien pour une unité sans capsule', () => {
    const { container } = render(<MicroCapsulePanel unitId={99} dayKey="2026-09-27" />);
    expect(container.firstChild).toBeNull();
  });

  it('la capsule du jour est stable d un rendu à l autre', () => {
    render(<MicroCapsulePanel unitId={4} dayKey="2026-03-08" />);
    const premier = screen.getByTestId('capsule-question').textContent;
    cleanup();
    render(<MicroCapsulePanel unitId={4} dayKey="2026-03-08" />);
    expect(screen.getByTestId('capsule-question').textContent).toBe(premier);
  });
});

describe('MicroCapsulePanel — auto-test', () => {
  it('la réponse est masquée tant qu elle n est pas demandée', () => {
    render(<MicroCapsulePanel unitId={3} dayKey="2026-09-27" />);
    expect(screen.getByTestId('capsule-test')).toBeTruthy();
    expect(screen.queryByTestId('capsule-reponse')).toBeNull();
    expect(screen.getByTestId('capsule-voir-reponse')).toBeTruthy();
  });

  it('le clic révèle la réponse de la capsule courante', async () => {
    const user = userEvent.setup();
    render(<MicroCapsulePanel unitId={3} dayKey="2026-09-27" />);
    const courante = capsuleOfTheDay('2026-09-27', capsulesForUnit(3));
    await user.click(screen.getByTestId('capsule-voir-reponse'));
    expect(screen.getByTestId('capsule-reponse').textContent).toBe(courante.answerAr);
  });

  it('changer de capsule remasque la réponse', async () => {
    const user = userEvent.setup();
    render(<MicroCapsulePanel unitId={4} dayKey="2026-09-27" />);
    await user.click(screen.getByTestId('capsule-voir-reponse'));
    expect(screen.getByTestId('capsule-reponse')).toBeTruthy();

    await user.click(screen.getByTestId('capsule-suivante'));
    expect(screen.queryByTestId('capsule-reponse')).toBeNull();
  });
});

describe('MicroCapsulePanel — navigation', () => {
  it('suivante puis précédente ramènent à la capsule de départ', async () => {
    const user = userEvent.setup();
    render(<MicroCapsulePanel unitId={1} dayKey="2026-09-27" />);
    const depart = screen.getByTestId('capsule-question').textContent;
    await user.click(screen.getByTestId('capsule-suivante'));
    expect(screen.getByTestId('capsule-question').textContent).not.toBe(depart);
    await user.click(screen.getByTestId('capsule-precedente'));
    expect(screen.getByTestId('capsule-question').textContent).toBe(depart);
  });

  it('la navigation boucle sans jamais sortir de l unité', async () => {
    const user = userEvent.setup();
    render(<MicroCapsulePanel unitId={6} dayKey="2026-09-27" />);
    const titres = capsulesForUnit(6).map((c) => c.questionAr);
    for (let i = 0; i < titres.length + 2; i += 1) {
      expect(titres).toContain(screen.getByTestId('capsule-question').textContent);
      await user.click(screen.getByTestId('capsule-suivante'));
    }
  });
});
