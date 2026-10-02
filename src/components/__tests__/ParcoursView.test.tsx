// ParcoursView.test.tsx — rendu du chemin, verrous, rappels d'ouverture, NBA.
//
// Convention repo : pas de @testing-library/jest-dom → .toBeTruthy() /
// .toBeNull() / .toHaveLength(). cleanup() explicite. localStorage nettoyé
// entre les tests (l'état persiste sinon).

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ParcoursView from '../ParcoursView';
import { PARCOURS_FLAT, PARCOURS_DOMAINS } from '../../lib/parcours/parcoursPath';
import { loadParcours, markDone } from '../../lib/parcours/parcoursProgress';
import { INITIAL_UNITS } from '../../unitCatalog';

const onOpenLesson = vi.fn();
const onOpenQcm = vi.fn();

function renderParcours() {
  onOpenLesson.mockClear();
  onOpenQcm.mockClear();
  return render(
    <ParcoursView onOpenLesson={onOpenLesson} onOpenQcm={onOpenQcm} />,
  );
}

/** Clique le <button> contenu dans une rangée (la rangée elle-même est un <li>). */
function cliquer(testId: string): HTMLElement {
  const bouton = screen.getByTestId(testId).querySelector('button');
  if (!bouton) throw new Error(`aucun bouton cliquable dans ${testId}`);
  fireEvent.click(bouton);
  return bouton;
}

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  cleanup();
  localStorage.clear();
});

describe('ParcoursView — structure', () => {
  it('affiche l\'en-tête, la carte NBA et les 3 bandeaux de domaine', () => {
    renderParcours();
    expect(screen.getByTestId('parcours-header')).toBeTruthy();
    expect(screen.getByTestId('parcours-nba')).toBeTruthy();
    expect(screen.getByTestId('parcours-banner-1')).toBeTruthy();
    expect(screen.getByTestId('parcours-banner-2')).toBeTruthy();
    expect(screen.getByTestId('parcours-banner-3')).toBeTruthy();
  });

  it('affiche une carte par unité (11 au total)', () => {
    renderParcours();
    for (let u = 1; u <= 11; u++) {
      expect(screen.getByTestId(`parcours-unit-${u}`)).toBeTruthy();
    }
  });

  it('termine chaque unité par une ligne جسر', () => {
    renderParcours();
    for (let u = 1; u <= 11; u++) {
      expect(screen.getByTestId(`parcours-jalon-${u}`)).toBeTruthy();
    }
  });

  it('affiche le titre de la première leçon dans la carte NBA', () => {
    renderParcours();
    const nba = screen.getByTestId('parcours-nba');
    expect(nba.textContent).toContain(PARCOURS_FLAT[0].title);
  });

  it('affiche l\'avancement global dans l\'en-tête', () => {
    renderParcours();
    const header = screen.getByTestId('parcours-header');
    expect(header.textContent).toContain(String(PARCOURS_FLAT.length));
  });
});

