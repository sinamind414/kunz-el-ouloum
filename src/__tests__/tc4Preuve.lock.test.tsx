// tc4Preuve.lock.test.tsx — LA PREUVE AVANT « مثبّتة » (TC4, 19/10/2026).
//
// Ce que l'audit « architecture d'apprentissage » (H2) a mesuré et que cette
// tranche verrouille : le جسر s'affichait « مثبّتة » sur simple
// auto-déclaration — ou sur 1 bonne réponse sur 1 question (U9 n'a qu'UNE
// question dans la banque du جسر). Convention après correction :
//   · « مثبّتة » = preuve MESURÉE : ≥ 60 % (SEUIL_FRAGILE côté
//     parcoursProgress) sur ≥ PREUVE_QCM_MIN (5) QCM, à la DERNIÈRE
//     tentative (une reprise gouverne, jamais une vieille note) ;
//   · sinon « مقروءة » — lu, pas prouvé (le cas U2/U3/U8 : 0 question) ;
//   · les leçons gardent la convention OKacha (décision produit 02/10).

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ParcoursView from '../components/ParcoursView';
import { PARCOURS_DOMAINS } from '../lib/parcours/parcoursPath';
import { markDone } from '../lib/parcours/parcoursProgress';
import { PREUVE_QCM_MIN, scoreQcmUnite } from '../lib/parcours/parcoursMeta';
import { INITIAL_UNITS } from '../unitCatalog';

const CLE = 'svt_progress';
const TITRE_U1 = INITIAL_UNITS[0].title;

const onOpenLesson = vi.fn();
const onOpenQcm = vi.fn();

function renderParcours() {
  onOpenLesson.mockClear();
  onOpenQcm.mockClear();
  return render(
    <ParcoursView onOpenLesson={onOpenLesson} onOpenQcm={onOpenQcm} />,
  );
}

function toggleDe(testId: string): HTMLElement {
  const t = screen.getByTestId(`${testId}-toggle`);
  if (!t) throw new Error(`pas de toggle sur ${testId}`);
  return t;
}

function preparerUnite1(): void {
  const u1 = PARCOURS_DOMAINS[0].units[0];
  for (const item of u1.items) if (item.kind === 'lesson') markDone(item.id);
}

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  cleanup();
  localStorage.clear();
});

describe('PREUVE_QCM_MIN — taille minimale d une preuve (scoreQcmUnite)', () => {
  it('4/4 (100%) n est PAS une preuve : scoreQcmUnite renvoie null', () => {
    localStorage.setItem(
      CLE,
      JSON.stringify({
        quizScoreHistory: [{ date: '1/1/2026', score: 4, total: 4, unitTitle: TITRE_U1 }],
      }),
    );
    expect(scoreQcmUnite(1)).toBeNull();
  });

  it('3/5 (60%) EST une preuve', () => {
    localStorage.setItem(
      CLE,
      JSON.stringify({
        quizScoreHistory: [{ date: '1/1/2026', score: 3, total: 5, unitTitle: TITRE_U1 }],
      }),
    );
    expect(scoreQcmUnite(1)).toEqual({ score: 3, total: 5 });
  });

  it('la DERNIÈRE tentative gouverne : 2/2 après 9/10 → pas de preuve', () => {
    localStorage.setItem(
      CLE,
      JSON.stringify({
        quizScoreHistory: [
          { date: '1/1/2026', score: 9, total: 10, unitTitle: TITRE_U1 },
          { date: '2/1/2026', score: 2, total: 2, unitTitle: TITRE_U1 },
        ],
      }),
    );
    // On ne ressort JAMAIS la vieille note pour fabriquer un label.
    expect(scoreQcmUnite(1)).toBeNull();
  });
});

describe('Le جسر : مقروءة sans preuve, مثبّتة avec preuve (composant)', () => {
  it('un جسر validé sur une preuve trop courte (4/4) reste « مقروءة »', () => {
    preparerUnite1();
    localStorage.setItem(
      CLE,
      JSON.stringify({
        quizScoreHistory: [{ date: '1/1/2026', score: 4, total: 4, unitTitle: TITRE_U1 }],
      }),
    );
    renderParcours();
    fireEvent.click(toggleDe('parcours-jalon-1'));
    const texte = screen.getByTestId('parcours-jalon-1').textContent ?? '';
    expect(texte).toContain('مقروءة');
    expect(texte).not.toContain('مثبّتة');
  });

  it('un جسر validé sur 3/5 (60%) affiche « مثبّتة · 3 / 5 »', () => {
    preparerUnite1();
    localStorage.setItem(
      CLE,
      JSON.stringify({
        quizScoreHistory: [{ date: '1/1/2026', score: 3, total: 5, unitTitle: TITRE_U1 }],
      }),
    );
    renderParcours();
    fireEvent.click(toggleDe('parcours-jalon-1'));
    const texte = screen.getByTestId('parcours-jalon-1').textContent ?? '';
    expect(texte).toContain('مثبّتة');
    expect(texte).toContain('3 / 5');
  });
});

describe('Source-locks TC4', () => {
  const source = (relatif: string): string =>
    readFileSync(resolve(import.meta.dirname, relatif), 'utf8');

  it('metaDe contient la branche مقروءة pour le جسر sans score', () => {
    const vue = source('../components/ParcoursView.tsx');
    expect(vue).toContain("item.kind === 'jalon' && typeof record?.score !== 'number'");
    expect(vue).toContain('مقروءة · لم يُختبَر');
  });

  it('scoreQcmUnite applique PREUVE_QCM_MIN (5)', () => {
    const meta = source('../lib/parcours/parcoursMeta.ts');
    expect(meta).toContain('dernier.total < PREUVE_QCM_MIN');
    expect(PREUVE_QCM_MIN).toBe(5);
  });
});
