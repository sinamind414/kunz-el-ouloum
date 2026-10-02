// NbaCard.test.tsx — carte « tâche du jour » partagée مساري / الرئيسية.
//
// Convention repo : pas de @testing-library/jest-dom → .toBeTruthy() /
// .toBeNull() / .toHaveLength(). cleanup() explicite. localStorage nettoyé
// entre les tests (l'état du parcours persiste sinon).
//
// Le composant ne DÉCIDE de rien : nbaEngine.nextBestAction est la seule
// source (REPRISE > RAPPEL(J+14) > QUOTA > NOUVEAU > REPOS). On vérifie ici
// l'affichage, le câblage des ouvertures et les deux testids.

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import NbaCard from '../NbaCard';
import { PARCOURS_FLAT } from '../../lib/parcours/parcoursPath';
import {
  loadParcours,
  markDone,
  resetParcours,
  saveParcours,
} from '../../lib/parcours/parcoursProgress';

const onOpenLesson = vi.fn();
const onOpenQcm = vi.fn();

/** Valide des items avec une date PASSÉE : `markDone` date d'aujourd'hui, et
 *  NBA priorise QUOTA (1 + extra) avant NOUVEAU — une validation datée d'aujourd'hui
 *  basculerait la carte en REPOS et masquerait l'ouverture du جسار. */
function validerDansLePasse(ids: string[]): void {
  const state = loadParcours();
  for (const id of ids) state.done[id] = { at: '2026-09-20', fragile: false };
  saveParcours(state);
}

function renderNba(testId?: string) {
  onOpenLesson.mockClear();
  onOpenQcm.mockClear();
  return render(
    testId
      ? <NbaCard onOpenLesson={onOpenLesson} onOpenQcm={onOpenQcm} testId={testId} />
      : <NbaCard onOpenLesson={onOpenLesson} onOpenQcm={onOpenQcm} />,
  );
}

beforeEach(() => {
  localStorage.clear();
  resetParcours();
});

afterEach(() => {
  cleanup();
  localStorage.clear();
  resetParcours();
  vi.restoreAllMocks();
});

describe('NbaCard — testids', () => {
  it('garde les testids stables de مساري par défaut', () => {
    renderNba();
    expect(screen.getByTestId('parcours-nba')).toBeTruthy();
    expect(screen.getByTestId('parcours-nba-start')).toBeTruthy();
  });

  it('accepte le préfixe de l’accueil (home-nba) sans collision', () => {
    const { container } = renderNba('home-nba');
    expect(screen.getByTestId('home-nba')).toBeTruthy();
    expect(screen.getByTestId('home-nba-start')).toBeTruthy();
    // Un seul bloc NBA : le préfixe de مساري n'apparaît pas.
    expect(container.querySelectorAll('[data-testid="parcours-nba"]')).toHaveLength(0);
  });
});

describe('NbaCard — ouvertures', () => {
  it('état vide → NOUVEAU : le bouton ouvre la PREMIÈRE leçon du chemin', () => {
    renderNba();
    fireEvent.click(screen.getByTestId('parcours-nba-start'));
    expect(onOpenLesson).toHaveBeenCalledTimes(1);
    expect(onOpenLesson.mock.calls[0][0]).toBe(PARCOURS_FLAT[0].lessonKey);
    expect(onOpenQcm).not.toHaveBeenCalled();
  });

  it('leçons d’une unité faites → le جسار suivant s’ouvre par onOpenQcm', () => {
    const u1 = PARCOURS_FLAT.filter((i) => i.unitId === 1 && i.kind === 'lesson');
    validerDansLePasse(u1.map((i) => i.id));

    renderNba();
    fireEvent.click(screen.getByTestId('parcours-nba-start'));

    expect(onOpenQcm).toHaveBeenCalledWith(1);
    expect(onOpenLesson).not.toHaveBeenCalled();
  });

  it('affiche le titre de la tâche proposée', () => {
    renderNba();
    const carte = screen.getByTestId('parcours-nba');
    // L'état vide → NOUVEAU : la tâche est le premier item du chemin.
    expect((carte.textContent || '').length).toBeGreaterThan(0);
    expect((carte.textContent || '').includes(PARCOURS_FLAT[0].title)).toBe(true);
  });
});

describe('NbaCard — état REPOS', () => {
  it('tout le chemin fait → pas de bouton de démarrage', () => {
    for (const item of PARCOURS_FLAT) markDone(item.id);

    renderNba();
    expect(screen.getByTestId('parcours-nba')).toBeTruthy();
    expect(screen.queryByTestId('parcours-nba-start')).toBeNull();
    expect(onOpenLesson).not.toHaveBeenCalled();
    expect(onOpenQcm).not.toHaveBeenCalled();
  });
});