describe('ParcoursView — verrous et ouverture', () => {
  it('rend cliquables les items disponibles et verrouille les suivants', () => {
    renderParcours();
    const premier = screen.getByTestId(`parcours-row-${PARCOURS_FLAT[0].lessonKey}`);
    const second = screen.getByTestId(`parcours-row-${PARCOURS_FLAT[1].lessonKey}`);
    // L'item disponible contient un vrai <button> (focus + Entrée/Espace natifs).
    expect(premier.querySelector('button')).toBeTruthy();
    // L'item verrouillé est inerte : pas de bouton, pas de commande clavier.
    expect(second.querySelector('button')).toBeNull();
  });

  it('ouvre la leçon disponible avec sa clé, sa nature et son unité', () => {
    renderParcours();
    cliquer(`parcours-row-${PARCOURS_FLAT[0].lessonKey}`);
    expect(onOpenLesson).toHaveBeenCalledTimes(1);
    const [key, kind, unitId] = onOpenLesson.mock.calls[0];
    expect(key).toBe(PARCOURS_FLAT[0].lessonKey);
    expect(PARCOURS_FLAT[0].lessonKind).toBe(kind);
    expect(unitId).toBe(1);
    expect(onOpenQcm).not.toHaveBeenCalled();
  });

  it('n\'ouvre rien sur un item verrouillé', () => {
    renderParcours();
    fireEvent.click(screen.getByTestId(`parcours-row-${PARCOURS_FLAT[1].lessonKey}`));
    expect(onOpenLesson).not.toHaveBeenCalled();
    expect(onOpenQcm).not.toHaveBeenCalled();
  });

  it('ouvre les QCM depuis la ligne جسر', () => {
    renderParcours();
    // La première unité : 4 leçons puis جسر — on valide les 4 leçons.
    const u1 = PARCOURS_DOMAINS[0].units[0];
    for (const item of u1.items) {
      if (item.kind === 'lesson') markDone(item.id);
    }
    cleanup();
    renderParcours();
    cliquer('parcours-jalon-1');
    expect(onOpenQcm).toHaveBeenCalledTimes(1);
    expect(onOpenQcm.mock.calls[0][0]).toBe(1);
    expect(onOpenLesson).not.toHaveBeenCalled();
  });

  it('propose la reprise dans la NBA après un début de session', () => {
    renderParcours();
    cliquer(`parcours-row-${PARCOURS_FLAT[0].lessonKey}`);
    cleanup();
    renderParcours();
    const nba = screen.getByTestId('parcours-nba');
    expect(nba.textContent).toContain(PARCOURS_FLAT[0].title);
  });
});

describe('ParcoursView — repos', () => {
  it('affiche un message de repos quand le quota du jour est atteint', () => {
    markDone(PARCOURS_FLAT[0].id);
    renderParcours();
    const nba = screen.getByTestId('parcours-nba');
    expect(nba.textContent).not.toContain(PARCOURS_FLAT[1].title);
  });

  it('réinitialise le chemin depuis le bouton', () => {
    markDone(PARCOURS_FLAT[0].id);
    const { container } = renderParcours();
    const bouton = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('إعادة تعيين المسار'),
    );
    expect(bouton).toBeTruthy();
    fireEvent.click(bouton!);
    // Après reset : le premier item redevient disponible (non terminé).
    expect(
      screen.getByTestId(`parcours-row-${PARCOURS_FLAT[0].lessonKey}`).querySelector('button'),
    ).toBeTruthy();
  });
});

