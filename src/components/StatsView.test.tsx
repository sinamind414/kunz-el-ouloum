// StatsView.test.tsx
//
// #56 — Anti-fiction sur l'écran de statistiques (SpecKit P0.1).
//
// L'écran « تقدمي » est la réponse de l'application à « où j'en suis ? ».
// Un graphique inventé y est plus nocif qu'ailleurs : l'élève n'a aucun
// moyen de distinguer une courbe fabriquée d'une mesure de son travail.
//
// LIMITE DE L'ENVIRONNEMENT, mesurée avant d'écrire ces tests :
// `recharts` ne rend AUCUN `<svg>` sous jsdom (`ResponsiveContainer` mesure
// une largeur nulle) — sonde : 0 `svg.recharts-surface`. Toute assertion
// portant sur le CONTENU d'un graphique passerait donc à vide, y compris
// sur le code défectueux. Les assertions ci-dessous portent uniquement sur
// des éléments réellement rendus : les titres de section, les mentions
// visibles, et la source elle-même.

import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import StatsView from './StatsView';
import { UserProgress, Unit } from '../types';

afterEach(cleanup);

// Élève vierge : exactement le DEFAULT_PROGRESS d'App.tsx.
function virginProgress(over: Partial<UserProgress> = {}): UserProgress {
  return {
    xp: 0,
    streak: 0,
    completedUnits: [],
    completedQuestionsCount: 0,
    studyMinutes: 0,
    flashcardStats: { again: 0, hard: 0, good: 0, easy: 0 },
    quizScoreHistory: [],
    ...over,
  };
}

const VIRGIN_UNITS: Unit[] = [
  { id: 1, title: 'تركيب البروتين', progress: 0, isLocked: false } as Unit,
  { id: 2, title: 'بنية ووظيفة البروتين', progress: 0, isLocked: true } as Unit,
];

const WORKED_UNITS: Unit[] = [
  { id: 1, title: 'تركيب البروتين', progress: 65, isLocked: false } as Unit,
  { id: 2, title: 'بنية ووظيفة البروتين', progress: 0, isLocked: true } as Unit,
];

describe("#56 — aucune progression fabriquée sur l'écran de statistiques", () => {
  it("n'annonce aucune trajectoire mensuelle à un élève qui n'a rien fait", () => {
    render(<StatsView progress={virginProgress()} units={VIRGIN_UNITS} />);

    // Le titre de section est rendu par jsdom (vérifié par sonde) : son
    // absence est donc une assertion réelle, pas un passage à vide. La
    // section promettait « l'évolution du niveau des unités sur le mois »
    // à partir de 4 semaines codées en dur montant jusqu'à 100 %.
    expect(screen.queryByText(/تطور مستوى الوحدات على مدار الشهر/)).toBeNull();
  });

  it('affiche un état vide explicite plutôt qu\'un graphique, sans donnée réelle', () => {
    render(<StatsView progress={virginProgress()} units={VIRGIN_UNITS} />);
    expect(screen.getByTestId('units-progress-empty')).toBeTruthy();
  });

  it("affiche la progression réelle des unités dès qu'elle existe", () => {
    render(<StatsView progress={virginProgress({ xp: 120 })} units={WORKED_UNITS} />);

    expect(screen.queryByTestId('units-progress-empty')).toBeNull();
    const chart = screen.getByTestId('units-progress-real');
    // La valeur affichée doit être celle de l'unité, pas une valeur inventée.
    expect(chart.textContent).toContain('65');
    expect(chart.textContent).toContain('تركيب البروتين');
  });

  it('ne conserve aucune série de progression codée en dur dans la source', () => {
    const source = readFileSync(resolve(process.cwd(), 'src/components/StatsView.tsx'), 'utf-8');

    // `monthlyUnitProgress` inventait une trajectoire d'apprentissage
    // (20 → 50 → 80 → 100 %) sans jamais lire `progress` ni `units`.
    expect(source).not.toMatch(/const monthlyUnitProgress\s*=\s*\[/);
    expect(source).not.toMatch(/'الأسبوع 1'/);
  });

  it('conserve une mention « تجريبي » sur les graphiques de démonstration restants', () => {
    const { container } = render(<StatsView progress={virginProgress()} units={VIRGIN_UNITS} />);

    // Les trois mocks tolérés (quiz, timeline, cartes) restent affichés mais
    // DOIVENT rester annoncés comme tels. Ce test échoue si un correctif
    // futur retire la mention en gardant les données fictives.
    expect(container.textContent).toMatch(/تجريبي/);
  });
});
