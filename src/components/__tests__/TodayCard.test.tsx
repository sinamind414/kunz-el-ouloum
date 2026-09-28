// TodayCard.test.tsx — « برنامج اليوم » sur l'accueil (sprint 29).
//
// La carte ne doit rien inventer : elle montre LE plan de l'élève (réglage
// enregistré), tient compte des tâches déjà cochées, et ne prétend pas que la
// journée est finie tant qu'elle ne l'est pas.

import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import TodayCard from '../TodayCard';
import { buildRevisionPlan } from '../../data/revisionPlan';
import { DEFAULT_PLAN_SETTINGS, PLAN_SETTINGS_KEY } from '../../data/planSettings';

afterEach(cleanup);
beforeEach(() => localStorage.clear());

const jour1 = (d = DEFAULT_PLAN_SETTINGS.daysLeft, m = DEFAULT_PLAN_SETTINGS.minutesPerDay) =>
  buildRevisionPlan({ daysLeft: d, minutesPerDay: m }).days[0];

describe('carte du jour', () => {
  it('affiche les trois premières tâches du plan par défaut', () => {
    render(<TodayCard onOpenPlan={() => {}} />);
    const taches = jour1().tasks.slice(0, 3);
    for (const t of taches) {
      expect(screen.getByTestId(`today-tache-${t.kind}:${t.refId}`), t.refId).toBeTruthy();
    }
    expect(screen.getByTestId('today-resume').textContent).toContain('14');
  });

  it('suit le réglage choisi par l’élève dans la vue du plan', () => {
    localStorage.setItem(PLAN_SETTINGS_KEY, JSON.stringify({ daysLeft: 7, minutesPerDay: 120 }));
    render(<TodayCard onOpenPlan={() => {}} />);
    expect(screen.getByTestId('today-resume').textContent).toContain('7');
    const premiere = jour1(7, 120).tasks[0];
    expect(screen.getByTestId(`today-tache-${premiere.kind}:${premiere.refId}`)).toBeTruthy();
  });

  it('se rabat sur le plan par défaut si le réglage est corrompu', () => {
    localStorage.setItem(PLAN_SETTINGS_KEY, '{ pas du json');
    render(<TodayCard onOpenPlan={() => {}} />);
    expect(screen.getByTestId('today-resume').textContent).toContain('14');
  });

  it('ne réaffiche pas une tâche déjà cochée', () => {
    const premiere = jour1().tasks[0];
    localStorage.setItem(
      'kunz.revisionPlan.14x90',
      JSON.stringify([`1:${premiere.kind}:${premiere.refId}`]),
    );
    render(<TodayCard onOpenPlan={() => {}} />);
    expect(screen.queryByTestId(`today-tache-${premiere.kind}:${premiere.refId}`)).toBeNull();
    expect(screen.getByTestId('today-resume').textContent).toContain('أنجزت 1');
  });

  it('félicite seulement quand tout est coché', () => {
    const toutes = jour1().tasks.map((t) => `1:${t.kind}:${t.refId}`);
    localStorage.setItem('kunz.revisionPlan.14x90', JSON.stringify(toutes));
    render(<TodayCard onOpenPlan={() => {}} />);
    expect(screen.getByTestId('today-termine')).toBeTruthy();
  });

  it('annonce le reste de la journée sans le détailler', () => {
    render(<TodayCard onOpenPlan={() => {}} />);
    const reste = jour1().tasks.length - 3;
    if (reste > 0) expect(screen.getByTestId('today-reste').textContent).toContain(String(reste));
  });

  it('ouvre le plan au clic', async () => {
    const user = userEvent.setup();
    const ouvrir = vi.fn();
    render(<TodayCard onOpenPlan={ouvrir} />);
    await user.click(screen.getByTestId('today-card'));
    expect(ouvrir).toHaveBeenCalled();
  });
});
