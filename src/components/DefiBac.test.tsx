// #58 — Défi BAC : le seul écran qui contournait le verrouillage des unités.
// Deux des trois « boss » proposés (U6, U9) sont des unités isLocked:true que
// le bouton « تحدّى » lançait malgré tout, alors que DashboardView,
// LessonsView et MyPathView filtrent tous `!isLocked`.
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import TrainingView from './TrainingView';
import { INITIAL_UNITS } from '../unitCatalog';
import type { Unit, UserProgress } from '../types';

const progress = (xp: number, completedUnits: number[] = []): UserProgress => ({
  xp,
  streak: 0,
  completedUnits,
  completedQuestionsCount: 0,
  studyMinutes: 0,
  flashcardStats: { again: 0, hard: 0, good: 0, easy: 0 },
  quizScoreHistory: [],
} as unknown as UserProgress);

function renderTraining(xp: number, launched: number[], completedUnits: number[] = [], units: Unit[] = INITIAL_UNITS) {
  return render(
    <TrainingView
      units={units}
      flashcards={[]}
      progress={progress(xp, completedUnits)}
      onLaunchQuiz={(id) => launched.push(id)}
      onLaunchRevision={() => {}}
      onStartLesson={() => {}}
      onRateCard={() => {}}
      isFocusMode={false}
      setIsFocusMode={() => {}}
      onNavigateToTab={() => {}}
    />,
  );
}

function openBacScreen() {
  fireEvent.click(screen.getByText('تحدي BAC'));
  // Ancrage positif : prouve que l'écran est monté avant toute assertion
  // d'absence (sinon un `queryAll` vide passerait à vide).
  expect(screen.getByText(/3 بطولات/)).toBeTruthy();
}

beforeEach(() => localStorage.clear());
afterEach(cleanup);

describe('Défi BAC — respect du verrouillage', () => {
  it('ouvre l’écran des boss au-delà de 150 XP', () => {
    renderTraining(151, []);
    openBacScreen();
    expect(screen.getAllByTestId(/^boss-row-/)).toHaveLength(3);
  });

  it('reste fermé en deçà de 150 XP', () => {
    renderTraining(10, []);
    fireEvent.click(screen.getByText('تحدي BAC'));
    expect(screen.queryByText(/3 بطولات/)).toBeNull();
    expect(screen.getByText(/يفتح بعد 150 XP/)).toBeTruthy();
  });

  it('ne lance JAMAIS une unité verrouillée', () => {
    const launched: number[] = [];
    renderTraining(151, launched);
    openBacScreen();
    for (const btn of screen.queryAllByTestId(/^boss-launch-/)) fireEvent.click(btn);
    expect(launched.length).toBeGreaterThan(0);
    for (const id of launched) {
      const unit = INITIAL_UNITS.find((u) => u.id === id);
      expect(unit).toBeDefined();
      expect(unit!.isLocked).toBe(false);
    }
  });

  it('affiche un boss verrouillé sans bouton de lancement', () => {
    const launched: number[] = [];
    renderTraining(151, launched);
    openBacScreen();
    // Catalogue livré : seule U1 est ouverte, donc 2 domaines sur 3 sont bloqués.
    expect(screen.getAllByTestId(/^boss-locked-/).length).toBe(2);
    expect(screen.getAllByTestId(/^boss-launch-/).length).toBe(1);
    expect(launched).toHaveLength(0);
  });

  it('débloque le boss d’un domaine quand l’unité précédente est terminée', () => {
    // U6 devient jouable si U5 est terminée (règle isLocked de DashboardView).
    const launched: number[] = [];
    renderTraining(200, launched, [5]);
    openBacScreen();
    const buttons = screen.getAllByTestId(/^boss-launch-/);
    expect(buttons.length).toBe(2);
    for (const btn of buttons) fireEvent.click(btn);
    expect(launched).toContain(6);
    expect(launched).not.toContain(9);
  });

  it('choisit la première unité OUVERTE du domaine, pas la première tout court', () => {
    // Si l'unité de tête d'un domaine est verrouillée mais qu'une autre du même
    // domaine est ouverte, c'est cette dernière qui doit être proposée.
    const units: Unit[] = INITIAL_UNITS.map((u) =>
      u.id === 1 ? { ...u, isLocked: true } : u.id === 3 ? { ...u, isLocked: false } : u,
    );
    const launched: number[] = [];
    renderTraining(200, launched, [], units);
    openBacScreen();
    for (const btn of screen.getAllByTestId(/^boss-launch-/)) fireEvent.click(btn);
    expect(launched).toContain(3);
    expect(launched).not.toContain(1);
  });
});
