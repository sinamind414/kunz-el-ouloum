// activiteQuotidienne.test.ts — la porte unique de crédit d'activité (H3).
//
// Les quatre scénarios testés sont exactement les quatre gestes de l'élève qui
// passaient par quatre recopies différentes de la même logique : minutes de
// focus, notation de flashcard, fin de quiz, question du tuteur.

import { describe, expect, it } from 'vitest';
import type { DailyGoalConfig, UserProgress } from '../../types';
import {
  appliquerActiviteQuotidienne,
  estimationMinutesQuiz,
  jourChange,
  OBJECTIF_QUOTIDIEN_DEFAUT,
  serieAfficheeDepuisDaily,
  streakAAfficher,
} from '../activiteQuotidienne';

function progression(partial: Partial<UserProgress> = {}, daily?: Partial<DailyGoalConfig>): UserProgress {
  return {
    xp: 0,
    streak: 0,
    completedUnits: [],
    completedQuestionsCount: 0,
    studyMinutes: 0,
    flashcardStats: { again: 0, hard: 0, good: 0, easy: 0 },
    quizScoreHistory: [],
    ...partial,
    dailyGoals: { ...OBJECTIF_QUOTIDIEN_DEFAUT, ...(daily ?? {}) },
  };
}

const LE_14 = new Date(2026, 9, 14, 18, 0, 0); // 14 oct. 2026, 18 h locales

describe('appliquerActiviteQuotidienne — cumul et remise à zéro', () => {
  it('première activité d’un nouveau jour : compteurs remis à zéro, série à 1', () => {
    // La veille, l'élève a travaillé (serieDernierJour = 13) : la série continue.
    const p = progression({}, {
      lastActiveDate: '2026-10-13', todayMinutes: 40, todayQuestions: 12,
      streakDays: 3, serieDernierJour: '2026-10-13', completedToday: true,
    });
    const r = appliquerActiviteQuotidienne(p, { minutes: 25 }, LE_14);

    expect(r.compteursReinitialises).toBe(true);
    expect(r.premiereActiviteDuJour).toBe(true);
    expect(r.progress.dailyGoals!.lastActiveDate).toBe('2026-10-14');
    expect(r.progress.dailyGoals!.todayMinutes).toBe(25);
    expect(r.progress.dailyGoals!.todayQuestions).toBe(0);
    expect(r.progress.dailyGoals!.streakDays).toBe(4);
    expect(r.progress.streak).toBe(4);
  });

  it('même jour : cumul sans nouvelle journée ni série gonflée', () => {
    const p = progression({ streak: 2 }, {
      lastActiveDate: '2026-10-14', todayMinutes: 10, todayQuestions: 5,
      streakDays: 2, serieDernierJour: '2026-10-14',
    });
    const r = appliquerActiviteQuotidienne(p, { minutes: 15, questions: 3 }, LE_14);

    expect(r.compteursReinitialises).toBe(false);
    expect(r.premiereActiviteDuJour).toBe(false);
    expect(r.progress.dailyGoals!.todayMinutes).toBe(25);
    expect(r.progress.dailyGoals!.todayQuestions).toBe(8);
    expect(r.progress.dailyGoals!.streakDays).toBe(2);
    expect(r.progress.streak).toBe(2);
  });

  it('un jour manqué remet la série à 1 (et le signale à l’appelant)', () => {
    const p = progression({ streak: 9 }, {
      lastActiveDate: '2026-10-11', todayMinutes: 30, streakDays: 9, serieDernierJour: '2026-10-11',
    });
    const r = appliquerActiviteQuotidienne(p, { minutes: 5 }, LE_14);

    expect(r.serieRompue).toBe(true);
    expect(r.progress.streak).toBe(1);
    expect(r.progress.dailyGoals!.streakDays).toBe(1);
  });

  it('objectif atteint : completedToday bascule au seuil, pas avant', () => {
    const p = progression({}, { lastActiveDate: '2026-10-14', todayMinutes: 20, targetMinutes: 25 });
    const avant = appliquerActiviteQuotidienne(p, { minutes: 4 }, LE_14);
    expect(avant.progress.dailyGoals!.completedToday).toBe(false);

    const apres = appliquerActiviteQuotidienne(avant.progress, { minutes: 1 }, LE_14);
    expect(apres.progress.dailyGoals!.completedToday).toBe(true);
  });

  it('objectif en mode « questions » : c’est le nombre de questions qui décide', () => {
    const p = progression({}, { type: 'questions', targetQuestions: 20, lastActiveDate: '2026-10-14' });
    const r = appliquerActiviteQuotidienne(p, { minutes: 60, questions: 20 }, LE_14);
    expect(r.progress.dailyGoals!.completedToday).toBe(true);
  });

  it('progression sans objectif quotidien : les défauts s’appliquent sans planter', () => {
    const p = progression();
    delete (p as { dailyGoals?: DailyGoalConfig }).dailyGoals;
    const r = appliquerActiviteQuotidienne(p, { minutes: 25 }, LE_14);
    expect(r.progress.dailyGoals!.todayMinutes).toBe(25);
    expect(r.progress.dailyGoals!.streakDays).toBe(1);
    expect(r.progress.dailyGoals!.completedToday).toBe(true);
  });

  it('les deltas ne sont jamais négatifs (une interface ne peut pas retirer des minutes)', () => {
    const p = progression({}, { lastActiveDate: '2026-10-14', todayMinutes: 10 });
    const r = appliquerActiviteQuotidienne(p, { minutes: -30, questions: -5 }, LE_14);
    expect(r.progress.dailyGoals!.todayMinutes).toBe(10);
    expect(r.progress.dailyGoals!.todayQuestions).toBe(0);
  });

  it('ne mute PAS la progression reçue (l’app raisonne en objets immuables)', () => {
    const p = progression({}, { lastActiveDate: '2026-10-14', todayMinutes: 10 });
    const copie = JSON.parse(JSON.stringify(p));
    appliquerActiviteQuotidienne(p, { minutes: 5 }, LE_14);
    expect(p).toEqual(copie);
  });
});

