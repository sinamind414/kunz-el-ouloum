// serieAffichage.test.ts — verrou STATIQUE anti-retour du défaut H3.
//
// Le défaut corrigé n'était pas algorithmique, il était de DISPERSION : quatre
// écrans affichaient la série, quatre fonctions écrivaient (ou plutôt
// n'écrivaient pas) l'activité du jour, et le calcul du jour existait en quatre
// copies dont trois en UTC. Une relecture ne suffit pas à empêcher le retour de
// ce genre de défaut : on lit donc les SOURCES, comme le font déjà
// `politiqueConfidentialite.lock.test.ts` ou `clavier.test.ts` dans ce dépôt.

import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/** Composants — même dossier que ce test. */
const lire = (chemin: string) => readFileSync(resolve(__dirname, '..', chemin), 'utf-8');
/** Racine src/ (App.tsx vit un niveau au-dessus des composants). */
const lireSrc = (chemin: string) => readFileSync(resolve(__dirname, '../..', chemin), 'utf-8');

const APP = lireSrc('App.tsx');
const DASHBOARD = lire('DashboardView.tsx');
const STATS = lire('StatsView.tsx');
const WIDGET = lire('DailyGoalWidget.tsx');

describe('série de jours — plus aucun faux chiffre à l’écran', () => {
  it('aucun écran ne remplace une série vide par « 1 »', () => {
    // `streak || 1` affichait « 1 أيام » à un élève qui n'avait jamais rien fait
    // et empêchait de distinguer « aucun jour » de « un jour ».
    for (const [nom, src] of [['App', APP], ['DashboardView', DASHBOARD], ['StatsView', STATS], ['DailyGoalWidget', WIDGET]] as const) {
      expect(src.includes('streak || 1'), `${nom} : « streak || 1 » est revenu`).toBe(false);
      expect(src.includes('streakDays || 1'), `${nom} : « streakDays || 1 » est revenu`).toBe(false);
    }
  });

  it('les trois écrans qui affichent la série passent par le sélecteur testé', () => {
    for (const [nom, src] of [['DashboardView', DASHBOARD], ['StatsView', STATS], ['DailyGoalWidget', WIDGET]] as const) {
      expect(src.includes('serieAfficheeDepuisDaily'), `${nom} n’utilise pas serieAfficheeDepuisDaily`).toBe(true);
    }
  });

  it('la série n’est plus affichée depuis le champ brut `progress.streak`', () => {
    // Le champ brut reste le compteur STOCKÉ ; l'affichage doit passer par le
    // sélecteur, qui retombe à 0 quand un jour a été manqué.
    expect(/\{progress\.streak\}/.test(STATS + DASHBOARD)).toBe(false);
    expect(/progress\.streak\s*\|\|/.test(STATS + DASHBOARD)).toBe(false);
  });
});

describe('jour local — une seule définition, jamais UTC', () => {
  it('App.tsx ne calcule plus le jour en UTC', () => {
    // `toISOString()` renvoie le jour UTC : à Alger (UTC+1), l'app se croyait
    // encore la veille jusqu'à 01 h du matin.
    expect(APP.includes('toISOString().split')).toBe(false);
    expect(APP.includes('jourLocal')).toBe(true);
  });

  it('le tuteur et la session datent la mission du jour en heure locale', () => {
    const moteur = lireSrc('smartTutorEngine.ts');
    const session = lireSrc('utils/sessionManager.ts');
    expect(moteur.includes("from './utils/dayKey'")).toBe(true);
    expect(session.includes("from './dayKey'")).toBe(true);
    expect(moteur.includes('toISOString().split')).toBe(false);
    expect(session.includes('toISOString().split')).toBe(false);
  });
});

describe('crédit d’activité — une seule porte, et rien de fabriqué', () => {
  it('les quatre chemins d’activité passent par appliquerActiviteQuotidienne', () => {
    // addStudyMinutes · handleRateCard · handleQuizComplete · handleTutorXPGained
    const appels = APP.match(/appliquerActiviteQuotidienne\(/g) ?? [];
    expect(appels.length).toBeGreaterThanOrEqual(4);
  });

  it('App.tsx n’écrit plus `streakDays` à la main (hors affichage)', () => {
    // Toute écriture du champ doit passer par le module testé : une recopie
    // locale dans App.tsx serait le début du prochain défaut silencieux.
    expect(/streakDays:\s*\d/.test(APP)).toBe(false);
    expect(/streakDays:\s*(parsed|daily|current)/.test(APP)).toBe(false);
  });

  it('le repli du widget ne fabrique plus de statistiques de démonstration', () => {
    // Avant : 12 minutes, 14 questions, série de 3 jours et un historique figé
    // d'août 2026 — affichés à un élève dont la progression n'était pas encore
    // chargée. Le repli doit être neutre.
    const repli = WIDGET.slice(WIDGET.indexOf('export const getDefaultDailyGoals'));
    const corps = repli.slice(0, repli.indexOf('});'));
    expect(/todayMinutes:\s*0/.test(corps)).toBe(true);
    expect(/todayQuestions:\s*0/.test(corps)).toBe(true);
    expect(/streakDays:\s*0/.test(corps)).toBe(true);
    expect(/\[/.test(corps), 'le repli contient encore un historique en dur').toBe(true);
    expect(/history:\s*\[\]/.test(corps)).toBe(true);
  });
});
