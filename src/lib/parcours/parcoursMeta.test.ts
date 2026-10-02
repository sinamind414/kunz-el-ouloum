// parcoursMeta.test.ts — métadonnées d'affichage OPUS 5.5.
// Convention repo : pas de @testing-library/jest-dom → .toBeTruthy() /
// .toBeNull() / .toHaveLength(). localStorage nettoyé entre les tests.
//
// Décision produit du 2026-10-02 : le جسار affiche le SCORE RÉEL du QCM
// d'unité quand il existe, sinon rien (« — »). Ce fichier vérifie surtout
// qu'aucune note n'est jamais fabriquée en l'absence de source.

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { INITIAL_UNITS } from '../../unitCatalog';
import { poidsBacUnite, scoreQcmUnite } from './parcoursMeta';

const CLE = 'svt_progress';
const TITRE_U1 = INITIAL_UNITS[0].title;

function ecrireProgres(contenu: unknown): void {
  localStorage.setItem(CLE, JSON.stringify(contenu));
}

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  localStorage.clear();
});

describe('scoreQcmUnite — score réel si dispo, jamais inventé', () => {
  it('renvoie null sans source (aucune note fabriquée)', () => {
    expect(scoreQcmUnite(1)).toBeNull();
  });

  it('renvoie null si quizScoreHistory est absent', () => {
    ecrireProgres({ xp: 10, completedUnits: [1] });
    expect(scoreQcmUnite(1)).toBeNull();
  });

  it('lit le score persisté par App.tsx pour la bonne unité', () => {
    ecrireProgres({
      quizScoreHistory: [{ date: '1/1/2026', score: 8, total: 10, unitTitle: TITRE_U1 }],
    });
    expect(scoreQcmUnite(1)).toEqual({ score: 8, total: 10 });
    // L'unité suivante n'a rien passé → pas de score.
    expect(scoreQcmUnite(2)).toBeNull();
  });

  it('garde la DERNIÈRE entrée de l\'unité (les retries comptent)', () => {
    ecrireProgres({
      quizScoreHistory: [
        { date: '1/1/2026', score: 3, total: 10, unitTitle: TITRE_U1 },
        { date: '2/1/2026', score: 9, total: 10, unitTitle: TITRE_U1 },
      ],
    });
    expect(scoreQcmUnite(1)).toEqual({ score: 9, total: 10 });
  });

  it('ignore une entrée sans total exploitable', () => {
    ecrireProgres({
      quizScoreHistory: [{ date: '1/1/2026', score: 5, total: 0, unitTitle: TITRE_U1 }],
    });
    expect(scoreQcmUnite(1)).toBeNull();
  });

  it('ignore les entrées d\'une autre unité', () => {
    ecrireProgres({
      quizScoreHistory: [{ date: '1/1/2026', score: 10, total: 10, unitTitle: 'عنوان آخر' }],
    });
    expect(scoreQcmUnite(1)).toBeNull();
  });

  it('survit à un JSON corrompu (retour null, pas de throw)', () => {
    localStorage.setItem(CLE, '{pas du json');
    expect(scoreQcmUnite(1)).toBeNull();
    localStorage.setItem(CLE, '"pas un objet"');
    expect(scoreQcmUnite(1)).toBeNull();
  });

  it('renvoie null pour une unité inexistante', () => {
    ecrireProgres({
      quizScoreHistory: [{ date: '1/1/2026', score: 5, total: 10, unitTitle: TITRE_U1 }],
    });
    expect(scoreQcmUnite(999)).toBeNull();
  });
});

describe('poidsBacUnite — uniquement ce qui a été mesuré', () => {
  it('expose les 7 unités mesurées et rien pour U8..U11', () => {
    const mesures = [1, 2, 3, 4, 5, 6, 7]
      .map((u) => poidsBacUnite(u))
      .filter((p) => typeof p === 'number');
    expect(mesures).toHaveLength(7);
    expect([8, 9, 10, 11].map((u) => poidsBacUnite(u))).toEqual([undefined, undefined, undefined, undefined]);
  });
});
