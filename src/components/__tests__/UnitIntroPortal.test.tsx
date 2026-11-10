// UnitIntroPortal.test.tsx — verrous du portail d'ouverture (item 19, sprint 13).
//
// Ces tests existent d'abord à cause d'un BUG RÉEL corrigé dans ce sprint :
// le portail affichait le contenu de l'unité 1 (activités sur l'ARN) pour
// TOUTES les unités, et chargeait des photos distantes (Unsplash) alors que
// l'app doit fonctionner hors connexion. Les deux premiers tests interdisent
// le retour de l'un comme de l'autre.

import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import UnitIntroPortal from '../UnitIntroPortal';
import { UNIT_OPENINGS, openingForUnit } from '../../data/unitOpenings';

afterEach(cleanup);

const noop = () => {};

describe('portail d unité — le contenu suit réellement l unité', () => {
  it('affiche la question centrale propre à chaque unité', () => {
    for (const o of UNIT_OPENINGS) {
      render(<UnitIntroPortal unitId={o.unitId} unitTitle="" onStartLesson={noop} onClose={noop} />);
      expect(screen.getByTestId('portal-question').textContent, `unité ${o.unitId}`).toBe(o.questionAr);
      cleanup();
    }
  });

  it('deux unités différentes ne montrent jamais le même contenu', () => {
    render(<UnitIntroPortal unitId={1} unitTitle="" onStartLesson={noop} onClose={noop} />);
    const u1 = screen.getByTestId('portal-question').textContent;
    cleanup();
    render(<UnitIntroPortal unitId={4} unitTitle="" onStartLesson={noop} onClose={noop} />);
    expect(screen.getByTestId('portal-question').textContent).not.toBe(u1);
    expect(screen.getByTestId('portal-question').textContent).toBe(openingForUnit(4)!.questionAr);
  });

  it('ne charge aucune image distante (contrainte hors connexion)', () => {
    for (const u of [1, 4, 7, 11]) {
      const { container } = render(
        <UnitIntroPortal unitId={u} unitTitle="" onStartLesson={noop} onClose={noop} />,
      );
      const distantes = [...container.querySelectorAll('img')].filter((i) =>
        /^https?:/.test(i.getAttribute('src') ?? ''),
      );
      expect(distantes, `unité ${u}`).toHaveLength(0);
      cleanup();
    }
  });
});

describe('portail d unité — contenu affiché', () => {
  it('rend la promesse, l itinéraire, les prérequis, les pièges et la première action', () => {
    const o = openingForUnit(5)!;
    render(<UnitIntroPortal unitId={5} unitTitle="" onStartLesson={noop} onClose={noop} />);
    expect(screen.getByTestId('portal-promesse').textContent).toContain(o.promiseAr);
    expect(screen.getByTestId('portal-roadmap').children).toHaveLength(o.roadmapAr.length);
    expect(screen.getByTestId('portal-prerequis').children).toHaveLength(o.prerequisAr.length);
    expect(screen.getByTestId('portal-pieges').children).toHaveLength(o.trapsAr.length);
    expect(screen.getByTestId('portal-premiere-action').textContent).toContain(o.firstActionAr);
  });

  // 2026-11-10 (audit externe « claude 5.2 ») : le portail affiche les DEUX poids
  // — le poids ANNONCE (repartition du programme, mesuree) et la part CONSTATEE
  // (points reels de l'unite dans les 65 exercices BAC indexes, calculee par
  // le depot). Les deux sont vrais : l'ecart se voit. Une unite sans poids
  // annonce (U8-U11) affiche quand meme sa part constatee ; aucun chiffre invente.
  it('affiche le poids annonce ET la part constatee, et la part seule sinon', () => {
    render(<UnitIntroPortal unitId={5} unitTitle="" onStartLesson={noop} onClose={noop} />);
    expect(screen.getByTestId('portal-poids').textContent).toContain('16');
    cleanup();
    render(<UnitIntroPortal unitId={10} unitTitle="" onStartLesson={noop} onClose={noop} />);
    // 2026-11-10 : la part CONSTATEE existe pour les 11 unites ; seule la ligne
    // du poids ANNONCE disparait quand il n'a pas ete mesure.
    expect(screen.getByTestId('portal-poids-observe').textContent).toContain('1.1');
    expect(screen.getByTestId('portal-poids').textContent).not.toContain('%');
  });
  it('une unité sans carte affiche un message, pas une page blanche', () => {
    render(<UnitIntroPortal unitId={99} unitTitle="وحدة مجهولة" onStartLesson={noop} onClose={noop} />);
    expect(screen.getByTestId('portal-vide')).toBeTruthy();
    expect(screen.getByTestId('portal-unite').textContent).toBe('وحدة مجهولة');
  });
});

describe('portail d unité — actions', () => {
  it('« ادخل إلى الوحدة » déclenche l entrée dans l unité', async () => {
    const user = userEvent.setup();
    const onStart = vi.fn();
    render(<UnitIntroPortal unitId={3} unitTitle="" onStartLesson={onStart} onClose={noop} />);
    await user.click(screen.getByTestId('portal-commencer'));
    expect(onStart).toHaveBeenCalledTimes(1);
  });

  it('la croix ferme le portail', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<UnitIntroPortal unitId={3} unitTitle="" onStartLesson={noop} onClose={onClose} />);
    await user.click(screen.getByTestId('portal-fermer'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