describe('appliquerActiviteQuotidienne — historique borné, une entrée par jour', () => {
  it('remplace l’entrée du jour au lieu d’en empiler une par quiz', () => {
    let p = progression({}, { lastActiveDate: '2026-10-14', todayMinutes: 0 });
    for (let i = 0; i < 5; i++) {
      p = appliquerActiviteQuotidienne(p, { minutes: 5 }, LE_14).progress;
    }
    const entrees = p.dailyGoals!.history!.filter((h) => h.date === '2026-10-14');
    expect(entrees).toHaveLength(1);
    expect(entrees[0].achieved).toBe(25);
  });

  it('conserve au plus 30 jours d’historique', () => {
    let p = progression();
    for (let j = 0; j < 45; j++) {
      const jour = new Date(2026, 7, 1 + j); // août → mi-septembre 2026
      p = appliquerActiviteQuotidienne(p, { minutes: 30 }, new Date(jour.getFullYear(), jour.getMonth(), jour.getDate(), 20)).progress;
    }
    expect(p.dailyGoals!.history!.length).toBeLessThanOrEqual(30);
    expect(p.dailyGoals!.history![p.dailyGoals!.history!.length - 1].date).toBe('2026-09-14');
  });
});

describe('la série ne se construit PAS sur les ouvertures de l’app', () => {
  // LE PIÈGE RÉEL : l'app remet `lastActiveDate` à aujourd'hui dès l'OUVERTURE
  // (`App.tsx`, effet de chargement), sans aucun travail. Si la série prenait ce
  // champ comme référence, un élève qui ouvre l'app tous les jours sans étudier
  // gagnerait une série de 30 jours sans avoir rien fait. La référence est donc
  // `serieDernierJour`, écrite uniquement par une activité réelle.
  it('ouvrir l’app ne crédite aucun jour de série', () => {
    const p = progression(
      { streak: 0 },
      { lastActiveDate: '2026-10-14', serieDernierJour: undefined, streakDays: 0 },
    );
    // Aucune activité : on lit seulement l'état.
    expect(streakAAfficher(p, LE_14)).toBe(0);
    expect(p.dailyGoals!.streakDays).toBe(0);
  });

  it('la première activité après la mise à jour démarre la série à 1', () => {
    // Donnée héritée : `serieDernierJour` absent (stockée avant le correctif).
    const p = progression({}, { lastActiveDate: '2026-10-14', todayMinutes: 15, streakDays: 0 });
    const r = appliquerActiviteQuotidienne(p, { minutes: 25 }, LE_14);
    expect(r.progress.dailyGoals!.serieDernierJour).toBe('2026-10-14');
    expect(r.progress.dailyGoals!.streakDays).toBe(1);
  });

  it('le jour suivant, étudier incrémente — même si l’app a été ouverte entre-temps', () => {
    // Veille : série à 3. Entre-temps, l'élève a OUVERT l'app (lastActiveDate a
    // été remis au 14 par l'effet de chargement) sans travailler.
    const p = progression(
      { streak: 3 },
      { lastActiveDate: '2026-10-14', serieDernierJour: '2026-10-13', streakDays: 3 },
    );
    const r = appliquerActiviteQuotidienne(p, { questions: 5 }, LE_14);
    expect(r.progress.dailyGoals!.streakDays).toBe(4);
    expect(r.progress.streak).toBe(4);
  });
});

describe('streakAAfficher — l’affichage ne montre jamais une série morte', () => {
  it('affiche la série si le dernier jour travaillé est aujourd’hui ou hier', () => {
    expect(serieAfficheeDepuisDaily({ ...OBJECTIF_QUOTIDIEN_DEFAUT, serieDernierJour: '2026-10-14', streakDays: 6 }, LE_14)).toBe(6);
    expect(serieAfficheeDepuisDaily({ ...OBJECTIF_QUOTIDIEN_DEFAUT, serieDernierJour: '2026-10-13', streakDays: 6 }, LE_14)).toBe(6);
  });

  it('affiche 0 dès qu’un jour a été manqué', () => {
    expect(serieAfficheeDepuisDaily({ ...OBJECTIF_QUOTIDIEN_DEFAUT, serieDernierJour: '2026-10-10', streakDays: 6 }, LE_14)).toBe(0);
  });

  it('survit à une progression sans objectifs quotidiens', () => {
    expect(serieAfficheeDepuisDaily(undefined, LE_14)).toBe(0);
    expect(streakAAfficher(progression(), LE_14)).toBe(0);
  });
});

describe('estimationMinutesQuiz — la convention d’estimation est unique', () => {
  it('1,5 minute par question, plancher 3 minutes', () => {
    expect(estimationMinutesQuiz(1)).toBe(3);
    expect(estimationMinutesQuiz(4)).toBe(6);
    expect(estimationMinutesQuiz(30)).toBe(45);
  });
});

describe('jourChange — lecture seule du changement de jour', () => {
  it('détecte le changement de jour sans rien écrire', () => {
    expect(jourChange({ ...OBJECTIF_QUOTIDIEN_DEFAUT, lastActiveDate: '2026-10-13' }, LE_14)).toBe(true);
    expect(jourChange({ ...OBJECTIF_QUOTIDIEN_DEFAUT, lastActiveDate: '2026-10-14' }, LE_14)).toBe(false);
    expect(jourChange(undefined, LE_14)).toBe(true);
  });
});
