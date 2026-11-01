// examSession.test.ts — chronomètre lu sur l'horloge (sprint 44).

import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  EXAM_SESSION_KEY,
  SESSION_VIDE,
  changerSujet,
  clearExamSession,
  demarrer,
  mettreEnPause,
  minutesEcoulees,
  readExamSession,
  remettreAZero,
  writeExamSession,
} from './examSession';

const T0 = new Date('2026-06-10T08:00:00Z').getTime();
const min = (n: number) => T0 + n * 60_000;

beforeEach(() => localStorage.clear());

describe('temps lu sur l’horloge, pas compté par les ticks', () => {
  it('compte le temps passé en arrière-plan, sans aucun tick', () => {
    const session = demarrer(SESSION_VIDE, T0);
    // Aucune exécution de code entre-temps : l'onglet était en arrière-plan.
    expect(minutesEcoulees(session, min(47))).toBe(47);
  });

  it('cumule correctement plusieurs périodes entrecoupées de pauses', () => {
    let s = demarrer(SESSION_VIDE, T0);
    s = mettreEnPause(s, min(30));
    expect(minutesEcoulees(s, min(90))).toBe(30); // en pause : le temps ne court plus
    s = demarrer(s, min(90));
    expect(minutesEcoulees(s, min(105))).toBe(45);
  });

  it('ignore un double démarrage et une double pause', () => {
    const s = demarrer(SESSION_VIDE, T0);
    expect(demarrer(s, min(10))).toBe(s);
    const p = mettreEnPause(s, min(10));
    expect(mettreEnPause(p, min(20))).toBe(p);
    expect(minutesEcoulees(p, min(60))).toBe(10);
  });

  it('résiste à une horloge qui recule', () => {
    const s = demarrer(SESSION_VIDE, T0);
    expect(minutesEcoulees(s, T0 - 600_000)).toBe(0);
  });
});

describe('persistance de la session', () => {
  it('survit à un rechargement en pleine épreuve', () => {
    writeExamSession(demarrer({ numero: 12, cumulMinutes: 0, demarreeA: null }, T0));
    const relue = readExamSession();
    expect(relue.numero).toBe(12);
    expect(minutesEcoulees(relue, min(63))).toBe(63);
  });

  it('repart proprement quand rien n’est enregistré', () => {
    expect(readExamSession()).toEqual(SESSION_VIDE);
  });

  it('ignore un contenu corrompu ou incohérent', () => {
    localStorage.setItem(EXAM_SESSION_KEY, 'pas du json');
    expect(readExamSession()).toEqual(SESSION_VIDE);
    localStorage.setItem(
      EXAM_SESSION_KEY,
      JSON.stringify({ numero: -3, cumulMinutes: -10, demarreeA: 'hier' }),
    );
    expect(readExamSession()).toEqual(SESSION_VIDE);
  });

  it('s’efface à la demande', () => {
    writeExamSession({ numero: 5, cumulMinutes: 20, demarreeA: null });
    clearExamSession();
    expect(readExamSession()).toEqual(SESSION_VIDE);
  });

  it('n’explose pas si le stockage est refusé', () => {
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('refusé');
    });
    expect(() => writeExamSession(SESSION_VIDE)).not.toThrow();
    spy.mockRestore();
  });
});

describe('gestes du chronomètre', () => {
  it('remet à zéro sans changer de sujet', () => {
    const s = remettreAZero({ numero: 7, cumulMinutes: 42, demarreeA: T0 });
    expect(s).toEqual({ numero: 7, cumulMinutes: 0, demarreeA: null });
  });

  it('remet le temps à zéro quand on change de sujet — sinon le budget ment', () => {
    const s = changerSujet({ numero: 7, cumulMinutes: 42, demarreeA: T0 }, 8);
    expect(s).toEqual({ numero: 8, cumulMinutes: 0, demarreeA: null });
  });

  it('borne un numéro de sujet aberrant', () => {
    expect(changerSujet(SESSION_VIDE, 0).numero).toBe(1);
    expect(changerSujet(SESSION_VIDE, -4).numero).toBe(1);
  });
});
