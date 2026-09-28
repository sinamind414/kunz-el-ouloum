// planSettings.test.ts — réglage partagé du plan (sprint 29).

import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  DEFAULT_PLAN_SETTINGS,
  PLAN_SETTINGS_KEY,
  readPlanSettings,
  writePlanSettings,
} from './planSettings';

beforeEach(() => localStorage.clear());

describe('réglage du plan', () => {
  it('retourne le défaut quand rien n’est enregistré', () => {
    expect(readPlanSettings()).toEqual(DEFAULT_PLAN_SETTINGS);
  });

  it('fait un aller-retour fidèle', () => {
    writePlanSettings({ daysLeft: 30, minutesPerDay: 60 });
    expect(readPlanSettings()).toEqual({ daysLeft: 30, minutesPerDay: 60 });
  });

  it('borne les valeurs aberrantes au lieu de les propager', () => {
    writePlanSettings({ daysLeft: 999, minutesPerDay: 5 });
    expect(readPlanSettings()).toEqual({ daysLeft: 60, minutesPerDay: 20 });
  });

  it('résiste à un contenu corrompu ou partiel', () => {
    localStorage.setItem(PLAN_SETTINGS_KEY, 'pas du json');
    expect(readPlanSettings()).toEqual(DEFAULT_PLAN_SETTINGS);
    localStorage.setItem(PLAN_SETTINGS_KEY, JSON.stringify({ daysLeft: 20 }));
    expect(readPlanSettings()).toEqual({
      daysLeft: 20,
      minutesPerDay: DEFAULT_PLAN_SETTINGS.minutesPerDay,
    });
  });

  it('n’explose pas si le stockage est refusé', () => {
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('refusé');
    });
    expect(() => writePlanSettings({ daysLeft: 10, minutesPerDay: 90 })).not.toThrow();
    spy.mockRestore();
  });
});