// Décision produit du 2026-10-02 : le cercle de statut EST le contrôle
// « علّم كمحفوظة » / « تراجع » (convention déjà en place dans OkachaView).
// La banque « اختبار الكتاب » (41 questions / 70 items, U2/U3/U8 = 0) ne peut
// pas être le signal d'avancement — voir le commentaire de scoreQcmUnite.
describe('ParcoursView — علّم كمحفوظة / تراجع (cercle de statut)', () => {
  const toggleDe = (testId: string): HTMLElement => {
    const t = screen.getByTestId(`${testId}-toggle`);
    if (!t) throw new Error(`pas de toggle sur ${testId}`);
    return t;
  };

  it('la rangée active porte le toggle, qui n\'ouvre PAS la leçon', () => {
    renderParcours();
    const premier = `parcours-row-${PARCOURS_FLAT[0].lessonKey}`;
    const toggle = toggleDe(premier);
    expect(toggle.getAttribute('aria-label')).toBe('علّم كمحفوظة');

    fireEvent.click(toggle);
    expect(onOpenLesson).not.toHaveBeenCalled();
    expect(onOpenQcm).not.toHaveBeenCalled();
    // L'item est validé ET le suivant se déverrouille (le chemin avance).
    expect(loadParcours().done[PARCOURS_FLAT[0].id]).toBeTruthy();
    expect(
      screen.getByTestId(`parcours-row-${PARCOURS_FLAT[1].lessonKey}`).querySelector('button'),
    ).toBeTruthy();
  });

  it('une rangée faite propose تراجع et reverrouille la suite', () => {
    markDone(PARCOURS_FLAT[0].id);
    renderParcours();
    expect(toggleDe(`parcours-row-${PARCOURS_FLAT[0].lessonKey}`).getAttribute('aria-label')).toBe(
      'تراجع عن الإتمام',
    );

    fireEvent.click(toggleDe(`parcours-row-${PARCOURS_FLAT[0].lessonKey}`));
    expect(loadParcours().done[PARCOURS_FLAT[0].id]).toBeUndefined();
    expect(loadParcours().reviews[PARCOURS_FLAT[0].id]).toBeUndefined();
    // Le verrou revient : la leçon 2 n'est plus ouvrable.
    expect(
      screen.getByTestId(`parcours-row-${PARCOURS_FLAT[1].lessonKey}`).querySelector('button'),
    ).toBeNull();
  });

  it('aucune rangée verrouillée ne porte de toggle ni de bouton', () => {
    renderParcours();
    const verrouillee = screen.getByTestId(`parcours-row-${PARCOURS_FLAT[1].lessonKey}`);
    expect(verrouillee.querySelector('[data-testid$="-toggle"]')).toBeNull();
    expect(verrouillee.querySelector('button')).toBeNull();
  });

  it('le جسار prend le score RÉEL du QCM d\'unité quand il existe', () => {
    const u1 = PARCOURS_DOMAINS[0].units[0];
    for (const item of u1.items) if (item.kind === 'lesson') markDone(item.id);
    localStorage.setItem(
      'svt_progress',
      JSON.stringify({
        quizScoreHistory: [{ date: '1/1/2026', score: 5, total: 6, unitTitle: INITIAL_UNITS[0].title }],
      }),
    );

    renderParcours();
    fireEvent.click(toggleDe('parcours-jalon-1'));

    const jalon = u1.items[u1.items.length - 1];
    const record = loadParcours().done[jalon.id];
    expect(record).toBeTruthy();
    expect(record!.total).toBe(6);
    expect(Math.round(record!.score! * record!.total!)).toBe(5);
    expect(record!.fragile).toBe(false);
    // La ligne affiche la fraction, pas un pourcentage inventé.
    expect(screen.getByTestId('parcours-jalon-1').textContent).toContain('5 / 6');
  });

  it('sans QCM disponible, le جسار se valide SANS note (aucune fabrique)', () => {
    const u1 = PARCOURS_DOMAINS[0].units[0];
    for (const item of u1.items) if (item.kind === 'lesson') markDone(item.id);

    renderParcours();
    fireEvent.click(toggleDe('parcours-jalon-1'));

    const jalon = u1.items[u1.items.length - 1];
    const record = loadParcours().done[jalon.id];
    expect(record).toBeTruthy();
    expect(record!.score).toBeUndefined();
    expect(record!.total).toBeUndefined();
    expect(record!.fragile).toBe(false);
    // « مثبّتة » sans fraction — le cas U2/U3/U8 (0 question de QCM).
    expect(screen.getByTestId('parcours-jalon-1').textContent).not.toContain('/ 6');
  });

  it('un score de QCM bas rend le جسار fragil (seuil 0.6)', () => {
    const u1 = PARCOURS_DOMAINS[0].units[0];
    for (const item of u1.items) if (item.kind === 'lesson') markDone(item.id);
    localStorage.setItem(
      'svt_progress',
      JSON.stringify({
        quizScoreHistory: [{ date: '1/1/2026', score: 2, total: 10, unitTitle: INITIAL_UNITS[0].title }],
      }),
    );

    renderParcours();
    fireEvent.click(toggleDe('parcours-jalon-1'));
    expect(loadParcours().done[u1.items[u1.items.length - 1].id]!.fragile).toBe(true);
  });
});
