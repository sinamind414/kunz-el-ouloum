import type { ComponentProps } from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import MyPathView from './MyPathView';
import { INITIAL_UNITS } from '../unitCatalog';
import type { UserProgress } from '../types';
import { DONE_KEY, loadMissions, STORAGE_KEY } from '../utils/missionManager';
import { CONCEPT_ROUTES } from '../data/conceptRoutes';
import { SURVIVAL_CARDS } from '../data/survivalCards';

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ user: { name: 'طالب زائر' } }),
}));

const progress: UserProgress = {
  xp: 0,
  streak: 0,
  completedUnits: [],
  completedQuestionsCount: 0,
  studyMinutes: 0,
  flashcardStats: { again: 0, hard: 0, good: 0, easy: 0 },
  quizScoreHistory: [],
};

/**
 * Contre-épreuve de la « boussole » — l'onglet مساري (constats #46 à #50).
 *
 * Cette surface est exécutée par TOUS les élèves et n'était couverte par aucun
 * test : c'est ce qui a permis aux cinq défauts de survivre à 522 tests verts.
 * Chaque bloc ci-dessous encode le comportement ATTENDU, pas le comportement
 * observé — les assertions ont été écrites avant le correctif et échouaient.
 */
describe('Boussole — parcours d’accueil (#46)', () => {
  beforeEach(() => {
    localStorage.clear();
  });
  afterEach(cleanup);

  // #46 : M0 et M1 n'étaient reliées à aucun contenu. Le clic les marquait
  // « done » et créditait 20 XP sans afficher le moindre écran, soit un tiers
  // du parcours fondateur franchi à vide.
  it('n’accorde jamais une mission d’accueil sans avoir ouvert un contenu', async () => {
    const user = userEvent.setup();
    const onLaunchReflexMission = vi.fn();
    const onOpenDocumentExercise = vi.fn();
    const onLaunchSurvivalCard = vi.fn();

    render(
      <MyPathView
        units={INITIAL_UNITS}
        progress={progress}
        onLaunchQuiz={vi.fn()}
        onLaunchRevision={vi.fn()}
        onNavigateToTab={vi.fn()}
        onLaunchReflexMission={onLaunchReflexMission}
        onLaunchSurvivalCard={onLaunchSurvivalCard}
        onOpenDocumentExercise={onOpenDocumentExercise}
      />
    );

    // La mission courante au premier lancement est M0.
    expect(loadMissions().find((m) => m.status === 'current')?.id).toBe('M0');

    await user.click(screen.getByTestId('mission-start'));

    // Un contenu DOIT avoir été ouvert (réflexe, document ou carte publiable).
    const aOuvertUnContenu =
      onLaunchReflexMission.mock.calls.length +
        onOpenDocumentExercise.mock.calls.length +
        onLaunchSurvivalCard.mock.calls.length >
      0;
    expect(aOuvertUnContenu).toBe(true);

    // …et la mission ne doit surtout PAS avoir été validée par le seul clic.
    expect(loadMissions().find((m) => m.id === 'M0')?.status).not.toBe('done');
  });

  it('relie chacune des 6 missions d’accueil à un contenu réel', () => {
    render(
      <MyPathView
        units={INITIAL_UNITS}
        progress={progress}
        onLaunchQuiz={vi.fn()}
        onLaunchRevision={vi.fn()}
        onNavigateToTab={vi.fn()}
        onLaunchReflexMission={vi.fn()}
        onOpenDocumentExercise={vi.fn()}
      />
    );
    const missions = loadMissions();
    expect(missions).toHaveLength(6);
    // Aucune mission « muette » : chacune doit exposer une cible de contenu.
    const muettes = missions.filter((m) => !screen.queryByTestId(`mission-target-${m.id}`));
    expect(muettes.map((m) => m.id)).toEqual([]);
  });
});

