// CompteSansEmail.test.tsx — défaut signalé le 14/10/2026 :
// le seul chemin vers l'inscription était l'avatar de l'en-tête, et le
// formulaire réclamait une adresse « eleve@ecole.dz ». Les élèves ne
// s'inscrivaient donc pas. Cette carte rend le chemin visible ET lisible
// (pas de « email », pas de mot de passe à inventer).

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import DashboardView from '../DashboardView';
import { INITIAL_UNITS } from '../../unitCatalog';
import type { UserProgress } from '../../types';

const PROGRESS: UserProgress = {
  xp: 0,
  streak: 0,
  completedUnits: [],
  completedQuestionsCount: 0,
  studyMinutes: 0,
  dailyGoals: {
    type: 'minutes',
    targetMinutes: 25,
    targetQuestions: 20,
    lastActiveDate: '2026-10-11',
    todayMinutes: 0,
    todayQuestions: 0,
    streakDays: 0,
    completedToday: false,
  },
  flashcardStats: { again: 0, hard: 0, good: 0, easy: 0 },
  quizScoreHistory: [],
};

function rendre(props: Record<string, unknown> = {}) {
  return render(
    <DashboardView
      units={INITIAL_UNITS}
      progress={PROGRESS}
      onLaunchQuiz={() => {}}
      onLaunchRevision={() => {}}
      onNavigateToTab={() => {}}
      {...props}
    />,
  );
}

afterEach(() => {
  cleanup();
  localStorage.clear();
});

describe('Accueil — invitation à créer un compte sans e-mail', () => {
  it('affiche une carte qui dit explicitement qu’il n’y a pas besoin d’e-mail', () => {
    rendre({ onOpenAuth: () => {}, connecte: false });
    expect(screen.getByText('أنشئ حسابك بدون بريد إلكتروني')).toBeTruthy();
    expect(screen.getByTestId('carte-compte-sans-email')).toBeTruthy();
    // La promesse exacte : ni e-mail, ni mot de passe à retenir.
    expect(screen.getByText(/لا بريد ولا كلمة مرور/)).toBeTruthy();
  });

  it('ouvre la fenêtre de création au clic (et rappelle le mode invité)', () => {
    const onOpenAuth = vi.fn();
    rendre({ onOpenAuth, connecte: false });
    fireEvent.click(screen.getByText('إنشاء حساب في دقيقة'));
    expect(onOpenAuth).toHaveBeenCalledTimes(1);
    expect(screen.getByText(/أو تابع كزائر/)).toBeTruthy();
  });

  it('disparaît dès qu’une session élève existe', () => {
    rendre({ onOpenAuth: () => {}, connecte: true });
    expect(screen.queryByTestId('carte-compte-sans-email')).toBeNull();
  });

  it('ne s’affiche pas non plus si aucune action d’ouverture n’est branchée (pas de bouton mort)', () => {
    rendre({ connecte: false });
    expect(screen.queryByTestId('carte-compte-sans-email')).toBeNull();
  });
});

describe('Accueil — travail fait AVANT la connexion (téléphone partagé)', () => {
  const QUEUE_KEY = 'boussole_activity_queue';

  const mettreEnFile = (n: number) => {
    localStorage.setItem(
      QUEUE_KEY,
      JSON.stringify(
        Array.from({ length: n }, (_, i) => ({
          kind: 'event',
          owner: 'invite',
          payload: { id: `act_${i}`, studentId: 'local', type: 'quiz', payload: { percent: 50 }, createdAt: '2026-10-01T00:00:00Z' },
        })),
      ),
    );
  };

  it('demande à l’élève connecté si ce travail est le sien', () => {
    mettreEnFile(3);
    rendre({ connecte: true, onOpenAuth: () => {} });
    expect(screen.getByTestId('bandeau-activites-invite')).toBeTruthy();
    expect(screen.getByText(/3/)).toBeTruthy();
  });

  it('ne dit rien à un invité (aucun compte → rien à attribuer)', () => {
    mettreEnFile(3);
    rendre({ connecte: false, onOpenAuth: () => {} });
    expect(screen.queryByTestId('bandeau-activites-invite')).toBeNull();
  });

  it('« ليست لي » efface le travail d’invité sans l’envoyer', () => {
    mettreEnFile(2);
    rendre({ connecte: true, onOpenAuth: () => {} });
    fireEvent.click(screen.getByText('لا، ليست لي'));
    expect(screen.queryByTestId('bandeau-activites-invite')).toBeNull();
    expect(JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]')).toEqual([]);
  });
});
