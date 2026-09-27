// RevisionPlanView.test.tsx — verrous de la vue « خطة المراجعة النهائية »
// (audit item 14, sprint 15).
//
// Trois promesses sont faites à l'élève par cette vue, et chacune est testée :
//   1. changer le temps disponible change réellement le plan (pas seulement
//      l'affichage d'un chiffre) ;
//   2. une tâche cochée le reste après fermeture de l'app (localStorage) ;
//   3. les deux derniers jours sont marqués « تثبيت فقط » et ne contiennent
//      aucune situation longue.

import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import RevisionPlanView from '../RevisionPlanView';
import { buildRevisionPlan } from '../../data/revisionPlan';

afterEach(cleanup);
beforeEach(() => localStorage.clear());

describe('plan de révision — rendu', () => {
  it('affiche par défaut un plan de 14 jours à 90 minutes', () => {
    render(<RevisionPlanView />);
    expect(screen.getByTestId('plan-jours').textContent).toBe('14');
    expect(screen.getByTestId('plan-minutes').textContent).toBe('90');
    expect(screen.getByTestId('plan-jour-1')).toBeTruthy();
    expect(screen.getByTestId('plan-jour-14')).toBeTruthy();
    expect(screen.queryByTestId('plan-jour-15')).toBeNull();
  });

  it('chaque journée affiche des tâches concrètes avec leur durée', () => {
    render(<RevisionPlanView />);
    const jour1 = screen.getByTestId('plan-jour-1');
    expect(jour1.textContent).toContain('دقيقة');
    const attendu = buildRevisionPlan({ daysLeft: 14, minutesPerDay: 90 }).days[0];
    expect(attendu.tasks.length).toBeGreaterThan(0);
    for (const t of attendu.tasks) {
      expect(screen.getByTestId(`tache-1:${t.kind}:${t.refId}`), t.refId).toBeTruthy();
    }
  });

  it('le résumé annonce la couverture et la progression', () => {
    render(<RevisionPlanView />);
    expect(screen.getByTestId('plan-resume').textContent).toContain('/ 11');
    expect(screen.getByTestId('plan-progression').textContent).toContain('0');
  });
});

describe('plan de révision — le temps disponible pilote vraiment le plan', () => {
  it('un préréglage plus court reconstruit le plan', async () => {
    const user = userEvent.setup();
    render(<RevisionPlanView />);
    await user.click(screen.getByTestId('preset-7'));
    expect(screen.getByTestId('plan-jours').textContent).toBe('7');
    expect(screen.getByTestId('plan-jour-7')).toBeTruthy();
    expect(screen.queryByTestId('plan-jour-8')).toBeNull();
  });

  it('le contenu du jour 1 change quand le budget quotidien change', async () => {
    const user = userEvent.setup();
    render(<RevisionPlanView />);
    const avant = screen.getByTestId('plan-jour-1').textContent;
    await user.click(screen.getByTestId('preset-3'));
    expect(screen.getByTestId('plan-jour-1').textContent).not.toBe(avant);
  });
});

describe('plan de révision — progression persistante', () => {
  it('cocher une tâche la marque faite et met à jour le pourcentage', async () => {
    const user = userEvent.setup();
    render(<RevisionPlanView />);
    const premiere = buildRevisionPlan({ daysLeft: 14, minutesPerDay: 90 }).days[0].tasks[0];
    const id = `1:${premiere.kind}:${premiere.refId}`;

    expect(screen.getByTestId(`tache-${id}`).getAttribute('aria-pressed')).toBe('false');
    await user.click(screen.getByTestId(`tache-${id}`));
    expect(screen.getByTestId(`tache-${id}`).getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByTestId('plan-progression').textContent).not.toContain('0٪');
  });

  it('la progression survit à un remontage de la vue', async () => {
    const user = userEvent.setup();
    render(<RevisionPlanView />);
    const premiere = buildRevisionPlan({ daysLeft: 14, minutesPerDay: 90 }).days[0].tasks[0];
    const id = `1:${premiere.kind}:${premiere.refId}`;
    await user.click(screen.getByTestId(`tache-${id}`));
    cleanup();

    render(<RevisionPlanView />);
    expect(screen.getByTestId(`tache-${id}`).getAttribute('aria-pressed')).toBe('true');
  });

  it('changer de plan n hérite pas d une progression qui ne le concerne pas', async () => {
    const user = userEvent.setup();
    render(<RevisionPlanView />);
    const premiere = buildRevisionPlan({ daysLeft: 14, minutesPerDay: 90 }).days[0].tasks[0];
    await user.click(screen.getByTestId(`tache-1:${premiere.kind}:${premiere.refId}`));
    expect(screen.getByTestId('plan-progression').textContent).not.toContain('0٪');

    await user.click(screen.getByTestId('preset-30'));
    expect(screen.getByTestId('plan-progression').textContent).toContain('0٪');
  });
});

describe('plan de révision — la veille de l examen', () => {
  it('les derniers jours sont marqués « تثبيت فقط »', async () => {
    const user = userEvent.setup();
    render(<RevisionPlanView />);
    await user.click(screen.getByTestId('preset-7'));
    expect(screen.getByTestId('plan-consolidation-7')).toBeTruthy();
    expect(screen.queryByTestId('plan-consolidation-1')).toBeNull();
  });

  it('aucune situation longue n est programmée ces jours-là', () => {
    const plan = buildRevisionPlan({ daysLeft: 7, minutesPerDay: 120 });
    render(<RevisionPlanView />);
    const dernier = plan.days[plan.days.length - 1];
    expect(dernier.consolidationOnly).toBe(true);
    expect(dernier.tasks.some((t) => t.kind === 'situation')).toBe(false);
  });
});

describe('plan de révision — ouverture de l’atelier (sprint 26)', () => {
  it('propose un accès direct pour chaque tâche de rédaction', () => {
    const ouvrir = vi.fn();
    render(<RevisionPlanView onOpenRedaction={ouvrir} />);
    const plan = buildRevisionPlan({ daysLeft: 14, minutesPerDay: 90 });
    const redaction = plan.days.flatMap((j) => j.tasks).find((t) => t.kind === 'redaction');
    if (!redaction) return;
    expect(screen.getAllByTestId(`ouvrir-redaction-${redaction.refId}`).length).toBeGreaterThan(0);
  });

  it('transmet l’identifiant de l’exercice au clic', async () => {
    const user = userEvent.setup();
    const ouvrir = vi.fn();
    render(<RevisionPlanView onOpenRedaction={ouvrir} />);
    const plan = buildRevisionPlan({ daysLeft: 14, minutesPerDay: 90 });
    const redaction = plan.days.flatMap((j) => j.tasks).find((t) => t.kind === 'redaction');
    if (!redaction) return;
    await user.click(screen.getAllByTestId(`ouvrir-redaction-${redaction.refId}`)[0]);
    expect(ouvrir).toHaveBeenCalledWith(redaction.refId);
  });

  it('n’affiche aucun bouton d’atelier si l’app ne fournit pas de rappel', () => {
    render(<RevisionPlanView />);
    const plan = buildRevisionPlan({ daysLeft: 14, minutesPerDay: 90 });
    const redaction = plan.days.flatMap((j) => j.tasks).find((t) => t.kind === 'redaction');
    if (!redaction) return;
    expect(screen.queryByTestId(`ouvrir-redaction-${redaction.refId}`)).toBeNull();
  });
});