describe('Boussole — tableau de bord (#47 à #50)', () => {
  beforeEach(() => {
    localStorage.clear();
    // On se place APRÈS la Manhadjiya pour atteindre MotivationView.
    localStorage.setItem(DONE_KEY, 'true');
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(
        ['M0', 'M1', 'M2', 'M3', 'M4', 'M5'].map((id) => ({
          id,
          titleAr: id,
          titleFr: id,
          loiKunz: id,
          duration: 5,
          xp: 10,
          status: 'done',
          completedAt: '2026-01-01T00:00:00.000Z',
        }))
      )
    );
  });
  afterEach(cleanup);

  const renderDashboard = (overrides: Partial<ComponentProps<typeof MyPathView>> = {}) => {
    const props: ComponentProps<typeof MyPathView> = {
      units: INITIAL_UNITS,
      progress,
      onLaunchQuiz: vi.fn(),
      onLaunchRevision: vi.fn(),
      onNavigateToTab: vi.fn(),
      ...overrides,
    };
    render(<MyPathView {...props} />);
    return props;
  };

  // #48 : quatre boutons distincts exécutaient tous onLaunchQuiz(dailyTargetUnit.id),
  // dont deux cartes orange jumelles empilées, malgré le commentaire du code
  // affirmant « 1 seule action principale ».
  it('n’affiche qu’une seule action principale (pas deux héros jumeaux)', () => {
    renderDashboard();
    expect(screen.queryAllByTestId('primary-action')).toHaveLength(1);
  });

  // #49 : au premier lancement (1 seule unité déverrouillée sur 11), trois
  // icônes pointaient U1 avec des promesses contradictoires.
  it.each([
    ['premier lancement (1 seule unité déverrouillée)', INITIAL_UNITS],
    [
      'élève avancé (U1 finie, U4 avancée mais verrouillée)',
      INITIAL_UNITS.map((u) => {
        if (u.id === 1) return { ...u, isLocked: false, progress: 100 };
        if (u.id === 2) return { ...u, isLocked: false, progress: 85 };
        if (u.id === 3) return { ...u, isLocked: false, progress: 20 };
        if (u.id === 4) return { ...u, isLocked: true, progress: 95 };
        return { ...u };
      }),
    ],
  ])('ne présente jamais la même unité sous deux promesses — %s', (_label, units) => {
    renderDashboard({ units });
    const cibles = screen
      .queryAllByTestId(/^compass-icon-/)
      .map((el) => el.getAttribute('data-unit-id'))
      .filter((v): v is string => v != null && v !== '');
    expect(new Set(cibles).size).toBe(cibles.length);
  });

  // #49 (suite) : « إنجاز قريب » ignorait le filtre isLocked et pouvait
  // désigner une unité verrouillée — promesse intenable.
  it('ne désigne jamais une unité verrouillée', () => {
    // U4 est verrouillée mais créditée de 95 % : c'est exactement le cas où
    // « إنجاز قريب » la désignait, faute de filtre isLocked.
    const units = INITIAL_UNITS.map((u) => {
      if (u.id === 1) return { ...u, isLocked: false, progress: 100 };
      if (u.id === 2) return { ...u, isLocked: false, progress: 85 };
      if (u.id === 3) return { ...u, isLocked: false, progress: 20 };
      if (u.id === 4) return { ...u, isLocked: true, progress: 95 };
      return { ...u };
    });
    renderDashboard({ units });
    const verrouillees = new Set(units.filter((u) => u.isLocked).map((u) => String(u.id)));
    const cibles = screen
      .queryAllByTestId(/^compass-icon-/)
      .map((el) => el.getAttribute('data-unit-id'))
      .filter((v): v is string => v != null && v !== '');
    expect(cibles.filter((id) => verrouillees.has(id))).toEqual([]);
  });

  // #50 : onLaunchRevision(id) était appelé avec une unité précise, mais le
  // gestionnaire d'App.tsx jetait son argument (_unitId).
  it('transmet l’unité annoncée à la révision', async () => {
    const user = userEvent.setup();
    const onLaunchRevision = vi.fn();
    // Profil avancé : plusieurs unités déverrouillées, sans quoi « ثغرة خطيرة »
    // n'a — légitimement — aucune cible distincte à proposer.
    const units = INITIAL_UNITS.map((u) =>
      u.id <= 3 ? { ...u, isLocked: false, progress: u.id * 20 } : { ...u }
    );
    renderDashboard({ onLaunchRevision, units });

    const gap = screen.getByTestId('compass-icon-gap');
    const attendu = Number(gap.getAttribute('data-unit-id'));
    await user.click(gap);

    expect(onLaunchRevision).toHaveBeenCalledWith(attendu);
  });
});

describe('Boussole — cohérence des données de routage (#47, #50)', () => {
  // #50 rectifié : le défaut n'est pas dans MISSION_SURVIVAL_CARD (dont les
  // valeurs sont de vrais id de carte) mais dans la ConceptRoute construite à
  // la volée, qui cherchait une carte par conceptId et figeait unitId: 0.
  it('toute survivalCardId de CONCEPT_ROUTES désigne une carte existante', () => {
    const ids = new Set(SURVIVAL_CARDS.map((c) => c.id));
    const orphelines = Object.values(CONCEPT_ROUTES)
      .map((r) => r.survivalCardId)
      .filter((id): id is string => !!id && !ids.has(id));
    expect(orphelines).toEqual([]);
  });

  it('aucune route ne porte un unitId nul (0 = unité inexistante)', () => {
    const nulles = Object.values(CONCEPT_ROUTES).filter((r) => r.unitId === 0);
    expect(nulles).toEqual([]);
  });
});
